/**
 * YAWN CINEMA — THE QUIET ABYSS (CINEMA AKHIRA STATE & AUDIO ENGINE)
 * Private Underwater Sanctuary — Where the world slows down, and you can finally rest.
 * =============================================================================
 */

import { normalizeCharacterKey } from './universe_state.js';
import { safeLocalStorageSetItem } from './olu_indexeddb.js';

export const AKHIRA_CANONICAL_UID = 'MT14ZHATNqe90frAeQ74QFk4iXs2';
export const AKHIRA_CANONICAL_ID = 'akhira';

// -----------------------------------------------------------------------------
// 1. STARLIGHT CINEMA CHANNELS & AMBIENT FILMS
// -----------------------------------------------------------------------------
export const CINEMA_CATEGORIES = [
  { id: 'all', name: 'Semua Koleksi', icon: '🌌' },
  { id: 'astral_ocean', name: 'Astral Ocean', icon: '🐋' },
  { id: 'celestial_ambient', name: 'Celestial Ambient', icon: '✨' },
  { id: 'lofi_chill', name: 'Lo-Fi & Chill Visuals', icon: '☕' },
  { id: 'nature_waves', name: 'Nature & Deep Water Waves', icon: '🌊' }
];

export const CINEMA_FILMS = [
  {
    id: 'film_whale_journey',
    category: 'astral_ocean',
    title: 'Migration of the Astral Whales',
    subtitle: 'Perjalanan Kawanan Paus Bintang Melintasi Palung Langit',
    duration: '1:45:00',
    tag: 'Astral Ocean',
    desc: 'Visual megah kawanan paus astral bercahaya biru-keemasan melintasi samudra kosmik. Ditemani resonansi frekuensi lembut yang menenangkan sistem saraf.',
    ambientType: 'whale_song',
    videoType: 'procedural_ocean',
    color: '#38bdf8'
  },
  {
    id: 'film_bioluminescent_deep',
    category: 'astral_ocean',
    title: 'The Bioluminescent Sanctuary',
    subtitle: 'Cahaya Abadi di Dasar Palung Mariana Astral',
    duration: '2:10:00',
    tag: 'Astral Ocean',
    desc: 'Eksplorasi lembut terumbu karang bercahaya, ubur-ubur kristal yang melayang perlahan, dan hembusan gelembung mistis tanpa suara bising dunia luar.',
    ambientType: 'deep_sea_bubbles',
    videoType: 'procedural_abyss',
    color: '#2dd4bf'
  },
  {
    id: 'film_starlight_aurora',
    category: 'celestial_ambient',
    title: 'Starlight Aurora & Falling Comets',
    subtitle: 'Tarian Cahaya Kutub & Hujan Komet Malam Harapan',
    duration: '3:00:00',
    tag: 'Celestial Ambient',
    desc: 'Pemandangan langit malam ungu lavender dengan untaian aurora zamrud dan debu bintang yang meluncur pelan tanpa henti.',
    ambientType: 'crystal_bells',
    videoType: 'procedural_aurora',
    color: '#c084fc'
  },
  {
    id: 'film_midnight_observatory',
    category: 'celestial_ambient',
    title: 'Cosmic Lullaby of Silent Moons',
    subtitle: 'Ketenangan Galaksi Spiral di Ujung Waktu',
    duration: '2:30:00',
    tag: 'Celestial Ambient',
    desc: 'Simulasi galaksi berputar lambat, menatap nebula biru laut yang meredupkan kepenatan hari dan memeluk pikiran dengan ketenangan sunyi.',
    ambientType: 'gentle_instrumental',
    videoType: 'procedural_galaxy',
    color: '#818cf8'
  },
  {
    id: 'film_lofi_abyss_coffee',
    category: 'lofi_chill',
    title: 'Late Night Thoughts in the Abyss Lounge',
    subtitle: 'Alunan Nada Lembut untuk Jiwa yang Butuh Rehat',
    duration: '1:20:00',
    tag: 'Lo-Fi & Chill Visuals',
    desc: 'Animasi santai secangkir teh karang beruap, rintik air di jendela kaca bawah laut, dan irama piano lo-fi 60 BPM yang hangat.',
    ambientType: 'gentle_instrumental',
    videoType: 'procedural_lofi',
    color: '#fbbf24'
  },
  {
    id: 'film_midnight_waves',
    category: 'nature_waves',
    title: 'Night Ocean Whispers & Shoreline Echoes',
    subtitle: 'Deburan Ombak Malam Hari di Pantai Pasir Kristal',
    duration: '4:00:00',
    tag: 'Nature Waves',
    desc: 'Rekaman audio-visual ombak laut malam berirama stabil. Mengatur ritme napas 4-7-8 secara alami untuk meredakan ketegangan fisik.',
    ambientType: 'ocean_current',
    videoType: 'procedural_waves',
    color: '#0ea5e9'
  },
  {
    id: 'film_abyss_soft_rain',
    category: 'nature_waves',
    title: 'Gentle Rain Over the Silent Ocean',
    subtitle: 'Rintik Hujan Halus Membasuh Permukaan Samudra',
    duration: '2:15:00',
    tag: 'Nature Waves',
    desc: 'Suara hujan lembut jatuh di permukaan air laut luas, menciptakan ritme monoton yang memicu gelombang otak delta untuk relaksasi lelap.',
    ambientType: 'soft_rain',
    videoType: 'procedural_rain',
    color: '#60a5fa'
  }
];

