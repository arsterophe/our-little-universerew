const fs = require('fs');

let code = fs.readFileSync('universes_view.js', 'utf8');

// 1. Imports
if (!code.includes('initEclipseView')) {
  const targetImport = "import { initBloomCottageView } from './bloom_cottage_view.js';";
  const newImports = targetImport + "\nimport { initEclipseView } from './eclipse_view.js';\nimport { isAuthorAuthorized } from './eclipse_state.js';";
  code = code.replace(targetImport, newImports);
  console.log('Added imports to universes_view.js');
}

// 2. Initialize controller
if (!code.includes('eclipseCtrl =')) {
  const targetInit = "const bloomCottageCtrl = typeof initBloomCottageView === 'function' ? initBloomCottageView({";
  const eclipseInit = `  // Initialize THE ECLIPSE Controller (The Author's Eternal Sanctuary - Lele 🌙)
  const eclipseCtrl = typeof initEclipseView === 'function' ? initEclipseView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewShadow = document.getElementById('view-shadow-world');
      if (viewShadow) {
        viewShadow.classList.add('active');
        viewShadow.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;

  `;
  code = code.replace(targetInit, eclipseInit + targetInit);
  console.log('Added eclipseCtrl init to universes_view.js');
}

// 3. Close in closeShadowWorld
if (!code.includes('eclipseCtrl.closeEclipseSanctuary()')) {
  const targetClose = "if (typeof closeBehindShadow === 'function') {\n      closeBehindShadow();\n    }";
  const newClose = targetClose + "\n    if (eclipseCtrl && typeof eclipseCtrl.closeEclipseSanctuary === 'function') {\n      eclipseCtrl.closeEclipseSanctuary();\n    }";
  code = code.replace(targetClose, newClose);
  console.log('Added closeEclipseSanctuary call to closeShadowWorld');
}

// 4. btn-shadow-to-eclipse handler
if (!code.includes('btnShadowToEclipse')) {
  const targetBtn = `if (btnShadowStory) {
    btnShadowStory.addEventListener('click', () => {
      if (typeof onNavigateStoryWorkspace === 'function') {
        if (viewShadowWorld) viewShadowWorld.classList.remove('active');
        onNavigateStoryWorkspace('view-shadow-world');
      }
    });
  }`;

  const eclipseBtnHandler = `
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

  code = code.replace(targetBtn, targetBtn + '\n' + eclipseBtnHandler);
  console.log('Added btnShadowToEclipse handler to universes_view.js');
}

// 5. Expose in return object
if (!code.includes('eclipseController:')) {
  const targetReturn = "closeBehindShadow: () => shadowBehindCtrl?.closeBehindShadow(),";
  const eclipseReturn = `closeBehindShadow: () => shadowBehindCtrl?.closeBehindShadow(),
    eclipseController: eclipseCtrl,
    openEclipseSanctuary: (char = null, room = 'grand_hall') => {
      const targetUser = char || activeUser || activeCharacterKey || 'lele';
      if (!isAuthorAuthorized(targetUser)) {
        if (onShowToast) {
          onShowToast('✦ The Eclipse Sanctuary dijaga oleh segel gerhana abadi. Hanya Lele 🌙 (The Author) yang dapat memasukinya.');
        }
        return false;
      }
      const viewShadow = document.getElementById('view-shadow-world');
      if (viewShadow) {
        viewShadow.classList.remove('active');
        viewShadow.setAttribute('aria-hidden', 'true');
      }
      return eclipseCtrl?.openEclipseSanctuary(targetUser, room);
    },
    closeEclipseSanctuary: () => eclipseCtrl?.closeEclipseSanctuary(),`;

  code = code.replace(targetReturn, eclipseReturn);
  console.log('Added eclipseController to return object');
}

fs.writeFileSync('universes_view.js', code, 'utf8');
console.log('universes_view.js successfully updated.');
