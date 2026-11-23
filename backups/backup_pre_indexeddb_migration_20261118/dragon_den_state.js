/**
 * THE DRAGON'S DEN — RUBEN 🐉 (UNIVERSE ASH)
 * Ruben's Eternal Ashen Castle — Majestic Gothic Royal Dragon Castle
 * State Management, Room Architectures, Feast Recipes, Botanical Catalogs,
 * Friendship Letters, Hidden Relics, Web Audio Synthesis, and Resilient Storage.
 * =============================================================================
 */

export const DRAGON_DEN_STORAGE_KEY = 'dragon_den_house_state_ruben';

export const DRAGON_DEN_CHARACTER = {
  key: 'ruben',
  name: 'Ruben',
  symbol: '🐉',
  title: 'The Eternal Dragon Guardian',
  houseName: "THE DRAGON'S DEN",
  subtitle: 'The Eternal Ashen Castle',
  tagline: "Ruben's Castle Sanctuary — Where Ashen Embers, Dragon Lore & Moonlight Forge Eternal Peace.",
  palette: {
    primary: '#7c3aed',          // Royal Purple
    royalPurple: '#6d28d9',      // Deep Royal Purple
    deepViolet: '#581c87',       // Deep Violet
    midnightBlack: '#0f172a',    // Midnight Stone Black
    charcoalGrey: '#334155',     // Charcoal Grey
    moonlightSilver: '#e2e8f0',  // Moonlight Silver
    pearlWhite: '#f8fafc',       // Pearl White
    antiqueGold: '#fbbf24',      // Antique Gold Accent
    ashenEmber: '#f97316'        // Warm Ember Glow
  }
};

