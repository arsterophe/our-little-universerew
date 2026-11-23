/**
 * KIDULT GAZEBO — MEMORY GARDEN STATE & AUDIO ENGINE
 * Exclusive Sanctuary for Nyanya ⭐ & Visitors in Universe KIDULT
 * =============================================================================
 */

import { normalizeGreenhouseCharKey } from './greenhouse_state.js';

// -----------------------------------------------------------------------------
// 1. TEA & WARM DRINK CATALOG
// -----------------------------------------------------------------------------
export const KIDULT_TEAS = {
  lavender_star: {
    id: 'lavender_star',
    name: 'Star Lavender Tea (Teh Lavender Bintang)',
    icon: '🪻',
    color: '#c084fc',
    steamColor: 'rgba(216, 180, 254, 0.65)',
    aroma: 'Harum floral lavender lembut & menenangkan',
    desc: 'Seduhan kuncup lavender segar dari taman KIDULT dengan taburan kelopak bunga bintang ungu. Menghadirkan kedamaian batin di bawah langit malam.',
    effect: '✨ Ketenangan Jiwa & Relaksasi Pikiran'
  },
  twilight_chamomile: {
    id: 'twilight_chamomile',
    name: 'Twilight Honey Chamomile (Chamomile Madu Senja)',
    icon: '🌼',
    color: '#fde047',
    steamColor: 'rgba(254, 240, 138, 0.65)',
    aroma: 'Manis madu alami & bunga chamomile keemasan',
    desc: 'Bunga chamomile liar yang dipetik saat senja merekah, dipadukan dengan madu hutan galaksi. Menghangatkan tubuh dan meredakan letih.',
    effect: '🍯 Kehangatan Hati & Tidur Nyenyak'
  },
  cloud_cocoa: {
    id: 'cloud_cocoa',
    name: 'Cloud Marshmallow Cocoa (Cokelat Awan)',
    icon: '☕',
    color: '#d97706',
    steamColor: 'rgba(251, 191, 36, 0.65)',
    aroma: 'Cokelat kental manis & vanila lembut',
    desc: 'Cokelat hangat khas masa kecil Nyanya dengan lelehan marshmallow berbentuk awan dan bintang. Manis, lembut, dan penuh kenangan.',
    effect: '☁️ Nostalgia Masa Kecil & Kebahagiaan'
  },
  fairytale_berry: {
    id: 'fairytale_berry',
    name: 'Fairytale Berry Tea (Teh Buah Dongeng)',
    icon: '🍓',
    color: '#f43f5e',
    steamColor: 'rgba(251, 113, 133, 0.65)',
    aroma: 'Aroma stroberi segar, raspberi & mint',
    desc: 'Racikan buah berry manis asam dari The Enchanted Greenhouse dengan daun mint segar dan sirup mawar merah muda.',
    effect: '🌸 Kesegaran Pikiran & Semangat Baru'
  }
};

// -----------------------------------------------------------------------------
// 2. SWEET TREATS & PATISSERIE
// -----------------------------------------------------------------------------
export const KIDULT_TREATS = {
  star_cupcake: {
    id: 'star_cupcake',
    name: 'Starlight Cupcake',
    icon: '🧁',
    desc: 'Kue mangkuk vanila lembut dengan frosting lilac pastel dan taburan bintang emas gula renyah.'
  },
  lilac_macaron: {
    id: 'lilac_macaron',
    name: 'Lilac Pastel Macarons',
    icon: '🍬',
    desc: 'Trio macaron renyah dengan isian selai blueberry lavender dan salted caramel madu.'
  },
  honey_cookie: {
    id: 'honey_cookie',
    name: 'Paw Honey Cookies',
    icon: '🍪',
    desc: 'Kue kering mentega bermotif telapak cakar anak anjing yang manis, renyah, dan gurih.'
  }
};

// -----------------------------------------------------------------------------
// 3. LIGHTING ATMOSPHERES
// -----------------------------------------------------------------------------
export const KIDULT_GAZEBO_LIGHTS = {
  golden: {
    id: 'golden',
    name: 'Golden Hearth Glow',
    icon: '🕯️',
    desc: 'Cahaya lentera keemasan hangat yang teduh dan romantis.',
    class: 'light-golden',
    filter: 'sepia(0.2) saturate(1.2) brightness(1.02)'
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Starlight',
    icon: '💜',
    desc: 'Pendar ungu lilac kosmik yang magis dan menenangkan.',
    class: 'light-lavender',
    filter: 'hue-rotate(250deg) saturate(1.15) brightness(0.98)'
  },
  firefly: {
    id: 'firefly',
    name: 'Fairy Fireflies Sparkle',
    icon: '✨',
    desc: 'Kerlap-kerlip kunang-kunang mint hijau yang menari lembut.',
    class: 'light-firefly',
    filter: 'hue-rotate(90deg) saturate(1.1) brightness(1.04)'
  },
  rosy: {
    id: 'rosy',
    name: 'Rosy Twilight Radiance',
    icon: '🌸',
    desc: 'Rona senja dusty pink dan peach yang manis dan nostalgik.',
    class: 'light-rosy',
    filter: 'hue-rotate(320deg) saturate(1.2) brightness(1.02)'
  }
};

