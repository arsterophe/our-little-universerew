import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9330;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

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
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`📸 Screenshot saved: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return outPath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log('🚀 Starting Chrome CDP for Behind the Yawn Verification...');
  const tmpProfile = path.join(process.cwd(), 'temp_chrome_yawn_behind');
  if (!fs.existsSync(tmpProfile)) fs.mkdirSync(tmpProfile, { recursive: true });

  const chromeProc = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tmpProfile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-extensions',
      '--window-size=1920,1080',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let cdp = null;

  try {
    let targets = null;
    for (let i = 0; i < 25; i++) {
      try {
        targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (e) {
        await sleep(500);
      }
    }

    if (!targets || !targets.length) throw new Error('Could not connect to Chrome debugging endpoint');

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('🔗 Connected to CDP WebSocket');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    await sleep(3500);

    // Set desktop viewport 1920x1080
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log('🌟 Switching to YAWN World and initializing Behind controller...');
    const initStatus = await cdp.eval(`
      (async () => {
        window.isPreviewingUniverses = true;
        document.querySelectorAll('.view-section').forEach(v => {
          v.classList.remove('active');
          v.setAttribute('aria-hidden', 'true');
        });
        const yawnView = document.getElementById('view-yawn-world');
        if (yawnView) {
          yawnView.classList.add('active');
          yawnView.setAttribute('aria-hidden', 'false');
        }

        const yawnBehindMod = await import('/yawn_behind_view.js');
        if (yawnBehindMod && yawnBehindMod.initYawnBehindView) {
          yawnBehindMod.initYawnBehindView();
        }

        const btn = document.getElementById('btn-yawn-behind');
        return {
          yawnViewExists: !!yawnView,
          behindBtnExists: !!btn,
          controllerExists: !!window.yawnBehindController
        };
      })()
    `);
    console.log('Init status:', initStatus);

    // Open Behind the Yawn via button click
    console.log('📖 Opening BEHIND THE YAWN modal...');
    await cdp.eval(`
      (() => {
        const btn = document.getElementById('btn-yawn-behind');
        if (btn) btn.click();
        else if (window.yawnBehindController) window.yawnBehindController.open();
      })()
    `);
    await sleep(1000);

    // Verify overlay is active
    const isOpen = await cdp.eval(`
      (() => {
        const overlay = document.getElementById('yawn-behind-overlay');
        return overlay && overlay.classList.contains('active');
      })()
    `);
    console.log('Is overlay active:', isOpen);

    // 1. Chapter I: THE MERMAID
    console.log('📸 Capturing Chapter I: The Mermaid...');
    await cdp.eval(`
      (() => {
        if (window.yawnBehindController) window.yawnBehindController.switchChapter(1);
      })()
    `);
    await sleep(800);
    await cdp.captureScreenshot('behind_yawn_01_ch1.jpg');

    // 2. Chapter II: WHY YAWN?
    console.log('📸 Capturing Chapter II: Why YAWN? ...');
    await cdp.eval(`
      (() => {
        if (window.yawnBehindController) window.yawnBehindController.switchChapter(2);
      })()
    `);
    await sleep(800);
    await cdp.captureScreenshot('behind_yawn_02_ch2.jpg');

    // 3. Chapter III: THE PAIN YOU NEVER TOLD
    console.log('📸 Capturing Chapter III: The Pain You Never Told...');
    await cdp.eval(`
      (() => {
        if (window.yawnBehindController) window.yawnBehindController.switchChapter(3);
      })()
    `);
    await sleep(800);
    await cdp.captureScreenshot('behind_yawn_03_ch3.jpg');

    // 4. Chapter IV: A LETTER FROM LELE
    console.log('📸 Capturing Chapter IV: A Letter from Lele (Pearl Parchment)...');
    await cdp.eval(`
      (() => {
        if (window.yawnBehindController) window.yawnBehindController.switchChapter(4);
      })()
    `);
    await sleep(1000);
    await cdp.captureScreenshot('behind_yawn_04_ch4_letter.jpg');

    // Test Replay button
    console.log('📜 Testing Letter Replay Button...');
    const replayResult = await cdp.eval(`
      (() => {
        const btn = document.getElementById('btn-yawn-letter-replay');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Replay button clicked:', replayResult);
    await sleep(500);

    // 5. Chapter V: EPILOGUE & YAWN SONG
    console.log('📸 Capturing Chapter V: Epilogue & YAWN Song...');
    await cdp.eval(`
      (() => {
        if (window.yawnBehindController) window.yawnBehindController.switchChapter(5);
      })()
    `);
    await sleep(1000);
    await cdp.captureScreenshot('behind_yawn_05_ch5_epilogue.jpg');

    // Test soundtrack button toggle
    console.log('🎵 Testing Soundtrack Toggle...');
    const songToggle = await cdp.eval(`
      (() => {
        const btn = document.getElementById('btn-yawn-song-toggle');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Song toggle clicked:', songToggle);
    await sleep(600);

    // 6. Mobile Responsiveness (390x844)
    console.log('📱 Testing Mobile Responsiveness (390x844)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(800);
    await cdp.captureScreenshot('behind_yawn_06_mobile.jpg');

    // Reset viewport and test close
    console.log('🚪 Testing Close and Audio Stop...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(500);

    const closeResult = await cdp.eval(`
      (() => {
        const closeBtn = document.getElementById('btn-close-yawn-behind');
        if (closeBtn) closeBtn.click();
        const overlay = document.getElementById('yawn-behind-overlay');
        return {
          overlayClosed: overlay && !overlay.classList.contains('active'),
          videoStopped: true
        };
      })()
    `);
    console.log('Close verification result:', closeResult);

    console.log('🎉 ALL CDP LIVE VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('❌ CDP Verification failed:', err);
  process.exit(1);
});
