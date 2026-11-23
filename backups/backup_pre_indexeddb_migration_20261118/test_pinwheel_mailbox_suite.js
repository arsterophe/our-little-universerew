/**
 * Unit & Integration Test Suite: Syma's Universe (PINWHEEL) Mailbox & Kotak Pos
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

async function run() {
  console.log('================================================================');
  console.log('1. VERIFY FIREBASE.JS LETTER THEMES & CHARACTERS');
  console.log('================================================================');
  const { CANONICAL_CHARACTERS, LETTER_PAPER_THEMES, dbSendLetter } = await import('./firebase.js');

  assert(CANONICAL_CHARACTERS.abil !== undefined, 'Syma (abil) exists in CANONICAL_CHARACTERS');
  assert(CANONICAL_CHARACTERS.abil.uid === 'Euc0JLt3kWMveUEIjBwXHfOfvQD3', 'Syma canonical UID matches');
  assert(CANONICAL_CHARACTERS.abil.universe === 'PINWHEEL', 'Syma canonical universe is PINWHEEL');
  assert(Object.keys(CANONICAL_CHARACTERS).length >= 8, 'All 8 canonical characters are defined');

  assert(LETTER_PAPER_THEMES.pinwheel !== undefined, 'PINWHEEL paper theme exists');
  assert(LETTER_PAPER_THEMES.pinwheel.name.includes('PINWHEEL'), 'PINWHEEL paper theme name includes PINWHEEL');
  assert(LETTER_PAPER_THEMES.pinwheel.icon === '🎐', 'PINWHEEL paper theme icon is wind chime 🎐');

  console.log('\n================================================================');
  console.log('2. VERIFY FIRESTORE RULES FOR LETTERS');
  console.log('================================================================');
  const rules = fs.readFileSync('firestore.rules', 'utf8');

  assert(rules.includes("'Euc0JLt3kWMveUEIjBwXHfOfvQD3'"), 'firestore.rules contains Syma UID');
  assert(rules.includes("'abil'"), 'firestore.rules contains character abil');
  assert(rules.includes("'pinwheel'"), 'firestore.rules contains universe pinwheel in origins');
  assert(rules.includes("isValidStarCharacterMapping(uid, charKey)"), 'firestore.rules maps characters to UIDs');

  console.log('\n================================================================');
  console.log('3. VERIFY HTML DOM & CSS FOR PINWHEEL MAILBOX');
  console.log('================================================================');
  const html = fs.readFileSync('index.html', 'utf8');
  const pinwheelCss = fs.readFileSync('pinwheel.css', 'utf8');
  const mailboxCss = fs.readFileSync('mailbox.css', 'utf8');

  assert(html.includes('id="btn-loc-pinwheel-mailbox"'), 'btn-loc-pinwheel-mailbox hotspot exists');
  assert(html.includes('id="pinwheel-mailbox-unread-badge"'), 'pinwheel-mailbox-unread-badge exists');
  assert(html.includes('id="pinwheel-mailbox-modal"'), 'pinwheel-mailbox-modal exists');
  assert(html.includes('id="btn-pinwheel-open-mailbox"'), 'btn-pinwheel-open-mailbox button exists');
  assert(html.includes('data-paper="pinwheel"'), 'pinwheel paper theme option exists in mailbox selector');

  assert(pinwheelCss.includes('.pinwheel-mailbox-badge'), 'pinwheel.css styles unread badge');
  assert(pinwheelCss.includes('.btn-loc-mailbox.has-unread'), 'pinwheel.css styles has-unread pulsing state');
  assert(mailboxCss.includes('.view-kotak-pos.theme-pinwheel'), 'mailbox.css has .theme-pinwheel styles');

  console.log('\n================================================================');
  console.log('4. VERIFY VIEW CONTROLLER CONNECTIONS');
  console.log('================================================================');
  const pinwheelViewSrc = fs.readFileSync('pinwheel_view.js', 'utf8');
  const universesViewSrc = fs.readFileSync('universes_view.js', 'utf8');
  const mailboxViewSrc = fs.readFileSync('mailbox_view.js', 'utf8');

  assert(pinwheelViewSrc.includes('onNavigateKotakPos'), 'pinwheel_view.js accepts onNavigateKotakPos');
  assert(pinwheelViewSrc.includes('openPinwheelMailbox'), 'pinwheel_view.js defines openPinwheelMailbox');
  assert(pinwheelViewSrc.includes('subscribeMailboxUnread'), 'pinwheel_view.js defines subscribeMailboxUnread');
  assert(pinwheelViewSrc.includes('btn-pinwheel-open-mailbox'), 'pinwheel_view.js binds btn-pinwheel-open-mailbox');

  assert(universesViewSrc.includes("onNavigateKotakPos: (originUniv = 'pinwheel')"), 'universes_view.js passes onNavigateKotakPos to initPinwheelWorld');

  assert(mailboxViewSrc.includes("'theme-pinwheel'"), 'mailbox_view.js assigns theme-pinwheel');
  assert(mailboxViewSrc.includes("PINWHEEL · SYMA'S UNIVERSE"), 'mailbox_view.js sets PINWHEEL title');
  assert(mailboxViewSrc.includes("selectPaperTheme('pinwheel')"), 'mailbox_view.js sets default paper theme to pinwheel');

  console.log('\n================================================================');
  console.log(`ALL TESTS PASSED: ${passed}/${total}`);
  console.log('================================================================');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
