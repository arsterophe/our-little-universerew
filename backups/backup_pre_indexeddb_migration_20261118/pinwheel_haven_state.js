/**
 * THE PINWHEEL HAVEN — SYMA ☁️ (UNIVERSE PINWHEEL)
 * Syma's Floating Sky Residence — A Whimsical Floating Cloud Residence
 * State Management, Room Architectures, Sky Recipes, Conservatory Flora,
 * Friendship Letters, Mini Pinwheel Collectibles, Web Audio Synthesis, and Resilient Storage.
 * =============================================================================
 */

export const PINWHEEL_HAVEN_STORAGE_KEY = 'pinwheel_haven_house_state_syma';
export const SYMA_CANONICAL_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';

export const PINWHEEL_HAVEN_CHARACTER = {
  key: 'syma',
  altKey: 'abil',
  name: 'Syma',
  symbol: '☁️',
  title: 'The Sky Breeze & Pinwheel Maiden',
  houseName: "THE PINWHEEL HAVEN",
  subtitle: "Syma's Floating Sky Residence",
  tagline: "A Whimsical Floating Cloud Residence — Where breezes whisper, pinwheels dance, and warm sky memories drift peacefully.",
  palette: {
    primary: '#38bdf8',          // Sky Blue
    powderBlue: '#7dd3fc',       // Powder Blue
    softSkyBlue: '#bae6fd',      // Soft Sky Blue
    cloudWhite: '#f8fafc',       // Cloud White
    paleLavender: '#e9d5ff',     // Pale Lavender
    pearlSilver: '#e2e8f0',      // Pearl Silver
    butterYellow: '#fef08a',     // Pastel Butter Yellow
    champagneGold: '#fde047'     // Subtle Champagne Gold
  }
};

