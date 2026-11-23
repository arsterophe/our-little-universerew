import fs from 'fs';

console.log('--- Verifying BEHIND THE WITCH (REWORK) static content, CSS rules, and JS controller ---');

const html = fs.readFileSync('index.html', 'utf8');
const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const decodedTextOnly = textOnly.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const css = fs.readFileSync('kidult_behind.css', 'utf8');
const js = fs.readFileSync('kidult_behind_view.js', 'utf8');
const univJs = fs.readFileSync('universes_view.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  }
  console.log('✅ PASS:', message);
}

// 1. Button in index.html (KIDULT HUD Top-Right)
assert(html.includes('id="btn-kidult-behind"'), 'index.html contains #btn-kidult-behind');
assert(decodedTextOnly.includes('BEHIND THE WITCH'), 'index.html contains "BEHIND THE WITCH" text');
assert(decodedTextOnly.includes('The story behind the girl who learned to stand alone.'), 'index.html contains button subtitle "The story behind the girl who learned to stand alone."');

// 2. Overlay & Navigation Elements
assert(html.includes('id="witch-behind-overlay"'), 'index.html contains #witch-behind-overlay');
assert(html.includes('id="btn-back-witch-behind"'), 'index.html contains #btn-back-witch-behind');
assert(html.includes('id="btn-close-witch-behind"'), 'index.html contains #btn-close-witch-behind');
assert(html.includes('id="btn-witch-behind-prev"'), 'index.html contains #btn-witch-behind-prev');
assert(html.includes('id="btn-witch-behind-next"'), 'index.html contains #btn-witch-behind-next');
assert(decodedTextOnly.includes('Kembali ke KIDULT'), 'index.html back button text specifies "Kembali ke KIDULT"');

// 3. 5-Chapter Navigation Tabs & Progress Bar
assert(html.includes('class="witch-behind-progress-bar" id="witch-behind-progress-bar"'), 'index.html contains #witch-behind-progress-bar');
assert(html.includes('data-chapter="1"') && decodedTextOnly.includes('The Witch'), 'index.html contains Chapter 1 tab');
assert(html.includes('data-chapter="2"') && decodedTextOnly.includes('Why KIDULT?'), 'index.html contains Chapter 2 tab');
assert(html.includes('data-chapter="3"') && decodedTextOnly.includes('The Little Girl'), 'index.html contains Chapter 3 tab');
assert(html.includes('data-chapter="4"') && decodedTextOnly.includes('A Letter From Lele'), 'index.html contains Chapter 4 tab');
assert(html.includes('data-chapter="5"') && decodedTextOnly.includes('Epilogue: KIDULT'), 'index.html contains Chapter 5 tab');

// 4. Chapter I: THE WITCH
assert(decodedTextOnly.includes('THE WITCH'), 'index.html contains Chapter I title');
assert(decodedTextOnly.includes('Not Every Witch Is Made to Be Feared.'), 'index.html contains Chapter I subtitle');
assert(decodedTextOnly.includes('Ada sebuah alasan mengapa sejak awal aku selalu menggambarkan Nyanya sebagai seorang penyihir.'), 'index.html contains Chapter I opening');
assert(decodedTextOnly.includes('cenderung memilih menyendiri ketika menghadapi masalah'), 'index.html contains Chapter I withdrawal habit');
assert(decodedTextOnly.includes('Ruang untuk Bersembunyi dan Berpikir'), 'index.html contains Chapter I feature card 1');
assert(decodedTextOnly.includes('Di Balik Kemandirian yang Sunyi'), 'index.html contains Chapter I feature card 2');
assert(decodedTextOnly.includes('mengapa universenya justru diberi nama KIDULT?'), 'index.html contains Chapter I bridge question');

// 5. Chapter II: WHY KIDULT?
assert(decodedTextOnly.includes('WHY KIDULT?'), 'index.html contains Chapter II title');
assert(decodedTextOnly.includes('Growing Up Doesn\'t Mean Growing Out of Yourself.'), 'index.html contains Chapter II subtitle');
assert(decodedTextOnly.includes('Banyak orang memandang Nyanya sebagai seseorang yang sudah benar-benar dewasa.'), 'index.html contains Chapter II opening');
assert(decodedTextOnly.includes('Bagian Kecil yang Ingin Disayang'), 'index.html contains Chapter II card 1');
assert(decodedTextOnly.includes('Kekuatan yang Tidak Harus Dipaksakan'), 'index.html contains Chapter II card 2');
assert(decodedTextOnly.includes('KIDULT bukanlah tentang menolak menjadi dewasa.'), 'index.html contains Chapter II philosophy quote');

// 6. Chapter III: THE LITTLE GIRL YOU LEFT BEHIND
assert(decodedTextOnly.includes('THE LITTLE GIRL YOU LEFT BEHIND'), 'index.html contains Chapter III title');
assert(decodedTextOnly.includes('You Deserve the Same Care You Give to Everyone Else.'), 'index.html contains Chapter III subtitle');
assert(decodedTextOnly.includes('Ada bagian dari perjalanan Nyanya yang jarang sekali terlihat oleh mata orang lain.'), 'index.html contains Chapter III opening');
assert(decodedTextOnly.includes('Izin untuk Merasa Lelah dan Kecewa'), 'index.html contains Chapter III card 1');
assert(decodedTextOnly.includes('Bukan Salahmu Memilih Menyendiri'), 'index.html contains Chapter III card 2');
assert(decodedTextOnly.includes('Kamu pantas mendapatkan perhatian, pelukan hangat, dan kasih sayang yang sama tulusnya'), 'index.html contains Chapter III reflection quote');

