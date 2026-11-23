import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-manor-'));
const port = 9398;
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

  console.log('Testing ROYAN UNIVERSE HOT -> UI Cleanup -> Moonpetal Manor...');

  // Phase 1: Open HOT world & verify Profile Sidebar and Residence Button
  const resultPhase1 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const loader = document.getElementById('cosmic-app-loader');
          if (loader) loader.remove();

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

          // Open HOT world directly
          ctrl.openHotWorld({ uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2', displayName: 'Royan' });
          await new Promise(r => setTimeout(r, 1200));

          const hotActive = document.getElementById('view-hot-world')?.classList.contains('active');
          const sidebar = document.querySelector('.hot-profile-sidebar');
          const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
          const sidebarText = sidebar ? sidebar.innerText : '';

          const resBtn = document.getElementById('btn-loc-hot-residence');
          const resBtnRect = resBtn ? resBtn.getBoundingClientRect() : null;
          const resBtnLabel = resBtn?.querySelector('.hot-loc-label')?.textContent;

          return {
            hotActive,
            sidebarPresent: !!sidebar,
            sidebarRect,
            sidebarText: sidebarText.substring(0, 150),
            resBtnPresent: !!resBtn,
            resBtnRect,
            resBtnLabel
          };
        } catch (err) {
          return { error: err.message, stack: err.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 1 (HOT World & Profile Layout):', JSON.stringify(resultPhase1.value, null, 2));

  // Take screenshot of HOT world
  const shotHot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync('scratch/hot_world_cleaned_live.jpg', Buffer.from(shotHot.data, 'base64'));
  console.log('Saved scratch/hot_world_cleaned_live.jpg');

  // Phase 2: Enter Moonpetal Manor
  const resultPhase2 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const resBtn = document.getElementById('btn-loc-hot-residence');
          if (resBtn) resBtn.click();
          await new Promise(r => setTimeout(r, 1200));

          const manorActive = document.getElementById('view-moonpetal-manor')?.classList.contains('active');
          const roomTitle = document.getElementById('manor-room-title')?.textContent;
          const bgSrc = document.getElementById('manor-bg-img')?.src;
          const avatar = document.getElementById('manor-player-avatar');
          const hotspots = document.querySelectorAll('#manor-hotspots-container .manor-hotspot').length;
          const navPills = document.querySelectorAll('#manor-nav-pills .manor-nav-pill').length;

          return {
            manorActive,
            roomTitle,
            bgSrc,
            hasAvatar: !!avatar,
            hotspots,
            navPills
          };
        } catch (err) {
          return { error: err.message };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 2 (Moonpetal Manor Living Room):', JSON.stringify(resultPhase2.value, null, 2));

  // Take screenshot of Moonpetal Manor Living Room
  const shotLiving = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync('scratch/moonpetal_manor_living_live.jpg', Buffer.from(shotLiving.data, 'base64'));
  console.log('Saved scratch/moonpetal_manor_living_live.jpg');

  // Phase 3: Switch to Moonpetal Royal Bedroom
  const resultPhase3 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const bedPill = document.querySelector('.manor-nav-pill[data-room-id="bedroom"]');
          if (bedPill) bedPill.click();
          await new Promise(r => setTimeout(r, 800));

          const roomTitle = document.getElementById('manor-room-title')?.textContent;
          const bgSrc = document.getElementById('manor-bg-img')?.src;
          const hotspots = document.querySelectorAll('#manor-hotspots-container .manor-hotspot').length;

          return {
            roomTitle,
            bgSrc,
            hotspots
          };
        } catch (err) {
          return { error: err.message };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 3 (Moonpetal Royal Bedroom):', JSON.stringify(resultPhase3.value, null, 2));

  // Take screenshot of Moonpetal Manor Bedroom
  const shotBedroom = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync('scratch/moonpetal_manor_bedroom_live.jpg', Buffer.from(shotBedroom.data, 'base64'));
  console.log('Saved scratch/moonpetal_manor_bedroom_live.jpg');

  // Phase 4: Return back to HOT World
  const resultPhase4 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const btnBack = document.getElementById('btn-manor-back');
          if (btnBack) btnBack.click();
          await new Promise(r => setTimeout(r, 800));

          const hotActive = document.getElementById('view-hot-world')?.classList.contains('active');
          const manorActive = document.getElementById('view-moonpetal-manor')?.classList.contains('active');

          return {
            hotActive,
            manorActive
          };
        } catch (err) {
          return { error: err.message };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 4 (Return to HOT World):', JSON.stringify(resultPhase4.value, null, 2));

  ws.close();
  cp.kill();
  console.log('CDP Live Verification Completed Successfully!');
}

run().catch(err => {
  console.error('CDP Live Verification failed:', err);
  try { cp.kill(); } catch (_) {}
  process.exit(1);
});
