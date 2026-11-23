/**
 * =============================================================================
 * THE WHISPERING POND — FISHING SIMULATOR
 * SYMA'S UNIVERSE · PINWHEEL
 * =============================================================================
 * Fully playable relaxing fishing simulator with:
 * - 10 Fish Species across 4 rarities (Common, Rare, Epic, Legendary)
 * - 4 Rods & 4 Baits with progressive unlocks
 * - 3 Secret Fishing Areas (Whispering Shore, Moonlight Corner, Starlight Cove)
 * - Dynamic Weather & Time system (Morning, Afternoon, Rainy, Starry Night)
 * - Intuitive Reel Sweet-Spot Mini-Game (Relaxing, skill-based, no mindless spam)
 * - Cat Garden Integration (Cat companion on dock, Cat Garden pond aquarium)
 * - UID-bound persistence for Syma (olu_fishing_v2_${uid})
 */

export const SYMA_CANONICAL_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';

// ---------------------------------------------------------------------------
// 1. DATA DEFINITIONS: 10 FISH SPECIES
// ---------------------------------------------------------------------------
export const FISH_SPECIES_DEFS = {
  // COMMON
  koi: {
    id: 'koi',
    name: 'Koi',
    localName: 'Nishikigoi Magis',
    rarity: 'COMMON',
    badgeClass: 'rarity-common',
    colorHex: '#f97316',
    secondaryHex: '#ffffff',
    accentHex: '#ef4444',
    icon: '🎏',
    minLen: 30,
    maxLen: 58,
    baseExp: 15,
    description: 'Ikan karper hias berwarna jingga kemerahan dengan corak anggun yang berenang damai di tepi kolam.',
    habitat: 'Whispering Shore & perairan tenang',
    favoriteWeather: ['morning', 'afternoon'],
    favoriteBait: ['basic_bait', 'flower_bait']
  },
  goldfish: {
    id: 'goldfish',
    name: 'Goldfish',
    localName: 'Ikan Koki Emas',
    rarity: 'COMMON',
    badgeClass: 'rarity-common',
    colorHex: '#fbbf24',
    secondaryHex: '#fef08a',
    accentHex: '#f59e0b',
    icon: '🐟',
    minLen: 10,
    maxLen: 24,
    baseExp: 15,
    description: 'Ikan mungil berpipi bulat dengan ekor selendang sutra yang memancarkan kilau jingga keemasan.',
    habitat: 'Sela-sela tanaman teratai dangkal',
    favoriteWeather: ['morning', 'afternoon'],
    favoriteBait: ['basic_bait', 'flower_bait']
  },
  minnow: {
    id: 'minnow',
    name: 'Minnow',
    localName: 'Minnow Kristal',
    rarity: 'COMMON',
    badgeClass: 'rarity-common',
    colorHex: '#38bdf8',
    secondaryHex: '#bae6fd',
    accentHex: '#0284c7',
    icon: '🐟',
    minLen: 6,
    maxLen: 14,
    baseExp: 15,
    description: 'Ikan air tawar kecil yang gesit dan lincah, berenang berkelompok di dekat riak air hujan.',
    habitat: 'Aliran air jernih bebatuan',
    favoriteWeather: ['morning', 'rainy'],
    favoriteBait: ['basic_bait', 'flower_bait']
  },

  // RARE
  moonfin: {
    id: 'moonfin',
    name: 'Moonfin',
    localName: 'Ikan Sirip Rembulan',
    rarity: 'RARE',
    badgeClass: 'rarity-rare',
    colorHex: '#c084fc',
    secondaryHex: '#e9d5ff',
    accentHex: '#9333ea',
    icon: '🌙',
    minLen: 25,
    maxLen: 46,
    baseExp: 35,
    description: 'Siripnya melengkung halus layaknya bulan sabit perak, bersinar lembut di bawah malam gulita.',
    habitat: 'Moonlight Corner & perairan dalam',
    favoriteWeather: ['night', 'rainy'],
    favoriteBait: ['glow_bait', 'moonlight_bait']
  },
  silvertail: {
    id: 'silvertail',
    name: 'Silvertail',
    localName: 'Pari Ekor Perak',
    rarity: 'RARE',
    badgeClass: 'rarity-rare',
    colorHex: '#94a3b8',
    secondaryHex: '#f1f5f9',
    accentHex: '#cbd5e1',
    icon: '✨',
    minLen: 35,
    maxLen: 62,
    baseExp: 35,
    description: 'Berenang anggun meluncur di dasar kolam, meninggalkan jejak pendaran perak yang berkilau.',
    habitat: 'Dasar kolam berpasir putih',
    favoriteWeather: ['afternoon', 'night'],
    favoriteBait: ['flower_bait', 'glow_bait']
  },
  bluebell_fish: {
    id: 'bluebell_fish',
    name: 'Bluebell Fish',
    localName: 'Ikan Lonceng Biru',
    rarity: 'RARE',
    badgeClass: 'rarity-rare',
    colorHex: '#60a5fa',
    secondaryHex: '#bfdbfe',
    accentHex: '#2563eb',
    icon: '🔔',
    minLen: 18,
    maxLen: 34,
    baseExp: 35,
    description: 'Bentuk siripnya menyerupai kuncup bunga lonceng biru yang mekar sesaat setelah rintik gerimis turun.',
    habitat: 'Dermaga teratai saat hujan senja',
    favoriteWeather: ['rainy', 'afternoon'],
    favoriteBait: ['flower_bait', 'glow_bait']
  },

  // EPIC
  stardust_koi: {
    id: 'stardust_koi',
    name: 'Stardust Koi',
    localName: 'Koi Debu Bintang',
    rarity: 'EPIC',
    badgeClass: 'rarity-epic',
    colorHex: '#818cf8',
    secondaryHex: '#c7d2fe',
    accentHex: '#4f46e5',
    icon: '🌌',
    minLen: 46,
    maxLen: 78,
    baseExp: 75,
    description: 'Sisik tubuhnya memantulkan ribuan bintik nebula ungu angkasa, berenang bagai melintasi galaksi malam.',
    habitat: 'Starlight Cove & perairan dalam',
    favoriteWeather: ['night', 'afternoon'],
    favoriteBait: ['glow_bait', 'moonlight_bait']
  },
  twilight_fish: {
    id: 'twilight_fish',
    name: 'Twilight Fish',
    localName: 'Ikan Senja Lembayung',
    rarity: 'EPIC',
    badgeClass: 'rarity-epic',
    colorHex: '#f43f5e',
    secondaryHex: '#fecdd3',
    accentHex: '#e11d48',
    icon: '🌅',
    minLen: 40,
    maxLen: 72,
    baseExp: 75,
    description: 'Hanya muncul pada peralihan waktu saat semburat jingga senja menyatu dengan keheningan malam.',
    habitat: 'Tengah kolam saat senja berawan',
    favoriteWeather: ['afternoon', 'rainy'],
    favoriteBait: ['flower_bait', 'moonlight_bait']
  },

  // LEGENDARY
  celestial_fish: {
    id: 'celestial_fish',
    name: 'Celestial Fish',
    localName: 'Ikan Surgawi Angkasa',
    rarity: 'LEGENDARY',
    badgeClass: 'rarity-legendary',
    colorHex: '#facc15',
    secondaryHex: '#fef9c3',
    accentHex: '#eab308',
    icon: '🌟',
    minLen: 68,
    maxLen: 115,
    baseExp: 150,
    description: 'Makhluk mistis bersayap sirip bidadari bercahaya keemasan. Dikatakan membawa ketenangan abadi bagi pemancingnya.',
    habitat: 'Pusat pusaran Starlight Cove',
    favoriteWeather: ['night'],
    favoriteBait: ['moonlight_bait']
  },
  aurora_koi: {
    id: 'aurora_koi',
    name: 'Aurora Koi',
    localName: 'Koi Tirai Aurora',
    rarity: 'LEGENDARY',
    badgeClass: 'rarity-legendary',
    colorHex: '#2dd4bf',
    secondaryHex: '#99f6e4',
    accentHex: '#0d9488',
    icon: '🏮',
    minLen: 75,
    maxLen: 130,
    baseExp: 160,
    description: 'Pusaka legenda The Whispering Pond. Sisiknya membiaskan spektrum sembilan cahaya tirai kutub yang memukau.',
    habitat: 'Starlight Cove saat malam bertabur bintang',
    favoriteWeather: ['night', 'rainy'],
    favoriteBait: ['moonlight_bait']
  }
};

