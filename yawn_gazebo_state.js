/**
 * YAWN GAZEBO — ASTRAL OCEAN & MOONLIT SERENITY GAZEBO STATE & AUDIO ENGINE
 * Exclusive Sanctuary for Akhira ⚡ & Visitors in Universe YAWN
 * =============================================================================
 */

import { normalizeCharacterKey } from './universe_state.js';
import { safeLocalStorageSetItem } from './olu_indexeddb.js';

export const AKHIRA_CANONICAL_UID = 'MT14ZHATNqe90frAeQ74QFk4iXs2';
export const AKHIRA_CANONICAL_ID = 'akhira';

// -----------------------------------------------------------------------------
// 1. TEA & BIOLUMINESCENT REFRESHMENTS CATALOG
// -----------------------------------------------------------------------------
export const YAWN_TEAS = {
  pearl_tea: {
    id: 'pearl_tea',
    name: 'Bioluminescent Pearl Tea (Teh Mutiara Laut Dalam)',
    icon: '🦪',
    color: '#38bdf8',
    steamColor: 'rgba(56, 189, 248, 0.65)',
    aroma: 'Aroma segar lumut laut kristal & tetesan sari mutiara laut dalam',
    desc: 'Seduhan mutiara bercahaya biru laut yang dipetik dari terumbu karang astral. Memberikan kesegaran batin, ketenangan pikiran, dan keheningan yang menyejukkan.',
    effect: '🌊 Ketenangan Pikiran & Kesegaran Jiwa'
  },
  abyss_mint: {
    id: 'abyss_mint',
    name: 'Abyss Crystal Mint (Seduhan Mint Palung Laut)',
    icon: '🌿',
    color: '#2dd4bf',
    steamColor: 'rgba(45, 212, 191, 0.65)',
    aroma: 'Sensasi mint dingin menyegarkan & semilir angin laut malam',
    desc: 'Perpaduan daun mint kristal dengan alga bercahaya dari palung samudra terdalam. Membasuh segala kepenatan dan menjernihkan fokus.',
    effect: '✨ Kejernihan Batin & Kesejukan Sejati'
  },
  astral_lavender: {
    id: 'astral_lavender',
    name: 'Astral Wisteria Twilight (Teh Lavender & Wisteria Astral)',
    icon: '🪻',
    color: '#c084fc',
    steamColor: 'rgba(192, 132, 252, 0.65)',
    aroma: 'Harum manis kelopak wisteria ungu & bunga lavender malam',
    desc: 'Kelopak wisteria ungu yang menjuntai di kanopi gazebo dipadukan dengan lavender kosmik. Menghadirkan relaksasi mendalam untuk tidur yang lelap.',
    effect: '💜 Relaksasi Penuh & Istirahat Nyenyak'
  },
  coral_honey: {
    id: 'coral_honey',
    name: 'Golden Coral Nectar (Nektar Jeruk Karang Emas)',
    icon: '🍊',
    color: '#fbbf24',
    steamColor: 'rgba(251, 191, 36, 0.65)',
    aroma: 'Manis asam buah jeruk karang & madu sari anemon laut',
    desc: 'Seduhan jeruk karang keemasan berpadu madu anemon lembut. Menghangatkan dada dan memancarkan aura semangat hangat di bawah laut.',
    effect: '⚡ Percikan Energi Positif & Keceriaan'
  }
};

// -----------------------------------------------------------------------------
// 2. SWEET TREATS & PATISSERIE
// -----------------------------------------------------------------------------
export const YAWN_TREATS = {
  seashell_cupcake: {
    id: 'seashell_cupcake',
    name: 'Seashell Pearl Cupcakes',
    icon: '🧁',
    desc: 'Kue mangkuk lembut bertingkat dengan krim ungu pastel, hiasan kerang laut cokelat putih, dan mutiara gula berkilau.'
  },
  astral_popcorn: {
    id: 'astral_popcorn',
    name: 'Astral Sea Salt Popcorn',
    icon: '🍿',
    desc: 'Brondong jagung hangat dalam mangkuk kristal berhias kerang, bertabur garam laut kristal dan karamel mentega gurih.'
  },
  jellyfish_macaron: {
    id: 'jellyfish_macaron',
    name: 'Bioluminescent Jelly Macarons',
    icon: '🍬',
    desc: 'Macaron renyah manis dengan isian ganache blueberry dan pendar lavender halus yang berpendar di kegelapan.'
  }
};

