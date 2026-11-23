/**
 * OUR LITTLE UNIVERSE — SHADOW MOOD SYSTEM & ANGEL/DEVIL SIDE CONTROLLER
 * Lele · Half Angel, Half Devil (Crystal Moon Sanctuary)
 * =============================================================================
 */

export const LELE_UID = '1ArxphLQpAOoOIvH9BKYw0ebD1e2';

export const SHADOW_MOODS = {
  bahagia: {
    id: 'bahagia',
    label: 'Bahagia',
    icon: '😊',
    desc: 'Sedang merasa bahagia dan bersinar',
    songTitle: '♫ Moonlit Joy Waltz ♫',
    songDesc: 'Alunan piano kristal riang di bawah sinar purnama (SHADOW)',
    roots: [523.25, 659.25, 783.99, 1046.5] // C Major
  },
  tenang: {
    id: 'tenang',
    label: 'Tenang',
    icon: '🌸',
    desc: 'Tenang dan damai dalam keheningan malam',
    songTitle: '♫ Crystal Moon Serenade ♫',
    songDesc: 'Petikan harpa lembut di tepi sungai kristal (SHADOW)',
    roots: [440.0, 554.37, 659.25, 880.0] // A Major
  },
  lelah: {
    id: 'lelah',
    label: 'Lelah',
    icon: '🌙',
    desc: 'Sedang lelah dan butuh tempat beristirahat',
    songTitle: '♫ Nightfall Lullaby ♫',
    songDesc: 'Kotak musik temaram pengantar lelap di ranjang obsidian (SHADOW)',
    roots: [329.63, 392.0, 493.88, 659.25] // E Minor
  },
  sedih: {
    id: 'sedih',
    label: 'Sedih',
    icon: '🌧️',
    desc: 'Sedang sedih memeluk bayangan batin',
    songTitle: '♫ Rain Over the Spire ♫',
    songDesc: 'Rintik hujan lembut membasuh kaca menara kristal (SHADOW)',
    roots: [349.23, 440.0, 523.25, 698.46] // F Minor
  },
  bersemangat: {
    id: 'bersemangat',
    label: 'Bersemangat',
    icon: '✨',
    desc: 'Penuh semangat dan kilau energi baru',
    songTitle: '♫ Eclipse Rising Anthem ♫',
    songDesc: 'Harmoni megah menyambut pendar gerhana kosmik (SHADOW)',
    roots: [587.33, 739.99, 880.0, 1174.66] // D Major
  },
  bingung: {
    id: 'bingung',
    label: 'Bingung',
    icon: '🌀',
    desc: 'Sedang bingung mencari arah langkah',
    songTitle: '♫ Whispering Armillary ♫',
    songDesc: 'Denting bola teleskop mengurai keraguan pikiran (SHADOW)',
    roots: [493.88, 587.33, 739.99, 987.77] // B Minor
  },
  menyendiri: {
    id: 'menyendiri',
    label: 'Menyendiri',
    icon: '🌘',
    desc: 'Ingin menikmati waktu sendiri dalam privasi',
    songTitle: '♫ Solitude by the Pond ♫',
    songDesc: 'Gemericik air kolam teratai menemani keheningan jiwa (SHADOW)',
    roots: [392.0, 466.16, 587.33, 783.99] // G Minor
  },
  bersyukur: {
    id: 'bersyukur',
    label: 'Bersyukur',
    icon: '🙏',
    desc: 'Sedang merasa bersyukur atas perjalanan ini',
    songTitle: '♫ Starlight Gratitude Hymn ♫',
    songDesc: 'Kidungan syukur tulus melintasi galaksi malam (SHADOW)',
    roots: [440.0, 523.25, 659.25, 880.0] // A Minor / C
  },
  ceria: {
    id: 'ceria',
    label: 'Playful',
    icon: '🎭',
    desc: 'Sedang ingin bercanda dan tersenyum',
    songTitle: '♫ Chibi Guardian Dance ♫',
    songDesc: 'Irama lincah langkah ceria di jalan setapak kristal (SHADOW)',
    roots: [523.25, 659.25, 783.99, 987.77] // C Major 7
  },
  hening: {
    id: 'hening',
    label: 'Quiet',
    icon: '🕯️',
    desc: 'Ingin menikmati ketenangan hening tanpa kata',
    songTitle: '♫ Silent Amethyst Echoes ♫',
    songDesc: 'Resonansi kristal murni meneduhkan seluruh sudut istana (SHADOW)',
    roots: [369.99, 440.0, 554.37, 739.99] // F# Minor
  }
};

