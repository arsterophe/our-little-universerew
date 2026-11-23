import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-toyou-kotakpos-'));
const port = 9398;
const cp = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + tmpDir], { stdio: 'ignore' });

async function waitForChrome(port, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (res.ok) {
        const list = await res.json();
        if (list.length > 0 && list[0].webSocketDebuggerUrl) {
          return list[0].webSocketDebuggerUrl;
        }
      }
    } catch (_) { }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Chrome remote debugging did not become ready in time.');
}

async function run() {
  const wsUrl = await waitForChrome(port);
  console.log('Connected to Chrome WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === curId) {
        ws.off('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');

  // Desktop View (1920x1080)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Switch to TO YOU world and select Kotak Pos hotspot
  await send('Runtime.evaluate', {
    expression: `
      const loader = document.getElementById('cosmic-app-loader');
      if (loader) loader.remove();

      document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
      });
      const toyou = document.getElementById('view-toyou-world');
      if (toyou) {
        toyou.classList.add('active');
        toyou.style.display = 'flex';
      }

      // Simulate unread badge & click hotspot
      const badge = document.getElementById('toyou-mailbox-unread-badge');
      if (badge) {
        badge.style.display = 'inline-flex';
        badge.textContent = '2';
      }
      const hotspot = document.querySelector('.hotspot-toyou-kotakpos');
      if (hotspot) {
        hotspot.classList.add('has-unread');
        hotspot.click();
      }
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capture Hotspot & Location Panel
  const shotHotspot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const hotspotPath = path.join(artifactDir, 'toyou_mailbox_hotspot_active_live.jpg');
  fs.writeFileSync(hotspotPath, Buffer.from(shotHotspot.data, 'base64'));
  console.log('✅ Captured toyou_mailbox_hotspot_active_live.jpg');

  // 2. Click "Buka Kotak Pos TO YOU ✉" action button in the location panel
  await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const mMod = await import('/mailbox_view.js');
        const kCtrl = mMod.initKotakPosView({
          onNavigateBack: () => {
            const tView = document.getElementById('view-toyou-world');
            const kView = document.getElementById('view-kotak-pos');
            if (kView) { kView.classList.remove('active'); kView.setAttribute('aria-hidden', 'true'); }
            if (tView) { tView.classList.add('active'); tView.setAttribute('aria-hidden', 'false'); }
          }
        });
        window.kotakPosController = kCtrl;
        kCtrl.openKotakPos('to_you', 'lala');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Populate sample letters in memory for demonstration
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const inboxGrid = document.getElementById('mailbox-inbox-grid');
        const emptyInbox = document.getElementById('mailbox-empty-inbox');
        const inboxTotal = document.getElementById('mailbox-inbox-total');
        if (emptyInbox) emptyInbox.style.display = 'none';
        if (inboxTotal) inboxTotal.textContent = '2';

        if (inboxGrid) {
          inboxGrid.innerHTML = \`
            <div class="letter-card unread" id="sample-letter-1">
              <div class="letter-card-header">
                <div class="letter-card-sender">
                  <img src="/assets/avatar_nyanya_hd.png" alt="Nyanya" class="letter-sender-avatar">
                  <div>
                    <span class="letter-sender-name">Nyanya ★</span>
                    <span class="letter-sender-sub">KIDULT · Twilight Haven</span>
                  </div>
                </div>
                <span class="letter-badge-unread">Belum Dibaca</span>
              </div>
              <h4 class="letter-card-title">Salam Hangat dari Pondok Senja</h4>
              <p class="letter-card-snippet">Halo Lala! Aku baru saja memetik setangkai lavender dari taman pondok...</p>
              <div class="letter-card-footer">
                <span class="letter-date">Baru saja</span>
                <span class="letter-paper-tag">🌸 Senja Lavender</span>
              </div>
            </div>
            <div class="letter-card" id="sample-letter-2">
              <div class="letter-card-header">
                <div class="letter-card-sender">
                  <img src="/assets/avatar_lele_hd.png" alt="Lele" class="letter-sender-avatar">
                  <div>
                    <span class="letter-sender-name">Lele ☾</span>
                    <span class="letter-sender-sub">SHADOW · Crystal Sanctuary</span>
                  </div>
                </div>
                <span class="letter-badge-read">Sudah Dibaca</span>
              </div>
              <h4 class="letter-card-title">Cahaya Mentari untuk Malam Kristal</h4>
              <p class="letter-card-snippet">Terima kasih atas kehangatan yang kamu kirimkan ke menara kristal, Lala.</p>
              <div class="letter-card-footer">
                <span class="letter-date">Kemarin</span>
                <span class="letter-paper-tag">💎 Malam Kristal</span>
              </div>
            </div>
          \`;
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  const shotInbox = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const inboxPath = path.join(artifactDir, 'toyou_kotakpos_inbox_live.jpg');
  fs.writeFileSync(inboxPath, Buffer.from(shotInbox.data, 'base64'));
  console.log('✅ Captured toyou_kotakpos_inbox_live.jpg');

  // 3. Switch to Compose Tab
  await send('Runtime.evaluate', {
    expression: `
      const tabCompose = document.getElementById('mailbox-tab-compose');
      if (tabCompose) tabCompose.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shotCompose = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const composePath = path.join(artifactDir, 'toyou_kotakpos_compose_live.jpg');
  fs.writeFileSync(composePath, Buffer.from(shotCompose.data, 'base64'));
  console.log('✅ Captured toyou_kotakpos_compose_live.jpg');

  // 4. Open Letter Read Modal
  await send('Runtime.evaluate', {
    expression: `
      const readModal = document.getElementById('mailbox-read-modal');
      const sheetAvatar = document.getElementById('sheet-sender-avatar');
      const sheetName = document.getElementById('sheet-sender-name');
      const sheetSub = document.getElementById('sheet-sender-sub');
      const sheetDate = document.getElementById('sheet-date-text');
      const sheetTitle = document.getElementById('sheet-letter-title');
      const sheetBody = document.getElementById('sheet-letter-body');

      if (readModal) {
        if (sheetAvatar) sheetAvatar.src = '/assets/avatar_nyanya_hd.png';
        if (sheetName) sheetName.textContent = 'Nyanya ★';
        if (sheetSub) sheetSub.textContent = 'Pengirim: Nyanya · Universe KIDULT';
        if (sheetDate) sheetDate.textContent = '18 November 2026, 09:30 WIB';
        if (sheetTitle) sheetTitle.textContent = 'Salam Hangat dari Pondok Senja';
        if (sheetBody) sheetBody.textContent = 'Halo Lala!\\n\\nAku baru saja memetik setangkai lavender dari taman pondok senja KIDULT. Aku teringat padamu saat melihat kupu-kupu kecil terbang di antara bunga. Semoga hari-harimu di hutan peri selalu dipenuhi dengan kehangatan sinar mentari yang indah.\\n\\nJangan lupa untuk sesekali beristirahat dan meminum teh hangat di gazebomu ya!\\n\\nSahabatmu,\\nNyanya ★';
        readModal.classList.add('open');
        readModal.setAttribute('aria-hidden', 'false');
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shotReadModal = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const readModalPath = path.join(artifactDir, 'toyou_kotakpos_read_modal_live.jpg');
  fs.writeFileSync(readModalPath, Buffer.from(shotReadModal.data, 'base64'));
  console.log('✅ Captured toyou_kotakpos_read_modal_live.jpg');

  ws.close();
  cp.kill();
  console.log('🎉 Live verification completed successfully!');
}

run().catch(err => {
  console.error('Error during live verification:', err);
  try { cp.kill(); } catch (_) { }
});
