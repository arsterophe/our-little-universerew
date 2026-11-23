import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const srcProfile = 'C:\\Users\\ALENDA\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 3';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-inspect-session-'));
const targetDefault = path.join(tmpDir, 'Default');

console.log('Copying Local Storage & IndexedDB to temp profile:', tmpDir);
fs.mkdirSync(targetDefault, { recursive: true });

fs.cpSync(path.join(srcProfile, 'Local Storage'), path.join(targetDefault, 'Local Storage'), { recursive: true });
fs.cpSync(path.join(srcProfile, 'IndexedDB'), path.join(targetDefault, 'IndexedDB'), { recursive: true });

const port = 9390;
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

    console.log('Navigating to http://localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(3500);

    const checkAuth = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          // Check auth user
          const currentUser = window.auth?.currentUser;
          const authInfo = currentUser ? {
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified
          } : null;

          // Check storiesController state
          const stories = window.storiesController?.getAllStories ? window.storiesController.getAllStories() : null;
          const published = window.storiesController?.getPublishedStories ? window.storiesController.getPublishedStories() : null;
          const activeUser = window.storiesController?.getActiveUser ? window.storiesController.getActiveUser() : null;

          return { authInfo, activeUser, storiesCount: stories?.length, publishedCount: published?.length, published, stories };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('\n=== BROWSER SESSION & STORIES STATE ===');
    console.log(JSON.stringify(checkAuth?.result?.value, null, 2));

    console.log('\nConsole logs:');
    console.log(logs.slice(-20));

    ws.close();
  } catch (err) {
    console.error('Session test failed:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

run();

