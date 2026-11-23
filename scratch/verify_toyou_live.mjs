import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-toyou-live-'));
const port = 9391;
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

  // Switch to TO YOU world cleanly
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
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Capture Desktop Overview
  const shotDesktop = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const desktopPath = path.join(artifactDir, 'toyou_cleaned_desktop_live.jpg');
  fs.writeFileSync(desktopPath, Buffer.from(shotDesktop.data, 'base64'));
  console.log('✅ Captured toyou_cleaned_desktop_live.jpg');

  // 2. Open Mood Picker & choose mood
  await send('Runtime.evaluate', {
    expression: `
      const btnToggle = document.getElementById('btn-toggle-toyou-mood-picker');
      if (btnToggle) btnToggle.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shotMoodPicker = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const moodPickerPath = path.join(artifactDir, 'toyou_mood_picker_opened_live.jpg');
  fs.writeFileSync(moodPickerPath, Buffer.from(shotMoodPicker.data, 'base64'));
  console.log('✅ Captured toyou_mood_picker_opened_live.jpg');

  // 3. Mobile View (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1200));

  const shotMobile = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  const mobilePath = path.join(artifactDir, 'toyou_cleaned_mobile_live.jpg');
  fs.writeFileSync(mobilePath, Buffer.from(shotMobile.data, 'base64'));
  console.log('✅ Captured toyou_cleaned_mobile_live.jpg');

  ws.close();
  cp.kill();
  console.log('🎉 Live verification completed successfully!');
}

run().catch(err => {
  console.error('Error running live verification:', err);
  try { cp.kill(); } catch (_) { }
});
