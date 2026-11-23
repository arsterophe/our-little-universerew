import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const srcProfile = 'C:\\Users\\ALENDA\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 3';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-inspect-idb-'));
const targetDefault = path.join(tmpDir, 'Default');

fs.mkdirSync(targetDefault, { recursive: true });
fs.cpSync(path.join(srcProfile, 'IndexedDB'), path.join(targetDefault, 'IndexedDB'), { recursive: true });
fs.cpSync(path.join(srcProfile, 'Local Storage'), path.join(targetDefault, 'Local Storage'), { recursive: true });

const port = 9391;
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

    const logs = [];
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        logs.push(data.params.args.map(a => a.value || a.description).join(' '));
      }
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

    const idbResult = await send('Runtime.evaluate', {
      expression: `
        new Promise((resolve) => {
          const req = indexedDB.open('firebaseLocalStorageDb');
          req.onerror = () => resolve({ error: 'Failed to open firebaseLocalStorageDb' });
          req.onsuccess = (e) => {
            const db = e.target.result;
            try {
              const tx = db.transaction('firebaseLocalStorage', 'readonly');
              const store = tx.objectStore('firebaseLocalStorage');
              const allReq = store.getAll();
              allReq.onsuccess = () => resolve({ items: allReq.result });
              allReq.onerror = () => resolve({ error: 'Failed to getAll' });
            } catch (err) {
              resolve({ error: err.message, objectStoreNames: Array.from(db.objectStoreNames) });
            }
          };
        })
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('\n=== FIREBASE LOCAL STORAGE IDB RESULT ===');
    const items = idbResult?.result?.value?.items;
    items?.forEach(it => {
      console.log('Key / Item:');
      console.log('Value:', {
        uid: it?.value?.uid,
        email: it?.value?.email,
        emailVerified: it?.value?.emailVerified,
        displayName: it?.value?.displayName,
        hasToken: Boolean(it?.value?.stsTokenManager?.accessToken)
      });
    });

    ws.close();
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

run();

