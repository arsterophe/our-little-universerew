/**
 * THE ENCHANTED GREENHOUSE 🌿 — NYANYA ⭐ (UNIVERSE KIDULT)
 * Core Game Engine, Plant Catalog, Offline Timestamp Growth, Storage & Audio Synthesis
 * =============================================================================
 */

// 28+ Plant Catalog Across 4 Categories
export const PLANT_CATALOG = {
  // --- 1. VEGETABLES (9 Tanaman) ---
  carrot: {
    id: 'carrot',
    name: 'Wortel Bintang (Carrot)',
    category: 'vegetable',
    categoryName: 'Sayuran',
    desc: 'Wortel manis renyah dengan daun hijau beraroma segar dari tanah subur KIDULT.',
    icon: '🥕',
    seedIcon: '🌱',
    seedPrice: 10,
    sellPrice: 22,
    growthTime: 25, // seconds for smooth interactive gameplay
    wateringInterval: 15,
    yieldMin: 2,
    yieldMax: 4,
    xpReward: 15,
    rarity: 'Common',
    levelReq: 1
  },
  tomato: {
    id: 'tomato',
    name: 'Tomat Merah Senja (Tomato)',
    category: 'vegetable',
    categoryName: 'Sayuran',
    desc: 'Tomat merah ranum berkilau yang menyerap sinar keemasan golden hour.',
    icon: '🍅',
    seedIcon: '🌱',
    seedPrice: 14,
    sellPrice: 32,
    growthTime: 35,
    wateringInterval: 20,
    yieldMin: 2,
    yieldMax: 5,
    xpReward: 20,
    rarity: 'Common',
    levelReq: 1
  },
  lettuce: {
    id: 'lettuce',
    name: 'Selada Embun (Lettuce)',
    category: 'vegetable',
    categoryName: 'Sayuran',
    desc: 'Daun selada hijau muda yang selalu basah oleh tetesan embun fajar.',
    icon: '🥬',
    seedIcon: '🌱',
    seedPrice: 12,
    sellPrice: 28,
    growthTime: 30,
    wateringInterval: 18,
    yieldMin: 2,
    yieldMax: 3,
    xpReward: 18,
    rarity: 'Common',
    levelReq: 1
  },
  potato: {
    id: 'potato',
    name: 'Kentang Tanah Manis (Potato)',
    category: 'vegetable',
    categoryName: 'Sayuran',
    desc: 'Umbi kentang gurih yang tumbuh subur di bawah petak tanah hangat.',
    icon: '🥔',
    seedIcon: '🌱',
    seedPrice: 16,
    sellPrice: 38,
    growthTime: 40,
    wateringInterval: 25,
    yieldMin: 3,
    yieldMax: 6,
    xpReward: 25,
    rarity: 'Common',
    levelReq: 1
  },
  chili: {
    id: 'chili',
    name: 'Cabai Api Senja (Chili)',
    category: 'vegetable',
    categoryName: 'Sayuran',
    desc: 'Cabai merah cerah dengan rasa pedas hangat yang membangkitkan semangat.',
    icon: '🌶️',
    seedIcon: '🌱',
    seedPrice: 18,
    sellPrice: 42,
    growthTime: 45,
    wateringInterval: 22,
    yieldMin: 2,
    yieldMax: 5,
    xpReward: 28,
    rarity: 'Uncommon',
    levelReq: 2
  },
  eggplant: {
    id: 'eggplant',
    name: 'Terong Beludru Ungu (Eggplant)',
    category: 'vegetable',
    categoryName: 'Sayuran',
    desc: 'Terong berwarna ungu pekat dengan tekstur kulit halus seperti sutra.',
    icon: '🍆',
    seedIcon: '🌱',
    seedPrice: 20,
    sellPrice: 46,
    growthTime: 50,
    wateringInterval: 25,
    yieldMin: 2,
    yieldMax: 4,
    xpReward: 30,
    rarity: 'Uncommon',
    levelReq: 2
  },
  broccoli: {
    id: 'broccoli',
    name: 'Brokoli Mahkota Hijau (Broccoli)',
    category: 'vegetable',
    categoryName: 'Sayuran',
    desc: 'Brokoli berbentuk seperti pohon mini dari negeri dongeng peri.',
    icon: '🥦',
    seedIcon: '🌱',
    seedPrice: 22,
    sellPrice: 52,
    growthTime: 55,
    wateringInterval: 28,
    yieldMin: 2,
    yieldMax: 4,
    xpReward: 34,
    rarity: 'Uncommon',
    levelReq: 3
  },
  cucumber: {
    id: 'cucumber',
    name: 'Timun Kristal Segar (Cucumber)',
    category: 'vegetable',
    categoryName: 'Sayuran',
    desc: 'Timun berair segar yang renyah dan dingin seperti es sungai senja.',
    icon: '🥒',
    seedIcon: '🌱',
    seedPrice: 15,
    sellPrice: 35,
    growthTime: 35,
    wateringInterval: 20,
    yieldMin: 3,
    yieldMax: 5,
    xpReward: 22,
    rarity: 'Common',
    levelReq: 2
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Labu Emas Dongeng (Pumpkin)',
    category: 'vegetable',
    categoryName: 'Sayuran',
    desc: 'Labu besar berurat emas yang konon dapat disihir menjadi kereta kencana.',
    icon: '🎃',
    seedIcon: '🌱',
    seedPrice: 35,
    sellPrice: 90,
    growthTime: 80,
    wateringInterval: 40,
    yieldMin: 1,
    yieldMax: 3,
    xpReward: 60,
    rarity: 'Rare',
    levelReq: 3
  },

  // --- 2. FLOWERS (8 Tanaman) ---
  rose: {
    id: 'rose',
    name: 'Mawar Pastel Beludru (Rose)',
    category: 'flower',
    categoryName: 'Bunga',
    desc: 'Mawar harum berwarna dusty pink kesayangan Nyanya yang merekah anggun.',
    icon: '🌹',
    seedIcon: '🌺',
    seedPrice: 15,
    sellPrice: 36,
    growthTime: 30,
    wateringInterval: 18,
    yieldMin: 2,
    yieldMax: 4,
    xpReward: 24,
    rarity: 'Common',
    levelReq: 1
  },
  tulip: {
    id: 'tulip',
    name: 'Tulip Fajar Kencana (Tulip)',
    category: 'flower',
    categoryName: 'Bunga',
    desc: 'Kuntum tulip warna-warni yang selalu menguncup saat malam dan mekar saat fajar.',
    icon: '🌷',
    seedIcon: '🌺',
    seedPrice: 18,
    sellPrice: 42,
    growthTime: 35,
    wateringInterval: 20,
    yieldMin: 2,
    yieldMax: 5,
    xpReward: 28,
    rarity: 'Common',
    levelReq: 2
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Bintang Kosmik (Lavender)',
    category: 'flower',
    categoryName: 'Bunga',
    desc: 'Bunga lavender ungu beraroma damai yang menenangkan mimpi anak-anak.',
    icon: '🪻',
    seedIcon: '🌺',
    seedPrice: 20,
    sellPrice: 48,
    growthTime: 40,
    wateringInterval: 24,
    yieldMin: 3,
    yieldMax: 6,
    xpReward: 32,
    rarity: 'Uncommon',
    levelReq: 2
  },
  sunflower: {
    id: 'sunflower',
    name: 'Bunga Matahari Cahaya (Sunflower)',
    category: 'flower',
    categoryName: 'Bunga',
    desc: 'Bunga matahari keemasan pemberian Lala yang selalu menghadap sumber kehangatan.',
    icon: '🌻',
    seedIcon: '🌺',
    seedPrice: 25,
    sellPrice: 60,
    growthTime: 50,
    wateringInterval: 25,
    yieldMin: 2,
    yieldMax: 4,
    xpReward: 40,
    rarity: 'Uncommon',
    levelReq: 2
  },
  daisy: {
    id: 'daisy',
    name: 'Aster Putih Murni (Daisy)',
    category: 'flower',
    categoryName: 'Bunga',
    desc: 'Bunga aster mungil berkelopak putih dengan putik kuning cerah seperti mentari.',
    icon: '🌼',
    seedIcon: '🌺',
    seedPrice: 12,
    sellPrice: 28,
    growthTime: 25,
    wateringInterval: 15,
    yieldMin: 3,
    yieldMax: 6,
    xpReward: 18,
    rarity: 'Common',
    levelReq: 1
  },
  lily: {
    id: 'lily',
    name: 'Lily Rembulan Suci (Lily)',
    category: 'flower',
    categoryName: 'Bunga',
    desc: 'Bunga bakung putih anggun yang memancarkan pendar perak di bawah sinar bulan.',
    icon: '🪷',
    seedIcon: '🌺',
    seedPrice: 30,
    sellPrice: 75,
    growthTime: 65,
    wateringInterval: 30,
    yieldMin: 2,
    yieldMax: 3,
    xpReward: 50,
    rarity: 'Rare',
    levelReq: 3
  },
  hydrangea: {
    id: 'hydrangea',
    name: 'Hydrangea Awan Lembayung (Hydrangea)',
    category: 'flower',
    categoryName: 'Bunga',
    desc: 'Rumpun bunga lebat bernuansa pastel biru dan ungu seperti gumpalan awan senja.',
    icon: '💐',
    seedIcon: '🌺',
    seedPrice: 35,
    sellPrice: 85,
    growthTime: 70,
    wateringInterval: 32,
    yieldMin: 2,
    yieldMax: 4,
    xpReward: 55,
    rarity: 'Rare',
    levelReq: 4
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Abadi Kitsune (Sakura)',
    category: 'flower',
    categoryName: 'Bunga',
    desc: 'Bunga sakura merah muda halus pemberian Syma dari lembah kincir angin.',
    icon: '🌸',
    seedIcon: '🌺',
    seedPrice: 50,
    sellPrice: 130,
    growthTime: 90,
    wateringInterval: 40,
    yieldMin: 3,
    yieldMax: 5,
    xpReward: 80,
    rarity: 'Epic',
    levelReq: 4
  },

  // --- 3. HERBS (6 Tanaman) ---
  mint: {
    id: 'mint',
    name: 'Mint Angin Dingin (Mint)',
    category: 'herb',
    categoryName: 'Herba',
    desc: 'Daun mint segar beraroma sejuk yang sangat cocok untuk seduhan teh relaksasi.',
    icon: '🌿',
    seedIcon: '🌱',
    seedPrice: 10,
    sellPrice: 24,
    growthTime: 25,
    wateringInterval: 15,
    yieldMin: 3,
    yieldMax: 6,
    xpReward: 16,
    rarity: 'Common',
    levelReq: 1
  },
  basil: {
    id: 'basil',
    name: 'Basil Manis Kerajaan (Sweet Basil)',
    category: 'herb',
    categoryName: 'Herba',
    desc: 'Herba aromatik lezat yang sering digunakan untuk hidangan dapur peri.',
    icon: '🍃',
    seedIcon: '🌱',
    seedPrice: 12,
    sellPrice: 30,
    growthTime: 30,
    wateringInterval: 18,
    yieldMin: 3,
    yieldMax: 5,
    xpReward: 20,
    rarity: 'Common',
    levelReq: 2
  },
  rosemary: {
    id: 'rosemary',
    name: 'Rosemary Ingatan Abadi (Rosemary)',
    category: 'herb',
    categoryName: 'Herba',
    desc: 'Ranting berdaun jarum harum yang melambangkan kesetiaan dan persahabatan sejati.',
    icon: '🌱',
    seedIcon: '🌱',
    seedPrice: 18,
    sellPrice: 44,
    growthTime: 40,
    wateringInterval: 22,
    yieldMin: 2,
    yieldMax: 5,
    xpReward: 28,
    rarity: 'Uncommon',
    levelReq: 2
  },
  chamomile: {
    id: 'chamomile',
    name: 'Chamomile Bintang Tidur (Chamomile)',
    category: 'herb',
    categoryName: 'Herba',
    desc: 'Bunga chamomile kecil yang menjadi bahan utama teh pengantar mimpi indah Nyanya.',
    icon: '🌼',
    seedIcon: '🌱',
    seedPrice: 20,
    sellPrice: 50,
    growthTime: 45,
    wateringInterval: 24,
    yieldMin: 3,
    yieldMax: 6,
    xpReward: 32,
    rarity: 'Uncommon',
    levelReq: 2
  },
  thyme: {
    id: 'thyme',
    name: 'Thyme Lembah Ajaib (Thyme)',
    category: 'herb',
    categoryName: 'Herba',
    desc: 'Ranting herba mungil dengan wangi tanah basah dan rasa hangat.',
    icon: '☘️',
    seedIcon: '🌱',
    seedPrice: 22,
    sellPrice: 54,
    growthTime: 45,
    wateringInterval: 25,
    yieldMin: 2,
    yieldMax: 5,
    xpReward: 35,
    rarity: 'Uncommon',
    levelReq: 3
  },
  parsley: {
    id: 'parsley',
    name: 'Peterseli Keriting Sutra (Parsley)',
    category: 'herb',
    categoryName: 'Herba',
    desc: 'Daun hijau keriting yang segar dan cantik untuk hiasan jamuan afternoon tea.',
    icon: '🌿',
    seedIcon: '🌱',
    seedPrice: 14,
    sellPrice: 32,
    growthTime: 30,
    wateringInterval: 18,
    yieldMin: 3,
    yieldMax: 5,
    xpReward: 22,
    rarity: 'Common',
    levelReq: 2
  },

  // --- 4. FRUITS (6 Tanaman) ---
  strawberry: {
    id: 'strawberry',
    name: 'Stroberi Madu Merah (Strawberry)',
    category: 'fruit',
    categoryName: 'Buah',
    desc: 'Buah stroberi merah manis beraroma harum, bahan favorit tart kue Nyanya.',
    icon: '🍓',
    seedIcon: '🍒',
    seedPrice: 20,
    sellPrice: 50,
    growthTime: 35,
    wateringInterval: 20,
    yieldMin: 3,
    yieldMax: 6,
    xpReward: 30,
    rarity: 'Common',
    levelReq: 1
  },
  watermelon: {
    id: 'watermelon',
    name: 'Semangka Embun Manis (Watermelon)',
    category: 'fruit',
    categoryName: 'Buah',
    desc: 'Semangka berair manis yang menyegarkan dahaga saat siang di kebun.',
    icon: '🍉',
    seedIcon: '🍒',
    seedPrice: 40,
    sellPrice: 110,
    growthTime: 75,
    wateringInterval: 35,
    yieldMin: 1,
    yieldMax: 2,
    xpReward: 70,
    rarity: 'Rare',
    levelReq: 3
  },
  melon: {
    id: 'melon',
    name: 'Melon Madu Emas (Honeydew)',
    category: 'fruit',
    categoryName: 'Buah',
    desc: 'Melon manis harum bertekstur lembut seperti mentega buah.',
    icon: '🍈',
    seedIcon: '🍒',
    seedPrice: 45,
    sellPrice: 125,
    growthTime: 80,
    wateringInterval: 38,
    yieldMin: 1,
    yieldMax: 3,
    xpReward: 75,
    rarity: 'Rare',
    levelReq: 3
  },
  blueberry: {
    id: 'blueberry',
    name: 'Blueberry Kabut Senja (Blueberry)',
    category: 'fruit',
    categoryName: 'Buah',
    desc: 'Butiran buah biru gelap berkilau dengan rasa manis sedikit asam yang segar.',
    icon: '🫐',
    seedIcon: '🍒',
    seedPrice: 30,
    sellPrice: 75,
    growthTime: 55,
    wateringInterval: 26,
    yieldMin: 4,
    yieldMax: 8,
    xpReward: 48,
    rarity: 'Uncommon',
    levelReq: 2
  },
  grape: {
    id: 'grape',
    name: 'Anggur Kristal Ungu (Grape)',
    category: 'fruit',
    categoryName: 'Buah',
    desc: 'Untaian buah anggur ungu manis yang merambat indah di terali kayu greenhouse.',
    icon: '🍇',
    seedIcon: '🍒',
    seedPrice: 38,
    sellPrice: 95,
    growthTime: 65,
    wateringInterval: 30,
    yieldMin: 3,
    yieldMax: 6,
    xpReward: 60,
    rarity: 'Rare',
    levelReq: 3
  },
  lemon: {
    id: 'lemon',
    name: 'Lemon Matahari Cerah (Lemon)',
    category: 'fruit',
    categoryName: 'Buah',
    desc: 'Lemon kuning keemasan yang memberikan rasa segar ceria pada teh sore hari.',
    icon: '🍋',
    seedIcon: '🍒',
    seedPrice: 32,
    sellPrice: 80,
    growthTime: 60,
    wateringInterval: 28,
    yieldMin: 2,
    yieldMax: 5,
    xpReward: 52,
    rarity: 'Uncommon',
    levelReq: 2
  }
};

