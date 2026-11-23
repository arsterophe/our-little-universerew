import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-test-planets-'));
const port = 9265;

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
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

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 1;
    const map = new Map();
    ws.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          const reqId = id++;
          return new Promise((res, rej) => {
            map.set(reqId, { res, rej });
            ws.send(JSON.stringify({ id: reqId, method, params }));
          });
        },
        close() { ws.close(); }
      });
    });
    ws.addEventListener('message', ev => {
      const data = JSON.parse(ev.data);
      if (data.id && map.has(data.id)) {
        const { res, rej } = map.get(data.id);
        map.delete(data.id);
        if (data.error) rej(new Error(data.error.message));
        else res(data.result);
      }
    });
    ws.addEventListener('error', reject);
  });
}

let passed = 0;
let total = 0;
function assert(cond, msg, detail = '') {
  total++;
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${msg}${detail ? ' -> ' + detail : ''}`);
    process.exitCode = 1;
  }
}

try {
  const wsUrl = await getWsUrl();
  const cdp = await connect(wsUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  // --- DESKTOP 1366 x 768 ---
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
  await sleep(2500);

  // Transition to universe selection screen
  await cdp.send('Runtime.evaluate', {
    expression: `(async () => {
      const m = await import('/main.js');
      await m.showUniversesView();
    })()`,
    awaitPromise: true
  });
  await sleep(600);

  // Capture Screenshot 1: Desktop Initial State
  const snap1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('public/assets/test_desktop_planets_initial.png', Buffer.from(snap1.data, 'base64'));

  const s1 = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.universes-islands-stage');
      const cards = Array.from(document.querySelectorAll('.univ-island-card'));
      const prev = document.getElementById('btn-planets-prev');
      const next = document.getElementById('btn-planets-next');
      const sr = stage.getBoundingClientRect();
      const visible = cards.filter(c => {
        const r = c.getBoundingClientRect();
        return r.right > sr.left + 5 && r.left < sr.right - 5;
      }).map(c => c.getAttribute('data-universe'));

      return {
        scrollWidth: stage.scrollWidth,
        clientWidth: stage.clientWidth,
        scrollLeft: stage.scrollLeft,
        visible,
        prevDisabled: prev.disabled,
        nextDisabled: next.disabled
      };
    })()`,
    returnByValue: true
  });
  const data1 = s1.result.value;

  assert(data1.scrollWidth > data1.clientWidth, `Desktop scrollWidth (${data1.scrollWidth}) > clientWidth (${data1.clientWidth})`);
  assert(data1.scrollLeft === 0, 'Desktop initial scrollLeft is 0');
  assert(data1.visible.slice(0, 3).join(',') === 'kidult,to_you,shadow', `First 3 planets initially visible: ${data1.visible.join(', ')}`);
  assert(data1.prevDisabled === true && data1.nextDisabled === false, 'Prev disabled & Next enabled initially');

  // Test Right Arrow button
  await cdp.send('Runtime.evaluate', {
    expression: `document.getElementById('btn-planets-next').click()`,
    awaitPromise: true
  });
  await sleep(600);

  const s2 = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.universes-islands-stage');
      return { scrollLeft: stage.scrollLeft };
    })()`,
    returnByValue: true
  });
  assert(s2.result.value.scrollLeft > 0, `Next button scrolled stage right (scrollLeft=${s2.result.value.scrollLeft})`);

  // Scroll to the end to reach PINWHEEL and ASH
  for (let i = 0; i < 4; i++) {
    await cdp.send('Runtime.evaluate', { expression: `document.getElementById('btn-planets-next').click()` });
    await sleep(400);
  }

  // Capture Screenshot 2: Desktop Scrolled to End
  const snap2 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('public/assets/test_desktop_planets_scrolled.png', Buffer.from(snap2.data, 'base64'));

  const s3 = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.universes-islands-stage');
      const cards = Array.from(document.querySelectorAll('.univ-island-card'));
      const sr = stage.getBoundingClientRect();
      const visible = cards.filter(c => {
        const r = c.getBoundingClientRect();
        return r.right > sr.left + 5 && r.left < sr.right - 5;
      }).map(c => c.getAttribute('data-universe'));

      return {
        scrollLeft: stage.scrollLeft,
        visible,
        hasPinwheel: visible.includes('pinwheel'),
        hasAsh: visible.includes('ash')
      };
    })()`,
    returnByValue: true
  });
  const data3 = s3.result.value;
  assert(data3.hasPinwheel && data3.hasAsh, `Planets 6 & 7 (ash, pinwheel) reached via Next: ${data3.visible.join(', ')}`);

  // Test Left Arrow button back to start
  for (let i = 0; i < 5; i++) {
    await cdp.send('Runtime.evaluate', { expression: `document.getElementById('btn-planets-prev').click()` });
    await sleep(350);
  }
  const s4 = await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('.universes-islands-stage').scrollLeft`,
    returnByValue: true
  });
  assert(s4.result.value <= 10, `Prev button navigated back to start (scrollLeft=${s4.result.value})`);

  // Test Mouse Drag
  const dragRes = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.universes-islands-stage');
      const box = stage.getBoundingClientRect();
      const sx = box.left + box.width * 0.5;
      const sy = box.top + box.height * 0.5;
      stage.dispatchEvent(new PointerEvent('pointerdown', { clientX: sx, clientY: sy, pointerType: 'mouse', button: 0, bubbles: true }));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: sx - 250, clientY: sy, pointerType: 'mouse', bubbles: true }));
      window.dispatchEvent(new PointerEvent('pointerup', { clientX: sx - 250, clientY: sy, pointerType: 'mouse', bubbles: true }));
      return stage.scrollLeft;
    })()`,
    returnByValue: true
  });
  assert(dragRes.result.value >= 200, `Mouse drag scrolled horizontally (scrollLeft=${dragRes.result.value})`);

  // Reset scroll on desktop before switching to mobile
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.universes-islands-stage');
      stage.style.scrollBehavior = 'auto';
      stage.scrollLeft = 0;
    })()`
  });
  await sleep(200);

  // --- MOBILE 390 x 844 ---
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(500);

  const mob1 = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.universes-islands-stage');
      return {
        scrollWidth: stage.scrollWidth,
        clientWidth: stage.clientWidth,
        scrollLeft: stage.scrollLeft
      };
    })()`,
    returnByValue: true
  });
  assert(mob1.result.value.scrollWidth > mob1.result.value.clientWidth,
    `Mobile (390x844) scrollWidth (${mob1.result.value.scrollWidth}) > clientWidth (${mob1.result.value.clientWidth})`);

  // Mobile Touch Swipe Left (scroll forward)
  const mobBeforeSwipe = await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('.universes-islands-stage').scrollLeft`,
    returnByValue: true
  });
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.universes-islands-stage');
      stage.scrollBy({ left: 320, behavior: 'auto' });
    })()`
  });
  await sleep(300);

  // Capture Screenshot 3: Mobile Swiped
  const snap3 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('public/assets/test_mobile_planets.png', Buffer.from(snap3.data, 'base64'));

  const mob2 = await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('.universes-islands-stage').scrollLeft`,
    returnByValue: true
  });
  assert(mob2.result.value > mobBeforeSwipe.result.value,
    `Mobile swipe scrolled horizontally (${mobBeforeSwipe.result.value} -> ${mob2.result.value})`);

  // Mobile Touch Swipe Right (scroll back)
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.universes-islands-stage');
      stage.scrollTo({ left: 0, behavior: 'auto' });
    })()`
  });
  await sleep(300);
  const mob3 = await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('.universes-islands-stage').scrollLeft`,
    returnByValue: true
  });
  assert(mob3.result.value <= 10, `Mobile swipe back returned to start (scrollLeft=${mob3.result.value})`);

  cdp.close();
} catch (e) {
  console.error('TEST_FAIL:', e);
} finally {
  chrome.kill();
  try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
  console.log(`\nBrowser Live Test Summary: ${passed}/${total} passed`);
  process.exit(passed === total && total > 0 ? 0 : 1);
}
