import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-inspect-'));
const port = 9370;

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
    const cdp = await connect(wsUrl);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log('Navigating to http://localhost:5173 ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(4000);

    const res = await cdp.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const ctrl = await window.ensureUniversesController();
          const btn = document.getElementById('btn-kidult-behind');
          const ov = document.getElementById('witch-behind-overlay');
          const beforeActive = ov.classList.contains('active');
          btn.click();
          const afterActive = ov.classList.contains('active');
          return {
            hasCtrl: !!ctrl,
            beforeActive,
            afterActive,
            ovDisplay: window.getComputedStyle(ov).display,
            ariaHidden: ov.getAttribute('aria-hidden')
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Result:', JSON.stringify(res, null, 2));
    cdp.close();
    chrome.kill();
  } catch (err) {
    console.error(err);
    chrome.kill();
  }
}

run();
