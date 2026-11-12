/**
 * OUR LITTLE UNIVERSE — FASE 6 TEST SUITE
 * Real-time Peer-to-Peer & Group Messaging, Character-Bound Security Rules,
 * Deterministic Conversations, Immutability, Privacy Barriers & Offline State
 */

import './load_env.js';
import {
  getConversationId,
  CHARACTERS_MESSAGES,
  getAvailableConversations,
  setActiveUserCharacter as setActiveUserMessages,
  getActiveUserCharacter as getActiveUserMessages,
  sendMessage as sendMessageLogic,
  STORAGE_KEY_MESSAGES_CACHE
} from './messages.js';

import { initMessagesView, syncMessagesActiveCharacter } from './messages_view.js';

// Setup Mock DOM for Node environment
const mockElements = {};
function createMockEl(id, className = '') {
  const el = {
    id,
    className,
    style: {},
    dataset: {},
    attributes: {},
    classList: {
      _classes: new Set(className ? className.split(' ') : []),
      add(cls) { this._classes.add(cls); el.className = Array.from(this._classes).join(' '); },
      remove(cls) { this._classes.delete(cls); el.className = Array.from(this._classes).join(' '); },
      toggle(cls, force) {
        if (force === undefined) {
          if (this._classes.has(cls)) this.remove(cls); else this.add(cls);
        } else if (force) {
          this.add(cls);
        } else {
          this.remove(cls);
        }
      },
      contains(cls) { return this._classes.has(cls); }
    },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] || null; },
    removeAttribute(k) { delete this.attributes[k]; },
    innerHTML: '',
    textContent: '',
    disabled: false,
    value: '',
    scrollTop: 0,
    scrollHeight: 1000,
    listeners: {},
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    },
    click() {
      if (this.listeners['click']) {
        this.listeners['click'].forEach((fn) => fn({ preventDefault: () => {}, stopPropagation: () => {} }));
      }
    },
    querySelector(selector) {
      return null;
    },
    querySelectorAll(selector) {
      return [];
    },
    appendChild(child) { return child; },
    removeChild(child) { return child; },
    focus() {}
  };
  mockElements[id] = el;
  return el;
}

const mockIds = [
  'view-messages', 'msg-btn-back', 'btn-msg-return-home', 'msg-current-user-avatar', 'msg-current-user-name',
  'msg-current-user-role', 'msg-conversations-list', 'msg-active-avatar',
  'msg-active-title', 'msg-active-subtitle', 'msg-active-badge', 'msg-thread-list',
  'msg-empty-thread', 'msg-loading-thread', 'msg-input-text', 'msg-char-counter',
  'msg-btn-send', 'btn-msg-send', 'msg-status-banner'
];

mockIds.forEach(id => createMockEl(id));

global.document = {
  getElementById: (id) => mockElements[id] || createMockEl(id),
  querySelectorAll: (sel) => {
    if (sel === '.msg-emoji-pill') {
      return [
        { getAttribute: () => '💌', addEventListener: () => {} },
        { getAttribute: () => '★', addEventListener: () => {} },
        { getAttribute: () => '☀️', addEventListener: () => {} },
        { getAttribute: () => '🌙', addEventListener: () => {} },
        { getAttribute: () => '✨', addEventListener: () => {} },
        { getAttribute: () => '☕', addEventListener: () => {} },
        { getAttribute: () => '🪐', addEventListener: () => {} }
      ];
    }
    return [];
  },
  createElement: (tag) => createMockEl(`mock-${tag}-${Math.random().toString(36).slice(2, 6)}`)
};

global.window = {
  document: global.document,
  addEventListener: () => {},
  scrollTo: () => {},
  triggerSparkleBurst: () => {},
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  }
};

global.localStorage = global.window.localStorage;

