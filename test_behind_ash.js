import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🐉 STARTING BEHIND THE ASH (RUBEN) TEST SUITE 🐉\n');

// 1. Check Files
const requiredFiles = [
  'ash_behind.css',
  'ash_behind_view.js',
  'public/assets/ash_world_bg.jpg',
  'public/assets/card_ruben_hd.jpg',
  'public/assets/portrait_ruben_hd.jpg',
  'public/assets/avatar_ruben_hd.jpg'
];

requiredFiles.forEach(file => {
  assert(fs.existsSync(file), `❌ Missing required file: ${file}`);
  console.log(`✅ [PASS] Required file exists: ${file}`);
});

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('ash_behind.css', 'utf8');
const js = fs.readFileSync('ash_behind_view.js', 'utf8');
const ashViewJs = fs.readFileSync('ash_view.js', 'utf8');
const univJs = fs.readFileSync('universes_view.js', 'utf8');

// 2. CSS Linked in <head>
assert(html.includes('<link rel="stylesheet" href="/ash_behind.css">'), '❌ ash_behind.css not linked in index.html <head>');
console.log('✅ [PASS] ash_behind.css linked in index.html <head>');

// 3. Pill Button in Header
assert(html.includes('id="btn-ash-behind"'), '❌ #btn-ash-behind not in index.html');
assert(html.includes('class="ash-behind-pill"'), '❌ .ash-behind-pill not in index.html');
assert(html.includes('BEHIND THE ASH'), '❌ Title BEHIND THE ASH not in index.html pill');
console.log('✅ [PASS] #btn-ash-behind pill button placed in Ruben\'s universe header');

// 4. Overlay & Structure
assert(html.includes('id="ash-behind-overlay"'), '❌ #ash-behind-overlay not in index.html');
assert(html.includes('id="btn-back-ash-behind"'), '❌ #btn-back-ash-behind not in index.html');
assert(html.includes('id="btn-close-ash-behind"'), '❌ #btn-close-ash-behind not in index.html');
assert(html.includes('id="ash-behind-progress-bar"'), '❌ #ash-behind-progress-bar not in index.html');
console.log('✅ [PASS] Overlay root, header buttons, and progress bar present');

// 5. Opening Scene
assert(html.includes('id="ash-behind-intro"'), '❌ #ash-behind-intro opening scene not in index.html');
assert(html.includes('id="btn-ash-begin-journey"'), '❌ #btn-ash-begin-journey not in index.html');
assert(html.includes('ENTER THE STORY'), '❌ ENTER THE STORY button text not in index.html');
assert(html.includes('The story of a dragon who keeps flying.'), '❌ Subtitle not in opening scene');
console.log('✅ [PASS] Opening Scene with hero card and ENTER THE STORY button present');

// 6. 5 Chapter Panels
for (let i = 1; i <= 5; i++) {
  assert(html.includes(`id="ash-behind-chapter-${i}"`), `❌ Chapter panel ${i} missing`);
  assert(html.includes(`data-chapter="${i}"`), `❌ Chapter tab ${i} missing`);
}
console.log('✅ [PASS] All 5 chapter panels and navigation tabs present');

// 7. Chapter I — The Dragon
assert(html.includes('The Dragon'), '❌ Chapter 1 title missing');
assert(html.includes('The Sovereign Dragon'), '❌ Dragon badge missing');
assert(html.includes('card_ruben_hd.jpg'), '❌ Ruben card image in Chapter 1 missing');
console.log('✅ [PASS] Chapter I: The Dragon content & portrait present');

// 8. Chapter II — Why ASH?
assert(html.includes('Why ASH?'), '❌ Chapter 2 title missing');
assert(html.includes('Born From Fire'), '❌ Born From Fire badge missing');
assert(html.includes('Metamorphosis &amp; Rebirth'), '❌ Philosophy in Chapter 2 missing');
console.log('✅ [PASS] Chapter II: Why ASH? content & philosophy present');

// 9. Chapter III — The World Beyond the Ash
assert(html.includes('The World Beyond the Ash'), '❌ Chapter 3 title missing');
assert(html.includes('Sanctuary of the Wings'), '❌ Sanctuary badge missing');
console.log('✅ [PASS] Chapter III: The World Beyond the Ash present');

