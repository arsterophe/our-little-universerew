import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-cdp-'));
const port = 9231 + Math.floor(Math.random() * 200);

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpProfile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  'about:blank'
], { stdio: 'ignore' });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await res.json();
      const page = targets.find(t => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch (_) {}
    await sleep(250);
  }
  throw new Error('Could not connect to headless Chrome CDP');
}

function createCdpClient(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let nextId = 1;
    const pending = new Map();
    ws.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          const id = nextId++;
          return new Promise((res, rej) => {
            pending.set(id, { res, rej });
            ws.send(JSON.stringify({ id, method, params }));
          });
        },
        close() {
          ws.close();
        }
      });
    });
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
      }
    });
    ws.addEventListener('error', reject);
  });
}

async function evalJs(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (res.exceptionDetails) {
    throw new Error(JSON.stringify(res.exceptionDetails));
  }
  return res.result.value;
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
  const cdp = await createCdpClient(wsUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false
  });

  // 1. Check landing page does NOT auto-redirect to SHADOW
  await cdp.send('Page.navigate', { url: 'http://localhost:5175/' });
  await sleep(4500);
  const landingState = await evalJs(cdp, `({
    selectionActive: document.getElementById('view-selection')?.classList.contains('active'),
    shadowActive: document.getElementById('view-shadow-world')?.classList.contains('active')
  })`);
  assert(landingState.selectionActive === true && landingState.shadowActive === false,
    'Landing page stays on #view-selection and does NOT auto-redirect to SHADOW');

  // 2. Activate Universe Selection (#view-private-universe) after initial auth observer settles
  await evalJs(cdp, `(async () => {
    document.getElementById('view-selection')?.classList.remove('active');
    const pv = document.getElementById('view-private-universe');
    pv?.classList.add('active');
    pv?.setAttribute('aria-hidden', 'false');
    if (!window.universesController) {
      const m = await import('/universes_view.js');
      window.universesController = m.initUniversesView();
    }
  })()`);
  await sleep(1000);

  const initial = await evalJs(cdp, `(() => {
    const stage = document.querySelector('.universes-islands-stage');
    const prev = document.getElementById('btn-planets-prev');
    const next = document.getElementById('btn-planets-next');
    const hint = document.getElementById('univ-drag-hint');
    const cards = Array.from(document.querySelectorAll('.univ-island-card'));
    const sr = stage.getBoundingClientRect();
    const visible = cards.filter(c => {
      const r = c.getBoundingClientRect();
      return r.right > sr.left + 10 && r.left < sr.right - 10;
    }).map(c => c.getAttribute('data-universe'));
    const imgsLoaded = cards.every(c => {
      const img = c.querySelector('.floating-island-image');
      return img && img.complete && img.naturalWidth > 0;
    });
    return {
      count: cards.length,
      order: cards.map(c => c.getAttribute('data-universe')),
      scrollLeft: stage.scrollLeft,
      scrollWidth: stage.scrollWidth,
      clientWidth: stage.clientWidth,
      prevDisabled: prev?.disabled,
      nextDisabled: next?.disabled,
      hintDismissed: hint?.classList.contains('is-dismissed'),
      visible,
      imgsLoaded
    };
  })()`);

  assert(initial.count === 7, `7 planets rendered (got ${initial.count})`);
  assert(JSON.stringify(initial.order) === JSON.stringify(['kidult', 'to_you', 'shadow', 'yawn', 'us_again', 'ash', 'pinwheel']),
    `Exact 7-universe order preserved: ${initial.order.join(', ')}`);
  assert(initial.scrollWidth > initial.clientWidth,
    `Horizontal overflow active (scrollWidth=${initial.scrollWidth} > clientWidth=${initial.clientWidth})`);
  assert(initial.scrollLeft === 0, `Initial scrollLeft is 0 (got ${initial.scrollLeft})`);
  assert(initial.visible.slice(0, 3).join(',') === 'kidult,to_you,shadow',
    `First 3 planets visible initially: ${initial.visible.join(', ')}`);
  assert(initial.prevDisabled === true && initial.nextDisabled === false,
    'Prev arrow initially disabled, Next arrow initially enabled');
  assert(initial.hintDismissed === false, 'Drag/swipe hint initially visible');
  assert(initial.imgsLoaded === true, 'All 7 planet artwork images loaded (naturalWidth > 0)');

  // 3. Click Right Arrow 4 times to reach planets 4..7
  for (let i = 0; i < 4; i++) {
    await evalJs(cdp, `document.getElementById('btn-planets-next').click()`);
    await sleep(450);
  }

  const afterNext = await evalJs(cdp, `(() => {
    const stage = document.querySelector('.universes-islands-stage');
    const prev = document.getElementById('btn-planets-prev');
    const next = document.getElementById('btn-planets-next');
    const hint = document.getElementById('univ-drag-hint');
    const cards = Array.from(document.querySelectorAll('.univ-island-card'));
    const sr = stage.getBoundingClientRect();
    const visible = cards.filter(c => {
      const r = c.getBoundingClientRect();
      return r.right > sr.left + 10 && r.left < sr.right - 10;
    }).map(c => c.getAttribute('data-universe'));
    const activeDots = Array.from(document.querySelectorAll('.univ-nav-dot')).filter(d => d.classList.contains('is-active')).length;
    return {
      pvClasses: document.getElementById('view-private-universe')?.className,
      scrollLeft: stage.scrollLeft,
      scrollWidth: stage.scrollWidth,
      clientWidth: stage.clientWidth,
      prevDisabled: prev?.disabled,
      nextDisabled: next?.disabled,
      hintDismissed: hint?.classList.contains('is-dismissed'),
      visible,
      activeDots
    };
  })()`);

  assert(afterNext.scrollLeft > 400, `Right arrow scrolled stage right (scrollLeft=${afterNext.scrollLeft}, pvClasses=${afterNext.pvClasses}, sw=${afterNext.scrollWidth}, cw=${afterNext.clientWidth})`);
  assert(afterNext.visible.includes('pinwheel') && afterNext.visible.includes('ash'),
    `Planets 6 & 7 (ash, pinwheel) reachable via right arrow: ${afterNext.visible.join(', ')}`);
  assert(afterNext.prevDisabled === false, 'Prev arrow enabled after scrolling right');
  assert(afterNext.hintDismissed === true, 'Drag hint dismissed after scrolling');
  assert(afterNext.activeDots === 1, 'Active navigation dot highlighted');

  // 4. Click Left Arrow to go back
  await evalJs(cdp, `document.getElementById('btn-planets-prev').click()`);
  await sleep(500);
  const afterPrevScrollLeft = await evalJs(cdp, `document.querySelector('.universes-islands-stage').scrollLeft`);
  assert(afterPrevScrollLeft < afterNext.scrollLeft,
    `Left arrow scrolled back left (${afterNext.scrollLeft} -> ${afterPrevScrollLeft})`);

  // 5. Mouse drag test (drag left/right must scroll and NOT open modal)
  const stageBox = await evalJs(cdp, `(() => {
    const r = document.querySelector('.universes-islands-stage').getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.4 };
  })()`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: stageBox.x, y: stageBox.y, button: 'left', clickCount: 1 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: stageBox.x - 160, y: stageBox.y, button: 'left' });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: stageBox.x - 160, y: stageBox.y, button: 'left', clickCount: 1 });
  await sleep(300);

  const afterDrag = await evalJs(cdp, `({
    scrollLeft: document.querySelector('.universes-islands-stage').scrollLeft,
    modalActive: document.getElementById('univ-modal-explorer')?.classList.contains('active')
  })`);
  assert(afterDrag.scrollLeft !== afterPrevScrollLeft,
    `Mouse drag changed scrollLeft (${afterPrevScrollLeft} -> ${afterDrag.scrollLeft})`);
  assert(afterDrag.modalActive === false, 'Mouse drag did NOT accidentally open universe modal');

  // 6. Click planet card opens universe modal
  await evalJs(cdp, `document.querySelector('.card-pinwheel').click()`);
  await sleep(300);
  const modalTitle = await evalJs(cdp, `({
    active: document.getElementById('univ-modal-explorer')?.classList.contains('active'),
    title: document.getElementById('univ-modal-title')?.textContent?.trim()
  })`);
  assert(modalTitle.active === true && modalTitle.title.includes('PINWHEEL'),
    `Clicking PINWHEEL planet opens detail modal (${modalTitle.title})`);

  // 7. Mobile viewport (390x844) check
  await evalJs(cdp, `document.querySelector('#univ-modal-explorer [data-close-univ-modal]')?.click()`);
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(400);
  const mobileState = await evalJs(cdp, `(() => {
    const stage = document.querySelector('.universes-islands-stage');
    const prev = document.getElementById('btn-planets-prev');
    const next = document.getElementById('btn-planets-next');
    return {
      scrollWidth: stage.scrollWidth,
      clientWidth: stage.clientWidth,
      nextVisible: !!next && getComputedStyle(next).display !== 'none',
      prevVisible: !!prev && getComputedStyle(prev).display !== 'none'
    };
  })()`);
  assert(mobileState.scrollWidth > mobileState.clientWidth,
    `Mobile (390x844) horizontal overflow active (scrollWidth=${mobileState.scrollWidth} > clientWidth=${mobileState.clientWidth})`);
  assert(mobileState.nextVisible && mobileState.prevVisible,
    'Mobile navigation arrow buttons visible');

  cdp.close();
} catch (err) {
  console.error('TEST SCRIPT ERROR:', err);
  process.exitCode = 1;
} finally {
  chrome.kill();
  try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
  console.log(`\nLive Browser Verification Summary: ${passed}/${total} passed`);
  process.exit(passed === total && total > 0 ? 0 : 1);
}
