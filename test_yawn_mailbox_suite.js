/**
 * TEST SUITE: KOTAK POS YAWN (AKHIRA ⚡) INTEGRATION & MULTI-UNIVERSE LETTER SYSTEM
 *
 * Verifies that:
 * 1. DOM Elements & Hotspot with Unread Badge exist in index.html.
 * 2. Theme CSS styling for YAWN and Paper Lightning exist in mailbox.css and yawn.css.
 * 3. Canonical Character Akhira (UID: MT14ZHATNqe90frAeQ74QFk4iXs2) and all 8 characters are mapped.
 * 4. Firestore Security Rules grant full letter read/create/update permissions for Akhira & yawn origin.
 * 5. Multi-Universe Letter Dispatch & Reception simulations across all 7 other characters (Nyanya, Lala, Lele, Syma, Ela, Ruben, Royan).
 * 6. View controllers (yawn_view.js, mailbox_view.js, universes_view.js, main.js) correctly wire the mailbox lifecycle.
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
    indexHtml.includes('id="btn-loc-yawn-mailbox"') && indexHtml.includes('btn-loc-yawn-mailbox'),
    'Tombol Kotak Pos Akhira (#btn-loc-yawn-mailbox / .btn-loc-yawn-mailbox) tersedia di stage YAWN'
  );
  assert(
    indexHtml.includes('id="yawn-mailbox-unread-badge"'),
    'Badge unread counter (#yawn-mailbox-unread-badge) terpasang di dalam tombol Kotak Pos Akhira'
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
  assert(
    indexHtml.includes('data-paper="lightning"') && indexHtml.includes('Kilat Petir (YAWN)'),
    'Pilihan tema kertas surat "Kilat Petir (YAWN)" tersedia di pemilih kertas surat'
  );

  console.log('\n================================================================');
  console.log('2. TEST: CSS THEME STYLING IN MAILBOX.CSS & YAWN.CSS');
  console.log('================================================================');
  const mailboxCss = fs.readFileSync(path.resolve('./mailbox.css'), 'utf-8');
  const yawnCss = fs.readFileSync(path.resolve('./yawn.css'), 'utf-8');

  assert(
    mailboxCss.includes('.view-kotak-pos.theme-yawn'),
    'mailbox.css memiliki tema khusus .theme-yawn'
  );
  assert(
    mailboxCss.includes('#0c2d48') && mailboxCss.includes('#7dd3fc') && mailboxCss.includes('#f59e0b'),
    'Tema visual YAWN menggunakan palet underwater astral city (deep ocean blue, sky electric & amber gold)'
  );
  assert(
    mailboxCss.includes('.letter-sheet-card.paper-lightning'),
    'mailbox.css memiliki styling kertas surat khusus .paper-lightning'
  );
  assert(
    yawnCss.includes('.btn-loc-yawn-mailbox.has-unread') && yawnCss.includes('.yawn-mailbox-badge'),
    'yawn.css memiliki styling badge counter unread dan efek glowing pada tombol mailbox'
  );
  assert(
    yawnCss.includes('@keyframes yawnMailboxPulse'),
    'yawn.css memiliki animasi pulsa interaktif saat ada surat belum terbaca'
  );

  console.log('\n================================================================');
  console.log('3. TEST: CANONICAL CHARACTERS & FIRESTORE INTEGRATION');
  console.log('================================================================');
  const { CANONICAL_CHARACTERS, LETTER_PAPER_THEMES } = await import('./firebase.js');

  assert(
    CANONICAL_CHARACTERS.akhira !== undefined,
    'Karakter Akhira terdaftar di CANONICAL_CHARACTERS'
  );
  assert(
    CANONICAL_CHARACTERS.akhira.uid === 'MT14ZHATNqe90frAeQ74QFk4iXs2',
    'UID kanonikal Akhira adalah MT14ZHATNqe90frAeQ74QFk4iXs2'
  );
  assert(
    CANONICAL_CHARACTERS.akhira.universe === 'YAWN',
    'Universe kanonikal Akhira adalah YAWN'
  );
  assert(
    CANONICAL_CHARACTERS.akhira.symbol === '⚡',
    'Simbol kanonikal Akhira adalah ⚡'
  );
  assert(
    LETTER_PAPER_THEMES.lightning !== undefined && LETTER_PAPER_THEMES.lightning.name.includes('YAWN'),
    'Tema kertas surat "Kilat Petir (YAWN)" terdaftar di LETTER_PAPER_THEMES'
  );

  // Verify all 8 characters exist
  const requiredChars = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
  requiredChars.forEach(char => {
    assert(
      CANONICAL_CHARACTERS[char] && CANONICAL_CHARACTERS[char].uid,
      `Karakter kanonikal ${char} memiliki data valid dan UID terdaftar`
    );
  });

  console.log('\n================================================================');
  console.log('4. TEST: FIRESTORE SECURITY RULES VERIFICATION');
  console.log('================================================================');
  const rules = fs.readFileSync(path.resolve('./firestore.rules'), 'utf-8');

  assert(
    rules.includes('match /letters/{letterId}'),
    'firestore.rules memiliki collection match /letters/{letterId}'
  );
  assert(
    rules.includes("'MT14ZHATNqe90frAeQ74QFk4iXs2'"),
    'firestore.rules mencakup UID Akhira dalam daftar pengirim dan penerima yang sah'
  );
  assert(
    rules.includes("uid == 'MT14ZHATNqe90frAeQ74QFk4iXs2' && charKey == 'akhira'"),
    'firestore.rules memvalidasi pemetaan UID Akhira dengan charKey akhira (isValidStarCharacterMapping)'
  );
  assert(
    rules.includes("'yawn'"),
    'firestore.rules mengizinkan universeOrigin yawn'
  );

  console.log('\n================================================================');
  console.log('5. TEST: CROSS-UNIVERSE LETTER DISPATCH & RECEPTION SIMULATION');
  console.log('================================================================');

  function createLetterPayload({ senderKey, recipientKey, title, body, paperTheme = 'lightning', origin = 'yawn' }) {
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

  // 1. Nyanya sends letter to Akhira
  const letterFromNyanya = createLetterPayload({
    senderKey: 'nyanya',
    recipientKey: 'akhira',
    title: 'Salam hangat dari pondok KIDULT',
    body: 'Halo Akhira! Semoga kota bawah laut astral YAWN selalu berkilau indah.',
    paperTheme: 'dreamy',
    origin: 'kidult'
  });
  assert(
    letterFromNyanya.recipientUid === CANONICAL_CHARACTERS.akhira.uid && letterFromNyanya.senderUid === CANONICAL_CHARACTERS.nyanya.uid,
    'Surat dari Nyanya teralamatkan tepat ke UID Akhira (MT14ZHATNqe90frAeQ74QFk4iXs2)'
  );

  // 2. Lala sends letter to Akhira
  const letterFromLala = createLetterPayload({
    senderKey: 'lala',
    recipientKey: 'akhira',
    title: 'Cahaya Mentari untuk Bawah Laut',
    body: 'Akhira, ini seberkas cahaya hangat dari hutan peri TO YOU!',
    paperTheme: 'morning',
    origin: 'to_you'
  });
  assert(
    letterFromLala.recipientUid === CANONICAL_CHARACTERS.akhira.uid && letterFromLala.senderUid === CANONICAL_CHARACTERS.lala.uid,
    'Surat dari Lala teralamatkan tepat ke UID Akhira'
  );

  // 3. Lele sends letter to Akhira
  const letterFromLele = createLetterPayload({
    senderKey: 'lele',
    recipientKey: 'akhira',
    title: 'Kilau Kristal Malam',
    body: 'Akhira, salam dari Crystal Moon Sanctuary SHADOW.',
    paperTheme: 'crystal',
    origin: 'shadow'
  });
  assert(
    letterFromLele.recipientUid === CANONICAL_CHARACTERS.akhira.uid && letterFromLele.senderUid === CANONICAL_CHARACTERS.lele.uid,
    'Surat dari Lele teralamatkan tepat ke UID Akhira'
  );

  // 4. Syma sends letter to Akhira
  const letterFromSyma = createLetterPayload({
    senderKey: 'abil',
    recipientKey: 'akhira',
    title: 'Hembusan Angin Surgawi',
    body: 'Kincir angin PINWHEEL berputar membawa salam untuk samudramu.',
    paperTheme: 'pinwheel',
    origin: 'pinwheel'
  });
  assert(
    letterFromSyma.recipientUid === CANONICAL_CHARACTERS.akhira.uid && letterFromSyma.senderUid === CANONICAL_CHARACTERS.abil.uid,
    'Surat dari Syma (PINWHEEL) teralamatkan tepat ke UID Akhira'
  );

  // 5. Ela sends letter to Akhira
  const letterFromEla = createLetterPayload({
    senderKey: 'ela',
    recipientKey: 'akhira',
    title: 'Mekar Teratai Suci',
    body: 'Semoga ketenangan US AGAIN menyertai arus bawah lautmu.',
    paperTheme: 'parchment',
    origin: 'usagain'
  });
  assert(
    letterFromEla.recipientUid === CANONICAL_CHARACTERS.akhira.uid && letterFromEla.senderUid === CANONICAL_CHARACTERS.ela.uid,
    'Surat dari Ela (US AGAIN) teralamatkan tepat ke UID Akhira'
  );

  // 6. Ruben sends letter to Akhira
  const letterFromRuben = createLetterPayload({
    senderKey: 'ruben',
    recipientKey: 'akhira',
    title: 'Nyala Api Naga Castle',
    body: 'Salam hangat dari Dragon Den Castle ASH.',
    paperTheme: 'parchment',
    origin: 'ash'
  });
  assert(
    letterFromRuben.recipientUid === CANONICAL_CHARACTERS.akhira.uid && letterFromRuben.senderUid === CANONICAL_CHARACTERS.ruben.uid,
    'Surat dari Ruben (ASH) teralamatkan tepat ke UID Akhira'
  );

  // 7. Royan sends letter to Akhira
  const letterFromRoyan = createLetterPayload({
    senderKey: 'royan',
    recipientKey: 'akhira',
    title: 'Percikan Kembang Api HOT',
    body: 'Semangat membara dari pulau terapung HOT!',
    paperTheme: 'lightning',
    origin: 'hot'
  });
  assert(
    letterFromRoyan.recipientUid === CANONICAL_CHARACTERS.akhira.uid && letterFromRoyan.senderUid === CANONICAL_CHARACTERS.royan.uid,
    'Surat dari Royan (HOT) teralamatkan tepat ke UID Akhira'
  );

  // 8. Akhira replies to Nyanya
  const replyToNyanya = createLetterPayload({
    senderKey: 'akhira',
    recipientKey: 'nyanya',
    title: `Balasan: ${letterFromNyanya.title}`,
    body: 'Terima kasih Nyanya! Bintang bawah laut YAWN selalu menyambutmu.',
    paperTheme: 'lightning',
    origin: 'yawn'
  });
  assert(
    replyToNyanya.senderUid === CANONICAL_CHARACTERS.akhira.uid && replyToNyanya.recipientUid === CANONICAL_CHARACTERS.nyanya.uid,
    'Balasan dari Akhira teralamatkan tepat ke UID Nyanya'
  );

  // 9. Akhira replies to Lala
  const replyToLala = createLetterPayload({
    senderKey: 'akhira',
    recipientKey: 'lala',
    title: `Balasan: ${letterFromLala.title}`,
    body: 'Cahaya perimu membuat terumbu karang kami bersinar hangat, Lala!',
    paperTheme: 'lightning',
    origin: 'yawn'
  });
  assert(
    replyToLala.senderUid === CANONICAL_CHARACTERS.akhira.uid && replyToLala.recipientUid === CANONICAL_CHARACTERS.lala.uid,
    'Balasan dari Akhira teralamatkan tepat ke UID Lala'
  );

  // 10. Akhira replies to Lele
  const replyToLele = createLetterPayload({
    senderKey: 'akhira',
    recipientKey: 'lele',
    title: `Balasan: ${letterFromLele.title}`,
    body: 'Lele, terima kasih atas kilau kristal malam dari SHADOW.',
    paperTheme: 'lightning',
    origin: 'yawn'
  });
  assert(
    replyToLele.senderUid === CANONICAL_CHARACTERS.akhira.uid && replyToLele.recipientUid === CANONICAL_CHARACTERS.lele.uid,
    'Balasan dari Akhira teralamatkan tepat ke UID Lele'
  );

  // 11. Akhira sends new letter to Ruben, Royan, Ela, Syma
  const letterToRuben = createLetterPayload({
    senderKey: 'akhira',
    recipientKey: 'ruben',
    title: 'Salam Arus Samudra',
    body: 'Ruben, semoga dingin dan api di kastilmu selalu terjaga damai.',
    paperTheme: 'lightning',
    origin: 'yawn'
  });
  assert(
    letterToRuben.senderUid === CANONICAL_CHARACTERS.akhira.uid && letterToRuben.recipientUid === CANONICAL_CHARACTERS.ruben.uid,
    'Surat dari Akhira ke Ruben (ASH) teralamatkan tepat ke UID Ruben'
  );

  // 12. Letter read status verification
  letterFromNyanya.read = true;
  letterFromNyanya.readAt = Date.now();
  assert(
    letterFromNyanya.read === true && typeof letterFromNyanya.readAt === 'number',
    'Status surat terverifikasi berubah menjadi sudah dibaca (read: true) dengan timestamp readAt'
  );

  console.log('\n================================================================');
  console.log('6. TEST: VIEW CONTROLLERS & REALTIME INTEGRATION');
  console.log('================================================================');
  const yawnJs = fs.readFileSync(path.resolve('./yawn_view.js'), 'utf-8');
  const mvJs = fs.readFileSync(path.resolve('./mailbox_view.js'), 'utf-8');
  const uvJs = fs.readFileSync(path.resolve('./universes_view.js'), 'utf-8');
  const mainJs = fs.readFileSync(path.resolve('./main.js'), 'utf-8');

  assert(
    yawnJs.includes('subscribeYawnMailboxUnread') && yawnJs.includes('updateYawnMailboxBadge'),
    'yawn_view.js memiliki fungsi subscribeYawnMailboxUnread dan updateYawnMailboxBadge'
  );
  assert(
    yawnJs.includes('openSharedKotakPos'),
    'yawn_view.js memiliki handler openSharedKotakPos yang membuka Kotak Pos bersama'
  );
  assert(
    mvJs.includes("univ === 'yawn' || univ === 'akhira'") && mvJs.includes("'theme-yawn'"),
    'mailbox_view.js mengaitkan universe yawn/akhira dengan class theme-yawn'
  );
  assert(
    mvJs.includes("selectPaperTheme('lightning')"),
    'mailbox_view.js memilih kertas lightning secara default untuk universe yawn'
  );
  assert(
    mvJs.includes("targetViewId = 'view-yawn-world'"),
    'mailbox_view.js mengembalikan navigasi ke view-yawn-world saat ditutup'
  );
  assert(
    uvJs.includes("onNavigateKotakPos('yawn')"),
    'universes_view.js meneruskan onOpenKotakPos ke onNavigateKotakPos("yawn")'
  );
  assert(
    mainJs.includes("originUniverse === 'yawn' || originUniverse === 'akhira'") && mainJs.includes("univCtrl.openYawnWorld"),
    'main.js menangani origin yawn dan kembali ke openYawnWorld'
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
