/**
 * PINWHEEL RESIDENCE STATE & STORAGE LAYER
 * THE WINDWHISPER RESIDENCE — A Japanese Fantasy Kitsune Home
 * Character: Syma (abil) · UID: Euc0JLt3kWMveUEIjBwXHfOfvQD3
 * =============================================================================
 * Handles data definitions, UID-bound persistence, and integrations for:
 * 1. Room Layouts & Placed Decorations
 * 2. Syma Wardrobe & Outfits (using genuine Syma assets)
 * 3. Daily Living Activities & Sleep Cycles
 * 4. Kitchen Recipes & Cooking Minigame
 * 5. Wind Chime Collection & Web Audio Synthesis
 * 6. Weather & Day-Night Atmosphere (Morning, Afternoon, Rainy Day, Night)
 * 7. Collections Integration (Photography, Vision Studio, Gazebo Journal, Fishing Pond)
 * 8. Kitsune Shrine & Secret Attic Lore
 */

import { loadPhotosMetaSync, loadAllPhotos, loadArtworksMetaSync, loadAllArtworks } from './pinwheel_studio_storage.js';

export const SYMA_CANONICAL_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';
export const SYMA_CANONICAL_ID = 'abil';

// ---------------------------------------------------------------------------
// 1. OUTFIT WARDROBE DEFINITIONS (Genuine Syma Assets)
// ---------------------------------------------------------------------------
export const SYMA_OUTFITS = [
  {
    id: 'sacred_miko',
    name: 'Sacred Kitsune Shrine Robe',
    nameJp: '白狐の巫女装束 (Hakuko no Miko)',
    type: 'Default / Sacred',
    image: '/assets/avatar_abil_hd.jpg',
    thumb: '/assets/avatar_abil_hd.jpg',
    description: 'Jubah putih suci dan lavender lembut berhias pita kincir angin dan sulaman bunga sakura perak. Memancarkan aura damai dan berkah sang rubah pelindung.',
    quote: '"Angin yang berbisik di antara dedaunan selalu membimbing langkahku pulang."',
    stats: { cozy: '★★★★★', mystic: '★★★★★', breeze: '★★★★☆' }
  },
  {
    id: 'wind_wanderer',
    name: 'Moonlit Pinwheel Adventurer',
    nameJp: '風紡ぎの旅人 (Kazetsumugi no Tabibito)',
    type: 'Travel / Explorer',
    image: '/assets/portrait_abil_hd.jpg',
    thumb: '/assets/portrait_abil_hd.jpg',
    description: 'Pakaian pengembara berangin lembut dengan syal berenda lavender dan bros kincir perak bercahaya. Ringan dan nyaman untuk menjelajahi lembah PINWHEEL.',
    quote: '"Kemanapun angin berhembus, di sanalah ada cerita baru yang menanti."',
    stats: { cozy: '★★★★☆', mystic: '★★★★☆', breeze: '★★★★★' }
  },
  {
    id: 'celestial_dreamer',
    name: 'Star Blossom Kimono',
    nameJp: '星咲く夜の着物 (Hoshisaku Yoru no Kimono)',
    type: 'Festive / Celestial',
    image: '/assets/card_abil_hd.jpg',
    thumb: '/assets/card_abil_hd.jpg',
    description: 'Yukata sutra malam bergradasi midnight blue dan lavender halus, dihiasi motif rasi bintang rubah berekor sembilan dan serbuk cahaya rembulan.',
    quote: '"Di bawah naungan langit malam, setiap bintang adalah doa yang bersinar hangat."',
    stats: { cozy: '★★★★★', mystic: '★★★★★', breeze: '★★★★★' }
  }
];

