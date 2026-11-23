import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = 17799;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ALENDA/.gemini/antigravity/brain/9032e95e-6264-445e-8703-2e60383b3a62';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const fetchJson = url => new Promise((resolve, reject) => {
  http.get(url, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve(JSON.parse(data)));
  }).on('error', reject);
});

async function main() {
  const tmp = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_akhira_' + Date.now());
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

    const consoleLogs = [];
    wsConn.on('message', (raw) => {
      const msg = JSON.parse(raw);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const line = msg.params.args?.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        consoleLogs.push({ type: msg.params.type, line });
        console.log('[BROWSER]', msg.params.type, line);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const errText = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text;
        consoleLogs.push({ type: 'exception', line: errText });
        console.error('[BROWSER EXCEPTION]', errText);
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    // Simulate login as Akhira
    const authResult = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const akhiraUser = {
            uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2',
            email: 'akhira@ourlittleuniverse.com',
            displayName: 'Akhira',
            emailVerified: true
          };

          const charConfig = {
            name: 'Akhira',
            characterKey: 'akhira',
            universe: 'YAWN',
            symbol: '⚡'
          };

          const { ensureUniversesController } = await import('/main.js');
          const univCtrl = await ensureUniversesController();
          
          // Render private universe for Akhira with autoOpenOwnWorld = false
          await univCtrl.renderPrivateUniverse(akhiraUser, charConfig, false);

          const loader = document.getElementById('cosmic-app-loader');
          if (loader) {
            loader.classList.add('loaded');
          }

          const privateView = document.getElementById('view-private-universe');
          const cards = Array.from(document.querySelectorAll('.univ-island-card'));
          const greetingEl = document.getElementById('univ-user-greeting');
          const yawnWorld = document.getElementById('view-yawn-world');

          return {
            privateActive: privateView ? privateView.classList.contains('active') : false,
            yawnWorldActive: yawnWorld ? yawnWorld.classList.contains('active') : false,
            greetingText: greetingEl ? greetingEl.textContent.trim() : null,
            cardsCount: cards.length,
            cardDetails: cards.map(c => {
              const badge = c.querySelector('.univ-card-badge');
              return {
                id: c.id,
                universe: c.dataset.universe,
                isMyUniverse: c.classList.contains('is-my-universe'),
                isVisit: c.classList.contains('is-visit-universe'),
                badgeText: badge ? badge.textContent.trim() : null
              };
            })
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('AKHIRA AUTH STATE:', JSON.stringify(authResult.result.value, null, 2));

    await sleep(1500);

    // Take screenshot of desktop view
    const ss = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const ssPath = path.join(ARTIFACT_DIR, 'universe_selection_akhira_screen.jpg');
    fs.writeFileSync(ssPath, Buffer.from(ss.data, 'base64'));
    console.log('Saved screenshot to:', ssPath);

    // Emulate Mobile 390
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(600);
    const mss = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const mssPath = path.join(ARTIFACT_DIR, 'universe_selection_akhira_mobile.jpg');
    fs.writeFileSync(mssPath, Buffer.from(mss.data, 'base64'));
    console.log('Saved mobile screenshot to:', mssPath);

    wsConn.close();
  } finally {
    proc.kill();
  }
}
main();
