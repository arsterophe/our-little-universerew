import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-toyou-'));
const port = 9387;
const cp = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + tmpDir], { stdio: 'ignore' });

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:' + port + '/json/list');
  const list = await res.json();
  const wsUrl = list[0].webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === curId) {
        ws.off('message', handler);
        resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  await send('Runtime.evaluate', {
    expression: `
      const loader = document.getElementById('cosmic-app-loader');
      if (loader) loader.remove();

      document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
      });
      const toyou = document.getElementById('view-toyou-world');
      if (toyou) {
        toyou.classList.add('active');
        toyou.style.display = 'flex';
      }
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync('scratch/toyou_current_live.jpg', Buffer.from(shot.data, 'base64'));
  console.log('Saved scratch/toyou_current_live.jpg');

  ws.close();
  cp.kill();
}

run().catch(err => {
  console.error(err);
  cp.kill();
});
