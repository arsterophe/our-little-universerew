import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-debug-royan-'));
const port = 9295;

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

    const consoleLogs = [];
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push(data.params.args.map(a => a.value || a.description).join(' '));
      }
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Console.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('1. Navigating to localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    console.log('2. Inspecting page state on load...');
    const state1 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const activeViews = Array.from(document.querySelectorAll('.view-section.active')).map(el => el.id);
          return { activeViews };
        })()
      `,
      returnByValue: true
    });
    console.log('Active views on start:', state1?.result?.value);

    // Call showUniversesView() and check what is visible in view-private-universe
    console.log('3. Calling showUniversesView()...');
    const state2 = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          if (typeof window.showUniversesView === 'function') {
            await window.showUniversesView();
          }
          const univView = document.getElementById('view-private-universe');
          const cards = Array.from(document.querySelectorAll('.univ-island-card')).map(card => {
            const rect = card.getBoundingClientRect();
            const img = card.querySelector('img.floating-island-image');
            return {
              key: card.getAttribute('data-universe'),
              className: card.className,
              rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) },
              imgSrc: img ? img.getAttribute('src') : null,
              imgNaturalWidth: img ? img.naturalWidth : 0,
              imgComplete: img ? img.complete : false,
              display: window.getComputedStyle(card).display,
              visibility: window.getComputedStyle(card).visibility,
              opacity: window.getComputedStyle(card).opacity
            };
          });
          const stage = document.querySelector('.universes-islands-stage');
          const stageRect = stage ? stage.getBoundingClientRect() : null;
          return {
            univViewActive: univView?.classList.contains('active'),
            stageScrollLeft: stage ? stage.scrollLeft : null,
            stageScrollWidth: stage ? stage.scrollWidth : null,
            stageClientWidth: stage ? stage.clientWidth : null,
            cards
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Universes stage state:', JSON.stringify(state2?.result?.value, null, 2));

    // Capture screenshot of the universes selection page
    const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(artifactDir, 'debug_universes_stage.jpg'), Buffer.from(shot.data, 'base64'));
    console.log('Saved debug_universes_stage.jpg');

    console.log('Console logs:', consoleLogs.slice(-10));
    ws.close();
  } catch (err) {
    console.error('Debug error:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
  }
}

run();

