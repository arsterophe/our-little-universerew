const fs = require('fs');
let uv = fs.readFileSync('universes_view.js', 'utf8');

const target = "const btnShadowStory = document.getElementById('btn-shadow-story');";
const handlerToInsert = `

  // Entrance to THE ECLIPSE (The Author's Eternal Sanctuary - Lele 🌙)
  const btnShadowToEclipse = document.getElementById('btn-shadow-to-eclipse');
  if (btnShadowToEclipse) {
    btnShadowToEclipse.addEventListener('click', (e) => {
      const currentUser = activeUser || activeCharacterKey || 'lele';
      if (!isAuthorAuthorized(currentUser)) {
        if (onShowToast) {
          onShowToast('✦ The Eclipse Sanctuary dijaga oleh segel gerhana abadi. Hanya Lele 🌙 (The Author) yang dapat memasukinya.');
        }
        return;
      }

      if (viewShadowWorld) {
        viewShadowWorld.classList.remove('active');
        viewShadowWorld.setAttribute('aria-hidden', 'true');
      }
      closeShadowLocationPanel();

      if (eclipseCtrl && typeof eclipseCtrl.openEclipseSanctuary === 'function') {
        eclipseCtrl.openEclipseSanctuary(currentUser, 'grand_hall');
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if (onShowToast) {
        onShowToast('👑 Memasuki THE ECLIPSE — The Author\\'s Eternal Sanctuary 🌙');
      }
    });
  }`;

if (!uv.includes('btnShadowToEclipse')) {
  const storyEndIdx = uv.indexOf('});', uv.indexOf(target));
  if (storyEndIdx !== -1) {
    const insertIdx = storyEndIdx + 3;
    uv = uv.substring(0, insertIdx) + handlerToInsert + uv.substring(insertIdx);
    fs.writeFileSync('universes_view.js', uv, 'utf8');
    console.log('Inserted btnShadowToEclipse into universes_view.js');
  } else {
    console.error('Could not find storyEndIdx');
  }
} else {
  console.log('btnShadowToEclipse already in universes_view.js');
}
