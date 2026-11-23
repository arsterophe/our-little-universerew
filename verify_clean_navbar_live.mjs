import http from 'http';
import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/ALENDA/.gemini/antigravity/brain/9032e95e-6264-445e-8703-2e60383b3a62';
const tempProfile = path.join(os.tmpdir(), 'chrome-clean-nav-' + Date.now());
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9225;
const APP_URL = 'http://localhost:5173';

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  `--user-data-dir=${tempProfile}`,
  '--disable-gpu',
  '--no-first-run',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: CDP_PORT, path: urlPath }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
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
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WebSocket = (await import('ws')).default;
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', () => resolve());
      this.ws.on('error', reject);
      this.ws.on('message', data => {
        const msg = JSON.parse(data.toString());
        if (msg.id && this.callbacks.has(msg.id)) {
          const { res, rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { res: resolve, rej: reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  async captureScreenshot(filePath, clip = null) {
    const params = { format: 'jpeg', quality: 90 };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    const buf = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buf);
    console.log(`[SCREENSHOT] Saved: ${filePath}`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function getPages() {
  for (let attempt = 1; attempt <= 15; attempt++) {
    try {
      const targets = await getJson('/json/list');
      const page = targets.find(t => t.type === 'page');
      if (page) return page;
    } catch (e) {
      await sleep(600);
    }
    await sleep(600);
  }
  return null;
}

async function run() {
  console.log('=== STARTING LIVE CDP CLEAN NAVBAR VERIFICATION ===');
  const target = await getPages();
  if (!target) {
    console.error('Target page not found on port 9225');
    chrome.kill();
    process.exit(1);
  }

  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();
  console.log('Connected to Chrome DevTools Protocol');

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Navigate to application
  console.log(`Navigating to ${APP_URL}...`);
  await client.send('Page.navigate', { url: APP_URL });
  await sleep(2500);

  // 1. Verify all 8 universes: activate universe view, verify navbar does not have photobooth button, capture top bar screenshot
  const universeConfigs = [
    {
      name: 'Nyanya (KIDULT)',
      key: 'nyanya',
      viewId: 'view-kidult-world',
      exploreId: 'btn-kidult-return-univ',
      storyId: 'btn-kidult-story',
      pbId: 'btn-kidult-photobooth',
      screenshotName: 'clean_nav_01_nyanya_kidult.jpg'
    },
    {
      name: 'Lala (TO YOU)',
      key: 'lala',
      viewId: 'view-toyou-world',
      exploreId: 'btn-toyou-top-return',
      storyId: 'btn-toyou-story',
      pbId: 'btn-toyou-photobooth',
      screenshotName: 'clean_nav_02_lala_toyou.jpg'
    },
    {
      name: 'Lele (SHADOW)',
      key: 'lele',
      viewId: 'view-shadow-world',
      exploreId: 'btn-shadow-top-return',
      storyId: 'btn-shadow-story',
      pbId: 'btn-shadow-photobooth',
      screenshotName: 'clean_nav_03_lele_shadow.jpg'
    },
    {
      name: 'Syma (PINWHEEL)',
      key: 'abil',
      viewId: 'view-pinwheel-world',
      exploreId: 'btn-pinwheel-top-explore',
      storyId: 'btn-pinwheel-top-story',
      pbId: 'btn-pinwheel-top-photobooth',
      screenshotName: 'clean_nav_04_syma_pinwheel.jpg'
    },
    {
      name: 'Akhira (YAWN)',
      key: 'akhira',
      viewId: 'view-yawn-world',
      exploreId: 'btn-yawn-top-explore',
      storyId: 'btn-yawn-top-story',
      pbId: 'btn-yawn-top-photobooth',
      screenshotName: 'clean_nav_05_akhira_yawn.jpg'
    },
    {
      name: 'Ela (US AGAIN)',
      key: 'ela',
      viewId: 'view-usagain-world',
      exploreId: 'btn-usagain-nav-explore',
      storyId: 'btn-usagain-nav-story',
      pbId: 'btn-usagain-nav-photobooth',
      screenshotName: 'clean_nav_06_ela_usagain.jpg'
    },
    {
      name: 'Ruben (ASH)',
      key: 'ruben',
      viewId: 'view-ash-world',
      exploreId: 'btn-ash-top-explore',
      storyId: 'btn-ash-top-story',
      pbId: 'btn-ash-top-photobooth',
      screenshotName: 'clean_nav_07_ruben_ash.jpg'
    },
    {
      name: 'Royan (HOT)',
      key: 'royan',
      viewId: 'view-hot-world',
      exploreId: 'btn-hot-nav-universes',
      storyId: 'btn-hot-nav-stories',
      pbId: 'btn-hot-nav-photobooth',
      screenshotName: 'clean_nav_08_royan_hot.jpg'
    }
  ];

  for (const cfg of universeConfigs) {
    console.log(`\nTesting ${cfg.name}...`);
    const status = await client.evaluate(`
      (() => {
        // Show target universe view
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        const targetView = document.getElementById('${cfg.viewId}');
        if (targetView) {
          targetView.classList.add('active');
          targetView.setAttribute('aria-hidden', 'false');
        }

        const exploreBtn = document.getElementById('${cfg.exploreId}');
        const storyBtn = document.getElementById('${cfg.storyId}');
        const pbBtn = document.getElementById('${cfg.pbId}');

        return {
          viewFound: !!targetView,
          hasExplore: !!exploreBtn,
          hasStory: !!storyBtn,
          hasPhotoboothInNavbar: !!pbBtn
        };
      })()
    `);

    console.log('Result:', JSON.stringify(status));
    if (status.hasPhotoboothInNavbar) {
      throw new Error(`Photobooth button ${cfg.pbId} still exists in navbar of ${cfg.name}`);
    }
    if (!status.hasExplore || !status.hasStory) {
      throw new Error(`Explore or Story button missing in ${cfg.name}`);
    }

    await sleep(400);
    // Take focused top navbar screenshot
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, cfg.screenshotName), {
      x: 0,
      y: 0,
      width: 1440,
      height: 180,
      scale: 1
    });
  }

  // 2. Check main universal navbar Photobooth button
  const univCheck = await client.evaluate(`
    (() => {
      document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
      const univView = document.getElementById('view-private-universe');
      if (univView) univView.classList.add('active');

      const navPb = document.getElementById('nav-btn-photobooth');
      const dropPb = document.getElementById('btn-drop-photobooth');

      return {
        hasUniversalNavPhotobooth: !!navPb,
        hasDropdownPhotobooth: !!dropPb
      };
    })()
  `);
  console.log('\nUniversal navigation check:', JSON.stringify(univCheck));

  await client.captureScreenshot(path.join(ARTIFACTS_DIR, 'clean_nav_09_universal_topbar.jpg'), {
    x: 0,
    y: 0,
    width: 1440,
    height: 140,
    scale: 1
  });

  // 3. Mobile responsiveness check (390px)
  console.log('\nTesting mobile responsiveness (390px)...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(600);
  await client.captureScreenshot(path.join(ARTIFACTS_DIR, 'clean_nav_10_mobile_390.jpg'), {
    x: 0,
    y: 0,
    width: 390,
    height: 400,
    scale: 1
  });

  client.close();
  chrome.kill();
  console.log('\n=== LIVE CDP VERIFICATION COMPLETE (ALL PASSED) ===');
}

run().catch(err => {
  console.error('Fatal test error:', err);
  chrome.kill();
  process.exit(1);
});
