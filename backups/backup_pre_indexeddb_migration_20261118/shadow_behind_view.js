/**
 * OUR LITTLE UNIVERSE — BEHIND THE SHADOW CONTROLLER
 * 
 * Manages the Secret Journal & Storybook for Lele (SHADOW):
 * "BEHIND THE SHADOW — The Angel I Show, The Devil I Hide."
 * 
 * Includes 4 Chapters, ambient celestial audio chimes,
 * YouTube video lifecycle management (no autoplay, clean stop/pause),
 * and keyboard/touch navigation.
 */

let currentShadowBehindChapter = 1;
let audioCtx = null;

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

function playTone(freq, dur = 0.22, type = 'sine', vol = 0.1) {
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
    // Audio tone suppressed or unsupported
  }
}

export function pauseShadowBehindVideo() {
  const iframe = document.getElementById('shadow-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    } catch (e) {}
  }
}

export function stopShadowBehindVideo() {
  const iframe = document.getElementById('shadow-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      // Reset iframe src cleanly to ensure complete audio cut
      const currSrc = iframe.src;
      iframe.src = currSrc;
    } catch (e) {}
  }
}

export function switchShadowBehindChapter(targetCh) {
  const ch = Math.max(1, Math.min(4, targetCh));
  currentShadowBehindChapter = ch;

  // Pause YouTube audio if moving away from Epilogue (Chapter 4)
  if (ch !== 4) {
    pauseShadowBehindVideo();
  }

  // 1. Update Tabs
  const allTabs = document.querySelectorAll('.shadow-behind-tab-btn');
  allTabs.forEach((tab) => {
    const tabCh = parseInt(tab.getAttribute('data-chapter'), 10);
    const isActive = tabCh === ch;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // 2. Update Chapter Panels
  const allPanels = document.querySelectorAll('.shadow-behind-chapter-panel');
  allPanels.forEach((panel) => {
    const isActive = panel.id === `shadow-behind-chapter-${ch}`;
    panel.classList.toggle('active', isActive);
    if (isActive) {
      panel.scrollTop = 0;
    }
  });

  // 3. Update Indicator Dots
  const allDots = document.querySelectorAll('.shadow-indicator-dot');
  allDots.forEach((dot) => {
    const dotCh = parseInt(dot.getAttribute('data-chapter'), 10);
    dot.classList.toggle('active', dotCh === ch);
  });

  // 4. Update Prev / Next Buttons
  const prevBtn = document.getElementById('btn-shadow-behind-prev');
  const nextBtn = document.getElementById('btn-shadow-behind-next');
  if (prevBtn) prevBtn.disabled = (ch === 1);
  if (nextBtn) nextBtn.disabled = (ch === 4);

  // 5. Ambient Celestial Chime
  const pitchMap = { 1: 587.33, 2: 466.16, 3: 523.25, 4: 698.46 };
  playTone(pitchMap[ch] || 523.25, 0.35, 'sine', 0.1);
}

export function openBehindShadow({ onShowToast, onTriggerSparkle } = {}) {
  const ov = document.getElementById('shadow-behind-overlay');
  if (ov) {
    ov.classList.add('active');
    ov.setAttribute('aria-hidden', 'false');
  }
  switchShadowBehindChapter(1);
  playTone(523.25, 0.3, 'sine', 0.12);
  setTimeout(() => playTone(698.46, 0.35, 'triangle', 0.15), 110);
  if (typeof onTriggerSparkle === 'function') {
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.35);
  }
  if (typeof onShowToast === 'function') {
    onShowToast('Membuka BEHIND THE SHADOW... 🌙✨');
  }
}

export function closeBehindShadow() {
  stopShadowBehindVideo();
  const ov = document.getElementById('shadow-behind-overlay');
  if (ov) {
    ov.classList.remove('active');
    ov.setAttribute('aria-hidden', 'true');
  }
  playTone(392.00, 0.25, 'sine', 0.08);
}

export function initShadowBehindView({ onShowToast, onTriggerSparkle } = {}) {
  const btnBehindShadow = document.getElementById('btn-shadow-behind');
  if (btnBehindShadow) {
    btnBehindShadow.addEventListener('click', (e) => {
      e.stopPropagation();
      openBehindShadow({ onShowToast, onTriggerSparkle });
    });
  }

  const btnBackBehind = document.getElementById('btn-back-shadow-behind');
  if (btnBackBehind) {
    btnBackBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindShadow();
    });
  }

  const btnCloseBehind = document.getElementById('btn-close-shadow-behind');
  if (btnCloseBehind) {
    btnCloseBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindShadow();
    });
  }

  // Chapter Tabs Click
  document.querySelectorAll('.shadow-behind-tab-btn').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(tab.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchShadowBehindChapter(ch);
    });
  });

  // Indicator Dots Click
  document.querySelectorAll('.shadow-indicator-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(dot.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchShadowBehindChapter(ch);
    });
  });

  // Prev / Next Chapter Click
  const btnBehindPrev = document.getElementById('btn-shadow-behind-prev');
  if (btnBehindPrev) {
    btnBehindPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentShadowBehindChapter > 1) {
        switchShadowBehindChapter(currentShadowBehindChapter - 1);
      }
    });
  }

  const btnBehindNext = document.getElementById('btn-shadow-behind-next');
  if (btnBehindNext) {
    btnBehindNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentShadowBehindChapter < 4) {
        switchShadowBehindChapter(currentShadowBehindChapter + 1);
      }
    });
  }

  // Keyboard Navigation: Escape to close
  window.addEventListener('keydown', (e) => {
    const ov = document.getElementById('shadow-behind-overlay');
    if (ov && ov.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeBehindShadow();
      } else if (e.key === 'ArrowLeft' && currentShadowBehindChapter > 1) {
        switchShadowBehindChapter(currentShadowBehindChapter - 1);
      } else if (e.key === 'ArrowRight' && currentShadowBehindChapter < 4) {
        switchShadowBehindChapter(currentShadowBehindChapter + 1);
      }
    }
  });

  return {
    openBehindShadow: () => openBehindShadow({ onShowToast, onTriggerSparkle }),
    closeBehindShadow,
    switchShadowBehindChapter,
    pauseShadowBehindVideo,
    stopShadowBehindVideo
  };
}
