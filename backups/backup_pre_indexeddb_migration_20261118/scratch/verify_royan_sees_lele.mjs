import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const srcProfile = 'C:\\Users\\ALENDA\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 3';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-verify-royan-lele-'));
const targetDefault = path.join(tmpDir, 'Default');

fs.mkdirSync(targetDefault, { recursive: true });
fs.cpSync(path.join(srcProfile, 'Local Storage'), path.join(targetDefault, 'Local Storage'), { recursive: true });

const port = 9395;
const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpDir}`,
  '--no-first-run',
  '--no-default-browser-check',
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

    let msgId = 1;
    const pending = new Map();

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, (data) => resolve(data.result));
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const consoleLogs = [];
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push(data.params.args.map(a => a.value || a.description).join(' '));
      }
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('1. Navigating to http://localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2000);

    console.log('2. Opening Our Stories directly as Royan...');
    const result = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          // Dynamically import storiesController and ensure it is synced as Royan
          const mod = await import('/stories.js');
          mod.setActiveUserCharacter('royan', { uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2' });

          const viewMod = await import('/stories_view.js');
          const ctrl = viewMod.initStoriesView();
          ctrl.openOurStories('view-hot-world');

          // Read the stories in storiesStore
          const published = mod.getPublishedStories();

          // Wait a frame for UI render
          await new Promise(r => setTimeout(r, 600));

          // Inspect the rendered DOM cards in #stories-grid
          const grid = document.getElementById('stories-grid');
          const cards = grid ? Array.from(grid.querySelectorAll('.story-card')).map(card => {
            return {
              title: card.querySelector('.story-title')?.textContent?.trim() || card.querySelector('h3')?.textContent?.trim(),
              author: card.querySelector('.author-name')?.textContent?.trim() || card.querySelector('.story-meta')?.textContent?.trim()
            };
          }) : [];

          return {
            publishedCount: published.length,
            publishedStories: published.map(s => ({ id: s.id, title: s.title, author: s.authorName, universe: s.universeName, status: s.status })),
            renderedCards: cards
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('\n=== REAL BROWSER OUR STORIES RESULTS FOR ROYAN ===');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('Console logs:', consoleLogs);

    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const artifactPath = path.join('C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62', 'royan_library_sees_lele_stories.jpg');
    fs.writeFileSync(artifactPath, Buffer.from(shot.data, 'base64'));
    console.log('Captured screenshot to:', artifactPath);

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (_) {}
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

run();
