/**
 * LIVE BROWSER VERIFICATION: ELA'S (US AGAIN 🪷) TELESCOPE & STAR MESSAGES
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9315;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

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
      awaitPromise: true
    });
    return res.result?.value;
  }

  async screenshot(filePath, quality = 88) {
    const res = await this.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality
    });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`  [Screenshot saved]: ${filePath}`);
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log('LIVE CDP VERIFICATION: ELA (US AGAIN 🪷) TELESCOPE & STAR MESSAGES');
  console.log('================================================================');

  const userDataDir = path.resolve('./scratch/cdp_profile_ela_telescope_' + Date.now());
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1920,1080',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const list = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        wsUrl = list[0].webSocketDebuggerUrl;
        break;
      }
    } catch (_) {}
  }

  if (!wsUrl) throw new Error('Failed to obtain Chrome CDP WebSocket URL');

  const cdp = new CDPClient(wsUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  try {
    console.log('1. Navigating to http://localhost:5173 ...');
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    await sleep(2500);

    // 2. Render Ela session and open US AGAIN world
    console.log('2. Rendering Ela session and opening US AGAIN world...');
    const enterRes = await cdp.eval(`
      (async () => {
        const { ensureUniversesController, renderPrivateUniverse } = await import('/main.js');
        const { logoutFirebase } = await import('/firebase.js');
        try {
          await logoutFirebase();
        } catch (_) {}

        const univCtrl = await ensureUniversesController();
        
        const elaUser = {
          uid: 'plxSNowjCkOMfUQMAwnZzQPR9Xr1',
          email: 'ela@ourlittleuniverse.com',
          displayName: 'Ela',
          emailVerified: true
        };

        const charConfig = {
          name: 'Ela',
          characterKey: 'ela',
          universe: 'US AGAIN',
          symbol: '🪷',
          themeClass: 'theme-ela'
        };

        const viewSel = document.getElementById('view-selection');
        if (viewSel) {
          viewSel.classList.remove('active');
          viewSel.setAttribute('aria-hidden', 'true');
          viewSel.style.display = 'none';
        }

        const viewLogin = document.getElementById('view-login');
        if (viewLogin) {
          viewLogin.classList.remove('active');
          viewLogin.setAttribute('aria-hidden', 'true');
          viewLogin.style.display = 'none';
        }

        const loader = document.getElementById('cosmic-app-loader');
        if (loader) {
          loader.classList.add('loaded');
          loader.style.display = 'none';
        }

        await renderPrivateUniverse(elaUser, charConfig, false);
        await new Promise(r => setTimeout(r, 400));

        document.querySelectorAll('.view-section').forEach(s => {
          s.classList.remove('active');
          s.setAttribute('aria-hidden', 'true');
          s.style.display = 'none';
        });

        const worldSec = document.getElementById('view-usagain-world');
        if (worldSec) {
          worldSec.classList.add('active');
          worldSec.setAttribute('aria-hidden', 'false');
          worldSec.style.display = 'block';
        }

        univCtrl.openUsAgainWorld(elaUser);
        if (worldSec) {
          worldSec.style.display = 'block';
        }
        await new Promise(r => setTimeout(r, 1000));

        return {
          usagainWorldActive: document.getElementById('view-usagain-world')?.classList.contains('active'),
          hasObservatoryBtn: !!document.getElementById('btn-loc-usagain-observatory'),
          badgeCount: document.getElementById('usagain-observatory-unread-badge')?.textContent
        };
      })()
    `);
    console.log('Enter US AGAIN result:', enterRes);
    await sleep(800);

    // Capture Hotspot
    const shot1 = path.join(ARTIFACT_DIR, 'ela_telescope_01_observatory_hotspot.jpg');
    await cdp.screenshot(shot1);

    // 3. Click Observatory hotspot
    console.log('3. Clicking Observatory hotspot button...');
    const modalRes = await cdp.eval(`
      (() => {
        const btn = document.getElementById('btn-loc-usagain-observatory');
        if (btn) btn.click();

        const btnCycle = document.getElementById('btn-usagain-cycle-constellation');
        if (btnCycle) btnCycle.click();

        const btnLog = document.getElementById('btn-usagain-log-constellation');
        if (btnLog) btnLog.click();

        return {
          modalActive: document.getElementById('usagain-observatory-modal')?.classList.contains('active'),
          constellationName: document.getElementById('usagain-constellation-name')?.textContent,
          constellationSymbol: document.getElementById('usagain-constellation-symbol')?.textContent,
          unreadCountTag: document.getElementById('usagain-observatory-modal-unread-count')?.textContent
        };
      })()
    `);
    console.log('Observatory modal opened:', modalRes);
    await sleep(800);

    const shot2 = path.join(ARTIFACT_DIR, 'ela_telescope_02_observatory_modal.jpg');
    await cdp.screenshot(shot2);

    // 4. Open Star Messages from modal
    console.log('4. Opening Star Messages from Observatory modal...');
    const openStarRes = await cdp.eval(`
      (async () => {
        const btnOpenStar = document.getElementById('btn-usagain-open-starmessages');
        if (btnOpenStar) btnOpenStar.click();

        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 100));
          if (document.getElementById('view-star-messages')?.classList.contains('active')) break;
        }

        const hudTitle = document.getElementById('star-univ-badge')?.textContent || document.querySelector('.star-library-badge')?.textContent || document.querySelector('.star-universe-tag')?.textContent || document.querySelector('.univ-tag')?.textContent;
        return {
          starMessagesActive: document.getElementById('view-star-messages')?.classList.contains('active'),
          hudTitle
        };
      })()
    `);
    console.log('Star Messages open result:', openStarRes);
    await sleep(1000);

    const shot3 = path.join(ARTIFACT_DIR, 'ela_telescope_03_star_messages_explore.jpg');
    await cdp.screenshot(shot3);

    // 5. Switch to Compose tab
    console.log('5. Switching to Compose tab...');
    const composeRes = await cdp.eval(`
      (() => {
        const composeTabBtn = document.querySelector('.star-tab-btn[data-tab="compose"]');
        if (composeTabBtn) composeTabBtn.click();

        const recipients = Array.from(document.querySelectorAll('.recipient-select-card')).map(c => ({
          char: c.getAttribute('data-recipient'),
          name: c.querySelector('.rec-name')?.textContent?.trim()
        }));

        return {
          recipientsCount: recipients.length,
          recipients
        };
      })()
    `);
    console.log('Compose tab recipients:', composeRes);
    await sleep(800);

    const shot4 = path.join(ARTIFACT_DIR, 'ela_telescope_04_star_messages_compose.jpg');
    await cdp.screenshot(shot4);

    // 6. Switch to Inbox tab
    console.log('6. Switching to Inbox tab...');
    await cdp.eval(`
      (() => {
        const inboxTabBtn = document.querySelector('.star-tab-btn[data-tab="inbox"]');
        if (inboxTabBtn) inboxTabBtn.click();
      })();
    `);
    await sleep(800);

    const shot5 = path.join(ARTIFACT_DIR, 'ela_telescope_05_star_messages_inbox.jpg');
    await cdp.screenshot(shot5);

    // 7. Mobile 390px Viewport Test
    console.log('7. Testing mobile responsive view (390px)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);

    const shot6 = path.join(ARTIFACT_DIR, 'ela_telescope_06_mobile_390.jpg');
    await cdp.screenshot(shot6);

    console.log('\nAll 6 live screenshots captured successfully!');
    await cdp.close();
  } finally {
    try {
      chromeProc.kill();
    } catch (_) {}
  }
}

main().catch((err) => {
  console.error('Fatal error during live browser verification:', err);
  process.exit(1);
});