// -----------------------------------------------------------------------------
// 3. LIGHTING ATMOSPHERES
// -----------------------------------------------------------------------------
export const YAWN_GAZEBO_LIGHTS = {
  deep_bioluminescence: {
    id: 'deep_bioluminescence',
    name: 'Deep Bioluminescence Cyan',
    icon: '🌊',
    desc: 'Pendar cyan biru laut dalam yang menenangkan dan menyelimuti seluruh ruangan.',
    class: 'light-cyan',
    filter: 'saturate(1.15) brightness(1.02)'
  },
  astral_violet: {
    id: 'astral_violet',
    name: 'Astral Wisteria Violet',
    icon: '💜',
    desc: 'Rona ungu wisteria kosmik yang magis, teduh, dan menghanyutkan.',
    class: 'light-violet',
    filter: 'hue-rotate(15deg) saturate(1.2) brightness(1.02)'
  },
  lunar_silver: {
    id: 'lunar_silver',
    name: 'Moonlit Ocean Radiance',
    icon: '🌕',
    desc: 'Kilau perak rembulan malam di atas permukaan samudra yang menembus kaca kubah.',
    class: 'light-silver',
    filter: 'contrast(1.06) saturate(0.95) brightness(1.08)'
  },
  twilight_abyss: {
    id: 'twilight_abyss',
    name: 'Midnight Abyss Glow',
    icon: '✨',
    desc: 'Nuansa malam samudra teduh berhiaskan titik-titik lentera ubur-ubur bercahaya redup.',
    class: 'light-midnight',
    filter: 'saturate(1.1) brightness(0.9)'
  }
};

// -----------------------------------------------------------------------------
// 4. ASTRAL CINEMA & MUSIC TRACKS
// -----------------------------------------------------------------------------
export const YAWN_CINEMA_TRACKS = [
  {
    id: 'astral_ocean',
    title: 'Astral Ocean Lullaby',
    duration: '03:45',
    desc: 'Alunan melodi laut dalam bertabur gemerlap rembulan dan desir ombak samudra kosmik.'
  },
  {
    id: 'starlight_current',
    title: 'Starlight Undersea Current',
    duration: '04:12',
    desc: 'Harmoni piano kristal dan dengungan lembut paus astral yang berenang di langit samudra.'
  },
  {
    id: 'moonlit_tide',
    title: 'Moonlit Tide & City Lights',
    duration: '03:28',
    desc: 'Suasana santai menatap kastil bawah air bercahaya sambil menikmati hangatnya teh mutiara.'
  }
];

// -----------------------------------------------------------------------------
// 5. INTERIOR INTERACTIONS (CAT, WHALE, CONTROLLER, TABLE, LAMPS)
// -----------------------------------------------------------------------------
export const CAT_AND_WHALE_INTERACTIONS = [
  'Kucing putih tertidur lelap di sofa ungu, mendengkur lembut (purrr... ♡) sambil memeluk bantal cangkang kerang.',
  'Boneka paus biru astral terasa sangat empuk! Sepertinya Akhira sering memeluk boneka ini saat maraton menonton film di gazebo. 🐋✨',
  'Kamu mengelus kepala kucing putih dengan lembut. Ekornya mengibas pelan penuh rasa nyaman tanpa membuka matanya. 🐾',
  'Zzz... Kucing mendesah tenang dalam mimpi tentang ikan-ikan bercahaya yang berenang di luar kaca kubah. 💤',
  'Di samping sofa empuk, boneka paus biru tersenyum riang menyapa kehadiranmu di suaka laut dalam Akhira. 🌊'
];

