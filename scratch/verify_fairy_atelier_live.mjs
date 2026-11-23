/**
 * LIVE BROWSER VERIFICATION: THE FAIRY ATELIER (LALA - TO YOU)
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = 9348;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

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

  async eval(expression, retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await this.send('Runtime.evaluate', {
          expression,
          returnByValue: true,
          awaitPromise: true
        });
        return res?.result?.value;
      } catch (err) {
        if (i < retries - 1 && String(err?.message || err).includes('navigated')) {
          await sleep(1500);
          continue;
        }
        throw err;
      }
    }
  }

  async captureScreenshot(outPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('=== STARTING FAIRY ATELIER LIVE VERIFICATION ===');

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800',
    'about:blank'
  ]);

  let client = null;
  try {
    let targets = null;
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      try {
        targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (_) {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Chrome CDP endpoints not ready');
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    console.log('Connected to Chrome CDP WebSocket');

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    await client.send('Page.navigate', { url: `http://127.0.0.1:5173/` });
    console.log('Navigated to application root');
    await sleep(3500);

    // Open Fairy Atelier
    console.log('Opening The Fairy Atelier...');
    const openRes = await client.eval(`
      (async () => {
        try {
          const lalaUid = 'EqByKA8FXoTEt0OmIsSDPfnxMDB3';
          const mod = await import('/fairy_atelier_view.js');
          const ctrl = mod.initFairyAtelierView({
            onShowToast: (m) => console.log('[Toast]', m),
            onTriggerSparkle: () => {},
            onNavigateBack: () => {}
          });
          window.fairyAtelierController = ctrl;
          await ctrl.openFairyAtelier(lalaUid);
          const av = document.getElementById('view-fairy-atelier');
          return {
            active: av ? av.classList.contains('active') : false,
            hasElement: !!av
          };
        } catch (e) {
          return { error: e.message };
        }
      })()
    `);
    console.log('Open result:', openRes);
    await sleep(1500);

    // Screenshot 1: Fairy Wardrobe
    console.log('1. Capturing Fairy Wardrobe screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_wardrobe_live.jpg'));

    // Switch to Magic Dressing Room
    console.log('2. Switching to Magic Dressing Room...');
    await client.eval(`
      (() => {
        window.fairyAtelierController.switchTab('dressing_room');
      })()
    `);
    await sleep(1000);
    console.log('Capturing Magic Dressing Room screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_dressing_room_live.jpg'));

    // Switch to Designer's Corner -> Fashion Sketchbook
    console.log('3. Switching to Fashion Sketchbook...');
    await client.eval(`
      (() => {
        window.fairyAtelierController.switchTab('designer_corner');
        window.fairyAtelierController.switchDesignerSubtab('sketchbook');

        // Draw fairy dress sketch on canvas
        const cvs = document.getElementById('atelier-drawing-canvas');
        if (cvs) {
          const ctx = cvs.getContext('2d');
          // Bodice
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(300, 140);
          ctx.lineTo(350, 140);
          ctx.lineTo(340, 210);
          ctx.lineTo(310, 210);
          ctx.closePath();
          ctx.stroke();

          // Flared gown skirt
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(310, 210);
          ctx.bezierCurveTo(240, 320, 200, 420, 180, 470);
          ctx.lineTo(470, 470);
          ctx.bezierCurveTo(450, 420, 410, 320, 340, 210);
          ctx.stroke();

          // Wings outline
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(325, 150);
          ctx.bezierCurveTo(200, 60, 120, 140, 140, 280);
          ctx.moveTo(325, 150);
          ctx.bezierCurveTo(450, 60, 530, 140, 510, 280);
          ctx.stroke();
        }
      })()
    `);
    await sleep(1000);
    console.log('Capturing Fashion Sketchbook screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_sketchbook_live.jpg'));

    // Switch to Inspiration Board
    console.log('4. Switching to Inspiration Board...');
    await client.eval(`
      (() => {
        window.fairyAtelierController.switchDesignerSubtab('inspiration_board');
      })()
    `);
    await sleep(1000);
    console.log('Capturing Inspiration Board screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_inspiration_board_live.jpg'));

    // Switch to Fabric & Color Library
    console.log('5. Switching to Fabric & Color Library...');
    await client.eval(`
      (() => {
        window.fairyAtelierController.switchDesignerSubtab('fabric_library');
      })()
    `);
    await sleep(1000);
    console.log('Capturing Fabric Library screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_fabrics_live.jpg'));

    // Switch to Mannequin Studio
    console.log('6. Switching to Mannequin Studio...');
    await client.eval(`
      (() => {
        window.fairyAtelierController.switchDesignerSubtab('mannequin_studio');
      })()
    `);
    await sleep(1000);
    console.log('Capturing Mannequin Studio screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_mannequin_live.jpg'));

    // Switch to My Fashion Portfolio
    console.log('7. Switching to My Fashion Portfolio...');
    await client.eval(`
      (() => {
        window.fairyAtelierController.switchDesignerSubtab('portfolio');
      })()
    `);
    await sleep(1000);
    console.log('Capturing Portfolio screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_portfolio_live.jpg'));

    // Switch to My Lookbook
    console.log('8. Switching to My Lookbook...');
    await client.eval(`
      (() => {
        window.fairyAtelierController.switchTab('lookbook');
      })()
    `);
    await sleep(1000);
    console.log('Capturing My Lookbook screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_lookbook_live.jpg'));

    // Switch to Seasonal Collections
    console.log('9. Switching to Seasonal Collections...');
    await client.eval(`
      (() => {
        window.fairyAtelierController.switchTab('seasonal');
      })()
    `);
    await sleep(1000);
    console.log('Capturing Seasonal Collections screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_seasonal_live.jpg'));

    // Mobile Viewport
    console.log('10. Switching to Mobile View (390 x 844)...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);
    console.log('Capturing Mobile View screenshot...');
    await client.captureScreenshot(path.join(artDir, 'fairy_atelier_mobile_390_live.jpg'));

    console.log('🎉 ALL LIVE SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    if (client) client.close();
    chromeProc.kill();
  }
}

run().catch((e) => {
  console.error('Live verification failed:', e);
  process.exit(1);
});