// Daily Quests Definition
export const DEFAULT_DAILY_QUESTS = [
  { id: 'quest_water_3', title: 'Siram 3 Petak Tanaman', desc: 'Gunakan watering can untuk menyirami tanaman yang haus.', target: 3, progress: 0, rewardCoins: 35, rewardXp: 40, completed: false, claimed: false },
  { id: 'quest_harvest_2', title: 'Panen 2 Hasil Tanaman', desc: 'Petik tanaman yang sudah matang sempurna.', target: 2, progress: 0, rewardCoins: 50, rewardXp: 50, completed: false, claimed: false },
  { id: 'quest_plant_3', title: 'Tanam 3 Benih Baru', desc: 'Gemburkan petak kosong dan tanam benih pilihanmu.', target: 3, progress: 0, rewardCoins: 40, rewardXp: 45, completed: false, claimed: false },
  { id: 'quest_buy_seed', title: 'Beli 1 Benih di Toko', desc: 'Kunjungi Seed Shop dan dapatkan benih baru.', target: 1, progress: 0, rewardCoins: 25, rewardXp: 30, completed: false, claimed: false }
];

// Achievements Definition
export const DEFAULT_ACHIEVEMENTS = [
  { id: 'ach_first_harvest', title: '🌱 Tunas Pertama', desc: 'Lakukan panen pertama kali di The Enchanted Greenhouse.', target: 1, progress: 0, rewardCoins: 100, rewardXp: 100, unlocked: false },
  { id: 'ach_harvester_10', title: '🧺 Petani Cilik Berbakat', desc: 'Berhasil memanen 10 tanaman dari kebun.', target: 10, progress: 0, rewardCoins: 250, rewardXp: 200, unlocked: false },
  { id: 'ach_green_thumb', title: '🌿 Tangan Emas Botani', desc: 'Siram tanaman sebanyak 15 kali.', target: 15, progress: 0, rewardCoins: 180, rewardXp: 150, unlocked: false },
  { id: 'ach_botanist_catalog', title: '📖 Penjelajah Botani', desc: 'Buka 8 jenis tanaman berbeda di Ensiklopedia Tanaman.', target: 8, progress: 0, rewardCoins: 350, rewardXp: 300, unlocked: false }
];

