/**
 * THE MOONPETAL MANOR — ROYAN 🎆 (UNIVERSE HOT)
 * Royan's Enchanted Elven Residence — The Enchanted Elven Sanctuary
 * State Management, Room Architectures, Elven Recipes, Conservatory Flora,
 * Friendship Letters, Royal Amethyst Relic, Web Audio Synthesis, and Resilient Storage.
 * =============================================================================
 */

export const MOONPETAL_MANOR_STORAGE_KEY = 'moonpetal_manor_house_state_royan';
export const ROYAN_CANONICAL_UID = 'swBN9XodDWRuHE5YbYmeoytrcAx2';

export const MOONPETAL_MANOR_CHARACTER = {
  key: 'royan',
  name: 'Royan',
  symbol: '🎆',
  title: 'The Gentle Guardian · Elven',
  houseName: "THE MOONPETAL MANOR",
  subtitle: "Royan's Enchanted Elven Residence",
  tagline: "Sebuah kediaman bangsawan elf yang tersembunyi di tengah hutan ajaib, dikelilingi bunga bercahaya, pepohonan kuno, kristal, air terjun, dan cahaya bulan.",
  palette: {
    royalViolet: '#7c3aed',      // Royal Violet
    lavender: '#c084fc',         // Lavender
    amethyst: '#9333ea',         // Amethyst Purple
    midnightBlue: '#1e1b4b',     // Midnight Blue
    pearlWhite: '#fdf4ff',       // Pearl White
    softSilver: '#e2e8f0',       // Soft Silver
    champagneGold: '#fbbf24',    // Champagne Gold Accent
    emeraldMist: '#34d399',      // Emerald Forest Mist
    deepSanctuary: '#0b0717'     // Deep Sanctuary Void
  }
};

