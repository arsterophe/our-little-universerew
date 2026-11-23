import WebSocket from 'ws';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-cdp-'));
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9355',
    `--user-data-dir=${tmp}`,
    'http://localhost:5173'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await (await fetch('http://127.0.0.1:9355/json/list')).json();
  const page = res.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let msgId = 1;
  const send = (method, params = {}) => new Promise(resolve => {
    const curId = msgId++;
    const handler = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  const errors = [];
  const logs = [];
  const reqs = [];

  ws.on('message', (raw) => {
    const data = JSON.parse(raw);
    if (data.method === 'Runtime.consoleAPICalled') {
      logs.push(data.params.args.map(a => a.value || a.description).join(' '));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      errors.push(data.params.exceptionDetails);
    }
    if (data.method === 'Network.responseReceived') {
      reqs.push({
        url: data.params.response.url,
        status: data.params.response.status,
        statusText: data.params.response.statusText
      });
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');

  await send('Page.reload');
  await new Promise(r => setTimeout(r, 3000));

  console.log('Console logs on reload:', logs);
  console.log('Exceptions on reload:', JSON.stringify(errors, null, 2));

  const mainReq = reqs.find(r => r.url.includes('main.js'));
  console.log('main.js network request:', mainReq);

  // Check all network requests that were 4xx or 5xx
  const badReqs = reqs.filter(r => r.status >= 400);
  console.log('Bad requests:', badReqs);

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}
}

main().catch(console.error);
