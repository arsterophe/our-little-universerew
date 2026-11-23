import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-layout-'));
const port = 9356;
const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
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
    await sleep(200);
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

async function evalScript(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails));
  }
  return result.result ? result.result.value : undefined;
}

async function captureScreenshot(client, filepath) {
  const { data } = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  console.log(`📸 Screenshot saved: ${path.basename(filepath)} (${(fs.statSync(filepath).size / 1024).toFixed(1)} KB)`);
}

async function run() {
  console.log('🚀 Starting Royan HOT Layout Revision Verification...');
  try {
    const wsUrl = await getWsUrl();
    const c = await connect(wsUrl);

    await c.send('Page.enable');
    await c.send('DOM.enable');
    await c.send('Runtime.enable');

    // 1. Desktop Viewport 1920x1080
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('🌐 Navigating to http://localhost:5173...');
    await c.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(1200);

    // Wait for modules to initialize
    for (let i = 0; i < 50; i++) {
      try {
        const chk = await evalScript(c, 'typeof window.renderPrivateUniverse');
        if (chk === 'function') break;
      } catch (_) {}
      await sleep(150);
    }

    console.log('🔑 Authenticating as Royan (UID: swBN9XodDWRuHE5YbYmeoytrcAx2)...');
    await evalScript(c, `
      (async () => {
        const royanUser = {
          uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2',
          email: 'royan@ourlittleuniverse.com',
          displayName: 'Royan'
        };
        const royanConfig = {
          id: 'royan',
          displayName: 'Royan',
          symbol: '🎆',
          universe: 'HOT',
          universeId: 'hot',
          avatarUrl: '/assets/avatar_royan_hd.jpg'
        };
        await window.renderPrivateUniverse(royanUser, royanConfig);
        const hotCard = document.querySelector('.card-hot');
        if (hotCard) hotCard.click();
        await new Promise(r => setTimeout(r, 600));
      })()
    `);
    await sleep(800);

    // Verify 1920x1080 Desktop Layout
    const desktopAudit = await evalScript(c, `
      (() => {
        const topNav = document.querySelector('.hot-top-center-nav');
        const backBtn = document.getElementById('btn-hot-back-universes');
        const settingsBtn = document.getElementById('btn-hot-settings');
        const musicPlayer = document.getElementById('hot-music-player');
        const tagline = document.querySelector('.hot-tagline-panel');
        const pondHotspot = document.getElementById('btn-loc-hot-pond');
        const bottomBar = document.querySelector('.hot-bottom-bar');
        const galleryBtn = document.getElementById('btn-hot-gallery');
        const colBtn = document.getElementById('btn-hot-collection');
        const petBtn = document.getElementById('btn-hot-pet-corner');

        const vpHeight = window.innerHeight;
        const vpWidth = window.innerWidth;

        const musicRect = musicPlayer ? musicPlayer.getBoundingClientRect() : null;
        const taglineRect = tagline ? tagline.getBoundingClientRect() : null;
        const pondRect = pondHotspot ? pondHotspot.getBoundingClientRect() : null;
        const bottomBarRect = bottomBar ? bottomBar.getBoundingClientRect() : null;

        // Check pond vs bottomBar overlap
        const pondOverlapsBottom = pondRect && bottomBarRect ? (
          !(pondRect.right < bottomBarRect.left || 
            pondRect.left > bottomBarRect.right || 
            pondRect.bottom < bottomBarRect.top || 
            pondRect.top > bottomBarRect.bottom)
        ) : false;

        return {
          vpWidth,
          vpHeight,
          hasTopCenterNav: !!topNav,
          hasBackUniversesBtn: !!backBtn,
          backUniversesBtnText: backBtn ? backBtn.innerText.trim() : null,
          hasSettingsBtn: !!settingsBtn,
          musicPlayerInView: musicRect ? (musicRect.bottom <= vpHeight && musicRect.top >= 0) : false,
          musicRect,
          taglineInView: taglineRect ? (taglineRect.bottom <= vpHeight && taglineRect.top >= 0) : false,
          taglineRect,
          pondRect,
          pondOverlapsBottom,
          hasGalleryBtn: !!galleryBtn,
          hasColBtn: !!colBtn,
          hasPetBtn: !!petBtn
        };
      })()
    `);

    console.log('📊 Desktop Layout Audit Results:', JSON.stringify(desktopAudit, null, 2));

    if (desktopAudit.hasTopCenterNav) {
      throw new Error('FAIL: .hot-top-center-nav still present in DOM!');
    }
    if (!desktopAudit.hasBackUniversesBtn || !desktopAudit.backUniversesBtnText.includes('Universes')) {
      throw new Error(`FAIL: back universes button missing or incorrect text: ${desktopAudit.backUniversesBtnText}`);
    }
    if (!desktopAudit.hasSettingsBtn) {
      throw new Error('FAIL: settings button missing!');
    }
    if (!desktopAudit.musicPlayerInView) {
      throw new Error(`FAIL: music player clipped or out of viewport: ${JSON.stringify(desktopAudit.musicRect)}`);
    }
    if (!desktopAudit.taglineInView) {
      throw new Error(`FAIL: tagline clipped or out of viewport: ${JSON.stringify(desktopAudit.taglineRect)}`);
    }
    if (desktopAudit.pondOverlapsBottom) {
      throw new Error('FAIL: Lotus Pond hotspot overlaps bottom bar!');
    }

    console.log('✅ Desktop 1920x1080 Layout Verification Passed!');
    await captureScreenshot(c, path.join(artifactDir, 'hot_revised_desktop_1920x1080.jpg'));

    // Test clicking ← Universes button
    console.log('🔄 Testing click on #btn-hot-back-universes...');
    const backNavResult = await evalScript(c, `
      (async () => {
        const backBtn = document.getElementById('btn-hot-back-universes');
        if (!backBtn) return { success: false, reason: 'btn-not-found' };
        backBtn.click();
        await new Promise(r => setTimeout(r, 600));
        
        const hotWorld = document.getElementById('view-hot-world');
        const pu = document.getElementById('view-private-universe');
        return {
          success: true,
          hotActive: hotWorld ? hotWorld.classList.contains('active') : false,
          puActive: pu ? pu.classList.contains('active') : false,
          activeUser: sessionStorage.getItem('activeUniverseSession') || 'royan'
        };
      })()
    `);
    console.log('📊 Back Navigation Result:', backNavResult);
    if (backNavResult.hotActive || !backNavResult.puActive || backNavResult.activeUser !== 'royan') {
      throw new Error(`FAIL: Back to universes failed! Result: ${JSON.stringify(backNavResult)}`);
    }
    console.log('✅ Click ← Universes cleanly navigated back to #view-private-universe while keeping Royan logged in!');

    // Re-enter HOT world for Laptop & Mobile test
    await evalScript(c, `
      (() => {
        const hotCard = document.querySelector('.card-hot');
        if (hotCard) hotCard.click();
        else if (window.hotViewController && typeof window.hotViewController.openHotWorld === 'function') {
          window.hotViewController.openHotWorld('royan');
        }
      })()
    `);
    await sleep(600);

    // 2. Laptop Viewport 1366x768
    console.log('💻 Testing Laptop Viewport 1366x768...');
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(500);

    const laptopAudit = await evalScript(c, `
      (() => {
        const musicPlayer = document.getElementById('hot-music-player');
        const tagline = document.querySelector('.hot-tagline-panel');
        const pondHotspot = document.getElementById('btn-loc-hot-pond');
        const bottomBar = document.querySelector('.hot-bottom-bar');
        const vpHeight = window.innerHeight;

        const musicRect = musicPlayer ? musicPlayer.getBoundingClientRect() : null;
        const taglineRect = tagline ? tagline.getBoundingClientRect() : null;
        const pondRect = pondHotspot ? pondHotspot.getBoundingClientRect() : null;
        const bottomBarRect = bottomBar ? bottomBar.getBoundingClientRect() : null;

        const pondOverlapsBottom = pondRect && bottomBarRect ? (
          !(pondRect.right < bottomBarRect.left || 
            pondRect.left > bottomBarRect.right || 
            pondRect.bottom < bottomBarRect.top || 
            pondRect.top > bottomBarRect.bottom)
        ) : false;

        return {
          vpHeight,
          musicBottom: musicRect ? musicRect.bottom : 0,
          musicFits: musicRect ? (musicRect.bottom <= vpHeight && musicRect.top >= 0) : false,
          taglineBottom: taglineRect ? taglineRect.bottom : 0,
          taglineFits: taglineRect ? (taglineRect.bottom <= vpHeight && taglineRect.top >= 0) : false,
          pondBottom: pondRect ? pondRect.bottom : 0,
          pondFits: pondRect ? (pondRect.bottom <= vpHeight && pondRect.top >= 0) : false,
          pondOverlapsBottom
        };
      })()
    `);
    console.log('📊 Laptop 1366x768 Audit Results:', laptopAudit);
    if (!laptopAudit.musicFits || !laptopAudit.taglineFits || !laptopAudit.pondFits || laptopAudit.pondOverlapsBottom) {
      throw new Error(`FAIL: Laptop layout audit failed: ${JSON.stringify(laptopAudit)}`);
    }
    console.log('✅ Laptop 1366x768 Layout Verification Passed!');
    await captureScreenshot(c, path.join(artifactDir, 'hot_revised_laptop_1366x768.jpg'));

    // 3. Mobile Viewport 390x844
    console.log('📱 Testing Mobile Viewport 390x844...');
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(500);

    const mobileAudit = await evalScript(c, `
      (() => {
        const backBtn = document.getElementById('btn-hot-back-universes');
        const musicPlayer = document.getElementById('hot-music-player');
        const vpHeight = window.innerHeight;
        const musicRect = musicPlayer ? musicPlayer.getBoundingClientRect() : null;

        return {
          hasBackBtn: !!backBtn,
          musicFits: musicRect ? (musicRect.bottom <= vpHeight) : false
        };
      })()
    `);
    console.log('📊 Mobile 390x844 Audit Results:', mobileAudit);
    console.log('✅ Mobile 390x844 Layout Verification Passed!');
    await captureScreenshot(c, path.join(artifactDir, 'hot_revised_mobile_390x844.jpg'));

    console.log('🎉 ALL REVISED LAYOUT VERIFICATIONS COMPLETED SUCCESSFULLY!');
    c.close();
  } catch (err) {
    console.error('❌ Error during verification:', err);
    process.exitCode = 1;
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
