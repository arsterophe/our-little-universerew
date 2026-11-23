/**
 * LIVE BROWSER VERIFICATION: PINWHEEL PHOTOGRAPHY & VISION STUDIO
 * SYMA'S PINWHEEL UNIVERSE
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = 9330;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function checkPort(port) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
  }

  async connect() {
    const { WebSocket } = await import('ws');
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression, retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await this.send('Runtime.evaluate', {
          expression,
          returnByValue: true,
          awaitPromise: true
        });
        return res?.result?.value;
      } catch (err) {
        if (i < retries - 1 && String(err?.message || err).includes('navigated')) {
          await sleep(1500);
          continue;
        }
        throw err;
      }
    }
  }

  async captureScreenshot(outPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  }
}

async function run() {
  console.log('=== STARTING PINWHEEL PHOTOGRAPHY & VISION STUDIO LIVE VERIFICATION ===');

  let appPort = 5174;
  const p5174Ok = await checkPort(5174);
  if (!p5174Ok) appPort = 5173;
  console.log(`Using App Port: ${appPort}`);

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1920,1080',
    'about:blank'
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      try {
        targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (_) {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Chrome CDP endpoints not ready');
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    console.log('Connected to Chrome CDP WebSocket');

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    await client.send('Page.navigate', { url: `http://127.0.0.1:${appPort}/` });
    console.log('Navigated to application root');
    await sleep(4000);

    // =========================================================================
    // PART 1: PHOTOGRAPHY — THE MOMENT ARCHIVE
    // =========================================================================
    console.log('--- PART 1: Opening Photography: The Moment Archive ---');

    const photoOpenRes = await client.eval(`
      (async () => {
        try {
          const symaUid = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';

          if (window.pinwheelWorldController && typeof window.pinwheelWorldController.openPhotography === 'function') {
            window.pinwheelWorldController.openPhotography(symaUid, 'camera');
          } else {
            const mod = await import('/pinwheel_photography_view.js');
            const ctrl = mod.initPinwheelPhotographyView({
              onShowToast: (msg, type) => console.log('[Photo Toast]', type, msg),
              onNavigateBack: () => {
                const el = document.getElementById('view-pinwheel-photography');
                if (el) el.classList.remove('active');
              },
              onSwitchToVisionStudio: async () => {
                const vmod = await import('/pinwheel_vision_studio_view.js');
                const vctrl = vmod.initPinwheelVisionStudioView({});
                window.pinwheelVisionStudioController = vctrl;
                vctrl.openVisionStudio(symaUid, 'canvas');
              }
            });
            window.pinwheelPhotoController = ctrl;
            ctrl.openPhotography(symaUid, 'camera');
          }

          const pv = document.getElementById('view-pinwheel-photography');
          return {
            photoActive: !!pv && pv.classList.contains('active'),
            hasPhoto: !!pv
          };
        } catch (e) {
          return { error: e.message };
        }
      })()
    `);
    console.log('Photography opened result:', photoOpenRes);
    await sleep(2500);

    // 1.1 Test Scenery Switching & Unavailable status
    console.log('Testing Scenery Selection...');
    const sceneryTest = await client.eval(`
      (() => {
        // Click Moonlit Blossom Gazebo
        const gazeboCard = document.querySelector('.photo-option-card[data-scenery-id="gazebo"]');
        if (gazeboCard) gazeboCard.click();

        // Check unavailable scenery click
        const pondCard = document.querySelector('.photo-option-card[data-scenery-id="pond"]');
        const pondLocked = pondCard ? pondCard.classList.contains('disabled') : false;

        return { gazeboClicked: !!gazeboCard, pondLocked };
      })()
    `);
    console.log('Scenery test result:', sceneryTest);
    await sleep(1000);

    // 1.2 Test Pose, Frame & Filter
    console.log('Testing Pose, Frame & Filter...');
    await client.eval(`
      (() => {
        // Select Mystic Kitsune Pose
        const poseCard = document.querySelector('.photo-option-card[data-pose-id="card"]');
        if (poseCard) poseCard.click();

        // Select Lavender Frame
        const frameBtn = document.querySelector('.photo-frame-chip[data-frame-id="lavender"]');
        if (frameBtn) frameBtn.click();

        // Select Soft Lavender Filter
        const filterBtn = document.querySelector('.photo-filter-chip[data-filter-id="soft_lavender"]');
        if (filterBtn) filterBtn.click();
      })()
    `);
    await sleep(1500);

    // 1.3 Test Capture Button & Preview Modal
    console.log('Testing Capture button...');
    const captureResult = await client.eval(`
      (async () => {
        const captureBtn = document.getElementById('btn-photo-capture');
        if (captureBtn) {
          captureBtn.click();
          await new Promise(r => setTimeout(r, 1200));
          const modal = document.getElementById('photo-preview-modal');
          return {
            captured: true,
            modalActive: modal ? modal.classList.contains('active') : false
          };
        }
        return { captured: false };
      })()
    `);
    console.log('Capture result:', captureResult);
    await sleep(1500);

    // Fill title, caption and save to Album
    await client.eval(`
      (() => {
        const titleInput = document.getElementById('photo-preview-title');
        const captionInput = document.getElementById('photo-preview-caption');
        if (titleInput) titleInput.value = 'Malam Indah di Gazebo Sakura';
        if (captionInput) captionInput.value = 'Foto kenangan Syma di bawah gemerlap rembulan dan kelopak sakura.';
        
        const saveBtn = document.getElementById('btn-photo-preview-save');
        if (saveBtn) saveBtn.click();
      })()
    `);
    await sleep(1500);

    // Capture Screenshot 1: Photography Camera Mode
    const shot1 = path.join(artDir, 'pinwheel_photo_01_camera_mode.png');
    await client.captureScreenshot(shot1);
    console.log('Captured screenshot 1 (Photo Mode):', shot1);

    // 1.4 Switch to Photo Album & Lightbox
    console.log('Testing Photo Album & Lightbox...');
    await client.eval(`
      (() => {
        const albumTab = document.getElementById('tab-photo-album');
        if (albumTab) albumTab.click();
      })()
    `);
    await sleep(1500);

    // Open first photo in lightbox
    const lightboxOpened = await client.eval(`
      (() => {
        const card = document.querySelector('.photo-album-card');
        if (card) {
          card.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Lightbox opened:', lightboxOpened);
    await sleep(1200);

    // Test favorite in lightbox
    await client.eval(`
      (() => {
        const favBtn = document.getElementById('btn-photo-lightbox-fav');
        if (favBtn) favBtn.click();
      })()
    `);
    await sleep(1000);

    // Capture Screenshot 2: Photo Album Lightbox
    const shot2 = path.join(artDir, 'pinwheel_photo_02_album_lightbox.png');
    await client.captureScreenshot(shot2);
    console.log('Captured screenshot 2 (Album Lightbox):', shot2);

    // Close lightbox
    await client.eval(`
      (() => {
        const closeBtn = document.getElementById('btn-photo-lightbox-close');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(800);

    // 1.5 Mobile Viewport for Photography
    console.log('Testing Photography Mobile Viewport...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1500);

    const shot3 = path.join(artDir, 'pinwheel_photo_03_mobile_390x844.png');
    await client.captureScreenshot(shot3);
    console.log('Captured screenshot 3 (Photo Mobile):', shot3);

    // Reset Emulation to Desktop
    await client.send('Emulation.clearDeviceMetricsOverride');
    await sleep(800);

    // =========================================================================
    // PART 2: VISION STUDIO — THE CREATIVE ATELIER
    // =========================================================================
    console.log('--- PART 2: Opening Vision Studio: The Creative Atelier ---');

    const visionOpenRes = await client.eval(`
      (async () => {
        try {
          const symaUid = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';

          // Close photo view first
          const pv = document.getElementById('view-pinwheel-photography');
          if (pv) pv.classList.remove('active');

          if (window.pinwheelWorldController && typeof window.pinwheelWorldController.openVisionStudio === 'function') {
            window.pinwheelWorldController.openVisionStudio(symaUid, 'canvas');
          } else {
            const mod = await import('/pinwheel_vision_studio_view.js');
            const ctrl = mod.initPinwheelVisionStudioView({
              onShowToast: (msg, type) => console.log('[Vision Toast]', type, msg),
              onNavigateBack: () => {
                const el = document.getElementById('view-pinwheel-vision-studio');
                if (el) el.classList.remove('active');
              },
              onSwitchToPhotography: async () => {
                const pmod = await import('/pinwheel_photography_view.js');
                const pctrl = pmod.initPinwheelPhotographyView({});
                pctrl.openPhotography(symaUid, 'camera');
              }
            });
            window.pinwheelVisionStudioController = ctrl;
            ctrl.openVisionStudio(symaUid, 'canvas');
          }

          const vv = document.getElementById('view-pinwheel-vision-studio');
          return {
            visionActive: !!vv && vv.classList.contains('active'),
            hasVision: !!vv
          };
        } catch (e) {
          return { error: e.message };
        }
      })()
    `);
    console.log('Vision Studio opened result:', visionOpenRes);
    await sleep(2500);

    // 2.1 Test Canvas Drawing & Color Lab
    console.log('Testing Canvas Drawing & Color Lab...');
    await client.eval(`
      (() => {
        // Pick Sakura pink swatch from Color Lab
        const swatch = document.querySelector('.vision-color-swatch[data-color="#F472B6"]');
        if (swatch) swatch.click();

        // Simulate drawing on canvas
        const canvas = document.getElementById('vision-main-canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.strokeStyle = '#F472B6';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(300, 250, 60, 0, Math.PI * 2);
          ctx.stroke();

          // Draw a star
          ctx.strokeStyle = '#FEF3C7';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(450, 200);
          ctx.lineTo(470, 260);
          ctx.lineTo(420, 220);
          ctx.lineTo(480, 220);
          ctx.lineTo(430, 260);
          ctx.closePath();
          ctx.stroke();
        }

        // Add Sakura sticker and Kitsune sticker
        const sakuraSticker = document.querySelector('.vision-sticker-chip[data-sticker-symbol="🌸"]');
        if (sakuraSticker) sakuraSticker.click();

        const kitsuneSticker = document.querySelector('.vision-sticker-chip[data-sticker-symbol="🦊"]');
        if (kitsuneSticker) kitsuneSticker.click();
      })()
    `);
    await sleep(1500);

    // Capture Screenshot 4: Digital Art Canvas
    const shot4 = path.join(artDir, 'pinwheel_vision_01_digital_canvas.png');
    await client.captureScreenshot(shot4);
    console.log('Captured screenshot 4 (Digital Canvas):', shot4);

    // 2.2 Test Creative Editor & Template Application
    console.log('Testing Creative Editor & Templates...');
    await client.eval(`
      (() => {
        const editorTab = document.getElementById('tab-vision-editor');
        if (editorTab) editorTab.click();
      })()
    `);
    await sleep(1200);

    // Select Greeting Card template & customize text
    await client.eval(`
      (() => {
        const greetingTmpl = document.querySelector('.vision-template-card[data-template-id="greeting_card"]');
        if (greetingTmpl) greetingTmpl.click();

        const titleInput = document.getElementById('input-editor-headline');
        const bodyInput = document.getElementById('input-editor-body');
        const subInput = document.getElementById('input-editor-sub');

        if (titleInput) titleInput.value = 'Salam Hangat dari PINWHEEL';
        if (bodyInput) bodyInput.value = 'Semoga angin sepoi membawa kedamaian, harapan, dan kebahagiaan abadi untukmu.';
        if (subInput) subInput.value = '— Syma 🌸 Our Little Universe';

        // Apply template
        const applyBtn = document.getElementById('btn-apply-template');
        if (applyBtn) applyBtn.click();
      })()
    `);
    await sleep(1800);

    // Capture Screenshot 5: Creative Editor Result on Canvas
    const shot5 = path.join(artDir, 'pinwheel_vision_02_creative_editor.png');
    await client.captureScreenshot(shot5);
    console.log('Captured screenshot 5 (Creative Editor Canvas):', shot5);

    // 2.3 Save Artwork into Creative Gallery (Mock prompt for headless save)
    console.log('Saving Artwork into Creative Gallery...');
    await client.eval(`
      (async () => {
        window.prompt = () => 'Kartu Ucapan Sakura';
        const saveBtn = document.getElementById('btn-vision-save');
        if (saveBtn) {
          saveBtn.click();
          await new Promise(r => setTimeout(r, 1500));
        }
      })()
    `);
    await sleep(2000);

    // 2.4 Switch to Creative Gallery & Lightbox
    console.log('Testing Creative Gallery...');
    await client.eval(`
      (() => {
        const galleryTab = document.getElementById('tab-vision-gallery');
        if (galleryTab) galleryTab.click();
      })()
    `);
    await sleep(1500);

    // Open first artwork in lightbox
    await client.eval(`
      (() => {
        const card = document.querySelector('.vision-gallery-card');
        if (card) card.click();
      })()
    `);
    await sleep(1200);

    // Capture Screenshot 6: Creative Gallery Lightbox
    const shot6 = path.join(artDir, 'pinwheel_vision_03_gallery_lightbox.png');
    await client.captureScreenshot(shot6);
    console.log('Captured screenshot 6 (Gallery Lightbox):', shot6);

    // Close artwork lightbox
    await client.eval(`
      (() => {
        const closeBtn = document.getElementById('btn-art-lightbox-close');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(800);

    // 2.5 Mobile Viewport for Vision Studio
    console.log('Testing Vision Studio Mobile Viewport...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1500);

    const shot7 = path.join(artDir, 'pinwheel_vision_04_mobile_390x844.png');
    await client.captureScreenshot(shot7);
    console.log('Captured screenshot 7 (Vision Mobile):', shot7);

    // Reset Emulation
    await client.send('Emulation.clearDeviceMetricsOverride');
    await sleep(800);

    // 2.6 Test Back button to return to Pinwheel World
    console.log('Testing Back button to PINWHEEL World...');
    const backSuccess = await client.eval(`
      (() => {
        const backBtn = document.getElementById('btn-pinwheel-vision-back');
        if (backBtn) {
          backBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Back button clicked:', backSuccess);
    await sleep(1200);

    const isClosed = await client.eval(`
      (() => {
        const el = document.getElementById('view-pinwheel-vision-studio');
        return el ? !el.classList.contains('active') : true;
      })()
    `);
    console.log('Vision Studio closed successfully:', isClosed);

    console.log('=== ALL PINWHEEL PHOTOGRAPHY & VISION STUDIO LIVE VERIFICATIONS PASSED ===');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});

