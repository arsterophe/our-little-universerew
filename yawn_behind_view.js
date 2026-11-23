/**
 * OUR LITTLE UNIVERSE — BEHIND THE YAWN CONTROLLER
 * 
 * Manages the Secret Ocean Journal & Narrative Storybook for Akhira (YAWN):
 * "BEHIND THE YAWN — The Mermaid Who Loved Beyond the Ocean."
 * 
 * Written from the perspective of author Lele (SHADOW), detailing:
 * - Chapter I: The Mermaid (A Heart That Loved Beyond the Ocean)
 * - Chapter II: Why YAWN? (Behind the Smile, There Is a Story)
 * - Chapter III: The Pain You Never Told (Some Feelings Are Difficult to Put Into Words)
 * - Chapter IV: A Letter from Lele (To the Mermaid Who Deserves to Be Loved, Too)
 * - Chapter V: Epilogue: YAWN (Even the Sea Foam Deserves to Shine) + Song Integration
 * 
 * Features:
 * - YouTube Video Lifecycle Management (no autoplay, clean stop/pause)
 * - Ambient Ocean Chimes (Web Audio API)
 * - Letter replay animation & read-again handler
 * - Keyboard & touch navigation
 */

let currentYawnBehindChapter = 1;
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

function playTone(freq, dur = 0.25, type = 'sine', vol = 0.1) {
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
    // Audio tone suppressed
  }
}

export function pauseYawnBehindVideo() {
  const iframe = document.getElementById('yawn-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    } catch (e) {}
  }
  updateSongToggleUI(false);
}

export function stopYawnBehindVideo() {
  const iframe = document.getElementById('yawn-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      const currSrc = iframe.src;
      iframe.src = currSrc;
    } catch (e) {}
  }
  updateSongToggleUI(false);
}

export function playYawnBehindVideo() {
  const iframe = document.getElementById('yawn-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      updateSongToggleUI(true);
    } catch (e) {}
  }
}

function updateSongToggleUI(playing) {
  isSongPlaying = playing;
  const toggleBtn = document.getElementById('btn-yawn-song-toggle');
  const disc = document.getElementById('yawn-song-disc');
  if (toggleBtn) {
    toggleBtn.innerHTML = playing ? '<span>⏸</span><span>Pause Soundtrack</span>' : '<span>▶</span><span>Play Soundtrack</span>';
  }
  if (disc) {
    disc.classList.toggle('playing', playing);
  }
}

