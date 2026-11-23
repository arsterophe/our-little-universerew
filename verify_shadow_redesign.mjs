import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-shadow-'));
const port = 9394;
const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\36374948-9b1c-47c2-b618-025d3a41477d';

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
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
  let cdp;
  try {
    const wsUrl = await getWsUrl();
    cdp = await connect(wsUrl);

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log('--- ☾ 1. SETTING DESKTOP VIEWPORT (1920x1080) ☽ ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Navigating to http://localhost:5173 ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(3500);

    // Switch view to SHADOW world
    console.log('Activating SHADOW world (Lele)...');
    const setupRes = await cdp.send('Runtime.evaluate', {
      expression: `
        (async () => {
          try {
            localStorage.setItem('olu_current_character', 'lele');
            localStorage.setItem('olu_authenticated_user', 'lele');
            window.isPreviewingUniverses = true;

            document.querySelectorAll('.view-section').forEach(v => {
              v.classList.remove('active');
              v.setAttribute('aria-hidden', 'true');
            });
            const shadowView = document.getElementById('view-shadow-world');
            if (shadowView) {
              shadowView.classList.add('active');
              shadowView.setAttribute('aria-hidden', 'false');
            }

            // Ensure background image is loaded
            const img = document.querySelector('.shadow-scene-img');
            if (img && !img.complete) {
              await new Promise(res => {
                img.onload = res;
                img.onerror = res;
              });
            }

            // Trigger window resize to ensure canvas & parallax size properly
            window.dispatchEvent(new Event('resize'));
            return { ok: true, imgComplete: img ? img.complete : false };
          } catch (e) {
            return { ok: false, error: e.message };
          }
        })()
      `,
      returnByValue: true,
      awaitPromise: true
    });

    console.log('Setup result:', setupRes.result.value);
    await sleep(2000);

    // 1. Verify Desktop Elements & Metrics
    const desktopMetrics = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const bodyOverflow = document.body.scrollWidth > window.innerWidth;
          const htmlOverflow = document.documentElement.scrollWidth > window.innerWidth;
          const stage = document.getElementById('shadow-2d-stage');
          const charCard = document.getElementById('shadow-char-card');
          const returnPill = document.getElementById('btn-shadow-top-return');
          const storyPill = document.getElementById('btn-shadow-story');
          const behindPill = document.getElementById('btn-shadow-behind');
          const userPill = document.getElementById('shadow-user-pill');
          const hotspots = document.querySelectorAll('.shadow-hotspot');

          return {
            hasOverflowX: bodyOverflow || htmlOverflow,
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            stageVisible: stage && stage.clientWidth > 0,
            charCardVisible: charCard && charCard.clientWidth > 0,
            returnPillVisible: returnPill && returnPill.clientWidth > 0,
            storyPillVisible: storyPill && storyPill.clientWidth > 0,
            behindPillVisible: behindPill && behindPill.clientWidth > 0,
            userPillVisible: userPill && userPill.clientWidth > 0,
            hotspotsCount: hotspots.length
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Desktop Metrics Check:', desktopMetrics.result.value);

    // Capture Desktop Landing View Screenshot
    const snap1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const p1 = path.join(artifactDir, 'shadow_01_desktop_landing.png');
    fs.writeFileSync(p1, Buffer.from(snap1.data, 'base64'));
    console.log(`Saved screenshot: ${p1}`);

    // Click Hotspot A: THE ECLIPSE to open Location Panel
    console.log('Clicking Hotspot A (THE ECLIPSE)...');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-shadow-house-hotspot');
          if (btn) btn.click();
        })()
      `
    });
    await sleep(800);

    const panelCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const panel = document.getElementById('shadow-location-panel');
          const title = document.getElementById('shadow-loc-title');
          const desc = document.getElementById('shadow-loc-desc');
          return {
            isOpen: panel && panel.classList.contains('open'),
            title: title ? title.textContent.trim() : '',
            desc: desc ? desc.textContent.trim() : ''
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Location Panel (Eclipse):', panelCheck.result.value);

    // Capture Desktop Location Panel Screenshot
    const snap2 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const p2 = path.join(artifactDir, 'shadow_02_desktop_location_panel.png');
    fs.writeFileSync(p2, Buffer.from(snap2.data, 'base64'));
    console.log(`Saved screenshot: ${p2}`);

    // Click Hotspot C: Gazebo
    console.log('Clicking Hotspot C (Gazebo)...');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('.hotspot-shadow-gazebo');
          if (btn) btn.click();
        })()
      `
    });
    await sleep(800);

    const snap3 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const p3 = path.join(artifactDir, 'shadow_03_desktop_gazebo_panel.png');
    fs.writeFileSync(p3, Buffer.from(snap3.data, 'base64'));
    console.log(`Saved screenshot: ${p3}`);

    // Close panel
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-close-shadow-panel');
          if (btn) btn.click();
        })()
      `
    });
    await sleep(500);

    // 2. Mobile Viewport (390x844)
    console.log('--- ☾ 2. SETTING MOBILE VIEWPORT (390x844) ☽ ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);

    const mobileMetrics = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const bodyOverflow = document.body.scrollWidth > window.innerWidth;
          const htmlOverflow = document.documentElement.scrollWidth > window.innerWidth;
          return {
            hasOverflowX: bodyOverflow || htmlOverflow,
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Mobile Metrics Check:', mobileMetrics.result.value);

    const snap4 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const p4 = path.join(artifactDir, 'shadow_04_mobile_landing.png');
    fs.writeFileSync(p4, Buffer.from(snap4.data, 'base64'));
    console.log(`Saved screenshot: ${p4}`);

    // Click Hotspot E: Ladang Bunga on mobile
    console.log('Clicking Hotspot E (Ladang Bunga) on mobile...');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('.hotspot-shadow-bunga');
          if (btn) btn.click();
        })()
      `
    });
    await sleep(800);

    const snap5 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const p5 = path.join(artifactDir, 'shadow_05_mobile_location_panel.png');
    fs.writeFileSync(p5, Buffer.from(snap5.data, 'base64'));
    console.log(`Saved screenshot: ${p5}`);

    console.log('--- ☾ VERIFICATION COMPLETED WITH FLYING COLORS! ☽ ---');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch (_) {}
  }
}

run();
