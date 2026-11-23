/**
 * LIVE BROWSER VERIFICATION: TO YOU GAZEBO (LALA)
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = 9350;
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
    const res = await this.send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('=== STARTING TO YOU GAZEBO LIVE VERIFICATION ===');

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

    // Open TO YOU Gazebo
    console.log('Opening Gazebo Lala (TO YOU)...');
    const openRes = await client.eval(`
      (async () => {
        try {
          const lalaUid = 'EqByKA8FXoTEt0OmIsSDPfnxMDB3';
          const mod = await import('/toyou_gazebo_view.js');
          const ctrl = mod.initToyouGazeboView({
            onShowToast: (m) => console.log('[Toast]', m),
            onTriggerSparkle: () => {},
            onNavigateBack: () => {}
          });
          window.toyouGazeboController = ctrl;
          ctrl.openToyouGazebo(lalaUid);
          const gv = document.getElementById('view-toyou-gazebo');
          return {
            active: gv ? gv.classList.contains('active') : false,
            hasElement: !!gv
          };
        } catch (e) {
          return { error: e.message };
        }
      })()
    `);
    console.log('Open result:', openRes);
    await sleep(1500);

    // Screenshot 1: Main Gazebo View
    console.log('1. Capturing Main Gazebo View...');
    await client.captureScreenshot(path.join(artDir, 'toyou_gazebo_main_live.jpg'));

    // Open Activity 1: Tea Time
    console.log('2. Opening Tea Time Modal...');
    await client.eval(`
      (() => {
        const cardTea = document.getElementById('tgazebo-card-tea');
        if (cardTea) cardTea.click();
      })()
    `);
    await sleep(1000);
    console.log('Capturing Tea Time Modal...');
    await client.captureScreenshot(path.join(artDir, 'toyou_gazebo_tea_modal_live.jpg'));

    // Open Activity 2: Perpustakaan Kecil
    console.log('3. Opening Perpustakaan Kecil Modal...');
    await client.eval(`
      (() => {
        window.toyouGazeboController.openGazeboModal('library');
      })()
    `);
    await sleep(1000);
    console.log('Capturing Perpustakaan Kecil Modal...');
    await client.captureScreenshot(path.join(artDir, 'toyou_gazebo_library_modal_live.jpg'));

    // Open Activity 3: Jurnal Kenangan
    console.log('4. Opening Jurnal Kenangan Modal...');
    await client.eval(`
      (() => {
        window.toyouGazeboController.openGazeboModal('journal');
      })()
    `);
    await sleep(1000);
    console.log('Capturing Jurnal Kenangan Modal...');
    await client.captureScreenshot(path.join(artDir, 'toyou_gazebo_journal_modal_live.jpg'));

    // Open Activity 4: Quiet Moment
    console.log('5. Opening Quiet Moment Modal...');
    await client.eval(`
      (() => {
        window.toyouGazeboController.openGazeboModal('quiet');
      })()
    `);
    await sleep(1000);
    console.log('Capturing Quiet Moment Modal...');
    await client.captureScreenshot(path.join(artDir, 'toyou_gazebo_quiet_modal_live.jpg'));

    // Close Modal & Switch to Mobile View (390 x 844)
    console.log('6. Switching to Mobile View (390 x 844)...');
    await client.eval(`
      (() => {
        window.toyouGazeboController.closeGazeboModal();
      })()
    `);
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);
    console.log('Capturing Mobile View...');
    await client.captureScreenshot(path.join(artDir, 'toyou_gazebo_mobile_390_live.jpg'));

    console.log('🎉 ALL TO YOU GAZEBO LIVE SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    if (client) client.close();
    chromeProc.kill();
  }
}

run().catch((e) => {
  console.error('Live verification failed:', e);
  process.exit(1);
});