// Aliases for English / alternate keys
SHADOW_MOODS.happy = SHADOW_MOODS.bahagia;
SHADOW_MOODS.calm = SHADOW_MOODS.tenang;
SHADOW_MOODS.tired = SHADOW_MOODS.lelah;
SHADOW_MOODS.sad = SHADOW_MOODS.sedih;
SHADOW_MOODS.excited = SHADOW_MOODS.bersemangat;
SHADOW_MOODS.confused = SHADOW_MOODS.bingung;
SHADOW_MOODS.lonely = SHADOW_MOODS.menyendiri;
SHADOW_MOODS.grateful = SHADOW_MOODS.bersyukur;
SHADOW_MOODS.playful = SHADOW_MOODS.ceria;
SHADOW_MOODS.quiet = SHADOW_MOODS.hening;

export const SHADOW_DUALITY_SIDES = {
  angel: {
    id: 'angel',
    title: 'ANGEL — The Gentle Light',
    shortLabel: 'Angel Side',
    badge: 'Angel 🪽',
    icon: '🪽',
    desc: 'A softer light, a quieter heart.',
    subdesc: 'Cahaya bulan lembut, sayap putih bercahaya, dan partikel silver.',
    colorTheme: 'pearl',
    quote: '“A softer light, a quieter heart.”',
    roots: [523.25, 659.25, 783.99, 1046.5]
  },
  devil: {
    id: 'devil',
    title: 'DEVIL — The Dark Flame',
    shortLabel: 'Devil Side',
    badge: 'Devil 🔥',
    icon: '🔥',
    desc: 'Not every shadow is meant to be hidden.',
    subdesc: 'Sayap gelap ungu, kristal amethyst, dan partikel api malam abadi.',
    colorTheme: 'amethyst',
    quote: '“Not every shadow is meant to be hidden.”',
    roots: [329.63, 392.0, 493.88, 659.25]
  },
  eclipse: {
    id: 'eclipse',
    title: 'ECLIPSE — Duality Balanced',
    shortLabel: 'Half Angel, Half Devil',
    badge: 'Eclipse 🌓',
    icon: '🌓',
    desc: 'The angel I became, the devil I never truly left.',
    subdesc: 'Keseimbangan utuh antara terang benderang dan bayangan batin.',
    colorTheme: 'duality',
    quote: '“The angel I became, the devil I never truly left.”',
    roots: [440.0, 523.25, 659.25, 880.0]
  }
};

let audioCtx = null;
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playShadowChord(frequencies = [440, 554.37, 659.25], duration = 1.8) {
  const actx = getAudioContext();
  if (!actx) return;
  try {
    const now = actx.currentTime;
    frequencies.forEach((freq, idx) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.04, now + idx * 0.05 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + idx * 0.1);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + duration + idx * 0.1);
    });
  } catch (err) {
    console.warn('Audio tone playback note:', err);
  }
}

