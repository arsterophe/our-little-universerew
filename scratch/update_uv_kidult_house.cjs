const fs = require('fs');

let uv = fs.readFileSync('universes_view.js', 'utf8');

// 1. Add import
if (!uv.includes('initKidultHouseView')) {
  const targetImport = "import { initEverdreamHouseView } from './everdream_house_view.js';";
  const newImport = targetImport + "\nimport { initKidultHouseView } from './kidult_house_view.js';";
  uv = uv.replace(targetImport, newImport);
  console.log('Added initKidultHouseView import to universes_view.js');
}

// 2. Update KIDULT_LOCATIONS.rumah
const oldRumahRegex = /rumah:\s*\{[\s\S]*?id:\s*'rumah'[\s\S]*?actionType:\s*'everdream_house'[\s\S]*?toastMsg:\s*['"][^'"]*['"]\s*\}/;
const newRumah = `rumah: {
    id: 'rumah',
    icon: '🏡',
    tag: 'LOKASI UTAMA · KIDULT DREAM HOUSE',
    title: 'KIDULT DREAM HOUSE — The Everdream House',
    subtitle: 'Where Childhood Dreams Never Fade · Cozy Dreamy Childhood Home Nyanya ⭐',
    description: 'Rumah hangat dua lantai yang memadukan kehangatan masa kecil dan imajinasi masa depan. Terdiri dari 5 ruangan 2D interaktif: KIDULT Living Room, Dreamy Bedroom, Little Kitchen, Creative Hobby Room, dan Memory Attic.',
    highlight: '🏡 5 Ruangan 2D Interaktif · Piano Vintage · Dapur Kue · Atelier Seni & Peti Kenangan',
    actionLabel: 'Masuk ke KIDULT Dream House 🏡⭐',
    actionType: 'everdream_house',
    toastMsg: '🏡 Memasuki KIDULT DREAM HOUSE — Selamat datang di rumah impian Nyanya! ⭐'
  }`;

if (oldRumahRegex.test(uv)) {
  uv = uv.replace(oldRumahRegex, newRumah);
  console.log('Updated KIDULT_LOCATIONS.rumah in universes_view.js');
} else {
  console.error('Could not match oldRumahRegex');
}

// 3. Update controller initialization
const oldInitTarget = "const everdreamHouseCtrl = typeof initEverdreamHouseView === 'function' ? initEverdreamHouseView({";
const newInitCode = `// Initialize KIDULT Dream House 2D Simulation Controller
  const kidultHouseCtrl = typeof initKidultHouseView === 'function' ? initKidultHouseView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewKidult = document.getElementById('view-kidult-world');
      if (viewKidult) {
        viewKidult.classList.add('active');
        viewKidult.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;

  const everdreamHouseCtrl = kidultHouseCtrl || (typeof initEverdreamHouseView === 'function' ? initEverdreamHouseView({`;

if (uv.includes(oldInitTarget)) {
  uv = uv.replace(oldInitTarget, newInitCode);
  console.log('Updated everdreamHouseCtrl to use kidultHouseCtrl in universes_view.js');
} else {
  console.error('Could not match oldInitTarget');
}

// 4. Update kidultHotspots loop to allow direct entrance on clicking rumah
const oldHotspotLoop = `  kidultHotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = btn.getAttribute('data-kidult-loc');
      selectKidultLocation(locKey, e);
    });
  });`;

const newHotspotLoop = `  kidultHotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = btn.getAttribute('data-kidult-loc');
      if (locKey === 'rumah') {
        closeKidultLocationPanel();
        if (viewKidultWorld) {
          viewKidultWorld.classList.remove('active');
          viewKidultWorld.setAttribute('aria-hidden', 'true');
        }
        if (kidultHouseCtrl && typeof kidultHouseCtrl.openKidultHouse === 'function') {
          kidultHouseCtrl.openKidultHouse(activeCharacterKey || activeUser || 'nyanya', 'living');
        } else if (everdreamHouseCtrl && typeof everdreamHouseCtrl.openEverdreamHouse === 'function') {
          everdreamHouseCtrl.openEverdreamHouse('living');
        }
        if (onTriggerSparkle) {
          onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
        }
        return;
      }
      selectKidultLocation(locKey, e);
    });
  });`;

const normUv = uv.replace(/\r\n/g, '\n');
const normOldHotspot = oldHotspotLoop.replace(/\r\n/g, '\n');
if (normUv.includes(normOldHotspot)) {
  uv = normUv.replace(normOldHotspot, newHotspotLoop);
  console.log('Updated kidultHotspots click listener in universes_view.js');
} else {
  console.error('Could not match oldHotspotLoop');
}

// 5. Update return object
const oldReturnExport = "everdreamHouseController: everdreamHouseCtrl,";
const newReturnExport = `kidultHouseController: kidultHouseCtrl,
    openKidultHouse: (char = null, room = 'living') => kidultHouseCtrl?.openKidultHouse(char || activeCharacterKey || activeUser || 'nyanya', room),
    closeKidultHouse: () => kidultHouseCtrl?.closeKidultHouse(),
    everdreamHouseController: everdreamHouseCtrl,`;

if (uv.includes(oldReturnExport)) {
  uv = uv.replace(oldReturnExport, newReturnExport);
  console.log('Updated return export in universes_view.js');
} else {
  console.error('Could not match oldReturnExport');
}

fs.writeFileSync('universes_view.js', uv, 'utf8');
console.log('universes_view.js saved successfully.');