// -----------------------------------------------------------------------------
// 1. FIVE INTERCONNECTED ROOMS CONFIGURATION
// -----------------------------------------------------------------------------
export const MOONPETAL_MANOR_ROOMS = [
  {
    id: 'living',
    name: 'Enchanted Elven Living Room',
    subtitle: 'Ruang Keluarga Bangsawan Elf, Grand Piano Kristal Amethyst & Perapian Cahaya Bulan',
    icon: '🏛️',
    bgImage: '/assets/moonpetal_manor_living.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'elven_sofa', minX: 16, maxX: 44, minY: 52, maxY: 68 },
      { id: 'crystal_piano', minX: 66, maxX: 86, minY: 42, maxY: 58 },
      { id: 'leaf_coffee_table', minX: 42, maxX: 58, minY: 54, maxY: 66 }
    ],
    hotspots: [
      { id: 'hs_liv_sofa', x: 30, y: 58, icon: '🛋️', label: 'Sofa Royal Lavender & Pearl White', action: 'sit_sofa', prompt: '✦ [E] Duduk Bersantai di Sofa Beludru Sutra Elf' },
      { id: 'hs_liv_piano', x: 76, y: 50, icon: '🎹', label: 'Grand Piano Putih Aksen Amethyst', action: 'play_piano', prompt: '✦ [E] Mainkan Melodi Sonata Hutan Elf di Grand Piano' },
      { id: 'hs_liv_table', x: 50, y: 58, icon: '🍵', label: 'Meja Kristal Ukiran Daun & Teh Herbal Elf', action: 'sip_tea', prompt: '✦ [E] Nikmati Secangkir Teh Bunga Moonpetal Hangat' },
      { id: 'hs_liv_fireplace', x: 86, y: 62, icon: '🔥', label: 'Perapian Kristal Hangat Bercahaya Ungu', action: 'warm_fireplace', prompt: '✦ [E] Menghangatkan Diri di Depan Perapian Kristal' },
      { id: 'hs_liv_bookshelf', x: 12, y: 46, icon: '📚', label: 'Rak Buku Kayu Kuno & Manuskrip Elf', action: 'read_book', prompt: '✦ [E] Membaca Puisi Kuno & Kitab Sejarah Sanctuary' },
      { id: 'hs_liv_window', x: 26, y: 36, icon: '🪟', label: 'Jendela Panorama Menghadap Hutan Ajaib', action: 'gaze_forest', prompt: '✦ [E] Menatap Hutan Elf Bercahaya & Air Terjun Kristal' },
      { id: 'hs_liv_door_bed', x: 8, y: 52, icon: '🛏️', label: 'Ke Moonpetal Royal Bedroom', action: 'goto_bedroom', prompt: '✦ [E] Masuk ke Kamar Tidur Utama Royan' },
      { id: 'hs_liv_door_kitchen', x: 92, y: 52, icon: '🍳', label: 'Ke Starlight Elven Kitchen', action: 'goto_kitchen', prompt: '✦ [E] Masuk ke Dapur Bangsawan Elf' },
      { id: 'hs_liv_door_cons', x: 32, y: 78, icon: '🌿', label: 'Ke Mystic Elven Conservatory', action: 'goto_conservatory', prompt: '✦ [E] Masuk ke Rumah Kaca & Taman Bunga Elf' },
      { id: 'hs_liv_door_atelier', x: 68, y: 78, icon: '📜', label: 'Ke The Eternal Memory Atelier', action: 'goto_atelier', prompt: '✦ [E] Masuk ke Ruang Kenangan & Artefak Abadi' }
    ]
  },
  {
    id: 'bedroom',
    name: 'Moonpetal Royal Bedroom',
    subtitle: 'Bilik Pribadi Bangsawan Elf, Ranjang Kanopi Sutra & Balkon Cahaya Bulan',
    icon: '🛏️',
    bgImage: '/assets/moonpetal_manor_bedroom.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'canopy_bed', minX: 28, maxX: 56, minY: 40, maxY: 64 },
      { id: 'elven_wardrobe', minX: 12, maxX: 26, minY: 38, maxY: 58 },
      { id: 'vanity_table', minX: 60, maxX: 74, minY: 42, maxY: 56 }
    ],
    hotspots: [
      { id: 'hs_bed_sleep', x: 42, y: 50, icon: '🛏️', label: 'Ranjang Besar Kanopi Transparan Moonpetal', action: 'sleep_bed', prompt: '✦ [E] Istirahat & Tidur Pulas di Bawah Naungan Sutra' },
      { id: 'hs_bed_wardrobe', x: 18, y: 46, icon: '👘', label: 'Lemari Pakaian Kayu Ukiran Daun Elf', action: 'open_wardrobe', prompt: '✦ [E] Mengganti Jubah Bangsawan & Aksesori Elf' },
      { id: 'hs_bed_vanity', x: 66, y: 48, icon: '🪞', label: 'Meja Rias Elegan & Cermin Kristal', action: 'vanity_mirror', prompt: '✦ [E] Merapikan Diri & Menyisir Rambut di Cermin Kristal' },
      { id: 'hs_bed_decor', x: 28, y: 64, icon: '🔮', label: 'Meja Samping Lampu Kristal & Hiasan Kamar', action: 'adjust_decor', prompt: '✦ [E] Menyalakan Lampu Kristal & Menata Hiasan Kamar' },
      { id: 'hs_bed_balcony', x: 86, y: 50, icon: '🌙', label: 'Balkon Pribadi Berpagar Bunga Bercahaya', action: 'balcony_view', prompt: '✦ [E] Melangkah ke Balkon Menatap Rembulan Malam' },
      { id: 'hs_bed_door_liv', x: 10, y: 72, icon: '🏛️', label: 'Kembali ke Enchanted Living Room', action: 'goto_living', prompt: '✦ [E] Kembali ke Ruang Keluarga' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Starlight Elven Kitchen',
    subtitle: 'Dapur Bangsawan Elf, Kompor Kristal, Pemanas Air Tembaga & Aroma Kue Hutan',
    icon: '🍳',
    bgImage: '/assets/moonpetal_manor_kitchen.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'kit_prep_counter', minX: 16, maxX: 46, minY: 52, maxY: 68 },
      { id: 'kit_dining_table', minX: 68, maxX: 88, minY: 54, maxY: 72 },
      { id: 'kit_stove_unit', minX: 42, maxX: 56, minY: 40, maxY: 52 }
    ],
    hotspots: [
      { id: 'hs_kit_cook', x: 50, y: 44, icon: '🍳', label: 'Kompor & Oven Kristal Bangsawan Elf', action: 'open_cooking', prompt: '✦ [E] Memasak Hidangan Spesial Hutan Elf' },
      { id: 'hs_kit_pantry', x: 28, y: 58, icon: '🍯', label: 'Meja Persiapan & Rak Bahan Makanan Ajaib', action: 'open_pantry', prompt: '✦ [E] Mengambil Nektar Bunga, Gandum & Buah Segar' },
      { id: 'hs_kit_fridge', x: 14, y: 44, icon: '❄️', label: 'Lemari Pendingin Kristal Es Esensial', action: 'open_fridge', prompt: '✦ [E] Periksa Stok Buah Hutan & Minuman Dingin' },
      { id: 'hs_kit_dessert', x: 38, y: 64, icon: '🍰', label: 'Meja Pembuat Kue & Dessert Bunga Elf', action: 'bake_pastry', prompt: '✦ [E] Membuat Pastry & Tart Buah Amethyst' },
      { id: 'hs_kit_dining', x: 78, y: 60, icon: '🍽️', label: 'Meja Makan Kecil & Cangkir Keramik Halus', action: 'dine_table', prompt: '✦ [E] Duduk Menikmati Hidangan di Sudut Jendela' },
      { id: 'hs_kit_door_liv', x: 10, y: 72, icon: '🏛️', label: 'Kembali ke Enchanted Living Room', action: 'goto_living', prompt: '✦ [E] Kembali ke Ruang Keluarga' }
    ]
  },
  {
    id: 'conservatory',
    name: 'Mystic Elven Conservatory',
    subtitle: 'Rumah Kaca Kaca Putih & Emas, Kolam Refleksi, Kupu-Kupu & Bunga Ajaib',
    icon: '🌿',
    bgImage: '/assets/moonpetal_manor_conservatory.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'cons_pond', minX: 34, maxX: 66, minY: 52, maxY: 70 },
      { id: 'cons_benches', minX: 14, maxX: 28, minY: 48, maxY: 62 },
      { id: 'cons_planters', minX: 72, maxX: 88, minY: 46, maxY: 64 }
    ],
    hotspots: [
      { id: 'hs_cons_garden', x: 22, y: 54, icon: '🌱', label: 'Petak Bunga & Pot Tanaman Kristal', action: 'tend_garden', prompt: '✦ [E] Menanam Bibit Langka & Merawat Flora Ajaib' },
      { id: 'hs_cons_pond', x: 50, y: 62, icon: '🪷', label: 'Kolam Refleksi Jernih & Air Mancur Anggun', action: 'relax_pond', prompt: '✦ [E] Mengamati Air Terjun Mini & Teratai Mekar' },
      { id: 'hs_cons_harvest', x: 78, y: 52, icon: '🍇', label: 'Pohon Kecil dengan Daun Bercahaya', action: 'harvest_bloom', prompt: '✦ [E] Memanen Beri Surya & Daun Perak Segar' },
      { id: 'hs_cons_butterflies', x: 50, y: 38, icon: '🦋', label: 'Kupu-Kupu Bercahaya & Partikel Sihir', action: 'watch_butterflies', prompt: '✦ [E] Mengamati Kupu-Kupu Ungu Menari Riang' },
      { id: 'hs_cons_special_flower', x: 84, y: 64, icon: '🌸', label: 'Sudut Bunga Spesial Moonpetal Abadi', action: 'collect_moonpetal', prompt: '✦ [E] Memetik Bunga Moonpetal Bercahaya' },
      { id: 'hs_cons_door_liv', x: 50, y: 78, icon: '🏛️', label: 'Kembali ke Enchanted Living Room', action: 'goto_living', prompt: '✦ [E] Kembali ke Ruang Keluarga' }
    ]
  },
  {
    id: 'atelier',
    name: 'The Eternal Memory Atelier',
    subtitle: 'Ruang Menulis & Arsip Kenangan, Koleksi Artefak Bangsawan Elf & Royal Amethyst Relic',
    icon: '📜',
    bgImage: '/assets/moonpetal_manor_atelier.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'atl_desk', minX: 20, maxX: 48, minY: 48, maxY: 66 },
      { id: 'atl_bookshelf', minX: 68, maxX: 86, minY: 40, maxY: 64 },
      { id: 'atl_relic_case', minX: 52, maxX: 64, minY: 42, maxY: 54 }
    ],
    hotspots: [
      { id: 'hs_atl_letters', x: 30, y: 54, icon: '💌', label: 'Kotak Surat Kenangan Sahabat Lintas Semesta', action: 'read_letters', prompt: '✦ [E] Buka Surat-Surat Hangat dari Para Sahabat' },
      { id: 'hs_atl_desk', x: 42, y: 56, icon: '✍️', label: 'Meja Menulis Elegan & Buku Harian Jurnal', action: 'write_scrapbook', prompt: '✦ [E] Menulis Jurnal & Menghias Scrapbook Kenangan' },
      { id: 'hs_atl_photos', x: 76, y: 50, icon: '🖼️', label: 'Album Foto Kenangan & Pigura Hutan Elf', action: 'view_photos', prompt: '✦ [E] Melihat Album Foto Petualangan di Sanctuary' },
      { id: 'hs_atl_artifacts', x: 58, y: 46, icon: '🏺', label: 'Pajangan Kristal & Artefak Kerajaan Elf', action: 'view_artifacts', prompt: '✦ [E] Memeriksa Koleksi Artefak Kuno & Bunga Awetan' },
      { id: 'hs_atl_relic', x: 88, y: 58, icon: '🔮', label: 'Sudut Tersembunyi: Royal Amethyst Relic', action: 'discover_relic', prompt: '✦ [E] Telusuri Sudut Rahasia: Royal Amethyst Relic ✨' },
      { id: 'hs_atl_door_liv', x: 50, y: 78, icon: '🏛️', label: 'Kembali ke Enchanted Living Room', action: 'goto_living', prompt: '✦ [E] Kembali ke Ruang Keluarga' }
    ]
  }
];

