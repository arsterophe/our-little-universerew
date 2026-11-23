/**
 * ENCHANTED BLOOM COTTAGE — STATE & STORAGE LAYER
 * Universe: TO YOU — Lala ☀️ (Bella)
 * Concept: 2D Interactive Fairy Living Home Simulation
 * =============================================================================
 * Handles:
 * 1. Room definitions & coordinates (5 Rooms: Living, Bedroom, Kitchen, Conservatory, Attic)
 * 2. Character state, wardrobe, and animations (Chibi Lala with fairy wings)
 * 3. Daily Living Activities & Sleep Cycles
 * 4. Cooking minigame & recipe collection
 * 5. Butterfly & botanical gardening simulation
 * 6. Memory chest, letters, and sacred friendship archives
 * 7. Web Audio sound synthesis (Piano notes, cooking chime, tea sip, ambient)
 * 8. Character isolation & Firestore universe_states synchronization
 */

export const BLOOM_COTTAGE_CHARACTER = {
  id: 'lala',
  canonicalId: 'lala',
  name: 'Lala',
  role: 'The Everglow Fairy ☼',
  symbol: '☀️',
  universe: 'TO YOU',
  avatar: '/assets/avatar_lala_hd.png',
  chibi: '/assets/chibi_lala_avatar.png',
  quote: 'Small joy, make a big universe.'
};

