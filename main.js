/**
 * OUR LITTLE UNIVERSE — IMMERSIVE LOGIN & CHARACTER SELECTION
 * Integrated with real Firebase Authentication Email/Password & UID Character Verification
 */

import {
  auth,
  isFirebaseConfigured,
  loginWithFirebase,
  logoutFirebase,
  verifyCharacterAuthorization,
  CHARACTER_AUTH_RULES,
  identifyUserCharacter,
  dbSyncUserProfile,
  dbMigrateUniverseState
} from './firebase.js';

import { onAuthStateChanged } from 'firebase/auth';
import { setActiveUserCharacter } from './orbit.js';
import { setActiveUserCharacter as setActiveUserMoments } from './moments.js';
import { setActiveUserCharacter as setActiveUserStories } from './stories.js';
import { setActiveUserCharacter as setActiveUserMessages } from './messages.js';
import { setActiveUserCharacter as setActiveUserGames } from './games.js';



// Character Definitions matching reference design and PRD
const CHARACTERS = {
  nyanya: {
    id: 'nyanya',
    name: 'Nyanya',
    role: 'The Moonlit Shadow Witch',
    symbol: '★',
    themeClass: 'theme-nyanya',
    portrait: '/assets/portrait_nyanya_hd_2x.png',
    cardImg: '/assets/card_nyanya_hd_2x.png',
    avatar: '/assets/avatar_nyanya_hd.png',
    greeting: 'Selamat datang, Nyanya ✦',
    accentColor: '#c084fc',
    universe: 'KIDULT',
    ownerName: 'Vanya'
  },
  lala: {
    id: 'lala',
    name: 'Lala',
    role: 'The Everglow Fairy',
    symbol: '☼',
    themeClass: 'theme-lala',
    portrait: '/assets/portrait_lala_hd_2x.png',
    cardImg: '/assets/card_lala_hd_2x.png',
    avatar: '/assets/avatar_lala_hd.png',
    greeting: 'Selamat datang, Lala ✦',
    accentColor: '#f472b6',
    universe: 'TO YOU',
    ownerName: 'Bella'
  },
  lele: {
    id: 'lele',
    name: 'Lele',
    role: 'The Eclipse Guardian',
    symbol: '☾',
    themeClass: 'theme-lele',
    portrait: '/assets/portrait_lele_hd_2x.png',
    cardImg: '/assets/card_lele_hd_2x.png',
    avatar: '/assets/avatar_lele_hd.png',
    greeting: 'Selamat datang, Lele ✦',
    accentColor: '#818cf8',
    universe: 'SHADOW',
    ownerName: 'Alenda'
  },
  abil: {
    id: 'abil',
    name: 'Abil',
    role: 'PINWHEEL ☁️',
    symbol: '☁️',
    themeClass: 'theme-abil',
    portrait: '/assets/portrait_abil_hd.jpg',
    cardImg: '/assets/card_abil_hd.jpg',
    avatar: '/assets/avatar_abil_hd.jpg',
    greeting: 'Selamat datang, Abil ☁️',
    accentColor: '#93c5fd',
    universe: 'PINWHEEL',
    ownerName: 'Abil'
  },
  akhira: {
    id: 'akhira',
    name: 'Akhira',
    role: 'YAWN ⚡',
    symbol: '⚡',
    themeClass: 'theme-akhira',
    portrait: '/assets/portrait_akhira_hd.jpg',
    cardImg: '/assets/card_akhira_hd.jpg',
    avatar: '/assets/avatar_akhira_hd.jpg',
    greeting: 'Selamat datang, Akhira ⚡',
    accentColor: '#c084fc',
    universe: 'YAWN',
    ownerName: 'Akhira'
  },
  ela: {
    id: 'ela',
    name: 'Ela',
    role: 'US AGAIN 🌸',
    symbol: '🌸',
    themeClass: 'theme-ela',
    portrait: '/assets/portrait_ela_hd.jpg',
    cardImg: '/assets/card_ela_hd.jpg',
    avatar: '/assets/avatar_ela_hd.jpg',
    greeting: 'Selamat datang, Ela 🌸',
    accentColor: '#f472b6',
    universe: 'US AGAIN',
    ownerName: 'Ela'
  },
  ruben: {
    id: 'ruben',
    name: 'Ruben',
    role: 'ASH ❄️',
    symbol: '❄️',
    themeClass: 'theme-ruben',
    portrait: '/assets/portrait_ruben_hd.jpg',
    cardImg: '/assets/card_ruben_hd.jpg',
    avatar: '/assets/avatar_ruben_hd.jpg',
    greeting: 'Selamat datang, Ruben ❄️',
    accentColor: '#94a3b8',
    universe: 'ASH',
    ownerName: 'Ruben'
  }
};

// Application State
let activeCharacterKey = null;
let currentAuthenticatedUser = null;
let isSubmitting = false;
let isPreviewingUniverses = false;

// DOM Elements: Views
const viewSelection = document.getElementById('view-selection');
const viewLogin = document.getElementById('view-login');
const viewPrivateUniverse = document.getElementById('view-private-universe');

// DOM Elements: Cards & Buttons
const cardButtons = document.querySelectorAll('.character-card');
const btnBack = document.getElementById('btn-back');
const btnSwitchOther = document.getElementById('btn-switch-other');
const btnTogglePassword = document.getElementById('btn-toggle-password');
const btnUniverseSubmit = document.getElementById('btn-universe-submit');
const btnSubmitText = document.getElementById('btn-submit-text');
const btnSpinner = document.getElementById('btn-spinner');
const btnStarIcon = document.getElementById('btn-star-icon');
const btnLogout = document.getElementById('btn-logout');

// DOM Elements: Form Inputs
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginForm = document.getElementById('login-form');
const inputFeedback = document.getElementById('input-feedback');
const universeToast = document.getElementById('universe-toast');
const toastText = document.getElementById('toast-text');

// DOM Elements: Dynamic Character Elements (Login View)
const loginCharImg = document.getElementById('login-char-img');
const loginCharIcon = document.getElementById('login-char-icon');
const loginCharName = document.getElementById('login-char-name');
const loginCharRole = document.getElementById('login-char-role');
const loginGreetingName = document.getElementById('login-greeting-name');
const themeOrb = document.getElementById('theme-orb');

