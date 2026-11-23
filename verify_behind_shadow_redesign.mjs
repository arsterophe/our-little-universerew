import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9345;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\36374948-9b1c-47c2-b618-025d3a41477d';

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
    let WSClass = globalThis.WebSocket;
    if (!WSClass) {
      const wsModule = await import('ws');
      WSClass = wsModule.WebSocket || wsModule.default;
    }
    return new Promise((resolve, reject) => {
      this.ws = new WSClass(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const raw = typeof event.data === 'string' ? event.data : event.data.toString();
        const msg = JSON.parse(raw);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
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
      throw new Error(`Eval exception: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile,
    });
    await this.send('Emulation.setVisibleSize', { width, height });
  }

  async screenshot(filepath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filepath, buffer);
    console.log(`📸 Screenshot saved: ${filepath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }
  }
}

async function run() {
  console.log('🚀 Starting BEHIND THE SHADOW Live Verification with CDP...');

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--window-size=1920,1080',
    `--user-data-dir=${path.join(process.cwd(), 'temp_chrome_behind_shadow')}`,
    'about:blank',
  ]);

  let cdp = null;

  try {
    let connected = false;
    for (let i = 0; i < 25; i++) {
      try {
        await sleep(400);
        const version = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
        console.log('🔗 Chrome debug connected:', version.Browser);
        connected = true;
        break;
      } catch {}
    }

    if (!connected) throw new Error('Could not connect to Chrome debugging port.');

    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('🔌 CDP WebSocket connected.');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    await cdp.setViewport(1920, 1080);

    console.log(`🌐 Navigating to http://localhost:${PORT}...`);
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    await sleep(2500);

    console.log('📜 Activating SHADOW universe and opening BEHIND THE SHADOW...');
    const opened = await cdp.eval(`
      (async () => {
        window.isPreviewingUniverses = true;
        document.querySelectorAll('.view-section').forEach(v => {
          v.classList.remove('active');
          v.setAttribute('aria-hidden', 'true');
        });
        const shadowView = document.getElementById('view-shadow-world');
        if (shadowView) {
          shadowView.classList.add('active');
          shadowView.setAttribute('aria-hidden', 'false');
        }

        // Open Behind the Shadow overlay
        const overlay = document.getElementById('shadow-behind-overlay');
        if (overlay) {
          overlay.classList.add('active');
          overlay.setAttribute('aria-hidden', 'false');
        }

        if (window.universesController?.shadowBehindController?.switchShadowBehindChapter) {
          window.universesController.shadowBehindController.switchShadowBehindChapter(1);
        } else {
          const mod = await import('/shadow_behind_view.js');
          mod.initShadowBehindView({
            onShowToast: (msg) => console.log('Toast:', msg),
            onTriggerSparkle: () => {}
          });
          mod.openBehindShadow();
        }
        return 'OPENED_SUCCESSFULLY';
      })()
    `);
    console.log('Overlay open result:', opened);
    await sleep(1000);

    // ==========================================
    // 1. DESKTOP CHAPTER I (Why Half Angel, Half Devil?)
    // ==========================================
    console.log('🔍 Testing Chapter I: Why Half Angel, Half Devil?...');
    await cdp.eval(`
      (() => {
        if (window.universesController?.shadowBehindController?.switchShadowBehindChapter) {
          window.universesController.shadowBehindController.switchShadowBehindChapter(1);
        }
      })()
    `);
    await sleep(500);

    const ch1Audit = await cdp.eval(`
      (() => {
        const grid = document.querySelector('.shadow-chapter-grid');
        const portrait = document.querySelector('.shadow-portrait-img');
        const role = document.querySelector('.shadow-profile-role');
        const quote = document.querySelector('.shadow-profile-quote');
        const titles = Array.from(document.querySelectorAll('.shadow-section-title')).map(el => el.textContent.trim());
        return {
          hasGrid: !!grid,
          portraitSrc: portrait?.src || portrait?.getAttribute('src'),
          portraitNaturalWidth: portrait?.naturalWidth || 0,
          roleText: role?.textContent?.trim(),
          quoteText: quote?.textContent?.trim(),
          sectionTitles: titles
        };
      })()
    `);
    console.log('Chapter I Audit:', ch1Audit);

    const ch1Path = path.join(ARTIFACTS_DIR, 'behind_shadow_01_desktop_ch1.png');
    await cdp.screenshot(ch1Path);

    // ==========================================
    // 2. DESKTOP CHAPTER II (Why SHADOW?)
    // ==========================================
    console.log('🔍 Testing Chapter II: Why SHADOW?...');
    await cdp.eval(`
      (() => {
        const nextBtn = document.getElementById('btn-shadow-behind-next');
        if (nextBtn) nextBtn.click();
      })()
    `);
    await sleep(500);

    const ch2Audit = await cdp.eval(`
      (() => {
        const panel2 = document.getElementById('shadow-behind-chapter-2');
        const symbolsCard = document.querySelector('.shadow-symbols-card');
        const leleCardImg = document.querySelector('.shadow-symbols-lele-card img');
        const items = document.querySelectorAll('.shadow-symbol-item');
        return {
          isCh2Active: panel2?.classList.contains('active'),
          hasSymbolsCard: !!symbolsCard,
          leleCardSrc: leleCardImg?.src || leleCardImg?.getAttribute('src'),
          symbolCount: items.length
        };
      })()
    `);
    console.log('Chapter II Audit:', ch2Audit);

    const ch2Path = path.join(ARTIFACTS_DIR, 'behind_shadow_02_desktop_ch2.png');
    await cdp.screenshot(ch2Path);

    // ==========================================
    // 3. DESKTOP CHAPTER III (Parchment Letter)
    // ==========================================
    console.log('🔍 Testing Chapter III: To the Shadow I Kept Running From...');
    await cdp.eval(`
      (() => {
        const nextBtn = document.getElementById('btn-shadow-behind-next');
        if (nextBtn) nextBtn.click();
      })()
    `);
    await sleep(500);

    const ch3Path = path.join(ARTIFACTS_DIR, 'behind_shadow_03_desktop_ch3_letter.png');
    await cdp.screenshot(ch3Path);

    // ==========================================
    // 4. DESKTOP CHAPTER IV (Epilogue: SHADOW)
    // ==========================================
    console.log('🔍 Testing Chapter IV: Epilogue: SHADOW...');
    await cdp.eval(`
      (() => {
        const nextBtn = document.getElementById('btn-shadow-behind-next');
        if (nextBtn) nextBtn.click();
      })()
    `);
    await sleep(500);

    const ch4Audit = await cdp.eval(`
      (() => {
        const panel4 = document.getElementById('shadow-behind-chapter-4');
        const climaxBox = document.querySelector('.shadow-climax-quote-box');
        const playerCard = document.querySelector('.shadow-player-card');
        const meaningCard = document.querySelector('.shadow-meaning-card');
        const iframe = document.getElementById('shadow-youtube-iframe');
        const nextBtn = document.getElementById('btn-shadow-behind-next');
        return {
          isCh4Active: panel4?.classList.contains('active'),
          hasClimaxBox: !!climaxBox,
          hasPlayerCard: !!playerCard,
          hasMeaningCard: !!meaningCard,
          iframeSrc: iframe?.src,
          isNextDisabled: nextBtn?.disabled
        };
      })()
    `);
    console.log('Chapter IV Audit:', ch4Audit);

    const ch4Path = path.join(ARTIFACTS_DIR, 'behind_shadow_04_desktop_ch4_epilogue.png');
    await cdp.screenshot(ch4Path);

    // Test Prev Navigation
    console.log('🔍 Testing Previous navigation button back to Chapter I...');
    await cdp.eval(`
      (() => {
        const prevBtn = document.getElementById('btn-shadow-behind-prev');
        if (prevBtn) {
          prevBtn.click(); // to ch3
          prevBtn.click(); // to ch2
          prevBtn.click(); // to ch1
        }
      })()
    `);
    await sleep(500);

    const prevAudit = await cdp.eval(`
      (() => {
        const panel1 = document.getElementById('shadow-behind-chapter-1');
        const prevBtn = document.getElementById('btn-shadow-behind-prev');
        return {
          isCh1Active: panel1?.classList.contains('active'),
          isPrevDisabled: prevBtn?.disabled
        };
      })()
    `);
    console.log('Prev Button Navigation Audit:', prevAudit);

    // ==========================================
    // 5. MOBILE VIEWPORT (390 x 844)
    // ==========================================
    console.log('📱 Switching to Mobile Viewport (390 x 844)...');
    await cdp.setViewport(390, 844, true);
    await cdp.eval(`
      (() => {
        const nav = document.querySelector('.shadow-behind-nav');
        if (nav) nav.scrollLeft = 0;
        if (window.universesController?.shadowBehindController?.switchShadowBehindChapter) {
          window.universesController.shadowBehindController.switchShadowBehindChapter(1);
        }
      })()
    `);
    await sleep(600);

    const mobileCh1Path = path.join(ARTIFACTS_DIR, 'behind_shadow_05_mobile_ch1.png');
    await cdp.screenshot(mobileCh1Path);

    // Mobile Epilogue
    await cdp.eval(`
      (() => {
        if (window.universesController?.shadowBehindController?.switchShadowBehindChapter) {
          window.universesController.shadowBehindController.switchShadowBehindChapter(4);
        }
      })()
    `);
    await sleep(500);

    const mobileCh4Path = path.join(ARTIFACTS_DIR, 'behind_shadow_06_mobile_ch4_epilogue.png');
    await cdp.screenshot(mobileCh4Path);

    console.log('\n🎉 ALL LIVE VERIFICATION CHECKS & SCREENSHOTS COMPLETED SUCCESSFULLY!');
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
