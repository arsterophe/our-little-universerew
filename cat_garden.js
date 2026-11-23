/**
 * ============================================================================
 * CAT CARE SIMULATOR — SYMA'S PINWHEEL SANCTUARY
 * ============================================================================
 * A complete, interactive pet care simulator for Syma's Universe (PINWHEEL).
 * 
 * Features:
 * - 10 unique cats with individual breeds, colors, personalities, dialogues.
 * - Progressive unlock: 1 baby kitten initially; subsequent cats unlock only
 *   after the current cat reaches ADULT CAT stage.
 * - Custom naming ceremony for every kitten.
 * - 4 Growth Stages: BABY KITTEN -> LITTLE KITTEN -> GROWING CAT -> ADULT CAT.
 * - 8 Care Activities: FEED, DRINK, BATH, BRUSH, PLAY, PET, SLEEP, CLEAN.
 * - 6 Needs Meters: Hunger, Thirst, Energy, Happiness, Cleanliness, Affection.
 * - Interactive Cat Garden Sanctuary with animated canvas, dynamic reactions,
 *   wandering adult resident cats, speech bubbles, and particles.
 * - Profile & Memory Album persistent timeline (adoption, growth, graduation).
 * - 10-slot Cat Collection view (Locked, Active, Completed).
 * - Daily Care checklist routines.
 * - UID-bound persistence in localStorage with Syma canonical UID fallback.
 */

// Canonical Syma UID
export const SYMA_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';

