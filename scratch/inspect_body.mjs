import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(os.tmpdir() + '/olu-dbg-');
const port = 9311;

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
  '--disable-gpu',
  'about:blank'
], { stdio: 'ignore' });

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const p = list.find(t => t.type === 'page');
      if (p && p.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch (_) {}
    await sleep(200);
  }
  throw new Error('Chrome WS unreachable');
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.addEventListener('open', r));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const reqId = id++;
        const handler = (ev) => {
          const data = JSON.parse(ev.data);
          if (data.id === reqId) {
            ws.removeEventListener('message', handler);
            if (data.error) rej(new Error(data.error.message));
            else res(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(4000);

    const info = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const children = Array.from(document.body.children).map(c => ({ tag: c.tagName, id: c.id, className: c.className }));
          return {
            title: document.title,
            children,
            mainJsLoaded: typeof window.ensureUniversesController === 'function'
          };
        })()
      `,
      returnByValue: true
    });
    console.log('DOM info:', JSON.stringify(info.result.value, null, 2));
    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    try { chrome.kill(); } catch (_) {}
  }
}
run();
