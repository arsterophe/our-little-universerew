import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-debug-ctrl2-'));
const port = 9301;

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
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

    const errors = [];
    const logs = [];
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.exceptionThrown') {
        errors.push(data.params.exceptionDetails);
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        logs.push(data.params.args.map(a => a.value || a.description).join(' '));
      }
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    // Enable domains BEFORE navigate
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');

    console.log('Navigating...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(3000);

    console.log('Console logs on load:', logs);
    console.log('Exceptions on load:', JSON.stringify(errors, null, 2));

    const checkWindow = await send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            hasEnsureUniverses: typeof window.ensureUniversesController,
            hasShowUniverses: typeof window.showUniversesView,
            activeCharacterKey: window.activeCharacterKey
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Window check:', checkWindow?.result?.value);

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
  }
}

run();

