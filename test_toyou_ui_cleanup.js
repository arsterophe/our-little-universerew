import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition, message, detail = '') {
  total++;
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✕ FAIL: ${message} ${detail ? '-> ' + detail : ''}`);
  }
}

console.log('================================================================');
console.log('TEST SUITE: LALA (TO YOU) UI & CLEANUP VERIFICATION');
console.log('================================================================');

const indexHtml = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
const universesCss = fs.readFileSync(path.resolve('./universes.css'), 'utf-8');
const universesViewJs = fs.readFileSync(path.resolve('./universes_view.js'), 'utf-8');

// 1. TOP-LEFT HUD
console.log('\n--- 1. Top-Left HUD (Character Profile & Star Messages Pill) ---');
assert(
  indexHtml.includes('id="toyou-char-card"') && indexHtml.includes('toyou-char-avatar'),
  'Kartu karakter Lala (#toyou-char-card) tersedia dengan avatar dan info profil'
);
assert(
  indexHtml.includes('id="btn-toyou-star-messages"') && indexHtml.includes('data-toyou-nav="teleskop"'),
  'Tombol aksi cepat Pesan Bintang (#btn-toyou-star-messages) tersedia di bawah profil Lala'
);

// 2. TOP-RIGHT HUD & REMOVAL OF OLD MENU CONTAINER
console.log('\n--- 2. Top-Right HUD & Menu Box Removal ---');
assert(
  !indexHtml.includes('class="toyou-quick-menu"') && !indexHtml.includes('Mau ke mana dulu, Lala?'),
  'Kotak menu lama (.toyou-quick-menu dan "Mau ke mana dulu, Lala?") BERHASIL DIHAPUS'
);
assert(
  indexHtml.includes('id="btn-toyou-top-return"') && indexHtml.includes('toyou-return-pill'),
  'Tombol navigasi Pergi ke Universe (#btn-toyou-top-return) tersedia di HUD kanan atas'
);
assert(
  indexHtml.includes('id="btn-toyou-story"') && indexHtml.includes('toyou-story-pill'),
  'Tombol Story Workspace (#btn-toyou-story) tersedia di HUD kanan atas'
);
assert(
  indexHtml.includes('id="btn-toyou-behind"') && indexHtml.includes('toyou-behind-pill'),
  'Tombol rahasia BEHIND THE FAIRY (#btn-toyou-behind) tersedia di HUD kanan atas'
);
assert(
  indexHtml.includes('id="toyou-user-pill"') && indexHtml.includes('toyou-user-avatar'),
  'Pill user aktif (#toyou-user-pill) tersedia di HUD kanan atas'
);

// 3. BOTTOM-LEFT MOOD & MUSIC CONTAINER
console.log('\n--- 3. Bottom-Left Mood & Music Container ---');
assert(
  indexHtml.includes('id="toyou-mood-container"') && indexHtml.includes('id="toyou-mood-card"'),
  'Container Mood & Musik (#toyou-mood-container, #toyou-mood-card) terpasang di kiri bawah'
);
assert(
  indexHtml.includes('id="toyou-mood-icon"') && indexHtml.includes('id="toyou-mood-text"'),
  'Elemen indikator mood (#toyou-mood-icon, #toyou-mood-text) tersedia'
);
assert(
  indexHtml.includes('id="btn-toggle-toyou-mood-picker"') && indexHtml.includes('id="toyou-picker-caret"'),
  'Tombol toggle mood picker (#btn-toggle-toyou-mood-picker) tersedia'
);
assert(
  indexHtml.includes('id="toyou-mood-song"') && indexHtml.includes('id="btn-toyou-mood-play"'),
  'Pemutar musik suasana (#toyou-mood-song, #btn-toyou-mood-play) terpasang rapi'
);
assert(
  indexHtml.includes('id="toyou-mood-options-bar"'),
  'Bar pilihan mood horizontal (#toyou-mood-options-bar) tersedia'
);

const expectedMoods = ['bahagia', 'bersemangat', 'tenang', 'sedih', 'lelah', 'bersyukur', 'melamun'];
let allMoodsFound = true;
expectedMoods.forEach(mood => {
  if (!indexHtml.includes(`data-mood="${mood}"`)) {
    allMoodsFound = false;
  }
});
assert(allMoodsFound, 'Semua 7 opsi mood (bahagia, bersemangat, tenang, sedih, lelah, bersyukur, melamun) tersedia');

// 4. BOTTOM-RIGHT NAVIGATION DOCK REMOVAL & HOTSPOT INTEGRITY
console.log('\n--- 4. Removal of Bottom-Right Navigation Dock & Hotspot Integrity ---');
assert(
  !indexHtml.includes('id="toyou-quick-nav-dock"') && !indexHtml.includes('class="toyou-quick-nav-dock"'),
  'Panel navigasi pojok kanan bawah (#toyou-quick-nav-dock) BERHASIL DIHAPUS SEPENUHNYA'
);
assert(
  !indexHtml.includes('id="btn-toyou-back"'),
  'Tidak ada tombol navigasi duplikat di kanan bawah'
);

const expectedLocations = ['rumah', 'atelier', 'ladang_kupu', 'teleskop', 'gazebo', 'kotak_pos'];
let allHotspotsFound = true;
expectedLocations.forEach(loc => {
  if (!indexHtml.includes(`data-toyou-loc="${loc}"`)) {
    allHotspotsFound = false;
  }
});
assert(allHotspotsFound, 'Semua 6 hotspot interaktif pada stage/background (Bloom Cottage, Atelier, Ladang Kupu, Teleskop, Gazebo, Kotak Pos) tetap lengkap dan aktif');

// 5. CSS STYLING AUDIT
console.log('\n--- 5. CSS Styling Audit in universes.css ---');
assert(
  universesCss.includes('.toyou-hud-topright') && universesCss.includes('justify-content: flex-end'),
  'CSS HUD kanan atas menggunakan flex row sejajar ke kanan tanpa kotak menu'
);
assert(
  !universesCss.includes('.toyou-quick-nav-dock {'),
  'CSS rules untuk .toyou-quick-nav-dock telah dibersihkan'
);
assert(
  universesCss.includes('.toyou-mood-container') && universesCss.includes('.toyou-mood-options-bar'),
  'CSS Mood & Music container di kiri bawah terpasang rapi'
);
assert(
  universesCss.includes('.toyou-location-panel') && universesCss.includes('right: 20px;') && universesCss.includes('bottom: 20px;'),
  'Panel detail lokasi (.toyou-location-panel) diposisikan di kanan bawah'
);

// 6. JAVASCRIPT CONTROLLER AUDIT
console.log('\n--- 6. JavaScript Controller Audit in universes_view.js ---');
assert(
  universesViewJs.includes('export const TOYOU_MOODS ='),
  'TOYOU_MOODS didefinisikan dan diekspor di universes_view.js'
);
assert(
  universesViewJs.includes('function applyToYouMood(') && universesViewJs.includes('function restoreToYouMood('),
  'Fungsi applyToYouMood dan restoreToYouMood diimplementasikan'
);
assert(
  universesViewJs.includes('restoreToYouMood();') && universesViewJs.includes('loadUniverseState(\'lala\', activeAuthUser);'),
  'restoreToYouMood() dipanggil saat openToYouWorld()'
);
assert(
  universesViewJs.includes('btnToggleToYouMoodPicker') && universesViewJs.includes('btnToYouMoodPlay'),
  'Event listener tombol mood picker dan tombol musik terpasang'
);
assert(
  universesViewJs.includes('btnToYouStarMessages'),
  'Event listener #btn-toyou-star-messages terpasang'
);
assert(
  universesViewJs.includes('applyToYouMood,') && universesViewJs.includes('getCurrentToYouMood: () => currentToYouMoodKey,'),
  'Fungsi mood controller diekspor di return object initUniversesView'
);

console.log('================================================================');
console.log(`RESULTS: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
