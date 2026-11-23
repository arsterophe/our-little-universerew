import WebSocket from 'ws';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-cdp-'));
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9344',
    `--user-data-dir=${tmp}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await (await fetch('http://127.0.0.1:9344/json/list')).json();
  const page = res.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let msgId = 1;
  const send = (method, params = {}) => new Promise(resolve => {
    const curId = msgId++;
    const handler = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  const logs = [];
  const errors = [];
  const netReqs = [];
  ws.on('message', (raw) => {
    const data = JSON.parse(raw);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' ');
      logs.push(`[${data.params.type}] ${text}`);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      errors.push(data.params.exceptionDetails);
    }
    if (data.method === 'Network.requestWillBeSent') {
      netReqs.push({
        requestId: data.params.requestId,
        url: data.params.request.url,
        method: data.params.request.method,
        postData: data.params.request.postData
      });
    }
    if (data.method === 'Network.responseReceived') {
      const r = netReqs.find(x => x.requestId === data.params.requestId);
      if (r) {
        r.status = data.params.response.status;
        r.statusText = data.params.response.statusText;
      }
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');

  console.log('Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173' });

  // Wait 6 seconds for Vite modules to finish resolving and main.js to execute
  await new Promise(r => setTimeout(r, 6000));

  console.log('Evaluating card click after wait...');
  const clickEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const card = document.getElementById('card-nyanya');
        if (!card) return 'card-nyanya not found';
        card.click();
        return 'card clicked';
      })()
    `,
    returnByValue: true
  });
  console.log('Click eval result:', clickEval.result.value);

  // Wait 1.5 seconds for view-login transition
  await new Promise(r => setTimeout(r, 1500));

  const checkState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const sel = document.getElementById('view-selection');
        const log = document.getElementById('view-login');
        const email = document.getElementById('email-input');
        const pwd = document.getElementById('password-input');
        return {
          selClass: sel ? sel.className : null,
          logClass: log ? log.className : null,
          emailVal: email ? email.value : null,
          pwdVal: pwd ? pwd.value : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('State after click:', checkState.result.value);

  // Now fill password and submit form!
  console.log('Submitting login form with test password...');
  const submitRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const pwd = document.getElementById('password-input');
        pwd.value = 'ourlittleuniverse';
        pwd.dispatchEvent(new Event('input', { bubbles: true }));
        const form = document.getElementById('login-form');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        return 'form submitted';
      })()
    `,
    returnByValue: true
  });
  console.log('Submit action result:', submitRes.result.value);

  // Wait 4 seconds for Firebase response
  await new Promise(r => setTimeout(r, 4500));

  const postState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const fb = document.querySelector('.input-feedback-msg');
        const toast = document.querySelector('.toast-notification, .toast');
        return {
          feedback: fb ? fb.textContent : null,
          feedbackClass: fb ? fb.className : null,
          toast: toast ? toast.textContent : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Post-submit feedback:', postState.result.value);

  for (const r of netReqs) {
    if (r.url.includes('identitytoolkit') || r.url.includes('firebase')) {
      try {
        const bodyRes = await send('Network.getResponseBody', { requestId: r.requestId });
        r.body = bodyRes.body;
      } catch (_) {}
    }
  }

  console.log('\n--- AUTH NETWORK REQUESTS ---');
  netReqs.filter(r => r.url.includes('identitytoolkit') || r.url.includes('accounts')).forEach(r => {
    console.log(`URL: ${r.url}`);
    console.log(`Status: ${r.status} ${r.statusText || ''}`);
    if (r.postData) console.log(`Post Data: ${r.postData.slice(0, 150)}...`);
    if (r.body) console.log(`Response Body: ${r.body}`);
  });

  console.log('\n--- BROWSER LOGS ---');
  logs.forEach(l => console.log(l));
  if (errors.length > 0) {
    console.log('\n--- EXCEPTIONS ---');
    console.log(errors);
  }

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}
}

main().catch(console.error);
