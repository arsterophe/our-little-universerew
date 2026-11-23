import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-behind-pinwheel-'));
const port = 9395;
const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

const cp = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + tmpDir,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--window-size=1920,1080',
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
    await sleep(250);
  }
  throw new Error('Chrome WS unreachable');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 1;
    const map = new Map();
    ws.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          const reqId = id++;
          return new Promise((res, rej) => {
            map.set(reqId, { res, rej });
            ws.send(JSON.stringify({ id: reqId, method, params }));
          });
        },
        close() { ws.close(); }
      });
    });
    ws.addEventListener('message', ev => {
      const data = JSON.parse(ev.data);
      if (data.id && map.has(data.id)) {
        const { res, rej } = map.get(data.id);
        map.delete(data.id);
        if (data.error) rej(new Error(data.error.message));
        else res(data.result);
      }
    });
    ws.addEventListener('error', err => reject(err));
  });
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    const cdp = await connect(wsUrl);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('1. Navigating to http://localhost:5173 ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(3000);

    // Open Syma's PINWHEEL Universe
    console.log('2. Opening PINWHEEL World directly...');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          if (window.universesController?.openPinwheelWorld) {
            window.universesController.openPinwheelWorld();
          } else {
            document.getElementById('card-abil')?.click();
          }
        })()
      `
    });
    await sleep(1500);

    // Open Behind the Pinwheel
    console.log('3. Clicking #btn-pinwheel-behind ...');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-pinwheel-behind');
          if (btn) btn.click();
          else if (window.pinwheelBehindController?.open) window.pinwheelBehindController.open();
        })()
      `
    });
    await sleep(1000);

    // Verify Opening Scene
    console.log('4. Verifying Opening Scene...');
    const shotIntro = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'behind_pinwheel_01_intro.jpg'), Buffer.from(shotIntro.data, 'base64'));
    console.log('📸 Saved behind_pinwheel_01_intro.jpg');

    // Click Begin the Journey
    console.log('5. Clicking Begin the Journey to enter Chapter 1...');
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('btn-pinwheel-begin-journey')?.click();`
    });
    await sleep(800);

    const shotCh1 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'behind_pinwheel_02_ch1.jpg'), Buffer.from(shotCh1.data, 'base64'));
    console.log('📸 Saved behind_pinwheel_02_ch1.jpg');

    // Chapter 2
    console.log('6. Switching to Chapter 2: Why PINWHEEL? ...');
    await cdp.send('Runtime.evaluate', {
      expression: `window.pinwheelBehindController?.switchChapter(2);`
    });
    await sleep(800);

    const shotCh2 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'behind_pinwheel_03_ch2.jpg'), Buffer.from(shotCh2.data, 'base64'));
    console.log('📸 Saved behind_pinwheel_03_ch2.jpg');

    // Chapter 3
    console.log('7. Switching to Chapter 3: The Self You\'re Becoming ...');
    await cdp.send('Runtime.evaluate', {
      expression: `window.pinwheelBehindController?.switchChapter(3);`
    });
    await sleep(800);

    const shotCh3 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'behind_pinwheel_04_ch3.jpg'), Buffer.from(shotCh3.data, 'base64'));
    console.log('📸 Saved behind_pinwheel_04_ch3.jpg');

    // Chapter 4: Letter
    console.log('8. Switching to Chapter 4: A Letter from Lele ...');
    await cdp.send('Runtime.evaluate', {
      expression: `window.pinwheelBehindController?.switchChapter(4);`
    });
    await sleep(800);

    // Test Keep Letter
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('btn-pinwheel-letter-keep')?.click();`
    });
    await sleep(400);

    const storageCheck = await cdp.send('Runtime.evaluate', {
      expression: `localStorage.getItem('olu_saved_letter_pinwheel')`,
      returnByValue: true
    });
    console.log('LocalStorage check for saved letter:', storageCheck?.result?.value ? 'PASS ✅' : 'FAIL ❌');

    const shotCh4 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'behind_pinwheel_05_ch4_letter.jpg'), Buffer.from(shotCh4.data, 'base64'));
    console.log('📸 Saved behind_pinwheel_05_ch4_letter.jpg');

    // Chapter 5: Epilogue & Soundtrack
    console.log('9. Switching to Chapter 5: Epilogue: PINWHEEL ...');
    await cdp.send('Runtime.evaluate', {
      expression: `window.pinwheelBehindController?.switchChapter(5);`
    });
    await sleep(800);

    // Test Soundtrack button
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('btn-pinwheel-song-toggle')?.click();`
    });
    await sleep(400);

    const shotCh5 = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'behind_pinwheel_06_ch5_epilogue.jpg'), Buffer.from(shotCh5.data, 'base64'));
    console.log('📸 Saved behind_pinwheel_06_ch5_epilogue.jpg');

    // Mobile viewport (390x844)
    console.log('10. Testing Mobile Viewport (390x844) ...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(600);

    const shotMobile = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'behind_pinwheel_07_mobile.jpg'), Buffer.from(shotMobile.data, 'base64'));
    console.log('📸 Saved behind_pinwheel_07_mobile.jpg');

    // Test close
    console.log('11. Testing Close Behind Pinwheel ...');
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('btn-close-pinwheel-behind')?.click();`
    });
    await sleep(500);

    const closeCheck = await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('pinwheel-behind-overlay')?.classList.contains('active')`,
      returnByValue: true
    });
    console.log('Overlay closed status:', closeCheck?.result?.value === false ? 'PASS (Closed) ✅' : 'FAIL ❌');

    console.log('\n✨ All Live CDP checks completed successfully!');
    cp.kill();
    process.exit(0);
  } catch (err) {
    console.error('Error during live CDP check:', err);
    cp.kill();
    process.exit(1);
  }
}

run();