// -----------------------------------------------------------------------------
// 1. FIVE INTERCONNECTED ROOMS CONFIGURATION
// -----------------------------------------------------------------------------
export const DRAGON_DEN_ROOMS = [
  {
    id: 'hall',
    name: "The Dragon's Grand Hall",
    subtitle: 'Aula Megah Kastil Gotik, Perapian Api Ungu & Piano Kristal Hitam',
    icon: '🏰',
    bgImage: '/assets/dragon_den_hall.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'royal_sofa', minX: 18, maxX: 42, minY: 48, maxY: 66 },
      { id: 'dragon_piano', minX: 68, maxX: 88, minY: 40, maxY: 56 },
      { id: 'carved_table', minX: 42, maxX: 58, minY: 52, maxY: 64 }
    ],
    hotspots: [
      { id: 'hs_hall_sofa', x: 30, y: 55, icon: '🛋️', label: 'Sofa Royal Charcoal & Deep Purple', action: 'sit_sofa', prompt: '✦ [E] Duduk Bersantai di Sofa Beludru Kerajaan' },
      { id: 'hs_hall_piano', x: 78, y: 48, icon: '🎹', label: 'Grand Piano Hitam Ukiran Perak', action: 'play_piano', prompt: '✦ [E] Mainkan Melodi Sonata Malam Kastil' },
      { id: 'hs_hall_fireplace', x: 50, y: 42, icon: '🔥', label: 'Perapian Agung Ukiran Sayap Naga', action: 'warm_hearth', prompt: '✦ [E] Menghangatkan Diri di Dekat Api Ungu' },
      { id: 'hs_hall_window', x: 50, y: 32, icon: '🌕', label: 'Jendela Lengkung Gotik & Puncak Gunung', action: 'gaze_mountains', prompt: '✦ [E] Menatap Langit Malam & Siluet Naga Melayang' },
      { id: 'hs_hall_relics', x: 86, y: 64, icon: '🛡️', label: 'Pedestal Patung & Artefak Sayap Naga', action: 'dragon_statues', prompt: '✦ [E] Amati Koleksi Patung & Relik Pelindung Naga' },
      { id: 'hs_hall_door_bed', x: 12, y: 45, icon: '🛏️', label: 'Ke Moonlit Royal Bedroom', action: 'goto_bedroom', prompt: '✦ [E] Masuk ke Kamar Tidur Ruben' },
      { id: 'hs_hall_door_kitchen', x: 88, y: 45, icon: '🍳', label: 'Ke Ashen Kitchen', action: 'goto_kitchen', prompt: '✦ [E] Masuk ke Dapur Kastil' },
      { id: 'hs_hall_door_conservatory', x: 32, y: 78, icon: '🌿', label: "Ke The Dragon's Conservatory", action: 'goto_conservatory', prompt: '✦ [E] Masuk ke Rumah Kaca Naga' },
      { id: 'hs_hall_door_memory', x: 68, y: 78, icon: '📜', label: "Ke The Dragon's Memory Chamber", action: 'goto_memory', prompt: '✦ [E] Masuk ke Ruang Arsip Kenangan' }
    ]
  },
  {
    id: 'bedroom',
    name: 'Moonlit Royal Bedroom',
    subtitle: 'Bilik Tidur Raja Naga, Ranjang Kanopi Beludru & Balkon Bulan',
    icon: '🛏️',
    bgImage: '/assets/dragon_den_bedroom.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'canopy_bed', minX: 14, maxX: 40, minY: 38, maxY: 62 },
      { id: 'vanity_table', minX: 62, maxX: 86, minY: 38, maxY: 52 },
      { id: 'wardrobe', minX: 74, maxX: 90, minY: 56, maxY: 76 }
    ],
    hotspots: [
      { id: 'hs_bed_rest', x: 26, y: 48, icon: '🛏️', label: 'Tempat Tidur Kanopi Beludru Ungu', action: 'rest_bed', prompt: '✦ [E] Istirahat & Tidur Nyenyak di Ranjang Raja' },
      { id: 'hs_bed_journal', x: 74, y: 44, icon: '📓', label: 'Meja Tulis Kristal & Kronik Penjaga', action: 'write_journal', prompt: '✦ [E] Tulis Catatan Harian Penjaga Naga' },
      { id: 'hs_bed_wardrobe', x: 82, y: 64, icon: '🧥', label: 'Lemari Zirah Pelindung & Jubah Gotik', action: 'open_wardrobe', prompt: '✦ [E] Ganti Pakaian Zirah & Busana Kerajaan' },
      { id: 'hs_bed_balcony', x: 50, y: 38, icon: '🌌', label: 'Balkon Batu Mengitari Langit Malam', action: 'look_balcony', prompt: '✦ [E] Berdiri di Balkon Menikmati Angin Pegunungan' },
      { id: 'hs_bed_decor', x: 34, y: 72, icon: '💎', label: 'Pengaturan Ornamen Kristal & Tirai Gotik', action: 'bedroom_decor', prompt: '✦ [E] Kustomisasi Suasana Bilik Tidur' },
      { id: 'hs_bed_door_hall', x: 88, y: 76, icon: '🏰', label: "Kembali ke The Dragon's Grand Hall", action: 'goto_hall', prompt: '✦ [E] Ke Grand Hall' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Ashen Kitchen',
    subtitle: 'Dapur Batu Kastil Kuno, Kompor Besi Tempa & Jamuan Malam Musim Dingin',
    icon: '🍳',
    bgImage: '/assets/dragon_den_kitchen.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'stove_oven', minX: 14, maxX: 38, minY: 38, maxY: 52 },
      { id: 'gothic_fridge', minX: 42, maxX: 56, minY: 38, maxY: 50 },
      { id: 'dining_table', minX: 30, maxX: 70, minY: 56, maxY: 70 }
    ],
    hotspots: [
      { id: 'hs_kitchen_oven', x: 26, y: 44, icon: '🔥', label: 'Kompor Besi Tempa & Oven Batu Kuno', action: 'cook_oven', prompt: '✦ [E] Masak Hidangan Hangat & Panggang Makanan Kastil' },
      { id: 'hs_kitchen_fridge', x: 48, y: 44, icon: '❄️', label: 'Lemari Penyimpanan Bahan Segar Pegunungan', action: 'open_fridge', prompt: '✦ [E] Ambil Bahan Segar & Rempah Hangat' },
      { id: 'hs_kitchen_prep', x: 50, y: 62, icon: '🍲', label: 'Meja Racik Sup & Seduhan Rempah Pegunungan', action: 'prep_counter', prompt: '✦ [E] Rebus Minuman Cokelat Kayu Manis & Herba' },
      { id: 'hs_kitchen_dining', x: 74, y: 62, icon: '🍷', label: 'Meja Jamuan Kayu Ek & Piala Perak', action: 'dining_table', prompt: '✦ [E] Nikmati Santapan Malam di Meja Perjamuan' },
      { id: 'hs_kitchen_cookbook', x: 84, y: 44, icon: '📖', label: 'Buku Resep Musim Dingin & Santapan Benteng', action: 'cookbook', prompt: '✦ [E] Buka Arsip Resep Jamuan Kastil' },
      { id: 'hs_kitchen_door_hall', x: 12, y: 76, icon: '🏰', label: "Kembali ke The Dragon's Grand Hall", action: 'goto_hall', prompt: '✦ [E] Ke Grand Hall' }
    ]
  },
  {
    id: 'conservatory',
    name: "The Dragon's Conservatory",
    subtitle: 'Rumah Kaca Gotik Rangka Perak, Kolam Kristal & Flora Malam',
    icon: '🌿',
    bgImage: '/assets/dragon_den_conservatory.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'crystal_pond', minX: 34, maxX: 66, minY: 52, maxY: 74 },
      { id: 'silver_tree', minX: 12, maxX: 32, minY: 36, maxY: 56 },
      { id: 'stone_bench', minX: 68, maxX: 88, minY: 48, maxY: 64 }
    ],
    hotspots: [
      { id: 'hs_cons_pond', x: 50, y: 64, icon: '🪷', label: 'Kolam Kristal Berpendar & Teratai Ungu', action: 'crystal_pond', prompt: '✦ [E] Amati Air Kristal Memantulkan Cahaya Rembulan' },
      { id: 'hs_cons_garden1', x: 22, y: 46, icon: '🌱', label: 'Petak Kebun Mawar Malam & Moonflower (Slot 1 & 2)', action: 'plant_garden', prompt: '✦ [E] Rawat & Tanam Flora Langka Bernuansa Perak' },
      { id: 'hs_cons_garden2', x: 78, y: 42, icon: '🌺', label: 'Pot Batu Berukir Naga (Slot 3)', action: 'crystal_pot', prompt: '✦ [E] Tanam Bunga Ashen Ember Blossom di Pot Naga' },
      { id: 'hs_cons_water', x: 38, y: 46, icon: '💧', label: 'Penyiram Perak Air Gletser Pegunungan', action: 'water_plants', prompt: '✦ [E] Siram Tanaman dengan Air Gletser Murni' },
      { id: 'hs_cons_harvest', x: 62, y: 46, icon: '🧺', label: 'Keranjang Panen Kelopak & Benih Naga', action: 'harvest_flowers', prompt: '✦ [E] Panen Kelopak Bercahaya & Benih Kosmik' },
      { id: 'hs_cons_crystal', x: 50, y: 38, icon: '🔮', label: 'Pedestal Kristal Energi Amethyst Naga', action: 'energy_crystal', prompt: '✦ [E] Serap Resonansi Energi Pelindung Naga' },
      { id: 'hs_cons_bench', x: 78, y: 56, icon: '🪑', label: 'Bangku Batu Berukir Beludru Ungu', action: 'garden_bench', prompt: '✦ [E] Duduk Tenang Mengamati Pohon Perak & Bintang' },
      { id: 'hs_cons_door_hall', x: 88, y: 76, icon: '🏰', label: "Kembali ke The Dragon's Grand Hall", action: 'goto_hall', prompt: '✦ [E] Ke Grand Hall' }
    ]
  },
  {
    id: 'memory',
    name: "The Dragon's Memory Chamber",
    subtitle: 'Ruang Arsip Kastil, Relik Sisik Naga & Peta Kerajaan',
    icon: '📜',
    bgImage: '/assets/dragon_den_memory.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'writing_desk', minX: 18, maxX: 40, minY: 42, maxY: 58 },
      { id: 'bookshelf_chronicles', minX: 64, maxX: 86, minY: 40, maxY: 56 },
      { id: 'map_table', minX: 42, maxX: 60, minY: 56, maxY: 70 }
    ],
    hotspots: [
      { id: 'hs_mem_desk', x: 28, y: 50, icon: '✍️', label: 'Meja Tulis Antik & Lilin Perak Gotik', action: 'write_chronicle', prompt: '✦ [E] Tulis Catatan Sejarah & Sumpah Perlindungan' },
      { id: 'hs_mem_letters', x: 76, y: 48, icon: '💌', label: 'Kotak Surat Persahabatan Our Little Universe', action: 'read_letters', prompt: '✦ [E] Baca Surat Penuh Kehangatan dari Sahabat' },
      { id: 'hs_mem_map', x: 50, y: 62, icon: '🗺️', label: 'Peta Kuno Kerajaan Fantasi & Konstelasi Naga', action: 'view_map', prompt: '✦ [E] Pelajari Peta Sembilan Alam & Jalur Penerbangan Naga' },
      { id: 'hs_mem_album', x: 24, y: 68, icon: '🖼️', label: 'Album Kenangan & Foto Petualangan Bersama', action: 'view_album', prompt: '✦ [E] Buka Album Foto Kenangan Hangat' },
      { id: 'hs_mem_chest', x: 76, y: 68, icon: '🧰', label: 'Peti Pusaka Relik & Sisik Naga Kuno', action: 'open_chest', prompt: '✦ [E] Buka Peti Pusaka & Benda Bersejarah' },
      { id: 'hs_mem_dragon_altar', x: 50, y: 40, icon: '✨', label: 'Altar Perlindungan Naga & Api Abadi', action: 'dragon_altar', prompt: '✦ [E] Berdoa di Altar Hati Api Naga Abadi' },
      { id: 'hs_mem_door_hall', x: 88, y: 76, icon: '🏰', label: "Kembali ke The Dragon's Grand Hall", action: 'goto_hall', prompt: '✦ [E] Ke Grand Hall' }
    ]
  }
];