// -----------------------------------------------------------------------------
// 1. FIVE INTERCONNECTED ROOMS CONFIGURATION
// -----------------------------------------------------------------------------
export const PINWHEEL_HAVEN_ROOMS = [
  {
    id: 'living',
    name: 'Cloud Nine Living Room',
    subtitle: 'Ruang Keluarga Awan Putih, Piano Kristal Bintang & Panorama Kincir Angin',
    icon: '☁️',
    bgImage: '/assets/pinwheel_haven_living.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'cloud_sofa', minX: 16, maxX: 44, minY: 52, maxY: 68 },
      { id: 'star_piano', minX: 66, maxX: 86, minY: 42, maxY: 58 },
      { id: 'cloud_coffee_table', minX: 42, maxX: 58, minY: 54, maxY: 66 }
    ],
    hotspots: [
      { id: 'hs_liv_sofa', x: 30, y: 58, icon: '🛋️', label: 'Sofa Empuk Cloud White & Powder Blue', action: 'sit_sofa', prompt: '✦ [E] Duduk Bersantai di Sofa Awan Lembut' },
      { id: 'hs_liv_piano', x: 76, y: 50, icon: '🎹', label: 'Piano Putih dengan Detail Bintang', action: 'play_piano', prompt: '✦ [E] Mainkan Melodi Nada Angin di Piano Bintang' },
      { id: 'hs_liv_table', x: 50, y: 58, icon: '☕', label: 'Meja Kopi Awan & Teh Bunga Langit', action: 'sip_tea', prompt: '✦ [E] Nikmati Secangkir Teh Hangat Aroma Melati' },
      { id: 'hs_liv_bookshelf', x: 12, y: 46, icon: '📚', label: 'Rak Buku Putih & Dekorasi Kincir Angin', action: 'read_book', prompt: '✦ [E] Membaca Dongeng Negeri Awan & Koleksi Buku' },
      { id: 'hs_liv_window', x: 26, y: 36, icon: '🪟', label: 'Jendela Panorama Pulau Awan Melayang', action: 'gaze_clouds', prompt: '✦ [E] Menatap Langit Biru & Awan Putih yang Berarak' },
      { id: 'hs_liv_balcony', x: 88, y: 38, icon: '🎐', label: 'Balkon Beranda Menghadap Langit Luas', action: 'enjoy_breeze', prompt: '✦ [E] Melangkah ke Beranda Menikmati Hembusan Angin' },
      { id: 'hs_liv_door_bed', x: 8, y: 52, icon: '🛏️', label: 'Ke Dream Above Bedroom', action: 'goto_bedroom', prompt: '✦ [E] Masuk ke Kamar Tidur Syma' },
      { id: 'hs_liv_door_kitchen', x: 92, y: 52, icon: '🍳', label: 'Ke Sky Kitchen', action: 'goto_kitchen', prompt: '✦ [E] Masuk ke Dapur Langit' },
      { id: 'hs_liv_door_cons', x: 32, y: 78, icon: '🌿', label: 'Ke Floating Sky Conservatory', action: 'goto_conservatory', prompt: '✦ [E] Masuk ke Rumah Kaca Melayang' },
      { id: 'hs_liv_door_attic', x: 68, y: 78, icon: '📜', label: 'Ke The Memory Attic', action: 'goto_attic', prompt: '✦ [E] Masuk ke Loteng Surat di Atas Awan' }
    ]
  },
  {
    id: 'bedroom',
    name: 'Dream Above Bedroom',
    subtitle: 'Bilik Tidur di Atas Awan, Ranjang Kanopi Transparan & Balkon Bulan',
    icon: '🛏️',
    bgImage: '/assets/pinwheel_haven_bedroom.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'canopy_bed', minX: 28, maxX: 56, minY: 40, maxY: 64 },
      { id: 'wardrobe_white', minX: 12, maxX: 26, minY: 38, maxY: 58 },
      { id: 'vanity_star', minX: 60, maxX: 74, minY: 42, maxY: 56 }
    ],
    hotspots: [
      { id: 'hs_bed_sleep', x: 42, y: 50, icon: '🛏️', label: 'Ranjang Besar Kanopi Transparan Awan', action: 'sleep_bed', prompt: '✦ [E] Istirahat & Tidur Pulas di Atas Awan' },
      { id: 'hs_bed_wardrobe', x: 18, y: 46, icon: '👗', label: 'Lemari Pakaian Sutra & Jubah Pinwheel', action: 'open_wardrobe', prompt: '✦ [E] Ganti Pakaian & Aksesori Jubah Cantik' },
      { id: 'hs_bed_vanity', x: 66, y: 48, icon: '🪞', label: 'Meja Rias Cermin Bintang & Peri Lampu', action: 'vanity_mirror', prompt: '✦ [E] Merapikan Diri & Menyisir Rambut di Cermin' },
      { id: 'hs_bed_desk', x: 28, y: 64, icon: '📖', label: 'Meja Samping Lampu Awan & Buku Harian', action: 'bedside_journal', prompt: '✦ [E] Tulis Catatan Malam di Meja Samping' },
      { id: 'hs_bed_balcony', x: 86, y: 50, icon: '🌸', label: 'Pintu Balkon Pribadi & Tanaman Gantung', action: 'balcony_view', prompt: '✦ [E] Melangkah ke Balkon Menatap Samudra Awan' },
      { id: 'hs_bed_door_liv', x: 10, y: 72, icon: '☁️', label: 'Kembali ke Cloud Nine Living Room', action: 'goto_living', prompt: '✦ [E] Kembali ke Ruang Keluarga' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Sky Kitchen',
    subtitle: 'Dapur Sky Cottage Hangat, Aroma Kue Panggang & Meja Jamuan Berangin',
    icon: '🍳',
    bgImage: '/assets/pinwheel_haven_kitchen.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'kit_prep_counter', minX: 16, maxX: 46, minY: 52, maxY: 68 },
      { id: 'kit_dining_table', minX: 68, maxX: 88, minY: 54, maxY: 72 },
      { id: 'kit_stove_unit', minX: 42, maxX: 56, minY: 40, maxY: 52 }
    ],
    hotspots: [
      { id: 'hs_kit_stove', x: 48, y: 44, icon: '🍳', label: 'Kompor Porselen & Teko Tembaga Mendidih', action: 'cook_stove', prompt: '✦ [E] Masak Resep Khas Langit & Seduh Minuman Hangat' },
      { id: 'hs_kit_fridge', x: 88, y: 42, icon: '🧊', label: 'Kulkas Biru Langit Retro & Magnet Kincir', action: 'open_fridge', prompt: '✦ [E] Buka Kulkas & Ambil Bahan Makanan Segar' },
      { id: 'hs_kit_prep', x: 30, y: 60, icon: '🥣', label: 'Meja Persiapan Kue Souffle & Buah Segar', action: 'prep_food', prompt: '✦ [E] Siapkan Adonan Kue Lembut & Buah Beri Langit' },
      { id: 'hs_kit_dining', x: 78, y: 62, icon: '🪑', label: 'Meja Makan Kayu Dekat Jendela Berangin', action: 'dine_table', prompt: '✦ [E] Duduk Menikmati Sajian Lezat di Dekat Jendela' },
      { id: 'hs_kit_spices', x: 18, y: 44, icon: '🍯', label: 'Lemari Madu Lavender & Teh Pinwheel', action: 'inspect_pantry', prompt: '✦ [E] Periksa Toples Rempah & Pilihan Teh Favorit' },
      { id: 'hs_kit_door_liv', x: 10, y: 72, icon: '☁️', label: 'Kembali ke Cloud Nine Living Room', action: 'goto_living', prompt: '✦ [E] Kembali ke Ruang Keluarga' }
    ]
  },
  {
    id: 'conservatory',
    name: 'Floating Sky Conservatory',
    subtitle: 'Rumah Kaca Kubah di Atas Pulau Awan, Kolam Kristal & Kincir Mini',
    icon: '🌿',
    bgImage: '/assets/pinwheel_haven_conservatory.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'cons_left_garden_bed', minX: 14, maxX: 38, minY: 54, maxY: 70 },
      { id: 'cons_right_bench_table', minX: 64, maxX: 88, minY: 52, maxY: 68 },
      { id: 'cons_center_path_arch', minX: 42, maxX: 58, minY: 38, maxY: 50 }
    ],
    hotspots: [
      { id: 'hs_cons_plot1', x: 26, y: 62, icon: '🌸', label: 'Petak Bunga Whispering Wind Orchid (Slot 1)', action: 'garden_plot_1', prompt: '✦ [E] Rawat & Siram Whispering Wind Orchid' },
      { id: 'hs_cons_plot2', x: 48, y: 44, icon: '🪷', label: 'Petak Bunga Cloud Blossom Petunia (Slot 2)', action: 'garden_plot_2', prompt: '✦ [E] Rawat & Siram Cloud Blossom Petunia' },
      { id: 'hs_cons_plot3', x: 36, y: 74, icon: '🌼', label: 'Petak Bunga Sunbeam Golden Lily (Slot 3)', action: 'garden_plot_3', prompt: '✦ [E] Rawat & Siram Sunbeam Golden Lily' },
      { id: 'hs_cons_watering', x: 74, y: 64, icon: '💧', label: 'Penyiram Emas Murni & Air Embun Pagi', action: 'fill_water', prompt: '✦ [E] Ambil Air Embun Pagi Sejuk untuk Menyiram' },
      { id: 'hs_cons_bench', x: 84, y: 48, icon: '🪑', label: 'Bangku Taman Putih Menghadap Samudra Awan', action: 'rest_bench', prompt: '✦ [E] Duduk Bersantai Dikelilingi Harum Bunga' },
      { id: 'hs_cons_windmill', x: 60, y: 38, icon: '🎐', label: 'Kincir Angin Mini Berputar Mengikuti Hembusan Angin', action: 'spin_windmill', prompt: '✦ [E] Putar Kincir Angin Mini & Dengarkan Desir Angin' },
      { id: 'hs_cons_door_liv', x: 12, y: 74, icon: '☁️', label: 'Kembali ke Cloud Nine Living Room', action: 'goto_living', prompt: '✦ [E] Kembali ke Ruang Keluarga' }
    ]
  },
  {
    id: 'attic',
    name: 'The Memory Attic — Letters Above the Clouds',
    subtitle: 'Loteng Arsip Kenangan, Meja Scrapbook, Surat Sahabat & Koleksi Kincir Mini',
    icon: '📜',
    bgImage: '/assets/pinwheel_haven_attic.jpg',
    spawnX: 50,
    spawnY: 72,
    bounds: { minX: 10, maxX: 90, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'attic_study_desk', minX: 16, maxX: 40, minY: 48, maxY: 66 },
      { id: 'attic_trunks_chest', minX: 58, maxX: 78, minY: 52, maxY: 68 },
      { id: 'attic_chair_corner', minX: 80, maxX: 92, minY: 54, maxY: 72 }
    ],
    hotspots: [
      { id: 'hs_attic_letters', x: 28, y: 56, icon: '💌', label: 'Arsip Surat Sahabat di Atas Awan', action: 'read_letters', prompt: '✦ [E] Baca Surat Hangat dari Sahabat Our Little Universe' },
      { id: 'hs_attic_desk', x: 38, y: 64, icon: '🪶', label: 'Meja Menulis Scrapbook, Jurnal & Pena Bulu', action: 'write_scrapbook', prompt: '✦ [E] Buka Buku Harian & Tulis Kenangan Manis' },
      { id: 'hs_attic_pinwheels', x: 14, y: 42, icon: '🎐', label: 'Rak Koleksi Kincir Angin Mini Unik', action: 'view_pinwheel_collection', prompt: '✦ [E] Lihat Koleksi Kincir Angin Pelangi & Bintang' },
      { id: 'hs_attic_trunks', x: 68, y: 58, icon: '🧳', label: 'Peti Koper Kenangan & Album Foto Nostalgia', action: 'open_keepsake', prompt: '✦ [E] Buka Peti Kenangan & Pandangi Foto Kenangan' },
      { id: 'hs_attic_window', x: 68, y: 34, icon: '☀️', label: 'Jendela Kaca Patri Bundar & Berkas Cahaya Mentari', action: 'gaze_sunbeam', prompt: '✦ [E] Menikmati Sinar Matahari Pagi yang Menghangatkan' },
      { id: 'hs_attic_door_liv', x: 12, y: 74, icon: '☁️', label: 'Kembali ke Cloud Nine Living Room', action: 'goto_living', prompt: '✦ [E] Kembali ke Ruang Keluarga' }
    ]
  }
];

