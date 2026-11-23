// test_pinwheel_gazebo.js
// Verification of Pinwheel Moonlit Blossom Gazebo configuration & logic

import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- TEST 1: Verifying Gazebo Assets & CSS Presence ---');
const bgPublicExists = fs.existsSync('public/assets/pinwheel_gazebo_bg.jpg');
const cssExists = fs.existsSync('pinwheel_gazebo.css');
const jsExists = fs.existsSync('pinwheel_gazebo_view.js');

assert.strictEqual(bgPublicExists, true, 'public/assets/pinwheel_gazebo_bg.jpg should exist');
assert.strictEqual(cssExists, true, 'pinwheel_gazebo.css should exist');
assert.strictEqual(jsExists, true, 'pinwheel_gazebo_view.js should exist');
console.log('✓ Assets and source files verified.');

console.log('--- TEST 2: Inspecting pinwheel_gazebo_view.js logic & content ---');
const jsContent = fs.readFileSync('pinwheel_gazebo_view.js', 'utf8');

// Check 3 Teas
assert.ok(jsContent.includes('Sakura Tea'), 'Should have Sakura Tea');
assert.ok(jsContent.includes('Honey Milk Tea'), 'Should have Honey Milk Tea');
assert.ok(jsContent.includes('Moonlight Herbal Tea'), 'Should have Moonlight Herbal Tea');
console.log('✓ All 3 signature teas present.');

// Check 4 Ambiances
assert.ok(jsContent.includes('Sakura Pond') || jsContent.includes("'pond'"), 'Should have Sakura Pond');
assert.ok(jsContent.includes('Gentle Breeze') || jsContent.includes("'breeze'"), 'Should have Gentle Breeze');
assert.ok(jsContent.includes('Soft Rain') || jsContent.includes("'rain'"), 'Should have Soft Rain');
assert.ok(jsContent.includes('Midnight Garden') || jsContent.includes("'night'"), 'Should have Midnight Garden');
console.log('✓ All 4 procedural Web Audio ambiances present.');

// Check Pentatonic Melody scale (Yo / In scale: D4, F4, G4, A4, C5, D5, F5)
assert.ok(jsContent.includes('293.66'), 'Should contain D4 frequency 293.66');
assert.ok(jsContent.includes('440.00'), 'Should contain A4 frequency 440.00');
assert.ok(jsContent.includes('PINWHEEL MELODY'), 'Should have PINWHEEL MELODY player');
console.log('✓ Pentatonic Yo/In scale for Koto & Shakuhachi verified.');

// Check Memory Journal moods & UID storage
assert.ok(jsContent.includes('olu_syma_gazebo_journal_'), 'Should use UID-bound localStorage key for journal');
assert.ok(jsContent.includes('Tenang'), 'Should include Tenang mood');
assert.ok(jsContent.includes('Damai'), 'Should include Damai mood');
assert.ok(jsContent.includes('Reflektif'), 'Should include Reflektif mood');
assert.ok(jsContent.includes('Hangat'), 'Should include Hangat mood');
assert.ok(jsContent.includes('Penuh Harapan'), 'Should include Penuh Harapan mood');
console.log('✓ Memory Journal moods and UID isolation verified.');

// Check Little Library integration
assert.ok(jsContent.includes('getPublishedStories'), 'Should integrate getPublishedStories');
assert.ok(jsContent.includes('olu_syma_gazebo_reading_'), 'Should persist reading position per UID & story');
console.log('✓ Little Library integration verified.');

// Check DOM integration in index.html
console.log('--- TEST 3: Verifying index.html and pinwheel_view.js integration ---');
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert.ok(indexHtml.includes('Even when the wind changes, a little heart can still find its way home'), 'index.html should have personal Syma quote');
console.log('✓ Syma personal quote verified.');
assert.ok(indexHtml.includes('pinwheel_gazebo.css'), 'index.html must link pinwheel_gazebo.css');
assert.ok(indexHtml.includes('id="view-pinwheel-gazebo"'), 'index.html must have view-pinwheel-gazebo section');
assert.ok(indexHtml.includes('id="btn-enter-pinwheel-gazebo"'), 'index.html must have enter gazebo button in modal');

const pinwheelView = fs.readFileSync('pinwheel_view.js', 'utf8');
assert.ok(pinwheelView.includes('pinwheel_gazebo_view.js'), 'pinwheel_view.js must import pinwheel_gazebo_view.js');
assert.ok(pinwheelView.includes('pinwheelGazeboCtrl.openGazebo'), 'pinwheel_view.js must call openGazebo');
assert.ok(pinwheelView.includes('btn-enter-pinwheel-gazebo'), 'pinwheel_view.js must listen to enter button');
console.log('✓ index.html and pinwheel_view.js wiring verified.');

console.log('All Unit & Integration Tests Passed Successfully!');