// -----------------------------------------------------------------------------
// 2. ELVEN RECIPES CATALOG (5 SPECIAL RECIPES)
// -----------------------------------------------------------------------------
export const MOONPETAL_MANOR_RECIPES = [
  {
    id: 'moonpetal_dew_tea',
    name: 'Teh Embun Moonpetal',
    category: 'Minuman Elven',
    icon: '🫖',
    desc: 'Seduhan teh bunga lavender dan kelopak moonpetal yang dipetik saat fajar berselimut kabut.',
    ingredients: ['Kelopak Moonpetal Segar', 'Bunga Lavender Liar', 'Air Mata Air Suci', 'Madu Hutan Elf'],
    prepTime: '4 menit',
    buff: 'Memberikan ketenangan batin & regenerasi energi lembut (+25 Sanctuary Peace)'
  },
  {
    id: 'amethyst_berry_tart',
    name: 'Tart Beri Hutan Amethyst',
    category: 'Pastry & Dessert',
    icon: '🥧',
    desc: 'Kue tart renyah dengan isian selai blackberry hutan magis dan taburan gula kristal ungu.',
    ingredients: ['Tepung Gandum Sutra', 'Blackberry Liar Amethyst', 'Mentega Manis', 'Gula Kristal Violet'],
    prepTime: '12 menit',
    buff: 'Menghangatkan tubuh & mencerahkan suasana hati (+30 Joy of Forest)'
  },
  {
    id: 'starlight_ambrosia',
    name: 'Elixir Ambrosia Cahaya Bintang',
    category: 'Minuman Spesial',
    icon: '✨',
    desc: 'Sari buah belimbing bintang bercahaya dipadukan dengan nektar bunga elderflower yang memancarkan pendaran halus.',
    ingredients: ['Sari Belimbing Bintang', 'Nektar Elderflower', 'Kristal Es Abadi', 'Pewarna Bunga Telang'],
    prepTime: '6 menit',
    buff: 'Meningkatkan fokus pengamatan bintang & aura keanggunan (+35 Elven Radiance)'
  },
  {
    id: 'silverleaf_brioche',
    name: 'Roti Brioche Daun Perak',
    category: 'Roti Hangat',
    icon: '🍞',
    desc: 'Roti lembut beraroma vanilla madu dengan glasir gula halus bercahaya perak.',
    ingredients: ['Tepung Gandum Pilihan', 'Ragi Alami Hutan', 'Madu Bunga Akasia', 'Glasir Daun Perak'],
    prepTime: '15 menit',
    buff: 'Mengenyangkan dengan penuh kehangatan rumah (+40 Home Comfort)'
  },
  {
    id: 'twilight_nectar_parfait',
    name: 'Parfait Nektar Senja',
    category: 'Dessert Mewah',
    icon: '🍨',
    desc: 'Lapisan agar-agar jeli amethyst, krim buah kelapa lembut, dan remah almond panggang beraroma kayu manis.',
    ingredients: ['Jeli Amethyst', 'Krim Kelapa Manis', 'Kacang Almond Panggang', 'Kayu Manis Halus'],
    prepTime: '8 menit',
    buff: 'Memberikan inspirasi puisi & kreativitas menulis jurnal (+45 Muse Inspiration)'
  }
];

