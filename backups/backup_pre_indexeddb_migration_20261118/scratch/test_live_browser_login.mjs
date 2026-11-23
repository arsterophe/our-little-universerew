import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-login-inspect-'));
const port = 9399;

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

async function run() {
  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);

    let msgId = 1;
    const pending = new Map();

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, (data) => resolve(data.result));
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const networkRequests = [];
    const consoleLogs = [];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' ');
        consoleLogs.push(`[CONSOLE ${data.params.type.toUpperCase()}] ${text}`);
      }
      if (data.method === 'Network.requestWillBeSent') {
        networkRequests.push({
          requestId: data.params.requestId,
          url: data.params.request.url,
          method: data.params.request.method,
          postData: data.params.request.postData
        });
      }
      if (data.method === 'Network.responseReceived') {
        const req = networkRequests.find(r => r.requestId === data.params.requestId);
        if (req) {
          req.status = data.params.response.status;
          req.statusText = data.params.response.statusText;
          req.mimeType = data.params.response.mimeType;
        }
      }
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('1. Navigating to http://localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    console.log('2. Opening Nyanya login form...');
    const cardRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.getElementById('card-nyanya');
          if (!card) return { found: false };
          card.click();
          return { found: true };
        })()
      `,
      returnByValue: true
    });
    console.log('Card click res:', cardRes?.result?.value);
    await sleep(1000);

    console.log('3. Filling password and clicking submit button...');
    const submitResult = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const emailInput = document.getElementById('email-input');
          const pwdInput = document.getElementById('password-input');
          const btnSubmit = document.getElementById('btn-universe-submit');
          const form = document.getElementById('login-form');
          
          console.log('[EVAL] emailInput:', emailInput ? emailInput.value : 'null');
          console.log('[EVAL] pwdInput:', pwdInput ? pwdInput.value : 'null');
          
          if (pwdInput) {
            pwdInput.value = 'password123';
            pwdInput.dispatchEvent(new Event('input', { bubbles: true }));
            pwdInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
          
          if (btnSubmit) {
            btnSubmit.click();
            return { clickedBtn: true, email: emailInput?.value };
          }
          if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            return { submittedForm: true, email: emailInput?.value };
          }
          return { error: 'No button or form' };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Submit result:', submitResult?.result?.value);

    await sleep(5000);

    // Get feedback message from UI
    const feedback = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const fb = document.querySelector('.input-feedback-msg');
          const toast = document.querySelector('.toast-notification, .toast');
          const activeViews = Array.from(document.querySelectorAll('.view-section.active')).map(v => v.id);
          return {
            feedbackText: fb ? fb.textContent : null,
            feedbackClass: fb ? fb.className : null,
            toastText: toast ? toast.textContent : null,
            activeViews
          };
        })()
      `,
      returnByValue: true
    });
    console.log('UI Feedback:', feedback?.result?.value);

    for (const req of networkRequests) {
      if (req.url.includes('googleapis') || req.url.includes('firebase')) {
        try {
          const bodyResult = await send('Network.getResponseBody', { requestId: req.requestId });
          req.responseBody = bodyResult.body;
        } catch (_) {}
      }
    }

    console.log('\n--- NETWORK REQUESTS ---');
    networkRequests.filter(r => r.url.includes('googleapis') || r.url.includes('firebase') || r.url.includes('identitytoolkit')).forEach(r => {
      console.log(`\nURL: ${r.url}`);
      console.log(`Method: ${r.method}, Status: ${r.status} ${r.statusText || ''}`);
      if (r.postData) console.log(`Payload: ${r.postData.slice(0, 150)}...`);
      if (r.responseBody) console.log(`Response: ${r.responseBody}`);
    });

    console.log('\n--- BROWSER CONSOLE LOGS ---');
    consoleLogs.forEach(c => console.log(c));

    ws.close();
    chrome.kill();
  } catch (err) {
    console.error('Test error:', err);
    try { chrome.kill(); } catch (_) {}
  }
}

run();