// DOM Elements: Private Universe Elements
const privateUniverseTitle = document.getElementById('private-universe-title');
const privateUserName = document.getElementById('private-user-name');
const privateUserRole = document.getElementById('private-user-role');
const privateWelcomeSymbol = document.getElementById('private-welcome-symbol');
const privateWelcomeHeading = document.getElementById('private-welcome-heading');
const auditCharacterName = document.getElementById('audit-character-name');
const auditEmail = document.getElementById('audit-email');
const auditUid = document.getElementById('audit-uid');
const auditUniverse = document.getElementById('audit-universe');

// Initial UI Loader Controls
function hideInitialLoader() {
  const loader = document.getElementById('cosmic-app-loader');
  if (loader) {
    loader.classList.add('loaded');
  }
}

function setLoaderStatus(text = '') {
  const txtEl = document.getElementById('loader-status-text');
  if (txtEl && text) txtEl.textContent = text;
}

// Controller loader singletons
const controllerPromises = {};

export async function ensureUniversesController() {
  if (window.universesController) return window.universesController;
  if (!controllerPromises.universes) {
    controllerPromises.universes = import('./universes_view.js').then(({ initUniversesView }) => {
      window.universesController = initUniversesView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        },
        onNavigateOrbit: async (fromView) => {
          const ctrl = await ensureOrbitController();
          if (ctrl && typeof ctrl.openOrbit === 'function') ctrl.openOrbit(fromView);
        },
        onNavigateMoments: async (fromView) => {
          const ctrl = await ensureMomentsController();
          if (ctrl && typeof ctrl.openMoments === 'function') ctrl.openMoments(fromView);
        },
        onNavigatePhotobooth: async (fromView) => {
          const ctrl = await ensurePhotoboothController();
          if (ctrl && typeof ctrl.openPhotobooth === 'function') ctrl.openPhotobooth(fromView, activeCharacterKey);
        },
        onNavigateMessages: async (fromView) => {
          const ctrl = await ensureMessagesController();
          if (ctrl && typeof ctrl.openMessages === 'function') ctrl.openMessages(fromView, activeCharacterKey);
        },
        onNavigateGames: async (fromView) => {
          const ctrl = await ensureGamesController();
          if (ctrl && typeof ctrl.openGames === 'function') ctrl.openGames(fromView, activeCharacterKey);
        },
        onNavigateStarMessages: async (originUniverse) => {
          const ctrl = await ensureStarMessagesController();
          if (ctrl && typeof ctrl.openStarMessages === 'function') {
            ctrl.openStarMessages(originUniverse, activeCharacterKey);
          }
        },
        onNavigateKotakPos: async (originUniverse) => {
          const ctrl = await ensureKotakPosController();
          if (ctrl && typeof ctrl.openKotakPos === 'function') {
            ctrl.openKotakPos(originUniverse, activeCharacterKey);
          }
        },
        onNavigateShadowGazebo: async () => {
          const ctrl = await ensureShadowGazeboController();
          if (ctrl && typeof ctrl.openShadowGazebo === 'function') {
            ctrl.openShadowGazebo();
          }
        },
        onNavigateShadowGarden: async () => {
          const ctrl = await ensureShadowGardenController();
          if (ctrl && typeof ctrl.showShadowGardenView === 'function') {
            ctrl.showShadowGardenView();
          }
        },
        onNavigateShadowArtGallery: async () => {
          const ctrl = await ensureShadowArtGalleryController();
          if (ctrl && typeof ctrl.showShadowArtGalleryView === 'function') {
            ctrl.showShadowArtGalleryView();
          }
        },
        onNavigateShadowCrystalTower: async () => {
          const ctrl = await ensureShadowCrystalTowerController();
          if (ctrl && typeof ctrl.showShadowCrystalTowerView === 'function') {
            ctrl.showShadowCrystalTowerView();
          }
        },
        onNavigateStories: async (fromView) => {
          const ctrl = await ensureStoriesController();
          if (ctrl && typeof ctrl.openOurStories === 'function') ctrl.openOurStories();
        },
        onNavigateStoryWorkspace: async (fromView, mode = 'editor', storyId = null) => {
          const ctrl = await ensureStoriesController();
          if (ctrl && typeof ctrl.openWorkspace === 'function') ctrl.openWorkspace(mode, storyId);
        },
        onSwitchCharacter: (charKey) => {
          if (charKey && CHARACTERS[charKey]) {
            selectCharacter(charKey);
          } else {
            returnToSelection();
          }
        },
        onLogout: handleLogout
      });
      return window.universesController;
    });
  }
  return controllerPromises.universes;
}

export async function ensureOrbitController() {
  if (window.orbitController) return window.orbitController;
  if (!controllerPromises.orbit) {
    controllerPromises.orbit = import('./orbit_view.js').then(({ initOrbitView }) => {
      window.orbitController = initOrbitView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        }
      });
      return window.orbitController;
    });
  }
  return controllerPromises.orbit;
}

export async function ensureMomentsController() {
  if (window.momentsController) return window.momentsController;
  if (!controllerPromises.moments) {
    controllerPromises.moments = import('./moments_view.js').then(({ initMomentsView }) => {
      window.momentsController = initMomentsView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        }
      });
      return window.momentsController;
    });
  }
  return controllerPromises.moments;
}

export async function ensurePhotoboothController() {
  if (window.photoboothController) return window.photoboothController;
  if (!controllerPromises.photobooth) {
    controllerPromises.photobooth = import('./photobooth_view.js').then(({ initPhotoboothView }) => {
      window.photoboothController = initPhotoboothView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        }
      });
      return window.photoboothController;
    });
  }
  return controllerPromises.photobooth;
}

export async function ensureStoriesController() {
  if (window.storiesController) return window.storiesController;
  if (!controllerPromises.stories) {
    controllerPromises.stories = import('./stories_view.js').then(({ initStoriesView }) => {
      window.storiesController = initStoriesView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        },
        onNavigateBack: async () => {
          const ctrl = await ensureUniversesController();
          if (ctrl && typeof ctrl.showUniversesStage === 'function') {
            ctrl.showUniversesStage();
          }
        }
      });
      if (currentAuthenticatedUser && activeCharacterKey) {
        window.storiesController.syncActiveUser(activeCharacterKey, currentAuthenticatedUser);
      }
      return window.storiesController;
    });
  }
  return controllerPromises.stories;
}

