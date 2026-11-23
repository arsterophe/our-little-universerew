import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'debug-royan2-'));
const port = 9345;

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
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', d.params.type, d.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' '));
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
  
  // Wait until cards are loaded and event listeners are ready
  await send('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      const check = () => {
        const cards = document.querySelectorAll('.character-card');
        if (cards.length >= 8 && document.readyState === 'complete') {
          resolve(cards.length);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })`,
    awaitPromise: true
  });
  console.log('Page and character cards ready! Waiting 1s for listeners...');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Selecting Royan by clicking card-royan...');
  const selectRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      try {
        const card = document.getElementById('card-royan');
        console.log('Clicking card-royan now...');
        card.click();
        await new Promise(r => setTimeout(r, 1500));
        const emailInput = document.getElementById('email-input');
        const loginView = document.getElementById('view-login');
        return {
          emailVal: emailInput?.value,
          loginViewActive: loginView?.classList.contains('active'),
          activeView: document.querySelector('.view-section.active')?.id
        };
      } catch (err) {
        console.error('Error selecting Royan:', err);
        return { error: err.message };
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('After selecting Royan:', selectRes?.result?.value);

  console.log('Submitting login form for Royan...');
  const submitRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      const pwdInput = document.getElementById('password-input');
      pwdInput.value = 'dummyTestPassword123';
      const form = document.getElementById('login-form');
      console.log('Dispatching submit on login-form...');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 5000));
      const feedback = document.getElementById('input-feedback');
      return {
        feedbackText: feedback?.textContent,
        feedbackClass: feedback?.className
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Feedback after submit:', submitRes?.result?.value);

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

run().catch(err => {
  console.error(err);
  try { cp.kill(); } catch (_) {}
});