// -----------------------------------------------------------------------------
// 2. CASTLE FEAST & WINTER COMFORT RECIPES (ASHEN KITCHEN)
// -----------------------------------------------------------------------------
export const DRAGON_DEN_RECIPES = [
  {
    id: 'ashen_spiced_stew',
    name: 'Ashen Spiced Dragon Stew 🍲',
    icon: '🍲',
    desc: 'Sup kental hangat dengan daging panggang lembut, kentang gunung, dan rempah kayu manis khas kastil pegunungan.',
    ingredients: ['Daging Panggang Kastil', 'Kentang Salju', 'Rempah Ashen Panas'],
    timeSeconds: 4,
    rewardXp: 45
  },
  {
    id: 'midnight_berry_cake',
    name: 'Midnight Berry Mead Cake 🍰',
    icon: '🍰',
    desc: 'Kue bolu buah beri hitam liar dengan olesan madu malam rembulan yang manis dan legit.',
    ingredients: ['Buah Beri Hitam Liar', 'Madu Malam Rembulan', 'Tepung Gandum Kastil'],
    timeSeconds: 5,
    rewardXp: 50
  },
  {
    id: 'smoked_mountain_tea',
    name: 'Smoked Mountain Herbal Tea 🍵',
    icon: '🍵',
    desc: 'Seduhan herba daun teh pegunungan berkabut dengan aroma kayu asap yang menenangkan dan menghangatkan jiwa.',
    ingredients: ['Daun Teh Kabut Gunung', 'Madu Malam Rembulan', 'Air Gletser Murni'],
    timeSeconds: 3,
    rewardXp: 35
  },
  {
    id: 'royal_plum_tartlet',
    name: 'Royal Plum Silver Tartlet 🥧',
    icon: '🥧',
    desc: 'Kue pai mini berisikan buah prem ungu panggang dengan taburan kristal gula perak berkilau.',
    ingredients: ['Buah Prem Ungu', 'Gula Kristal Perak', 'Mentega Kastil'],
    timeSeconds: 4,
    rewardXp: 40
  },
  {
    id: 'cinnamon_embers_cocoa',
    name: 'Cinnamon Embers Cocoa ☕',
    icon: '☕',
    desc: 'Cokelat kental hangat dengan taburan kayu manis dan marshmallow bakar yang meleleh sempurna.',
    ingredients: ['Kakao Hitam Murni', 'Kayu Manis Kastil', 'Susu Segar Pegunungan'],
    timeSeconds: 3,
    rewardXp: 35
  }
];