export async function ensureMessagesController() {
  if (window.messagesController) return window.messagesController;
  if (!controllerPromises.messages) {
    controllerPromises.messages = import('./messages_view.js').then(({ initMessagesView }) => {
      window.messagesController = initMessagesView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        }
      });
      return window.messagesController;
    });
  }
  return controllerPromises.messages;
}

export async function ensureGamesController() {
  if (window.gamesController) return window.gamesController;
  if (!controllerPromises.games) {
    controllerPromises.games = import('./games_view.js').then(({ initGamesView }) => {
      window.gamesController = initGamesView({
        onShowToast: showToast,
        onNavigateFeature: async (target) => {
          if (target === 'messages') {
            const ctrl = await ensureMessagesController();
            if (ctrl && typeof ctrl.openMessages === 'function') ctrl.openMessages('view-games', activeCharacterKey);
          } else if (target === 'photobooth') {
            const ctrl = await ensurePhotoboothController();
            if (ctrl && typeof ctrl.openPhotobooth === 'function') ctrl.openPhotobooth('view-games', activeCharacterKey);
          } else if (target === 'stories') {
            const ctrl = await ensureStoriesController();
            if (ctrl && typeof ctrl.openOurStories === 'function') ctrl.openOurStories();
          } else if (target === 'orbit') {
            const ctrl = await ensureOrbitController();
            if (ctrl && typeof ctrl.openOrbit === 'function') ctrl.openOrbit('view-games');
          }
        }
      });
      return window.gamesController;
    });
  }
  return controllerPromises.games;
}

export async function ensureStarMessagesController() {
  if (window.starMessagesController) return window.starMessagesController;
  if (!controllerPromises.starMessages) {
    controllerPromises.starMessages = import('./star_messages_view.js').then(({ initStarMessagesView }) => {
      window.starMessagesController = initStarMessagesView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        },
        onNavigateBack: async (originUniverse) => {
          const univCtrl = await ensureUniversesController();
          if (univCtrl) {
            if (originUniverse === 'to_you' || originUniverse === 'toyou') {
              univCtrl.openToYouWorld();
            } else if (originUniverse === 'shadow') {
              univCtrl.openShadowWorld();
            } else {
              univCtrl.openKidultWorld();
            }
          }
        }
      });
      return window.starMessagesController;
    });
  }
  return controllerPromises.starMessages;
}

export async function ensureKotakPosController() {
  if (window.kotakPosController) return window.kotakPosController;
  if (!controllerPromises.kotakPos) {
    controllerPromises.kotakPos = import('./mailbox_view.js').then(({ initKotakPosView }) => {
      window.kotakPosController = initKotakPosView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        },
        onNavigateBack: async (originUniverse) => {
          const univCtrl = await ensureUniversesController();
          if (univCtrl) {
            if (originUniverse === 'to_you' || originUniverse === 'toyou') {
              univCtrl.openToYouWorld();
            } else if (originUniverse === 'shadow') {
              univCtrl.openShadowWorld();
            } else {
              univCtrl.openKidultWorld();
            }
          }
        }
      });
      return window.kotakPosController;
    });
  }
  return controllerPromises.kotakPos;
}

export async function ensureShadowGazeboController() {
  if (window.shadowGazeboController) return window.shadowGazeboController;
  if (!controllerPromises.shadowGazebo) {
    controllerPromises.shadowGazebo = import('./shadow_gazebo_view.js').then(({ initShadowGazeboView }) => {
      window.shadowGazeboController = initShadowGazeboView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        },
        onNavigateBack: async () => {
          const univCtrl = await ensureUniversesController();
          if (univCtrl) {
            univCtrl.openShadowWorld();
          }
        },
        onNavigateStoryWorkspace: async (fromView, mode = 'editor', storyId = null) => {
          const ctrl = await ensureStoriesController();
          if (ctrl && typeof ctrl.openWorkspace === 'function') {
            ctrl.openWorkspace(mode, storyId);
          }
        }
      });
      return window.shadowGazeboController;
    });
  }
  return controllerPromises.shadowGazebo;
}

export async function ensureShadowGardenController() {
  if (window.shadowGardenController) return window.shadowGardenController;
  if (!controllerPromises.shadowGarden) {
    controllerPromises.shadowGarden = import('./shadow_garden_view.js').then(({ initShadowGardenView, showShadowGardenView }) => {
      initShadowGardenView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        },
        onReturnToUniverse: async () => {
          const univCtrl = await ensureUniversesController();
          if (univCtrl) {
            univCtrl.openShadowWorld();
          }
        }
      });
      window.shadowGardenController = { showShadowGardenView };
      return window.shadowGardenController;
    });
  }
  return controllerPromises.shadowGarden;
}

export async function ensureShadowArtGalleryController() {
  if (window.shadowArtGalleryController) return window.shadowArtGalleryController;
  if (!controllerPromises.shadowArtGallery) {
    controllerPromises.shadowArtGallery = import('./shadow_art_gallery_view.js').then(({ initShadowArtGalleryView }) => {
      window.shadowArtGalleryController = initShadowArtGalleryView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        },
        onNavigateBack: async () => {
          const univCtrl = await ensureUniversesController();
          if (univCtrl) {
            univCtrl.openShadowWorld();
          }
        }
      });
      return window.shadowArtGalleryController;
    });
  }
  return controllerPromises.shadowArtGallery;
}

export async function ensureShadowCrystalTowerController() {
  if (window.shadowCrystalTowerController) return window.shadowCrystalTowerController;
  if (!controllerPromises.shadowCrystalTower) {
    controllerPromises.shadowCrystalTower = import('./shadow_crystal_tower_view.js').then(({ initShadowCrystalTowerView }) => {
      window.shadowCrystalTowerController = initShadowCrystalTowerView({
        onShowToast: showToast,
        onTriggerSparkle: (x, y) => {
          if (typeof window.triggerSparkleBurst === 'function') {
            window.triggerSparkleBurst(x, y);
          }
        },
        onNavigateBack: async () => {
          const univCtrl = await ensureUniversesController();
          if (univCtrl) {
            univCtrl.openShadowWorld();
          }
        },
        onNavigateOrbit: async (fromView) => {
          const orbitCtrl = await ensureOrbitController();
          if (orbitCtrl && typeof orbitCtrl.openOrbit === 'function') {
            orbitCtrl.openOrbit(fromView || 'view-shadow-world');
          }
        }
      });
      return window.shadowCrystalTowerController;
    });
  }
  return controllerPromises.shadowCrystalTower;
}