// -----------------------------------------------------------------------------
// 4. PUPPY (MOCHI) INTERACTIONS
// -----------------------------------------------------------------------------
export const PUPPY_INTERACTIONS = [
  'Mochi menguap pelan, ekornya mengibas lembut, lalu mendengkur nyaman di bantal ungu... ♡',
  'Mochi membuka matanya sedikit, mencium ujung jarimu dengan hidung mungil yang basah, lalu tersenyum tidur lagi. ✨',
  'Zzz... (Dalam mimpi kecilnya, Mochi sedang berlari mengejar kupu-kupu wisteria di taman bersama Nyanya). 🌸',
  'Mochi meringkuk lebih erat sambil memeluk bola rajut ungu kesayangannya dengan napas teratur. 🐾',
  'Kamu membelai punggung berbulu lembut Mochi. Bulunya sehangat selimut wol di sore hari yang damai. 💜'
];

// -----------------------------------------------------------------------------
// 5. CHIBI NYANYA GAZEBO DIALOGS & QUOTES
// -----------------------------------------------------------------------------
export const NYANYA_HERO_QUOTE = '"Sometimes, growing up means learning to hold the little child inside you a little closer." — Nyanya ⭐';

export const NYANYA_GAZEBO_DIALOGS = [
  'Menjadi dewasa bukan berarti melupakan cara bermimpi. Di gazebo ini, kita selalu boleh menjadi anak kecil lagi. ⭐',
  'Secangkir teh hangat, aroma lavender, dan semilir angin senja... Terkadang hal sederhana inilah yang paling menyembuhkan jiwa.',
  'Lihat pulau kastil di kejauhan sana... Cahaya jendelanya selalu menyala untuk mengingatkan bahwa kita tidak pernah sendirian.',
  'Terima kasih sudah mampir ke gazebo Memory Garden ku. Duduklah yang nyaman, nikmati tehmu pelan-pelan ya ♡',
  'Setiap kenangan kecil yang kita simpan adalah bintang penunjuk arah di malam yang gelap. Jangan pernah takut melangkah.'
];

// -----------------------------------------------------------------------------
// 6. KIDULT JURNAL MALAM — PHILOSOPHY & MOODS
// -----------------------------------------------------------------------------
export const KIDULT_JOURNAL_MOODS = [
  { id: 'inner_child', label: '🌟 Sisi Kecil', desc: 'Menghargai ketulusan dan kepolosan batin' },
  { id: 'nostalgia', label: '🧸 Nostalgia', desc: 'Mengenang masa kecil dengan hangat dan rindu' },
  { id: 'growth', label: '🌱 Bertumbuh', desc: 'Belajar dewasa tanpa kehilangan diri sendiri' },
  { id: 'self_love', label: '💖 Menerima Diri', desc: 'Memeluk segala kelebihan & kekurangan dengan kasih' },
  { id: 'dream', label: '☁️ Mimpi Kecil', desc: 'Merajut harapan manis di bawah naungan bintang' }
];

export const DEFAULT_NYANYA_MEMORIES = [
  {
    id: 'mem_1',
    title: 'Pertama Kali Menemukan Bintang Senja',
    note: 'Saat langit KIDULT pertama kali berpendar lavender dan emas, aku berjanji pada diriku sendiri untuk selalu menjaga ketulusan hati ini.',
    tag: 'Janji Hati',
    sticker: '⭐',
    timestamp: Date.now() - 86400000 * 5,
    author: 'Nyanya'
  },
  {
    id: 'mem_2',
    title: 'Sore Hangat Bersama Mochi di Gazebo',
    note: 'Mochi tertidur di bantal ungu setelah lelah bermain kelopak bunga. Suara napas kecilnya membuat seluruh duniaku terasa tenang.',
    tag: 'Kehangatan',
    sticker: '🐾',
    timestamp: Date.now() - 86400000 * 2,
    author: 'Nyanya'
  },
  {
    id: 'mem_3',
    title: 'Teh Lavender Bersama Sahabat',
    note: 'Tawa dan cerita hangat yang terucap di meja gazebo ini akan abadi selamanya, tersimpan rapi di dalam kotak kenangan.',
    tag: 'Persahabatan',
    sticker: '🪻',
    timestamp: Date.now() - 86400000 * 1,
    author: 'Nyanya'
  }
];