// -----------------------------------------------------------------------------
// 1. ROOM DEFINITIONS & BOUNDARIES
// -----------------------------------------------------------------------------
export const BLOOM_ROOMS = [
  {
    id: 'living',
    name: 'Bloom Living Room',
    title: 'The Bloom Living Room',
    subtitle: 'Perapian Hangat, Piano Melodi, Meja Teh & Sofa Bunga',
    icon: '🛋️',
    themeColor: '#f472b6',
    bgImage: '/assets/bloom_cottage_living.jpg',
    description: 'Ruang tamu peri yang lapang dan hangat dengan jendela lengkung besar menghadap matahari pagi. Terdapat sofa beludru peach, perapian berapi peri keemasan, piano putih berhias sulur wisteria, dan meja teh porselen.',
    spawnX: 48,
    spawnY: 62,
    bounds: { minX: 10, maxX: 88, minY: 36, maxY: 82 },
    obstacles: [
      { id: 'piano', minX: 12, maxX: 26, minY: 36, maxY: 52 },
      { id: 'fireplace', minX: 38, maxX: 58, minY: 36, maxY: 48 },
      { id: 'sofa', minX: 36, maxX: 60, minY: 56, maxY: 68 },
      { id: 'tea_table', minX: 68, maxX: 84, minY: 52, maxY: 68 },
      { id: 'bookshelf', minX: 74, maxX: 88, minY: 36, maxY: 50 }
    ],
    hotspots: [
      { id: 'hs_piano', x: 20, y: 44, icon: '🎹', label: 'Mainkan Piano Peri', action: 'piano', prompt: '✦ [E] Mainkan Piano Melodi' },
      { id: 'hs_sofa', x: 48, y: 62, icon: '🛋️', label: 'Duduk Santai di Sofa', action: 'sit_sofa', prompt: '✦ [E] Duduk Bersantai' },
      { id: 'hs_teatable', x: 76, y: 60, icon: '🫖', label: 'Nikmati Teh Bunga', action: 'tea_time', prompt: '✦ [E] Seduh & Nikmati Teh' },
      { id: 'hs_fireplace', x: 48, y: 42, icon: '🔥', label: 'Hangatkan Diri di Perapian', action: 'fireplace', prompt: '✦ [E] Nyalakan Api Peri' },
      { id: 'hs_bookshelf', x: 81, y: 43, icon: '📖', label: 'Baca Rak Buku Cerita', action: 'bookshelf', prompt: '✦ [E] Buka Buku Dongeng' },
      { id: 'hs_door_bedroom', x: 12, y: 72, icon: '🚪', label: 'Ke Kamar Tidur', action: 'goto_bedroom', prompt: '✦ [E] Masuk ke Kamar Tidur' },
      { id: 'hs_door_kitchen', x: 86, y: 72, icon: '🚪', label: 'Ke Dapur', action: 'goto_kitchen', prompt: '✦ [E] Masuk ke Dapur' }
    ]
  },
  {
    id: 'bedroom',
    name: 'Dreamy Bedroom',
    title: 'The Dreamy Bedroom',
    subtitle: 'Ranjang Kanopi Bunga, Meja Rias, Lemari Peri & Balkon Pagi',
    icon: '🛏️',
    themeColor: '#c084fc',
    bgImage: '/assets/bloom_cottage_bedroom.jpg',
    description: 'Kamar tidur impian dengan ranjang kanopi berhias renda mawar pastel, meja rias bertabur kristal parfum bunga, lemari busana, dan pintu kaca menuju balkon berpagar bunga semerbak.',
    spawnX: 78,
    spawnY: 65,
    bounds: { minX: 12, maxX: 88, minY: 36, maxY: 82 },
    obstacles: [
      { id: 'bed', minX: 16, maxX: 40, minY: 36, maxY: 62 },
      { id: 'vanity', minX: 48, maxX: 64, minY: 36, maxY: 48 },
      { id: 'wardrobe', minX: 72, maxX: 88, minY: 36, maxY: 54 },
      { id: 'balcony_bench', minX: 46, maxX: 64, minY: 68, maxY: 80 }
    ],
    hotspots: [
      { id: 'hs_bed', x: 28, y: 49, icon: '🛏️', label: 'Tidur & Istirahat Nyenyak', action: 'sleep', prompt: '✦ [E] Istirahat & Tidur' },
      { id: 'hs_vanity', x: 56, y: 42, icon: '🪞', label: 'Meja Rias & Pesona Peri', action: 'vanity', prompt: '✦ [E] Rias & Hiasan Bunga' },
      { id: 'hs_wardrobe', x: 80, y: 45, icon: '👗', label: 'Buka Lemari & Gaun Peri', action: 'wardrobe_decor', prompt: '✦ [E] Buka Lemari Busana' },
      { id: 'hs_bedroom_decor', x: 74, y: 62, icon: '🎨', label: 'Ganti Dekorasi Kamar', action: 'change_decor', prompt: '✦ [E] Ganti Dekorasi Kamar' },
      { id: 'hs_balcony', x: 55, y: 74, icon: '🌸', label: 'Duduk di Balkon Bunga', action: 'balcony_view', prompt: '✦ [E] Duduk di Balkon Bunga' },
      { id: 'hs_door_living_b', x: 86, y: 65, icon: '🚪', label: 'Kembali ke Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Sweetheart Kitchen',
    title: 'The Sweetheart Kitchen',
    subtitle: 'Oven Kue Peri, Meja Resep, Kulkas Es Krim & Toples Madu',
    icon: '🍳',
    themeColor: '#fb923c',
    bgImage: '/assets/bloom_cottage_kitchen.jpg',
    description: 'Dapur beraroma manis buah peach dan vanila segar. Kompor tembaga berkilau, oven kue bintang, meja adonan dari marmer krem, toples selai mawar, dan lemari bahan makanan segar.',
    spawnX: 16,
    spawnY: 65,
    bounds: { minX: 10, maxX: 88, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'stove_oven', minX: 14, maxX: 34, minY: 38, maxY: 52 },
      { id: 'counter', minX: 42, maxX: 64, minY: 44, maxY: 60 },
      { id: 'fridge', minX: 74, maxX: 88, minY: 38, maxY: 56 }
    ],
    hotspots: [
      { id: 'hs_oven', x: 24, y: 45, icon: '🧁', label: 'Panggang Kue & Cupcake', action: 'cook_bake', prompt: '✦ [E] Memanggang Kue & Cupcake' },
      { id: 'hs_counter', x: 53, y: 52, icon: '🥣', label: 'Meja Racik Minuman Segar', action: 'brew_drink', prompt: '✦ [E] Racik Minuman Segar' },
      { id: 'hs_fridge', x: 81, y: 47, icon: '🧊', label: 'Kulkas & Ambil Bahan Makanan', action: 'open_fridge', prompt: '✦ [E] Ambil Bahan Makanan' },
      { id: 'hs_recipe_book', x: 38, y: 46, icon: '📖', label: 'Buku Resep Peri', action: 'recipe_book', prompt: '✦ [E] Buka Buku Resep' },
      { id: 'hs_dining_table', x: 62, y: 70, icon: '🪑', label: 'Meja Makan & Cicipi Hidangan', action: 'dining_table', prompt: '✦ [E] Duduk & Cicipi Makanan' },
      { id: 'hs_pantry_storage', x: 74, y: 62, icon: '🧺', label: 'Simpan ke Pantry', action: 'pantry_storage', prompt: '✦ [E] Simpan Makanan ke Pantry' },
      { id: 'hs_door_living_k', x: 14, y: 65, icon: '🚪', label: 'Kembali ke Living Room', action: 'goto_living', prompt: '✦ [E] Ke Living Room' },
      { id: 'hs_door_conservatory', x: 84, y: 72, icon: '🌱', label: 'Ke Butterfly Conservatory', action: 'goto_conservatory', prompt: '✦ [E] Ke Rumah Kaca Kupu-kupu' }
    ]
  },
  {
    id: 'conservatory',
    name: 'Butterfly Conservatory',
    title: 'The Butterfly Conservatory',
    subtitle: 'Kubah Kaca Botani, Petak Bunga Bintang & Kupu-kupu Langka',
    icon: '🦋',
    themeColor: '#34d399',
    bgImage: '/assets/bloom_cottage_conservatory.jpg',
    description: 'Kubah kaca botani yang dipenuhi cahaya matahari pagi, tanaman rambat berbunga harum, semak mawar pastel, air mancur kecil, dan kawanan kupu-kupu peri berwarna-warni yang berterbangan.',
    spawnX: 16,
    spawnY: 65,
    bounds: { minX: 10, maxX: 88, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'flower_bed_1', minX: 20, maxX: 42, minY: 40, maxY: 54 },
      { id: 'flower_bed_2', minX: 56, maxX: 78, minY: 40, maxY: 54 },
      { id: 'fountain', minX: 42, maxX: 56, minY: 56, maxY: 70 }
    ],
    hotspots: [
      { id: 'hs_garden_plants', x: 31, y: 47, icon: '🌸', label: 'Tanam & Siram Bunga Peri', action: 'garden_care', prompt: '✦ [E] Rawat & Siram Bunga' },
      { id: 'hs_seed_collector', x: 22, y: 62, icon: '🌱', label: 'Kumpulkan Benih Bunga', action: 'collect_seeds', prompt: '✦ [E] Kumpulkan Benih' },
      { id: 'hs_harvest_bench', x: 38, y: 65, icon: '🧺', label: 'Petik Bunga Mekar', action: 'harvest_flowers', prompt: '✦ [E] Petik Bunga Mekar' },
      { id: 'hs_butterfly_feeder', x: 67, y: 47, icon: '🦋', label: 'Temukan & Rawat Kupu-kupu', action: 'catch_butterfly', prompt: '✦ [E] Rawat & Tangkap Kupu-kupu' },
      { id: 'hs_fountain', x: 49, y: 63, icon: '⛲', label: 'Kolam Teratai Kristal', action: 'fountain_sip', prompt: '✦ [E] Segarkan Diri di Kolam' },
      { id: 'hs_door_kitchen_c', x: 14, y: 65, icon: '🚪', label: 'Kembali ke Dapur', action: 'goto_kitchen', prompt: '✦ [E] Ke Sweetheart Kitchen' },
      { id: 'hs_door_attic', x: 84, y: 42, icon: '🪜', label: 'Naik ke Loteng Kenangan', action: 'goto_attic', prompt: '✦ [E] Naik ke Memory Attic' }
    ]
  },
  {
    id: 'attic',
    name: 'Memory Attic',
    title: 'The Memory Attic',
    subtitle: 'Loteng Nyaman, Jendela Langit, Kotak Kenangan & Scrapbook',
    icon: '🗝️',
    themeColor: '#e879f9',
    bgImage: '/assets/bloom_cottage_attic.jpg',
    description: 'Loteng beratap miring kayu pinus dengan jendela atap skylight yang membiarkan cahaya langit biru masuk. Penuh dengan bantal empuk, peti kenangan antik, scrapbook persahabatan, dan surat-surat berharga dari 8 sahabat.',
    spawnX: 18,
    spawnY: 65,
    bounds: { minX: 10, maxX: 88, minY: 38, maxY: 82 },
    obstacles: [
      { id: 'chest_area', minX: 20, maxX: 38, minY: 40, maxY: 54 },
      { id: 'scrapbook_table', minX: 46, maxX: 68, minY: 42, maxY: 56 },
      { id: 'skylight_bench', minX: 72, maxX: 88, minY: 44, maxY: 60 }
    ],
    hotspots: [
      { id: 'hs_memory_chest', x: 29, y: 47, icon: '📦', label: 'Buka Peti Kenangan 8 Sahabat', action: 'memory_chest', prompt: '✦ [E] Buka Peti Kenangan' },
      { id: 'hs_scrapbook', x: 57, y: 49, icon: '📒', label: 'Hias & Baca Scrapbook Persahabatan', action: 'scrapbook', prompt: '✦ [E] Buka Scrapbook Kenangan' },
      { id: 'hs_letters_desk', x: 80, y: 52, icon: '💌', label: 'Baca & Tulis Surat Sahabat', action: 'read_letters', prompt: '✦ [E] Baca & Tulis Surat' },
      { id: 'hs_photo_frame', x: 74, y: 64, icon: '🖼️', label: 'Pigura Foto Kenangan', action: 'save_photo', prompt: '✦ [E] Simpan & Pajang Foto' },
      { id: 'hs_secret_stash', x: 38, y: 65, icon: '✨', label: 'Koleksi Tersembunyi Loteng', action: 'find_secrets', prompt: '✦ [E] Cari Koleksi Rahasia' },
      { id: 'hs_door_conservatory_a', x: 16, y: 65, icon: '🪜', label: 'Turun ke Ruang Kaca', action: 'goto_conservatory', prompt: '✦ [E] Turun ke Conservatory' },
      { id: 'hs_door_living_a', x: 84, y: 72, icon: '🚪', label: 'Turun ke Ruang Tamu', action: 'goto_living', prompt: '✦ [E] Turun ke Living Room' }
    ]
  }
];