// -----------------------------------------------------------------------------
// 3. DRAGON CONSERVATORY FLORA CATALOG
// -----------------------------------------------------------------------------
export const DRAGON_DEN_FLORA = [
  {
    id: 'silver_night_rose',
    name: 'Moonlit Silver Night Rose',
    icon: '🌹',
    bloomIcon: '🌹✨',
    color: '#e2e8f0',
    growthDurationSeconds: 16,
    yieldItem: 'Kelopak Mawar Perak',
    desc: 'Mawar gotik ungu tua dengan tepian kelopak keperakan yang hanya mekar sempurna di bawah cahaya bulan.'
  },
  {
    id: 'biolum_moonflower',
    name: 'Bioluminescent Moonflower',
    icon: '🪷',
    bloomIcon: '🪷🌙',
    color: '#c084fc',
    growthDurationSeconds: 20,
    yieldItem: 'Mahkota Moonflower Bercahaya',
    desc: 'Bunga malam anggun yang kelopaknya memancarkan pendaran cahaya violet lembut di dalam kegelapan.'
  },
  {
    id: 'ashen_ember_blossom',
    name: 'Ashen Ember Blossom 🐉',
    icon: '🌺',
    bloomIcon: '🌺🔥',
    color: '#f97316',
    growthDurationSeconds: 25,
    yieldItem: 'Esensi Api Abadi Naga',
    desc: 'Bunga pusaka pegunungan naga yang selalu hangat saat disentuh, melambangkan api persahabatan yang tak pernah padam.'
  },
  {
    id: 'celestial_frost_orchid',
    name: 'Celestial Frost Orchid ❄️',
    icon: '🌸',
    bloomIcon: '🌸❄️',
    color: '#38bdf8',
    growthDurationSeconds: 22,
    yieldItem: 'Kelopak Anggrek Kristal Es',
    desc: 'Anggrek kristal langka dari lereng tertinggi puncak bersalju ASH yang kelopaknya sebening kaca.'
  }
];

