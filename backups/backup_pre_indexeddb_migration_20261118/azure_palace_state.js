/**
 * THE AZURE TIDE PALACE — AKHIRA ⚡ (UNIVERSE YAWN)
 * Akhira's Ocean Sanctuary - Underwater Astral Palace
 * State Management, Room Architectures, Ocean Recipes, Bioluminescent Flora,
 * Deep-Sea Memorabilia, Web Audio Synthesis, and Resilient Storage.
 * =============================================================================
 */

export const AZURE_PALACE_STORAGE_KEY = 'azure_tide_palace_state_akhira';

export const AZURE_PALACE_CHARACTER = {
  key: 'akhira',
  name: 'Akhira',
  symbol: '⚡',
  title: 'The Oceanic Storm Weaver',
  houseName: 'THE AZURE TIDE PALACE',
  tagline: "Akhira's Ocean Sanctuary — Where Astral Celestial Tides & Electric Currents Meet.",
  palette: {
    primary: '#0284c7',       // Ocean Blue
    oceanBlue: '#0284c7',     // Ocean Blue
    deepTeal: '#0f766e',      // Deep Teal
    turquoise: '#06b6d4',     // Turquoise
    aquamarine: '#2dd4bf',    // Aquamarine
    pearlWhite: '#f8fafc',    // Pearl White
    softSilver: '#cbd5e1',    // Soft Silver
    lavenderBlue: '#c7d2fe',  // Lavender Blue
    champagneGold: '#fef08a', // Subtle Champagne Gold
    electricCyan: '#22d3ee'   // Electric Cyan (Akhira Lightning Accent)
  }
};

