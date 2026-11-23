/**
 * TO YOU GAZEBO — EVERGLOW MORNING GAZEBO STATE & AUDIO ENGINE
 * Exclusive Sanctuary for Lala ☼ & Visitors in Universe TO YOU
 * =============================================================================
 */

import { normalizeCharacterKey } from './universe_state.js';

export const LALA_CANONICAL_UID = 'EqByKA8FXoTEt0OmIsSDPfnxMDB3';
export const LALA_CANONICAL_ID = 'lala';

// -----------------------------------------------------------------------------
// 1. TEA & WARM DRINK CATALOG
// -----------------------------------------------------------------------------
export const TOYOU_TEAS = {
  rose_honey: {
    id: 'rose_honey',
    name: 'Star Rose Honey Tea (Teh Kelopak Mawar & Madu Hutan)',
    icon: '🌹',
    color: '#f472b6',
    steamColor: 'rgba(244, 114, 182, 0.65)',
    aroma: 'Harum semerbak kelopak mawar mekar & madu manis alami',
    desc: 'Seduhan kelopak mawar segar yang dipetik saat fajar di kebun TO YOU, dipadukan dengan tetesan madu hutan peri. Memberikan kehangatan penuh kasih dan semangat menyapa hari.',
    effect: '✨ Kehangatan Kasih Sayang & Semangat Pagi'
  },
  morning_dew_sakura: {
    id: 'morning_dew_sakura',
    name: 'Morning Dew Sakura Tea (Teh Sakura Embun Pagi)',
    icon: '🌸',
    color: '#fbcfe8',
    steamColor: 'rgba(251, 207, 232, 0.65)',
    aroma: 'Aroma lembut bunga sakura musim semi & embun sejuk',
    desc: 'Kelopak sakura pilihan berbalut embun pagi dari taman Bloom Cottage. Rasanya sangat ringan, menenangkan pikiran, dan membasuh kepenatan.',
    effect: '🌸 Ketenangan Batin & Kesegaran Jiwa'
  },
  sunshine_chamomile: {
    id: 'sunshine_chamomile',
    name: 'Golden Sunshine Chamomile (Chamomile Mentari Pagi)',
    icon: '🌼',
    color: '#fde047',
    steamColor: 'rgba(254, 240, 138, 0.65)',
    aroma: 'Manis chamomile keemasan bertabur sinar mentari',
    desc: 'Bunga chamomile liar yang bermekaran di bawah hangatnya matahari pagi TO YOU. Memancarkan aura cerah dan membawa senyuman di setiap tegukan.',
    effect: '☀️ Kebahagiaan Ceria & Rasa Syukur'
  },
  peach_blossom: {
    id: 'peach_blossom',
    name: 'Peach Blossom Breeze (Teh Bunga Persik & Mint)',
    icon: '🍑',
    color: '#fed7aa',
    steamColor: 'rgba(254, 215, 170, 0.65)',
    aroma: 'Manis segar buah persik ranum & daun mint hutan peri',
    desc: 'Perpaduan manis kuncup bunga persik dengan kesegaran daun mint hutan. Menyejukkan hati yang lelah dan mengalirkan kedamaian lembut.',
    effect: '🍃 Relaksasi Mendalam & Kesejukan Hati'
  }
};

// -----------------------------------------------------------------------------
// 2. SWEET TREATS & PATISSERIE
// -----------------------------------------------------------------------------
export const TOYOU_TREATS = {
  butterfly_cupcake: {
    id: 'butterfly_cupcake',
    name: 'Butterfly Dream Cupcake',
    icon: '🧁',
    desc: 'Kue mangkuk lembut berhiaskan krim pastel peach dan hiasan gula berbentuk sayap kupu-kupu yang renyah.'
  },
  rose_macaron: {
    id: 'rose_macaron',
    name: 'Rose Petal Macarons',
    icon: '🍬',
    desc: 'Macaron renyah manis berisi ganache selai kelopak mawar dan vanila madu lembut.'
  },
  golden_star_cookie: {
    id: 'golden_star_cookie',
    name: 'Golden Starlight Butter Cookies',
    icon: '🍪',
    desc: 'Kue mentega keemasan beraroma vanila hangat dengan taburan kristal gula tebu yang manis gurih.'
  }
};

