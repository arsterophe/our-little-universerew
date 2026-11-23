import fs from 'fs';

// 1. Update universes_view.js
const uvPath = 'universes_view.js';
let uv = fs.readFileSync(uvPath, 'utf8');

// Add import from ./firebase.js if not present
if (!uv.includes('dbSubscribeLetters')) {
  const targetImport = `import { initMoonpetalManorView } from './moonpetal_manor_view.js';`;
  const newImport = `import { initMoonpetalManorView } from './moonpetal_manor_view.js';
import { dbSubscribeLetters, dbFetchLetters } from './firebase.js';`;
  uv = uv.replace(targetImport, newImport);
  console.log('✅ Added dbSubscribeLetters import in universes_view.js');
}

// Add subscribeToYouMailboxUnread and updateToYouMailboxBadge functions
const mailboxLogic = `
  // ==========================================================
  // TO YOU — KOTAK POS UNREAD NOTIFICATION LISTENER
  // ==========================================================
  let toyouMailboxUnsub = null;

  function updateToYouMailboxBadge(unreadCount) {
    const badge = document.getElementById('toyou-mailbox-unread-badge');
    const hotspot = document.querySelector('.hotspot-toyou-kotakpos');
    const loc = TOYOU_LOCATIONS?.kotak_pos;
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = 'inline-flex';
        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
      } else {
        badge.style.display = 'none';
      }
    }
    if (hotspot) {
      hotspot.classList.toggle('has-unread', unreadCount > 0);
    }
    if (loc) {
      loc.highlight = unreadCount > 0
        ? \`💌 \${unreadCount} Surat baru menunggumu di Kotak Pos TO YOU!\`
        : '💌 Kotak surat TO YOU siap menerima dan mengirim pesan persahabatan';
    }
  }

  function subscribeToYouMailboxUnread(uid) {
    if (typeof toyouMailboxUnsub === 'function') {
      try { toyouMailboxUnsub(); } catch (_) {}
      toyouMailboxUnsub = null;
    }
    const targetUid = uid || (activeAuthUser?.uid) || 'EqByKA8FXoTEt0OmIsSDPfnxMDB3';
    try {
      toyouMailboxUnsub = dbSubscribeLetters({ uid: targetUid }, (letters) => {
        const incoming = (letters || []).filter(l => l.recipientUid === targetUid);
        const unread = incoming.filter(l => !l.read).length;
        updateToYouMailboxBadge(unread);
      }, (err) => {
        console.warn('Notice subscribing TO YOU mailbox unread:', err);
        dbFetchLetters({ uid: targetUid }).then(letters => {
          const incoming = (letters || []).filter(l => l.recipientUid === targetUid);
          const unread = incoming.filter(l => !l.read).length;
          updateToYouMailboxBadge(unread);
        }).catch(() => {});
      });
    } catch (e) {
      console.warn('Notice setting up TO YOU mailbox unread listener:', e);
    }
  }
`;

if (!uv.includes('function subscribeToYouMailboxUnread(')) {
  const targetSpot = `  // ==========================================================
  // TO YOU — MINIMALIST MOOD PICKER & FAIRY MUSIC CONTROLLER (LALA ☼)`;
  uv = uv.replace(targetSpot, mailboxLogic + '\n' + targetSpot);
  console.log('✅ Added subscribeToYouMailboxUnread in universes_view.js');
}

// Call in openToYouWorld
if (!uv.includes('subscribeToYouMailboxUnread(activeAuthUser?.uid);')) {
  const targetOpen = `    // Load persistent state and decorations from Firestore (Fase 8)
    loadUniverseState('lala', activeAuthUser);
    restoreToYouMood();`;
  const newOpen = `    // Load persistent state and decorations from Firestore (Fase 8)
    loadUniverseState('lala', activeAuthUser);
    restoreToYouMood();
    subscribeToYouMailboxUnread(activeAuthUser?.uid);`;
  uv = uv.replace(targetOpen, newOpen);
  console.log('✅ Added subscribeToYouMailboxUnread call in openToYouWorld');
}

// Clean up in closeToYouWorld
if (!uv.includes('toyouMailboxUnsub = null;')) {
  const targetClose = `    if (toyouBehindCtrl && typeof toyouBehindCtrl.closeBehindFairy === 'function') {
      toyouBehindCtrl.closeBehindFairy();
    }`;
  const newClose = `    if (toyouBehindCtrl && typeof toyouBehindCtrl.closeBehindFairy === 'function') {
      toyouBehindCtrl.closeBehindFairy();
    }
    if (typeof toyouMailboxUnsub === 'function') {
      try { toyouMailboxUnsub(); } catch (_) {}
      toyouMailboxUnsub = null;
    }`;
  uv = uv.replace(targetClose, newClose);
  console.log('✅ Added toyouMailboxUnsub cleanup in closeToYouWorld');
}