// ---------------------------------------------------------------------------
// 2. FISHING GEAR: 4 RODS & 4 BAITS
// ---------------------------------------------------------------------------
export const FISHING_RODS_DEFS = {
  beginner_rod: {
    id: 'beginner_rod',
    name: 'Beginner Rod',
    icon: '🎋',
    levelReq: 1,
    sweetSpotBonus: 0,      // % wider green zone
    biteSpeedBonus: 0,      // % faster bites
    rarityLuckBonus: 0,     // % chance modifier
    desc: 'Joran bambu sederhana berlilit tali sutra lavender, ramah dan ringan untuk pemula.'
  },
  wooden_rod: {
    id: 'wooden_rod',
    name: 'Wooden Rod',
    icon: '🎣',
    levelReq: 3,
    sweetSpotBonus: 16,
    biteSpeedBonus: 15,
    rarityLuckBonus: 10,
    desc: 'Joran kayu pohon sakura berukir halus, memberi kontrol tarikan yang lebih stabil.'
  },
  silver_rod: {
    id: 'silver_rod',
    name: 'Silver Rod',
    icon: '🦯',
    levelReq: 6,
    sweetSpotBonus: 28,
    biteSpeedBonus: 30,
    rarityLuckBonus: 25,
    desc: 'Joran perak berkilau yang sangat sensitif terhadap getaran ikan-ikan langka.'
  },
  celestial_rod: {
    id: 'celestial_rod',
    name: 'Celestial Rod',
    icon: '✨',
    levelReq: 10,
    sweetSpotBonus: 44,
    biteSpeedBonus: 45,
    rarityLuckBonus: 45,
    desc: 'Joran pusaka bertakhta kristal bintang, mampu memikat ikan legendaris ke permukaan.'
  }
};

export const FISHING_BAITS_DEFS = {
  basic_bait: {
    id: 'basic_bait',
    name: 'Basic Bait',
    icon: '🍞',
    levelReq: 1,
    rarityAffinity: 'COMMON',
    desc: 'Umpan adonan tepung manis beraroma vanila, disukai ikan kolam biasa.'
  },
  flower_bait: {
    id: 'flower_bait',
    name: 'Flower Bait',
    icon: '🌸',
    levelReq: 2,
    rarityAffinity: 'RARE',
    desc: 'Kelopak bunga teratai dan wisteria manis, memikat ikan berkarakter Rare (+35%).'
  },
  glow_bait: {
    id: 'glow_bait',
    name: 'Glow Bait',
    icon: '✨',
    levelReq: 5,
    rarityAffinity: 'EPIC',
    desc: 'Ekstrak lumut fosfor bercahaya, menarik perhatian ikan malam & Epic (+40%).'
  },
  moonlight_bait: {
    id: 'moonlight_bait',
    name: 'Moonlight Bait',
    icon: '🌙',
    levelReq: 8,
    rarityAffinity: 'LEGENDARY',
    desc: 'Tetesan embun rembulan murni, meningkatkan peluang ikan Legendary ke titik tertinggi.'
  }
};

// ---------------------------------------------------------------------------
// 3. SECRET FISHING AREAS
// ---------------------------------------------------------------------------
export const FISHING_AREAS_DEFS = {
  whispering_shore: {
    id: 'whispering_shore',
    name: 'Whispering Shore',
    localName: 'Tepi Berbisik',
    icon: '🌾',
    levelReq: 1,
    minCatches: 0,
    desc: 'Tepi kolam berumput lembut dengan dermaga kayu dan bunga teratai bermekaran.',
    ambientClass: 'area-shore',
    fishPool: ['koi', 'goldfish', 'minnow', 'silvertail', 'bluebell_fish']
  },
  moonlight_corner: {
    id: 'moonlight_corner',
    name: 'Moonlight Corner',
    localName: 'Sudut Rembulan',
    icon: '🪻',
    levelReq: 4,
    minCatches: 8,
    desc: 'Sudut tersembunyi di bawah naungan pohon wisteria perak yang meneduhkan.',
    ambientClass: 'area-corner',
    fishPool: ['koi', 'minnow', 'moonfin', 'silvertail', 'bluebell_fish', 'twilight_fish']
  },
  starlight_cove: {
    id: 'starlight_cove',
    name: 'Starlight Cove',
    localName: 'Teluk Cahaya Bintang',
    icon: '🌌',
    levelReq: 8,
    minCatches: 20,
    minRareCatches: 1,
    desc: 'Teluk suci terdalam tempat air memantulkan rasi bintang dan aurora sembilan warna.',
    ambientClass: 'area-cove',
    fishPool: ['moonfin', 'silvertail', 'stardust_koi', 'twilight_fish', 'celestial_fish', 'aurora_koi']
  }
};

// ---------------------------------------------------------------------------
// 4. WEATHER & TIME SYSTEMS
// ---------------------------------------------------------------------------
export const WEATHER_SYSTEM_DEFS = {
  morning: {
    id: 'morning',
    name: 'Sunny Morning',
    localName: 'Pagi Cerah Hangat',
    icon: '☀️',
    badge: '☀️ Sunny Morning',
    skyGradient: 'linear-gradient(180deg, #1e1b4b 0%, #2e1065 40%, #fdba74 85%, #fef08a 100%)',
    waterTint: 'rgba(254, 240, 138, 0.15)',
    description: 'Cahaya pagi keemasan membelai air yang tenang. Ikan Koi dan Goldfish sangat aktif berenang.'
  },
  afternoon: {
    id: 'afternoon',
    name: 'Cloudy Afternoon',
    localName: 'Sore Teduh Lembayung',
    icon: '⛅',
    badge: '⛅ Cloudy Afternoon',
    skyGradient: 'linear-gradient(180deg, #0f172a 0%, #3b0764 45%, #701a75 75%, #f472b6 100%)',
    waterTint: 'rgba(233, 213, 255, 0.16)',
    description: 'Awan lembut melayang dengan semburat lavender. Waktu favorit bagi Silvertail dan Twilight Fish.'
  },
  rainy: {
    id: 'rainy',
    name: 'Rainy Evening',
    localName: 'Gerimis Senja Syahdu',
    icon: '🌧️',
    badge: '🌧️ Rainy Evening',
    skyGradient: 'linear-gradient(180deg, #020617 0%, #0f172a 40%, #1e293b 80%, #334155 100%)',
    waterTint: 'rgba(147, 197, 253, 0.22)',
    description: 'Rintik hujan senja menciptakan ribuan riak melingkar. Minnow dan Bluebell Fish bermunculan.'
  },
  night: {
    id: 'night',
    name: 'Starry Night',
    localName: 'Malam Cahaya Bulan',
    icon: '🌙',
    badge: '🌙 Starry Night',
    skyGradient: 'linear-gradient(180deg, #030712 0%, #09090b 40%, #180d38 80%, #2e1065 100%)',
    waterTint: 'rgba(192, 132, 252, 0.22)',
    description: 'Malam sunyi bertabur konstelasi bintang. Makhluk legendaris seperti Celestial Fish dan Aurora Koi terbangun.'
  }
};

// ---------------------------------------------------------------------------
// 5. PROGRESSION & LEVEL THRESHOLDS
// ---------------------------------------------------------------------------
export const FISHING_LEVELS = [
  { level: 1, title: 'Pemula Kolam', expReq: 0, reward: 'Beginner Rod & Basic Bait' },
  { level: 2, title: 'Penangkap Teratai', expReq: 50, reward: 'Umpan Bunga (Flower Bait)' },
  { level: 3, title: 'Penjelajah Kolam', expReq: 120, reward: 'Joran Sakura (Wooden Rod)' },
  { level: 4, title: 'Penjaga Senja', expReq: 220, reward: 'Area Rahasia: Moonlight Corner' },
  { level: 5, title: 'Pemanis Cahaya', expReq: 350, reward: 'Umpan Fosfor (Glow Bait)' },
  { level: 6, title: 'Nelayan Perak', expReq: 500, reward: 'Joran Perak (Silver Rod)' },
  { level: 7, title: 'Pawang Malam', expReq: 700, reward: 'Trophy Ikan Perak & Gelar' },
  { level: 8, title: 'Penakluk Bintang', expReq: 950, reward: 'Area Rahasia: Starlight Cove & Moonlight Bait' },
  { level: 9, title: 'Maestro Kolam', expReq: 1250, reward: 'Kemampuan Intuisi Ikan Legendaris' },
  { level: 10, title: 'Pemancing Surgawi', expReq: 1600, reward: 'Joran Pusaka (Celestial Rod)' }
];

