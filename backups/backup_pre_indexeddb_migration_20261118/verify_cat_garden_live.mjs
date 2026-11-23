/**
 * LIVE BROWSER VERIFICATION: CAT CARE SIMULATOR (SYMA'S PINWHEEL)
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9298;
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

  async eval(expression, retries = 4) {
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
  console.log('=== STARTING CAT CARE SIMULATOR LIVE VERIFICATION ===');

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

    const pageTarget = targets?.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    await client.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    // Wait for initial auth observer to settle completely
    await sleep(4500);

    // 1. Enter Pinwheel World cleanly as Syma using the singleton controller
    const openPinwheelRes = await client.eval(`
      (async () => {
        try {
          for (let i = 0; i < 30; i++) {
            if (typeof window.ensureUniversesController === 'function') break;
            await new Promise(r => setTimeout(r, 200));
          }
          window.isPreviewingUniverses = true;
          // Clear any old cat state for clean testing
          localStorage.removeItem('olu_catcare_v1_Euc0JLt3kWMveUEIjBwXHfOfvQD3');
          localStorage.removeItem('olu_catcare_v1_abil');

          const univCtrl = await window.ensureUniversesController();
          if (univCtrl) {
            univCtrl.openPinwheelWorld({ uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3' });
            const view = document.getElementById('view-pinwheel-world');
            if (view) view.classList.add('active');
            return { ok: true, hasPinwheel: Boolean(window.pinwheelWorldController) };
          }
          return { ok: false };
        } catch (e) {
          return { ok: false, err: e.message };
        }
      })()
    `);
    console.log('Step 1: openPinwheelWorld returned:', openPinwheelRes);

    await sleep(1000);

    // 2. Click Cat Garden hotspot button
    const clickCatGardenRes = await client.eval(`
      (() => {
        const btn = document.getElementById('btn-loc-pinwheel-catgarden') ||
                    document.querySelector('.btn-loc-catgarden');
        if (btn) {
          btn.click();
          return { clicked: true, text: btn.textContent.trim() };
        }
        return { clicked: false };
      })()
    `);
    console.log('Step 2: Click Cat Garden button:', clickCatGardenRes);

    await sleep(1000);

    // Verify Cat Garden Overlay is active
    const overlayState = await client.eval(`
      (() => {
        const overlay = document.getElementById('pinwheel-catgarden-overlay');
        const namingModal = document.getElementById('cat-naming-modal');
        const namingInput = document.getElementById('cat-naming-input');
        return {
          overlayActive: overlay?.classList.contains('active'),
          namingModalActive: namingModal?.classList.contains('active'),
          suggestedName: namingInput?.value
        };
      })()
    `);
    console.log('Step 3: Cat Garden overlay & Naming modal state:', overlayState);

    // Capture Screenshot of Naming Ceremony Modal
    await client.captureScreenshot(path.join(artDir, 'catcare_01_naming_ceremony.png'));
    console.log('Captured: catcare_01_naming_ceremony.png');

    // 4. Fill in custom name: "Mochi" and submit naming ceremony
    const submitNamingRes = await client.eval(`
      (() => {
        const input = document.getElementById('cat-naming-input');
        const btn = document.getElementById('btn-cat-confirm-naming');
        if (input && btn) {
          input.value = 'Mochi';
          btn.click();
          return { ok: true, name: input.value };
        }
        return { ok: false };
      })()
    `);
    console.log('Step 4: Syma names cat "Mochi":', submitNamingRes);

    await sleep(800);

    // 5. Verify Active Cat Garden Sanctuary Care Screen
    const careScreenState = await client.eval(`
      (() => {
        const activeName = document.getElementById('cat-garden-active-name')?.textContent;
        const stageBadge = document.getElementById('cat-garden-stage-badge')?.textContent;
        const expText = document.getElementById('cat-growth-progress-text')?.textContent;
        const hungerVal = document.getElementById('cat-need-hunger-val')?.textContent;
        const happinessVal = document.getElementById('cat-need-happiness-val')?.textContent;
        const speech = document.getElementById('cat-sanctuary-speech')?.textContent;

        return {
          activeName,
          stageBadge,
          expText,
          hungerVal,
          happinessVal,
          speech
        };
      })()
    `);
    console.log('Step 5: Active Care Screen with Mochi:', careScreenState);

    // Capture Screenshot of Primary Care Screen
    await client.captureScreenshot(path.join(artDir, 'catcare_02_care_simulator_desktop.png'));
    console.log('Captured: catcare_02_care_simulator_desktop.png');

    // 6. Perform Care Activities: FEED, DRINK, PLAY, BRUSH, PET
    const careActsRes = await client.eval(`
      (() => {
        const btnFeed = document.getElementById('btn-cat-act-feed');
        const btnPlay = document.getElementById('btn-cat-act-play');
        const btnBrush = document.getElementById('btn-cat-act-brush');
        const btnPet = document.getElementById('btn-cat-act-pet');

        if (btnFeed) btnFeed.click();
        return { feedClicked: Boolean(btnFeed) };
      })()
    `);
    console.log('Step 6a: Click FEED action:', careActsRes);
    await sleep(700);

    await client.eval(`document.getElementById('btn-cat-act-play')?.click()`);
    console.log('Step 6b: Click PLAY action');
    await sleep(700);

    await client.eval(`document.getElementById('btn-cat-act-brush')?.click()`);
    console.log('Step 6c: Click BRUSH action');
    await sleep(700);

    await client.eval(`document.getElementById('btn-cat-act-pet')?.click()`);
    console.log('Step 6d: Click PET action');
    await sleep(800);

    const postCareState = await client.eval(`
      (() => {
        const expText = document.getElementById('cat-growth-progress-text')?.textContent;
        const hungerVal = document.getElementById('cat-need-hunger-val')?.textContent;
        const happinessVal = document.getElementById('cat-need-happiness-val')?.textContent;
        const affectionVal = document.getElementById('cat-need-affection-val')?.textContent;

        return { expText, hungerVal, happinessVal, affectionVal };
      })()
    `);
    console.log('Step 6e: Post-care stats:', postCareState);

    // 7. Check Profile & Memory Album Tab
    await client.eval(`document.getElementById('cat-tab-btn-profile')?.click()`);
    await sleep(600);

    const profileState = await client.eval(`
      (() => {
        const title = document.getElementById('cat-prof-title')?.textContent;
        const breed = document.getElementById('cat-prof-breed')?.textContent;
        const memories = Array.from(document.querySelectorAll('.cat-memory-title')).map(el => el.textContent.trim());

        return { title, breed, memories };
      })()
    `);
    console.log('Step 7: Profile & Memory Album:', profileState);

    // Capture Screenshot of Profile & Memory Album
    await client.captureScreenshot(path.join(artDir, 'catcare_03_profile_memories.png'));
    console.log('Captured: catcare_03_profile_memories.png');

    // 8. Check 10 Cats Collection Tab (Slot 1 active, Slots 2-10 locked)
    await client.eval(`document.getElementById('cat-tab-btn-collection')?.click()`);
    await sleep(600);

    const collectionState = await client.eval(`
      (() => {
        const adultCount = document.getElementById('cat-collection-adult-count')?.textContent;
        const slots = Array.from(document.querySelectorAll('.cat-card-slot')).map((el, idx) => ({
          slotNum: idx + 1,
          name: el.querySelector('.cat-slot-name')?.textContent.trim(),
          status: el.querySelector('.cat-slot-status-badge')?.textContent.trim(),
          isLocked: el.classList.contains('locked'),
          isActive: el.classList.contains('active'),
          isCompleted: el.classList.contains('completed')
        }));

        return { adultCount, slotsCount: slots.length, slots: slots.slice(0, 3) };
      })()
    `);
    console.log('Step 8: 10 Cats Collection initial state:', JSON.stringify(collectionState, null, 2));

    // Capture Screenshot of 10 Cats Collection (Initial)
    await client.captureScreenshot(path.join(artDir, 'catcare_04_collection_slots.png'));
    console.log('Captured: catcare_04_collection_slots.png');

    // 9. Simulate Growth: Advance Mochi to ADULT CAT (450 EXP)
    console.log('Step 9: Simulating growth up to ADULT CAT (450 EXP)...');
    const advanceToAdultRes = await client.eval(`
      (() => {
        const ctrl = window.pinwheelWorldController?.catGardenController;
        if (ctrl) {
          const state = ctrl.getState();
          state.cats[0].growthExp = 435;
          state.cats[0].stage = 3;
          // One more action triggers Stage 4 promotion
          ctrl.performCareActivity('pet');
          return { ok: true, exp: state.cats[0].growthExp, stage: state.cats[0].stage };
        }
        return { ok: false };
      })()
    `);
    console.log('Step 9a: Advance to Adult result:', advanceToAdultRes);

    await sleep(1000);

    // Check Growth Up Modal
    const growthModalState = await client.eval(`
      (() => {
        const modal = document.getElementById('cat-growth-modal');
        const title = document.getElementById('cat-growth-title')?.textContent;
        const badge = document.getElementById('cat-growth-badge')?.textContent;
        const nextBanner = document.getElementById('cat-growth-next-banner');

        return {
          modalActive: modal?.classList.contains('active'),
          title,
          badge,
          hasAdoptNextBtn: Boolean(document.getElementById('btn-adopt-next-cat-now'))
        };
      })()
    `);
    console.log('Step 9b: Growth Up Graduation Modal:', growthModalState);

    // Capture Screenshot of Adult Graduation Modal
    await client.captureScreenshot(path.join(artDir, 'catcare_05_adult_graduation.png'));
    console.log('Captured: catcare_05_adult_graduation.png');

    // Close growth modal
    await client.eval(`document.getElementById('btn-close-growth-modal')?.click()`);
    await sleep(500);

    // 10. Verify Cat #2 is unlocked in Collection!
    await client.eval(`
      (() => {
        const ctrl = window.pinwheelWorldController?.catGardenController;
        if (ctrl) ctrl.switchTab('collection');
        else document.getElementById('cat-tab-btn-collection')?.click();
      })()
    `);
    await sleep(600);

    const postGradCollection = await client.eval(`
      (() => {
        const adultCount = document.getElementById('cat-collection-adult-count')?.textContent;
        const cat1Slot = document.querySelectorAll('.cat-card-slot')[0];
        const cat2Slot = document.querySelectorAll('.cat-card-slot')[1];
        const cat3Slot = document.querySelectorAll('.cat-card-slot')[2];

        return {
          adultCount,
          cat1Status: cat1Slot?.querySelector('.cat-slot-status-badge')?.textContent.trim(),
          cat1Completed: cat1Slot?.classList.contains('completed'),
          cat2Status: cat2Slot?.querySelector('.cat-slot-status-badge')?.textContent.trim(),
          cat2Unlocked: !cat2Slot?.classList.contains('locked'),
          cat3Locked: cat3Slot?.classList.contains('locked')
        };
      })()
    `);
    console.log('Step 10: Collection state after Cat #1 Adult:', postGradCollection);

    // 11. Test Mobile Viewport (390x844)
    await client.eval(`document.getElementById('cat-tab-btn-care')?.click()`);
    await sleep(400);

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(700);

    await client.captureScreenshot(path.join(artDir, 'catcare_06_mobile_390x844.png'));
    console.log('Captured: catcare_06_mobile_390x844.png');

    // Reset Viewport
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(400);

    // 12. Test Close Cat Garden and return to PINWHEEL World
    await client.eval(`document.getElementById('btn-close-catgarden-overlay')?.click()`);
    await sleep(600);

    const returnState = await client.eval(`
      (() => {
        const overlay = document.getElementById('pinwheel-catgarden-overlay');
        const viewPinwheel = document.getElementById('view-pinwheel-world');
        return {
          overlayActive: overlay?.classList.contains('active'),
          pinwheelActive: viewPinwheel?.classList.contains('active')
        };
      })()
    `);
    console.log('Step 12: Return to PINWHEEL state:', returnState);

    console.log('=== CAT CARE SIMULATOR VERIFICATION COMPLETE ===');
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch (_) {}
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