// ---------------------------------------------------------------------------
// 2. COOKING RECIPES (Kitchen - Little Kitchen)
// ---------------------------------------------------------------------------
export const COOKING_RECIPES = [
  {
    id: 'sakura_tea',
    name: 'Sakura Tea — Teh Kelopak Sakura',
    category: 'Teh Hangat',
    icon: '🌸',
    cookingTimeSec: 3,
    ingredients: [
      { name: 'Kelopak Sakura Segar', amount: '5 helai', icon: '🌸' },
      { name: 'Mata Air Kristal Gunung', amount: '200 ml', icon: '💧' },
      { name: 'Madu Bunga Lavender', amount: '1 sendok', icon: '🍯' }
    ],
    flavorProfile: 'Manis floral lembut, menyejukkan pikiran dan menghangatkan jiwa.',
    symaComment: '"Aroma sakura ini selalu mengingatkanku pada awal musim semi di lembah kincir..."',
    cozinessBoost: 25
  },
  {
    id: 'honey_milk_tea',
    name: 'Honey Milk Tea — Susu Madu Hangat',
    category: 'Minuman Manis',
    icon: '🍯',
    cookingTimeSec: 3.5,
    ingredients: [
      { name: 'Daun Teh Hitam Pinwheel', amount: '1 takar', icon: '🍃' },
      { name: 'Susu Murni Pegunungan', amount: '150 ml', icon: '🥛' },
      { name: 'Madu Hutan Pinwheel Murni', amount: '2 sendok', icon: '🍯' }
    ],
    flavorProfile: 'Krim lembut gurih dan manis madu alami yang menenangkan detak jantung.',
    symaComment: '"Sangat cocok dinikmati di beranda sambil mendengarkan gemerisik dedaunan bambu."',
    cozinessBoost: 30
  },
  {
    id: 'moonlight_herbal_tea',
    name: 'Moonlight Herbal Tea — Seduhan Herbal Malam',
    category: 'Relaksasi Tidur',
    icon: '🌙',
    cookingTimeSec: 3,
    ingredients: [
      { name: 'Bunga Chamomile Rembulan', amount: '3 kuncup', icon: '🌼' },
      { name: 'Daun Mint Embun Dingin', amount: '4 lembar', icon: '🌿' },
      { name: 'Sari Bunga Lavender Perak', amount: '1 tetes', icon: '✨' }
    ],
    flavorProfile: 'Aroma mint sejuk menenangkan, meredakan lelah dan mengundang mimpi indah.',
    symaComment: '"Segelas teh herbal ini membuat futon terasa sepuluh kali lebih empuk dan nyaman."',
    cozinessBoost: 35
  },
  {
    id: 'kitsune_dango',
    name: 'Kitsune Dango & Mochi',
    category: 'Camilan Tradisional',
    icon: '🍡',
    cookingTimeSec: 4,
    ingredients: [
      { name: 'Tepung Beras Mochi Lembut', amount: '1 mangkuk', icon: '🌾' },
      { name: 'Gula Tebu Merah Tradisional', amount: '2 sendok', icon: '🤎' },
      { name: 'Bubuk Kedelai Kinako Emas', amount: 'Secukupnya', icon: '✨' }
    ],
    flavorProfile: 'Kenyal lembut dengan paduan saus manis karamel dan aroma kacang gurih.',
    symaComment: '"Dango kenyal manis! Kucing-kucing di Cat Garden pasti mencium aroma sedap ini."',
    cozinessBoost: 40
  }
];