export function calculateFishingLevel(totalExp = 0) {
  let cur = FISHING_LEVELS[0];
  let next = FISHING_LEVELS[1];
  for (let i = FISHING_LEVELS.length - 1; i >= 0; i--) {
    if (totalExp >= FISHING_LEVELS[i].expReq) {
      cur = FISHING_LEVELS[i];
      next = FISHING_LEVELS[i + 1] || null;
      break;
    }
  }

  const expInLevel = totalExp - cur.expReq;
  const expNeeded = next ? next.expReq - cur.expReq : 1;
  const progressPercent = next ? Math.min(100, Math.floor((expInLevel / expNeeded) * 100)) : 100;

  return {
    level: cur.level,
    title: cur.title,
    currentExp: totalExp,
    nextLevelReq: next ? next.expReq : null,
    progressPercent,
    reward: cur.reward
  };
}

// ---------------------------------------------------------------------------
// 6. SVG FISH GRAPHICS GENERATOR
// ---------------------------------------------------------------------------
export function renderFishSvg(fishDef, size = 120, isSilhouette = false) {
  if (isSilhouette) {
    return `
      <svg width="${size}" height="${Math.round(size * 0.65)}" viewBox="0 0 100 65" class="fish-silhouette-svg" aria-label="Ikan Tersembunyi">
        <path d="M15,32 Q25,12 55,20 Q85,28 92,32 Q85,36 55,44 Q25,52 15,32 Z" fill="#1e1b4b" opacity="0.65"/>
        <path d="M15,32 L2,18 Q12,32 2,46 Z" fill="#1e1b4b" opacity="0.65"/>
        <text x="50" y="38" text-anchor="middle" font-size="18" fill="#a855f7" font-weight="bold">?</text>
      </svg>
    `;
  }

  const c1 = fishDef.colorHex || '#f97316';
  const c2 = fishDef.secondaryHex || '#ffffff';
  const c3 = fishDef.accentHex || '#ea580c';
  const id = fishDef.id;

  let bodyMarkup = '';

  if (id === 'koi' || id === 'aurora_koi') {
    // Flowing carp shape with fins
    bodyMarkup = `
      <defs>
        <linearGradient id="grad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c2}"/>
          <stop offset="60%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c3}"/>
        </linearGradient>
      </defs>
      <!-- Fins -->
      <path d="M45,22 Q52,10 65,16 Q58,24 50,23" fill="${c2}" opacity="0.8"/>
      <path d="M45,43 Q52,55 65,49 Q58,41 50,42" fill="${c2}" opacity="0.8"/>
      <!-- Tail -->
      <path d="M18,32 Q6,12 2,16 Q10,32 2,48 Q6,52 18,32" fill="${c2}" opacity="0.85"/>
      <!-- Main Body -->
      <path d="M18,32 Q32,15 62,22 Q88,28 95,32 Q88,36 62,42 Q32,49 18,32 Z" fill="url(#grad_${id})"/>
      <!-- Pattern Patches -->
      <ellipse cx="68" cy="30" rx="9" ry="6" fill="${c3}" opacity="0.85" transform="rotate(-10 68 30)"/>
      <ellipse cx="44" cy="33" rx="11" ry="5" fill="${c3}" opacity="0.85" transform="rotate(15 44 33)"/>
      <!-- Eye -->
      <circle cx="86" cy="30" r="2.8" fill="#0f172a"/>
      <circle cx="87" cy="29" r="1" fill="#ffffff"/>
      <!-- Whiskers -->
      <path d="M94,30 Q99,28 101,31" stroke="${c2}" stroke-width="1.2" fill="none"/>
      <path d="M94,34 Q99,36 101,33" stroke="${c2}" stroke-width="1.2" fill="none"/>
    `;
  } else if (id === 'goldfish') {
    // Chubby round body with large fan fins
    bodyMarkup = `
      <defs>
        <radialGradient id="grad_gold" cx="60%" cy="40%" r="55%">
          <stop offset="0%" stop-color="${c2}"/>
          <stop offset="50%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c3}"/>
        </radialGradient>
      </defs>
      <!-- Flowing double tail -->
      <path d="M25,32 Q10,10 2,12 Q8,30 2,42 Q8,48 2,52 Q14,54 25,32" fill="${c2}" opacity="0.8"/>
      <!-- Chubby Body -->
      <ellipse cx="56" cy="32" rx="30" ry="21" fill="url(#grad_gold)"/>
      <!-- Big cute eye -->
      <circle cx="76" cy="27" r="4.2" fill="#0f172a"/>
      <circle cx="77.5" cy="25.5" r="1.5" fill="#ffffff"/>
      <!-- Dorsal fin -->
      <path d="M45,11 Q55,4 66,12" stroke="${c1}" stroke-width="3" fill="none"/>
      <!-- Pectoral fin -->
      <path d="M60,38 Q64,48 72,42 Q66,36 60,38" fill="${c2}" opacity="0.85"/>
    `;
  } else if (id === 'moonfin' || id === 'celestial_fish') {
    // Elegant crescent / angelic winged fish
    bodyMarkup = `
      <defs>
        <linearGradient id="grad_cel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c3}"/>
        </linearGradient>
      </defs>
      <!-- Angelic Wings / Crescent Fins -->
      <path d="M50,22 Q60,2 78,8 Q68,22 55,24" fill="${c2}" opacity="0.9"/>
      <path d="M50,42 Q60,62 78,56 Q68,42 55,40" fill="${c2}" opacity="0.9"/>
      <!-- Crescent Tail -->
      <path d="M20,32 Q6,8 2,12 Q14,32 2,52 Q6,56 20,32" fill="${c2}" opacity="0.95"/>
      <!-- Body -->
      <path d="M20,32 Q36,16 68,22 Q92,28 97,32 Q92,36 68,42 Q36,48 20,32 Z" fill="url(#grad_cel)"/>
      <!-- Halo glow shimmer -->
      <circle cx="60" cy="32" r="14" fill="${c2}" opacity="0.25" filter="blur(2px)"/>
      <!-- Eye -->
      <circle cx="88" cy="30" r="3" fill="#312e81"/>
      <circle cx="89" cy="29" r="1.2" fill="#ffffff"/>
      <!-- Sparkles -->
      <circle cx="48" cy="31" r="1.5" fill="#ffffff"/>
      <circle cx="68" cy="33" r="2" fill="#ffffff"/>
      <circle cx="34" cy="32" r="1.2" fill="#ffffff"/>
    `;
  } else {
    // Classic streamlined fish (Minnow, Silvertail, Bluebell, Stardust, Twilight)
    bodyMarkup = `
      <defs>
        <linearGradient id="grad_stream_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c2}"/>
          <stop offset="60%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c3}"/>
        </linearGradient>
      </defs>
      <!-- Tail fin -->
      <path d="M20,32 L4,16 Q12,32 4,48 Z" fill="${c2}" opacity="0.85"/>
      <!-- Dorsal & Ventral -->
      <path d="M48,20 Q56,12 66,19" fill="${c2}" opacity="0.8"/>
      <path d="M50,44 Q56,52 64,45" fill="${c2}" opacity="0.8"/>
      <!-- Body -->
      <path d="M20,32 Q35,18 65,22 Q90,28 96,32 Q90,36 65,42 Q35,46 20,32 Z" fill="url(#grad_stream_${id})"/>
      <!-- Eye -->
      <circle cx="86" cy="30" r="2.8" fill="#0f172a"/>
      <circle cx="87" cy="29" r="1" fill="#ffffff"/>
      <!-- Lateral Line -->
      <path d="M25,32 Q58,32 82,31" stroke="${c2}" stroke-width="1" stroke-dasharray="2,2" opacity="0.75" fill="none"/>
    `;
  }

  return `
    <svg width="${size}" height="${Math.round(size * 0.65)}" viewBox="0 0 100 65" class="fish-live-svg" aria-label="${fishDef.name}">
      ${bodyMarkup}
    </svg>
  `;
}

// ---------------------------------------------------------------------------
// 7. DEFAULT STATE FACTORY & PERSISTENCE
// ---------------------------------------------------------------------------
export function createDefaultFishingState(uid = SYMA_CANONICAL_UID) {
  return {
    uid,
    version: 2,
    exp: 0,
    level: 1,
    activeRod: 'beginner_rod',
    activeBait: 'basic_bait',
    activeArea: 'whispering_shore',
    weather: 'night',          // Default enchanting PINWHEEL mood
    totalCatches: 0,
    fishCounts: {
      koi: 0,
      goldfish: 0,
      minnow: 0,
      moonfin: 0,
      silvertail: 0,
      bluebell_fish: 0,
      stardust_koi: 0,
      twilight_fish: 0,
      celestial_fish: 0,
      aurora_koi: 0
    },
    fishRecords: {},          // { [id]: maxLenNumber }
    fishFirstCaught: {},      // { [id]: timestamp }
    unlockedRods: ['beginner_rod'],
    unlockedBaits: ['basic_bait'],
    unlockedAreas: ['whispering_shore'],
    journal: [],              // History of recent catches
    selectedAquariumFish: 'koi' // Prop in Cat Garden
  };
}

