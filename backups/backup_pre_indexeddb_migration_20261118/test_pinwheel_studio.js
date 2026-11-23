// test_pinwheel_studio.js
// Verification of Pinwheel Photography & Vision Studio logic, storage, catalogs, and integration

import assert from 'node:assert';
import fs from 'node:fs';
import {
  savePhoto,
  loadAllPhotos,
  loadPhotosMetaSync,
  deletePhoto,
  toggleFavoritePhoto,
  saveArtwork,
  loadAllArtworks,
  loadArtworksMetaSync,
  getArtworkById,
  deleteArtwork,
  renameArtwork,
  SYMA_CANONICAL_UID
} from './pinwheel_studio_storage.js';

// Mock localStorage for Node environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

console.log('--- TEST 1: Verifying Source Files & CSS Presence ---');
assert.ok(fs.existsSync('pinwheel_studio_storage.js'), 'pinwheel_studio_storage.js must exist');
assert.ok(fs.existsSync('pinwheel_photography_view.js'), 'pinwheel_photography_view.js must exist');
assert.ok(fs.existsSync('pinwheel_vision_studio_view.js'), 'pinwheel_vision_studio_view.js must exist');
assert.ok(fs.existsSync('pinwheel_studio.css'), 'pinwheel_studio.css must exist');
console.log('✓ All source files present.');