// -----------------------------------------------------------------------------
// 2. RECIPES & COOKING CATALOG
// -----------------------------------------------------------------------------
export const BLOOM_RECIPES = [
  {
    id: 'strawberry_cupcake',
    name: 'Bloom Strawberry Cupcake',
    icon: '🧁',
    desc: 'Cupcake vanila lembut dengan frosting buttercream stroberi dan taburan kristal gula kelopak mawar.',
    prepTime: '3 detik',
    ingredients: ['Tepung Gandum Bintang', 'Stroberi Manis', 'Krim Susu Peri', 'Madu Bunga'],
    buff: 'Mood Bahagia & Berenergi 🍓'
  },
  {
    id: 'lavender_tea_cake',
    name: 'Honey Lavender Tea Cake',
    icon: '🍰',
    desc: 'Kue bolu lembut yang dipanggang dengan seduhan teh lavender dan lelehan madu hutan TO YOU.',
    prepTime: '4 detik',
    ingredients: ['Bunga Lavender Kering', 'Madu Hutan Asli', 'Telur Emas', 'Mentega Manis'],
    buff: 'Pikiran Tenang & Nyaman 💜'
  },
  {
    id: 'peach_parfait',
    name: 'Star Peach Parfait',
    icon: '🍨',
    desc: 'Lapisan buah persik segar, yogurt lembut beraroma vanila, dan remah biskuit karamel bertabur bintang.',
    prepTime: '3 detik',
    ingredients: ['Persik Segar', 'Yogurt Lembut', 'Remah Biskuit Bintang', 'Gula Kristal'],
    buff: 'Kesegaran Pagi Abadi 🍑'
  },
  {
    id: 'rose_macaron',
    name: 'Pastel Rose Macaron',
    icon: '🍪',
    desc: 'Kue macaron khas peri dengan cangkang renyah pink lembut dan isian selai mawar organik.',
    prepTime: '4 detik',
    ingredients: ['Tepung Almond Halus', 'Air Mawar Segar', 'Gula Halus', 'Selai Berry'],
    buff: 'Kreativitas & Inspirasi 🌸'
  },
  {
    id: 'fairy_berry_fizz',
    name: 'Sparkling Fairy Berry Fizz',
    icon: '🍹',
    desc: 'Minuman soda berkarbonasi alami dari buah berry hutan dengan es kristal bercahaya.',
    prepTime: '2 detik',
    ingredients: ['Campuran Berry Hutan', 'Air Embun Sejuk', 'Madu Bunga', 'Es Kristal'],
    buff: 'Semangat Peri Ceria ☀️'
  }
];

