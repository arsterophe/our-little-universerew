import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(os.tmpdir() + '/olu-mod-');
const port = 9333;

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
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
    await new Promise(r => ws.addEventListener('open', r));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const reqId = id++;
        const handler = (ev) => {
          const data = JSON.parse(ev.data);
          if (data.id === reqId) {
            ws.removeEventListener('message', handler);
            if (data.error) rej(new Error(data.error.message));
            else res(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:5173' });

    // Wait until window.renderPrivateUniverse is defined
    let loaded = false;
    for (let i = 0; i < 50; i++) {
      const chk = await send('Runtime.evaluate', {
        expression: 'typeof window.renderPrivateUniverse',
        returnByValue: true
      });
      if (chk.result.value === 'function') {
        loaded = true;
        console.log(`✅ main.js module ready in ${i * 100}ms!`);
        break;
      }
      await sleep(100);
    }

    if (!loaded) {
      console.error('❌ Timeout waiting for window.renderPrivateUniverse');
      ws.close();
      return;
    }

    // Now test calling renderPrivateUniverse with Royan
    const testResult = await send('Runtime.evaluate', {
      expression: `
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

          const hotCard = document.querySelector('.card-hot');
          const badge = hotCard?.querySelector('.island-universe-badge');

          return {
            activeView: document.querySelector('.view-section.active')?.id,
            greeting: document.getElementById('univ-user-greeting')?.textContent,
            hotCardClass: hotCard?.className,
            badgeClass: badge?.className,
            badgeText: badge?.textContent?.trim()
          };
        })()
      `,
      returnByValue: true,
      awaitPromise: true
    });

    console.log('Result:', JSON.stringify(testResult.result.value, null, 2));
    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    try { chrome.kill(); } catch (_) {}
  }
}
run();

