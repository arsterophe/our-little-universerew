import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const srcProfile = 'C:\\Users\\ALENDA\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 3';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-inspect-profile-'));
const targetDefault = path.join(tmpDir, 'Default');

console.log('Copying Local Storage to temp profile:', tmpDir);
fs.mkdirSync(targetDefault, { recursive: true });

// Copy Local Storage directory
const srcLS = path.join(srcProfile, 'Local Storage');
const dstLS = path.join(targetDefault, 'Local Storage');
fs.cpSync(srcLS, dstLS, { recursive: true });

const port = 9388;
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

    console.log('Navigating to http://localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2000);

    const evalResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const keys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            keys.push(k);
          }
          const storiesKeys = keys.filter(k => k.includes('stories'));
          const storiesData = {};
          storiesKeys.forEach(k => {
            try {
              storiesData[k] = JSON.parse(localStorage.getItem(k));
            } catch (e) {
              storiesData[k] = localStorage.getItem(k);
            }
          });
          return { allKeys: keys, storiesKeys, storiesData };
        })()
      `,
      returnByValue: true
    });

    console.log('\n=== LOCAL STORAGE STORIES AUDIT ===');
    const res = evalResult?.result?.value;
    console.log('Stories keys found:', res?.storiesKeys);
    console.log('Stories Data:');
    console.log(JSON.stringify(res?.storiesData, null, 2));

    ws.close();
  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

run();