// Initialize Application
function initApp() {
  initStarsCanvas();
  setupEventListeners();
  initAuthObserver();
  
  // Instantly release initial selection UI to user
  hideInitialLoader();

  // Setup entrance button on Selection page (strictly protected by authentication guard)
  const btnGotoUniverses = document.getElementById('btn-goto-universes-preview');
  if (btnGotoUniverses) {
    btnGotoUniverses.addEventListener('click', async () => {
      if (!currentAuthenticatedUser) {
        showToast('🔒 Silakan pilih karakter dan login terlebih dahulu untuk mengakses Our Little Universe ✧');
        const selStage = document.getElementById('character-selection-stage');
        if (selStage) selStage.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      await ensureUniversesController();
      showUniversesView();
    });
  }

  const btnGotoPhotobooth = document.getElementById('btn-goto-photobooth-preview');
  if (btnGotoPhotobooth) {
    btnGotoPhotobooth.addEventListener('click', async () => {
      const ctrl = await ensurePhotoboothController();
      if (ctrl && typeof ctrl.openPhotobooth === 'function') {
        ctrl.openPhotobooth('view-selection', activeCharacterKey);
      }
    });
  }

  const univBrandLogo = document.getElementById('univ-brand-logo');
  if (univBrandLogo) {
    univBrandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('✧ Our Little Universe: Tiga dunia, satu langit persahabatan ✧');
    });
  }

  // Pre-warm secondary modules during idle frames without freezing the UI
  const prewarmIdle = () => {
    ensureUniversesController().catch(() => {});
    setTimeout(() => {
      ensureMomentsController().catch(() => {});
      ensureOrbitController().catch(() => {});
      ensureStoriesController().catch(() => {});
      ensureMessagesController().catch(() => {});
      ensureGamesController().catch(() => {});
      ensurePhotoboothController().catch(() => {});
      ensureStarMessagesController().catch(() => {});
      ensureKotakPosController().catch(() => {});
      ensureShadowGazeboController().catch(() => {});
      ensureShadowGardenController().catch(() => {});
    }, 1200);
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(prewarmIdle, { timeout: 2000 });
  } else {
    setTimeout(prewarmIdle, 600);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


// Setup Firebase Authentication State Observer
function initAuthObserver() {
  if (!auth) {
    console.info('Firebase Auth belum diinisialisasi (menunggu kredensial .env).');
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    currentAuthenticatedUser = user;

    if (user) {
      try {
        if (!user.emailVerified && typeof user.reload === 'function') {
          await user.reload();
        }
        if (typeof user.getIdToken === 'function') {
          await user.getIdToken(true);
        }
      } catch (refreshErr) {
        console.warn('Notice refreshing session ID token:', refreshErr);
      }

      console.log('Firebase Auth session aktif:', user.email, user.uid, 'emailVerified:', user.emailVerified);

      // Verify the character strictly from the user's UID (Single Source of Truth)
      const verifiedChar = identifyUserCharacter(user);
      if (!verifiedChar) {
        console.warn('User UID tidak terdaftar sebagai karakter resmi:', user.uid);
        await logoutFirebase();
        lockdownPrivateUniverse();
        hideInitialLoader();
        return;
      }

      // If user is currently on the login view and chose a DIFFERENT character:
      if (viewLogin.classList.contains('active') && activeCharacterKey && activeCharacterKey !== verifiedChar) {
        console.warn(`Sesi aktif (${verifiedChar}) tidak cocok dengan karakter yang dipilih (${activeCharacterKey}). Mengakhiri sesi yang tidak sesuai.`);
        await logoutFirebase();
        currentAuthenticatedUser = null;
        hideInitialLoader();
        return;
      }

      // Check authorization
      const check = verifyCharacterAuthorization(user, verifiedChar);
      if (check.authorized) {
        const storedActiveSession = sessionStorage.getItem('activeUniverseSession');
        const isWorldActive = (
          document.getElementById('view-kidult-world')?.classList.contains('active') ||
          document.getElementById('view-toyou-world')?.classList.contains('active') ||
          document.getElementById('view-shadow-world')?.classList.contains('active') ||
          viewPrivateUniverse?.classList.contains('active')
        );

        // Only auto-restore universe if user had an explicit active session inside a universe before reload
        // and no conflicting character selection is active. Never auto-enter a universe when unselected.
        const hasExplicitSession = Boolean(storedActiveSession && storedActiveSession === verifiedChar);
        const selectionMatches = !activeCharacterKey || activeCharacterKey === verifiedChar;
        if ((hasExplicitSession || isWorldActive) && selectionMatches && !viewLogin?.classList.contains('active')) {
          activeCharacterKey = verifiedChar;
          sessionStorage.setItem('activeUniverseSession', verifiedChar);
          dbSyncUserProfile(user, verifiedChar).catch((e) => console.warn('User profile sync notice:', e));
          dbMigrateUniverseState(user).catch((e) => console.warn('Universe state migration notice:', e));
          if (window.universesController?.syncUniverseStateActiveCharacter) {
            window.universesController.syncUniverseStateActiveCharacter(verifiedChar, user);
          }
          await renderPrivateUniverse(user, check.characterConfig);
          hideInitialLoader();
          return;
        }

        // On landing / selection screen, do NOT bypass character selection
        console.log('Sesi Firebase terdeteksi, menunggu aksi pengguna di layar pemilihan/login.');
        hideInitialLoader();
        return;
      } else {
        sessionStorage.removeItem('activeUniverseSession');
        await logoutFirebase();
        currentAuthenticatedUser = null;
        activeCharacterKey = null;
        lockdownPrivateUniverse();
        hideInitialLoader();
        return;
      }
    } else if (!isPreviewingUniverses) {
      // If signed out, ensure private universe view is locked down
      lockdownPrivateUniverse();
    }
    hideInitialLoader();
  });
}