// Greenhouse Expansion Levels
export const GREENHOUSE_LEVELS = [
  { level: 1, name: 'Taman Tunas Pemula', xpRequired: 0, unlockedPlots: 4, desc: '4 petak tanah awal untuk sayuran dan bunga dasar.' },
  { level: 2, name: 'Konservatori Bunga Harum', xpRequired: 120, unlockedPlots: 8, desc: 'Membuka 8 petak tanah serta ragam herba dan bunga tulip.' },
  { level: 3, name: 'Kebun Buah & Labu Emas', xpRequired: 350, unlockedPlots: 12, desc: 'Membuka 12 petak tanah, semangka madu, labu raksasa, dan anggur kristal.' },
  { level: 4, name: 'Suaka Flora Langka', xpRequired: 800, unlockedPlots: 16, desc: 'Membuka 16 petak tanah dan pohon sakura abadi kitsune.' },
  { level: 5, name: 'The Master Magical Garden', xpRequired: 1600, unlockedPlots: 20, desc: 'Membuka 20 petak tanah penuh dengan pendar magis dan hasil panen melimpah!' }
];

// Initial Plots Generator (Total 20 plots possible, unlocked based on level)
export function createInitialPlots() {
  const plots = [];
  for (let i = 1; i <= 20; i++) {
    plots.push({
      id: `plot_${i}`,
      index: i,
      isUnlocked: i <= 4, // Level 1 has 4 plots unlocked
      plantId: null,
      plantedAt: null,
      lastWateredAt: null,
      isWatered: false,
      fertilizerApplied: false,
      growthProgress: 0,
      state: 'empty' // 'empty' | 'planted' | 'needs_water' | 'growing' | 'ready'
    });
  }
  return plots;
}