// -----------------------------------------------------------------------------
// 2. OCEAN SOUNDSCAPE (6 SPECIFIED RELAXATION SOUNDS)
// -----------------------------------------------------------------------------
export const OCEAN_SOUNDSCAPES = [
  {
    id: 'ocean_current',
    name: 'Gentle Ocean Current',
    sub: 'Arus samudra bawah laut yang berayun tenang',
    icon: '🌊',
    badge: 'Deep Ocean',
    color: '#0284c7'
  },
  {
    id: 'whale_song',
    name: 'Astral Whale Song',
    sub: 'Resonansi frekuensi rendah nyanyian paus astral',
    icon: '🐋',
    badge: 'Astral Mystic',
    color: '#38bdf8'
  },
  {
    id: 'crystal_bells',
    name: 'Crystal Bells',
    sub: 'Gemerincing lonceng kristal laut yang meneduhkan',
    icon: '✨',
    badge: 'Chime & Glow',
    color: '#c084fc'
  },
  {
    id: 'soft_rain',
    name: 'Soft Rain',
    sub: 'Rintik hujan malam yang membasuh permukaan kaca',
    icon: '🌧️',
    badge: 'Calming Rain',
    color: '#60a5fa'
  },
  {
    id: 'deep_sea_bubbles',
    name: 'Deep Sea Bubbles',
    sub: 'Gelembung udara halus yang naik dari palung karang',
    icon: '🫧',
    badge: 'Abyss Bubbles',
    color: '#2dd4bf'
  },
  {
    id: 'gentle_instrumental',
    name: 'Gentle Instrumental',
    sub: 'Melodi akustik pelan dengan harmoni menentramkan',
    icon: '🎵',
    badge: 'Acoustic Calm',
    color: '#fbbf24'
  }
];

// -----------------------------------------------------------------------------
// 3. DO NOTHING CORNER ACTIVITIES & STATES
// -----------------------------------------------------------------------------
export const RESTING_STATES = {
  sitting: {
    id: 'sitting',
    label: 'Duduk Santai di Sofa',
    icon: '🛋️',
    affirmation: 'Akhira sedang duduk santai di sofa empuk, membiarkan tubuhnya rileks tanpa beban.',
    toast: '🛋️ Akhira bersandar nyaman di sofa beludru ungu...'
  },
  curled_with_blanket: {
    id: 'curled_with_blanket',
    label: 'Berselimut Bintang',
    icon: '⭐',
    affirmation: 'Akhira meringkuk hangat di bawah selimut berbintang yang lembut dan meneduhkan.',
    toast: '⭐ Selimut bintang terhampar hangat memeluk tubuh Akhira...'
  },
  whale_hug: {
    id: 'whale_hug',
    label: 'Memeluk Boneka Paus',
    icon: '🐋',
    affirmation: 'Akhira mendekap erat boneka paus raksasa yang empuk, merasa aman dan terlindungi.',
    toast: '🐋 Akhira memeluk boneka paus astral. Rasa lelah perlahan mencair...'
  },
  reclining: {
    id: 'reclining',
    label: 'Rebahan Penuh & Pejamkan Mata',
    icon: '😴',
    affirmation: 'Akhira merebahkan diri sejenak, memejamkan mata dan menikmati kesunyian laut.',
    toast: '😴 Menghirup napas perlahan... Biarkan dunia menunggu di luar.'
  }
};