// ---------------------------------------------------------------------------
// 3. WIND CHIME COLLECTION
// ---------------------------------------------------------------------------
export const WIND_CHIMES = [
  {
    id: 'lavender_glass',
    name: 'Lavender Glass Bell',
    nameJp: '紫の硝子風鈴 (Murasaki no Garasu Furin)',
    icon: '🎐',
    material: 'Gelas Kristal Tiup',
    colorHex: '#c084fc',
    frequencies: [659.25, 987.77, 1318.51], // E5, B5, E6
    description: 'Gelas kaca tiup berwarna lavender bening dengan gantungan kertas strip puisi angin. Denting kristal bernada tinggi dan jernih.',
    resonance: 'Harmonik kristalin murni'
  },
  {
    id: 'bamboo_whisperer',
    name: 'Bamboo Whisperer Chime',
    nameJp: '竹林の囁き (Takebayashi no Sasayaki)',
    icon: '🎋',
    material: 'Bambu Alami Gunung',
    colorHex: '#86efac',
    frequencies: [392.00, 523.25, 783.99], // G4, C5, G5
    description: 'Tabung bambu bertingkat yang bergesekan lembut diayun angin semilir. Menghasilkan suara kayu alami yang hangat dan menenteramkan.',
    resonance: 'Nada kayu bersahaja & organik'
  },
  {
    id: 'silver_star',
    name: 'Silver Star Wind Chime',
    nameJp: '銀星の鈴 (Ginsei no Suzu)',
    icon: '⭐',
    material: 'Logam Perak Kosmik',
    colorHex: '#93c5fd',
    frequencies: [880.00, 1108.73, 1760.00], // A5, C#6, A6
    description: 'Pipa perak berpendar lembut yang memantulkan cahaya bintang. Suara lonceng ethereal yang melayang tinggi hingga ke angkasa.',
    resonance: 'Denting kosmik melayang'
  },
  {
    id: 'kitsune_ceramic',
    name: 'Kitsune Sacred Furin',
    nameJp: '狐火の陶器風鈴 (Kitsunebi no Touki Furin)',
    icon: '🦊',
    material: 'Keramik Kuil Keramat',
    colorHex: '#f43f5e',
    frequencies: [739.99, 1108.73, 1479.98], // F#5, C#6, F#6
    description: 'Lonceng keramik bermotif rubah bertopeng emas dengan lonceng perunggu di dalamnya. Dipercaya mengundang keberuntungan dan angin berkah.',
    resonance: 'Denting magis mistis kitsune'
  }
];

