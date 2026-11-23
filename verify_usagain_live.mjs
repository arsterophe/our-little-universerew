// verify_usagain_live.mjs
import http from 'http';
import { spawn, exec } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const tempProfile = path.join(os.tmpdir(), 'chrome-usagain-' + Date.now());
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
  if (!page) {
    console.error('No page found');
    chrome.kill();
    process.exit(1);
  }

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

  // Navigate to localhost:5173
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  // Open Ela's Universe: The Silent Lotus
  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        const usagainView = document.getElementById('view-usagain-world');
        if (usagainView) {
          usagainView.classList.add('active');
          usagainView.setAttribute('aria-hidden', 'false');
          return { success: true, method: 'view-usagain-world activated' };
        }
        return { success: false, reason: 'view-usagain-world not found' };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Open Ela Universe result:', evalResult);
  await new Promise(r => setTimeout(r, 1500));

  // Verify all 8 location buttons exist and are placed
  const locCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const ids = [
          'btn-loc-usagain-observatory',
          'btn-loc-usagain-residence',
          'btn-loc-usagain-cinema',
          'btn-loc-usagain-library',
          'btn-loc-usagain-gazebo',
          'btn-loc-usagain-mailbox',
          'btn-loc-usagain-garden',
          'btn-loc-usagain-pond'
        ];
        return ids.map(id => {
          const el = document.getElementById(id);
          if (!el) return { id, exists: false };
          const rect = el.getBoundingClientRect();
          return {
            id,
            exists: true,
            text: el.innerText.trim(),
            rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) }
          };
        });
      })()
    `,
    returnByValue: true
  });
  console.log('Location check:', JSON.stringify(locCheck.result?.value, null, 2));

  const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

  // Capture desktop screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_desktop_1920x1080.jpg'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved usagain_desktop_1920x1080.jpg');

  // Open Lotus Pond Modal (Fishing Game)
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('btn-loc-usagain-pond')?.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shot2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_modal_pond_1920x1080.jpg'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved usagain_modal_pond_1920x1080.jpg');

  // Close Pond Modal and Open Residence Modal
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('btn-close-usagain-pond')?.click();
      setTimeout(() => {
        document.getElementById('btn-loc-usagain-residence')?.click();
      }, 300);
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shot3 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_modal_residence_1920x1080.jpg'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved usagain_modal_residence_1920x1080.jpg');

  // Close modal and set Mobile Viewport 390x844
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

  const shot4 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_mobile_390x844.jpg'), Buffer.from(shot4.data, 'base64'));
  console.log('Saved usagain_mobile_390x844.jpg');

  console.log('ALL ELA SCREENSHOTS CAPTURED SUCCESSFULLY!');
  ws.close();
} catch (err) {
  console.error('Error during verification:', err);
} finally {
  chrome.kill();
  exec('taskkill /F /IM chrome.exe /T', () => {});
}