// -----------------------------------------------------------------------------
// 3. CONSERVATORY FLORA CATALOG (4 MAGICAL PLANTS)
// -----------------------------------------------------------------------------
export const MOONPETAL_MANOR_FLORA = [
  {
    id: 'flora_moonpetal_orchid',
    name: 'Anggrek Moonpetal',
    icon: '🌸',
    color: '#c084fc',
    stage: 'Mekar Penuh',
    progress: 100,
    desc: 'Anggrek langka yang kelopaknya memancarkan cahaya lavender lembut di bawah sinar rembulan malam.',
    yield: '3 Kelopak Moonpetal Segar'
  },
  {
    id: 'flora_starlight_lotus',
    name: 'Teratai Cahaya Bintang',
    icon: '🪷',
    color: '#7dd3fc',
    stage: 'Sedang Berbunga',
    progress: 75,
    desc: 'Teratai suci yang tumbuh di atas air kolam kristal, memurnikan suasana sekitar dengan aroma sejuk.',
    yield: '2 Kuntum Teratai Kristal'
  },
  {
    id: 'flora_amethyst_fern',
    name: 'Pakis Amethyst Purba',
    icon: '🌿',
    color: '#a855f7',
    stage: 'Tumbuh Subur',
    progress: 90,
    desc: 'Tanaman paku purba bangsawan elf yang helai daunnya bergoyang lembut mengikuti getaran melodi piano.',
    yield: '4 Tangkai Daun Pakis Ungu'
  },
  {
    id: 'flora_glimmering_sunberry',
    name: 'Beri Surya Bercahaya',
    icon: '🍇',
    color: '#facc15',
    stage: 'Siap Panen',
    progress: 100,
    desc: 'Semak buah keemasan manis kesukaan peri hutan yang memancarkan pendaran hangat seperti matahari terbit.',
    yield: '5 Butir Buah Beri Surya'
  }
];