// -----------------------------------------------------------------------------
// 2. SKY KITCHEN RECIPES CATALOG
// -----------------------------------------------------------------------------
export const PINWHEEL_HAVEN_RECIPES = [
  {
    id: 'cloud_souffle_pancake',
    name: 'Cloud Souffle Pancake 🥞',
    icon: '🥞',
    desc: 'Pancake soufflé lembut seringan awan dengan madu lavender murni dan lelehan mentega hangat.',
    ingredients: ['Tepung Terigu Awan', 'Madu Bunga Lavender', 'Susu Murni Pegunungan'],
    timeSeconds: 4,
    rewardXp: 40
  },
  {
    id: 'sky_berry_honey_tartlet',
    name: 'Sky Berry Honey Tartlet 🥧',
    icon: '🥧',
    desc: 'Kue pai renyah berisi selai buah beri biru segar dan taburan gula kristal salju berbentuk bintang.',
    ingredients: ['Buah Beri Langit', 'Gula Kristal Bintang', 'Mentega Manis'],
    timeSeconds: 3.5,
    rewardXp: 35
  },
  {
    id: 'morning_breeze_herb_tea',
    name: 'Morning Breeze Herb Tea 🍵',
    icon: '🍵',
    desc: 'Seduhan daun teh hijau pegunungan pinwheel dan kelopak melati yang menyegarkan jiwa di pagi hari.',
    ingredients: ['Daun Teh Pinwheel', 'Kelopak Melati Langit', 'Air Embun Murni'],
    timeSeconds: 3,
    rewardXp: 30
  },
  {
    id: 'celestial_vanilla_parfait',
    name: 'Celestial Vanilla Parfait 🍨',
    icon: '🍨',
    desc: 'Parfait lapis krim mentega pastel lembut, remahan granola madu panggang, dan potongan buah persik manis.',
    ingredients: ['Krim Vanila Lembut', 'Granola Madu', 'Buah Persik Segar'],
    timeSeconds: 4,
    rewardXp: 45
  },
  {
    id: 'golden_sunbeam_cocoa',
    name: 'Golden Sunbeam Cocoa ☕',
    icon: '☕',
    desc: 'Cokelat kental hangat dengan taburan kayu manis dan marshmallow kenyal berbentuk awan putih.',
    ingredients: ['Kakao Pilihan', 'Kayu Manis Kastil', 'Marshmallow Awan'],
    timeSeconds: 3,
    rewardXp: 35
  }
];