// ---------------------------------------------------------------------------
// 4. HOME DECORATION CATALOGUE
// ---------------------------------------------------------------------------
export const DECOR_ITEMS = [
  // Furniture
  { id: 'fur_kotatsu', name: 'Kotatsu Hangat Lavender', category: 'furniture', icon: '🛋️', unlocked: true, desc: 'Meja rendah berpemanas dengan selimut tebal warna lavender lembut.' },
  { id: 'fur_lowtable', name: 'Meja Teh Hinoki Klasik', category: 'furniture', icon: '🪵', unlocked: true, desc: 'Meja kayu cemara Jepang beraroma harum alami untuk ruang tamu dan engawa.' },
  { id: 'fur_zabuton', name: 'Bantal Duduk Zabuton Sutra', category: 'furniture', icon: '🪑', unlocked: true, desc: 'Bantal duduk tebal dan empuk bersulam benang perak motif awan.' },
  { id: 'fur_bookshelf', name: 'Rak Buku Mahoni Tradisional', category: 'furniture', icon: '📚', unlocked: true, desc: 'Rak kayu tinggi untuk menyimpan gulungan cerita dan buku harian kenangan.' },
  { id: 'fur_futon_cloud', name: 'Kasur Futon Lembut Awan', category: 'furniture', icon: '🛏️', unlocked: true, desc: 'Futon bertumpuk kapas alami dengan selimut berbulu selembut awan PINWHEEL.' },

  // Lighting
  { id: 'lig_andon', name: 'Lentera Kertas Andon Kayu', category: 'lighting', icon: '🏮', unlocked: true, desc: 'Lentera meja klasik Jepang dari rangka kayu dan kertas washi pemancar cahaya hangat.' },
  { id: 'lig_firefly_jar', name: 'Toples Kunang-Kunang Kosmik', category: 'lighting', icon: '✨', unlocked: true, desc: 'Cahaya lembut kunang-kunang ajaib yang menari di dalam stoples kristal.' },
  { id: 'lig_moon_lamp', name: 'Lampu Bola Bulan Purnama', category: 'lighting', icon: '🌕', unlocked: true, desc: 'Lampu gantung berbentuk bola bulan bercahaya perak keperakan.' },
  { id: 'lig_sakura_candle', name: 'Lilin Keramik Aroma Sakura', category: 'lighting', icon: '🕯️', unlocked: false, unlockRequirement: 'Seduh 1x Sakura Tea di Dapur', desc: 'Lilin wangi lembut yang menyebarkan keharuman kelopak bunga sakura.' },

  // Plants
  { id: 'pla_bonsai_sakura', name: 'Bonsai Sakura Kuno', category: 'plants', icon: '🌸', unlocked: true, desc: 'Pohon mini sakura berbunga lebat dalam pot keramik giok bersejarah.' },
  { id: 'pla_lavender_pot', name: 'Pot Bunga Lavender Pinwheel', category: 'plants', icon: '🪻', unlocked: true, desc: 'Bunga lavender segar dari bukit PINWHEEL yang selalu bergoyang ditiup angin.' },
  { id: 'pla_bamboo_vase', name: 'Vas Bambu Keberuntungan', category: 'plants', icon: '🎋', unlocked: true, desc: 'Batang bambu hijau muda dalam vas porselen putih bertuliskan doa damai.' },
  { id: 'pla_fox_fern', name: 'Pakis Embun Hutan Rubah', category: 'plants', icon: '🌿', unlocked: false, unlockRequirement: 'Duduk di Engawa sambil menikmati angin', desc: 'Tumbuhan pakis hijau zamrud dengan tetesan embun abadi.' },

  // Wall Decoration
  { id: 'wal_kitsune_scroll', name: 'Lukisan Gulung Kitsune Suci', category: 'wall', icon: '📜', unlocked: true, desc: 'Kakejiku lukisan tangan tinta hitam dan emas menggambarkan rubah melompati awan.' },
  { id: 'wal_pinwheel_garland', name: 'Untaian Kincir Angin Mini', category: 'wall', icon: '🎐', unlocked: true, desc: 'Kincir-kincir origami warna pastel yang berputar lembut saat angin bertiup.' },
  { id: 'wal_star_map', name: 'Peta Rasi Bintang Semesta', category: 'wall', icon: '🌌', unlocked: true, desc: 'Kain sutra biru malam bergambar rasi bintang Rubah Ekor Sembilan.' },
  { id: 'wal_noren_lavender', name: 'Tirai Pintu Noren Lavender', category: 'wall', icon: '🎏', unlocked: false, unlockRequirement: 'Jelajahi seluruh ruangan rumah Syma', desc: 'Tirai kain belah dua penyejuk ruangan bertuliskan kanji "Harmoni (和)".' },

  // Floor Decoration
  { id: 'flo_tatami_mat', name: 'Tikar Anyaman Tatami Asli', category: 'floor', icon: '🌾', unlocked: true, desc: 'Anyaman rumput igusa alami yang memberi aroma sejuk khas rumah tradisional Jepang.' },
  { id: 'flo_petal_rug', name: 'Karpet Taburan Kelopak Sakura', category: 'floor', icon: '🌸', unlocked: true, desc: 'Karpet bulat beludru bergambar pusaran kelopak bunga sakura merah muda.' },
  { id: 'flo_slate_stone', name: 'Batu Pijakan Taman Slate', category: 'floor', icon: '🪨', unlocked: true, desc: 'Lempengan batu alam abu-abu halus untuk jalur setapak dan teras.' },
  { id: 'flo_fox_fur_rug', name: 'Karpet Hangat Ekor Rubah', category: 'floor', icon: '🦊', unlocked: false, unlockRequirement: 'Ganti outfit Syma di Lemari Pakaian', desc: 'Karpet wol lembut berbulu tebal yang sangat hangat untuk kaki.' },

  // Japanese Ornaments
  { id: 'orn_kokeshi', name: 'Boneka Kayu Kokeshi Kembar', category: 'japanese_ornaments', icon: '🎎', unlocked: true, desc: 'Pahatan kayu halus boneka tradisional Jepang bercat warna lavender dan pink.' },
  { id: 'orn_ceramic_teapot', name: 'Set Teko Keramik Sencha Antik', category: 'japanese_ornaments', icon: '🫖', unlocked: true, desc: 'Teko keramik tanah liat dengan empat cangkir mungil berornamen kincir angin.' },
  { id: 'orn_origami_crane', name: 'Bangau Origami Seribu Doa', category: 'japanese_ornaments', icon: '🕊️', unlocked: true, desc: 'Lipatan bangau kertas perak pembawa harapan baik bagi seluruh penghuni rumah.' },

  // Kitsune Sanctuary
  { id: 'kit_statue', name: 'Patung Rubah Penjaga Putih', category: 'kitsune', icon: '🦊', unlocked: true, desc: 'Patung porselen rubah putih bertelinga merah pembawa kunci berkah kemakmuran.' },
  { id: 'kit_torii_mini', name: 'Gerbang Torii Mungil Meja', category: 'kitsune', icon: '⛩️', unlocked: true, desc: 'Miniatur gerbang merah vermilion pemisah dunia fana dan tempat suci pelindung.' },
  { id: 'kit_spirit_orb', name: 'Orb Roh Cahaya Kitsune', category: 'kitsune', icon: '🔮', unlocked: false, unlockRequirement: 'Buka dan jelajahi Ruang Loteng Rahasia', desc: 'Bola kristal mistis yang berputar melayang memancarkan pendar ungu-emas magis.' }
];