// -----------------------------------------------------------------------------
// 4. FRIENDSHIP LETTERS CATALOG (7 CROSS-UNIVERSE COMPANIONS)
// -----------------------------------------------------------------------------
export const MOONPETAL_MANOR_LETTERS = [
  {
    id: 'letter_nyanya',
    sender: 'Nyanya ⭐',
    universe: 'KIDULT',
    date: '17 November 2026',
    title: 'Lukisan Kucing Bertelinga Elf untuk Kak Royan!',
    badgeColor: '#fb7185',
    content: 'Kak Royan! Terima kasih sudah selalu mendengarkan ceritaku dengan sangat sabar. Aku melukis seekor kucing putih kecil dengan telinga elf dan pita bintang khusus untukmu! Semoga dipajang di dekat meja kerjamu ya! Jangan lupa istirahat dan makan yang manis-manis ⭐'
  },
  {
    id: 'letter_lala',
    sender: 'Lala ☀️',
    universe: 'TO YOU',
    date: '16 November 2026',
    title: 'Bibit Bunga Chamomile dari Bloom Cottage',
    badgeColor: '#f59e0b',
    content: 'Salam hangat, Royan! Bunga matahari dan lavender di Bloom Cottage sedang mekar indah. Aku mengirimkan sekantong bibit chamomile kering dan teh daun mint untuk konservatori Moonpetal Manor. Semoga harimu selalu dipenuhi sinar hangat yang menenteramkan ☀️'
  },
  {
    id: 'letter_lele',
    sender: 'Lele 🌙',
    universe: 'SHADOW',
    date: '15 November 2026',
    title: 'Cahaya Bulan yang Menghubungkan Dua Suaka',
    badgeColor: '#818cf8',
    content: 'Kepada Penjaga Lembut di Sanctuary — Dari balkon The Eclipse, aku memandang ke ufuk barat tempat rimbunnya hutanmu berada. Cahaya bulan malam ini begitu tenang. Tetaplah menjadi pelindung yang setia; keheninganmu menyimpan kekuatan yang tak tergoyahkan 🌙'
  },
  {
    id: 'letter_akhira',
    sender: 'Akhira ⚡',
    universe: 'YAWN',
    date: '14 November 2026',
    title: 'Mutiara Karang Bercahaya Dasar Lautan',
    badgeColor: '#38bdf8',
    content: 'Halo Royan! Aku baru saja menyelam di dekat palung The Azure Tide Palace dan menemukan mutiara karang biru yang bersinar dalam gelap. Aku rasa ini akan sangat cocok diletakkan di dasar kolam refleksimu! Semoga alunan ombak dan semilir angin hutanmu berpadu harmonis ⚡'
  },
  {
    id: 'letter_ela',
    sender: 'Ela 🌸',
    universe: 'US AGAIN',
    date: '13 November 2026',
    title: 'Doa Kedamaian Teratai untuk Moonpetal',
    badgeColor: '#ec4899',
    content: 'Royan yang baik, Setiap kali aku merawat kolam lotus di The Silent Lotus House, aku selalu mengingat kelembutan hatimu. Bersama surat ini, ada kelopak teratai yang kukeringkan dengan hati-hati. Semoga kedamaian abadi selalu melingkupi tempat perlindunganmu 🌸'
  },
  {
    id: 'letter_ruben',
    sender: 'Ruben 🐉',
    universe: 'ASH',
    date: '12 November 2026',
    title: 'Salam Hormat dari Kastil Penjaga Naga',
    badgeColor: '#a855f7',
    content: 'Royan, Api ashen di The Dragon’s Den menyala stabil malam ini. Para naga mengangguk menghormati keteguhanmu menjaga keharmonisan hutan elf. Jika kamu butuh kristal obsidian pelindung atau bantuan penjaga langit, kabari aku. Jaga dirimu baik-baik 🐉'
  },
  {
    id: 'letter_syma',
    sender: 'Syma ☁️',
    universe: 'PINWHEEL',
    date: '11 November 2026',
    title: 'Kincir Angin Mini Kristal Langit',
    badgeColor: '#0ea5e9',
    content: 'Kak Royan! Aku membuat kincir angin mini dari kristal awan yang bisa berputar sendiri saat tertiup angin sepoi-sepoi! Aku letakkan di dekat jendela atelier-mu. Suaranya seperti lonceng lembut yang menemani saat kamu membaca buku. Semangat selalu ya! ☁️'
  }
];

