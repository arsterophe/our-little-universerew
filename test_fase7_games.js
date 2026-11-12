/**
 * OUR LITTLE UNIVERSE — FASE 7 TEST SUITE
 * Going Seventeen Zone (Games):
 * How Well Do You Know Me?, This or That, Who Said That?!, Bestie Mission,
 * Firestore Security Rules, Anti-Spoofing, Immutability, Multiplayer Sessions & Offline State.
 */

import './load_env.js';
import {
  GAME_METADATA,
  KNOW_ME_QUESTIONS,
  THIS_OR_THAT_ROUNDS,
  WHO_SAID_IT_QUESTIONS,
  DEFAULT_BESTIE_MISSIONS,
  getKnowMeQuestions,
  evaluateKnowMeScore,
  calculateThisOrThatAura,
  getWhoSaidItQuestions,
  getBestieMissions,
  toggleBestieMission,
  setActiveUserCharacter as setActiveUserGames,
  getActiveUserCharacter as getActiveUserGames,
  saveGameResult,
  getCachedGameRecords,
  STORAGE_KEY_GAMES_CACHE,
  STORAGE_KEY_MISSIONS_CACHE
} from './games.js';

import { initGamesView, syncGamesActiveCharacter } from './games_view.js';

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
    querySelector(sel) {
      if (sel === '.mission-checkbox') return createMockEl('mock-chk');
      if (sel === '[data-target]') return createMockEl('mock-target');
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.arena-option-btn') return [createMockEl('opt-1'), createMockEl('opt-2'), createMockEl('opt-3'), createMockEl('opt-4')];
      if (sel === '.games-tab-btn[data-tab]') return [createMockEl('tab-hub'), createMockEl('tab-msn'), createMockEl('tab-hist')];
      if (sel === '.btn-game-play[data-game]') return [createMockEl('btn-play-1')];
      if (sel.includes('.univ-nav-btn')) return [createMockEl('nav-games')];
      return [];
    },
    appendChild(child) { return child; },
    removeChild(child) { return child; }
  };
  mockElements[id] = el;
  return el;
}

const mockIds = [
  'view-games', 'btn-games-return-home', 'games-current-user-avatar', 'games-current-user-name',
  'games-current-user-role', 'games-hub-section', 'games-arena-section', 'games-missions-section',
  'games-history-section', 'arena-game-title', 'arena-round-indicator', 'arena-progress-fill',
  'arena-question-box', 'arena-options-grid', 'arena-feedback-card', 'arena-result-view',
  'games-missions-list', 'missions-progress-count', 'games-history-list', 'btn-arena-exit',
  'tab-games-hub', 'tab-games-missions', 'tab-games-history'
];

mockIds.forEach(id => createMockEl(id));

