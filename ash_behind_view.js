/**
 * OUR LITTLE UNIVERSE — BEHIND THE ASH CONTROLLER
 * 
 * Manages the Gothic Celestial Memoir & Narrative Storybook for Ruben (ASH 🐉):
 * "BEHIND THE ASH — The story of a dragon who keeps flying."
 * 
 * Written from the perspective of author Lele (SHADOW), detailing:
 * - Chapter I: The Dragon (Some Strength Is Found in Stillness)
 * - Chapter II: Why ASH? (From the Embers, A New Beginning)
 * - Chapter III: The World Beyond the Ash (You Don't Have to Fly Forever Without Resting)
 * - Chapter IV: A Letter from Lele (Even a Dragon Deserves a Place to Rest)
 * - Chapter V: Epilogue: ASH ("From the ashes, a new world awaits. Keep flying, Ruben.") + Soundtrack Integration
 * 
 * Features:
 * - Opening Scene with Floating Castle & Flying Dragon Atmosphere
 * - 5 Interactive Chapters with Progress Bar & Indicator Dots
 * - Ambient Celestial Organ & Dragon Bell Tones via Web Audio API
 * - Strict YouTube Video Lifecycle Management (NO autoplay, user-initiated only,
 *   immediate stop/pause on chapter switch or overlay exit)
 * - Letter Replay, Wax Seal, and Persistent Storage Saving
 * - Keyboard navigation (Escape, ArrowLeft, ArrowRight) and responsive touch navigation
 */

let currentAshBehindChapter = 1;
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

function playCelestialTone(freq, dur = 0.35, type = 'sine', vol = 0.12) {
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
    // Tone suppressed
  }
}

export function playAshBehindVideo() {
  const iframe = document.getElementById('ash-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      isSongPlaying = true;
      const disc = document.getElementById('ash-song-disc');
      if (disc) disc.classList.add('playing');
      const btn = document.getElementById('btn-ash-song-toggle');
      if (btn) btn.innerHTML = '<span>⏸</span><span>Pause Soundtrack</span>';
    } catch (e) {}
  }
}

export function pauseAshBehindVideo() {
  const iframe = document.getElementById('ash-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      isSongPlaying = false;
      const disc = document.getElementById('ash-song-disc');
      if (disc) disc.classList.remove('playing');
      const btn = document.getElementById('btn-ash-song-toggle');
      if (btn) btn.innerHTML = '<span>▶</span><span>Play Soundtrack</span>';
    } catch (e) {}
  }
}

export function stopAshBehindVideo() {
  const iframe = document.getElementById('ash-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      // Reset iframe src cleanly to guarantee immediate audio cut
      const currSrc = iframe.src;
      iframe.src = currSrc;
      isSongPlaying = false;
      const disc = document.getElementById('ash-song-disc');
      if (disc) disc.classList.remove('playing');
      const btn = document.getElementById('btn-ash-song-toggle');
      if (btn) btn.innerHTML = '<span>▶</span><span>Play Soundtrack</span>';
    } catch (e) {}
  }
}

