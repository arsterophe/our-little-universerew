/**
 * TEST SUITE: SYMA'S PINWHEEL OBSERVATORY & TELESCOPE ACTIVATION
 */

import fs from 'node:fs';

let passed = 0;
let total = 0;

function assert(condition, message, detail = '') {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message} ${detail ? '-> ' + detail : ''}`);
    process.exitCode = 1;
  }
}

console.log('================================================================');
console.log('1. DOM STRUCTURE IN INDEX.HTML');
console.log('================================================================');

const indexHtml = fs.readFileSync('./index.html', 'utf8');

assert(
  indexHtml.includes('id="btn-loc-pinwheel-observatory"') &&
  indexHtml.includes('data-pinwheel-loc="observatory"'),
  'Observatory button in view-pinwheel-world has id and data-pinwheel-loc="observatory"'
);

assert(
  indexHtml.includes('id="pinwheel-observatory-modal"'),
  'Observatory modal exists in view-pinwheel-world'
);

assert(
  indexHtml.includes('id="btn-pinwheel-open-telescope"'),
  'Observatory modal contains action button to open telescope (id="btn-pinwheel-open-telescope")'
);

assert(
  indexHtml.includes('Arahkan Teleskop Bintang (Star Messages)'),
  'Observatory action button text mentions Teleskop Bintang / Star Messages'
);

console.log('\n================================================================');
console.log('2. PINWHEEL VIEW & CONTROLLER (pinwheel_view.js)');
console.log('================================================================');

const pinwheelViewJs = fs.readFileSync('./pinwheel_view.js', 'utf8');

assert(
  pinwheelViewJs.includes('onNavigateStarMessages'),
  'initPinwheelWorld accepts onNavigateStarMessages parameter'
);

assert(
  pinwheelViewJs.includes('openTelescope'),
  'pinwheel_view.js implements openTelescope bridge function'
);

assert(
  pinwheelViewJs.includes('btn-pinwheel-open-telescope'),
  'pinwheel_view.js queries and attaches event listener to btn-pinwheel-open-telescope'
);

assert(
  pinwheelViewJs.includes("'view-star-messages'"),
  'openPinwheelWorld hides view-star-messages when entering Pinwheel'
);

console.log('\n================================================================');
console.log('3. UNIVERSES VIEW INTEGRATION (universes_view.js)');
console.log('================================================================');

const universesViewJs = fs.readFileSync('./universes_view.js', 'utf8');

assert(
  universesViewJs.includes('initPinwheelWorld') &&
  universesViewJs.includes('onNavigateStarMessages'),
  'universes_view.js passes onNavigateStarMessages to initPinwheelWorld'
);

console.log('\n================================================================');
console.log('4. STAR MESSAGES VIEW & THEME (star_messages_view.js & star_messages.css)');
console.log('================================================================');

const starMessagesViewJs = fs.readFileSync('./star_messages_view.js', 'utf8');
const starMessagesCss = fs.readFileSync('./star_messages.css', 'utf8');

assert(
  starMessagesViewJs.includes("'theme-pinwheel'"),
  'star_messages_view.js handles theme-pinwheel class'
);

assert(
  starMessagesViewJs.includes("PINWHEEL · SYMA'S UNIVERSE"),
  'star_messages_view.js displays PINWHEEL · SYMA\'S UNIVERSE in HUD tag'
);

assert(
  starMessagesViewJs.includes("'view-pinwheel-world'"),
  'openStarMessages hides view-pinwheel-world when opening telescope'
);

assert(
  starMessagesCss.includes('.view-star-messages.theme-pinwheel'),
  'star_messages.css defines .view-star-messages.theme-pinwheel'
);

assert(
  starMessagesCss.includes('--star-accent: #93c5fd') &&
  starMessagesCss.includes('--star-primary: #38bdf8'),
  'theme-pinwheel uses Pinwheel cyan & sky-blue color palette'
);

console.log('\n================================================================');
console.log('5. MAIN NAVIGATION RETURN ROUTING (main.js)');
console.log('================================================================');

const mainJs = fs.readFileSync('./main.js', 'utf8');

assert(
  mainJs.includes("originUniverse === 'pinwheel'") &&
  mainJs.includes('univCtrl.openPinwheelWorld()'),
  'main.js onNavigateBack routes pinwheel back to univCtrl.openPinwheelWorld()'
);

console.log('\n================================================================');
console.log('6. SYMA CELESTIAL STAR IN STAR MESSAGES (star-seed-4)');
console.log('================================================================');

assert(
  starMessagesViewJs.includes("id: 'star-seed-4'") &&
  starMessagesViewJs.includes("senderName: 'Syma'") &&
  starMessagesViewJs.includes("senderCharacter: 'abil'") &&
  starMessagesViewJs.includes("universeOrigin: 'pinwheel'"),
  'star_messages_view.js defines Syma star (star-seed-4) with canonical PINWHEEL metadata'
);

assert(
  starMessagesViewJs.includes('x: 74.0') &&
  starMessagesViewJs.includes('y: 56.0'),
  'Syma star is positioned at coordinates (74%, 56%) to prevent overlap with Nyanya, Lala, or Lele'
);

assert(
  starMessagesViewJs.includes('star-node-pinwheel') &&
  starMessagesViewJs.includes("starIcon = isSyma ? '☁️'"),
  'Syma star renders with custom PINWHEEL class and ☁️ canonical icon'
);

assert(
  starMessagesCss.includes('.celestial-star-node.star-node-pinwheel') &&
  starMessagesCss.includes('symaStarTwinkle'),
  'star_messages.css includes .star-node-pinwheel and symaStarTwinkle cyan glow animations'
);

console.log('\n================================================================');
console.log(`SUMMARY: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================');

