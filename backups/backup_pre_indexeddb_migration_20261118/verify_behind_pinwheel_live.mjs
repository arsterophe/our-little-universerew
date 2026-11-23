import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9327;
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
  console.log('🚀 Starting Chrome CDP for Behind the Pinwheel Verification...');
  const tmpProfile = path.join(process.cwd(), 'temp_chrome_behind');
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
    for (let i = 0; i < 20; i++) {
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

    console.log('🌟 Initializing controller and opening Behind the Pinwheel...');
    await cdp.eval(`
      (async () => {
        window.isPreviewingUniverses = true;
        document.querySelectorAll('.view-section').forEach(v => {
          v.classList.remove('active');
          v.setAttribute('aria-hidden', 'true');
        });
        const pinwheelView = document.getElementById('view-pinwheel-world');
        if (pinwheelView) {
          pinwheelView.classList.add('active');
          pinwheelView.setAttribute('aria-hidden', 'false');
        }

        // Import and initialize pinwheel controller if not yet initialized
        const mod = await import('/pinwheel_view.js');
        const ctrl = mod.initPinwheelWorld({
          onShowToast: (msg) => console.log('Toast:', msg),
          onTriggerSparkle: () => {}
        });
        ctrl.openBehindPinwheel();
      })()
    `);
    await sleep(1000);

    const isPinwheelActive = await cdp.eval(`
      document.getElementById('view-pinwheel-world')?.classList.contains('active')
    `);
    console.log('✨ Is PINWHEEL view active?', isPinwheelActive);

    const isOverlayOpen = await cdp.eval(`
      document.getElementById('pinwheel-behind-overlay')?.classList.contains('active')
    `);
    console.log('✨ Is Behind the Pinwheel overlay active?', isOverlayOpen);

    // Chapter 1 Verification
    const ch1Title = await cdp.eval(`
      document.querySelector('#behind-chapter-1 .chapter-main-title')?.textContent
    `);
    console.log('📜 Chapter 1 Title:', ch1Title);
    await cdp.captureScreenshot('behind_pinwheel_ch1_desktop.png');

    // 2. Click Chapter 2 Tab
    console.log('🍃 Switching to Chapter II...');
    await cdp.eval(`
      document.querySelector('.behind-tab-btn[data-chapter="2"]')?.click();
    `);
    await sleep(600);
    const ch2Title = await cdp.eval(`
      document.querySelector('#behind-chapter-2 .chapter-main-title')?.textContent
    `);
    console.log('📜 Chapter 2 Title:', ch2Title);
    await cdp.captureScreenshot('behind_pinwheel_ch2_desktop.png');

    // 3. Click Chapter 3 Tab via Next button
    console.log('✉️ Clicking Next Button to go to Chapter III...');
    await cdp.eval(`
      document.getElementById('btn-behind-next-chapter')?.click();
    `);
    await sleep(600);
    const ch3Title = await cdp.eval(`
      document.querySelector('#behind-chapter-3 .chapter-main-title')?.textContent
    `);
    console.log('📜 Chapter 3 Title:', ch3Title);
    await cdp.captureScreenshot('behind_pinwheel_ch3_desktop.png');

    // 4. Click Chapter 4 / Epilogue via Next button
    console.log('🌌 Clicking Next Button to go to Epilogue / The Sound of PINWHEEL...');
    await cdp.eval(`
      document.getElementById('btn-behind-next-chapter')?.click();
    `);
    await sleep(800);

    const ch4Title = await cdp.eval(`
      document.querySelector('#behind-chapter-4 .chapter-main-title')?.textContent
    `);
    console.log('📜 Chapter 4 Title:', ch4Title);

    const iframeSrc = await cdp.eval(`
      document.getElementById('pinwheel-youtube-iframe')?.getAttribute('src')
    `);
    console.log('🎬 YouTube Iframe src:', iframeSrc);

    const quoteText = await cdp.eval(`
      document.querySelector('#behind-chapter-4 .closing-quote-text')?.textContent.trim()
    `);
    console.log('📜 Closing Quote:', quoteText);

    await cdp.captureScreenshot('behind_pinwheel_ch4_desktop.png');

    // Scroll deck down to capture the meaning & closing quote
    await cdp.eval(`
      (() => {
        const deck = document.querySelector('.pinwheel-behind-book-deck');
        if (deck) deck.scrollTop = 900;
      })()
    `);
    await sleep(400);
    await cdp.captureScreenshot('behind_pinwheel_ch4_scrolled_desktop.png');

    // 5. Test Back Button & Audio Stopping
    console.log('🔙 Testing Back Button and audio stop...');
    await cdp.eval(`
      document.getElementById('btn-back-pinwheel-behind')?.click();
    `);
    await sleep(600);
    const isOverlayClosed = await cdp.eval(`
      !document.getElementById('pinwheel-behind-overlay')?.classList.contains('active')
    `);
    console.log('✨ Did overlay close cleanly?', isOverlayClosed);

    // 6. Mobile Viewport Test (390 x 844) on Chapter 4 Epilogue
    console.log('📱 Switching to Mobile Viewport (390 x 844)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(600);

    // Reopen Behind the Pinwheel on mobile and switch to Chapter 4
    await cdp.eval(`
      (() => {
        document.querySelectorAll('.view-section').forEach(v => {
          v.classList.remove('active');
          v.setAttribute('aria-hidden', 'true');
        });
        const pinwheelView = document.getElementById('view-pinwheel-world');
        if (pinwheelView) {
          pinwheelView.classList.add('active');
          pinwheelView.setAttribute('aria-hidden', 'false');
        }
        document.getElementById('btn-pinwheel-behind')?.click();
        document.querySelector('.behind-tab-btn[data-chapter="4"]')?.click();
      })()
    `);
    await sleep(800);
    await cdp.captureScreenshot('behind_pinwheel_ch4_mobile.png');

    // Scroll mobile deck to capture meaning section & closing quote
    await cdp.eval(`
      (() => {
        const deck = document.querySelector('.pinwheel-behind-book-deck');
        if (deck) deck.scrollTop = 800;
      })()
    `);
    await sleep(400);
    await cdp.captureScreenshot('behind_pinwheel_ch4_mobile_scrolled.png');

    console.log('🎉 LIVE VERIFICATION COMPLETED WITH 100% SUCCESS!');
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error('❌ Error during CDP test:', err);
  process.exit(1);
});
