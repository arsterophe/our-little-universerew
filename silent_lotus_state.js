/**
 * THE SILENT LOTUS HOUSE — ELA 🌸 (UNIVERSE US AGAIN)
 * Ela's Sanctuary of Stillness — Japanese-Inspired Fantasy Lotus Cottage
 * State Management, Room Architectures, Botanical Catalogs, Friendship Letters,
 * Hidden Collectibles, Web Audio Synthesis, and Resilient Storage.
 * =============================================================================
 */

import {
  OLU_STORE_HOUSE_STATES,
  getSynchronousState,
  setSynchronousState
} from './olu_indexeddb.js';

export const SILENT_LOTUS_STORAGE_KEY = 'silent_lotus_house_state_ela';

export const SILENT_LOTUS_CHARACTER = {
  key: 'ela',
  name: 'Ela',
  symbol: '🌸',
  title: 'The Serene Lotus Weaver',
  houseName: 'THE SILENT LOTUS HOUSE',
  tagline: "Ela's Sanctuary of Stillness — Where Gentle Waters & Blooming Lotuses Bring Eternal Peace.",
  palette: {
    primary: '#a855f7',          // Soft Lavender
    dustyViolet: '#7e22ce',      // Dusty Violet
    pearlWhite: '#fdf4ff',       // Pearl White
    mutedBlushPink: '#f472b6',   // Muted Blush Pink
    softMauve: '#c084fc',        // Soft Mauve
    roseGold: '#fb7185',         // Rose Gold Accent
    deepZen: '#581c87',          // Deep Zen Purple
    teaSage: '#86efac'           // Subtle Sage Accent
  }
};

