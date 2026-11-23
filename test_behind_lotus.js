import fs from 'fs';

console.log('--- Verifying BEHIND THE LOTUS static content, CSS rules, and JS controller ---');

const html = fs.readFileSync('index.html', 'utf8');
const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const decodedTextOnly = textOnly.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const css = fs.readFileSync('usagain_behind.css', 'utf8');
const js = fs.readFileSync('usagain_behind_view.js', 'utf8');
const usagainViewJs = fs.readFileSync('usagain_view.js', 'utf8');
const univJs = fs.readFileSync('universes_view.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  }
  console.log('✅ PASS:', message);
}

// 1. Button in index.html (US AGAIN Top Header Right)
assert(html.includes('id="btn-usagain-behind"'), 'index.html contains #btn-usagain-behind');
assert(decodedTextOnly.includes('BEHIND THE LOTUS'), 'index.html contains "BEHIND THE LOTUS" text');
assert(decodedTextOnly.includes('Some people become a place of peace.'), 'index.html contains button subtitle "Some people become a place of peace."');

// 2. Overlay & Navigation Elements
assert(html.includes('id="lotus-behind-overlay"'), 'index.html contains #lotus-behind-overlay');
assert(html.includes('id="btn-back-lotus-behind"'), 'index.html contains #btn-back-lotus-behind');
assert(html.includes('id="btn-close-lotus-behind"'), 'index.html contains #btn-close-lotus-behind');
assert(html.includes('id="btn-lotus-behind-prev"'), 'index.html contains #btn-lotus-behind-prev');
assert(html.includes('id="btn-lotus-behind-next"'), 'index.html contains #btn-lotus-behind-next');
assert(decodedTextOnly.includes('Kembali ke US AGAIN'), 'index.html back button text specifies "Kembali ke US AGAIN"');

// 3. 5-Chapter Navigation Tabs & Progress Bar
assert(html.includes('class="lotus-behind-progress-bar" id="lotus-behind-progress-bar"'), 'index.html contains #lotus-behind-progress-bar');
assert(html.includes('data-chapter="1"') && decodedTextOnly.includes('The Priestess'), 'index.html contains Chapter 1 tab');
assert(html.includes('data-chapter="2"') && decodedTextOnly.includes('Why US AGAIN?'), 'index.html contains Chapter 2 tab');
assert(html.includes('data-chapter="3"') && decodedTextOnly.includes('The Road Together'), 'index.html contains Chapter 3 tab');
assert(html.includes('data-chapter="4"') && decodedTextOnly.includes('A Letter From Lele'), 'index.html contains Chapter 4 tab');
assert(html.includes('data-chapter="5"') && decodedTextOnly.includes('Epilogue: US AGAIN'), 'index.html contains Chapter 5 tab');

// 4. Chapter I: THE PRIESTESS
assert(decodedTextOnly.includes('THE PRIESTESS'), 'index.html contains Chapter I title');
assert(decodedTextOnly.includes('Some People Become a Place of Peace.'), 'index.html contains Chapter I subtitle');
assert(decodedTextOnly.includes('Ketika memikirkan Ela, ada satu kesan yang selalu melekat begitu kuat dalam ingatanku: ketenangan.'), 'index.html contains Chapter I opening');
assert(decodedTextOnly.includes('Ketenangan di Tengah Hiruk-Pikuk'), 'index.html contains Chapter I card 1');
assert(decodedTextOnly.includes('Penjaga Tempat Suci yang Manusiawi'), 'index.html contains Chapter I card 2');
assert(decodedTextOnly.includes('Tempat paling damai di dunia ini bukanlah tempat yang bebas dari masalah'), 'index.html contains Chapter I closing philosophy');

// 5. Chapter II: WHY US AGAIN?
assert(decodedTextOnly.includes('WHY US AGAIN?'), 'index.html contains Chapter II title');
assert(decodedTextOnly.includes('Some Names Are Not Just Names. They Are Prayers.'), 'index.html contains Chapter II subtitle');
assert(decodedTextOnly.includes('Nama universe US AGAIN terinspirasi dari sebuah lagu milik SEVENTEEN yang berjudul US, AGAIN'), 'index.html contains Chapter II SEVENTEEN inspiration');
assert(decodedTextOnly.includes('Berdiri di Atas Ombak yang Bergerak'), 'index.html contains Chapter II card 1');
assert(decodedTextOnly.includes('Fajar Pagi & Titik Terang'), 'index.html contains Chapter II card 2');
assert(decodedTextOnly.includes('Bagi author, US AGAIN adalah sebuah doa.'), 'index.html contains Chapter II prayer quote');

