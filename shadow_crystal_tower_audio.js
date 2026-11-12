/**
 * SHADOW — CRYSTAL TOWER: NOCTURNAL FANTASY WEB AUDIO ENGINE
 *
 * Pure Web Audio API synthesis (zero external audio asset failures, zero autoplay):
 * - Gentle celestial fantasy music loop adapting to Time Cycle
 * - Ambient Night Wind, Rain drops (Rain weather), and Crystal Fireplace Crackle
 * - Tactile Footstep, Object Interaction, Room Portal & Activity Completion SFX
 */

const TIME_SCALES = {
  evening: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // Warm pentatonic
  night: [261.63, 311.13, 392.00, 466.16, 523.25, 622.25],   // Dreamy Cm9
  midnight: [246.94, 293.66, 369.99, 440.00, 493.88, 587.33], // Deep ethereal Bm9
  dawn: [293.66, 329.63, 440.00, 493.88, 587.33, 659.25]      // Luminous Dawn
};

export function createCrystalTowerAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let ambienceGain = null;
  let sfxGain = null;

  let isMusicPlaying = false;
  let isAmbiencePlaying = false;
  let isMuted = false;
  let masterVolume = 0.65;
  let currentTimeCycle = 'night';
  let currentWeather = 'clear';
  let currentRoom = 'bedroom';

  let musicTimer = null;
  let ambientTimers = [];
  let windSource = null;
  let rainSource = null;
  let lastStepAt = 0;

  function ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      musicGain = ctx.createGain();
      ambienceGain = ctx.createGain();
      sfxGain = ctx.createGain();

      musicGain.gain.value = 0.52;
      ambienceGain.gain.value = 0.48;
      sfxGain.gain.value = 0.6;
      masterGain.gain.value = isMuted ? 0 : masterVolume;

      musicGain.connect(masterGain);
      ambienceGain.connect(masterGain);
      sfxGain.connect(masterGain);
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function createNoiseBuffer(audioCtx, seconds = 2) {
    const length = Math.floor(audioCtx.sampleRate * seconds);
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.04 * white) / 1.04;
      data[i] = lastOut * 2.2;
    }
    return buffer;
  }

  function playNote(freq, delay = 0, dur = 3.2, peak = 0.09) {
    const c = ensureContext();
    if (!c || !musicGain || !isMusicPlaying) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    f.type = 'lowpass';
    f.frequency.setValueAtTime(1250, t0);

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(f);
    f.connect(g);
    g.connect(musicGain);

    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function scheduleMusicBar() {
    if (!isMusicPlaying) return;
    const scale = TIME_SCALES[currentTimeCycle] || TIME_SCALES.night;
    const order = [0, 2, 4, 3, 5, 2, 1, 4];
    order.forEach((step, idx) => {
      const f = scale[(step + Math.floor(Math.random() * 2)) % scale.length];
      playNote(f, idx * 0.85, 3.6, 0.085);
    });
  }

  function startMusic() {
    if (!ensureContext()) return false;
    isMusicPlaying = true;
    scheduleMusicBar();
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = setInterval(scheduleMusicBar, 6800);
    return true;
  }

  function stopMusic() {
    isMusicPlaying = false;
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  function teardownAmbienceNodes() {
    ambientTimers.forEach((t) => clearInterval(t));
    ambientTimers = [];
    if (windSource) {
      try { windSource.stop(); windSource.disconnect(); } catch (_) {}
      windSource = null;
    }
    if (rainSource) {
      try { rainSource.stop(); rainSource.disconnect(); } catch (_) {}
      rainSource = null;
    }
  }

  function rebuildAmbienceLayers() {
    teardownAmbienceNodes();
    if (!isAmbiencePlaying) return;
    const c = ensureContext();
    if (!c || !ambienceGain) return;

    const noiseBuf = createNoiseBuffer(c, 3);

    // 1. Soft Night Wind
    windSource = c.createBufferSource();
    windSource.buffer = noiseBuf;
    windSource.loop = true;
    const windFilter = c.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 340;
    const windGain = c.createGain();
    windGain.gain.value = currentRoom === 'balcony' ? 0.24 : 0.12;
    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(ambienceGain);
    windSource.start();

    // 2. Rain when weather === 'rain'
    if (currentWeather === 'rain') {
      rainSource = c.createBufferSource();
      rainSource.buffer = noiseBuf;
      rainSource.loop = true;
      const rainBand = c.createBiquadFilter();
      rainBand.type = 'bandpass';
      rainBand.frequency.value = 1850;
      rainBand.Q.value = 0.65;
      const rainGain = c.createGain();
      rainGain.gain.value = currentRoom === 'balcony' ? 0.28 : 0.16;
      rainSource.connect(rainBand);
      rainBand.connect(rainGain);
      rainGain.connect(ambienceGain);
      rainSource.start();
    }

    // 3. Fireplace crackle pops in living_room
    if (currentRoom === 'living_room') {
      const fireTimer = setInterval(() => {
        if (!isAmbiencePlaying || currentRoom !== 'living_room' || !ctx || !ambienceGain) return;
        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120 + Math.random() * 240, t0);
        g.gain.setValueAtTime(0.035, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
        osc.connect(g);
        g.connect(ambienceGain);
        osc.start(t0);
        osc.stop(t0 + 0.07);
      }, 420);
      ambientTimers.push(fireTimer);
    }
  }

  function startAmbience() {
    if (!ensureContext()) return false;
    isAmbiencePlaying = true;
    rebuildAmbienceLayers();
    return true;
  }

  function stopAmbience() {
    isAmbiencePlaying = false;
    teardownAmbienceNodes();
  }

  function playChimeSfx(freqs = [523.25, 659.25], stepSec = 0.07, dur = 0.35, vol = 0.14) {
    if (!ctx || !sfxGain || isMuted) return;
    if (ctx.state === 'suspended') return;
    freqs.forEach((f, idx) => {
      const t0 = ctx.currentTime + idx * stepSec;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t0);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(sfxGain);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    });
  }

  function playFootstepSfx() {
    if (!ctx || !sfxGain || isMuted || ctx.state === 'suspended') return;
    const now = performance.now();
    if (now - lastStepAt < 270) return;
    lastStepAt = now;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(155 + Math.random() * 25, t0);
    osc.frequency.exponentialRampToValueAtTime(65, t0 + 0.055);
    g.gain.setValueAtTime(0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(t0);
    osc.stop(t0 + 0.07);
  }

  function setVolume(vol) {
    masterVolume = Math.max(0, Math.min(1, Number(vol)));
    if (masterGain && ctx) {
      masterGain.gain.setTargetAtTime(isMuted ? 0 : masterVolume, ctx.currentTime, 0.05);
    }
  }

  function setMuted(mute) {
    isMuted = Boolean(mute);
    if (masterGain && ctx) {
      masterGain.gain.setTargetAtTime(isMuted ? 0 : masterVolume, ctx.currentTime, 0.05);
    }
  }

  function updateAtmosphere({ timeOfDay, weather, room }) {
    let ambienceChanged = false;
    if (timeOfDay) currentTimeCycle = timeOfDay;
    if (weather && weather !== currentWeather) {
      currentWeather = weather;
      ambienceChanged = true;
    }
    if (room && room !== currentRoom) {
      currentRoom = room;
      ambienceChanged = true;
    }
    if (ambienceChanged && isAmbiencePlaying) {
      rebuildAmbienceLayers();
    }
  }

  function stopAll() {
    stopMusic();
    stopAmbience();
  }

  return {
    unlockOnUserGesture: ensureContext,
    startMusic,
    stopMusic,
    startAmbience,
    stopAmbience,
    setVolume,
    setMuted,
    updateAtmosphere,
    playFootstepSfx,
    playInteractSfx: () => playChimeSfx([587.33, 880], 0.06, 0.32, 0.13),
    playPortalSfx: () => playChimeSfx([440, 587.33, 783.99], 0.055, 0.38, 0.12),
    playCompleteSfx: () => playChimeSfx([523.25, 659.25, 783.99, 1046.5], 0.07, 0.5, 0.15),
    stopAll,
    getStatus: () => ({ isMusicPlaying, isAmbiencePlaying, isMuted, masterVolume })
  };
}