// -----------------------------------------------------------------------------
// 1. FIVE INTERCONNECTED ROOMS CONFIGURATION
// -----------------------------------------------------------------------------
export const SILENT_LOTUS_ROOMS = [
  {
    id: 'living',
    name: 'Lotus Living Room',
    subtitle: 'Ruang Keluarga Utama, Sofa Lavender & Piano Bunga Putih',
    icon: '🪷',
    bgImage: '/assets/silent_lotus_living.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'curved_sofa', minX: 18, maxX: 42, minY: 48, maxY: 66 },
      { id: 'white_piano', minX: 68, maxX: 88, minY: 40, maxY: 56 },
      { id: 'tea_table', minX: 42, maxX: 58, minY: 52, maxY: 64 }
    ],
    hotspots: [
      { id: 'hs_living_sofa', x: 30, y: 55, icon: '🛋️', label: 'Sofa Lavender & Pearl White', action: 'sit_sofa', prompt: '✦ [E] Duduk & Bersantai di Sofa Lembut' },
      { id: 'hs_living_piano', x: 78, y: 48, icon: '🎹', label: 'Piano Putih Bunga Teratai', action: 'play_piano', prompt: '✦ [E] Mainkan Melodi Koto & Piano Teratai' },
      { id: 'hs_living_window', x: 50, y: 36, icon: '🪟', label: 'Jendela Panorama Taman Teratai', action: 'gaze_garden', prompt: '✦ [E] Menikmati Pemandangan Kolam Teratai' },
      { id: 'hs_living_books', x: 86, y: 64, icon: '📚', label: 'Rak Buku Sastra & Puisi Jepang', action: 'read_bookshelf', prompt: '✦ [E] Baca Koleksi Puisi & Filosofi Damai' },
      { id: 'hs_living_tea', x: 50, y: 58, icon: '🍵', label: 'Meja Teh Kayu & Cangkir Keramik', action: 'sip_tea', prompt: '✦ [E] Nikmati Seduhan Teh Bunga Teratai' },
      { id: 'hs_living_door_bed', x: 12, y: 45, icon: '🛏️', label: 'Ke Silent Bloom Bedroom', action: 'goto_bedroom', prompt: '✦ [E] Masuk ke Kamar Tidur Ela' },
      { id: 'hs_living_door_kitchen', x: 88, y: 45, icon: '🍳', label: 'Ke Lavender Tea Kitchen', action: 'goto_kitchen', prompt: '✦ [E] Masuk ke Dapur Teh' },
      { id: 'hs_living_door_conservatory', x: 32, y: 78, icon: '🌿', label: 'Ke Enchanted Lotus Conservatory', action: 'goto_conservatory', prompt: '✦ [E] Masuk ke Rumah Kaca Teratai' },
      { id: 'hs_living_door_attic', x: 68, y: 78, icon: '📜', label: 'Ke Memory Attic', action: 'goto_attic', prompt: '✦ [E] Naik ke Loteng Kenangan' }
    ]
  },
  {
    id: 'bedroom',
    name: 'Silent Bloom Bedroom',
    subtitle: 'Bilik Kanopi Sutra Lavender, Meja Rias & Teras Danau Teratai',
    icon: '🛏️',
    bgImage: '/assets/silent_lotus_bedroom.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'canopy_bed', minX: 14, maxX: 40, minY: 38, maxY: 62 },
      { id: 'vanity_table', minX: 62, maxX: 86, minY: 38, maxY: 52 },
      { id: 'wardrobe', minX: 74, maxX: 90, minY: 56, maxY: 76 }
    ],
    hotspots: [
      { id: 'hs_bed_rest', x: 26, y: 48, icon: '🛏️', label: 'Tempat Tidur Kanopi Sutra Lavender', action: 'rest_bed', prompt: '✦ [E] Tidur Nyenyak & Beristirahat Tenang' },
      { id: 'hs_bed_journal', x: 74, y: 44, icon: '📓', label: 'Meja Jurnal & Catatan Refleksi', action: 'write_journal', prompt: '✦ [E] Tulis Jurnal Pribadi & Renungan Hati' },
      { id: 'hs_bed_wardrobe', x: 82, y: 64, icon: '👘', label: 'Lemari Pakaian Sutra & Kimono', action: 'open_wardrobe', prompt: '✦ [E] Ganti Pakaian & Aksesori Cantik' },
      { id: 'hs_bed_window', x: 50, y: 38, icon: '🌙', label: 'Jendela Besar Kolam Teratai Malam', action: 'look_window', prompt: '✦ [E] Menatap Pantulan Bulan di Danau Teratai' },
      { id: 'hs_bed_decor', x: 34, y: 72, icon: '🦋', label: 'Pengaturan Dekorasi Kupu-kupu & Bunga', action: 'bedroom_decor', prompt: '✦ [E] Atur Nuansa Kamar Tidur' },
      { id: 'hs_bed_door_living', x: 88, y: 76, icon: '🪷', label: 'Kembali ke Lotus Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Lavender Tea Kitchen',
    subtitle: 'Dapur Santuari Jepang, Seduhan Teh Herbal & Manisan Bunga',
    icon: '🍳',
    bgImage: '/assets/silent_lotus_kitchen.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'stove_oven', minX: 14, maxX: 38, minY: 38, maxY: 52 },
      { id: 'pantry_fridge', minX: 42, maxX: 56, minY: 38, maxY: 50 },
      { id: 'prep_island', minX: 30, maxX: 70, minY: 56, maxY: 70 }
    ],
    hotspots: [
      { id: 'hs_kitchen_oven', x: 26, y: 44, icon: '🔥', label: 'Kompor & Oven Pembuat Manisan', action: 'cook_oven', prompt: '✦ [E] Panggang Kue & Dessert Beraroma Bunga' },
      { id: 'hs_kitchen_fridge', x: 48, y: 44, icon: '❄️', label: 'Kulkas Kayu Putih Bahan Alami', action: 'open_fridge', prompt: '✦ [E] Ambil Bahan Segar & Kelopak Bunga' },
      { id: 'hs_kitchen_prep', x: 50, y: 62, icon: '🍵', label: 'Meja Persiapan & Set Peralatan Teh', action: 'brew_tea', prompt: '✦ [E] Seduh Teh Herbal Lavender & Teratai' },
      { id: 'hs_kitchen_dining', x: 74, y: 62, icon: '🪑', label: 'Meja Makan Kecil & Cangkir Keramik', action: 'dining_table', prompt: '✦ [E] Nikmati Kudapan Sore di Meja Makan' },
      { id: 'hs_kitchen_cookbook', x: 84, y: 44, icon: '📖', label: 'Buku Resep Teh & Kue Tradisional', action: 'cookbook', prompt: '✦ [E] Buka Daftar Resep Santuari' },
      { id: 'hs_kitchen_door_living', x: 12, y: 76, icon: '🪷', label: 'Kembali ke Lotus Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  },
  {
    id: 'conservatory',
    name: 'Enchanted Lotus Conservatory',
    subtitle: 'Rumah Kaca Teratai Suci, Kolam Teratai & Pohon Sakura',
    icon: '🌿',
    bgImage: '/assets/silent_lotus_conservatory.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'lotus_pond', minX: 34, maxX: 66, minY: 52, maxY: 74 },
      { id: 'sakura_tree', minX: 12, maxX: 32, minY: 36, maxY: 56 },
      { id: 'garden_bench', minX: 68, maxX: 88, minY: 48, maxY: 64 }
    ],
    hotspots: [
      { id: 'hs_cons_pond', x: 50, y: 64, icon: '🪷', label: 'Kolam Teratai Raksasa & Ikan Koi', action: 'lotus_pond', prompt: '✦ [E] Amati Teratai Mekar & Ikan Koi' },
      { id: 'hs_cons_garden1', x: 22, y: 46, icon: '🌱', label: 'Petak Kebun Bunga Lavender & Sakura (Slot 1 & 2)', action: 'plant_garden', prompt: '✦ [E] Rawat & Tanam Benih Bunga' },
      { id: 'hs_cons_garden2', x: 78, y: 42, icon: '🌺', label: 'Pot Porselen Teratai Abyssal (Slot 3)', action: 'crystal_pot', prompt: '✦ [E] Rawat Teratai Langka di Pot Porselen' },
      { id: 'hs_cons_water', x: 38, y: 46, icon: '💧', label: 'Penyiram Air Mata Air Suci', action: 'water_plants', prompt: '✦ [E] Siram Tanaman dengan Air Sejuk' },
      { id: 'hs_cons_harvest', x: 62, y: 46, icon: '🧺', label: 'Keranjang Panen Bunga & Kelopak', action: 'harvest_flowers', prompt: '✦ [E] Panen Bunga Harum & Kumpulkan Benih' },
      { id: 'hs_cons_butterflies', x: 50, y: 38, icon: '🦋', label: 'Pohon Sakura & Kupu-kupu Menari', action: 'observe_butterflies', prompt: '✦ [E] Mengamati Tarian Kupu-kupu di Sakura' },
      { id: 'hs_cons_bench', x: 78, y: 56, icon: '🪑', label: 'Bangku Taman Meditasi & Hening', action: 'meditate_bench', prompt: '✦ [E] Duduk Meditasi Menemukan Ketenangan' },
      { id: 'hs_cons_door_living', x: 88, y: 76, icon: '🪷', label: 'Kembali ke Lotus Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  },
  {
    id: 'attic',
    name: 'Memory Attic — Letters of the Silent Lotus',
    subtitle: 'Loteng Cerita, Rak Surat Sahabat & Koleksi Kenangan',
    icon: '📜',
    bgImage: '/assets/silent_lotus_attic.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'writing_desk', minX: 18, maxX: 40, minY: 42, maxY: 58 },
      { id: 'bookshelf_letters', minX: 64, maxX: 86, minY: 40, maxY: 56 },
      { id: 'scrapbook_table', minX: 42, maxX: 60, minY: 56, maxY: 70 }
    ],
    hotspots: [
      { id: 'hs_attic_desk', x: 28, y: 50, icon: '✍️', label: 'Meja Menulis Vintage & Pena Bulu', action: 'write_memory', prompt: '✦ [E] Tulis Surat Balasan & Kenangan Manis' },
      { id: 'hs_attic_letters', x: 76, y: 48, icon: '💌', label: 'Rak Surat Sahabat Our Little Universe', action: 'read_letters', prompt: '✦ [E] Baca Surat Penuh Kasih dari Sahabat' },
      { id: 'hs_attic_scrapbook', x: 50, y: 62, icon: '🖼️', label: 'Scrapbook Kenangan & Album Foto', action: 'view_scrapbook', prompt: '✦ [E] Buka Lembaran Album Foto & Scrapbook' },
      { id: 'hs_attic_flowers', x: 24, y: 68, icon: '🌸', label: 'Etalase Bunga Sakura & Teratai Awetan', action: 'preserved_flowers', prompt: '✦ [E] Lihat Koleksi Bunga Kering Kenangan' },
      { id: 'hs_attic_chest', x: 76, y: 68, icon: '🧰', label: 'Peti Pusaka & Artefak Rahasia', action: 'open_chest', prompt: '✦ [E] Buka Kotak Benda Sentimental Rahasia' },
      { id: 'hs_attic_secret_corner', x: 50, y: 40, icon: '✨', label: 'Sudut Meditasi Teratai Abadi (Secret Corner)', action: 'secret_corner', prompt: '✦ [E] Renungan Batin di Sudut Rahasia' },
      { id: 'hs_attic_door_living', x: 88, y: 76, icon: '🪷', label: 'Kembali ke Lotus Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  }
];

// -----------------------------------------------------------------------------
// 2. TEA & PASTRY RECIPES CATALOG (LAVENDER TEA KITCHEN)
// -----------------------------------------------------------------------------
export const SILENT_LOTUS_RECIPES = [
  {
    id: 'moonlit_lotus_tea',
    name: 'Moonlit Lotus Flower Tea 🪷',
    icon: '🍵',
    desc: 'Seduhan kuncup teratai putih pilihan yang disiram air mendidih mata air suci, menghasilkan aroma keheningan yang menenangkan jiwa.',
    ingredients: ['Kuncup Teratai Putih', 'Madu Bunga Liar', 'Air Mata Air Suci'],
    timeSeconds: 3,
    rewardXp: 35
  },
  {
    id: 'sakura_blossom_mochi',
    name: 'Sakura Blossom Mochi 🌸',
    icon: '🍡',
    desc: 'Kue mochi kenyal berbalut kelopak bunga sakura awetan dengan isian pasta kacang manis lembut.',
    ingredients: ['Tepung Beras Ketan', 'Kelopak Sakura Segar', 'Pasta Kacang Manis'],
    timeSeconds: 4,
    rewardXp: 40
  },
  {
    id: 'lavender_honey_chiffon',
    name: 'Lavender Honey Chiffon Cake 💜',
    icon: '🍰',
    desc: 'Kue chiffon yang sangat lembut dengan aroma lavender Prancis dan sirup madu keemasan.',
    ingredients: ['Esensi Lavender', 'Madu Bunga Liar', 'Tepung Kue Halus'],
    timeSeconds: 5,
    rewardXp: 50
  },
  {
    id: 'matcha_lotus_tartlet',
    name: 'Matcha Lotus Tartlet 🍃',
    icon: '🧁',
    desc: 'Kue tartlet mini dengan custard matcha kental dan hiasan kelopak teratai kristal manis.',
    ingredients: ['Bubuk Matcha Asli', 'Krim Susu Sutra', 'Kuncup Teratai Putih'],
    timeSeconds: 4,
    rewardXp: 45
  },
  {
    id: 'sweet_plum_cordial',
    name: 'Sweet Plum Sparkling Cordial 🍹',
    icon: '🍷',
    desc: 'Minuman dingin sari buah prem Jepang dengan gelembung soda menyegarkan dan daun mint.',
    ingredients: ['Buah Prem Jepang', 'Soda Embun Pagi', 'Madu Bunga Liar'],
    timeSeconds: 3,
    rewardXp: 30
  }
];

// -----------------------------------------------------------------------------
// 3. BOTANICAL FLORA CATALOG (ENCHANTED LOTUS CONSERVATORY)
// -----------------------------------------------------------------------------
export const SILENT_LOTUS_FLOWERS = [
  {
    id: 'moonlight_lotus',
    name: 'Moonlight White Lotus',
    icon: '🪷',
    bloomIcon: '🪷✨',
    color: '#fdf4ff',
    growthDurationSeconds: 15,
    yieldItem: 'Kuncup Teratai Putih',
    desc: 'Teratai anggun yang mekar sempurna memancarkan ketenangan suci di bawah rembulan.'
  },
  {
    id: 'sakura_blossom',
    name: 'Pastel Sakura Blossom',
    icon: '🌸',
    bloomIcon: '🌸💫',
    color: '#f472b6',
    growthDurationSeconds: 20,
    yieldItem: 'Kelopak Sakura Segar',
    desc: 'Bunga sakura merah muda lambang keanggunan, ketulusan, dan harapan yang bersemi kembali.'
  },
  {
    id: 'imperial_lavender',
    name: 'Imperial Lavender Sprig',
    icon: '🌾',
    bloomIcon: '🌾💜',
    color: '#a855f7',
    growthDurationSeconds: 18,
    yieldItem: 'Esensi Lavender',
    desc: 'Tangkai lavender harum semerbak yang mampu meredakan segala gundah dan kecemasan.'
  },
  {
    id: 'celestial_violet_lotus',
    name: 'Celestial Violet Lotus 🌟',
    icon: '🪻',
    bloomIcon: '🪻✨',
    color: '#7e22ce',
    growthDurationSeconds: 25,
    yieldItem: 'Kelopak Teratai Langka',
    desc: 'Teratai legendaris berwarna ungu tua yang memancarkan pendaran magis setiap malam purnama.'
  }
];

// -----------------------------------------------------------------------------
// 4. FRIENDSHIP LETTERS ARCHIVE (MEMORY ATTIC)
// -----------------------------------------------------------------------------
export const SILENT_LOTUS_LETTERS = [
  {
    id: 'letter_nyanya',
    sender: 'Nyanya ⭐',
    universe: 'KIDULT',
    icon: '⭐',
    date: 'Hari Bintang Jatuh',
    excerpt: 'Untuk Ela tersayang... saat dunia terasa bising, aku selalu membayangkan teratai mekar di rumahmu...',
    fullLetter: 'Halo Ela tersayang! ⭐\n\nBagaimana kabarmu di Silent Lotus House hari ini? Aku sedang membuat boneka teratai kecil di Kidult Dream House dan langsung teringat padamu. Setiap kali aku merasa lelah atau bingung, aku mengingat senyum lembutmu dan aroma teh lavender yang selalu menenangkan.\n\nJangan lupa tersenyum ya, Ela! Bintang-bintang di semesta ini selalu menyinari rumahmu dengan penuh kehangatan.\n\nPeluk hangat,\nNyanya ⭐'
  },
  {
    id: 'letter_lala',
    sender: 'Lala ☀️',
    universe: 'TO YOU',
    icon: '☀️',
    date: 'Musim Bunga Merekah',
    excerpt: 'Matahari di Bloom Cottage selalu hangat, tapi keheningan di rumahmu adalah obat terbaik bagi jiwa...',
    fullLetter: 'Ela sahabatku yang anggun, ☀️\n\nKupu-kupu peach dari Butterfly Conservatory-ku baru saja terbang ke arah timur, dan aku membayangkan mereka mampir ke rumah kacamu di US AGAIN. Aku mengirimkan beberapa kantung benih madu bunga peri untuk kamu tanam di tepi kolam terataimu.\n\nNanti kalau bunganya sudah mekar, kita piknik teh bersama ya? Aku akan bawakan kue strawberry cupcake favoritmu!\n\nDengan cinta matahari,\nLala ☀️'
  },
  {
    id: 'letter_lele',
    sender: 'Lele 🌙',
    universe: 'SHADOW / THE ECLIPSE',
    icon: '🌙',
    date: 'Purnama Abadi',
    excerpt: 'Dari jendela The Eclipse, aku memandang pantulan danau terataimu... keheninganmu adalah kekuatan...',
    fullLetter: 'Untuk Ela, 🌙\n\nDi antara jutaan buku di perpustakaan The Eclipse, ada satu puisi kuno yang selalu mengingatkanku padamu: "Bunga teratai tumbuh di dalam lumpur gelap, namun saat ia mekar, tiada noda sedikit pun yang mampu mengaburkan keindahannya."\n\nRumahmu adalah benteng ketenangan terindah di Our Little Universe. Teruslah menjadi tempat berlabuh yang damai bagi kita semua.\n\nSahabat malammu,\nLele 🌙'
  },
  {
    id: 'letter_akhira',
    sender: 'Akhira ⚡',
    universe: 'YAWN',
    icon: '⚡',
    date: 'Pasang Laut Biru',
    excerpt: 'Gelombang samudra Azure Tide Palace berbisik lembut menyapa teratai suci di santuarimu...',
    fullLetter: 'Hai Ela! ⚡\n\nDari kedalaman samudra Azure Tide Palace, aku melihat riak air danau terataimu terhubung melalui mata air bawah tanah. Aku mengirimkan sebuah mutiara laut biru berarus lembut untuk ditaruh di kolam rumah kacamu.\n\nPetirku mungkin cepat dan bergemuruh, tetapi di hadapan ketenangan terataimu, semua petir berubah menjadi cahaya pelindung yang hangat.\n\nSalam dari samudera,\nAkhira ⚡'
  },
  {
    id: 'letter_syma',
    sender: 'Syma ☁️',
    universe: 'PINWHEEL',
    icon: '☁️',
    date: 'Hari Angin Semilir',
    excerpt: 'Angin dari Windwhisper Residence membawa aroma harum seduhan teh Ela melintasi langit biru...',
    fullLetter: 'Ela manis, ☁️\n\nSetiap kali genta angin di rumahku berdentang lembut, angin sepoi-sepoi berbisik tentang betapa indahnya aroma teh lavender yang sedang kamu seduh. Aku selalu suka memotret langit saat awan-awan berbentuk kelopak bunga teratai.\n\nTetaplah menjadi diri Ela yang tenang dan penuh kasih ya!\n\nPeluk awan,\nSyma ☁️'
  },
  {
    id: 'letter_ruben',
    sender: 'Ruben 🐉',
    universe: 'ASH',
    icon: '🐉',
    date: 'Puncak Bara Api Abadi',
    excerpt: 'Sebagai pelindung naga, sumpahku adalah menjaga agar api kedamaian di santuari Ela tak pernah padam...',
    fullLetter: 'Salam hormat, Ela. 🐉\n\nBahkan di tengah bara api dan dinginnya abu Gunung Ash, ketenangan yang terpancar dari The Silent Lotus House terasa sampai ke bentengku. Jangan pernah ragu bila ada badai yang mengancam—naga pelindung akan selalu membentangkan sayapnya di atas langit US AGAIN.\n\nKetenanganmu adalah harta yang pantas dijaga seumur hidup.\n\nRuben 🐉'
  },
  {
    id: 'letter_royan',
    sender: 'Royan 🎆',
    universe: 'HOT',
    icon: '🎆',
    date: 'Festival Malam Terang',
    excerpt: 'Kembang apiku mungkin meledak terang di langit, tapi keheningan Ela adalah bintang sejatinya!',
    fullLetter: 'Yooo Ela! 🎆\n\nKemarin malam festival kembang api di universe HOT pecah banget! Aku sempat meledakkan kembang api khusus berbentuk bunga teratai lavender di udara—kelihatan sampai ke langit rumahmu nggak? Haha!\n\nKapan-kapan mampir ya, nanti aku ajak nyalain lampion terbang bareng-bareng!\n\nTetap santuy dan elegan!\nRoyan 🎆'
  }
];

// -----------------------------------------------------------------------------
// 5. HIDDEN COLLECTIBLES & SENTIMENTAL ARTIFACTS
// -----------------------------------------------------------------------------
export const SILENT_LOTUS_COLLECTIBLES = [
  {
    id: 'rose_gold_brooch',
    name: 'Rose Gold Lotus Brooch 🪷',
    icon: '💠',
    room: 'living',
    desc: 'Bros teratai emas mawar pusaka dengan permata lavender di tengahnya, lambang ketenangan batin yang abadi.'
  },
  {
    id: 'silk_butterfly_ribbon',
    name: 'Silk Butterfly Ribbon 🦋',
    icon: '🎀',
    room: 'bedroom',
    desc: 'Pita sutra lavender peninggalan masa kecil yang selalu diikatkan Ela di cermin meja rias.'
  },
  {
    id: 'carved_jade_teacup',
    name: 'Carved Jade Lotus Teacup 🍵',
    icon: '🍶',
    room: 'kitchen',
    desc: 'Cangkir giok kuno berukir kelopak bunga teratai yang membuat rasa teh terasa jauh lebih manis dan sejuk.'
  },
  {
    id: 'sakura_paperweight',
    name: 'Sakura Glass Paperweight 🌸',
    icon: '🔮',
    room: 'attic',
    desc: 'Pemberat kertas kristal berisi kelopak bunga sakura abadi yang tidak akan pernah layu dimakan waktu.'
  }
];

// -----------------------------------------------------------------------------
// 6. DAILY OBJECTIVES & PROGRESSION
// -----------------------------------------------------------------------------
export const SILENT_LOTUS_TASKS = [
  { id: 'task_piano', label: 'Mainkan alunan melodi teratai di piano putih', done: false, xp: 20 },
  { id: 'task_tea', label: 'Seduh secangkir Moonlit Lotus Tea di dapur', done: false, xp: 25 },
  { id: 'task_garden', label: 'Tanam & siram bunga di Enchanted Conservatory', done: false, xp: 30 },
  { id: 'task_letter', label: 'Baca surat penuh kehangatan dari para sahabat', done: false, xp: 20 },
  { id: 'task_meditate', label: 'Duduk hening di sudut meditasi teratai abadi', done: false, xp: 25 },
  { id: 'task_journal', label: 'Tulis renungan batin di jurnal pribadi Ela', done: false, xp: 20 }
];

// -----------------------------------------------------------------------------
// 7. LIGHTING ATMOSPHERES
// -----------------------------------------------------------------------------
export const SILENT_LOTUS_ATMOSPHERES = [
  {
    id: 'morning_mist',
    name: 'Morning Mist (Kabut Fajar Lembut)',
    icon: '🌅',
    desc: 'Sinar fajar keemasan menembus kabut tipis di atas kolam teratai, menghadirkan kesegaran embun pagi.',
    ambientOverlay: 'radial-gradient(ellipse at 50% 20%, rgba(244, 114, 182, 0.15) 0%, rgba(168, 85, 247, 0.10) 60%, rgba(88, 28, 135, 0.20) 100%)'
  },
  {
    id: 'afternoon_bloom',
    name: 'Afternoon Bloom (Sore Sakura Hangat)',
    icon: '☀️',
    desc: 'Cahaya sore hangat bernuansa rose gold dengan semilir angin yang menerbangkan kelopak sakura.',
    ambientOverlay: 'radial-gradient(ellipse at 50% 30%, rgba(251, 113, 133, 0.18) 0%, rgba(192, 132, 252, 0.12) 55%, rgba(46, 16, 101, 0.25) 100%)'
  },
  {
    id: 'moonlit_zen',
    name: 'Moonlit Zen (Keheningan Rembulan Ungu)',
    icon: '🌙',
    desc: 'Malam tenang di bawah naungan rembulan ungu lavender, lampion temaram dan gemercik air kolam teratai.',
    ambientOverlay: 'radial-gradient(ellipse at 50% 40%, rgba(126, 34, 206, 0.20) 0%, rgba(15, 23, 42, 0.45) 80%, rgba(3, 7, 18, 0.65) 100%)'
  }
];

// -----------------------------------------------------------------------------
// 8. INITIAL DEFAULT PALACE STATE
// -----------------------------------------------------------------------------
export function createDefaultSilentLotusState() {
  return {
    character: 'ela',
    currentRoom: 'living',
    atmosphere: 'afternoon_bloom',
    playerX: 50,
    playerY: 72,
    inventory: [
      { id: 'lotus_buds', name: 'Kuncup Teratai Putih', icon: '🪷', count: 5 },
      { id: 'sakura_petals', name: 'Kelopak Sakura Segar', icon: '🌸', count: 6 },
      { id: 'lavender_essence', name: 'Esensi Lavender', icon: '🌾', count: 4 },
      { id: 'wild_honey', name: 'Madu Bunga Liar', icon: '🍯', count: 4 },
      { id: 'mochi_flour', name: 'Tepung Beras Ketan', icon: '🌾', count: 5 },
      { id: 'spring_water', name: 'Air Mata Air Suci', icon: '💧', count: 6 }
    ],
    cookedDishes: ['moonlit_lotus_tea'],
    gardenSlots: [
      { slotId: 1, seedId: 'moonlight_lotus', plantName: 'Moonlight White Lotus', stage: 'blooming', plantedAt: Date.now() - 30000, watered: true },
      { slotId: 2, seedId: 'sakura_blossom', plantName: 'Pastel Sakura Blossom', stage: 'growing', plantedAt: Date.now() - 10000, watered: true },
      { slotId: 3, seedId: 'celestial_violet_lotus', plantName: 'Celestial Violet Lotus 🌟', stage: 'seed', plantedAt: Date.now(), watered: false }
    ],
    collectibles: [
      { id: 'rose_gold_brooch', found: true, foundAt: 'Sofa Lotus Living Room' },
      { id: 'silk_butterfly_ribbon', found: true, foundAt: 'Cermin Silent Bloom Bedroom' },
      { id: 'carved_jade_teacup', found: false },
      { id: 'sakura_paperweight', found: false }
    ],
    journalEntries: [
      {
        id: 'j1',
        title: 'Membangun The Silent Lotus House',
        date: 'Awal Musim Teratai',
        content: 'Rumah perlindungan ini akhirnya selesai dibangun di tengah taman teratai. Gemercik air yang lembut dan keheningan malam memberikan kedamaian abadi yang selalu kurindukan. Semoga tempat ini selalu menjadi ruang yang ramah bagi hati yang mencari ketenangan.'
      }
    ],
    tasks: SILENT_LOTUS_TASKS.map(t => ({ ...t })),
    decorOptions: {
      bedroomCanopyColor: 'lavender', // 'lavender' | 'pearl' | 'rose_gold' | 'blush'
      livingLanterns: 'paper_lotus',   // 'paper_lotus' | 'crystal_violet' | 'warm_candle'
      conservatoryWater: 'serene_blue' // 'serene_blue' | 'moonlit_purple' | 'spring_clear'
    },
    stats: {
      dishesCooked: 1,
      flowersHarvested: 2,
      notesPlayed: 0,
      gardenGazedCount: 0,
      meditationsDone: 0
    },
    updatedAt: Date.now()
  };
}

// -----------------------------------------------------------------------------
// 9. STORAGE PERSISTENCE (LOAD / SAVE / RESET)
// -----------------------------------------------------------------------------
export function loadSilentLotusState(characterKey = 'ela') {
  try {
    return getSynchronousState(
      OLU_STORE_HOUSE_STATES,
      SILENT_LOTUS_STORAGE_KEY,
      () => createDefaultSilentLotusState()
    );
  } catch (err) {
    console.warn('[SilentLotusState] Failed to load from storage engine, returning defaults:', err);
    return createDefaultSilentLotusState();
  }
}

export function saveSilentLotusState(characterKey = 'ela', stateObj = null) {
  if (!stateObj) return;
  try {
    const payload = {
      ...stateObj,
      character: characterKey || 'ela',
      updatedAt: Date.now()
    };
    setSynchronousState(
      OLU_STORE_HOUSE_STATES,
      SILENT_LOTUS_STORAGE_KEY,
      payload,
      { character: characterKey || 'ela', universe: 'US AGAIN' }
    );
  } catch (err) {
    console.error('[SilentLotusState] Failed to persist to storage engine:', err);
  }
}

export function resetSilentLotusState(characterKey = 'ela') {
  const fresh = createDefaultSilentLotusState();
  saveSilentLotusState(characterKey, fresh);
  return fresh;
}

// -----------------------------------------------------------------------------
// 10. WEB AUDIO API SYNTHESIZERS (ZERO DEPENDENCY REAL-TIME AUDIO)
// -----------------------------------------------------------------------------
let lotusAudioCtx = null;

function getAudioContext() {
  if (!lotusAudioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) lotusAudioCtx = new AudioContext();
  }
  if (lotusAudioCtx && lotusAudioCtx.state === 'suspended') {
    lotusAudioCtx.resume().catch(() => {});
  }
  return lotusAudioCtx;
}

/**
 * Play Japanese Koto / Zen harp note with warm wooden resonance
 */
export function playLotusKotoChime(frequency = 440) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const oscHarmonic = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, now);

  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.setValueAtTime(frequency * 2, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1800, now);
  filter.frequency.exponentialRampToValueAtTime(320, now + 1.5);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

  osc.connect(filter);
  oscHarmonic.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  oscHarmonic.start(now);
  osc.stop(now + 1.9);
  oscHarmonic.stop(now + 1.9);
}

/**
 * Play gentle water drop sound on lotus leaf / pond
 */
export function playWaterDropTone() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.36);
}

/**
 * Play tranquil wind chime harmonic (temple wind bell)
 */
export function playWindChimeZen() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [587.33, 659.25, 880.00, 1174.66]; // D5, E5, A5, D6 (Zen Pentatonic)
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0.001, now + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 1.3);
  });
}

/**
 * Play gentle tea boiling / brewing steam sizzle
 */
export function playTeaBrewingSizzle() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.7;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.12;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800, now);
  filter.Q.setValueAtTime(3, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.75);
}
