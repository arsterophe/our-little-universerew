/**
 * TEST SUITE: OUR LITTLE MESSAGES — AKHIRA (YAWN ⚡) & 8 CHARACTERS INTEGRATION
 */

import assert from 'node:assert';
import fs from 'node:fs';

import {
  CHARACTERS_MESSAGES,
  getActiveUserCharacter,
  setActiveUserCharacter,
  getAvailableFriendsToChat,
  startNewConversation,
  getActiveConversationId,
  setActiveConversationId,
  getAvailableConversations,
  validateMessageInput,
  formatMessageTimestamp,
  getConversationId,
  CONVERSATION_PARTICIPANTS
} from './messages.js';

import {
  CANONICAL_CHARACTERS,
  CHARACTER_AUTH_RULES,
  identifyUserCharacter
} from './firebase.js';

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('1. TEST: AKHIRA IDENTITY & CONFIGURATION');
console.log('================================================================');

it('Akhira terdaftar di CHARACTERS_MESSAGES dengan identitas asli dan avatar HD', () => {
  const akhira = CHARACTERS_MESSAGES.akhira;
  assert.ok(akhira, 'Akhira must exist in CHARACTERS_MESSAGES');
  assert.strictEqual(akhira.name, 'Akhira');
  assert.strictEqual(akhira.symbol, '⚡');
  assert.strictEqual(akhira.universe, 'YAWN');
  assert.strictEqual(akhira.avatar, '/assets/avatar_akhira_hd.jpg');
  assert.notStrictEqual(akhira.avatar, '/assets/avatar_abil_hd.jpg', 'Must NOT use Syma avatar');
});

it('File avatar asli Akhira (/assets/avatar_akhira_hd.jpg) tersedia di filesystem', () => {
  assert.ok(fs.existsSync('public/assets/avatar_akhira_hd.jpg'), 'avatar_akhira_hd.jpg must exist in public/assets');
  const stats = fs.statSync('public/assets/avatar_akhira_hd.jpg');
  assert.ok(stats.size > 50000, 'Avatar Akhira must be valid HD image');
});

it('UID dan email kanonikal Akhira terdaftar di CANONICAL_CHARACTERS', () => {
  const akhira = CANONICAL_CHARACTERS.akhira;
  assert.ok(akhira, 'Akhira must exist in CANONICAL_CHARACTERS');
  assert.strictEqual(akhira.uid, 'MT14ZHATNqe90frAeQ74QFk4iXs2');
  assert.strictEqual(akhira.email, 'akhira@ourlittleuniverse.com');
  assert.strictEqual(akhira.avatar, '/assets/avatar_akhira_hd.jpg');
});

