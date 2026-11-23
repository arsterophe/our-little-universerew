// scratch/capture_usagain_live.mjs
import http from 'http';
import { spawn, exec } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const tempProfile = path.join(os.tmpdir(), 'chrome-usagain-live-' + Date.now());
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${tempProfile}`,
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:5173'
]);

await new Promise(r => setTimeout(r, 2500));

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

try {
  const pages = await getPages();
  const page = pages.find(p => p.url.includes('localhost:5173')) || pages[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);

  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      pending.set(msgId, (data) => resolve(data.result));
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');

  // Set desktop viewport 1920x1080
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 1500));

  // Open Ela's Universe: The Silent Lotus
  const res = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        if (window.universesController && typeof window.universesController.openUsAgainWorld === 'function') {
          window.universesController.openUsAgainWorld();
          return 'opened via controller';
        }
        document.querySelectorAll('.view-section').forEach(el => {
          el.classList.remove('active');
          el.setAttribute('aria-hidden', 'true');
        });
        const v = document.getElementById('view-usagain-world');
        if (v) {
          v.classList.add('active');
          v.setAttribute('aria-hidden', 'false');
          return 'opened via DOM';
        }
        return 'not found';
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Open result:', res);

  await new Promise(r => setTimeout(r, 1200));

  const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

  // Desktop Screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_desktop_1920x1080.jpg'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved desktop screenshot');

  // Open Lotus Pond Modal (Fishing Game)
  await send('Runtime.evaluate', {
    expression: `document.getElementById('btn-loc-usagain-pond')?.click();`
  });
  await new Promise(r => setTimeout(r, 800));

  const shot2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_modal_pond_1920x1080.jpg'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved pond modal screenshot');

  // Close Pond and Open Residence Modal
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('btn-close-usagain-pond')?.click();
      setTimeout(() => {
        document.getElementById('btn-loc-usagain-residence')?.click();
      }, 300);
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shot3 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_modal_residence_1920x1080.jpg'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved residence modal screenshot');

  // Mobile Viewport 390x844
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('btn-close-usagain-residence')?.click();
      document.querySelectorAll('.usagain-modal-overlay').forEach(m => {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
      });
    `
  });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1000));

  const shot4 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_mobile_390x844.jpg'), Buffer.from(shot4.data, 'base64'));
  console.log('Saved mobile screenshot');

  console.log('SUCCESS!');
  ws.close();
} catch (err) {
  console.error(err);
} finally {
  chrome.kill();
  exec('taskkill /F /IM chrome.exe /T', () => {});
}