// Room Slot Layout Defaults (Room -> Slot IDs -> Default Item ID)
export const DEFAULT_ROOM_DECOR = {
  exterior: {
    slot_ext_1: 'flo_slate_stone',
    slot_ext_2: 'pla_lavender_pot',
    slot_ext_3: 'lig_andon',
    slot_ext_4: 'kit_statue'
  },
  living: {
    slot_liv_1: 'fur_kotatsu',
    slot_liv_2: 'fur_bookshelf',
    slot_liv_3: 'wal_kitsune_scroll',
    slot_liv_4: 'orn_kokeshi',
    slot_liv_5: 'lig_andon'
  },
  kitchen: {
    slot_kit_1: 'orn_ceramic_teapot',
    slot_kit_2: 'pla_bonsai_sakura',
    slot_kit_3: 'lig_andon'
  },
  bedroom: {
    slot_bed_1: 'fur_futon_cloud',
    slot_bed_2: 'lig_moon_lamp',
    slot_bed_3: 'wal_star_map',
    slot_bed_4: 'flo_petal_rug'
  },
  archive: {
    slot_arc_1: 'fur_bookshelf',
    slot_arc_2: 'lig_firefly_jar',
    slot_arc_3: 'kit_torii_mini',
    slot_arc_4: 'orn_origami_crane'
  },
  engawa: {
    slot_eng_1: 'fur_lowtable',
    slot_eng_2: 'fur_zabuton',
    slot_eng_3: 'pla_bamboo_vase',
    slot_eng_4: 'wal_pinwheel_garland'
  },
  attic: {
    slot_att_1: 'wal_star_map',
    slot_att_2: 'lig_firefly_jar',
    slot_att_3: 'kit_statue'
  }
};

// ---------------------------------------------------------------------------
// 5. STORAGE KEYS & PERSISTENCE HELPERS
// ---------------------------------------------------------------------------
export function getResidenceDecorKey(uid = SYMA_CANONICAL_UID) {
  return `olu_pinwheel_residence_decor_${uid || SYMA_CANONICAL_UID}`;
}

export function getResidenceOutfitKey(uid = SYMA_CANONICAL_UID) {
  return `olu_pinwheel_residence_outfit_${uid || SYMA_CANONICAL_UID}`;
}

export function getResidenceWeatherKey(uid = SYMA_CANONICAL_UID) {
  return `olu_pinwheel_residence_weather_${uid || SYMA_CANONICAL_UID}`;
}

export function getResidenceChimeKey(uid = SYMA_CANONICAL_UID) {
  return `olu_pinwheel_residence_chime_${uid || SYMA_CANONICAL_UID}`;
}

export function getResidenceCookingKey(uid = SYMA_CANONICAL_UID) {
  return `olu_pinwheel_residence_cooking_${uid || SYMA_CANONICAL_UID}`;
}

export function getResidenceAtticKey(uid = SYMA_CANONICAL_UID) {
  return `olu_pinwheel_residence_attic_${uid || SYMA_CANONICAL_UID}`;
}