// -----------------------------------------------------------------------------
// 3. LIGHTING ATMOSPHERES
// -----------------------------------------------------------------------------
export const TOYOU_GAZEBO_LIGHTS = {
  morning_sun: {
    id: 'morning_sun',
    name: 'Golden Morning Radiance',
    icon: '☀️',
    desc: 'Kilau cahaya matahari pagi keemasan yang hangat dan membangkitkan semangat hidup.',
    class: 'light-golden',
    filter: 'sepia(0.15) saturate(1.2) brightness(1.03)'
  },
  lavender_dew: {
    id: 'lavender_dew',
    name: 'Lavender Wisteria Whisper',
    icon: '💜',
    desc: 'Pendar lembut untaian bunga wisteria ungu yang sejuk dan meneduhkan pikiran.',
    class: 'light-lavender',
    filter: 'hue-rotate(240deg) saturate(1.15) brightness(0.98)'
  },
  fairy_mint: {
    id: 'fairy_mint',
    name: 'Fairy Garden Fireflies',
    icon: '✨',
    desc: 'Kerlap-kerlip kunang-kunang peri berwarna mint cerah yang menari di sekitar gazebo.',
    class: 'light-firefly',
    filter: 'hue-rotate(90deg) saturate(1.1) brightness(1.02)'
  },
  peach_sunset: {
    id: 'peach_sunset',
    name: 'Peach Blossom Twilight',
    icon: '🌸',
    desc: 'Rona senja lembut merah muda peach yang menghadirkan kehangatan mendalam.',
    class: 'light-rosy',
    filter: 'hue-rotate(330deg) saturate(1.2) brightness(1.02)'
  }
};

// -----------------------------------------------------------------------------
// 4. INTERIOR INTERACTIONS (CAT ON SOFA & ACOUSTIC GUITAR)
// -----------------------------------------------------------------------------
export const CAT_INTERACTIONS = [
  'Kucing putih peri mendengkur pelan (purrr... ♡), meregangkan cakarnya yang lembut di sofa wisteria.',
  'Kucing membuka matanya sedikit dengan manik mata biru berkilau, menggesekkan pipinya ke tanganmu lalu tertidur kembali. ✨',
  'Zzz... (Kucing putih sedang bermimpi melompat menangkap kupu-kupu bersayap emas di taman bunga TO YOU). 🌸',
  'Kamu mengelus bulu putih halusnya yang sehangat sinar matahari pagi. Dengkuran tenangnya menghangatkan hatimu. 🐾',
  'Kucing putih memeluk bantal kupu-kupu ungunya lebih erat, bernapas teratur dalam lelap yang damai. 💜'
];

export const GUITAR_INTERACTIONS = [
  'Jari-jemarimu memetik senar gitar kayu... Alunan nada akustik yang hangat dan riang menggema lembut di seluruh gazebo. 🎸✨',
  'Dentingan akord merdu mengalun seperti melodi langkah peri yang menari di atas padang bunga musim semi. 🎶🌸',
  'Gitar kayu berhiaskan bunga wisteria memantulkan getaran nada yang menenangkan batin dan menyapa semilir angin sungai. 🎵☀️'
];

// -----------------------------------------------------------------------------
// 5. LALA GAZEBO QUOTES & PHILOSOPHY
// -----------------------------------------------------------------------------
export const LALA_HERO_QUOTE = '"A little closer, for a brighter tomorrow." — Lala ☼';

export const LALA_GAZEBO_DIALOGS = [
  'Cahaya matahari selalu terbit setiap pagi untuk mengingatkan kita bahwa harapan baru selalu ada. ☼',
  'Di gazebo ini, kamu boleh melepaskan semua bebanmu. Duduklah, nikmati teh hangatmu pelan-pelan ya ♡',
  'Kadang kita terlalu sibuk memikirkan orang lain hingga lupa memberi kehangatan pada diri kita sendiri. Hari ini, istirahatlah yang cukup.',
  'Terima kasih sudah datang ke Gazebo TO YOU. Kehadiranmu membuat taman bunga ini terasa berkali-kali lipat lebih indah! 🌸',
  'Dengarkan gemericik air sungai dan petikan gitar itu... Semoga damai senantiasa menyelimuti hatimu.'
];

