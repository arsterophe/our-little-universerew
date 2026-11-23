/**
 * OUR LITTLE UNIVERSE — BEHIND THE PINWHEEL CONTROLLER
 * 
 * Manages the Enchanted Memoir & Time-Capsule Storybook for Syma (PINWHEEL ☁️):
 * "BEHIND THE PINWHEEL — A Future Self Is Waiting for You."
 * 
 * Written from the perspective of author Lele (SHADOW), detailing:
 * - Opening Scene: Syma standing in the meadow of pinwheels
 * - Chapter I: The Kitsune (Some Charms Are Impossible to Ignore)
 * - Chapter II: Why PINWHEEL? (Somewhere in the Future, Someone Is Waiting for You)
 * - Chapter III: The Self You're Becoming (You Don't Have to Be Perfect to Keep Moving)
 * - Chapter IV: A Letter from Lele (Even If It Takes You a Long Time, I'll Still Be Here)
 * - Chapter V: Epilogue: PINWHEEL (The Future Is Still Waiting for You) + Song Integration
 * 
 * Features:
 * - 5 Interactive Chapters with Progress Bar, Opening Scene & Indicator Dots
 * - Ambient Japanese Wind Chime and Pentatonic Tones via Web Audio API
 * - Strict YouTube Video Lifecycle Management (NO autoplay, user-initiated only,
 *   immediate stop/pause on chapter switch or overlay exit)
 * - Letter Replay, Persistent Keep Letter (localStorage), and Return Handlers
 * - Keyboard navigation (Escape, ArrowLeft, ArrowRight) and responsive touch navigation
 */

let currentPinwheelBehindChapter = 1;
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

function playWindChimeTone(freq, dur = 0.4, type = 'sine', vol = 0.12) {
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
    // Audio tone suppressed or unsupported in background
  }
}

export function playPinwheelBehindVideo() {
  const iframe = document.getElementById('pinwheel-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      isSongPlaying = true;
      const disc = document.getElementById('pinwheel-song-disc');
      if (disc) disc.classList.add('playing');
      const btn = document.getElementById('btn-pinwheel-song-toggle');
      if (btn) btn.innerHTML = '<span>⏸</span><span>Pause Soundtrack</span>';
    } catch (e) {}
  }
}

export function pausePinwheelBehindVideo() {
  const iframe = document.getElementById('pinwheel-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      isSongPlaying = false;
      const disc = document.getElementById('pinwheel-song-disc');
      if (disc) disc.classList.remove('playing');
      const btn = document.getElementById('btn-pinwheel-song-toggle');
      if (btn) btn.innerHTML = '<span>▶</span><span>Play Soundtrack</span>';
    } catch (e) {}
  }
}

export function stopPinwheelBehindVideo() {
  const iframe = document.getElementById('pinwheel-youtube-iframe');
  if (iframe) {
    try {
      iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
      const currSrc = iframe.src;
      iframe.src = currSrc;
      isSongPlaying = false;
      const disc = document.getElementById('pinwheel-song-disc');
      if (disc) disc.classList.remove('playing');
      const btn = document.getElementById('btn-pinwheel-song-toggle');
      if (btn) btn.innerHTML = '<span>▶</span><span>Play Soundtrack</span>';
    } catch (e) {}
  }
}

export const stopBehindPinwheelVideo = stopPinwheelBehindVideo;
export const pauseBehindPinwheelVideo = pausePinwheelBehindVideo;

