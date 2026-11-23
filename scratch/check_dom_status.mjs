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
  const tmp = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_inspect_' + Date.now());
  const proc = spawn(CHROME_PATH, [
    '--remote-debugging-port=' + CDP_PORT,
    '--user-data-dir=' + tmp,
    '--headless=new',
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
        console.log('[BROWSER]', msg.params.type, msg.params.args?.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text);
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(4000);

    const r = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('.univ-island-card'));
          const pView = document.getElementById('view-private-universe');
          const selView = document.getElementById('view-selection');
          const loader = document.getElementById('cosmic-app-loader');
          return {
            loaderLoaded: loader ? loader.classList.contains('loaded') : false,
            loaderOpacity: loader ? window.getComputedStyle(loader).opacity : null,
            cardsCount: cards.length,
            cardUniverses: cards.map(c => c.dataset.universe || c.id),
            privateActive: pView ? pView.classList.contains('active') : false,
            selActive: selView ? selView.classList.contains('active') : false
          };
        })()
      `,
      returnByValue: true
    });
    console.log('DOM STATUS ON LANDING:', JSON.stringify(r.result.value, null, 2));
    wsConn.close();
  } finally {
    proc.kill();
  }
}
main();