// -----------------------------------------------------------------------------
// 6. TO YOU JURNAL KENANGAN — PHILOSOPHY & MOODS
// -----------------------------------------------------------------------------
export const TOYOU_JOURNAL_MOODS = [
  { id: 'sunshine', label: '☀️ Sinar Mentari', desc: 'Membawa kehangatan dan semangat baru menyongsong hari' },
  { id: 'caring', label: '💖 Ketulusan Kasih', desc: 'Peduli dan menyayangi orang-orang di sekitar dengan tulus' },
  { id: 'serenity', label: '🌸 Kedamaian Jiwa', desc: 'Menemukan ketenangan di tengah hiruk-pikuk kehidupan' },
  { id: 'self_love', label: '🌷 Menyayangi Diri', desc: 'Belajar memeluk diri sendiri dengan penuh kelembutan' },
  { id: 'fairy_dream', label: '✨ Impian Peri', desc: 'Merajut asa indah untuk hari esok yang lebih cerah' }
];

export const DEFAULT_LALA_MEMORIES = [
  {
    id: 'mem_toyou_1',
    title: 'Menyambut Mentari Pagi di Gazebo',
    note: 'Saat sinar matahari pertama menembus tirai sutra wisteria, aroma teh mawar madu menyapa hariku dengan kehangatan yang tak tergantikan.',
    tag: 'Kehangatan',
    sticker: '☀️',
    timestamp: Date.now() - 86400000 * 4,
    author: 'Lala'
  },
  {
    id: 'mem_toyou_2',
    title: 'Petikan Gitar & Dengkuran Kucing Putih',
    note: 'Memainkan melodi akustik sederhana sambil menemani kucing mungil tertidur di sofa ungu. Saat-saat sederhana yang begitu berharga.',
    tag: 'Kedamaian',
    sticker: '🎸',
    timestamp: Date.now() - 86400000 * 2,
    author: 'Lala'
  },
  {
    id: 'mem_toyou_3',
    title: 'Menikmati Teh Bersama Sahabat Tersayang',
    note: 'Tawa renyah, cerita dari hati ke hati, dan cangkir teh yang terus dihangatkan... Gazebo ini selalu menyambut siapa pun dengan tangan terbuka.',
    tag: 'Persahabatan',
    sticker: '🌹',
    timestamp: Date.now() - 86400000 * 1,
    author: 'Lala'
  }
];

export const DEFAULT_TOYOU_JOURNALS = [
  {
    id: 'toyou-journal-seed-1',
    title: 'Matahari yang Selalu Menghangatkan',
    mood: 'sunshine',
    content: 'Aku selalu ingin menjadi seseorang yang membawa kebahagiaan bagi orang lain, seperti matahari yang menyinari bumi tanpa meminta balasan. Tapi hari ini, duduk di gazebo ini sambil memandangi kastil kaca di seberang sungai, aku belajar bahwa aku pun berhak menerima kehangatan yang sama.',
    date: 'Pagi ini',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'toyou-journal-seed-2',
    title: 'Merawat Ketulusan di Setiap Langkah',
    mood: 'caring',
    content: 'Menyayangi orang lain dengan tulus adalah kekuatan terbesar kita. Terkadang dunia terasa melelahkan, tetapi secangkir teh mawar hangat dan semilir angin pagi di gazebo selalu berhasil mengembalikan senyuman dan kedamaian di dalam hatiku.',
    date: 'Kemarin',
    createdAt: Date.now() - 86400000
  }
];