// Setup UI Interaction Events
function setupEventListeners() {
  // Character Card Selection
  cardButtons.forEach((card) => {
    card.addEventListener('click', async () => {
      const charKey = card.getAttribute('data-character');
      if (CHARACTERS[charKey]) {
        await selectCharacter(charKey);
      }
    });
  });

  // Back Navigation
  if (btnBack) {
    btnBack.addEventListener('click', returnToSelection);
  }
  if (btnSwitchOther) {
    btnSwitchOther.addEventListener('click', returnToSelection);
  }

  // Logout Button
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }

  // Password Visibility Toggle
  if (btnTogglePassword && passwordInput) {
    btnTogglePassword.addEventListener('click', togglePasswordVisibility);
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  // Interactive Theme Orb
  if (themeOrb) {
    themeOrb.addEventListener('click', () => {
      showToast('✧ Cahaya bulan bersinar di Our Little Universe ✧');
      triggerSparkleBurst(window.innerWidth - 60, 60);
    });
  }

  // Clear feedback on typing
  if (passwordInput) {
    passwordInput.addEventListener('input', clearFeedback);
  }
  if (emailInput) {
    emailInput.addEventListener('input', clearFeedback);
  }
}

function clearFeedback() {
  if (inputFeedback) {
    inputFeedback.textContent = '';
    inputFeedback.className = 'input-feedback-msg';
  }
}

// Select Character & Transition to Login View
async function selectCharacter(charKey) {
  const char = CHARACTERS[charKey];
  if (!char) return;

  activeCharacterKey = charKey;

  // 1. Strict Session Verification: Check if there is an active Firebase Auth user
  const existingUser = auth?.currentUser || currentAuthenticatedUser;
  if (existingUser) {
    const existingChar = identifyUserCharacter(existingUser);
    if (existingChar && existingChar !== charKey) {
      console.warn(`Sesi aktif (${existingChar || existingUser.uid}) bukan ${charKey}. Mengakhiri sesi lama sebelum login ${charKey}...`);
      sessionStorage.removeItem('activeUniverseSession');
      try {
        await logoutFirebase();
      } catch (err) {
        console.warn('Notice logging out mismatched session:', err);
      }
      currentAuthenticatedUser = null;
    }
  }

  // 2. Prepare Login View for the chosen character
  // Do NOT pre-bind stories active identity before Firebase authentication succeeds
  setActiveUserCharacter(charKey);
  setActiveUserMoments(charKey);
  setActiveUserStories(null);
  setActiveUserMessages(charKey);
  setActiveUserGames(charKey);
  
  // Pre-warm universes controller quietly in background
  ensureUniversesController().catch(() => {});

  if (window.storiesController?.syncActiveUser) {
    window.storiesController.syncActiveUser(null, null);
  }
  if (window.photoboothController?.syncPhotoboothActiveCharacter) {
    window.photoboothController.syncPhotoboothActiveCharacter(charKey, 'session');
  }
  if (window.messagesController?.syncMessagesActiveCharacter) {
    window.messagesController.syncMessagesActiveCharacter(charKey);
  }
  if (window.gamesController?.syncGamesActiveCharacter) {
    window.gamesController.syncGamesActiveCharacter(charKey);
  }
  if (window.kotakPosController?.syncKotakPosActiveCharacter) {
    window.kotakPosController.syncKotakPosActiveCharacter(charKey);
  }

  // Update theme class on body
  document.body.classList.remove('theme-nyanya', 'theme-lala', 'theme-lele', 'theme-abil', 'theme-akhira', 'theme-ela', 'theme-ruben');
  document.body.classList.add(char.themeClass);

  // Populate Login Card with Character Data
  loginCharImg.src = char.portrait;
  loginCharImg.alt = `${char.name} - ${char.role}`;
  loginCharIcon.textContent = char.symbol;
  loginCharName.textContent = char.name;
  loginCharRole.textContent = char.role;
  loginGreetingName.textContent = char.name;

  // Prefill Email with expected canonical email
  const authRules = CHARACTER_AUTH_RULES[charKey];
  if (emailInput) {
    emailInput.value = authRules?.expectedEmail || `${charKey}@ourlittleuniverse.com`;
  }

  // Reset Password & Feedback
  if (passwordInput) {
    passwordInput.value = '';
    passwordInput.type = 'password';
    updateEyeIcon(false);
  }

  clearFeedback();
  setSubmitLoading(false);

  // Transition Views
  viewSelection.classList.remove('active');
  viewSelection.setAttribute('aria-hidden', 'true');
  if (viewPrivateUniverse) {
    viewPrivateUniverse.classList.remove('active');
    viewPrivateUniverse.setAttribute('aria-hidden', 'true');
  }

  setTimeout(() => {
    viewLogin.classList.add('active');
    viewLogin.setAttribute('aria-hidden', 'false');
    // Focus appropriate input for smooth UX
    setTimeout(() => {
      if (emailInput && !emailInput.value) {
        emailInput.focus();
      } else if (passwordInput) {
        passwordInput.focus();
      }
    }, 280);
  }, 180);

  // Sound feedback effect
  playMagicalTone(charKey);
}

// Return to Character Selection View
function returnToSelection() {
  if (isSubmitting) return;

  activeCharacterKey = null;
  sessionStorage.removeItem('activeUniverseSession');

  viewLogin.classList.remove('active');
  viewLogin.setAttribute('aria-hidden', 'true');

  if (viewPrivateUniverse) {
    viewPrivateUniverse.classList.remove('active');
    viewPrivateUniverse.setAttribute('aria-hidden', 'true');
  }
  const viewKidult = document.getElementById('view-kidult-world');
  if (viewKidult) {
    viewKidult.classList.remove('active');
    viewKidult.setAttribute('aria-hidden', 'true');
  }
  const viewToYou = document.getElementById('view-toyou-world');
  if (viewToYou) {
    viewToYou.classList.remove('active');
    viewToYou.setAttribute('aria-hidden', 'true');
  }
  const viewShadow = document.getElementById('view-shadow-world');
  if (viewShadow) {
    viewShadow.classList.remove('active');
    viewShadow.setAttribute('aria-hidden', 'true');
  }
  const viewPhotobooth = document.getElementById('view-photobooth');
  if (viewPhotobooth) {
    viewPhotobooth.classList.remove('active');
    viewPhotobooth.setAttribute('aria-hidden', 'true');
  }
  ['view-our-stories', 'view-story-workspace', 'view-story-reading', 'view-messages', 'view-games', 'view-star-messages', 'view-kotak-pos', 'view-shadow-gazebo', 'view-shadow-garden', 'view-moonlight-pond', 'view-shadow-art-gallery'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    }
  });
  stopLocalCamera(false);

  setTimeout(() => {
    // Reset body theme to neutral cosmic
    document.body.classList.remove('theme-nyanya', 'theme-lala', 'theme-lele');
    viewSelection.classList.add('active');
    viewSelection.setAttribute('aria-hidden', 'false');
  }, 180);
}