// -----------------------------------------------------------------------------
// 4. LETTERS TO MYSELF (AKHIRA'S PERSONAL JOURNAL CATEGORIES & SEEDS)
// -----------------------------------------------------------------------------
export const LETTER_CATEGORIES = [
  { id: 'all', name: 'Semua Tulisan', icon: '📜' },
  { id: 'catatan_hari_ini', name: 'Catatan Hari Ini', icon: '📝', color: '#38bdf8' },
  { id: 'yang_ingin_kulepaskan', name: 'Yang Ingin Kulepaskan', icon: '🕊️', color: '#c084fc' },
  { id: 'harapan_kecil', name: 'Harapan Kecil', icon: '🌱', color: '#34d399' },
  { id: 'terima_kasih_diriku', name: 'Terima Kasih Diriku', icon: '💙', color: '#f472b6' }
];

export const DEFAULT_AKHIRA_LETTERS = [
  {
    id: 'letter_init_1',
    category: 'catatan_hari_ini',
    title: 'Menemukan Kembali Detak Napasku',
    content: 'Hari ini terasa begitu panjang dan menguras banyak hal. Orang-orang melihatku tenang dan mandiri, tapi ada saat-saat di mana aku hanya ingin duduk di sudut sunyi ini tanpa harus menjelaskan apa-apa kepada siapa pun. Di bawah kubah palung ini, bersama paus-paus yang berenang lambat, aku merasa nafasku akhirnya kembali seimbang.',
    date: '18 Nov 2026',
    time: '23:40',
    mood: '🌙',
    pinned: true
  },
  {
    id: 'letter_init_2',
    category: 'yang_ingin_kulepaskan',
    title: 'Tuntutan untuk Selalu Sempurna',
    content: 'Malam ini, aku melepaskan rasa cemas tentang masa depan yang belum terjadi. Aku melepaskan keharusan untuk selalu kuat di depan orang lain. Tidak apa-apa jika hari ini tidak semua rencana selesai. Aku sudah melangkah sejauh ini, dan itu sudah sangat cukup.',
    date: '17 Nov 2026',
    time: '22:15',
    mood: '🫧',
    pinned: false
  },
  {
    id: 'letter_init_3',
    category: 'terima_kasih_diriku',
    title: 'Terima Kasih Telah Bertahan',
    content: 'Terima kasih diriku karena tidak menyerah, bahkan saat hari-hari terasa berat dan sepi. Terima kasih telah menjaga kelembutan hati di tengah dunia yang terkadang terburu-buru. Istirahatlah malam ini, besok kita sambut mentari dengan senyum baru.',
    date: '15 Nov 2026',
    time: '01:10',
    mood: '💙',
    pinned: true
  }
];

// -----------------------------------------------------------------------------
// 5. LIGHTING MODES & CEILING PROJECTIONS
// -----------------------------------------------------------------------------
export const LIGHTING_MODES = [
  { id: 'light-deep', name: 'Bioluminescent Deep', icon: '🌊', desc: 'Cahaya biru laut alami dari terumbu karang' },
  { id: 'light-aurora', name: 'Starlight Aurora', icon: '✨', desc: 'Nuansa lavender bercahaya keemasan' },
  { id: 'light-warm', name: 'Warm Amber', icon: '🕯️', desc: 'Lentera meja hangat dan teduh' },
  { id: 'light-cinema', name: 'Midnight Cinema', icon: '🎬', desc: 'Mode redup sinematik untuk menonton' }
];