// Initial State Generator
export function createDefaultGreenhouseState(charKey = 'nyanya') {
  const normKey = normalizeGreenhouseCharKey(charKey);
  return {
    characterId: normKey,
    coins: 150,
    xp: 0,
    level: 1,
    seeds: {
      carrot: 4,
      rose: 3,
      mint: 3,
      strawberry: 2
    },
    harvest: {},
    fertilizers: 3,
    plots: createInitialPlots(),
    encyclopedia: {
      carrot: { discovered: true, plantedCount: 0, harvestedCount: 0 },
      rose: { discovered: true, plantedCount: 0, harvestedCount: 0 },
      mint: { discovered: true, plantedCount: 0, harvestedCount: 0 },
      strawberry: { discovered: true, plantedCount: 0, harvestedCount: 0 }
    },
    dailyQuests: JSON.parse(JSON.stringify(DEFAULT_DAILY_QUESTS)),
    achievements: JSON.parse(JSON.stringify(DEFAULT_ACHIEVEMENTS)),
    decorations: ['crystal_terrarium', 'fairy_lights'],
    soundEnabled: true,
    lastSavedTimestamp: Date.now()
  };
}

// Canonical Characters for Greenhouse
export const GREENHOUSE_CHARACTERS = {
  nyanya: { id: 'nyanya', name: 'Nyanya', symbol: '⭐', isHost: true, avatar: '/assets/avatar_nyanya_hd.png', role: 'Kidult Botanist & Fairy of Dreams' },
  lala: { id: 'lala', name: 'Lala', symbol: '☀️', isHost: false, avatar: '/assets/avatar_lala_hd.png', role: 'Everglow Sunlight Florist' },
  lele: { id: 'lele', name: 'Lele', symbol: '🌙', isHost: false, avatar: '/assets/avatar_lele_hd.png', role: 'Eclipse Moonlit Herbalist' },
  abil: { id: 'abil', name: 'Syma', symbol: '☁️', isHost: false, avatar: '/assets/avatar_abil_hd.jpg', role: 'Nine Tailed Wind Planter' },
  akhira: { id: 'akhira', name: 'Akhira', symbol: '⚡', isHost: false, avatar: '/assets/avatar_akhira_hd.jpg', role: 'Ocean Mist Hydroponics' },
  ela: { id: 'ela', name: 'Ela', symbol: '🌸', isHost: false, avatar: '/assets/avatar_ela_hd.jpg', role: 'Lotus Blossom Alchemist' },
  ruben: { id: 'ruben', name: 'Ruben', symbol: '❄️', isHost: false, avatar: '/assets/avatar_ruben_hd.jpg', role: 'Ash Frost Evergreen Gardener' },
  royan: { id: 'royan', name: 'Royan', symbol: '🎆', isHost: false, avatar: '/assets/avatar_royan_hd.jpg', role: 'Starlight Forest Warden' }
};

