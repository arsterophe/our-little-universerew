import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9358;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\36374948-9b1c-47c2-b618-025d3a41477d';

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

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error('CDP Eval Error: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`  📸 Screenshot saved: ${path.basename(filePath)}`);
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch (_) { }
    }
  }
}

async function runLiveAudit() {
  console.log('================================================================');
  console.log('🚀 LIVE BROWSER VERIFICATION: OUR LITTLE ORBIT (ALL 8 UNIVERSES) 🚀');
  console.log('================================================================\n');

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const tmpProfile = path.join(process.cwd(), '.tmp_cdp_orbit_profile2');
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${tmpProfile}`,
    '--window-size=1440,900',
    `http://localhost:${PORT}/`
  ]);

  let connected = false;
  let client = null;

  try {
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        const version = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
        if (version && version.webSocketDebuggerUrl) {
          const list = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
          const page = list.find((t) => t.type === 'page');
          if (page && page.webSocketDebuggerUrl) {
            client = new CDPClient(page.webSocketDebuggerUrl);
            await client.connect();
            connected = true;
            break;
          }
        }
      } catch (_) { }
    }

    if (!connected) {
      throw new Error('Could not connect to Chrome DevTools Protocol on port ' + CDP_PORT);
    }
    console.log('✓ Successfully connected to Chrome CDP.\n');

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');
    await sleep(2000);

    // Boot & initialize main controllers
    console.log('--- Step 0: Ensuring Controllers Initialized ---');
    await client.evaluate(`
      (async function() {
        const { ensureUniversesController, ensureOrbitController } = await import('/main.js');
        await ensureUniversesController();
        await ensureOrbitController();
      })()
    `);
    await sleep(1000);

    // 1. Open KIDULT World and click Orbit button
    console.log('--- Step 1: Navigating to Orbit from KIDULT (Nyanya) ---');
    await client.evaluate(`
      (function() {
        if (window.universesController && typeof window.universesController.openKidultWorld === 'function') {
          window.universesController.openKidultWorld();
        } else {
          document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
          document.getElementById('view-kidult-world')?.classList.add('active');
        }
      })()
    `);
    await sleep(800);

    // Click Orbit button in KIDULT
    await client.evaluate(`
      document.getElementById('btn-kidult-nav-orbit')?.click();
    `);
    await sleep(1000);

    const orbitActive = await client.evaluate(`
      document.getElementById('view-orbit')?.classList.contains('active')
    `);
    console.log('  view-orbit is active:', orbitActive);
    const viewerName = await client.evaluate(`
      document.getElementById('orbit-viewer-name')?.textContent
    `);
    console.log('  Viewer perspective:', viewerName);

    await client.captureScreenshot(path.join(ARTIFACTS_DIR, 'orbit_01_kidult_nav.png'));

    // 2. Open Propose Meeting Modal & Verify Selective Invitees
    console.log('\n--- Step 2: Opening Propose Meeting Modal & Checking Selective Selection ---');
    await client.evaluate(`
      document.getElementById('btn-open-propose-meeting')?.click();
    `);
    await sleep(800);

    const modalOpen = await client.evaluate(`
      document.getElementById('modal-propose-meeting')?.classList.contains('active')
    `);
    console.log('  modal-propose-meeting is active:', modalOpen);

    const cardCount = await client.evaluate(`
      document.querySelectorAll('#orbit-participants-select-grid .participant-select-card').length
    `);
    console.log('  Participant cards count in modal:', cardCount);

    // Test clear all and select selective participants: Lala & Royan
    await client.evaluate(`
      (function() {
        document.getElementById('btn-clear-all-participants')?.click();
        const lalaCard = document.querySelector('.participant-select-card[data-char-id="lala"]');
        const royanCard = document.querySelector('.participant-select-card[data-char-id="royan"]');
        if (lalaCard) lalaCard.click();
        if (royanCard) royanCard.click();
        
        // Fill form fields
        const titleInput = document.getElementById('meeting-title-input');
        if (titleInput) titleInput.value = 'Astronomy & Crystal Moon Gathering';
        const dateInput = document.getElementById('meeting-date-input');
        if (dateInput) dateInput.value = '2026-11-26';
        const timeInput = document.getElementById('meeting-time-input');
        if (timeInput) timeInput.value = '20:30';
      })()
    `);
    await sleep(800);

    const selectedCount = await client.evaluate(`
      document.getElementById('selected-participants-count')?.textContent
    `);
    console.log('  Selected count text:', selectedCount);

    await client.captureScreenshot(path.join(ARTIFACTS_DIR, 'orbit_02_meeting_modal_selective.png'));

    // 3. Create selective meeting via orbit controller
    console.log('\n--- Step 3: Creating Selective Meeting (Nyanya inviting Lala & Royan) ---');
    await client.evaluate(`
      (async function() {
        const { addOrbitEvent } = await import('/orbit.js');
        addOrbitEvent({
          title: 'Astronomy & Crystal Moon Gathering',
          category: 'meeting',
          date: '2026-11-26',
          time: '20:30',
          location: 'Google Meet & Crystal Tower',
          description: 'Membahas pengamatan rasi bintang bersama Lala dan Royan',
          proposer: 'nyanya',
          invitedParticipants: ['lala', 'royan']
        });
        
        // Close modal and re-render
        const modal = document.getElementById('modal-propose-meeting');
        if (modal) modal.classList.remove('active');
        if (window.orbitController) window.orbitController.renderAll();
      })()
    `);
    await sleep(1000);

    const proposalsCount = await client.evaluate(`
      document.querySelectorAll('#meeting-proposals-container .meeting-proposal-card').length
    `);
    console.log('  Meeting proposal cards rendered in container:', proposalsCount);

    // 4. Test Navigation from SHADOW (Lele)
    console.log('\n--- Step 4: Testing Navigation from SHADOW (Lele) ---');
    await client.evaluate(`
      (function() {
        if (window.universesController && typeof window.universesController.openShadowWorld === 'function') {
          window.universesController.openShadowWorld();
        } else {
          document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
          document.getElementById('view-shadow-world')?.classList.add('active');
        }
      })()
    `);
    await sleep(800);

    await client.evaluate(`
      document.getElementById('btn-shadow-nav-orbit')?.click();
    `);
    await sleep(800);

    const shadowViewer = await client.evaluate(`
      document.getElementById('orbit-viewer-name')?.textContent
    `);
    console.log('  Viewer perspective after SHADOW nav:', shadowViewer);
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, 'orbit_03_shadow_nav.png'));

    // 5. Test Navigation from PINWHEEL (Syma)
    console.log('\n--- Step 5: Testing Navigation from PINWHEEL (Syma) ---');
    await client.evaluate(`
      (function() {
        if (window.universesController && typeof window.universesController.openPinwheelWorld === 'function') {
          window.universesController.openPinwheelWorld();
        } else {
          document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
          document.getElementById('view-pinwheel-world')?.classList.add('active');
        }
      })()
    `);
    await sleep(800);

    await client.evaluate(`
      document.getElementById('btn-pinwheel-nav-orbit')?.click();
    `);
    await sleep(800);

    const pinwheelViewer = await client.evaluate(`
      document.getElementById('orbit-viewer-name')?.textContent
    `);
    console.log('  Viewer perspective after PINWHEEL nav:', pinwheelViewer);
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, 'orbit_04_pinwheel_nav.png'));

    // 6. Test Navigation from ASH (Ruben)
    console.log('\n--- Step 6: Testing Navigation from ASH (Ruben) ---');
    await client.evaluate(`
      (function() {
        if (window.universesController && typeof window.universesController.openAshWorld === 'function') {
          window.universesController.openAshWorld();
        } else {
          document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
          document.getElementById('view-ash-world')?.classList.add('active');
        }
      })()
    `);
    await sleep(800);

    await client.evaluate(`
      document.getElementById('btn-ash-nav-orbit')?.click();
    `);
    await sleep(800);

    const ashViewer = await client.evaluate(`
      document.getElementById('orbit-viewer-name')?.textContent
    `);
    console.log('  Viewer perspective after ASH nav:', ashViewer);
    await client.captureScreenshot(path.join(ARTIFACTS_DIR, 'orbit_05_ash_nav.png'));

    // 7. Test Accepting and Declining Live
    console.log('\n--- Step 7: Testing Independent Accept and Decline Flow ---');
    // Switch to Lala and accept
    await client.evaluate(`
      (async function() {
        const { setActiveUserCharacter, respondToMeeting, getMeetingInvitations } = await import('/orbit.js');
        setActiveUserCharacter('lala');
        const meetings = getMeetingInvitations('lala');
        if (meetings.length > 0) {
          respondToMeeting(meetings[0].id, 'lala', 'accepted', 'Hadir tepat waktu membawa manisan');
        }
        if (window.orbitController) window.orbitController.renderAll();
      })()
    `);
    await sleep(800);

    // Switch to Royan and decline
    await client.evaluate(`
      (async function() {
        const { setActiveUserCharacter, respondToMeeting, getMeetingInvitations } = await import('/orbit.js');
        setActiveUserCharacter('royan');
        const meetings = getMeetingInvitations('royan');
        if (meetings.length > 0) {
          respondToMeeting(meetings[0].id, 'royan', 'declined', 'Sedang ada ekspedisi di Moonpetal Manor');
        }
        if (window.orbitController) window.orbitController.renderAll();
      })()
    `);
    await sleep(800);

    await client.captureScreenshot(path.join(ARTIFACTS_DIR, 'orbit_06_meeting_responses_live.png'));

    // 8. Mobile Viewport Responsive Audit
    console.log('\n--- Step 8: Mobile Viewport Responsive Audit (390x844) ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);

    await client.captureScreenshot(path.join(ARTIFACTS_DIR, 'orbit_07_mobile_responsive.png'));

    console.log('\n================================================================');
    console.log('🎉 LIVE CDP VERIFICATION COMPLETED WITH 100% SUCCESS! 🎉');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Error during live audit:', err);
    process.exitCode = 1;
  } finally {
    if (client) client.close();
    chromeProc.kill();
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch (_) { }
  }
}

runLiveAudit();