// -----------------------------------------------------------------------------
// 3. BOTANICAL PLANTS & BUTTERFLIES CATALOG
// -----------------------------------------------------------------------------
export const BLOOM_PLANTS = [
  { id: 'sun_blossom', name: 'Sun Blossom', icon: '🌻', color: '#facc15', rarity: 'Common', desc: 'Bunga kuning cerah yang mekar menghadap matahari pagi.' },
  { id: 'peach_petunia', name: 'Peach Petunia', icon: '🌸', color: '#fb923c', rarity: 'Common', desc: 'Petunia beraroma manis lembut seperti buah persik segar.' },
  { id: 'lavender_dewdrop', name: 'Lavender Dewdrop', icon: '🪻', color: '#c084fc', rarity: 'Uncommon', desc: 'Bunga lavender berteteskan embun bercahaya di malam hari.' },
  { id: 'golden_marigold', name: 'Golden Marigold', icon: '🌼', color: '#f59e0b', rarity: 'Rare', desc: 'Bunga marigold emas penarik kupu-kupu sayap kilau.' },
  { id: 'crystal_starlily', name: 'Crystal Star Lily', icon: '🌷', color: '#38bdf8', rarity: 'Legendary', desc: 'Bunga langka bermahkota kristal biru transparan bercahaya.' }
];