// -----------------------------------------------------------------------------
// 3. FLOATING CONSERVATORY FLORA CATALOG
// -----------------------------------------------------------------------------
export const PINWHEEL_HAVEN_FLORA = [
  {
    id: 'whispering_wind_orchid',
    name: 'Whispering Wind Orchid',
    icon: '🌸',
    bloomIcon: '🌸✨',
    color: '#38bdf8',
    growthDurationSeconds: 15,
    yieldItem: 'Kelopak Anggrek Berdesir Angin',
    desc: 'Anggrek biru langit lembut yang kelopaknya berdesir menirukan senandung angin sepoi-sepoi.'
  },
  {
    id: 'cloud_blossom_petunia',
    name: 'Cloud Blossom Petunia',
    icon: '🪷',
    bloomIcon: '🪷☁️',
    color: '#bae6fd',
    growthDurationSeconds: 18,
    yieldItem: 'Mahkota Petunia Gumpalan Awan',
    desc: 'Bunga putih bersih bertekstur empuk dan harum manis seperti gumpalan awan pagi hari.'
  },
  {
    id: 'sunbeam_golden_lily',
    name: 'Sunbeam Golden Lily',
    icon: '🌼',
    bloomIcon: '🌼☀️',
    color: '#fde047',
    growthDurationSeconds: 22,
    yieldItem: 'Serbuk Sari Lili Mentari',
    desc: 'Bunga lili kuning mentega hangat yang memancarkan pendaran cahaya matahari lembut di dalam rumah kaca.'
  },
  {
    id: 'lavender_sky_dew',
    name: 'Lavender Sky Dew',
    icon: '🪻',
    bloomIcon: '🪻💜',
    color: '#c084fc',
    growthDurationSeconds: 20,
    yieldItem: 'Tangkai Lavender Embun Langit',
    desc: 'Lavender ungu pastel yang menghadirkan wewangian relaksasi dan kedamaian hati yang mendalam.'
  }
];