// Storage Manager (Per Character Isolation)
export function normalizeGreenhouseCharKey(charKey = 'nyanya') {
  if (!charKey) return 'nyanya';
  const lower = String(charKey).trim().toLowerCase();
  if (lower === 'syma' || lower === 'abil') return 'abil';
  if (lower === 'alenda') return 'nyanya';
  if (lower === 'bella') return 'lala';
  if (lower === 'vanya') return 'lele';
  return lower;
}

export function getGreenhouseStorageKey(charKey = 'nyanya') {
  const normKey = normalizeGreenhouseCharKey(charKey);
  return `olu_greenhouse_${normKey}`;
}

export function loadGreenhouseState(charKey = 'nyanya') {
  const normKey = normalizeGreenhouseCharKey(charKey);
  try {
    const key = getGreenhouseStorageKey(normKey);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = createDefaultGreenhouseState(normKey);
      saveGreenhouseState(initial, normKey);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure all 20 plots exist and merge with default structure
    if (!Array.isArray(parsed.plots) || parsed.plots.length < 20) {
      const initialPlots = createInitialPlots();
      if (Array.isArray(parsed.plots)) {
        parsed.plots.forEach((p, idx) => {
          if (initialPlots[idx]) {
            initialPlots[idx] = Object.assign({}, initialPlots[idx], p);
          }
        });
      }
      parsed.plots = initialPlots;
    }
    return parsed;
  } catch (err) {
    console.warn('[GreenhouseState] Error loading state from localStorage:', err);
    return createDefaultGreenhouseState(normKey);
  }
}

