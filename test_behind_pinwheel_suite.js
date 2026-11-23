import fs from 'fs';

console.log('🎐 STARTING BEHIND THE PINWHEEL (SYMA) TEST SUITE 🎐\n');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${message}`);
  } else {
    console.error(`❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Files existence check
const requiredFiles = [
  'pinwheel_behind.css',
  'pinwheel_behind_view.js',
  'public/assets/pinwheel_world_bg.jpg',
  'public/assets/card_abil_hd.jpg',
  'public/assets/portrait_abil_hd.jpg',
  'public/assets/avatar_abil_hd.jpg'
];

for (const f of requiredFiles) {
  assert(fs.existsSync(f), `Required file exists: ${f}`);
}

const html = fs.readFileSync('index.html', 'utf8');
const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const css = fs.readFileSync('pinwheel_behind.css', 'utf8');
const js = fs.readFileSync('pinwheel_behind_view.js', 'utf8');
const pinwheelViewJs = fs.readFileSync('pinwheel_view.js', 'utf8');
const universesViewJs = fs.readFileSync('universes_view.js', 'utf8');

// 2. CSS Linked in index.html <head>
assert(html.includes('<link rel="stylesheet" href="/pinwheel_behind.css">'), 'pinwheel_behind.css linked in index.html <head>');

// 3. Header button in index.html
assert(html.includes('id="btn-pinwheel-behind"'), '#btn-pinwheel-behind pill button placed in Syma\'s universe header');
assert(textOnly.includes('BEHIND THE PINWHEEL'), 'Header contains "BEHIND THE PINWHEEL" title text');
assert(textOnly.includes('A Future Self Is Waiting for You'), 'Header contains "A Future Self Is Waiting for You" subtitle text');

// 4. Overlay root and header
assert(html.includes('id="pinwheel-behind-overlay"'), 'Overlay root #pinwheel-behind-overlay exists');
assert(html.includes('id="btn-back-pinwheel-behind"'), 'Back button #btn-back-pinwheel-behind exists');
assert(html.includes('id="btn-close-pinwheel-behind"'), 'Close button #btn-close-pinwheel-behind exists');
assert(html.includes('id="pinwheel-behind-progress-bar"'), 'Progress bar #pinwheel-behind-progress-bar exists');

// 5. Opening Scene Hero Card
assert(html.includes('id="pinwheel-behind-intro"'), 'Opening Scene #pinwheel-behind-intro exists');
assert(html.includes('id="btn-pinwheel-begin-journey"'), 'Opening button #btn-pinwheel-begin-journey exists');
assert(textOnly.includes('Begin the Journey'), 'Opening button text says "Begin the Journey"');

// 6. Five Chapter Panels & Tabs
assert(html.includes('id="pinwheel-behind-chapter-1"'), 'Chapter 1 panel exists');
assert(html.includes('id="pinwheel-behind-chapter-2"'), 'Chapter 2 panel exists');
assert(html.includes('id="pinwheel-behind-chapter-3"'), 'Chapter 3 panel exists');
assert(html.includes('id="pinwheel-behind-chapter-4"'), 'Chapter 4 panel exists');
assert(html.includes('id="pinwheel-behind-chapter-5"'), 'Chapter 5 panel exists');

// 7. Chapter I: The Kitsune
assert(textOnly.includes('The Kitsune'), 'Chapter I contains title "The Kitsune"');
assert(textOnly.includes('Some Charms Are Impossible to Ignore'), 'Chapter I contains subtitle "Some Charms Are Impossible to Ignore"');
assert(textOnly.includes('seorang Kitsune'), 'Chapter I explains Kitsune persona');
assert(textOnly.includes('Kitsune · Nine Tailed Fox'), 'Chapter I profile badge contains Kitsune badge');

// 8. Chapter II: Why PINWHEEL?
assert(textOnly.includes('Why PINWHEEL?'), 'Chapter II contains title "Why PINWHEEL?"');
assert(textOnly.includes('Somewhere in the Future, Someone Is Waiting for You'), 'Chapter II contains subtitle');
assert(textOnly.includes('SEVENTEEN'), 'Chapter II mentions inspiration from SEVENTEEN');
assert(textOnly.includes('Jangan menyerah hanya karena sekarang kamu belum sampai di tempat yang kamu inginkan'), 'Chapter II contains core encouragement quote');

// 9. Chapter III: The Self You\'re Becoming
assert(textOnly.includes('The Self You\'re Becoming'), 'Chapter III contains title');
assert(textOnly.includes('You Don\'t Have to Be Perfect to Keep Moving'), 'Chapter III contains subtitle');
assert(textOnly.includes('tidak semua keberanian terlihat seperti kemenangan'), 'Chapter III contains courage quote');
assert(textOnly.includes('Bukan karena kamu tidak pernah gagal, tetapi karena kamu tidak pernah berhenti mencoba'), 'Chapter III contains pride in effort quote');

