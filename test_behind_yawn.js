import fs from 'fs';

console.log('--- Verifying BEHIND THE YAWN static content, CSS rules, and JS controller ---');

const html = fs.readFileSync('index.html', 'utf8');
const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const css = fs.readFileSync('yawn_behind.css', 'utf8');
const js = fs.readFileSync('yawn_behind_view.js', 'utf8');
const yawnJs = fs.readFileSync('yawn_view.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  }
  console.log('✅ PASS:', message);
}

// Decode common html entities in textOnly
const decodedTextOnly = textOnly.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// 1. Button in index.html (YAWN Top Header)
assert(html.includes('id="btn-yawn-behind"'), 'index.html contains #btn-yawn-behind');
assert(decodedTextOnly.includes('BEHIND THE YAWN'), 'index.html contains "BEHIND THE YAWN" text');
assert(decodedTextOnly.includes('The mermaid who loved beyond the ocean.'), 'index.html contains button subtitle "The mermaid who loved beyond the ocean."');

// 2. Overlay & Navigation Elements
assert(html.includes('id="yawn-behind-overlay"'), 'index.html contains #yawn-behind-overlay');
assert(html.includes('id="btn-back-yawn-behind"'), 'index.html contains #btn-back-yawn-behind');
assert(html.includes('id="btn-close-yawn-behind"'), 'index.html contains #btn-close-yawn-behind');
assert(html.includes('id="btn-yawn-behind-prev"'), 'index.html contains #btn-yawn-behind-prev');
assert(html.includes('id="btn-yawn-behind-next"'), 'index.html contains #btn-yawn-behind-next');
assert(html.includes('id="yawn-behind-progress-bar"'), 'index.html contains reading progress bar #yawn-behind-progress-bar');
assert(textOnly.includes('Kembali ke YAWN'), 'index.html back button text specifies "Kembali ke YAWN"');

// 3. 5 Chapters Navigation Tabs
assert(html.includes('data-chapter="1"'), 'index.html contains Chapter 1 tab');
assert(html.includes('data-chapter="2"'), 'index.html contains Chapter 2 tab');
assert(html.includes('data-chapter="3"'), 'index.html contains Chapter 3 tab');
assert(html.includes('data-chapter="4"'), 'index.html contains Chapter 4 tab');
assert(html.includes('data-chapter="5"'), 'index.html contains Chapter 5 tab');

// 4. Chapter I: THE MERMAID
assert(textOnly.includes('THE MERMAID'), 'index.html contains Chapter I title');
assert(textOnly.includes('A Heart That Loved Beyond the Ocean.'), 'index.html contains Chapter I subtitle');
assert(textOnly.includes('Ada alasan yang begitu mendalam mengapa aku, sebagai author, memilih wujud seorang putri duyung'), 'index.html contains Chapter I author narrative');
assert(textOnly.includes('Cinta yang Melampaui Samudra'), 'index.html contains Chapter I feature card 1');
assert(textOnly.includes('Hak untuk Menjaga Diri Sendiri'), 'index.html contains Chapter I feature card 2');

// 5. Chapter II: WHY YAWN?
assert(textOnly.includes('WHY YAWN?'), 'index.html contains Chapter II title');
assert(textOnly.includes('Behind the Smile, There Is a Story.'), 'index.html contains Chapter II subtitle');
assert(textOnly.includes('Banyak yang mungkin bertanya mengapa aku memilih kata YAWN sebagai nama dari universe Akhira'), 'index.html contains Chapter II origin story');
assert(textOnly.includes('Senyuman di Depan Dunia'), 'index.html contains Chapter II card 1');
assert(textOnly.includes('Kelelahan yang Disimpan Rapi'), 'index.html contains Chapter II card 2');
assert(textOnly.includes('YAWN adalah pelukan hangat bagi kelelahan yang tak pernah kau ceritakan'), 'index.html contains Chapter II philosophy quote');

// 6. Chapter III: THE PAIN YOU NEVER TOLD
assert(textOnly.includes('THE PAIN YOU NEVER TOLD'), 'index.html contains Chapter III title');
assert(textOnly.includes('Some Feelings Are Difficult to Put Into Words.'), 'index.html contains Chapter III subtitle');
assert(textOnly.includes('Ada bagian dari samudra yang begitu dalam hingga sinar matahari pun tak mampu menembusnya'), 'index.html contains Chapter III opening');
assert(textOnly.includes('Hening yang Bermakna'), 'index.html contains Chapter III card 1');
assert(textOnly.includes('Keputusan Terbaik pada Masanya'), 'index.html contains Chapter III card 2');
assert(textOnly.includes('Jangan pernah menghukum dirimu atas keputusan masa lalu'), 'index.html contains Chapter III validation quote');

