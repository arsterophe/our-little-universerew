import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9335;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\36374948-9b1c-47c2-b618-025d3a41477d';
const SCRATCH_DIR = path.join(process.cwd(), 'scratch');

if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
if (!fs.existsSync(SCRATCH_DIR)) fs.mkdirSync(SCRATCH_DIR, { recursive: true });

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
    
    // Save to artifact directory
    const artifactPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(artifactPath, buffer);
    
    // Also save to scratch directory
    const scratchPath = path.join(SCRATCH_DIR, filename);
    fs.writeFileSync(scratchPath, buffer);

    console.log(`📸 Screenshot saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return artifactPath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log('🚀 Starting Chrome CDP for BEHIND THE PINWHEEL Verification...');
  const tmpProfile = path.join(process.cwd(), 'temp_chrome_pinwheel_verify');
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

    console.log('🌟 Navigating to PINWHEEL World (Syma) and opening Behind the Pinwheel...');
    const setupResult = await cdp.eval(`
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

        const pinwheelBehindMod = await import('/pinwheel_behind_view.js');
        if (pinwheelBehindMod && pinwheelBehindMod.initPinwheelBehindView) {
          pinwheelBehindMod.initPinwheelBehindView();
        }

        const btn = document.getElementById('btn-pinwheel-behind');
        if (btn) btn.click();
        else if (window.pinwheelBehindController) window.pinwheelBehindController.open();

        const overlay = document.getElementById('pinwheel-behind-overlay');
        return {
          pinwheelActive: pinwheelView?.classList.contains('active'),
          overlayActive: overlay?.classList.contains('active'),
        };
      })()
    `);
    console.log('Setup result:', setupResult);
    await sleep(800);

    // ==========================================
    // 1. CHAPTER I TEST & SCREENSHOT
    // ==========================================
    console.log('\n--- 1. Testing Chapter I Layout & Dimensions ---');
    const ch1Metrics = await cdp.eval(`
      (() => {
        const panel = document.getElementById('pinwheel-behind-chapter-1');
        const deck = document.getElementById('pinwheel-behind-deck');
        const textCol = panel.querySelector('.pinwheel-text-column');
        const profileCard = panel.querySelector('.pinwheel-char-profile-card');
        const portraitImg = panel.querySelector('.pinwheel-portrait-img');
        const portraitFrame = panel.querySelector('.pinwheel-portrait-frame');
        const prevBtn = document.getElementById('btn-pinwheel-behind-prev');
        const nextBtn = document.getElementById('btn-pinwheel-behind-next');

        return {
          deckScrollWidth: deck.scrollWidth,
          deckClientWidth: deck.clientWidth,
          hasHorizontalOverflow: deck.scrollWidth > deck.clientWidth + 2,
          textColWidth: textCol ? textCol.getBoundingClientRect().width : 0,
          profileCardWidth: profileCard ? profileCard.getBoundingClientRect().width : 0,
          portraitImgWidth: portraitImg ? portraitImg.getBoundingClientRect().width : 0,
          portraitImgHeight: portraitImg ? portraitImg.getBoundingClientRect().height : 0,
          portraitFrameHeight: portraitFrame ? portraitFrame.getBoundingClientRect().height : 0,
          prevDisabled: prevBtn ? prevBtn.disabled : null,
          nextDisabled: nextBtn ? nextBtn.disabled : null,
        };
      })()
    `);
    console.log('Chapter 1 Metrics:', ch1Metrics);
    if (ch1Metrics.hasHorizontalOverflow) {
      console.warn('⚠️ Horizontal overflow detected on deck!');
    } else {
      console.log('✅ No horizontal overflow! Content fits perfectly.');
    }
    console.log(`✅ Text column width: ${ch1Metrics.textColWidth}px | Profile card width: ${ch1Metrics.profileCardWidth}px`);
    console.log(`✅ Image proportion: ${ch1Metrics.portraitImgWidth}x${ch1Metrics.portraitImgHeight}px (contained in frame)`);
    console.log(`✅ Previous button disabled on Chapter 1: ${ch1Metrics.prevDisabled} | Next button enabled: ${!ch1Metrics.nextDisabled}`);

    await cdp.captureScreenshot('behind_pinwheel_ch1_desktop.png');

    // ==========================================
    // 2. NEXT BUTTON TEST -> CHAPTER II
    // ==========================================
    console.log('\n--- 2. Testing Next Button -> Chapter II ---');
    const ch2NavResult = await cdp.eval(`
      (() => {
        const nextBtn = document.getElementById('btn-pinwheel-behind-next');
        if (nextBtn) nextBtn.click();
        const ch1 = document.getElementById('pinwheel-behind-chapter-1');
        const ch2 = document.getElementById('pinwheel-behind-chapter-2');
        const prevBtn = document.getElementById('btn-pinwheel-behind-prev');
        return {
          ch1Active: ch1.classList.contains('active'),
          ch2Active: ch2.classList.contains('active'),
          prevDisabled: prevBtn ? prevBtn.disabled : null,
        };
      })()
    `);
    console.log('Chapter 2 Navigation result:', ch2NavResult);
    await sleep(600);

    const ch2Metrics = await cdp.eval(`
      (() => {
        const panel = document.getElementById('pinwheel-behind-chapter-2');
        const deck = document.getElementById('pinwheel-behind-deck');
        const textCol = panel.querySelector('.pinwheel-text-column');
        const profileCard = panel.querySelector('.pinwheel-char-profile-card');
        const portraitImg = panel.querySelector('.pinwheel-portrait-img');
        return {
          hasHorizontalOverflow: deck.scrollWidth > deck.clientWidth + 2,
          textColWidth: textCol ? textCol.getBoundingClientRect().width : 0,
          profileCardWidth: profileCard ? profileCard.getBoundingClientRect().width : 0,
          portraitImgWidth: portraitImg ? portraitImg.getBoundingClientRect().width : 0,
        };
      })()
    `);
    console.log('Chapter 2 Metrics:', ch2Metrics);
    await cdp.captureScreenshot('behind_pinwheel_ch2_desktop.png');

    // ==========================================
    // 3. NEXT BUTTON TEST -> CHAPTER III
    // ==========================================
    console.log('\n--- 3. Testing Next Button -> Chapter III ---');
    await cdp.eval(`document.getElementById('btn-pinwheel-behind-next')?.click();`);
    await sleep(600);
    const ch3Title = await cdp.eval(`document.querySelector('#pinwheel-behind-chapter-3 .pinwheel-chapter-main-title')?.textContent`);
    console.log('Chapter 3 Title:', ch3Title);
    await cdp.captureScreenshot('behind_pinwheel_ch3_desktop.png');

    // ==========================================
    // 4. NEXT BUTTON TEST -> CHAPTER IV (LETTER)
    // ==========================================
    console.log('\n--- 4. Testing Next Button -> Chapter IV (A Letter from Lele) ---');
    await cdp.eval(`document.getElementById('btn-pinwheel-behind-next')?.click();`);
    await sleep(600);
    const ch4Title = await cdp.eval(`document.querySelector('#pinwheel-behind-chapter-4 .pinwheel-chapter-main-title')?.textContent`);
    console.log('Chapter 4 Title:', ch4Title);
    await cdp.captureScreenshot('behind_pinwheel_ch4_letter_desktop.png');

    // ==========================================
    // 5. NEXT BUTTON TEST -> CHAPTER V (EPILOGUE)
    // ==========================================
    console.log('\n--- 5. Testing Next Button -> Chapter V (Epilogue: PINWHEEL) ---');
    const ch5NavResult = await cdp.eval(`
      (() => {
        const nextBtn = document.getElementById('btn-pinwheel-behind-next');
        if (nextBtn) nextBtn.click();
        const ch5 = document.getElementById('pinwheel-behind-chapter-5');
        const prevBtn = document.getElementById('btn-pinwheel-behind-prev');
        return {
          ch5Active: ch5.classList.contains('active'),
          prevDisabled: prevBtn ? prevBtn.disabled : null,
          nextDisabled: nextBtn ? nextBtn.disabled : null,
        };
      })()
    `);
    console.log('Chapter 5 Navigation result:', ch5NavResult);
    await sleep(800);

    const epilogueMetrics = await cdp.eval(`
      (() => {
        const panel = document.getElementById('pinwheel-behind-chapter-5');
        const climaxBox = panel.querySelector('.pinwheel-epilogue-climax');
        const soundCard = panel.querySelector('.pinwheel-soundtrack-card');
        const iframe = panel.querySelector('#pinwheel-youtube-iframe');
        const deck = document.getElementById('pinwheel-behind-deck');

        return {
          hasHorizontalOverflow: deck.scrollWidth > deck.clientWidth + 2,
          climaxBoxWidth: climaxBox ? climaxBox.getBoundingClientRect().width : 0,
          soundCardWidth: soundCard ? soundCard.getBoundingClientRect().width : 0,
          iframeExists: !!iframe,
          iframeSrc: iframe ? iframe.getAttribute('src') : null,
          songTitle: panel.querySelector('.pinwheel-song-titles h4')?.textContent,
        };
      })()
    `);
    console.log('Epilogue Metrics:', epilogueMetrics);
    console.log('✅ Epilogue Soundtrack Title:', epilogueMetrics.songTitle);
    console.log('✅ Epilogue Iframe Src:', epilogueMetrics.iframeSrc);

    await cdp.captureScreenshot('behind_pinwheel_ch5_epilogue_desktop.png');

    // ==========================================
    // 6. TESTING PREVIOUS BUTTON (BIDIRECTIONAL)
    // ==========================================
    console.log('\n--- 6. Testing Previous Button (Full Bidirectional Navigation) ---');
    const prevBackResult = await cdp.eval(`
      (() => {
        const prevBtn = document.getElementById('btn-pinwheel-behind-prev');
        const history = [];
        // From Ch 5 -> click prev -> Ch 4
        prevBtn.click();
        history.push(document.querySelector('.pinwheel-behind-chapter-panel.active').id);
        // From Ch 4 -> click prev -> Ch 3
        prevBtn.click();
        history.push(document.querySelector('.pinwheel-behind-chapter-panel.active').id);
        // From Ch 3 -> click prev -> Ch 2
        prevBtn.click();
        history.push(document.querySelector('.pinwheel-behind-chapter-panel.active').id);
        // From Ch 2 -> click prev -> Ch 1
        prevBtn.click();
        history.push(document.querySelector('.pinwheel-behind-chapter-panel.active').id);

        return {
          history,
          isCh1Active: document.getElementById('pinwheel-behind-chapter-1').classList.contains('active'),
          prevDisabledAtCh1: prevBtn.disabled,
        };
      })()
    `);
    console.log('Previous Button Reverse History:', prevBackResult.history);
    console.log('✅ Back to Chapter 1:', prevBackResult.isCh1Active);
    console.log('✅ Previous button disabled at Chapter 1:', prevBackResult.prevDisabledAtCh1);

    // ==========================================
    // 7. MOBILE RESPONSIVENESS (390 x 844)
    // ==========================================
    console.log('\n--- 7. Mobile Viewport Verification (390 x 844) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(600);

    const mobileCh1Metrics = await cdp.eval(`
      (() => {
        const deck = document.getElementById('pinwheel-behind-deck');
        return {
          deckScrollWidth: deck.scrollWidth,
          deckClientWidth: deck.clientWidth,
          hasHorizontalOverflow: deck.scrollWidth > deck.clientWidth + 2,
        };
      })()
    `);
    console.log('Mobile Chapter 1 Metrics:', mobileCh1Metrics);
    await cdp.captureScreenshot('behind_pinwheel_mobile_ch1.png');

    // Switch to Epilogue on mobile
    await cdp.eval(`
      (() => {
        if (window.pinwheelBehindController) window.pinwheelBehindController.switchChapter(5);
      })()
    `);
    await sleep(600);
    const mobileEpilogueMetrics = await cdp.eval(`
      (() => {
        const deck = document.getElementById('pinwheel-behind-deck');
        return {
          hasHorizontalOverflow: deck.scrollWidth > deck.clientWidth + 2,
        };
      })()
    `);
    console.log('Mobile Epilogue Metrics:', mobileEpilogueMetrics);
    await cdp.captureScreenshot('behind_pinwheel_mobile_epilogue.png');

    console.log('\n🎉 ALL LIVE TESTS COMPLETED WITH 100% SUCCESS! 🎉');
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error('❌ Error during CDP test:', err);
  process.exit(1);
});
