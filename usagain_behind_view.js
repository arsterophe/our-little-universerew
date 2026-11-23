/**
 * OUR LITTLE UNIVERSE — BEHIND THE LOTUS CONTROLLER
 * 
 * Manages the Sacred Temple Manuscript & Personal Memoir for Ela (US AGAIN 🌸):
 * "BEHIND THE LOTUS — Some people become a place of peace."
 * 
 * Written from the perspective of author Lele (SHADOW), detailing:
 * - Chapter I: The Priestess (Some People Become a Place of Peace)
 * - Chapter II: Why US AGAIN? (Some Names Are Not Just Names. They Are Prayers)
 * - Chapter III: The Road We Walked Together (Even the Longest Journey Deserves a Place to Rest)
 * - Chapter IV: A Letter from Lele (Until the Morning Comes, I Hope We Find Each Other Again)
 * - Chapter V: Epilogue: US AGAIN (Until We Meet Again, Wherever the Road Takes Us) + Song Integration
 * 
 * Features:
 * - 5 Interactive Chapters with Progress Bar & Indicator Dots
 * - Ambient Japanese Zen Koto and Meditation Chimes via Web Audio API
 * - Strict YouTube Video Lifecycle Management (NO autoplay, user-initiated only,
 *   immediate stop/pause on chapter switch or overlay exit)
 * - Letter Replay & Seal Animations
 * - Keyboard navigation (Escape, ArrowLeft, ArrowRight) and responsive touch navigation
 */

let currentLotusBehindChapter = 1;
let audioCtx = null;
let isSongPlaying = false;
let isBehindViewInitialized = false;

function getAudioCtx() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx && AudioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playZenTone(freq, dur = 0.35, type = 'sine', vol = 0.12) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) {
    // Audio tone suppressed or unsupported in background tab
  }
}

export function playUsAgainBehindVideo() {
  const iframe = document.getElementById('lotus-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      isSongPlaying = true;
      const disc = document.getElementById('lotus-song-disc');
      if (disc) disc.classList.add('playing');
      const btn = document.getElementById('btn-lotus-song-toggle');
      if (btn) btn.innerHTML = '<span>⏸</span><span>Pause Soundtrack</span>';
    } catch (e) {}
  }
}

export function pauseUsAgainBehindVideo() {
  const iframe = document.getElementById('lotus-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      isSongPlaying = false;
      const disc = document.getElementById('lotus-song-disc');
      if (disc) disc.classList.remove('playing');
      const btn = document.getElementById('btn-lotus-song-toggle');
      if (btn) btn.innerHTML = '<span>▶</span><span>Play Soundtrack</span>';
    } catch (e) {}
  }
}

export function stopUsAgainBehindVideo() {
  const iframe = document.getElementById('lotus-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      // Reset iframe src cleanly to ensure complete audio cut
      const currSrc = iframe.src;
      iframe.src = currSrc;
      isSongPlaying = false;
      const disc = document.getElementById('lotus-song-disc');
      if (disc) disc.classList.remove('playing');
      const btn = document.getElementById('btn-lotus-song-toggle');
      if (btn) btn.innerHTML = '<span>▶</span><span>Play Soundtrack</span>';
    } catch (e) {}
  }
}