export const GAMING_INTERACTIONS = [
  'Kamu menyalakan stick controller nirkabel... Lampu LED cyan menyala dengan dengungan halus! Siap untuk sesi mabar santai bersama Akhira. 🎮⚡',
  'Headset gaming ungu di samping sofa memancarkan suara synthwave laut dalam yang sangat jernih dan imersif. 🎧✨',
  '"Mau main game petualangan samudra bareng? Tenang, aku bawa banyak camilan popcorn!" — Akhira 🍿👾',
  'Kombinasi sempurna: sofa sutra empuk, headset noise-cancelling, dan layar cinema raksasa yang menampilkan samudra malam. 🌌🎮'
];

export const TABLE_REFRESHMENTS_INTERACTIONS = [
  'Mangkuk popcorn bertabur garam laut kristal masih terasa hangat dan renyah. Aroma menteganya begitu menggoda! 🍿✨',
  'Menara cupcake tingkat menyajikan kue manis berhiaskan kerang gula dan krim pastel mutiara. Begitu cantik dan lezat! 🧁🦪',
  'Gelas kristal berisi ramuan buah ungu bercahaya mengeluarkan letupan gelembung halus yang menyejukkan. 🫧💜'
];

export const JELLYFISH_INTERACTIONS = [
  'Lentera ubur-ubur kristal di sudut meja berdenyut lembut, memancarkan pendar bioluminesen biru-cyan yang meneduhkan ruangan. 🪼✨',
  'Ubur-ubur bercahaya di dalam bola kaca di rak buku melayang perlahan, memantulkan bayangan kristal ke langit-langit gazebo. 🔮🌊',
  'Lentera wisteria di kanopi rotunda berayun lembut ditiup semilir angin laut sejuk. Cahayanya menghangatkan suasana. 🕯️'
];

// -----------------------------------------------------------------------------
// 6. AKHIRA GAZEBO PHILOSOPHY & DIALOGS
// -----------------------------------------------------------------------------
export const AKHIRA_HERO_QUOTE = '"Di kedalaman samudra yang tenang, biarkan pikiran beristirahat dan mimpi melayang bebas bersama paus astral." — Akhira ⚡';

export const AKHIRA_GAZEBO_DIALOGS = [
  'Selamat datang di Gazebo YAWN. Di sini waktu berjalan lebih pelan, ombak menenangkan setiap riak kecemasan. ⚡',
  'Tarik napas dalam-dalam... rasakan ketenangan samudra biru ini. Kamu sudah berjuang hebat hari ini. 🌊',
  'Mau nonton film di layar besar, dengerin musik paus astral, atau sekadar rebahan di sofa empuk? Semuanya bebas di sini! 🍿🎬',
  'Kucing putih dan paus plushie ini selalu senang ditemani. Duduklah di samping mereka ya ♡',
  'Lampu ubur-ubur dan lentera wisteria ini menyala khusus untuk menemani malam damaimu.'
];

// -----------------------------------------------------------------------------
// 7. YAWN JURNAL KENANGAN — PHILOSOPHY & MOODS
// -----------------------------------------------------------------------------
export const YAWN_JOURNAL_MOODS = [
  { id: 'calm_abyss', label: '🌊 Samudra Tenang', desc: 'Menemukan kedamaian di kedalaman hati tanpa riak gelombang' },
  { id: 'lightning_spark', label: '⚡ Percikan Inspirasi', desc: 'Kilatan ide segar dan antusiasme membara untuk melangkah maju' },
  { id: 'astral_dream', label: '🐋 Impian Paus', desc: 'Imajinasi melayang bebas di bentangan samudra kosmik tanpa batas' },
  { id: 'cozy_night', label: '🍿 Rehat Santai', desc: 'Menikmati malam santai bersama game, film favorit, dan camilan hangat' },
  { id: 'friendship_tide', label: '🫧 Arus Sahabat', desc: 'Rasa syukur atas kehadiran sahabat yang selalu ada di setiap musim' }
];

