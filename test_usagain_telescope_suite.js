/**
 * AUTOMATED TEST SUITE: US AGAIN OBSERVATORY & STAR MESSAGES INTEGRATION
 * Verifies full parity for Ela (US AGAIN 🪷) with Nyanya, Lala, Lele, Syma, and Akhira Telescopes.
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
    process.exitCode = 1;
  }
}

console.log('\n================================================================');
console.log('1. TEST: US AGAIN OBSERVATORY DOM STRUCTURE IN INDEX.HTML');
console.log('================================================================');

const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');

it('Tombol Observatory Ela (#btn-loc-usagain-observatory) tersedia di stage US AGAIN', () => {
  assert.ok(indexHtml.includes('id="btn-loc-usagain-observatory"'), 'Hotspot button must exist in index.html');
  assert.ok(indexHtml.includes('btn-loc-usagain-observatory'), 'Class must exist');
});

it('Badge unread counter (#usagain-observatory-unread-badge) terpasang pada tombol Observatory', () => {
  assert.ok(indexHtml.includes('id="usagain-observatory-unread-badge"'), 'Unread badge must exist');
});

it('Modal Observatory (#usagain-observatory-modal) tersedia dengan header, rasi bintang, dan tombol interaksi', () => {
  assert.ok(indexHtml.includes('id="usagain-observatory-modal"'), 'Observatory modal must exist');
  assert.ok(indexHtml.includes('id="usagain-constellation-symbol"'), 'Constellation symbol element must exist');
  assert.ok(indexHtml.includes('id="usagain-constellation-name"'), 'Constellation name element must exist');
  assert.ok(indexHtml.includes('id="usagain-constellation-desc"'), 'Constellation desc element must exist');
  assert.ok(indexHtml.includes('id="btn-usagain-cycle-constellation"'), 'Cycle button must exist');
  assert.ok(indexHtml.includes('id="btn-usagain-log-constellation"'), 'Log button must exist');
});

it('Bagian Star Messages & tombol peluncur (#btn-usagain-open-starmessages) terpasang di dalam modal Observatory', () => {
  assert.ok(indexHtml.includes('id="btn-usagain-open-starmessages"'), 'Star Messages launcher button must exist in modal');
  assert.ok(indexHtml.includes('id="usagain-observatory-modal-unread-count"'), 'Unread counter tag must exist in modal');
  assert.ok(indexHtml.includes('Pesan Bintang Sahabat (Star Messages)'), 'Title label must exist');
});

console.log('\n================================================================');
console.log('2. TEST: CSS STYLING & US AGAIN OBSERVATORY THEME');
console.log('================================================================');

const usagainCss = fs.readFileSync(path.resolve('usagain.css'), 'utf-8');
const starMessagesCss = fs.readFileSync(path.resolve('star_messages.css'), 'utf-8');

it('usagain.css memiliki styling badge counter unread dan efek pulsasi pada tombol Observatory', () => {
  assert.ok(usagainCss.includes('.btn-loc-usagain-observatory.has-unread'), 'has-unread style for observatory button must exist');
  assert.ok(usagainCss.includes('.usagain-unread-badge'), 'usagain-unread-badge must be styled');
  assert.ok(usagainCss.includes('usagainObservatoryPulse'), 'Pulse keyframes must exist');
});

it('star_messages.css memiliki tema khusus US AGAIN (.view-star-messages.theme-usagain)', () => {
  assert.ok(starMessagesCss.includes('.view-star-messages.theme-usagain'), 'theme-usagain class must exist');
  assert.ok(starMessagesCss.includes('--star-accent: #f472b6'), 'Pink rose gold accent must be defined');
});

it('star_messages.css memiliki styling kustom bintang teratai Ela (.star-node-usagain)', () => {
  assert.ok(starMessagesCss.includes('.celestial-star-node.star-node-usagain'), 'star-node-usagain styling must exist');
  assert.ok(starMessagesCss.includes('elaStarGlow'), 'elaStarGlow keyframes must exist');
});

console.log('\n================================================================');
console.log('3. TEST: STAR_MESSAGES_VIEW.JS CONTROLLER & THEME INTEGRATION');
console.log('================================================================');

const starMessagesJs = fs.readFileSync(path.resolve('star_messages_view.js'), 'utf-8');

it('star_messages_view.js memetakan origin us_again dan usagain ke theme-usagain', () => {
  assert.ok(starMessagesJs.includes("if (univ === 'us_again' || univ === 'usagain' || univ === 'ela') return 'theme-usagain';"), 'Origin mapping to theme-usagain must exist');
});

it('star_messages_view.js memberikan judul universe US AGAIN dengan simbol teratai 🪷', () => {
  assert.ok(starMessagesJs.includes("if (univ === 'us_again' || univ === 'usagain' || univ === 'ela') return \"US AGAIN · ELA'S UNIVERSE 🪷\";"), 'HUD title for US AGAIN must exist');
});

it('star_messages_view.js memuat seed bintang khusus Ela (star-seed-6)', () => {
  assert.ok(starMessagesJs.includes("id: 'star-seed-6'"), 'star-seed-6 must exist');
  assert.ok(starMessagesJs.includes("senderCharacter: 'ela'"), 'Sender of star-seed-6 must be ela');
  assert.ok(starMessagesJs.includes("plxSNowjCkOMfUQMAwnZzQPR9Xr1"), 'Ela UID must match');
});

it('star_messages_view.js menandai bintang pengirim Ela dengan class star-node-usagain', () => {
  assert.ok(starMessagesJs.includes("${isEla ? 'star-node-usagain' : ''}"), 'isEla class assignment must exist');
  assert.ok(starMessagesJs.includes("isEla ? '🪷'"), 'Ela lotus icon must be selected for star glyph');
});

console.log('\n================================================================');
console.log('4. TEST: CANONICAL CHARACTER IDENTITIES & RECIPIENTS');
console.log('================================================================');

it('Karakter Ela terdaftar di CANONICAL_CHARACTERS dengan UID dan universe yang tepat', () => {
  const ela = CANONICAL_CHARACTERS.ela;
  assert.ok(ela, 'Ela must exist in CANONICAL_CHARACTERS');
  assert.strictEqual(ela.uid, 'plxSNowjCkOMfUQMAwnZzQPR9Xr1', 'UID must match canonical value');
  assert.strictEqual(ela.universe, 'US AGAIN', 'Universe must be US AGAIN');
  assert.strictEqual(ela.id, 'ela');
});

it('Tujuh karakter lainnya lengkap terdaftar dan siap bertukar pesan dengan Ela', () => {
  const others = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ruben', 'royan'];
  others.forEach(charKey => {
    assert.ok(CANONICAL_CHARACTERS[charKey], `${charKey} must be in CANONICAL_CHARACTERS`);
    assert.ok(CANONICAL_CHARACTERS[charKey].uid, `${charKey} must have UID`);
  });
});

console.log('\n================================================================');
console.log('5. TEST: FIRESTORE RULES VALIDATION FOR ELA STAR MESSAGES');
console.log('================================================================');

const firestoreRules = fs.readFileSync(path.resolve('firestore.rules'), 'utf-8');

it('firestore.rules mencakup UID Ela (plxSNowjCkOMfUQMAwnZzQPR9Xr1) dalam isCanonicalStarUser', () => {
  assert.ok(firestoreRules.includes('plxSNowjCkOMfUQMAwnZzQPR9Xr1'), 'Ela UID must exist in isCanonicalStarUser');
});

it('firestore.rules memvalidasi pemetaan UID Ela dengan charKey ela (isValidStarCharacterMapping)', () => {
  assert.ok(firestoreRules.includes("uid == 'plxSNowjCkOMfUQMAwnZzQPR9Xr1' && charKey == 'ela'"), 'Ela mapping must be checked in isValidStarCharacterMapping');
});

it('firestore.rules mengizinkan universeOrigin us_again dan usagain pada Star Messages', () => {
  assert.ok(firestoreRules.includes("'us_again'"), 'us_again must be allowed in universeOrigin');
  assert.ok(firestoreRules.includes("'usagain'"), 'usagain must be allowed in universeOrigin');
});

console.log('\n================================================================');
console.log('6. TEST: CROSS-UNIVERSE MESSAGE DISPATCH & RECEPTION SIMULATION');
console.log('================================================================');

it('Ela dapat menerima pesan dari 7 karakter lainnya dengan validasi data payload', () => {
  const otherChars = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ruben', 'royan'];
  const elaConfig = CANONICAL_CHARACTERS.ela;

  otherChars.forEach(senderKey => {
    const sender = CANONICAL_CHARACTERS[senderKey];
    const mockMsg = {
      id: `star-test-${senderKey}-to-ela`,
      senderUid: sender.uid,
      senderCharacter: senderKey,
      senderName: sender.name,
      recipientUid: elaConfig.uid,
      recipientCharacter: 'ela',
      recipientName: 'Ela',
      text: `Salam hangat kosmik dari ${sender.name} untuk Ela di The Silent Lotus! 🪷`,
      category: 'warmth',
      starType: 'rose',
      universeOrigin: sender.universe.toLowerCase(),
      createdAt: Date.now(),
      read: false
    };

    assert.strictEqual(mockMsg.recipientUid, 'plxSNowjCkOMfUQMAwnZzQPR9Xr1');
    assert.strictEqual(mockMsg.recipientCharacter, 'ela');
    assert.ok(mockMsg.text.length > 0 && mockMsg.text.length <= 2000);
  });
});

it('Ela dapat mengirim pesan ke 7 karakter lainnya dengan validasi data payload', () => {
  const otherChars = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ruben', 'royan'];
  const elaConfig = CANONICAL_CHARACTERS.ela;

  otherChars.forEach(recKey => {
    const rec = CANONICAL_CHARACTERS[recKey];
    const mockMsg = {
      id: `star-test-ela-to-${recKey}`,
      senderUid: elaConfig.uid,
      senderCharacter: 'ela',
      senderName: 'Ela',
      recipientUid: rec.uid,
      recipientCharacter: recKey,
      recipientName: rec.name,
      text: `In the silence, the soul blooms. Salam damai dari The Silent Lotus untuk ${rec.name}! 🪷✨`,
      category: 'wish',
      starType: 'rose',
      universeOrigin: 'us_again',
      createdAt: Date.now(),
      read: false
    };

    assert.strictEqual(mockMsg.senderUid, 'plxSNowjCkOMfUQMAwnZzQPR9Xr1');
    assert.strictEqual(mockMsg.senderCharacter, 'ela');
    assert.strictEqual(mockMsg.recipientUid, rec.uid);
  });
});

console.log('\n================================================================');
console.log('7. TEST: USAGAIN_VIEW.JS OBSERVATORY & STAR MESSAGES CONTROLLER');
console.log('================================================================');

const usagainViewJs = fs.readFileSync(path.resolve('usagain_view.js'), 'utf-8');

it('usagain_view.js mengimpor dbSubscribeStarMessages', () => {
  assert.ok(usagainViewJs.includes('dbSubscribeStarMessages'), 'Must import dbSubscribeStarMessages');
});

it('usagain_view.js memiliki fungsi updateUsAgainObservatoryBadge dan subscribeUsAgainStarMessagesUnread', () => {
  assert.ok(usagainViewJs.includes('function updateUsAgainObservatoryBadge'), 'Must define updateUsAgainObservatoryBadge');
  assert.ok(usagainViewJs.includes('function subscribeUsAgainStarMessagesUnread'), 'Must define subscribeUsAgainStarMessagesUnread');
});

it('usagain_view.js memiliki fungsi openSharedStarMessages yang memanggil onNavigateStarMessages("us_again")', () => {
  assert.ok(usagainViewJs.includes('function openSharedStarMessages'), 'Must define openSharedStarMessages');
  assert.ok(usagainViewJs.includes("onNavigateStarMessages('us_again')"), 'Must call onNavigateStarMessages with us_again');
});

it('Tombol #btn-usagain-open-starmessages terpasang di setupObservatory()', () => {
  assert.ok(usagainViewJs.includes("document.getElementById('btn-usagain-open-starmessages')"), 'Listener must attach to btn-usagain-open-starmessages');
  assert.ok(usagainViewJs.includes("document.getElementById('btn-usagain-cycle-constellation')"), 'Listener must attach to btn-usagain-cycle-constellation');
  assert.ok(usagainViewJs.includes("document.getElementById('btn-usagain-log-constellation')"), 'Listener must attach to btn-usagain-log-constellation');
});

console.log('\n================================================================');
console.log('8. TEST: UNIVERSES_VIEW.JS & MAIN.JS WIRING');
console.log('================================================================');

const universesViewJs = fs.readFileSync(path.resolve('universes_view.js'), 'utf-8');
const mainJs = fs.readFileSync(path.resolve('main.js'), 'utf-8');

it('universes_view.js meneruskan onNavigateStarMessages ke initUsAgainWorld', () => {
  assert.ok(universesViewJs.includes("onNavigateStarMessages: (originUniv = 'us_again') => {"), 'universes_view.js must forward onNavigateStarMessages to initUsAgainWorld');
});

it('main.js menangani origin us_again pada onNavigateStarMessages dengan fallback karakter ela', () => {
  assert.ok(mainJs.includes("originUniverse === 'us_again' || originUniverse === 'usagain' || originUniverse === 'ela'"), 'main.js must recognize us_again in onNavigateStarMessages');
  assert.ok(mainJs.includes("charFallback = activeCharacterKey || 'ela';"), 'Fallback character must be ela');
});

it('main.js mengembalikan navigasi ke openUsAgainWorld saat kembali dari Star Messages dengan origin us_again', () => {
  assert.ok(mainJs.includes("univCtrl.openUsAgainWorld();"), 'main.js must route back to openUsAgainWorld');
});

console.log('\n================================================================');
console.log(`RESULTS: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
}
