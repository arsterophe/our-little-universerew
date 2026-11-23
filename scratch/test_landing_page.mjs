import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = Math.floor(15000 + Math.random() * 15000);
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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
          console.log('[CONSOLE]', msg.params.type, msg.params.args?.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
        } else if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[EXCEPTION]', msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text);
        }
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve: res, reject: rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function testLanding() {
  const tmpProfile = path.resolve(`./scratch/cdp_profile_test_logs_${Date.now()}`);
  fs.mkdirSync(tmpProfile, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpProfile}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,720',
    'about:blank'
  ]);

  let cdp = null;
  try {
    let version = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        version = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
        if (version?.webSocketDebuggerUrl) break;
      } catch (e) {}
    }

    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');

    console.log('[TEST] Navigating to http://localhost:5173...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(4000);

    const info = await cdp.eval(`
      (() => {
        const loader = document.getElementById('cosmic-app-loader');
        const viewSelection = document.getElementById('view-selection');
        const cards = document.querySelectorAll('.character-card');
        return {
          readyState: document.readyState,
          loaderExists: !!loader,
          loaderClass: loader?.className,
          loaderDisplay: loader ? window.getComputedStyle(loader).display : null,
          loaderOpacity: loader ? window.getComputedStyle(loader).opacity : null,
          loaderVisibility: loader ? window.getComputedStyle(loader).visibility : null,
          selectionActive: viewSelection?.classList.contains('active'),
          cardsCount: cards.length
        };
      })()
    `);
    console.log('[TEST] Page State Info:', info);

  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch (_) {}
  }
}

testLanding().catch(console.error);
