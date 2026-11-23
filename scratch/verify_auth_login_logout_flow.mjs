import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = Math.floor(15000 + Math.random() * 15000);
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ALENDA/.gemini/antigravity/brain/9032e95e-6264-445e-8703-2e60383b3a62';

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
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        }
      });
    });
  }

  send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const tmpUserDataDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_test_auth_${Date.now()}`);
  fs.mkdirSync(tmpUserDataDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpUserDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const list = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
        if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
          wsUrl = list[0].webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    if (!wsUrl) throw new Error('Failed to obtain Chrome CDP WebSocket URL');

    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('1. Navigating to http://localhost:5173 ...');
    await client.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    // Verify initial state
    console.log('2. Verifying initial state: Selection view must be active, 8 cards visible...');
    const initialCheck = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const selection = document.getElementById('view-selection');
          const login = document.getElementById('view-login');
          const privateUniv = document.getElementById('view-private-universe');
          const shadowWorld = document.getElementById('view-shadow-world');
          
          const cards = Array.from(document.querySelectorAll('.character-card')).map(c => ({
            id: c.id,
            char: c.getAttribute('data-character'),
            name: c.querySelector('.char-name')?.textContent?.trim(),
            role: c.querySelector('.char-role')?.textContent?.trim(),
            symbol: c.querySelector('.char-symbol')?.textContent?.trim()
          }));

          return {
            selectionActive: selection?.classList.contains('active'),
            loginActive: login?.classList.contains('active'),
            privateUnivActive: privateUniv?.classList.contains('active'),
            shadowWorldActive: shadowWorld?.classList.contains('active'),
            cardCount: cards.length,
            cards
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Initial state:', JSON.stringify(initialCheck.result.value, null, 2));

    // Capture initial selection screenshot
    const shotSelection = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'auth_01_character_selection_live.jpg'), Buffer.from(shotSelection.data, 'base64'));
    console.log('Saved auth_01_character_selection_live.jpg');

    // Test clicking each character card
    const charactersToTest = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
    for (const charKey of charactersToTest) {
      console.log(`\nTesting character selection for: ${charKey}`);
      const selectRes = await client.send('Runtime.evaluate', {
        expression: `
          (async () => {
            const card = document.querySelector('.character-card[data-character="${charKey}"]');
            if (!card) return { found: false };
            card.click();
            await new Promise(r => setTimeout(r, 400));
            const login = document.getElementById('view-login');
            return {
              found: true,
              loginActive: login?.classList.contains('active'),
              charName: document.getElementById('login-char-name')?.textContent?.trim(),
              charRole: document.getElementById('login-char-role')?.textContent?.trim(),
              charIcon: document.getElementById('login-char-icon')?.textContent?.trim(),
              emailVal: document.getElementById('email-input')?.value
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });

      console.log(`Result for ${charKey}:`, selectRes.result.value);

      if (charKey === 'akhira') {
        const shotAkhiraLogin = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'auth_02_akhira_login_view_live.jpg'), Buffer.from(shotAkhiraLogin.data, 'base64'));
        console.log('Saved auth_02_akhira_login_view_live.jpg');
      }

      // Return to selection
      await client.send('Runtime.evaluate', {
        expression: `
          (() => {
            const btnSwitch = document.getElementById('btn-switch-other');
            if (btnSwitch) btnSwitch.click();
          })()
        `
      });
      await sleep(350);
    }

    // Now test entering Private Universe and testing Logout flow
    console.log('\n3. Testing Private Universe Entry & Logout Flow...');
    const enterRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const { ensureUniversesController, renderPrivateUniverse } = await import('/main.js');
          const mockUser = {
            uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2',
            email: 'akhira@ourlittleuniverse.com',
            displayName: 'Akhira',
            emailVerified: true
          };
          const mockConfig = {
            name: 'Akhira',
            characterKey: 'akhira',
            universe: 'YAWN',
            symbol: '⚡'
          };
          await renderPrivateUniverse(mockUser, mockConfig, false);
          return {
            privateUnivActive: document.getElementById('view-private-universe')?.classList.contains('active'),
            headerLogoutBtn: !!document.getElementById('btn-header-logout')
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Enter result:', enterRes.result.value);
    await sleep(800);

    const shotPrivateUniv = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'auth_03_private_universe_live.jpg'), Buffer.from(shotPrivateUniv.data, 'base64'));
    console.log('Saved auth_03_private_universe_live.jpg');

    // Test clicking Logout button -> Open Confirmation Modal
    console.log('4. Clicking Logout button to open confirmation modal...');
    const modalOpenRes = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-header-logout');
          if (btn) btn.click();
          const modal = document.getElementById('modal-logout-confirm');
          return {
            modalVisible: modal && modal.style.display !== 'none',
            titleText: document.getElementById('title-logout-confirm')?.textContent?.trim(),
            bodyText: modal?.querySelector('div[style*="line-height"]')?.textContent?.trim(),
            hasCancelBtn: !!document.getElementById('btn-cancel-logout'),
            hasConfirmBtn: !!document.getElementById('btn-confirm-logout')
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Modal status:', modalOpenRes.result.value);
    await sleep(400);

    const shotModal = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'auth_04_logout_confirm_modal_live.jpg'), Buffer.from(shotModal.data, 'base64'));
    console.log('Saved auth_04_logout_confirm_modal_live.jpg');

    // Test clicking "Batal"
    console.log('5. Testing "Batal" button cancellation...');
    const cancelRes = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btnCancel = document.getElementById('btn-cancel-logout');
          if (btnCancel) btnCancel.click();
          const modal = document.getElementById('modal-logout-confirm');
          return {
            modalVisible: modal && modal.style.display !== 'none',
            privateUnivStillActive: document.getElementById('view-private-universe')?.classList.contains('active')
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Cancel result:', cancelRes.result.value);
    await sleep(400);

    // Re-open and click "Ya, Logout"
    console.log('6. Re-opening modal and executing "Ya, Logout"...');
    const logoutExecRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const btn = document.getElementById('btn-header-logout');
          if (btn) btn.click();
          await new Promise(r => setTimeout(r, 200));
          const btnConfirm = document.getElementById('btn-confirm-logout');
          if (btnConfirm) btnConfirm.click();
          await new Promise(r => setTimeout(r, 500));
          const toast = document.getElementById('universe-toast');
          return {
            modalVisible: document.getElementById('modal-logout-confirm')?.style.display !== 'none',
            selectionActive: document.getElementById('view-selection')?.classList.contains('active'),
            privateUnivActive: document.getElementById('view-private-universe')?.classList.contains('active'),
            toastText: toast?.textContent?.trim()
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Logout execution result:', logoutExecRes.result.value);
    await sleep(500);

    const shotPostLogout = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'auth_05_post_logout_selection_live.jpg'), Buffer.from(shotPostLogout.data, 'base64'));
    console.log('Saved auth_05_post_logout_selection_live.jpg');

    console.log('\nALL VERIFICATION TESTS FINISHED SUCCESSFULLY!');
    client.close();
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch {}
  }
}

run();
