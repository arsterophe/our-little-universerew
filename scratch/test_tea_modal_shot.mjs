import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';

const CDP_PORT = Math.floor(15000 + Math.random() * 15000);
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800',
    'about:blank'
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
        if (targets && targets.length) break;
      } catch (_) {}
    }

    const { WebSocket } = await import('ws');
    const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const onMsg = (raw) => {
          const msg = JSON.parse(raw.toString());
          if (msg.id === id) {
            ws.off('message', onMsg);
            resolve(msg.result);
          }
        };
        ws.on('message', onMsg);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
    await sleep(2500);

    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const mod = await import('/yawn_gazebo_view.js');
          const ctrl = mod.initYawnGazeboView();
          ctrl.openYawnGazebo();
          ctrl.openGazeboModal('tea');
        })()
      `,
      awaitPromise: true
    });

    await sleep(1000);
    const res = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    fs.writeFileSync('scratch/test_tea_screenshot.jpg', Buffer.from(res.data, 'base64'));
    console.log('Saved test_tea_screenshot.jpg');

    const computed = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const b = document.getElementById('ygazebo-modal-backdrop');
          const cs = window.getComputedStyle(b);
          const rect = b.getBoundingClientRect();
          return {
            display: cs.display,
            visibility: cs.visibility,
            opacity: cs.opacity,
            zIndex: cs.zIndex,
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Computed style of backdrop:', computed.result.value);

  } finally {
    chromeProc.kill();
  }
}

run();
