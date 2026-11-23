import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = 17799;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const fetchJson = url => new Promise((resolve, reject) => {
  http.get(url, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve(JSON.parse(data)));
  }).on('error', reject);
});

async function main() {
  const tmp = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_debug_meeting_' + Date.now());
  const proc = spawn(CHROME_PATH, [
    '--remote-debugging-port=' + CDP_PORT,
    '--user-data-dir=' + tmp,
    '--headless=new',
    '--window-size=1440,900',
    'about:blank'
  ]);
  try {
    let ws = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        const l = await fetchJson('http://127.0.0.1:' + CDP_PORT + '/json/list');
        if (l[0]?.webSocketDebuggerUrl) { ws = l[0].webSocketDebuggerUrl; break; }
      } catch {}
    }
    const { WebSocket } = await import('ws');
    const wsConn = new WebSocket(ws);
    await new Promise(r => wsConn.on('open', r));
    let id = 1;
    const send = (m, p = {}) => new Promise((res, rej) => {
      const curId = id++;
      const handler = raw => {
        const msg = JSON.parse(raw);
        if (msg.id === curId) {
          wsConn.removeListener('message', handler);
          if (msg.error) rej(msg.error); else res(msg.result);
        }
      };
      wsConn.on('message', handler);
      wsConn.send(JSON.stringify({ id: curId, method: m, params: p }));
    });

    wsConn.on('message', (raw) => {
      const msg = JSON.parse(raw);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const line = msg.params.args?.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log('[BROWSER CONSOLE]', msg.params.type, line);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const errText = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text;
        console.error('[BROWSER EXCEPTION]', errText);
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(3000);

    console.log('Navigating and opening Orbit calendar as Nyanya...');
    const setupRes = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const { ensureOrbitController } = await import('/main.js');
          const orbitCtrl = await ensureOrbitController();
          orbitCtrl.openOrbit('view-selection');

          // Open propose meeting modal
          const btn = document.getElementById('btn-open-propose-meeting');
          if (btn) btn.click();

          const modal = document.getElementById('modal-propose-meeting');
          const form = document.getElementById('form-propose-meeting');

          // Fill form
          const titleInput = document.getElementById('meeting-title-input');
          const dateInput = document.getElementById('meeting-date-input');
          const timeInput = document.getElementById('meeting-time-input');
          const locInput = document.getElementById('meeting-loc-input');
          const descInput = document.getElementById('meeting-desc-input');

          if (titleInput) titleInput.value = 'Rapat Evaluasi Kosmik';
          if (dateInput) dateInput.value = '2026-11-25';
          if (timeInput) timeInput.value = '20:30';
          if (locInput) locInput.value = 'Google Meet';
          if (descInput) descInput.value = 'Koordinasi agenda akhir tahun.';

          const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

          return {
            modalOpen: modal ? modal.classList.contains('active') : false,
            formFound: !!form,
            submitBtnText: submitBtn ? submitBtn.textContent : null,
            submitBtnDisabled: submitBtn ? submitBtn.disabled : null
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Setup result:', setupRes.result?.value);

    await sleep(1000);

    // Now let's trigger form submission and monitor button text and errors over time!
    console.log('Triggering form submit on #form-propose-meeting...');
    const submitRes = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const form = document.getElementById('form-propose-meeting');
          const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

          // Dispatch submit
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

          // Immediate state check
          return {
            btnTextImmediate: submitBtn ? submitBtn.textContent : null,
            btnDisabledImmediate: submitBtn ? submitBtn.disabled : null
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Submit immediate state:', submitRes.result?.value);

    // Poll button status every 1 second for 5 seconds
    for (let i = 1; i <= 5; i++) {
      await sleep(1000);
      const pollRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const form = document.getElementById('form-propose-meeting');
            const modal = document.getElementById('modal-propose-meeting');
            const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
            return {
              second: ${i},
              btnText: submitBtn ? submitBtn.textContent : null,
              btnDisabled: submitBtn ? submitBtn.disabled : null,
              modalActive: modal ? modal.classList.contains('active') : false
            };
          })()
        `,
        returnByValue: true
      });
      console.log(`Poll [${i}s]:`, pollRes.result?.value);
    }

    wsConn.close();
  } finally {
    proc.kill();
  }
}

main().catch(err => {
  console.error('Debug script failed:', err);
  process.exit(1);
});