// -----------------------------------------------------------------------------
// 4. FRIENDSHIP LETTERS ARCHIVE (MEMORY ATTIC)
// -----------------------------------------------------------------------------
export const PINWHEEL_HAVEN_LETTERS = [
  {
    id: 'letter_lala',
    sender: 'Lala ☀️',
    universe: 'TO YOU',
    icon: '☀️',
    date: 'Pagi Hari Berbunga',
    excerpt: 'Untuk Syma sahabat langitku... Kincir angin yang berputar di pulaumu selalu menyambut matahari pagi...',
    fullLetter: 'Halo Syma tersayang! ☀️\n\nDari beranda Bloom Cottage, aku selalu melihat kincir angin di pulaumu berputar anggun ditiup angin pagi. Setiap putarannya seolah mengirimkan salam hangat ke universe TO YOU.\n\nAku mengirimkan sebotol madu bunga liar dan benih bunga matahari mini untuk kamu tanam di Floating Conservatory. Semoga harimu selalu dipenuhi senyuman secerah langit biru!\n\nPeluk hangat penuh mentari,\nLala ☀️'
  },
  {
    id: 'letter_nyanya',
    sender: 'Nyanya ⭐',
    universe: 'KIDULT',
    icon: '⭐',
    date: 'Malam Berbintang Jatuh',
    excerpt: 'Syma! Di Kidult Dream House, aku membuat kincir angin origami warna pastel khusus untukmu...',
    fullLetter: 'Hai Syma! ⭐\n\nKemarin saat santai di ruang hobi Kidult Dream House, aku teringat padamu dan membuat kincir angin origami mini dengan warna pastel pink dan kuning mentega. Ada bintang kecil di tengahnya!\n\nTaruh kincir ini di meja scrapbook lotengmu ya. Kalau kamu kangen, putar kincirnya dan ingat kalau aku selalu ada untukmu!\n\nSalam bintang penuh keajaiban,\nNyanya ⭐'
  },
  {
    id: 'letter_lele',
    sender: 'Lele 🌙',
    universe: 'SHADOW / THE ECLIPSE',
    icon: '🌙',
    date: 'Purnama Sunyi',
    excerpt: 'Dari menara The Eclipse, hembusan angin dari PINWHEEL selalu membawa ketenangan dan kesejukan...',
    fullLetter: 'Untuk Syma sang Penjaga Angin Langit, 🌙\n\nKetika malam tiba di The Eclipse, semilir angin dari pulaumu membawa aroma wisteria dan lavender yang sangat menenangkan. Kincir anginmu mengingatkanku bahwa waktu terus berputar dalam harmoni yang indah.\n\nAku menitipkan kristal starlight kecil ini. Letakkan di dekat jendela lotengmu agar cahayanya membiaskan pelangi lembut saat terkena sinar matahari pagi.\n\nSahabat malammu,\nLele 🌙'
  },
  {
    id: 'letter_akhira',
    sender: 'Akhira ⚡',
    universe: 'YAWN',
    icon: '⚡',
    date: 'Pasang Laut Biru',
    excerpt: 'Yo Syma! Angin di langit dan arus di samudra adalah saudara kembar yang mengalir bebas...',
    fullLetter: 'Hai Syma! ⚡\n\nDari kubah kaca The Azure Tide Palace, aku sering melihat pantulan pulau awanmu di permukaan samudra YAWN. Angin yang kamu jaga di langit membuat gelombang laut menari indah di bawah sini.\n\nAku kirimkan kerang mutiara langit yang bisa berdenting lembut seperti lonceng angin saat ditiup angin. Semoga The Pinwheel Haven selalu menjadi tempat terdamai bagimu!\n\nTetap bersemangat,\nAkhira ⚡'
  },
  {
    id: 'letter_ela',
    sender: 'Ela 🌸',
    universe: 'US AGAIN',
    icon: '🌸',
    date: 'Musim Bunga Lotus',
    excerpt: 'Kedamaian di Floating Sky Residence dan keheningan di The Silent Lotus House selalu selaras...',
    fullLetter: 'Syma yang lembut, 🌸\n\nSaat menyeduh teh di The Silent Lotus House, aku membayangkan betapa tenangnya duduk di balkon awanmu sambil mendengarkan gemerisik daun willow. Keheningan dan kelembutan adalah rumah bagi jiwa kita.\n\nAku mengirimkan teh seduhan daun lotus kering dan dupa wangi melati untuk menemani waktu membacamu di Cloud Nine Living Room.\n\nSalam damai penuh kasih,\nEla 🌸'
  },
  {
    id: 'letter_ruben',
    sender: 'Ruben 🐉',
    universe: 'ASH',
    icon: '🐉',
    date: 'Bara Api Puncak Salju',
    excerpt: 'Dari puncak The Dragon\'s Den, nagaku selalu mengamati langit PINWHEEL untuk memastikan kedamaianmu...',
    fullLetter: 'Untuk Syma, 🐉\n\nPuncak pegunungan kastil ASH yang dingin selalu terasa lebih hangat saat angin sepoi-sepoi dari PINWHEEL berhembus melintasi menara. Sumpah pelindungku berlaku untuk seluruh sahabat semesta, termasuk istana awanmu yang damai.\n\nJika kamu butuh bara penghangat untuk tungku dapur saat musim dingin, beritahu aku. Tetaplah menjadi cahaya yang menyejukkan bagi kita semua.\n\nHormat dan persahabatan abadi,\nRuben 🐉'
  },
  {
    id: 'letter_royan',
    sender: 'Royan 🎆',
    universe: 'HOT',
    icon: '🎆',
    date: 'Malam Pesta Kembang Api',
    excerpt: 'Kincir anginmu berputar indah saat kembang api meluncur melintasi langit malam...',
    fullLetter: 'Halo Syma! 🎆\n\nPesta kembang api di universe HOT kemarin malam sangat meriah! Dari atas awanmu pasti kelihatan percikan warna-warni yang berkilau di cakrawala kan?\n\nAku kirimkan lentera kembang api mini yang tidak berasap untuk menghiasi beranda malammu. Jangan lupa selalu tersenyum dan nikmati setiap detik di negeri awan!\n\nSalam ceria penuh warna,\nRoyan 🎆'
  }
];

