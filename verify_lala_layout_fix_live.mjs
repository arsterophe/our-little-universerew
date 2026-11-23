import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-lala-fix-'));
const port = 9390;
const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

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
    await sleep(3500);

    // 1. Audit Initial Selection Page
    console.log('--- 1. Auditing Initial Character Selection Page ---');
    const selectionAudit = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const viewSelection = document.getElementById('view-selection');
          const fairyAtelier = document.getElementById('view-fairy-atelier');
          const wardrobePanel = document.getElementById('panel-atelier-wardrobe');
          const dressingPanel = document.getElementById('panel-atelier-dressing-room');
          
          const atelierComputed = fairyAtelier ? window.getComputedStyle(fairyAtelier) : null;
          
          return {
            hasViewSelection: !!viewSelection,
            isSelectionActive: viewSelection ? viewSelection.classList.contains('active') : false,
            hasFairyAtelier: !!fairyAtelier,
            fairyAtelierDisplay: atelierComputed ? atelierComputed.display : null,
            fairyAtelierVisibility: atelierComputed ? atelierComputed.visibility : null,
            fairyAtelierActive: fairyAtelier ? fairyAtelier.classList.contains('active') : false,
            bodyScrollWidth: document.body.scrollWidth,
            bodyClientWidth: document.body.clientWidth,
            hasHorizontalOverflow: document.body.scrollWidth > document.body.clientWidth,
            textFairyWardrobeVisible: fairyAtelier ? atelierComputed.display !== 'none' : false
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Initial Selection Audit:', selectionAudit.result.value);

    // Capture clean selection page screenshot
    const shot1 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const shot1Path = path.join(artifactDir, 'lala_fix_01_clean_selection.jpg');
    fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
    console.log('📸 Saved Selection Page screenshot to:', shot1Path);

    // 2. Click Lala character card to open Lala login view
    console.log('--- 2. Auditing Lala Login Page ---');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const cardLala = document.getElementById('card-lala');
          if (cardLala) cardLala.click();
        })()
      `,
      returnByValue: true
    });
    await sleep(1000);

    const loginAudit = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const viewLogin = document.getElementById('view-login');
          const fairyAtelier = document.getElementById('view-fairy-atelier');
          const atelierComputed = fairyAtelier ? window.getComputedStyle(fairyAtelier) : null;
          const loginCharName = document.getElementById('login-char-name');
          const loginCharImg = document.getElementById('login-char-img');
          const glassCard = document.getElementById('glass-login-card');

          return {
            isLoginActive: viewLogin ? viewLogin.classList.contains('active') : false,
            selectedChar: loginCharName ? loginCharName.textContent.trim() : null,
            loginCharImgSrc: loginCharImg ? loginCharImg.src : null,
            glassCardVisible: glassCard ? window.getComputedStyle(glassCard).display !== 'none' : false,
            fairyAtelierDisplay: atelierComputed ? atelierComputed.display : null,
            hasHorizontalOverflow: document.body.scrollWidth > document.body.clientWidth
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Lala Login Audit:', loginAudit.result.value);

    // Capture clean Lala login screenshot
    const shot2 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const shot2Path = path.join(artifactDir, 'lala_fix_02_clean_login.jpg');
    fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
    console.log('📸 Saved Lala Login screenshot to:', shot2Path);

    // 3. Test Mobile Viewport (390x844)
    console.log('--- 3. Auditing Mobile Viewport (390x844) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(600);

    const mobileAudit = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const fairyAtelier = document.getElementById('view-fairy-atelier');
          const atelierComputed = fairyAtelier ? window.getComputedStyle(fairyAtelier) : null;
          return {
            bodyScrollWidth: document.body.scrollWidth,
            bodyClientWidth: document.body.clientWidth,
            hasHorizontalOverflow: document.body.scrollWidth > document.body.clientWidth,
            fairyAtelierDisplay: atelierComputed ? atelierComputed.display : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Mobile Viewport Audit:', mobileAudit.result.value);

    const shot3 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    const shot3Path = path.join(artifactDir, 'lala_fix_03_mobile_login.jpg');
    fs.writeFileSync(shot3Path, Buffer.from(shot3.data, 'base64'));
    console.log('📸 Saved Mobile Login screenshot to:', shot3Path);

    // Reset to desktop viewport
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    // 4. Test Opening The Fairy Atelier from TO YOU world (to verify feature still works 100%)
    console.log('--- 4. Auditing The Fairy Atelier Inside TO YOU World ---');
    const atelierOpenAudit = await cdp.send('Runtime.evaluate', {
      expression: `
        (async () => {
          // Switch to TO YOU world
          window.isPreviewingUniverses = true;
          document.querySelectorAll('.view-section').forEach(v => {
            v.classList.remove('active');
            v.setAttribute('aria-hidden', 'true');
          });
          const toyouView = document.getElementById('view-toyou-world');
          if (toyouView) {
            toyouView.classList.add('active');
            toyouView.setAttribute('aria-hidden', 'false');
          }

          // Import and open Fairy Atelier
          const atelierMod = await import('/fairy_atelier_view.js');
          const ctrl = atelierMod.initFairyAtelierView({
            onShowToast: () => {},
            onTriggerSparkle: () => {},
            onNavigateBack: () => {}
          });
          await ctrl.openFairyAtelier();

          const fairyAtelier = document.getElementById('view-fairy-atelier');
          const atelierComputed = fairyAtelier ? window.getComputedStyle(fairyAtelier) : null;
          const wardrobePanel = document.getElementById('panel-atelier-wardrobe');
          const wardrobeComputed = wardrobePanel ? window.getComputedStyle(wardrobePanel) : null;

          return {
            fairyAtelierActive: fairyAtelier ? fairyAtelier.classList.contains('active') : false,
            fairyAtelierDisplay: atelierComputed ? atelierComputed.display : null,
            fairyAtelierPosition: atelierComputed ? atelierComputed.position : null,
            wardrobeActive: wardrobePanel ? wardrobePanel.classList.contains('active') : false,
            wardrobeDisplay: wardrobeComputed ? wardrobeComputed.display : null
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Fairy Atelier Open Audit:', atelierOpenAudit.result.value);
    await sleep(1000);

    const shot4 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const shot4Path = path.join(artifactDir, 'lala_fix_04_atelier_working.jpg');
    fs.writeFileSync(shot4Path, Buffer.from(shot4.data, 'base64'));
    console.log('📸 Saved Active Atelier screenshot to:', shot4Path);

    // 5. Test closing Fairy Atelier returns cleanly
    console.log('--- 5. Auditing Closing The Fairy Atelier ---');
    const closeAudit = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btnBack = document.getElementById('btn-fairy-atelier-back');
          if (btnBack) btnBack.click();
          const fairyAtelier = document.getElementById('view-fairy-atelier');
          const atelierComputed = fairyAtelier ? window.getComputedStyle(fairyAtelier) : null;
          return {
            fairyAtelierActive: fairyAtelier ? fairyAtelier.classList.contains('active') : false,
            fairyAtelierDisplay: atelierComputed ? atelierComputed.display : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Close Atelier Audit:', closeAudit.result.value);

    console.log('✨ All live CDP audits completed successfully!');
    cdp.close();
  } catch (err) {
    console.error('❌ CDP Verification failed:', err);
    process.exitCode = 1;
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
  }
}

run();
