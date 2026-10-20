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
  identifyUserCharacter
} from './firebase.js';

import { onAuthStateChanged } from 'firebase/auth';
import { initOrbitView } from './orbit_view.js';
import { setActiveUserCharacter } from './orbit.js';
import { initMomentsView } from './moments_view.js';
import { setActiveUserCharacter as setActiveUserMoments } from './moments.js';



// Character Definitions matching reference design and PRD
const CHARACTERS = {
  nyanya: {
    id: 'nyanya',
    name: 'Nyanya',
    role: 'Moonlit Shadow Witch',
    symbol: '☾',
    themeClass: 'theme-nyanya',
    portrait: '/assets/portrait_nyanya_hd_2x.png',
    cardImg: '/assets/card_nyanya_hd_2x.png',
    greeting: 'Selamat datang, Nyanya ✦',
    accentColor: '#c084fc',
    universe: 'SHADOW'
  },
  lala: {
    id: 'lala',
    name: 'Lala',
    role: 'The Everglow Fairy',
    symbol: '☼',
    themeClass: 'theme-lala',
    portrait: '/assets/portrait_lala_hd_2x.png',
    cardImg: '/assets/card_lala_hd_2x.png',
    greeting: 'Selamat datang, Lala ✦',
    accentColor: '#f472b6',
    universe: 'TO YOU'
  },
  lele: {
    id: 'lele',
    name: 'Lele',
    role: 'The Eclipse Guardian',
    symbol: '☾',
    themeClass: 'theme-lele',
    portrait: '/assets/portrait_lele_hd_2x.png',
    cardImg: '/assets/card_lele_hd_2x.png',
    greeting: 'Selamat datang, Lele ✦',
    accentColor: '#818cf8',
    universe: 'KIDULT'
  }
};

// Application State
let activeCharacterKey = null;
let currentAuthenticatedUser = null;
let isSubmitting = false;

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

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initStarsCanvas();
  setupEventListeners();
  initAuthObserver();
  initOrbitView({
    onShowToast: showToast,
    onTriggerSparkle: (x, y) => {
      if (typeof window.triggerSparkleBurst === 'function') {
        window.triggerSparkleBurst(x, y);
      }
    }
  });
  initMomentsView({
    onShowToast: showToast,
    onTriggerSparkle: (x, y) => {
      if (typeof window.triggerSparkleBurst === 'function') {
        window.triggerSparkleBurst(x, y);
      }
    }
  });
});


// Setup Firebase Authentication State Observer
function initAuthObserver() {
  if (!auth) {
    console.info('Firebase Auth belum diinisialisasi (menunggu kredensial .env).');
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    currentAuthenticatedUser = user;

    if (user) {
      console.log('Firebase Auth session aktif:', user.email, user.uid);
      // If user is logged in, determine their character
      const userCharKey = activeCharacterKey || identifyUserCharacter(user);

      if (userCharKey) {
        const check = verifyCharacterAuthorization(user, userCharKey);
        if (check.authorized) {
          activeCharacterKey = userCharKey;
          renderPrivateUniverse(user, check.characterConfig);
          return;
        }
      }
    } else {
      // If signed out, ensure private universe view is locked down
      lockdownPrivateUniverse();
    }
  });
}

// Setup UI Interaction Events
function setupEventListeners() {
  // Character Card Selection
  cardButtons.forEach((card) => {
    card.addEventListener('click', () => {
      const charKey = card.getAttribute('data-character');
      if (CHARACTERS[charKey]) {
        selectCharacter(charKey);
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
function selectCharacter(charKey) {
  const char = CHARACTERS[charKey];
  if (!char) return;

  activeCharacterKey = charKey;

  // Update theme class on body
  document.body.classList.remove('theme-nyanya', 'theme-lala', 'theme-lele');
  document.body.classList.add(char.themeClass);

  // Populate Login Card with Character Data
  loginCharImg.src = char.portrait;
  loginCharImg.alt = `${char.name} - ${char.role}`;
  loginCharIcon.textContent = char.symbol;
  loginCharName.textContent = char.name;
  loginCharRole.textContent = char.role;
  loginGreetingName.textContent = char.name;

  // Prefill Email if configured in environment / auth rules
  const authRules = CHARACTER_AUTH_RULES[charKey];
  if (emailInput) {
    if (authRules && authRules.expectedEmail) {
      emailInput.value = authRules.expectedEmail;
    } else {
      emailInput.value = '';
      emailInput.placeholder = `contoh: ${charKey}@ourlittleuniverse.com`;
    }
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

  viewLogin.classList.remove('active');
  viewLogin.setAttribute('aria-hidden', 'true');

  if (viewPrivateUniverse) {
    viewPrivateUniverse.classList.remove('active');
    viewPrivateUniverse.setAttribute('aria-hidden', 'true');
  }

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

// Render and Guard Private Universe View
function renderPrivateUniverse(user, characterConfig) {
  if (!user || !characterConfig) return;

  const char = CHARACTERS[characterConfig.id] || characterConfig;
  setActiveUserCharacter(characterConfig.id);
  setActiveUserMoments(characterConfig.id);

  // Set theme on body
  document.body.classList.remove('theme-nyanya', 'theme-lala', 'theme-lele');
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

  // Switch Views
  viewSelection.classList.remove('active');
  viewSelection.setAttribute('aria-hidden', 'true');
  viewLogin.classList.remove('active');
  viewLogin.setAttribute('aria-hidden', 'true');

  viewPrivateUniverse.classList.add('active');
  viewPrivateUniverse.setAttribute('aria-hidden', 'false');
}

// Lockdown Private Universe (If user logs out or session is terminated)
function lockdownPrivateUniverse() {
  if (viewPrivateUniverse) {
    viewPrivateUniverse.classList.remove('active');
    viewPrivateUniverse.setAttribute('aria-hidden', 'true');
  }

  // Clear private data from DOM
  if (auditEmail) auditEmail.textContent = '-';
  if (auditUid) auditUid.textContent = '-';

  if (!viewLogin.classList.contains('active')) {
    viewSelection.classList.add('active');
    viewSelection.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('theme-nyanya', 'theme-lala', 'theme-lele');
  }
}

// Handle Logout
async function handleLogout() {
  try {
    await logoutFirebase();
    currentAuthenticatedUser = null;
    activeCharacterKey = null;

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
