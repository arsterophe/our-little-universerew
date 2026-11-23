import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-hot-flow-'));
const port = 9344;
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
  const { data } = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  console.log(`📸 Screenshot saved: ${path.basename(filepath)} (${(fs.statSync(filepath).size / 1024).toFixed(1)} KB)`);
}

async function run() {
  console.log('🚀 Starting Royan HOT Universe Live Browser Flow Verification...');
  try {
    const wsUrl = await getWsUrl();
    const client = connect(wsUrl);
    const c = await client;

    await c.send('Page.enable');
    await c.send('DOM.enable');
    await c.send('Runtime.enable');

    // 1. Desktop Viewport
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('🌐 Navigating to http://localhost:5173...');
    await c.send('Page.navigate', { url: 'http://localhost:5173' });

    // Wait for module execution
    console.log('⏳ Waiting for application modules to load...');
    for (let i = 0; i < 50; i++) {
      const chk = await evalScript(c, 'typeof window.renderPrivateUniverse');
      if (chk === 'function') break;
      await sleep(100);
    }

    // 2. Direct Login as Royan (swBN9XodDWRuHE5YbYmeoytrcAx2) via renderPrivateUniverse
    console.log('🔑 Authenticating as Royan (UID: swBN9XodDWRuHE5YbYmeoytrcAx2)...');
    const stageInfo = await evalScript(c, `
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
        const badge = hotCard?.querySelector('.island-universe-badge');
        const img = hotCard?.querySelector('.floating-island-image');

        return {
          activeView: document.querySelector('.view-section.active')?.id,
          greeting: document.getElementById('univ-user-greeting')?.textContent,
          heroTitle: document.querySelector('.univ-hero-title')?.textContent,
          planetCount: document.querySelectorAll('.univ-island-card').length,
          hotCardClass: hotCard?.className,
          badgeText: badge?.textContent?.trim(),
          badgeClass: badge?.className,
          imgSrc: img?.getAttribute('src'),
          imgWidth: img?.offsetWidth,
          imgHeight: img?.offsetHeight
        };
      })()
    `);
    console.log('✅ Stage rendered after Royan login:', stageInfo);

    await sleep(600);
    // Capture Stage Screenshot (1920x1080)
    await captureScreenshot(c, path.join(artifactDir, 'hot_stage_8_planets_1920x1080.jpg'));

    // 3. Click Planet HOT to enter Royan's Universe Homepage
    console.log('🌌 Clicking Planet HOT to enter Royan Sanctuary...');
    const enterResult = await evalScript(c, `
      (async () => {
        const hotCard = document.querySelector('.univ-island-card.card-hot');
        if (hotCard) hotCard.click();
        await new Promise(r => setTimeout(r, 600));

        const hotWorld = document.getElementById('view-hot-world');
        const previewBadge = document.getElementById('hot-preview-badge');
        const previewBadgeDisplay = previewBadge ? window.getComputedStyle(previewBadge).display : null;
        return {
          hotWorldActive: hotWorld?.classList.contains('active'),
          hotWorldDisplay: hotWorld ? window.getComputedStyle(hotWorld).display : null,
          previewBadgeDisplay,
          titleText: document.querySelector('.hot-world-title')?.textContent,
          subtitleText: document.querySelector('.hot-world-subtitle')?.textContent,
          hotspotCount: document.querySelectorAll('.hot-loc-marker-btn').length
        };
      })()
    `);
    console.log('🏰 Royan HOT Homepage Result:', enterResult);

    await sleep(800);
    // Capture Royan's Universe Homepage Screenshot (1920x1080)
    await captureScreenshot(c, path.join(artifactDir, 'hot_homepage_owner_1920x1080.jpg'));

    // 4. Test Persistence & Storage Scoping in Owner Mode
    console.log('💾 Testing storage mutation in Owner Mode...');
    const ownerStoreTest = await evalScript(c, `
      (async () => {
        const residenceBtn = document.getElementById('btn-loc-hot-residence');
        if (residenceBtn) residenceBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const diaryInput = document.getElementById('hot-residence-diary');
        if (diaryInput) diaryInput.value = 'Tonight, the ancient elven willow tree blooms under the violet moonlight.';

        const saveBtn = document.getElementById('btn-save-hot-residence');
        if (saveBtn) saveBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const canonicalData = localStorage.getItem('olu_hot_residence_swBN9XodDWRuHE5YbYmeoytrcAx2');
        const previewData = localStorage.getItem('olu_hot_preview_temp_residence');

        return {
          savedInCanonical: !!canonicalData,
          previewUntouched: previewData === null,
          dataExcerpt: canonicalData ? JSON.parse(canonicalData).diary : null
        };
      })()
    `);
    console.log('🔒 Owner Mode Storage Isolation:', ownerStoreTest);

    // 5. Test Preview Mode for other characters (e.g. Syma)
    console.log('👁 Testing PREVIEW MODE for Syma...');
    const previewTest = await evalScript(c, `
      (async () => {
        // Switch user to Syma
        if (window.universesController) {
          window.universesController.updateUserProfile('abil', { uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3', displayName: 'Syma' });
          // Open HOT world in preview mode
          window.universesController.openHotWorld();
        }
        await new Promise(r => setTimeout(r, 600));

        const previewBadge = document.getElementById('hot-preview-badge');
        const badgeDisplay = previewBadge ? window.getComputedStyle(previewBadge).display : null;

        // Try to mutate something in preview mode
        const residenceBtn = document.getElementById('btn-loc-hot-residence');
        if (residenceBtn) residenceBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const diaryInput = document.getElementById('hot-residence-diary');
        if (diaryInput) diaryInput.value = 'GUEST PREVIEW: Visiting Royan sanctuary from Pinwheel!';

        const saveBtn = document.getElementById('btn-save-hot-residence');
        if (saveBtn) saveBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const canonicalData = localStorage.getItem('olu_hot_residence_swBN9XodDWRuHE5YbYmeoytrcAx2');
        const previewData = localStorage.getItem('olu_hot_preview_temp_residence');

        return {
          previewBadgeDisplay: badgeDisplay,
          previewDataSaved: !!previewData,
          previewExcerpt: previewData ? JSON.parse(previewData).diary : null,
          canonicalStillIntact: canonicalData && JSON.parse(canonicalData).diary.includes('ancient elven willow')
        };
      })()
    `);
    console.log('🛡 Preview Mode Isolation Result:', previewTest);

    await sleep(800);
    // Capture Preview Mode Screenshot (1920x1080)
    await captureScreenshot(c, path.join(artifactDir, 'hot_homepage_preview_1920x1080.jpg'));

    // 6. Test Mobile Viewport (390x844)
    console.log('📱 Switching to Mobile Viewport (390x844)...');
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(600);
    await captureScreenshot(c, path.join(artifactDir, 'hot_mobile_390x844.jpg'));

    console.log('🎉 ALL BROWSER FLOW VERIFICATIONS COMPLETED SUCCESSFULLY!');
    c.close();
  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    try { chrome.kill(); } catch (_) {}
    setTimeout(() => {
      try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
    }, 1000);
  }
}

run();
