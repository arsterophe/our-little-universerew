/**
 * LIVE BROWSER VERIFICATION: YAWN GAZEBO (AKHIRA ⚡)
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
    const res = await this.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${outPath} (${res.data.length} bytes base64)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log(`=== STARTING YAWN GAZEBO LIVE VERIFICATION (CDP PORT: ${CDP_PORT}) ===`);

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800',
    'about:blank'
  ]);

  let client = null;
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
    client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    console.log('Connected to Chrome CDP WebSocket');

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    await client.send('Page.navigate', { url: `http://127.0.0.1:5173/` });
    console.log('Navigated to application root');
    await sleep(3500);

    // Open YAWN World first via window.universesController
    console.log('Opening YAWN World and navigating to Gazebo...');
    const openRes = await client.eval(`
      (async () => {
        try {
          if (typeof window.ensureUniversesController === 'function') {
            await window.ensureUniversesController();
          }

          document.querySelectorAll('.view-section').forEach(el => {
            el.classList.remove('active');
            el.setAttribute('aria-hidden', 'true');
          });

          const univCtrl = window.universesController;
          if (univCtrl && typeof univCtrl.openYawnGazebo === 'function') {
            univCtrl.openYawnGazebo('akhira');
          } else {
            const mod = await import('/yawn_gazebo_view.js');
            const ctrl = mod.initYawnGazeboView({
              onShowToast: (m) => console.log('[Toast]', m),
              onTriggerSparkle: () => {},
              onNavigateBack: () => {}
            });
            window.yawnGazeboController = ctrl;
            ctrl.openYawnGazebo('akhira');
          }

          const gaze = document.getElementById('view-yawn-gazebo');
          return {
            success: true,
            gazeboActive: gaze ? gaze.classList.contains('active') : false,
            gazeboDisplay: gaze ? window.getComputedStyle(gaze).display : null
          };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    `);
    console.log('Open result:', openRes);
    await sleep(1500);

    // 1. Capture Main Gazebo Stage
    const mainShot = path.join(artDir, 'yawn_gazebo_main_live.jpg');
    await client.captureScreenshot(mainShot);

    // 2. Open & Capture Tea Time Modal
    console.log('Opening Tea Time modal...');
    await client.eval(`
      (() => {
        const cardTea = document.getElementById('ygazebo-card-tea');
        if (cardTea) cardTea.click();
        else if (window.yawnGazeboController) window.yawnGazeboController.openGazeboModal('tea');
      })()
    `);
    await sleep(1200);
    const teaShot = path.join(artDir, 'yawn_gazebo_tea_modal_live.jpg');
    await client.captureScreenshot(teaShot);

    // 3. Open & Capture Cinema Modal
    console.log('Opening Astral Cinema modal...');
    await client.eval(`
      (() => {
        const cardCinema = document.getElementById('ygazebo-card-cinema');
        if (cardCinema) cardCinema.click();
        else if (window.yawnGazeboController) window.yawnGazeboController.openGazeboModal('cinema');
      })()
    `);
    await sleep(1200);
    const cinemaShot = path.join(artDir, 'yawn_gazebo_cinema_modal_live.jpg');
    await client.captureScreenshot(cinemaShot);

    // 4. Open & Capture Journal Modal
    console.log('Opening Jurnal Kenangan modal...');
    await client.eval(`
      (() => {
        const cardJournal = document.getElementById('ygazebo-card-journal');
        if (cardJournal) cardJournal.click();
        else if (window.yawnGazeboController) window.yawnGazeboController.openGazeboModal('journal');
      })()
    `);
    await sleep(1200);
    const journalShot = path.join(artDir, 'yawn_gazebo_journal_modal_live.jpg');
    await client.captureScreenshot(journalShot);

    // 5. Open & Capture Quiet Moment Modal
    console.log('Opening Quiet Moment modal...');
    await client.eval(`
      (() => {
        const cardQuiet = document.getElementById('ygazebo-card-quiet');
        if (cardQuiet) cardQuiet.click();
        else if (window.yawnGazeboController) window.yawnGazeboController.openGazeboModal('quiet');
      })()
    `);
    await sleep(1200);
    const quietShot = path.join(artDir, 'yawn_gazebo_quiet_modal_live.jpg');
    await client.captureScreenshot(quietShot);

    // Close modal before mobile test
    await client.eval(`
      (() => {
        const btnClose = document.getElementById('btn-ygazebo-modal-close');
        if (btnClose) btnClose.click();
        else if (window.yawnGazeboController) window.yawnGazeboController.closeGazeboModal();
      })()
    `);
    await sleep(600);

    // 6. Switch to Mobile Viewport (390 x 844) & Capture
    console.log('Setting mobile viewport (390x844)...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1200);
    const mobileShot = path.join(artDir, 'yawn_gazebo_mobile_390_live.jpg');
    await client.captureScreenshot(mobileShot);

    console.log('🎉 ALL YAWN GAZEBO LIVE SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    if (client) client.close();
    chromeProc.kill();
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
