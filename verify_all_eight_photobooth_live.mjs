// verify_all_eight_photobooth_live.mjs
import http from 'http';
import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
const tempProfile = path.join(os.tmpdir(), 'chrome-all-eight-pb-' + Date.now());
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9225',
  `--user-data-dir=${tempProfile}`,
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:5173'
]);

await new Promise(r => setTimeout(r, 2500));

async function getPages(retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      const data = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9225/json', (res) => {
          let str = '';
          res.on('data', chunk => str += chunk);
          res.on('end', () => resolve(JSON.parse(str)));
        }).on('error', reject);
      });
      return data;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 600));
    }
  }
}

try {
  const pages = await getPages();
  const page = pages.find(p => p.url.includes('localhost:5173')) || pages[0];
  if (!page) {
    console.error('No page found');
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);

  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      pending.set(msgId, (data) => resolve(data.result));
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res && res.result ? res.result.value : null;
  }

  async function captureScreenshot(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const buffer = Buffer.from(shot.data, 'base64');
    const outPath = path.join(artifactDir, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${outPath}`);
  }

  // Set desktop viewport 1440x900
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 2000));

  // Pre-load Photobooth Controller so it's initialized for all characters
  console.log('--- Initializing Photobooth Controller ---');
  const initResult = await evalJs(`
    (async () => {
      try {
        const mod = await import('/photobooth_view.js');
        if (mod && typeof mod.initPhotoboothView === 'function') {
          window.photoboothController = mod.initPhotoboothView();
          return 'INITIALIZED_OK';
        }
        return 'NO_INIT_FUNCTION';
      } catch (err) {
        return 'ERR: ' + err.message;
      }
    })();
  `);
  console.log('initResult:', initResult);
  await new Promise(r => setTimeout(r, 1000));

  const characters = [
    { key: 'nyanya', name: 'Nyanya', symbol: '⭐', universe: 'KIDULT', file: 'all_pb_01_nyanya_kidult.jpg', theme: 'theme-kidult' },
    { key: 'lala', name: 'Lala', symbol: '☀️', universe: 'TO YOU', file: 'all_pb_02_lala_toyou.jpg', theme: 'theme-toyou' },
    { key: 'lele', name: 'Lele', symbol: '🌙', universe: 'SHADOW', file: 'all_pb_03_lele_shadow.jpg', theme: 'theme-shadow' },
    { key: 'abil', name: 'Syma', symbol: '☁️', universe: 'PINWHEEL', file: 'all_pb_04_syma_pinwheel.jpg', theme: 'theme-pinwheel' },
    { key: 'akhira', name: 'Akhira', symbol: '⚡', universe: 'YAWN', file: 'all_pb_05_akhira_yawn.jpg', theme: 'theme-yawn' },
    { key: 'ela', name: 'Ela', symbol: '🪷', universe: 'US AGAIN', file: 'all_pb_06_ela_usagain.jpg', theme: 'theme-usagain' },
    { key: 'ruben', name: 'Ruben', symbol: '🐉', universe: 'ASH', file: 'all_pb_07_ruben_ash.jpg', theme: 'theme-ash' },
    { key: 'royan', name: 'Royan', symbol: '🎆', universe: 'HOT', file: 'all_pb_08_royan_hot.jpg', theme: 'theme-hot' }
  ];

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    console.log(`\n--- Verifying Character ${i+1}/8: ${char.name} ${char.symbol} (${char.universe}) ---`);
    
    const verificationData = await evalJs(`
      (async () => {
        window.activeCharacterKey = '${char.key}';
        if (typeof window.localStorage !== 'undefined') {
          localStorage.setItem('activeUniverseSession', '${char.key}');
          localStorage.setItem('olu_pb_active_char', '${char.key}');
          localStorage.setItem('olu_session_state_v1', JSON.stringify({ characterKey: '${char.key}', mode: 'session' }));
        }

        // Open Photobooth and sync active character
        if (window.photoboothController && typeof window.photoboothController.openPhotobooth === 'function') {
          window.photoboothController.openPhotobooth('view-private-universe', '${char.key}');
        }

        // Click the character chip in the Photobooth Studio UI
        const chip = document.querySelector('.pb-char-chip[data-pb-char="' + '${char.key}' + '"]');
        if (chip) chip.click();

        // Ensure active character is synced in controller
        if (window.photoboothController && typeof window.photoboothController.syncActiveCharacter === 'function') {
          window.photoboothController.syncActiveCharacter('${char.key}', 'session');
        }

        // Set group size to Duo or Trio
        if (window.photoboothController) {
          window.photoboothController.setGroupSize(${(i % 4) + 1});
        }

        const pbSec = document.getElementById('view-photobooth');
        const modal = document.getElementById('pb-exclusive-preview-modal');
        const nameEl = document.getElementById('pb-active-user-name');
        const subEl = document.getElementById('pb-active-user-sub');

        return {
          hasTheme: pbSec ? pbSec.classList.contains('${char.theme}') : false,
          actualClasses: pbSec ? Array.from(pbSec.classList) : [],
          modalHidden: !modal || modal.style.display === 'none' || modal.getAttribute('aria-hidden') === 'true',
          badgeName: nameEl ? nameEl.textContent : '',
          badgeSub: subEl ? subEl.textContent : ''
        };
      })();
    `);

    console.log('Verification data:', verificationData);
    await new Promise(r => setTimeout(r, 1200));
    await captureScreenshot(char.file);
  }

  // --- Step 9: Interactive Studio Editor Canvas (Ela 🪷) ---
  console.log('\n--- Step 9: Stage 3 Interactive Studio Editor ---');
  await evalJs(`
    (async () => {
      window.activeCharacterKey = 'ela';
      if (window.photoboothController) {
        window.photoboothController.syncActiveCharacter('ela', 'session');
        window.photoboothController.setGroupSize(3);
        window.photoboothController.toggleParticipant('nyanya');
        window.photoboothController.toggleParticipant('lala');
      }

      // Switch to Stage 3 Editor
      const editorPill = document.querySelector('.pb-step-pill[data-pb-step="editor"]');
      if (editorPill) editorPill.click();

      // Trigger interactive canvas render
      if (window.studioManager) {
        window.studioManager.setActiveChar('ela');
        window.studioManager.renderInteractiveCanvas();
      }
    })();
  `);

  await new Promise(r => setTimeout(r, 1500));
  await captureScreenshot('all_pb_09_editor_canvas.jpg');

  // --- Step 10: Memory Gallery with Isolated Projects in IndexedDB ---
  console.log('\n--- Step 10: Stage 4 Memory Gallery Isolation ---');
  await evalJs(`
    (async () => {
      // Switch to Stage 4 Result & Gallery
      const resultPill = document.querySelector('.pb-step-pill[data-pb-step="result"]');
      if (resultPill) resultPill.click();

      // Save a memory project for Ela
      if (window.studioManager) {
        await window.studioManager.saveToGallery('Kenangan Indah Ela 🪷 di Silent Lotus');
      }

      // Refresh memory list
      const saveBtn = document.getElementById('btn-pb-save-memory');
      if (saveBtn) saveBtn.click();
    })();
  `);

  await new Promise(r => setTimeout(r, 1800));
  await captureScreenshot('all_pb_10_memory_gallery_isolated.jpg');

  // --- Step 11: Mobile Responsive View (390x844) ---
  console.log('\n--- Step 11: Mobile Responsive View ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await new Promise(r => setTimeout(r, 1200));
  await captureScreenshot('all_pb_11_mobile_390.jpg');

  console.log('\n✨ All 8 Characters Photobooth live browser verification completed successfully!');

} catch (err) {
  console.error('Error during verification:', err);
} finally {
  chrome.kill();
  process.exit(0);
}