// Add direct open on repeat click or double click for kotak_pos in toyouHotspots
const targetHotspotClick = `      if (locKey === 'rumah' && activeToYouLocationKey === 'rumah') {
        // If already selected and clicked again, enter immediately
        if (bloomCottageCtrl && typeof bloomCottageCtrl.openBloomCottage === 'function') {
          closeToYouLocationPanel();
          if (viewToYouWorld) {
            viewToYouWorld.classList.remove('active');
            viewToYouWorld.setAttribute('aria-hidden', 'true');
          }
          bloomCottageCtrl.openBloomCottage(activeCharacterKey || activeUser || 'lala');
          return;
        }
      }`;

const newHotspotClick = `      if (locKey === 'rumah' && activeToYouLocationKey === 'rumah') {
        // If already selected and clicked again, enter immediately
        if (bloomCottageCtrl && typeof bloomCottageCtrl.openBloomCottage === 'function') {
          closeToYouLocationPanel();
          if (viewToYouWorld) {
            viewToYouWorld.classList.remove('active');
            viewToYouWorld.setAttribute('aria-hidden', 'true');
          }
          bloomCottageCtrl.openBloomCottage(activeCharacterKey || activeUser || 'lala');
          return;
        }
      }
      if (locKey === 'kotak_pos' && activeToYouLocationKey === 'kotak_pos') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        if (typeof onNavigateKotakPos === 'function') {
          onNavigateKotakPos('to_you');
          return;
        }
      }`;

if (!uv.includes('if (locKey === \'kotak_pos\' && activeToYouLocationKey === \'kotak_pos\')')) {
  uv = uv.replace(targetHotspotClick, newHotspotClick);
  console.log('✅ Added direct open on repeat click for kotak_pos in universes_view.js');
}

// Add dblclick listener
const targetDbl = `  if (btnCloseToYouPanel) {
    btnCloseToYouPanel.addEventListener('click', closeToYouLocationPanel);
  }`;

const newDbl = `  toyouHotspots.forEach(btn => {
    btn.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const locKey = btn.getAttribute('data-toyou-loc');
      if (locKey === 'kotak_pos' && typeof onNavigateKotakPos === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateKotakPos('to_you');
      }
    });
  });

  if (btnCloseToYouPanel) {
    btnCloseToYouPanel.addEventListener('click', closeToYouLocationPanel);
  }`;

if (!uv.includes('btn.addEventListener(\'dblclick\',')) {
  uv = uv.replace(targetDbl, newDbl);
  console.log('✅ Added dblclick listener on toyouHotspots for kotak_pos');
}

fs.writeFileSync(uvPath, uv, 'utf8');

// 2. Update main.js
const mainPath = 'main.js';
let main = fs.readFileSync(mainPath, 'utf8');

const targetMainNav = `        onNavigateKotakPos: async (originUniverse) => {
          const ctrl = await ensureKotakPosController();
          if (ctrl && typeof ctrl.openKotakPos === 'function') {
            const charFallback = (originUniverse === 'pinwheel' || originUniverse === 'abil') ? (activeCharacterKey || 'abil') : activeCharacterKey;
            ctrl.openKotakPos(originUniverse, charFallback);
          }
        },`;

const newMainNav = `        onNavigateKotakPos: async (originUniverse) => {
          const ctrl = await ensureKotakPosController();
          if (ctrl && typeof ctrl.openKotakPos === 'function') {
            const charFallback = (originUniverse === 'pinwheel' || originUniverse === 'abil')
              ? (activeCharacterKey || 'abil')
              : ((originUniverse === 'to_you' || originUniverse === 'toyou')
                ? (activeCharacterKey || 'lala')
                : (originUniverse === 'shadow' ? (activeCharacterKey || 'lele') : (activeCharacterKey || 'nyanya')));
            ctrl.openKotakPos(originUniverse, charFallback);
          }
        },`;

if (!main.includes('originUniverse === \'to_you\' || originUniverse === \'toyou\'')) {
  main = main.replace(targetMainNav, newMainNav);
  fs.writeFileSync(mainPath, main, 'utf8');
  console.log('✅ Updated main.js onNavigateKotakPos character fallback');
}

console.log('🎉 Kotak Pos integration code applied successfully!');