// 10 Unique Cat Definitions
export const CAT_ROSTER_DEFS = [
  {
    id: 1,
    breedName: 'White Kitsune Sacred Kitten',
    localBreed: 'Kucing Siluman Rubah Putih Suci',
    defaultSuggestedName: 'Bubu',
    furTheme: 'Snow White & Lavender Frost',
    icon: '🐱',
    colorHex: '#ffffff',
    accentHex: '#d8b4fe',
    eyeColor: '#a855f7',
    personality: 'Manja & Penuh Kasih (Gentle & Cuddly)',
    personalityDesc: 'Sangat menyukai usapan lembut di dagu, selalu mengikuti ke mana pun Syma melangkah, dan mendengkur merdu saat diajak bercerita.',
    favoriteActivity: 'pet',
    favoriteToy: 'Bantal Sutra Lavender ☁️',
    favoriteFood: 'Ikan Karper Perak Bulan 🌙',
    dialogue: {
      hungry: 'Meww... perut mungilku berbunyi lapar nyaa~ 🐟',
      thirsty: 'Nyan... tenggorokan haus, butuh air embun sejuk 💧',
      sleepy: 'Hoaaamm... mata mengantuk, ingin tidur di pangkuanmu 💤',
      dirty: 'Meoww... bulu putihku berdebu, tolong sisir aku ✨',
      happy: 'Purrr... aku sangat bahagia berada di sampingmu, Syma! 💖',
      idle: 'Mew~ mengeong manja sambil mengibaskan ekor berbulu lebat 🌸'
    }
  },
  {
    id: 2,
    breedName: 'Celestial Russian Blue',
    localBreed: 'Kucing Biru Langit Malam',
    defaultSuggestedName: 'Mochi',
    furTheme: 'Slate Blue & Star Silver',
    icon: '🐾',
    colorHex: '#94a3b8',
    accentHex: '#38bdf8',
    eyeColor: '#f59e0b',
    personality: 'Rasa Ingin Tahu Tinggi (Curious Explorer)',
    personalityDesc: 'Suka mengejar bayangan kelopak sakura dan melompat lincah dari batu ke batu di sekitar kolam air terjun.',
    favoriteActivity: 'play',
    favoriteToy: 'Bola Benang Bintang 🧶',
    favoriteFood: 'Guppy Cahaya Bintang 🌟',
    dialogue: {
      hungry: 'Mrrr? Apa ada camilan lezat untuk penjelajah cilik? 🍗',
      thirsty: 'Meow, segelas air kristal akan memulihkan energiku! 💧',
      sleepy: 'Zzz... mimpi memanjat kubah observatorium langit... 🌙',
      dirty: 'Ayo mandikan aku agar bulu keperakanku berkilau! 🛁',
      happy: 'Nya-ha! Melompat tangkas menangkap kincir angin! ⚡',
      idle: 'Telinga berputar mendengarkan gemerisik semilir angin PINWHEEL.'
    }
  },
  {
    id: 3,
    breedName: 'Calico Sakura Blossom',
    localBreed: 'Kucing Belang Tiga Kelopak',
    defaultSuggestedName: 'Nori',
    furTheme: 'Peach, Cream & Midnight Ink',
    icon: '🌸',
    colorHex: '#fed7aa',
    accentHex: '#fb7185',
    eyeColor: '#10b981',
    personality: 'Ceria & Rakus Camilan (Cheerful Foodie)',
    personalityDesc: 'Matanya selalu berbinar setiap kali Syma membawa mangkuk makanan. Kucing paling ekspresif saat makan!',
    favoriteActivity: 'feed',
    favoriteToy: 'Ikan Kayu Bergoyang 🐟',
    favoriteFood: 'Ikan Koi Emas Berkilau ✨',
    dialogue: {
      hungry: 'MEOOOW! Aromanya sangat wangi, cepat beri aku makan! 🐟😋',
      thirsty: 'Segar sekali airnya! Slurp slurp~ 💧',
      sleepy: 'Kekenyangan... ingin rebahan santai di dekat jembatan 😴',
      dirty: 'Sisir bulu tiga warnaku ya, biar wangi bunga sakura 🌸',
      happy: 'Purrrr nom nom! Kamu koki terbaik di seluruh semesta! 💕',
      idle: 'Duduk manis menjilati cakarnya yang belang menggemaskan.'
    }
  },
  {
    id: 4,
    breedName: 'Midnight Obsidian Panther',
    localBreed: 'Kucing Hitam Bertabur Bintang',
    defaultSuggestedName: 'Kuro',
    furTheme: 'Obsidian Velvet & Purple Star Dust',
    icon: '🌙',
    colorHex: '#1e1b4b',
    accentHex: '#c084fc',
    eyeColor: '#e2e8f0',
    personality: 'Pemalu Namun Setia (Mysterious & Shy)',
    personalityDesc: 'Awalnya sering bersembunyi di balik rumpun hydrangea, namun jika sudah dekat, dia akan selalu menjaga Syma di malam hari.',
    favoriteActivity: 'pet',
    favoriteToy: 'Lonceng Angin Mini 🎐',
    favoriteFood: 'Ikan Sisik Naga Violet 💜',
    dialogue: {
      hungry: 'Mew... mendekat perlahan mencium aroma makanannya 🐾',
      thirsty: 'Menyeruput air dari wadah kristal dengan anggun 💧',
      sleepy: 'Malam tiba... waktunya berjaga lalu tidur lelap 🌌',
      dirty: 'Bulu hitamku butuh disisir agar debu malam hilang ✨',
      happy: 'Menempelkan pipi hangatnya ke tangan Syma dengan tulus 🤍',
      idle: 'Duduk anggun dengan mata perak berkilau menatap bulan sabit.'
    }
  },
  {
    id: 5,
    breedName: 'Golden Sunrise Tabby',
    localBreed: 'Kucing Belang Emas Fajar',
    defaultSuggestedName: 'Tora',
    furTheme: 'Honey Gold & Warm Amber Stripes',
    icon: '☀️',
    colorHex: '#f59e0b',
    accentHex: '#fef3c7',
    eyeColor: '#d97706',
    personality: 'Pemberani & Penuh Semangat (Brave Acrobat)',
    personalityDesc: 'Kucing pemberani yang suka bertengger di atas atap gazebo untuk menyapa burung-burung surgawi.',
    favoriteActivity: 'play',
    favoriteToy: 'Tongkat Bulu Phoenix 🪶',
    favoriteFood: 'Karper Panggang Madu 🍯',
    dialogue: {
      hungry: 'Semangat butuh bahan bakar! Makanan mana makanan? 🍖🔥',
      thirsty: 'Glek glek glek! Air segar penambah stamina! 💦',
      sleepy: 'Bahkan pendekar butuh tidur siang sejenak... zzz 💤',
      dirty: 'Bulu emas ini harus selalu bersih mengilap! 🪮',
      happy: 'Nyaa-ha! Hari ini penuh petualangan seru bersama Syma! 🏆',
      idle: 'Menggeliat lincah dan meregangkan cakar emasnya.'
    }
  },
  {
    id: 6,
    breedName: 'Cloud Fluff Ragdoll',
    localBreed: 'Kucing Awan Berbulu Lebat',
    defaultSuggestedName: 'Lili',
    furTheme: 'Creamy Pearl & Lilac Frosting',
    icon: '👑',
    colorHex: '#f8fafc',
    accentHex: '#c084fc',
    eyeColor: '#0284c7',
    personality: 'Anggun & Manja Kerajaan (Regal Princess)',
    personalityDesc: 'Bulu tebal seperti awan halus. Sangat menyukai perawatan mandi busa sakura dan sisiran rambut mewah.',
    favoriteActivity: 'brush',
    favoriteToy: 'Pita Sutra Berkerincing 🎀',
    favoriteFood: 'Puding Ikan Susu Embun 🍮',
    dialogue: {
      hungry: 'Mew~ tolong sajikan hidangan terbaik untukku, ya 🌸',
      thirsty: 'Air mineral pegunungan PINWHEEL sangat berkelas 💧',
      sleepy: 'Tidur anggun di atas bantal beludru ungu... Zzz 👑',
      dirty: 'Ah, tolong sisir bulu awanku agar kembali mengembang sempurna! ✨',
      happy: 'Prrr-nya~ perlakuan Syma sungguh bak ratu istana! 💖',
      idle: 'Membungkuk anggun dan mengedipkan mata birunya yang memesona.'
    }
  },
  {
    id: 7,
    breedName: 'Scottish Fold Lavender Mist',
    localBreed: 'Kucing Telinga Lipat Embun',
    defaultSuggestedName: 'Choko',
    furTheme: 'Lavender Mist & Soft Charcoal',
    icon: '☁️',
    colorHex: '#cbd5e1',
    accentHex: '#a855f7',
    eyeColor: '#e11d48',
    personality: 'Pecinta Kenyamanan (Cozy Sleepyhead)',
    personalityDesc: 'Telinganya yang terlipat membuatnya terlihat sangat imut. Hobi utamanya adalah tidur bergulung seperti bola salju.',
    favoriteActivity: 'sleep',
    favoriteToy: 'Selimut Rajut Hangat 🧶',
    favoriteFood: 'Biskuit Ikan Bentuk Bulan 🌙',
    dialogue: {
      hungry: 'Meww... makan sedikit lalu lanjut bobo yaa~ 😴',
      thirsty: 'Minum pelan-pelan sambil menutup mata... 💧',
      sleepy: 'Zzzz... suara angin PINWHEEL seperti lagu pengantar tidur terindah 💤',
      dirty: 'Dibersihkan sambil setengah tertidur... purrr ✨',
      happy: 'Hangat dan nyaman... terima kasih sudah merawatku Syma 🤍',
      idle: 'Tertidur pulas dengan nafas berirama lembut.'
    }
  },
  {
    id: 8,
    breedName: 'Pinwheel Breeze Persian',
    localBreed: 'Kucing Angin Semilir',
    defaultSuggestedName: 'Fuyu',
    furTheme: 'Frost White & Cyan Whispers',
    icon: '🎐',
    colorHex: '#e2e8f0',
    accentHex: '#67e8f9',
    eyeColor: '#06b6d4',
    personality: 'Usil & Suka Bercanda (Playful Prankster)',
    personalityDesc: 'Suka bersembunyi di balik semak kincir angin lalu tiba-tiba melompat keluar dengan lucu untuk mengejutkan Syma.',
    favoriteActivity: 'play',
    favoriteToy: 'Kincir Angin Mini Berputar 🎐',
    favoriteFood: 'Keripik Rumput Laut Danau 🌿',
    dialogue: {
      hungry: 'Haha! Kalau mau beri makan, tebak dulu aku di mana! 🐾',
      thirsty: 'Main cipratan air di mangkuk sebelum diminum! 💦',
      sleepy: 'Pura-pura tidur... eh ketiduran beneran... zzz 😴',
      dirty: 'Kena debu bunga sakura waktu sembunyi tadi, tolong lap ya! ✨',
      happy: 'Tertawa riang mengejar semilir angin bersama Syma! 🌀',
      idle: 'Mengintip dari balik pot tanaman dengan ekor berkedut jenaka.'
    }
  },
  {
    id: 9,
    breedName: 'Sakura Tuxedo Dapper',
    localBreed: 'Kucing Tuksedo Berbunga',
    defaultSuggestedName: 'Leo',
    furTheme: 'Midnight Charcoal & Pure White Chest',
    icon: '🐾',
    colorHex: '#0f172a',
    accentHex: '#f43f5e',
    eyeColor: '#eab308',
    personality: 'Ksatria Pelindung (Gentle Guardian)',
    personalityDesc: 'Selalu bersikap tenang, sabar, dan bertindak sebagai kakak pelindung bagi anak-anak kucing lainnya di taman.',
    favoriteActivity: 'brush',
    favoriteToy: 'Pedang Kayu Mainan ⚔️',
    favoriteFood: 'Sup Ikan Herbal Segar 🍲',
    dialogue: {
      hungry: 'Terima kasih atas hidangan bergizinya, Syma 🐟',
      thirsty: 'Air segar membasahi dahaga ksatria pelindung 💧',
      sleepy: 'Aku akan tidur dekat pintu masuk untuk menjaga kalian 🛡️',
      dirty: 'Tuksedo ini harus tetap rapi dan bersih tanpa noda ✨',
      happy: 'Suatu kehormatan bisa hidup damai di taman sucimu 🌸',
      idle: 'Duduk tegap dengan dada bidang berbulu putih bersinar.'
    }
  },
  {
    id: 10,
    breedName: 'Starlight Nine-Tailed Cosmic Guardian',
    localBreed: 'Kucing Suci Bintang Ekor Sembilan',
    defaultSuggestedName: 'Kitsune',
    furTheme: 'Ethereal Aurora Lilac & Radiant Gold Halo',
    icon: '✨',
    colorHex: '#fae8ff',
    accentHex: '#fbbf24',
    eyeColor: '#8b5cf6',
    personality: 'Agung & Sakral (Divine Celestial Legend)',
    personalityDesc: 'Kucing mistis puncak peradaban The Nine Tailed Sanctuary. Memiliki sembilan ekor cahaya lembut dan membawa berkah abadi bagi Syma.',
    favoriteActivity: 'all',
    favoriteToy: 'Bola Kristal Kosmik Berpendar 🔮',
    favoriteFood: 'Nektar Bunga Bintang Abadi 🌸',
    dialogue: {
      hungry: 'Cahaya kosmik menyatu dengan santapan penuh cinta... ✨🐟',
      thirsty: 'Tetesan embun bintang melimpahkan kedamaian semesta 💧',
      sleepy: 'Bermeditasi di atas awan lavender di bawah lindungan bulan 🌌',
      dirty: 'Cahaya aura membersihkan segala debu duniawi... berkerlip emas ✨',
      happy: 'Ikatan kita telah mencapai tak terhingga, Syma. Terima kasih atas ketulusanmu 💖🌟',
      idle: 'Mengambang pelan dengan sembilan ekor cahaya bergoyang anggun.'
    }
  }
];