export const DEFAULT_AKHIRA_MEMORIES = [
  {
    id: 'mem_yawn_1',
    title: 'Menatap Paus Astral Melintas di Langit Samudra',
    note: 'Duduk di sofa gazebo malam ini sambil menonton kawanan paus astral berenang anggun di atas kubah kaca. Rasanya seluruh kepenatan dunia sirna seketika.',
    tag: 'Keheningan',
    sticker: '🐋',
    timestamp: Date.now() - 86400000 * 4,
    author: 'Akhira'
  },
  {
    id: 'mem_yawn_2',
    title: 'Maraton Film & Mangkuk Popcorn Hangat',
    note: 'Menyalakan layar cinema raksasa dengan alunan lagu Astral Ocean, ditemani secangkir teh mutiara biru dan kucing putih yang mendengkur pulas di sebelahku.',
    tag: 'Kenyamanan',
    sticker: '🍿',
    timestamp: Date.now() - 86400000 * 2,
    author: 'Akhira'
  },
  {
    id: 'mem_yawn_3',
    title: 'Percikan Petir yang Menjadi Lentera Tenang',
    note: 'Banyak yang mengira petir selalu riuh dan mengejutkan, tapi di suaka bawah laut ini, kilatan energinya berubah menjadi cahaya lentera yang menjaga malam tetap hangat.',
    tag: 'Inspirasi',
    sticker: '⚡',
    timestamp: Date.now() - 86400000 * 1,
    author: 'Akhira'
  }
];

export const DEFAULT_YAWN_JOURNALS = [
  {
    id: 'yawn-journal-seed-1',
    title: 'Ketenangan di Bawah Permukaan Gelombang',
    mood: 'calm_abyss',
    content: 'Terkadang dunia di permukaan bergerak terlalu cepat dan penuh kebisingan. Namun saat turun ke gazebo bawah laut ini, memandangi kastil kristal yang berpendar lembut di kejauhan, aku kembali menemukan ruang bernapas. Hati ini seperti samudra dalam: di atas mungkin ada ombak, namun di dasarnya selalu tersimpan kedamaian abadi.',
    date: 'Malam ini',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'yawn-journal-seed-2',
    title: 'Menikmati Hal-Hal Sederhana yang Berarti',
    mood: 'cozy_night',
    content: 'Secangkir teh mutiara hangat, suara dengkuran kucing di sofa beludru, dan aroma manis popcorn... Kebahagiaan sejati sering kali berada pada momen-momen tenang seperti ini. Terima kasih untuk suaka kecil ini yang selalu siap menyambut siapa pun yang butuh jeda sejenak.',
    date: 'Kemarin malam',
    createdAt: Date.now() - 86400000
  }
];

// -----------------------------------------------------------------------------
// 8. QUIET MOMENT AMBIENT SOUNDSCAPES
// -----------------------------------------------------------------------------
export const YAWN_AMBIENT_OPTIONS = [
  { id: 'ocean_waves', icon: '🌊', title: 'Desir Arus Samudra Dalam', desc: 'Irama arus bawah laut yang mengalun ritmis, menyejukkan saraf yang lelah' },
  { id: 'whale_song', icon: '🐋', title: 'Gema Paus Astral', desc: 'Dengungan frekuensi rendah nan merdu kawanan paus kosmik di kejauhan' },
  { id: 'crystal_chimes', icon: '🔔', title: 'Lonceng Kristal Bawah Air', desc: 'Dentingan jernih kristal air laut yang bergema lembut menenangkan pikiran' },
  { id: 'bioluminescent_bubble', icon: '🫧', title: 'Letupan Gelembung Bioluminesen', desc: 'Gemericik letupan gelembung udara bercahaya yang naik ke permukaan kubah' }
];

// -----------------------------------------------------------------------------
// 9. STORAGE MANAGEMENT (INDEXEDDB & PARTITIONED LOCALSTORAGE)
// -----------------------------------------------------------------------------
export function getYawnGazeboStorageKey(charKey = 'akhira') {
  const normKey = normalizeCharacterKey(charKey);
  return `olu_yawn_gazebo_${normKey}`;
}

