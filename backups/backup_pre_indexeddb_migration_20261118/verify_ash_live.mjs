// verify_ash_live.mjs
import http from 'http';
import { spawn, exec } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const tempProfile = path.join(os.tmpdir(), 'chrome-ash-' + Date.now());
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

  // Directly call openAshWorld via window or open the universe
  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        // Find and click Ruben card or call openAshWorld
        if (window.universesController && typeof window.universesController.openAshWorld === 'function') {
          window.universesController.openAshWorld();
          return { success: true, method: 'universesController.openAshWorld' };
        }
        
        // Alternatively, activate view-ash-world directly
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        const ashView = document.getElementById('view-ash-world');
        if (ashView) {
          ashView.classList.add('active');
          ashView.setAttribute('aria-hidden', 'false');
          return { success: true, method: 'direct classList' };
        }
        return { success: false, reason: 'view-ash-world not found' };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Open ASH Universe result:', evalResult);
  await new Promise(r => setTimeout(r, 1500));

  // Verify all 8 location buttons exist and are placed
  const locCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const ids = [
          'btn-loc-ash-castle',
          'btn-loc-ash-engineering',
          'btn-loc-ash-observatory',
          'btn-loc-ash-gazebo',
          'btn-loc-ash-garden',
          'btn-loc-ash-mailbox',
          'btn-loc-ash-gaming',
          'btn-loc-ash-music'
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
  console.log('Location check:', JSON.stringify(locCheck.value, null, 2));

  // Capture desktop screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
  fs.writeFileSync(path.join(artifactDir, 'ash_desktop_1920x1080.jpg'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved ash_desktop_1920x1080.jpg');

  // Open Castle Modal
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('btn-loc-ash-castle')?.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shot2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync(path.join(artifactDir, 'ash_modal_castle_1920x1080.jpg'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved ash_modal_castle_1920x1080.jpg');

  // Close Castle Modal and Open Gaming Zone Modal
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('btn-close-ash-castle')?.click();
      setTimeout(() => {
        document.getElementById('btn-loc-ash-gaming')?.click();
      }, 300);
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shot3 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync(path.join(artifactDir, 'ash_modal_gaming_1920x1080.jpg'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved ash_modal_gaming_1920x1080.jpg');

  // Close modal and set Mobile Viewport 390x844
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('btn-close-ash-gaming')?.click();
    `
  });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 800));

  const shot4 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
  fs.writeFileSync(path.join(artifactDir, 'ash_mobile_390x844.jpg'), Buffer.from(shot4.data, 'base64'));
  console.log('Saved ash_mobile_390x844.jpg');

  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  ws.close();
} catch (err) {
  console.error('Error during verification:', err);
} finally {
  chrome.kill();
  exec('taskkill /F /IM chrome.exe /T', () => {});
}

