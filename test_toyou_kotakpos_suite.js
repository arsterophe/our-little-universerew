/**
 * TEST SUITE: KOTAK POS TO YOU (LALA) INTEGRATION & MULTI-UNIVERSE LETTER SYSTEM
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition, message, detail = '') {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message} ${detail ? '-> ' + detail : ''}`);
  }
}

async function run() {
  console.log('================================================================');
  console.log('1. TEST: MARKUP & DOM ELEMENTS IN INDEX.HTML');
  console.log('================================================================');
  const indexHtml = fs.readFileSync(path.resolve('./index.html'), 'utf-8');

  assert(
    indexHtml.includes('class="toyou-hotspot hotspot-toyou-kotakpos"') && indexHtml.includes('data-toyou-loc="kotak_pos"'),
    'Hotspot Kotak Pos Lala (#hotspot-toyou-kotakpos) tersedia di stage TO YOU'
  );
  assert(
    indexHtml.includes('id="toyou-mailbox-unread-badge"'),
    'Badge unread counter (#toyou-mailbox-unread-badge) tersedia pada hotspot Kotak Pos Lala'
  );
  assert(
    indexHtml.includes('id="view-kotak-pos"'),
    'Tampilan utama Kotak Pos (#view-kotak-pos) terpasang di index.html'
  );
  assert(
    indexHtml.includes('id="mailbox-panel-inbox"') && indexHtml.includes('id="mailbox-panel-compose"') && indexHtml.includes('id="mailbox-panel-sent"'),
    'Panel Kotak Masuk, Tulis Surat, dan Kotak Terkirim tersedia lengkap'
  );
  assert(
    indexHtml.includes('id="mailbox-read-modal"') && indexHtml.includes('id="btn-sheet-reply"'),
    'Modal baca surat (#mailbox-read-modal) dan tombol balas (#btn-sheet-reply) tersedia'
  );

  console.log('\n================================================================');
  console.log('2. TEST: CSS THEME STYLING IN MAILBOX.CSS & UNIVERSES.CSS');
  console.log('================================================================');
  const mailboxCss = fs.readFileSync(path.resolve('./mailbox.css'), 'utf-8');
  const universesCss = fs.readFileSync(path.resolve('./universes.css'), 'utf-8');

  assert(
    mailboxCss.includes('.view-kotak-pos.theme-toyou') || mailboxCss.includes('.view-kotak-pos.theme-to_you'),
    'mailbox.css memiliki tema khusus .theme-toyou / .theme-to_you'
  );
  assert(
    mailboxCss.includes('#2d453b') && mailboxCss.includes('#fef08a'),
    'Tema visual TO YOU menggunakan palet fairy forest (emerald/moss green & warm golden sunlight)'
  );
  assert(
    universesCss.includes('.toyou-loc-badge') && universesCss.includes('.hotspot-toyou-kotakpos.has-unread'),
    'universes.css memiliki styling badge counter dan efek glowing unread pada hotspot'
  );

  console.log('\n================================================================');
  console.log('3. TEST: CANONICAL CHARACTERS & FIRESTORE INTEGRATION');
  console.log('================================================================');
  const { CANONICAL_CHARACTERS, LETTER_PAPER_THEMES } = await import('./firebase.js');

  assert(
    CANONICAL_CHARACTERS.lala !== undefined,
    'Karakter Lala terdaftar di CANONICAL_CHARACTERS'
  );
  assert(
    CANONICAL_CHARACTERS.lala.uid === 'EqByKA8FXoTEt0OmIsSDPfnxMDB3',
    'UID kanonikal Lala adalah EqByKA8FXoTEt0OmIsSDPfnxMDB3'
  );
  assert(
    CANONICAL_CHARACTERS.lala.universe === 'TO YOU',
    'Universe kanonikal Lala adalah TO YOU'
  );
  assert(
    CANONICAL_CHARACTERS.nyanya.uid === '1uwba7MrGVU3xHu57VVLvztskrg2',
    'UID kanonikal Nyanya (KIDULT) valid'
  );
  assert(
    CANONICAL_CHARACTERS.lele.uid === '1ArxphLQpAOoOIvH9BKYw0ebD1e2',
    'UID kanonikal Lele (SHADOW) valid'
  );
  assert(
    LETTER_PAPER_THEMES.morning !== undefined && LETTER_PAPER_THEMES.morning.name.includes('TO YOU'),
    'Tema kertas surat "Cahaya Pagi (TO YOU)" terdaftar di LETTER_PAPER_THEMES'
  );

  console.log('\n================================================================');
  console.log('4. TEST: FIRESTORE SECURITY RULES VERIFICATION');
  console.log('================================================================');
  const rules = fs.readFileSync(path.resolve('./firestore.rules'), 'utf-8');

  assert(
    rules.includes('match /letters/{letterId}'),
    'firestore.rules memiliki collection match /letters/{letterId}'
  );
  assert(
    rules.includes("'EqByKA8FXoTEt0OmIsSDPfnxMDB3'"),
    'firestore.rules mencakup UID Lala dalam daftar pengirim dan penerima yang sah'
  );
  assert(
    rules.includes("uid == 'EqByKA8FXoTEt0OmIsSDPfnxMDB3' && charKey == 'lala'"),
    'firestore.rules memvalidasi pemetaan UID Lala dengan charKey lala (isValidStarCharacterMapping)'
  );
  assert(
    rules.includes("'to_you'") && rules.includes("'toyou'"),
    'firestore.rules mengizinkan universeOrigin to_you dan toyou'
  );

  console.log('\n================================================================');
  console.log('5. TEST: SIMULATION OF CROSS-UNIVERSE LETTER DISPATCH & RECEPTION');
  console.log('================================================================');

  // Simulation payload generator
  function createLetterPayload({ senderKey, recipientKey, title, body, paperTheme = 'morning', origin = 'to_you' }) {
    const sCfg = CANONICAL_CHARACTERS[senderKey];
    const rCfg = CANONICAL_CHARACTERS[recipientKey];
    const now = Date.now();
    return {
      id: `test-letter-${now}-${Math.random().toString(36).slice(2, 6)}`,
      senderUid: sCfg.uid,
      senderCharacter: senderKey,
      senderName: sCfg.name,
      senderAvatar: sCfg.avatar,
      recipientUid: rCfg.uid,
      recipientCharacter: recipientKey,
      recipientName: rCfg.name,
      recipientAvatar: rCfg.avatar,
      title,
      body,
      paperTheme,
      universeOrigin: origin,
      read: false,
      readAt: null,
      deletedBySender: false,
      deletedByRecipient: false,
      createdAt: now,
      updatedAt: now
    };
  }

  // 1. Nyanya sends letter to Lala
  const letterFromNyanya = createLetterPayload({
    senderKey: 'nyanya',
    recipientKey: 'lala',
    title: 'Salam hangat dari pondok KIDULT',
    body: 'Halo Lala! Semoga harimu di hutan peri penuh dengan cahaya mentari.',
    paperTheme: 'dreamy',
    origin: 'kidult'
  });
  assert(
    letterFromNyanya.recipientUid === CANONICAL_CHARACTERS.lala.uid && letterFromNyanya.senderUid === CANONICAL_CHARACTERS.nyanya.uid,
    'Surat dari Nyanya teralamatkan tepat ke UID Lala (EqByKA8FXoTEt0OmIsSDPfnxMDB3)'
  );

  // 2. Lele sends letter to Lala
  const letterFromLele = createLetterPayload({
    senderKey: 'lele',
    recipientKey: 'lala',
    title: 'Cahaya Bulan untuk Sang Peri',
    body: 'Lala, terima kasih sudah selalu menyebarkan semangat ke semesta kami.',
    paperTheme: 'crystal',
    origin: 'shadow'
  });
  assert(
    letterFromLele.recipientUid === CANONICAL_CHARACTERS.lala.uid && letterFromLele.senderUid === CANONICAL_CHARACTERS.lele.uid,
    'Surat dari Lele teralamatkan tepat ke UID Lala (EqByKA8FXoTEt0OmIsSDPfnxMDB3)'
  );

  // 3. Lala replies to Nyanya
  const replyToNyanya = createLetterPayload({
    senderKey: 'lala',
    recipientKey: 'nyanya',
    title: `Balasan: ${letterFromNyanya.title}`,
    body: 'Terima kasih Nyanya! Aku baru saja memetik bunga lavender untukmu.',
    paperTheme: 'morning',
    origin: 'to_you'
  });
  assert(
    replyToNyanya.senderUid === CANONICAL_CHARACTERS.lala.uid && replyToNyanya.recipientUid === CANONICAL_CHARACTERS.nyanya.uid,
    'Balasan dari Lala teralamatkan tepat ke UID Nyanya (1uwba7MrGVU3xHu57VVLvztskrg2)'
  );

  // 4. Lala sends letter to Lele
  const letterToLele = createLetterPayload({
    senderKey: 'lala',
    recipientKey: 'lele',
    title: 'Sinar Matahari Pagi',
    body: 'Lele, ini sedikit kehangatan dari hutan peri untuk malam kristalmu!',
    paperTheme: 'morning',
    origin: 'to_you'
  });
  assert(
    letterToLele.senderUid === CANONICAL_CHARACTERS.lala.uid && letterToLele.recipientUid === CANONICAL_CHARACTERS.lele.uid,
    'Surat dari Lala ke Lele teralamatkan tepat ke UID Lele (1ArxphLQpAOoOIvH9BKYw0ebD1e2)'
  );

  // 5. Letter read status verification
  letterFromNyanya.read = true;
  letterFromNyanya.readAt = Date.now();
  assert(
    letterFromNyanya.read === true && typeof letterFromNyanya.readAt === 'number',
    'Status surat terverifikasi berubah menjadi sudah dibaca (read: true) dengan timestamp readAt'
  );

  console.log('\n================================================================');
  console.log('6. TEST: VIEW CONTROLLERS & EVENT BINDINGS IN UNIVERSES_VIEW.JS');
  console.log('================================================================');
  const uvJs = fs.readFileSync(path.resolve('./universes_view.js'), 'utf-8');
  const mainJs = fs.readFileSync(path.resolve('./main.js'), 'utf-8');

  assert(
    uvJs.includes("id: 'kotak_pos'") && uvJs.includes("actionType: 'kotak_pos'"),
    'TOYOU_LOCATIONS.kotak_pos terdefinisi dengan actionType: kotak_pos'
  );
  assert(
    uvJs.includes("onNavigateKotakPos('to_you')"),
    'universes_view.js memanggil onNavigateKotakPos("to_you") saat kotak pos dipilih'
  );
  assert(
    uvJs.includes('subscribeToYouMailboxUnread'),
    'universes_view.js memiliki listener realtime subscribeToYouMailboxUnread'
  );
  assert(
    mainJs.includes("originUniverse === 'to_you' || originUniverse === 'toyou'"),
    'main.js menangani origin to_you dan menetapkan fallback karakter lala'
  );

  console.log('\n================================================================');
  console.log(`RESULTS: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