export const BLOOM_BUTTERFLIES = [
  { id: 'peach_swallowtail', name: 'Peach Swallowtail', icon: '🦋', color: '#f472b6', rarity: 'Common', desc: 'Kupu-kupu bersayap peach lembut yang menyukai nektar stroberi.' },
  { id: 'golden_glider', name: 'Golden Glider', icon: '✨', color: '#f59e0b', rarity: 'Uncommon', desc: 'Kupu-kupu pembawa berkah sinar matahari pagi bertabur serbuk emas.' },
  { id: 'lavender_monarch', name: 'Lavender Monarch', icon: '💜', color: '#a855f7', rarity: 'Rare', desc: 'Kupu-kupu megah dengan pola sayap renda ungu transparan.' },
  { id: 'crystal_wing', name: 'Crystal Wing Fairy', icon: '🩵', color: '#06b6d4', rarity: 'Rare', desc: 'Kupu-kupu berbadan mungil dengan sayap bening berkilau prisma.' },
  { id: 'celestial_blue', name: 'Celestial Blue Dreamer', icon: '💙', color: '#3b82f6', rarity: 'Legendary', desc: 'Kupu-kupu mitos yang hanya muncul ketika suasana hati sedang damai.' }
];

// -----------------------------------------------------------------------------
// 4. SACRED FRIENDSHIP MEMORIES (ALL 8 CHARACTERS)
// -----------------------------------------------------------------------------
export const BLOOM_MEMORIES = [
  {
    id: 'mem_nyanya',
    char: 'Nyanya ⭐',
    charId: 'nyanya',
    title: 'Teh Lavender di Bawah Langit Senja',
    date: 'Malam Berbintang',
    icon: '⭐',
    note: 'Bersama Nyanya di tepi Sungai Senja KIDULT, saling bercerita tentang mimpi masa kecil dan harapan yang tak pernah padam.',
    photo: '/assets/avatar_nyanya_hd.png'
  },
  {
    id: 'mem_lala',
    char: 'Lala ☀️ (Me)',
    charId: 'lala',
    title: 'Piknik Madu & Stroberi di Padang Bunga',
    date: 'Pagi Cerah',
    icon: '☀️',
    note: 'Hari ketika pertama kali menyelesaikan gaun kelopak mawar dan menikmati cupcake hangat bersama kawanan kupu-kupu.',
    photo: '/assets/avatar_lala_hd.png'
  },
  {
    id: 'mem_lele',
    char: 'Lele 🌙',
    charId: 'lele',
    title: 'Seruling Malam di Tepi Danau Kristal',
    date: 'Malam Purnama',
    icon: '🌙',
    note: 'Duduk berdampingan dalam keheningan yang nyaman bersama Lele di SHADOW, mendengarkan nada seruling yang menyejukkan hati.',
    photo: '/assets/avatar_lele_hd.png'
  },
  {
    id: 'mem_syma',
    char: 'Syma ☁️',
    charId: 'abil',
    title: 'Kincir Angin & Angin Musim Semi',
    date: 'Siang Berangin',
    icon: '☁️',
    note: 'Melihat kincir angin Syma berputar anggun di bukit PINWHEEL, ditemani aroma teh hijau dan kue sakura.',
    photo: '/assets/avatar_abil_hd.jpg'
  },
  {
    id: 'mem_akhira',
    char: 'Akhira 🌊',
    charId: 'akhira',
    title: 'Gumam Ombak & Pasir Bercahaya',
    date: 'Senja Pantai',
    icon: '🌊',
    note: 'Berjalan di tepi pantai YAWN, mengumpulkan kerang bercahaya dan tertawa bersama saat ombak membasahi kaki.',
    photo: '/assets/avatar_akhira_hd.jpg'
  },
  {
    id: 'mem_ela',
    char: 'Ela 🪷',
    charId: 'ela',
    title: 'Kuncup Teratai di Danau Tenang',
    date: 'Fajar Sejuk',
    icon: '🪷',
    note: 'Menemani Ela merawat bunga teratai di US AGAIN, merasakan kedamaian yang mendalam di setiap hembusan nafas.',
    photo: '/assets/avatar_ela_hd.jpg'
  },
  {
    id: 'mem_ruben',
    char: 'Ruben 🐉',
    charId: 'ruben',
    title: 'Api Hangat di Negeri Salju Abu',
    date: 'Malam Salju',
    icon: '🐉',
    note: 'Menikmati teh rempah hangat di dekat perapian naga Ruben di ASH, berbagi cerita tentang keberanian dan kesetiaan.',
    photo: '/assets/avatar_ruben_hd.jpg'
  },
  {
    id: 'mem_royan',
    char: 'Royan 🎆',
    charId: 'royan',
    title: 'Kembang Api Lembut di Langit Hutan',
    date: 'Malam Festival',
    icon: '🎆',
    note: 'Menyaksikan kilau cahaya warna-warni yang diciptakan Royan di HOT, menghangatkan hati kami semua selamanya.',
    photo: '/assets/avatar_royan_hd.jpg'
  }
];

