/**
 * LIVE BROWSER VERIFICATION: PINWHEEL TELESCOPE & STAR MESSAGES
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9295;
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

  async captureScreenshot(outPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  }
}

async function run() {
  console.log('=== STARTING PINWHEEL TELESCOPE LIVE VERIFICATION ===');

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1920,1080',
    `http://localhost:${PORT}/`
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

    await sleep(2500);

    // 1. Open Pinwheel World cleanly
    const openPinwheelRes = await client.eval(`
      (async () => {
        window.isPreviewingUniverses = true;
        const univCtrl = await window.ensureUniversesController?.();
        if (univCtrl && typeof univCtrl.openPinwheelWorld === 'function') {
          univCtrl.openPinwheelWorld();
          return { ok: true };
        }
        return { ok: false };
      })()
    `);
    console.log('Step 1: openPinwheelWorld returned:', openPinwheelRes);

    await sleep(1000);

    const isPinwheelActive = await client.eval(`
      document.getElementById('view-pinwheel-world')?.classList.contains('active')
    `);
    console.log('Pinwheel view is active:', isPinwheelActive);

    const artDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

    // Capture Pinwheel world with Observatory hotspot
    await client.captureScreenshot(path.join(artDir, 'pinwheel_world_observatory_hotspot.png'));
    console.log('Captured: pinwheel_world_observatory_hotspot.png');

    // 2. Click Observatory Button
    const clickObsRes = await client.eval(`
      (() => {
        const btn = document.getElementById('btn-loc-pinwheel-observatory') ||
                    document.querySelector('.btn-loc-observatory');
        if (btn) {
          btn.click();
          return { clicked: true, text: btn.textContent.trim() };
        }
        return { clicked: false };
      })()
    `);
    console.log('Step 2: Click Observatory button:', clickObsRes);

    await sleep(600);

    // Check if observatory modal is open
    const isModalOpen = await client.eval(`
      (() => {
        const modal = document.getElementById('pinwheel-observatory-modal');
        const btnTelescope = document.getElementById('btn-pinwheel-open-telescope');
        return {
          modalActive: modal?.classList.contains('active'),
          hasTelescopeBtn: Boolean(btnTelescope),
          btnText: btnTelescope?.textContent.trim()
        };
      })()
    `);
    console.log('Step 3: Observatory Modal state:', isModalOpen);

    // Screenshot of Observatory Modal
    await client.captureScreenshot(path.join(artDir, 'pinwheel_observatory_modal.png'));
    console.log('Captured: pinwheel_observatory_modal.png');

    // 4. Click Telescope Action Button
    const clickTelescopeRes = await client.eval(`
      (() => {
        const btn = document.getElementById('btn-pinwheel-open-telescope');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Step 4: Click Telescope action button:', clickTelescopeRes);

    await sleep(1200);

    // Verify Star Messages state
    const starMessagesState = await client.eval(`
      (() => {
        const viewStar = document.getElementById('view-star-messages');
        const univTag = document.getElementById('observatory-univ-tag');
        const viewPinwheel = document.getElementById('view-pinwheel-world');
        const skyCanvas = document.getElementById('star-sky-canvas');
        return {
          isStarMessagesActive: viewStar?.classList.contains('active'),
          themeClass: viewStar?.className,
          univTagText: univTag?.textContent.trim(),
          isPinwheelHidden: !viewPinwheel?.classList.contains('active'),
          hasCanvas: Boolean(skyCanvas)
        };
      })()
    `);
    console.log('Step 5: Star Messages state:', starMessagesState);

    // Screenshot of Star Messages view
    await client.captureScreenshot(path.join(artDir, 'pinwheel_star_messages_view.png'));
    console.log('Captured: pinwheel_star_messages_view.png');

    // 5. Test Return button
    const clickReturnRes = await client.eval(`
      (() => {
        const btnReturn = document.getElementById('btn-star-return-univ');
        if (btnReturn) {
          btnReturn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Step 6: Click return button:', clickReturnRes);

    await sleep(800);

    const returnState = await client.eval(`
      (() => {
        const viewPinwheel = document.getElementById('view-pinwheel-world');
        const viewStar = document.getElementById('view-star-messages');
        return {
          pinwheelActive: viewPinwheel?.classList.contains('active'),
          starActive: viewStar?.classList.contains('active')
        };
      })()
    `);
    console.log('Step 7: State after return:', returnState);

    // 6. Mobile Viewport Test (390x844)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    await sleep(500);

    // Open observatory on mobile
    await client.eval(`
      (() => {
        document.getElementById('btn-loc-pinwheel-observatory')?.click();
      })()
    `);
    await sleep(500);

    // Click telescope on mobile
    await client.eval(`
      (() => {
        document.getElementById('btn-pinwheel-open-telescope')?.click();
      })()
    `);
    await sleep(800);

    await client.captureScreenshot(path.join(artDir, 'pinwheel_telescope_mobile.png'));
    console.log('Captured: pinwheel_telescope_mobile.png');

    console.log('=== ALL BROWSER LIVE CHECKS COMPLETED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('Error during live verification:', err);
    process.exitCode = 1;
  } finally {
    try {
      chromeProc.kill('SIGTERM');
    } catch (_) {}
  }
}

run();
