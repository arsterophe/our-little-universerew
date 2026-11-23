import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-hot-capture-'));
const port = 9288;
const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
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
    await sleep(200);
  }
  throw new Error('Chrome WS unreachable');
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);

    let msgId = 1;
    const pending = new Map();

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, (data) => resolve(data.result));
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('1. Setting Desktop 1920x1080 Viewport...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('2. Navigating to localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    console.log('3. Activating view-hot-world & preventing reload...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          window.isPreviewingUniverses = true;
          document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
          const hotView = document.getElementById('view-hot-world');
          if (hotView) {
            hotView.classList.add('active');
            hotView.setAttribute('aria-hidden', 'false');
          }
        })()
      `
    });
    await sleep(1000);

    // Desktop Main View
    console.log('4. Capturing hot_universe_desktop_1920x1080.jpg...');
    const shot1 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'hot_universe_desktop_1920x1080.jpg'), Buffer.from(shot1.data, 'base64'));

    // Residence Modal
    console.log('5. Capturing hot_universe_residence_modal_1920x1080.jpg...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
          document.getElementById('view-hot-world')?.classList.add('active');
          document.querySelectorAll('.hot-modal-overlay').forEach(m => m.classList.remove('open'));
          const m = document.getElementById('hot-residence-modal');
          if (m) {
            m.classList.add('open');
            m.setAttribute('aria-hidden', 'false');
          }
        })()
      `
    });
    await sleep(600);
    const shot2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'hot_universe_residence_modal_1920x1080.jpg'), Buffer.from(shot2.data, 'base64'));

    // Gecko Sanctuary (Kip) Modal
    console.log('6. Capturing hot_universe_gecko_modal_1920x1080.jpg...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
          document.getElementById('view-hot-world')?.classList.add('active');
          document.querySelectorAll('.hot-modal-overlay').forEach(m => m.classList.remove('open'));
          const m = document.getElementById('hot-gecko-modal');
          if (m) {
            m.classList.add('open');
            m.setAttribute('aria-hidden', 'false');
          }
        })()
      `
    });
    await sleep(600);
    const shot3 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'hot_universe_gecko_modal_1920x1080.jpg'), Buffer.from(shot3.data, 'base64'));

    // Mobile Viewport 390x844
    console.log('7. Capturing hot_universe_mobile_390x844.jpg...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          document.querySelectorAll('.hot-modal-overlay').forEach(m => m.classList.remove('open'));
          document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
          document.getElementById('view-hot-world')?.classList.add('active');
        })()
      `
    });
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);
    const shot4 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'hot_universe_mobile_390x844.jpg'), Buffer.from(shot4.data, 'base64'));

    console.log('--- ALL CAPTURES COMPLETE ---');
    ws.close();
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
  }
}

run();

