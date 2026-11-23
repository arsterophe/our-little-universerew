import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-import-'));
const port = 9308;

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + tmpProfile,
  'about:blank'
], { stdio: 'ignore' });

async function run() {
  await new Promise(r => setTimeout(r, 1000));
  const res = await fetch('http://127.0.0.1:' + port + '/json/list');
  const list = await res.json();
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const reqId = id++;
      const handler = (event) => {
        const d = JSON.parse(event.data);
        if (d.id === reqId) {
          ws.removeEventListener('message', handler);
          resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  const result = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const m = await import('/main.js');
          return { success: true, keys: Object.keys(m), windowEnsure: typeof window.ensureUniversesController };
        } catch (err) {
          return { success: false, error: err.message, stack: err.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Result:', JSON.stringify(result, null, 2));

  chrome.kill();
  fs.rmSync(tmpProfile, { recursive: true, force: true });
}
run();