export function getFishingStorageKey(uid = SYMA_CANONICAL_UID) {
  return `olu_fishing_v2_${uid || SYMA_CANONICAL_UID}`;
}

export function loadFishingState(uid = SYMA_CANONICAL_UID) {
  const key = getFishingStorageKey(uid);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Check legacy v1 key migration
      const legacyKey = `olu_fishing_collection_${uid || SYMA_CANONICAL_UID}`;
      const legacyRaw = localStorage.getItem(legacyKey);
      const state = createDefaultFishingState(uid);
      if (legacyRaw) {
        try {
          const oldList = JSON.parse(legacyRaw);
          if (Array.isArray(oldList) && oldList.length > 0) {
            oldList.forEach(item => {
              // Map old fish name to species
              const lower = (item.name || '').toLowerCase();
              let matchedId = 'koi';
              if (lower.includes('koi')) matchedId = 'koi';
              else if (lower.includes('carp') || lower.includes('moon')) matchedId = 'moonfin';
              else if (lower.includes('guppy') || lower.includes('celestial')) matchedId = 'celestial_fish';
              else if (lower.includes('betta') || lower.includes('sakura')) matchedId = 'bluebell_fish';
              else if (lower.includes('dragon') || lower.includes('violet')) matchedId = 'stardust_koi';

              state.totalCatches += 1;
              state.fishCounts[matchedId] = (state.fishCounts[matchedId] || 0) + 1;
              state.exp += 25;
              if (!state.fishFirstCaught[matchedId]) state.fishFirstCaught[matchedId] = item.caughtAt || Date.now();
              const curMax = state.fishRecords[matchedId] || 0;
              if ((item.length || 0) > curMax) state.fishRecords[matchedId] = item.length;
            });
            // Recalculate level
            const lvl = calculateFishingLevel(state.exp);
            state.level = lvl.level;
            updateUnlockedAssets(state);
            saveFishingState(state, uid);
          }
        } catch (_) {}
      }
      return state;
    }
    const parsed = JSON.parse(raw);
    // Ensure all 10 fish keys exist
    if (!parsed.fishCounts) parsed.fishCounts = {};
    Object.keys(FISH_SPECIES_DEFS).forEach(k => {
      if (typeof parsed.fishCounts[k] !== 'number') parsed.fishCounts[k] = 0;
    });
    if (!parsed.fishRecords) parsed.fishRecords = {};
    if (!parsed.fishFirstCaught) parsed.fishFirstCaught = {};
    if (!Array.isArray(parsed.journal)) parsed.journal = [];
    if (!Array.isArray(parsed.unlockedRods)) parsed.unlockedRods = ['beginner_rod'];
    if (!Array.isArray(parsed.unlockedBaits)) parsed.unlockedBaits = ['basic_bait'];
    if (!Array.isArray(parsed.unlockedAreas)) parsed.unlockedAreas = ['whispering_shore'];
    return parsed;
  } catch (_) {
    return createDefaultFishingState(uid);
  }
}

export function saveFishingState(state, uid = SYMA_CANONICAL_UID) {
  if (!state) return;
  const key = getFishingStorageKey(uid || state.uid || SYMA_CANONICAL_UID);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (_) {}
}

export function updateUnlockedAssets(state) {
  const lvl = state.level;
  const catches = state.totalCatches;

  // Rods
  Object.values(FISHING_RODS_DEFS).forEach(rod => {
    if (lvl >= rod.levelReq && !state.unlockedRods.includes(rod.id)) {
      state.unlockedRods.push(rod.id);
    }
  });

  // Baits
  Object.values(FISHING_BAITS_DEFS).forEach(bait => {
    if (lvl >= bait.levelReq && !state.unlockedBaits.includes(bait.id)) {
      state.unlockedBaits.push(bait.id);
    }
  });

  // Areas
  if (lvl >= 4 && catches >= 8 && !state.unlockedAreas.includes('moonlight_corner')) {
    state.unlockedAreas.push('moonlight_corner');
  }
  const hasRareOrEpic = Object.entries(state.fishCounts).some(([k, count]) => {
    const r = FISH_SPECIES_DEFS[k]?.rarity;
    return (r === 'RARE' || r === 'EPIC' || r === 'LEGENDARY') && count > 0;
  });
  if (lvl >= 8 && catches >= 20 && hasRareOrEpic && !state.unlockedAreas.includes('starlight_cove')) {
    state.unlockedAreas.push('starlight_cove');
  }
}

// ---------------------------------------------------------------------------
// 8. RANDOM FISH SELECTION ALGORITHM
// ---------------------------------------------------------------------------
export function pickRandomFish(state) {
  const areaDef = FISHING_AREAS_DEFS[state.activeArea] || FISHING_AREAS_DEFS.whispering_shore;
  const rodDef = FISHING_RODS_DEFS[state.activeRod] || FISHING_RODS_DEFS.beginner_rod;
  const baitDef = FISHING_BAITS_DEFS[state.activeBait] || FISHING_BAITS_DEFS.basic_bait;
  const curWeather = state.weather || 'night';

  const pool = areaDef.fishPool.map(id => FISH_SPECIES_DEFS[id]).filter(Boolean);

  // Compute weighted scores for each fish
  const weighted = pool.map(fish => {
    let weight = 100;

    // Rarity base weights
    if (fish.rarity === 'COMMON') weight = 120;
    else if (fish.rarity === 'RARE') weight = 55;
    else if (fish.rarity === 'EPIC') weight = 24;
    else if (fish.rarity === 'LEGENDARY') weight = 8;

    // Weather bonus (+40%)
    if (Array.isArray(fish.favoriteWeather) && fish.favoriteWeather.includes(curWeather)) {
      weight *= 1.45;
    }

    // Bait affinity bonus
    if (baitDef.rarityAffinity === fish.rarity) {
      weight *= 1.55;
    }

    // Rod luck bonus
    if (fish.rarity !== 'COMMON') {
      weight *= (1 + (rodDef.rarityLuckBonus / 100));
    }

    return { fish, weight };
  });

  const totalWeight = weighted.reduce((acc, w) => acc + w.weight, 0);
  let randomVal = Math.random() * totalWeight;

  for (const item of weighted) {
    if (randomVal < item.weight) {
      return item.fish;
    }
    randomVal -= item.weight;
  }

  return pool[0] || FISH_SPECIES_DEFS.koi;
}

