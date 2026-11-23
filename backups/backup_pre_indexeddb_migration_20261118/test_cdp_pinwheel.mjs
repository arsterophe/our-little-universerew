import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9325;
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
        const msg = JSON.parse(raw.toString());
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
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
    return res?.result?.value;
  }

  async captureScreenshot(outPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  }
}

async function run() {
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1920,1080',
    `http://localhost:${PORT}/`
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      try {
        targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (_) {}
    }

    const pageTarget = targets?.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    // Give Vite HMR and initial page load time to settle
    await sleep(3500);

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    await sleep(1500);

    // 1. Enter Pinwheel World
    const enterRes = await client.eval(`
      (async () => {
        try {
          window.isPreviewingUniverses = true;
          const sel = document.getElementById('view-selection');
          if (sel) {
            sel.classList.remove('active');
            sel.setAttribute('aria-hidden', 'true');
          }
          const mod = await import('/pinwheel_view.js');
          const ctrl = mod.initPinwheelWorld({
            onShowToast: (msg) => console.log('Toast:', msg),
            onTriggerSparkle: () => {},
            onNavigateStarMessages: (originUniv) => {
              import('/star_messages_view.js').then(({ initStarMessagesView }) => {
                const sCtrl = initStarMessagesView({
                  onNavigateBack: () => {
                    ctrl.openPinwheelWorld();
                  }
                });
                sCtrl.openStarMessages(originUniv, 'abil');
              });
            }
          });
          ctrl.openPinwheelWorld();
          return { success: true };
        } catch (e) {
          return { success: false, err: e.message };
        }
      })()
    `);
    console.log('Enter Pinwheel result:', enterRes);

    await sleep(1000);

    // 2. Open Observatory and click Telescope action button
    const openTelescopeRes = await client.eval(`
      (() => {
        const obsBtn = document.getElementById('btn-loc-pinwheel-observatory');
        if (obsBtn) obsBtn.click();
        const actionBtn = document.getElementById('btn-pinwheel-open-telescope');
        if (actionBtn) {
          actionBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Open telescope result:', openTelescopeRes);

    await sleep(1500);

    // 3. Inspect Stars in Sky
    const starsSummary = await client.eval(`
      (() => {
        const nodes = Array.from(document.querySelectorAll('.celestial-star-node'));
        return nodes.map(n => ({
          starId: n.getAttribute('data-star-id'),
          label: n.querySelector('.star-floating-label')?.textContent.trim(),
          left: n.style.left,
          top: n.style.top,
          isPinwheelNode: n.classList.contains('star-node-pinwheel')
        }));
      })()
    `);
    console.log('Rendered stars in sky:', starsSummary);

    const artDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

    // Capture Sky showing all stars including Syma's Star
    await client.captureScreenshot(path.join(artDir, 'syma_star_in_sky.png'));
    console.log('Captured: syma_star_in_sky.png');

    // 4. Click Syma's Star
    const clickSymaStar = await client.eval(`
      (() => {
        const symaNode = document.querySelector('.celestial-star-node.star-node-pinwheel') ||
                         Array.from(document.querySelectorAll('.celestial-star-node')).find(n => n.textContent.includes('Syma'));
        if (symaNode) {
          symaNode.click();
          return { clicked: true };
        }
        return { clicked: false };
      })()
    `);
    console.log('Click Syma star result:', clickSymaStar);

    await sleep(800);

    // Inspect Letter Modal details
    const letterModalState = await client.eval(`
      (() => {
        const modal = document.getElementById('star-letter-modal');
        const sender = document.getElementById('star-letter-sender-name')?.textContent.trim();
        const univ = document.getElementById('star-letter-univ-tag')?.textContent.trim();
        const body = document.getElementById('star-letter-body')?.textContent.trim();
        return {
          isOpen: modal?.classList.contains('active'),
          sender,
          univ,
          snippet: body?.slice(0, 50)
        };
      })()
    `);
    console.log('Letter modal state:', letterModalState);

    // Capture letter modal opened
    await client.captureScreenshot(path.join(artDir, 'syma_star_letter_opened.png'));
    console.log('Captured: syma_star_letter_opened.png');

    // Close letter modal
    await client.eval(`
      (() => {
        document.getElementById('btn-close-star-letter')?.click();
      })()
    `);
    await sleep(400);

    // 5. Test Mobile Viewport (390x844)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    await sleep(600);

    await client.captureScreenshot(path.join(artDir, 'syma_star_mobile.png'));
    console.log('Captured: syma_star_mobile.png');

    console.log('=== ALL SYMA STAR CHECKS & SCREENSHOTS COMPLETED! ===');
  } catch (err) {
    console.error('Error during test:', err);
    process.exitCode = 1;
  } finally {
    try {
      chromeProc.kill('SIGTERM');
    } catch (_) {}
  }
}

run();
