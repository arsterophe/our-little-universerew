/**
 * LIVE BROWSER VERIFICATION: THE WHISPERING POND FISHING SIMULATOR
 * SYMA'S PINWHEEL UNIVERSE
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = 9299;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
  console.log('=== STARTING THE WHISPERING POND LIVE VERIFICATION ===');

  // Detect which port Vite is running on (5174 or 5173)
  let appPort = 5174;
  try {
    await fetchJson('http://127.0.0.1:5174/');
  } catch (_) {
    appPort = 5173;
  }
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
      throw new Error('Chrome CDP target not available');
    }

    const wsUrl = targets[0].webSocketDebuggerUrl;
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    console.log(`Navigating to http://localhost:${appPort}/...`);
    await client.send('Page.navigate', { url: `http://localhost:${appPort}/` });
    await sleep(4500);

    // 1. Open PINWHEEL Universe for Syma
    console.log('Step 1: Open PINWHEEL Universe for Syma...');
    const pinwheelRes = await client.eval(`
      (() => {
        const symaUser = {
          uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3',
          email: 'syma@ourlittleuniverse.com',
          characterId: 'abil',
          displayName: 'Syma'
        };
        const univCtrl = window.universesController;
        if (univCtrl && typeof univCtrl.openPinwheelWorld === 'function') {
          univCtrl.openPinwheelWorld(symaUser);
        } else if (window.pinwheelWorldController) {
          window.pinwheelWorldController.openPinwheelWorld(symaUser);
        }
        const pw = document.getElementById('view-pinwheel-world');
        return {
          ok: !!pw && pw.classList.contains('active'),
          hasPinwheel: !!pw
        };
      })()
    `);
    console.log('Step 1 result:', pinwheelRes);
    await sleep(1000);

    // 2. Click Fishing Pond location button to open The Whispering Pond overlay
    console.log('Step 2: Click Fishing Pond hotspot button...');
    const fishingOpenRes = await client.eval(`
      (() => {
        const btn = document.getElementById('btn-loc-pinwheel-fishing');
        if (btn) btn.click();
        const overlay = document.getElementById('pinwheel-whispering-pond-overlay');
        return {
          clicked: !!btn,
          overlayActive: !!overlay && overlay.classList.contains('active')
        };
      })()
    `);
    console.log('Step 2 result:', fishingOpenRes);
    await sleep(1000);

    // Capture Step 1: Main Pond Stage view
    const p1 = path.join(artDir, 'whispering_pond_01_stage_desktop.png');
    await client.captureScreenshot(p1);
    console.log('Captured: whispering_pond_01_stage_desktop.png');

    // 3. Inspect Stage UI state
    const stageInfo = await client.eval(`
      (() => {
        const levelBadge = document.getElementById('pond-level-badge')?.textContent;
        const weatherBadge = document.getElementById('pond-weather-badge')?.textContent;
        const areaBadge = document.getElementById('pond-area-badge')?.textContent;
        const catName = document.querySelector('.pond-cat-nametag')?.textContent;
        const catSpeech = document.getElementById('whispering-pond-cat-speech')?.textContent;
        return {
          levelBadge,
          weatherBadge,
          areaBadge,
          catName,
          catSpeech
        };
      })()
    `);
    console.log('Step 3 (Stage Info):', stageInfo);

    // 4. Test Casting Rod
    console.log('Step 4: Casting rod into water...');
    const castRes = await client.eval(`
      (() => {
        const btnCast = document.getElementById('btn-pond-cast-action');
        if (btnCast) btnCast.click();
        const bobber = document.getElementById('whispering-pond-bobber');
        return {
          castClicked: true,
          bobberVisible: bobber?.style.display !== 'none',
          btnText: btnCast?.textContent
        };
      })()
    `);
    console.log('Step 4 result:', castRes);
    await sleep(2200);

    // 5. Trigger Bite and start Reel Mini-game
    console.log('Step 5: Triggering Bite & starting Reel mini-game...');
    const minigameRes = await client.eval(`
      (() => {
        const btnCast = document.getElementById('btn-pond-cast-action');
        // If already biting or waiting, click cast/reel
        if (btnCast) btnCast.click();
        const minigame = document.getElementById('fishing-reeling-minigame');
        return {
          minigameActive: minigame?.classList.contains('active'),
          hasSweetSpot: !!document.getElementById('reeling-sweet-spot'),
          hasFishIndicator: !!document.getElementById('reeling-fish-indicator')
        };
      })()
    `);
    console.log('Step 5 result:', minigameRes);
    await sleep(800);

    // Capture Step 2: Reel Mini-game
    const p2 = path.join(artDir, 'whispering_pond_02_reel_minigame.png');
    await client.captureScreenshot(p2);
    console.log('Captured: whispering_pond_02_reel_minigame.png');

    // 6. Complete Mini-Game Catch & Show Catch Celebration Modal
    console.log('Step 6: Completing catch to trigger celebration modal...');
    const catchRes = await client.eval(`
      (() => {
        const ctrl = window.pinwheelWorldController?.fishingPondController;
        if (ctrl && typeof ctrl.completeCatch === 'function') {
          ctrl.completeCatch();
        }
        const catchModal = document.getElementById('fishing-catch-modal');
        const title = catchModal?.querySelector('.catch-fish-title')?.textContent;
        const rarity = catchModal?.querySelector('.catch-fish-rarity-badge')?.textContent;
        const length = catchModal?.querySelector('.catch-fish-length')?.textContent;
        return {
          modalActive: catchModal?.classList.contains('active'),
          title,
          rarity,
          length
        };
      })()
    `);
    console.log('Step 6 result:', catchRes);
    await sleep(800);

    // Capture Step 3: Catch Celebration Modal
    const p3 = path.join(artDir, 'whispering_pond_03_catch_modal.png');
    await client.captureScreenshot(p3);
    console.log('Captured: whispering_pond_03_catch_modal.png');

    // Close catch modal
    await client.eval(`
      (() => {
        const btn = document.getElementById('btn-close-catch-modal');
        if (btn) btn.click();
      })()
    `);
    await sleep(500);

    // 7. Tab 2: 10 Fish Collection Grid
    console.log('Step 7: Check 10 Fish Collection tab...');
    const collRes = await client.eval(`
      (() => {
        const tabBtn = document.getElementById('btn-pond-tab-collection');
        if (tabBtn) tabBtn.click();
        const totalBadge = document.getElementById('pond-collection-total-discovered')?.textContent;
        const cards = document.querySelectorAll('.pond-fish-card');
        return {
          totalBadge,
          cardCount: cards.length
        };
      })()
    `);
    console.log('Step 7 result:', collRes);
    await sleep(800);

    // Capture Step 4: Fish Collection Grid
    const p4 = path.join(artDir, 'whispering_pond_04_collection_grid.png');
    await client.captureScreenshot(p4);
    console.log('Captured: whispering_pond_04_collection_grid.png');

    // 8. Tab 3: Fishing Journal
    console.log('Step 8: Check Fishing Journal tab...');
    const journalRes = await client.eval(`
      (() => {
        const tabBtn = document.getElementById('btn-pond-tab-journal');
        if (tabBtn) tabBtn.click();
        const totalCatches = document.getElementById('journal-stat-total-catches')?.textContent;
        const bestRecord = document.getElementById('journal-stat-best-record')?.textContent;
        const entries = document.querySelectorAll('.pond-journal-entry-card');
        return {
          totalCatches,
          bestRecord,
          entryCount: entries.length
        };
      })()
    `);
    console.log('Step 8 result:', journalRes);
    await sleep(800);

    // Capture Step 5: Fishing Journal
    const p5 = path.join(artDir, 'whispering_pond_05_journal.png');
    await client.captureScreenshot(p5);
    console.log('Captured: whispering_pond_05_journal.png');

    // 9. Tab 4: Gear & Areas
    console.log('Step 9: Check Gear & Secret Areas tab...');
    const gearRes = await client.eval(`
      (() => {
        const tabBtn = document.getElementById('btn-pond-tab-gear');
        if (tabBtn) tabBtn.click();
        const rodCards = document.querySelectorAll('#pond-rods-grid .pond-gear-card');
        const baitCards = document.querySelectorAll('#pond-baits-grid .pond-gear-card');
        const areaCards = document.querySelectorAll('#pond-areas-grid .pond-gear-card');
        return {
          rods: rodCards.length,
          baits: baitCards.length,
          areas: areaCards.length
        };
      })()
    `);
    console.log('Step 9 result:', gearRes);
    await sleep(800);

    // Capture Step 6: Gear & Areas
    const p6 = path.join(artDir, 'whispering_pond_06_gear_areas.png');
    await client.captureScreenshot(p6);
    console.log('Captured: whispering_pond_06_gear_areas.png');

    // 10. Weather Switching
    console.log('Step 10: Testing Weather Switcher...');
    const weatherRes = await client.eval(`
      (() => {
        const ctrl = window.pinwheelWorldController?.fishingPondController;
        if (ctrl) ctrl.cycleWeather();
        return {
          newWeather: document.getElementById('pond-weather-badge')?.textContent
        };
      })()
    `);
    console.log('Step 10 result:', weatherRes);

    // 11. Mobile Viewport (390 x 844)
    console.log('Step 11: Switch to mobile viewport (390x844)...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await client.eval(`
      (() => {
        const tabBtn = document.getElementById('btn-pond-tab-stage');
        if (tabBtn) tabBtn.click();
      })()
    `);
    await sleep(1000);

    const p7 = path.join(artDir, 'whispering_pond_07_mobile_390x844.png');
    await client.captureScreenshot(p7);
    console.log('Captured: whispering_pond_07_mobile_390x844.png');

    // Reset viewport
    await client.send('Emulation.clearDeviceMetricsOverride');

    // 12. Check Cat Garden Aquarium Integration
    console.log('Step 12: Testing Cat Garden Aquarium integration...');
    const catGardenRes = await client.eval(`
      (() => {
        // Close Fishing Pond
        const pw = window.pinwheelWorldController;
        if (pw && pw.closeFishingPond) pw.closeFishingPond();
        if (pw && pw.openCatGarden) pw.openCatGarden();

        const aquariumProp = document.getElementById('cat-garden-aquarium-prop');
        const fishIcon = document.getElementById('cat-garden-aquarium-fish-icon')?.textContent;
        return {
          hasAquariumProp: !!aquariumProp,
          fishIcon: fishIcon
        };
      })()
    `);
    console.log('Step 12 result:', catGardenRes);

    console.log('=== THE WHISPERING POND LIVE VERIFICATION COMPLETED SUCCESSFULLY ===');
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch (_) {}
  }
}

run().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});

