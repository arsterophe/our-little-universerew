import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'debug-block-'));
const port = 9390;

const cp = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + tmpDir
], { stdio: 'ignore' });

async function getWsUrl(port) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const p = list.find(t => t.type === 'page');
      if (p && p.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Chrome WS unreachable');
}

async function run() {
  const wsUrl = await getWsUrl(port);
  const ws = new WebSocket(wsUrl);

  let id = 1;
  const pending = new Map();

  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      const msg = d.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' ');
      console.log(`[BROWSER ${d.params.type.toUpperCase()}]`, msg);
    }
    if (d.id && pending.has(d.id)) {
      pending.get(d.id)(d.result);
      pending.delete(d.id);
    }
  };

  function send(method, params = {}) {
    return new Promise(res => {
      const curId = id++;
      pending.set(curId, res);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');

  // BLOCK identitytoolkit.googleapis.com (simulating adblocker or network block)
  await send('Network.setBlockedURLs', {
    urls: ['*identitytoolkit.googleapis.com*']
  });
  console.log('Blocked identitytoolkit.googleapis.com in browser network!');

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // Select Nyanya and submit
  await send('Runtime.evaluate', {
    expression: "document.getElementById('card-nyanya')?.click()"
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('Submitting login while endpoint is blocked...');
  const res = await send('Runtime.evaluate', {
    expression: `(async () => {
      const pwd = document.getElementById('password-input');
      pwd.value = 'dummyTestPassword123';
      const form = document.getElementById('login-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 2000));
      const fb = document.getElementById('input-feedback');
      return {
        feedbackText: fb?.textContent,
        feedbackClass: fb?.className
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Result when blocked:', res?.result?.value);

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

run().catch(err => {
  console.error(err);
  try { cp.kill(); } catch (_) {}
});
