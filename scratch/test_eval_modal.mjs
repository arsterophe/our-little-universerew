import { spawn } from 'node:child_process';
import http from 'node:http';

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

    const testEval = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const mod = document.getElementById('ygazebo-modal-backdrop');
          const view = document.getElementById('view-yawn-gazebo');
          const btnCard = document.getElementById('ygazebo-card-tea');
          return {
            hasModalBackdrop: !!mod,
            hasView: !!view,
            hasBtnCard: !!btnCard,
            modalClasses: mod ? mod.className : null
          };
        })()
      `,
      returnByValue: true
    });

    console.log('DOM check:', testEval.result.value);

    // Now open Gazebo and click card
    const clickEval = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const mod = await import('/yawn_gazebo_view.js');
          const ctrl = mod.initYawnGazeboView();
          ctrl.openYawnGazebo();
          ctrl.openGazeboModal('tea');
          const backdrop = document.getElementById('ygazebo-modal-backdrop');
          return {
            backdropClasses: backdrop ? backdrop.className : null,
            bodyHTML: document.getElementById('ygazebo-modal-body')?.innerHTML?.substring(0, 100)
          };
        })()
      `,
      returnByValue: true,
      awaitPromise: true
    });

    console.log('After openGazeboModal:', clickEval.result.value);

  } finally {
    chromeProc.kill();
  }
}

run();
