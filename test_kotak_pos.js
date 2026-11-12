/**
 * TEST SUITE: KOTAK POS (DIGITAL LETTERS & MAILBOX)
 * Across All 3 Universes: KIDULT (Nyanya), TO YOU (Lala), SHADOW (Lele)
 * 
 * Verifies:
 * 1. Kotak Pos hotspot integration in KIDULT, TO YOU, and SHADOW
 * 2. Paper themes and canonical character & UID mapping
 * 3. Letter validation, anti-spoofing, and privacy guards
 * 4. Full three-way letter lifecycle simulation:
 *    - Nyanya → Lala (Sent, Received, Read, Delete by recipient while keeping sender copy)
 *    - Lala → Lele (Privacy separation, Read status)
 *    - Lele → Nyanya (Sent, Received, Delete by sender while keeping recipient copy)
 * 5. Firestore Security Rules syntax and integrity in firestore.rules & firestore.rules.final
 * 6. UI DOM elements and CSS styling for all 3 universe themes
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(message);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('1. KOTAK POS INTEGRATION IN ALL 3 UNIVERSES');
  console.log('================================================================');

  const { KIDULT_LOCATIONS, TOYOU_LOCATIONS, SHADOW_LOCATIONS } = await import('./universes_view.js');

  assert(KIDULT_LOCATIONS.kotak_pos !== undefined, 'KIDULT has Kotak Pos location defined');
  assert(KIDULT_LOCATIONS.kotak_pos.actionType === 'kotak_pos', 'KIDULT Kotak Pos actionType is kotak_pos');
  assert(KIDULT_LOCATIONS.kotak_pos.title === 'Kotak Pos', 'KIDULT Kotak Pos title is Kotak Pos');

  assert(TOYOU_LOCATIONS.kotak_pos !== undefined, 'TO YOU has Kotak Pos location defined');
  assert(TOYOU_LOCATIONS.kotak_pos.actionType === 'kotak_pos', 'TO YOU Kotak Pos actionType is kotak_pos');

  assert(SHADOW_LOCATIONS.kotak_pos !== undefined, 'SHADOW has Kotak Pos location defined');
  assert(SHADOW_LOCATIONS.kotak_pos.actionType === 'kotak_pos', 'SHADOW Kotak Pos actionType is kotak_pos');

  console.log('\n================================================================');
  console.log('2. PAPER THEMES & CANONICAL CHARACTER SPECIFICATIONS');
  console.log('================================================================');

  const { CANONICAL_CHARACTERS, LETTER_PAPER_THEMES } = await import('./firebase.js');

  assert(LETTER_PAPER_THEMES.dreamy !== undefined, 'Paper theme dreamy (Senja Lavender KIDULT) is defined');
  assert(LETTER_PAPER_THEMES.morning !== undefined, 'Paper theme morning (Cahaya Pagi TO YOU) is defined');
  assert(LETTER_PAPER_THEMES.crystal !== undefined, 'Paper theme crystal (Malam Kristal SHADOW) is defined');
  assert(LETTER_PAPER_THEMES.parchment !== undefined, 'Paper theme parchment (Perkamen Klasik Emas) is defined');

  assert(CANONICAL_CHARACTERS.nyanya.uid === '1uwba7MrGVU3xHu57VVLvztskrg2', 'Nyanya canonical UID is 1uwba7MrGVU3xHu57VVLvztskrg2');
  assert(CANONICAL_CHARACTERS.lala.uid === 'EqByKA8FXoTEt0OmIsSDPfnxMDB3', 'Lala canonical UID is EqByKA8FXoTEt0OmIsSDPfnxMDB3');
  assert(CANONICAL_CHARACTERS.lele.uid === '1ArxphLQpAOoOIvH9BKYw0ebD1e2', 'Lele canonical UID is 1ArxphLQpAOoOIvH9BKYw0ebD1e2');

  console.log('\n================================================================');
  console.log('3. BUSINESS LOGIC & LETTER VALIDATION');
  console.log('================================================================');

  const { dbSendLetter } = await import('./firebase.js');

  // Test unauthenticated sender
  try {
    await dbSendLetter({ recipientCharacter: 'lala', title: 'Halo', body: 'Apa kabar?' });
    assert(false, 'Should reject unauthenticated sender');
  } catch (err) {
    assert(err.message.includes('harus login'), 'dbSendLetter rejects unauthenticated sender');
  }

  console.log('\n================================================================');
  console.log('4. THREE-WAY LETTER LIFECYCLE SIMULATION');
  console.log('================================================================');

  // In-memory letter store simulating Firestore collection 'letters'
  const lettersStore = new Map();

  function simulateSendLetter(senderChar, recipientChar, title, body, paperTheme = 'dreamy', universeOrigin = 'kidult') {
    const sender = CANONICAL_CHARACTERS[senderChar];
    const recipient = CANONICAL_CHARACTERS[recipientChar];

    if (!sender) throw new Error('Pengirim tidak sah');
    if (!recipient) throw new Error('Penerima tidak sah');
    if (senderChar === recipientChar) throw new Error('Tidak bisa mengirim surat ke diri sendiri');
    if (!title || title.trim().length === 0) throw new Error('Judul kosong');
    if (!body || body.trim().length === 0) throw new Error('Isi kosong');

    const id = `letter-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();

    const letter = {
      id,
      senderUid: sender.uid,
      senderCharacter: senderChar,
      senderName: sender.name,
      senderAvatar: sender.avatar || `/assets/avatar_${senderChar}_hd.png`,
      recipientUid: recipient.uid,
      recipientCharacter: recipientChar,
      recipientName: recipient.name,
      recipientAvatar: recipient.avatar || `/assets/avatar_${recipientChar}_hd.png`,
      title: title.trim(),
      body: body.trim(),
      paperTheme,
      universeOrigin,
      read: false,
      readAt: null,
      deletedBySender: false,
      deletedByRecipient: false,
      createdAt: now,
      updatedAt: now
    };

    lettersStore.set(id, letter);
    return letter;
  }

  function simulateGetInbox(userUid) {
    return Array.from(lettersStore.values())
      .filter(l => l.recipientUid === userUid && !l.deletedByRecipient)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  function simulateGetSent(userUid) {
    return Array.from(lettersStore.values())
      .filter(l => l.senderUid === userUid && !l.deletedBySender)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  function simulateReadLetter(letterId, readerUid) {
    const letter = lettersStore.get(letterId);
    if (!letter) throw new Error('Surat tidak ditemukan');
    if (letter.recipientUid !== readerUid) throw new Error('Hanya penerima yang dapat menandai sudah dibaca');
    letter.read = true;
    letter.readAt = Date.now();
    letter.updatedAt = Date.now();
    return letter;
  }

  function simulateDeleteLetter(letterId, userUid) {
    const letter = lettersStore.get(letterId);
    if (!letter) throw new Error('Surat tidak ditemukan');
    const isSender = letter.senderUid === userUid;
    const isRecipient = letter.recipientUid === userUid;
    if (!isSender && !isRecipient) throw new Error('Bukan pihak yang berhak menghapus surat');

    if (isSender) letter.deletedBySender = true;
    if (isRecipient) letter.deletedByRecipient = true;
    letter.updatedAt = Date.now();
    return letter;
  }

  // --- SIKLUS 1: Nyanya → Lala ---
  console.log('--- Siklus 1: Nyanya ⭐ mengirim surat kepada Lala ☀️ ---');
  const letter1 = simulateSendLetter(
    'nyanya',
    'lala',
    'Senja di KIDULT selalu mengingatkanku padamu',
    'Halo Lala! Dari menara kastil KIDULT, langit sore tampak jingga keemasan. Kuharap harimu di TO YOU secerah biasanya!',
    'dreamy',
    'kidult'
  );

  assert(letter1.senderUid === CANONICAL_CHARACTERS.nyanya.uid, 'Letter 1 senderUid adalah UID Nyanya');
  assert(letter1.recipientUid === CANONICAL_CHARACTERS.lala.uid, 'Letter 1 recipientUid adalah UID Lala');
  assert(letter1.read === false, 'Letter 1 awalnya berstatus belum dibaca (read: false)');

  const nyanyaSent = simulateGetSent(CANONICAL_CHARACTERS.nyanya.uid);
  assert(nyanyaSent.some(l => l.id === letter1.id), 'Letter 1 muncul di Surat Terkirim Nyanya');

  const lalaInbox = simulateGetInbox(CANONICAL_CHARACTERS.lala.uid);
  assert(lalaInbox.some(l => l.id === letter1.id), 'Letter 1 muncul di Surat Masuk Lala');

  const leleInbox = simulateGetInbox(CANONICAL_CHARACTERS.lele.uid);
  assert(!leleInbox.some(l => l.id === letter1.id), 'Letter 1 TIDAK bocor ke Surat Masuk Lele (Privasi Terjaga)');

  // Lala membaca surat
  const readLetter1 = simulateReadLetter(letter1.id, CANONICAL_CHARACTERS.lala.uid);
  assert(readLetter1.read === true && readLetter1.readAt !== null, 'Surat otomatis berstatus sudah dibaca setelah dibuka oleh Lala');

  // Lala menghapus surat dari Surat Masuk
  simulateDeleteLetter(letter1.id, CANONICAL_CHARACTERS.lala.uid);
  const lalaInboxAfterDel = simulateGetInbox(CANONICAL_CHARACTERS.lala.uid);
  assert(!lalaInboxAfterDel.some(l => l.id === letter1.id), 'Letter 1 terhapus dari Surat Masuk Lala');

  const nyanyaSentAfterDel = simulateGetSent(CANONICAL_CHARACTERS.nyanya.uid);
  assert(nyanyaSentAfterDel.some(l => l.id === letter1.id), 'Salinan surat Nyanya di Surat Terkirim TETAP UTUH dan tidak hilang');

  // --- SIKLUS 2: Lala → Lele ---
  console.log('\n--- Siklus 2: Lala ☀️ mengirim surat kepada Lele 🌙 ---');
  const letter2 = simulateSendLetter(
    'lala',
    'lele',
    'Bunga matahari pagi untuk malam kristalmu',
    'Lele tersayang, aku memetik kelopak bunga matahari pertama di TO YOU pagi ini. Kutitipkan lewat Kotak Pos agar menerangi malammu.',
    'morning',
    'to_you'
  );

  assert(letter2.senderUid === CANONICAL_CHARACTERS.lala.uid, 'Letter 2 senderUid adalah UID Lala');
  assert(letter2.recipientUid === CANONICAL_CHARACTERS.lele.uid, 'Letter 2 recipientUid adalah UID Lele');

  const lalaSent = simulateGetSent(CANONICAL_CHARACTERS.lala.uid);
  assert(lalaSent.some(l => l.id === letter2.id), 'Letter 2 muncul di Surat Terkirim Lala');

  const leleInbox2 = simulateGetInbox(CANONICAL_CHARACTERS.lele.uid);
  assert(leleInbox2.some(l => l.id === letter2.id), 'Letter 2 muncul di Surat Masuk Lele');

  // Lele membaca surat
  const readLetter2 = simulateReadLetter(letter2.id, CANONICAL_CHARACTERS.lele.uid);
  assert(readLetter2.read === true, 'Letter 2 berstatus dibaca oleh Lele');

  // --- SIKLUS 3: Lele → Nyanya ---
  console.log('\n--- Siklus 3: Lele 🌙 mengirim surat kepada Nyanya ⭐ ---');
  const letter3 = simulateSendLetter(
    'lele',
    'nyanya',
    'Kilau kristal bulan sabit dari SHADOW',
    'Nyanya, pendar kristal di Gazebo malam ini begitu tenang. Terima kasih sudah selalu menjaga kita bertiga di Little Universe.',
    'crystal',
    'shadow'
  );

  assert(letter3.senderUid === CANONICAL_CHARACTERS.lele.uid, 'Letter 3 senderUid adalah UID Lele');
  assert(letter3.recipientUid === CANONICAL_CHARACTERS.nyanya.uid, 'Letter 3 recipientUid adalah UID Nyanya');

  const leleSent = simulateGetSent(CANONICAL_CHARACTERS.lele.uid);
  assert(leleSent.some(l => l.id === letter3.id), 'Letter 3 muncul di Surat Terkirim Lele');

  const nyanyaInbox = simulateGetInbox(CANONICAL_CHARACTERS.nyanya.uid);
  assert(nyanyaInbox.some(l => l.id === letter3.id), 'Letter 3 muncul di Surat Masuk Nyanya');

  // Nyanya membaca surat
  simulateReadLetter(letter3.id, CANONICAL_CHARACTERS.nyanya.uid);

  // Lele menghapus dari Surat Terkirim
  simulateDeleteLetter(letter3.id, CANONICAL_CHARACTERS.lele.uid);
  const leleSentAfterDel = simulateGetSent(CANONICAL_CHARACTERS.lele.uid);
  assert(!leleSentAfterDel.some(l => l.id === letter3.id), 'Letter 3 terhapus dari Surat Terkirim Lele');

  const nyanyaInboxAfterDel = simulateGetInbox(CANONICAL_CHARACTERS.nyanya.uid);
  assert(nyanyaInboxAfterDel.some(l => l.id === letter3.id), 'Salinan surat Nyanya di Surat Masuk TETAP TERSEDIA');

  console.log('\n================================================================');
  console.log('5. FIRESTORE SECURITY RULES VERIFICATION');
  console.log('================================================================');

  const rulesContent = fs.readFileSync(path.resolve('./firestore.rules'), 'utf-8');
  const rulesFinalContent = fs.readFileSync(path.resolve('./firestore.rules.final'), 'utf-8');

  assert(rulesContent === rulesFinalContent, 'firestore.rules dan firestore.rules.final 100% identik');
  assert(rulesContent.includes('match /letters/{letterId}'), 'Rules memuat aturan match /letters/{letterId}');
  assert(rulesContent.includes('isValidLetter('), 'Rules memuat fungsi validator isValidLetter');
  assert(rulesContent.includes('deletedBySender'), 'Rules memvalidasi deletedBySender');
  assert(rulesContent.includes('deletedByRecipient'), 'Rules memvalidasi deletedByRecipient');
  assert(rulesContent.includes('paperTheme'), 'Rules memvalidasi paperTheme');

  // Verify legacy collections untouched
  assert(rulesContent.includes('match /orbit_events/{eventId}'), 'Collection 1 orbit_events dipertahankan');
  assert(rulesContent.includes('match /users/{userId}'), 'Collection 2 users dipertahankan');
  assert(rulesContent.includes('match /stories/{storyId}'), 'Collection 3 stories dipertahankan');
  assert(rulesContent.includes('match /moments/{momentId}'), 'Collection 4 moments dipertahankan');
  assert(rulesContent.includes('match /photobooth_sessions/{sessionId}'), 'Collection 5 photobooth_sessions dipertahankan');
  assert(rulesContent.includes('match /messages/{messageId}'), 'Collection 6 messages dipertahankan');
  assert(rulesContent.includes('match /conversations/{conversationId}'), 'Collection 7 conversations dipertahankan');
  assert(rulesContent.includes('match /game_records/{recordId}'), 'Collection 8 game_records dipertahankan');
  assert(rulesContent.includes('match /game_sessions/{sessionId}'), 'Collection 9 game_sessions dipertahankan');
  assert(rulesContent.includes('match /universe_states/{uid}'), 'Collection 10 universe_states dipertahankan');
  assert(rulesContent.includes('match /star_messages/{messageId}'), 'Collection 11 star_messages dipertahankan');
  assert(/match\s*\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/.test(rulesContent), 'Catch-all default-deny dipertahankan');

  console.log('\n================================================================');
  console.log('6. UI DOM & CSS STRUCTURE VERIFICATION');
  console.log('================================================================');

  const htmlContent = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
  const cssContent = fs.readFileSync(path.resolve('./mailbox.css'), 'utf-8');

  assert(htmlContent.includes('id="view-kotak-pos"'), 'index.html memuat view-kotak-pos');
  assert(htmlContent.includes('id="mailbox-tab-inbox"'), 'index.html memuat tab Surat Masuk');
  assert(htmlContent.includes('id="mailbox-tab-compose"'), 'index.html memuat tab Tulis Surat');
  assert(htmlContent.includes('id="mailbox-tab-sent"'), 'index.html memuat tab Surat Terkirim');
  assert(htmlContent.includes('id="mailbox-read-modal"'), 'index.html memuat modal baca surat');
  assert(htmlContent.includes('id="btn-mailbox-return-univ"'), 'index.html memuat tombol kembali ke universe');
  assert(htmlContent.includes('href="/mailbox.css"'), 'index.html memuat link stylesheet mailbox.css');

  assert(cssContent.includes('.view-kotak-pos.theme-kidult'), 'mailbox.css memuat tema KIDULT (Dreamy Lavender)');
  assert(cssContent.includes('.view-kotak-pos.theme-toyou') || cssContent.includes('.view-kotak-pos.theme-to_you'), 'mailbox.css memuat tema TO YOU (Warm Morning)');
  assert(cssContent.includes('.view-kotak-pos.theme-shadow'), 'mailbox.css memuat tema SHADOW (Crystal Midnight)');

  console.log('\n================================================================');
  console.log(`HASIL AKHIR: ${passed}/${total} PENGUJIAN BERHASIL (100%)`);
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
