import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-azure-palace-'));
const port = 9389;
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

  console.log('1. Page loaded, ensuring universesController and opening Azure Palace...');

  const result = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const loader = document.getElementById('cosmic-app-loader');
        if (loader) loader.remove();

        const ctrl = await window.ensureUniversesController();
        if (!ctrl) return { success: false, error: 'Failed to initialize universesController' };

        ctrl.openAzurePalace({ uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2', displayName: 'Akhira' });

        await new Promise(r => setTimeout(r, 800));

        const title = document.getElementById('azure-palace-room-title')?.textContent;
        const bgImg = document.getElementById('azure-palace-bg-img')?.src;
        const avatar = document.getElementById('azure-palace-player-avatar');
        const hotspots = document.querySelectorAll('.azure-palace-hotspot-item').length;
        const navPills = document.querySelectorAll('.azure-nav-btn').length;

        // Test room switching to kitchen
        const navBtnKitchen = document.querySelector('.azure-nav-btn[data-room-id="kitchen"]');
        if (navBtnKitchen) navBtnKitchen.click();

        await new Promise(r => setTimeout(r, 500));
        const kitchenTitle = document.getElementById('azure-palace-room-title')?.textContent;
        const kitchenBg = document.getElementById('azure-palace-bg-img')?.src;
        const kitchenHotspots = document.querySelectorAll('.azure-palace-hotspot-item').length;

        // Return to living room
        const navBtnLiving = document.querySelector('.azure-nav-btn[data-room-id="living"]');
        if (navBtnLiving) navBtnLiving.click();
        await new Promise(r => setTimeout(r, 500));

        return {
          success: true,
          initialTitle: title,
          initialBg: bgImg,
          hasAvatar: !!avatar,
          livingHotspotsCount: hotspots,
          navPillsCount: navPills,
          kitchenTitle,
          kitchenBg,
          kitchenHotspotsCount: kitchenHotspots
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Evaluation result:', result.result.value);

  await new Promise(r => setTimeout(r, 1000));
  const shotRes = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  if (shotRes && shotRes.data) {
    fs.writeFileSync('scratch/azure_palace_live.jpg', Buffer.from(shotRes.data, 'base64'));
    console.log('Saved screenshot to scratch/azure_palace_live.jpg');
  }

  ws.close();
  cp.kill();
}

run().catch(err => {
  console.error(err);
  cp.kill();
});
