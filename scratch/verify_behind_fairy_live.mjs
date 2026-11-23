import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-behind-fairy-'));
const port = 9394;
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
  await new Promise(r => setTimeout(r, 2500));

  // Switch to TO YOU world and open BEHIND THE FAIRY
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

      const btnBehind = document.getElementById('btn-toyou-behind');
      if (btnBehind) btnBehind.click();
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capture Chapter 1
  const shotCh1 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const ch1Path = path.join(artifactDir, 'behind_fairy_chapter1_live.jpg');
  fs.writeFileSync(ch1Path, Buffer.from(shotCh1.data, 'base64'));
  console.log('✅ Captured behind_fairy_chapter1_live.jpg');

  // Switch to Chapter 2
  await send('Runtime.evaluate', {
    expression: `
      const tab2 = document.querySelector('.fairy-behind-tab-btn[data-chapter="2"]');
      if (tab2) tab2.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shotCh2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const ch2Path = path.join(artifactDir, 'behind_fairy_chapter2_live.jpg');
  fs.writeFileSync(ch2Path, Buffer.from(shotCh2.data, 'base64'));
  console.log('✅ Captured behind_fairy_chapter2_live.jpg');

  // Switch to Chapter 3 (Letter)
  await send('Runtime.evaluate', {
    expression: `
      const tab3 = document.querySelector('.fairy-behind-tab-btn[data-chapter="3"]');
      if (tab3) tab3.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shotCh3 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const ch3Path = path.join(artifactDir, 'behind_fairy_chapter3_letter_live.jpg');
  fs.writeFileSync(ch3Path, Buffer.from(shotCh3.data, 'base64'));
  console.log('✅ Captured behind_fairy_chapter3_letter_live.jpg');

  // Switch to Epilogue (Chapter 4)
  await send('Runtime.evaluate', {
    expression: `
      const tab4 = document.querySelector('.fairy-behind-tab-btn[data-chapter="4"]');
      if (tab4) tab4.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shotCh4 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const ch4Path = path.join(artifactDir, 'behind_fairy_chapter4_epilogue_live.jpg');
  fs.writeFileSync(ch4Path, Buffer.from(shotCh4.data, 'base64'));
  console.log('✅ Captured behind_fairy_chapter4_epilogue_live.jpg');

  // 5. Mobile View (390x844) on Chapter 1
  await send('Runtime.evaluate', {
    expression: `
      const tab1 = document.querySelector('.fairy-behind-tab-btn[data-chapter="1"]');
      if (tab1) tab1.click();
    `
  });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1000));

  const shotMobile = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  const mobilePath = path.join(artifactDir, 'behind_fairy_mobile_390_live.jpg');
  fs.writeFileSync(mobilePath, Buffer.from(shotMobile.data, 'base64'));
  console.log('✅ Captured behind_fairy_mobile_390_live.jpg');

  ws.close();
  cp.kill();
  console.log('🎉 All live screenshots captured successfully!');
}

run().catch(err => {
  console.error('Error during live screenshot capture:', err);
  try { cp.kill(); } catch (_) { }
});