// -----------------------------------------------------------------------------
// 5. MINI PINWHEEL COLLECTIBLES CATALOG
// -----------------------------------------------------------------------------
export const PINWHEEL_HAVEN_COLLECTIBLES = [
  {
    id: 'pastel_rainbow_pinwheel',
    name: 'Pastel Rainbow Pinwheel 🌈',
    icon: '🌈',
    desc: 'Kincir angin enam bilah warna-warni pastel buatan Nyanya & Syma, berputar lincah membawa keceriaan.',
    location: 'Meja Tulis The Memory Attic',
    discovered: true
  },
  {
    id: 'silver_starlight_windmill',
    name: 'Silver Starlight Windmill ⭐',
    icon: '⭐',
    desc: 'Kincir angin perak kecil berhiaskan kristal bintang dari Lele yang memantulkan cahaya rembulan.',
    location: 'Samping Piano Cloud Nine Living Room',
    discovered: true
  },
  {
    id: 'golden_sunbeam_pinwheel',
    name: 'Golden Sunbeam Pinwheel ☀️',
    icon: '☀️',
    desc: 'Kincir kuningan antik berkilau hangat pemberian Lala yang selalu hangat saat disentuh.',
    location: 'Balkon Dream Above Bedroom',
    discovered: false
  },
  {
    id: 'storm_dragon_sky_chime',
    name: 'Storm Dragon Sky Chime 🐉',
    icon: '🐉',
    desc: 'Kincir angin berpadu lonceng berukir sisik naga dari Ruben, berdering merdu menghalau badai.',
    location: 'Rumah Kaca Floating Sky Conservatory',
    discovered: false
  }
];

