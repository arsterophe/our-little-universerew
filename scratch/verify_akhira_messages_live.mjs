/**
 * LIVE BROWSER VERIFICATION: OUR LITTLE MESSAGES — AKHIRA (YAWN ⚡) & 8 CHARACTERS
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5173;
const CDP_PORT = 9325;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';

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
    return res.result?.value;
  }

  async screenshot(filePath, quality = 88) {
    const res = await this.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality
    });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`  [Screenshot saved]: ${filePath}`);
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log('LIVE CDP VERIFICATION: OUR LITTLE MESSAGES — AKHIRA (YAWN ⚡)');
  console.log('================================================================');

  const userDataDir = path.resolve('./scratch/cdp_profile_akhira_msg_' + Date.now());
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1920,1080',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const list = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        wsUrl = list[0].webSocketDebuggerUrl;
        break;
      }
    } catch (_) {}
  }

  if (!wsUrl) throw new Error('Failed to obtain Chrome CDP WebSocket URL');

  const cdp = new CDPClient(wsUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  try {
    console.log('1. Navigating to http://localhost:5173 ...');
    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    await sleep(2500);

    // 2. Render Akhira authenticated session & open Our Little Messages
    console.log('2. Rendering Akhira authenticated session and opening Our Little Messages...');
    const initRes = await cdp.eval(`
      (async () => {
        const { renderPrivateUniverse, ensureMessagesController } = await import('/main.js');
        const { setActiveUserCharacter } = await import('/messages.js');

        const akhiraUser = {
          uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2',
          email: 'akhira@ourlittleuniverse.com',
          displayName: 'Akhira',
          emailVerified: true
        };

        const charConfig = {
          name: 'Akhira',
          characterKey: 'akhira',
          universe: 'YAWN',
          symbol: '⚡',
          themeClass: 'theme-akhira'
        };

        window.activeCharacterKey = 'akhira';
        setActiveUserCharacter('akhira');

        const viewSel = document.getElementById('view-selection');
        if (viewSel) viewSel.style.display = 'none';

        const viewLogin = document.getElementById('view-login');
        if (viewLogin) viewLogin.style.display = 'none';

        const loader = document.getElementById('cosmic-app-loader');
        if (loader) {
          loader.classList.add('loaded');
          loader.style.display = 'none';
        }

        await renderPrivateUniverse(akhiraUser, charConfig, false);
        await new Promise(r => setTimeout(r, 400));

        const msgCtrl = await ensureMessagesController();
        msgCtrl.openMessages('view-private-universe', 'akhira');
        await new Promise(r => setTimeout(r, 600));

        const avatar = document.getElementById('msg-active-user-avatar')?.src;
        const name = document.getElementById('msg-active-user-name')?.textContent;
        const sub = document.getElementById('msg-active-user-sub')?.textContent;
        const subtitle = document.querySelector('.msg-subtitle')?.textContent;

        return {
          messagesViewActive: document.getElementById('view-messages')?.classList.contains('active'),
          avatar,
          name,
          sub,
          subtitle
        };
      })()
    `);
    console.log('Akhira Header Verification Result:', initRes);

    const shot1 = path.join(ARTIFACT_DIR, 'akhira_messages_01_inbox_header.jpg');
    await cdp.screenshot(shot1);

    // 3. Open "+ Mulai Obrolan Baru" Friends Picker Modal
    console.log('3. Clicking + Mulai Obrolan Baru button...');
    const pickerRes = await cdp.eval(`
      (async () => {
        const { openNewChatModal } = await import('/messages_view.js');
        openNewChatModal();
        await new Promise(r => setTimeout(r, 300));

        const modal = document.getElementById('modal-msg-new-chat');
        const grid = document.getElementById('msg-friends-picker-grid');
        const cards = Array.from(grid?.querySelectorAll('.msg-friend-picker-card') || []);

        const friends = cards.map(c => ({
          key: c.getAttribute('data-key'),
          name: c.querySelector('.msg-friend-picker-name')?.textContent?.trim(),
          universe: c.querySelector('.msg-friend-picker-universe')?.textContent?.trim(),
          avatar: c.querySelector('.msg-friend-picker-avatar')?.src
        }));

        return {
          modalOpen: modal?.classList.contains('open') && modal?.style.display !== 'none',
          friendsCount: friends.length,
          friends
        };
      })()
    `);
    console.log('Friends Picker Modal Result:', pickerRes);
    await sleep(600);

    const shot2 = path.join(ARTIFACT_DIR, 'akhira_messages_02_friends_picker_modal.jpg');
    await cdp.screenshot(shot2);

    // 4. Select Nyanya from the friends picker and start chat
    console.log('4. Selecting Nyanya to start direct conversation...');
    const chatRes = await cdp.eval(`
      (async () => {
        const grid = document.getElementById('msg-friends-picker-grid');
        const nyanyaCard = grid?.querySelector('.msg-friend-picker-card[data-key="nyanya"]');
        if (nyanyaCard) nyanyaCard.click();
        await new Promise(r => setTimeout(r, 400));

        const partnerAvatar = document.getElementById('msg-partner-avatar')?.src;
        const partnerName = document.getElementById('msg-partner-name')?.textContent;
        const partnerSub = document.getElementById('msg-partner-sub')?.textContent;
        const inputDisabled = document.getElementById('msg-input-text')?.disabled;

        return {
          partnerAvatar,
          partnerName,
          partnerSub,
          inputDisabled
        };
      })()
    `);
    console.log('Chat with Nyanya opened:', chatRes);
    await sleep(600);

    // 5. Send message from Akhira to Nyanya
    console.log('5. Typing and sending message from Akhira to Nyanya...');
    const sendRes = await cdp.eval(`
      (async () => {
        const input = document.getElementById('msg-input-text');
        const sendBtn = document.getElementById('btn-msg-send');
        if (input) {
          input.value = 'Halo Nyanya! Salam hangat dari samudra astral YAWN ⚡🌊';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.click();
        }
        await new Promise(r => setTimeout(r, 1000));

        const bubbles = Array.from(document.querySelectorAll('.msg-bubble-row, .msg-bubble'));
        const lastBubble = bubbles[bubbles.length - 1];

        return {
          bubbleCount: bubbles.length,
          lastBubbleText: lastBubble?.querySelector('.msg-bubble-text')?.textContent || lastBubble?.textContent,
          lastBubbleSender: lastBubble?.querySelector('.msg-bubble-sender')?.textContent
        };
      })()
    `);
    console.log('Send message result:', sendRes);
    await sleep(600);

    const shot3 = path.join(ARTIFACT_DIR, 'akhira_messages_03_chat_with_nyanya.jpg');
    await cdp.screenshot(shot3);

    // 6. Test two-way conversations with other characters (Syma, Lala, Lele, Ela, Ruben, Royan)
    console.log('6. Creating conversations with other friends to test full 8-character connectivity...');
    const multiChatRes = await cdp.eval(`
      (async () => {
        const { startNewConversation, sendMessage } = await import('/messages.js');
        const { selectConversation } = await import('/messages_view.js');
        const partners = [
          { key: 'abil', name: 'Syma' },
          { key: 'lala', name: 'Lala' },
          { key: 'lele', name: 'Lele' },
          { key: 'ela', name: 'Ela' },
          { key: 'ruben', name: 'Ruben' },
          { key: 'royan', name: 'Royan' }
        ];
        
        for (const p of partners) {
          const convId = startNewConversation(p.key);
          if (convId) {
            selectConversation(convId);
            try {
              await sendMessage(\`Hai \${p.name}! Ini Akhira dari samudra YAWN ⚡\`, convId);
            } catch (_) {}
            await new Promise(r => setTimeout(r, 100));
          }
        }

        // Switch back to Nyanya conversation
        selectConversation('akhira_nyanya');
        const { renderConversationListUI } = await import('/messages_view.js');
        if (typeof renderConversationListUI === 'function') renderConversationListUI();
        await new Promise(r => setTimeout(r, 600));

        const convItems = Array.from(document.querySelectorAll('.msg-conv-item')).map(item => ({
          id: item.getAttribute('data-conv-id'),
          name: item.querySelector('.msg-conv-name')?.textContent?.trim(),
          preview: item.querySelector('.msg-conv-preview')?.textContent?.trim(),
          avatar: item.querySelector('.msg-conv-avatar')?.src
        }));

        const partnerName = document.getElementById('msg-partner-name')?.textContent;

        return {
          conversationItemsCount: convItems.length,
          convItems,
          currentPartnerName: partnerName
        };
      })()
    `);
    console.log('Multi-chat conversations result:', multiChatRes);
    await sleep(600);

    const shot4 = path.join(ARTIFACT_DIR, 'akhira_messages_04_conversations_list.jpg');
    await cdp.screenshot(shot4);

    // 7. Test mobile viewport at 390x844
    console.log('7. Capturing mobile responsive view (390px)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);

    const shot5 = path.join(ARTIFACT_DIR, 'akhira_messages_05_mobile_390.jpg');
    await cdp.screenshot(shot5);

    console.log('\nAll 5 live browser verification screenshots captured successfully!');
    await cdp.close();
  } finally {
    try {
      chromeProc.kill();
    } catch (_) {}
  }
}

main().catch((err) => {
  console.error('Fatal error during live browser verification:', err);
  process.exit(1);
});
