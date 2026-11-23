import fs from 'fs';

console.log('--- Verifying BEHIND THE FAIRY static content, CSS rules, and JS controller ---');

const html = fs.readFileSync('index.html', 'utf8');
const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const css = fs.readFileSync('toyou_behind.css', 'utf8');
const js = fs.readFileSync('toyou_behind_view.js', 'utf8');
const univJs = fs.readFileSync('universes_view.js', 'utf8');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  }
  console.log('✅ PASS:', message);
  passed++;
}

// 1. Button in index.html (TO YOU HUD Top-Right)
assert(html.includes('id="btn-toyou-behind"'), 'index.html contains #btn-toyou-behind');
assert(textOnly.includes('BEHIND THE FAIRY'), 'index.html contains "BEHIND THE FAIRY" text');
assert(textOnly.includes('The girl who carries sunshine wherever she goes.'), 'index.html contains button subtitle "The girl who carries sunshine wherever she goes."');

// 2. Overlay & Navigation Elements
assert(html.includes('id="fairy-behind-overlay"'), 'index.html contains #fairy-behind-overlay');
assert(html.includes('id="btn-back-fairy-behind"'), 'index.html contains #btn-back-fairy-behind');
assert(html.includes('id="btn-close-fairy-behind"'), 'index.html contains #btn-close-fairy-behind');
assert(html.includes('id="btn-fairy-behind-prev"'), 'index.html contains #btn-fairy-behind-prev');
assert(html.includes('id="btn-fairy-behind-next"'), 'index.html contains #btn-fairy-behind-next');

// 3. Tab Buttons & Chapter Panels
for (let ch = 1; ch <= 4; ch++) {
  assert(html.includes(`data-chapter="${ch}"`), `index.html contains tab button for chapter ${ch}`);
  assert(html.includes(`id="fairy-behind-chapter-${ch}"`), `index.html contains chapter panel #fairy-behind-chapter-${ch}`);
}

// 4. Chapter I Content Verification
assert(textOnly.includes('Why a Fairy?'), 'Chapter 1 title "Why a Fairy?" present');
assert(textOnly.includes('Lala adalah seseorang yang sangat peduli kepada orang lain'), 'Chapter 1 contains core narrative about Lala caring deeply for others');
assert(textOnly.includes('sosok yang selalu menjadi matahari bagi orang lain juga berhak mendapatkan pelukan hangat'), 'Chapter 1 mentions that the one who is always sunshine also deserves warmth');
assert(html.includes('/assets/avatar_lala_hd.png'), 'Chapter 1 contains Lala HD portrait');

// 5. Chapter II Content Verification
assert(textOnly.includes('Why TO YOU?'), 'Chapter 2 title "Why TO YOU?" present');
assert(textOnly.includes('SEVENTEEN'), 'Chapter 2 mentions SEVENTEEN');
assert(textOnly.includes('Semua kehangatan yang selama ini kamu berikan kepada orang lain, semoga suatu hari kembali kepadamu'), 'Chapter 2 contains core dedication quote');
assert(textOnly.includes('Empat Pilar Jiwa TO YOU'), 'Chapter 2 contains Four Pillars of TO YOU');

// 6. Chapter III Content Verification (Parchment Letter)
assert(html.includes('class="behind-fairy-parchment"'), 'Chapter 3 has .behind-fairy-parchment class');
assert(textOnly.includes('A Letter to My Sunshine'), 'Chapter 3 title "A Letter to My Sunshine" present');
assert(textOnly.includes('Untuk Sahabatku, Matahariku yang Selalu Bersinar'), 'Chapter 3 salutation present');
assert(textOnly.includes('Kamu tidak harus selalu ceria demi menyenangkan orang-orang di sekitarmu'), 'Chapter 3 contains message that Lala does not have to always be cheerful');
assert(textOnly.includes('Author of Our Little Universe (Lele) · Dedicated to Lala'), 'Chapter 3 sign-off contains Lele dedicated to Lala');

// 7. Epilogue & YouTube Video Integration
assert(html.includes('id="fairy-youtube-iframe"'), 'Epilogue contains #fairy-youtube-iframe');
assert(html.includes('g9JL4YrBqng'), 'Epilogue embeds YouTube Video ID g9JL4YrBqng');
assert(html.includes('enablejsapi=1'), 'YouTube iframe includes enablejsapi=1 for API control');
assert(!html.includes('autoplay=1'), 'Strict constraint: NO autoplay enabled in iframe src');
assert(textOnly.includes('The Heartbeat Behind TO YOU'), 'Epilogue contains original meaning explanation');
assert(textOnly.includes('Di antara jutaan badai di dunia ini, kehangatan sederhanamu adalah alasan seseorang mampu melangkah lagi'), 'Epilogue contains closing quote');

// 8. CSS Verification
assert(css.includes('.toyou-behind-overlay'), 'CSS contains .toyou-behind-overlay');
assert(css.includes('.toyou-behind-container'), 'CSS contains .toyou-behind-container');
assert(css.includes('.fairy-behind-tab-btn'), 'CSS contains .fairy-behind-tab-btn');
assert(css.includes('.behind-fairy-parchment'), 'CSS contains .behind-fairy-parchment');
assert(css.includes('.fairy-youtube-box'), 'CSS contains .fairy-youtube-box');
assert(css.includes('.toyou-behind-pill'), 'CSS contains .toyou-behind-pill');

// 9. JS Controller Verification
assert(js.includes('export function openBehindFairy'), 'JS exports openBehindFairy');
assert(js.includes('export function closeBehindFairy'), 'JS exports closeBehindFairy');
assert(js.includes('export function switchBehindFairyChapter'), 'JS exports switchBehindFairyChapter');
assert(js.includes('export function pauseBehindFairyVideo'), 'JS exports pauseBehindFairyVideo');
assert(js.includes('export function stopBehindFairyVideo'), 'JS exports stopBehindFairyVideo');
assert(js.includes('export function initToYouBehindView'), 'JS exports initToYouBehindView');
assert(js.includes('fairy-youtube-iframe'), 'JS targets #fairy-youtube-iframe for video control');

// 10. Universes View Integration Verification
assert(univJs.includes('initToYouBehindView'), 'universes_view.js imports initToYouBehindView');
assert(univJs.includes('toyouBehindCtrl'), 'universes_view.js initializes toyouBehindCtrl');
assert(univJs.includes('toyouBehindController: toyouBehindCtrl'), 'universes_view.js exports toyouBehindController in return object');
assert(univJs.includes('openBehindFairy: () => toyouBehindCtrl?.openBehindFairy()'), 'universes_view.js exports openBehindFairy');
assert(univJs.includes('closeBehindFairy: () => toyouBehindCtrl?.closeBehindFairy()'), 'universes_view.js exports closeBehindFairy');

console.log('================================================================');
console.log(`🎉 ALL ${passed}/${total} ASSERTIONS PASSED! BEHIND THE FAIRY IS READY.`);
console.log('================================================================');