export function saveGreenhouseState(state, charKey = 'nyanya') {
  try {
    const normKey = normalizeGreenhouseCharKey(charKey || state?.characterId || 'nyanya');
    const key = getGreenhouseStorageKey(normKey);
    state.lastSavedTimestamp = Date.now();
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.warn('[GreenhouseState] Error saving state to localStorage:', err);
  }
}

// -----------------------------------------------------------------------------
// TIMESTAMP-BASED OFFLINE GROWTH ENGINE
// -----------------------------------------------------------------------------
export function updateCropsGrowth(state, now = Date.now()) {
  let hasChanges = false;

  state.plots.forEach(plot => {
    if (!plot.plantId || !plot.plantedAt || plot.state === 'empty') {
      return;
    }

    const plant = PLANT_CATALOG[plot.plantId];
    if (!plant) return;

    // Already 100% ready to harvest
    if (plot.growthProgress >= 100) {
      if (plot.state !== 'ready') {
        plot.state = 'ready';
        plot.growthProgress = 100;
        hasChanges = true;
      }
      return;
    }

    const baseGrowthSeconds = plant.growthTime;
    const speedMultiplier = plot.fertilizerApplied ? 1.5 : 1.0;
    const waterIntervalMs = (plant.wateringInterval || 20) * 1000;

    const elapsedSeconds = Math.max(0, (now - plot.plantedAt) / 1000);
    const timeSinceWatered = now - (plot.lastWateredAt || plot.plantedAt);
    const isDry = timeSinceWatered > waterIntervalMs;

    if (isDry && plot.isWatered) {
      plot.isWatered = false;
      hasChanges = true;
    }

    // Piecewise effective growth calculation (full speed when watered, slow progress when dry)
    const activeWaterWindow = ((plot.lastWateredAt ? Math.max(0, plot.lastWateredAt - plot.plantedAt) : 0) + waterIntervalMs) / 1000;
    const wateredSeconds = Math.min(elapsedSeconds, activeWaterWindow);
    const drySeconds = Math.max(0, elapsedSeconds - wateredSeconds);
    const effectiveSeconds = (wateredSeconds * 1.0 + drySeconds * 0.35) * speedMultiplier;

    const calculatedProgress = Math.min(100, Math.floor((effectiveSeconds / baseGrowthSeconds) * 100));

    if (calculatedProgress !== plot.growthProgress) {
      plot.growthProgress = calculatedProgress;
      hasChanges = true;
    }

    // Determine current visual state
    if (plot.growthProgress >= 100) {
      plot.state = 'ready';
      plot.growthProgress = 100;
      hasChanges = true;
    } else if (!plot.isWatered) {
      plot.state = 'needs_water';
    } else {
      plot.state = 'growing';
    }
  });

  return hasChanges;
}