// Toggle Password Visibility
function togglePasswordVisibility() {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  updateEyeIcon(!isPassword);
}

function updateEyeIcon(isShown) {
  const eyeOpen = btnTogglePassword.querySelector('.eye-open');
  const eyeClosed = btnTogglePassword.querySelector('.eye-closed');
  if (isShown) {
    eyeOpen.classList.add('hidden');
    eyeClosed.classList.remove('hidden');
    btnTogglePassword.setAttribute('aria-label', 'Sembunyikan password');
  } else {
    eyeOpen.classList.remove('hidden');
    eyeClosed.classList.add('hidden');
    btnTogglePassword.setAttribute('aria-label', 'Tampilkan password');
  }
}

// Set Submit Button Loading State
function setSubmitLoading(isLoading) {
  isSubmitting = isLoading;
  if (!btnUniverseSubmit) return;

  btnUniverseSubmit.disabled = isLoading;
  if (emailInput) emailInput.disabled = isLoading;
  if (passwordInput) passwordInput.disabled = isLoading;
  if (btnBack) btnBack.disabled = isLoading;
  if (btnSwitchOther) btnSwitchOther.disabled = isLoading;

  if (isLoading) {
    btnSpinner.classList.remove('hidden');
    btnStarIcon.classList.add('hidden');
    btnSubmitText.textContent = 'Menghubungkan ke Universe...';
  } else {
    btnSpinner.classList.add('hidden');
    btnStarIcon.classList.remove('hidden');
    btnSubmitText.textContent = 'Masuk ke Universe';
  }
}

// Handle Real Firebase Login Submit
async function handleLoginSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!email) {
    showErrorFeedback('Silakan masukkan email akunmu terlebih dahulu ✧');
    emailInput?.focus();
    return;
  }

  if (!password) {
    showErrorFeedback('Silakan masukkan password akunmu terlebih dahulu ✧');
    passwordInput?.focus();
    return;
  }

  // 1. Check if Firebase configuration is active
  if (!isFirebaseConfigured()) {
    showErrorFeedback(
      'Konfigurasi Firebase belum terpasang di file .env. Silakan tambahkan VITE_FIREBASE_API_KEY & VITE_FIREBASE_PROJECT_ID terlebih dahulu.'
    );
    showToast('Konfigurasi Firebase belum lengkap ⚠️');
    return;
  }

  const char = CHARACTERS[activeCharacterKey];
  const charName = char ? char.name : 'Sahabat';

  setSubmitLoading(true);
  clearFeedback();

  try {
    // 2. Perform authentic Firebase login and strict character validation
    const result = await loginWithFirebase(activeCharacterKey, email, password);

    currentAuthenticatedUser = result.user;

    // Strict UID verification: character must strictly match the verified Firebase UID
    const verifiedChar = identifyUserCharacter(result.user);
    const expectedUid = CHARACTER_AUTH_RULES[activeCharacterKey]?.expectedUid;
    if (!verifiedChar || verifiedChar !== activeCharacterKey || (expectedUid && result.user.uid !== expectedUid)) {
      await logoutFirebase();
      currentAuthenticatedUser = null;
      sessionStorage.removeItem('activeUniverseSession');
      throw new Error(`Kredensial yang dimasukkan bukan milik ${charName}.`);
    }

    activeCharacterKey = verifiedChar;
    sessionStorage.setItem('activeUniverseSession', verifiedChar);

    // Success feedback
    inputFeedback.textContent = '✦ Kredensial terverifikasi! Membuka gerbang universe... ✦';
    inputFeedback.className = 'input-feedback-msg success';

    showToast(`Selamat datang di Universe ${charName}! ✨`);
    triggerSparkleBurst(window.innerWidth / 2, window.innerHeight / 2);

    // Transition to protected private universe page
    setTimeout(() => {
      renderPrivateUniverse(result.user, result.characterConfig);
      setSubmitLoading(false);
    }, 600);

  } catch (error) {
    setSubmitLoading(false);
    console.error('Login error:', error);

    const friendlyMsg = mapFirebaseError(error);
    showErrorFeedback(friendlyMsg);
    showToast('Akses masuk belum berhasil ✧');
  }
}

// Translate and Map Firebase Authentication Errors to Friendly Indonesian
function mapFirebaseError(error) {
  if (!error) return 'Terjadi kesalahan saat masuk. Silakan coba lagi.';

  // If error is already our custom validation message (e.g. character mismatch or missing env)
  if (error.message && (error.message.startsWith('Akses ditolak:') || error.message.startsWith('Konfigurasi'))) {
    return error.message;
  }

  const code = error.code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email atau password tidak sesuai. Pastikan akun dan sandi sudah benar ✧';
    case 'auth/invalid-email':
      return 'Format email tidak valid. Silakan periksa kembali format alamat email Anda.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan oleh administrator.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan masuk yang gagal. Akses ditangguhkan sementara demi keamanan.';
    case 'auth/network-request-failed':
      return 'Gagal terhubung ke server Firebase. Pastikan perangkat Anda terhubung ke internet.';
    case 'auth/internal-error':
      return 'Terjadi kendala internal pada server autentikasi. Silakan coba sesaat lagi.';
    default:
      return error.message || 'Gagal memverifikasi akun ke universe. Silakan periksa kembali kredensial.';
  }
}

function showErrorFeedback(message) {
  if (inputFeedback) {
    inputFeedback.textContent = message;
    inputFeedback.className = 'input-feedback-msg error';
  }
}