export function switchYawnBehindChapter(targetCh) {
  const ch = Math.max(1, Math.min(5, targetCh));
  currentYawnBehindChapter = ch;

  // Pause YouTube audio if moving away from Epilogue (Chapter 5)
  if (ch !== 5) {
    pauseYawnBehindVideo();
  }

  // 1. Update Tabs
  const allTabs = document.querySelectorAll('.yawn-behind-tab-btn');
  allTabs.forEach((tab) => {
    const tabCh = parseInt(tab.getAttribute('data-chapter'), 10);
    const isActive = tabCh === ch;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // 2. Update Chapter Panels
  const allPanels = document.querySelectorAll('.yawn-behind-chapter-panel');
  allPanels.forEach((panel) => {
    const isActive = panel.id === `yawn-behind-chapter-${ch}`;
    panel.classList.toggle('active', isActive);
    if (isActive) {
      panel.scrollTop = 0;
    }
  });

  // 3. Update Progress Bar
  const progressBar = document.getElementById('yawn-behind-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${ch * 20}%`;
  }

  // 4. Update Indicator Dots
  const allDots = document.querySelectorAll('.yawn-indicator-dot');
  allDots.forEach((dot) => {
    const dotCh = parseInt(dot.getAttribute('data-chapter'), 10);
    dot.classList.toggle('active', dotCh === ch);
  });

  // 5. Update Prev / Next Buttons
  const prevBtn = document.getElementById('btn-yawn-behind-prev');
  const nextBtn = document.getElementById('btn-yawn-behind-next');
  if (prevBtn) prevBtn.disabled = (ch === 1);
  if (nextBtn) nextBtn.disabled = (ch === 5);

  // 6. Ambient Underwater Chime
  const pitchMap = { 1: 440.00, 2: 523.25, 3: 587.33, 4: 659.25, 5: 783.99 };
  playTone(pitchMap[ch] || 523.25, 0.35, 'sine', 0.1);
}

export function openBehindYawn({ onShowToast, onTriggerSparkle } = {}) {
  const ov = document.getElementById('yawn-behind-overlay');
  if (ov) {
    ov.classList.add('active');
    ov.setAttribute('aria-hidden', 'false');
  }
  switchYawnBehindChapter(1);
  playTone(440.00, 0.3, 'sine', 0.12);
  setTimeout(() => playTone(659.25, 0.35, 'triangle', 0.14), 110);

  if (typeof onTriggerSparkle === 'function') {
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.35);
  }
  if (typeof onShowToast === 'function') {
    onShowToast('Membuka BEHIND THE YAWN... 🧜‍♀️🌊✨');
  }
}

export function closeBehindYawn() {
  stopYawnBehindVideo();
  const ov = document.getElementById('yawn-behind-overlay');
  if (ov) {
    ov.classList.remove('active');
    ov.setAttribute('aria-hidden', 'true');
  }
  playTone(349.23, 0.25, 'sine', 0.08);
}

export function replayLetterAnimation() {
  const parchment = document.querySelector('.yawn-pearl-parchment');
  if (parchment) {
    parchment.style.animation = 'none';
    parchment.offsetHeight; // trigger reflow
    parchment.style.animation = 'oceanWaveFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  }
  playTone(659.25, 0.4, 'sine', 0.12);
}

export function initYawnBehindView({ onShowToast, onTriggerSparkle } = {}) {
  const btnBehindYawn = document.getElementById('btn-yawn-behind');
  if (btnBehindYawn) {
    btnBehindYawn.addEventListener('click', (e) => {
      e.stopPropagation();
      openBehindYawn({ onShowToast, onTriggerSparkle });
    });
  }

  const btnBackBehind = document.getElementById('btn-back-yawn-behind');
  if (btnBackBehind) {
    btnBackBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindYawn();
    });
  }

  const btnCloseBehind = document.getElementById('btn-close-yawn-behind');
  if (btnCloseBehind) {
    btnCloseBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindYawn();
    });
  }

  // Chapter Tabs Click
  document.querySelectorAll('.yawn-behind-tab-btn').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(tab.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchYawnBehindChapter(ch);
    });
  });

  // Indicator Dots Click
  document.querySelectorAll('.yawn-indicator-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(dot.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchYawnBehindChapter(ch);
    });
  });

  // Prev / Next Chapter Click
  const btnBehindPrev = document.getElementById('btn-yawn-behind-prev');
  if (btnBehindPrev) {
    btnBehindPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentYawnBehindChapter > 1) {
        switchYawnBehindChapter(currentYawnBehindChapter - 1);
      }
    });
  }

  const btnBehindNext = document.getElementById('btn-yawn-behind-next');
  if (btnBehindNext) {
    btnBehindNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentYawnBehindChapter < 5) {
        switchYawnBehindChapter(currentYawnBehindChapter + 1);
      }
    });
  }

  // Replay Letter Click
  const btnLetterReplay = document.getElementById('btn-yawn-letter-replay');
  if (btnLetterReplay) {
    btnLetterReplay.addEventListener('click', (e) => {
      e.stopPropagation();
      replayLetterAnimation();
      if (typeof onShowToast === 'function') {
        onShowToast('Membaca ulang surat tulus dari Lele... 💌✨');
      }
    });
  }

  // Soundtrack Toggle Click
  const btnSongToggle = document.getElementById('btn-yawn-song-toggle');
  if (btnSongToggle) {
    btnSongToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isSongPlaying) {
        pauseYawnBehindVideo();
      } else {
        playYawnBehindVideo();
      }
    });
  }

  // Keyboard Navigation: Escape to close, Arrow keys for chapters
  window.addEventListener('keydown', (e) => {
    const ov = document.getElementById('yawn-behind-overlay');
    if (ov && ov.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeBehindYawn();
      } else if (e.key === 'ArrowLeft' && currentYawnBehindChapter > 1) {
        switchYawnBehindChapter(currentYawnBehindChapter - 1);
      } else if (e.key === 'ArrowRight' && currentYawnBehindChapter < 5) {
        switchYawnBehindChapter(currentYawnBehindChapter + 1);
      }
    }
  });

  const controller = {
    open: () => openBehindYawn({ onShowToast, onTriggerSparkle }),
    openBehindYawn: () => openBehindYawn({ onShowToast, onTriggerSparkle }),
    close: closeBehindYawn,
    closeBehindYawn,
    switchChapter: switchYawnBehindChapter,
    switchYawnBehindChapter,
    pauseYawnBehindVideo,
    stopYawnBehindVideo,
    playYawnBehindVideo
  };

  window.yawnBehindController = controller;
  return controller;
}
