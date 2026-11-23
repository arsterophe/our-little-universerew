import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'debug-royan-'));
const port = 9335;

const cp = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + tmpDir
], { stdio: 'ignore' });

async function run() {
  await new Promise(r => setTimeout(r, 1200));
  const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', d.params.type, d.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' '));
    }
    if (d.method === 'Runtime.exceptionThrown') {
      console.log('[BROWSER EXCEPTION]', JSON.stringify(d.params.exceptionDetails));
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

  console.log('Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Clicking card-royan...');
  await send('Runtime.evaluate', {
    expression: "document.getElementById('card-royan')?.click()"
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('Submitting login form for Royan...');
  const res = await send('Runtime.evaluate', {
    expression: `(async () => {
      const emailInput = document.getElementById('email-input');
      const pwdInput = document.getElementById('password-input');
      emailInput.value = 'royan@ourlittleuniverse.com';
      pwdInput.value = 'dummyWrongPass123';
      const submitBtn = document.querySelector('.login-submit-btn');
      submitBtn.click();
    })()`,
    awaitPromise: true
  });

  await new Promise(r => setTimeout(r, 3000));

  const feedback = await send('Runtime.evaluate', {
    expression: `(() => {
      const fb = document.getElementById('input-feedback');
      return fb ? { text: fb.textContent, className: fb.className } : null;
    })()`,
    returnByValue: true
  });
  console.log('Feedback on screen:', feedback?.result?.value);

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

run().catch(err => {
  console.error(err);
  try { cp.kill(); } catch (_) {}
});
