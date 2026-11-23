import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-silent-lotus-'));
const port = 9391;
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
        if (msg.error) {
          console.error('CDP Error in', method, ':', msg.error);
          resolve({ error: msg.error });
        } else {
          resolve(msg.result);
        }
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

  console.log('Testing US AGAIN world -> The Silent Lotus House -> Navigation...');

  const resultPhase1 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const loader = document.getElementById('cosmic-app-loader');
          if (loader) loader.remove();

          // Wait up to 5s for universesController
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

          // 1. Open US AGAIN world directly
          ctrl.openUsAgainWorld({ uid: 'plxSNowjCkOMfUQMAwnZzQPR9Xr1', displayName: 'Ela' });
          await new Promise(r => setTimeout(r, 800));

          const usagainActive = document.getElementById('view-usagain-world')?.classList.contains('active');

          // 2. Click the residence button in US AGAIN to open modal
          const residenceBtn = document.getElementById('btn-loc-usagain-residence');
          if (residenceBtn) residenceBtn.click();
          await new Promise(r => setTimeout(r, 600));

          // 3. Click Enter Lotus House button
          const enterHouseBtn = document.getElementById('btn-usagain-enter-lotus-house');
          if (enterHouseBtn) enterHouseBtn.click();
          await new Promise(r => setTimeout(r, 1000));

          const houseActive = document.getElementById('view-silent-lotus')?.classList.contains('active');
          const livingTitle = document.getElementById('silent-lotus-room-title')?.textContent;
          const livingBg = document.getElementById('silent-lotus-bg-img')?.src;
          const avatar = document.getElementById('silent-lotus-player-avatar');
          const livingHotspots = document.querySelectorAll('#silent-lotus-hotspots-container .silent-lotus-hotspot-item').length;
          const navPills = document.querySelectorAll('#silent-lotus-nav-pills .lotus-nav-btn').length;

          return {
            usagainActive,
            houseActive,
            livingTitle,
            livingBg,
            hasAvatar: !!avatar,
            livingHotspots,
            navPills
          };
        } catch (err) {
          return { error: err.message, stack: err.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 1 (Living Room):', resultPhase1?.result?.value || resultPhase1);

  // Capture Living Room Screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  if (shot1 && shot1.data) {
    fs.writeFileSync('scratch/silent_lotus_living_live.jpg', Buffer.from(shot1.data, 'base64'));
    console.log('Saved screenshot to scratch/silent_lotus_living_live.jpg');
  }

  // Phase 2: Switch to Conservatory
  const resultPhase2 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const navCons = document.querySelector('#silent-lotus-nav-pills .lotus-nav-btn[data-room-id="conservatory"]');
          if (navCons) navCons.click();

          const bgImg = document.getElementById('silent-lotus-bg-img');
          if (bgImg) {
            await new Promise(resolve => {
              if (bgImg.complete && bgImg.naturalWidth > 0 && bgImg.src.includes('conservatory')) {
                bgImg.decode ? bgImg.decode().then(resolve).catch(resolve) : resolve();
              } else {
                bgImg.onload = () => {
                  bgImg.decode ? bgImg.decode().then(resolve).catch(resolve) : resolve();
                };
                bgImg.onerror = resolve;
                setTimeout(resolve, 2500);
              }
            });
          }
          await new Promise(r => setTimeout(r, 600));

          const consTitle = document.getElementById('silent-lotus-room-title')?.textContent;
          const consBg = document.getElementById('silent-lotus-bg-img')?.src;
          const consHotspots = document.querySelectorAll('#silent-lotus-hotspots-container .silent-lotus-hotspot-item').length;

          return {
            consTitle,
            consBg,
            consHotspots
          };
        } catch (err) {
          return { error: err.message };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 2 (Conservatory):', resultPhase2?.result?.value || resultPhase2);

  // Capture Conservatory Screenshot
  const shot2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  if (shot2 && shot2.data) {
    fs.writeFileSync('scratch/silent_lotus_conservatory_live.jpg', Buffer.from(shot2.data, 'base64'));
    console.log('Saved screenshot to scratch/silent_lotus_conservatory_live.jpg');
  }

  // Phase 3: Click back button to return to US AGAIN world
  const resultPhase3 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const backBtn = document.getElementById('btn-silent-lotus-back');
          if (backBtn) backBtn.click();
          await new Promise(r => setTimeout(r, 800));

          const backInUsAgain = document.getElementById('view-usagain-world')?.classList.contains('active');
          const houseClosed = !document.getElementById('view-silent-lotus')?.classList.contains('active');

          return {
            backInUsAgain,
            houseClosed
          };
        } catch (err) {
          return { error: err.message };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 3 (Back Navigation):', resultPhase3?.result?.value || resultPhase3);

  ws.close();
  cp.kill();
}

run().catch(err => {
  console.error(err);
  cp.kill();
});