// -----------------------------------------------------------------------------
// 5. COLLECTIBLES & EXCLUSIVE ROYAL AMETHYST RELIC
// -----------------------------------------------------------------------------
export const MOONPETAL_MANOR_COLLECTIBLES = [
  {
    id: 'relic_royal_amethyst',
    name: 'Royal Amethyst Relic',
    icon: '🔮',
    color: '#9333ea',
    rarity: 'Eksklusif & Legendaris',
    location: 'The Eternal Memory Atelier (Sudut Tersembunyi)',
    desc: 'Mahkota kristal amethyst kuno peninggalan leluhur bangsawan elf. Mengalirkan energi sihir perlindungan yang menenangkan dan memancarkan pendaran ungu megah.'
  },
  {
    id: 'pendant_crystal_leaf',
    name: 'Liontin Daun Kristal',
    icon: '🍃',
    color: '#34d399',
    rarity: 'Langka',
    location: 'Mystic Conservatory',
    desc: 'Liontin berukir urat daun perak yang menyimpan tetesan embun abadi dari hutan pertama.'
  },
  {
    id: 'quill_starlight_feather',
    name: 'Pena Bulu Cahaya Bintang',
    icon: '🪶',
    color: '#facc15',
    rarity: 'Istimewa',
    location: 'Meja Menulis Atelier',
    desc: 'Pena bulu angsa perak yang tintanya bersinar emas di bawah kegelapan malam.'
  },
  {
    id: 'musicbox_elven_sandalwood',
    name: 'Kotak Musik Elf Kayu Cendana',
    icon: '🎶',
    color: '#f472b6',
    rarity: 'Istimewa',
    location: 'Moonpetal Royal Bedroom',
    desc: 'Kotak musik putar dengan ukiran peri kecil yang memainkan lagu pengantar tidur lembut.'
  }
];

