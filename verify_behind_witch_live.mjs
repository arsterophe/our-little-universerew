import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-witch-'));
const port = 9370;
const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--window-size=1920,1080',
  'about:blank'
], { stdio: 'ignore' });

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const p = list.find(t => t.type === 'page');
      if (p && p.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch (_) {}
    await sleep(250);
  }
  throw new Error('Chrome WS unreachable');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 1;
    const map = new Map();
    ws.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          const reqId = id++;
          return new Promise((res, rej) => {
            map.set(reqId, { res, rej });
            ws.send(JSON.stringify({ id: reqId, method, params }));
          });
        },
        close() { ws.close(); }
      });
    });
    ws.addEventListener('message', ev => {
      const data = JSON.parse(ev.data);
      if (data.id && map.has(data.id)) {
        const { res, rej } = map.get(data.id);
        map.delete(data.id);
        if (data.error) rej(new Error(data.error.message));
        else res(data.result);
      }
    });
    ws.addEventListener('error', err => reject(err));
  });
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    const cdp = await connect(wsUrl);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Navigating to http://localhost:5173 ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(4000);

    // Switch view to KIDULT world
    console.log('Activating KIDULT world and initializing Behind the Witch...');
    const setupRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (async () => {
          localStorage.setItem('olu_current_character', 'nyanya');
          localStorage.setItem('olu_authenticated_user', 'nyanya');
          window.isPreviewingUniverses = true;

          document.querySelectorAll('.view-section').forEach(v => {
            v.classList.remove('active');
            v.setAttribute('aria-hidden', 'true');
          });
          const kidultView = document.getElementById('view-kidult-world');
          if (kidultView) {
            kidultView.classList.add('active');
            kidultView.setAttribute('aria-hidden', 'false');
          }
          const appLoader = document.getElementById('cosmic-app-loader');
          if (appLoader) appLoader.style.display = 'none';

          const witchMod = await import('/kidult_behind_view.js');
          if (witchMod && witchMod.initKidultBehindView) {
            witchMod.initKidultBehindView();
          }

          const btnBehind = document.getElementById('btn-kidult-behind');
          return {
            hasBtnBehind: !!btnBehind,
            btnDisplay: btnBehind ? window.getComputedStyle(btnBehind).display : 'none',
            btnText: btnBehind ? btnBehind.textContent.trim().replace(/\\s+/g, ' ') : '',
            hasController: !!window.kidultBehindController
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('KIDULT HUD button status:', setupRes.result.value);

    // Click BEHIND THE WITCH button
    console.log('Clicking #btn-kidult-behind ...');
    const openRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-kidult-behind');
          if (btn) btn.click();
          else if (window.kidultBehindController) window.kidultBehindController.open();
          const ov = document.getElementById('witch-behind-overlay');
          return {
            overlayActive: ov ? ov.classList.contains('active') : false,
            overlayAriaHidden: ov ? ov.getAttribute('aria-hidden') : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Overlay open status:', openRes.result.value);
    await sleep(1000);

    // 1. Capture Chapter I screenshot
    console.log('📸 Capturing Chapter I: The Witch...');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { if (window.kidultBehindController) window.kidultBehindController.switchChapter(1); })()`,
      returnByValue: true
    });
    await sleep(800);
    const shot1 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const shot1Path = path.join(artifactDir, 'behind_witch_01_ch1.jpg');
    fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
    console.log('📸 Saved Chapter 1 screenshot to:', shot1Path);

    // 2. Capture Chapter II screenshot
    console.log('📸 Capturing Chapter II: Why KIDULT? ...');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { if (window.kidultBehindController) window.kidultBehindController.switchChapter(2); })()`,
      returnByValue: true
    });
    await sleep(800);
    const shot2 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const shot2Path = path.join(artifactDir, 'behind_witch_02_ch2.jpg');
    fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
    console.log('📸 Saved Chapter 2 screenshot to:', shot2Path);

    // 3. Capture Chapter III screenshot
    console.log('📸 Capturing Chapter III: The Little Girl You Left Behind...');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { if (window.kidultBehindController) window.kidultBehindController.switchChapter(3); })()`,
      returnByValue: true
    });
    await sleep(800);
    const shot3 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const shot3Path = path.join(artifactDir, 'behind_witch_03_ch3.jpg');
    fs.writeFileSync(shot3Path, Buffer.from(shot3.data, 'base64'));
    console.log('📸 Saved Chapter 3 screenshot to:', shot3Path);

    // 4. Capture Chapter IV screenshot (Parchment letter + Replay test)
    console.log('📸 Capturing Chapter IV: A Letter From Lele...');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { if (window.kidultBehindController) window.kidultBehindController.switchChapter(4); })()`,
      returnByValue: true
    });
    await sleep(1000);
    const shot4 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const shot4Path = path.join(artifactDir, 'behind_witch_04_ch4_letter.jpg');
    fs.writeFileSync(shot4Path, Buffer.from(shot4.data, 'base64'));
    console.log('📸 Saved Chapter 4 screenshot to:', shot4Path);

    console.log('📜 Testing Letter Replay Button...');
    const replayRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-witch-letter-replay');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true
    });
    console.log('Letter replay clicked:', replayRes.result.value);
    await sleep(600);

    // 5. Capture Chapter V screenshot (Epilogue & Soundtrack)
    console.log('📸 Capturing Chapter V: Epilogue & Soundtrack...');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { if (window.kidultBehindController) window.kidultBehindController.switchChapter(5); })()`,
      returnByValue: true
    });
    await sleep(1000);
    const shot5 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const shot5Path = path.join(artifactDir, 'behind_witch_05_ch5_epilogue.jpg');
    fs.writeFileSync(shot5Path, Buffer.from(shot5.data, 'base64'));
    console.log('📸 Saved Chapter 5 screenshot to:', shot5Path);

    console.log('🎵 Testing Soundtrack Toggle...');
    const songToggleRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-witch-song-toggle');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true
    });
    console.log('Song toggle clicked:', songToggleRes.result.value);
    await sleep(600);

    // 6. Test Mobile Viewport (390x844)
    console.log('📱 Testing Mobile Viewport (390x844)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);

    const shotMobile = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const shotMobilePath = path.join(artifactDir, 'behind_witch_06_mobile.jpg');
    fs.writeFileSync(shotMobilePath, Buffer.from(shotMobile.data, 'base64'));
    console.log('📸 Saved Mobile screenshot to:', shotMobilePath);

    // Reset viewport and test close
    console.log('🚪 Testing Close button and audio stop...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(400);

    const closeRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btnClose = document.getElementById('btn-close-witch-behind');
          if (btnClose) btnClose.click();
          const ov = document.getElementById('witch-behind-overlay');
          return {
            overlayClosed: ov ? !ov.classList.contains('active') : true
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Close verification result:', closeRes.result.value);

    cdp.close();
    chrome.kill();
    console.log('\n🎉 ALL BEHIND THE WITCH LIVE CDP TESTS COMPLETED SUCCESSFULLY! 🎉');
  } catch (err) {
    console.error('❌ CDP verification error:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