// -----------------------------------------------------------------------------
// 1. FIVE INTERCONNECTED ROOMS CONFIGURATION
// -----------------------------------------------------------------------------
export const AZURE_PALACE_ROOMS = [
  {
    id: 'living',
    name: 'Ocean Living Room',
    subtitle: 'Kubah Kristal Laut Utama, Sofa Mutiara & Piano Akuatik',
    icon: '🌊',
    bgImage: '/assets/azure_palace_living.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'curved_sofa', minX: 18, maxX: 42, minY: 48, maxY: 66 },
      { id: 'aquatic_piano', minX: 68, maxX: 88, minY: 40, maxY: 56 },
      { id: 'crystal_table', minX: 42, maxX: 58, minY: 52, maxY: 64 }
    ],
    hotspots: [
      { id: 'hs_living_sofa', x: 30, y: 55, icon: '🛋️', label: 'Sofa Melengkung Pearl White', action: 'sit_sofa', prompt: '✦ [E] Duduk Santai di Sofa Mutiara' },
      { id: 'hs_living_piano', x: 78, y: 48, icon: '🎹', label: 'Piano Kristal Akuatik', action: 'play_piano', prompt: '✦ [E] Mainkan Melodi Gelombang Samudra' },
      { id: 'hs_living_window', x: 50, y: 36, icon: '🐋', label: 'Jendela Aquarium Bawah Laut', action: 'gaze_ocean', prompt: '✦ [E] Amati Kehidupan Laut & Paus Astral' },
      { id: 'hs_living_books', x: 86, y: 64, icon: '📚', label: 'Rak Buku Kulit Kerang & Peta Astral', action: 'read_bookshelf', prompt: '✦ [E] Baca Kisah Pelayaran & Petir Samudra' },
      { id: 'hs_living_tea', x: 50, y: 58, icon: '🫖', label: 'Meja Teh Sea Breeze & Kristal', action: 'sip_tea', prompt: '✦ [E] Nikmati Eliksir Teh Rumput Laut' },
      { id: 'hs_living_door_bed', x: 12, y: 45, icon: '🛏️', label: 'Ke Pearl Dream Bedroom', action: 'goto_bedroom', prompt: '✦ [E] Masuk ke Kamar Tidur' },
      { id: 'hs_living_door_kitchen', x: 88, y: 45, icon: '🍳', label: 'Ke Coral Kitchen', action: 'goto_kitchen', prompt: '✦ [E] Masuk ke Dapur Karang' },
      { id: 'hs_living_door_conservatory', x: 32, y: 78, icon: '🌿', label: 'Ke Bioluminescent Conservatory', action: 'goto_conservatory', prompt: '✦ [E] Masuk ke Taman Bawah Laut' },
      { id: 'hs_living_door_gallery', x: 68, y: 78, icon: '🏛️', label: 'Ke Ocean Memory Gallery', action: 'goto_gallery', prompt: '✦ [E] Masuk ke Galeri Kenangan' }
    ]
  },
  {
    id: 'bedroom',
    name: 'Pearl Dream Bedroom',
    subtitle: 'Bilik Kanopi Mutiara, Meja Rias Kristal & Teras Observasi Laut',
    icon: '🛏️',
    bgImage: '/assets/azure_palace_bedroom.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'canopy_bed', minX: 14, maxX: 40, minY: 38, maxY: 62 },
      { id: 'vanity_table', minX: 62, maxX: 86, minY: 38, maxY: 52 },
      { id: 'ocean_wardrobe', minX: 74, maxX: 90, minY: 56, maxY: 76 }
    ],
    hotspots: [
      { id: 'hs_bed_rest', x: 26, y: 48, icon: '🛏️', label: 'Ranjang Kanopi Gelombang Sutra', action: 'rest_bed', prompt: '✦ [E] Istirahat & Renungan Mimpi Laut' },
      { id: 'hs_bed_journal', x: 74, y: 44, icon: '📓', label: 'Meja Rias Kristal & Jurnal Ombak', action: 'write_journal', prompt: '✦ [E] Tulis Jurnal & Catatan Rahasia Akhira' },
      { id: 'hs_bed_wardrobe', x: 82, y: 64, icon: '👗', label: 'Lemari Pakaian Busana Samudra', action: 'open_wardrobe', prompt: '✦ [E] Ganti Pakaian & Jubah Samudra' },
      { id: 'hs_bed_balcony', x: 50, y: 38, icon: '🌅', label: 'Balkon Observasi Laut Dalam', action: 'look_balcony', prompt: '✦ [E] Menatap Cahaya Ubur-ubur dari Balkon' },
      { id: 'hs_bed_decor', x: 34, y: 72, icon: '🐚', label: 'Kustomisasi Dekorasi Mutiara', action: 'bedroom_decor', prompt: '✦ [E] Atur Hiasan Kerang & Kristal' },
      { id: 'hs_bed_door_living', x: 88, y: 76, icon: '🌊', label: 'Kembali ke Ocean Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Coral Kitchen',
    subtitle: 'Dapur Karang Kristal, Oven Api Laut & Resep Samudra Lezat',
    icon: '🍳',
    bgImage: '/assets/azure_palace_kitchen.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'stove_oven', minX: 14, maxX: 38, minY: 38, maxY: 52 },
      { id: 'pearl_fridge', minX: 42, maxX: 56, minY: 38, maxY: 50 },
      { id: 'coral_island', minX: 30, maxX: 70, minY: 56, maxY: 70 }
    ],
    hotspots: [
      { id: 'hs_kitchen_oven', x: 26, y: 44, icon: '🔥', label: 'Oven Kristal Api Bawah Laut', action: 'cook_oven', prompt: '✦ [E] Panggang Hidangan Samudra' },
      { id: 'hs_kitchen_fridge', x: 48, y: 44, icon: '❄️', label: 'Kulkas Mutiara Bahan Segar', action: 'open_fridge', prompt: '✦ [E] Ambil Bahan Segar dari Samudra' },
      { id: 'hs_kitchen_prep', x: 50, y: 62, icon: '🥣', label: 'Meja Persiapan & Mixer Kristal', action: 'prep_counter', prompt: '✦ [E] Racik Bahan Resep Laut' },
      { id: 'hs_kitchen_dining', x: 78, y: 52, icon: '🍽️', label: 'Meja Makan Karang Santai', action: 'dining_table', prompt: '✦ [E] Nikmati Santapan Laut Bersama' },
      { id: 'hs_kitchen_recipes', x: 84, y: 68, icon: '📖', label: 'Buku Resep Kerajaan Samudra', action: 'recipe_book', prompt: '✦ [E] Buka Buku Resep Laut' },
      { id: 'hs_kitchen_door_living', x: 14, y: 74, icon: '🌊', label: 'Kembali ke Ocean Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  },
  {
    id: 'conservatory',
    name: 'The Bioluminescent Conservatory',
    subtitle: 'Kubah Kaca Taman Bawah Laut, Flora Bercahaya & Kolam Mutiara',
    icon: '🌿',
    bgImage: '/assets/azure_palace_conservatory.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'garden_bed_left', minX: 16, maxX: 36, minY: 40, maxY: 58 },
      { id: 'pearl_clam_pond', minX: 42, maxX: 58, minY: 38, maxY: 52 },
      { id: 'crystal_planter_right', minX: 64, maxX: 84, minY: 40, maxY: 58 }
    ],
    hotspots: [
      { id: 'hs_garden_bed', x: 26, y: 48, icon: '🌱', label: 'Petak Kebun Flora Samudra (Slot 1 & 2)', action: 'tend_garden_bed', prompt: '✦ [E] Tanam & Rawat Benih Laut' },
      { id: 'hs_garden_pond', x: 50, y: 44, icon: '🦪', label: 'Kolam Kerang Raksasa & Mutiara Cahaya', action: 'interact_pond', prompt: '✦ [E] Panen Mutiara & Air Esensi Laut' },
      { id: 'hs_garden_crystal_pot', x: 74, y: 48, icon: '🌸', label: 'Pot Kristal Bunga Abyssal (Slot 3)', action: 'tend_crystal_pot', prompt: '✦ [E] Rawat Bunga Laut Langka' },
      { id: 'hs_garden_water', x: 38, y: 66, icon: '💧', label: 'Alat Penyiram Esensi Arus Laut', action: 'water_all_plants', prompt: '✦ [E] Siram Semua Tanaman' },
      { id: 'hs_garden_harvest', x: 62, y: 66, icon: '✨', label: 'Keranjang Panen Hasil Tanaman', action: 'harvest_garden', prompt: '✦ [E] Panen Flora Bioluminesensi' },
      { id: 'hs_garden_door_living', x: 88, y: 76, icon: '🌊', label: 'Kembali ke Ocean Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  },
  {
    id: 'gallery',
    name: 'The Ocean Memory Gallery',
    subtitle: 'Pusat Artefak Samudra, Botol Pesan Berkelip & Kristal Petir YAWN',
    icon: '🏛️',
    bgImage: '/assets/azure_palace_gallery.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'artifact_pedestal_1', minX: 18, maxX: 38, minY: 40, maxY: 54 },
      { id: 'lightning_shrine', minX: 42, maxX: 58, minY: 36, maxY: 50 },
      { id: 'memory_shelves', minX: 62, maxX: 84, minY: 40, maxY: 54 }
    ],
    hotspots: [
      { id: 'hs_gallery_bottles', x: 28, y: 46, icon: '🍾', label: 'Rak Botol Pesan Terapung Samudra', action: 'read_bottles', prompt: '✦ [E] Baca Surat & Botol Pesan' },
      { id: 'hs_gallery_lightning_crystal', x: 50, y: 42, icon: '⚡', label: 'Altar Kristal Petir Samudra (Identitas YAWN)', action: 'channel_lightning', prompt: '✦ [E] Salurkan Energi Petir & Kristal Cyan' },
      { id: 'hs_gallery_album', x: 74, y: 46, icon: '🖼️', label: 'Album Kenangan & Peta Jelajah Laut', action: 'view_album', prompt: '✦ [E] Buka Album Foto Eksplorasi' },
      { id: 'hs_gallery_pearl_showcase', x: 38, y: 64, icon: '🔮', label: 'Pajangan Koleksi Mutiara Berharga', action: 'pearl_showcase', prompt: '✦ [E] Periksa Koleksi Mutiara Langka' },
      { id: 'hs_gallery_secret_box', x: 62, y: 64, icon: '🗝️', label: 'Peti Harta Karun Kolektibel Tersembunyi', action: 'secret_collectibles', prompt: '✦ [E] Buka Peti Artefak Rahasia' },
      { id: 'hs_gallery_door_living', x: 12, y: 76, icon: '🌊', label: 'Kembali ke Ocean Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  }
];

// -----------------------------------------------------------------------------
// 2. OCEAN RECIPES CATALOG (CORAL KITCHEN)
// -----------------------------------------------------------------------------
export const AZURE_OCEAN_RECIPES = [
  {
    id: 'kelp_chowder',
    name: 'Glowing Kelp Chowder',
    icon: '🥣',
    desc: 'Sup kental hangat berbahan rumput laut bercahaya dengan kaldu mutiara yang menenangkan jiwa.',
    ingredients: ['Glow Kelp', 'Pearl Rice', 'Seafoam Cream'],
    timeSeconds: 4,
    rewardXp: 40
  },
  {
    id: 'coral_berry_tart',
    name: 'Coral Reef Berry Tart',
    icon: '🥧',
    desc: 'Pai renyah berkilau dengan selai buah karang manis bertabur serbuk kristal laut.',
    ingredients: ['Coral Berries', 'Crystal Sugar', 'Sea Salt Butter'],
    timeSeconds: 5,
    rewardXp: 50
  },
  {
    id: 'seafoam_macaron',
    name: 'Seafoam Pearl Macaron',
    icon: '🧁',
    desc: 'Kue macaron lembut warna aquamarine dengan isian krim mutiara manis meleleh di lidah.',
    ingredients: ['Seafoam Cream', 'Crystal Sugar', 'Abyssal Essence'],
    timeSeconds: 4,
    rewardXp: 45
  },
  {
    id: 'electric_spark_elixir',
    name: 'Electric Cyan Sparkler ⚡',
    icon: '🍹',
    desc: 'Minuman berkarbonasi dingin dengan sensasi menggelitik khas energi petir samudra Akhira.',
    ingredients: ['Electric Sea Berry', 'Abyssal Water', 'Sparkling Coral Ice'],
    timeSeconds: 3,
    rewardXp: 55
  },
  {
    id: 'abyssal_pearl_sorbet',
    name: 'Abyssal Blue Sorbet',
    icon: '🍧',
    desc: 'Sorbet dingin membeku warna deep blue dengan kilau ubur-ubur esensial yang menyegarkan.',
    ingredients: ['Abyssal Essence', 'Crystal Sugar', 'Sparkling Coral Ice'],
    timeSeconds: 5,
    rewardXp: 60
  }
];

// -----------------------------------------------------------------------------
// 3. BIOLUMINESCENT FLORA CATALOG (THE CONSERVATORY)
// -----------------------------------------------------------------------------
export const AZURE_CONSERVATORY_FLORA = [
  {
    id: 'abyssal_lotus',
    name: 'Abyssal Star Lotus',
    icon: '🪷',
    bloomIcon: '🪷✨',
    color: '#38bdf8',
    growthDurationSeconds: 15,
    yieldItem: 'Abyssal Star Petal',
    desc: 'Teratai bawah laut yang kelopaknya memancarkan cahaya biru zamrud lembut.'
  },
  {
    id: 'biolum_fern',
    name: 'Bioluminescent Coral Fern',
    icon: '🌿',
    bloomIcon: '🌿💫',
    color: '#2dd4bf',
    growthDurationSeconds: 20,
    yieldItem: 'Glowing Coral Frond',
    desc: 'Pakis laut yang bergerak mengikuti arus air dengan pendaran neon hijau aquamarine.'
  },
  {
    id: 'electric_sea_blossom',
    name: 'Electric Cyan Sea Blossom ⚡',
    icon: '🌸',
    bloomIcon: '🌸⚡',
    color: '#22d3ee',
    growthDurationSeconds: 25,
    yieldItem: 'Electric Sea Berry',
    desc: 'Bunga samudra langka bertegangan mikro lembut yang memancarkan percikan petir halus.'
  }
];

// -----------------------------------------------------------------------------
// 4. MEMORABILIA & HIDDEN COLLECTIBLES (OCEAN MEMORY GALLERY)
// -----------------------------------------------------------------------------
export const AZURE_OCEAN_MEMORABILIA = [
  {
    id: 'bottle_1',
    title: 'Surat Dalam Botol dari Nyanya ⭐',
    icon: '🍾',
    date: 'Hari Penuh Bintang',
    text: '“Halo Akhira! Ombak samudra YAWN membisikkan lagu yang tenang sampai ke langit KIDULT. Jangan lupa mampir ke Dream House ya, aku menyimpan kue manis untukmu!” — Nyanya ⭐'
  },
  {
    id: 'bottle_2',
    title: 'Surat Bunga dari Lala ☀️',
    icon: '💌',
    date: 'Pagi Hari Cerah',
    text: '“Untuk Akhira tersayang, kelopak bunga dari Bloom Cottage kubiarkan mengapung di aliran sungai langit. Semoga cahaya matahari pagi menembus sampai ke dasar istana mutiaramu!” — Lala ☀️'
  },
  {
    id: 'bottle_3',
    title: 'Pesan Bayangan dari Lele 🌙',
    icon: '📜',
    date: 'Malam Cahaya Bulan',
    text: '“Dari balik bayang-bayang The Eclipse, aku menyaksikan keanggunan samudra birumu. Arus petir yang kau jaga adalah pelindung malam yang sejati.” — Lele 🌙'
  },
  {
    id: 'bottle_4',
    title: 'Catatan Angin dari Abil / Syma ☁️',
    icon: '🪁',
    date: 'Hari Berangin Lembut',
    text: '“Kincir angin PINWHEEL berputar selaras dengan pasang surut air lautmu. Laut dan awan selalu terhubung oleh hujan dan mimpi.” — Abil ☁️'
  }
];

export const AZURE_COLLECTIBLES = [
  { id: 'lightning_pearl', name: 'Lightning Storm Pearl ⚡', icon: '🔮', desc: 'Mutiara langka bermuatan listrik alami dari palung terdalam samudra YAWN.', found: false },
  { id: 'ancient_amulet', name: 'Ancient Coral Amulet', icon: '🧿', desc: 'Jimat karang purba pelindung istana bawah laut warisan leluhur samudra.', found: false },
  { id: 'star_compass', name: 'Astral Wave Compass', icon: '🧭', desc: 'Kompas ajaib yang jarumnya selalu menunjuk ke arah pasang surut cahaya bintang.', found: false },
  { id: 'electric_geode', name: 'Electric Cyan Geode ⚡', icon: '💎', desc: 'Bongkahan kristal geode yang memancarkan pulsa energi petir cyan tanpa henti.', found: false }
];

// -----------------------------------------------------------------------------
// 5. PALACE OBJECTIVES / TASKS
// -----------------------------------------------------------------------------
export const AZURE_PALACE_TASKS = [
  { id: 'task_relax_sofa', title: 'Bersantai di Sofa Mutiara', desc: 'Duduk di sofa melengkung pearl white', room: 'living', completed: false, xp: 20 },
  { id: 'task_play_piano', title: 'Melodi Samudra', desc: 'Mainkan notasi piano kristal akuatik', room: 'living', completed: false, xp: 25 },
  { id: 'task_cook_recipe', title: 'Santapan Samudra', desc: 'Masak 1 resep lezat di Coral Kitchen', room: 'kitchen', completed: false, xp: 35 },
  { id: 'task_water_plants', title: 'Rawat Flora Bioluminesensi', desc: 'Siram tanaman laut di The Conservatory', room: 'conservatory', completed: false, xp: 30 },
  { id: 'task_read_bottle', title: 'Membaca Surat Botol Pesan', desc: 'Buka pesan sahabat di Ocean Gallery', room: 'gallery', completed: false, xp: 25 },
  { id: 'task_channel_lightning', title: 'Harmoni Petir & Ombak ⚡', desc: 'Salurkan energi di altar kristal cyan', room: 'gallery', completed: false, xp: 40 }
];

// -----------------------------------------------------------------------------
// 6. ATMOSPHERES & LIGHTING MODES
// -----------------------------------------------------------------------------
export const AZURE_ATMOSPHERES = [
  {
    id: 'sunlit_azure',
    name: 'Sunlit Azure (Siang Berkilau)',
    icon: '☀️',
    desc: 'Cahaya matahari siang menembus permukaan air, memancarkan bias aquamarine keemasan yang jernih.',
    ambientOverlay: 'radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.18) 0%, rgba(15, 118, 110, 0.12) 60%, rgba(2, 44, 54, 0.25) 100%)'
  },
  {
    id: 'twilight_biolum',
    name: 'Twilight Bioluminescent (Senja Berpendar)',
    icon: '✨',
    desc: 'Kala senja tiba, karang dan tanaman laut mulai berpendar dengan warna cyan dan violet magis.',
    ambientOverlay: 'radial-gradient(ellipse at 50% 30%, rgba(34, 211, 238, 0.22) 0%, rgba(147, 51, 234, 0.15) 55%, rgba(15, 23, 42, 0.35) 100%)'
  },
  {
    id: 'abyssal_midnight',
    name: 'Abyssal Midnight (Malam Laut Dalam)',
    icon: '🌙',
    desc: 'Malam tenang di dasar laut, bintang-bintang astral bersinar melalui air dengan keheningan mewah.',
    ambientOverlay: 'radial-gradient(ellipse at 50% 40%, rgba(6, 182, 212, 0.14) 0%, rgba(2, 6, 23, 0.45) 80%, rgba(2, 6, 23, 0.7) 100%)'
  }
];

// -----------------------------------------------------------------------------
// 7. INITIAL DEFAULT PALACE STATE
// -----------------------------------------------------------------------------
export function createDefaultAzurePalaceState() {
  return {
    character: 'akhira',
    currentRoom: 'living',
    atmosphere: 'sunlit_azure',
    playerX: 50,
    playerY: 72,
    inventory: [
      { id: 'glow_kelp', name: 'Glow Kelp', icon: '🌿', count: 4 },
      { id: 'pearl_rice', name: 'Pearl Rice', icon: '🍚', count: 3 },
      { id: 'coral_berries', name: 'Coral Berries', icon: '🍒', count: 3 },
      { id: 'crystal_sugar', name: 'Crystal Sugar', icon: '🍬', count: 5 },
      { id: 'seafoam_cream', name: 'Seafoam Cream', icon: '🥛', count: 3 },
      { id: 'abyssal_water', name: 'Abyssal Essence Water', icon: '💧', count: 4 }
    ],
    cookedDishes: ['kelp_chowder'],
    gardenSlots: [
      { slotId: 1, seedId: 'abyssal_lotus', plantName: 'Abyssal Star Lotus', stage: 'blooming', plantedAt: Date.now() - 30000, watered: true },
      { slotId: 2, seedId: 'biolum_fern', plantName: 'Bioluminescent Coral Fern', stage: 'growing', plantedAt: Date.now() - 10000, watered: true },
      { slotId: 3, seedId: 'electric_sea_blossom', plantName: 'Electric Cyan Sea Blossom ⚡', stage: 'seed', plantedAt: Date.now(), watered: false }
    ],
    collectibles: [
      { id: 'lightning_pearl', found: true, foundAt: 'Palung Petir Samudra' },
      { id: 'ancient_amulet', found: true, foundAt: 'Kubah Karang Kuno' },
      { id: 'star_compass', found: false },
      { id: 'electric_geode', found: false }
    ],
    journalEntries: [
      {
        id: 'j1',
        title: 'Membangun The Azure Tide Palace',
        date: 'Awal Era Samudra',
        content: 'Istana bawah laut ini akhirnya selesai. Dari jendela living room, ubur-ubur bercahaya berenang dengan damai. Petir di dalam nadiku dan keheningan laut telah bersatu menjadi rumah terindah.'
      }
    ],
    tasks: AZURE_PALACE_TASKS.map(t => ({ ...t })),
    decorOptions: {
      bedroomCanopyColor: 'aquamarine', // 'aquamarine' | 'pearl' | 'deep_blue' | 'lavender'
      livingChandelier: 'jellyfish_cyan', // 'jellyfish_cyan' | 'pearl_crystal' | 'gold_coral'
      oceanWindowTint: 'azure' // 'azure' | 'midnight' | 'biolum'
    },
    stats: {
      dishesCooked: 1,
      plantsHarvested: 2,
      notesPlayed: 0,
      oceanGazedCount: 0,
      lightningChanneledCount: 0
    },
    updatedAt: Date.now()
  };
}

// -----------------------------------------------------------------------------
// 8. STORAGE PERSISTENCE (LOAD / SAVE / RESET)
// -----------------------------------------------------------------------------
export function loadAzurePalaceState(characterKey = 'akhira') {
  try {
    const raw = localStorage.getItem(`${AZURE_PALACE_STORAGE_KEY}_${characterKey}`);
    if (!raw) return createDefaultAzurePalaceState();
    const parsed = JSON.parse(raw);
    const defaults = createDefaultAzurePalaceState();
    return {
      ...defaults,
      ...parsed,
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : defaults.inventory,
      gardenSlots: Array.isArray(parsed.gardenSlots) ? parsed.gardenSlots : defaults.gardenSlots,
      collectibles: Array.isArray(parsed.collectibles) ? parsed.collectibles : defaults.collectibles,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaults.tasks,
      decorOptions: { ...defaults.decorOptions, ...parsed.decorOptions },
      stats: { ...defaults.stats, ...parsed.stats }
    };
  } catch (err) {
    console.warn('[AzurePalaceState] Failed to load localStorage state, using defaults:', err);
    return createDefaultAzurePalaceState();
  }
}

export function saveAzurePalaceState(characterKey = 'akhira', state) {
  try {
    if (!state) return;
    state.updatedAt = Date.now();
    localStorage.setItem(`${AZURE_PALACE_STORAGE_KEY}_${characterKey}`, JSON.stringify(state));
  } catch (err) {
    console.warn('[AzurePalaceState] Failed to save localStorage state:', err);
  }
}

// -----------------------------------------------------------------------------
// 9. WEB AUDIO API SYNTHESIZER (OCEANIC SOUND FX & AQUATIC PIANO)
// -----------------------------------------------------------------------------
let palaceAudioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!palaceAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) palaceAudioCtx = new AudioContext();
  }
  if (palaceAudioCtx && palaceAudioCtx.state === 'suspended') {
    palaceAudioCtx.resume().catch(() => {});
  }
  return palaceAudioCtx;
}

/**
 * Play aquatic piano note with warm underwater reverb and shimmering resonance
 */
export function playAquaticPianoNote(frequency = 440) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const oscSub = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, now);

  oscSub.type = 'sine';
  oscSub.frequency.setValueAtTime(frequency * 0.5, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.frequency.exponentialRampToValueAtTime(450, now + 1.2);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

  osc.connect(filter);
  oscSub.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  oscSub.start(now);
  osc.stop(now + 1.7);
  oscSub.stop(now + 1.7);
}

/**
 * Play gentle ocean bubble splash / chime
 */
export function playOceanChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.07);

    gain.gain.setValueAtTime(0.001, now + idx * 0.07);
    gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.07 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.07);
    osc.stop(now + idx * 0.07 + 0.9);
  });
}

/**
 * Play electric cyan plasma resonance (Akhira lightning signature)
 */
export function playElectricCyanResonance() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const oscMod = ctx.createOscillator();
  const modGain = ctx.createGain();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);

  oscMod.type = 'sine';
  oscMod.frequency.setValueAtTime(45, now);
  modGain.gain.setValueAtTime(80, now);

  oscMod.connect(modGain);
  modGain.connect(osc.frequency);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);

  oscMod.start(now);
  osc.start(now);
  oscMod.stop(now + 0.65);
  osc.stop(now + 0.65);
}

/**
 * Play cooking sizzle & water bubble sound
 */
export function playOceanCookingSizzle() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // White noise burst for sizzle
  const bufferSize = ctx.sampleRate * 0.8;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.15;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.Q.setValueAtTime(2, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.85);
}