// -----------------------------------------------------------------------------
// 6. DAILY TASKS CATALOG (6 REFRESHING CHORES)
// -----------------------------------------------------------------------------
export const MOONPETAL_MANOR_TASKS = [
  { id: 'task_piano', title: 'Mainkan Melodi di Grand Piano Amethyst', room: 'living', done: false, icon: '🎹' },
  { id: 'task_tea', title: 'Seduh Teh Bunga Moonpetal di Sudut Meja', room: 'living', done: false, icon: '🍵' },
  { id: 'task_sleep', title: 'Beristirahat di Ranjang Kanopi Moonpetal', room: 'bedroom', done: false, icon: '🛏️' },
  { id: 'task_cook', title: 'Masak Tart Beri Hutan Amethyst di Dapur', room: 'kitchen', done: false, icon: '🥧' },
  { id: 'task_garden', title: 'Siram & Rawat Anggrek di Konservatori', room: 'conservatory', done: false, icon: '🌱' },
  { id: 'task_letters', title: 'Baca Surat Sahabat & Temukan Royal Amethyst Relic', room: 'atelier', done: false, icon: '🔮' }
];

// -----------------------------------------------------------------------------
// 7. AMBIENCE & THEMATIC LIGHTING
// -----------------------------------------------------------------------------
export const MOONPETAL_MANOR_ATMOSPHERES = [
  { id: 'twilight_moon', name: 'Twilight Moonbeam 🌙', tint: 'rgba(124, 58, 237, 0.18)', desc: 'Cahaya rembulan ungu lembut dengan pendaran bintang keemasan' },
  { id: 'starlight_gale', name: 'Starlight Sanctuary ✨', tint: 'rgba(147, 51, 234, 0.22)', desc: 'Pendaran kristal amethyst dan pendaran kupu-kupu peri' },
  { id: 'emerald_mist', name: 'Emerald Forest Dew 🌿', tint: 'rgba(52, 211, 153, 0.14)', desc: 'Kabut fajar segar yang membawa aroma pinus dan bunga mekar' }
];

