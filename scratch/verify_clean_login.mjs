import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-clean-login-'));
const port = 9360;
const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

const cp = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + tmpDir
], { stdio: 'ignore' });

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && pending.has(d.id)) {
      pending.get(d.id)(d.result);
      pending.delete(d.id);
    }
  };

  function send(method, params = {}) {
    return new Promise(res => {
      const curId = id++;
      pending.set(curId, res);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');
  await send('Page.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('1. Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2500));

  // Check selection view metrics
  const selMetrics = await send('Runtime.evaluate', {
    expression: `(() => {
      const docH = document.documentElement.scrollHeight;
      const clientH = document.documentElement.clientHeight;
      const rawTextInBody = Array.from(document.body.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0)
        .map(n => n.textContent.trim());
      const levelupReward = document.querySelector('.levelup-reward');
      const btnFish = document.getElementById('btn-close-levelup-modal');
      return {
        docH,
        clientH,
        hasVerticalScroll: docH > clientH,
        rawTextInBody,
        levelupRewardVisible: levelupReward ? window.getComputedStyle(levelupReward).display !== 'none' : false,
        btnFishVisible: btnFish ? window.getComputedStyle(btnFish).display !== 'none' : false
      };
    })()`,
    returnByValue: true
  });
  console.log('Selection screen audit:', selMetrics?.result?.value);

  // Take screenshot of selection screen
  const shotSel = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'audit_selection_screen.jpg'), Buffer.from(shotSel.data, 'base64'));
  console.log('Saved audit_selection_screen.jpg');

  // Click card-royan
  console.log('2. Clicking card-royan to inspect login view...');
  await send('Runtime.evaluate', {
    expression: "document.getElementById('card-royan')?.click()"
  });
  await new Promise(r => setTimeout(r, 1200));

  // Check login view metrics
  const loginMetrics = await send('Runtime.evaluate', {
    expression: `(() => {
      const docH = document.documentElement.scrollHeight;
      const clientH = document.documentElement.clientHeight;
      const levelupReward = document.querySelector('.levelup-reward');
      const btnFish = document.getElementById('btn-close-levelup-modal');
      const emailInput = document.getElementById('email-input');
      const activeView = document.querySelector('.view-section.active')?.id;
      const loginCharName = document.getElementById('login-char-name')?.textContent;
      const loginGreeting = document.getElementById('login-greeting-name')?.textContent;
      return {
        docH,
        clientH,
        hasVerticalScroll: docH > clientH,
        activeView,
        emailVal: emailInput?.value,
        loginCharName,
        loginGreeting,
        levelupRewardVisible: levelupReward ? window.getComputedStyle(levelupReward).display !== 'none' : false,
        btnFishVisible: btnFish ? window.getComputedStyle(btnFish).display !== 'none' : false
      };
    })()`,
    returnByValue: true
  });
  console.log('Login screen audit:', loginMetrics?.result?.value);

  // Take screenshot of login screen
  const shotLogin = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(artifactDir, 'audit_login_screen.jpg'), Buffer.from(shotLogin.data, 'base64'));
  console.log('Saved audit_login_screen.jpg');

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

run().catch(err => {
  console.error('Audit failed:', err);
  try { cp.kill(); } catch (_) {}
});
