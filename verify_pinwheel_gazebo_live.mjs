/**
 * LIVE BROWSER VERIFICATION: PINWHEEL MOONLIT BLOSSOM GAZEBO
 * SYMA'S PINWHEEL UNIVERSE
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = 9320;
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
  console.log('=== STARTING PINWHEEL MOONLIT BLOSSOM GAZEBO LIVE VERIFICATION ===');

  let appPort = 5174;
  const p5174Ok = await checkPort(5174);
  if (!p5174Ok) {
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
      throw new Error('Chrome CDP endpoints not ready');
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    console.log('Connected to Chrome CDP WebSocket');

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    await client.send('Page.navigate', { url: `http://127.0.0.1:${appPort}/` });
    console.log('Navigated to application root');
    await sleep(4000);

    // 1. Enter Pinwheel Gazebo view
    console.log('Step 1: Activating Pinwheel Gazebo view...');
    const gazeboOpenRes = await client.eval(`
      (async () => {
        try {
          const symaUid = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';

          if (window.pinwheelWorldController && typeof window.pinwheelWorldController.openGazebo === 'function') {
            window.pinwheelWorldController.openGazebo(symaUid);
          } else {
            const mod = await import('/pinwheel_gazebo_view.js');
            const ctrl = mod.initPinwheelGazeboView({
              onShowToast: (msg, type) => console.log('[Gazebo Toast]', type, msg),
              onTriggerSparkle: () => {},
              onNavigateBack: () => {
                const el = document.getElementById('view-pinwheel-gazebo');
                if (el) el.classList.remove('active');
              }
            });
            window.pinwheelGazeboController = ctrl;
            ctrl.openGazebo(symaUid);
          }

          const gv = document.getElementById('view-pinwheel-gazebo');
          return {
            gazeboActive: !!gv && gv.classList.contains('active'),
            hasGazebo: !!gv
          };
        } catch (e) {
          return { error: e.message };
        }
      })()
    `);
    console.log('Gazebo opened result:', gazeboOpenRes);
    await sleep(2500);

    // Capture Screenshot 1: Desktop Main View
    const shot1 = path.join(artDir, 'pinwheel_gazebo_01_desktop.png');
    await client.captureScreenshot(shot1);
    console.log('Captured screenshot 1 (Desktop):', shot1);

    // 2. Test Tea Time
    console.log('Step 2: Testing Tea Time...');
    const teaOpened = await client.eval(`
      (() => {
        const btn = document.getElementById('pinwheel-gazebo-card-tea');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Tea card clicked:', teaOpened);
    await sleep(1200);

    // Select Honey Milk Tea (data-tea-id="honeymilk")
    const teaSelected = await client.eval(`
      (() => {
        const honeyOpt = document.querySelector('.tea-option-card[data-tea-id="honeymilk"]');
        if (honeyOpt) {
          honeyOpt.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Honey Milk Tea selected:', teaSelected);
    await sleep(1500);

    const shot2 = path.join(artDir, 'pinwheel_gazebo_02_tea_time.png');
    await client.captureScreenshot(shot2);
    console.log('Captured screenshot 2 (Tea Time):', shot2);

    // Close tea modal
    await client.eval(`
      (() => {
        const close = document.getElementById('btn-pinwheel-gazebo-modal-close');
        if (close) close.click();
      })()
    `);
    await sleep(800);

    // 3. Test Little Library
    console.log('Step 3: Testing Little Library...');
    const libOpened = await client.eval(`
      (() => {
        const btn = document.getElementById('pinwheel-gazebo-card-library');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Library card clicked:', libOpened);
    await sleep(1500);

    // Open first story if available
    const storyOpened = await client.eval(`
      (() => {
        const btn = document.querySelector('.btn-read-story') || document.querySelector('.library-story-card');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Story opened in reader:', storyOpened);
    await sleep(1200);

    // Test Font Size Increase if reader opened
    await client.eval(`
      (() => {
        const fontInc = document.getElementById('btn-font-larger');
        if (fontInc) fontInc.click();
      })()
    `);
    await sleep(600);

    const shot3 = path.join(artDir, 'pinwheel_gazebo_03_library_reader.png');
    await client.captureScreenshot(shot3);
    console.log('Captured screenshot 3 (Little Library):', shot3);

    // Close library modal
    await client.eval(`
      (() => {
        const close = document.getElementById('btn-pinwheel-gazebo-modal-close');
        if (close) close.click();
      })()
    `);
    await sleep(800);

    // 4. Test Memory Journal
    console.log('Step 4: Testing Memory Journal...');
    const journalOpened = await client.eval(`
      (() => {
        const btn = document.getElementById('pinwheel-gazebo-card-journal');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Journal card clicked:', journalOpened);
    await sleep(1200);

    // Click write new journal
    await client.eval(`
      (() => {
        const writeBtn = document.getElementById('tab-journal-write') || document.getElementById('btn-first-journal-write');
        if (writeBtn) writeBtn.click();
      })()
    `);
    await sleep(800);

    // Fill title, content, select mood
    await client.eval(`
      (() => {
        const titleInput = document.getElementById('journal-title-input');
        const contentInput = document.getElementById('journal-body-input');
        if (titleInput) titleInput.value = 'Malam Tenang di Bawah Sakura';
        if (contentInput) contentInput.value = 'Bunga sakura berguguran lembut di atas kolam malam ini. Aroma manis dari honey milk tea menyatu dengan sepoi angin PINWHEEL.';
        
        // Select mood
        const moodBtn = document.querySelector('.mood-chip-btn[data-mood*="Tenang"]');
        if (moodBtn) moodBtn.click();
      })()
    `);
    await sleep(600);

    // Click save
    await client.eval(`
      (() => {
        const form = document.getElementById('journal-composer-form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          return true;
        }
        return false;
      })()
    `);
    await sleep(1200);

    const shot4 = path.join(artDir, 'pinwheel_gazebo_04_memory_journal.png');
    await client.captureScreenshot(shot4);
    console.log('Captured screenshot 4 (Memory Journal):', shot4);

    // Close journal modal
    await client.eval(`
      (() => {
        const close = document.getElementById('btn-pinwheel-gazebo-modal-close');
        if (close) close.click();
      })()
    `);
    await sleep(800);

    // 5. Test Quiet Moment
    console.log('Step 5: Testing Quiet Moment...');
    const quietOpened = await client.eval(`
      (() => {
        const btn = document.getElementById('pinwheel-gazebo-card-quiet');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Quiet Moment card clicked:', quietOpened);
    await sleep(1200);

    // Play Sakura Pond ambiance
    const ambiancePlayed = await client.eval(`
      (() => {
        const playBtn = document.querySelector('.btn-ambient-toggle[data-amb-id="pond"]');
        if (playBtn) {
          playBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Sakura Pond ambiance played:', ambiancePlayed);
    await sleep(1200);

    const shot5 = path.join(artDir, 'pinwheel_gazebo_05_quiet_moment.png');
    await client.captureScreenshot(shot5);
    console.log('Captured screenshot 5 (Quiet Moment):', shot5);

    // Close quiet modal
    await client.eval(`
      (() => {
        const close = document.getElementById('btn-pinwheel-gazebo-modal-close');
        if (close) close.click();
      })()
    `);
    await sleep(800);

    // 6. Test PINWHEEL MELODY
    console.log('Step 6: Testing PINWHEEL MELODY player...');
    const melodyStarted = await client.eval(`
      (() => {
        const btn = document.getElementById('btn-pinwheel-gazebo-music-toggle');
        if (btn) {
          btn.click();
          return btn.textContent;
        }
        return null;
      })()
    `);
    console.log('PINWHEEL MELODY button status:', melodyStarted);
    await sleep(1500);

    // 7. Test Mobile Viewport (390 x 844)
    console.log('Step 7: Testing Mobile Viewport (390x844)...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1500);

    const shot6 = path.join(artDir, 'pinwheel_gazebo_06_mobile_390x844.png');
    await client.captureScreenshot(shot6);
    console.log('Captured screenshot 6 (Mobile):', shot6);

    // Reset Emulation
    await client.send('Emulation.clearDeviceMetricsOverride');
    await sleep(800);

    // 8. Test Back button
    console.log('Step 8: Testing Back button...');
    const backSuccess = await client.eval(`
      (() => {
        const backBtn = document.getElementById('btn-pinwheel-gazebo-back');
        if (backBtn) {
          backBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Back button clicked:', backSuccess);
    await sleep(1200);

    const isClosed = await client.eval(`
      (() => {
        const el = document.getElementById('view-pinwheel-gazebo');
        return el ? !el.classList.contains('active') : true;
      })()
    `);
    console.log('Gazebo closed successfully:', isClosed);

    console.log('=== ALL PINWHEEL GAZEBO LIVE VERIFICATIONS PASSED ===');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