// -----------------------------------------------------------------------------
// 4. FRIENDSHIP LETTERS ARCHIVE (MEMORY CHAMBER)
// -----------------------------------------------------------------------------
export const DRAGON_DEN_LETTERS = [
  {
    id: 'letter_nyanya',
    sender: 'Nyanya ⭐',
    universe: 'KIDULT',
    icon: '⭐',
    date: 'Hari Bintang Jatuh',
    excerpt: 'Untuk Ruben sang Penjaga Naga... di kastilmu pasti dingin ya? Aku merajutkan syal hangat berbintang untukmu...',
    fullLetter: 'Halo Ruben! ⭐\n\nBagaimana kabarmu di The Dragon\'s Den? Aku membayangkan puncak pegununganmu pasti sangat dingin dan berangin kencang. Karena itu, saat membuat kerajinan di Kidult Dream House kemarin, aku merajutkan sebuah syal tebal berwarna charcoal dengan hiasan bintang kecil untukmu.\n\nJangan lupa minum cokelat panas di dekat perapian ya! Terima kasih selalu menjaga kita semua dari bentengmu yang megah!\n\nPeluk hangat penuh bintang,\nNyanya ⭐'
  },
  {
    id: 'letter_lala',
    sender: 'Lala ☀️',
    universe: 'TO YOU',
    icon: '☀️',
    date: 'Musim Buah Berry',
    excerpt: 'Matahari di Bloom Cottage selalu hangat, jangan ragu untuk terbang ke mari bila ingin menikmati kebun bunga...',
    fullLetter: 'Ruben sang Pelindung Tangguh, ☀️\n\nNaga perakmu kemarin terlihat terbang melintas di atas cakrawala TO YOU, gagah sekali! Aku mengirimkan satu keranjang buah strawberry manis dan madu lavender dari kebunku untuk camilanmu di kastil.\n\nKalau kamu sedang libur dari tugas menjaga semesta, mampir ke Bloom Cottage ya! Kita bisa minum teh di beranda sambil bercerita.\n\nSalam hangat,\nLala ☀️'
  },
  {
    id: 'letter_lele',
    sender: 'Lele 🌙',
    universe: 'SHADOW / THE ECLIPSE',
    icon: '🌙',
    date: 'Purnama Abadi',
    excerpt: 'Dari menara The Eclipse, cahaya menara kastilmu bersinar selaras dengan bintang-bintang astronomi...',
    fullLetter: 'Untuk Ruben, Penjaga Benteng Abadi, 🌙\n\nArsitektur The Dragon\'s Den benar-benar mahakarya gothic yang luar biasa. Di arsip cosmology The Eclipse, naga penjagamu tercatat sebagai pilar pelindung yang menyeimbangkan malam dan bara api di semesta kita.\n\nKapan-kapan, mari kita diskusikan peta bintang kuno di Memory Chamber. Sumpah perlindunganmu adalah kebanggaan Our Little Universe.\n\nSahabat malammu,\nLele 🌙'
  },
  {
    id: 'letter_akhira',
    sender: 'Akhira ⚡',
    universe: 'YAWN',
    icon: '⚡',
    date: 'Pasang Gelombang Samudra',
    excerpt: 'Petir di samudra dan api di benteng pegunungan adalah kekuatan kembar yang saling menguatkan...',
    fullLetter: 'Yo Ruben! ⚡\n\nDari kedalaman Azure Tide Palace, aku sering melihat pantulan puncak pegununganmu saat badai petir melintas. Percikan listrik di samudra dan bara api naga di kastilmu membuktikan bahwa kita berdua selalu siap menjaga kedamaian para sahabat.\n\nAku kirimkan kristal garam laut purba untuk bumbu sup dagingmu. Rasanya pasti makin mantap!\n\nTetap tangguh,\nAkhira ⚡'
  },
  {
    id: 'letter_ela',
    sender: 'Ela 🌸',
    universe: 'US AGAIN',
    icon: '🌸',
    date: 'Mekarnya Teratai Ungu',
    excerpt: 'Terima kasih atas sumpah pelindungmu... aroma teh teratai dari santuariku selalu menyertaimu...',
    fullLetter: 'Ruben yang baik dan bijaksana, 🌸\n\nDi The Silent Lotus House, aku selalu merasa tenang karena mengetahui ada penjaga setia seperti dirimu di universe ASH. Aku mengirimkan toples berisi kuncup teratai putih kering dan daun teh lavender pilihan.\n\nSeduhlah saat malam terasa hening di perpustakaanmu. Semoga keheningan dan kehangatan selalu menyertai setiap langkahmu.\n\nDengan rasa syukur tulus,\nEla 🌸'
  },
  {
    id: 'letter_syma',
    sender: 'Syma ☁️',
    universe: 'PINWHEEL',
    icon: '☁️',
    date: 'Hari Angin Utara',
    excerpt: 'Kamera lensaku berhasil mengabadikan siluet naga perakmu melintasi awan senja... foto ini kupersembahkan untukmu!',
    fullLetter: 'Ruben! ☁️\n\nLihat foto terlampir ini! Saat aku sedang naik balon udara di Windwhisper Residence, naga perakmu meluncur anggun di sela-sela awan ungu keemasan. Hasil fotonya luar biasa megah seperti lukisan fantasi kerajaan!\n\nFoto ini sudah kucetak dan kubingkai perak. Pajang di Memory Chamber-mu ya!\n\nSahabat langitmu,\nSyma ☁️'
  },
  {
    id: 'letter_royan',
    sender: 'Royan 🎆',
    universe: 'HOT',
    icon: '🎆',
    date: 'Malam Festival Roket',
    excerpt: 'Woy Ruben! Naga perakmu kemarin hampir kesambar kembang api roket baruku hahaha! Kapan kita balapan terbang?!',
    fullLetter: 'Woyy Ruben sang Dragon Master! 🎆\n\nKemarin malam roket kembang api edisi festival naga punyaku meluncur kencang banget di langit perbatasan universe HOT dan ASH! Nagamu sampai menoleh penasaran haha!\n\nNanti kalau festival kembang api berikutnya tiba, kita adu balap ya: naga terbangmu lawan roket supersonik buatanku! Pasti seru abis bro!\n\nSalam membara,\nRoyan 🎆'
  }
];