// Growth Stages Configuration
export const GROWTH_STAGES = [
  { stage: 1, name: 'BABY KITTEN', badge: '🍼', label: 'Bayi Kucing', expThreshold: 100, scale: 0.72 },
  { stage: 2, name: 'LITTLE KITTEN', badge: '🐾', label: 'Anak Kucing', expThreshold: 250, scale: 0.88 },
  { stage: 3, name: 'GROWING CAT', badge: '🌸', label: 'Kucing Remaja', expThreshold: 450, scale: 1.05 },
  { stage: 4, name: 'ADULT CAT', badge: '👑', label: 'Kucing Dewasa', expThreshold: 450, scale: 1.25 }
];

export function getStorageKey(uid) {
  return `olu_catcare_v1_${uid || SYMA_UID}`;
}

/**
 * Creates default initial state: Only Cat #1 is unlocked; Cat #2-#10 are locked.
 */
export function createDefaultState() {
  const cats = CAT_ROSTER_DEFS.map((def, idx) => {
    return {
      id: def.id,
      unlocked: idx === 0, // only the first cat is unlocked initially
      name: '', // Must be set by Syma in naming ceremony
      stage: 1, // 1: Baby, 2: Little, 3: Growing, 4: Adult
      growthExp: 0,
      needs: {
        hunger: 80,
        thirst: 85,
        energy: 90,
        happiness: 85,
        cleanliness: 90,
        affection: 65
      },
      adoptedAt: null,
      memories: [],
      careCount: 0
    };
  });

  return {
    activeCatId: 1,
    cats,
    dailyQuests: {
      date: new Date().toDateString(),
      feed: 0,
      play: 0,
      brush: 0,
      pet: 0,
      claimed: false
    },
    version: 1
  };
}

/**
 * Load state from localStorage with fallback
 */
export function loadCatCareState(uid) {
  try {
    const raw = localStorage.getItem(getStorageKey(uid));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.cats) && parsed.cats.length === 10) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load cat care state, generating defaults:', e);
  }
  return createDefaultState();
}

/**
 * Save state to localStorage
 */
