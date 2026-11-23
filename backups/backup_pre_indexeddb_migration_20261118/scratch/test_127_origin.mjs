import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-diag-127-'));
const port = 9355;

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  'about:blank'
], { stdio: 'ignore' });

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const p = list.find(t => t.type === 'page');
      if (p && p.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Chrome WS unreachable');
}

async function run() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const logs = [];
  const reqs = [];
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' ');
      logs.push(`[${data.params.type.toUpperCase()}] ${text}`);
    }
    if (data.method === 'Network.requestWillBeSent') {
      if (data.params.request.url.includes('identitytoolkit')) {
        reqs.push({
          url: data.params.request.url,
          headers: data.params.request.headers
        });
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

  console.log('Navigating to http://127.0.0.1:5173 (testing 127.0.0.1 origin)...');
  await send('Page.navigate', { url: 'http://127.0.0.1:5173' });
  await new Promise(r => setTimeout(r, 4000));

  console.log('Testing loginWithFirebase from 127.0.0.1 origin...');
  const res = await send('Runtime.evaluate', {
    expression: `(async () => {
      try {
        const { loginWithFirebase } = await import('/firebase.js');
        try {
          await loginWithFirebase('nyanya', 'nyanya@ourlittleuniverse.com', 'DummyProbeOnly123');
          return { success: true };
        } catch (error) {
          return {
            origin: window.location.origin,
            name: error.name,
            code: error.code,
            message: error.message,
            customData: error.customData || null,
            stack: error.stack
          };
        }
      } catch (err) {
        return { importError: err.message };
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('127.0.0.1 Login Result:', JSON.stringify(res?.result?.result?.value, null, 2));

  console.log('Network request headers:');
  console.log(reqs);

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

run().catch(console.error);
