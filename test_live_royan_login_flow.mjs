import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-login-test-'));
const port = 9312;
const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

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
    const errors = [];
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push(data.params.args.map(a => a.value || a.description).join(' '));
      }
      if (data.method === 'Runtime.exceptionThrown') {
        errors.push(data.params.exceptionDetails);
      }
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    await send('Page.enable');
    await send('Runtime.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('1. Navigating to localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2000);

    console.log('2. Clicking Royan card on character selection...');
    const cardClick = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.getElementById('card-royan');
          if (!card) return { success: false, reason: 'card-royan not found' };
          card.click();
          return { success: true };
        })()
      `,
      returnByValue: true
    });
    console.log('Royan card click:', cardClick?.result?.value);
    await sleep(1000);

    // Check if login modal appeared
    const loginState = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const loginView = document.getElementById('view-login');
          const emailInput = document.getElementById('login-email');
          const pwdInput = document.getElementById('login-password');
          return {
            loginActive: loginView?.classList.contains('active'),
            emailVal: emailInput?.value,
            pwdVal: pwdInput?.value
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Login form state:', loginState?.result?.value);

    // Fill password and submit login
    console.log('3. Submitting Royan login form...');
    const submitLogin = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const emailInput = document.getElementById('login-email');
          const pwdInput = document.getElementById('login-password');
          const submitBtn = document.querySelector('.login-submit-btn');
          const form = document.getElementById('login-form');
          
          if (!pwdInput.value) {
            pwdInput.value = 'ourlittleuniverse';
          }
          
          // Submit form
          if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            return { submitted: true };
          }
          return { submitted: false };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Submit result:', submitLogin?.result?.value);

    // Wait 3 seconds for Firebase auth & redirect
    await sleep(3500);

    // Check which view is currently active
    const postLoginView = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const activeViews = Array.from(document.querySelectorAll('.view-section.active')).map(v => v.id);
          const bodyClasses = Array.from(document.body.classList);
          const hotView = document.getElementById('view-hot-world');
          const univView = document.getElementById('view-private-universe');
          const hotCard = document.querySelector('.univ-island-card.card-hot');
          const hotCardImg = hotCard?.querySelector('img.floating-island-image');
          return {
            activeViews,
            bodyClasses,
            hotViewActive: hotView?.classList.contains('active'),
            univViewActive: univView?.classList.contains('active'),
            hotCardFound: Boolean(hotCard),
            hotCardBadge: hotCard?.querySelector('.island-universe-badge')?.innerText,
            hotCardImgSrc: hotCardImg?.src,
            hotCardRect: hotCard ? hotCard.getBoundingClientRect() : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Post-login state:', JSON.stringify(postLoginView?.result?.value, null, 2));

    // Capture screenshot of post-login screen
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'debug_royan_post_login.jpg'), Buffer.from(shot.data, 'base64'));
    console.log('Saved debug_royan_post_login.jpg');

    console.log('Console logs:', consoleLogs.slice(-15));
    console.log('Exceptions:', errors);

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
  }
}

run();

