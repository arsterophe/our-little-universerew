import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'debug-all-auth2-'));
const port = 9380;

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
    if (d.method === 'Runtime.exceptionThrown') {
      console.log('[BROWSER EXCEPTION]', JSON.stringify(d.params.exceptionDetails));
    }
    if (d.method === 'Network.responseReceived') {
      const resp = d.params.response;
      if (resp.url.includes('identitytoolkit') || resp.url.includes('firebase')) {
        console.log(`[NETWORK RESPONSE] ${resp.status} ${resp.url}`);
      }
    }
    if (d.method === 'Network.loadingFailed') {
      console.log(`[NETWORK FAILED] ${d.params.errorText} (${d.params.canceled ? 'canceled' : 'failed'})`);
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

  // Wait until application is completely loaded
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
  console.log('Page ready! Waiting 1s for listeners...');
  await new Promise(r => setTimeout(r, 1000));

  const characters = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];

  for (const charKey of characters) {
    console.log(`\n========================================`);
    console.log(`TESTING CHARACTER: ${charKey}`);
    console.log(`========================================`);

    // Click character card
    const selectRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        const card = document.getElementById('card-${charKey}');
        card.click();
        await new Promise(r => setTimeout(r, 800));
        const emailInput = document.getElementById('email-input');
        return {
          email: emailInput?.value,
          loginActive: document.getElementById('view-login')?.classList.contains('active')
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log(`Selected ${charKey}:`, selectRes?.result?.value);

    // Submit form with test password
    const submitRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        const pwdInput = document.getElementById('password-input');
        pwdInput.value = 'dummyTestPassword123';
        const form = document.getElementById('login-form');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        await new Promise(r => setTimeout(r, 3500));
        const fb = document.getElementById('input-feedback');
        return {
          feedbackText: fb?.textContent,
          feedbackClass: fb?.className
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log(`Result for ${charKey}:`, submitRes?.result?.value);

    // Return back to selection screen
    await send('Runtime.evaluate', {
      expression: `(async () => {
        const btnBack = document.getElementById('btn-back');
        btnBack?.click();
        await new Promise(r => setTimeout(r, 800));
      })()`,
      awaitPromise: true
    });
  }

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

run().catch(err => {
  console.error('Fatal test error:', err);
  try { cp.kill(); } catch (_) {}
});
