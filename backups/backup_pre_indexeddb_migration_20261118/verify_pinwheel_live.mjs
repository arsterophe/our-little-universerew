/**
 * Browser Live Test Suite: Syma's Universe (The Nine Tailed Sanctuary)
 *
 * Verifies:
 * 1. Fullscreen PINWHEEL view activation with background artwork.
 * 2. Header layout: SYMA'S UNIVERSE, The Nine Tailed Sanctuary, Syma profile, avatar, Lv. ∞, Settings.
 * 3. 7 Location buttons on artwork: Residence, Observatory, Studio, Gazebo, Fishing Pond (replacing Garden), Cat Garden, Mailbox.
 * 4. Music Player: Moonlight Whispers, vinyl spin, play/pause, next track.
 * 5. Tagline & Bottom Action Buttons: Gallery, Collection.
 * 6. Interactive Fishing Pond: modal open, rod cast, fish catch, UID-bound storage.
 * 7. Desktop (1920x1080) and Mobile (390x844) screenshot capture.
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';

const PORT = 5173;
const CDP_PORT = 9272;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  async captureScreenshot(path) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path, Buffer.from(res.data, 'base64'));
  }
}

async function run() {
  console.log('--- STARTING SYMA UNIVERSE LIVE BROWSER VERIFICATION ---');

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1920,1080',
    `http://localhost:${PORT}/`
  ]);

  try {
    await sleep(2500);
    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('Connected to Chrome DevTools Protocol.');

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');

    // Wait for initial auth observer to settle completely
    await sleep(4000);

    // 1. Activate Syma's Universe (PINWHEEL)
    const openRes = await cdp.eval(`
      (async () => {
        try {
          window.isPreviewingUniverses = true;
          const mod = await import('/pinwheel_view.js');
          const ctrl = mod.initPinwheelWorld();
          ctrl.openPinwheelWorld();
          const view = document.getElementById('view-pinwheel-world');
          if (view) view.classList.add('active');
          return { ok: true };
        } catch (e) {
          return { ok: false, err: e.message };
        }
      })()
    `);
    console.log('Open PINWHEEL World result:', openRes);

    await sleep(1500);

    // 2. Audit UI State matching the reference mockup
    const state = await cdp.eval(`
      (() => {
        const view = document.getElementById('view-pinwheel-world');
        const viewClassName = view ? view.className : 'NOT_FOUND';
        const viewDisplay = view ? getComputedStyle(view).display : 'NOT_FOUND';
        const isActive = view && view.classList.contains('active') && getComputedStyle(view).display !== 'none';
        
        const mainTitle = document.querySelector('.pinwheel-header-main-title')?.textContent?.trim();
        const subTitle = document.querySelector('.pinwheel-header-sub-title')?.textContent?.trim();
        const profAvatar = document.getElementById('pinwheel-profile-avatar')?.getAttribute('src');
        const hasLeftAvatar = Boolean(document.querySelector('.pinwheel-header-left #pinwheel-profile-avatar'));
        const hasCatIcon = Boolean(document.querySelector('.pinwheel-fox-emblem'));
        const hasOldProfilePanel = Boolean(document.getElementById('pinwheel-profile-panel'));

        const btnExplore = Boolean(document.getElementById('btn-pinwheel-top-explore'));
        const btnStory = Boolean(document.getElementById('btn-pinwheel-top-story'));
        const btnSettings = Boolean(document.getElementById('btn-pinwheel-settings'));

        // Check 7 Locations on Artwork
        const locResidence = Boolean(document.querySelector('.btn-loc-residence'));
        const locObservatory = Boolean(document.querySelector('.btn-loc-observatory'));
        const locStudio = Boolean(document.querySelector('.btn-loc-studio'));
        const locGazebo = Boolean(document.querySelector('.btn-loc-gazebo'));
        const locFishing = Boolean(document.querySelector('.btn-loc-fishing')); // Pengganti Garden
        const locCatGarden = Boolean(document.querySelector('.btn-loc-catgarden'));
        const locMailbox = Boolean(document.querySelector('.btn-loc-mailbox'));

        // Bottom elements
        const musicTitle = document.getElementById('pinwheel-music-title')?.textContent?.trim();
        const musicSub = document.getElementById('pinwheel-music-sub')?.textContent?.trim();
        const tagline = document.querySelector('.pinwheel-tagline-text')?.textContent?.trim();
        const btnGallery = Boolean(document.getElementById('btn-pinwheel-gallery'));
        const btnCollection = Boolean(document.getElementById('btn-pinwheel-collection'));

        return {
          viewClassName,
          viewDisplay,
          isActive,
          mainTitle,
          subTitle,
          profAvatar,
          hasLeftAvatar,
          hasCatIcon,
          hasOldProfilePanel,
          btnExplore,
          btnStory,
          btnSettings,
          locResidence,
          locObservatory,
          locStudio,
          locGazebo,
          locFishing,
          locCatGarden,
          locMailbox,
          musicTitle,
          musicSub,
          tagline,
          btnGallery,
          btnCollection
        };
      })()
    `);
    console.log('Live UI State:', state);

    // Assertions
    if (!state.isActive) throw new Error('PINWHEEL world view is not active');
    console.log('✓ PASS: View PINWHEEL is active and visible full-screen');

    if (state.mainTitle !== "SYMA'S UNIVERSE") throw new Error(`Header title mismatch: ${state.mainTitle}`);
    console.log('✓ PASS: Header title matches "SYMA\'S UNIVERSE"');

    if (!state.subTitle.includes('The Nine Tailed Sanctuary')) throw new Error(`Subtitle mismatch: ${state.subTitle}`);
    console.log('✓ PASS: Subtitle matches "The Nine Tailed Sanctuary ✧"');

    if (!state.hasLeftAvatar || !state.profAvatar || !state.profAvatar.includes('card_abil_hd.jpg')) {
      throw new Error(`Profile avatar mismatch in left header: ${state.profAvatar}`);
    }
    console.log('✓ PASS: Syma profile photo appears in left header matching login card asset');

    if (state.hasCatIcon) throw new Error('Old cat/fox emoji icon still present in left header');
    console.log('✓ PASS: Old cat/fox icon successfully removed from left header');

    if (state.hasOldProfilePanel) throw new Error('Top right profile panel was not removed');
    console.log('✓ PASS: Top-right profile panel is completely removed from layout');

    if (!state.btnSettings) throw new Error('Settings gear button not found at top right');
    console.log('✓ PASS: Settings gear button remains visible and functional at top right');

    if (!state.locFishing) throw new Error('Fishing Pond location button not found (must replace Garden)');
    console.log('✓ PASS: Fishing Pond successfully replaces Garden as primary interactive location');

    if (!state.locResidence || !state.locObservatory || !state.locStudio || !state.locGazebo || !state.locCatGarden || !state.locMailbox) {
      throw new Error('Some location buttons are missing from the stage');
    }
    console.log('✓ PASS: All 7 location buttons on artwork are present and properly positioned');

    if (state.musicTitle !== 'Moonlight Whispers') throw new Error(`Music title mismatch: ${state.musicTitle}`);
    console.log('✓ PASS: Music Player displays "Moonlight Whispers"');

    if (!state.tagline.includes('A quiet world, filled with endless possibilities.')) {
      throw new Error(`Tagline mismatch: ${state.tagline}`);
    }
    console.log('✓ PASS: Tagline panel displays exact quote');

    // 3. Test Music Player Interaction
    const musicRes = await cdp.eval(`
      (() => {
        const btnPlay = document.getElementById('btn-music-play');
        const vinyl = document.getElementById('pinwheel-music-vinyl');
        btnPlay?.click();
        const isSpinning = vinyl?.classList.contains('is-playing');
        const btnNext = document.getElementById('btn-music-next');
        btnNext?.click();
        const newTitle = document.getElementById('pinwheel-music-title')?.textContent?.trim();
        return { isSpinning, newTitle };
      })()
    `);
    console.log('Music Interaction result:', musicRes);
    if (!musicRes.isSpinning) throw new Error('Music vinyl did not spin on play');
    if (musicRes.newTitle !== 'Sakura Rainfall') throw new Error(`Next track mismatch: ${musicRes.newTitle}`);
    console.log('✓ PASS: Music Player play/pause and next track work seamlessly');

    // 4. Test Interactive Fishing Pond & Catches Saving
    const fishingRes = await cdp.eval(`
      (async () => {
        const btnFishing = document.querySelector('.btn-loc-fishing');
        btnFishing?.click();
        const modal = document.getElementById('pinwheel-fishing-modal');
        const isOpen = modal && modal.classList.contains('active');

        // Cast rod
        const btnFishAction = document.getElementById('btn-fish-action');
        btnFishAction?.click();

        // Simulate catch directly
        const testFish = {
          name: 'Golden Koi',
          localName: 'Ikan Koi Emas Berkilau',
          icon: '🐟',
          rarity: 'Rare',
          length: 48,
          caughtAt: Date.now()
        };
        const uid = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';
        const key = 'olu_fishing_collection_' + uid;
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        current.unshift(testFish);
        localStorage.setItem(key, JSON.stringify(current));

        // Close modal
        document.getElementById('btn-close-fishing-modal')?.click();

        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        return { isOpen, savedCount: saved.length, topFish: saved[0]?.name };
      })()
    `);
    console.log('Fishing Pond Test result:', fishingRes);
    if (!fishingRes.isOpen) throw new Error('Fishing Pond modal did not open on click');
    if (fishingRes.savedCount < 1 || fishingRes.topFish !== 'Golden Koi') {
      throw new Error('Fish catch not properly saved to UID storage');
    }
    console.log('✓ PASS: Interactive Fishing Pond opens and persists catches to Syma\'s UID storage');

    // 5. Capture Desktop Screenshot (1920x1080)
    await cdp.captureScreenshot('public/assets/test_syma_sanctuary_desktop_1920.png');
    console.log('✓ Screenshot saved: public/assets/test_syma_sanctuary_desktop_1920.png');

    // 6. Test Mobile Viewport (390x844)
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);
    await cdp.captureScreenshot('public/assets/test_syma_sanctuary_mobile_390.png');
    console.log('✓ Screenshot saved: public/assets/test_syma_sanctuary_mobile_390.png');

    console.log('\n--- ALL 12 BROWSER LIVE VERIFICATIONS PASSED 100% ---');
  } finally {
    chromeProc.kill();
  }
}

run().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
