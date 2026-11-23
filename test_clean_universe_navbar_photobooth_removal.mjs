import fs from 'fs';
import assert from 'assert';

console.log('=== TEST: CLEAN UNIVERSE NAVBAR PHOTOBOOTH REMOVAL ===');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Check that top navbar Photo Booth buttons are REMOVED across all 8 universes
const removedPills = [
  { id: 'btn-kidult-photobooth', name: 'Nyanya (KIDULT)' },
  { id: 'btn-toyou-photobooth', name: 'Lala (TO YOU)' },
  { id: 'btn-shadow-photobooth', name: 'Lele (SHADOW)' },
  { id: 'btn-pinwheel-top-photobooth', name: 'Syma (PINWHEEL)' },
  { id: 'btn-yawn-top-photobooth', name: 'Akhira (YAWN)' },
  { id: 'btn-ash-top-photobooth', name: 'Ruben (ASH)' },
  { id: 'btn-usagain-nav-photobooth', name: 'Ela (US AGAIN)' },
  { id: 'btn-hot-nav-photobooth', name: 'Royan (HOT)' }
];

removedPills.forEach(({ id, name }) => {
  const exists = html.includes(`id="${id}"`);
  assert(!exists, `Tombol navbar ${id} pada ${name} harus DIHAPUS dari index.html`);
  console.log(`[PASS] ${name}: Tombol navbar #${id} berhasil dihapus.`);
});

// 2. Check that Explore Universe and Story buttons REMAIN in each universe
const preservedNavs = [
  { explore: 'btn-kidult-return-univ', story: 'btn-kidult-story', name: 'Nyanya (KIDULT)' },
  { explore: 'btn-toyou-top-return', story: 'btn-toyou-story', name: 'Lala (TO YOU)' },
  { explore: 'btn-shadow-top-return', story: 'btn-shadow-story', name: 'Lele (SHADOW)' },
  { explore: 'btn-pinwheel-top-explore', story: 'btn-pinwheel-top-story', name: 'Syma (PINWHEEL)' },
  { explore: 'btn-yawn-top-explore', story: 'btn-yawn-top-story', name: 'Akhira (YAWN)' },
  { explore: 'btn-ash-top-explore', story: 'btn-ash-top-story', name: 'Ruben (ASH)' },
  { explore: 'btn-usagain-nav-explore', story: 'btn-usagain-nav-story', name: 'Ela (US AGAIN)' },
  { explore: 'btn-hot-nav-universes', story: 'btn-hot-nav-stories', name: 'Royan (HOT)' }
];

preservedNavs.forEach(({ explore, story, name }) => {
  assert(html.includes(`id="${explore}"`), `Tombol explore #${explore} pada ${name} harus tetap ada`);
  assert(html.includes(`id="${story}"`), `Tombol story #${story} pada ${name} harus tetap ada`);
  console.log(`[PASS] ${name}: Explore Universe (#${explore}) dan Story (#${story}) tetap terjaga utuh.`);
});

// 3. Check that Photo Booth feature remains fully intact
assert(html.includes('id="view-photobooth"'), 'Halaman view-photobooth harus tetap ada');
assert(html.includes('id="pb-interactive-canvas"'), 'Kanvas studio photobooth harus tetap ada');
assert(html.includes('id="pb-strip-canvas"'), 'Kanvas photo strip photobooth harus tetap ada');
assert(html.includes('id="pb-memory-gallery-list"'), 'Memory gallery photobooth harus tetap ada');
assert(html.includes('id="btn-pb-download-png"'), 'Tombol ekspor PNG photobooth harus tetap ada');
assert(html.includes('id="btn-pb-download-jpg"'), 'Tombol ekspor JPG photobooth harus tetap ada');
console.log('[PASS] Seluruh komponen inti fitur Photo Booth (halaman, kanvas, galeri, ekspor) tetap utuh.');

// 4. Check that Photo Booth remains accessible through dedicated locations/menus
assert(html.includes('id="nav-btn-photobooth"'), 'Tombol Photobooth pada Main Navigation Pill harus tetap ada');
assert(html.includes('id="btn-drop-photobooth"'), 'Tombol Photobooth pada Profile Dropdown Menu harus ada');
assert(html.includes('id="btn-yawn-open-photobooth"'), 'Tombol Photobooth pada YAWN gallery modal harus ada');
assert(html.includes('id="btn-pinwheel-open-photobooth"'), 'Tombol Photobooth pada PINWHEEL gallery modal harus ada');
assert(html.includes('id="btn-ash-open-photobooth"'), 'Tombol Photobooth pada ASH gallery modal harus ada');
assert(html.includes('id="btn-usagain-open-photobooth"'), 'Tombol Photobooth pada US AGAIN gallery modal harus ada');
console.log('[PASS] Photobooth tetap dapat diakses melalui Menu Navigasi Utama, Profile Dropdown, dan Modal Galeri tiap semesta.');

console.log('\n=== SEMUA PENGUJIAN OTOMATIS BERHASIL (100%) ===');
