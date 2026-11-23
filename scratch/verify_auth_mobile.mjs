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
  const tmpUserDataDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_mobile_auth_${Date.now()}`);
  fs.mkdirSync(tmpUserDataDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpUserDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=390,844',
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
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });

    console.log('Mobile: Navigating to http://localhost:5173 ...');
    await client.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    const shotMobileSelection = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'auth_06_mobile_selection_390.jpg'), Buffer.from(shotMobileSelection.data, 'base64'));
    console.log('Saved auth_06_mobile_selection_390.jpg');

    // Click Akhira
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.querySelector('.character-card[data-character="akhira"]');
          if (card) card.click();
        })()
      `
    });
    await sleep(500);

    const shotMobileLogin = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'auth_07_mobile_login_390.jpg'), Buffer.from(shotMobileLogin.data, 'base64'));
    console.log('Saved auth_07_mobile_login_390.jpg');

    console.log('Mobile verification done!');
    client.close();
  } catch (err) {
    console.error('Mobile verification error:', err);
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch {}
  }
}

run();