export function switchPinwheelBehindChapter(targetCh) {
  const ch = Math.max(1, Math.min(5, targetCh));
  currentPinwheelBehindChapter = ch;

  // Hide opening intro card when entering chapters
  const introCard = document.getElementById('pinwheel-behind-intro');
  if (introCard) introCard.style.display = 'none';

  // Ensure deck is visible and reset scroll
  const deck = document.getElementById('pinwheel-behind-deck');
  if (deck) {
    deck.style.display = 'block';
    deck.scrollTop = 0;
  }

  // Pause YouTube audio immediately if moving away from Epilogue (Chapter 5)
  if (ch !== 5) {
    pausePinwheelBehindVideo();
  }

  // 1. Update Tabs
  const allTabs = document.querySelectorAll('.pinwheel-behind-tab-btn');
  allTabs.forEach((tab) => {
    const tabCh = parseInt(tab.getAttribute('data-chapter'), 10);
    const isActive = tabCh === ch;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // 2. Update Chapter Panels
  const allPanels = document.querySelectorAll('.pinwheel-behind-chapter-panel');
  allPanels.forEach((panel) => {
    const isActive = panel.id === `pinwheel-behind-chapter-${ch}`;
    panel.classList.toggle('active', isActive);
    if (isActive) {
      panel.scrollTop = 0;
    }
  });

  // 3. Update Progress Bar
  const progressBar = document.getElementById('pinwheel-behind-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${ch * 20}%`;
  }

  // 4. Update Indicator Dots
  const allDots = document.querySelectorAll('.pinwheel-indicator-dot');
  allDots.forEach((dot) => {
    const dotCh = parseInt(dot.getAttribute('data-chapter'), 10);
    dot.classList.toggle('active', dotCh === ch);
  });

  // 5. Update Prev / Next Buttons
  const prevBtns = [
    document.getElementById('btn-pinwheel-behind-prev'),
    document.getElementById('btn-behind-prev-chapter')
  ].filter(Boolean);
  const nextBtns = [
    document.getElementById('btn-pinwheel-behind-next'),
    document.getElementById('btn-behind-next-chapter')
  ].filter(Boolean);

  prevBtns.forEach((btn) => {
    btn.disabled = (ch === 1);
  });
  nextBtns.forEach((btn) => {
    btn.disabled = (ch === 5);
  });

  // 6. Ambient Wind Chime Melodies
  const chimePitchMap = { 1: 293.66, 2: 329.63, 3: 392.00, 4: 440.00, 5: 523.25 };
  playWindChimeTone(chimePitchMap[ch] || 293.66, 0.45, 'sine', 0.12);
}

export function openBehindPinwheel({ onShowToast, onTriggerSparkle } = {}) {
  const ov = document.getElementById('pinwheel-behind-overlay');
  if (ov) {
    ov.classList.add('active');
    ov.setAttribute('aria-hidden', 'false');
  }

  // Directly show Chapter 1 deck matching YAWN standard
  const introCard = document.getElementById('pinwheel-behind-intro');
  const deck = document.getElementById('pinwheel-behind-deck');
  if (introCard) introCard.style.display = 'none';
  if (deck) deck.style.display = 'block';

  switchPinwheelBehindChapter(1);
  playWindChimeTone(392.00, 0.35, 'sine', 0.14);
  setTimeout(() => playWindChimeTone(523.25, 0.45, 'triangle', 0.12), 120);

  if (typeof onTriggerSparkle === 'function') {
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.35);
  }
  if (typeof onShowToast === 'function') {
    onShowToast('Membuka BEHIND THE PINWHEEL... 🎐☁️✨');
  }
}

export function closeBehindPinwheel() {
  stopPinwheelBehindVideo();
  const ov = document.getElementById('pinwheel-behind-overlay');
  if (ov) {
    ov.classList.remove('active');
    ov.setAttribute('aria-hidden', 'true');
  }
  playWindChimeTone(293.66, 0.3, 'sine', 0.08);
}

export function replayLetterAnimation() {
  const parchment = document.querySelector('.pinwheel-manuscript-parchment');
  if (parchment) {
    parchment.style.animation = 'none';
    parchment.offsetHeight; // trigger reflow
    parchment.style.animation = 'pinwheelPanelIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  }
  playWindChimeTone(440.00, 0.5, 'triangle', 0.14);
}

export function keepLetter({ onShowToast } = {}) {
  try {
    const letterPayload = {
      savedAt: new Date().toISOString(),
      character: 'syma',
      universe: 'pinwheel',
      author: 'Lele',
      title: 'A Letter from Lele — Even If It Takes You a Long Time, I\'ll Still Be Here',
      status: 'saved'
    };
    localStorage.setItem('olu_saved_letter_pinwheel', JSON.stringify(letterPayload));
    localStorage.setItem('olu_saved_letter_syma', JSON.stringify(letterPayload));
    localStorage.setItem('olu_saved_letter_abil', JSON.stringify(letterPayload));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }

  const btnKeep = document.getElementById('btn-pinwheel-letter-keep');
  if (btnKeep) {
    btnKeep.innerHTML = '<span>💌✓</span><span>Surat Tersimpan</span>';
    btnKeep.classList.add('primary');
  }

  playWindChimeTone(523.25, 0.4, 'sine', 0.16);
  if (typeof onShowToast === 'function') {
    onShowToast('Surat dari Lele berhasil disimpan di memori PINWHEEL! 💌🎐');
  }
}

export function initPinwheelBehindView({ onShowToast, onTriggerSparkle } = {}) {
  const btnBehindPinwheel = document.getElementById('btn-pinwheel-behind');
  if (btnBehindPinwheel) {
    btnBehindPinwheel.onclick = (e) => {
      e.stopPropagation();
      openBehindPinwheel({ onShowToast, onTriggerSparkle });
    };
  }

  const btnBackBehind = document.getElementById('btn-back-pinwheel-behind');
  if (btnBackBehind) {
    btnBackBehind.onclick = (e) => {
      e.stopPropagation();
      closeBehindPinwheel();
    };
  }

  const btnCloseBehind = document.getElementById('btn-close-pinwheel-behind');
  if (btnCloseBehind) {
    btnCloseBehind.onclick = (e) => {
      e.stopPropagation();
      closeBehindPinwheel();
    };
  }

  // Opening Journey Button
  const btnBegin = document.getElementById('btn-pinwheel-begin-journey');
  if (btnBegin) {
    btnBegin.onclick = (e) => {
      e.stopPropagation();
      switchPinwheelBehindChapter(1);
      if (typeof onShowToast === 'function') {
        onShowToast('Memulai perjalanan: Chapter I — The Kitsune 🦊🎐');
      }
    };
  }

  // Chapter Tabs Click
  document.querySelectorAll('.pinwheel-behind-tab-btn').forEach((tab) => {
    tab.onclick = (e) => {
      e.stopPropagation();
      const ch = parseInt(tab.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchPinwheelBehindChapter(ch);
    };
  });

  // Indicator Dots Click
  document.querySelectorAll('.pinwheel-indicator-dot').forEach((dot) => {
    dot.onclick = (e) => {
      e.stopPropagation();
      const ch = parseInt(dot.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchPinwheelBehindChapter(ch);
    };
  });

  // Prev / Next Chapter Click
  const prevBtns = [
    document.getElementById('btn-pinwheel-behind-prev'),
    document.getElementById('btn-behind-prev-chapter')
  ].filter(Boolean);
  prevBtns.forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      if (currentPinwheelBehindChapter > 1) {
        switchPinwheelBehindChapter(currentPinwheelBehindChapter - 1);
      }
    };
  });

  const nextBtns = [
    document.getElementById('btn-pinwheel-behind-next'),
    document.getElementById('btn-behind-next-chapter')
  ].filter(Boolean);
  nextBtns.forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      if (currentPinwheelBehindChapter < 5) {
        switchPinwheelBehindChapter(currentPinwheelBehindChapter + 1);
      }
    };
  });

  // Letter Replay Button Click
  const btnReplay = document.getElementById('btn-pinwheel-letter-replay');
  if (btnReplay) {
    btnReplay.onclick = (e) => {
      e.stopPropagation();
      replayLetterAnimation();
      if (typeof onShowToast === 'function') {
        onShowToast('Membaca ulang surat hangat dari Lele... 💌🎐');
      }
    };
  }

  // Letter Keep Button Click
  const btnKeep = document.getElementById('btn-pinwheel-letter-keep');
  if (btnKeep) {
    btnKeep.onclick = (e) => {
      e.stopPropagation();
      keepLetter({ onShowToast });
    };
  }

  // Letter Return to PINWHEEL Button Click
  const btnReturn = document.getElementById('btn-pinwheel-letter-return');
  if (btnReturn) {
    btnReturn.onclick = (e) => {
      e.stopPropagation();
      closeBehindPinwheel();
    };
  }

  // Soundtrack Toggle Click
  const btnSongToggle = document.getElementById('btn-pinwheel-song-toggle');
  if (btnSongToggle) {
    btnSongToggle.onclick = (e) => {
      e.stopPropagation();
      if (isSongPlaying) {
        pausePinwheelBehindVideo();
      } else {
        playPinwheelBehindVideo();
      }
    };
  }

  // Keyboard Navigation: Escape to close, ArrowLeft / ArrowRight to switch chapters
  window.addEventListener('keydown', (e) => {
    const ov = document.getElementById('pinwheel-behind-overlay');
    if (ov && ov.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeBehindPinwheel();
      } else if (e.key === 'ArrowLeft' && currentPinwheelBehindChapter > 1) {
        switchPinwheelBehindChapter(currentPinwheelBehindChapter - 1);
      } else if (e.key === 'ArrowRight' && currentPinwheelBehindChapter < 5) {
        switchPinwheelBehindChapter(currentPinwheelBehindChapter + 1);
      }
    }
  });

  const controller = {
    open: () => openBehindPinwheel({ onShowToast, onTriggerSparkle }),
    openBehindPinwheel: () => openBehindPinwheel({ onShowToast, onTriggerSparkle }),
    close: closeBehindPinwheel,
    closeBehindPinwheel,
    switchChapter: switchPinwheelBehindChapter,
    switchPinwheelBehindChapter,
    pausePinwheelBehindVideo,
    stopPinwheelBehindVideo,
    playPinwheelBehindVideo,
    replayLetterAnimation,
    keepLetter
  };

  window.pinwheelBehindController = controller;
  return controller;
}