global.document = {
  getElementById: (id) => mockElements[id] || createMockEl(id),
  querySelectorAll: (sel) => {
    if (sel.includes('.games-tab-btn')) {
      return [
        { dataset: { tab: 'hub' }, classList: { toggle: () => {} } },
        { dataset: { tab: 'missions' }, classList: { toggle: () => {} } },
        { dataset: { tab: 'history' }, classList: { toggle: () => {} } }
      ];
    }
    if (sel.includes('.univ-nav-btn')) {
      return [{ getAttribute: () => 'games', classList: { toggle: () => {} }, setAttribute: () => {}, removeAttribute: () => {} }];
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
  console.log('   OUR LITTLE UNIVERSE — FASE 7: GAMES TEST SUITE');
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // TEST SECTION 1: Game Data & Rule Mechanics
  // -------------------------------------------------------------
  console.log('--- SECTION 1: Game Metadata & Content Rules ---');
  {
    assert(Object.keys(GAME_METADATA).length === 4, '4 games configured in metadata');
    assert(GAME_METADATA.know_me && GAME_METADATA.know_me.title.includes('How Well'), 'Game 1 is How Well Do You Know Me?');
    assert(GAME_METADATA.this_or_that && GAME_METADATA.this_or_that.title.includes('This or That'), 'Game 2 is This or That');
    assert(GAME_METADATA.who_said_it && GAME_METADATA.who_said_it.title.includes('Who Said'), 'Game 3 is Who Said That?!');
    assert(GAME_METADATA.bestie_mission && GAME_METADATA.bestie_mission.title.includes('Bestie Mission'), 'Game 4 is Bestie Mission');

    // Questions verification
    const nyanyaQuestions = getKnowMeQuestions('nyanya');
    assert(nyanyaQuestions.length === 5, 'Nyanya Know Me quiz has 5 questions');
    assert(nyanyaQuestions[0].options.length === 4, 'Questions have 4 choices');
    assert(typeof nyanyaQuestions[0].correctIndex === 'number', 'Question has valid correctIndex');

    const lalaQuestions = getKnowMeQuestions('lala');
    assert(lalaQuestions.length === 5, 'Lala Know Me quiz has 5 questions');

    const leleQuestions = getKnowMeQuestions('lele');
    assert(leleQuestions.length === 5, 'Lele Know Me quiz has 5 questions');

    // Score evaluation
    const perfectScore = evaluateKnowMeScore(5, 5);
    assert(perfectScore.percentage === 100, 'Score 5/5 evaluates to 100%');
    assert(perfectScore.badge.includes('Soulmate'), 'Score 100% earns Cosmic Soulmate badge');

    const mediumScore = evaluateKnowMeScore(3, 5);
    assert(mediumScore.percentage === 60, 'Score 3/5 evaluates to 60%');
    assert(mediumScore.badge.includes('Bestie Setia'), 'Score 60% earns Bestie Setia badge');

    const lowScore = evaluateKnowMeScore(1, 5);
    assert(lowScore.percentage === 20, 'Score 1/5 evaluates to 20%');

    // This or That Aura calculation
    const aura = calculateThisOrThatAura({
      tot_1: { trait: 'nyanya_lele' },
      tot_2: { trait: 'nyanya' },
      tot_3: { trait: 'lele' },
      tot_4: { trait: 'lala_nyanya' },
      tot_5: { trait: 'nyanya' }
    });
    assert(aura.dominant === 'nyanya', 'Aura dominance correctly identified as nyanya');
    assert(aura.badge.includes('Starlight'), 'Aura badge contains Starlight');
    assert(aura.affinity.nyanya > 0, 'Affinity percentage calculated');

    // Who Said That questions
    const wsiQuestions = getWhoSaidItQuestions(5);
    assert(wsiQuestions.length === 5, '5 Who Said That questions retrieved');
    assert(['nyanya', 'lala', 'lele'].includes(wsiQuestions[0].author), 'Author is canonical character');

    // Bestie Missions
    const missions = getBestieMissions('nyanya');
    assert(missions.length === 4, '4 Bestie Missions available');
    assert(missions.some(m => m.id === 'msn_1'), 'Mission 1 is Messages');
    assert(missions.some(m => m.id === 'msn_2'), 'Mission 2 is Photobooth');
  }

  // -------------------------------------------------------------
  // TEST SECTION 2: Firestore Security Rules on Real Emulator
  // -------------------------------------------------------------
  console.log('\n--- SECTION 2: Firestore Security Rules (Emulator) ---');
  const nowMs = Date.now();
  const testRecIdNyanya = `rec-know_me-${nowMs}-nya`;
  const testSessionId = `session-mission-${nowMs}`;

  // 2.1: Valid game record creation by verified Nyanya
  {
    const res = await fetch(`${BASE_URL}/game_records/${testRecIdNyanya}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testRecIdNyanya },
          gameId: { stringValue: 'know_me' },
          playerUid: { stringValue: NYANYA_UID },
          playerChar: { stringValue: 'nyanya' },
          playerName: { stringValue: 'Nyanya' },
          playerAvatar: { stringValue: '/assets/avatar_nyanya_hd.png' },
          score: { integerValue: '5' },
          maxScore: { integerValue: '5' },
          percentage: { integerValue: '100' },
          summary: { stringValue: 'Cosmic Soulmate (5/5)' },
          status: { stringValue: 'completed' },
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 200, `Nyanya saves valid game record -> Status ${res.status}`);
  }

  // 2.2: Character read access: Lala & Lele can read game records (Leaderboard)
  {
    const resLala = await fetch(`${BASE_URL}/game_records/${testRecIdNyanya}`, {
      headers: { 'Authorization': `Bearer ${LALA_TOKEN}` }
    });
    const resLele = await fetch(`${BASE_URL}/game_records/${testRecIdNyanya}`, {
      headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
    });
    assert(resLala.status === 200 && resLele.status === 200, 'Lala and Lele can read game record (200 OK)');
  }

  // 2.3: Anti-Spoofing: Nyanya tries to forge playerUid as LALA_UID -> 403 Forbidden
  {
    const testSpoofUidId = `rec-spoof-uid-${nowMs}`;
    const res = await fetch(`${BASE_URL}/game_records/${testSpoofUidId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testSpoofUidId },
          gameId: { stringValue: 'know_me' },
          playerUid: { stringValue: LALA_UID }, // SPOOF!
          playerChar: { stringValue: 'nyanya' },
          playerName: { stringValue: 'Nyanya' },
          score: { integerValue: '5' },
          maxScore: { integerValue: '5' },
          status: { stringValue: 'completed' },
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Anti-Spoofing: Forged playerUid rejected -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.4: Anti-Spoofing: Nyanya tries to claim playerChar as 'lala' -> 403 Forbidden
  {
    const testSpoofCharId = `rec-spoof-char-${nowMs}`;
    const res = await fetch(`${BASE_URL}/game_records/${testSpoofCharId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testSpoofCharId },
          gameId: { stringValue: 'know_me' },
          playerUid: { stringValue: NYANYA_UID },
          playerChar: { stringValue: 'lala' }, // SPOOF!
          playerName: { stringValue: 'Lala' },
          score: { integerValue: '5' },
          maxScore: { integerValue: '5' },
          status: { stringValue: 'completed' },
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Anti-Spoofing: Mismatched playerChar rejected -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.5: Unverified email tries to save record -> 403 Forbidden
  {
    const testUnverifiedId = `rec-unverif-${nowMs}`;
    const res = await fetch(`${BASE_URL}/game_records/${testUnverifiedId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${UNVERIFIED_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testUnverifiedId },
          gameId: { stringValue: 'know_me' },
          playerUid: { stringValue: NYANYA_UID },
          playerChar: { stringValue: 'nyanya' },
          score: { integerValue: '5' },
          maxScore: { integerValue: '5' },
          status: { stringValue: 'completed' },
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Unverified email cannot create game record -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.6: Stranger account rejected -> 403 Forbidden
  {
    const testStrangerId = `rec-stranger-${nowMs}`;
    const res = await fetch(`${BASE_URL}/game_records/${testStrangerId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${STRANGER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testStrangerId },
          gameId: { stringValue: 'know_me' },
          playerUid: { stringValue: STRANGER_UID },
          playerChar: { stringValue: 'nyanya' },
          score: { integerValue: '5' },
          maxScore: { integerValue: '5' },
          status: { stringValue: 'completed' },
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Stranger account cannot create game record -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.7: Game Record Immutability: Tampering score of existing record -> 403 Forbidden
  {
    const res = await fetch(`${BASE_URL}/game_records/${testRecIdNyanya}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testRecIdNyanya },
          gameId: { stringValue: 'know_me' },
          playerUid: { stringValue: NYANYA_UID },
          playerChar: { stringValue: 'nyanya' },
          score: { integerValue: '9999' }, // TAMPER SCORE!
          maxScore: { integerValue: '5' },
          status: { stringValue: 'completed' },
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Immutability: Tampering game score rejected -> 403 Forbidden (Got ${res.status})`);
  }

  // 2.8: Multiplayer / Co-op Session creation (`game_sessions`)
  {
    const res = await fetch(`${BASE_URL}/game_sessions/${testSessionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NYANYA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testSessionId },
          gameId: { stringValue: 'bestie_mission' },
          participants: {
            arrayValue: { values: [{ stringValue: 'nyanya' }, { stringValue: 'lala' }, { stringValue: 'lele' }] }
          },
          status: { stringValue: 'active' },
          createdBy: { stringValue: 'nyanya' },
          creatorUid: { stringValue: NYANYA_UID },
          createdAt: { integerValue: String(nowMs) },
          updatedAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 200, `Nyanya creates game session -> Status ${res.status}`);
  }

  // 2.9: Non-creator Lala tries to tamper creatorUid of game session -> 403 Forbidden
  {
    const res = await fetch(`${BASE_URL}/game_sessions/${testSessionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${LALA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: testSessionId },
          gameId: { stringValue: 'bestie_mission' },
          participants: {
            arrayValue: { values: [{ stringValue: 'nyanya' }, { stringValue: 'lala' }, { stringValue: 'lele' }] }
          },
          status: { stringValue: 'active' },
          createdBy: { stringValue: 'lala' }, // TAMPER!
          creatorUid: { stringValue: LALA_UID }, // TAMPER!
          createdAt: { integerValue: String(nowMs) }
        }
      })
    });
    assert(res.status === 403, `Security: Tampering creatorUid in session rejected -> 403 Forbidden (Got ${res.status})`);
  }

  // -------------------------------------------------------------
  // TEST SECTION 3: Offline Handling & Cache Persistence
  // -------------------------------------------------------------
  console.log('\n--- SECTION 3: Offline Handling & Cache Persistence ---');
  {
    setActiveUserGames('nyanya');
    assert(getActiveUserGames() === 'nyanya', 'Active game user is nyanya');

    // Save game result in unauthenticated Node environment
    const localResult = await saveGameResult({
      gameId: 'this_or_that',
      score: 5,
      maxScore: 5,
      summary: 'Starlight Soul'
    });

    assert(localResult !== null, 'Local game result returned');
    assert(localResult.isLocalOnly === true, 'Flagged as isLocalOnly when unauthenticated');

    // Verify localStorage cache
    const cached = window.localStorage.getItem(STORAGE_KEY_GAMES_CACHE);
    assert(cached !== null, 'Games cache saved to localStorage');
    const parsed = JSON.parse(cached);
    assert(Array.isArray(parsed) && parsed.length > 0, 'Cached records array contains entries');
    assert(parsed[0].gameId === 'this_or_that', 'First cached entry matches played game');

    // Bestie mission toggle offline
    const isDone = await toggleBestieMission('msn_1', 'nyanya');
    assert(isDone === true, 'Mission msn_1 marked as completed');
    const msnCache = window.localStorage.getItem(STORAGE_KEY_MISSIONS_CACHE);
    assert(msnCache !== null, 'Mission progress saved to localStorage cache');
    const parsedMsn = JSON.parse(msnCache);
    assert(parsedMsn.nyanya && parsedMsn.nyanya['msn_1'], 'Nyanya mission progress recorded');
  }

  // -------------------------------------------------------------
  // TEST SECTION 4: UI Controller & Lifecycle
  // -------------------------------------------------------------
  console.log('\n--- SECTION 4: UI Controller & Lifecycle ---');
  {
    let toastFired = null;
    const controller = initGamesView({
      onShowToast: (msg) => { toastFired = msg; }
    });

    assert(controller !== null, 'Games view controller initialized');
    assert(typeof controller.openGames === 'function', 'Controller exports openGames');
    assert(typeof controller.closeGames === 'function', 'Controller exports closeGames');
    assert(typeof controller.startGame === 'function', 'Controller exports startGame');

    // Open Games view
    controller.openGames('view-private-universe', 'lala');
    const viewEl = document.getElementById('view-games');
    assert(viewEl.classList.contains('active'), 'Games view has active class');
    assert(viewEl.getAttribute('aria-hidden') === 'false', 'Games view has aria-hidden="false"');

    // Sync active character
    syncGamesActiveCharacter('lele');
    assert(getActiveUserGames() === 'lele', 'Active character updated to lele');

    // Start a game in arena
    controller.startGame('know_me', { targetChar: 'nyanya' });
    const arenaEl = document.getElementById('games-arena-section');
    assert(arenaEl.classList.contains('active'), 'Arena section activated on game start');

    // Close / Return home
    controller.closeGames();
    assert(!viewEl.classList.contains('active'), 'Games view deactivated on close');
    assert(viewEl.getAttribute('aria-hidden') === 'true', 'Games view has aria-hidden="true"');
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n=============================================================');
  console.log(`FASE 7 GAMES TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('=============================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite().catch(err => {
  console.error('Fatal test error in Fase 7 suite:', err);
  process.exit(1);
});
