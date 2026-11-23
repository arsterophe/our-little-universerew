// scratch/capture_ela_modals.mjs
import http from 'http';
import { spawn, exec } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const tempProfile = path.join(os.tmpdir(), 'chrome-ela-modals-' + Date.now());
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
  const send = (m, params = {}) => new Promise(resolve => {
    const i = id++;
    const onm = (e) => {
      const data = JSON.parse(e.data);
      if (data.id === i) { ws.removeEventListener('message', onm); resolve(data.result); }
    };
    ws.addEventListener('message', onm);
    ws.send(JSON.stringify({ id: i, method: m, params }));
  });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });

  // Activate view-usagain-world & store session
  await send('Runtime.evaluate', {
    expression: `
      sessionStorage.setItem('activeUniverseSession', 'ela');
      document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
        el.setAttribute('aria-hidden', 'true');
      });
      const v = document.getElementById('view-usagain-world');
      if (v) {
        v.classList.add('active');
        v.setAttribute('aria-hidden', 'false');
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

  // Open Pond Modal (Fishing Game)
  await send('Runtime.evaluate', {
    expression: `document.getElementById('btn-loc-usagain-pond')?.click();`
  });
  await new Promise(r => setTimeout(r, 800));
  const shot1 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_modal_pond_1920x1080.jpg'), Buffer.from(shot1.data, 'base64'));

  // Close Pond and Open Residence Modal
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('btn-close-usagain-pond')?.click();
      document.getElementById('btn-loc-usagain-residence')?.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  const shot2 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_modal_residence_1920x1080.jpg'), Buffer.from(shot2.data, 'base64'));

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
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await new Promise(r => setTimeout(r, 800));
  const shot3 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'usagain_mobile_390x844.jpg'), Buffer.from(shot3.data, 'base64'));

  console.log('ALL MODALS AND MOBILE CAPTURED SUCCESSFULLY!');
  ws.close();
} catch (e) {
  console.error(e);
} finally {
  chrome.kill();
  exec('taskkill /F /IM chrome.exe /T', () => process.exit(0));
}

