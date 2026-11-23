import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'debug-all-auth-'));
const port = 9370;

const cp = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + tmpDir
], { stdio: 'ignore' });

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();
  const networkEvents = [];
  const consoleLogs = [];

  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      const msg = d.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' ');
      consoleLogs.push({ type: d.params.type, msg });
      console.log(`[BROWSER ${d.params.type.toUpperCase()}]`, msg);
    }
    if (d.method === 'Runtime.exceptionThrown') {
      console.log('[BROWSER EXCEPTION]', JSON.stringify(d.params.exceptionDetails));
    }
    if (d.method === 'Network.responseReceived') {
      const resp = d.params.response;
      if (resp.url.includes('googleapis.com') || resp.url.includes('firebase')) {
        networkEvents.push({ url: resp.url, status: resp.status, statusText: resp.statusText });
        console.log(`[NETWORK RESPONSE] ${resp.status} ${resp.url}`);
      }
    }
    if (d.method === 'Network.loadingFailed') {
      console.log(`[NETWORK FAILED] ${d.params.errorText} ${d.params.canceled ? '(canceled)' : ''}`);
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

  console.log('Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // Test Nyanya
  console.log('\n--- Testing Nyanya Login ---');
  await send('Runtime.evaluate', {
    expression: "document.getElementById('card-nyanya')?.click()"
  });
  await new Promise(r => setTimeout(r, 1000));

  const nyanyaSubmit = await send('Runtime.evaluate', {
    expression: `(async () => {
      const email = document.getElementById('email-input')?.value;
      const pwdInput = document.getElementById('password-input');
      pwdInput.value = 'dummyTestPassword123';
      const form = document.getElementById('login-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 3000));
      const fb = document.getElementById('input-feedback');
      return {
        email,
        feedback: fb?.textContent,
        feedbackClass: fb?.className
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Nyanya submit result:', nyanyaSubmit?.result?.value);

  // Return to selection
  await send('Runtime.evaluate', {
    expression: "document.getElementById('btn-back')?.click()"
  });
  await new Promise(r => setTimeout(r, 1000));

  // Test Lele
  console.log('\n--- Testing Lele Login ---');
  await send('Runtime.evaluate', {
    expression: "document.getElementById('card-lele')?.click()"
  });
  await new Promise(r => setTimeout(r, 1000));

  const leleSubmit = await send('Runtime.evaluate', {
    expression: `(async () => {
      const email = document.getElementById('email-input')?.value;
      const pwdInput = document.getElementById('password-input');
      pwdInput.value = 'dummyTestPassword123';
      const form = document.getElementById('login-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 3000));
      const fb = document.getElementById('input-feedback');
      return {
        email,
        feedback: fb?.textContent,
        feedbackClass: fb?.className
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Lele submit result:', leleSubmit?.result?.value);

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

run().catch(err => {
  console.error('Fatal test error:', err);
  try { cp.kill(); } catch (_) {}
});
