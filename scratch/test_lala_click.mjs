import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const port = 9390;
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
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER]', data.params.type, data.params.args.map(a => a.value || a.description).join(' '));
      }
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
    await sleep(4000);

    // Click card-lala
    const clickRes = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const card = document.getElementById('card-lala');
        if (!card) return 'card-lala NOT found';
        card.click();
        return 'card-lala clicked';
      })()`,
      returnByValue: true
    });
    console.log('Click res:', clickRes.result.value);

    // Wait for transition animation
    await sleep(2000);

    const artDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
    const shot = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artDir, 'lala_screen_actual.jpg'), Buffer.from(shot.data, 'base64'));
    console.log('Saved lala_screen_actual.jpg');

    const domCheck = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const login = document.getElementById('view-login');
        const atelier = document.getElementById('view-fairy-atelier');
        const loginImg = document.getElementById('login-char-img');
        const cardContainer = document.querySelector('.login-card-container');
        const glassCard = document.getElementById('glass-login-card');
        return {
          loginActive: login?.classList.contains('active'),
          loginDisplay: login ? window.getComputedStyle(login).display : null,
          loginRect: login?.getBoundingClientRect(),
          loginImgRect: loginImg?.getBoundingClientRect(),
          loginImgSrc: loginImg?.src,
          cardContainerRect: cardContainer?.getBoundingClientRect(),
          cardContainerDisplay: cardContainer ? window.getComputedStyle(cardContainer).display : null,
          glassCardRect: glassCard?.getBoundingClientRect(),
          atelierDisplay: atelier ? window.getComputedStyle(atelier).display : null,
          atelierRect: atelier?.getBoundingClientRect(),
          documentScrollHeight: document.documentElement.scrollHeight,
          windowHeight: window.innerHeight
        };
      })()`,
      returnByValue: true
    });
    console.log('DOM check:', JSON.stringify(domCheck.result.value, null, 2));

    client.close();
    chrome.kill();
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
  }
}

main();