// -----------------------------------------------------------------------------
// 6. DAILY TASKS & HOUSE ACTIVITIES
// -----------------------------------------------------------------------------
export const PINWHEEL_HAVEN_TASKS = [
  { id: 'task_piano', title: 'Mainkan Melodi Piano di Living Room', xp: 20, completed: false, icon: '🎹' },
  { id: 'task_tea', title: 'Seduh Teh Herbal Hangat di Sky Kitchen', xp: 25, completed: false, icon: '🍵' },
  { id: 'task_garden', title: 'Siram Bunga di Floating Conservatory', xp: 25, completed: false, icon: '🌸' },
  { id: 'task_letter', title: 'Baca Arsip Surat Sahabat di Loteng', xp: 20, completed: false, icon: '💌' },
  { id: 'task_balcony', title: 'Nikmati Hembusan Angin di Balkon Kamar', xp: 15, completed: false, icon: '🎐' },
  { id: 'task_clouds', title: 'Amati Pulau Awan yang Berarak Tenang', xp: 15, completed: false, icon: '☁️' }
];

// -----------------------------------------------------------------------------
// 7. ATMOSPHERE LIGHTING PRESETS
// -----------------------------------------------------------------------------
export const PINWHEEL_HAVEN_ATMOSPHERES = [
  {
    id: 'morning_breeze',
    name: 'Morning Breeze (Pagi Cerah)',
    icon: '☀️',
    filter: 'brightness(1.05) contrast(1.02) saturate(1.08)',
    desc: 'Sinar mentari pagi keemasan lembut dan awan putih segar berarak ditiup angin sepoi-sepoi.'
  },
  {
    id: 'twilight_clouds',
    name: 'Twilight Clouds (Senja Damai)',
    icon: '🌅',
    filter: 'brightness(0.95) saturate(1.15) hue-rotate(-10deg)',
    desc: 'Langit senja bergradasi lavender ungu, oranye lembut, dan cahaya matahari terbenam yang menenangkan.'
  },
  {
    id: 'starlight_dream',
    name: 'Starlight Dream (Malam Bintang)',
    icon: '✨',
    filter: 'brightness(0.85) contrast(1.08) hue-rotate(15deg)',
    desc: 'Malam tenang bertabur bintang berkelap-kelip dengan pendaran cahaya rembulan lembut di atas awan.'
  }
];

// -----------------------------------------------------------------------------
// 8. DEFAULT STATE GENERATION
// -----------------------------------------------------------------------------
export function createDefaultPinwheelHavenState() {
  return {
    character: 'syma',
    currentRoom: 'living',
    atmosphere: 'morning_breeze',
    playerX: 50,
    playerY: 72,
    inventory: [
      { id: 'cloud_flour', name: 'Tepung Terigu Awan', icon: '🌾', count: 6 },
      { id: 'lavender_honey', name: 'Madu Bunga Lavender', icon: '🍯', count: 5 },
      { id: 'sky_berries', name: 'Buah Beri Langit', icon: '🫐', count: 6 },
      { id: 'pinwheel_tea_leaves', name: 'Daun Teh Pinwheel', icon: '🍃', count: 6 },
      { id: 'pure_dew_water', name: 'Air Embun Murni', icon: '💧', count: 8 },
      { id: 'cloud_marshmallow', name: 'Marshmallow Awan', icon: '☁️', count: 4 }
    ],
    cookedDishes: ['morning_breeze_herb_tea'],
    gardenSlots: [
      { slotId: 1, seedId: 'whispering_wind_orchid', plantName: 'Whispering Wind Orchid', stage: 'blooming', plantedAt: Date.now() - 30000, watered: true },
      { slotId: 2, seedId: 'cloud_blossom_petunia', plantName: 'Cloud Blossom Petunia', stage: 'growing', plantedAt: Date.now() - 10000, watered: true },
      { slotId: 3, seedId: 'sunbeam_golden_lily', plantName: 'Sunbeam Golden Lily', stage: 'seed', plantedAt: Date.now(), watered: false }
    ],
    collectibles: [
      { id: 'pastel_rainbow_pinwheel', found: true, foundAt: 'Meja Tulis The Memory Attic' },
      { id: 'silver_starlight_windmill', found: true, foundAt: 'Samping Piano Cloud Nine Living Room' },
      { id: 'golden_sunbeam_pinwheel', found: false },
      { id: 'storm_dragon_sky_chime', found: false }
    ],
    journalEntries: [
      {
        id: 'pj1',
        title: 'Istana di Atas Awan — The Pinwheel Haven',
        date: 'Hari Angin Pertama',
        content: 'Rumah di atas pulau awan ini akhirnya selesai dibangun. Setiap jendela memperlihatkan cakrawala biru tak bertepi dan kincir-kincir angin yang berputar lembut. Di sinilah tempatku pulang, merajut impian, dan menyambut semua sahabat semesta dengan secangkir teh hangat.'
      }
    ],
    tasks: PINWHEEL_HAVEN_TASKS.map(t => ({ ...t })),
    decorOptions: {
      bedroomCanopySheer: 'soft_sky_blue', // 'soft_sky_blue' | 'cloud_white' | 'pale_lavender'
      livingLamps: 'cloud_pendant',        // 'cloud_pendant' | 'star_lantern' | 'brass_pinwheel'
      gardenWindmillStyle: 'classic_white' // 'classic_white' | 'pastel_rainbow' | 'silver_crystal'
    },
    stats: {
      dishesCooked: 1,
      flowersHarvested: 2,
      notesPlayed: 0,
      cloudsGazedCount: 0,
      lettersReadCount: 0
    },
    updatedAt: Date.now()
  };
}

