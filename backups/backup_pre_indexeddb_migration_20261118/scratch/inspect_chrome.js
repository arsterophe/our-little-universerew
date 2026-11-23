// scratch/inspect_chrome.js
import http from 'http';
import { spawn } from 'child_process';
import os from 'os';
import path from 'path';

const tempProfile = path.join(os.tmpdir(), 'chrome-debug-' + Date.now());
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${tempProfile}`,
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:5173'
]);

// Wait 2 seconds for chrome to start
await new Promise(r => setTimeout(r, 2000));

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
  console.log('Open pages:', pages.map(p => ({ id: p.id, url: p.url, title: p.title })));

  const page = pages.find(p => p.url.includes('localhost:5173')) || pages[0];
  if (!page) {
    console.log('No page found');
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
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
    } else if (data.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', data.params.type, data.params.args.map(a => a.value !== undefined ? a.value : a.description).join(' '));
    } else if (data.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', JSON.stringify(data.params.exceptionDetails, null, 2));
    }
  };

  await new Promise((resolve) => { ws.onopen = resolve; });
  console.log('Connected to CDP');
  await send('Runtime.enable');
  await send('Console.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Navigate to localhost:5173 and wait for load
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise((resolve) => {
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Page.loadEventFired') {
        ws.removeEventListener('message', handler);
        resolve();
      }
    };
    ws.addEventListener('message', handler);
    setTimeout(resolve, 4000);
  });

  // Give modules time to execute
  await new Promise(r => setTimeout(r, 2000));

  // Evaluate script on page to check DOM and errors
  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const activeView = document.querySelector('.view-section.active')?.id || 'none';
      const kidult = document.getElementById('view-kidult-world');
      const kidultStage = document.getElementById('kidult-2d-stage');
      const kidultImg = document.querySelector('.kidult-scene-img');

      return {
        activeView,
        kidultDisplay: kidult ? window.getComputedStyle(kidult).display : 'null',
        kidultWidth: kidult ? kidult.offsetWidth : 0,
        kidultHeight: kidult ? kidult.offsetHeight : 0,
        stageWidth: kidultStage ? kidultStage.offsetWidth : 0,
        stageHeight: kidultStage ? kidultStage.offsetHeight : 0,
        imgComplete: kidultImg ? kidultImg.complete : false,
        imgNaturalWidth: kidultImg ? kidultImg.naturalWidth : 0,
        imgSrc: kidultImg ? kidultImg.src : 'null',
        bodyClasses: document.body.className
      };
    })()`,
    returnByValue: true
  });

  console.log('\n--- Initial Page State ---');
  console.log('res.result:', JSON.stringify(res.result, null, 2));

  // Now test openKidultWorld
  console.log('\n--- Calling openKidultWorld ---');
  const openRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      try {
        let ctrl = window.universesController;
        if (!ctrl && window.ensureUniversesController) {
          ctrl = await window.ensureUniversesController();
        }
        if (ctrl && ctrl.openKidultWorld) {
          ctrl.openKidultWorld();
        } else {
          return { error: 'openKidultWorld not found on universesController' };
        }
        
        const kidult = document.getElementById('view-kidult-world');
        const kidultStage = document.getElementById('kidult-2d-stage');
        const kidultImg = document.querySelector('.kidult-scene-img');
        const moodCard = document.getElementById('kidult-mood-card');
        const moodOptions = document.getElementById('kidult-mood-options-bar');
        const chibi = document.getElementById('kidult-chibi-actor');

        return {
          success: true,
          activeView: document.querySelector('.view-section.active')?.id,
          kidultClasses: kidult?.className,
          kidultStyles: kidult ? {
            display: window.getComputedStyle(kidult).display,
            visibility: window.getComputedStyle(kidult).visibility,
            opacity: window.getComputedStyle(kidult).opacity,
            width: kidult.offsetWidth,
            height: kidult.offsetHeight,
            position: window.getComputedStyle(kidult).position,
            zIndex: window.getComputedStyle(kidult).zIndex,
            overflow: window.getComputedStyle(kidult).overflow
          } : null,
          stageStyles: kidultStage ? {
            display: window.getComputedStyle(kidultStage).display,
            visibility: window.getComputedStyle(kidultStage).visibility,
            opacity: window.getComputedStyle(kidultStage).opacity,
            width: kidultStage.offsetWidth,
            height: kidultStage.offsetHeight,
            position: window.getComputedStyle(kidultStage).position,
            zIndex: window.getComputedStyle(kidultStage).zIndex
          } : null,
          imgState: kidultImg ? {
            complete: kidultImg.complete,
            naturalWidth: kidultImg.naturalWidth,
            naturalHeight: kidultImg.naturalHeight,
            offsetWidth: kidultImg.offsetWidth,
            offsetHeight: kidultImg.offsetHeight,
            display: window.getComputedStyle(kidultImg).display,
            visibility: window.getComputedStyle(kidultImg).visibility
          } : null,
          chibiVisible: chibi ? {
            display: window.getComputedStyle(chibi).display,
            visibility: window.getComputedStyle(chibi).visibility,
            offsetWidth: chibi.offsetWidth,
            offsetHeight: chibi.offsetHeight
          } : null,
          moodCardVisible: moodCard ? {
            display: window.getComputedStyle(moodCard).display,
            visibility: window.getComputedStyle(moodCard).visibility,
            offsetWidth: moodCard.offsetWidth,
            offsetHeight: moodCard.offsetHeight
          } : null,
          hotspotsCount: document.querySelectorAll('#kidult-2d-stage .kidult-hotspot').length
        };
      } catch (e) {
        return { success: false, error: e.message, stack: e.stack };
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('\n--- After openKidultWorld ---');
  console.log('openRes.result:', JSON.stringify(openRes.result, null, 2));

  // Wait for transition animation to complete
  await new Promise(r => setTimeout(r, 600));

  // Let's capture screenshot of the rendered page
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  if (screenshot && screenshot.data) {
    const fs = await import('fs');
    fs.writeFileSync('scratch/rendered_kidult.png', Buffer.from(screenshot.data, 'base64'));
    console.log('\n[SUCCESS] Screenshot saved to scratch/rendered_kidult.png');
  } else if (screenshot && screenshot.result && screenshot.result.data) {
    const fs = await import('fs');
    fs.writeFileSync('scratch/rendered_kidult.png', Buffer.from(screenshot.result.data, 'base64'));
    console.log('\n[SUCCESS] Screenshot saved to scratch/rendered_kidult.png');
  }

  ws.close();
} catch (err) {
  console.error(err);
} finally {
  chrome.kill();
  process.exit(0);
}
