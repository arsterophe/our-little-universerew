import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9388;
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
    let WSClass = globalThis.WebSocket;
    if (!WSClass) {
      const wsModule = await import('ws');
      WSClass = wsModule.WebSocket || wsModule.default;
    }
    return new Promise((resolve, reject) => {
      this.ws = new WSClass(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const raw = typeof event.data === 'string' ? event.data : event.data.toString();
        const msg = JSON.parse(raw);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
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
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }
  }
}

async function audit() {
  console.log('🔍 Launching Chrome to audit BEHIND THE SHADOW...');
  const tmpDir = path.join(process.cwd(), 'temp_chrome_audit');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${tmpDir}`,
    'about:blank',
  ]);

  let cdp = null;
  try {
    let connected = false;
    for (let i = 0; i < 20; i++) {
      try {
        await sleep(300);
        await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
        connected = true;
        break;
      } catch {}
    }
    if (!connected) throw new Error('Chrome did not respond');

    const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log(`🌐 Navigating to http://localhost:${PORT}...`);
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}` });
    await sleep(2500);

    const auditData = await cdp.eval(`
      (() => {
        // 1. Check loaded CSS stylesheets
        const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
        const shadowBehindLink = linkTags.find(h => h.includes('shadow_behind.css'));

        // 2. Click Lele card or trigger open
        const leleCard = document.querySelector('.char-card[data-char="lele"]') || 
                         document.querySelector('[data-character="lele"]');
        if (leleCard) leleCard.click();

        // 3. Inspect #shadow-behind-overlay
        const overlay = document.getElementById('shadow-behind-overlay');
        const ch1 = document.getElementById('shadow-behind-chapter-1');
        
        // Find all images in overlay
        const imagesInOverlay = overlay ? Array.from(overlay.querySelectorAll('img')).map(img => ({
          src: img.src,
          currentSrc: img.currentSrc,
          className: img.className,
          id: img.id,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          clientWidth: img.clientWidth,
          clientHeight: img.clientHeight,
          parentClass: img.parentElement?.className
        })) : [];

        // Check grid and computed styles
        const grid = document.querySelector('.shadow-chapter-grid');
        const gridComputed = grid ? window.getComputedStyle(grid).display + ' | ' + window.getComputedStyle(grid).gridTemplateColumns : 'none';

        // Check if there are any other elements with class or id containing "behind" or "shadow"
        const allBehindElements = Array.from(document.querySelectorAll('[id*="behind"], [class*="behind"]')).map(el => ({
          id: el.id,
          tag: el.tagName,
          className: el.className,
          parent: el.parentElement?.id || el.parentElement?.className
        }));

        // Check document title and head
        return {
          shadowBehindLink,
          totalStyleSheets: document.styleSheets.length,
          hasOverlay: !!overlay,
          overlayClassName: overlay?.className,
          imagesInOverlay,
          gridComputed,
          ch1InnerHTMLPrefix: ch1?.innerHTML?.slice(0, 500),
          allBehindElements
        };
      })()
    `);

    console.log('📊 DOM AUDIT RESULTS:');
    console.log(JSON.stringify(auditData, null, 2));

  } finally {
    if (cdp) cdp.close();
    chromeProc.kill('SIGTERM');
  }
}

audit().catch(console.error);
