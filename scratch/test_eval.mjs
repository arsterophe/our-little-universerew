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

  await send('Runtime.enable');
  await send('Page.enable');

  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const canvas = document.getElementById('stars-canvas');
        const cards = document.querySelectorAll('.character-card');
        return {
          canvasWidth: canvas ? canvas.width : null,
          canvasHeight: canvas ? canvas.height : null,
          cardsLength: cards.length,
          docReady: document.readyState
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Eval result:', evalRes.result.value);

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}
}

main().catch(console.error);
