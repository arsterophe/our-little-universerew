import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-dragon-den-'));
const port = 9393;
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
  await new Promise(r => setTimeout(r, 3000));

  console.log('Testing ASH world -> The Dragon\'s Den -> Navigation...');

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

          // 1. Open ASH world directly
          ctrl.openAshWorld({ uid: '9PMychPZ4rZ4PBCtZB9GiASttc52', displayName: 'Ruben' });
          await new Promise(r => setTimeout(r, 1000));

          const ashActive = document.getElementById('view-ash-world')?.classList.contains('active');

          // 2. Click Castle button on ASH artwork
          const castleBtn = document.querySelector('.btn-loc-ash-castle');
          if (castleBtn) castleBtn.click();
          await new Promise(r => setTimeout(r, 800));

          // 3. Click Enter Dragon's Den button in castle modal
          const enterHouseBtn = document.getElementById('btn-ash-enter-dragon-den');
          if (enterHouseBtn) enterHouseBtn.click();
          await new Promise(r => setTimeout(r, 1200));

          const houseActive = document.getElementById('view-dragon-den')?.classList.contains('active');
          const hallTitle = document.getElementById('dragon-den-room-title')?.textContent;
          const hallBg = document.getElementById('dragon-den-bg-img')?.src;
          const avatar = document.getElementById('dragon-den-player-avatar');
          const hallHotspots = document.querySelectorAll('#dragon-den-hotspots-container .dragon-den-hotspot-item').length;
          const navPills = document.querySelectorAll('#dragon-den-nav-pills .dragon-nav-btn').length;

          return {
            ashActive,
            houseActive,
            hallTitle,
            hallBg,
            hasAvatar: !!avatar,
            hallHotspots,
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

  console.log('Phase 1 (The Grand Hall):', resultPhase1?.result?.value || resultPhase1);

  // Capture Grand Hall Screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  if (shot1 && shot1.data) {
    fs.writeFileSync('scratch/dragon_den_hall_live.jpg', Buffer.from(shot1.data, 'base64'));
    console.log('Saved screenshot to scratch/dragon_den_hall_live.jpg');
  }

  // Phase 2: Switch to Conservatory
  const resultPhase2 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const navCons = document.querySelector('#dragon-den-nav-pills .dragon-nav-btn[data-room-id="conservatory"]');
          if (navCons) navCons.click();

          const bgImg = document.getElementById('dragon-den-bg-img');
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
          await new Promise(r => setTimeout(r, 800));

          const consTitle = document.getElementById('dragon-den-room-title')?.textContent;
          const consBg = document.getElementById('dragon-den-bg-img')?.src;
          const consHotspots = document.querySelectorAll('#dragon-den-hotspots-container .dragon-den-hotspot-item').length;

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

  console.log('Phase 2 (The Conservatory):', resultPhase2?.result?.value || resultPhase2);

  // Capture Conservatory Screenshot
  const shot2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  if (shot2 && shot2.data) {
    fs.writeFileSync('scratch/dragon_den_conservatory_live.jpg', Buffer.from(shot2.data, 'base64'));
    console.log('Saved screenshot to scratch/dragon_den_conservatory_live.jpg');
  }

  // Phase 3: Return to ASH World
  const resultPhase3 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const backBtn = document.getElementById('btn-dragon-den-back');
          if (backBtn) backBtn.click();
          await new Promise(r => setTimeout(r, 800));

          const ashActive = document.getElementById('view-ash-world')?.classList.contains('active');
          const houseActive = document.getElementById('view-dragon-den')?.classList.contains('active');

          return {
            returnedToAsh: ashActive && !houseActive
          };
        } catch (err) {
          return { error: err.message };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Phase 3 (Return to ASH World):', resultPhase3?.result?.value || resultPhase3);

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
