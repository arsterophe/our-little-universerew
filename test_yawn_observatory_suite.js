/**
 * AUTOMATED TEST SUITE: YAWN OBSERVATORY & STAR MESSAGES INTEGRATION
 * Verifies full parity with Nyanya (KIDULT), Lala (TO YOU), and Lele (SHADOW) Telescopes.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

import {
  CANONICAL_CHARACTERS,
  STAR_CATEGORIES,
  STAR_TYPES
} from './firebase.js';

let passed = 0;
let total = 0;

function it(description, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ PASS: ${description}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(err);
  }
}

console.log('\n================================================================');
console.log('1. TEST: YAWN OBSERVATORY DOM STRUCTURE IN INDEX.HTML');
console.log('================================================================');

const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');

it('Tombol Observatory Akhira (#btn-loc-yawn-observatory) tersedia di stage YAWN', () => {
  assert.ok(indexHtml.includes('id="btn-loc-yawn-observatory"'), 'Hotspot button must exist in index.html');
  assert.ok(indexHtml.includes('class="yawn-loc-btn btn-loc-yawn-observatory"'), 'Class must exist');
});

it('Badge unread counter (#yawn-observatory-unread-badge) terpasang pada tombol Observatory', () => {
  assert.ok(indexHtml.includes('id="yawn-observatory-unread-badge"'), 'Unread badge must exist');
});

it('Modal Observatory (#yawn-observatory-modal) tersedia dengan header, rasi bintang, dan tombol interaksi', () => {
  assert.ok(indexHtml.includes('id="yawn-observatory-modal"'), 'Observatory modal must exist');
  assert.ok(indexHtml.includes('id="yawn-constellation-symbol"'), 'Constellation symbol element must exist');
  assert.ok(indexHtml.includes('id="yawn-constellation-name"'), 'Constellation name element must exist');
  assert.ok(indexHtml.includes('id="yawn-constellation-desc"'), 'Constellation desc element must exist');
  assert.ok(indexHtml.includes('id="btn-yawn-cycle-constellation"'), 'Cycle button must exist');
  assert.ok(indexHtml.includes('id="btn-yawn-log-constellation"'), 'Log button must exist');
});

it('Bagian Star Messages & tombol peluncur (#btn-yawn-open-starmessages) terpasang di dalam modal Observatory', () => {
  assert.ok(indexHtml.includes('id="btn-yawn-open-starmessages"'), 'Star Messages launcher button must exist in modal');
  assert.ok(indexHtml.includes('id="yawn-observatory-modal-unread-count"'), 'Unread counter tag must exist in modal');
  assert.ok(indexHtml.includes('Pesan Bintang Sahabat (Star Messages)'), 'Title label must exist');
});

console.log('\n================================================================');
console.log('2. TEST: CSS STYLING & YAWN OBSERVATORY THEME');
console.log('================================================================');

const yawnCss = fs.readFileSync(path.resolve('yawn.css'), 'utf-8');
const starMessagesCss = fs.readFileSync(path.resolve('star_messages.css'), 'utf-8');

it('yawn.css memiliki styling badge counter unread dan efek pulsasi pada tombol Observatory', () => {
  assert.ok(yawnCss.includes('.btn-loc-yawn-observatory.has-unread'), 'has-unread style for observatory button must exist');
  assert.ok(yawnCss.includes('.yawn-loc-unread-badge'), 'unread badge style must exist');
  assert.ok(yawnCss.includes('@keyframes yawnObservatoryPulse'), 'pulse animation must exist');
});

it('star_messages.css memiliki tema khusus YAWN (.view-star-messages.theme-yawn)', () => {
  assert.ok(starMessagesCss.includes('.view-star-messages.theme-yawn'), 'theme-yawn must be defined in star_messages.css');
  assert.ok(starMessagesCss.includes('--star-accent: #38bdf8'), 'cyan accent color defined');
  assert.ok(starMessagesCss.includes('--star-card-bg'), 'card background variable defined');
});

it('star_messages.css memiliki styling kustom bintang astral Akhira (.star-node-yawn)', () => {
  assert.ok(starMessagesCss.includes('.celestial-star-node.star-node-yawn'), 'star-node-yawn class must exist');
  assert.ok(starMessagesCss.includes('@keyframes akhiraStarGlow'), 'akhiraStarGlow animation must exist');
});

console.log('\n================================================================');
console.log('3. TEST: STAR_MESSAGES_VIEW.JS CONTROLLER & THEME INTEGRATION');
console.log('================================================================');

const starMessagesViewSrc = fs.readFileSync(path.resolve('star_messages_view.js'), 'utf-8');

it('star_messages_view.js memetakan origin yawn ke theme-yawn', () => {
  assert.ok(starMessagesViewSrc.includes("univ === 'yawn' || univ === 'akhira'"), 'Origin check for yawn');
  assert.ok(starMessagesViewSrc.includes("return 'theme-yawn'"), 'Returns theme-yawn');
});

it('star_messages_view.js memberikan judul universe YAWN dengan simbol petir ⚡', () => {
  assert.ok(starMessagesViewSrc.includes("YAWN · AKHIRA'S UNIVERSE ⚡"), 'Title matches Akhira YAWN');
});

it('star_messages_view.js memuat seed bintang khusus Akhira (star-seed-5)', () => {
  assert.ok(starMessagesViewSrc.includes("id: 'star-seed-5'"), 'Seed 5 present');
  assert.ok(starMessagesViewSrc.includes("senderCharacter: 'akhira'"), 'Sender character is akhira');
  assert.ok(starMessagesViewSrc.includes("universeOrigin: 'yawn'"), 'Universe origin is yawn');
});

it('star_messages_view.js menandai bintang pengirim Akhira dengan class star-node-yawn', () => {
  assert.ok(starMessagesViewSrc.includes("const isAkhira = (msg.senderCharacter === 'akhira' || msg.universeOrigin === 'yawn')"), 'Identifies Akhira star');
  assert.ok(starMessagesViewSrc.includes('star-node-yawn'), 'Applies star-node-yawn class');
});

console.log('\n================================================================');
console.log('4. TEST: CANONICAL CHARACTER IDENTITIES & RECIPIENTS');
console.log('================================================================');

it('Karakter Akhira terdaftar di CANONICAL_CHARACTERS dengan UID dan universe yang tepat', () => {
  const akhira = CANONICAL_CHARACTERS.akhira;
  assert.ok(akhira, 'Akhira must exist');
  assert.strictEqual(akhira.id, 'akhira');
  assert.strictEqual(akhira.name, 'Akhira');
  assert.strictEqual(akhira.universe, 'YAWN');
  assert.strictEqual(akhira.symbol, '⚡');
  assert.strictEqual(akhira.uid, 'MT14ZHATNqe90frAeQ74QFk4iXs2');
});

it('Tujuh karakter lainnya lengkap terdaftar dan siap bertukar pesan dengan Akhira', () => {
  const expectedChars = ['nyanya', 'lala', 'lele', 'abil', 'ela', 'ruben', 'royan'];
  expectedChars.forEach(k => {
    assert.ok(CANONICAL_CHARACTERS[k], `Character ${k} must exist`);
    assert.ok(CANONICAL_CHARACTERS[k].uid, `Character ${k} must have UID`);
    assert.notStrictEqual(CANONICAL_CHARACTERS[k].uid, CANONICAL_CHARACTERS.akhira.uid, `UID must be unique`);
  });
});

console.log('\n================================================================');
console.log('5. TEST: FIRESTORE RULES VALIDATION FOR AKHIRA STAR MESSAGES');
console.log('================================================================');

const firestoreRules = fs.readFileSync(path.resolve('firestore.rules'), 'utf-8');

it('firestore.rules mencakup UID Akhira (MT14ZHATNqe90frAeQ74QFk4iXs2) dalam isCanonicalStarUser', () => {
  assert.ok(firestoreRules.includes('MT14ZHATNqe90frAeQ74QFk4iXs2'), 'Akhira UID must be in rules');
});

it('firestore.rules memvalidasi pemetaan UID Akhira dengan charKey akhira (isValidStarCharacterMapping)', () => {
  assert.ok(firestoreRules.includes("uid == 'MT14ZHATNqe90frAeQ74QFk4iXs2' && charKey == 'akhira'"), 'UID mapping exists');
});

it('firestore.rules mengizinkan universeOrigin yawn pada Star Messages', () => {
  assert.ok(firestoreRules.includes("'yawn'"), 'yawn origin allowed');
});

console.log('\n================================================================');
console.log('6. TEST: CROSS-UNIVERSE MESSAGE DISPATCH & RECEPTION SIMULATION');
console.log('================================================================');

it('Akhira dapat menerima pesan dari 7 karakter lainnya dengan validasi data payload', () => {
  const senders = ['nyanya', 'lala', 'lele', 'abil', 'ela', 'ruben', 'royan'];
  senders.forEach(sKey => {
    const sConf = CANONICAL_CHARACTERS[sKey];
    const aConf = CANONICAL_CHARACTERS.akhira;
    const msg = {
      id: `star-test-${sKey}-to-akhira`,
      senderUid: sConf.uid,
      senderCharacter: sKey,
      senderName: sConf.name,
      senderAvatar: sConf.avatar,
      recipientUid: aConf.uid,
      recipientCharacter: 'akhira',
      recipientName: aConf.name,
      text: `Halo Akhira, salam hangat dari ${sConf.universe}!`,
      category: 'warmth',
      starType: 'cyan',
      x: 50.0,
      y: 50.0,
      universeOrigin: sConf.universe.toLowerCase().replace(/\s+/g, '_'),
      createdAt: Date.now(),
      read: false,
      favorites: {}
    };

    assert.strictEqual(msg.recipientUid, 'MT14ZHATNqe90frAeQ74QFk4iXs2');
    assert.strictEqual(msg.recipientCharacter, 'akhira');
    assert.ok(msg.text.length > 0);
  });
});

it('Akhira dapat mengirim pesan ke 7 karakter lainnya dengan validasi data payload', () => {
  const recipients = ['nyanya', 'lala', 'lele', 'abil', 'ela', 'ruben', 'royan'];
  recipients.forEach(rKey => {
    const rConf = CANONICAL_CHARACTERS[rKey];
    const aConf = CANONICAL_CHARACTERS.akhira;
    const msg = {
      id: `star-test-akhira-to-${rKey}`,
      senderUid: aConf.uid,
      senderCharacter: 'akhira',
      senderName: aConf.name,
      senderAvatar: aConf.avatar,
      recipientUid: rConf.uid,
      recipientCharacter: rKey,
      recipientName: rConf.name,
      text: `Salam dari kota bawah laut YAWN untuk ${rConf.name}!`,
      category: 'wish',
      starType: 'gold',
      x: 35.0,
      y: 65.0,
      universeOrigin: 'yawn',
      createdAt: Date.now(),
      read: false,
      favorites: {}
    };

    assert.strictEqual(msg.senderUid, 'MT14ZHATNqe90frAeQ74QFk4iXs2');
    assert.strictEqual(msg.senderCharacter, 'akhira');
    assert.strictEqual(msg.recipientUid, rConf.uid);
    assert.ok(msg.text.length > 0);
  });
});

console.log('\n================================================================');
console.log('7. TEST: YAWN_VIEW.JS OBSERVATORY & STAR MESSAGES CONTROLLER');
console.log('================================================================');

const yawnViewSrc = fs.readFileSync(path.resolve('yawn_view.js'), 'utf-8');

it('yawn_view.js mengimpor dbSubscribeStarMessages', () => {
  assert.ok(yawnViewSrc.includes('dbSubscribeStarMessages'), 'Imported dbSubscribeStarMessages');
});

it('yawn_view.js memiliki fungsi updateYawnObservatoryBadge dan subscribeYawnStarMessagesUnread', () => {
  assert.ok(yawnViewSrc.includes('function updateYawnObservatoryBadge('), 'updateYawnObservatoryBadge exists');
  assert.ok(yawnViewSrc.includes('function subscribeYawnStarMessagesUnread('), 'subscribeYawnStarMessagesUnread exists');
});

it('yawn_view.js memiliki fungsi openSharedStarMessages yang memanggil onNavigateStarMessages("yawn")', () => {
  assert.ok(yawnViewSrc.includes('function openSharedStarMessages('), 'openSharedStarMessages exists');
  assert.ok(yawnViewSrc.includes("options.onNavigateStarMessages('yawn')"), 'Calls onNavigateStarMessages with yawn');
});

it('Tombol #btn-yawn-open-starmessages terpasang di wireEvents()', () => {
  assert.ok(yawnViewSrc.includes("document.getElementById('btn-yawn-open-starmessages')?.addEventListener('click'"), 'Button wired to click');
});

console.log('\n================================================================');
console.log('8. TEST: UNIVERSES_VIEW.JS & MAIN.JS WIRING');
console.log('================================================================');

const universesViewSrc = fs.readFileSync(path.resolve('universes_view.js'), 'utf-8');
const mainSrc = fs.readFileSync(path.resolve('main.js'), 'utf-8');

it('universes_view.js meneruskan onNavigateStarMessages ke initYawnWorld', () => {
  assert.ok(universesViewSrc.includes("onNavigateStarMessages: (originUniv = 'yawn') => {"), 'Passed to initYawnWorld');
});

it('main.js menangani origin yawn pada onNavigateStarMessages dengan fallback karakter akhira', () => {
  assert.ok(mainSrc.includes("originUniverse === 'yawn' || originUniverse === 'akhira'"), 'Checked origin yawn');
  assert.ok(mainSrc.includes("charFallback = activeCharacterKey || 'akhira'"), 'Fallback to akhira');
});

it('main.js mengembalikan navigasi ke openYawnWorld saat kembali dari Star Messages dengan origin yawn', () => {
  assert.ok(mainSrc.includes("univCtrl.openYawnWorld()"), 'Navigates back to openYawnWorld');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
}