// -----------------------------------------------------------------------------
// 9. STORAGE PERSISTENCE (LOAD / SAVE / RESET)
// -----------------------------------------------------------------------------
export function loadPinwheelHavenState(characterKey = 'syma') {
  try {
    const raw = localStorage.getItem(PINWHEEL_HAVEN_STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultPinwheelHavenState();
      savePinwheelHavenState(characterKey, initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultPinwheelHavenState(),
      ...parsed,
      character: characterKey || 'syma'
    };
  } catch (err) {
    console.warn('[PinwheelHavenState] Failed to load from localStorage, returning defaults:', err);
    return createDefaultPinwheelHavenState();
  }
}

export function savePinwheelHavenState(characterKey = 'syma', stateObj = null) {
  if (!stateObj) return;
  try {
    const payload = {
      ...stateObj,
      character: characterKey || 'syma',
      updatedAt: Date.now()
    };
    localStorage.setItem(PINWHEEL_HAVEN_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[PinwheelHavenState] Failed to persist to localStorage:', err);
  }
}

export function resetPinwheelHavenState(characterKey = 'syma') {
  const fresh = createDefaultPinwheelHavenState();
  savePinwheelHavenState(characterKey, fresh);
  return fresh;
}

// -----------------------------------------------------------------------------
// 10. WEB AUDIO API SYNTHESIZERS (ZERO DEPENDENCY REAL-TIME AUDIO)
// -----------------------------------------------------------------------------
let havenAudioCtx = null;

function getAudioContext() {
  if (!havenAudioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) havenAudioCtx = new AudioContext();
  }
  if (havenAudioCtx && havenAudioCtx.state === 'suspended') {
    havenAudioCtx.resume().catch(() => {});
  }
  return havenAudioCtx;
}

/**
 * 1. Crystal Star Piano Note Synthesizer
 */
export function playPinwheelPianoNote(freq = 523.25) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle harmonic overtone
    const oscHarmonic = ctx.createOscillator();
    const gainHarmonic = ctx.createGain();
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    gainHarmonic.gain.setValueAtTime(0.08, now);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.0005, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    oscHarmonic.connect(gainHarmonic);
    gainHarmonic.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.7);
    oscHarmonic.start(now);
    oscHarmonic.stop(now + 1.3);
  } catch (_) {}
}

/**
 * 2. Gentle Sky Wind Chime Bell
 */
export function playSkyWindChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const frequencies = [880.0, 1046.5, 1318.5, 1567.98];
    const now = ctx.currentTime;

    frequencies.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  } catch (_) {}
}

/**
 * 3. Peaceful Cloud Harp Zen Arpeggio
 */
export function playCloudHarpZen() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [440.0, 554.37, 659.25, 880.0, 1108.73];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.12, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.12 + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.5);
    });
  } catch (_) {}
}

/**
 * 4. Kitchen Teapot Simmer & Tea Pouring Sizzle
 */
export function playTeapotSimmer() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 1.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(4.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 1.0);
  } catch (_) {}
}