// 7. Chapter IV: A LETTER FROM LELE
assert(decodedTextOnly.includes('A LETTER FROM LELE'), 'index.html contains Chapter IV title');
assert(decodedTextOnly.includes('To the Little Girl Who Grew Up Too Soon.'), 'index.html contains Chapter IV subtitle');
assert(html.includes('class="behind-witch-parchment"'), 'index.html contains vintage grimoire parchment');
assert(decodedTextOnly.includes('LELE 🌙 ~ AUTHOR SEAL'), 'index.html contains author seal');
assert(decodedTextOnly.includes('Untuk Nyanya,'), 'index.html contains letter salutation');
assert(decodedTextOnly.includes('Aku tahu kamu selalu berusaha menjadi kuat.'), 'index.html contains letter core sentence');
assert(decodedTextOnly.includes('Kamu tidak harus selalu menjadi orang yang paling mengerti.'), 'index.html contains letter decision validation');
assert(decodedTextOnly.includes('Menjadi dewasa bukan berarti kamu harus meninggalkan anak kecil yang dulu pernah menjadi bagian dari dirimu.'), 'index.html contains letter highlight paragraph');
assert(decodedTextOnly.includes('Kamu tidak kekanak-kanakan hanya karena masih ingin diperhatikan.'), 'index.html contains letter comforting validation');
assert(decodedTextOnly.includes('Lele — Your Author.'), 'index.html contains letter signature');
assert(html.includes('id="btn-witch-letter-replay"'), 'index.html contains Read Again button #btn-witch-letter-replay');

// 8. Chapter V: EPILOGUE: KIDULT & SOUNDTRACK
assert(decodedTextOnly.includes('EPILOGUE: KIDULT'), 'index.html contains Chapter V title');
assert(decodedTextOnly.includes('You Can Grow Up Without Leaving Yourself Behind.'), 'index.html contains Chapter V subtitle');
assert(html.includes('T463pgGnNVc'), 'index.html contains YouTube Video ID T463pgGnNVc');
assert(!html.includes('T463pgGnNVc?autoplay=1'), 'index.html guarantees NO autoplay on embed');
assert(html.includes('id="btn-witch-song-toggle"'), 'index.html contains custom song play/pause button');
assert(decodedTextOnly.includes('Makna & Inspirasi Lagu KIDULT'), 'index.html contains song interpretation section');
assert(decodedTextOnly.includes('Ajak Dia Tumbuh Bersamamu.'), 'index.html contains Epilogue climax heading');
assert(decodedTextOnly.includes('Suatu hari nanti, ketika kamu melihat kembali dirimu yang sekarang, aku harap kamu tidak hanya mengingat seberapa kuat kamu bertahan.'), 'index.html contains Epilogue opening climax');
assert(decodedTextOnly.includes('Jangan tinggalkan anak kecil itu lagi. Ajak dia tumbuh bersamamu. Karena menjadi dewasa tidak seharusnya membuatmu kehilangan dirimu sendiri.'), 'index.html contains Epilogue closing climax');

// 9. CSS Rules in kidult_behind.css
assert(css.includes('.kidult-behind-overlay'), 'kidult_behind.css defines .kidult-behind-overlay');
assert(css.includes('.witch-behind-progress-track'), 'kidult_behind.css defines progress track');
assert(css.includes('.witch-behind-progress-bar'), 'kidult_behind.css defines progress bar');
assert(css.includes('.behind-witch-parchment'), 'kidult_behind.css defines vintage parchment styling');
assert(css.includes('.btn-witch-letter-replay'), 'kidult_behind.css defines replay letter button');
assert(css.includes('.witch-song-player-card'), 'kidult_behind.css defines music player container');
assert(css.includes('.btn-witch-song-toggle'), 'kidult_behind.css defines song toggle button');
assert(css.includes('.witch-song-disc'), 'kidult_behind.css defines song disc');
assert(css.includes('.witch-epilogue-climax'), 'kidult_behind.css defines epilogue climax quote box');
assert(css.includes('.kidult-behind-pill'), 'kidult_behind.css defines universe HUD button');

// 10. JS Controller in kidult_behind_view.js
assert(js.includes('export function switchBehindWitchChapter'), 'kidult_behind_view.js exports switchBehindWitchChapter');
assert(js.includes('export function openBehindWitch'), 'kidult_behind_view.js exports openBehindWitch');
assert(js.includes('export function closeBehindWitch'), 'kidult_behind_view.js exports closeBehindWitch');
assert(js.includes('export function pauseBehindWitchVideo'), 'kidult_behind_view.js exports pauseBehindWitchVideo');
assert(js.includes('export function stopBehindWitchVideo'), 'kidult_behind_view.js exports stopBehindWitchVideo');
assert(js.includes('export function playBehindWitchVideo'), 'kidult_behind_view.js exports playBehindWitchVideo');
assert(js.includes('export function replayLetterAnimation'), 'kidult_behind_view.js exports replayLetterAnimation');
assert(js.includes('window.kidultBehindController = controller;'), 'kidult_behind_view.js exposes window.kidultBehindController');

// 11. Universes View Integration
assert(univJs.includes('initKidultBehindView'), 'universes_view.js imports and initializes initKidultBehindView');
assert(univJs.includes('kidultBehindController'), 'universes_view.js exports kidultBehindController');
assert(univJs.includes('closeBehindWitch()'), 'universes_view.js calls closeBehindWitch() on closeKidultWorld');

console.log('\n🎉 ALL 50 REWORKED BEHIND THE WITCH ASSERTIONS PASSED SUCCESSFULLY (100%)!');