export const DEFAULT_KIDULT_JOURNALS = [
  {
    id: 'kjournal-seed-1',
    title: 'Memeluk Sisi Kecil yang Tak Pernah Hilang',
    mood: 'inner_child',
    content: 'Hari ini aku tersadar, menjadi dewasa bukanlah tentang membuang semua hal yang kita sukai saat kecil dulu. Dunia ini terkadang terasa begitu terburu-buru, tapi saat aku duduk di gazebo ini sambil memandangi langit lavender, aku tahu anak kecil di dalam diriku masih tersenyum tenang.',
    date: 'Malam ini',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'kjournal-seed-2',
    title: 'Belajar Bertumbuh dengan Pelan',
    mood: 'growth',
    content: 'Terkadang aku merasa cemas apakah aku sudah cukup baik menjalani hari-hariku. Tapi melihat bunga wisteria yang mekar perlahan mengikuti musimnya, aku belajar untuk tidak memaksakan segalanya. Bertumbuh adalah tentang menikmati setiap langkah kecil.',
    date: 'Kemarin',
    createdAt: Date.now() - 86400000
  }
];

// -----------------------------------------------------------------------------
// 7. QUIET MOMENT AMBIENT SOUNDSCAPES
// -----------------------------------------------------------------------------
export const KIDULT_AMBIENT_OPTIONS = [
  { id: 'breeze', icon: '🌸', title: 'Semilir Angin Wisteria', desc: 'Hembusan lembut angin sore yang menyibak tirai sutra dan kelopak wisteria' },
  { id: 'night', icon: '🌌', title: 'Malam Berbintang Twilight', desc: 'Keheningan malam senja berhias suara jangkrik damai dan pendar kosmik' },
  { id: 'waterfall', icon: '🌊', title: 'Gemericik Air Terjun Lilac', desc: 'Aliran air segar dari tebing pulau terapung yang menentramkan batin' },
  { id: 'hearth', icon: '🧸', title: 'Kehangatan Perapian Dongeng', desc: 'Kresek lembut kayu manis dan perapian hangat di tepi gazebo' }
];

// -----------------------------------------------------------------------------
// 8. STORAGE MANAGEMENT
// -----------------------------------------------------------------------------
export function getKidultGazeboStorageKey(charKey = 'nyanya') {
  const normKey = normalizeGreenhouseCharKey(charKey);
  return `olu_kgazebo_${normKey}`;
}

export function createDefaultKidultGazeboState(charKey = 'nyanya') {
  const normKey = normalizeGreenhouseCharKey(charKey);
  const isHost = (normKey === 'nyanya');
  return {
    characterId: normKey,
    currentTea: 'lavender_star',
    currentTreat: 'star_cupcake',
    currentLight: 'golden',
    teaBrewCount: isHost ? 5 : 1,
    puppyPetCount: isHost ? 8 : 1,
    soundscapeMode: 'none',
    musicVolume: 0.7,
    memories: isHost ? JSON.parse(JSON.stringify(DEFAULT_NYANYA_MEMORIES)) : [
      {
        id: `mem_guest_${Date.now()}`,
        title: `Kunjungan Hangat ke Gazebo Nyanya`,
        note: `Hari yang indah bersantai di Memory Garden Gazebo KIDULT, menikmati teh dan ketenangan senja.`,
        tag: 'Kunjungan',
        sticker: '🌸',
        timestamp: Date.now(),
        author: normKey.toUpperCase()
      }
    ],
    journals: isHost ? JSON.parse(JSON.stringify(DEFAULT_KIDULT_JOURNALS)) : [
      {
        id: `kjournal_guest_${Date.now()}`,
        title: `Catatan Kunjungan di Gazebo Nyanya`,
        mood: 'nostalgia',
        content: `Malam yang tenang di gazebo Nyanya. Menikmati secangkir teh hangat dan melihat pemandangan kastel terapung.`,
        date: 'Hari ini',
        createdAt: Date.now()
      }
    ],
    readingProgress: {},
    lastSavedTimestamp: Date.now()
  };
}

export function loadKidultGazeboState(charKey = 'nyanya') {
  const normKey = normalizeGreenhouseCharKey(charKey);
  try {
    const key = getKidultGazeboStorageKey(normKey);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = createDefaultKidultGazeboState(normKey);
      saveKidultGazeboState(initial, normKey);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.journals)) {
      parsed.journals = JSON.parse(JSON.stringify(DEFAULT_KIDULT_JOURNALS));
    }
    return parsed;
  } catch (err) {
    console.warn('[KidultGazeboState] Error loading state from localStorage:', err);
    return createDefaultKidultGazeboState(normKey);
  }
}

