/**
 * Automated Verification Suite for Cinema Akhira — THE QUIET ABYSS
 * Testing all functional domains, states, audio synthesizers, storage isolation, and DOM wiring.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

import {
  AKHIRA_CANONICAL_UID,
  AKHIRA_CANONICAL_ID,
  CINEMA_CATEGORIES,
  CINEMA_FILMS,
  OCEAN_SOUNDSCAPES,
  RESTING_STATES,
  LETTER_CATEGORIES,
  DEFAULT_AKHIRA_LETTERS,
  LIGHTING_MODES,
  CEILING_PROJECTIONS,
  getYawnCinemaStorageKey,
  createDefaultYawnCinemaState,
  loadYawnCinemaState,
  saveYawnCinemaState,
  createYawnCinemaAudioEngine
} from './yawn_cinema_state.js';

let passedCount = 0;
let totalCount = 0;

function it(description, fn) {
  totalCount++;
  try {
    fn();
    passedCount++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(err);
  }
}

console.log('\n--- SUITE: Cinema Akhira (THE QUIET ABYSS) Verification ---\n');

// 1. Files & Assets Verification
it('public/assets/yawn_cinema_bg.jpg exists and is non-empty', () => {
  const p = path.resolve('public/assets/yawn_cinema_bg.jpg');
  assert.ok(fs.existsSync(p), 'Background file exists');
  const stat = fs.statSync(p);
  assert.ok(stat.size > 50000, 'Background size > 50KB');
});

it('yawn_cinema_state.js, yawn_cinema_view.js, and yawn_cinema.css exist', () => {
  assert.ok(fs.existsSync(path.resolve('yawn_cinema_state.js')), 'yawn_cinema_state.js exists');
  assert.ok(fs.existsSync(path.resolve('yawn_cinema_view.js')), 'yawn_cinema_view.js exists');
  assert.ok(fs.existsSync(path.resolve('yawn_cinema.css')), 'yawn_cinema.css exists');
});

// 2. Constants & Identity
it('Akhira identity canonical constants match project architecture', () => {
  assert.strictEqual(AKHIRA_CANONICAL_UID, 'MT14ZHATNqe90frAeQ74QFk4iXs2');
  assert.strictEqual(AKHIRA_CANONICAL_ID, 'akhira');
});

// 3. Ocean Soundscape Verification (6 Required Types)
it('Contains exactly 6 required ocean soundscapes with correct IDs', () => {
  assert.strictEqual(OCEAN_SOUNDSCAPES.length, 6, 'Must have 6 soundscapes');
  const expectedIds = [
    'ocean_current',
    'whale_song',
    'crystal_bells',
    'soft_rain',
    'deep_sea_bubbles',
    'gentle_instrumental'
  ];
  const actualIds = OCEAN_SOUNDSCAPES.map(s => s.id);
  expectedIds.forEach(id => {
    assert.ok(actualIds.includes(id), `Missing soundscape: ${id}`);
  });
});

// 4. Cinema Channels & Films
it('Cinema categories and films are defined with complete metadata', () => {
  assert.ok(CINEMA_CATEGORIES.length >= 4, 'Categories defined');
  assert.ok(CINEMA_FILMS.length >= 5, 'Films collection populated');
  CINEMA_FILMS.forEach(film => {
    assert.ok(film.id, 'Film has id');
    assert.ok(film.title, 'Film has title');
    assert.ok(film.category, 'Film has category');
    assert.ok(film.duration, 'Film has duration');
    assert.ok(film.desc, 'Film has desc');
  });
});

// 5. Do Nothing Corner Resting States
it('Do Nothing Corner provides 4 distinct comfortable resting states', () => {
  const keys = Object.keys(RESTING_STATES);
  assert.ok(keys.includes('sitting'));
  assert.ok(keys.includes('curled_with_blanket'));
  assert.ok(keys.includes('whale_hug'));
  assert.ok(keys.includes('reclining'));
});

// 6. Letters to Myself Categories & Seeds
it('Letters to Myself provides required reflection categories & initial letters', () => {
  const catIds = LETTER_CATEGORIES.map(c => c.id);
  assert.ok(catIds.includes('catatan_hari_ini'));
  assert.ok(catIds.includes('yang_ingin_kulepaskan'));
  assert.ok(catIds.includes('harapan_kecil'));
  assert.ok(catIds.includes('terima_kasih_diriku'));
  assert.ok(DEFAULT_AKHIRA_LETTERS.length >= 3, 'Pre-seeded comforting letters for Akhira');
});

// 7. Lighting & Projections
it('Atmosphere includes 4 lighting modes and 4 ceiling projection options', () => {
  assert.strictEqual(LIGHTING_MODES.length, 4);
  assert.strictEqual(CEILING_PROJECTIONS.length, 4);
  const lightIds = LIGHTING_MODES.map(m => m.id);
  assert.ok(lightIds.includes('light-deep'));
  assert.ok(lightIds.includes('light-aurora'));
  assert.ok(lightIds.includes('light-warm'));
  assert.ok(lightIds.includes('light-cinema'));
});

// 8. Storage Isolation
it('Storage partition key is strictly isolated to Akhira', () => {
  assert.strictEqual(getYawnCinemaStorageKey('akhira'), 'olu_yawn_cinema_akhira');
  assert.strictEqual(getYawnCinemaStorageKey('AKHIRA'), 'olu_yawn_cinema_akhira');
});

it('Default state initializes with clean defaults', () => {
  const def = createDefaultYawnCinemaState('akhira');
  assert.strictEqual(def.characterId, 'akhira');
  assert.strictEqual(def.activeSoundscape, 'none');
  assert.strictEqual(def.activeLightingMode, 'light-deep');
  assert.strictEqual(def.activeCeilingProjection, 'caustics');
  assert.strictEqual(def.restingState, 'sitting');
  assert.strictEqual(def.blanketWrapped, false);
  assert.strictEqual(def.whaleHugged, false);
  assert.strictEqual(def.tableLanternOn, true);
  assert.ok(Array.isArray(def.letters));
  assert.ok(Array.isArray(def.favoriteFilmIds));
});

// 9. Audio Engine API Contract
it('createYawnCinemaAudioEngine provides full public API without errors in node env', () => {
  const engine = createYawnCinemaAudioEngine();
  assert.strictEqual(typeof engine.initAudioContext, 'function');
  assert.strictEqual(typeof engine.setVolume, 'function');
  assert.strictEqual(typeof engine.getVolume, 'function');
  assert.strictEqual(typeof engine.setSoundscape, 'function');
  assert.strictEqual(typeof engine.getCurrentSound, 'function');
  assert.strictEqual(typeof engine.stopAllSoundscape, 'function');
  assert.strictEqual(typeof engine.playUiTone, 'function');
  // Safe invocation when AudioContext is absent in node
  engine.setVolume(0.5);
  assert.strictEqual(engine.getVolume(), 0.5);
  engine.setSoundscape('whale_song');
  engine.stopAllSoundscape();
  assert.strictEqual(engine.getCurrentSound(), 'none');
});

// 10. DOM Structure in index.html
it('index.html includes stylesheet and #view-yawn-cinema with all elements', () => {
  const html = fs.readFileSync(path.resolve('index.html'), 'utf-8');
  assert.ok(html.includes('<link rel="stylesheet" href="/yawn_cinema.css">'), 'Stylesheet linked');
  assert.ok(html.includes('id="view-yawn-cinema"'), 'View container present');
  assert.ok(html.includes('id="btn-ycinema-back"'), 'Back button present');
  assert.ok(html.includes('id="btn-ycinema-quick-audio"'), 'Quick audio button present');
  assert.ok(html.includes('id="btn-ycinema-lighting"'), 'Lighting switcher present');
  assert.ok(html.includes('id="btn-ycinema-ceiling"'), 'Ceiling switcher present');
  assert.ok(html.includes('id="btn-ycinema-observation"'), 'Observation switcher present');
  assert.ok(html.includes('id="ycinema-welcome-card"'), 'Welcome card present');
  assert.ok(html.includes('id="btn-spot-cinema-screen"'), 'Screen hotspot present');
  assert.ok(html.includes('id="btn-spot-do-nothing"'), 'Do nothing hotspot present');
  assert.ok(html.includes('id="btn-spot-whale-watch"'), 'Whale watch hotspot present');
  assert.ok(html.includes('id="btn-spot-letters"'), 'Letters hotspot present');
  assert.ok(html.includes('id="btn-spot-soundscape"'), 'Soundscape hotspot present');
  assert.ok(html.includes('id="btn-stage-blanket-toggle"'), 'Stage blanket toggle present');
  assert.ok(html.includes('id="btn-stage-whale-hug"'), 'Stage whale hug present');
  assert.ok(html.includes('id="btn-stage-lantern-toggle"'), 'Stage lantern toggle present');
  assert.ok(html.includes('id="btn-exit-whale-watch"'), 'Observation exit button present');
  assert.ok(html.includes('id="ycinema-player-modal"'), 'Player modal present');
  assert.ok(html.includes('id="ycinema-donothing-modal"'), 'Do nothing modal present');
  assert.ok(html.includes('id="ycinema-soundscape-modal"'), 'Soundscape modal present');
  assert.ok(html.includes('id="ycinema-letters-modal"'), 'Letters modal present');
  assert.ok(html.includes('id="ycinema-screen-canvas"'), 'Canvas visualizer present');
});

// 11. CSS Validation
it('yawn_cinema.css defines all visual rules, lighting themes, animations, and modal active states', () => {
  const css = fs.readFileSync(path.resolve('yawn_cinema.css'), 'utf-8');
  assert.ok(css.includes('.view-yawn-cinema'), 'Root view styling');
  assert.ok(css.includes('.light-deep'), 'Deep lighting');
  assert.ok(css.includes('.light-aurora'), 'Aurora lighting');
  assert.ok(css.includes('.light-warm'), 'Warm lighting');
  assert.ok(css.includes('.light-cinema'), 'Cinema lighting');
  assert.ok(css.includes('.proj-caustics'), 'Caustics animation');
  assert.ok(css.includes('.whale-watching-active'), 'Observation mode styling');
  assert.ok(css.includes('display: flex !important;'), 'Modal active override for style.css compatibility');
});

// 12. Universes & View Wiring
it('universes_view.js wires initYawnCinemaView and exports controller methods', () => {
  const univSrc = fs.readFileSync(path.resolve('universes_view.js'), 'utf-8');
  assert.ok(univSrc.includes("import { initYawnCinemaView } from './yawn_cinema_view.js';"), 'Imported in universes_view');
  assert.ok(univSrc.includes('onOpenCinema: () => {'), 'Wired onOpenCinema in initYawnWorld');
  assert.ok(univSrc.includes('yawnCinemaCtrl = typeof initYawnCinemaView === \'function\' ? initYawnCinemaView'), 'Initialized yawnCinemaCtrl');
  assert.ok(univSrc.includes('openYawnCinema: (user = activeAuthUser) => yawnCinemaCtrl?.openYawnCinema(user)'), 'Exported openYawnCinema');
  assert.ok(univSrc.includes('closeYawnCinema: () => yawnCinemaCtrl?.closeYawnCinema()'), 'Exported closeYawnCinema');
  assert.ok(univSrc.includes('yawnCinemaController: yawnCinemaCtrl'), 'Exported yawnCinemaController');
});

it('yawn_view.js wires cinema hotspot buttons to onOpenCinema with fallback', () => {
  const yawnSrc = fs.readFileSync(path.resolve('yawn_view.js'), 'utf-8');
  assert.ok(yawnSrc.includes("document.querySelector('.btn-loc-yawn-cinema')?.addEventListener('click', () => {"), 'Class click handler wired');
  assert.ok(yawnSrc.includes("document.getElementById('btn-loc-yawn-cinema')?.addEventListener('click', () => {"), 'ID click handler wired');
  assert.ok(yawnSrc.includes('options.onOpenCinema()'), 'Calls options.onOpenCinema');
});

it('main.js includes view-yawn-cinema in view reset and protected lists', () => {
  const mainSrc = fs.readFileSync(path.resolve('main.js'), 'utf-8');
  assert.ok(mainSrc.includes("'view-yawn-cinema'"), 'Included in main.js view arrays');
});

console.log(`\n========================================`);
console.log(`Test Results: ${passedCount} / ${totalCount} PASSED`);
console.log(`========================================\n`);

if (passedCount !== totalCount) {
  process.exit(1);
}