export function loadResidenceDecor(uid = SYMA_CANONICAL_UID) {
  try {
    const raw = localStorage.getItem(getResidenceDecorKey(uid));
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ROOM_DECOR, ...parsed };
    }
  } catch (e) {
    console.warn('[ResidenceState] Failed to load decor:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_ROOM_DECOR));
}

export function saveResidenceDecor(decorData, uid = SYMA_CANONICAL_UID) {
  try {
    localStorage.setItem(getResidenceDecorKey(uid), JSON.stringify(decorData));
  } catch (e) {
    console.warn('[ResidenceState] Failed to save decor:', e);
  }
}

export function loadResidenceOutfit(uid = SYMA_CANONICAL_UID) {
  try {
    const outfitId = localStorage.getItem(getResidenceOutfitKey(uid));
    const found = SYMA_OUTFITS.find(o => o.id === outfitId);
    return found ? found.id : 'sacred_miko';
  } catch (_) {
    return 'sacred_miko';
  }
}

export function saveResidenceOutfit(outfitId, uid = SYMA_CANONICAL_UID) {
  try {
    localStorage.setItem(getResidenceOutfitKey(uid), outfitId);
  } catch (e) {
    console.warn('[ResidenceState] Failed to save outfit:', e);
  }
}

export function loadResidenceWeather(uid = SYMA_CANONICAL_UID) {
  try {
    return localStorage.getItem(getResidenceWeatherKey(uid)) || 'afternoon';
  } catch (_) {
    return 'afternoon';
  }
}

export function saveResidenceWeather(weatherMode, uid = SYMA_CANONICAL_UID) {
  try {
    localStorage.setItem(getResidenceWeatherKey(uid), weatherMode);
  } catch (e) {
    console.warn('[ResidenceState] Failed to save weather:', e);
  }
}

export function loadResidenceChime(uid = SYMA_CANONICAL_UID) {
  try {
    return localStorage.getItem(getResidenceChimeKey(uid)) || 'lavender_glass';
  } catch (_) {
    return 'lavender_glass';
  }
}

export function saveResidenceChime(chimeId, uid = SYMA_CANONICAL_UID) {
  try {
    localStorage.setItem(getResidenceChimeKey(uid), chimeId);
  } catch (e) {
    console.warn('[ResidenceState] Failed to save chime:', e);
  }
}

export function loadResidenceCookingHistory(uid = SYMA_CANONICAL_UID) {
  try {
    const raw = localStorage.getItem(getResidenceCookingKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function saveResidenceCookingHistory(historyList, uid = SYMA_CANONICAL_UID) {
  try {
    localStorage.setItem(getResidenceCookingKey(uid), JSON.stringify(historyList));
  } catch (e) {
    console.warn('[ResidenceState] Failed to save cooking history:', e);
  }
}

export function isAtticUnlocked(uid = SYMA_CANONICAL_UID) {
  try {
    return localStorage.getItem(getResidenceAtticKey(uid)) === 'true';
  } catch (_) {
    return false;
  }
}

export function unlockAttic(uid = SYMA_CANONICAL_UID) {
  try {
    localStorage.setItem(getResidenceAtticKey(uid), 'true');
    return true;
  } catch (_) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 6. EXTERNAL ARCHIVE INTEGRATION LOADERS
// ---------------------------------------------------------------------------

/**
 * Loads real Photography photos taken by Syma in Photography mode.
 */
export async function loadSymaPhotographyArchive(uid = SYMA_CANONICAL_UID) {
  try {
    const photos = await loadAllPhotos(uid);
    if (photos && photos.length > 0) return photos;
    return loadPhotosMetaSync(uid);
  } catch (_) {
    return loadPhotosMetaSync(uid);
  }
}

/**
 * Loads real Vision Studio artworks painted or composed by Syma.
 */
export async function loadSymaVisionArtworksArchive(uid = SYMA_CANONICAL_UID) {
  try {
    const artworks = await loadAllArtworks(uid);
    if (artworks && artworks.length > 0) return artworks;
    return loadArtworksMetaSync(uid);
  } catch (_) {
    return loadArtworksMetaSync(uid);
  }
}

/**
 * Loads real Memory Journal entries written in Gazebo.
 */
export function loadSymaGazeboJournalArchive(uid = SYMA_CANONICAL_UID) {
  try {
    const key = `olu_syma_gazebo_journal_${uid || SYMA_CANONICAL_UID}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

/**
 * Loads real Fish Collection from Fishing Pond (The Whispering Pond).
 */
export function loadSymaFishingCollectionArchive(uid = SYMA_CANONICAL_UID) {
  try {
    const v2Key = `olu_fishing_v2_${uid || SYMA_CANONICAL_UID}`;
    const rawV2 = localStorage.getItem(v2Key);
    if (rawV2) {
      const state = JSON.parse(rawV2);
      if (state && Array.isArray(state.catches)) {
        return state.catches;
      }
    }
    const legacyKey = `olu_fishing_collection_${uid || SYMA_CANONICAL_UID}`;
    const legacyRaw = localStorage.getItem(legacyKey);
    if (legacyRaw) {
      return JSON.parse(legacyRaw);
    }
  } catch (_) {
    // fallback empty
  }
  return [];
}

// ---------------------------------------------------------------------------
// 7. WEB AUDIO PROCEDURAL SYNTHESIS (Wind Chimes, Rain, Birds, Kettle)
// ---------------------------------------------------------------------------
let residenceAudioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!residenceAudioCtx || residenceAudioCtx.state === 'closed') {
    residenceAudioCtx = new AudioCtx();
  }
  if (residenceAudioCtx.state === 'suspended') {
    residenceAudioCtx.resume().catch(() => {});
  }
  return residenceAudioCtx;
}

/**
 * Procedurally rings a wind chime using harmonic bell synthesis.
 */
export function playSynthesizedChime(chimeId = 'lavender_glass', masterVol = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const chimeDef = WIND_CHIMES.find(c => c.id === chimeId) || WIND_CHIMES[0];
  const now = ctx.currentTime;

  chimeDef.frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Subtle detune for natural glass/metal vibration
    const detune = (idx - 1) * 7 + (Math.random() * 4 - 2);
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    osc.detune.setValueAtTime(detune, now);

    if (chimeId === 'bamboo_whisperer') {
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
    } else {
      osc.type = 'sine';
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(450, now);
    }

    const startDelay = now + idx * 0.08;
    const duration = chimeId === 'bamboo_whisperer' ? 1.4 : 2.5;

    gain.gain.setValueAtTime(0.001, startDelay);
    gain.gain.exponentialRampToValueAtTime(0.35 * masterVol, startDelay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startDelay + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startDelay);
    osc.stop(startDelay + duration + 0.1);
  });
}

/**
 * Procedural gentle rain sound generator.
 */
let rainNode = null;
let rainGain = null;

export function setProceduralRainAudio(enabled, masterVol = 0.4) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (!enabled) {
    if (rainGain && ctx.state === 'running') {
      rainGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      setTimeout(() => {
        try {
          if (rainNode) rainNode.stop();
          rainNode = null;
          rainGain = null;
        } catch (_) {}
      }, 900);
    }
    return;
  }

  if (rainNode) return; // already active

  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1; // White noise
  }

  rainNode = ctx.createBufferSource();
  rainNode.buffer = buffer;
  rainNode.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(750, ctx.currentTime);

  rainGain = ctx.createGain();
  rainGain.gain.setValueAtTime(0.001, ctx.currentTime);
  rainGain.gain.linearRampToValueAtTime(0.22 * masterVol, ctx.currentTime + 1.2);

  rainNode.connect(filter);
  filter.connect(rainGain);
  rainGain.connect(ctx.destination);

  rainNode.start(ctx.currentTime);
}

/**
 * Procedural boiling kettle / cooking sizzle sound.
 */
export function playCookingSound(durationSec = 3, masterVol = 0.4) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * Math.min(durationSec, 5);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(1100, now);
  bandpass.Q.setValueAtTime(3.0, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.25 * masterVol, now + 0.4);
  gain.gain.linearRampToValueAtTime(0.001, now + durationSec);

  noise.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + durationSec + 0.1);
}

/**
 * Procedural peaceful bedtime chime for Sleep & Wake Up interaction.
 */
export function playBedtimeLullaby(masterVol = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.35);

    const start = now + idx * 0.35;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.28 * masterVol, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 2.0);
  });
}