export function createDefaultYawnGazeboState(charKey = 'akhira') {
  const normKey = normalizeCharacterKey(charKey);
  const isHost = (normKey === 'akhira');
  return {
    characterId: normKey,
    currentTea: 'pearl_tea',
    currentTreat: 'astral_popcorn',
    currentLight: 'deep_bioluminescence',
    currentTrack: 'astral_ocean',
    teaBrewCount: isHost ? 8 : 1,
    catPetCount: isHost ? 15 : 1,
    gamePlayedCount: isHost ? 12 : 1,
    soundscapeMode: 'none',
    musicVolume: 0.7,
    memories: isHost ? JSON.parse(JSON.stringify(DEFAULT_AKHIRA_MEMORIES)) : [
      {
        id: `mem_yawn_guest_${Date.now()}`,
        title: `Kunjungan Damai ke Gazebo Akhira`,
        note: `Bersantai di Gazebo Bawah Laut YAWN, menikmati teh mutiara biru sambil menatap paus astral melintas di langit samudra.`,
        tag: 'Kunjungan',
        sticker: '⚡',
        timestamp: Date.now(),
        author: normKey.toUpperCase()
      }
    ],
    journals: isHost ? JSON.parse(JSON.stringify(DEFAULT_YAWN_JOURNALS)) : [
      {
        id: `yawn_journal_guest_${Date.now()}`,
        title: `Catatan Kunjungan di Gazebo YAWN`,
        mood: 'calm_abyss',
        content: `Malam yang luar biasa tenang di Gazebo Akhira. Suasana biru laut dan pendar ubur-ubur membuat seluruh pikiran kembali segar dan damai.`,
        date: 'Hari ini',
        createdAt: Date.now()
      }
    ],
    readingProgress: {},
    lastSavedTimestamp: Date.now()
  };
}

export function loadYawnGazeboState(charKey = 'akhira') {
  const normKey = normalizeCharacterKey(charKey);
  try {
    const key = getYawnGazeboStorageKey(normKey);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = createDefaultYawnGazeboState(normKey);
      saveYawnGazeboState(initial, normKey);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.journals)) {
      parsed.journals = JSON.parse(JSON.stringify(DEFAULT_YAWN_JOURNALS));
    }
    if (!Array.isArray(parsed.memories)) {
      parsed.memories = JSON.parse(JSON.stringify(DEFAULT_AKHIRA_MEMORIES));
    }
    return parsed;
  } catch (err) {
    console.warn('[YawnGazeboState] Error loading state:', err);
    return createDefaultYawnGazeboState(normKey);
  }
}

export function saveYawnGazeboState(state, charKey = 'akhira') {
  try {
    const normKey = normalizeCharacterKey(charKey || state?.characterId || 'akhira');
    const key = getYawnGazeboStorageKey(normKey);
    state.lastSavedTimestamp = Date.now();
    safeLocalStorageSetItem(key, JSON.stringify(state));
  } catch (err) {
    console.warn('[YawnGazeboState] Error saving state:', err);
  }
}

