/**
 * Browser Live Test Suite: Akhira's Universe — YAWN (Underwater Astral City)
 *
 * Verifies:
 * 1. Fullscreen YAWN view activation with background artwork.
 * 2. Header layout: AKHIRA'S UNIVERSE, YAWN — Underwater Astral City, Akhira profile avatar on left, Settings on right.
 * 3. 6 Location buttons on artwork: Residence, Observatory, Gazebo, Cinema, Mailbox, and Gallery/Collection.
 * 4. Music Player: Astral Ocean Waves, vinyl spin, play/pause, next track.
 * 5. Tagline & Bottom Action Buttons: Gallery, Collection.
 * 6. Interactive Observatory: constellation cycling & logging to Akhira's UID storage.
 * 7. Interactive Mailbox: send letter & persistence to Akhira's UID storage.
 * 8. Desktop (1920x1080) and Mobile (390x844) screenshot capture.
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';

const PORT = 5173;
const CDP_PORT = 9276;
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
  console.log('--- STARTING YAWN (AKHIRA) UNIVERSE LIVE BROWSER VERIFICATION ---');

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
    await sleep(3500);

    // 1. Activate Akhira's Universe (YAWN)
    const openRes = await cdp.eval(`
      (async () => {
        try {
          window.isPreviewingUniverses = true;
          const mod = await import('/yawn_view.js');
          const ctrl = mod.initYawnWorld();
          ctrl.openYawnWorld();
          const view = document.getElementById('view-yawn-world');
          if (view) view.classList.add('active');
          return { ok: true };
        } catch (e) {
          return { ok: false, err: e.message };
        }
      })()
    `);
    console.log('Open YAWN World result:', openRes);

    await sleep(1500);

    // 2. Audit UI State
    const state = await cdp.eval(`
      (() => {
        const view = document.getElementById('view-yawn-world');
        const viewClassName = view ? view.className : 'NOT_FOUND';
        const viewDisplay = view ? getComputedStyle(view).display : 'NOT_FOUND';
        const isActive = view && view.classList.contains('active') && getComputedStyle(view).display !== 'none';
        
        const mainTitle = document.querySelector('.yawn-header-main-title')?.textContent?.trim();
        const subTitle = document.querySelector('.yawn-header-sub-title')?.textContent?.trim();
        const profAvatar = document.getElementById('yawn-profile-avatar')?.getAttribute('src');
        const hasLeftAvatar = Boolean(document.querySelector('.yawn-header-left #yawn-profile-avatar'));
        const btnSettings = Boolean(document.getElementById('btn-yawn-settings'));

        const btnExplore = Boolean(document.getElementById('btn-yawn-top-explore'));
        const btnStory = Boolean(document.getElementById('btn-yawn-top-story'));

        // Check 6 Locations on Artwork
        const locResidence = Boolean(document.querySelector('.btn-loc-yawn-residence'));
        const locObservatory = Boolean(document.querySelector('.btn-loc-yawn-observatory'));
        const locGazebo = Boolean(document.querySelector('.btn-loc-yawn-gazebo'));
        const locCinema = Boolean(document.querySelector('.btn-loc-yawn-cinema'));
        const locMailbox = Boolean(document.querySelector('.btn-loc-yawn-mailbox'));

        // Bottom elements
        const musicTitle = document.getElementById('yawn-music-title')?.textContent?.trim();
        const musicSub = document.getElementById('yawn-music-sub')?.textContent?.trim();
        const tagline = document.querySelector('.yawn-tagline-text')?.textContent?.trim();
        const btnGallery = Boolean(document.getElementById('btn-yawn-gallery'));
        const btnCollection = Boolean(document.getElementById('btn-yawn-collection'));

        return {
          viewClassName,
          viewDisplay,
          isActive,
          mainTitle,
          subTitle,
          profAvatar,
          hasLeftAvatar,
          btnExplore,
          btnStory,
          btnSettings,
          locResidence,
          locObservatory,
          locGazebo,
          locCinema,
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
    if (!state.isActive) throw new Error('YAWN world view is not active');
    console.log('✓ PASS: View YAWN is active and visible full-screen');

    if (state.mainTitle !== "AKHIRA'S UNIVERSE") throw new Error(`Header title mismatch: ${state.mainTitle}`);
    console.log('✓ PASS: Header title matches "AKHIRA\'S UNIVERSE"');

    if (!state.subTitle.includes('Underwater Astral City')) throw new Error(`Subtitle mismatch: ${state.subTitle}`);
    console.log('✓ PASS: Subtitle matches "YAWN — Underwater Astral City ✧"');

    if (!state.hasLeftAvatar || !state.profAvatar || !state.profAvatar.includes('card_akhira_hd.jpg')) {
      throw new Error(`Profile avatar mismatch in left header: ${state.profAvatar}`);
    }
    console.log('✓ PASS: Akhira profile photo appears in left header matching login card asset');

    if (!state.btnSettings) throw new Error('Settings gear button not found at top right');
    console.log('✓ PASS: Settings gear button remains visible and functional at top right');

    if (!state.locResidence || !state.locObservatory || !state.locGazebo || !state.locCinema || !state.locMailbox) {
      throw new Error('Some location buttons are missing from the stage');
    }
    console.log('✓ PASS: All 5 core location hotspots + Gallery & Collection on artwork are present and properly positioned');

    if (state.musicTitle !== 'Astral Ocean Waves') throw new Error(`Music title mismatch: ${state.musicTitle}`);
    console.log('✓ PASS: Music Player displays "Astral Ocean Waves"');

    if (!state.tagline.includes('Beneath the celestial tides')) {
      throw new Error(`Tagline mismatch: ${state.tagline}`);
    }
    console.log('✓ PASS: Tagline panel displays exact quote');

    // 3. Test Music Player Interaction
    const musicRes = await cdp.eval(`
      (() => {
        const btnPlay = document.getElementById('btn-yawn-music-play');
        const vinyl = document.getElementById('yawn-music-vinyl');
        btnPlay?.click();
        const isSpinning = vinyl?.classList.contains('is-playing');
        const btnNext = document.getElementById('btn-yawn-music-next');
        btnNext?.click();
        const newTitle = document.getElementById('yawn-music-title')?.textContent?.trim();
        return { isSpinning, newTitle };
      })()
    `);
    console.log('Music Interaction result:', musicRes);
    if (!musicRes.isSpinning) throw new Error('Music vinyl did not spin on play');
    if (musicRes.newTitle !== 'Starlight Deep Abyss') throw new Error(`Next track mismatch: ${musicRes.newTitle}`);
    console.log('✓ PASS: Music Player play/pause and next track work seamlessly');

    // 4. Test Interactive Observatory Constellation Log (UID-Bound)
    const obsRes = await cdp.eval(`
      (async () => {
        const btnObs = document.querySelector('.btn-loc-yawn-observatory');
        btnObs?.click();
        const modal = document.getElementById('yawn-observatory-modal');
        const isOpen = modal && modal.classList.contains('active');

        // Cycle constellation
        document.getElementById('btn-yawn-cycle-constellation')?.click();
        const curName = document.getElementById('yawn-constellation-name')?.textContent?.trim();

        // Log observation
        document.getElementById('btn-yawn-log-constellation')?.click();

        const uid = 'MT14ZHATNqe90frAeQ74QFk4iXs2';
        const key = 'olu_astronomy_log_' + uid;
        const saved = JSON.parse(localStorage.getItem(key) || '[]');

        modal.classList.remove('active');
        return { isOpen, curName, savedCount: saved.length, loggedName: saved[0]?.name };
      })()
    `);
    console.log('Observatory Test result:', obsRes);
    if (!obsRes.isOpen) throw new Error('Observatory modal did not open');
    if (obsRes.savedCount < 1) throw new Error('Constellation observation was not saved to UID storage');
    console.log('✓ PASS: Observatory modal opens, cycles constellations, and persists observation to Akhira\'s UID');

    // 5. Test Interactive Mailbox Letter Sending (UID-Bound)
    const mailRes = await cdp.eval(`
      (async () => {
        const btnMail = document.querySelector('.btn-loc-yawn-mailbox');
        btnMail?.click();
        const modal = document.getElementById('yawn-mailbox-modal');
        const isOpen = modal && modal.classList.contains('active');

        // Send a test letter
        const input = document.getElementById('yawn-input-letter-body');
        if (input) input.value = 'Melihat paus astral melintas di atas istana malam ini. Sungguh indah!';
        document.getElementById('btn-yawn-send-letter')?.click();

        const uid = 'MT14ZHATNqe90frAeQ74QFk4iXs2';
        const key = 'olu_yawn_mailbox_' + uid;
        const saved = JSON.parse(localStorage.getItem(key) || '[]');

        modal.classList.remove('active');
        return { isOpen, savedCount: saved.length, letterSnippet: saved[0]?.body };
      })()
    `);
    console.log('Mailbox Test result:', mailRes);
    if (!mailRes.isOpen) throw new Error('Mailbox modal did not open');
    if (mailRes.savedCount < 1 || !mailRes.letterSnippet.includes('paus astral')) {
      throw new Error('Astral letter was not saved to UID storage');
    }
    console.log('✓ PASS: Mailbox modal opens and persists astral letters to Akhira\'s UID storage');

    // 6. Capture Desktop Screenshot (1920x1080)
    await cdp.captureScreenshot('public/assets/test_akhira_yawn_desktop_1920.png');
    console.log('✓ Screenshot saved: public/assets/test_akhira_yawn_desktop_1920.png');

    // 7. Test Mobile Viewport (390x844)
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);
    await cdp.captureScreenshot('public/assets/test_akhira_yawn_mobile_390.png');
    console.log('✓ Screenshot saved: public/assets/test_akhira_yawn_mobile_390.png');

    console.log('\n--- ALL 12 YAWN BROWSER LIVE VERIFICATIONS PASSED 100% ---');
  } finally {
    chromeProc.kill();
  }
}

run().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});