// -----------------------------------------------------------------------------
// 8. RESILIENT LOCAL STORAGE ENGINE
// -----------------------------------------------------------------------------
export function getDefaultMoonpetalHavenState() {
  return {
    character: MOONPETAL_MANOR_CHARACTER.name,
    currentRoom: 'living',
    atmosphere: 'twilight_moon',
    wardrobeOutfit: 'Royal Elven Robe (Lavender & Silver)',
    cookedRecipes: ['moonpetal_dew_tea'],
    wateredFlora: ['flora_moonpetal_orchid'],
    tasks: MOONPETAL_MANOR_TASKS.map(t => ({ ...t })),
    scrapbookNotes: [
      {
        id: 'note_welcome',
        date: '17 November 2026',
        title: 'Malam Pertama di Moonpetal Manor',
        text: 'Suara air terjun di kejauhan berpadu dengan hembusan angin malam yang menerpa tirai transparan. Tempat perlindungan ini terasa begitu damai dan penuh kehangatan.'
      }
    ],
    foundCollectibles: ['relic_royal_amethyst'],
    inventory: [
      { id: 'item_relic', name: 'Royal Amethyst Relic', count: 1, icon: '🔮' },
      { id: 'item_tea', name: 'Teh Embun Moonpetal', count: 2, icon: '🫖' },
      { id: 'item_seeds', name: 'Bibit Anggrek Moonpetal', count: 3, icon: '🌱' },
      { id: 'item_berry', name: 'Blackberry Liar Amethyst', count: 5, icon: '🍇' }
    ],
    lastUpdated: new Date().toISOString()
  };
}

export function loadMoonpetalHavenState() {
  try {
    const raw = localStorage.getItem(MOONPETAL_MANOR_STORAGE_KEY);
    if (!raw) return getDefaultMoonpetalHavenState();
    const parsed = JSON.parse(raw);
    const defaults = getDefaultMoonpetalHavenState();
    return {
      ...defaults,
      ...parsed,
      tasks: parsed.tasks && parsed.tasks.length ? parsed.tasks : defaults.tasks,
      scrapbookNotes: parsed.scrapbookNotes && parsed.scrapbookNotes.length ? parsed.scrapbookNotes : defaults.scrapbookNotes,
      inventory: parsed.inventory && parsed.inventory.length ? parsed.inventory : defaults.inventory,
      foundCollectibles: parsed.foundCollectibles || defaults.foundCollectibles
    };
  } catch (err) {
    console.warn('[Moonpetal Manor] Failed to read state, fallback to default:', err);
    return getDefaultMoonpetalHavenState();
  }
}

export function saveMoonpetalHavenState(state) {
  try {
    const toSave = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(MOONPETAL_MANOR_STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (err) {
    console.error('[Moonpetal Manor] Failed to persist state:', err);
    return false;
  }
}

export function resetMoonpetalHavenState() {
  try {
    localStorage.removeItem(MOONPETAL_MANOR_STORAGE_KEY);
    return getDefaultMoonpetalHavenState();
  } catch (err) {
    return getDefaultMoonpetalHavenState();
  }
}

// -----------------------------------------------------------------------------
// 9. WEB AUDIO API SYNTHESIZERS (ELVEN AMBIENCE & CHIMES)
// -----------------------------------------------------------------------------
let manorAudioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!manorAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      manorAudioCtx = new AudioContextClass();
    }
  }
  if (manorAudioCtx && manorAudioCtx.state === 'suspended') {
    manorAudioCtx.resume().catch(() => {});
  }
  return manorAudioCtx;
}

export function playElvenPianoNote(freq = 523.25) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.8);
  } catch (_) {}
}

export function playElvenHarpChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [440, 554.37, 659.25, 880]; // A Major elven arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 1.4);
    });
  } catch (_) {}
}

export function playCrystalSparkle() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const freqs = [659.25, 783.99, 987.77, 1318.51];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);

      gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 1.1);
    });
  } catch (_) {}
}

export function playTeapotSimmer() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(360, ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (_) {}
}