// Helper to make JWT for Firestore Emulator REST API
function makeJwt(uid, email, emailVerified = true) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: uid,
    user_id: uid,
    email: email,
    email_verified: emailVerified,
    iss: 'https://securetoken.google.com/our-little-universe-dcd75',
    aud: 'our-little-universe-dcd75',
    auth_time: 1700000000,
    iat: 1700000000,
    exp: 1900000000
  })).toString('base64url');
  return `${header}.${payload}.`;
}

const BASE_URL = 'http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents';

const NYANYA_UID = 'uid-nyanya-moonlit-star-2026';
const LALA_UID = 'uid-lala-to-you-sunshine-2026';
const LELE_UID = 'uid-lele-crystal-shadow-2026';
const STRANGER_UID = 'uid-stranger-intruder-2026';

const NYANYA_TOKEN = makeJwt(NYANYA_UID, 'nyanya@ourlittleuniverse.com', true);
const LALA_TOKEN = makeJwt(LALA_UID, 'lala@ourlittleuniverse.com', true);
const LELE_TOKEN = makeJwt(LELE_UID, 'lele@ourlittleuniverse.com', true);
const UNVERIFIED_TOKEN = makeJwt(NYANYA_UID, 'nyanya@ourlittleuniverse.com', false);
const STRANGER_TOKEN = makeJwt(STRANGER_UID, 'stranger@outerspace.org', true);

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, desc) {
  if (condition) {
    totalPassed++;
    console.log(`  ✓ ${desc}`);
  } else {
    totalFailed++;
    console.error(`  ✗ FAIL: ${desc}`);
  }
}