export const CEILING_PROJECTIONS = [
  { id: 'nebula', name: 'Galaxy Nebula', icon: '🌌' },
  { id: 'caustics', name: 'Ocean Caustics', icon: '🌊' },
  { id: 'stars', name: 'Falling Stars', icon: '⭐' },
  { id: 'off', name: 'Mati / Redup', icon: '🌑' }
];

// -----------------------------------------------------------------------------
// 6. STORAGE MANAGEMENT (INDEXEDDB / ISOLATED LOCALSTORAGE)
// -----------------------------------------------------------------------------
export function getYawnCinemaStorageKey(charKey = 'akhira') {
  const normKey = normalizeCharacterKey(charKey);
  return `olu_yawn_cinema_${normKey}`;
}

export function createDefaultYawnCinemaState(charKey = 'akhira') {
  const normKey = normalizeCharacterKey(charKey);
  return {
    characterId: normKey,
    activeSoundscape: 'none',
    soundscapeVolume: 0.7,
    activeLightingMode: 'light-deep',
    activeCeilingProjection: 'caustics',
    activeFilmId: 'film_whale_journey',
    isPlayingFilm: false,
    filmVolume: 0.8,
    favoriteFilmIds: ['film_whale_journey', 'film_starlight_aurora'],
    restingState: 'sitting',
    blanketWrapped: false,
    whaleHugged: false,
    tableLanternOn: true,
    pillowsFluffedCount: 0,
    observationMode: false,
    welcomeDismissed: false,
    restMinutesTotal: 15,
    letters: JSON.parse(JSON.stringify(DEFAULT_AKHIRA_LETTERS)),
    lastSavedTimestamp: Date.now()
  };
}

export function loadYawnCinemaState(charKey = 'akhira') {
  const normKey = normalizeCharacterKey(charKey);
  try {
    const key = getYawnCinemaStorageKey(normKey);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = createDefaultYawnCinemaState(normKey);
      saveYawnCinemaState(initial, normKey);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.letters)) {
      parsed.letters = JSON.parse(JSON.stringify(DEFAULT_AKHIRA_LETTERS));
    }
    if (!Array.isArray(parsed.favoriteFilmIds)) {
      parsed.favoriteFilmIds = ['film_whale_journey'];
    }
    return parsed;
  } catch (err) {
    console.warn('[YawnCinemaState] Error loading state:', err);
    return createDefaultYawnCinemaState(normKey);
  }
}

export function saveYawnCinemaState(state, charKey = 'akhira') {
  try {
    const normKey = normalizeCharacterKey(charKey || state?.characterId || 'akhira');
    const key = getYawnCinemaStorageKey(normKey);
    state.lastSavedTimestamp = Date.now();
    safeLocalStorageSetItem(key, JSON.stringify(state));
  } catch (err) {
    console.warn('[YawnCinemaState] Error saving state:', err);
  }
}

