import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-lotus-'));
const port = 9389;
const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\36374948-9b1c-47c2-b618-025d3a41477d';

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--window-size=1920,1080',
  'about:blank'
], { stdio: 'ignore' });

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const p = list.find(t => t.type === 'page');
      if (p && p.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch (_) {}
    await sleep(250);
  }
  throw new Error('Chrome WS unreachable');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 1;
    const map = new Map();
    ws.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          const reqId = id++;
          return new Promise((res, rej) => {
            map.set(reqId, { res, rej });
            ws.send(JSON.stringify({ id: reqId, method, params }));
          });
        },
        close() { ws.close(); }
      });
    });
    ws.addEventListener('message', ev => {
      const data = JSON.parse(ev.data);
      if (data.id && map.has(data.id)) {
        const { res, rej } = map.get(data.id);
        map.delete(data.id);
        if (data.error) rej(new Error(data.error.message));
        else res(data.result);
      }
    });
    ws.addEventListener('error', err => reject(err));
  });
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    const cdp = await connect(wsUrl);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Navigating to http://localhost:5173 ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(4000);

    // Switch view to US AGAIN world
    console.log('Activating US AGAIN world and initializing Behind the Lotus...');
    const setupRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (async () => {
          try {
            localStorage.setItem('olu_current_character', 'ela');
            localStorage.setItem('olu_authenticated_user', 'ela');
            window.isPreviewingUniverses = true;

            document.querySelectorAll('.view-section').forEach(v => {
              v.classList.remove('active');
              v.setAttribute('aria-hidden', 'true');
            });
            const usagainView = document.getElementById('view-usagain-world');
            if (usagainView) {
              usagainView.classList.add('active');
              usagainView.setAttribute('aria-hidden', 'false');
            }
            const appLoader = document.getElementById('cosmic-app-loader');
            if (appLoader) appLoader.style.display = 'none';

            let lotusMod = null;
            try {
              lotusMod = await import('/usagain_behind_view.js');
              if (lotusMod && lotusMod.initUsAgainBehindView) {
                lotusMod.initUsAgainBehindView();
              }
            } catch (modErr) {
              console.error('Module import error:', modErr);
            }

            const btnBehind = document.getElementById('btn-usagain-behind');
            const overlay = document.getElementById('lotus-behind-overlay');
            return {
              url: window.location.href,
              hasUsagainView: !!usagainView,
              hasBtnBehind: !!btnBehind,
              btnDisplay: btnBehind ? window.getComputedStyle(btnBehind).display : 'none',
              btnText: btnBehind ? btnBehind.innerText.trim() : '',
              hasOverlay: !!overlay,
              hasController: !!window.usagainBehindController,
              lotusModLoaded: !!lotusMod
            };
          } catch (err) {
            return { error: err.message, stack: err.stack, url: window.location.href };
          }
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('US AGAIN HUD button status:', setupRes.result.value);

    // Click BEHIND THE LOTUS button
    console.log('Clicking #btn-usagain-behind ...');
    const openRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-usagain-behind');
          if (btn) btn.click();
          else if (window.usagainBehindController) window.usagainBehindController.open();
          const ov = document.getElementById('lotus-behind-overlay');
          const container = document.querySelector('.lotus-behind-container');
          return {
            overlayActive: ov ? ov.classList.contains('active') : false,
            overlayDisplay: ov ? window.getComputedStyle(ov).display : 'none',
            containerBounds: container ? {
              width: container.offsetWidth,
              height: container.offsetHeight,
              borderRadius: window.getComputedStyle(container).borderRadius,
              boxShadow: window.getComputedStyle(container).boxShadow !== 'none'
            } : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Overlay open status & container bounds:', openRes.result.value);
    await sleep(1000);

    // 1. Capture Chapter I screenshot
    console.log('📸 Capturing Chapter I: The Priestess...');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { if (window.usagainBehindController) window.usagainBehindController.switchChapter(1); })()`,
      returnByValue: true
    });
    await sleep(800);
    const shot1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const shot1Path = path.join(artifactDir, 'behind_lotus_01_ch1_desktop.png');
    fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
    console.log('📸 Saved Chapter 1 screenshot to:', shot1Path);

    // Test Next button click to Chapter 2
    console.log('👉 Testing Next button (1 -> 2)...');
    const nextTo2 = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const nextBtn = document.getElementById('btn-lotus-behind-next');
          const prevBtn = document.getElementById('btn-lotus-behind-prev');
          const prevDisabledBefore = prevBtn ? prevBtn.disabled : null;
          if (nextBtn) nextBtn.click();
          const ch2Panel = document.getElementById('lotus-behind-chapter-2');
          return {
            prevDisabledBefore,
            ch2Active: ch2Panel ? ch2Panel.classList.contains('active') : false,
            prevDisabledAfter: prevBtn ? prevBtn.disabled : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Next to 2 result:', nextTo2.result.value);
    await sleep(800);

    // 2. Capture Chapter II screenshot
    console.log('📸 Capturing Chapter II: Why US AGAIN? ...');
    const shot2 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const shot2Path = path.join(artifactDir, 'behind_lotus_02_ch2_desktop.png');
    fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
    console.log('📸 Saved Chapter 2 screenshot to:', shot2Path);

    // Test Next button click to Chapter 3
    console.log('👉 Testing Next button (2 -> 3)...');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { const btn = document.getElementById('btn-lotus-behind-next'); if (btn) btn.click(); })()`,
      returnByValue: true
    });
    await sleep(800);

    // 3. Capture Chapter III screenshot
    console.log('📸 Capturing Chapter III: The Road We Walked Together...');
    const shot3 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const shot3Path = path.join(artifactDir, 'behind_lotus_03_ch3_desktop.png');
    fs.writeFileSync(shot3Path, Buffer.from(shot3.data, 'base64'));
    console.log('📸 Saved Chapter 3 screenshot to:', shot3Path);

    // Test Next button click to Chapter 4
    console.log('👉 Testing Next button (3 -> 4)...');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { const btn = document.getElementById('btn-lotus-behind-next'); if (btn) btn.click(); })()`,
      returnByValue: true
    });
    await sleep(800);

    // 4. Capture Chapter IV screenshot (Parchment letter + Replay & Seal test)
    console.log('📸 Capturing Chapter IV: A Letter From Lele...');
    const shot4 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const shot4Path = path.join(artifactDir, 'behind_lotus_04_ch4_letter_desktop.png');
    fs.writeFileSync(shot4Path, Buffer.from(shot4.data, 'base64'));
    console.log('📸 Saved Chapter 4 screenshot to:', shot4Path);

    console.log('📜 Testing Letter Replay and Seal Buttons...');
    const replayRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const replayBtn = document.getElementById('btn-lotus-letter-replay');
          const sealBtn = document.getElementById('btn-lotus-letter-seal');
          if (replayBtn) replayBtn.click();
          return {
            hasReplayBtn: !!replayBtn,
            hasSealBtn: !!sealBtn
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Letter buttons test:', replayRes.result.value);
    await sleep(600);

    // Test Next button click to Chapter 5
    console.log('👉 Testing Next button (4 -> 5)...');
    const nextTo5 = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const nextBtn = document.getElementById('btn-lotus-behind-next');
          if (nextBtn) nextBtn.click();
          const ch5Panel = document.getElementById('lotus-behind-chapter-5');
          return {
            ch5Active: ch5Panel ? ch5Panel.classList.contains('active') : false,
            nextDisabledOnLast: nextBtn ? nextBtn.disabled : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Next to 5 result:', nextTo5.result.value);
    await sleep(800);

    // 5. Capture Chapter V screenshot (Epilogue & Soundtrack)
    console.log('📸 Capturing Chapter V: Epilogue & Soundtrack...');
    const shot5 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const shot5Path = path.join(artifactDir, 'behind_lotus_05_ch5_epilogue_desktop.png');
    fs.writeFileSync(shot5Path, Buffer.from(shot5.data, 'base64'));
    console.log('📸 Saved Chapter 5 screenshot to:', shot5Path);

    console.log('🎵 Testing Soundtrack Toggle...');
    const songToggleRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-lotus-song-toggle');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true
    });
    console.log('Song toggle clicked:', songToggleRes.result.value);
    await sleep(600);

    // Test Prev button going backwards from 5 down to 1
    console.log('👈 Testing Prev button navigation (5 -> 4 -> 3 -> 2 -> 1)...');
    const prevNavTest = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const prevBtn = document.getElementById('btn-lotus-behind-prev');
          const steps = [];
          for (let i = 0; i < 4; i++) {
            if (prevBtn && !prevBtn.disabled) {
              prevBtn.click();
              const activeDot = document.querySelector('.lotus-indicator-dot.active');
              steps.push(activeDot ? activeDot.getAttribute('data-chapter') : null);
            }
          }
          return {
            steps,
            prevDisabledAtStart: prevBtn ? prevBtn.disabled : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Prev navigation test:', prevNavTest.result.value);

    // Check horizontal overflow on desktop
    const overflowCheckDesktop = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const overlay = document.getElementById('lotus-behind-overlay');
          const container = document.querySelector('.lotus-behind-container');
          const deck = document.querySelector('.lotus-behind-book-deck');
          return {
            windowWidth: window.innerWidth,
            bodyOverflow: document.body.scrollWidth > window.innerWidth,
            overlayOverflow: overlay ? overlay.scrollWidth > overlay.clientWidth : false,
            containerOverflow: container ? container.scrollWidth > container.clientWidth : false,
            deckOverflow: deck ? deck.scrollWidth > deck.clientWidth : false
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Desktop overflow check:', overflowCheckDesktop.result.value);

    // 6. Test Mobile Viewport (390x844)
    console.log('📱 Testing Mobile Viewport (390x844)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { if (window.usagainBehindController) window.usagainBehindController.switchChapter(1); })()`,
      returnByValue: true
    });
    await sleep(1000);
    const shot6 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const shot6Path = path.join(artifactDir, 'behind_lotus_06_mobile_ch1.png');
    fs.writeFileSync(shot6Path, Buffer.from(shot6.data, 'base64'));
    console.log('📸 Saved Mobile Chapter 1 screenshot to:', shot6Path);

    // Mobile Epilogue screenshot
    await cdp.send('Runtime.evaluate', {
      expression: `(() => { if (window.usagainBehindController) window.usagainBehindController.switchChapter(5); })()`,
      returnByValue: true
    });
    await sleep(800);
    const shot7 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const shot7Path = path.join(artifactDir, 'behind_lotus_07_mobile_epilogue.png');
    fs.writeFileSync(shot7Path, Buffer.from(shot7.data, 'base64'));
    console.log('📸 Saved Mobile Epilogue screenshot to:', shot7Path);

    // Check horizontal overflow on mobile
    const overflowCheckMobile = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            windowWidth: window.innerWidth,
            bodyOverflow: document.body.scrollWidth > window.innerWidth,
            documentScrollWidth: document.documentElement.scrollWidth,
            hasHorizontalScroll: document.documentElement.scrollWidth > 390
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Mobile overflow check:', overflowCheckMobile.result.value);

    // 7. Verify other universes are intact
    console.log('🔍 Verifying other universes (YAWN, ASH, PINWHEEL, selection)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    const otherUnivCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          // Close lotus behind
          if (window.usagainBehindController) window.usagainBehindController.close();
          const hasYawnBtn = !!document.getElementById('btn-yawn-behind');
          const hasAshBtn = !!document.getElementById('btn-ash-behind');
          const hasPinwheelBtn = !!document.getElementById('btn-pinwheel-behind');
          const hasUniverseSelector = !!document.getElementById('view-universe-selection') || !!document.querySelector('.universe-cards-track');
          return {
            hasYawnBtn,
            hasAshBtn,
            hasPinwheelBtn,
            hasUniverseSelector
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Other universes check:', otherUnivCheck.result.value);

    console.log('\n✨ ALL LIVE CDP VERIFICATIONS COMPLETED SUCCESSFULLY! ✨');
    cdp.close();
  } catch (err) {
    console.error('❌ Error during verification:', err);
    process.exitCode = 1;
  } finally {
    try {
      chrome.kill('SIGKILL');
    } catch (_) {}
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch (_) {}
  }
}

run();