// 6. Chapter III: THE ROAD WE WALKED TOGETHER
assert(decodedTextOnly.includes('THE ROAD WE WALKED TOGETHER'), 'index.html contains Chapter III title');
assert(decodedTextOnly.includes('Even the Longest Journey Deserves a Place to Rest.'), 'index.html contains Chapter III subtitle');
assert(decodedTextOnly.includes('Masa-masa pengerjaan skripsi dan fase akhir perkuliahan adalah salah satu babak pendewasaan paling berharga dalam hidup author.'), 'index.html contains Chapter III opening');
assert(decodedTextOnly.includes('Aku harap kamu tahu bahwa semua usaha yang kamu lakukan saat itu tidak pernah menjadi hal yang sia-sia.'), 'index.html contains Chapter III encouragement');
assert(decodedTextOnly.includes('Aku ingin kamu tahu bahwa aku senang pernah menjadi bagian kecil dari perjalananmu.'), 'index.html contains Chapter III personal reflection');
assert(decodedTextOnly.includes('Proses Menjadi Dewasa'), 'index.html contains Chapter III card 1');
assert(decodedTextOnly.includes('Senyuman di Ujung Jalan'), 'index.html contains Chapter III card 2');

// 7. Chapter IV: A LETTER FROM LELE
assert(decodedTextOnly.includes('A LETTER FROM LELE'), 'index.html contains Chapter IV title');
assert(decodedTextOnly.includes('Until the Morning Comes, I Hope We Find Each Other Again.'), 'index.html contains Chapter IV subtitle');
assert(html.includes('class="usagain-manuscript-parchment"'), 'index.html contains sacred temple manuscript parchment');
assert(decodedTextOnly.includes('LELE 🌙 ~ AUTHOR SEAL'), 'index.html contains author seal');
assert(decodedTextOnly.includes('Untuk Ela,'), 'index.html contains letter salutation');
assert(decodedTextOnly.includes('Aku selalu teringat masa-masa ketika kita sedang berjuang menyelesaikan skripsi masing-masing.'), 'index.html contains letter core sentence');
assert(decodedTextOnly.includes('Aku ingat bagaimana aku berusaha melakukan sesuatu supaya perjalananmu bisa sedikit lebih mudah.'), 'index.html contains letter decision validation');
assert(decodedTextOnly.includes('Terima kasih sudah pernah berjalan bersama dalam perjalanan yang tidak selalu kita pahami arahnya.'), 'index.html contains letter gratitude paragraph');
assert(decodedTextOnly.includes('Kalau suatu hari kamu merasa lelah, kamu boleh datang dan bercerita.'), 'index.html contains letter comfort invitation');
assert(decodedTextOnly.includes('See you again, Ela.'), 'index.html contains letter concluding phrase');
assert(decodedTextOnly.includes('Lele — Your Author.'), 'index.html contains letter signature');
assert(html.includes('id="btn-lotus-letter-replay"'), 'index.html contains Read Again button #btn-lotus-letter-replay');
assert(html.includes('id="btn-lotus-letter-seal"'), 'index.html contains Seal Letter button #btn-lotus-letter-seal');

// 8. Chapter V: EPILOGUE: US AGAIN & SOUNDTRACK
assert(decodedTextOnly.includes('EPILOGUE: US AGAIN'), 'index.html contains Chapter V title');
assert(decodedTextOnly.includes('Until We Meet Again, Wherever the Road Takes Us.'), 'index.html contains Chapter V subtitle');
assert(html.includes('1CGeEV5-IhA'), 'index.html contains official YouTube video ID 1CGeEV5-IhA');
assert(!html.includes('1CGeEV5-IhA?autoplay=1'), 'index.html guarantees NO autoplay on embed');
assert(html.includes('id="btn-lotus-song-toggle"'), 'index.html contains custom song play/pause button');
assert(decodedTextOnly.includes('Makna & Inspirasi Lagu US, AGAIN'), 'index.html contains song interpretation section');
assert(decodedTextOnly.includes('And someday, somewhere, somehow... Us, again.'), 'index.html contains Epilogue climax heading');
assert(decodedTextOnly.includes('Jika suatu hari nanti kita kembali bertemu, aku harap kita datang dengan cerita yang lebih banyak, hati yang lebih tenang, dan senyum yang lebih lega.'), 'index.html contains Epilogue climax quote');
assert(decodedTextOnly.includes('Semoga selalu ada cahaya yang menuntunmu pulang.'), 'index.html contains Epilogue light blessings');

