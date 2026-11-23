import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-debug-'));
const port = 9299;

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
  '--no-first-run',
  '--no-default-browser-check',
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

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 1;
    const map = new Map();
    ws.addEventListener('open', () => {
      resolve({
        ws,
        send(method, params = {}) {
          const reqId = id++;
          return new Promise((res, rej) => {
            map.set(reqId, { res, rej });
            ws.send(JSON.stringify({ id: reqId, method, params }));
          });
        },
        close() { ws.close(); }
      });
    });
    ws.addEventListener('message', ev => {
      const data = JSON.parse(ev.data);
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', JSON.stringify(data.params.exceptionDetails));
      }
      if (data.id && map.has(data.id)) {
        const { res, rej } = map.get(data.id);
        map.delete(data.id);
        if (data.error) rej(new Error(data.error.message));
        else res(data.result);
      }
    });
    ws.addEventListener('error', err => reject(err));
  });
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    const c = await connect(wsUrl);
    await c.send('Page.enable');
    await c.send('Runtime.enable');

    await c.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    const test = await c.send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            windowKeys: Object.keys(window).filter(k => k.includes('Universe') || k.includes('render') || k.includes('ensure') || k.includes('CHAR') || k.includes('universes')),
            readyState: document.readyState,
            bodyChildCount: document.body.children.length
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Window inspection:', JSON.stringify(test.result.value, null, 2));
    c.close();
  } catch (err) {
    console.error(err);
  } finally {
    try { chrome.kill(); } catch (_) {}
    setTimeout(() => {
      try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
    }, 500);
  }
}
run();
