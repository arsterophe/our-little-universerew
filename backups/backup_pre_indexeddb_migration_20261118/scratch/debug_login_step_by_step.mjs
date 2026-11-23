import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-login-debug-'));
const port = 9388;

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

    const consoleLogs = [];
    const exceptions = [];
    const networkRequests = [];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' ');
        consoleLogs.push(`[CONSOLE ${data.params.type.toUpperCase()}] ${text}`);
      }
      if (data.method === 'Runtime.exceptionThrown') {
        exceptions.push(data.params.exceptionDetails);
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

    console.log('1. Navigating to http://localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    console.log('2. Inspecting initial DOM state...');
    const domState = await send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            title: document.title,
            activeViews: Array.from(document.querySelectorAll('.view-section.active')).map(v => v.id),
            cardsCount: document.querySelectorAll('.character-card').length,
            cardNyanya: Boolean(document.getElementById('card-nyanya')),
            emailInputVal: document.getElementById('email-input')?.value,
            passwordInputVal: document.getElementById('password-input')?.value,
            isFirebaseConfigured: typeof window.isFirebaseConfigured === 'function' ? window.isFirebaseConfigured() : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Initial DOM state:', domState?.result?.value);

    console.log('3. Clicking Nyanya card...');
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.getElementById('card-nyanya');
          if (!card) return 'card-nyanya missing';
          card.click();
          return 'clicked card-nyanya';
        })()
      `,
      returnByValue: true
    });
    console.log('Click result:', clickRes?.result?.value);

    // Wait for transition animation
    await sleep(1500);

    console.log('4. Inspecting Login View state...');
    const loginViewState = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const emailInput = document.getElementById('email-input');
          const pwdInput = document.getElementById('password-input');
          const viewLogin = document.getElementById('view-login');
          return {
            viewLoginActive: viewLogin?.classList.contains('active'),
            emailVal: emailInput?.value,
            pwdVal: pwdInput?.value,
            btnSubmitFound: Boolean(document.getElementById('btn-universe-submit'))
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Login View state:', loginViewState?.result?.value);

    console.log('5. Entering password and submitting login form...');
    const submitRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const pwdInput = document.getElementById('password-input');
          pwdInput.value = 'password123';
          pwdInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          const form = document.getElementById('login-form');
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          return 'submitted form';
        })()
      `,
      returnByValue: true
    });
    console.log('Form submit action:', submitRes?.result?.value);

    // Wait for response from Firebase
    await sleep(4000);

    console.log('6. Inspecting Post-Submit state...');
    const postSubmitState = await send('Runtime.evaluate', {
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
    console.log('Post-submit state:', postSubmitState?.result?.value);

    console.log('\n--- NETWORK REQUESTS ---');
    for (const req of networkRequests) {
      if (req.url.includes('googleapis') || req.url.includes('identitytoolkit')) {
        try {
          const bodyResult = await send('Network.getResponseBody', { requestId: req.requestId });
          req.responseBody = bodyResult.body;
        } catch (_) {}
        console.log(`URL: ${req.url}`);
        console.log(`Method: ${req.method}, Status: ${req.status} ${req.statusText || ''}`);
        if (req.postData) console.log(`Payload: ${req.postData.slice(0, 150)}...`);
        if (req.responseBody) console.log(`Response: ${req.responseBody}`);
      }
    }

    console.log('\n--- BROWSER CONSOLE LOGS ---');
    consoleLogs.forEach(c => console.log(c));

    if (exceptions.length > 0) {
      console.log('\n--- EXCEPTIONS ---');
      exceptions.forEach(e => console.log(e));
    }

    ws.close();
    chrome.kill();
  } catch (err) {
    console.error('Test error:', err);
    try { chrome.kill(); } catch (_) {}
  }
}

run();