// -----------------------------------------------------------------------------
// 5. HIDDEN RELICS & COLLECTIBLES (MEMORY CHAMBER)
// -----------------------------------------------------------------------------
export const DRAGON_DEN_COLLECTIBLES = [
  {
    id: 'ancient_dragon_scale',
    name: 'Ancient Silver Dragon Scale 🐉',
    icon: '🛡️',
    room: 'hall',
    desc: 'Sisik naga perak purba dengan ukiran rune pelindung, sangat keras dan berkilau di bawah cahaya perapian.'
  },
  {
    id: 'amethyst_dragon_eye',
    name: 'Amethyst Dragon Eye Geode 🔮',
    icon: '💎',
    room: 'bedroom',
    desc: 'Batu permata geode ungu langka yang bentuk kristal dalamnya menyerupai tatapan mata naga pelindung.'
  },
  {
    id: 'royal_crest_signet',
    name: 'Engraved Royal Crest Signet Ring 💍',
    icon: '👑',
    room: 'kitchen',
    desc: 'Cincin stempel emas antik warisan dinasti pelindung bertakhta lambang naga bersayap kembar.'
  },
  {
    id: 'map_forgotten_realms',
    name: 'Map of the Nine Cosmic Realms 🗺️',
    icon: '📜',
    room: 'memory',
    desc: 'Peta kuno kulit domba yang menggambarkan seluruh universe di Our Little Universe dan jalur rahasia antar-alam.'
  }
];

