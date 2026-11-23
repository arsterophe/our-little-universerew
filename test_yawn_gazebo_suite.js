/**
 * TEST SUITE: YAWN ASTRAL OCEAN GAZEBO
 * AKHIRA'S UNIVERSE · YAWN ⚡
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
    'yawn_gazebo_state.js',
    'yawn_gazebo_view.js',
    'yawn_gazebo.css',
    'public/assets/yawn_gazebo_bg.jpg'
  ];

  for (const f of files) {
    assert(fs.existsSync(f), `File exists: ${f}`);
  }

  // Verify asset size is substantial
  const stats = fs.statSync('public/assets/yawn_gazebo_bg.jpg');
  assert(stats.size > 50000, `Background asset public/assets/yawn_gazebo_bg.jpg has valid size (${stats.size} bytes)`);

  console.log('\n================================================================');
  console.log('2. DOM STRUCTURE IN INDEX.HTML FOR YAWN GAZEBO');
  console.log('================================================================');

  const html = fs.readFileSync(path.resolve('./index.html'), 'utf8');

  // Verify view-yawn-gazebo
  assert(html.includes('id="view-yawn-gazebo"'), 'index.html contains view-yawn-gazebo');
  assert(html.includes('id="btn-ygazebo-back"'), 'index.html contains return button (id="btn-ygazebo-back")');

  // Top Bar Music Player
  assert(html.includes('id="btn-ygazebo-music-toggle"'), 'index.html contains music play/pause toggle');
  assert(html.includes('id="btn-ygazebo-music-mute"'), 'index.html contains music mute button');
  assert(html.includes('id="slider-ygazebo-music-vol"'), 'index.html contains music volume slider');
  assert(html.includes('id="ygazebo-track-title"'), 'index.html contains track title display');

  // Four Central Activity Cards
  assert(html.includes('id="ygazebo-card-tea"'), 'index.html contains Tea Time card');
  assert(html.includes('id="ygazebo-card-cinema"'), 'index.html contains Astral Cinema card');
  assert(html.includes('id="ygazebo-card-journal"'), 'index.html contains Jurnal Kenangan card');
  assert(html.includes('id="ygazebo-card-quiet"'), 'index.html contains Quiet Moment card');

  // Hotspots for Interior Touch
  assert(html.includes('id="hotspot-yg-cat"'), 'index.html contains Cat & Whale petting hotspot');
  assert(html.includes('id="hotspot-yg-gamepad"'), 'index.html contains Gaming controller & headset hotspot');
  assert(html.includes('id="hotspot-yg-table"'), 'index.html contains Table popcorn & cupcake hotspot');
  assert(html.includes('id="hotspot-yg-lanterns"'), 'index.html contains Lanterns & jellyfish atmosphere cycling hotspot');
  assert(html.includes('id="hotspot-yg-screen"'), 'index.html contains Cinema screen interaction hotspot');

  // Bottom Action Dock (Pojok Kiri Bawah)
  assert(html.includes('id="ygazebo-quick-actions"'), 'index.html contains ygazebo-quick-actions dock');
  assert(html.includes('id="btn-ygazebo-quick-tea"'), 'index.html contains circular Tea Time action button');
  assert(html.includes('id="btn-ygazebo-quick-cinema"'), 'index.html contains circular Astral Cinema action button');
  assert(html.includes('id="btn-ygazebo-songs-we-share"'), 'index.html contains circular Songs We Share action button');

  // Modal Dialog Container
  assert(html.includes('id="ygazebo-modal-backdrop"'), 'index.html contains Gazebo modal backdrop');
  assert(html.includes('id="btn-ygazebo-modal-close"'), 'index.html contains modal close button');
  assert(html.includes('id="ygazebo-modal-body"'), 'index.html contains dynamic modal body');

  // CSS Link in Head
  assert(html.includes('href="/yawn_gazebo.css"'), 'index.html links yawn_gazebo.css in <head>');

  console.log('\n================================================================');
  console.log('3. CSS STYLING & YAWN ASTRAL OCEAN VISUAL IDENTITY');
  console.log('================================================================');

  const css = fs.readFileSync(path.resolve('./yawn_gazebo.css'), 'utf8');

  assert(css.includes('.view-yawn-gazebo'), 'yawn_gazebo.css styles main view container');
  assert(css.includes("url('/assets/yawn_gazebo_bg.jpg')"), 'yawn_gazebo.css references user uploaded background image');
  assert(css.includes('.ygazebo-cards-grid'), 'yawn_gazebo.css styles 4 activity cards grid');
  assert(css.includes('.ygazebo-card'), 'yawn_gazebo.css styles bioluminescent cards');
  assert(css.includes('.ygazebo-quick-actions'), 'yawn_gazebo.css styles bottom left dock');
  assert(css.includes('.btn-ygazebo-circle-action'), 'yawn_gazebo.css styles circular action buttons');
  assert(css.includes('.yg-hotspot-cat'), 'yawn_gazebo.css positions cat hotspot on sofa');
  assert(css.includes('.yg-hotspot-gamepad'), 'yawn_gazebo.css positions gamepad hotspot');
  assert(css.includes('.yg-hotspot-table'), 'yawn_gazebo.css positions refreshments table hotspot');
  assert(css.includes('.yg-hotspot-screen'), 'yawn_gazebo.css positions cinema screen hotspot');
  assert(css.includes('.ygazebo-lighting-overlay'), 'yawn_gazebo.css styles dynamic lighting overlays');
  assert(css.includes('@media (max-width: 640px)'), 'yawn_gazebo.css includes mobile responsive rules');

  console.log('\n================================================================');
  console.log('4. YAWN GAZEBO DATA CATALOGS & STATE ISOLATION');
  console.log('================================================================');

  const {
    YAWN_TEAS,
    YAWN_TREATS,
    YAWN_GAZEBO_LIGHTS,
    YAWN_CINEMA_TRACKS,
    YAWN_JOURNAL_MOODS,
    YAWN_AMBIENT_OPTIONS,
    AKHIRA_HERO_QUOTE,
    AKHIRA_GAZEBO_DIALOGS,
    CAT_AND_WHALE_INTERACTIONS,
    GAMING_INTERACTIONS,
    TABLE_REFRESHMENTS_INTERACTIONS,
    JELLYFISH_INTERACTIONS,
    createDefaultYawnGazeboState,
    loadYawnGazeboState,
    saveYawnGazeboState,
    getYawnGazeboStorageKey,
    createYawnGazeboAudioEngine
  } = await import('./yawn_gazebo_state.js');

  // Teas
  assert(Object.keys(YAWN_TEAS).length === 4, 'YAWN_TEAS contains 4 bioluminescent teas');
  assert(YAWN_TEAS.pearl_tea && YAWN_TEAS.abyss_mint && YAWN_TEAS.astral_lavender && YAWN_TEAS.coral_honey, 'All 4 canonical teas present');

  // Treats
  assert(Object.keys(YAWN_TREATS).length === 3, 'YAWN_TREATS contains 3 sweet treats');

  // Lights
  assert(Object.keys(YAWN_GAZEBO_LIGHTS).length === 4, 'YAWN_GAZEBO_LIGHTS contains 4 lighting atmospheres');

  // Cinema tracks
  assert(YAWN_CINEMA_TRACKS.length >= 3, 'YAWN_CINEMA_TRACKS contains at least 3 tracks');

  // Journal Moods
  assert(YAWN_JOURNAL_MOODS.length === 5, 'YAWN_JOURNAL_MOODS contains 5 philosophical moods');
  assert(YAWN_JOURNAL_MOODS.some(m => m.id === 'calm_abyss'), 'Includes calm_abyss mood');
  assert(YAWN_JOURNAL_MOODS.some(m => m.id === 'lightning_spark'), 'Includes lightning_spark mood');
  assert(YAWN_JOURNAL_MOODS.some(m => m.id === 'astral_dream'), 'Includes astral_dream mood');

  // Ambients
  assert(YAWN_AMBIENT_OPTIONS.length === 4, 'YAWN_AMBIENT_OPTIONS contains 4 ambient soundscapes');

  // Interactions
  assert(CAT_AND_WHALE_INTERACTIONS.length >= 3, 'Cat & whale interactions defined');
  assert(GAMING_INTERACTIONS.length >= 3, 'Gaming controller interactions defined');
  assert(TABLE_REFRESHMENTS_INTERACTIONS.length >= 3, 'Table refreshments interactions defined');
  assert(JELLYFISH_INTERACTIONS.length >= 3, 'Jellyfish lamp interactions defined');
  assert(AKHIRA_HERO_QUOTE.includes('Akhira ⚡'), 'Hero quote matches Akhira YAWN');
  assert(AKHIRA_GAZEBO_DIALOGS.length >= 3, 'Dialog list defined for Akhira');

  // Storage Isolation
  const akhiraStorageKey = getYawnGazeboStorageKey('akhira');
  assert(akhiraStorageKey === 'olu_yawn_gazebo_akhira', 'Storage key is isolated to olu_yawn_gazebo_akhira');

  // State initialization & persistence
  const defaultState = createDefaultYawnGazeboState('akhira');
  assert(defaultState.characterId === 'akhira', 'Default state characterId is akhira');
  assert(defaultState.currentTea === 'pearl_tea', 'Default tea is pearl_tea');
  assert(Array.isArray(defaultState.journals) && defaultState.journals.length >= 2, 'Default state includes seed journals');

  // Audio Engine
  const audio = createYawnGazeboAudioEngine();
  assert(typeof audio.playArcadeChime === 'function', 'Audio engine has playArcadeChime');
  assert(typeof audio.playBubblePop === 'function', 'Audio engine has playBubblePop');
  assert(typeof audio.playOceanChime === 'function', 'Audio engine has playOceanChime');
  assert(typeof audio.playCatPurrTone === 'function', 'Audio engine has playCatPurrTone');
  assert(typeof audio.startCinemaMelody === 'function', 'Audio engine has startCinemaMelody');
  assert(typeof audio.setAmbientSoundscape === 'function', 'Audio engine has setAmbientSoundscape');

  console.log('\n================================================================');
  console.log('5. UNIVERSES_VIEW.JS & YAWN_VIEW.JS INTEGRATION VERIFICATION');
  console.log('================================================================');

  const uvCode = fs.readFileSync(path.resolve('./universes_view.js'), 'utf8');
  const yvCode = fs.readFileSync(path.resolve('./yawn_view.js'), 'utf8');

  assert(uvCode.includes("import { initYawnGazeboView } from './yawn_gazebo_view.js';"), 'universes_view.js imports initYawnGazeboView');
  assert(uvCode.includes('yawnGazeboCtrl.openYawnGazebo'), 'yawnGazeboCtrl.openYawnGazebo wired');
  assert(uvCode.includes('yawnGazeboController: yawnGazeboCtrl'), 'universes_view.js exports yawnGazeboController');
  assert(uvCode.includes('openYawnGazebo:'), 'universes_view.js exports openYawnGazebo method');
  assert(uvCode.includes('closeYawnGazebo:'), 'universes_view.js exports closeYawnGazebo method');

  assert(yvCode.includes('options.onOpenGazebo'), 'yawn_view.js delegates gazebo clicks to options.onOpenGazebo');

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passed}/${total} ASSERTIONS PASSED! YAWN GAZEBO IS READY.`);
  console.log('================================================================');
}

runTests();
