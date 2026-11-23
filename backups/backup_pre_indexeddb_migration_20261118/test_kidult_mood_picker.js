// test_kidult_mood_picker.js
// Automated verification test suite for KIDULT Layout & Minimalist Mood Picker

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('=== TEST SUITE: KIDULT LAYOUT & MINIMALIST MOOD PICKER ===\n');

// 1. Verify index.html structure
console.log('1. Checking index.html Structure:');
const indexHtmlPath = path.join(__dirname, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

assert(indexHtml.includes('class="kidult-mood-container"'), 'Contains .kidult-mood-container');
assert(indexHtml.includes('id="btn-toggle-mood-picker"'), 'Contains toggle button #btn-toggle-mood-picker');
assert(indexHtml.includes('id="kidult-mood-options-bar"'), 'Contains horizontal options bar #kidult-mood-options-bar');
assert(indexHtml.includes('Mood Hari Ini'), 'Displays "Mood Hari Ini" header');

const requiredMoods = [
  { id: 'bahagia', label: 'Bahagia', icon: '😊' },
  { id: 'bersemangat', label: 'Bersemangat', icon: '🥰' },
  { id: 'tenang', label: 'Tenang', icon: '🌸' },
  { id: 'sedih', label: 'Sedih', icon: '🌧️' },
  { id: 'lelah', label: 'Lelah', icon: '🌙' },
  { id: 'bersyukur', label: 'Bersyukur', icon: '✨' },
  { id: 'melamun', label: 'Melamun', icon: '💭' },
];

requiredMoods.forEach(m => {
  assert(
    indexHtml.includes(`data-mood="${m.id}"`) &&
    indexHtml.includes(m.label) &&
    indexHtml.includes(m.icon),
    `Contains mood pill for "${m.label}" (${m.icon})`
  );
});

// 2. Verify universes.css styling
console.log('\n2. Checking universes.css Layout & Styling:');
const universesCssPath = path.join(__dirname, 'universes.css');
const universesCss = fs.readFileSync(universesCssPath, 'utf8');

assert(universesCss.includes('.view-kidult-world {') && universesCss.includes('overflow: hidden'), '.view-kidult-world has overflow: hidden to eliminate page scroll');
assert(universesCss.includes('.kidult-2d-stage {') && universesCss.includes('max-height: 100vh'), '.kidult-2d-stage locked to viewport height');
assert(universesCss.includes('.kidult-mood-container {'), '.kidult-mood-container defined');
assert(universesCss.includes('.kidult-mood-options-bar {'), '.kidult-mood-options-bar defined');
assert(universesCss.includes('.kidult-mood-options-bar.is-open'), '.kidult-mood-options-bar.is-open toggle rule defined');
assert(universesCss.includes('.mood-option-pill.active'), '.mood-option-pill.active glowing aesthetic defined');
assert(universesCss.includes('body:has(.view-kidult-world.active)'), 'Body overflow locked when KIDULT is active');

// 3. Verify universe_state.css dock fix
console.log('\n3. Checking universe_state.css Offscreen Dock Fix:');
const universeStateCssPath = path.join(__dirname, 'universe_state.css');
const universeStateCss = fs.readFileSync(universeStateCssPath, 'utf8');

assert(universeStateCss.includes('visibility: hidden;'), '.universe-decor-dock has visibility: hidden when closed');
assert(universeStateCss.includes('.universe-decor-dock.open') && universeStateCss.includes('visibility: visible;'), '.universe-decor-dock has visibility: visible when open');

// 4. Verify universes_view.js logic
console.log('\n4. Checking universes_view.js Logic & Persistence:');
const universesViewPath = path.join(__dirname, 'universes_view.js');
const universesViewJs = fs.readFileSync(universesViewPath, 'utf8');

assert(universesViewJs.includes('export const KIDULT_MOODS ='), 'Exports KIDULT_MOODS dictionary');
assert(universesViewJs.includes('function applyKidultMood('), 'Defines applyKidultMood');
assert(universesViewJs.includes('function toggleMoodPicker('), 'Defines toggleMoodPicker');
assert(universesViewJs.includes('function restoreKidultMood('), 'Defines restoreKidultMood');
assert(universesViewJs.includes('olu_kidult_mood_'), 'Uses user-scoped localStorage key olu_kidult_mood_${uid}');
assert(universesViewJs.includes("updateElementState('gazebo', { mood: moodData.id })"), 'Persists mood into gazebo element state in Firestore');
assert(universesViewJs.includes('btnToggleMoodPicker.addEventListener') && universesViewJs.includes('kidultMoodContainer.contains(e.target)'), 'Initializes mood picker toggle, pill selection, and click-outside handling');

// 5. Verify universe_state.js default gazebo state
console.log('\n5. Checking universe_state.js Default State:');
const universeStateJsPath = path.join(__dirname, 'universe_state.js');
const universeStateJs = fs.readFileSync(universeStateJsPath, 'utf8');

assert(universeStateJs.includes("mood: 'tenang'"), 'Default gazebo element state includes mood: "tenang"');

// Summary
console.log(`\n========================================`);
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${totalTests - passedTests}`);
console.log(`SUCCESS RATE: ${Math.round((passedTests / totalTests) * 100)}%`);
console.log(`========================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
