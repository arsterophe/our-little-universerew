import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-behind-shadow-'));
const port = 9397;
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

  // 1. Desktop View (1920x1080)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 3000));

  // Initialize and open BEHIND THE SHADOW
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

        const shadowBehind = await import('/shadow_behind_view.js');
        shadowBehind.openBehindShadow();

        const ov = document.getElementById('shadow-behind-overlay');
        return {
          exists: !!ov,
          isActive: ov ? ov.classList.contains('active') : false,
          computedDisplay: ov ? window.getComputedStyle(ov).display : 'none'
        };
      })()
    `
  });
  console.log('Open Behind Shadow status:', openRes.result.value);
  await new Promise(r => setTimeout(r, 1200));

  // Capture Chapter 1
  const ch1Shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'behind_shadow_ch1_desktop.jpg'), Buffer.from(ch1Shot.data, 'base64'));
  console.log('Captured Chapter 1: behind_shadow_ch1_desktop.jpg');

  // Switch to Chapter 2
  await send('Runtime.evaluate', {
    expression: `
      const tab2 = document.querySelector('.shadow-behind-tab-btn[data-chapter="2"]');
      if (tab2) tab2.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  const ch2Shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'behind_shadow_ch2_desktop.jpg'), Buffer.from(ch2Shot.data, 'base64'));
  console.log('Captured Chapter 2: behind_shadow_ch2_desktop.jpg');

  // Switch to Chapter 3
  await send('Runtime.evaluate', {
    expression: `
      const tab3 = document.querySelector('.shadow-behind-tab-btn[data-chapter="3"]');
      if (tab3) tab3.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  const ch3Shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'behind_shadow_ch3_desktop.jpg'), Buffer.from(ch3Shot.data, 'base64'));
  console.log('Captured Chapter 3: behind_shadow_ch3_desktop.jpg');

  // Switch to Chapter 4 (Epilogue with YouTube player)
  await send('Runtime.evaluate', {
    expression: `
      const tab4 = document.querySelector('.shadow-behind-tab-btn[data-chapter="4"]');
      if (tab4) tab4.click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const ch4Shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'behind_shadow_ch4_desktop.jpg'), Buffer.from(ch4Shot.data, 'base64'));
  console.log('Captured Chapter 4: behind_shadow_ch4_desktop.jpg');

  // 2. Mobile View (390x844 - iPhone 12/13/14)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 800));
  const mobileShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'behind_shadow_mobile_390.jpg'), Buffer.from(mobileShot.data, 'base64'));
  console.log('Captured Mobile: behind_shadow_mobile_390.jpg');

  // Verify close action
  const closeRes = await send('Runtime.evaluate', {
    expression: `
      const closeBtn = document.getElementById('btn-close-shadow-behind');
      if (closeBtn) closeBtn.click();
      const ov = document.getElementById('shadow-behind-overlay');
      ({
        isActive: ov ? ov.classList.contains('active') : false,
        ariaHidden: ov ? ov.getAttribute('aria-hidden') : null
      });
    `,
    returnByValue: true
  });
  console.log('Close verification result:', closeRes.result.value);

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