export function initShadowMoodView({
  activeAuthUser = null,
  getActiveAuthUser = null,
  onTriggerSparkle = null,
  onShowToast = null,
  updateElementState = null
} = {}) {
  let currentShadowMoodKey = 'tenang';
  let currentShadowSideKey = 'eclipse';
  let isShadowMoodMusicActive = false;

  function resolveUserUid(activeUser = null) {
    if (activeUser?.uid) return activeUser.uid;
    if (typeof getActiveAuthUser === 'function') {
      const u = getActiveAuthUser();
      if (u?.uid) return u.uid;
    }
    if (activeAuthUser?.uid) return activeAuthUser.uid;
    return LELE_UID;
  }

  // DOM Elements
  const shadowMoodContainer = document.getElementById('shadow-mood-container');
  const shadowMoodCard = document.getElementById('shadow-mood-card');
  const shadowMoodIcon = document.getElementById('shadow-mood-icon');
  const shadowMoodSideOrb = document.getElementById('shadow-mood-side-orb');
  const shadowMoodText = document.getElementById('shadow-mood-text');
  const shadowSideBadge = document.getElementById('shadow-side-badge');
  const btnToggleShadowMoodPicker = document.getElementById('btn-toggle-shadow-mood-picker');
  const btnShadowMoodHistory = document.getElementById('btn-shadow-mood-history');
  const btnSideAngel = document.getElementById('btn-side-angel');
  const btnSideDevil = document.getElementById('btn-side-devil');
  const btnSideEclipse = document.getElementById('btn-side-eclipse');
  const shadowSideQuote = document.getElementById('shadow-side-quote');
  const shadowMoodSong = document.getElementById('shadow-mood-song');
  const btnShadowMoodPlay = document.getElementById('btn-shadow-mood-play');
  const shadowMoodMusicIcon = document.getElementById('shadow-mood-music-icon');
  const shadowMoodOptionsBar = document.getElementById('shadow-mood-options-bar');
  const shadowMoodOptionPills = document.querySelectorAll('.shadow-mood-option-pill');

  // Top-left HUD Lele Status Badges
  const shadowCharMoodIcon = document.getElementById('shadow-char-mood-icon');
  const shadowCharMoodText = document.getElementById('shadow-char-mood-text');
  const shadowCharSideIcon = document.getElementById('shadow-char-side-icon');
  const shadowCharSideText = document.getElementById('shadow-char-side-text');

  // Modal Riwayat Mood
  const shadowMoodHistoryModal = document.getElementById('shadow-mood-history-modal');
  const shadowMoodHistoryBackdrop = document.getElementById('shadow-mood-history-backdrop');
  const btnCloseShadowMoodHistory = document.getElementById('btn-close-shadow-mood-history');
  const shadowMoodHistoryList = document.getElementById('shadow-mood-history-list');

  // World and Actor
  const viewShadowWorld = document.getElementById('view-shadow-world');
  const shadowChibiActor = document.getElementById('shadow-chibi-actor');

  function applyShadowMood(moodKey, saveToState = true, activeUser = null) {
    const moodData = SHADOW_MOODS[moodKey] || SHADOW_MOODS.tenang;
    currentShadowMoodKey = moodData.id;

    if (shadowMoodIcon) shadowMoodIcon.textContent = moodData.icon;
    if (shadowMoodText) shadowMoodText.textContent = moodData.label;
    if (shadowMoodSong) shadowMoodSong.textContent = moodData.songTitle;

    // Update active pill
    if (shadowMoodOptionPills && shadowMoodOptionPills.length > 0) {
      shadowMoodOptionPills.forEach((pill) => {
        const isCurrent = pill.getAttribute('data-mood') === moodData.id;
        pill.classList.toggle('active', isCurrent);
      });
    }

    // Update top-left Character Card status
    if (shadowCharMoodIcon) shadowCharMoodIcon.textContent = moodData.icon;
    if (shadowCharMoodText) shadowCharMoodText.textContent = moodData.label;

    if (saveToState) {
      const userUid = resolveUserUid(activeUser);

      // 1. Persist mood in localStorage
      try {
        localStorage.setItem(`olu_shadow_mood_${userUid}`, moodData.id);
      } catch (_) {}

      // 2. Persist in Firestore element state if available
      if (typeof updateElementState === 'function') {
        try {
          updateElementState('gazebo', { mood: moodData.id });
        } catch (err) {
          console.warn('Notice saving shadow mood to element state:', err);
        }
      }

      // 3. Save to Mood History
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const rawHist = localStorage.getItem(`olu_shadow_mood_history_${userUid}`);
        let history = rawHist ? JSON.parse(rawHist) : [];
        if (!Array.isArray(history)) history = [];

        const currentSide = SHADOW_DUALITY_SIDES[currentShadowSideKey] || SHADOW_DUALITY_SIDES.eclipse;
        const entry = {
          date: todayStr,
          time: timeStr,
          mood: moodData.id,
          label: moodData.label,
          icon: moodData.icon,
          side: currentSide.id,
          sideLabel: currentSide.shortLabel,
          songTitle: moodData.songTitle,
          timestamp: Date.now()
        };
        // Update today's entry or prepend
        history = [entry, ...history.filter((h) => h.date !== todayStr)];
        localStorage.setItem(`olu_shadow_mood_history_${userUid}`, JSON.stringify(history));
      } catch (err) {
        console.warn('Error saving shadow mood history:', err);
      }

      if (onTriggerSparkle) {
        onTriggerSparkle(160, window.innerHeight - 80);
      }

      if (onShowToast) {
        onShowToast(
          isShadowMoodMusicActive
            ? `☾ Mood hari ini: ${moodData.icon} ${moodData.label} · Memutar: ${moodData.songTitle} ♫`
            : `☾ Mood hari ini: ${moodData.icon} ${moodData.label} · Rekomendasi lagu: ${moodData.songTitle} ♫`
        );
      }

      if (isShadowMoodMusicActive) {
        playShadowChord(moodData.roots);
      }
    }
  }

  function applyShadowDuality(sideKey, saveToState = true, activeUser = null) {
    const sideData = SHADOW_DUALITY_SIDES[sideKey] || SHADOW_DUALITY_SIDES.eclipse;
    currentShadowSideKey = sideData.id;

    // Update badge & orb
    if (shadowSideBadge) {
      shadowSideBadge.textContent = sideData.badge;
      shadowSideBadge.title = sideData.title;
    }
    if (shadowMoodSideOrb) {
      shadowMoodSideOrb.textContent = sideData.icon;
      shadowMoodSideOrb.title = sideData.title;
    }

    // Update quote
    if (shadowSideQuote) {
      shadowSideQuote.textContent = sideData.quote;
    }

    // Update duality buttons state
    if (btnSideAngel) btnSideAngel.classList.toggle('active', sideData.id === 'angel');
    if (btnSideDevil) btnSideDevil.classList.toggle('active', sideData.id === 'devil');
    if (btnSideEclipse) btnSideEclipse.classList.toggle('active', sideData.id === 'eclipse');

    // Update top-left Character Card status
    if (shadowCharSideIcon) shadowCharSideIcon.textContent = sideData.icon;
    if (shadowCharSideText) shadowCharSideText.textContent = sideData.shortLabel.split(' ')[0] || 'Eclipse';

    // Thematic Shift in Environment & Chibi Actor
    if (viewShadowWorld) {
      viewShadowWorld.classList.remove('duality-angel', 'duality-devil', 'duality-eclipse');
      viewShadowWorld.classList.add(`duality-${sideData.id}`);
    }

    if (shadowMoodContainer) {
      shadowMoodContainer.classList.remove('is-angel', 'is-devil', 'is-eclipse');
      shadowMoodContainer.classList.add(`is-${sideData.id}`);
    }

    if (saveToState) {
      const userUid = resolveUserUid(activeUser);

      // 1. Persist duality in localStorage
      try {
        localStorage.setItem(`olu_shadow_duality_${userUid}`, sideData.id);
      } catch (_) {}

      // 2. Persist in Firestore element state if available
      if (typeof updateElementState === 'function') {
        try {
          updateElementState('gazebo', { duality: sideData.id });
        } catch (err) {
          console.warn('Notice saving shadow duality to element state:', err);
        }
      }

      if (onTriggerSparkle) {
        onTriggerSparkle(180, window.innerHeight - 90);
      }

      if (onShowToast) {
        if (sideData.id === 'angel') {
          onShowToast(`🪽 ANGEL SIDE — The Gentle Light: ${sideData.desc}`);
        } else if (sideData.id === 'devil') {
          onShowToast(`🔥 DEVIL SIDE — The Dark Flame: ${sideData.desc}`);
        } else {
          onShowToast(`🌓 ECLIPSE — Balanced Duality: ${sideData.desc}`);
        }
      }

      // Play thematic chord
      playShadowChord(sideData.roots, 1.6);
    }
  }

  function restoreShadowMood(userUid = LELE_UID) {
    const uid = userUid || resolveUserUid();
    let savedMood = null;
    let savedDuality = null;

    try {
      savedMood = localStorage.getItem(`olu_shadow_mood_${uid}`);
      savedDuality = localStorage.getItem(`olu_shadow_duality_${uid}`);
    } catch (_) {}

    applyShadowMood(savedMood || 'tenang', false);
    applyShadowDuality(savedDuality || 'eclipse', false);
  }

  function toggleShadowMoodPicker(forceOpen = null) {
    if (!shadowMoodOptionsBar) return;
    const isOpen = forceOpen !== null ? forceOpen : !shadowMoodOptionsBar.classList.contains('is-open');
    shadowMoodOptionsBar.classList.toggle('is-open', isOpen);
    if (btnToggleShadowMoodPicker) {
      btnToggleShadowMoodPicker.classList.toggle('is-active', isOpen);
    }
    if (isOpen && onTriggerSparkle) {
      onTriggerSparkle(180, window.innerHeight - 80);
    }
  }

  function renderShadowMoodHistory(userUid = LELE_UID) {
    if (!shadowMoodHistoryList) return;
    const uid = userUid || resolveUserUid();
    let history = [];
    try {
      const raw = localStorage.getItem(`olu_shadow_mood_history_${uid}`);
      if (raw) history = JSON.parse(raw);
    } catch (_) {}

    if (!Array.isArray(history) || history.length === 0) {
      shadowMoodHistoryList.innerHTML = `
        <div class="shadow-mood-history-empty">
          <span>☾ Belum ada riwayat mood tercatat.<br>Pilih suasana hati dan sisi batin Lele di kartu Mood untuk menyimpannya.</span>
        </div>
      `;
      return;
    }

    shadowMoodHistoryList.innerHTML = history.map((item) => {
      const sideIcon = item.side === 'angel' ? '🪽' : item.side === 'devil' ? '🔥' : '🌓';
      return `
        <div class="shadow-mood-history-item">
          <div class="shadow-hist-left">
            <span class="shadow-hist-icon">${item.icon || '🌸'}</span>
            <div class="shadow-hist-info">
              <div class="shadow-hist-label-row">
                <span class="shadow-hist-label">${item.label || 'Tenang'}</span>
                <span class="shadow-hist-side-tag">${sideIcon} ${item.sideLabel || 'Eclipse'}</span>
              </div>
              <span class="shadow-hist-song">${item.songTitle || '♫ Crystal Moon Serenade ♫'}</span>
            </div>
          </div>
          <div class="shadow-hist-right">
            <span class="shadow-hist-date">${item.date}</span>
            <span class="shadow-hist-time">${item.time || ''}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function openShadowMoodHistory() {
    renderShadowMoodHistory();
    if (shadowMoodHistoryModal) {
      shadowMoodHistoryModal.classList.add('active', 'is-open');
      shadowMoodHistoryModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeShadowMoodHistory() {
    if (shadowMoodHistoryModal) {
      shadowMoodHistoryModal.classList.remove('active', 'is-open');
      shadowMoodHistoryModal.setAttribute('aria-hidden', 'true');
    }
  }

  // Event Listeners Wiring
  if (btnToggleShadowMoodPicker) {
    btnToggleShadowMoodPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShadowMoodPicker();
    });
  }

  if (shadowMoodText) {
    shadowMoodText.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShadowMoodPicker();
    });
  }

  if (shadowMoodIcon) {
    shadowMoodIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShadowMoodPicker();
    });
  }

  if (shadowMoodOptionPills && shadowMoodOptionPills.length > 0) {
    shadowMoodOptionPills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const chosenMood = pill.getAttribute('data-mood');
        applyShadowMood(chosenMood, true);
        toggleShadowMoodPicker(false);
      });
    });
  }

  // Duality Buttons
  if (btnSideAngel) {
    btnSideAngel.addEventListener('click', (e) => {
      e.stopPropagation();
      applyShadowDuality('angel', true);
    });
  }

  if (btnSideDevil) {
    btnSideDevil.addEventListener('click', (e) => {
      e.stopPropagation();
      applyShadowDuality('devil', true);
    });
  }

  if (btnSideEclipse) {
    btnSideEclipse.addEventListener('click', (e) => {
      e.stopPropagation();
      applyShadowDuality('eclipse', true);
    });
  }

  // Sound Play Toggle
  if (btnShadowMoodPlay) {
    btnShadowMoodPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      isShadowMoodMusicActive = !isShadowMoodMusicActive;
      btnShadowMoodPlay.classList.toggle('is-playing', isShadowMoodMusicActive);
      if (shadowMoodMusicIcon) {
        shadowMoodMusicIcon.textContent = isShadowMoodMusicActive ? '⏸' : '▶';
      }
      const moodData = SHADOW_MOODS[currentShadowMoodKey] || SHADOW_MOODS.tenang;
      if (isShadowMoodMusicActive) {
        playShadowChord(moodData.roots);
        if (onShowToast) onShowToast(`♫ Memutar ${moodData.songTitle}: ${moodData.songDesc} ✧`);
      } else {
        if (onShowToast) onShowToast('⏸ Alunan musik suasana dijeda ✧');
      }
    });
  }

  // History Modal
  if (btnShadowMoodHistory) {
    btnShadowMoodHistory.addEventListener('click', (e) => {
      e.stopPropagation();
      openShadowMoodHistory();
    });
  }

  if (btnCloseShadowMoodHistory) {
    btnCloseShadowMoodHistory.addEventListener('click', (e) => {
      e.stopPropagation();
      closeShadowMoodHistory();
    });
  }

  if (shadowMoodHistoryBackdrop) {
    shadowMoodHistoryBackdrop.addEventListener('click', () => {
      closeShadowMoodHistory();
    });
  }

  // Close mood picker options on click outside
  document.addEventListener('click', (e) => {
    if (shadowMoodContainer && !shadowMoodContainer.contains(e.target)) {
      toggleShadowMoodPicker(false);
    }
  });

  // Initial restore
  restoreShadowMood();

  return {
    applyShadowMood,
    getCurrentShadowMood: () => currentShadowMoodKey,
    applyShadowDuality,
    getCurrentShadowDuality: () => currentShadowSideKey,
    restoreShadowMood,
    toggleShadowMoodPicker,
    openShadowMoodHistory,
    closeShadowMoodHistory,
    renderShadowMoodHistory
  };
}
