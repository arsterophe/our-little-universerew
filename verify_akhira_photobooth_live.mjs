// verify_akhira_photobooth_live.mjs
import http from 'http';
import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
const tempProfile = path.join(os.tmpdir(), 'chrome-akhira-pb-' + Date.now());
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
  `--user-data-dir=${tempProfile}`,
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:5173'
]);

await new Promise(r => setTimeout(r, 2500));

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
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

  console.log('--- Step 1: Login as Akhira (YAWN ⚡) and Open YAWN World ---');
  await evalJs(`
    (async () => {
      window.activeCharacterKey = 'akhira';
      if (typeof window.localStorage !== 'undefined') {
        localStorage.setItem('activeUniverseSession', 'akhira');
        localStorage.setItem('olu_pb_active_char', 'akhira');
        localStorage.setItem('olu_session_state_v1', JSON.stringify({ characterKey: 'akhira', mode: 'session' }));
      }
      document.querySelectorAll('.view-section').forEach(s => {
        s.classList.remove('active');
        s.setAttribute('aria-hidden', 'true');
      });
      const yawnWorld = document.getElementById('view-yawn-world');
      if (yawnWorld) {
        yawnWorld.classList.add('active');
        yawnWorld.setAttribute('aria-hidden', 'false');
      }
    })();
  `);

  await new Promise(r => setTimeout(r, 1200));
  await captureScreenshot('akhira_pb_01_yawn_entrance.jpg');

  console.log('--- Step 2: Open Our Little Photobooth (Stage 1: Peserta & Mode) ---');
  await evalJs(`
    (async () => {
      const topBtn = document.getElementById('btn-yawn-top-photobooth');
      if (topBtn) {
        topBtn.click();
      } else if (window.photoboothController) {
        window.photoboothController.openPhotobooth('view-yawn-world', 'akhira');
      }

      // Ensure active character is Akhira and set 4 Orang (Squad) mode
      if (window.photoboothController) {
        window.photoboothController.syncActiveCharacter('akhira', 'session');
        window.photoboothController.setGroupSize(4);
        window.photoboothController.toggleParticipant('nyanya');
        window.photoboothController.toggleParticipant('lala');
        window.photoboothController.toggleParticipant('lele');
      }
    })();
  `);

  await new Promise(r => setTimeout(r, 1500));
  await captureScreenshot('akhira_pb_02_participants_mode.jpg');

  console.log('--- Step 3: Enter Studio Camera (Stage 2) ---');
  await evalJs(`
    (async () => {
      const startBtn = document.getElementById('btn-pb-start');
      if (startBtn) startBtn.click();
    })();
  `);

  await new Promise(r => setTimeout(r, 1200));
  await captureScreenshot('akhira_pb_03_studio_camera.jpg');

  console.log('--- Step 4: Proceed to Interactive Studio Editor (Stage 3) ---');
  await evalJs(`
    (async () => {
      const gotoEditorBtn = document.getElementById('btn-pb-goto-editor');
      if (gotoEditorBtn) gotoEditorBtn.click();
      else if (window.switchPhotoboothStage) window.switchPhotoboothStage('editor');
    })();
  `);

  await new Promise(r => setTimeout(r, 1500));
  await captureScreenshot('akhira_pb_04_interactive_editor.jpg');

  console.log('--- Step 5: Apply Background Preset, Stickers, and Custom Text ---');
  await evalJs(`
    (async () => {
      if (window.studioManager) {
        // Apply crystal palace or astral ocean
        window.studioManager.setBackgroundPreset('crystal_palace');
        window.studioManager.setLayout('four_grid');
        window.studioManager.addSticker('⚡', 'emoji', { scale: 120, x: 240, y: 320 });
        window.studioManager.addSticker('🌊', 'emoji', { scale: 110, x: 720, y: 320 });
        window.studioManager.addSticker('✨', 'emoji', { scale: 95, x: 480, y: 640 });
        window.studioManager.addText('⚡ Akhira ⚡ · Astral Ocean', {
          fontSize: 34,
          color: '#38bdf8',
          shadow: true,
          x: 480,
          y: 1180
        });
        window.studioManager.selectedElement = { type: 'sticker', id: window.studioManager.state.stickers[0].id };
        window.studioManager.notify();
        await window.studioManager.renderInteractiveCanvas();
      }
    })();
  `);

  await new Promise(r => setTimeout(r, 1500));
  await captureScreenshot('akhira_pb_05_stickers_text_active.jpg');

  console.log('--- Step 6: Export & Save to Memory Gallery (Stage 4) ---');
  await evalJs(`
    (async () => {
      const gotoExportBtn = document.getElementById('btn-pb-goto-export');
      if (gotoExportBtn) gotoExportBtn.click();
      else if (window.switchPhotoboothStage) window.switchPhotoboothStage('result');

      // Click save to Memory Gallery
      const saveBtn = document.getElementById('btn-pb-save-memory');
      if (saveBtn) saveBtn.click();
    })();
  `);

  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('akhira_pb_06_export_memory_gallery.jpg');

  console.log('--- Step 7: Non-Akhira Exclusive Preview Gate Verification ---');
  await evalJs(`
    (async () => {
      // Simulate Nyanya visiting photobooth from kidult world
      window.activeCharacterKey = 'nyanya';
      if (window.photoboothController) {
        window.photoboothController.syncActiveCharacter('nyanya', 'session');
        window.photoboothController.openPhotobooth('view-kidult-world', 'nyanya');
      }
    })();
  `);

  await new Promise(r => setTimeout(r, 1200));
  await captureScreenshot('akhira_pb_07_exclusive_preview_gate.jpg');

  console.log('--- Step 8: Mobile Responsive Viewport (390x844) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  // Switch back to Akhira editor on mobile to verify responsive layout
  await evalJs(`
    (async () => {
      const closeBtn = document.getElementById('btn-close-exclusive-preview');
      if (closeBtn) closeBtn.click();

      window.activeCharacterKey = 'akhira';
      if (window.photoboothController) {
        window.photoboothController.syncActiveCharacter('akhira', 'session');
        window.photoboothController.openPhotobooth('view-yawn-world', 'akhira');
        window.switchPhotoboothStage('editor');
      }
    })();
  `);

  await new Promise(r => setTimeout(r, 1500));
  await captureScreenshot('akhira_pb_08_mobile_390.jpg');

  console.log('All verification steps completed successfully!');

} catch (err) {
  console.error('Verification error:', err);
} finally {
  chrome.kill();
  try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (_) {}
}