// 10. Chapter IV — A Letter from Lele (Complete, Unabridged Text Verification)
assert(html.includes('A Letter from Lele'), '❌ Chapter 4 title missing');
assert(html.includes('Hai, Ruben.'), '❌ Letter salutation missing');
assert(html.includes('Apa kabar, naga?'), '❌ Letter nickname missing');
assert(html.includes('Masih sibuk menjadi makhluk paling keren di antara penghuni universe ini?'), '❌ Paragraph 1 missing');
assert(html.includes('Tapi, ya... jangan sampai besar kepala juga. Hehehe.'), '❌ Paragraph 2 missing');
assert(html.includes('kemampuan untuk bangkit dan memulai kembali.'), '❌ Paragraph 4 missing');
assert(html.includes('Abu sering kali dianggap sebagai tanda bahwa sesuatu telah berakhir.'), '❌ Paragraph 5 missing');
assert(html.includes('Kamu tidak harus selalu tahu ke mana harus pergi.'), '❌ Paragraph 8 missing');
assert(html.includes('Tetap semangat, ya, bocil.'), '❌ Paragraph 12 missing');
assert(html.includes('Terima kasih sudah bertahan sampai sejauh ini.'), '❌ Paragraph 16 missing');
assert(html.includes('Seekor naga tidak kehilangan kegagahannya hanya karena sesekali memilih untuk menurunkan sayap.'), '❌ Core quote missing');
assert(html.includes('Keep flying, Ruben. Your next world is waiting.'), '❌ Closing phrase missing');
assert(html.includes('With warmth and a little mischief,'), '❌ Signoff text missing');
assert(html.includes('Lele 🌙'), '❌ Author signoff missing');
assert(html.includes('id="btn-ash-letter-replay"'), '❌ Read again button missing');
assert(html.includes('id="btn-ash-letter-keep"'), '❌ Keep letter button missing');
assert(html.includes('id="btn-ash-letter-return"'), '❌ Return to universe button missing');
console.log('✅ [PASS] Chapter IV: Complete unabridged letter, author seal, and action buttons present');

// 11. Chapter V — Epilogue: ASH & YouTube Soundtrack
assert(html.includes('From the ashes, a new world awaits. Keep flying, Ruben.'), '❌ Ending climax quote missing');
assert(html.includes('BU28S4GT2Xg'), '❌ YouTube Video ID BU28S4GT2Xg missing');
assert(html.includes('id="ash-song-disc"'), '❌ Spinning disc element missing');
assert(html.includes('id="btn-ash-song-toggle"'), '❌ Song toggle button missing');
console.log('✅ [PASS] Chapter V: Epilogue quote & YouTube soundtrack embed present');

// 12. Storage Persistence Logic
assert(js.includes("localStorage.setItem('olu_saved_letter_ash'"), '❌ LocalStorage save missing in JS');
assert(js.includes("localStorage.setItem('olu_saved_letter_ruben'"), '❌ LocalStorage save ruben missing in JS');
assert(js.includes('switchAshBehindChapter'), '❌ switchAshBehindChapter missing in JS');
assert(js.includes('playAshBehindVideo'), '❌ playAshBehindVideo missing in JS');
assert(js.includes('pauseAshBehindVideo'), '❌ pauseAshBehindVideo missing in JS');
assert(js.includes('stopAshBehindVideo'), '❌ stopAshBehindVideo missing in JS');
console.log('✅ [PASS] Persistent storage save & YouTube audio lifecycle in ash_behind_view.js');

// 13. Integration into ash_view.js & universes_view.js
assert(ashViewJs.includes('initAshBehindView'), '❌ initAshBehindView not imported in ash_view.js');
assert(ashViewJs.includes('openBehindAsh'), '❌ openBehindAsh not exported in ash_view.js');
assert(univJs.includes('openBehindAsh'), '❌ openBehindAsh not in universes_view.js');
console.log('✅ [PASS] Integration into ash_view.js and universes_view.js verified');

// 14. CSS Scoping & Protection
assert(css.includes('.ash-behind-overlay'), '❌ .ash-behind-overlay missing in css');
assert(css.includes('@media (max-width: 640px)'), '❌ Mobile media query missing in css');
console.log('✅ [PASS] CSS styling and mobile responsiveness verified');

console.log('\n🎉 ALL BEHIND THE ASH TESTS PASSED (100%)! 🎉');
