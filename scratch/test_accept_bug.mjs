import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';

const PORT = 5173;
const CDP_PORT = 9360;
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
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
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
        if (msg.method === 'Runtime.consoleAPICalled') {
          const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
          console.log(`[BROWSER CONSOLE ${msg.params.type.toUpperCase()}]`, text);
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          console.log('[BROWSER UNCAUGHT EXCEPTION]', JSON.stringify(msg.params.exceptionDetails));
        }
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

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch (_) { }
    }
  }
}

async function debugAcceptBug() {
  console.log('--- REPRODUCING ACCEPT BUG VIA LIVE CHROME CDP ---');
  const tmpProfile = 'e:\\BOTCAMP\\nyanyalalalele\\.tmp_cdp_debug_accept';
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${tmpProfile}`,
    '--window-size=1440,900',
    `http://localhost:${PORT}/`
  ]);

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
            break;
          }
        }
      } catch (_) { }
    }

    if (!client) throw new Error('Could not connect to Chrome CDP');

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    await sleep(3000);

    // Initialize controllers and create meeting from Syma
    console.log('1. Setting up meeting from Syma...');
    const setupResult = await client.evaluate(`
      (async function() {
        const { ensureUniversesController, ensureOrbitController } = await import('http://localhost:5173/main.js');
        await ensureUniversesController();
        const orbitCtrl = await ensureOrbitController();
        
        const { addOrbitEvent, setActiveUserCharacter, getOrbitEvents } = await import('http://localhost:5173/orbit.js');
        
        // Syma creates meeting inviting Lele, Ela, Royan
        setActiveUserCharacter('abil');
        const meeting = addOrbitEvent({
          title: 'Pertemuan Khusus Syma',
          category: 'meeting',
          date: '2026-11-28',
          time: '20:00',
          location: 'Google Meet',
          description: 'Diskusi bersama sahabat',
          proposer: 'abil',
          invitedParticipants: ['lele', 'ela', 'royan']
        });

        // Switch viewing perspective to Ela
        orbitCtrl.openOrbit('view-selection', 'ela');
        
        return {
          meetingId: meeting.id,
          proposer: meeting.proposer,
          participants: meeting.participants,
          responsesBefore: meeting.responses
        };
      })()
    `);
    console.log('Setup result:', JSON.stringify(setupResult, null, 2));

    await sleep(1000);

    // Check DOM state before clicking
    console.log('\n2. Inspecting DOM before clicking Setuju...');
    const domBefore = await client.evaluate(`
      (async function() {
        const { getOrbitEvents, getMeetingInvitations, getActiveUserCharacter } = await import('http://localhost:5173/orbit.js');
        const container = document.getElementById('meeting-proposals-container');
        const card = document.querySelector('#meeting-proposals-container .meeting-proposal-card');
        
        return {
          currentActiveUser: getActiveUserCharacter(),
          eventsCount: getOrbitEvents().length,
          elaInvitesCount: getMeetingInvitations('ela').length,
          containerHtml: container ? container.innerHTML : 'CONTAINER NOT FOUND',
          hasCard: Boolean(card)
        };
      })()
    `);
    console.log('DOM before:', JSON.stringify(domBefore, null, 2));

    // 3. Click Setuju button
    console.log('\n3. Clicking Setuju button as Ela...');
    await client.evaluate(`
      (async function() {
        const card = document.querySelector('#meeting-proposals-container .meeting-proposal-card');
        const btnAcc = card?.querySelector('.btn-resp-acc');
        if (btnAcc) {
          console.log('[DEBUG CLICK] Clicking btn-resp-acc now!');
          btnAcc.click();
        } else {
          console.error('[DEBUG CLICK] btn-resp-acc not found!');
        }
      })()
    `);

    await sleep(2500);

    // 4. Check DOM state and memory state after clicking
    console.log('\n4. Inspecting DOM and state after clicking Setuju...');
    const domAfter = await client.evaluate(`
      (async function() {
        const { getOrbitEvents, getActiveUserCharacter } = await import('http://localhost:5173/orbit.js');
        const card = document.querySelector('#meeting-proposals-container .meeting-proposal-card');
        const respPills = Array.from(card.querySelectorAll('.participant-response-pill')).map(p => {
          return p.textContent.replace(/\\s+/g, ' ').trim();
        });
        const statusText = card.querySelector('.meeting-user-actions')?.parentElement?.querySelector('strong')?.textContent;
        
        const events = getOrbitEvents();
        const meeting = events.find(e => e.title === 'Pertemuan Khusus Syma');
        
        return {
          currentActiveUser: getActiveUserCharacter(),
          respPills,
          myStatusText: statusText,
          meetingResponsesInState: meeting ? meeting.responses : null
        };
      })()
    `);
    console.log('DOM and state after:', JSON.stringify(domAfter, null, 2));

  } catch (err) {
    console.error('Error during debug:', err);
  } finally {
    if (client) client.close();
    chromeProc.kill();
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) { }
  }
}

debugAcceptBug();
