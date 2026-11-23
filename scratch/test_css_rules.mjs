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

    const rulesCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('ygazebo-modal-backdrop');
          el.classList.add('active');
          const matched = [];
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                if (rule.selectorText && el.matches(rule.selectorText)) {
                  matched.push({ selector: rule.selectorText, cssText: rule.cssText, href: sheet.href });
                }
              }
            } catch (e) {}
          }
          return matched;
        })()
      `,
      returnByValue: true
    });
    console.log('Matched rules:', JSON.stringify(rulesCheck.result.value, null, 2));

  } finally {
    chromeProc.kill();
  }
}

run();