// -----------------------------------------------------------------------------
// 6. DAILY OBJECTIVES & PROGRESSION
// -----------------------------------------------------------------------------
export const DRAGON_DEN_TASKS = [
  { id: 'task_piano', label: 'Mainkan sonata malam di piano hitam kristal', done: false, xp: 20 },
  { id: 'task_hearth', label: 'Hangatkan diri di perapian agung api ungu', done: false, xp: 20 },
  { id: 'task_cook', label: 'Masak Ashen Spiced Stew lezat di dapur batu', done: false, xp: 25 },
  { id: 'task_garden', label: "Rawat & siram tanaman di The Dragon's Conservatory", done: false, xp: 30 },
  { id: 'task_letters', label: 'Baca surat penuh kehangatan dari para sahabat OLU', done: false, xp: 20 },
  { id: 'task_altar', label: 'Berdoa di altar perlindungan hati api naga abadi', done: false, xp: 25 }
];

// -----------------------------------------------------------------------------
// 7. LIGHTING ATMOSPHERES
// -----------------------------------------------------------------------------
export const DRAGON_DEN_ATMOSPHERES = [
  {
    id: 'ashen_twilight',
    name: 'Ashen Twilight (Senja Violet Lembayung)',
    icon: '🌆',
    desc: 'Sore temaram di puncak benteng, langit berwarna ungu tua dan oranye hangat dengan pantulan bara perapian.',
    ambientOverlay: 'radial-gradient(ellipse at 50% 25%, rgba(124, 58, 237, 0.18) 0%, rgba(249, 115, 22, 0.12) 55%, rgba(15, 23, 42, 0.35) 100%)'
  },
  {
    id: 'moonlit_frost',
    name: 'Moonlit Frost (Malam Dingin Rembulan Perak)',
    icon: '🌙',
    desc: 'Malam tenang berselimut kabut pegunungan, cahaya bulan perak menembus jendela kaca lengkung gotik.',
    ambientOverlay: 'radial-gradient(ellipse at 50% 30%, rgba(226, 232, 240, 0.15) 0%, rgba(109, 40, 217, 0.14) 60%, rgba(15, 23, 42, 0.5) 100%)'
  },
  {
    id: 'midnight_dragon_fire',
    name: 'Midnight Dragon Fire (Keheningan Hati Api Naga)',
    icon: '🔥',
    desc: 'Tengah malam mistis, perapian api ungu menyala anggun memberi rasa aman dan perlindungan mutlak di dalam kastil.',
    ambientOverlay: 'radial-gradient(ellipse at 50% 40%, rgba(147, 51, 234, 0.22) 0%, rgba(88, 28, 135, 0.18) 60%, rgba(2, 6, 23, 0.65) 100%)'
  }
];

// -----------------------------------------------------------------------------
// 8. INITIAL DEFAULT PALACE STATE
// -----------------------------------------------------------------------------
export function createDefaultDragonDenState() {
  return {
    character: 'ruben',
    currentRoom: 'hall',
    atmosphere: 'ashen_twilight',
    playerX: 50,
    playerY: 72,
    inventory: [
      { id: 'castle_roast', name: 'Daging Panggang Kastil', icon: '🥩', count: 5 },
      { id: 'snow_potato', name: 'Kentang Salju', icon: '🥔', count: 6 },
      { id: 'ashen_spice', name: 'Rempah Ashen Panas', icon: '🌶️', count: 4 },
      { id: 'wild_berries', name: 'Buah Beri Hitam Liar', icon: '🫐', count: 5 },
      { id: 'moon_honey', name: 'Madu Malam Rembulan', icon: '🍯', count: 4 },
      { id: 'glacier_water', name: 'Air Gletser Murni', icon: '💧', count: 6 }
    ],
    cookedDishes: ['ashen_spiced_stew'],
    gardenSlots: [
      { slotId: 1, seedId: 'silver_night_rose', plantName: 'Moonlit Silver Night Rose', stage: 'blooming', plantedAt: Date.now() - 30000, watered: true },
      { slotId: 2, seedId: 'biolum_moonflower', plantName: 'Bioluminescent Moonflower', stage: 'growing', plantedAt: Date.now() - 10000, watered: true },
      { slotId: 3, seedId: 'ashen_ember_blossom', plantName: 'Ashen Ember Blossom 🐉', stage: 'seed', plantedAt: Date.now(), watered: false }
    ],
    collectibles: [
      { id: 'ancient_dragon_scale', found: true, foundAt: 'Pedestal The Dragon Grand Hall' },
      { id: 'amethyst_dragon_eye', found: true, foundAt: 'Meja Samping Bilik Tidur' },
      { id: 'royal_crest_signet', found: false },
      { id: 'map_forgotten_realms', found: false }
    ],
    journalEntries: [
      {
        id: 'j1',
        title: "Kastil Sang Penjaga — The Dragon's Den",
        date: 'Awal Era Naga Abadi',
        content: 'Benteng kastil gotik ini akhirnya berdiri kokoh di puncak pegunungan berkabut ASH. Nyala api ungu di perapian memberikan kehangatan mutlak di tengah dinginnya salju. Selama naga pelindung masih membentangkan sayapnya, semesta dan sahabat-sahabatku akan selalu aman.'
      }
    ],
    tasks: DRAGON_DEN_TASKS.map(t => ({ ...t })),
    decorOptions: {
      bedroomCanopyColor: 'deep_purple', // 'deep_purple' | 'midnight_black' | 'silver_crest' | 'ashen_gold'
      hallChandelier: 'gothic_crystal',   // 'gothic_crystal' | 'dragon_iron' | 'violet_torch'
      hearthFlameColor: 'violet'         // 'violet' | 'amber' | 'celestial_blue'
    },
    stats: {
      dishesCooked: 1,
      flowersHarvested: 2,
      notesPlayed: 0,
      mountainsGazedCount: 0,
      altarPrayersDone: 0
    },
    updatedAt: Date.now()
  };
}

