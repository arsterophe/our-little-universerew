import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = Math.floor(15000 + Math.random() * 15000);
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fetchJson(u) {
  return new Promise((resolve, reject) => {
    http.get(u, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

async function testAll() {
  const tmpDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_test_all_' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });
  const proc = spawn(CHROME_PATH, [
    '--remote-debugging-port=' + CDP_PORT,
    '--user-data-dir=' + tmpDir,
    '--headless=new',
    'about:blank'
  ]);
  
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const list = await fetchJson('http://127.0.0.1:' + CDP_PORT + '/json/list');
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        wsUrl = list[0].webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }
  if (!wsUrl) throw new Error('Chrome WS URL not found');

  const { WebSocket } = await import('ws');
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.on('open', r));

  let msgId = 1;
  const pending = new Map();
  ws.on('message', raw => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) reject(new Error(m.error.message));
      else resolve(m.result);
    }
  });
  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await sleep(2500);

  const chars = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
  for (const c of chars) {
    const r = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const card = document.querySelector('.character-card[data-character="${c}"]');
          card.click();
          for (let i = 0; i < 40; i++) {
            await new Promise(res => setTimeout(res, 100));
            if (document.getElementById('view-login')?.classList.contains('active')) break;
          }
          const login = document.getElementById('view-login');
          const res = {
            char: "${c}",
            active: login?.classList.contains('active'),
            name: document.getElementById('login-char-name')?.textContent?.trim(),
            role: document.getElementById('login-char-role')?.textContent?.trim(),
            email: document.getElementById('email-input')?.value
          };
          document.getElementById('btn-switch-other')?.click();
          for (let i = 0; i < 40; i++) {
            await new Promise(res => setTimeout(res, 100));
            if (document.getElementById('view-selection')?.classList.contains('active')) break;
          }
          return res;
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log(JSON.stringify(r.result.value));
  }

  ws.close();
  proc.kill();
}
testAll().catch(console.error);