// -----------------------------------------------------------------------------
// 7. QUIET MOMENT AMBIENT SOUNDSCAPES
// -----------------------------------------------------------------------------
export const TOYOU_AMBIENT_OPTIONS = [
  { id: 'breeze', icon: '🍃', title: 'Semilir Angin Hutan Peri', desc: 'Hembusan angin sejuk yang menyibak tirai sutra dan aroma bunga wisteria' },
  { id: 'river', icon: '🌊', title: 'Gemericik Sungai Jernih Pagi', desc: 'Aliran air sungai TO YOU yang menyegarkan dan menenangkan pikiran' },
  { id: 'birds', icon: '🐦', title: 'Kicau Burung Fajar', desc: 'Suara merdu kawanan burung fajar menyapa matahari terbit di atas kanopi pohon' },
  { id: 'chimes', icon: '🔔', title: 'Lonceng Kristal Peri', desc: 'Dentingan lembut kristal embun yang berdentang pelan ditiup angin sepoi' }
];

// -----------------------------------------------------------------------------
// 8. STORAGE MANAGEMENT
// -----------------------------------------------------------------------------
export function getToyouGazeboStorageKey(charKey = 'lala') {
  const normKey = normalizeCharacterKey(charKey);
  return `olu_toyou_gazebo_${normKey}`;
}

export function createDefaultToyouGazeboState(charKey = 'lala') {
  const normKey = normalizeCharacterKey(charKey);
  const isHost = (normKey === 'lala');
  return {
    characterId: normKey,
    currentTea: 'rose_honey',
    currentTreat: 'butterfly_cupcake',
    currentLight: 'morning_sun',
    teaBrewCount: isHost ? 6 : 1,
    catPetCount: isHost ? 10 : 1,
    soundscapeMode: 'none',
    musicVolume: 0.7,
    memories: isHost ? JSON.parse(JSON.stringify(DEFAULT_LALA_MEMORIES)) : [
      {
        id: `mem_toyou_guest_${Date.now()}`,
        title: `Kunjungan Hangat ke Gazebo Lala`,
        note: `Hari yang cerah bersantai di Gazebo Pagi TO YOU, menikmati teh mawar dan semilir angin sungai.`,
        tag: 'Kunjungan',
        sticker: '🌸',
        timestamp: Date.now(),
        author: normKey.toUpperCase()
      }
    ],
    journals: isHost ? JSON.parse(JSON.stringify(DEFAULT_TOYOU_JOURNALS)) : [
      {
        id: `toyou_journal_guest_${Date.now()}`,
        title: `Catatan Kunjungan di Gazebo Lala`,
        mood: 'serenity',
        content: `Pagi yang damai di gazebo Lala. Menikmati secangkir teh mawar hangat sambil mendengarkan petikan gitar akustik yang menyejukkan hati.`,
        date: 'Hari ini',
        createdAt: Date.now()
      }
    ],
    readingProgress: {},
    lastSavedTimestamp: Date.now()
  };
}

export function loadToyouGazeboState(charKey = 'lala') {
  const normKey = normalizeCharacterKey(charKey);
  try {
    const key = getToyouGazeboStorageKey(normKey);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = createDefaultToyouGazeboState(normKey);
      saveToyouGazeboState(initial, normKey);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.journals)) {
      parsed.journals = JSON.parse(JSON.stringify(DEFAULT_TOYOU_JOURNALS));
    }
    return parsed;
  } catch (err) {
    console.warn('[ToyouGazeboState] Error loading state from localStorage:', err);
    return createDefaultToyouGazeboState(normKey);
  }
}

export function saveToyouGazeboState(state, charKey = 'lala') {
  try {
    const normKey = normalizeCharacterKey(charKey || state?.characterId || 'lala');
    const key = getToyouGazeboStorageKey(normKey);
    state.lastSavedTimestamp = Date.now();
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.warn('[ToyouGazeboState] Error saving state to localStorage:', err);
  }
}

