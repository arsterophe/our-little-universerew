import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const port = 9391;
const profileDir = path.join(process.cwd(), 'scratch', `cdp_profile_lala_test_${Date.now()}`);
fs.mkdirSync(profileDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--headless=new',
  '--window-size=1280,800',
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
    await sleep(250);
  }
  throw new Error('Chrome WS unreachable');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 1;
    const map = new Map();
    ws.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          const reqId = id++;
          return new Promise((res, rej) => {
            map.set(reqId, { res, rej });
            ws.send(JSON.stringify({ id: reqId, method, params }));
          });
        },
        close() { ws.close(); }
      });
    });
    ws.addEventListener('message', ev => {
      const data = JSON.parse(ev.data);
      if (data.id && map.has(data.id)) {
        const { res, rej } = map.get(data.id);
        map.delete(data.id);
        if (data.error) rej(new Error(data.error.message));
        else res(data.result);
      }
    });
    ws.addEventListener('error', err => reject(err));
  });
}

async function main() {
  try {
    const wsUrl = await getWsUrl();
    const client = await connect(wsUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('Navigating to http://localhost:5173...');
    await client.send('Page.navigate', { url: 'http://localhost:5173' });

    // Wait until document is ready and card-lala exists
    let ready = false;
    for (let i = 0; i < 20; i++) {
      const check = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const card = document.getElementById('card-lala');
          return !!card && document.readyState === 'complete';
        })()`,
        returnByValue: true
      });
      if (check.result.value) {
        ready = true;
        break;
      }
      await sleep(500);
    }
    console.log('Page ready:', ready);

    // Click card-lala
    for (let attempt = 0; attempt < 5; attempt++) {
      await client.send('Runtime.evaluate', {
        expression: `document.getElementById('card-lala')?.click()`
      });
      await sleep(600);
      const isLoginActive = await client.send('Runtime.evaluate', {
        expression: `document.getElementById('view-login')?.classList.contains('active')`,
        returnByValue: true
      });
      if (isLoginActive.result.value) {
        console.log(`Login active on attempt ${attempt + 1}!`);
        break;
      }
    }

    await sleep(1500);

    const artDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
    const shot = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artDir, 'lala_screen_attempt.jpg'), Buffer.from(shot.data, 'base64'));
    console.log('Saved lala_screen_attempt.jpg');

    const state = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const login = document.getElementById('view-login');
        const selection = document.getElementById('view-selection');
        return {
          selectionActive: selection?.classList.contains('active'),
          selectionDisplay: selection ? window.getComputedStyle(selection).display : null,
          loginActive: login?.classList.contains('active'),
          loginDisplay: login ? window.getComputedStyle(login).display : null,
          loginRole: document.getElementById('login-char-role')?.textContent,
          loginName: document.getElementById('login-char-name')?.textContent
        };
      })()`,
      returnByValue: true
    });
    console.log('State:', JSON.stringify(state.result.value, null, 2));

    client.close();
    chrome.kill();
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
  }
}

main();
