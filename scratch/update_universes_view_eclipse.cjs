const fs = require('fs');

let uv = fs.readFileSync('universes_view.js', 'utf8');

// 1. Update SHADOW_LOCATIONS.rumah_kristal
const oldRumahKristalRegex = /rumah_kristal:\s*\{[\s\S]*?toastMsg:\s*['"][^'"]*['"]\s*\}/;
const newRumahKristal = `rumah_kristal: {
    id: 'rumah_kristal',
    icon: '👑',
    tag: "RUMAH UTAMA · THE AUTHOR'S ETERNAL SANCTUARY",
    title: 'THE ECLIPSE — Rumah Lele',
    subtitle: 'Istana Kerajaan Celestial Pribadi Sang Penulis (The Author)',
    description: "Satu-satunya rumah utama Lele yang berdiri megah di tengah malam abadi. Memadukan arsitektur royal celestial, marmer obsidian, pilar kristal amethyst, chandelier gerhana, serta 7 ruangan istana dan konsol The Author's Desk.",
    highlight: "👑 Rumah Utama Lele · 7 Ruangan Kerajaan, Author's Desk, Piano Gothic & Menara Observatorium",
    actionLabel: 'Masuk ke THE ECLIPSE (Rumah Utama) 👑🌙',
    actionType: 'eclipse_sanctuary',
    toastMsg: "👑 Memasuki THE ECLIPSE — Rumah Utama Lele (The Author's Eternal Sanctuary) 🌙"
  }`;

if (oldRumahKristalRegex.test(uv)) {
  uv = uv.replace(oldRumahKristalRegex, newRumahKristal);
  console.log('Updated SHADOW_LOCATIONS.rumah_kristal in universes_view.js');
} else {
  console.error('Could not match oldRumahKristalRegex in universes_view.js');
}

// 2. Remove btnShadowToEclipse
const btnToEclipseRegex = /\/\/ Entrance to THE ECLIPSE[\s\S]*?const btnShadowToEclipse =[\s\S]*?\}\s*\}\s*;/;
// Let's check how btnShadowToEclipse was structured
const btnBlockRegex = /\s*\/\/ Entrance to THE ECLIPSE[\s\S]*?if \(btnShadowToEclipse\) \{[\s\S]*?\}\s*\}/;
if (btnBlockRegex.test(uv)) {
  uv = uv.replace(btnBlockRegex, '');
  console.log('Removed btnShadowToEclipse from universes_view.js');
} else {
  console.log('btnBlockRegex did not match directly, checking fallback...');
}

// 3. Update shadowHotspots click listener
const oldShadowHotspotsLoop = `  shadowHotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = btn.getAttribute('data-shadow-loc');
      if (shadowKingdomFx) {
        shadowKingdomFx.triggerClickBurst(e.clientX, e.clientY);
      }
      selectShadowLocation(locKey, e);
    });
  });`;

const newShadowHotspotsLoop = `  shadowHotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = btn.getAttribute('data-shadow-loc');
      if (shadowKingdomFx) {
        shadowKingdomFx.triggerClickBurst(e.clientX, e.clientY);
      }
      if (locKey === 'rumah_kristal') {
        const currentUser = activeUser || activeCharacterKey || 'lele';
        if (!isAuthorAuthorized(currentUser)) {
          if (onShowToast) {
            onShowToast('✦ THE ECLIPSE adalah rumah privat Lele 🌙 (The Author). Akses dibatasi oleh segel gerhana abadi.');
          }
          return;
        }
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        if (eclipseCtrl && typeof eclipseCtrl.openEclipseSanctuary === 'function') {
          eclipseCtrl.openEclipseSanctuary(currentUser, 'grand_hall');
        }
        if (onTriggerSparkle) {
          onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
        }
        if (onShowToast) {
          onShowToast('👑 Memasuki THE ECLIPSE — Rumah Utama Lele 🌙');
        }
        return;
      }
      selectShadowLocation(locKey, e);
    });
  });`;

const normUv = uv.replace(/\r\n/g, '\n');
const normOldLoop = oldShadowHotspotsLoop.replace(/\r\n/g, '\n');
if (normUv.includes(normOldLoop)) {
  uv = normUv.replace(normOldLoop, newShadowHotspotsLoop);
  console.log('Updated shadowHotspots click loop in universes_view.js');
} else {
  console.error('Could not match oldShadowHotspotsLoop');
}

// 4. Update btnShadowLocAction handling for eclipse_sanctuary
const oldLocAction = `if (loc.actionType === 'shadow_crystal_tower' && typeof onNavigateShadowCrystalTower === 'function') {
        runShadowLocationNav(() => onNavigateShadowCrystalTower());
      }`;

const newLocAction = `if ((loc.actionType === 'eclipse_sanctuary' || loc.actionType === 'shadow_crystal_tower')) {
        const currentUser = activeUser || activeCharacterKey || 'lele';
        if (!isAuthorAuthorized(currentUser)) {
          if (onShowToast) {
            onShowToast('✦ THE ECLIPSE adalah rumah privat Lele 🌙 (The Author). Akses dibatasi oleh segel gerhana abadi.');
          }
          return;
        }
        runShadowLocationNav(() => {
          if (eclipseCtrl && typeof eclipseCtrl.openEclipseSanctuary === 'function') {
            eclipseCtrl.openEclipseSanctuary(currentUser, 'grand_hall');
          }
        });
      }`;

const normOldAction = oldLocAction.replace(/\r\n/g, '\n');
if (uv.includes(normOldAction)) {
  uv = uv.replace(normOldAction, newLocAction);
  console.log('Updated btnShadowLocAction in universes_view.js');
} else {
  console.error('Could not match oldLocAction');
}

fs.writeFileSync('universes_view.js', uv, 'utf8');
console.log('universes_view.js saved.');