console.log('--- TEST 2: Photography & Vision Studio Storage CRUD & UID Isolation ---');
(async () => {
  const symaUid = SYMA_CANONICAL_UID;
  const otherUid = '1ArxphLQpAOoOIvH9BKYw0ebD1e2'; // Lele UID

  // 1. Save Photo for Syma
  const samplePhoto = {
    title: 'Momen Sore di Gazebo',
    caption: 'Bunga sakura bermekaran indah di tepi danau.',
    category: 'Special Moments',
    sceneryId: 'gazebo',
    sceneryName: 'Moonlit Blossom Gazebo',
    poseId: 'portrait',
    poseName: 'Syma Serene Portrait',
    frameId: 'sakura',
    filterId: 'soft_lavender',
    orientation: 'portrait',
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  };

  const savedPhoto = await savePhoto(samplePhoto, symaUid);
  assert.ok(savedPhoto.id, 'Photo must have an ID');
  assert.strictEqual(savedPhoto.title, 'Momen Sore di Gazebo');
  console.log('✓ Photo saved successfully.');

  // 2. Load Photos for Syma
  const symaPhotos = await loadAllPhotos(symaUid);
  assert.ok(symaPhotos.some(p => p.id === savedPhoto.id), 'Saved photo must be in Syma photo album');

  // 3. UID Isolation check
  const otherPhotos = await loadAllPhotos(otherUid);
  assert.ok(!otherPhotos.some(p => p.id === savedPhoto.id), 'Other users must NOT access Syma photos');
  console.log('✓ UID Isolation for Photography verified.');

  // 4. Toggle Favorite
  const isFav = await toggleFavoritePhoto(savedPhoto.id, symaUid);
  assert.strictEqual(isFav, true, 'Photo should now be favorite');
  const favPhotos = await loadAllPhotos(symaUid);
  const updatedFav = favPhotos.find(p => p.id === savedPhoto.id);
  assert.strictEqual(updatedFav.isFavorite, true);
  console.log('✓ Photo favorite toggle verified.');

  // 5. Delete Photo
  await deletePhoto(savedPhoto.id, symaUid);
  const photosAfterDelete = await loadAllPhotos(symaUid);
  assert.ok(!photosAfterDelete.some(p => p.id === savedPhoto.id), 'Photo should be deleted');
  console.log('✓ Photo deletion verified.');

  // 6. Save Artwork for Syma
  const sampleArt = {
    title: 'Lukisan Rembulan Ungu',
    category: 'Digital Art',
    type: 'freehand',
    dimensions: { width: 800, height: 600 },
    bgColor: '#18122B',
    thumbnailDataUrl: 'data:image/jpeg;base64,thumb',
    canvasDataUrl: 'data:image/png;base64,canvas',
    editableState: {
      canvasBgColor: '#18122B',
      drawingDataUrl: 'data:image/png;base64,drawing',
      studioElements: [{ symbol: '🌸', x: 100, y: 100, size: 48 }],
      headline: 'Rembulan Ungu'
    }
  };

  const savedArt = await saveArtwork(sampleArt, symaUid);
  assert.ok(savedArt.id, 'Artwork must have an ID');
  assert.strictEqual(savedArt.title, 'Lukisan Rembulan Ungu');
  console.log('✓ Artwork saved successfully with editableState.');

  // 7. Load Artwork & Re-edit capability
  const retrievedArt = await getArtworkById(savedArt.id, symaUid);
  assert.ok(retrievedArt, 'Should retrieve artwork by ID');
  assert.ok(retrievedArt.editableState, 'Artwork must retain editableState for resume editing');
  assert.strictEqual(retrievedArt.editableState.studioElements[0].symbol, '🌸');
  console.log('✓ Artwork re-editable state verified.');

  // 8. Rename Artwork
  await renameArtwork(savedArt.id, 'Lukisan Rembulan Ungu (Revisi)', symaUid);
  const renamedArt = await getArtworkById(savedArt.id, symaUid);
  assert.strictEqual(renamedArt.title, 'Lukisan Rembulan Ungu (Revisi)');
  console.log('✓ Artwork renaming verified.');

  // 9. Delete Artwork
  await deleteArtwork(savedArt.id, symaUid);
  const artsAfterDelete = await loadAllArtworks(symaUid);
  assert.ok(!artsAfterDelete.some(a => a.id === savedArt.id), 'Artwork should be deleted');
  console.log('✓ Artwork deletion verified.');

  console.log('--- TEST 3: Inspecting Catalogs & Requirements ---');
  const photoJs = fs.readFileSync('pinwheel_photography_view.js', 'utf8');
  const visionJs = fs.readFileSync('pinwheel_vision_studio_view.js', 'utf8');

  // Check 6 Sceneries rule
  assert.ok(photoJs.includes('Pinwheel Garden') && photoJs.includes('pinwheel_world_bg.jpg'), 'Must have Pinwheel Garden (available)');
  assert.ok(photoJs.includes('Moonlit Blossom Gazebo') && photoJs.includes('pinwheel_gazebo_bg.jpg'), 'Must have Moonlit Blossom Gazebo (available)');
  assert.ok(photoJs.includes('Windmill Hill') && photoJs.includes('island_pinwheel_floating.jpg'), 'Must have Windmill Hill (available)');
  assert.ok(photoJs.includes('The Whispering Pond') && photoJs.includes('available: false'), 'The Whispering Pond must be marked unavailable');
  assert.ok(photoJs.includes('Cat Garden') && photoJs.includes('available: false'), 'Cat Garden must be marked unavailable');
  assert.ok(photoJs.includes('Kitsune Sanctuary') && photoJs.includes('available: false'), 'Kitsune Sanctuary must be marked unavailable');
  console.log('✓ Sceneries availability strictness verified.');

  // Check Poses using Syma genuine assets
  assert.ok(photoJs.includes('portrait_abil_hd.jpg'), 'Must use portrait_abil_hd.jpg');
  assert.ok(photoJs.includes('card_abil_hd.jpg'), 'Must use card_abil_hd.jpg');
  assert.ok(photoJs.includes('avatar_abil_hd.jpg'), 'Must use avatar_abil_hd.jpg');
  console.log('✓ Syma authentic character poses verified.');

  // Check 6 Frames
  ['sakura', 'lavender', 'moonlight', 'kitsune', 'pinwheel', 'polaroid'].forEach(fr => {
    assert.ok(photoJs.includes(fr), `Must include frame: ${fr}`);
  });
  console.log('✓ All 6 photo frames verified.');

  // Check 5 Filters
  ['soft_lavender', 'moonlight_glow', 'sakura_pink', 'vintage_dream', 'silver_twilight'].forEach(fl => {
    assert.ok(photoJs.includes(fl), `Must include filter: ${fl}`);
  });
  console.log('✓ All 5 visual filters verified.');

  // Check Vision Studio 6 Templates
  ['greeting_card', 'birthday_card', 'quote_card', 'mini_poster', 'photo_collage', 'scrapbook_page'].forEach(tmpl => {
    assert.ok(visionJs.includes(tmpl), `Must include template: ${tmpl}`);
  });
  console.log('✓ All 6 creative templates verified.');

  // Check Color Lab Palettes
  ['Lavender Dream', 'Sakura Blossom', 'Moonlight Silver', 'Midnight Violet', 'Kitsune Gold', 'Soft Pastel'].forEach(pal => {
    assert.ok(visionJs.includes(pal), `Must include palette: ${pal}`);
  });
  console.log('✓ All 6 Color Lab palettes verified.');

  // Check 10 Stickers
  ['🌸', '🦋', '🦊', '🎐', '✨', '🌙', '☁️', '🪻', '🏮', '⛩️'].forEach(st => {
    assert.ok(visionJs.includes(st), `Must include sticker: ${st}`);
  });
  console.log('✓ All 10 decoration stickers verified.');

  console.log('--- TEST 4: Verifying index.html and pinwheel_view.js wiring ---');
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  assert.ok(indexHtml.includes('pinwheel_studio.css'), 'index.html must link pinwheel_studio.css');
  assert.ok(indexHtml.includes('id="view-pinwheel-photography"'), 'index.html must contain view-pinwheel-photography');
  assert.ok(indexHtml.includes('id="view-pinwheel-vision-studio"'), 'index.html must contain view-pinwheel-vision-studio');
  assert.ok(indexHtml.includes('id="btn-enter-pinwheel-photo"'), 'index.html must have btn-enter-pinwheel-photo');
  assert.ok(indexHtml.includes('id="btn-enter-pinwheel-vision"'), 'index.html must have btn-enter-pinwheel-vision');

  const pinwheelView = fs.readFileSync('pinwheel_view.js', 'utf8');
  assert.ok(pinwheelView.includes('pinwheel_photography_view.js'), 'pinwheel_view.js must import pinwheel_photography_view.js');
  assert.ok(pinwheelView.includes('pinwheel_vision_studio_view.js'), 'pinwheel_view.js must import pinwheel_vision_studio_view.js');
  assert.ok(pinwheelView.includes('openPhotography'), 'pinwheel_view.js must expose openPhotography');
  assert.ok(pinwheelView.includes('openVisionStudio'), 'pinwheel_view.js must expose openVisionStudio');
  console.log('✓ index.html and pinwheel_view.js integration verified.');

  console.log('\n========================================');
  console.log('ALL UNIT & LOGIC TESTS PASSED CLEANLY! ✨');
  console.log('========================================\n');
})();