// -----------------------------------------------------------------------------
// 5. SECRET EASTER EGGS / HIDDEN OBJECTS
// -----------------------------------------------------------------------------
export const BLOOM_SECRETS = [
  { id: 'secret_pebble', room: 'living', name: 'Permata Peri Pelangi', hint: 'Terselip manis di balik kaki piano putih.', icon: '💎' },
  { id: 'secret_ribbon', room: 'bedroom', name: 'Pita Sutra Lavender', hint: 'Mengintip di antara lipatan tirai balkon mawar.', icon: '🎀' },
  { id: 'secret_golden_whisk', room: 'kitchen', name: 'Pengocok Adonan Emas Peri', hint: 'Tersimpan rapi di sela toples madu bintang.', icon: '✨' },
  { id: 'secret_glass_chrysalis', room: 'conservatory', name: 'Kepompong Kristal Abadi', hint: 'Menggantung anggun di dahan tersembunyi kubah kaca.', icon: '🔮' },
  { id: 'secret_friendship_quill', room: 'attic', name: 'Pena Bulu Merpati Putih', hint: 'Terselip di balik buku harian tua dekat jendela atap.', icon: '🪶' }
];

// -----------------------------------------------------------------------------
// 6. ATMOSPHERE PRESETS
// -----------------------------------------------------------------------------
export const BLOOM_ATMOSPHERES = [
  { id: 'day', name: 'Morning Sunbeams', icon: '☀️', color: '#fef08a', desc: 'Cahaya pagi cerah keemasan dan udara segar' },
  { id: 'golden', name: 'Golden Hour', icon: '🌇', color: '#f97316', desc: 'Kehangatan sinar matahari senja berona peach emas' },
  { id: 'twilight', name: 'Lavender Twilight', icon: '🌆', color: '#c084fc', desc: 'Suasana tenang senja lavender dan langit ungu' },
  { id: 'night', name: 'Starry Dream Night', icon: '🌙', color: '#38bdf8', desc: 'Malam tenang bertabur kunang-kunang dan bintang' }
];

