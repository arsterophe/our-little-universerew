/**
 * LIVE BROWSER VERIFICATION: YAWN OBSERVATORY & STAR MESSAGES (AKHIRA ⚡)
 * Uses Chrome DevTools Protocol (CDP) to capture live screenshots
 * =============================================================================
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = Math.floor(15000 + Math.random() * 15000);
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
        const msg = JSON.parse(raw);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve: res, reject: rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
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
    return res.result?.value;
  }

  async captureScreenshot(outputPath) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
    console.log(`[CDP] Saved screenshot: ${outputPath}`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const tmpProfile = path.resolve(`./scratch/cdp_profile_yobservatory_${Date.now()}`);
  fs.mkdirSync(tmpProfile, { recursive: true });

  console.log(`[CDP] Launching Chrome on port ${CDP_PORT}...`);
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpProfile}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,720',
    'about:blank'
  ]);

  let cdp = null;
  try {
    let version = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        version = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
        if (version?.webSocketDebuggerUrl) break;
      } catch (e) {}
    }

    if (!version) throw new Error('Could not connect to Chrome CDP.');

    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');

    console.log('[CDP] Navigating to http://localhost:5173...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    // 1. Open YAWN World
    console.log('[CDP] Activating YAWN World...');
    await cdp.eval(`
      (() => {
        document.querySelectorAll('.view-section').forEach(el => {
          el.classList.remove('active');
          el.style.display = 'none';
          el.setAttribute('aria-hidden', 'true');
        });
        document.getElementById('view-selection')?.classList.remove('active');

        if (window.universesController?.openYawnWorld) {
          window.universesController.openYawnWorld();
        } else {
          const v = document.getElementById('view-yawn-world');
          if (v) {
            v.classList.add('active');
            v.style.display = 'block';
            v.setAttribute('aria-hidden', 'false');
          }
        }
      })()
    `);
    await sleep(1500);

    // Screenshot 1: YAWN World stage with Observatory hotspot
    await cdp.captureScreenshot(path.join(artDir, 'yawn_observatory_hotspot_live.jpg'));

    // 2. Open Observatory Modal
    console.log('[CDP] Opening Observatory Modal...');
    await cdp.eval(`
      (() => {
        document.getElementById('btn-loc-yawn-observatory')?.click();
      })()
    `);
    await sleep(1000);
    await cdp.captureScreenshot(path.join(artDir, 'yawn_observatory_modal_live.jpg'));

    // 3. Launch Star Messages from Observatory Modal
    console.log('[CDP] Launching Star Messages via #btn-yawn-open-starmessages...');
    await cdp.eval(`
      (() => {
        document.getElementById('btn-yawn-open-starmessages')?.click();
      })()
    `);
    await sleep(1500);

    // Screenshot 3: Star Messages Celestial Sky (Explore tab) in theme-yawn
    await cdp.captureScreenshot(path.join(artDir, 'yawn_starmessages_explore_live.jpg'));

    // 4. Switch to Inbox Tab
    console.log('[CDP] Switching to Star Messages Inbox tab...');
    await cdp.eval(`
      (() => {
        document.getElementById('tab-btn-inbox')?.click();
      })()
    `);
    await sleep(1000);
    await cdp.captureScreenshot(path.join(artDir, 'yawn_starmessages_inbox_live.jpg'));

    // 5. Switch to Compose Tab
    console.log('[CDP] Switching to Star Messages Compose tab...');
    await cdp.eval(`
      (() => {
        document.getElementById('tab-btn-compose')?.click();
      })()
    `);
    await sleep(1000);
    await cdp.captureScreenshot(path.join(artDir, 'yawn_starmessages_compose_live.jpg'));

    // 6. Mobile Viewport (390x844)
    console.log('[CDP] Capturing Mobile Viewport (390x844)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);
    await cdp.captureScreenshot(path.join(artDir, 'yawn_observatory_mobile_390_live.jpg'));

    console.log('[CDP] All 6 Observatory live screenshots captured successfully!');
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill('SIGTERM');
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch (e) {}
  }
}

run().catch((err) => {
  console.error('[CDP] Error in verification script:', err);
  process.exit(1);
});
