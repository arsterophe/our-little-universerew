/**
 * LIVE BROWSER VERIFICATION: PINWHEEL MAILBOX & KOTAK POS
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9297;
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

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  async captureScreenshot(outPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  }
}

async function run() {
  console.log('=== STARTING PINWHEEL MAILBOX LIVE VERIFICATION ===');

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1920,1080',
    `http://localhost:${PORT}/`
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

    const pageTarget = targets?.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    await sleep(2500);

    // 1. Open Pinwheel World cleanly as Syma
    const openPinwheelRes = await client.eval(`
      (async () => {
        try {
          window.isPreviewingUniverses = true;
          const mMod = await import('/mailbox_view.js');
          const kCtrl = mMod.initKotakPosView({
            onNavigateBack: (orig) => {
              const pView = document.getElementById('view-pinwheel-world');
              const kView = document.getElementById('view-kotak-pos');
              if (kView) { kView.classList.remove('active'); kView.setAttribute('aria-hidden', 'true'); }
              if (pView) { pView.classList.add('active'); pView.setAttribute('aria-hidden', 'false'); }
            }
          });
          window.kotakPosController = kCtrl;

          const mod = await import('/pinwheel_view.js');
          const ctrl = mod.initPinwheelWorld({
            onNavigateKotakPos: (orig) => {
              kCtrl.openKotakPos(orig, 'abil');
            }
          });
          window.pinwheelWorldController = ctrl;
          ctrl.openPinwheelWorld({ uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3' });
          const view = document.getElementById('view-pinwheel-world');
          if (view) view.classList.add('active');
          return { ok: true };
        } catch (e) {
          return { ok: false, err: e.message };
        }
      })()
    `);
    console.log('Step 1: openPinwheelWorld returned:', openPinwheelRes);

    await sleep(1000);

    const isPinwheelActive = await client.eval(`
      document.getElementById('view-pinwheel-world')?.classList.contains('active')
    `);
    console.log('Pinwheel view is active:', isPinwheelActive);

    // 2. Test Unread badge simulation on Mailbox
    const badgeTestRes = await client.eval(`
      (() => {
        const badge = document.getElementById('pinwheel-mailbox-unread-badge');
        const btn = document.getElementById('btn-loc-pinwheel-mailbox');
        if (badge && btn) {
          badge.style.display = 'inline-flex';
          badge.textContent = '2';
          btn.classList.add('has-unread');
          return { ok: true, badgeText: badge.textContent, hasUnread: btn.classList.contains('has-unread') };
        }
        return { ok: false };
      })()
    `);
    console.log('Step 2: Mailbox unread badge simulation:', badgeTestRes);

    // Screenshot of Pinwheel world with active Mailbox hotspot & badge
    await client.captureScreenshot(path.join(artDir, 'pinwheel_mailbox_hotspot_badge.png'));
    console.log('Captured: pinwheel_mailbox_hotspot_badge.png');

    // 3. Click Mailbox button to open Modal
    const clickMailboxBtnRes = await client.eval(`
      (() => {
        const btn = document.getElementById('btn-loc-pinwheel-mailbox') ||
                    document.querySelector('.btn-loc-mailbox');
        if (btn) {
          btn.click();
          return { clicked: true, text: btn.textContent.trim() };
        }
        return { clicked: false };
      })()
    `);
    console.log('Step 3: Click Mailbox button:', clickMailboxBtnRes);

    await sleep(600);

    // Check if Mailbox modal is open
    const modalState = await client.eval(`
      (() => {
        const modal = document.getElementById('pinwheel-mailbox-modal');
        const btnOpen = document.getElementById('btn-pinwheel-open-mailbox');
        const statusBadge = document.getElementById('pinwheel-mailbox-status-badge');
        return {
          modalActive: modal?.classList.contains('active'),
          hasOpenBtn: Boolean(btnOpen),
          openBtnText: btnOpen?.textContent.trim(),
          statusText: statusBadge?.textContent.trim()
        };
      })()
    `);
    console.log('Step 4: Mailbox Modal state:', modalState);

    // Screenshot of Mailbox Modal
    await client.captureScreenshot(path.join(artDir, 'pinwheel_mailbox_modal.png'));
    console.log('Captured: pinwheel_mailbox_modal.png');

    // 5. Click "Buka Kotak Pos PINWHEEL ✉" action button
    const clickOpenMailboxRes = await client.eval(`
      (() => {
        const btn = document.getElementById('btn-pinwheel-open-mailbox');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Step 5: Click Open Kotak Pos action button:', clickOpenMailboxRes);

    await sleep(1500);

    // 6. Verify Kotak Pos view active with PINWHEEL theme
    const kotakPosState = await client.eval(`
      (() => {
        const view = document.getElementById('view-kotak-pos');
        const titleEl = document.getElementById('mailbox-universe-title');
        const avatarEl = document.getElementById('mailbox-user-avatar');
        const nameEl = document.getElementById('mailbox-user-name');
        const viewPinwheel = document.getElementById('view-pinwheel-world');
        const selectedPaper = document.querySelector('.mailbox-paper-pill.active')?.getAttribute('data-paper');

        return {
          viewActive: view?.classList.contains('active'),
          themeClass: view?.className,
          universeTitle: titleEl?.textContent.trim(),
          userName: nameEl?.textContent.trim(),
          selectedPaper,
          pinwheelActive: viewPinwheel?.classList.contains('active')
        };
      })()
    `);
    console.log('Step 6: Kotak Pos PINWHEEL state:', kotakPosState);

    // Screenshot of Kotak Pos PINWHEEL (Desktop)
    await client.captureScreenshot(path.join(artDir, 'pinwheel_kotak_pos_desktop.png'));
    console.log('Captured: pinwheel_kotak_pos_desktop.png');

    // 7. Click Compose Tab ("Tulis Surat Baru") to inspect recipient cards & paper themes
    const clickComposeRes = await client.eval(`
      (() => {
        const tab = document.getElementById('mailbox-tab-compose') || document.getElementById('btn-empty-inbox-compose');
        if (tab) {
          tab.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Step 7: Click Compose tab:', clickComposeRes);

    await sleep(800);

    const composeModalState = await client.eval(`
      (() => {
        const panel = document.getElementById('mailbox-panel-compose');
        const recipientCards = Array.from(document.querySelectorAll('#mailbox-recipient-cards .recipient-option-card')).map(c => ({
          char: c.getAttribute('data-recipient'),
          name: c.querySelector('.recipient-card-name')?.textContent.trim(),
          univ: c.querySelector('.recipient-card-univ')?.textContent.trim(),
          selected: c.classList.contains('selected')
        }));
        const paperPills = Array.from(document.querySelectorAll('#mailbox-paper-selector .paper-theme-pill')).map(p => ({
          theme: p.getAttribute('data-paper'),
          label: p.textContent.trim(),
          selected: p.classList.contains('selected')
        }));

        return {
          panelActive: panel?.classList.contains('active'),
          recipientCount: recipientCards.length,
          recipients: recipientCards,
          paperPills
        };
      })()
    `);
    console.log('Step 8: Compose Form State:', JSON.stringify(composeModalState, null, 2));

    // Screenshot of Compose Form with 8 Recipients and PINWHEEL paper theme
    await client.captureScreenshot(path.join(artDir, 'pinwheel_kotak_pos_compose_recipients.png'));
    console.log('Captured: pinwheel_kotak_pos_compose_recipients.png');

    // 8. Test Mobile Viewport (390x844)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(600);

    await client.captureScreenshot(path.join(artDir, 'pinwheel_kotak_pos_mobile.png'));
    console.log('Captured: pinwheel_kotak_pos_mobile.png');

    // Reset Viewport
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(400);

    // 9. Test Back Navigation to PINWHEEL
    const clickBackRes = await client.eval(`
      (() => {
        const btnBack = document.getElementById('btn-mailbox-return-univ');
        if (btnBack) {
          btnBack.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Step 9: Click Back button:', clickBackRes);

    await sleep(1000);

    const returnState = await client.eval(`
      (() => {
        const viewPinwheel = document.getElementById('view-pinwheel-world');
        const viewKotakPos = document.getElementById('view-kotak-pos');
        return {
          pinwheelActive: viewPinwheel?.classList.contains('active'),
          kotakPosActive: viewKotakPos?.classList.contains('active')
        };
      })()
    `);
    console.log('Step 10: Return State:', returnState);

    console.log('=== PINWHEEL MAILBOX VERIFICATION COMPLETE ===');
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch (_) {}
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