export function saveKidultGazeboState(state, charKey = 'nyanya') {
  try {
    const normKey = normalizeGreenhouseCharKey(charKey || state?.characterId || 'nyanya');
    const key = getKidultGazeboStorageKey(normKey);
    state.lastSavedTimestamp = Date.now();
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.warn('[KidultGazeboState] Error saving state to localStorage:', err);
  }
}

// -----------------------------------------------------------------------------
// 9. WEB AUDIO API SYNTHESIZER (MUSIC BOX & AMBIENT SOUNDS)
// -----------------------------------------------------------------------------
export function createGazeboAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let musicBoxTimer = null;
  let activeAmbientSources = [];
  let isPlayingMusic = false;
  let currentAmbient = 'none';

  function initAudioContext() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        ctx = new AudioContextClass();
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  // Pentatonic Fairytale Music Box Lullaby Sequence
  // Notes in Hz: C5(523.25), D5(587.33), E5(659.25), G5(783.99), A5(880), C6(1046.50), D6(1174.66), E6(1318.51)
  const MUSIC_BOX_MELODY = [
    { freq: 659.25, dur: 0.4 }, // E5
    { freq: 783.99, dur: 0.4 }, // G5
    { freq: 880.00, dur: 0.6 }, // A5
    { freq: 1046.5, dur: 0.4 }, // C6
    { freq: 880.00, dur: 0.4 }, // A5
    { freq: 783.99, dur: 0.6 }, // G5
    { freq: 659.25, dur: 0.4 }, // E5
    { freq: 587.33, dur: 0.8 }, // D5
    { freq: 523.25, dur: 0.4 }, // C5
    { freq: 587.33, dur: 0.4 }, // D5
    { freq: 659.25, dur: 0.6 }, // E5
    { freq: 783.99, dur: 0.4 }, // G5
    { freq: 523.25, dur: 1.0 }  // C5
  ];

  function playMusicBoxNote(freq, time) {
    if (!ctx || !masterGain) return;
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(0.18, time + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(time);
    osc.stop(time + 1.3);
  }

  function startMusicBox() {
    initAudioContext();
    if (!ctx) return;
    stopMusicBox();
    isPlayingMusic = true;

    function scheduleLoop() {
      if (!isPlayingMusic) return;
      const now = ctx.currentTime;
      let offset = 0;
      for (let i = 0; i < MUSIC_BOX_MELODY.length; i++) {
        const item = MUSIC_BOX_MELODY[i];
        playMusicBoxNote(item.freq, now + offset);
        offset += item.dur;
      }
      musicBoxTimer = setTimeout(scheduleLoop, (offset + 1.5) * 1000);
    }
    scheduleLoop();
  }

  function stopMusicBox() {
    isPlayingMusic = false;
    if (musicBoxTimer) {
      clearTimeout(musicBoxTimer);
      musicBoxTimer = null;
    }
  }

  // Ambient Soundscapes
  function stopAmbient() {
    activeAmbientSources.forEach(src => {
      try { src.stop(); src.disconnect(); } catch (_) {}
    });
    activeAmbientSources = [];
    currentAmbient = 'none';
  }

  function startAmbient(type) {
    initAudioContext();
    if (!ctx || !masterGain) return;
    stopAmbient();
    currentAmbient = type;

    if (type === 'none') return;

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    const ambGain = ctx.createGain();

    if (type === 'waterfall') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, ctx.currentTime);
      ambGain.gain.setValueAtTime(0.12, ctx.currentTime);
    } else if (type === 'breeze') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(240, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
      ambGain.gain.setValueAtTime(0.08, ctx.currentTime);
    } else if (type === 'night') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4500, ctx.currentTime);
      filter.Q.setValueAtTime(8.0, ctx.currentTime);
      ambGain.gain.setValueAtTime(0.03, ctx.currentTime);
    } else if (type === 'hearth') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);
      ambGain.gain.setValueAtTime(0.09, ctx.currentTime);
    }

    whiteNoise.connect(filter);
    filter.connect(ambGain);
    ambGain.connect(masterGain);

    whiteNoise.start();
    activeAmbientSources.push(whiteNoise);
  }

  function setVolume(vol) {
    if (masterGain && ctx) {
      masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), ctx.currentTime);
    }
  }

  return {
    initAudioContext,
    startMusicBox,
    stopMusicBox,
    isMusicPlaying: () => isPlayingMusic,
    startAmbient,
    stopAmbient,
    getCurrentAmbient: () => currentAmbient,
    setVolume
  };
}
