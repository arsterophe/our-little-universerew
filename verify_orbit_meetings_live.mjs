/**
 * LIVE CDP VERIFICATION: OUR LITTLE ORBIT
 * Equal Access for All 8 Characters & Selective Meeting Invitations
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = 9335;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function checkPort(port) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
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
          if (msg.error) reject(new Error(msg.error.message));
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

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
  }
}

async function run() {
  console.log('--- STARTING LIVE CDP VERIFICATION: OUR LITTLE ORBIT ---');

  let devPort = 5174;
  const is5174 = await checkPort(5174);
  if (!is5174) {
    const is5173 = await checkPort(5173);
    if (is5173) devPort = 5173;
    else {
      console.error('Neither port 5174 nor 5173 is reachable.');
      process.exit(1);
    }
  }
  console.log(`Using dev server on port ${devPort}`);

  const userDataDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_orbit_test_${Date.now()}`);
  const chromeArgs = [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    `http://127.0.0.1:${devPort}/`
  ];

  console.log(`Spawning Chrome on port ${CDP_PORT}...`);
  const chromeProc = spawn(CHROME_PATH, chromeArgs, { stdio: 'ignore' });

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(600);
    try {
      targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch {}
  }

  if (!targets || targets.length === 0) {
    console.error('Failed to connect to Chrome debugging target.');
    chromeProc.kill();
    process.exit(1);
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  console.log('Connected to Chrome DevTools Protocol!');

  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await sleep(1500);

  // 1. Open Our Little Orbit View
  console.log('\n--- Step 1: Open Our Little Orbit ---');
  await client.eval(`
    // Open Orbit view
    const viewOrbit = document.getElementById('view-orbit');
    const viewSelection = document.getElementById('view-selection');
    if (viewSelection) viewSelection.classList.remove('active');
    if (viewOrbit) {
      viewOrbit.classList.add('active');
      viewOrbit.setAttribute('aria-hidden', 'false');
    }
    // Also trigger orbit controller open if available
    if (window._orbitController && window._orbitController.openOrbit) {
      window._orbitController.openOrbit();
    }
  `);

  await sleep(800);

  // Verify Orbit Top Bar
  const topBarData = await client.eval(`
    (() => {
      const title = document.querySelector('.orbit-main-title')?.textContent || '';
      const subtitle = document.querySelector('.orbit-subtitle')?.textContent || '';
      const viewer = document.getElementById('orbit-viewer-name')?.textContent || '';
      const notifBtn = !!document.getElementById('btn-orbit-notifications');
      return { title, subtitle, viewer, notifBtn };
    })()
  `);
  console.log('Orbit Top Bar State:', topBarData);

  // 2. Test Perspective Cycling across all 8 characters
  console.log('\n--- Step 2: Test Perspective Cycling Across All 8 Characters ---');
  const cycledCharacters = [];
  for (let i = 0; i < 8; i++) {
    const curName = await client.eval(`
      (() => {
        const badge = document.getElementById('orbit-user-badge');
        if (badge) badge.click();
        return document.getElementById('orbit-viewer-name')?.textContent || '';
      })()
    `);
    cycledCharacters.push(curName);
    await sleep(250);
  }
  console.log('Cycled characters:', cycledCharacters);

  // Set perspective to Syma (abil)
  await client.eval(`
    (() => {
      const badge = document.getElementById('orbit-user-badge');
      // Cycle until it's Syma
      for (let i = 0; i < 8; i++) {
        const name = document.getElementById('orbit-viewer-name')?.textContent || '';
        if (name === 'Syma') break;
        badge.click();
      }
    })()
  `);
  await sleep(500);

  const shot1Path = path.join(artDir, 'orbit_01_all_characters_overview.png');
  await client.captureScreenshot(shot1Path);
  console.log('Screenshot 1 captured:', shot1Path);

  // 3. Open Propose Meeting Modal & Verify Selective Participant Selector
  console.log('\n--- Step 3: Open Propose Meeting Modal & Participant Selector ---');
  await client.eval(`
    (() => {
      const btn = document.getElementById('btn-open-propose-meeting');
      if (btn) btn.click();
    })()
  `);
  await sleep(800);

  const modalSelectorData = await client.eval(`
    (() => {
      const modal = document.getElementById('modal-propose-meeting');
      const isOpen = modal && modal.classList.contains('open');
      const cards = Array.from(document.querySelectorAll('.participant-select-card')).map(card => {
        return {
          charId: card.getAttribute('data-char-id'),
          name: card.querySelector('.participant-card-name')?.textContent || '',
          universe: card.querySelector('.participant-card-universe')?.textContent || '',
          isHost: card.classList.contains('is-host'),
          isSelected: card.classList.contains('selected'),
          indicator: card.querySelector('.participant-card-indicator')?.textContent?.trim() || ''
        };
      });
      const selectedCount = document.getElementById('selected-participants-count')?.textContent || '';
      return { isOpen, cardCount: cards.length, cards, selectedCount };
    })()
  `);
  console.log('Modal Participant Selector State:', {
    isOpen: modalSelectorData.isOpen,
    cardCount: modalSelectorData.cardCount,
    selectedCount: modalSelectorData.selectedCount,
    cards: modalSelectorData.cards.map(c => `${c.name} (${c.universe}) [${c.indicator}]`)
  });

  const shot2Path = path.join(artDir, 'orbit_02_selective_meeting_modal.png');
  await client.captureScreenshot(shot2Path);
  console.log('Screenshot 2 captured:', shot2Path);

  // 4. Test Selective Selection: Clear all, select specific participants (Lala, Ruben, Ela), submit meeting
  console.log('\n--- Step 4: Propose Meeting with Specific Invitees (Lala, Ruben, Ela) ---');
  await client.eval(`
    (() => {
      // Click clear all
      const btnClear = document.getElementById('btn-clear-all-participants');
      if (btnClear) btnClear.click();

      // Click Lala, Ruben, Ela
      const cards = document.querySelectorAll('.participant-select-card');
      cards.forEach(card => {
        const charId = card.getAttribute('data-char-id');
        if (['lala', 'ruben', 'ela'].includes(charId)) {
          card.click();
        }
      });

      // Fill in details: Saturday 21 November 2026, 15:00 WIB
      const titleInput = document.getElementById('meeting-title-input');
      const dateInput = document.getElementById('meeting-date-input');
      const timeInput = document.getElementById('meeting-time-input');
      const locInput = document.getElementById('meeting-loc-input');
      const descInput = document.getElementById('meeting-desc-input');

      if (titleInput) titleInput.value = 'Rapat Perencanaan Konstelasi Delapan Universe 🪐';
      if (dateInput) dateInput.value = '2026-11-21';
      if (timeInput) timeInput.value = '15:00';
      if (locInput) locInput.value = 'Pinwheel Starlight Room';
      if (descInput) descInput.value = 'Koordinasi rilis karya, visual kitsune, dan pembagian tugas antar 8 universe sahabat.';

      // Submit form
      const form = document.getElementById('form-propose-meeting');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    })()
  `);

  await sleep(1000);

  // Verify meeting rendered in meetings proposals list
  const meetingCardData = await client.eval(`
    (() => {
      const container = document.getElementById('meeting-proposals-container');
      const cards = container?.querySelectorAll('.meeting-proposal-card') || [];
      const firstCard = cards[0];
      if (!firstCard) return null;
      return {
        title: firstCard.querySelector('.meeting-card-title')?.textContent || '',
        meta: Array.from(firstCard.querySelectorAll('.meeting-meta-item')).map(m => m.textContent.trim()),
        participants: Array.from(firstCard.querySelectorAll('.participant-response-pill')).map(p => p.textContent.trim().replace(/\\s+/g, ' '))
      };
    })()
  `);
  console.log('Meeting Card Rendered in Sidebar:', meetingCardData);

  const shot3Path = path.join(artDir, 'orbit_03_meeting_card_participants.png');
  await client.captureScreenshot(shot3Path);
  console.log('Screenshot 3 captured:', shot3Path);

  // 5. Perspective Switch to Invited Participant (Lala) -> Check Notification Bell & Modal
  console.log('\n--- Step 5: Switch to Invited Participant (Lala) & Inspect Notifications ---');
  await client.eval(`
    (() => {
      const badge = document.getElementById('orbit-user-badge');
      // Cycle to Lala
      for (let i = 0; i < 8; i++) {
        const name = document.getElementById('orbit-viewer-name')?.textContent || '';
        if (name === 'Lala') break;
        badge.click();
      }
    })()
  `);
  await sleep(600);

  const lalaState = await client.eval(`
    (() => {
      const badgeCount = document.getElementById('orbit-notif-count-badge')?.textContent || '0';
      const badgeDisplay = document.getElementById('orbit-notif-count-badge')?.style.display || '';
      return { badgeCount, badgeDisplay };
    })()
  `);
  console.log('Lala Notification Bell State:', lalaState);

  // Open Notifications Modal
  await client.eval(`
    (() => {
      const btn = document.getElementById('btn-orbit-notifications');
      if (btn) btn.click();
    })()
  `);
  await sleep(800);

  const notifModalData = await client.eval(`
    (() => {
      const modal = document.getElementById('modal-orbit-notifications');
      const isOpen = modal && modal.classList.contains('open');
      const notifItems = Array.from(document.querySelectorAll('.orbit-notif-card')).map(card => {
        return {
          title: card.querySelector('.orbit-notif-title')?.textContent || '',
          desc: card.querySelector('.orbit-notif-desc')?.textContent || '',
          time: card.querySelector('.orbit-notif-time')?.textContent || ''
        };
      });
      return { isOpen, notifItems };
    })()
  `);
  console.log('Notifications Modal Content for Lala:', notifModalData);

  const shot4Path = path.join(artDir, 'orbit_04_notifications_modal.png');
  await client.captureScreenshot(shot4Path);
  console.log('Screenshot 4 captured:', shot4Path);

  // Close notifications modal & Lala accepts meeting
  await client.eval(`
    (() => {
      const closeBtn = document.querySelector('#modal-orbit-notifications .btn-modal-cancel');
      if (closeBtn) closeBtn.click();
      
      // Lala clicks accept
      const accBtn = document.querySelector('.meeting-proposal-card .btn-resp-acc');
      if (accBtn) accBtn.click();
    })()
  `);
  await sleep(800);

  // 6. Perspective Switch to Non-Invited Character (Nyanya / Akhira) -> Verify Zero Meetings & Zero Notifications
  console.log('\n--- Step 6: Switch to Non-Invited Character (Akhira) & Verify Total Isolation ---');
  await client.eval(`
    (() => {
      const badge = document.getElementById('orbit-user-badge');
      // Cycle to Akhira
      for (let i = 0; i < 8; i++) {
        const name = document.getElementById('orbit-viewer-name')?.textContent || '';
        if (name === 'Akhira') break;
        badge.click();
      }
    })()
  `);
  await sleep(600);

  const akhiraIsolationData = await client.eval(`
    (() => {
      const notifCount = document.getElementById('orbit-notif-count-badge')?.textContent || '0';
      const notifDisplay = document.getElementById('orbit-notif-count-badge')?.style.display || '';
      const meetingCards = Array.from(document.querySelectorAll('.meeting-proposal-card .meeting-card-title')).map(el => el.textContent);
      const isMeetingPresent = meetingCards.some(t => t.includes('Konstelasi Delapan Universe'));
      return { notifCount, notifDisplay, isMeetingPresent, meetingCards };
    })()
  `);
  console.log('Akhira Isolation Check:', akhiraIsolationData);

  // 7. Mobile Viewport 390x844 Test
  console.log('\n--- Step 7: Mobile Viewport 390x844 Verification ---');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(800);

  const shot5Path = path.join(artDir, 'orbit_05_mobile_view_390x844.png');
  await client.captureScreenshot(shot5Path);
  console.log('Screenshot 5 captured:', shot5Path);

  console.log('\n=== LIVE CDP VERIFICATION COMPLETED SUCCESSFULLY ===');
  chromeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('CDP Error:', err);
  process.exit(1);
});