export function switchAshBehindChapter(targetCh) {
  const ch = Math.max(1, Math.min(5, targetCh));
  currentAshBehindChapter = ch;

  // Hide opening scene if visible
  const intro = document.getElementById('ash-behind-intro');
  if (intro) intro.style.display = 'none';

  // Ensure deck is visible
  const deck = document.getElementById('ash-behind-deck');
  if (deck) deck.style.display = 'block';

  // Pause YouTube audio immediately if moving away from Epilogue (Chapter 5)
  if (ch !== 5) {
    pauseAshBehindVideo();
  }

  // 1. Update Tabs
  const allTabs = document.querySelectorAll('.ash-behind-tab-btn');
  allTabs.forEach((tab) => {
    const tabCh = parseInt(tab.getAttribute('data-chapter'), 10);
    const isActive = tabCh === ch;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // 2. Update Chapter Panels
  const allPanels = document.querySelectorAll('.ash-behind-chapter-panel');
  allPanels.forEach((panel) => {
    const isActive = panel.id === `ash-behind-chapter-${ch}`;
    panel.classList.toggle('active', isActive);
    if (isActive) {
      panel.scrollTop = 0;
    }
  });

  // 3. Update Progress Bar
  const progressBar = document.getElementById('ash-behind-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${ch * 20}%`;
  }

  // 4. Update Indicator Dots
  const allDots = document.querySelectorAll('.ash-indicator-dot');
  allDots.forEach((dot) => {
    const dotCh = parseInt(dot.getAttribute('data-chapter'), 10);
    dot.classList.toggle('active', dotCh === ch);
  });

  // 5. Update Prev / Next Buttons
  const prevBtn = document.getElementById('btn-ash-behind-prev');
  const nextBtn = document.getElementById('btn-ash-behind-next');
  if (prevBtn) prevBtn.disabled = (ch === 1);
  if (nextBtn) nextBtn.disabled = (ch === 5);

  // 6. Ambient Celestial Dragon Bell Chime
  const celestialPitchMap = { 1: 220.00, 2: 261.63, 3: 293.66, 4: 349.23, 5: 440.00 };
  playCelestialTone(celestialPitchMap[ch] || 261.63, 0.45, 'sine', 0.12);
}

export function openBehindAsh({ onShowToast, onTriggerSparkle } = {}) {
  const ov = document.getElementById('ash-behind-overlay');
  if (ov) {
    ov.classList.add('active');
    ov.setAttribute('aria-hidden', 'false');
  }

  // Show intro scene
  const intro = document.getElementById('ash-behind-intro');
  const deck = document.getElementById('ash-behind-deck');
  if (intro && deck) {
    intro.style.display = 'flex';
    deck.style.display = 'none';
  } else {
    switchAshBehindChapter(1);
  }

  playCelestialTone(220.00, 0.35, 'sine', 0.14);
  setTimeout(() => playCelestialTone(440.00, 0.45, 'triangle', 0.12), 140);

  if (typeof onTriggerSparkle === 'function') {
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.35);
  }
  if (typeof onShowToast === 'function') {
    onShowToast('Membuka BEHIND THE ASH... 🐉🔥✨');
  }
}

export function closeBehindAsh() {
  stopAshBehindVideo();
  const ov = document.getElementById('ash-behind-overlay');
  if (ov) {
    ov.classList.remove('active');
    ov.setAttribute('aria-hidden', 'true');
  }
  playCelestialTone(220.00, 0.3, 'sine', 0.08);
}

export function replayLetterAnimation() {
  const parchment = document.querySelector('.ash-manuscript-parchment');
  if (parchment) {
    parchment.style.animation = 'none';
    parchment.offsetHeight; // trigger reflow
    parchment.style.animation = 'ashIntroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  }
  playCelestialTone(349.23, 0.5, 'triangle', 0.14);
}

export function keepLetter({ onShowToast } = {}) {
  const letterData = {
    title: 'A Letter from Lele to Ruben',
    character: 'Ruben',
    universe: 'ASH',
    author: 'Lele',
    date: new Date().toISOString(),
    excerpt: 'Seekor naga tidak kehilangan kegagahannya hanya karena sesekali memilih untuk menurunkan sayap.'
  };

  try {
    localStorage.setItem('olu_saved_letter_ash', JSON.stringify(letterData));
    localStorage.setItem('olu_saved_letter_ruben', JSON.stringify(letterData));
  } catch (e) {
    console.warn('[BehindAsh] LocalStorage write error:', e);
  }

  const seal = document.querySelector('.ash-wax-seal');
  if (seal) {
    seal.style.transform = 'scale(1.25) rotate(15deg)';
    setTimeout(() => {
      seal.style.transform = 'none';
    }, 450);
  }

  playCelestialTone(440.00, 0.5, 'sine', 0.15);
  if (typeof onShowToast === 'function') {
    onShowToast('Surat dari Lele telah tersimpan di Memories The Dragon\'s Den 💌🐉');
  }
}

export function initAshBehindView({ onShowToast, onTriggerSparkle } = {}) {
  // Top Navigation Pill in Ruben's Universe
  const btnBehindAsh = document.getElementById('btn-ash-behind');
  if (btnBehindAsh) {
    btnBehindAsh.addEventListener('click', (e) => {
      e.stopPropagation();
      openBehindAsh({ onShowToast, onTriggerSparkle });
    });
  }

  // Back Button
  const btnBackBehind = document.getElementById('btn-back-ash-behind');
  if (btnBackBehind) {
    btnBackBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindAsh();
    });
  }

  // Close Button
  const btnCloseBehind = document.getElementById('btn-close-ash-behind');
  if (btnCloseBehind) {
    btnCloseBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindAsh();
    });
  }

  // Begin Journey Button (from Intro Card)
  const btnBeginJourney = document.getElementById('btn-ash-begin-journey');
  if (btnBeginJourney) {
    btnBeginJourney.addEventListener('click', (e) => {
      e.stopPropagation();
      switchAshBehindChapter(1);
    });
  }

  // Chapter Tabs Click
  document.querySelectorAll('.ash-behind-tab-btn').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(tab.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchAshBehindChapter(ch);
    });
  });

  // Indicator Dots Click
  document.querySelectorAll('.ash-indicator-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(dot.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchAshBehindChapter(ch);
    });
  });

  // Prev / Next Chapter Click
  const btnBehindPrev = document.getElementById('btn-ash-behind-prev');
  if (btnBehindPrev) {
    btnBehindPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentAshBehindChapter > 1) {
        switchAshBehindChapter(currentAshBehindChapter - 1);
      }
    });
  }

  const btnBehindNext = document.getElementById('btn-ash-behind-next');
  if (btnBehindNext) {
    btnBehindNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentAshBehindChapter < 5) {
        switchAshBehindChapter(currentAshBehindChapter + 1);
      }
    });
  }

  // Letter Replay Button Click
  const btnReplay = document.getElementById('btn-ash-letter-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', (e) => {
      e.stopPropagation();
      replayLetterAnimation();
      if (typeof onShowToast === 'function') {
        onShowToast('Membaca ulang surat hangat dari Lele... 💌🐉');
      }
    });
  }

  // Keep Letter Button Click
  const btnKeep = document.getElementById('btn-ash-letter-keep');
  if (btnKeep) {
    btnKeep.addEventListener('click', (e) => {
      e.stopPropagation();
      keepLetter({ onShowToast });
    });
  }

  // Return to Universe Button Click (from Letter)
  const btnReturn = document.getElementById('btn-ash-letter-return');
  if (btnReturn) {
    btnReturn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindAsh();
    });
  }

  // Soundtrack Toggle Click
  const btnSongToggle = document.getElementById('btn-ash-song-toggle');
  if (btnSongToggle) {
    btnSongToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isSongPlaying) {
        pauseAshBehindVideo();
      } else {
        playAshBehindVideo();
      }
    });
  }

  // Keyboard Navigation: Escape to close, ArrowLeft / ArrowRight to switch chapters
  window.addEventListener('keydown', (e) => {
    const ov = document.getElementById('ash-behind-overlay');
    if (ov && ov.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeBehindAsh();
      } else if (e.key === 'ArrowLeft' && currentAshBehindChapter > 1) {
        switchAshBehindChapter(currentAshBehindChapter - 1);
      } else if (e.key === 'ArrowRight' && currentAshBehindChapter < 5) {
        switchAshBehindChapter(currentAshBehindChapter + 1);
      }
    }
  });

  const controller = {
    open: () => openBehindAsh({ onShowToast, onTriggerSparkle }),
    openBehindAsh: () => openBehindAsh({ onShowToast, onTriggerSparkle }),
    close: closeBehindAsh,
    closeBehindAsh,
    switchChapter: switchAshBehindChapter,
    switchAshBehindChapter,
    pauseAshBehindVideo,
    stopAshBehindVideo,
    playAshBehindVideo,
    replayLetterAnimation,
    keepLetter
  };

  window.ashBehindController = controller;
  return controller;
}