// 10. Chapter IV: A Letter from Lele (Complete Verbatim Text)
assert(textOnly.includes('A Letter from Lele'), 'Chapter IV contains title "A Letter from Lele"');
assert(textOnly.includes('Even If It Takes You a Long Time, I\'ll Still Be Here'), 'Chapter IV contains subtitle');
assert(textOnly.includes('Untuk Syma,'), 'Letter contains salutation "Untuk Syma,"');
assert(textOnly.includes('Lucu juga, ya. Dari sekian banyak hal yang bisa aku lakukan, aku justru memilih menuliskan surat sepanjang ini untukmu'), 'Letter contains opening paragraph');
assert(textOnly.includes('Aku menyukai gagasan bahwa seseorang bisa menjadi begitu berharga hanya dengan menjadi dirinya sendiri'), 'Letter contains self-worth callout');
assert(textOnly.includes('Kamu selalu boleh kembali kepada dirimu sendiri'), 'Letter contains sanctuary callout');
assert(textOnly.includes('Aku ingin kamu sampai ke masa depan tanpa harus kehilangan dirimu sendiri di sepanjang perjalanan'), 'Letter contains journey callout');
assert(textOnly.includes('Jangan pernah merasa bahwa kamu harus menjadi luar biasa dulu agar seseorang punya alasan untuk tetap menghargaimu'), 'Letter contains appreciation callout');
assert(textOnly.includes('Aku bangga kepadamu, Syma. Bukan hanya karena seseorang yang mungkin akan kamu jadi nanti, tetapi juga karena seseorang yang sedang kamu perjuangkan untuk menjadi hari ini'), 'Letter contains pride callout');
assert(textOnly.includes('Somewhere, beyond the wind, there is still a little pinwheel turning. And somewhere in the future, there is a version of you who is grateful that you never stopped'), 'Letter contains ending quote');
assert(html.includes('id="btn-pinwheel-letter-replay"'), 'Letter has Read Again button #btn-pinwheel-letter-replay');
assert(html.includes('id="btn-pinwheel-letter-keep"'), 'Letter has Keep This Letter button #btn-pinwheel-letter-keep');
assert(html.includes('id="btn-pinwheel-letter-return"'), 'Letter has Return to PINWHEEL button #btn-pinwheel-letter-return');

// 11. Chapter V: Epilogue: PINWHEEL & Soundtrack Integration
assert(textOnly.includes('Keep becoming. I\'ll see you in the future'), 'Chapter V contains closing climax quote');
assert(html.includes('SialXSC7-og'), 'YouTube Video ID SialXSC7-og is embedded');
assert(!html.includes('SialXSC7-og?autoplay=1'), 'Strictly NO autoplay on YouTube embed');
assert(html.includes('id="btn-pinwheel-song-toggle"'), 'Soundtrack has play/pause toggle button #btn-pinwheel-song-toggle');
assert(html.includes('id="pinwheel-song-disc"'), 'Soundtrack has spinning disc #pinwheel-song-disc');

// 12. Footer Controls
assert(html.includes('id="btn-pinwheel-behind-prev"'), 'Footer has Prev button #btn-pinwheel-behind-prev');
assert(html.includes('id="btn-pinwheel-behind-next"'), 'Footer has Next button #btn-pinwheel-behind-next');
assert(html.includes('class="pinwheel-indicator-dot active" data-chapter="1"'), 'Footer has 5 chapter indicator dots');

// 13. JS Controller Integration & Storage
assert(js.includes('export function initPinwheelBehindView'), 'pinwheel_behind_view.js exports initPinwheelBehindView');
assert(js.includes('export function openBehindPinwheel'), 'pinwheel_behind_view.js exports openBehindPinwheel');
assert(js.includes('export function closeBehindPinwheel'), 'pinwheel_behind_view.js exports closeBehindPinwheel');
assert(js.includes('export function keepLetter'), 'pinwheel_behind_view.js exports keepLetter');
assert(js.includes('localStorage.setItem(\'olu_saved_letter_pinwheel\''), 'keepLetter saves to localStorage olu_saved_letter_pinwheel');
assert(pinwheelViewJs.includes('initPinwheelBehindView'), 'pinwheel_view.js imports initPinwheelBehindView');
assert(pinwheelViewJs.includes('pinwheelBehindController'), 'pinwheel_view.js exports pinwheelBehindController');
assert(universesViewJs.includes('openBehindPinwheel'), 'universes_view.js forwards openBehindPinwheel');

// 14. CSS Rules verification
assert(css.includes('.pinwheel-behind-overlay'), 'pinwheel_behind.css defines .pinwheel-behind-overlay');
assert(css.includes('.pinwheel-behind-particles'), 'pinwheel_behind.css defines .pinwheel-behind-particles');
assert(css.includes('.pinwheel-manuscript-parchment'), 'pinwheel_behind.css defines .pinwheel-manuscript-parchment');
assert(css.includes('.pinwheel-wax-seal'), 'pinwheel_behind.css defines .pinwheel-wax-seal');
assert(css.includes('.pinwheel-song-disc'), 'pinwheel_behind.css defines .pinwheel-song-disc');
assert(css.includes('.pinwheel-behind-pill'), 'pinwheel_behind.css defines .pinwheel-behind-pill');

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
console.log(`========================================\n`);

if (passed === total) {
  console.log('🎉 ALL BEHIND THE PINWHEEL ASSERTIONS PASSED! 🎉');
} else {
  process.exit(1);
}