export function switchUsAgainBehindChapter(targetCh) {
  const ch = Math.max(1, Math.min(5, targetCh));
  currentLotusBehindChapter = ch;

  // Pause YouTube audio immediately if moving away from Epilogue (Chapter 5)
  if (ch !== 5) {
    pauseUsAgainBehindVideo();
  }

  // 1. Update Tabs
  const allTabs = document.querySelectorAll('.lotus-behind-tab-btn');
  allTabs.forEach((tab) => {
    const tabCh = parseInt(tab.getAttribute('data-chapter'), 10);
    const isActive = tabCh === ch;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // 2. Update Chapter Panels
  const allPanels = document.querySelectorAll('.lotus-behind-chapter-panel');
  allPanels.forEach((panel) => {
    const isActive = panel.id === `lotus-behind-chapter-${ch}`;
    panel.classList.toggle('active', isActive);
    if (isActive) {
      panel.scrollTop = 0;
    }
  });

  // 3. Update Progress Bar
  const progressBar = document.getElementById('lotus-behind-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${ch * 20}%`;
  }

  // 4. Update Indicator Dots
  const allDots = document.querySelectorAll('.lotus-indicator-dot');
  allDots.forEach((dot) => {
    const dotCh = parseInt(dot.getAttribute('data-chapter'), 10);
    dot.classList.toggle('active', dotCh === ch);
  });

  // 5. Update Prev / Next Buttons
  const prevBtn = document.getElementById('btn-lotus-behind-prev');
  const nextBtn = document.getElementById('btn-lotus-behind-next');
  if (prevBtn) prevBtn.disabled = (ch === 1);
  if (nextBtn) nextBtn.disabled = (ch === 5);

  // 6. Ambient Zen Koto Bell Chime
  const zenPitchMap = { 1: 261.63, 2: 293.66, 3: 329.63, 4: 392.00, 5: 523.25 };
  playZenTone(zenPitchMap[ch] || 261.63, 0.45, 'sine', 0.12);
}

export function openBehindLotus({ onShowToast, onTriggerSparkle } = {}) {
  const ov = document.getElementById('lotus-behind-overlay');
  if (ov) {
    ov.classList.add('active');
    ov.setAttribute('aria-hidden', 'false');
  }
  switchUsAgainBehindChapter(1);
  playZenTone(329.63, 0.35, 'sine', 0.14);
  setTimeout(() => playZenTone(523.25, 0.45, 'triangle', 0.12), 120);

  if (typeof onTriggerSparkle === 'function') {
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.35);
  }
  if (typeof onShowToast === 'function') {
    onShowToast('Membuka BEHIND THE LOTUS... 🪷🌸✨');
  }
}

export function closeBehindLotus() {
  stopUsAgainBehindVideo();
  const ov = document.getElementById('lotus-behind-overlay');
  if (ov) {
    ov.classList.remove('active');
    ov.setAttribute('aria-hidden', 'true');
  }
  playZenTone(261.63, 0.3, 'sine', 0.08);
}

export function replayLetterAnimation() {
  const parchment = document.querySelector('.usagain-manuscript-parchment');
  if (parchment) {
    parchment.style.animation = 'none';
    parchment.offsetHeight; // trigger reflow
    parchment.style.animation = 'lotusPanelIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  }
  playZenTone(392.00, 0.5, 'triangle', 0.14);
}

export function sealLetterAnimation({ onShowToast } = {}) {
  const seal = document.querySelector('.lotus-wax-seal');
  if (seal) {
    seal.style.transform = 'scale(1.25) rotate(15deg)';
    setTimeout(() => {
      seal.style.transform = 'none';
    }, 400);
  }
  playZenTone(523.25, 0.4, 'sine', 0.15);
  if (typeof onShowToast === 'function') {
    onShowToast('Manuskrip suci telah dimeterai dengan doa dan kasih sayang 🪷💌');
  }
}

export function initUsAgainBehindView({ onShowToast, onTriggerSparkle } = {}) {
  const controller = {
    open: () => openBehindLotus({ onShowToast, onTriggerSparkle }),
    openBehindLotus: () => openBehindLotus({ onShowToast, onTriggerSparkle }),
    close: closeBehindLotus,
    closeBehindLotus,
    switchChapter: switchUsAgainBehindChapter,
    switchUsAgainBehindChapter,
    pauseUsAgainBehindVideo,
    stopUsAgainBehindVideo,
    playUsAgainBehindVideo,
    replayLetterAnimation,
    sealLetterAnimation
  };

  window.usagainBehindController = controller;

  if (isBehindViewInitialized) {
    return controller;
  }
  isBehindViewInitialized = true;
  const btnBehindLotus = document.getElementById('btn-usagain-behind');
  if (btnBehindLotus) {
    btnBehindLotus.addEventListener('click', (e) => {
      e.stopPropagation();
      openBehindLotus({ onShowToast, onTriggerSparkle });
    });
  }

  const btnBackBehind = document.getElementById('btn-back-lotus-behind');
  if (btnBackBehind) {
    btnBackBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindLotus();
    });
  }

  const btnCloseBehind = document.getElementById('btn-close-lotus-behind');
  if (btnCloseBehind) {
    btnCloseBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindLotus();
    });
  }

  // Chapter Tabs Click
  document.querySelectorAll('.lotus-behind-tab-btn').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(tab.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchUsAgainBehindChapter(ch);
    });
  });

  // Indicator Dots Click
  document.querySelectorAll('.lotus-indicator-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(dot.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchUsAgainBehindChapter(ch);
    });
  });

  // Prev / Next Chapter Click
  const btnBehindPrev = document.getElementById('btn-lotus-behind-prev');
  if (btnBehindPrev) {
    btnBehindPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentLotusBehindChapter > 1) {
        switchUsAgainBehindChapter(currentLotusBehindChapter - 1);
      }
    });
  }

  const btnBehindNext = document.getElementById('btn-lotus-behind-next');
  if (btnBehindNext) {
    btnBehindNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentLotusBehindChapter < 5) {
        switchUsAgainBehindChapter(currentLotusBehindChapter + 1);
      }
    });
  }

  // Letter Replay Button Click
  const btnReplay = document.getElementById('btn-lotus-letter-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', (e) => {
      e.stopPropagation();
      replayLetterAnimation();
      if (typeof onShowToast === 'function') {
        onShowToast('Membaca ulang surat hangat dari Lele... 💌🌸');
      }
    });
  }

  // Letter Seal Button Click
  const btnSeal = document.getElementById('btn-lotus-letter-seal');
  if (btnSeal) {
    btnSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      sealLetterAnimation({ onShowToast });
    });
  }

  // Soundtrack Toggle Click
  const btnSongToggle = document.getElementById('btn-lotus-song-toggle');
  if (btnSongToggle) {
    btnSongToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isSongPlaying) {
        pauseUsAgainBehindVideo();
      } else {
        playUsAgainBehindVideo();
      }
    });
  }

  // Keyboard Navigation: Escape to close, ArrowLeft / ArrowRight to switch chapters
  window.addEventListener('keydown', (e) => {
    const ov = document.getElementById('lotus-behind-overlay');
    if (ov && ov.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeBehindLotus();
      } else if (e.key === 'ArrowLeft' && currentLotusBehindChapter > 1) {
        switchUsAgainBehindChapter(currentLotusBehindChapter - 1);
      } else if (e.key === 'ArrowRight' && currentLotusBehindChapter < 5) {
        switchUsAgainBehindChapter(currentLotusBehindChapter + 1);
      }
    }
  });

  return controller;
}