// Render, Guard and Auto-Redirect to User's Own Universe View
async function renderPrivateUniverse(user, characterConfig, autoOpenOwnWorld = true) {
  if (!user || !user.uid) {
    lockdownPrivateUniverse();
    return;
  }

  // CRITICAL: ALWAYS verify the canonical character strictly from verified Firebase UID (Single Source of Truth)
  const verifiedCharKey = identifyUserCharacter(user);
  const charId = verifiedCharKey;

  const validUniverses = {
    nyanya: 'KIDULT',
    lala: 'TO YOU',
    lele: 'SHADOW',
    abil: 'PINWHEEL',
    akhira: 'YAWN',
    ela: 'US AGAIN',
    ruben: 'ASH'
  };

  if (!charId || !validUniverses[charId]) {
    console.error('Karakter tidak terdaftar sebagai pemilik universe yang sah:', { uid: user.uid, charId });
    showToast('⚠️ Akun ini tidak terdaftar sebagai pemilik universe yang sah.');
    showErrorFeedback('Akses ditolak: Akun tidak memiliki universe yang sah.');
    lockdownPrivateUniverse();
    return;
  }

  activeCharacterKey = charId;
  const char = CHARACTERS[charId] || CHARACTER_AUTH_RULES[charId] || characterConfig;
  setActiveUserCharacter(charId);
  setActiveUserMoments(charId);
  setActiveUserStories(charId, user);
  setActiveUserMessages(charId);
  setActiveUserGames(charId);
  if (window.storiesController?.syncActiveUser) {
    window.storiesController.syncActiveUser(charId, user);
  }
  if (window.photoboothController?.syncPhotoboothActiveCharacter) {
    window.photoboothController.syncPhotoboothActiveCharacter(charId, 'firebase');
  }
  if (window.messagesController?.syncMessagesActiveCharacter) {
    window.messagesController.syncMessagesActiveCharacter(charId);
  }
  if (window.gamesController?.syncGamesActiveCharacter) {
    window.gamesController.syncGamesActiveCharacter(charId);
  }
  if (window.starMessagesController?.syncStarMessagesActiveCharacter) {
    window.starMessagesController.syncStarMessagesActiveCharacter(charId, user);
  }
  if (window.kotakPosController?.syncKotakPosActiveCharacter) {
    window.kotakPosController.syncKotakPosActiveCharacter(charId, user);
  }

  // Set theme on body
  document.body.classList.remove('theme-nyanya', 'theme-lala', 'theme-lele', 'theme-abil', 'theme-akhira', 'theme-ela', 'theme-ruben');
  document.body.classList.add(char.themeClass);

  // Populate private header & user metadata
  if (privateUniverseTitle) privateUniverseTitle.textContent = `UNIVERSE ${char.universe}`;
  if (privateUserName) privateUserName.textContent = char.name;
  if (privateUserRole) privateUserRole.textContent = char.role;
  if (privateWelcomeSymbol) privateWelcomeSymbol.textContent = char.symbol;
  if (privateWelcomeHeading) privateWelcomeHeading.textContent = `Selamat Datang di Universe ${char.universe}`;

  // Populate audit information
  if (auditCharacterName) auditCharacterName.textContent = `${char.name} (${char.role})`;
  if (auditEmail) auditEmail.textContent = user.email || '-';
  if (auditUid) auditUid.textContent = user.uid || '-';
  if (auditUniverse) auditUniverse.textContent = char.universe;

  // Switch Views: Hide selection, login, and secondary feature views
  viewSelection.classList.remove('active');
  viewSelection.setAttribute('aria-hidden', 'true');
  viewLogin.classList.remove('active');
  viewLogin.setAttribute('aria-hidden', 'true');

  ['view-orbit', 'view-moments', 'view-photobooth', 'view-our-stories', 'view-story-workspace', 'view-story-reading', 'view-messages', 'view-games', 'view-star-messages', 'view-kotak-pos', 'view-shadow-gazebo', 'view-shadow-garden', 'view-moonlight-pond', 'view-shadow-art-gallery'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    }
  });

  const univCtrl = await ensureUniversesController();

  // Always update 3 Island Cards and user profile (badges MY UNIVERSE vs VISIT UNIVERSE)
  if (univCtrl && typeof univCtrl.syncUniverseStateActiveCharacter === 'function') {
    univCtrl.syncUniverseStateActiveCharacter(charId, user);
  } else if (univCtrl && typeof univCtrl.updateUserProfile === 'function') {
    univCtrl.updateUserProfile(charId, user);
  }

  // Automatic Post-Login Redirect: Directly open user's own universe
  if (autoOpenOwnWorld && univCtrl) {
    if (charId === 'nyanya' && typeof univCtrl.openKidultWorld === 'function') {
      univCtrl.openKidultWorld();
      return;
    } else if (charId === 'lala' && typeof univCtrl.openToYouWorld === 'function') {
      univCtrl.openToYouWorld();
      return;
    } else if (charId === 'lele' && typeof univCtrl.openShadowWorld === 'function') {
      univCtrl.openShadowWorld();
      return;
    }
  }

  // Fallback to three universes selection page if autoOpenOwnWorld is false
  ['view-kidult-world', 'view-toyou-world', 'view-shadow-world'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    }
  });
  viewPrivateUniverse.classList.add('active');
  viewPrivateUniverse.setAttribute('aria-hidden', 'false');
}

// Helper to open Universes view anytime
async function showUniversesView() {
  await ensureUniversesController();
  isPreviewingUniverses = true;
  if (viewSelection) {
    viewSelection.classList.remove('active');
    viewSelection.setAttribute('aria-hidden', 'true');
  }
  if (viewLogin) {
    viewLogin.classList.remove('active');
    viewLogin.setAttribute('aria-hidden', 'true');
  }
  const viewOrbit = document.getElementById('view-orbit');
  if (viewOrbit) {
    viewOrbit.classList.remove('active');
    viewOrbit.setAttribute('aria-hidden', 'true');
  }
  const viewMoments = document.getElementById('view-moments');
  if (viewMoments) {
    viewMoments.classList.remove('active');
    viewMoments.setAttribute('aria-hidden', 'true');
  }
  const viewKidult = document.getElementById('view-kidult-world');
  if (viewKidult) {
    viewKidult.classList.remove('active');
    viewKidult.setAttribute('aria-hidden', 'true');
  }
  const viewToYou = document.getElementById('view-toyou-world');
  if (viewToYou) {
    viewToYou.classList.remove('active');
    viewToYou.setAttribute('aria-hidden', 'true');
  }
  const viewShadow = document.getElementById('view-shadow-world');
  if (viewShadow) {
    viewShadow.classList.remove('active');
    viewShadow.setAttribute('aria-hidden', 'true');
  }
  const viewPhotobooth = document.getElementById('view-photobooth');
  if (viewPhotobooth) {
    viewPhotobooth.classList.remove('active');
    viewPhotobooth.setAttribute('aria-hidden', 'true');
  }
  ['view-our-stories', 'view-story-workspace', 'view-story-reading', 'view-messages', 'view-games', 'view-star-messages', 'view-kotak-pos', 'view-shadow-gazebo', 'view-shadow-garden', 'view-moonlight-pond', 'view-shadow-art-gallery'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    }
  });
  stopLocalCamera(false);

  if (viewPrivateUniverse) {
    viewPrivateUniverse.classList.add('active');
    viewPrivateUniverse.setAttribute('aria-hidden', 'false');
  }

  if (activeCharacterKey) {
    if (window.universesController && typeof window.universesController.updateUserProfile === 'function') {
      window.universesController.updateUserProfile(activeCharacterKey);
    }
    setActiveUserCharacter(activeCharacterKey);
    setActiveUserMoments(activeCharacterKey);
  }
}