// -----------------------------------------------------------------------------
// 9. WEB AUDIO API SYNTHESIZER (ACOUSTIC STRUM & AMBIENT SOUNDS)
// -----------------------------------------------------------------------------
export function createToyouGazeboAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let activeAmbientSources = [];
  let isPlayingMusic = false;
  let currentAmbient = 'none';
  let melodyTimer = null;

  function initAudioContext() {
    if (!ctx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        ctx = new AudioCtxClass();
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // Play gentle acoustic guitar chord strum
  function playGuitarChord() {
    initAudioContext();
    if (!ctx) return;

    // A beautiful major 7th chord (D - F# - A - C# - E)
    const freqs = [146.83, 220.00, 293.66, 369.99, 440.00, 587.33];
    const now = ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 1.9);
    });
  }

  // Play Fairy Morning Melody (Acoustic Harp / Music Box sequence)
  function startMorningMelody(onNote) {
    initAudioContext();
    if (!ctx || isPlayingMusic) return;
    isPlayingMusic = true;

    // Melody notes in pentatonic scale
    const melody = [
      523.25, 587.33, 659.25, 783.99, 880.00,
      783.99, 659.25, 587.33, 659.25, 783.99,
      880.00, 1046.50, 880.00, 783.99, 659.25
    ];
    let noteIndex = 0;

    function playNextNote() {
      if (!isPlayingMusic || !ctx) return;
      const freq = melody[noteIndex % melody.length];
      noteIndex++;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 1.3);

      if (typeof onNote === 'function') onNote();

      melodyTimer = setTimeout(playNextNote, 650);
    }

    playNextNote();
  }

  function stopMorningMelody() {
    isPlayingMusic = false;
    if (melodyTimer) {
      clearTimeout(melodyTimer);
      melodyTimer = null;
    }
  }

  // Play procedural ambient soundscapes
  function setAmbientSoundscape(soundscapeId, volume = 0.6) {
    initAudioContext();
    stopAmbientSoundscapes();
    currentAmbient = soundscapeId;
    if (!ctx || soundscapeId === 'none') return;

    if (soundscapeId === 'breeze') {
      // Pink noise filtered breeze
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.08;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start();
      activeAmbientSources.push({ source: noise, gain });
    } else if (soundscapeId === 'river') {
      // Flowing water filter
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.07;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(2.5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.6, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start();
      activeAmbientSources.push({ source: noise, gain });
    } else if (soundscapeId === 'birds') {
      // Periodic chirps
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      gain.connect(masterGain);

      let birdInterval = setInterval(() => {
        if (!ctx || currentAmbient !== 'birds') {
          clearInterval(birdInterval);
          return;
        }
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const chirpGain = ctx.createGain();

        osc.type = 'sine';
        const startFreq = 2200 + Math.random() * 800;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq + 600, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(startFreq - 200, now + 0.16);

        chirpGain.gain.setValueAtTime(0.001, now);
        chirpGain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(chirpGain);
        chirpGain.connect(gain);

        osc.start(now);
        osc.stop(now + 0.2);
      }, 2200);

      activeAmbientSources.push({
        source: { stop: () => clearInterval(birdInterval) },
        gain
      });
    } else if (soundscapeId === 'chimes') {
      // Wind chimes
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      gain.connect(masterGain);

      const chimeFreqs = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00];

      let chimeInterval = setInterval(() => {
        if (!ctx || currentAmbient !== 'chimes') {
          clearInterval(chimeInterval);
          return;
        }
        const now = ctx.currentTime;
        const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
        const osc = ctx.createOscillator();
        const cGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        cGain.gain.setValueAtTime(0.001, now);
        cGain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
        cGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        osc.connect(cGain);
        cGain.connect(gain);

        osc.start(now);
        osc.stop(now + 2.1);
      }, 1500);

      activeAmbientSources.push({
        source: { stop: () => clearInterval(chimeInterval) },
        gain
      });
    }
  }

  function stopAmbientSoundscapes() {
    activeAmbientSources.forEach(s => {
      try {
        if (s.source && typeof s.source.stop === 'function') s.source.stop();
      } catch (_) {}
    });
    activeAmbientSources = [];
    currentAmbient = 'none';
  }

  function setMasterVolume(val) {
    if (masterGain && ctx) {
      masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), ctx.currentTime);
    }
  }

  return {
    initAudioContext,
    playGuitarChord,
    startMorningMelody,
    stopMorningMelody,
    setAmbientSoundscape,
    stopAmbientSoundscapes,
    setMasterVolume,
    isPlaying: () => isPlayingMusic,
    getCurrentAmbient: () => currentAmbient
  };
}