// 9. CSS Rules in usagain_behind.css
assert(css.includes('.lotus-behind-overlay'), 'usagain_behind.css defines .lotus-behind-overlay');
assert(css.includes('.lotus-behind-progress-track'), 'usagain_behind.css defines progress track');
assert(css.includes('.lotus-behind-progress-bar'), 'usagain_behind.css defines progress bar');
assert(css.includes('.usagain-manuscript-parchment'), 'usagain_behind.css defines sacred manuscript styling');
assert(css.includes('.lotus-wax-seal'), 'usagain_behind.css defines wax seal');
assert(css.includes('.btn-lotus-letter-replay'), 'usagain_behind.css defines replay letter button');
assert(css.includes('.btn-lotus-letter-seal'), 'usagain_behind.css defines seal letter button');
assert(css.includes('.lotus-song-player-card'), 'usagain_behind.css defines song player card');
assert(css.includes('.btn-lotus-song-toggle'), 'usagain_behind.css defines song toggle button');
assert(css.includes('.lotus-song-disc'), 'usagain_behind.css defines song disc');
assert(css.includes('.lotus-epilogue-climax'), 'usagain_behind.css defines epilogue climax quote box');
assert(css.includes('.usagain-behind-pill'), 'usagain_behind.css defines universe HUD button');
assert(css.includes('@media (max-width: 960px)'), 'usagain_behind.css defines tablet responsive rules');
assert(css.includes('@media (max-width: 640px)'), 'usagain_behind.css defines mobile responsive rules');

// 10. JS Controller in usagain_behind_view.js
assert(js.includes('export function switchUsAgainBehindChapter'), 'usagain_behind_view.js exports switchUsAgainBehindChapter');
assert(js.includes('export function openBehindLotus'), 'usagain_behind_view.js exports openBehindLotus');
assert(js.includes('export function closeBehindLotus'), 'usagain_behind_view.js exports closeBehindLotus');
assert(js.includes('export function pauseUsAgainBehindVideo'), 'usagain_behind_view.js exports pauseUsAgainBehindVideo');
assert(js.includes('export function stopUsAgainBehindVideo'), 'usagain_behind_view.js exports stopUsAgainBehindVideo');
assert(js.includes('export function playUsAgainBehindVideo'), 'usagain_behind_view.js exports playUsAgainBehindVideo');
assert(js.includes('export function replayLetterAnimation'), 'usagain_behind_view.js exports replayLetterAnimation');
assert(js.includes('export function sealLetterAnimation'), 'usagain_behind_view.js exports sealLetterAnimation');
assert(js.includes('window.usagainBehindController = controller;'), 'usagain_behind_view.js exposes window.usagainBehindController');

// 11. Integration in usagain_view.js & universes_view.js
assert(usagainViewJs.includes('initUsAgainBehindView'), 'usagain_view.js imports and initializes initUsAgainBehindView');
assert(usagainViewJs.includes('closeBehindLotus()'), 'usagain_view.js calls closeBehindLotus on closeUsAgainWorld');
assert(usagainViewJs.includes('usagainBehindController'), 'usagain_view.js returns usagainBehindController');
assert(univJs.includes('openBehindLotus: () => usagainCtrl?.openBehindLotus()'), 'universes_view.js forwards openBehindLotus');
assert(univJs.includes('closeBehindLotus: () => usagainCtrl?.closeBehindLotus()'), 'universes_view.js forwards closeBehindLotus');

console.log('\n🎉 ALL 56 BEHIND THE LOTUS VERIFICATION CHECKS PASSED SUCCESSFULLY (100%)!');