// 7. Chapter IV: A LETTER FROM LELE
assert(textOnly.includes('A LETTER FROM LELE'), 'index.html contains Chapter IV title');
assert(textOnly.includes('To the Mermaid Who Deserves to Be Loved, Too.'), 'index.html contains Chapter IV subtitle');
assert(html.includes('class="yawn-pearl-parchment"'), 'index.html contains pearl parchment container');
assert(textOnly.includes('LELE 🌙 ~ AUTHOR SEAL'), 'index.html contains author seal');
assert(textOnly.includes('Untuk Akhira,'), 'index.html contains letter salutation');
assert(textOnly.includes('Jangan membenci dirimu sendiri hanya karena kamu pernah mencintai seseorang begitu dalam.'), 'index.html contains letter core sentence');
assert(textOnly.includes('Jangan membenci keputusan yang pernah kamu ambil.'), 'index.html contains letter decision validation');
assert(textOnly.includes('Aku tidak ingin kamu terus menyalahkan dirimu atas sesuatu yang sudah terjadi.'), 'index.html contains letter highlight paragraph');
assert(textOnly.includes('Kamu juga pantas mendapatkan ketenangan, pengertian, dan kasih sayang'), 'index.html contains letter conclusion');
assert(textOnly.includes('Lele — Your Author.'), 'index.html contains letter signature');
assert(html.includes('id="btn-yawn-letter-replay"'), 'index.html contains Read Again button #btn-yawn-letter-replay');

// 8. Chapter V: EPILOGUE & YAWN SONG
assert(textOnly.includes('EPILOGUE: YAWN'), 'index.html contains Chapter V title');
assert(textOnly.includes('Even the Sea Foam Deserves to Shine.'), 'index.html contains Chapter V subtitle');
assert(html.includes('0TQmr3Kq51I'), 'index.html contains official YouTube video ID 0TQmr3Kq51I');
assert(!html.includes('0TQmr3Kq51I?autoplay=1'), 'index.html guarantees NO autoplay on embed');
assert(html.includes('id="btn-yawn-song-toggle"'), 'index.html contains custom song play/pause button');
assert(decodedTextOnly.includes('Makna & Inspirasi Lagu YAWN:'), 'index.html contains song interpretation section');
assert(textOnly.includes('Bahkan Buih Laut Pun Berhak untuk Bersinar.'), 'index.html contains Epilogue climax quote');

// 9. CSS Rules in yawn_behind.css
assert(css.includes('.yawn-behind-overlay'), 'yawn_behind.css defines .yawn-behind-overlay');
assert(css.includes('.yawn-behind-caustics'), 'yawn_behind.css defines caustics light rays');
assert(css.includes('.yawn-behind-bubble'), 'yawn_behind.css defines floating water bubbles');
assert(css.includes('.yawn-pearl-parchment'), 'yawn_behind.css defines pearl parchment letter styling');
assert(css.includes('.btn-yawn-letter-replay'), 'yawn_behind.css defines replay letter button');
assert(css.includes('.yawn-music-player-container'), 'yawn_behind.css defines music player container');
assert(css.includes('.yawn-youtube-wrapper'), 'yawn_behind.css defines responsive YouTube wrapper');
assert(css.includes('.yawn-behind-pill'), 'yawn_behind.css defines universe HUD button');
assert(css.includes('@media (max-width: 768px)'), 'yawn_behind.css defines responsive mobile rules');

// 10. JS Controller in yawn_behind_view.js & yawn_view.js
assert(js.includes('export function initYawnBehindView'), 'yawn_behind_view.js exports initYawnBehindView');
assert(js.includes('export function openBehindYawn'), 'yawn_behind_view.js exports openBehindYawn');
assert(js.includes('export function closeBehindYawn'), 'yawn_behind_view.js exports closeBehindYawn');
assert(js.includes('export function switchYawnBehindChapter'), 'yawn_behind_view.js exports switchYawnBehindChapter');
assert(js.includes('export function pauseYawnBehindVideo'), 'yawn_behind_view.js exports pauseYawnBehindVideo');
assert(js.includes('export function stopYawnBehindVideo'), 'yawn_behind_view.js exports stopYawnBehindVideo');
assert(js.includes('replayLetterAnimation'), 'yawn_behind_view.js contains replayLetterAnimation');
assert(yawnJs.includes('initYawnBehindView'), 'yawn_view.js imports and invokes initYawnBehindView');
assert(yawnJs.includes('closeBehindYawn'), 'yawn_view.js calls closeBehindYawn on exit');

console.log('\n🎉 ALL 48 BEHIND THE YAWN VERIFICATION CHECKS PASSED (100%)!');