export function saveCatCareState(state, uid) {
  try {
    localStorage.setItem(getStorageKey(uid), JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save cat care state:', e);
  }
}

/**
 * Helper to compute stage details from growthExp
 */
export function getCatGrowthStage(growthExp) {
  if (growthExp >= 450) return GROWTH_STAGES[3]; // ADULT
  if (growthExp >= 250) return GROWTH_STAGES[2]; // GROWING
  if (growthExp >= 100) return GROWTH_STAGES[1]; // LITTLE
  return GROWTH_STAGES[0]; // BABY
}

/**
 * Initialize and Controller for Cat Care Simulator
 */
export function initCatGardenController(options = {}) {
  const {
    onShowToast,
    onTriggerSparkle,
    getAudioCtx,
    activeUid = SYMA_UID
  } = options;

  let state = loadCatCareState(activeUid);
  let audioCtx = null;
  let activeTab = 'care'; // 'care', 'profile', 'collection', 'daily'
  let isActionPlaying = false;

  function playSynth(freq, duration = 0.4, type = 'sine', gainVal = 0.12) {
    try {
      if (!audioCtx) {
        audioCtx = getAudioCtx ? getAudioCtx() : new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function playFanfare() {
    playSynth(523.25, 0.25, 'sine', 0.15); // C5
    setTimeout(() => playSynth(659.25, 0.25, 'sine', 0.15), 120); // E5
    setTimeout(() => playSynth(783.99, 0.35, 'triangle', 0.18), 240); // G5
    setTimeout(() => playSynth(1046.5, 0.55, 'triangle', 0.2), 380); // C6
  }

  function playPurr() {
    playSynth(220, 0.4, 'triangle', 0.12);
    setTimeout(() => playSynth(261.63, 0.5, 'sine', 0.12), 150);
  }

  function getActiveCat() {
    return state.cats.find(c => c.id === state.activeCatId) || state.cats[0];
  }

  function getCatDef(id) {
    return CAT_ROSTER_DEFS.find(d => d.id === id) || CAT_ROSTER_DEFS[0];
  }

  function saveCurrentState() {
    saveCatCareState(state, activeUid);
  }

  /**
   * Check if the currently active cat has been named.
   * If not, prompt the naming ceremony modal!
   */
  function checkNamingCeremony() {
    const activeCat = getActiveCat();
    if (!activeCat.name || activeCat.name.trim() === '') {
      showNamingModal(activeCat.id);
      return false;
    }
    return true;
  }

  function showNamingModal(catId) {
    const cat = state.cats.find(c => c.id === catId);
    const def = getCatDef(catId);
    const namingModal = document.getElementById('cat-naming-modal');
    if (!namingModal) return;

    const breedEl = document.getElementById('cat-naming-breed-title');
    const descEl = document.getElementById('cat-naming-breed-desc');
    const inputEl = document.getElementById('cat-naming-input');
    const avatarEl = document.getElementById('cat-naming-avatar');
    const traitEl = document.getElementById('cat-naming-trait');

    if (breedEl) breedEl.textContent = `${def.icon} ${def.localBreed} (${def.breedName})`;
    if (descEl) descEl.textContent = def.personalityDesc;
    if (avatarEl) {
      avatarEl.innerHTML = renderCatSvg(def, 1, 110);
    }
    if (traitEl) {
      traitEl.textContent = `Kepribadian: ${def.personality} • Favorit: ${def.favoriteFood}`;
    }
    if (inputEl) {
      inputEl.value = def.defaultSuggestedName;
      inputEl.focus();
    }

    namingModal.classList.add('active');
    namingModal.setAttribute('aria-hidden', 'false');
    playSynth(659.25, 0.4, 'sine', 0.15);
  }

  function completeNaming(catId, chosenName) {
    const cat = state.cats.find(c => c.id === catId);
    if (!cat) return;
    const trimmed = (chosenName || '').trim();
    if (!trimmed) {
      if (onShowToast) onShowToast('⚠️ Mohon masukkan nama untuk kucingmu terlebih dahulu!');
      return false;
    }

    cat.name = trimmed;
    cat.adoptedAt = cat.adoptedAt || Date.now();
    if (cat.memories.length === 0) {
      const def = getCatDef(catId);
      cat.memories.push({
        id: 'mem_' + Date.now(),
        type: 'adopted',
        stage: 1,
        title: 'Hari Pertama di Cat Garden 🌸',
        date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        desc: `Syma resmi menyambut ${trimmed} (${def.localBreed}) ke dalam perlindungan The Nine Tailed Sanctuary. Ikatan penuh cinta dimulai di sini.`
      });
    }

    saveCurrentState();

    const namingModal = document.getElementById('cat-naming-modal');
    if (namingModal) {
      namingModal.classList.remove('active');
      namingModal.setAttribute('aria-hidden', 'true');
    }

    playFanfare();
    if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    if (onShowToast) onShowToast(`✨ Selamat datang, ${trimmed}! Kucing manis barumu siap dirawat.`);

    renderAllViews();
    return true;
  }

  /**
   * Performs one of the 8 care activities.
   */
  function performCareActivity(activityType) {
    if (!checkNamingCeremony()) return;
    if (isActionPlaying) return;

    const cat = getActiveCat();
    const def = getCatDef(cat.id);
    isActionPlaying = true;

    let toastText = '';
    let expGain = 15;
    let particleIcon = '✨';

    switch (activityType) {
      case 'feed':
        cat.needs.hunger = Math.min(100, cat.needs.hunger + 35);
        cat.needs.energy = Math.min(100, cat.needs.energy + 10);
        cat.needs.happiness = Math.min(100, cat.needs.happiness + 15);
        expGain = 18;
        particleIcon = '🐟';
        playSynth(440, 0.2, 'sine', 0.12);
        setTimeout(() => playSynth(587.33, 0.25, 'triangle', 0.15), 120);
        toastText = `🐟 ${cat.name} melahap hidangan ${def.favoriteFood} dengan lahap! (+35 Kenyang)`;
        triggerGardenAnimation('nomnom');
        state.dailyQuests.feed++;
        break;

      case 'drink':
        cat.needs.thirst = Math.min(100, cat.needs.thirst + 40);
        cat.needs.cleanliness = Math.min(100, cat.needs.cleanliness + 5);
        cat.needs.energy = Math.min(100, cat.needs.energy + 5);
        expGain = 14;
        particleIcon = '💧';
        playSynth(659.25, 0.25, 'sine', 0.12);
        setTimeout(() => playSynth(783.99, 0.3, 'sine', 0.1), 100);
        toastText = `💧 ${cat.name} meminum air embun suci pegunungan PINWHEEL. (+40 Kesegaran)`;
        triggerGardenAnimation('drink');
        break;

      case 'bath':
        cat.needs.cleanliness = Math.min(100, cat.needs.cleanliness + 45);
        cat.needs.thirst = Math.min(100, cat.needs.thirst + 10);
        // personality reaction
        if (cat.id === 6 || cat.id === 1) {
          cat.needs.happiness = Math.min(100, cat.needs.happiness + 20);
        } else {
          cat.needs.happiness = Math.max(0, cat.needs.happiness - 5);
        }
        expGain = 20;
        particleIcon = '🫧';
        playSynth(523.25, 0.3, 'triangle', 0.15);
        setTimeout(() => playSynth(880, 0.3, 'sine', 0.15), 180);
        toastText = `🛁 Mandi busa sakura lembut membersihkan seluruh bulu ${cat.name}! (+45 Bersih)`;
        triggerGardenAnimation('bubbles');
        break;

      case 'brush':
        cat.needs.cleanliness = Math.min(100, cat.needs.cleanliness + 30);
        cat.needs.happiness = Math.min(100, cat.needs.happiness + 20);
        cat.needs.affection = Math.min(100, cat.needs.affection + 15);
        expGain = 16;
        particleIcon = '🪮';
        playSynth(587.33, 0.35, 'sine', 0.14);
        setTimeout(() => playSynth(783.99, 0.35, 'sine', 0.12), 150);
        toastText = `🪮 Menyisir bulu sutra ${cat.name} hingga berkilau bagai bintang! (+30 Bersih, +15 Kasih)`;
        triggerGardenAnimation('brush');
        state.dailyQuests.brush++;
        break;

      case 'play':
        cat.needs.happiness = Math.min(100, cat.needs.happiness + 40);
        cat.needs.affection = Math.min(100, cat.needs.affection + 20);
        cat.needs.energy = Math.max(10, cat.needs.energy - 15);
        cat.needs.thirst = Math.max(10, cat.needs.thirst - 12);
        cat.needs.hunger = Math.max(10, cat.needs.hunger - 10);
        expGain = 22;
        particleIcon = '🧶';
        playSynth(659.25, 0.15, 'triangle', 0.18);
        setTimeout(() => playSynth(880, 0.2, 'triangle', 0.2), 100);
        setTimeout(() => playSynth(1046.5, 0.3, 'sine', 0.2), 200);
        toastText = `🧶 ${cat.name} melompat lincah mengejar ${def.favoriteToy}! (+40 Ceria)`;
        triggerGardenAnimation('play');
        state.dailyQuests.play++;
        break;

      case 'pet':
        cat.needs.affection = Math.min(100, cat.needs.affection + 25);
        cat.needs.happiness = Math.min(100, cat.needs.happiness + 15);
        expGain = 15;
        particleIcon = '🤍';
        playPurr();
        toastText = `🤍 Kamu membelai hangat ${cat.name}. Dia mendengkur manja purr purr... (+25 Kasih Sayang)`;
        triggerGardenAnimation('hearts');
        state.dailyQuests.pet++;
        break;

      case 'sleep':
        cat.needs.energy = Math.min(100, cat.needs.energy + 50);
        cat.needs.hunger = Math.max(10, cat.needs.hunger - 15);
        cat.needs.thirst = Math.max(10, cat.needs.thirst - 15);
        expGain = 16;
        particleIcon = '💤';
        playSynth(329.63, 0.5, 'sine', 0.1);
        setTimeout(() => playSynth(392.00, 0.6, 'sine', 0.08), 200);
        toastText = `💤 ${cat.name} tertidur lelap di atas bantal sutra yang hangat... (+50 Energi)`;
        triggerGardenAnimation('sleep');
        break;

      case 'clean':
        cat.needs.cleanliness = Math.min(100, cat.needs.cleanliness + 35);
        cat.needs.happiness = Math.min(100, cat.needs.happiness + 10);
        expGain = 14;
        particleIcon = '🧹';
        playSynth(523.25, 0.25, 'sine', 0.12);
        setTimeout(() => playSynth(659.25, 0.3, 'sine', 0.12), 120);
        toastText = `🧹 Area taman dan kotak pasir dibersihkan hingga wangi melati! (+35 Bersih)`;
        triggerGardenAnimation('clean');
        break;
    }

    cat.careCount = (cat.careCount || 0) + 1;
    const prevStage = getCatGrowthStage(cat.growthExp);
    cat.growthExp += expGain;
    const newStage = getCatGrowthStage(cat.growthExp);

    // Spawn floating feedback element
    spawnFloatingIndicator(`+${expGain} EXP ${particleIcon}`);

    // Check Stage Promotion
    if (newStage.stage > prevStage.stage) {
      cat.stage = newStage.stage;
      handleGrowthUp(cat, prevStage, newStage);
    } else {
      if (onShowToast) onShowToast(toastText);
    }

    saveCurrentState();
    renderAllViews();

    setTimeout(() => {
      isActionPlaying = false;
    }, 600);
  }

  function handleGrowthUp(cat, prevStage, newStage) {
    const def = getCatDef(cat.id);
    playFanfare();
    if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.4);

    // Add milestone memory
    cat.memories.push({
      id: 'mem_' + Date.now(),
      type: newStage.stage === 4 ? 'graduation' : 'growth',
      stage: newStage.stage,
      title: `${newStage.badge} Naik Tahap: ${newStage.name}!`,
      date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      desc: `${cat.name} bertumbuh dengan penuh berkah dari ${prevStage.name} menjadi ${newStage.name} berkat kasih sayang dan ketekunan Syma.`
    });

    // If reached ADULT CAT (Stage 4), check unlock next cat!
    let nextCatUnlocked = null;
    if (newStage.stage === 4) {
      const nextIdx = state.cats.findIndex(c => c.id === cat.id + 1);
      if (nextIdx !== -1 && !state.cats[nextIdx].unlocked) {
        state.cats[nextIdx].unlocked = true;
        nextCatUnlocked = state.cats[nextIdx];
      }
    }

    saveCurrentState();
    showGrowthModal(cat, prevStage, newStage, nextCatUnlocked);
  }

  function showGrowthModal(cat, prevStage, newStage, nextCatUnlocked) {
    const modal = document.getElementById('cat-growth-modal');
    if (!modal) return;

    const titleEl = document.getElementById('cat-growth-title');
    const badgeEl = document.getElementById('cat-growth-badge');
    const descEl = document.getElementById('cat-growth-desc');
    const visualEl = document.getElementById('cat-growth-visual');
    const nextBannerEl = document.getElementById('cat-growth-next-banner');

    if (titleEl) {
      titleEl.textContent = newStage.stage === 4
        ? `👑 KELULUSAN MAJESTIK: ${cat.name} TELAH DEWASA!`
        : `✨ SELAMAT! ${cat.name} BERTUMBUH!`;
    }
    if (badgeEl) {
      badgeEl.textContent = `${prevStage.badge} ${prevStage.name} ➔ ${newStage.badge} ${newStage.name}`;
    }
    if (descEl) {
      descEl.textContent = newStage.stage === 4
        ? `${cat.name} kini resmi menjadi Kucing Dewasa seutuhnya dan menetap abadi sebagai penghuni terhormat di Cat Garden Sanctuary Syma.`
        : `${cat.name} kini semakin lincah, berenergi, dan memiliki bulu yang semakin indah. Terus rawat hingga mencapai tahap dewasa!`;
    }
    if (visualEl) {
      visualEl.innerHTML = renderCatSvg(getCatDef(cat.id), newStage.stage, 130);
    }
    if (nextBannerEl) {
      if (nextCatUnlocked) {
        const nextDef = getCatDef(nextCatUnlocked.id);
        nextBannerEl.style.display = 'block';
        nextBannerEl.innerHTML = `
          <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(168, 85, 247, 0.2)); border: 1.5px solid #fbbf24; border-radius: 12px; padding: 12px; margin-top: 14px; text-align: left;">
            <div style="font-weight: 800; color: #fbbf24; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
              <span>🌟</span> Kucing Baru Tersedia di Gerbang Sanctuary!
            </div>
            <div style="font-size: 0.82rem; color: #fdf4ff; margin-top: 4px;">
              Kucing ke-${nextCatUnlocked.id}: <strong>${nextDef.localBreed}</strong> telah tiba dan siap diadopsi serta diberi nama oleh Syma!
            </div>
            <button type="button" class="pinwheel-action-btn primary" id="btn-adopt-next-cat-now" style="margin-top: 10px; width: 100%; padding: 8px 12px; font-size: 0.82rem;">
              🐾 Sambut & Beri Nama Kucing Berikutnya
            </button>
          </div>
        `;
        const btnAdopt = document.getElementById('btn-adopt-next-cat-now');
        if (btnAdopt) {
          btnAdopt.addEventListener('click', () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            state.activeCatId = nextCatUnlocked.id;
            saveCurrentState();
            renderAllViews();
            showNamingModal(nextCatUnlocked.id);
          });
        }
      } else {
        nextBannerEl.style.display = 'none';
      }
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function triggerGardenAnimation(type) {
    const stageContainer = document.getElementById('cat-sanctuary-stage');
    if (!stageContainer) return;

    const fx = document.createElement('div');
    fx.className = `cat-stage-fx fx-${type}`;
    stageContainer.appendChild(fx);
    setTimeout(() => {
      try { stageContainer.removeChild(fx); } catch (_) {}
    }, 1500);
  }

  function spawnFloatingIndicator(text) {
    const stageContainer = document.getElementById('cat-sanctuary-stage');
    if (!stageContainer) return;
    const span = document.createElement('div');
    span.className = 'cat-floating-pill';
    span.textContent = text;
    span.style.left = '50%';
    span.style.top = '40%';
    stageContainer.appendChild(span);
    setTimeout(() => {
      try { stageContainer.removeChild(span); } catch (_) {}
    }, 1200);
  }

  /**
   * Renders the SVG visual representation of a Cat at a given growth stage
   */
  function renderCatSvg(def, stageLevel = 1, size = 90) {
    const scale = stageLevel === 1 ? 0.72 : stageLevel === 2 ? 0.88 : stageLevel === 3 ? 1.05 : 1.25;
    const bodyColor = def.colorHex || '#ffffff';
    const accentColor = def.accentHex || '#d8b4fe';
    const eyeColor = def.eyeColor || '#a855f7';
    const isAdult = stageLevel === 4;

    return `
      <svg class="cat-chibi-svg stage-${stageLevel}" viewBox="0 0 120 120" width="${size}" height="${size}" style="transform: scale(${scale}); transform-origin: center bottom;">
        <defs>
          <radialGradient id="glow_${def.id}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.45" />
            <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
          </radialGradient>
          <filter id="shadow_${def.id}">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(15,7,32,0.4)" />
          </filter>
        </defs>

        <!-- Starlight Ground Shadow -->
        <ellipse cx="60" cy="112" rx="42" ry="7" fill="rgba(10,5,24,0.35)" />
        <circle cx="60" cy="65" r="54" fill="url(#glow_${def.id})" />

        <!-- Tails (Nine tails aura if adult Cat #10 or Cat #1, or single plush tail) -->
        ${isAdult && (def.id === 1 || def.id === 10) ? `
          <g class="nine-tails-aura" opacity="0.85">
            <path d="M60 85 Q20 50 15 25 Q35 45 60 75" stroke="${accentColor}" stroke-width="6" fill="none" stroke-linecap="round" />
            <path d="M60 85 Q25 40 30 18 Q45 40 60 75" stroke="${bodyColor}" stroke-width="7" fill="none" stroke-linecap="round" />
            <path d="M60 85 Q100 50 105 25 Q85 45 60 75" stroke="${accentColor}" stroke-width="6" fill="none" stroke-linecap="round" />
            <path d="M60 85 Q95 40 90 18 Q75 40 60 75" stroke="${bodyColor}" stroke-width="7" fill="none" stroke-linecap="round" />
          </g>
        ` : `
          <!-- Single wagging tail -->
          <path class="cat-tail-anim" d="M68 95 C88 95 105 85 98 62 C92 45 84 55 86 66 C88 77 75 88 66 88" 
                fill="${accentColor}" stroke="${bodyColor}" stroke-width="2" />
        `}

        <!-- Cat Body -->
        <ellipse cx="60" cy="85" rx="30" ry="24" fill="${bodyColor}" stroke="${accentColor}" stroke-width="2.5" filter="url(#shadow_${def.id})" />
        <!-- Belly Patch -->
        <ellipse cx="60" cy="87" rx="18" ry="14" fill="${accentColor}" opacity="0.35" />

        <!-- Little Paws -->
        <ellipse cx="46" cy="103" rx="8" ry="6" fill="${bodyColor}" stroke="${accentColor}" stroke-width="1.5" />
        <ellipse cx="74" cy="103" rx="8" ry="6" fill="${bodyColor}" stroke="${accentColor}" stroke-width="1.5" />

        <!-- Cat Head -->
        <circle cx="60" cy="50" r="28" fill="${bodyColor}" stroke="${accentColor}" stroke-width="2.5" />

        <!-- Ears -->
        <polygon points="36,36 44,12 55,28" fill="${bodyColor}" stroke="${accentColor}" stroke-width="2" />
        <polygon points="39,32 45,18 52,28" fill="${accentColor}" opacity="0.6" />

        <polygon points="84,36 76,12 65,28" fill="${bodyColor}" stroke="${accentColor}" stroke-width="2" />
        <polygon points="81,32 75,18 68,28" fill="${accentColor}" opacity="0.6" />

        <!-- Forehead Star Mark / Ribbon -->
        ${isAdult ? `
          <polygon points="60,25 62,31 68,31 63,35 65,41 60,37 55,41 57,35 52,31 58,31" fill="#fbbf24" stroke="#f59e0b" stroke-width="1" />
        ` : stageLevel === 1 ? `
          <circle cx="60" cy="30" r="3" fill="#fb7185" />
        ` : `
          <path d="M57 32 Q60 28 63 32" stroke="${accentColor}" stroke-width="2" fill="none" />
        `}

        <!-- Eyes -->
        <ellipse cx="48" cy="50" rx="5.5" ry="7" fill="${eyeColor}" />
        <circle cx="46.5" cy="48" r="2.2" fill="#ffffff" />
        <circle cx="50" cy="53" r="1" fill="#ffffff" />

        <ellipse cx="72" cy="50" rx="5.5" ry="7" fill="${eyeColor}" />
        <circle cx="70.5" cy="48" r="2.2" fill="#ffffff" />
        <circle cx="74" cy="53" r="1" fill="#ffffff" />

        <!-- Blushing Cheeks -->
        <ellipse cx="41" cy="57" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.4" />
        <ellipse cx="79" cy="57" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.4" />

        <!-- Cute Nose & Mouth -->
        <polygon points="60,56 57.5,53 62.5,53" fill="#f43f5e" />
        <path d="M56 58 Q60 62 60 58 Q60 62 64 58" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" />

        <!-- Whiskers -->
        <line x1="33" y1="53" x2="20" y2="50" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
        <line x1="33" y1="57" x2="18" y2="58" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
        <line x1="87" y1="53" x2="100" y2="50" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
        <line x1="87" y1="57" x2="102" y2="58" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />

        <!-- Collar with Celestial Bell -->
        <path d="M43 72 Q60 78 77 72" stroke="#e11d48" stroke-width="3" fill="none" />
        <circle cx="60" cy="76" r="3.5" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
      </svg>
    `;
  }

  /**
   * Render Main Sanctuary Interactive View (Taman Perawatan)
   */
  function renderCareView() {
    const activeCat = getActiveCat();
    const def = getCatDef(activeCat.id);
    const growth = getCatGrowthStage(activeCat.growthExp);

    // 1. Header info
    const catNameEl = document.getElementById('cat-garden-active-name');
    const stageBadgeEl = document.getElementById('cat-garden-stage-badge');
    const breedTagEl = document.getElementById('cat-garden-breed-tag');
    if (catNameEl) catNameEl.textContent = activeCat.name || '(Belum Diberi Nama)';
    if (stageBadgeEl) stageBadgeEl.textContent = `${growth.badge} ${growth.name}`;
    if (breedTagEl) breedTagEl.textContent = `${def.icon} ${def.localBreed}`;

    // 2. Growth EXP Bar
    const expFill = document.getElementById('cat-growth-progress-fill');
    const expText = document.getElementById('cat-growth-progress-text');
    let maxExp = growth.stage < 4 ? GROWTH_STAGES[growth.stage].expThreshold : 450;
    let minExp = growth.stage === 1 ? 0 : GROWTH_STAGES[growth.stage - 1].expThreshold;
    let currentInStage = activeCat.growthExp - minExp;
    let neededInStage = maxExp - minExp;
    let pct = growth.stage === 4 ? 100 : Math.min(100, Math.max(0, Math.round((currentInStage / neededInStage) * 100)));

    if (expFill) expFill.style.width = `${pct}%`;
    if (expText) {
      expText.textContent = growth.stage === 4
        ? `👑 Dewasa Penuh (Maksimal • 450+ EXP)`
        : `${activeCat.growthExp} / ${maxExp} EXP (${pct}%) Menuju ${GROWTH_STAGES[growth.stage].name}`;
    }

    // 3. Needs Bars
    const meters = [
      { id: 'hunger', val: activeCat.needs.hunger },
      { id: 'thirst', val: activeCat.needs.thirst },
      { id: 'energy', val: activeCat.needs.energy },
      { id: 'happiness', val: activeCat.needs.happiness },
      { id: 'cleanliness', val: activeCat.needs.cleanliness },
      { id: 'affection', val: activeCat.needs.affection }
    ];

    meters.forEach(m => {
      const fill = document.getElementById(`cat-need-${m.id}-fill`);
      const valText = document.getElementById(`cat-need-${m.id}-val`);
      if (fill) fill.style.width = `${m.val}%`;
      if (valText) valText.textContent = `${m.val}%`;
    });

    // 4. Center Cat Avatar on Stage
    const stageCatEl = document.getElementById('cat-sanctuary-center-cat');
    if (stageCatEl) {
      stageCatEl.innerHTML = renderCatSvg(def, activeCat.stage, 120);
    }

    // 5. Dynamic Speech Bubble
    const speechEl = document.getElementById('cat-sanctuary-speech');
    if (speechEl) {
      let dialogue = def.dialogue.idle;
      if (activeCat.needs.hunger < 35) dialogue = def.dialogue.hungry;
      else if (activeCat.needs.thirst < 35) dialogue = def.dialogue.thirsty;
      else if (activeCat.needs.energy < 30) dialogue = def.dialogue.sleepy;
      else if (activeCat.needs.cleanliness < 40) dialogue = def.dialogue.dirty;
      else if (activeCat.needs.happiness > 75 && activeCat.needs.affection > 75) dialogue = def.dialogue.happy;
      speechEl.textContent = `"${dialogue}"`;
    }

    // 6. Resident Adult Cats roaming the garden
    const adultResidents = state.cats.filter(c => c.unlocked && c.stage === 4 && c.id !== activeCat.id);
    const residentsContainer = document.getElementById('cat-garden-residents-layer');
    if (residentsContainer) {
      residentsContainer.innerHTML = '';
      adultResidents.forEach((c, idx) => {
        const cDef = getCatDef(c.id);
        const el = document.createElement('div');
        el.className = 'cat-resident-bubble';
        el.style.left = `${15 + ((idx * 26) % 75)}%`;
        el.style.bottom = `${18 + ((idx * 14) % 35)}%`;
        el.title = `${c.name} (${cDef.localBreed} - Dewasa)`;
        el.innerHTML = `
          ${renderCatSvg(cDef, 4, 52)}
          <span class="resident-tag">${c.name}</span>
        `;
        el.addEventListener('click', () => {
          playPurr();
          if (onShowToast) onShowToast(`🤍 ${c.name} (${cDef.localBreed}) mendengkur riang di sudut taman!`);
        });
        residentsContainer.appendChild(el);
      });
    }
  }

  /**
   * Render Profile & Memories View
   */
  function renderProfileView() {
    const activeCat = getActiveCat();
    const def = getCatDef(activeCat.id);
    const growth = getCatGrowthStage(activeCat.growthExp);

    const profAvatar = document.getElementById('cat-prof-avatar-box');
    const profName = document.getElementById('cat-prof-title');
    const profBreed = document.getElementById('cat-prof-breed');
    const profStage = document.getElementById('cat-prof-stage');
    const profTrait = document.getElementById('cat-prof-trait');
    const profFavToy = document.getElementById('cat-prof-favtoy');
    const profFavFood = document.getElementById('cat-prof-favfood');
    const profTotalCare = document.getElementById('cat-prof-totalcare');
    const profMemoryList = document.getElementById('cat-prof-memory-timeline');

    if (profAvatar) profAvatar.innerHTML = renderCatSvg(def, activeCat.stage, 110);
    if (profName) profName.textContent = activeCat.name || '(Belum Diberi Nama)';
    if (profBreed) profBreed.textContent = `${def.icon} ${def.localBreed} (${def.breedName})`;
    if (profStage) profStage.textContent = `${growth.badge} ${growth.name}`;
    if (profTrait) profTrait.textContent = def.personality;
    if (profFavToy) profFavToy.textContent = def.favoriteToy;
    if (profFavFood) profFavFood.textContent = def.favoriteFood;
    if (profTotalCare) profTotalCare.textContent = `${activeCat.careCount || 0} Kali Aktivitas`;

    if (profMemoryList) {
      profMemoryList.innerHTML = '';
      if (!activeCat.memories || activeCat.memories.length === 0) {
        profMemoryList.innerHTML = '<div style="color: #94a3b8; font-size: 0.82rem; padding: 12px;">Belum ada catatan memori tersimpan. Lakukan perawatan untuk menorehkan kenangan baru!</div>';
      } else {
        activeCat.memories.slice().reverse().forEach(mem => {
          const item = document.createElement('div');
          item.className = 'cat-memory-timeline-item';
          item.innerHTML = `
            <div class="cat-memory-dot">✧</div>
            <div class="cat-memory-content">
              <div class="cat-memory-header">
                <span class="cat-memory-title">${mem.title}</span>
                <span class="cat-memory-date">${mem.date}</span>
              </div>
              <p class="cat-memory-desc">${mem.desc}</p>
            </div>
          `;
          profMemoryList.appendChild(item);
        });
      }
    }
  }

  /**
   * Render 10 Cats Collection View
   */
  function renderCollectionView() {
    const grid = document.getElementById('cat-collection-10-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const adultCount = state.cats.filter(c => c.unlocked && c.stage === 4).length;
    const headerCount = document.getElementById('cat-collection-adult-count');
    if (headerCount) headerCount.textContent = `${adultCount} / 10 Dewasa`;

    state.cats.forEach((cat, idx) => {
      const def = getCatDef(cat.id);
      const isCurrent = cat.id === state.activeCatId;
      const isAdult = cat.stage === 4;
      const card = document.createElement('div');
      card.className = `cat-card-slot ${cat.unlocked ? (isAdult ? 'completed' : 'active') : 'locked'} ${isCurrent ? 'selected-cat' : ''}`;

      if (cat.unlocked) {
        const growth = getCatGrowthStage(cat.growthExp);
        card.innerHTML = `
          <div class="cat-slot-status-badge ${isAdult ? 'badge-completed' : 'badge-active'}">
            ${isAdult ? '👑 Dewasa' : `${growth.badge} ${growth.name}`}
          </div>
          <div class="cat-slot-avatar">
            ${renderCatSvg(def, cat.stage, 70)}
          </div>
          <div class="cat-slot-info">
            <h4 class="cat-slot-name">${cat.name || '(Belum Bernama)'}</h4>
            <span class="cat-slot-breed">${def.localBreed}</span>
            <div class="cat-slot-exp-mini">
              <span>EXP: ${cat.growthExp}</span>
              <span>Kasih: ${cat.needs.affection}%</span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          state.activeCatId = cat.id;
          saveCurrentState();
          playSynth(587.33, 0.25, 'sine', 0.12);
          renderAllViews();
          if (!cat.name) showNamingModal(cat.id);
        });
      } else {
        // Locked slot
        const reqCatDef = getCatDef(cat.id - 1);
        card.innerHTML = `
          <div class="cat-slot-status-badge badge-locked">🔒 Terkunci</div>
          <div class="cat-slot-avatar locked-silhouette">
            <span style="font-size: 2.2rem; filter: grayscale(1) opacity(0.35);">🐱</span>
          </div>
          <div class="cat-slot-info">
            <h4 class="cat-slot-name" style="color: #94a3b8;">Kucing #${cat.id}</h4>
            <span class="cat-slot-breed" style="color: #64748b;">${def.localBreed}</span>
            <span class="cat-slot-unlock-req">Buka: Rawat Kucing #${cat.id - 1} hingga dewasa 👑</span>
          </div>
        `;
      }

      grid.appendChild(card);
    });
  }

  /**
   * Render Daily Care Checklist
   */
  function renderDailyView() {
    const list = document.getElementById('cat-daily-quest-list');
    if (!list) return;

    const quests = [
      { id: 'feed', title: 'Beri Makan Lezat 🐟', target: 2, current: state.dailyQuests.feed || 0 },
      { id: 'play', title: 'Ajak Bermain Bola Benang 🧶', target: 1, current: state.dailyQuests.play || 0 },
      { id: 'brush', title: 'Sisir Bulu Sampai Berkilau 🪮', target: 1, current: state.dailyQuests.brush || 0 },
      { id: 'pet', title: 'Beri Elusan Penuh Kasih 🤍', target: 3, current: state.dailyQuests.pet || 0 }
    ];

    list.innerHTML = '';
    let allDone = true;

    quests.forEach(q => {
      const isDone = q.current >= q.target;
      if (!isDone) allDone = false;
      const row = document.createElement('div');
      row.className = `cat-daily-quest-row ${isDone ? 'done' : ''}`;
      row.innerHTML = `
        <div class="quest-checkbox">${isDone ? '✓' : '○'}</div>
        <div class="quest-content">
          <div class="quest-title">${q.title}</div>
          <div class="quest-progress">${Math.min(q.target, q.current)} / ${q.target} Selesai</div>
        </div>
        <div class="quest-reward">+15 Kasih Sayang</div>
      `;
      list.appendChild(row);
    });

    const bonusBtn = document.getElementById('btn-claim-daily-bonus');
    if (bonusBtn) {
      if (allDone && !state.dailyQuests.claimed) {
        bonusBtn.disabled = false;
        bonusBtn.textContent = '🎁 Klaim Berkah Harian Sanctuary (+50 EXP)!';
        bonusBtn.onclick = () => {
          state.dailyQuests.claimed = true;
          const activeCat = getActiveCat();
          activeCat.growthExp += 50;
          activeCat.needs.affection = Math.min(100, activeCat.needs.affection + 25);
          saveCurrentState();
          playFanfare();
          if (onShowToast) onShowToast('🎉 Berkah harian diklaim! +50 EXP & +25 Kasih Sayang.');
          renderAllViews();
        };
      } else if (state.dailyQuests.claimed) {
        bonusBtn.disabled = true;
        bonusBtn.textContent = '✓ Berkah Harian Sudah Diklaim Hari Ini';
      } else {
        bonusBtn.disabled = true;
        bonusBtn.textContent = 'Selesaikan Seluruh Rutinitas untuk Membuka Bonus';
      }
    }
  }

  function switchTab(tabKey) {
    activeTab = tabKey;
    ['care', 'profile', 'collection', 'daily'].forEach(t => {
      const btn = document.getElementById(`cat-tab-btn-${t}`);
      const panel = document.getElementById(`cat-panel-${t}`);
      if (btn) btn.classList.toggle('active', t === tabKey);
      if (panel) {
        if (t === tabKey) {
          panel.style.display = 'block';
          panel.classList.add('active');
        } else {
          panel.style.display = 'none';
          panel.classList.remove('active');
        }
      }
    });

    playSynth(523.25, 0.15, 'sine', 0.08);
    renderAllViews();
  }

  function renderAllViews() {
    renderCareView();
    if (activeTab === 'profile') renderProfileView();
    if (activeTab === 'collection') renderCollectionView();
    if (activeTab === 'daily') renderDailyView();

    // Update Cat Garden Aquarium Prop from The Whispering Pond
    try {
      const fishIconEl = document.getElementById('cat-garden-aquarium-fish-icon');
      const fishStateRaw = localStorage.getItem(`olu_fishing_v2_${activeUid}`) || localStorage.getItem('olu_fishing_v2_abil');
      if (fishStateRaw && fishIconEl) {
        const fishState = JSON.parse(fishStateRaw);
        const curFishId = fishState.selectedAquariumFish || 'koi';
        const icons = {
          koi: '🎏', goldfish: '🐟', minnow: '🐟', moonfin: '🌙', silvertail: '✨',
          bluebell_fish: '🔔', stardust_koi: '🌌', twilight_fish: '🌅',
          celestial_fish: '🌟', aurora_koi: '🏮'
        };
        fishIconEl.textContent = icons[curFishId] || '🐟';
      }
    } catch (_) {}
  }

  function openCatGarden() {
    const overlay = document.getElementById('pinwheel-catgarden-overlay');
    if (overlay) {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
    }

    playSynth(523.25, 0.4, 'sine', 0.14);
    setTimeout(() => playSynth(659.25, 0.4, 'triangle', 0.14), 140);
    if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.35);
    if (onShowToast) onShowToast('🐱 Memasuki Taman Kucing Suci — Cat Care Simulator PINWHEEL ✨');

    switchTab('care');
    renderAllViews();

    // Check if initial cat needs naming!
    setTimeout(() => {
      checkNamingCeremony();
    }, 350);
  }

  function closeCatGarden() {
    const overlay = document.getElementById('pinwheel-catgarden-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
    playSynth(440, 0.25, 'sine', 0.08);
  }

  function bindEvents() {
    // Tab switching
    ['care', 'profile', 'collection', 'daily'].forEach(t => {
      const btn = document.getElementById(`cat-tab-btn-${t}`);
      if (btn) btn.addEventListener('click', () => switchTab(t));
    });

    // Close button
    const btnClose = document.getElementById('btn-close-catgarden-overlay');
    if (btnClose) btnClose.addEventListener('click', closeCatGarden);

    // 8 Care Action buttons
    const actions = ['feed', 'drink', 'bath', 'brush', 'play', 'pet', 'sleep', 'clean'];
    actions.forEach(act => {
      const btn = document.getElementById(`btn-cat-act-${act}`);
      if (btn) {
        btn.addEventListener('click', () => performCareActivity(act));
      }
    });

    // Petting click directly on the center cat
    const centerCatEl = document.getElementById('cat-sanctuary-center-cat');
    if (centerCatEl) {
      centerCatEl.addEventListener('click', () => {
        performCareActivity('pet');
      });
    }

    // Naming modal submit
    const btnConfirmNaming = document.getElementById('btn-cat-confirm-naming');
    if (btnConfirmNaming) {
      btnConfirmNaming.addEventListener('click', () => {
        const inputEl = document.getElementById('cat-naming-input');
        completeNaming(state.activeCatId, inputEl?.value);
      });
    }

    // Click on Aquarium Prop in Cat Garden
    const aquariumProp = document.getElementById('cat-garden-aquarium-prop');
    if (aquariumProp) {
      aquariumProp.addEventListener('click', () => {
        playSynth(659.25, 0.25, 'sine', 0.12);
        const speechEl = document.getElementById('cat-sanctuary-speech');
        if (speechEl) {
          speechEl.textContent = `"Mew~ ikan di akuarium ini berasal dari The Whispering Pond! Berenang begitu tenang... 🫧🐟"`;
        }
        if (onShowToast) onShowToast('🫧 Akuarium terhubung dengan hasil tangkapan The Whispering Pond!');
      });
    }

    // Growth modal close
    const btnCloseGrowth = document.getElementById('btn-close-growth-modal');
    if (btnCloseGrowth) {
      btnCloseGrowth.addEventListener('click', () => {
        const modal = document.getElementById('cat-growth-modal');
        if (modal) {
          modal.classList.remove('active');
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    }
  }

  // Initial binding
  bindEvents();

  return {
    openCatGarden,
    closeCatGarden,
    performCareActivity,
    completeNaming,
    showNamingModal,
    switchTab,
    getState: () => state,
    resetProgress: () => {
      state = createDefaultState();
      saveCurrentState();
      renderAllViews();
    }
  };
}