// -----------------------------------------------------------------------------
// 10. WEB AUDIO API SYNTHESIZER (CINEMA MUSIC, AMBIENT & SOUND EFFECTS)
// -----------------------------------------------------------------------------
export function createYawnGazeboAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let activeAmbientSources = [];
  let isPlayingMusic = false;
  let currentAmbient = 'none';
  let melodyTimer = null;
  let volume = 0.7;

  function initAudioContext() {
    if (!ctx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        ctx = new AudioCtxClass();
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(volume, ctx.currentTime);
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function setVolume(val) {
    volume = Math.max(0, Math.min(1, val));
    if (masterGain && ctx) {
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    }
  }

  function getVolume() {
    return volume;
  }

  /**
   * Sound effect: Gamepad arcade chime (cyber retro electronic arpeggio)
   */
  function playArcadeChime() {
    initAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25 * volume, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  /**
   * Sound effect: Water bubble pop (warm resonant tone)
   */
  function playBubblePop() {
    initAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.12);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Sound effect: Crystal ocean chime (for tea brewing & lanterns)
   */
  function playOceanChime() {
    initAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.2 * volume, now + idx * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.85);
    });
  }

  /**
   * Sound effect: Gentle purr & meow tone (for cat petting)
   */
  function playCatPurrTone() {
    initAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.15);
    osc.frequency.linearRampToValueAtTime(120, now + 0.35);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.1);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Ambient Soundscape Synthesizer
   */
  function stopAmbient() {
    activeAmbientSources.forEach(src => {
      try {
        if (src.stop) src.stop();
        if (src.disconnect) src.disconnect();
      } catch (e) {
        // ignore
      }
    });
    activeAmbientSources = [];
    currentAmbient = 'none';
  }

  function setAmbientSoundscape(soundType) {
    initAudioContext();
    stopAmbient();
    if (!ctx || !soundType || soundType === 'none') {
      currentAmbient = 'none';
      return;
    }

    currentAmbient = soundType;

    if (soundType === 'ocean_waves') {
      // Soft wave noise generator via filtered pink noise
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.12;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18 * volume, ctx.currentTime);

      // LFO for wave ebb & flow
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec ocean wave period
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start();
      lfo.start();
      activeAmbientSources.push(noise, lfo, gain, filter);
    } else if (soundType === 'whale_song') {
      // Deep resonant whale synth melody
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      lfoGain.gain.setValueAtTime(45, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.12 * volume, ctx.currentTime);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      lfo.start();
      activeAmbientSources.push(osc, lfo, gain);
    } else if (soundType === 'crystal_chimes') {
      // Delicate rhythmic high frequency chimes
      const chimeInterval = setInterval(() => {
        if (currentAmbient !== 'crystal_chimes' || !ctx) {
          clearInterval(chimeInterval);
          return;
        }
        const freqs = [659.25, 783.99, 987.77, 1174.66, 1318.51];
        const freq = freqs[Math.floor(Math.random() * freqs.length)];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08 * volume, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.85);
      }, 1600);
      activeAmbientSources.push({ stop: () => clearInterval(chimeInterval) });
    } else if (soundType === 'bioluminescent_bubble') {
      // Intermittent gentle bubble pops
      const bubbleInterval = setInterval(() => {
        if (currentAmbient !== 'bioluminescent_bubble' || !ctx) {
          clearInterval(bubbleInterval);
          return;
        }
        playBubblePop();
      }, 1200);
      activeAmbientSources.push({ stop: () => clearInterval(bubbleInterval) });
    }
  }

  function getCurrentAmbient() {
    return currentAmbient;
  }

  /**
   * Cinema Screen & Ambient Music Loop (Ocean Chillout Melody)
   */
  function startCinemaMelody() {
    initAudioContext();
    if (!ctx) return;
    stopCinemaMelody();
    isPlayingMusic = true;

    // Harmonic progression in F-Major / D-Minor Pentatonic (F, G, A, C, D)
    const melodyNotes = [
      { f: 349.23, d: 0.8 }, // F4
      { f: 392.00, d: 0.6 }, // G4
      { f: 440.00, d: 1.2 }, // A4
      { f: 523.25, d: 0.9 }, // C5
      { f: 587.33, d: 1.5 }, // D5
      { f: 440.00, d: 0.8 }, // A4
      { f: 392.00, d: 1.0 }, // G4
      { f: 349.23, d: 1.6 }  // F4
    ];

    let noteIdx = 0;
    function playNextMelodyNote() {
      if (!isPlayingMusic || !ctx) return;
      const note = melodyNotes[noteIdx];
      noteIdx = (noteIdx + 1) % melodyNotes.length;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12 * volume, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.d);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + note.d + 0.05);

      melodyTimer = setTimeout(playNextMelodyNote, note.d * 950);
    }

    playNextMelodyNote();
  }

  function stopCinemaMelody() {
    isPlayingMusic = false;
    if (melodyTimer) {
      clearTimeout(melodyTimer);
      melodyTimer = null;
    }
  }

  function isMusicPlaying() {
    return isPlayingMusic;
  }

  return {
    initAudioContext,
    setVolume,
    getVolume,
    playArcadeChime,
    playBubblePop,
    playOceanChime,
    playCatPurrTone,
    setAmbientSoundscape,
    getCurrentAmbient,
    stopAmbient,
    startCinemaMelody,
    stopCinemaMelody,
    isMusicPlaying
  };
}
