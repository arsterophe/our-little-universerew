import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = Math.floor(15000 + Math.random() * 15000);
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ALENDA/.gemini/antigravity/brain/9032e95e-6264-445e-8703-2e60383b3a62';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
  }

  async connect() {
    const { WebSocket } = await import('ws');
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (raw) => {
        const msg = JSON.parse(raw);
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args?.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
        } else if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text);
        }
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        }
      });
    });
  }

  send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const tmpUserDataDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_test_${Date.now()}`);
  fs.mkdirSync(tmpUserDataDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpUserDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const list = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
        if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
          wsUrl = list[0].webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    if (!wsUrl) throw new Error('Failed to obtain Chrome CDP WebSocket URL');

    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('Navigating to http://localhost:5173 ...');
    await client.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(3000);

    // Test Akhira authenticated state and rendering
    console.log('Rendering Akhira private universe view...');
    const evalRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const { ensureUniversesController } = await import('/main.js');
          const univCtrl = await ensureUniversesController();
          
          const akhiraUser = {
            uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2',
            email: 'akhira@ourlittleuniverse.com',
            displayName: 'Akhira',
            emailVerified: true
          };

          const charConfig = {
            name: 'Akhira',
            characterKey: 'akhira',
            universe: 'YAWN',
            symbol: '⚡'
          };

          // Render universe selection without auto-opening Yawn world
          await univCtrl.renderPrivateUniverse(akhiraUser, charConfig, false);

          const loader = document.getElementById('cosmic-app-loader');
          if (loader) {
            loader.classList.add('loaded');
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
          }

          const privateView = document.getElementById('view-private-universe');
          const cards = Array.from(document.querySelectorAll('.univ-island-card'));
          const greetingEl = document.getElementById('univ-user-greeting');
          const yawnWorld = document.getElementById('view-yawn-world');

          return {
            success: true,
            privateViewActive: privateView ? privateView.classList.contains('active') : false,
            yawnWorldActive: yawnWorld ? yawnWorld.classList.contains('active') : false,
            greeting: greetingEl ? greetingEl.textContent.trim() : null,
            cardsCount: cards.length,
            cards: cards.map(c => ({
              id: c.id,
              universe: c.dataset.universe,
              isMyUniverse: c.classList.contains('is-my-universe'),
              isVisit: c.classList.contains('is-visit-universe')
            }))
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Result from browser:', JSON.stringify(evalRes.result?.value, null, 2));

    await sleep(1500);

    // Capture desktop screenshot
    console.log('Capturing desktop screenshot...');
    const screenshot = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    const screenshotPath = path.join(ARTIFACT_DIR, 'universe_selection_akhira_live.jpg');
    fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Saved screenshot to:', screenshotPath);

    // Emulate Mobile 390x844
    console.log('Emulating mobile 390x844...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);
    const mobileScreenshot = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'universe_selection_akhira_mobile_390.jpg');
    fs.writeFileSync(mobileScreenshotPath, Buffer.from(mobileScreenshot.data, 'base64'));
    console.log('Saved mobile screenshot to:', mobileScreenshotPath);

    client.close();
  } finally {
    try {
      chromeProc.kill();
    } catch {}
    try {
      fs.rmSync(tmpUserDataDir, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
