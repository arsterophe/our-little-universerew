import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-haven-clean-'));
const port = 9397;
const cp = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + tmpDir], { stdio: 'ignore' });

async function run() {
  await new Promise(r => setTimeout(r, 2000));
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

  const loadPromise = new Promise(resolve => {
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Page.loadEventFired') {
        ws.off('message', handler);
        resolve();
      }
    };
    ws.on('message', handler);
  });

  await send('Page.navigate', { url: 'http://localhost:5173' });
  await loadPromise;
  await new Promise(r => setTimeout(r, 4000));

  console.log('Testing PINWHEEL world -> THE PINWHEEL HAVEN -> Navigation...');

  const resultPhase1 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const loader = document.getElementById('cosmic-app-loader');
          if (loader) loader.remove();

          // Wait up to 6s for universesController
          for (let i = 0; i < 24; i++) {
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

          // 1. Open PINWHEEL world directly
          ctrl.openPinwheelWorld({ uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3', displayName: 'Syma' });
          await new Promise(r => setTimeout(r, 1000));

          const pwActive = document.getElementById('view-pinwheel-world')?.classList.contains('active');

          // 2. Click My Residence button on PINWHEEL artwork
          const residenceBtn = document.querySelector('.btn-loc-residence') || document.getElementById('btn-loc-pinwheel-residence');
          if (residenceBtn) residenceBtn.click();
          await new Promise(r => setTimeout(r, 800));

          // 3. Click Enter Pinwheel Haven button in modal
          const enterHouseBtn = document.getElementById('btn-enter-pinwheel-residence');
          if (enterHouseBtn) enterHouseBtn.click();
          await new Promise(r => setTimeout(r, 1200));

          const houseActive = document.getElementById('view-pinwheel-haven')?.classList.contains('active');
          const livingTitle = document.getElementById('haven-room-title')?.textContent;
          const livingBg = document.getElementById('haven-bg-img')?.src;
          const avatar = document.getElementById('haven-player-avatar');
          const livingHotspots = document.querySelectorAll('#haven-hotspots-container .haven-hotspot-item').length;
          const navPills = document.querySelectorAll('#haven-nav-pills .haven-nav-btn').length;

          return {
            pwActive,
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

  console.log('Phase 1 (Cloud Nine Living Room):', resultPhase1?.result?.value || resultPhase1);

  // Capture Living Room Screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  if (shot1 && shot1.data) {
    fs.writeFileSync('scratch/pinwheel_haven_living_live.jpg', Buffer.from(shot1.data, 'base64'));
    console.log('Saved screenshot to scratch/pinwheel_haven_living_live.jpg');
  }

  // Phase 2: Switch to Bedroom
  const resultPhase2 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const navBed = document.querySelector('#haven-nav-pills .haven-nav-btn[data-room-id="bedroom"]');
          if (navBed) navBed.click();

          const bgImg = document.getElementById('haven-bg-img');
          if (bgImg) {
            await new Promise(resolve => {
              if (bgImg.complete && bgImg.naturalWidth > 0 && bgImg.src.includes('bedroom')) {
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
          await new Promise(r => setTimeout(r, 800));

          const bedTitle = document.getElementById('haven-room-title')?.textContent;
          const bedBg = document.getElementById('haven-bg-img')?.src;
          const bedHotspots = document.querySelectorAll('#haven-hotspots-container .haven-hotspot-item').length;

          return {
            bedTitle,
            bedBg,
            bedHotspots
          };
        } catch (err) {
          return { error: err.message };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 2 (Dream Above Bedroom):', resultPhase2?.result?.value || resultPhase2);

  // Capture Bedroom Screenshot
  const shot2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  if (shot2 && shot2.data) {
    fs.writeFileSync('scratch/pinwheel_haven_bedroom_live.jpg', Buffer.from(shot2.data, 'base64'));
    console.log('Saved screenshot to scratch/pinwheel_haven_bedroom_live.jpg');
  }

  // Phase 3: Return to PINWHEEL World
  const resultPhase3 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const backBtn = document.getElementById('btn-haven-back');
          if (backBtn) backBtn.click();
          await new Promise(r => setTimeout(r, 800));

          const pwActive = document.getElementById('view-pinwheel-world')?.classList.contains('active');
          const houseActive = document.getElementById('view-pinwheel-haven')?.classList.contains('active');

          return {
            returnedToPinwheel: pwActive && !houseActive
          };
        } catch (err) {
          return { error: err.message };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 3 (Return to PINWHEEL World):', resultPhase3?.result?.value || resultPhase3);

  ws.close();
  cp.kill();
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) {}
}

run().catch(err => {
  console.error('Verification failed:', err);
  cp.kill();
  process.exit(1);
});