// ---------------------------------------------------------------------------
// 9. CONTROLLER INITIALIZER
// ---------------------------------------------------------------------------
export function initFishingPondController(options = {}) {
  const { onShowToast, onTriggerSparkle } = options;

  let audioCtx = null;
  let currentUid = SYMA_CANONICAL_UID;
  let state = loadFishingState(currentUid);

  // Gameplay state
  // 'idle' | 'casting' | 'waiting' | 'biting' | 'reeling' | 'caught' | 'escaped'
  let fishingStatus = 'idle';
  let biteTimer = null;
  let biteEscapeTimer = null;
  let pendingFish = null;

  // Mini-game variables
  let miniGameActive = false;
  let fishPos = 50;           // 0 to 100
  let hookPos = 50;           // 0 to 100
  let hookVelocity = 0;
  let isHoldingReel = false;
  let sweetSpotSize = 24;     // percentage width of the green sweet spot
  let catchProgress = 35;     // 0 to 100
  let miniGameAnimFrame = null;
  let miniGameDuration = 0;

  // DOM references
  const overlay = document.getElementById('pinwheel-whispering-pond-overlay');
  const modalFishing = document.getElementById('pinwheel-fishing-modal');

  // Mini-game DOM elements
  const miniGamePanel = document.getElementById('fishing-reeling-minigame');
  const miniGameFish = document.getElementById('reeling-fish-indicator');
  const miniGameSweetSpot = document.getElementById('reeling-sweet-spot');
  const miniGameHook = document.getElementById('reeling-hook-cursor');
  const miniGameProgressBar = document.getElementById('reeling-catch-progress-fill');
  const miniGameStatusText = document.getElementById('reeling-status-hint');
  const btnReelHold = document.getElementById('btn-reeling-hold');

  // Main UI Action Buttons
  const btnCast = document.getElementById('btn-pond-cast-action');
  const pondWaterSurface = document.getElementById('whispering-pond-water');
  const bobberEl = document.getElementById('whispering-pond-bobber');
  const biteAlertEl = document.getElementById('whispering-pond-bite-alert');
  const speechBubbleEl = document.getElementById('whispering-pond-cat-speech');
  const catCompanionEl = document.getElementById('whispering-pond-cat-companion');
  const weatherBadgeEl = document.getElementById('pond-weather-badge');
  const areaBadgeEl = document.getElementById('pond-area-badge');
  const levelBadgeEl = document.getElementById('pond-level-badge');
  const expFillEl = document.getElementById('pond-exp-fill');
  const expTextEl = document.getElementById('pond-exp-text');

  // Catch celebration modal
  const catchModal = document.getElementById('fishing-catch-modal');

  // Sound Synth Helpers
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, dur = 0.25, type = 'sine', gainVal = 0.12) {
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (_) {}
  }

  function playSplashSfx() {
    playTone(180, 0.35, 'triangle', 0.15);
    setTimeout(() => playTone(120, 0.4, 'sine', 0.1), 80);
  }

  function playBiteSfx() {
    playTone(720, 0.12, 'square', 0.16);
    setTimeout(() => playTone(880, 0.18, 'triangle', 0.22), 90);
  }

  function playCatchFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      setTimeout(() => playTone(f, 0.35, 'triangle', 0.18), idx * 120);
    });
  }

  // -------------------------------------------------------------------------
  // DOM UPDATES & RENDERING
  // -------------------------------------------------------------------------
  function updateHeaderStats() {
    const lvlInfo = calculateFishingLevel(state.exp);
    state.level = lvlInfo.level;
    updateUnlockedAssets(state);

    if (levelBadgeEl) levelBadgeEl.textContent = `Lv. ${state.level} • ${lvlInfo.title}`;
    if (expFillEl) expFillEl.style.width = `${lvlInfo.progressPercent}%`;
    if (expTextEl) {
      if (lvlInfo.nextLevelReq) {
        expTextEl.textContent = `${state.exp} / ${lvlInfo.nextLevelReq} EXP (${lvlInfo.progressPercent}%)`;
      } else {
        expTextEl.textContent = `${state.exp} EXP (Level Maksimal)`;
      }
    }

    const curW = WEATHER_SYSTEM_DEFS[state.weather] || WEATHER_SYSTEM_DEFS.night;
    if (weatherBadgeEl) {
      weatherBadgeEl.textContent = curW.badge;
      weatherBadgeEl.title = curW.description;
    }

    const curA = FISHING_AREAS_DEFS[state.activeArea] || FISHING_AREAS_DEFS.whispering_shore;
    if (areaBadgeEl) {
      areaBadgeEl.textContent = `${curA.icon} ${curA.name}`;
      areaBadgeEl.title = curA.desc;
    }

    // Apply environment styling
    if (overlay) {
      overlay.className = `pinwheel-whispering-pond-overlay active weather-${state.weather} area-${state.activeArea}`;
      const backdrop = overlay.querySelector('.pond-environment-backdrop');
      if (backdrop) backdrop.style.background = curW.skyGradient;
      const waterEl = overlay.querySelector('.whispering-pond-water');
      if (waterEl) waterEl.style.backgroundColor = curW.waterTint;
    }
  }

  function updateCatCompanion() {
    // Read active cat name & sprite from Cat Garden
    let catName = 'Mochi';
    try {
      const catStateRaw = localStorage.getItem(`olu_catcare_v1_${currentUid}`) || localStorage.getItem('olu_catcare_v1_abil');
      if (catStateRaw) {
        const catState = JSON.parse(catStateRaw);
        const activeCat = catState.cats?.find(c => c.slot === catState.activeCatSlot);
        if (activeCat && activeCat.name) catName = activeCat.name;
      }
    } catch (_) {}

    if (catCompanionEl) {
      const nameTag = catCompanionEl.querySelector('.pond-cat-nametag');
      if (nameTag) nameTag.textContent = catName;
    }

    return catName;
  }

  function setCatSpeech(text, duration = 3500) {
    if (!speechBubbleEl) return;
    speechBubbleEl.textContent = text;
    speechBubbleEl.classList.add('visible');
    setTimeout(() => {
      if (speechBubbleEl) speechBubbleEl.classList.remove('visible');
    }, duration);
  }

  // -------------------------------------------------------------------------
  // GAMEPLAY FLOW: CAST -> WAIT -> BITE -> REEL MINI-GAME -> CATCH
  // -------------------------------------------------------------------------
  function castRod() {
    if (fishingStatus !== 'idle') return;

    fishingStatus = 'casting';
    const catName = updateCatCompanion();
    setCatSpeech(`"Mew~ kail Syma melayang jauh ke tengah kolam! Perhatikan airnya ya! 🌸"`);

    if (btnCast) {
      btnCast.disabled = true;
      btnCast.innerHTML = `<span>Menunggu Ikan...</span> <span class="spinner-icon">⏳</span>`;
    }

    playTone(440, 0.25, 'sine', 0.12);

    // Animate bobber
    if (bobberEl) {
      bobberEl.className = 'whispering-pond-bobber cast';
      bobberEl.style.display = 'block';
    }

    setTimeout(() => {
      playSplashSfx();
      fishingStatus = 'waiting';

      // Pick pending fish
      pendingFish = pickRandomFish(state);

      // Speed bonus from rod
      const rod = FISHING_RODS_DEFS[state.activeRod] || FISHING_RODS_DEFS.beginner_rod;
      const baseDelay = 2200 + Math.random() * 2000;
      const actualDelay = Math.max(1200, baseDelay * (1 - rod.biteSpeedBonus / 100));

      biteTimer = setTimeout(() => {
        triggerBite();
      }, actualDelay);

    }, 600);
  }

  function triggerBite() {
    if (fishingStatus !== 'waiting') return;

    fishingStatus = 'biting';
    playBiteSfx();

    if (bobberEl) bobberEl.className = 'whispering-pond-bobber bite-tugging';
    if (biteAlertEl) biteAlertEl.style.display = 'flex';

    setCatSpeech(`"NYAAA! Pelampungnya ditarik ke dalam air! CEPAT TARIK, SYMA! ⚡"`);

    if (btnCast) {
      btnCast.disabled = false;
      btnCast.className = 'pinwheel-pond-action-btn btn-bite-active';
      btnCast.innerHTML = `<span>TARIK KAIL SEKARANG! ⚡</span>`;
    }

    // Bite window (2.4 seconds to respond before fish escapes)
    const rod = FISHING_RODS_DEFS[state.activeRod] || FISHING_RODS_DEFS.beginner_rod;
    const biteWindow = 2400 + (rod.biteSpeedBonus * 10);

    biteEscapeTimer = setTimeout(() => {
      if (fishingStatus === 'biting') {
        fishEscaped();
      }
    }, biteWindow);
  }

  function fishEscaped() {
    clearTimeout(biteEscapeTimer);
    clearTimeout(biteTimer);
    fishingStatus = 'idle';

    if (bobberEl) {
      bobberEl.className = 'whispering-pond-bobber';
      bobberEl.style.display = 'none';
    }
    if (biteAlertEl) biteAlertEl.style.display = 'none';

    setCatSpeech(`"Aduh, ikannya terlepas! Jangan menyerah, ayo lempar kail lagi, Syma! ✨"`);

    if (btnCast) {
      btnCast.disabled = false;
      btnCast.className = 'pinwheel-pond-action-btn';
      btnCast.innerHTML = `<span>LEMPAR KAIL 🎣</span>`;
    }

    if (onShowToast) onShowToast('Ikan berhasil lolos dari kail! Coba lagi.');
  }

  // -------------------------------------------------------------------------
  // REEL SWEET-SPOT MINI-GAME
  // -------------------------------------------------------------------------
  function startReelMiniGame() {
    clearTimeout(biteEscapeTimer);
    fishingStatus = 'reeling';

    if (biteAlertEl) biteAlertEl.style.display = 'none';
    if (btnCast) {
      btnCast.disabled = true;
      btnCast.innerHTML = `<span>Menggulung Senar...</span>`;
    }

    // Determine sweet spot width based on equipped rod
    const rod = FISHING_RODS_DEFS[state.activeRod] || FISHING_RODS_DEFS.beginner_rod;
    sweetSpotSize = Math.min(55, 24 + rod.sweetSpotBonus * 0.4);

    // Initial positions
    fishPos = 50;
    hookPos = 50;
    hookVelocity = 0;
    catchProgress = 35;
    isHoldingReel = false;
    miniGameDuration = 0;
    miniGameActive = true;

    if (miniGameSweetSpot) miniGameSweetSpot.style.width = `${sweetSpotSize}%`;
    if (miniGamePanel) miniGamePanel.classList.add('active');

    // Fish movement target & speed
    let fishTarget = 50;
    let fishMoveCooldown = 0;
    const fishDifficulty = pendingFish?.rarity === 'LEGENDARY' ? 2.2 :
                           pendingFish?.rarity === 'EPIC' ? 1.6 :
                           pendingFish?.rarity === 'RARE' ? 1.2 : 0.8;

    function miniGameLoop() {
      if (!miniGameActive) return;

      miniGameDuration += 1;

      // Move fish organically towards fishTarget
      fishMoveCooldown -= 1;
      if (fishMoveCooldown <= 0) {
        fishTarget = Math.max(10, Math.min(90, Math.random() * 100));
        fishMoveCooldown = Math.floor(25 + Math.random() * 35 / fishDifficulty);
      }
      fishPos += (fishTarget - fishPos) * (0.04 * fishDifficulty);

      // Hook physics: holding pushes right/up, releasing falls back left/down
      if (isHoldingReel) {
        hookVelocity += 0.85;
      } else {
        hookVelocity -= 0.65;
      }
      hookVelocity *= 0.88; // drag
      hookPos += hookVelocity;
      hookPos = Math.max(0, Math.min(100 - sweetSpotSize, hookPos));

      // Sweet spot follows hook position
      const sweetStart = hookPos;
      const sweetEnd = hookPos + sweetSpotSize;

      // Check if fish is inside sweet spot!
      const isInside = fishPos >= sweetStart && fishPos <= sweetEnd;

      if (isInside) {
        catchProgress += 0.65; // Fill progress
        if (miniGamePanel) miniGamePanel.classList.add('in-zone');
        if (miniGameStatusText) miniGameStatusText.textContent = '✨ IKAN BERADA DALAM JANGKAUAN! TAHAN! ✨';
        if (miniGameDuration % 10 === 0) playTone(587.33, 0.08, 'triangle', 0.08);
      } else {
        catchProgress -= 0.28; // Slow decay
        if (miniGamePanel) miniGamePanel.classList.remove('in-zone');
        if (miniGameStatusText) miniGameStatusText.textContent = 'Tahan tombol REEL agar kail sejajar dengan ikan!';
      }

      catchProgress = Math.max(0, Math.min(100, catchProgress));

      // Update Mini-game DOM elements
      if (miniGameFish) miniGameFish.style.left = `${fishPos}%`;
      if (miniGameSweetSpot) miniGameSweetSpot.style.left = `${hookPos}%`;
      if (miniGameProgressBar) miniGameProgressBar.style.width = `${catchProgress}%`;

      // Check win/lose conditions
      if (catchProgress >= 100) {
        completeCatch();
        return;
      }
      if (catchProgress <= 0 && miniGameDuration > 90) {
        // Escaped from mini-game
        endMiniGame();
        fishEscaped();
        return;
      }

      miniGameAnimFrame = requestAnimationFrame(miniGameLoop);
    }

    miniGameAnimFrame = requestAnimationFrame(miniGameLoop);
  }

  function endMiniGame() {
    miniGameActive = false;
    if (miniGameAnimFrame) cancelAnimationFrame(miniGameAnimFrame);
    if (miniGamePanel) miniGamePanel.classList.remove('active', 'in-zone');
  }

  function completeCatch() {
    endMiniGame();
    fishingStatus = 'caught';

    if (bobberEl) {
      bobberEl.className = 'whispering-pond-bobber';
      bobberEl.style.display = 'none';
    }

    playCatchFanfare();

    const fish = pendingFish || FISH_SPECIES_DEFS.koi;
    const randomLen = Number((fish.minLen + Math.random() * (fish.maxLen - fish.minLen)).toFixed(1));

    // Check if new species
    const isFirstTime = !state.fishCounts[fish.id] || state.fishCounts[fish.id] === 0;

    // Check if new record
    const prevRecord = state.fishRecords[fish.id] || 0;
    const isNewRecord = randomLen > prevRecord;

    // Update state
    state.totalCatches += 1;
    state.fishCounts[fish.id] = (state.fishCounts[fish.id] || 0) + 1;
    if (isNewRecord) state.fishRecords[fish.id] = randomLen;
    if (isFirstTime) state.fishFirstCaught[fish.id] = Date.now();

    // Calculate EXP gained
    const expGained = fish.baseExp;
    const prevLevel = state.level;
    state.exp += expGained;

    // Add to journal
    state.journal.unshift({
      id: fish.id,
      name: fish.name,
      localName: fish.localName,
      rarity: fish.rarity,
      length: randomLen,
      area: state.activeArea,
      weather: state.weather,
      caughtAt: Date.now()
    });
    if (state.journal.length > 30) state.journal.pop();

    saveFishingState(state, currentUid);

    // Cat reacts to catch
    setCatSpeech(`"HOREEE! Syma berhasil menangkap ${fish.name}! Sisiknya berkilau indah sekali! 🐟✨"`);

    if (btnCast) {
      btnCast.disabled = false;
      btnCast.className = 'pinwheel-pond-action-btn';
      btnCast.innerHTML = `<span>LEMPAR KAIL LAGI 🎣</span>`;
    }

    if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);

    // Show catch celebration modal
    showCatchModal(fish, randomLen, expGained, isFirstTime, isNewRecord);

    // Check Level Up
    const newLvlInfo = calculateFishingLevel(state.exp);
    if (newLvlInfo.level > prevLevel) {
      setTimeout(() => {
        showLevelUpModal(newLvlInfo);
      }, 1200);
    }

    updateHeaderStats();
    renderCollectionGrid();
    renderJournalList();
    renderGearSelectors();

    fishingStatus = 'idle';
  }

  function showCatchModal(fish, length, exp, isFirstTime, isNewRecord) {
    if (!catchModal) return;

    const iconBox = catchModal.querySelector('.catch-fish-icon-box');
    const badgeEl = catchModal.querySelector('.catch-fish-rarity-badge');
    const titleEl = catchModal.querySelector('.catch-fish-title');
    const localNameEl = catchModal.querySelector('.catch-fish-localname');
    const lengthEl = catchModal.querySelector('.catch-fish-length');
    const descEl = catchModal.querySelector('.catch-fish-desc');
    const expBadgeEl = catchModal.querySelector('.catch-exp-badge');
    const newSpeciesBanner = catchModal.querySelector('.catch-new-species-banner');
    const newRecordBanner = catchModal.querySelector('.catch-new-record-banner');

    if (iconBox) iconBox.innerHTML = renderFishSvg(fish, 140, false);
    if (badgeEl) {
      badgeEl.className = `catch-fish-rarity-badge ${fish.badgeClass}`;
      badgeEl.textContent = fish.rarity;
    }
    if (titleEl) titleEl.textContent = fish.name;
    if (localNameEl) localNameEl.textContent = fish.localName;
    if (lengthEl) lengthEl.textContent = `${length} cm`;
    if (descEl) descEl.textContent = `"${fish.description}"`;
    if (expBadgeEl) expBadgeEl.textContent = `+${exp} EXP`;

    if (newSpeciesBanner) newSpeciesBanner.style.display = isFirstTime ? 'block' : 'none';
    if (newRecordBanner) newRecordBanner.style.display = isNewRecord && !isFirstTime ? 'block' : 'none';

    catchModal.classList.add('active');
    catchModal.setAttribute('aria-hidden', 'false');
  }

  function closeCatchModal() {
    if (catchModal) {
      catchModal.classList.remove('active');
      catchModal.setAttribute('aria-hidden', 'true');
    }
  }

  function showLevelUpModal(lvlInfo) {
    const lvlModal = document.getElementById('fishing-levelup-modal');
    if (!lvlModal) return;

    const titleEl = lvlModal.querySelector('.levelup-title');
    const badgeEl = lvlModal.querySelector('.levelup-badge');
    const rewardEl = lvlModal.querySelector('.levelup-reward');

    if (titleEl) titleEl.textContent = `SELAMAT! NAIK KE LEVEL ${lvlInfo.level}!`;
    if (badgeEl) badgeEl.textContent = `Gelar: ${lvlInfo.title}`;
    if (rewardEl) rewardEl.textContent = `Hadiah Terbuka: ${lvlInfo.reward}`;

    lvlModal.classList.add('active');
    lvlModal.setAttribute('aria-hidden', 'false');

    playTone(523.25, 0.4, 'triangle', 0.2);
    setTimeout(() => playTone(783.99, 0.6, 'sine', 0.25), 180);
  }

  function closeLevelUpModal() {
    const lvlModal = document.getElementById('fishing-levelup-modal');
    if (lvlModal) {
      lvlModal.classList.remove('active');
      lvlModal.setAttribute('aria-hidden', 'true');
    }
  }

  // -------------------------------------------------------------------------
  // FISH COLLECTION GRID (10 SLOTS)
  // -------------------------------------------------------------------------
  function renderCollectionGrid() {
    const container = document.getElementById('pond-fish-collection-grid');
    if (!container) return;

    const fishEntries = Object.values(FISH_SPECIES_DEFS);
    let discoveredCount = 0;

    container.innerHTML = fishEntries.map(fish => {
      const count = state.fishCounts[fish.id] || 0;
      const isDiscovered = count > 0;
      if (isDiscovered) discoveredCount += 1;

      const recordLen = state.fishRecords[fish.id] || fish.minLen;

      return `
        <div class="pond-fish-card ${isDiscovered ? 'discovered ' + fish.badgeClass : 'undiscovered'}">
          <div class="pond-fish-card-header">
            <span class="pond-fish-rarity-pill ${fish.badgeClass}">${isDiscovered ? fish.rarity : '???'}</span>
            <span class="pond-fish-count-badge">${isDiscovered ? `${count}x Tertangkap` : 'Terkunci'}</span>
          </div>

          <div class="pond-fish-card-visual">
            ${renderFishSvg(fish, 100, !isDiscovered)}
          </div>

          <div class="pond-fish-card-info">
            <h4 class="pond-fish-name">${isDiscovered ? fish.name : 'Spesies Misterius'}</h4>
            <div class="pond-fish-localname">${isDiscovered ? fish.localName : 'Belum pernah ditemukan'}</div>
            <p class="pond-fish-desc">${isDiscovered ? fish.description : 'Sering berenang di perairan tenang... Temukan dengan memancing di area yang tepat!'}</p>

            <div class="pond-fish-meta-row">
              <span class="meta-label">Ukuran Rekor:</span>
              <span class="meta-val">${isDiscovered ? `${recordLen} cm` : '—'}</span>
            </div>
            <div class="pond-fish-meta-row">
              <span class="meta-label">Habitat:</span>
              <span class="meta-val">${isDiscovered ? fish.habitat : '???'}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const countHeader = document.getElementById('pond-collection-total-discovered');
    if (countHeader) countHeader.textContent = `${discoveredCount} / ${fishEntries.length} Spesies Ditemukan`;
  }

  // -------------------------------------------------------------------------
  // FISHING JOURNAL
  // -------------------------------------------------------------------------
  function renderJournalList() {
    const container = document.getElementById('pond-journal-history-list');
    const totalCatchesEl = document.getElementById('journal-stat-total-catches');
    const bestRecordEl = document.getElementById('journal-stat-best-record');
    const favoriteFishEl = document.getElementById('journal-stat-favorite-fish');

    if (totalCatchesEl) totalCatchesEl.textContent = String(state.totalCatches);

    // Find biggest fish record
    let biggest = 0;
    let biggestName = '—';
    Object.entries(state.fishRecords).forEach(([id, len]) => {
      if (len > biggest) {
        biggest = len;
        biggestName = `${FISH_SPECIES_DEFS[id]?.name} (${len} cm)`;
      }
    });
    if (bestRecordEl) bestRecordEl.textContent = biggestName;

    // Find favorite / most caught fish
    let maxCaught = 0;
    let favName = '—';
    Object.entries(state.fishCounts).forEach(([id, count]) => {
      if (count > maxCaught) {
        maxCaught = count;
        favName = `${FISH_SPECIES_DEFS[id]?.name} (${count}x)`;
      }
    });
    if (favoriteFishEl) favoriteFishEl.textContent = favName;

    if (!container) return;

    if (!state.journal || state.journal.length === 0) {
      container.innerHTML = `
        <div class="journal-empty-state">
          <span class="empty-icon">📖</span>
          <p>Belum ada catatan penangkapan ikan di The Whispering Pond.</p>
          <span class="empty-sub">Lemparkan kailmu dan mulailah mengisi halaman jurnal ini!</span>
        </div>
      `;
      return;
    }

    container.innerHTML = state.journal.map(entry => {
      const fishDef = FISH_SPECIES_DEFS[entry.id] || FISH_SPECIES_DEFS.koi;
      const areaDef = FISHING_AREAS_DEFS[entry.area] || FISHING_AREAS_DEFS.whispering_shore;
      const weatherDef = WEATHER_SYSTEM_DEFS[entry.weather] || WEATHER_SYSTEM_DEFS.night;
      const timeStr = new Date(entry.caughtAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="pond-journal-entry-card ${fishDef.badgeClass}">
          <div class="entry-icon-col">
            ${renderFishSvg(fishDef, 55, false)}
          </div>
          <div class="entry-info-col">
            <div class="entry-header-row">
              <span class="entry-fish-name">${entry.name}</span>
              <span class="entry-rarity-badge ${fishDef.badgeClass}">${entry.rarity}</span>
            </div>
            <div class="entry-sub-row">
              <span>📏 ${entry.length} cm</span> •
              <span>📍 ${areaDef.name}</span> •
              <span>${weatherDef.icon} ${weatherDef.name}</span>
            </div>
            <div class="entry-time-row">
              <span>Waktu: ${timeStr}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------------------------
  // GEAR & AREAS SELECTORS
  // -------------------------------------------------------------------------
  function renderGearSelectors() {
    // 1. Rods
    const rodContainer = document.getElementById('pond-rods-grid');
    if (rodContainer) {
      rodContainer.innerHTML = Object.values(FISHING_RODS_DEFS).map(rod => {
        const isUnlocked = state.unlockedRods.includes(rod.id);
        const isEquipped = state.activeRod === rod.id;
        return `
          <div class="pond-gear-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}" data-rod-id="${rod.id}">
            <div class="gear-card-icon">${rod.icon}</div>
            <div class="gear-card-body">
              <div class="gear-card-title">${rod.name} ${isEquipped ? '✓ Terpasang' : ''}</div>
              <div class="gear-card-desc">${rod.desc}</div>
              <div class="gear-card-perks">
                ${rod.sweetSpotBonus > 0 ? `<span>🎯 Sweet Spot +${rod.sweetSpotBonus}%</span>` : ''}
                ${rod.biteSpeedBonus > 0 ? `<span>⚡ Sambaran +${rod.biteSpeedBonus}%</span>` : ''}
              </div>
            </div>
            <div class="gear-card-action">
              ${isUnlocked ?
                `<button type="button" class="btn-gear-equip ${isEquipped ? 'btn-active' : ''}" data-equip-rod="${rod.id}">
                  ${isEquipped ? 'Digunakan' : 'Gunakan'}
                </button>` :
                `<span class="gear-locked-badge">🔒 Terbuka di Level ${rod.levelReq}</span>`
              }
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Baits
    const baitContainer = document.getElementById('pond-baits-grid');
    if (baitContainer) {
      baitContainer.innerHTML = Object.values(FISHING_BAITS_DEFS).map(bait => {
        const isUnlocked = state.unlockedBaits.includes(bait.id);
        const isEquipped = state.activeBait === bait.id;
        return `
          <div class="pond-gear-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}" data-bait-id="${bait.id}">
            <div class="gear-card-icon">${bait.icon}</div>
            <div class="gear-card-body">
              <div class="gear-card-title">${bait.name} ${isEquipped ? '✓ Terpasang' : ''}</div>
              <div class="gear-card-desc">${bait.desc}</div>
            </div>
            <div class="gear-card-action">
              ${isUnlocked ?
                `<button type="button" class="btn-gear-equip ${isEquipped ? 'btn-active' : ''}" data-equip-bait="${bait.id}">
                  ${isEquipped ? 'Digunakan' : 'Gunakan'}
                </button>` :
                `<span class="gear-locked-badge">🔒 Terbuka di Level ${bait.levelReq}</span>`
              }
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Areas
    const areaContainer = document.getElementById('pond-areas-grid');
    if (areaContainer) {
      areaContainer.innerHTML = Object.values(FISHING_AREAS_DEFS).map(area => {
        const isUnlocked = state.unlockedAreas.includes(area.id);
        const isEquipped = state.activeArea === area.id;
        return `
          <div class="pond-gear-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}" data-area-id="${area.id}">
            <div class="gear-card-icon">${area.icon}</div>
            <div class="gear-card-body">
              <div class="gear-card-title">${area.name} — ${area.localName} ${isEquipped ? '✓ Aktif' : ''}</div>
              <div class="gear-card-desc">${area.desc}</div>
            </div>
            <div class="gear-card-action">
              ${isUnlocked ?
                `<button type="button" class="btn-gear-equip ${isEquipped ? 'btn-active' : ''}" data-equip-area="${area.id}">
                  ${isEquipped ? 'Lokasi Aktif' : 'Pilih Lokasi'}
                </button>` :
                `<span class="gear-locked-badge">🔒 Butuh Lv. ${area.levelReq} & ${area.minCatches} Ikan</span>`
              }
            </div>
          </div>
        `;
      }).join('');
    }

    // Attach click listeners to equip buttons
    const equipRodBtns = document.querySelectorAll('[data-equip-rod]');
    equipRodBtns.forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-equip-rod');
        if (state.unlockedRods.includes(id)) {
          state.activeRod = id;
          saveFishingState(state, currentUid);
          renderGearSelectors();
          updateHeaderStats();
          if (onShowToast) onShowToast(`🎣 Berhasil memasang ${FISHING_RODS_DEFS[id]?.name}!`);
        }
      };
    });

    const equipBaitBtns = document.querySelectorAll('[data-equip-bait]');
    equipBaitBtns.forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-equip-bait');
        if (state.unlockedBaits.includes(id)) {
          state.activeBait = id;
          saveFishingState(state, currentUid);
          renderGearSelectors();
          updateHeaderStats();
          if (onShowToast) onShowToast(`🍞 Berhasil memasang ${FISHING_BAITS_DEFS[id]?.name}!`);
        }
      };
    });

    const equipAreaBtns = document.querySelectorAll('[data-equip-area]');
    equipAreaBtns.forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-equip-area');
        if (state.unlockedAreas.includes(id)) {
          state.activeArea = id;
          saveFishingState(state, currentUid);
          renderGearSelectors();
          updateHeaderStats();
          if (onShowToast) onShowToast(`🌾 Lokasi memancing diubah ke ${FISHING_AREAS_DEFS[id]?.name}!`);
        }
      };
    });
  }

  // -------------------------------------------------------------------------
  // WEATHER & TIME TOGGLE CONTROLLER
  // -------------------------------------------------------------------------
  function cycleWeather() {
    const sequence = ['morning', 'afternoon', 'rainy', 'night'];
    const curIdx = sequence.indexOf(state.weather);
    const nextIdx = (curIdx + 1) % sequence.length;
    state.weather = sequence[nextIdx];
    saveFishingState(state, currentUid);
    updateHeaderStats();

    const wDef = WEATHER_SYSTEM_DEFS[state.weather];
    setCatSpeech(`"Wah! Suasana kolam berganti menjadi ${wDef.name}! ${wDef.description}"`);
    if (onShowToast) onShowToast(`🌤️ Suasana kolam: ${wDef.name}`);
  }

  // -------------------------------------------------------------------------
  // TABS NAVIGATION (POND STAGE, COLLECTION, JOURNAL, GEAR)
  // -------------------------------------------------------------------------
  function switchTab(tabId) {
    const tabs = ['stage', 'collection', 'journal', 'gear'];
    tabs.forEach(t => {
      const panel = document.getElementById(`pond-tab-panel-${t}`);
      const btn = document.getElementById(`btn-pond-tab-${t}`);
      if (panel) panel.style.display = t === tabId ? 'block' : 'none';
      if (btn) {
        if (t === tabId) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    if (tabId === 'collection') renderCollectionGrid();
    else if (tabId === 'journal') renderJournalList();
    else if (tabId === 'gear') renderGearSelectors();
  }

  // -------------------------------------------------------------------------
  // EVENT LISTENERS INITIALIZATION
  // -------------------------------------------------------------------------
  function setupEventListeners() {
    // Cast/Reel Action Button
    if (btnCast) {
      btnCast.onclick = () => {
        if (fishingStatus === 'idle') {
          castRod();
        } else if (fishingStatus === 'biting') {
          startReelMiniGame();
        }
      };
    }

    // Mini-game Reel Hold button (Mouse & Touch supported)
    if (btnReelHold) {
      const startHold = (e) => {
        e.preventDefault();
        isHoldingReel = true;
        btnReelHold.classList.add('holding');
      };
      const stopHold = (e) => {
        e.preventDefault();
        isHoldingReel = false;
        btnReelHold.classList.remove('holding');
      };

      btnReelHold.onmousedown = startHold;
      btnReelHold.onmouseup = stopHold;
      btnReelHold.onmouseleave = stopHold;
      btnReelHold.ontouchstart = startHold;
      btnReelHold.ontouchend = stopHold;
      btnReelHold.ontouchcancel = stopHold;
    }

    // Weather toggle button
    const btnWeatherToggle = document.getElementById('btn-pond-toggle-weather');
    if (btnWeatherToggle) {
      btnWeatherToggle.onclick = () => cycleWeather();
    }

    // Tab buttons
    ['stage', 'collection', 'journal', 'gear'].forEach(t => {
      const btn = document.getElementById(`btn-pond-tab-${t}`);
      if (btn) btn.onclick = () => switchTab(t);
    });

    // Close overlay button
    const btnCloseOverlay = document.getElementById('btn-close-pond-overlay');
    if (btnCloseOverlay) {
      btnCloseOverlay.onclick = () => closeFishingPond();
    }

    // Close catch celebration modal
    const btnCloseCatch = document.getElementById('btn-close-catch-modal');
    if (btnCloseCatch) {
      btnCloseCatch.onclick = () => closeCatchModal();
    }

    // Use catch as Cat Garden aquarium prop
    const btnSetAquarium = document.getElementById('btn-set-aquarium-decor');
    if (btnSetAquarium) {
      btnSetAquarium.onclick = () => {
        if (pendingFish) {
          state.selectedAquariumFish = pendingFish.id;
          saveFishingState(state, currentUid);
          if (onShowToast) onShowToast(`✨ ${pendingFish.name} dijadikan pajangan akuarium Cat Garden!`);
        }
        closeCatchModal();
      };
    }

    // Close level up modal
    const btnCloseLevelUp = document.getElementById('btn-close-levelup-modal');
    if (btnCloseLevelUp) {
      btnCloseLevelUp.onclick = () => closeLevelUpModal();
    }

    // Cat companion click reaction
    if (catCompanionEl) {
      catCompanionEl.onclick = () => {
        playTone(659.25, 0.2, 'sine', 0.12);
        const quotes = [
          `"Mew~ aku suka menemani Syma memancing di kolam tenang ini! 🌸"`,
          `"Lihat riak airnya! Ada ikan berkilau yang bersembunyi di bawah teratai! 🐟"`,
          `"Purrr~ angin The Whispering Pond membuat buluku berkibar sejuk..."`,
          `"Ayo Syma, tunjukkan keahlian memancingmu hari ini! ✨"`
        ];
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        setCatSpeech(q);
      };
    }
  }

  setupEventListeners();

  // -------------------------------------------------------------------------
  // PUBLIC CONTROLLER INTERFACE
  // -------------------------------------------------------------------------
  function openFishingPond(userUid = null) {
    if (userUid) currentUid = userUid;
    state = loadFishingState(currentUid);

    if (overlay) {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
    }

    updateHeaderStats();
    updateCatCompanion();
    switchTab('stage');

    const catName = updateCatCompanion();
    setCatSpeech(`"Mew~ selamat datang di The Whispering Pond, Syma! Ayo memancing bersama ${catName}! 🎣"`);
  }

  function closeFishingPond() {
    endMiniGame();
    clearTimeout(biteEscapeTimer);
    clearTimeout(biteTimer);
    fishingStatus = 'idle';

    if (bobberEl) {
      bobberEl.className = 'whispering-pond-bobber';
      bobberEl.style.display = 'none';
    }
    if (biteAlertEl) biteAlertEl.style.display = 'none';
    if (btnCast) {
      btnCast.disabled = false;
      btnCast.className = 'pinwheel-pond-action-btn';
      btnCast.innerHTML = `<span>LEMPAR KAIL 🎣</span>`;
    }

    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  return {
    openFishingPond,
    closeFishingPond,
    castRod,
    completeCatch,
    cycleWeather,
    switchTab,
    getState: () => ({ ...state }),
    setState: (newState) => {
      state = { ...state, ...newState };
      saveFishingState(state, currentUid);
      updateHeaderStats();
    },
    getAquariumFish: () => {
      const fishId = state.selectedAquariumFish || 'koi';
      return FISH_SPECIES_DEFS[fishId] || FISH_SPECIES_DEFS.koi;
    }
  };
}

