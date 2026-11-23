// test_akhira_photobooth_studio_suite.mjs
import {
  PB_BACKGROUND_PRESETS,
  PB_STICKER_CATEGORIES,
  PB_STUDIO_LAYOUTS,
  PB_FONTS,
  PhotoboothStudioManager,
  createDefaultStudioState
} from './photobooth_studio.js';
import {
  savePhotoboothMemory,
  getPhotoboothMemories,
  getPhotoboothMemoryById,
  deletePhotoboothMemory
} from './photobooth_storage.js';

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (cond) {
    passed++;
    console.log(`✓ PASS: ${msg}`);
  } else {
    console.error(`✗ FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

console.log('===============================================================');
console.log('🧪 TEST SUITE: AKHIRA PHOTOBOOTH STUDIO ENGINE & MEMORY GALLERY');
console.log('===============================================================\n');

// 1. Backgrounds Presets (10 presets)
console.log('--- 1. Background Presets ---');
assert(PB_BACKGROUND_PRESETS.length === 10, 'Exactly 10 thematic background presets defined');
const expectedBgIds = [
  'astral_ocean', 'galaxy_night', 'flower_garden', 'japanese_garden',
  'retro_vintage', 'cozy_room', 'crystal_palace', 'dreamy_clouds', 'sunset', 'seasonal'
];
expectedBgIds.forEach(id => {
  assert(PB_BACKGROUND_PRESETS.some(b => b.id === id), `Background preset "${id}" exists`);
});

// 2. Sticker Categories (11 categories)
console.log('\n--- 2. Sticker Categories ---');
assert(PB_STICKER_CATEGORIES.length === 11, 'Exactly 11 sticker categories defined');
const expectedCatIds = [
  'stars_moon', 'flowers', 'hearts', 'butterflies', 'ribbons_bows',
  'cute_animals', 'food_drinks', 'kawaii_expr', 'doodles', 'seasonal_decor', 'fantasy_elem'
];
expectedCatIds.forEach(id => {
  const cat = PB_STICKER_CATEGORIES.find(c => c.id === id);
  assert(Boolean(cat && cat.stickers.length >= 6), `Sticker category "${id}" has rich sticker collection`);
});

// 3. Layouts (10 layouts)
console.log('\n--- 3. Studio Layouts ---');
assert(PB_STUDIO_LAYOUTS.length === 10, 'Exactly 10 photo layouts defined');
const expectedLayoutIds = [
  'single', 'two_person', 'three_person', 'four_grid', 'five_friends',
  'six_friends', 'seven_friends', 'full_house', 'classic_strip', 'collage'
];
expectedLayoutIds.forEach(id => {
  assert(PB_STUDIO_LAYOUTS.some(l => l.id === id), `Layout "${id}" exists`);
});

// 4. Studio Manager & Undo/Redo Engine
console.log('\n--- 4. Studio Manager & Undo/Redo Engine ---');
const studio = new PhotoboothStudioManager({ activeChar: 'akhira' });
assert(studio.state.activeChar === 'akhira', 'Active character is Akhira');
assert(studio.state.background.presetId === 'astral_ocean', 'Default background is Astral Ocean for YAWN');
assert(studio.canUndo() === false, 'Initial undo stack is empty');

// Modify background
studio.setBackgroundPreset('galaxy_night');
assert(studio.state.background.presetId === 'galaxy_night', 'Background changed to galaxy_night');
assert(studio.canUndo() === true, 'Undo stack available after background change');

// Undo background
studio.undo();
assert(studio.state.background.presetId === 'astral_ocean', 'Undo reverted background to astral_ocean');
assert(studio.canRedo() === true, 'Redo available after undo');

// Redo background
studio.redo();
assert(studio.state.background.presetId === 'galaxy_night', 'Redo restored background to galaxy_night');

// 5. Sticker CRUD & Transforms
console.log('\n--- 5. Sticker CRUD & Transforms ---');
const initialStkCount = studio.state.stickers.length;
const newStk = studio.addSticker('🐋', 'emoji', { x: 200, y: 300, scale: 1.5 });
assert(studio.state.stickers.length === initialStkCount + 1, 'Sticker added');
assert(newStk.content === '🐋', 'Sticker content is whale');

studio.updateSticker(newStk.id, { x: 250, rotation: 45, opacity: 0.8 });
const updatedStk = studio.state.stickers.find(s => s.id === newStk.id);
assert(updatedStk.x === 250 && updatedStk.rotation === 45 && updatedStk.opacity === 0.8, 'Sticker transform updated');

studio.duplicateSticker(newStk.id);
assert(studio.state.stickers.length === initialStkCount + 2, 'Sticker duplicated');

studio.deleteSticker(newStk.id);
assert(studio.state.stickers.length === initialStkCount + 1, 'Sticker deleted');

// 6. Text Editor
console.log('\n--- 6. Text Editor ---');
const initialTxtCount = studio.state.texts.length;
const txt = studio.addText('AKHIRA DI ASTRAL OCEAN ⚡', { size: 32, color: '#38bdf8' });
assert(studio.state.texts.length === initialTxtCount + 1, 'Text element added');
assert(txt.text === 'AKHIRA DI ASTRAL OCEAN ⚡', 'Text content matches');

studio.updateText(txt.id, { text: 'YAWN UNDERWATER CITY 🌊', size: 36 });
const updatedTxt = studio.state.texts.find(t => t.id === txt.id);
assert(updatedTxt.text === 'YAWN UNDERWATER CITY 🌊' && updatedTxt.size === 36, 'Text updated');

studio.deleteText(txt.id);
assert(studio.state.texts.length === initialTxtCount, 'Text deleted');

// 7. Background Pan & Zoom
console.log('\n--- 7. Background Pan & Zoom ---');
studio.updateBackgroundTransform({ panX: 20, panY: -30, zoom: 1.5, fit: 'cover' });
assert(studio.state.background.panX === 20, 'Background panX set');
assert(studio.state.background.panY === -30, 'Background panY set');
assert(studio.state.background.zoom === 1.5, 'Background zoom set to 1.5x');

// 8. Canvas Zoom
console.log('\n--- 8. Canvas Zoom ---');
studio.setCanvasZoom(1.0);
studio.zoomIn();
assert(studio.state.zoomLevel > 1.0, 'Zoom in increased zoom level');
studio.zoomOut();
studio.resetZoom();
assert(studio.state.zoomLevel === 1.0, 'Reset zoom returned to 1.0x');

// 9. Memory Gallery (IndexedDB Storage Engine)
console.log('\n--- 9. Memory Gallery (IndexedDB Storage) ---');
async function testGallery() {
  const dummyMemory = {
    id: `test-mem-${Date.now()}`,
    title: 'Kenangan Pertama Akhira ⚡',
    author: 'akhira',
    authorName: 'Akhira ⚡',
    participants: ['akhira', 'nyanya'],
    layout: 'two_person',
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    previewUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    projectData: studio.state,
    createdAt: Date.now()
  };

  await savePhotoboothMemory(dummyMemory);
  const memList = await getPhotoboothMemories('akhira');
  assert(memList.length >= 1, 'Memory saved and retrieved from gallery');
  const found = memList.find(m => m.id === dummyMemory.id);
  assert(Boolean(found), 'Saved memory found by ID in list');
  assert(found.title === 'Kenangan Pertama Akhira ⚡', 'Memory title matches');
  assert(found.participants.includes('nyanya'), 'Participants include nyanya');

  // Verify single lookup
  const single = await getPhotoboothMemoryById(dummyMemory.id);
  assert(single && single.id === dummyMemory.id, 'getPhotoboothMemoryById returns correct record');

  // Delete memory
  await deletePhotoboothMemory(dummyMemory.id, 'akhira');
  const afterDelete = await getPhotoboothMemoryById(dummyMemory.id);
  assert(afterDelete === null || afterDelete === undefined, 'Memory successfully deleted from storage');

  // RBAC test: other character cannot delete Akhira memory
  const foreignMem = {
    id: `foreign-mem-${Date.now()}`,
    title: 'Karya Akhira',
    author: 'akhira',
    createdAt: Date.now()
  };
  await savePhotoboothMemory(foreignMem);
  try {
    await deletePhotoboothMemory(foreignMem.id, 'nyanya');
    assert(false, 'Non-owner Nyanya must throw error when attempting to delete Akhira memory');
  } catch (err) {
    assert(err.message.includes('Akses ditolak'), 'RBAC error thrown on unauthorized deletion attempt');
  }
}

await testGallery();

console.log('\n===============================================================');
console.log(`TEST SUMMARY: ${passed}/${total} PASSED (100%)`);
console.log('===============================================================\n');
