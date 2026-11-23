/**
 * OUR LITTLE UNIVERSE — BEHIND THE WITCH CONTROLLER
 * 
 * Manages the Secret Grimoire & Storybook for Nyanya (KIDULT):
 * "BEHIND THE WITCH — The story behind the girl who learned to stand alone."
 * 
 * Written from the perspective of author Lele (SHADOW), detailing:
 * - Chapter I: The Witch (Not Every Witch Is Made to Be Feared)
 * - Chapter II: Why KIDULT? (Growing Up Doesn't Mean Growing Out of Yourself)
 * - Chapter III: The Little Girl You Left Behind (You Deserve the Same Care You Give to Everyone Else)
 * - Chapter IV: A Letter from Lele (To the Little Girl Who Grew Up Too Soon)
 * - Chapter V: Epilogue: KIDULT (You Can Grow Up Without Leaving Yourself Behind) + Song Integration
 * 
 * Features:
 * - 5 Interactive Chapters with Progress Track & Dots
 * - Ambient celestial and fairy chimes via Web Audio API
 * - Strict YouTube video lifecycle management (NO autoplay, user-initiated only,
 *   immediate stop/pause on chapter switch or overlay exit)
 * - Letter replay animation & read-again handler
 * - Keyboard navigation (Escape, ArrowLeft, ArrowRight) and responsive touch navigation
 */

let currentWitchBehindChapter = 1;
let audioCtx = null;
let isSongPlaying = false;

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
    // Audio tone suppressed or unsupported in background tab
  }
}

export function playBehindWitchVideo() {
  const iframe = document.getElementById('witch-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      isSongPlaying = true;
      const disc = document.getElementById('witch-song-disc');
      if (disc) disc.classList.add('playing');
      const btn = document.getElementById('btn-witch-song-toggle');
      if (btn) btn.innerHTML = '<span>⏸</span><span>Pause Soundtrack</span>';
    } catch (e) {}
  }
}

export function pauseBehindWitchVideo() {
  const iframe = document.getElementById('witch-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      isSongPlaying = false;
      const disc = document.getElementById('witch-song-disc');
      if (disc) disc.classList.remove('playing');
      const btn = document.getElementById('btn-witch-song-toggle');
      if (btn) btn.innerHTML = '<span>▶</span><span>Play Soundtrack</span>';
    } catch (e) {}
  }
}

export function stopBehindWitchVideo() {
  const iframe = document.getElementById('witch-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      // Reset iframe src cleanly to ensure complete audio cut
      const currSrc = iframe.src;
      iframe.src = currSrc;
      isSongPlaying = false;
      const disc = document.getElementById('witch-song-disc');
      if (disc) disc.classList.remove('playing');
      const btn = document.getElementById('btn-witch-song-toggle');
      if (btn) btn.innerHTML = '<span>▶</span><span>Play Soundtrack</span>';
    } catch (e) {}
  }
}

