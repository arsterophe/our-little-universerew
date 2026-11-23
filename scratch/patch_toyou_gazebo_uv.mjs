import fs from 'fs';

const path = 'universes_view.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('initToyouGazeboView')) {
  content = content.replace(
    "import { initFairyAtelierView } from './fairy_atelier_view.js';",
    "import { initFairyAtelierView } from './fairy_atelier_view.js';\nimport { initToyouGazeboView } from './toyou_gazebo_view.js';"
  );
  console.log('Added initToyouGazeboView import');
}

// 2. Update TOYOU_LOCATIONS.gazebo
const oldGazeboMarker = `  gazebo: {
    id: 'gazebo',
    icon: '🏛',
    tag: 'LOKASI E · TO YOU',
    title: 'Gazebo',`;

const newGazeboDef = `  gazebo: {
    id: 'gazebo',
    icon: '🏛',
    tag: 'LOKASI E · TO YOU',
    title: 'Gazebo Pagi',
    subtitle: 'Everglow Morning Gazebo Sanctuary',
    description: 'Gazebo melingkar anggun bernuansa wisteria ungu dan fajar keemasan di tepi sungai TO YOU. Tempat ternyaman untuk menikmati teh bunga segar, membaca dongeng, merenung, dan memetik melodi gitar akustik.',
    highlight: '🫖 Tea Time · 📖 Perpustakaan Kecil · 📜 Jurnal Kenangan · 🔮 Quiet Moment',
    actionLabel: 'Bersantai di Gazebo Pagi ☼',
    actionType: 'toyou_gazebo',
    toastMsg: '🏛 Memasuki Gazebo Lala — Everglow Morning Sanctuary 🌸'
  },`;

if (content.includes(oldGazeboMarker)) {
  // Find start and end of gazebo object
  const startIdx = content.indexOf(oldGazeboMarker);
  const endIdx = content.indexOf('  ladang_kupu:', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newGazeboDef + '\n' + content.substring(endIdx);
    console.log('Updated TOYOU_LOCATIONS.gazebo definition');
  }
}

// 3. Initialize toyouGazeboCtrl
const fairyCtrlMarker = `  const fairyAtelierCtrl = typeof initFairyAtelierView === 'function' ? initFairyAtelierView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewToYou = document.getElementById('view-toyou-world');
      if (viewToYou) {
        viewToYou.classList.add('active');
        viewToYou.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;`;

const toyouGazeboCtrlInit = `  const toyouGazeboCtrl = typeof initToyouGazeboView === 'function' ? initToyouGazeboView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewToYou = document.getElementById('view-toyou-world');
      if (viewToYou) {
        viewToYou.classList.add('active');
        viewToYou.setAttribute('aria-hidden', 'false');
      }
    },
    onNavigateStoryWorkspace
  }) : null;`;

if (!content.includes('toyouGazeboCtrl =') && content.includes(fairyCtrlMarker)) {
  content = content.replace(fairyCtrlMarker, `${fairyCtrlMarker}\n\n${toyouGazeboCtrlInit}`);
  console.log('Added toyouGazeboCtrl initialization');
}

// 4. Hotspot repeat click for gazebo
const atelierHotspotMarker = `      if (locKey === 'atelier' && activeToYouLocationKey === 'atelier') {`;
const gazeboHotspotClick = `      if (locKey === 'gazebo' && activeToYouLocationKey === 'gazebo') {
        if (toyouGazeboCtrl && typeof toyouGazeboCtrl.openToyouGazebo === 'function') {
          closeToYouLocationPanel();
          if (viewToYouWorld) {
            viewToYouWorld.classList.remove('active');
            viewToYouWorld.setAttribute('aria-hidden', 'true');
          }
          toyouGazeboCtrl.openToyouGazebo(activeCharacterKey || activeUser || 'lala');
          return;
        }
      }
      if (locKey === 'atelier' && activeToYouLocationKey === 'atelier') {`;

if (!content.includes("locKey === 'gazebo' && activeToYouLocationKey === 'gazebo'") && content.includes(atelierHotspotMarker)) {
  content = content.replace(atelierHotspotMarker, gazeboHotspotClick);
  console.log('Added gazebo repeat click direct entry');
}

// 5. Hotspot dblclick for gazebo
const atelierDblMarker = `      if (locKey === 'atelier' && fairyAtelierCtrl && typeof fairyAtelierCtrl.openFairyAtelier === 'function') {`;
const gazeboDblClick = `      if (locKey === 'gazebo' && toyouGazeboCtrl && typeof toyouGazeboCtrl.openToyouGazebo === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        toyouGazeboCtrl.openToyouGazebo(activeCharacterKey || activeUser || 'lala');
        return;
      }
      if (locKey === 'atelier' && fairyAtelierCtrl && typeof fairyAtelierCtrl.openFairyAtelier === 'function') {`;

if (!content.includes("locKey === 'gazebo' && toyouGazeboCtrl") && content.includes(atelierDblMarker)) {
  content = content.replace(atelierDblMarker, gazeboDblClick);
  console.log('Added gazebo dblclick direct entry');
}

// 6. Action button click
const fairyActionMarker = `      if (loc.actionType === 'fairy_atelier') {`;
const gazeboActionClick = `      if (loc.actionType === 'toyou_gazebo') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        if (toyouGazeboCtrl && typeof toyouGazeboCtrl.openToyouGazebo === 'function') {
          toyouGazeboCtrl.openToyouGazebo(activeCharacterKey || activeUser || 'lala');
        }
      } else if (loc.actionType === 'fairy_atelier') {`;

if (!content.includes("loc.actionType === 'toyou_gazebo'") && content.includes(fairyActionMarker)) {
  content = content.replace(fairyActionMarker, gazeboActionClick);
  console.log('Added loc.actionType === toyou_gazebo handler');
}

// 7. Returned controller object
const fairyReturnMarker = `    fairyAtelierController: fairyAtelierCtrl,
    openFairyAtelier: (char = null) => fairyAtelierCtrl?.openFairyAtelier(char || activeCharacterKey || activeUser || 'lala'),
    closeFairyAtelier: () => fairyAtelierCtrl?.closeFairyAtelier(),`;

const gazeboReturnAddition = `    fairyAtelierController: fairyAtelierCtrl,
    openFairyAtelier: (char = null) => fairyAtelierCtrl?.openFairyAtelier(char || activeCharacterKey || activeUser || 'lala'),
    closeFairyAtelier: () => fairyAtelierCtrl?.closeFairyAtelier(),
    toyouGazeboController: toyouGazeboCtrl,
    openToyouGazebo: (char = null) => toyouGazeboCtrl?.openToyouGazebo(char || activeCharacterKey || activeUser || 'lala'),
    closeToyouGazebo: () => toyouGazeboCtrl?.closeToyouGazebo(),`;

if (!content.includes('toyouGazeboController:') && content.includes(fairyReturnMarker)) {
  content = content.replace(fairyReturnMarker, gazeboReturnAddition);
  console.log('Added toyouGazeboController to export object');
}

fs.writeFileSync(path, content, 'utf8');
console.log('universes_view.js integration finished successfully!');