// -----------------------------------------------------------------------------
// 9. STORAGE PERSISTENCE (LOAD / SAVE / RESET)
// -----------------------------------------------------------------------------
export function loadDragonDenState(characterKey = 'ruben') {
  try {
    const raw = localStorage.getItem(DRAGON_DEN_STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultDragonDenState();
      saveDragonDenState(characterKey, initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultDragonDenState(),
      ...parsed,
      character: characterKey || 'ruben'
    };
  } catch (err) {
    console.warn('[DragonDenState] Failed to load from localStorage, returning defaults:', err);
    return createDefaultDragonDenState();
  }
}

export function saveDragonDenState(characterKey = 'ruben', stateObj = null) {
  if (!stateObj) return;
  try {
    const payload = {
      ...stateObj,
      character: characterKey || 'ruben',
      updatedAt: Date.now()
    };
    localStorage.setItem(DRAGON_DEN_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[DragonDenState] Failed to persist to localStorage:', err);
  }
}

export function resetDragonDenState(characterKey = 'ruben') {
  const fresh = createDefaultDragonDenState();
  saveDragonDenState(characterKey, fresh);
  return fresh;
}

// -----------------------------------------------------------------------------
// 10. WEB AUDIO API SYNTHESIZERS (ZERO DEPENDENCY REAL-TIME AUDIO)
// -----------------------------------------------------------------------------
let dragonAudioCtx = null;

function getAudioContext() {
  if (!dragonAudioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) dragonAudioCtx = new AudioContext();
  }
  if (dragonAudioCtx && dragonAudioCtx.state === 'suspended') {
    dragonAudioCtx.resume().catch(() => {});
  }
  return dragonAudioCtx;
}

/**
 * Play Grand Piano note with majestic gothic hall acoustic resonance
 */
export function playDragonPianoNote(frequency = 440) {
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
  filter.frequency.setValueAtTime(2200, now);
  filter.frequency.exponentialRampToValueAtTime(380, now + 1.6);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

  osc.connect(filter);
  oscSub.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  oscSub.start(now);
  osc.stop(now + 1.9);
  oscSub.stop(now + 1.9);
}

/**
 * Play warm crackling sound of violet hearth fire
 */
export function playVioletHearthCrackling() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.7;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Generate crackle bursts
    data[i] = Math.random() > 0.88 ? (Math.random() * 2 - 1) * 0.25 : (Math.random() * 2 - 1) * 0.04;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(1.5, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.14, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.75);
}

/**
 * Play majestic silver castle chime (Gothic cathedral chime)
 */
export function playCastleChimeZen() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [440.00, 523.25, 659.25, 880.00]; // A4, C5, E5, A5 (Minor Majesty)
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.09);

    gain.gain.setValueAtTime(0.001, now + idx * 0.09);
    gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.09 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 1.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.09);
    osc.stop(now + idx * 0.09 + 1.5);
  });
}

/**
 * Play kettle simmer / stew sizzle sound
 */
export function playKettleSimmerSizzle() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.8;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.14;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.Q.setValueAtTime(2.5, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.14, now + 0.07);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.85);
}
