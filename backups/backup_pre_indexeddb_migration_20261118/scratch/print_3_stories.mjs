import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const srcProfile = 'C:\\Users\\ALENDA\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 3';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-print-3-stories-'));
const targetDefault = path.join(tmpDir, 'Default');

fs.mkdirSync(targetDefault, { recursive: true });
fs.cpSync(path.join(srcProfile, 'Local Storage'), path.join(targetDefault, 'Local Storage'), { recursive: true });

const port = 9392;
const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpDir}`,
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

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');

    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2000);

    const evalResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const map = new Map();
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            const raw = localStorage.getItem(k);
            if (raw && (raw.includes('story-lele-1794453021905-xx2a6') || raw.includes('story-lele-1794011126592-7sk5o') || raw.includes('story-lele-1794493720872-mf53m'))) {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  parsed.forEach(item => {
                    if (item && item.id && item.id.startsWith('story-lele-')) {
                      map.set(item.id, item);
                    }
                  });
                }
              } catch (_) {}
            }
          }
          return Array.from(map.values());
        })()
      `,
      returnByValue: true
    });

    console.log('\n=== EXACT DATA OF LELE 3 STORIES ===');
    const stories = evalResult?.result?.value;
    stories?.forEach((s, idx) => {
      console.log(`\n========================================`);
      console.log(`KARYA #${idx + 1}: "${s.title}" [${s.id}]`);
      console.log(`========================================`);
      console.log(JSON.stringify(s, null, 2));
    });

    ws.close();
  } catch (err) {
    console.error('Extraction failed:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

run();