// -----------------------------------------------------------------------------
// 7. WEB AUDIO API SYNTHESIZER (6 SEAMLESS OCEAN SOUNDSCAPES)
// -----------------------------------------------------------------------------
export function createYawnCinemaAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let activeNodes = [];
  let currentSound = 'none';
  let masterVolume = 0.7;
  let loopTimer = null;

  function initAudioContext() {
    if (!ctx) {
      const AudioCtxClass = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (AudioCtxClass) {
        ctx = new AudioCtxClass();
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  function setVolume(val) {
    masterVolume = Math.max(0, Math.min(1, Number(val) || 0.7));
    if (masterGain && ctx) {
      masterGain.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.05);
    }
  }

  function getVolume() {
    return masterVolume;
  }

  function stopAllSoundscape() {
    if (loopTimer) {
      clearInterval(loopTimer);
      clearTimeout(loopTimer);
      loopTimer = null;
    }
    activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Safe disconnect
      }
    });
    activeNodes = [];
    currentSound = 'none';
  }

  // 1. Gentle Ocean Current (filtered pink/brown noise with slow LFO)
  function startOceanCurrent() {
    if (!ctx || !masterGain) return;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec ocean swell

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(140, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.45, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);

    noiseSource.start();
    lfo.start();

    activeNodes.push(noiseSource, filter, lfo, lfoGain, gainNode);
  }

  // 2. Astral Whale Song (smooth deep resonant sweeping oscillators)
  function startWhaleSong() {
    if (!ctx || !masterGain) return;
    function triggerWhaleCall() {
      if (!ctx || currentSound !== 'whale_song') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sine';
      vibrato.type = 'sine';
      vibrato.frequency.setValueAtTime(4.5, now);
      vibratoGain.gain.setValueAtTime(6.0, now);

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      const baseFreq = 110 + Math.random() * 60; // Deep whale song (A2 - D3)
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 1.8);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 4.0);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

      osc.connect(gain);
      gain.connect(masterGain);

      vibrato.start(now);
      osc.start(now);
      vibrato.stop(now + 5.0);
      osc.stop(now + 5.0);

      const nextDelay = 4500 + Math.random() * 3500;
      loopTimer = setTimeout(triggerWhaleCall, nextDelay);
    }
    triggerWhaleCall();
  }

  // 3. Crystal Bells (ethereal celestial wind chimes)
  function startCrystalBells() {
    if (!ctx || !masterGain) return;
    const chimeFreqs = [587.33, 659.25, 880.00, 1046.50, 1174.66, 1318.51, 1567.98]; // D5 - G6 pentatonic
    function triggerChime() {
      if (!ctx || currentSound !== 'crystal_bells') return;
      const now = ctx.currentTime;
      const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 3.3);

      const nextInterval = 900 + Math.random() * 1600;
      loopTimer = setTimeout(triggerChime, nextInterval);
    }
    triggerChime();
  }

  // 4. Soft Rain (high-passed gentle continuous patter)
  function startSoftRain() {
    if (!ctx || !masterGain) return;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(0.8, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.22, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);

    noiseSource.start();
    activeNodes.push(noiseSource, filter, gainNode);
  }

  // 5. Deep Sea Bubbles (popping rising sine drops)
  function startDeepSeaBubbles() {
    if (!ctx || !masterGain) return;
    function triggerBubble() {
      if (!ctx || currentSound !== 'deep_sea_bubbles') return;
      const now = ctx.currentTime;
      const startF = 220 + Math.random() * 180;
      const endF = startF * (2.2 + Math.random() * 0.8);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startF, now);
      osc.frequency.exponentialRampToValueAtTime(endF, now + 0.14);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.2);

      const delay = 350 + Math.random() * 800;
      loopTimer = setTimeout(triggerBubble, delay);
    }
    triggerBubble();
  }

  // 6. Gentle Instrumental (warm arpeggiated piano/kalimba chords)
  function startGentleInstrumental() {
    if (!ctx || !masterGain) return;
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G6
    ];
    let chordIdx = 0;
    let noteIdx = 0;

    function playNote() {
      if (!ctx || currentSound !== 'gentle_instrumental') return;
      const now = ctx.currentTime;
      const currentChord = chords[chordIdx];
      const freq = currentChord[noteIdx];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 1.5);

      noteIdx++;
      if (noteIdx >= currentChord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }

      loopTimer = setTimeout(playNote, 600);
    }
    playNote();
  }

  function setSoundscape(soundType) {
    initAudioContext();
    stopAllSoundscape();
    if (!soundType || soundType === 'none') {
      currentSound = 'none';
      return;
    }
    currentSound = soundType;

    switch (soundType) {
      case 'ocean_current':
        startOceanCurrent();
        break;
      case 'whale_song':
        startWhaleSong();
        break;
      case 'crystal_bells':
        startCrystalBells();
        break;
      case 'soft_rain':
        startSoftRain();
        break;
      case 'deep_sea_bubbles':
        startDeepSeaBubbles();
        break;
      case 'gentle_instrumental':
        startGentleInstrumental();
        break;
      default:
        currentSound = 'none';
        break;
    }
  }

  function playUiTone(freq = 523.25, dur = 0.3, type = 'sine') {
    initAudioContext();
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  return {
    initAudioContext,
    setVolume,
    getVolume,
    setSoundscape,
    getCurrentSound: () => currentSound,
    stopAllSoundscape,
    playUiTone
  };
}