// Lockdown Private Universe (If user logs out or session is terminated)
function lockdownPrivateUniverse() {
  const allProtectedViews = [
    'view-private-universe',
    'view-kidult-world',
    'view-toyou-world',
    'view-shadow-world',
    'view-messages',
    'view-games',
    'view-orbit',
    'view-moments',
    'view-photobooth',
    'view-our-stories',
    'view-story-workspace',
    'view-story-reading',
    'view-star-messages',
    'view-kotak-pos',
    'view-shadow-gazebo',
    'view-shadow-garden',
    'view-moonlight-pond', 'view-shadow-art-gallery'
  ];

  allProtectedViews.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    }
  });

  // Clear active stories state when private universe locks down
  setActiveUserStories(null);
  if (window.storiesController?.syncActiveUser) {
    window.storiesController.syncActiveUser(null, null);
  }

  // Clear private data from DOM
  if (auditEmail) auditEmail.textContent = '-';
  if (auditUid) auditUid.textContent = '-';
  if (auditCharacterName) auditCharacterName.textContent = '-';
  if (auditUniverse) auditUniverse.textContent = '-';

  if (!viewLogin.classList.contains('active') && !activeCharacterKey) {
    viewSelection.classList.add('active');
    viewSelection.setAttribute('aria-hidden', 'false');
    document.body.classList.remove(
      'theme-nyanya',
      'theme-lala',
      'theme-lele',
      'theme-abil',
      'theme-akhira',
      'theme-ela',
      'theme-ruben'
    );
  }
}

// Handle Logout
async function handleLogout() {
  try {
    sessionStorage.removeItem('activeUniverseSession');
    try {
      localStorage.removeItem('olu_active_char_v1');
      localStorage.removeItem('olu_pb_active_char');
    } catch (_) {}
    isPreviewingUniverses = false;
    if (window.universesController?.cleanupUniverseStateOnLogout) {
      window.universesController.cleanupUniverseStateOnLogout();
    }
    stopLocalCamera();
    await logoutFirebase();
    currentAuthenticatedUser = null;
    activeCharacterKey = null;
    setActiveUserCharacter(null);
    setActiveUserMoments(null);
    setActiveUserStories(null);
    setActiveUserMessages(null);
    setActiveUserGames(null);
    if (window.storiesController?.syncActiveUser) {
      window.storiesController.syncActiveUser(null, null);
    }

    lockdownPrivateUniverse();
    showToast('Anda telah keluar dari ruang privat Universe ✧');
  } catch (err) {
    console.error('Logout error:', err);
    showToast('Gagal keluar sesi: ' + (err.message || 'Error'));
  }
}

// Toast Notification
let toastTimer = null;
function showToast(message) {
  if (!universeToast) return;
  toastText.textContent = message;
  universeToast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    universeToast.classList.remove('show');
  }, 3800);
}

// Web Audio API Synthesizer for Magical Subtle Tones
function playMagicalTone(charKey) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const pitches = {
      nyanya: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 (mystical arpeggio)
      lala: [587.33, 739.99, 880.00, 1174.66],   // D5, F#5, A5, D6 (warm cheerful)
      lele: [440.00, 554.37, 659.25, 880.00]    // A4, C#5, E5, A5 (celestial calm)
    };

    const notes = pitches[charKey] || pitches.nyanya;
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
    });
  } catch (err) {
    // Audio is optional enhancement
  }
}

// ==========================================================================
// INTERACTIVE STARFIELD & FLOATING COSMIC DUST CANVAS
// ==========================================================================
function initStarsCanvas() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let stars = [];
  let sparkles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createStars();
  }

  window.addEventListener('resize', resize);
  resize();

  function createStars() {
    stars = [];
    const count = Math.floor((width * height) / 3800); // Dynamic density
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        vy: (Math.random() - 0.5) * 0.15,
        vx: (Math.random() - 0.5) * 0.15,
        color: getRandomStarColor()
      });
    }
  }

  function getRandomStarColor() {
    const colors = [
      'rgba(255, 255, 255, ',
      'rgba(226, 212, 255, ',
      'rgba(255, 214, 240, ',
      'rgba(200, 225, 255, '
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Animation Loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    const now = Date.now() * 0.001;

    // Draw twinkling stars
    stars.forEach((star) => {
      star.y += star.vy;
      star.x += star.vx;

      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;
      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;

      const dynamicAlpha = star.alpha * (0.6 + 0.4 * Math.sin(now * star.twinkleSpeed * 50 + star.twinkleOffset));

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color + dynamicAlpha + ')';
      ctx.shadowColor = star.color + '0.8)';
      ctx.shadowBlur = star.radius > 1 ? 6 : 2;
      ctx.fill();
    });

    // Draw active sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= sp.decay;
      sp.size *= 0.98;

      if (sp.alpha <= 0 || sp.size < 0.2) {
        sparkles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(sp.rotation);
      ctx.fillStyle = sp.color + sp.alpha + ')';
      ctx.shadowColor = sp.color + '1)';
      ctx.shadowBlur = 10;

      // Draw 4-pointed star
      ctx.beginPath();
      const s = sp.size;
      ctx.moveTo(0, -s * 2);
      ctx.quadraticCurveTo(0, 0, s * 2, 0);
      ctx.quadraticCurveTo(0, 0, 0, s * 2);
      ctx.quadraticCurveTo(0, 0, -s * 2, 0);
      ctx.quadraticCurveTo(0, 0, 0, -s * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  render();

  // Expose sparkle burst function
  window.triggerSparkleBurst = function (originX, originY) {
    const colors = [
      'rgba(244, 114, 182, ',
      'rgba(192, 132, 252, ',
      'rgba(253, 224, 71, ',
      'rgba(129, 140, 248, ',
      'rgba(255, 255, 255, '
    ];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      sparkles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.015,
        rotation: Math.random() * Math.PI,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };
}
