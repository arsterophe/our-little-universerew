import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-hot-planet-'));
const port = 9266;
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
    ws.addEventListener('error', reject);
  });
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    const client = await connect(wsUrl);

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // 1. Desktop 1920x1080 Character Selection
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    await client.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2000);

    // Remove initial loader if still visible
    await client.send('Runtime.evaluate', {
      expression: `
        document.getElementById('initial-loader')?.remove();
      `
    });
    await sleep(500);

    const shot1 = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'selection_royan_hot_fireworks_1920x1080.jpg'), Buffer.from(shot1.data, 'base64'));
    console.log('Saved selection_royan_hot_fireworks_1920x1080.jpg');

    // 2. Switch to Universe Selection View and scroll to Planet HOT
    await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          if (window.showUniversesView) {
            await window.showUniversesView();
          } else {
            document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
            document.getElementById('view-private-universe')?.classList.add('active');
          }
          const hotCard = document.querySelector('.card-hot');
          if (hotCard) {
            hotCard.scrollIntoView({ behavior: 'instant', inline: 'center' });
          }
        })()
      `,
      awaitPromise: true
    });
    await sleep(1500);

    const shot2 = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'universes_hot_planet_desktop_1920x1080.jpg'), Buffer.from(shot2.data, 'base64'));
    console.log('Saved universes_hot_planet_desktop_1920x1080.jpg');

    // 3. Click Planet HOT to trigger preparation toast
    await client.send('Runtime.evaluate', {
      expression: `
        const hotCard = document.querySelector('.card-hot');
        if (hotCard) hotCard.click();
      `
    });
    await sleep(600);

    const shot3 = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'universes_hot_planet_clicked_1920x1080.jpg'), Buffer.from(shot3.data, 'base64'));
    console.log('Saved universes_hot_planet_clicked_1920x1080.jpg');

    // 4. Mobile 390x844 Viewport
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);

    // Ensure Planet HOT is centered in mobile view
    await client.send('Runtime.evaluate', {
      expression: `
        const hotCard = document.querySelector('.card-hot');
        if (hotCard) {
          hotCard.scrollIntoView({ behavior: 'instant', inline: 'center' });
        }
      `
    });
    await sleep(600);

    const shot4 = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'universes_hot_planet_mobile_390x844.jpg'), Buffer.from(shot4.data, 'base64'));
    console.log('Saved universes_hot_planet_mobile_390x844.jpg');

    client.close();
  } finally {
    chrome.kill();
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch (_) {}
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