// -----------------------------------------------------------------------------
// 7. STORAGE KEYS & PERSISTENCE HELPERS
// -----------------------------------------------------------------------------
export function normalizeBloomCharKey(charId) {
  if (!charId) return 'lala';
  const c = String(charId).toLowerCase().trim();
  if (['bella', 'lala'].includes(c)) return 'lala';
  if (['alenda', 'nyanya'].includes(c)) return 'nyanya';
  if (['vanya', 'lele'].includes(c)) return 'lele';
  if (['abil', 'syma'].includes(c)) return 'abil';
  if (['akhira'].includes(c)) return 'akhira';
  if (['ela'].includes(c)) return 'ela';
  if (['ruben'].includes(c)) return 'ruben';
  if (['royan'].includes(c)) return 'royan';
  return c;
}

export function getBloomCottageStorageKey(charId) {
  const norm = normalizeBloomCharKey(charId);
  return `toyou_bloom_cottage_state_${norm}`;
}

export function getDefaultBloomCottageState(charId = 'lala') {
  const norm = normalizeBloomCharKey(charId);
  return {
    character: norm,
    currentRoom: 'living',
    atmosphere: 'day',
    playerPos: { x: 48, y: 62 },
    stats: {
      daysLived: 1,
      teaBrewedCount: 3,
      pianoPlaysCount: 2,
      cakesBakedCount: 2,
      flowersHarvested: 5,
      butterfliesFound: 3,
      napsTaken: 1
    },
    inventory: {
      cookedFoods: ['strawberry_cupcake', 'peach_parfait'],
      seeds: ['sun_blossom', 'peach_petunia', 'lavender_dewdrop'],
      harvestedFlowers: ['sun_blossom', 'peach_petunia'],
      discoveredButterflies: ['peach_swallowtail', 'golden_glider', 'lavender_monarch'],
      foundSecrets: ['secret_pebble']
    },
    gardenPlots: [
      { id: 1, plantId: 'sun_blossom', stage: 'bloomed', watered: true },
      { id: 2, plantId: 'peach_petunia', stage: 'growing', watered: true },
      { id: 3, plantId: 'lavender_dewdrop', stage: 'sprout', watered: false },
      { id: 4, plantId: null, stage: 'empty', watered: false }
    ],
    roomDecor: {
      living: 'sweet_peach',
      bedroom: 'dreamy_rose',
      kitchen: 'warm_honey',
      conservatory: 'emerald_garden',
      attic: 'starlight_lavender'
    },
    dailyChecklist: {
      teaSipped: true,
      pianoPlayed: false,
      cakeBaked: true,
      gardenWatered: true,
      butterflyCaught: false,
      restedInBed: false
    },
    lastUpdated: new Date().toISOString()
  };
}

export function loadBloomCottageState(charId = 'lala') {
  const key = getBloomCottageStorageKey(charId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const def = getDefaultBloomCottageState(charId);
      saveBloomCottageState(charId, def);
      return def;
    }
    const parsed = JSON.parse(raw);
    return { ...getDefaultBloomCottageState(charId), ...parsed };
  } catch (err) {
    console.warn('[BloomCottageState] Error loading state, using default:', err);
    return getDefaultBloomCottageState(charId);
  }
}

export function saveBloomCottageState(charId, state) {
  const key = getBloomCottageStorageKey(charId);
  try {
    const payload = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('[BloomCottageState] Error saving state:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// 8. WEB AUDIO SOUND SYNTHESIZER
// -----------------------------------------------------------------------------
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playPianoNote(noteFreq = 440) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export function playChimeSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.6);
    });
  } catch (e) {}
}

export function playTeaPourSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [784, 880, 988, 1175];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.45);
    });
  } catch (e) {}
}
