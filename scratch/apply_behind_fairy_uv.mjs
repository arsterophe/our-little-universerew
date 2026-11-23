import fs from 'fs';

const filePath = 'universes_view.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
const targetImport = `import { initKidultBehindView, closeBehindWitch, stopBehindWitchVideo } from './kidult_behind_view.js';`;
const newImport = `import { initKidultBehindView, closeBehindWitch, stopBehindWitchVideo } from './kidult_behind_view.js';
import { initToYouBehindView, closeBehindFairy, stopBehindFairyVideo } from './toyou_behind_view.js';`;

if (!content.includes('from \'./toyou_behind_view.js\';')) {
  if (!content.includes(targetImport)) {
    console.error('Could not find targetImport');
    process.exit(1);
  }
  content = content.replace(targetImport, newImport);
  console.log('✅ Added toyou_behind_view import');
}

// 2. Initialize controller
const targetInit = `  // Initialize Nyanya's Secret Grimoire (BEHIND THE WITCH) controller
  const kidultBehindCtrl = typeof initKidultBehindView === 'function' ? initKidultBehindView({
    onShowToast,
    onTriggerSparkle
  }) : null;`;

const newInit = `  // Initialize Nyanya's Secret Grimoire (BEHIND THE WITCH) controller
  const kidultBehindCtrl = typeof initKidultBehindView === 'function' ? initKidultBehindView({
    onShowToast,
    onTriggerSparkle
  }) : null;

  // Initialize Lala's Secret Fairy Journal (BEHIND THE FAIRY) controller
  const toyouBehindCtrl = typeof initToYouBehindView === 'function' ? initToYouBehindView({
    onShowToast,
    onTriggerSparkle
  }) : null;`;

if (!content.includes('const toyouBehindCtrl = typeof initToYouBehindView')) {
  if (!content.includes(targetInit)) {
    console.error('Could not find targetInit');
    process.exit(1);
  }
  content = content.replace(targetInit, newInit);
  console.log('✅ Initialized toyouBehindCtrl');
}

// 3. Close on closeToYouWorld
const targetClose = `  function closeToYouWorld() {
    flushPendingUniverseSave();
    closeToYouLocationPanel();
    if (bloomCottageCtrl && typeof bloomCottageCtrl.closeBloomCottage === 'function') {
      bloomCottageCtrl.closeBloomCottage();
    }`;

const newClose = `  function closeToYouWorld() {
    flushPendingUniverseSave();
    closeToYouLocationPanel();
    if (bloomCottageCtrl && typeof bloomCottageCtrl.closeBloomCottage === 'function') {
      bloomCottageCtrl.closeBloomCottage();
    }
    if (toyouBehindCtrl && typeof toyouBehindCtrl.closeBehindFairy === 'function') {
      toyouBehindCtrl.closeBehindFairy();
    }`;

if (!content.includes('toyouBehindCtrl.closeBehindFairy();')) {
  if (!content.includes(targetClose)) {
    console.error('Could not find targetClose');
    process.exit(1);
  }
  content = content.replace(targetClose, newClose);
  console.log('✅ Added closeBehindFairy to closeToYouWorld');
}

// 4. Return object additions
const targetReturn = `    bloomCottageController: bloomCottageCtrl,
    openBloomCottage: (char = null, room = 'living') => bloomCottageCtrl?.openBloomCottage(char || activeCharacterKey || activeUser || 'lala', room),
    closeBloomCottage: () => bloomCottageCtrl?.closeBloomCottage(),`;

const newReturn = `    bloomCottageController: bloomCottageCtrl,
    openBloomCottage: (char = null, room = 'living') => bloomCottageCtrl?.openBloomCottage(char || activeCharacterKey || activeUser || 'lala', room),
    closeBloomCottage: () => bloomCottageCtrl?.closeBloomCottage(),
    toyouBehindController: toyouBehindCtrl,
    openBehindFairy: () => toyouBehindCtrl?.openBehindFairy(),
    closeBehindFairy: () => toyouBehindCtrl?.closeBehindFairy(),`;

if (!content.includes('toyouBehindController: toyouBehindCtrl,')) {
  if (!content.includes(targetReturn)) {
    console.error('Could not find targetReturn');
    process.exit(1);
  }
  content = content.replace(targetReturn, newReturn);
  console.log('✅ Added toyouBehindController to return object');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 universes_view.js successfully updated for BEHIND THE FAIRY!');