export function switchBehindWitchChapter(targetCh) {
  const ch = Math.max(1, Math.min(5, targetCh));
  currentWitchBehindChapter = ch;

  // Pause YouTube audio immediately if moving away from Epilogue (Chapter 5)
  if (ch !== 5) {
    pauseBehindWitchVideo();
  }

  // 1. Update Tabs
  const allTabs = document.querySelectorAll('.witch-behind-tab-btn');
  allTabs.forEach((tab) => {
    const tabCh = parseInt(tab.getAttribute('data-chapter'), 10);
    const isActive = tabCh === ch;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // 2. Update Chapter Panels
  const allPanels = document.querySelectorAll('.witch-behind-chapter-panel');
  allPanels.forEach((panel) => {
    const isActive = panel.id === `witch-behind-chapter-${ch}`;
    panel.classList.toggle('active', isActive);
    if (isActive) {
      panel.scrollTop = 0;
    }
  });

  // 3. Update Progress Bar
  const progressBar = document.getElementById('witch-behind-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${ch * 20}%`;
  }

  // 4. Update Indicator Dots
  const allDots = document.querySelectorAll('.witch-indicator-dot');
  allDots.forEach((dot) => {
    const dotCh = parseInt(dot.getAttribute('data-chapter'), 10);
    dot.classList.toggle('active', dotCh === ch);
  });

  // 5. Update Prev / Next Buttons
  const prevBtn = document.getElementById('btn-witch-behind-prev');
  const nextBtn = document.getElementById('btn-witch-behind-next');
  if (prevBtn) prevBtn.disabled = (ch === 1);
  if (nextBtn) nextBtn.disabled = (ch === 5);

  // 6. Ambient Celestial Chime
  const pitchMap = { 1: 523.25, 2: 587.33, 3: 659.25, 4: 783.99, 5: 880.00 };
  playTone(pitchMap[ch] || 523.25, 0.35, 'sine', 0.1);
}

export function openBehindWitch({ onShowToast, onTriggerSparkle } = {}) {
  const ov = document.getElementById('witch-behind-overlay');
  if (ov) {
    ov.classList.add('active');
    ov.setAttribute('aria-hidden', 'false');
  }
  switchBehindWitchChapter(1);
  playTone(523.25, 0.3, 'sine', 0.12);
  setTimeout(() => playTone(783.99, 0.35, 'triangle', 0.14), 110);
  if (typeof onTriggerSparkle === 'function') {
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.35);
  }
  if (typeof onShowToast === 'function') {
    onShowToast('Membuka BEHIND THE WITCH... 🔮✨');
  }
}

export function closeBehindWitch() {
  stopBehindWitchVideo();
  const ov = document.getElementById('witch-behind-overlay');
  if (ov) {
    ov.classList.remove('active');
    ov.setAttribute('aria-hidden', 'true');
  }
  playTone(392.00, 0.25, 'sine', 0.08);
}

export function replayLetterAnimation() {
  const parchment = document.querySelector('.behind-witch-parchment');
  if (parchment) {
    parchment.style.animation = 'none';
    parchment.offsetHeight; // trigger reflow
    parchment.style.animation = 'witchPanelIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  }
  playTone(659.25, 0.4, 'sine', 0.12);
}

export function initKidultBehindView({ onShowToast, onTriggerSparkle } = {}) {
  const btnBehindWitch = document.getElementById('btn-kidult-behind');
  if (btnBehindWitch) {
    btnBehindWitch.addEventListener('click', (e) => {
      e.stopPropagation();
      openBehindWitch({ onShowToast, onTriggerSparkle });
    });
  }

  const btnBackBehind = document.getElementById('btn-back-witch-behind');
  if (btnBackBehind) {
    btnBackBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindWitch();
    });
  }

  const btnCloseBehind = document.getElementById('btn-close-witch-behind');
  if (btnCloseBehind) {
    btnCloseBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindWitch();
    });
  }

  // Chapter Tabs Click
  document.querySelectorAll('.witch-behind-tab-btn').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(tab.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchBehindWitchChapter(ch);
    });
  });

  // Indicator Dots Click
  document.querySelectorAll('.witch-indicator-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(dot.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchBehindWitchChapter(ch);
    });
  });

  // Prev / Next Chapter Click
  const btnBehindPrev = document.getElementById('btn-witch-behind-prev');
  if (btnBehindPrev) {
    btnBehindPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentWitchBehindChapter > 1) {
        switchBehindWitchChapter(currentWitchBehindChapter - 1);
      }
    });
  }

  const btnBehindNext = document.getElementById('btn-witch-behind-next');
  if (btnBehindNext) {
    btnBehindNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentWitchBehindChapter < 5) {
        switchBehindWitchChapter(currentWitchBehindChapter + 1);
      }
    });
  }

  // Letter Replay Button Click
  const btnReplay = document.getElementById('btn-witch-letter-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', (e) => {
      e.stopPropagation();
      replayLetterAnimation();
      if (typeof onShowToast === 'function') {
        onShowToast('Membaca ulang surat hangat dari Lele... 💌✨');
      }
    });
  }

  // Soundtrack Toggle Click
  const btnSongToggle = document.getElementById('btn-witch-song-toggle');
  if (btnSongToggle) {
    btnSongToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isSongPlaying) {
        pauseBehindWitchVideo();
      } else {
        playBehindWitchVideo();
      }
    });
  }

  // Keyboard Navigation: Escape to close, ArrowLeft / ArrowRight to switch chapters
  window.addEventListener('keydown', (e) => {
    const ov = document.getElementById('witch-behind-overlay');
    if (ov && ov.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeBehindWitch();
      } else if (e.key === 'ArrowLeft' && currentWitchBehindChapter > 1) {
        switchBehindWitchChapter(currentWitchBehindChapter - 1);
      } else if (e.key === 'ArrowRight' && currentWitchBehindChapter < 5) {
        switchBehindWitchChapter(currentWitchBehindChapter + 1);
      }
    }
  });

  const controller = {
    open: () => openBehindWitch({ onShowToast, onTriggerSparkle }),
    openBehindWitch: () => openBehindWitch({ onShowToast, onTriggerSparkle }),
    close: closeBehindWitch,
    closeBehindWitch,
    switchChapter: switchBehindWitchChapter,
    switchBehindWitchChapter,
    pauseBehindWitchVideo,
    stopBehindWitchVideo,
    playBehindWitchVideo,
    replayLetterAnimation
  };

  window.kidultBehindController = controller;
  return controller;
}
