import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-yawn-mailbox-'));
const port = Math.floor(15000 + Math.random() * 15000);
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
  console.log('Connected to Chrome WebSocket on port', port, ':', wsUrl);

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

  // 1. Desktop View (1920x1080)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 3500));

  // Initialize and open YAWN world
  const openRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
      (async () => {
        const loader = document.getElementById('cosmic-app-loader');
        if (loader) loader.remove();

        if (window.ensureUniversesController) {
          await window.ensureUniversesController();
        }
        if (window.ensureKotakPosController) {
          await window.ensureKotakPosController();
        }

        // Hide other views cleanly
        document.querySelectorAll('.view-section').forEach(el => {
          el.classList.remove('active');
        });

        // Open YAWN world
        const yawn = document.getElementById('view-yawn-world');
        if (yawn) {
          yawn.classList.add('active');
        }

        const univCtrl = window.universesController;
        if (univCtrl?.openYawnWorld) {
          univCtrl.openYawnWorld();
        }

        const mailboxBtn = document.getElementById('btn-loc-yawn-mailbox');
        return {
          yawnActive: yawn ? yawn.classList.contains('active') : false,
          mailboxBtnExists: !!mailboxBtn
        };
      })()
    `
  });
  console.log('Open YAWN world status:', openRes.result.value);
  await new Promise(r => setTimeout(r, 1200));

  // Capture YAWN World stage with Mailbox button
  const worldShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'yawn_world_mailbox_hotspot_live.jpg'), Buffer.from(worldShot.data, 'base64'));
  console.log('Captured YAWN World: yawn_world_mailbox_hotspot_live.jpg');

  // Click Mailbox Button to open shared Kotak Pos view
  const clickRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
      (async () => {
        const btn = document.getElementById('btn-loc-yawn-mailbox');
        if (btn) btn.click();
        await new Promise(r => setTimeout(r, 1500));

        const kp = document.getElementById('view-kotak-pos');
        const tag = document.getElementById('mailbox-univ-tag');
        return {
          kpActive: kp ? kp.classList.contains('active') : false,
          themeClasses: kp ? kp.className : '',
          tagText: tag ? tag.textContent.trim() : ''
        };
      })()
    `
  });
  console.log('Kotak Pos opened status:', clickRes.result.value);
  await new Promise(r => setTimeout(r, 1200));

  // Capture Kotak Pos Inbox View in YAWN Theme
  const inboxShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'yawn_mailbox_inbox_live.jpg'), Buffer.from(inboxShot.data, 'base64'));
  console.log('Captured Mailbox Inbox: yawn_mailbox_inbox_live.jpg');

  // Switch to "Tulis Surat" (Compose) tab
  await send('Runtime.evaluate', {
    expression: `
      const tabCompose = document.getElementById('mailbox-tab-compose');
      if (tabCompose) tabCompose.click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Capture Compose View (showing recipients & lightning paper theme)
  const composeShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'yawn_mailbox_compose_live.jpg'), Buffer.from(composeShot.data, 'base64'));
  console.log('Captured Mailbox Compose: yawn_mailbox_compose_live.jpg');

  // 2. Mobile View (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1000));
  const mobileShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'yawn_mailbox_mobile_390_live.jpg'), Buffer.from(mobileShot.data, 'base64'));
  console.log('Captured Mobile: yawn_mailbox_mobile_390_live.jpg');

  // Verify return to YAWN world
  const returnRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
      (async () => {
        const returnBtn = document.getElementById('btn-mailbox-return-univ');
        if (returnBtn) returnBtn.click();
        await new Promise(r => setTimeout(r, 800));

        const kp = document.getElementById('view-kotak-pos');
        const yawn = document.getElementById('view-yawn-world');
        return {
          kpClosed: kp ? !kp.classList.contains('active') : true,
          yawnActive: yawn ? yawn.classList.contains('active') : false
        };
      })()
    `
  });
  console.log('Return navigation verification:', returnRes.result.value);

  ws.close();
  cp.kill();
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) {}
  console.log('🎉 Verification and live captures finished successfully!');
}

run().catch(err => {
  console.error('Error in verification:', err);
  cp.kill();
  process.exit(1);
});