async function runSuite() {
  console.log('\n=============================================================');
  console.log('   OUR LITTLE UNIVERSE — FASE 6: MESSAGES TEST SUITE');
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // TEST SECTION 1: Deterministic Conversation IDs & Model
  // -------------------------------------------------------------
  console.log('--- SECTION 1: Deterministic Conversation IDs & Model ---');
  {
    assert(getConversationId('nyanya', 'lala') === 'lala_nyanya', 'Nyanya + Lala produces lala_nyanya');
    assert(getConversationId('lala', 'nyanya') === 'lala_nyanya', 'Lala + Nyanya produces identical lala_nyanya');
    assert(getConversationId('nyanya', 'lele') === 'lele_nyanya', 'Nyanya + Lele produces lele_nyanya');
    assert(getConversationId('lele', 'nyanya') === 'lele_nyanya', 'Lele + Nyanya produces identical lele_nyanya');
    assert(getConversationId('lala', 'lele') === 'lala_lele', 'Lala + Lele produces lala_lele');
    assert(getConversationId('lele', 'lala') === 'lala_lele', 'Lele + Lala produces identical lala_lele');
    assert(getConversationId('nyanya', 'all_friends') === 'all_friends', 'Group chat returns all_friends');
    assert(getConversationId('all_friends', 'lala') === 'all_friends', 'Group chat returns all_friends regardless of order');

    // Available conversations for each character
    const nyanyaConvs = getAvailableConversations('nyanya');
    assert(nyanyaConvs.length === 3, 'Nyanya has 3 available conversation targets (Lala, Lele, All Friends)');
    assert(nyanyaConvs.some(c => c.partnerKey === 'lala' && c.id === 'lala_nyanya'), 'Nyanya conversation with Lala is lala_nyanya');
    assert(nyanyaConvs.some(c => c.partnerKey === 'lele' && c.id === 'lele_nyanya'), 'Nyanya conversation with Lele is lele_nyanya');
    assert(nyanyaConvs.some(c => c.type === 'group' && c.id === 'all_friends'), 'Nyanya has all_friends group conversation');

    const lalaConvs = getAvailableConversations('lala');
    assert(lalaConvs.length === 3, 'Lala has 3 available conversation targets (Nyanya, Lele, All Friends)');
    assert(lalaConvs.some(c => c.partnerKey === 'nyanya' && c.id === 'lala_nyanya'), 'Lala conversation with Nyanya is lala_nyanya');

    const leleConvs = getAvailableConversations('lele');
    assert(leleConvs.length === 3, 'Lele has 3 available conversation targets (Nyanya, Lala, All Friends)');
    assert(leleConvs.some(c => c.partnerKey === 'nyanya' && c.id === 'lele_nyanya'), 'Lele conversation with Nyanya is lele_nyanya');
  }

  // -------------------------------------------------------------
  // TEST SECTION 2: Character-Bound Security Rules on Real Emulator
  // -------------------------------------------------------------
  console.log('\n--- SECTION 2: Character-Bound Security Rules (Emulator) ---');
  const nowMs = Date.now();
  const testMsgIdNyanyaToLala = `msg-nya-la-${nowMs}`;
  const testMsgIdLeleToGroup = `msg-lele-grp-${nowMs}`;

  // 2.1: Valid message creation by Nyanya to Lala (Direct)
  {
    const res = await fetch(`${BASE_URL}/messages/${testMsgIdNyanyaToLala}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testMsgIdNyanyaToLala },
          conversationId: { stringValue: 'lala_nyanya' },
          senderUid: { stringValue: NYANYA_UID },
          senderCharacter: { stringValue: 'nyanya' },
          senderName: { stringValue: 'Nyanya' },
          senderAvatar: { stringValue: 'assets/nyanya_avatar.png' },
          participants: {
            arrayValue: {
              values: [{ stringValue: 'lala' }, { stringValue: 'nyanya' }]
            }
          },
          text: { stringValue: 'Halo Lala! Ini pesan pertama dari Kidult World ✧' },
          createdAt: { integerValue: String(nowMs) },
          readBy: {
            mapValue: {
              fields: {
                nyanya: { booleanValue: true }
              }
            }
          }
        }
      })
    });
    assert(res.status === 200, `Nyanya sends valid message to Lala -> Status ${res.status}`);
  }

  // 2.2: Participant read access: Lala CAN read message in lala_nyanya
  {
    const res = await fetch(`${BASE_URL}/messages/${testMsgIdNyanyaToLala}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${LALA_TOKEN}` }
    });
    assert(res.status === 200, `Lala (participant) can read lala_nyanya message -> Status ${res.status}`);
  }

  // 2.3: PRIVACY BARRIER: Lele (non-participant) CANNOT read lala_nyanya message
  {
    const res = await fetch(`${BASE_URL}/messages/${testMsgIdNyanyaToLala}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
    });
    assert(res.status === 403, `PRIVACY: Lele (third party) CANNOT read lala_nyanya message -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.4: Stranger account CANNOT read lala_nyanya message
  {
    const res = await fetch(`${BASE_URL}/messages/${testMsgIdNyanyaToLala}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${STRANGER_TOKEN}` }
    });
    assert(res.status === 403, `Stranger CANNOT read messages -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.5: Unauthenticated access CANNOT read messages
  {
    const res = await fetch(`${BASE_URL}/messages/${testMsgIdNyanyaToLala}`, {
      method: 'GET'
    });
    assert(res.status === 403, `Unauthenticated request CANNOT read messages -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.6: Unverified email tries to send message -> 403 Forbidden
  {
    const testUnverifiedId = `msg-unverified-${nowMs}`;
    const res = await fetch(`${BASE_URL}/messages/${testUnverifiedId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${UNVERIFIED_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testUnverifiedId },
          conversationId: { stringValue: 'lala_nyanya' },
          senderUid: { stringValue: NYANYA_UID },
          senderCharacter: { stringValue: 'nyanya' },
          senderName: { stringValue: 'Nyanya' },
          participants: {
            arrayValue: { values: [{ stringValue: 'lala' }, { stringValue: 'nyanya' }] }
          },
          text: { stringValue: 'Unverified email attempt' },
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Unverified email cannot send message -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.7: Anti-Spoofing: Nyanya tries to forge senderCharacter as 'lala' -> 403 Forbidden
  {
    const testSpoofCharId = `msg-spoof-char-${nowMs}`;
    const res = await fetch(`${BASE_URL}/messages/${testSpoofCharId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testSpoofCharId },
          conversationId: { stringValue: 'lala_nyanya' },
          senderUid: { stringValue: NYANYA_UID },
          senderCharacter: { stringValue: 'lala' }, // SPOOF!
          senderName: { stringValue: 'Lala Impersonator' },
          participants: {
            arrayValue: { values: [{ stringValue: 'lala' }, { stringValue: 'nyanya' }] }
          },
          text: { stringValue: 'Impersonating Lala' },
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Anti-Spoofing: Mismatched senderCharacter rejected -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.8: Anti-Spoofing: Nyanya tries to forge senderUid as LALA_UID -> 403 Forbidden
  {
    const testSpoofUidId = `msg-spoof-uid-${nowMs}`;
    const res = await fetch(`${BASE_URL}/messages/${testSpoofUidId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testSpoofUidId },
          conversationId: { stringValue: 'lala_nyanya' },
          senderUid: { stringValue: LALA_UID }, // SPOOF!
          senderCharacter: { stringValue: 'nyanya' },
          senderName: { stringValue: 'Nyanya' },
          participants: {
            arrayValue: { values: [{ stringValue: 'lala' }, { stringValue: 'nyanya' }] }
          },
          text: { stringValue: 'Impersonating senderUid' },
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Anti-Spoofing: Forged senderUid rejected -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.9: Input Validation: Empty text rejected -> 403 Forbidden
  {
    const testEmptyTextId = `msg-empty-txt-${nowMs}`;
    const res = await fetch(`${BASE_URL}/messages/${testEmptyTextId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testEmptyTextId },
          conversationId: { stringValue: 'lala_nyanya' },
          senderUid: { stringValue: NYANYA_UID },
          senderCharacter: { stringValue: 'nyanya' },
          senderName: { stringValue: 'Nyanya' },
          participants: {
            arrayValue: { values: [{ stringValue: 'lala' }, { stringValue: 'nyanya' }] }
          },
          text: { stringValue: '' }, // EMPTY!
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Validation: Empty message text rejected -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.10: Input Validation: Text > 2000 chars rejected -> 403 Forbidden
  {
    const testOversizeTextId = `msg-over-txt-${nowMs}`;
    const oversizedString = 'A'.repeat(2001);
    const res = await fetch(`${BASE_URL}/messages/${testOversizeTextId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testOversizeTextId },
          conversationId: { stringValue: 'lala_nyanya' },
          senderUid: { stringValue: NYANYA_UID },
          senderCharacter: { stringValue: 'nyanya' },
          senderName: { stringValue: 'Nyanya' },
          participants: {
            arrayValue: { values: [{ stringValue: 'lala' }, { stringValue: 'nyanya' }] }
          },
          text: { stringValue: oversizedString }, // OVERSIZED!
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Validation: Oversized text (>2000 chars) rejected -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.11: Valid Group Message by Lele to All Friends
  {
    const res = await fetch(`${BASE_URL}/messages/${testMsgIdLeleToGroup}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${LELE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testMsgIdLeleToGroup },
          conversationId: { stringValue: 'all_friends' },
          senderUid: { stringValue: LELE_UID },
          senderCharacter: { stringValue: 'lele' },
          senderName: { stringValue: 'Lele' },
          senderAvatar: { stringValue: 'assets/lele_avatar.png' },
          participants: {
            arrayValue: {
              values: [{ stringValue: 'nyanya' }, { stringValue: 'lala' }, { stringValue: 'lele' }]
            }
          },
          text: { stringValue: 'Selamat malam Nyanya & Lala! Kristal malam berkilau indah 🌙✨' },
          createdAt: { integerValue: String(nowMs) },
          readBy: {
            mapValue: {
              fields: {
                lele: { booleanValue: true }
              }
            }
          }
        }
      })
    });
    assert(res.status === 200, `Lele sends valid group message to all_friends -> Status ${res.status}`);
  }

  // 2.12: In group message, ALL 3 friends can read
  {
    const resNyanya = await fetch(`${BASE_URL}/messages/${testMsgIdLeleToGroup}`, {
      headers: { 'Authorization': `Bearer ${NYANYA_TOKEN}` }
    });
    const resLala = await fetch(`${BASE_URL}/messages/${testMsgIdLeleToGroup}`, {
      headers: { 'Authorization': `Bearer ${LALA_TOKEN}` }
    });
    const resLele = await fetch(`${BASE_URL}/messages/${testMsgIdLeleToGroup}`, {
      headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
    });
    assert(resNyanya.status === 200 && resLala.status === 200 && resLele.status === 200,
      'Group message is accessible to Nyanya (200), Lala (200), and Lele (200)');
  }

  // 2.13: Message Immutability: Tampering text of existing message -> 403 Forbidden
  {
    const res = await fetch(`${BASE_URL}/messages/${testMsgIdNyanyaToLala}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testMsgIdNyanyaToLala },
          conversationId: { stringValue: 'lala_nyanya' },
          senderUid: { stringValue: NYANYA_UID },
          senderCharacter: { stringValue: 'nyanya' },
          senderName: { stringValue: 'Nyanya' },
          participants: {
            arrayValue: { values: [{ stringValue: 'lala' }, { stringValue: 'nyanya' }] }
          },
          text: { stringValue: 'HACKED / ALTERED MESSAGE' }, // TAMPER TEXT!
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Immutability: Tampering message content rejected -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.14: Read Receipts: Lala marks Nyanya message as read -> 200 OK
  {
    const res = await fetch(`${BASE_URL}/messages/${testMsgIdNyanyaToLala}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${LALA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testMsgIdNyanyaToLala },
          conversationId: { stringValue: 'lala_nyanya' },
          senderUid: { stringValue: NYANYA_UID },
          senderCharacter: { stringValue: 'nyanya' },
          senderName: { stringValue: 'Nyanya' },
          senderAvatar: { stringValue: 'assets/nyanya_avatar.png' },
          participants: {
            arrayValue: { values: [{ stringValue: 'lala' }, { stringValue: 'nyanya' }] }
          },
          text: { stringValue: 'Halo Lala! Ini pesan pertama dari Kidult World ✧' },
          createdAt: { integerValue: String(nowMs) },
          readBy: {
            mapValue: {
              fields: {
                nyanya: { booleanValue: true },
                lala: { booleanValue: true }
              }
            }
          }
        }
      })
    });
    assert(res.status === 200, `Participant can update read receipt -> Status ${res.status}`);
  }

  // -------------------------------------------------------------
  // TEST SECTION 3: Conversation Summaries Collection (/conversations)
  // -------------------------------------------------------------
  console.log('\n--- SECTION 3: Conversation Summaries (/conversations) ---');
  const testConvId = `lala_nyanya`;
  {
    const res = await fetch(`${BASE_URL}/conversations/${testConvId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testConvId },
          participants: {
            arrayValue: { values: [{ stringValue: 'lala' }, { stringValue: 'nyanya' }] }
          },
          lastMessage: { stringValue: 'Halo Lala! Ini pesan pertama dari Kidult World ✧' },
          lastSender: { stringValue: 'nyanya' },
          lastSenderUid: { stringValue: NYANYA_UID },
          lastMessageAt: { integerValue: String(nowMs) },
          updatedAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 200, `Participant Nyanya creates conversation summary -> Status ${res.status}`);

    // Participant Lala can read summary
    const resLala = await fetch(`${BASE_URL}/conversations/${testConvId}`, {
      headers: { 'Authorization': `Bearer ${LALA_TOKEN}` }
    });
    assert(resLala.status === 200, `Participant Lala can read conversation summary -> Status ${resLala.status}`);

    // Non-participant Lele CANNOT read summary
    const resLele = await fetch(`${BASE_URL}/conversations/${testConvId}`, {
      headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
    });
    assert(resLele.status === 403, `Non-participant Lele CANNOT read lala_nyanya summary -> 403 Forbidden (Got ${resLele.status})`);
  }

  // -------------------------------------------------------------
  // TEST SECTION 4: Core Logic & Offline/Failure Handling
  // -------------------------------------------------------------
  console.log('\n--- SECTION 4: Core Logic & Offline/Failure Handling ---');
  {
    setActiveUserMessages('nyanya');
    assert(getActiveUserMessages() === 'nyanya', 'Active user set to nyanya');

    // Attempting to send message without auth in Node environment triggers offline/failure
    let thrownError = null;
    try {
      await sendMessageLogic('Pesan tes offline logic', 'lala_nyanya');
    } catch (err) {
      thrownError = err;
    }

    assert(thrownError !== null, 'Unauthenticated send throws explicit error');
    
    // Check cached message status
    const cached = window.localStorage.getItem(STORAGE_KEY_MESSAGES_CACHE);
    assert(cached !== null, 'Message attempt is cached locally for offline recovery');
    const parsedCache = JSON.parse(cached);
    assert(Array.isArray(parsedCache['lala_nyanya']), 'Conversation cache contains thread array');
    const lastCached = parsedCache['lala_nyanya'][parsedCache['lala_nyanya'].length - 1];
    assert(lastCached && lastCached.status === 'failed', `Cached message has status='failed' (got ${lastCached?.status})`);
    assert(lastCached && typeof lastCached.error === 'string', 'Cached message has explicit error message');
    assert(lastCached && lastCached.text === 'Pesan tes offline logic', 'Message retains original text for retry');
  }

  // -------------------------------------------------------------
  // TEST SECTION 5: UI Controller Initialization & Event Handling
  // -------------------------------------------------------------
  console.log('\n--- SECTION 5: UI Controller & Interactions ---');
  {
    let toastFired = null;
    const controller = initMessagesView({
      onShowToast: (msg) => { toastFired = msg; }
    });

    assert(controller !== null, 'Messages view controller initialized successfully');
    assert(typeof controller.openMessages === 'function', 'Controller exports openMessages function');
    assert(typeof controller.closeMessages === 'function', 'Controller exports closeMessages function');
    assert(typeof controller.switchConversation === 'function', 'Controller exports switchConversation function');

    // Open messages view
    controller.openMessages('view-private-universe', 'lala');
    const viewEl = document.getElementById('view-messages');
    assert(viewEl.classList.contains('active'), 'Opening messages marks view-messages as active');
    assert(viewEl.getAttribute('aria-hidden') === 'false', 'Opening messages sets aria-hidden="false"');

    // Switch active character
    syncMessagesActiveCharacter('lele');
    assert(getActiveUserMessages() === 'lele', 'syncMessagesActiveCharacter updates active user to lele');

    // Check character counter update on input
    const inputEl = document.getElementById('msg-input-text');
    const counterEl = document.getElementById('msg-char-counter');
    inputEl.value = 'Halo dunia!';
    if (inputEl.listeners['input']) {
      inputEl.listeners['input'].forEach(fn => fn());
    }
    assert(counterEl.textContent === '11 / 2000', `Character counter updates correctly (${counterEl.textContent})`);

    // Back button returns to caller
    const btnBack = document.getElementById('btn-msg-return-home');
    btnBack.click();
    assert(!viewEl.classList.contains('active'), 'Back button removes active class from messages view');
    assert(viewEl.getAttribute('aria-hidden') === 'true', 'Back button sets aria-hidden="true"');
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n=============================================================');
  console.log(`FASE 6 MESSAGES TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('=============================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
