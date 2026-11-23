import WebSocket from 'ws';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-cdp-'));
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9366',
    `--user-data-dir=${tmp}`,
    'http://localhost:5173'
  ]);

  await new Promise(r => setTimeout(r, 2500));
  const res = await (await fetch('http://127.0.0.1:9366/json/list')).json();
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

  // Enable Console and Runtime
  await send('Runtime.enable');
  await send('Page.enable');

  const logs = [];
  ws.on('message', (raw) => {
    const data = JSON.parse(raw);
    if (data.method === 'Runtime.consoleAPICalled') {
      logs.push(data.params.args.map(a => a.value || a.description).join(' '));
    }
  });

  const r1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const card = document.getElementById('card-nyanya');
        const viewSel = document.getElementById('view-selection');
        const viewLog = document.getElementById('view-login');
        return {
          cardFound: !!card,
          cardDataChar: card ? card.getAttribute('data-character') : null,
          viewSelClasses: viewSel ? viewSel.className : null,
          viewLogClasses: viewLog ? viewLog.className : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Before click:', JSON.stringify(r1));

  // Click card
  const r2 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const card = document.getElementById('card-nyanya');
        if (card) {
          card.click();
          return 'clicked';
        }
        return 'no card';
      })()
    `,
    returnByValue: true
  });
  console.log('Click action:', JSON.stringify(r2));

  await new Promise(r => setTimeout(r, 1000));

  const r3 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const viewSel = document.getElementById('view-selection');
        const viewLog = document.getElementById('view-login');
        const email = document.getElementById('email-input');
        return {
          viewSelClasses: viewSel ? viewSel.className : null,
          viewLogClasses: viewLog ? viewLog.className : null,
          emailVal: email ? email.value : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('After 1s:', JSON.stringify(r3));
  console.log('Browser logs:', logs);

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}
}

main().catch(console.error);
