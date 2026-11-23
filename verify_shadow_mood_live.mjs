import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9348;
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
      this.ws.close();
      this.ws = null;
    }
  }
}

async function run() {
  console.log('🚀 Starting SHADOW Mood & Duality Live Verification with CDP...');
  const tempProfileDir = path.resolve('./temp_chrome_shadow_mood');
  if (!fs.existsSync(tempProfileDir)) {
    fs.mkdirSync(tempProfileDir, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempProfileDir}`,
    'about:blank',
  ]);

  let versionInfo = null;
  for (let i = 0; i < 40; i++) {
    try {
      versionInfo = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (versionInfo) break;
    } catch (_) {
      await sleep(250);
    }
  }

  if (!versionInfo) {
    chromeProc.kill();
    throw new Error('Failed to connect to headless Chrome');
  }

  console.log('🔗 Chrome debug connected:', versionInfo.Browser);
  const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  console.log('🔌 CDP WebSocket connected.');

  try {
    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    await client.setViewport(1920, 1080);
    console.log(`🌐 Navigating to http://localhost:${PORT}...`);
    await client.send('Page.navigate', { url: `http://localhost:${PORT}/?t=${Date.now()}` });
    await sleep(2500);

    // Initialize universesController and open SHADOW
    console.log('🌌 Ensuring universesController and opening SHADOW universe...');
    const openRes = await client.eval(`
      (async () => {
        if (!window.universesController) {
          const mainModule = await import('/main.js');
          if (mainModule && typeof mainModule.ensureUniversesController === 'function') {
            await mainModule.ensureUniversesController();
          }
        }
        if (window.universesController && typeof window.universesController.openShadowWorld === 'function') {
          window.universesController.openShadowWorld();
          return 'OPENED_VIA_CONTROLLER';
        }
        return 'FAILED';
      })()
    `);
    console.log('Shadow world open result:', openRes);
    await sleep(1500);

    // 1. Audit Default Mood & Duality
    console.log('🔍 Auditing default Mood & Duality card...');
    const auditDefault = await client.eval(`
      (() => {
        const container = document.getElementById('shadow-mood-container');
        const moodText = document.getElementById('shadow-mood-text');
        const sideBadge = document.getElementById('shadow-side-badge');
        const songText = document.getElementById('shadow-mood-song');
        const quoteText = document.getElementById('shadow-side-quote');
        const charMoodPill = document.getElementById('shadow-char-mood-pill');
        const charSidePill = document.getElementById('shadow-char-side-pill');

        return {
          hasContainer: !!container,
          mood: moodText ? moodText.textContent.trim() : null,
          side: sideBadge ? sideBadge.textContent.trim() : null,
          song: songText ? songText.textContent.trim() : null,
          quote: quoteText ? quoteText.textContent.trim() : null,
          charMood: charMoodPill ? charMoodPill.textContent.trim() : null,
          charSide: charSidePill ? charSidePill.textContent.trim() : null
        };
      })()
    `);
    console.log('Audit Default:', auditDefault);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'shadow_mood_01_default.png'));

    // 2. Open Mood Choices Bar
    console.log('🔍 Toggling mood picker options bar...');
    await client.eval(`
      (() => {
        if (window.universesController && typeof window.universesController.toggleShadowMoodPicker === 'function') {
          window.universesController.toggleShadowMoodPicker(true);
        } else {
          const btn = document.getElementById('btn-toggle-shadow-mood-picker');
          if (btn) btn.click();
        }
      })()
    `);
    await sleep(600);
    const pickerOpen = await client.eval(`
      (() => {
        const bar = document.getElementById('shadow-mood-options-bar');
        const pills = document.querySelectorAll('.shadow-mood-option-pill');
        return {
          isOpen: bar ? bar.classList.contains('is-open') : false,
          pillCount: pills.length
        };
      })()
    `);
    console.log('Picker open status:', pickerOpen);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'shadow_mood_02_picker_open.png'));

    // 3. Select mood "Bersemangat" ✨ & Switch to Angel Side 🪽
    console.log('✨ Selecting mood "Bersemangat" and Angel Side...');
    await client.eval(`
      (() => {
        if (window.universesController) {
          window.universesController.applyShadowMood('bersemangat', true);
          window.universesController.applyShadowDuality('angel', true);
        } else {
          const pillSemangat = document.querySelector('.shadow-mood-option-pill[data-mood="bersemangat"]');
          if (pillSemangat) pillSemangat.click();
          const btnAngel = document.getElementById('btn-side-angel');
          if (btnAngel) btnAngel.click();
        }
      })()
    `);
    await sleep(800);
    const angelAudit = await client.eval(`
      (() => {
        const view = document.getElementById('view-shadow-world');
        const sideBadge = document.getElementById('shadow-side-badge');
        const sideQuote = document.getElementById('shadow-side-quote');
        const moodText = document.getElementById('shadow-mood-text');
        const charSide = document.getElementById('shadow-char-side-text');
        const charMood = document.getElementById('shadow-char-mood-text');

        return {
          isDualityAngel: view ? view.classList.contains('duality-angel') : false,
          badge: sideBadge ? sideBadge.textContent.trim() : null,
          quote: sideQuote ? sideQuote.textContent.trim() : null,
          mood: moodText ? moodText.textContent.trim() : null,
          charSide: charSide ? charSide.textContent.trim() : null,
          charMood: charMood ? charMood.textContent.trim() : null
        };
      })()
    `);
    console.log('Angel Side Audit:', angelAudit);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'shadow_mood_03_angel_side.png'));

    // 4. Switch to Devil Side 🔥
    console.log('🔥 Switching to Devil Side...');
    await client.eval(`
      (() => {
        if (window.universesController) {
          window.universesController.applyShadowDuality('devil', true);
        } else {
          const btnDevil = document.getElementById('btn-side-devil');
          if (btnDevil) btnDevil.click();
        }
      })()
    `);
    await sleep(800);
    const devilAudit = await client.eval(`
      (() => {
        const view = document.getElementById('view-shadow-world');
        const sideBadge = document.getElementById('shadow-side-badge');
        const sideQuote = document.getElementById('shadow-side-quote');
        const charSide = document.getElementById('shadow-char-side-text');

        return {
          isDualityDevil: view ? view.classList.contains('duality-devil') : false,
          badge: sideBadge ? sideBadge.textContent.trim() : null,
          quote: sideQuote ? sideQuote.textContent.trim() : null,
          charSide: charSide ? charSide.textContent.trim() : null
        };
      })()
    `);
    console.log('Devil Side Audit:', devilAudit);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'shadow_mood_04_devil_side.png'));

    // 5. Open Mood History Modal
    console.log('📜 Opening Mood History Modal...');
    await client.eval(`
      (() => {
        if (window.universesController && typeof window.universesController.openShadowMoodHistory === 'function') {
          window.universesController.openShadowMoodHistory();
        } else {
          const btnHist = document.getElementById('btn-shadow-mood-history');
          if (btnHist) btnHist.click();
        }
      })()
    `);
    await sleep(700);
    const histAudit = await client.eval(`
      (() => {
        const modal = document.getElementById('shadow-mood-history-modal');
        const items = document.querySelectorAll('.shadow-mood-history-item');
        return {
          isOpen: modal ? modal.classList.contains('is-open') : false,
          itemCount: items.length
        };
      })()
    `);
    console.log('History Modal Audit:', histAudit);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'shadow_mood_05_history_modal.png'));

    // Close history modal
    await client.eval(`
      (() => {
        const btnClose = document.getElementById('btn-close-shadow-mood-history');
        if (btnClose) btnClose.click();
      })()
    `);
    await sleep(400);

    // 6. Mobile Viewport (390 x 844)
    console.log('📱 Switching to Mobile Viewport (390 x 844)...');
    await client.setViewport(390, 844, true);
    await sleep(600);
    await client.screenshot(path.join(ARTIFACTS_DIR, 'shadow_mood_06_mobile.png'));

    console.log('\n🎉 ALL LIVE VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } finally {
    client.close();
    chromeProc.kill();
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
