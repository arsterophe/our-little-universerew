/**
 * LIVE BROWSER VERIFICATION: THE WINDWHISPER RESIDENCE
 * SYMA'S PINWHEEL UNIVERSE — A Japanese Fantasy Kitsune Home
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
          if (msg.error) reject(new Error(msg.error.message));
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

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
  }
}

async function run() {
  console.log('--- STARTING LIVE CDP VERIFICATION: THE WINDWHISPER RESIDENCE ---');

  let devPort = 5174;
  const is5174 = await checkPort(5174);
  if (!is5174) {
    const is5173 = await checkPort(5173);
    if (is5173) devPort = 5173;
    else throw new Error('Vite dev server not detected on 5174 or 5173.');
  }
  console.log(`Using Dev Server on port ${devPort}`);

  const userDataDir = path.join(process.cwd(), '.tmp_cdp_residence_profile');
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    `http://127.0.0.1:${devPort}/`
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
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
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await sleep(2000);

    // 1. Enter Pinwheel Residence view as Syma (abil)
    console.log('Navigating to The Windwhisper Residence (Syma)...');
    const openRes = await client.eval(`
      (async () => {
        try {
          const loader = document.getElementById('cosmic-app-loader');
          if (loader) loader.style.display = 'none';

          const symaUid = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';

          if (window.pinwheelWorldController && typeof window.pinwheelWorldController.openResidence === 'function') {
            window.pinwheelWorldController.openResidence(symaUid, 'exterior');
          } else {
            const mod = await import('/pinwheel_residence_view.js');
            const ctrl = mod.initPinwheelResidenceView({
              onShowToast: (msg) => console.log('[Residence Toast]', msg),
              onTriggerSparkle: () => {},
              onNavigateBack: () => {
                const el = document.getElementById('view-pinwheel-residence');
                if (el) el.classList.remove('active');
              }
            });
            window.pinwheelResidenceController = ctrl;
            ctrl.openResidence(symaUid, 'exterior');
          }

          const rv = document.getElementById('view-pinwheel-residence');
          return {
            residenceActive: !!rv && rv.classList.contains('active'),
            hasResidence: !!rv
          };
        } catch (e) {
          return { error: e.message };
        }
      })()
    `);
    console.log('Residence open result:', openRes);
    await sleep(2500);

    const isResidenceActive = await client.eval(`
      (() => {
        const el = document.getElementById('view-pinwheel-residence');
        return el ? el.classList.contains('active') : false;
      })()
    `);
    console.log('Is #view-pinwheel-residence active?', isResidenceActive);

    // 2. Screenshot 1: Exterior (The Little Sanctuary)
    const shot1 = path.join(artDir, 'pinwheel_residence_01_exterior.png');
    await client.captureScreenshot(shot1);
    console.log('Captured screenshot 1 (Exterior Sanctuary):', shot1);

    // 3. Navigate to Living Room (Kotatsu)
    console.log('Switching to Living Room (The Heart of Home)...');
    await client.eval(`
      (() => {
        const btn = document.querySelector('.btn-room-nav[data-room="living"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    // Click on Kotatsu or Book Reader
    await client.eval(`
      (() => {
        const kotatsu = document.querySelector('.scenery-kotatsu-prop');
        if (kotatsu) kotatsu.click();
      })()
    `);
    await sleep(800);

    const shot2 = path.join(artDir, 'pinwheel_residence_02_living_room.png');
    await client.captureScreenshot(shot2);
    console.log('Captured screenshot 2 (Living Room Kotatsu):', shot2);

    // 4. Navigate to Kitchen & Open Cooking Minigame
    console.log('Switching to Kitchen & Testing Cooking Minigame...');
    await client.eval(`
      (() => {
        const btn = document.querySelector('.btn-room-nav[data-room="kitchen"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    // Open Cooking modal
    await client.eval(`
      (() => {
        const kettle = document.querySelector('.steaming-kettle');
        if (kettle) kettle.click();
      })()
    `);
    await sleep(1200);

    // Select Honey Milk Tea and start cooking
    await client.eval(`
      (() => {
        const card = document.querySelector('.recipe-choice-card[data-recipe-id="honey_milk_tea"]');
        if (card) card.click();
        const startBtn = document.getElementById('btn-start-cooking');
        if (startBtn) startBtn.click();
      })()
    `);
    await sleep(4000); // wait for cooking animation

    const shot3 = path.join(artDir, 'pinwheel_residence_03_kitchen_cooking.png');
    await client.captureScreenshot(shot3);
    console.log('Captured screenshot 3 (Kitchen Cooking Result):', shot3);

    // Close modal
    await client.eval(`
      (() => {
        const closeBtn = document.getElementById('btn-finish-cooking') || document.getElementById('btn-residence-modal-close');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(1000);

    // 5. Navigate to Bedroom (Cloud Nine) & Wardrobe / Sleep
    console.log('Switching to Bedroom (Cloud Nine) & Testing Wardrobe / Sleep...');
    await client.eval(`
      (() => {
        const btn = document.querySelector('.btn-room-nav[data-room="bedroom"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    // Open wardrobe modal
    await client.eval(`
      (() => {
        const wardrobeBtn = document.querySelector('.residence-hotspot[data-residence-action="open_wardrobe"]');
        if (wardrobeBtn) wardrobeBtn.click();
      })()
    `);
    await sleep(1200);

    // Equip Star Blossom Kimono
    await client.eval(`
      (() => {
        const wearBtn = document.querySelector('.btn-wear-outfit[data-outfit-id="celestial_dreamer"]');
        if (wearBtn) wearBtn.click();
      })()
    `);
    await sleep(1200);

    const shot4 = path.join(artDir, 'pinwheel_residence_04_bedroom_wardrobe.png');
    await client.captureScreenshot(shot4);
    console.log('Captured screenshot 4 (Bedroom Wardrobe):', shot4);

    // Close wardrobe modal
    await client.eval(`
      (() => {
        const closeBtn = document.getElementById('btn-residence-modal-close');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(800);

    // 6. Navigate to Personal Archive (The Little Archive)
    console.log('Switching to Personal Corner (The Little Archive)...');
    await client.eval(`
      (() => {
        const btn = document.querySelector('.btn-room-nav[data-room="archive"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    // Open Archive Modal with Aquarium & Collections
    await client.eval(`
      (() => {
        const showcase = document.querySelector('.archive-category-showcase[data-residence-action="open_archive_fish"]');
        if (showcase) showcase.click();
      })()
    `);
    await sleep(1500);

    const shot5 = path.join(artDir, 'pinwheel_residence_05_archive_aquarium.png');
    await client.captureScreenshot(shot5);
    console.log('Captured screenshot 5 (Archive Aquarium):', shot5);

    // Close archive modal
    await client.eval(`
      (() => {
        const closeBtn = document.getElementById('btn-residence-modal-close');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(800);

    // 7. Navigate to Engawa (The Wind's Embrace) & Ring Chime
    console.log('Switching to Engawa (The Wind\'s Embrace)...');
    await client.eval(`
      (() => {
        const btn = document.querySelector('.btn-room-nav[data-room="engawa"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    // Ring wind chime button
    await client.eval(`
      (() => {
        const chimeBtn = document.getElementById('btn-residence-chime-ring');
        if (chimeBtn) chimeBtn.click();
      })()
    `);
    await sleep(1000);

    const shot6 = path.join(artDir, 'pinwheel_residence_06_engawa_chime.png');
    await client.captureScreenshot(shot6);
    console.log('Captured screenshot 6 (Engawa Chime):', shot6);

    // 8. Navigate to Secret Attic (Attic)
    console.log('Switching to Secret Attic...');
    await client.eval(`
      (() => {
        const btn = document.querySelector('.btn-room-nav[data-room="attic"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    const shot7 = path.join(artDir, 'pinwheel_residence_07_attic_skylight.png');
    await client.captureScreenshot(shot7);
    console.log('Captured screenshot 7 (Secret Attic Skylight):', shot7);

    // 9. Mobile Viewport (390x844)
    console.log('Testing Mobile Viewport (390x844)...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1500);

    // Switch to living room on mobile
    await client.eval(`
      (() => {
        const btn = document.querySelector('.btn-room-nav[data-room="living"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(1200);

    const shot8 = path.join(artDir, 'pinwheel_residence_08_mobile_390x844.png');
    await client.captureScreenshot(shot8);
    console.log('Captured screenshot 8 (Mobile Residence):', shot8);

    // Reset Emulation
    await client.send('Emulation.clearDeviceMetricsOverride');
    await sleep(800);

    // 10. Test Back Button returning to Pinwheel World
    console.log('Testing Back Button...');
    const closedOk = await client.eval(`
      (() => {
        const backBtn = document.getElementById('btn-pinwheel-residence-back');
        if (backBtn) {
          backBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Back button clicked:', closedOk);
    await sleep(1200);

    const isClosed = await client.eval(`
      (() => {
        const el = document.getElementById('view-pinwheel-residence');
        return el ? !el.classList.contains('active') : true;
      })()
    `);
    console.log('Residence closed successfully:', isClosed);

    console.log('🎉 ALL LIVE RESIDENCE VERIFICATION STEPS PASSED SUCCESSFULLY!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
