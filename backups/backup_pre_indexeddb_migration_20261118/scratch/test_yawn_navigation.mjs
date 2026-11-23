import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-azure-nav-'));
const port = 9390;
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

  console.log('Testing YAWN world -> Azure Palace -> Back to YAWN world navigation...');

  const result = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const loader = document.getElementById('cosmic-app-loader');
          if (loader) loader.remove();

          // Wait up to 5s for window.ensureUniversesController or import directly
          for (let i = 0; i < 20; i++) {
            if (typeof window.ensureUniversesController === 'function') break;
            await new Promise(r => setTimeout(r, 250));
          }

          let ctrl = null;
          if (typeof window.ensureUniversesController === 'function') {
            ctrl = await window.ensureUniversesController();
          } else {
            const mod = await import('/universes_view.js');
            ctrl = mod.initUniversesView({
              onShowToast: (m) => console.log('toast:', m),
              onTriggerSparkle: () => {}
            });
          }

          if (!ctrl) return { error: 'No universesController' };

          // 1. Open YAWN world directly
          ctrl.openYawnWorld({ uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2', displayName: 'Akhira' });
          await new Promise(r => setTimeout(r, 1000));

          const yawnActive = document.getElementById('view-yawn-world')?.classList.contains('active');

          // 2. Click the residence button in YAWN
          const residenceBtn = document.querySelector('.btn-loc-yawn-residence');
          if (residenceBtn) residenceBtn.click();
          await new Promise(r => setTimeout(r, 600));

          // In case modal opened, click enter palace button
          const enterPalaceBtn = document.getElementById('btn-yawn-enter-palace');
          if (enterPalaceBtn) enterPalaceBtn.click();
          await new Promise(r => setTimeout(r, 1000));

          const palaceActive = document.getElementById('view-azure-palace')?.classList.contains('active');
          const palaceTitle = document.getElementById('azure-palace-room-title')?.textContent;

          // Switch to Conservatory
          const navConservatory = document.querySelector('.azure-nav-btn[data-room-id="conservatory"]');
          if (navConservatory) navConservatory.click();
          await new Promise(r => setTimeout(r, 800));

          const conservatoryTitle = document.getElementById('azure-palace-room-title')?.textContent;
          const conservatoryBg = document.getElementById('azure-palace-bg-img')?.src;

          return {
            yawnActive,
            palaceActive,
            palaceTitle,
            conservatoryTitle,
            conservatoryBg
          };
        } catch (err) {
          return { error: err.message, stack: err.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Navigation Result (Phase 1):', result.result.value);

  const shotRes = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  if (shotRes && shotRes.data) {
    fs.writeFileSync('scratch/azure_palace_conservatory_live.jpg', Buffer.from(shotRes.data, 'base64'));
    console.log('Saved screenshot to scratch/azure_palace_conservatory_live.jpg');
  }

  // Phase 2: Click back button
  const resultPhase2 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const backBtn = document.getElementById('btn-azure-palace-back');
        if (backBtn) backBtn.click();
        await new Promise(r => setTimeout(r, 800));

        const backInYawn = document.getElementById('view-yawn-world')?.classList.contains('active');
        const palaceClosed = !document.getElementById('view-azure-palace')?.classList.contains('active');

        return {
          backInYawn,
          palaceClosed
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Navigation Result (Phase 2):', resultPhase2.result.value);

  ws.close();
  cp.kill();
}

run().catch(err => {
  console.error(err);
  cp.kill();
});