// Visual Stage Representation (0-100%)
export function getPlantStage(progress) {
  if (progress <= 0) return { stage: 'seed', label: 'Tunas Benih', icon: '🌱' };
  if (progress < 40) return { stage: 'sprout', label: 'Tunas Muda', icon: '🌿' };
  if (progress < 80) return { stage: 'growing', label: 'Kuncup Daun', icon: '🪴' };
  if (progress < 100) return { stage: 'flowering', label: 'Menjelang Matang', icon: '🌸' };
  return { stage: 'ready', label: 'Siap Panen!', icon: '✨' };
}

// Check and update Level based on XP
export function checkLevelUp(state) {
  let leveledUp = false;
  let newLevel = state.level || 1;

  for (let i = GREENHOUSE_LEVELS.length - 1; i >= 0; i--) {
    const lvlInfo = GREENHOUSE_LEVELS[i];
    if (state.xp >= lvlInfo.xpRequired) {
      if (lvlInfo.level > newLevel) {
        newLevel = lvlInfo.level;
        leveledUp = true;
      }
      break;
    }
  }

  if (leveledUp) {
    state.level = newLevel;
    const lvlInfo = GREENHOUSE_LEVELS.find(l => l.level === newLevel);
    if (lvlInfo) {
      state.plots.forEach((p, idx) => {
        p.isUnlocked = (idx + 1) <= lvlInfo.unlockedPlots;
      });
    }
  }

  return { leveledUp, currentLevel: state.level };
}

// -----------------------------------------------------------------------------
// WEB AUDIO API PROCEDURAL SYNTHESIS
// -----------------------------------------------------------------------------
let greenhouseAudioCtx = null;

function getAudioCtx() {
  if (!greenhouseAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      greenhouseAudioCtx = new AudioContextClass();
    }
  }
  if (greenhouseAudioCtx && greenhouseAudioCtx.state === 'suspended') {
    greenhouseAudioCtx.resume().catch(() => {});
  }
  return greenhouseAudioCtx;
}

export function playWateringSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    // Water droplet bubbles
    const freqs = [659.25, 783.99, 987.77, 1318.51];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }, idx * 60);
    });
  } catch (e) {}
}

export function playHarvestSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }, idx * 70);
    });
  } catch (e) {}
}

export function playPlantingSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {}
}

export function playCoinSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const freqs = [987.77, 1318.51];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }, i * 90);
    });
  } catch (e) {}
}
