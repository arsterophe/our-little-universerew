import fs from 'fs';

console.log('--- Verifying BEHIND THE PINWHEEL static content and CSS rules ---');

const html = fs.readFileSync('index.html', 'utf8');
const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const css = fs.readFileSync('pinwheel.css', 'utf8');
const js = fs.readFileSync('pinwheel_view.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  }
  console.log('✅ PASS:', message);
}

// 1. Button in index.html
assert(html.includes('id="btn-pinwheel-behind"'), 'index.html contains #btn-pinwheel-behind');
assert(textOnly.includes('BEHIND THE PINWHEEL'), 'index.html contains "BEHIND THE PINWHEEL" text');
assert(textOnly.includes('A little story behind the universe.'), 'index.html contains button subtitle');

// 2. Overlay & Navigation
assert(html.includes('id="pinwheel-behind-overlay"'), 'index.html contains #pinwheel-behind-overlay');
assert(html.includes('id="btn-back-pinwheel-behind"'), 'index.html contains #btn-back-pinwheel-behind');
assert(html.includes('id="btn-close-pinwheel-behind"'), 'index.html contains #btn-close-pinwheel-behind');
assert(html.includes('id="btn-behind-prev-chapter"'), 'index.html contains #btn-behind-prev-chapter');
assert(html.includes('id="btn-behind-next-chapter"'), 'index.html contains #btn-behind-next-chapter');

// 3. Chapter I
assert(textOnly.includes('Why a Kitsune?'), 'index.html contains Chapter I title');
assert(textOnly.includes('The charm behind the clever smile.'), 'index.html contains Chapter I subtitle');
assert(textOnly.includes('Ada alasan mengapa aku memilih siluman rubah untuk Syma.'), 'index.html contains Chapter I opening');
assert(textOnly.includes('Sebab, tidak semua hal tentang seseorang harus terlihat dari luar.'), 'index.html contains Chapter I ending');
assert(textOnly.includes('Kitsune / Fox Spirit'), 'index.html contains species');
assert(textOnly.includes('Male') && !textOnly.includes('Gender: Female'), 'index.html confirms Syma is Male');
assert(textOnly.includes('Charming, Clever, Cunning, Witty, Humble, Playful, Perceptive'), 'index.html contains all personality traits');

// 4. Chapter II
assert(textOnly.includes('Why PINWHEEL?'), 'index.html contains Chapter II title');
assert(textOnly.includes('A little pinwheel, carried by the wind.'), 'index.html contains Chapter II subtitle');
assert(textOnly.includes('PINWHEEL terinspirasi dari lagu Pinwheel milik SEVENTEEN'), 'index.html contains Chapter II inspiration');
assert(textOnly.includes('Karena di suatu tempat dalam masa depan, ada versi diri kita yang sedang menunggu dengan penuh harapan.'), 'index.html contains Chapter II ending');
assert(textOnly.includes('Gambaran diri yang terus bertumbuh'), 'index.html contains Pinwheel symbol');
assert(textOnly.includes('Perubahan dan perjalanan hidup'), 'index.html contains Wind symbol');
assert(textOnly.includes('Kesabaran dalam menjalani proses'), 'index.html contains Waiting symbol');
assert(textOnly.includes('Versi diri yang lebih baik di masa depan'), 'index.html contains Future Self symbol');

// 5. Chapter III
assert(textOnly.includes('To My Future Self'), 'index.html contains Chapter III title');
assert(textOnly.includes('A letter from who I am today, to who I will become.'), 'index.html contains Chapter III subtitle');
assert(textOnly.includes('Untuk diriku yang sedang berada di masa depan...'), 'index.html contains Chapter III opening');
assert(textOnly.includes('Dan ketika hari itu tiba, semoga kita tidak menyesali perjalanan panjang yang telah membawa kita sampai ke sana.'), 'index.html contains Chapter III closing paragraph');
assert(textOnly.includes('With love, from the future.'), 'index.html contains Chapter III sign-off');

// 6. Chapter IV: Epilogue — The Sound of PINWHEEL & Closing Quote
assert(html.includes('SialXSC7-og'), 'index.html contains YouTube Video ID SialXSC7-og');
assert(html.includes('https://www.youtube-nocookie.com/embed/SialXSC7-og'), 'index.html embeds YouTube nocookie iframe');
assert(!html.includes('autoplay=1'), 'index.html ensures NO autoplay on YouTube embed');
assert(textOnly.includes('The Sound of PINWHEEL'), 'index.html contains Chapter IV Title "The Sound of PINWHEEL"');
assert(textOnly.includes('SEVENTEEN'), 'index.html contains SEVENTEEN');
assert(textOnly.includes('The Meaning Behind the Song'), 'index.html contains Section "The Meaning Behind the Song"');
assert(html.includes('https://www.youtube.com/watch?v=SialXSC7-og'), 'index.html links to YouTube for official song/lyrics');
assert(textOnly.includes('Even the smallest pinwheel can keep turning in the wind.'), 'index.html contains Closing Quote');

// 7. CSS Rules
assert(css.includes('.pinwheel-btn-behind-nav'), 'pinwheel.css contains .pinwheel-btn-behind-nav');
assert(css.includes('.pinwheel-behind-overlay'), 'pinwheel.css contains .pinwheel-behind-overlay');
assert(css.includes('.pinwheel-behind-container'), 'pinwheel.css contains .pinwheel-behind-container');
assert(css.includes('rotatePinwheel'), 'pinwheel.css contains rotatePinwheel keyframes');
assert(css.includes('.behind-letter-parchment'), 'pinwheel.css contains .behind-letter-parchment');
assert(css.includes('.letter-wax-seal'), 'pinwheel.css contains .letter-wax-seal');
assert(css.includes('.sound-pinwheel-player-card'), 'pinwheel.css contains .sound-pinwheel-player-card');
assert(css.includes('.song-meaning-card'), 'pinwheel.css contains .song-meaning-card');

// 8. JS Controller
assert(js.includes('switchBehindChapter'), 'pinwheel_view.js has switchBehindChapter');
assert(js.includes('openBehindPinwheel'), 'pinwheel_view.js has openBehindPinwheel');
assert(js.includes('closeBehindPinwheel'), 'pinwheel_view.js has closeBehindPinwheel');
assert(js.includes('stopBehindPinwheelVideo'), 'pinwheel_view.js has stopBehindPinwheelVideo');
assert(js.includes('pauseBehindPinwheelVideo'), 'pinwheel_view.js has pauseBehindPinwheelVideo');
assert(js.includes('btn-pinwheel-behind'), 'pinwheel_view.js binds btn-pinwheel-behind');

console.log('\n🎉 ALL STATIC ASSERTIONS PASSED SUCCESSFULLY!');
