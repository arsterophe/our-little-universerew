/**
 * OUR LITTLE UNIVERSE — BEHIND THE FAIRY CONTROLLER
 * 
 * Manages the Secret Fairy Journal & Storybook for Lala (TO YOU):
 * "BEHIND THE FAIRY — The girl who carries sunshine wherever she goes."
 * 
 * Features:
 * - 4 Chapters:
 *   1. Why a Fairy? (Identity & Warmth)
 *   2. Why TO YOU? (Philosophy & SEVENTEEN Inspiration)
 *   3. A Letter to My Sunshine (Intimate Letter from Lele to Lala)
 *   4. Epilogue: TO YOU (Song Meaning & YouTube Embed)
 * - Ambient fairy harp and bell chimes via Web Audio API
 * - Strict YouTube video lifecycle management (NO autoplay, user-initiated only,
 *   immediate stop/pause on chapter switch or overlay exit)
 * - Keyboard navigation (Escape, ArrowLeft, ArrowRight) and responsive touch navigation
 */

let currentFairyBehindChapter = 1;
let fairyAudioCtx = null;

function getFairyAudioCtx() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!fairyAudioCtx && AudioCtx) {
    fairyAudioCtx = new AudioCtx();
  }
  if (fairyAudioCtx && fairyAudioCtx.state === 'suspended') {
    fairyAudioCtx.resume();
  }
  return fairyAudioCtx;
}

function playFairyTone(freq, dur = 0.28, type = 'sine', vol = 0.12) {
  try {
    const ctx = getFairyAudioCtx();
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

export function pauseBehindFairyVideo() {
  const iframe = document.getElementById('fairy-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    } catch (e) {}
  }
}

export function stopBehindFairyVideo() {
  const iframe = document.getElementById('fairy-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      // Reset iframe src cleanly to ensure complete audio cut
      const currSrc = iframe.src;
      iframe.src = currSrc;
    } catch (e) {}
  }
}

export function switchBehindFairyChapter(targetCh) {
  const ch = Math.max(1, Math.min(4, targetCh));
  currentFairyBehindChapter = ch;

  // Pause YouTube audio immediately if moving away from Epilogue (Chapter 4)
  if (ch !== 4) {
    pauseBehindFairyVideo();
  }

  // 1. Update Tabs
  const allTabs = document.querySelectorAll('.fairy-behind-tab-btn');
  allTabs.forEach((tab) => {
    const tabCh = parseInt(tab.getAttribute('data-chapter'), 10);
    const isActive = tabCh === ch;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // 2. Update Chapter Panels
  const allPanels = document.querySelectorAll('.fairy-behind-chapter-panel');
  allPanels.forEach((panel) => {
    const isActive = panel.id === `fairy-behind-chapter-${ch}`;
    panel.classList.toggle('active', isActive);
    if (isActive) {
      panel.scrollTop = 0;
    }
  });

  // 3. Update Indicator Dots
  const allDots = document.querySelectorAll('.fairy-indicator-dot');
  allDots.forEach((dot) => {
    const dotCh = parseInt(dot.getAttribute('data-chapter'), 10);
    dot.classList.toggle('active', dotCh === ch);
  });

  // 4. Update Prev / Next Buttons
  const prevBtn = document.getElementById('btn-fairy-behind-prev');
  const nextBtn = document.getElementById('btn-fairy-behind-next');
  if (prevBtn) prevBtn.disabled = (ch === 1);
  if (nextBtn) nextBtn.disabled = (ch === 4);

  // 5. Ambient Fairy Chime (Bright golden pentatonic notes)
  const pitchMap = { 1: 587.33, 2: 659.25, 3: 783.99, 4: 880.00 }; // D5, E5, G5, A5
  playFairyTone(pitchMap[ch] || 587.33, 0.35, 'sine', 0.1);
}

export function openBehindFairy({ onShowToast, onTriggerSparkle } = {}) {
  const ov = document.getElementById('fairy-behind-overlay');
  if (ov) {
    ov.classList.add('active');
    ov.setAttribute('aria-hidden', 'false');
  }
  switchBehindFairyChapter(1);
  playFairyTone(587.33, 0.3, 'sine', 0.12);
  setTimeout(() => playFairyTone(880.00, 0.38, 'triangle', 0.14), 110);
  if (typeof onTriggerSparkle === 'function') {
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.35);
  }
  if (typeof onShowToast === 'function') {
    onShowToast('Membuka BEHIND THE FAIRY... 🧚‍♀️✨');
  }
}

export function closeBehindFairy() {
  stopBehindFairyVideo();
  const ov = document.getElementById('fairy-behind-overlay');
  if (ov) {
    ov.classList.remove('active');
    ov.setAttribute('aria-hidden', 'true');
  }
  playFairyTone(440.00, 0.25, 'sine', 0.08);
}

export function initToYouBehindView({ onShowToast, onTriggerSparkle } = {}) {
  const btnBehindFairy = document.getElementById('btn-toyou-behind');
  if (btnBehindFairy) {
    btnBehindFairy.addEventListener('click', (e) => {
      e.stopPropagation();
      openBehindFairy({ onShowToast, onTriggerSparkle });
    });
  }

  const btnBackBehind = document.getElementById('btn-back-fairy-behind');
  if (btnBackBehind) {
    btnBackBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindFairy();
    });
  }

  const btnCloseBehind = document.getElementById('btn-close-fairy-behind');
  if (btnCloseBehind) {
    btnCloseBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindFairy();
    });
  }

  // Chapter Tabs Click
  document.querySelectorAll('.fairy-behind-tab-btn').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(tab.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchBehindFairyChapter(ch);
    });
  });

  // Indicator Dots Click
  document.querySelectorAll('.fairy-indicator-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(dot.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchBehindFairyChapter(ch);
    });
  });

  // Prev / Next Chapter Click
  const btnBehindPrev = document.getElementById('btn-fairy-behind-prev');
  if (btnBehindPrev) {
    btnBehindPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentFairyBehindChapter > 1) {
        switchBehindFairyChapter(currentFairyBehindChapter - 1);
      }
    });
  }

  const btnBehindNext = document.getElementById('btn-fairy-behind-next');
  if (btnBehindNext) {
    btnBehindNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentFairyBehindChapter < 4) {
        switchBehindFairyChapter(currentFairyBehindChapter + 1);
      }
    });
  }

  // Keyboard Navigation: Escape to close, ArrowLeft / ArrowRight to switch chapters
  window.addEventListener('keydown', (e) => {
    const ov = document.getElementById('fairy-behind-overlay');
    if (ov && ov.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeBehindFairy();
      } else if (e.key === 'ArrowLeft' && currentFairyBehindChapter > 1) {
        switchBehindFairyChapter(currentFairyBehindChapter - 1);
      } else if (e.key === 'ArrowRight' && currentFairyBehindChapter < 4) {
        switchBehindFairyChapter(currentFairyBehindChapter + 1);
      }
    }
  });

  return {
    openBehindFairy: () => openBehindFairy({ onShowToast, onTriggerSparkle }),
    closeBehindFairy,
    switchBehindFairyChapter,
    pauseBehindFairyVideo,
    stopBehindFairyVideo
  };
}
