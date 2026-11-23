/**
 * KIDULT DREAM HOUSE — NYANYA ⭐ (UNIVERSE KIDULT)
 * State Management, Room Architectures, Recipes, Hobby Projects,
 * Memory Catalogs, Audio Synthesis, and Isolated Storage.
 * =============================================================================
 */

import {
  OLU_STORE_HOUSE_STATES,
  getSynchronousState,
  setSynchronousState
} from './olu_indexeddb.js';

export const KIDULT_HOUSE_STORAGE_KEY = 'kidult_dream_house_state_nyanya';

export const KIDULT_HOUSE_CHARACTER = {
  key: 'nyanya',
  name: 'Nyanya',
  symbol: '⭐',
  title: 'The Starlight Dreamer',
  houseName: 'KIDULT DREAM HOUSE',
  tagline: 'Cozy Dreamy Childhood Home — Where Childhood Dreams Never Fade.',
  palette: {
    primary: '#f472b6',    // Pastel Pink
    secondary: '#c084fc',  // Lavender
    accent: '#fbbf24',     // Warm Champagne Gold
    softPeach: '#fed7aa',  // Soft Peach
    sage: '#a7f3d0',       // Sage Green
    cream: '#fef3c7'       // Warm Cream
  }
};

// -----------------------------------------------------------------------------
// 1. FIVE INTERACTIVE ROOMS CONFIGURATION
// -----------------------------------------------------------------------------
export const KIDULT_HOUSE_ROOMS = [
  {
    id: 'living',
    name: 'KIDULT Living Room',
    subtitle: 'Pusat Kehangatan Rumah, Perapian & Piano Nostalgia',
    icon: '🛋️',
    bgImage: '/assets/kidult_house_living.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'couch', minX: 18, maxX: 42, minY: 48, maxY: 66 },
      { id: 'piano', minX: 68, maxX: 88, minY: 40, maxY: 56 },
      { id: 'fireplace', minX: 42, maxX: 58, minY: 36, maxY: 48 }
    ],
    hotspots: [
      { id: 'hs_living_couch', x: 30, y: 55, icon: '🛋️', label: 'Sofa Nyaman Berbintang', action: 'sit_sofa', prompt: '✦ [E] Duduk Santai di Sofa' },
      { id: 'hs_living_piano', x: 78, y: 48, icon: '🎹', label: 'Piano Vintage Masa Kecil', action: 'play_piano', prompt: '✦ [E] Mainkan Piano Nostalgia' },
      { id: 'hs_living_fireplace', x: 50, y: 42, icon: '🔥', label: 'Perapian Hangat & Boneka', action: 'warm_fireplace', prompt: '✦ [E] Hangatkan Diri di Perapian' },
      { id: 'hs_living_books', x: 86, y: 64, icon: '📚', label: 'Rak Buku Dongeng Favorit', action: 'read_bookshelf', prompt: '✦ [E] Baca Buku Dongeng' },
      { id: 'hs_living_tea', x: 36, y: 66, icon: '🫖', label: 'Meja Teh Lavender & Berry', action: 'sip_tea', prompt: '✦ [E] Nikmati Teh Lavender Hangat' },
      { id: 'hs_living_door_bed', x: 12, y: 45, icon: '🛏️', label: 'Ke Dreamy Bedroom', action: 'goto_bedroom', prompt: '✦ [E] Masuk ke Kamar Tidur' },
      { id: 'hs_living_door_kitchen', x: 88, y: 45, icon: '🍳', label: 'Ke Little Kitchen', action: 'goto_kitchen', prompt: '✦ [E] Masuk ke Dapur' },
      { id: 'hs_living_door_hobby', x: 50, y: 78, icon: '🎨', label: 'Ke Creative Hobby Room', action: 'goto_hobby', prompt: '✦ [E] Masuk ke Ruang Seni' }
    ]
  },
  {
    id: 'bedroom',
    name: 'Dreamy Bedroom',
    subtitle: 'Bilik Tidur Kanopi Pastel, Jurnal & Boneka Kesayangan',
    icon: '🛏️',
    bgImage: '/assets/kidult_house_bedroom.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'bed', minX: 14, maxX: 40, minY: 38, maxY: 62 },
      { id: 'study_desk', minX: 62, maxX: 86, minY: 38, maxY: 52 },
      { id: 'wardrobe', minX: 74, maxX: 90, minY: 56, maxY: 76 }
    ],
    hotspots: [
      { id: 'hs_bed_rest', x: 26, y: 48, icon: '🛏️', label: 'Ranjang Kanopi Bintang', action: 'rest_bed', prompt: '✦ [E] Istirahat & Renungan Mimpi' },
      { id: 'hs_bed_journal', x: 74, y: 44, icon: '📓', label: 'Meja Belajar & Jurnal KIDULT', action: 'write_journal', prompt: '✦ [E] Tulis Jurnal & Catatan Rahasia' },
      { id: 'hs_bed_plushies', x: 44, y: 44, icon: '🧸', label: 'Koleksi Boneka Teddy & Cat', action: 'cuddle_plushie', prompt: '✦ [E] Peluk Boneka Kesayangan' },
      { id: 'hs_bed_wardrobe', x: 82, y: 64, icon: '👗', label: 'Lemari Pakaian Vintage', action: 'open_wardrobe', prompt: '✦ [E] Ganti Pakaian & Piyama' },
      { id: 'hs_bed_window', x: 50, y: 38, icon: '✨', label: 'Jendela Lengkung Twilight', action: 'look_window', prompt: '✦ [E] Menatap Bintang dari Jendela' },
      { id: 'hs_bed_decor', x: 34, y: 72, icon: '🎀', label: 'Kustomisasi Dekorasi Kamar', action: 'bedroom_decor', prompt: '✦ [E] Ganti Ornamen & Pita' },
      { id: 'hs_bed_door_living', x: 88, y: 76, icon: '🛋️', label: 'Kembali ke Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' },
      { id: 'hs_bed_ladder_attic', x: 14, y: 76, icon: '🗝️', label: 'Tangga Menuju Memory Attic', action: 'goto_attic', prompt: '✦ [E] Naik ke Memory Attic' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Little Kitchen',
    subtitle: 'Dapur Kue Dongeng, Oven Manis & Resep Bintang',
    icon: '🍳',
    bgImage: '/assets/kidult_house_kitchen.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'stove_oven', minX: 14, maxX: 38, minY: 38, maxY: 52 },
      { id: 'fridge', minX: 42, maxX: 56, minY: 38, maxY: 50 },
      { id: 'island_table', minX: 30, maxX: 70, minY: 56, maxY: 70 }
    ],
    hotspots: [
      { id: 'hs_kitchen_oven', x: 26, y: 44, icon: '🧁', label: 'Oven Kue Aroma Harum', action: 'bake_oven', prompt: '✦ [E] Panggang Kue & Camilan' },
      { id: 'hs_kitchen_fridge', x: 48, y: 44, icon: '🥛', label: 'Kulkas Retro Penuh Bahan', action: 'open_fridge', prompt: '✦ [E] Ambil Bahan Segar' },
      { id: 'hs_kitchen_prep', x: 50, y: 62, icon: '🥣', label: 'Meja Persiapan & Mixer', action: 'prep_counter', prompt: '✦ [E] Racik Adonan Kue' },
      { id: 'hs_kitchen_dining', x: 78, y: 52, icon: '🍽️', label: 'Meja Makan Manis', action: 'dining_table', prompt: '✦ [E] Nikmati Sajian Camilan' },
      { id: 'hs_kitchen_recipes', x: 84, y: 68, icon: '📖', label: 'Buku Resep Dongeng Nyanya', action: 'recipe_book', prompt: '✦ [E] Buka Buku Resep' },
      { id: 'hs_kitchen_door_living', x: 14, y: 74, icon: '🛋️', label: 'Kembali ke Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  },
  {
    id: 'hobby',
    name: 'Creative Hobby Room',
    subtitle: 'Studio Seni, Meja Scrapbook & Papan Inspirasi Impian',
    icon: '🎨',
    bgImage: '/assets/kidult_house_hobby.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'art_desk', minX: 18, maxX: 46, minY: 38, maxY: 54 },
      { id: 'craft_shelf', minX: 68, maxX: 88, minY: 38, maxY: 54 },
      { id: 'moodboard', minX: 42, maxX: 64, minY: 36, maxY: 48 }
    ],
    hotspots: [
      { id: 'hs_hobby_paint', x: 32, y: 46, icon: '🎨', label: 'Meja Kanvas & Cat Air', action: 'paint_canvas', prompt: '✦ [E] Melukis Kanvas Kenangan' },
      { id: 'hs_hobby_scrapbook', x: 52, y: 64, icon: '✂️', label: 'Meja Scrapbook & Origami', action: 'craft_scrapbook', prompt: '✦ [E] Susun Scrapbook Masa Kecil' },
      { id: 'hs_hobby_moodboard', x: 54, y: 42, icon: '📌', label: 'Papan Moodboard Impian', action: 'moodboard_pin', prompt: '✦ [E] Pasang Polaroid & Bintang' },
      { id: 'hs_hobby_supplies', x: 78, y: 46, icon: '🧶', label: 'Rak Alat Seni & Gulungan Pita', action: 'art_supplies', prompt: '✦ [E] Pilih Alat Kerajinan' },
      { id: 'hs_hobby_comics', x: 82, y: 66, icon: '📖', label: 'Sudut Baca Komik & Dongeng', action: 'read_comics', prompt: '✦ [E] Baca Komik Nostalgia' },
      { id: 'hs_hobby_door_living', x: 14, y: 74, icon: '🛋️', label: 'Kembali ke Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  },
  {
    id: 'attic',
    name: 'Memory Attic',
    subtitle: 'Loteng Kenangan Masa Kecil, Surat Sahabat & Kotak Musik',
    icon: '🗝️',
    bgImage: '/assets/kidult_house_attic.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 40, maxY: 82 },
    obstacles: [
      { id: 'chest_stack', minX: 20, maxX: 44, minY: 40, maxY: 56 },
      { id: 'rocking_chair', minX: 66, maxX: 84, minY: 42, maxY: 58 }
    ],
    hotspots: [
      { id: 'hs_attic_chest', x: 32, y: 48, icon: '🗝️', label: 'Peti Kenangan Masa Kecil', action: 'memory_chest', prompt: '✦ [E] Buka Peti Kenangan Nyanya' },
      { id: 'hs_attic_letters', x: 44, y: 58, icon: '💌', label: 'Surat Tulus dari 8 Sahabat', action: 'read_letters', prompt: '✦ [E] Baca Surat-Surat Sahabat' },
      { id: 'hs_attic_albums', x: 56, y: 48, icon: '📸', label: 'Album Foto Polaroid Kenangan', action: 'photo_album', prompt: '✦ [E] Buka Album Foto Masa Kecil' },
      { id: 'hs_attic_musicbox', x: 76, y: 48, icon: '🎶', label: 'Kotak Musik Berputar Antik', action: 'music_box', prompt: '✦ [E] Putar Kotak Musik Nina Bobo' },
      { id: 'hs_attic_rocking', x: 74, y: 64, icon: '🪑', label: 'Kursi Goyang Sudut Loteng', action: 'rocking_chair', prompt: '✦ [E] Duduk Merenung di Kursi Goyang' },
      { id: 'hs_attic_door_bed', x: 14, y: 74, icon: '🛏️', label: 'Turun ke Dreamy Bedroom', action: 'goto_bedroom', prompt: '✦ [E] Turun ke Kamar Tidur' }
    ]
  }
];

// -----------------------------------------------------------------------------
// 2. RECIPES, CRAFTS, MEMORIES & TASKS CATALOGS
// -----------------------------------------------------------------------------
export const KIDULT_RECIPES = [
  {
    id: 'star_cupcake',
    name: 'Star Strawberry Cupcake',
    icon: '🧁',
    desc: 'Kue mangkuk lembut dengan selai stroberi segar dan hiasan bintang gula manis berkilau.',
    ingredients: ['Tepung Terigu Bintang', 'Stroberi Manis', 'Krim Susu Vanila', 'Gula Bintang'],
    bakeTime: '2.5 detik',
    mood: 'Ceria & Hangat'
  },
  {
    id: 'lavender_scone',
    name: 'Lavender Honey Scone',
    icon: '🫓',
    desc: 'Kue scone renyah dengan aroma bunga lavender kering dan olesan madu alami.',
    ingredients: ['Mentega Emas', 'Madu Liar', 'Bunga Lavender Kering', 'Kuning Telur'],
    bakeTime: '3.0 detik',
    mood: 'Menenangkan & Damai'
  },
  {
    id: 'peach_tart',
    name: 'Peach Blossom Tart',
    icon: '🥧',
    desc: 'Kue pai mini berisikan custard lembut dan irisan buah persik segar beraroma bunga musim semi.',
    ingredients: ['Kulit Pai Renyah', 'Krim Custard', 'Buah Persik Iris', 'Sirup Aprikot'],
    bakeTime: '3.5 detik',
    mood: 'Manis & Nostalgik'
  },
  {
    id: 'cloud_cookie',
    name: 'Warm Cinnamon Cloud Cookie',
    icon: '🍪',
    desc: 'Kukis lembut seperti awan dengan taburan kayu manis harum dan lelehan cokelat putih.',
    ingredients: ['Tepung Gandum', 'Kayu Manis Halus', 'Cokelat Putih', 'Gula Tebu'],
    bakeTime: '2.0 detik',
    mood: 'Nyaman & Manja'
  },
  {
    id: 'berry_fizz',
    name: 'Sparkling Fairy Berry Soda',
    icon: '🍹',
    desc: 'Minuman soda segar berkarbonasi lembut dengan sirup rasberi merah dan daun mint sejuk.',
    ingredients: ['Air Soda Kristal', 'Sirup Rasberi Liar', 'Es Batu Bintang', 'Daun Mint Segar'],
    bakeTime: '1.5 detik',
    mood: 'Segar & Penuh Semangat'
  }
];

export const KIDULT_HOBBY_PROJECTS = [
  {
    id: 'painting_twilight',
    title: 'Lukisan: "Bintang Senja di Atas Bukit Impian"',
    icon: '🎨',
    category: 'Canvas Painting',
    desc: 'Goresan cat air pastel yang menggambarkan bukit berumput tempat Nyanya pertama kali melihat bintang jatuh.',
    materials: ['Kanvas Kain Mini', 'Cat Air Pastel', 'Kuas Halus #2', 'Air Mawar']
  },
  {
    id: 'scrapbook_olu',
    title: 'Scrapbook: "Awal Petualangan di Our Little Universe"',
    icon: '✂️',
    category: 'Scrapbooking',
    desc: 'Buku kenangan tempel berisi tiket bioskop imajiner, daun lavender pres, dan stiker bintang berkilau.',
    materials: ['Kertas Kraft Cokelat', 'Stiker Bintang Emas', 'Pita Washi Tape', 'Foto Polaroid']
  },
  {
    id: 'origami_garland',
    title: 'Origami: "Rantai Burung Bangau & Bintang 3D"',
    icon: '⭐',
    category: 'Paper Craft',
    desc: 'Rangkaian 20 origami burung bangau kecil berwarna pastel untuk digantung di dekat jendela kamar.',
    materials: ['Kertas Lipat Gradasi', 'Benang Sutra Perak', 'Manik Kristal Kecil']
  },
  {
    id: 'moodboard_childhood',
    title: 'Moodboard: "Koleksi Hal-Hal yang Membuat Bahagia"',
    icon: '📌',
    category: 'Inspiration Board',
    desc: 'Papan gabus berisi kumpulan foto polaroid, sobekan puisi pendek, dan pin enamel kucing.',
    materials: ['Papan Gabus Kayu', 'Pin Logam Kuningan', 'Kartu Pos Vintage', 'Sobekan Puisi']
  },
  {
    id: 'ribbon_bookmark',
    title: 'Handmade: "Pembatas Buku Pita Sutra Bunga Kering"',
    icon: '🔖',
    category: 'Handmade Gifts',
    desc: 'Pembatas buku cantik berhias bunga hydrangea kering untuk diselipkan di buku dongeng malam.',
    materials: ['Pita Beludru Pink', 'Bunga Kering Pres', 'Laminasi Bening']
  }
];

export const KIDULT_MEMORY_ITEMS = [
  {
    id: 'mem_nyanya',
    char: 'Nyanya ⭐',
    title: 'Janji untuk Sisi Kecil dalam Diri',
    date: 'Hari Pertama di Universe KIDULT',
    icon: '⭐',
    excerpt: 'Dunia orang dewasa terkadang terasa begitu bising dan terburu-buru. Namun di sini, di bawah langit pastel ini, aku berjanji tidak akan pernah melupakan tawa masa kecilku...'
  },
  {
    id: 'mem_lala',
    char: 'Lala ☀️',
    title: 'Kupu-Kupu dan Secangkir Teh Persik',
    date: 'Matahari Terbit di Bloom Garden',
    icon: '☀️',
    excerpt: 'Nyanya tersayang, terima kasih selalu membawa warna manis. Saat kau lelah, ingatlah ada padang bunga hangat yang selalu menunggumu di TO YOU!'
  },
  {
    id: 'mem_lele',
    char: 'Lele 🌙',
    title: 'Catatan dari Langit Gerhana Abadi',
    date: 'Malam Cahaya Kristal',
    icon: '🌙',
    excerpt: 'Untuk Nyanya sang pemimpi bintang: Di antara seluruh semesta yang kutulis, duniamu adalah tempat di mana kepolosan hati manusia tetap abadi dan suci.'
  },
  {
    id: 'mem_kiki',
    char: 'Kiki 🎀',
    title: 'Pita Merah Jambu & Rahasia Kecil',
    date: 'Sore Berangin Manis',
    icon: '🎀',
    excerpt: 'Aku menyelipkan pita merah jambu ini ke dalam petimu! Setiap kali kau merasa sepi, pegang pita ini dan ingat kita selalu ada bersama.'
  },
  {
    id: 'mem_momo',
    char: 'Momo 🌸',
    title: 'Bunga Sakura Pertama yang Gugur',
    date: 'Musim Semi Penuh Tawa',
    icon: '🌸',
    excerpt: 'Nyanya, kita pernah berjanji untuk membuat rumah pohon tertinggi di semesta. Rumah impianmu sekarang jauh lebih indah dari pohon itu!'
  },
  {
    id: 'mem_titi',
    char: 'Titi 🍃',
    title: 'Semanggi Berdaun Empat',
    date: 'Padang Rumput Berembun',
    icon: '🍃',
    excerpt: 'Semanggi ini kutemukan khusus untukmu. Semoga hari-harimu di KIDULT selalu dipenuhi oleh keberuntungan dan kehangatan.'
  },
  {
    id: 'mem_bubu',
    char: 'Bubu 🧸',
    title: 'Boneka Beruang Penjaga Tidur',
    date: 'Malam Berbintang Tenang',
    icon: '🧸',
    excerpt: 'Jangan takut pada mimpi buruk. Beruang kecil di sudut kamarmu akan selalu menemanimu sampai matahari terbit tersenyum.'
  },
  {
    id: 'mem_yuyu',
    char: 'Yuyu 🌊',
    title: 'Kerang Berbisik Ombak',
    date: 'Tepian Lautan Cahaya',
    icon: '🌊',
    excerpt: 'Bawalah kerang ini dekat ke telingamu. Kau akan mendengar melodi air tenang yang mengingatkanmu bahwa semuanya akan baik-baik saja.'
  }
];

export const KIDULT_HOUSE_TASKS = [
  { id: 't_piano', title: 'Mainkan Melodi Piano di Living Room', xp: 20, done: false },
  { id: 't_bake', title: 'Panggang Star Strawberry Cupcake di Dapur', xp: 30, done: false },
  { id: 't_paint', title: 'Lukis Kanvas Seni di Creative Hobby Room', xp: 25, done: false },
  { id: 't_journal', title: 'Tulis Catatan Harian di Jurnal KIDULT', xp: 15, done: false },
  { id: 't_letters', title: 'Baca Surat-Surat Sahabat di Memory Attic', xp: 20, done: false }
];

export const KIDULT_ATMOSPHERES = [
  { id: 'afternoon', name: 'Golden Afternoon (Sore Emas Hangat)', icon: '🌤️', filter: 'sepia(0.08) brightness(1.02)' },
  { id: 'twilight', name: 'Twilight Galaxy (Senja Pastel & Bintang)', icon: '🌆', filter: 'brightness(0.95) hue-rotate(-10deg) saturate(1.15)' },
  { id: 'night', name: 'Cozy Midnight (Malam Penuh Bintang)', icon: '🌙', filter: 'brightness(0.78) hue-rotate(-20deg) contrast(1.1)' }
];

// -----------------------------------------------------------------------------
// 3. PERSISTENT STATE MANAGEMENT (ISOLATED)
// -----------------------------------------------------------------------------
export function getDefaultKidultHouseState() {
  return {
    owner: 'nyanya',
    currentRoom: 'living',
    playerPos: { x: 50, y: 72 },
    currentAtmo: 'twilight',
    inventory: [
      { id: 'inv_star_badge', name: 'Pin Bintang Emas', icon: '⭐', count: 1 },
      { id: 'inv_music_sheet', name: 'Partitur Melodi Nina Bobo', icon: '🎼', count: 1 },
      { id: 'inv_tea_pack', name: 'Daun Teh Bunga Lavender', icon: '🫖', count: 3 }
    ],
    unlockedRecipes: ['star_cupcake', 'lavender_scone', 'cloud_cookie'],
    bakedItemsCount: 3,
    completedCrafts: ['painting_twilight'],
    journalEntries: [
      {
        id: 'j1',
        date: 'Hari Pembukaan Rumah',
        title: 'Mimpi Masa Kecil yang Menjadi Nyata',
        content: 'Hari ini aku menata ulang rumah impianku. Setiap sudut memiliki ceritanya sendiri, dan aku bahagia bisa membaginya dengan seluruh sahabat tersayang.'
      }
    ],
    stats: {
      pianoTimes: 5,
      cakesBaked: 3,
      paintingsDone: 1,
      journalsWritten: 1,
      memoriesVisited: 4
    }
  };
}

export function loadKidultHouseState(charKey = 'nyanya') {
  try {
    return getSynchronousState(
      OLU_STORE_HOUSE_STATES,
      KIDULT_HOUSE_STORAGE_KEY,
      () => getDefaultKidultHouseState()
    );
  } catch (err) {
    console.error('Failed to load KIDULT DREAM HOUSE state:', err);
    return getDefaultKidultHouseState();
  }
}

export function saveKidultHouseState(charKey = 'nyanya', state) {
  try {
    if (!state) return;
    setSynchronousState(
      OLU_STORE_HOUSE_STATES,
      KIDULT_HOUSE_STORAGE_KEY,
      state,
      { character: 'nyanya', universe: 'KIDULT' }
    );
  } catch (err) {
    console.error('Failed to save KIDULT DREAM HOUSE state:', err);
  }
}

// -----------------------------------------------------------------------------
// 4. WEB AUDIO SYNTHESIZER ENGINE
// -----------------------------------------------------------------------------
let audioCtx = null;
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

/**
 * Plays a cheerful vintage toy piano note with warm harmonics
 */
export function playToyPianoNote(midiNote = 60) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const now = ctx.currentTime;

    // Fundamental (sine for sweetness)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Harmonic (triangle for vintage music box body)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.2);
    osc2.stop(now + 0.8);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Plays a soft sparkly starlight chime
 */
export function playKidultChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.7);
    });
  } catch (e) {}
}

/**
 * Plays a gentle music box lullaby fragment
 */
export function playMusicBoxLullaby() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    // Pleasant lullaby notes: E5, G5, A5, G5, E5, C5, D5, C5
    const notes = [659.25, 783.99, 880.00, 783.99, 659.25, 523.25, 587.33, 523.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.22);
      gain.gain.setValueAtTime(0.25, now + idx * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.22);
      osc.stop(now + idx * 0.22 + 0.65);
    });
  } catch (e) {}
}

/**
 * Plays sweet baking sizzle chime
 */
export function playCookingSizzle() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {}
}