it('identifyUserCharacter mengenali akun Akhira berdasarkan UID maupun email', () => {
  const byUid = identifyUserCharacter({ uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2' });
  assert.strictEqual(byUid, 'akhira');

  const byEmail = identifyUserCharacter({ uid: 'any-uid', email: 'akhira@ourlittleuniverse.com' });
  assert.strictEqual(byEmail, 'akhira');
});

console.log('\n================================================================');
console.log('2. TEST: SUBTITLE & DOM STRUCTURE IN INDEX.HTML');
console.log('================================================================');

const indexHtml = fs.readFileSync('index.html', 'utf8');

it('Subtitle Our Little Messages di index.html mencerminkan seluruh 8 karakter OLU', () => {
  assert.ok(indexHtml.includes('Kotak Surat &amp; Obrolan Realtime 8 Sahabat') || indexHtml.includes('Kotak Surat & Obrolan Realtime 8 Sahabat'), 'Subtitle must mention 8 Sahabat');
  assert.ok(indexHtml.includes('Nyanya, Lala, Lele, Syma, Akhira, Ela, Ruben, Royan'), 'Subtitle must list all 8 characters');
});

it('Tombol Mulai Obrolan Baru (#btn-msg-new-chat) tersedia di sidebar header', () => {
  assert.ok(indexHtml.includes('id="btn-msg-new-chat"'), 'Must have #btn-msg-new-chat in DOM');
});

it('Modal Pemilihan Teman (#modal-msg-new-chat) dan grid (#msg-friends-picker-grid) terpasang di DOM', () => {
  assert.ok(indexHtml.includes('id="modal-msg-new-chat"'), 'Must have #modal-msg-new-chat in DOM');
  assert.ok(indexHtml.includes('id="msg-friends-picker-grid"'), 'Must have #msg-friends-picker-grid in DOM');
  assert.ok(indexHtml.includes('id="btn-close-new-chat"'), 'Must have #btn-close-new-chat in DOM');
});

console.log('\n================================================================');
console.log('3. TEST: FRIENDS PICKER FOR AKHIRA (7 CHARACTERS ONLY)');
console.log('================================================================');

it('getAvailableFriendsToChat untuk Akhira mengembalikan tepat 7 sahabat lainnya', () => {
  const friends = getAvailableFriendsToChat('akhira');
  assert.strictEqual(friends.length, 7, 'Must return exactly 7 friends for Akhira');

  const keys = friends.map((f) => f.key);
  assert.ok(keys.includes('nyanya'), 'Must include Nyanya');
  assert.ok(keys.includes('lala'), 'Must include Lala');
  assert.ok(keys.includes('lele'), 'Must include Lele');
  assert.ok(keys.includes('abil'), 'Must include Syma (abil)');
  assert.ok(keys.includes('ela'), 'Must include Ela');
  assert.ok(keys.includes('ruben'), 'Must include Ruben');
  assert.ok(keys.includes('royan'), 'Must include Royan');

  // Must NOT include Akhira
  assert.ok(!keys.includes('akhira'), 'Akhira must NOT appear as recipient for herself');
});

it('Setiap opsi teman menampilkan avatar asli, nama, simbol, dan universe yang valid', () => {
  const friends = getAvailableFriendsToChat('akhira');
  friends.forEach((f) => {
    assert.ok(f.avatar && f.avatar.startsWith('/assets/'), `Avatar for ${f.name} must be valid`);
    assert.ok(f.name, `Name for ${f.key} must be valid`);
    assert.ok(f.symbol, `Symbol for ${f.name} must be valid`);
    assert.ok(f.universe, `Universe for ${f.name} must be valid`);
  });

  const syma = friends.find((f) => f.key === 'abil');
  assert.strictEqual(syma.name, 'Syma');
  assert.strictEqual(syma.universe, 'PINWHEEL');

  const ela = friends.find((f) => f.key === 'ela');
  assert.strictEqual(ela.name, 'Ela');
  assert.strictEqual(ela.symbol, '🪷');
  assert.strictEqual(ela.universe, 'US AGAIN');
});

console.log('\n================================================================');
console.log('4. TEST: DETERMINISTIC CONVERSATION IDS & PARTICIPANTS');
console.log('================================================================');

it('getConversationId menghasilkan ID deterministik untuk Akhira dengan seluruh 7 sahabat', () => {
  const pairs = [
    { target: 'nyanya', expected: 'akhira_nyanya' },
    { target: 'lala', expected: 'akhira_lala' },
    { target: 'lele', expected: 'akhira_lele' },
    { target: 'abil', expected: 'abil_akhira' },
    { target: 'syma', expected: 'abil_akhira' },
    { target: 'ela', expected: 'akhira_ela' },
    { target: 'ruben', expected: 'akhira_ruben' },
    { target: 'royan', expected: 'akhira_royan' }
  ];

  pairs.forEach(({ target, expected }) => {
    assert.strictEqual(getConversationId('akhira', target), expected, `akhira + ${target} must yield ${expected}`);
    assert.strictEqual(getConversationId(target, 'akhira'), expected, `${target} + akhira must yield identical ${expected}`);
    assert.ok(CONVERSATION_PARTICIPANTS[expected], `CONVERSATION_PARTICIPANTS must have ${expected}`);
  });
});

console.log('\n================================================================');
console.log('5. TEST: FIRESTORE SECURITY RULES COMPLIANCE FOR AKHIRA');
console.log('================================================================');

const rulesContent = fs.readFileSync('firestore.rules', 'utf8');

it('firestore.rules mengenali isCharacterUser("akhira") dengan UID MT14ZHATNqe90frAeQ74QFk4iXs2 dan email', () => {
  assert.ok(rulesContent.includes("charKey == 'akhira' && request.auth.uid == 'MT14ZHATNqe90frAeQ74QFk4iXs2'"), 'Rules must verify Akhira UID');
  assert.ok(rulesContent.includes("charKey == 'akhira' && request.auth.token.email == 'akhira@ourlittleuniverse.com'"), 'Rules must verify Akhira email');
});

it('isValidMessage dan isValidConversationDoc mengizinkan karakter akhira', () => {
  assert.ok(rulesContent.includes("'akhira'"), 'Rules must mention akhira in valid characters list');
});

it('isAllowedConversation mengizinkan seluruh 7 pasangan percakapan Akhira', () => {
  const convFunctionIdx = rulesContent.indexOf('function isAllowedConversation');
  assert.ok(convFunctionIdx !== -1, 'isAllowedConversation function must exist');
  const convFunctionEnd = rulesContent.indexOf('function isDirectParticipant');
  const convFunctionBody = rulesContent.substring(convFunctionIdx, convFunctionEnd !== -1 ? convFunctionEnd : convFunctionIdx + 3000);

  ['abil_akhira', 'akhira_ela', 'akhira_lala', 'akhira_lele', 'akhira_nyanya', 'akhira_royan', 'akhira_ruben'].forEach((cid) => {
    assert.ok(convFunctionBody.includes(cid), `Rules must explicitly allow ${cid}`);
  });
});

console.log('\n================================================================');
console.log('6. TEST: CONVERSATION LISTING & PARTNER RESOLUTION FOR AKHIRA');
console.log('================================================================');

it('getAvailableConversations menyelesaikan nama dan avatar partner secara akurat untuk Akhira', () => {
  setActiveUserCharacter('akhira');
  startNewConversation('nyanya');
  const convs = getAvailableConversations('akhira');
  assert.ok(convs.length >= 1, 'Must have at least 1 conversation for Akhira');

  const nyanyaConv = convs.find((c) => c.id === 'akhira_nyanya');
  assert.ok(nyanyaConv, 'Must find akhira_nyanya conversation');
  assert.strictEqual(nyanyaConv.partnerKey, 'nyanya');
  assert.strictEqual(nyanyaConv.title, 'Nyanya ⭐');
  assert.strictEqual(nyanyaConv.subtitle, 'Universe KIDULT');
  assert.strictEqual(nyanyaConv.avatar, '/assets/avatar_nyanya_hd.png');
});

it('Percakapan Akhira dengan Syma (abil_akhira) tidak mengembalikan Akhira sebagai partner dirinya sendiri', () => {
  setActiveUserCharacter('akhira');
  startNewConversation('abil');
  const convs = getAvailableConversations('akhira');
  const symaConv = convs.find((c) => c.id === 'abil_akhira');
  assert.ok(symaConv, 'Must find abil_akhira conversation');
  assert.strictEqual(symaConv.partnerKey, 'abil', 'Partner key must be abil (Syma)');
  assert.strictEqual(symaConv.title, 'Syma ☁️');
  assert.strictEqual(symaConv.subtitle, 'Universe PINWHEEL');
  assert.strictEqual(symaConv.avatar, '/assets/avatar_abil_hd.jpg');
});

console.log('\n================================================================');
console.log('7. TEST: CSS STYLING & YAWN THEME FOR MESSAGES');
console.log('================================================================');

const messagesCss = fs.readFileSync('messages.css', 'utf8');

it('messages.css memuat styling untuk tombol pil #btn-msg-new-chat', () => {
  assert.ok(messagesCss.includes('.btn-msg-new-chat-pill'), 'Must style .btn-msg-new-chat-pill');
});

it('messages.css memuat styling header dan penutup modal pemilihan teman', () => {
  assert.ok(messagesCss.includes('.msg-modal-header'), 'Must style .msg-modal-header');
  assert.ok(messagesCss.includes('.msg-modal-title'), 'Must style .msg-modal-title');
  assert.ok(messagesCss.includes('.msg-modal-close'), 'Must style .msg-modal-close');
});

it('messages.css memuat tema khusus Akhira (.view-messages.theme-akhira / YAWN)', () => {
  assert.ok(messagesCss.includes('.view-messages.theme-akhira'), 'Must have .view-messages.theme-akhira');
  assert.ok(messagesCss.includes('body.theme-akhira .view-messages'), 'Must have body.theme-akhira support');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
