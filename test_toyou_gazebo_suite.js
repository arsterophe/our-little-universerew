/**
 * TEST SUITE: TO YOU EVERGLOW MORNING GAZEBO
 * LALA'S UNIVERSE · TO YOU
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(message);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('1. FILE EXISTENCE & ASSET INTEGRITY');
  console.log('================================================================');

  const files = [
    'toyou_gazebo_state.js',
    'toyou_gazebo_view.js',
    'toyou_gazebo.css',
    'public/assets/toyou_gazebo_bg.jpg'
  ];

  for (const f of files) {
    assert(fs.existsSync(f), `File exists: ${f}`);
  }

  console.log('\n================================================================');
  console.log('2. DOM STRUCTURE IN INDEX.HTML FOR TO YOU GAZEBO');
  console.log('================================================================');

  const html = fs.readFileSync(path.resolve('./index.html'), 'utf8');

  // Verify view-toyou-gazebo
  assert(html.includes('id="view-toyou-gazebo"'), 'index.html contains view-toyou-gazebo');
  assert(html.includes('id="btn-tgazebo-back"'), 'index.html contains return button (id="btn-tgazebo-back")');

  // Top Bar Music Player
  assert(html.includes('id="btn-tgazebo-music-toggle"'), 'index.html contains music play/pause toggle');
  assert(html.includes('id="btn-tgazebo-music-mute"'), 'index.html contains music mute button');
  assert(html.includes('id="slider-tgazebo-music-vol"'), 'index.html contains music volume slider');
  assert(html.includes('id="tgazebo-track-title"'), 'index.html contains track title display');

  // Four Central Activity Cards
  assert(html.includes('id="tgazebo-card-tea"'), 'index.html contains Tea Time card');
  assert(html.includes('id="tgazebo-card-library"'), 'index.html contains Perpustakaan Kecil card');
  assert(html.includes('id="tgazebo-card-journal"'), 'index.html contains Jurnal Kenangan card');
  assert(html.includes('id="tgazebo-card-quiet"'), 'index.html contains Quiet Moment card');

  // Hotspots for Interior Touch
  assert(html.includes('id="hotspot-tg-cat"'), 'index.html contains Cat petting hotspot');
  assert(html.includes('id="hotspot-tg-guitar"'), 'index.html contains Guitar strumming hotspot');
  assert(html.includes('id="hotspot-tg-lanterns"'), 'index.html contains Lanterns atmosphere cycling hotspot');

  // Bottom Action Dock (Pojok Kiri Bawah)
  assert(html.includes('id="tgazebo-quick-actions"'), 'index.html contains tgazebo-quick-actions dock');
  assert(html.includes('id="btn-tgazebo-quick-tea"'), 'index.html contains circular Tea Time action button');
  assert(html.includes('id="btn-tgazebo-songs-we-share"'), 'index.html contains circular Songs We Share action button');

  // Modal Dialog Container
  assert(html.includes('id="tgazebo-modal-backdrop"'), 'index.html contains Gazebo modal backdrop');
  assert(html.includes('id="btn-tgazebo-modal-close"'), 'index.html contains modal close button');
  assert(html.includes('id="tgazebo-modal-body"'), 'index.html contains dynamic modal body');

  // CSS Link in Head
  assert(html.includes('href="/toyou_gazebo.css"'), 'index.html links toyou_gazebo.css in <head>');

  console.log('\n================================================================');
  console.log('3. CSS STYLING & TO YOU FAIRY VISUAL IDENTITY');
  console.log('================================================================');

  const css = fs.readFileSync(path.resolve('./toyou_gazebo.css'), 'utf8');

  assert(css.includes('.view-toyou-gazebo'), 'toyou_gazebo.css styles main view container');
  assert(css.includes("url('/assets/toyou_gazebo_bg.jpg')"), 'toyou_gazebo.css references user uploaded background image');
  assert(css.includes('.tgazebo-cards-grid'), 'toyou_gazebo.css styles 4 activity cards grid');
  assert(css.includes('.tgazebo-card'), 'toyou_gazebo.css styles pastel cards');
  assert(css.includes('.tgazebo-quick-actions'), 'toyou_gazebo.css styles bottom left dock');
  assert(css.includes('.btn-tgazebo-circle-action'), 'toyou_gazebo.css styles circular action buttons');
  assert(css.includes('.tg-hotspot-cat'), 'toyou_gazebo.css positions cat hotspot on sofa');
  assert(css.includes('.tg-hotspot-guitar'), 'toyou_gazebo.css positions guitar hotspot');
  assert(css.includes('.tgazebo-lighting-overlay'), 'toyou_gazebo.css styles dynamic lighting overlays');

  console.log('\n================================================================');
  console.log('4. TO YOU GAZEBO DATA CATALOGS & STATE ISOLATION');
  console.log('================================================================');

  const {
    TOYOU_TEAS,
    TOYOU_TREATS,
    TOYOU_GAZEBO_LIGHTS,
    TOYOU_JOURNAL_MOODS,
    TOYOU_AMBIENT_OPTIONS,
    LALA_HERO_QUOTE,
    CAT_INTERACTIONS,
    GUITAR_INTERACTIONS,
    createDefaultToyouGazeboState,
    loadToyouGazeboState,
    saveToyouGazeboState,
    getToyouGazeboStorageKey,
    createToyouGazeboAudioEngine
  } = await import('./toyou_gazebo_state.js');

  // Teas
  assert(Object.keys(TOYOU_TEAS).length === 4, 'TOYOU_TEAS contains 4 floral teas');
  assert(TOYOU_TEAS.rose_honey && TOYOU_TEAS.morning_dew_sakura && TOYOU_TEAS.sunshine_chamomile && TOYOU_TEAS.peach_blossom, 'All 4 canonical teas present');

  // Treats
  assert(Object.keys(TOYOU_TREATS).length === 3, 'TOYOU_TREATS contains 3 sweet treats');

  // Lights
  assert(Object.keys(TOYOU_GAZEBO_LIGHTS).length === 4, 'TOYOU_GAZEBO_LIGHTS contains 4 lighting atmospheres');

  // Journal Moods
  assert(TOYOU_JOURNAL_MOODS.length === 5, 'TOYOU_JOURNAL_MOODS contains 5 philosophical moods');
  assert(TOYOU_JOURNAL_MOODS.some(m => m.id === 'sunshine'), 'Includes sunshine mood');
  assert(TOYOU_JOURNAL_MOODS.some(m => m.id === 'caring'), 'Includes caring mood');
  assert(TOYOU_JOURNAL_MOODS.some(m => m.id === 'serenity'), 'Includes serenity mood');

  // Ambients
  assert(TOYOU_AMBIENT_OPTIONS.length === 4, 'TOYOU_AMBIENT_OPTIONS contains 4 ambient soundscapes');

  // Interactions
  assert(CAT_INTERACTIONS.length >= 3, 'Cat petting interactions defined');
  assert(GUITAR_INTERACTIONS.length >= 3, 'Guitar strumming interactions defined');
  assert(LALA_HERO_QUOTE.includes('Lala ☼'), 'Hero quote matches Lala TO YOU');

  // Storage Isolation
  const lalaStorageKey = getToyouGazeboStorageKey('lala');
  assert(lalaStorageKey === 'olu_toyou_gazebo_lala', 'Storage key is isolated to olu_toyou_gazebo_lala');

  // State initialization & persistence
  const defaultState = createDefaultToyouGazeboState('lala');
  assert(defaultState.characterId === 'lala', 'Default state characterId is lala');
  assert(defaultState.currentTea === 'rose_honey', 'Default tea is rose_honey');
  assert(Array.isArray(defaultState.journals) && defaultState.journals.length >= 2, 'Default state includes seed journals');

  // Audio Engine
  const audio = createToyouGazeboAudioEngine();
  assert(typeof audio.playGuitarChord === 'function', 'Audio engine has playGuitarChord');
  assert(typeof audio.startMorningMelody === 'function', 'Audio engine has startMorningMelody');
  assert(typeof audio.setAmbientSoundscape === 'function', 'Audio engine has setAmbientSoundscape');

  console.log('\n================================================================');
  console.log('5. UNIVERSES_VIEW.JS INTEGRATION VERIFICATION');
  console.log('================================================================');

  const uvCode = fs.readFileSync(path.resolve('./universes_view.js'), 'utf8');

  assert(uvCode.includes("import { initToyouGazeboView } from './toyou_gazebo_view.js';"), 'universes_view.js imports initToyouGazeboView');
  assert(uvCode.includes("actionType: 'toyou_gazebo'"), "TOYOU_LOCATIONS.gazebo has actionType: 'toyou_gazebo'");
  assert(uvCode.includes('toyouGazeboCtrl.openToyouGazebo'), 'toyouGazeboCtrl.openToyouGazebo wired to hotspot actions');
  assert(uvCode.includes('toyouGazeboController: toyouGazeboCtrl'), 'universes_view.js exports toyouGazeboController');
  assert(uvCode.includes('openToyouGazebo:'), 'universes_view.js exports openToyouGazebo method');
  assert(uvCode.includes('closeToyouGazebo:'), 'universes_view.js exports closeToyouGazebo method');
  assert(!uvCode.includes('id="toyou-quick-nav-dock"'), 'No duplicate bottom-right nav dock in TO YOU');

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passed}/${total} ASSERTIONS PASSED! TO YOU GAZEBO IS READY.`);
  console.log('================================================================');
}

runTests();
