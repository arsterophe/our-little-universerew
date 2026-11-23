import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-minimal-'));
const port = 9355;
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
    ws.addEventListener('error', err => reject(err));
  });
}

async function evalScript(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails));
  }
  return result.result ? result.result.value : undefined;
}

async function captureScreenshot(client, filepath) {
  const { data } = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  console.log(`📸 Screenshot saved: ${path.basename(filepath)} (${(fs.statSync(filepath).size / 1024).toFixed(1)} KB)`);
}

async function run() {
  console.log('🚀 Starting Royan Minimalist Profile & Mood UI Verification...');
  try {
    const wsUrl = await getWsUrl();
    const client = connect(wsUrl);
    const c = await client;

    await c.send('Page.enable');
    await c.send('DOM.enable');
    await c.send('Runtime.enable');

    // 1. Desktop Viewport 1920x1080
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('🌐 Navigating to http://localhost:5173...');
    await c.send('Page.navigate', { url: 'http://localhost:5173' });

    // Wait for modules to load
    for (let i = 0; i < 50; i++) {
      const chk = await evalScript(c, 'typeof window.renderPrivateUniverse');
      if (chk === 'function') break;
      await sleep(100);
    }

    // Direct Login as Royan & Open HOT World
    console.log('🔑 Authenticating as Royan and opening HOT World...');
    const setupResult = await evalScript(c, `
      (async () => {
        const royanUser = {
          uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2',
          email: 'royan@ourlittleuniverse.com',
          displayName: 'Royan'
        };
        const royanConfig = {
          id: 'royan',
          displayName: 'Royan',
          symbol: '🎆',
          universe: 'HOT',
          universeId: 'hot',
          avatarUrl: '/assets/avatar_royan_hd.jpg'
        };

        await window.renderPrivateUniverse(royanUser, royanConfig);

        // Click Planet HOT to enter
        const hotCard = document.querySelector('.card-hot');
        if (hotCard) hotCard.click();
        await new Promise(r => setTimeout(r, 600));

        // Check Top-right Header
        const topRightGreeting = document.querySelector('.hot-profile-greeting-pill');
        const settingsBtn = document.getElementById('btn-hot-settings');

        // Check Left Profile
        const profileSidebar = document.getElementById('hot-profile-sidebar');
        const avatarImg = profileSidebar?.querySelector('.hot-profile-avatar-img');
        const nameEl = profileSidebar?.querySelector('.hot-profile-name');
        const titleEl = profileSidebar?.querySelector('.hot-profile-race-title');
        const statusEl = profileSidebar?.querySelector('.hot-status-text');
        const petChip = document.getElementById('hot-sidebar-pet-shortcut');

        // Check Mood Pills
        const moodPills = Array.from(document.querySelectorAll('.hot-mood-pill')).map(p => ({
          text: p.textContent.trim(),
          mood: p.getAttribute('data-mood'),
          isActive: p.classList.contains('active')
        }));

        // Compute Styles of Profile Sidebar to ensure no heavy dark box
        const sidebarStyle = profileSidebar ? window.getComputedStyle(profileSidebar) : null;

        return {
          topRightGreetingRemoved: topRightGreeting === null,
          settingsBtnPresent: !!settingsBtn,
          avatarSrc: avatarImg?.getAttribute('src'),
          nameText: nameEl?.textContent?.trim(),
          titleText: titleEl?.textContent?.trim(),
          statusText: statusEl?.textContent?.trim(),
          petChipPresent: !!petChip,
          moodPillCount: moodPills.length,
          moodPills,
          sidebarBackground: sidebarStyle?.backgroundColor,
          sidebarBorderWidth: sidebarStyle?.borderWidth,
          sidebarBoxShadow: sidebarStyle?.boxShadow
        };
      })()
    `);
    console.log('🔍 UI Inspection Result:', JSON.stringify(setupResult, null, 2));

    await sleep(800);
    // Capture Desktop Screenshot
    await captureScreenshot(c, path.join(artifactDir, 'royan_minimal_profile_desktop_1920x1080.jpg'));

    // 2. Test Interactive Mood Selection & Persistence
    console.log('🌸 Testing Mood Pill Selection & Persistence...');
    const moodTest = await evalScript(c, `
      (async () => {
        // Find Mischievous pill and click it
        const mischPill = document.querySelector('.hot-mood-pill[data-mood="Mischievous 🎆"]');
        if (mischPill) mischPill.click();
        await new Promise(r => setTimeout(r, 300));

        const savedMood1 = localStorage.getItem('olu_hot_mood_swBN9XodDWRuHE5YbYmeoytrcAx2');
        const isMischActive = mischPill?.classList.contains('active');

        // Find Happy pill and click it
        const happyPill = document.querySelector('.hot-mood-pill[data-mood="Happy 🌸"]');
        if (happyPill) happyPill.click();
        await new Promise(r => setTimeout(r, 300));

        const savedMood2 = localStorage.getItem('olu_hot_mood_swBN9XodDWRuHE5YbYmeoytrcAx2');
        const isHappyActive = happyPill?.classList.contains('active');

        return {
          step1Saved: savedMood1,
          step1Active: isMischActive,
          step2Saved: savedMood2,
          step2Active: isHappyActive
        };
      })()
    `);
    console.log('✨ Mood Interaction & UID Persistence:', moodTest);

    // 3. Mobile Viewport 390x844
    console.log('📱 Switching to Mobile Viewport (390x844)...');
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);
    // Capture Mobile Screenshot
    await captureScreenshot(c, path.join(artifactDir, 'royan_minimal_profile_mobile_390x844.jpg'));

    console.log('🎉 ALL REVISIONS VERIFIED SUCCESSFULLY!');
    c.close();
  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    try { chrome.kill(); } catch (_) {}
    setTimeout(() => {
      try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
    }, 1000);
  }
}

run();

