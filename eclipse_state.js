/**
 * THE ECLIPSE — THE AUTHOR'S ETERNAL SANCTUARY
 * Universe: Private Royal Celestial Sanctuary for Lele 🌙 (The Author)
 * 
 * State management, room definitions, author desk catalogs,
 * persistence, audio synthesis, and strict access validation.
 */

// -----------------------------------------------------------------------------
// 1. ACCESS CONTROL & IDENTITY VALIDATION
// -----------------------------------------------------------------------------
import {
  OLU_STORE_HOUSE_STATES,
  getSynchronousState,
  setSynchronousState
} from './olu_indexeddb.js';

export const ECLIPSE_AUTHOR = {
  charId: 'lele',
  alias: 'vanya',
  title: 'The Eternal Author',
  role: 'Creator & Architect of Our Little Universe',
  sanctuaryName: 'THE ECLIPSE',
  subtitle: "The Author's Eternal Sanctuary",
  crest: '🌙👑'
};

/**
 * Validates whether the active character/user is authorized to enter The Eclipse.
 * Strictly restricted to Lele / Vanya.
 */
export function isAuthorAuthorized(userOrCharKey) {
  if (!userOrCharKey) return false;
  const key = String(userOrCharKey).toLowerCase().trim();
  return key === 'lele' || key === 'vanya' || key === 'author';
}

// -----------------------------------------------------------------------------
// 2. ROOM DEFINITIONS & BOUNDARIES
// -----------------------------------------------------------------------------
export const ECLIPSE_ROOMS = [
  {
    id: 'garden',
    name: 'The Eclipse Garden',
    title: 'The Eclipse Garden — Taman Malam Abadi',
    subtitle: 'Mawar Hitam, Kolam Refleksi Bintang, Air Mancur Bulan & Gazebo Kerajaan',
    icon: '🌹',
    themeColor: '#7c3aed',
    bgImage: '/assets/eclipse_garden.jpg',
    description: 'Taman kerajaan celestial di bawah langit malam abadi. Mawar hitam bermekaran dengan embun perak, pohon kunang-kunang raksasa, kolam refleksi bintang, air mancur bulan kristal, dan gazebo perak berhias tirai beludru.',
    spawnX: 48,
    spawnY: 72,
    bounds: { minX: 8, maxX: 92, minY: 36, maxY: 84 },
    obstacles: [
      { id: 'fountain', minX: 42, maxX: 58, minY: 48, maxY: 64 },
      { id: 'gazebo', minX: 74, maxX: 90, minY: 42, maxY: 60 },
      { id: 'reflecting_pond', minX: 12, maxX: 30, minY: 52, maxY: 70 }
    ],
    hotspots: [
      { id: 'hs_garden_fountain', x: 50, y: 56, icon: '⛲', label: 'Air Mancur Bulan Kristal', action: 'moon_fountain', prompt: '✦ [E] Nikmati Kesejukan Air Mancur Bulan' },
      { id: 'hs_garden_gazebo', x: 82, y: 51, icon: '🏛️', label: 'Gazebo Kerajaan Malam', action: 'royal_gazebo', prompt: '✦ [E] Duduk Santai di Gazebo Kerajaan' },
      { id: 'hs_garden_pond', x: 21, y: 61, icon: '✨', label: 'Kolam Refleksi Bintang', action: 'reflection_pond', prompt: '✦ [E] Renungkan Refleksi Bintang' },
      { id: 'hs_garden_roses', x: 36, y: 44, icon: '🥀', label: 'Taman Mawar Hitam & Lilies', action: 'black_roses', prompt: '✦ [E] Petik Setangkai Mawar Hitam' },
      { id: 'hs_garden_door_palace', x: 50, y: 38, icon: '🏰', label: 'Gerbang The Grand Hall', action: 'goto_grand_hall', prompt: '✦ [E] Masuk ke The Grand Hall' }
    ]
  },
  {
    id: 'grand_hall',
    name: 'The Grand Hall',
    title: 'The Grand Hall — Aula Utama Kerajaan',
    subtitle: 'Chandelier Kristal, Pilar Amethyst, Piano Grand Obsidian & Singgasana',
    icon: '🏰',
    themeColor: '#6366f1',
    bgImage: '/assets/eclipse_grand_hall.jpg',
    description: 'Aula istana megah berdinding marmer obsidian dengan pilar kristal amethyst bercahaya ungu. Chandelier raksasa meneteskan kilau perak, tangga melengkung kembar, grand piano hitam berukir perak, dan jendela kaca patri gerhana.',
    spawnX: 50,
    spawnY: 74,
    bounds: { minX: 10, maxX: 90, minY: 36, maxY: 82 },
    obstacles: [
      { id: 'piano', minX: 16, maxX: 32, minY: 42, maxY: 58 },
      { id: 'throne_seating', minX: 42, maxX: 58, minY: 36, maxY: 48 },
      { id: 'statue_r', minX: 72, maxX: 84, minY: 42, maxY: 56 }
    ],
    hotspots: [
      { id: 'hs_hall_piano', x: 24, y: 50, icon: '🎹', label: 'Mainkan Grand Piano Obsidian', action: 'grand_piano', prompt: '✦ [E] Mainkan Melodi Gerhana' },
      { id: 'hs_hall_throne', x: 50, y: 42, icon: '👑', label: 'Singgasana Celestial Author', action: 'author_throne', prompt: '✦ [E] Duduk di Singgasana Kerajaan' },
      { id: 'hs_hall_stained_glass', x: 78, y: 44, icon: '🌌', label: 'Jendela Kaca Patri Gerhana', action: 'stained_glass', prompt: '✦ [E] Amati Motif Kaca Patri' },
      { id: 'hs_hall_door_garden', x: 50, y: 78, icon: '🌹', label: 'Kembali ke The Eclipse Garden', action: 'goto_garden', prompt: '✦ [E] Keluar ke Taman Malam' },
      { id: 'hs_hall_door_library', x: 14, y: 65, icon: '📚', label: 'Masuk ke The Author\'s Library', action: 'goto_library', prompt: '✦ [E] Ke Perpustakaan Author' },
      { id: 'hs_hall_door_bedroom', x: 86, y: 65, icon: '🛏️', label: 'Masuk ke The Royal Bedroom', action: 'goto_bedroom', prompt: '✦ [E] Ke Kamar Tidur Kerajaan' },
      { id: 'hs_hall_stairs_up', x: 50, y: 36, icon: '🪜', label: 'Naik ke The Celestial Observatory', action: 'goto_observatory', prompt: '✦ [E] Naik ke Observatorium' }
    ]
  },
  {
    id: 'library',
    name: "The Author's Library",
    title: "The Author's Library — Perpustakaan Penulis Semesta",
    subtitle: 'Rak Buku Menjulang, Tangga Geser, Arsip Naskah & THE AUTHOR\'S DESK',
    icon: '📚',
    themeColor: '#8b5cf6',
    bgImage: '/assets/eclipse_library.jpg',
    description: 'Perpustakaan beraroma kulit buku kuno, perkamen, dan kayu mahoni. Rak buku megah bertingkat hingga kubah langit-langit, tangga geser kuningan, perapian perak, dan meja kerja besar tempat sang author merajut semesta.',
    spawnX: 80,
    spawnY: 65,
    bounds: { minX: 10, maxX: 88, minY: 36, maxY: 82 },
    obstacles: [
      { id: 'author_desk', minX: 38, maxX: 62, minY: 48, maxY: 64 },
      { id: 'bookcase_l', minX: 12, maxX: 26, minY: 36, maxY: 54 },
      { id: 'fireplace_lib', minX: 72, maxX: 86, minY: 36, maxY: 50 }
    ],
    hotspots: [
      { id: 'hs_author_desk', x: 50, y: 56, icon: '🖋️', label: "THE AUTHOR'S DESK (Pusat Kendali)", action: 'author_desk', prompt: '✦ [E] Buka THE AUTHOR\'S DESK' },
      { id: 'hs_lib_bookshelf', x: 19, y: 45, icon: '📖', label: 'Buka Arsip Cerita & Grimoire', action: 'story_books', prompt: '✦ [E] Buka Arsip Buku Cerita' },
      { id: 'hs_lib_fireplace', x: 79, y: 43, icon: '🔥', label: 'Perapian Perak & Kursi Beludru', action: 'lib_fireplace', prompt: '✦ [E] Hangatkan Diri & Membaca' },
      { id: 'hs_secret_switch', x: 28, y: 38, icon: '🗝️', label: 'Buku Mencurigakan (Sakelar Rahasia)', action: 'secret_passage', prompt: '✦ [E] Tarik Buku Rahasia...' },
      { id: 'hs_lib_door_hall', x: 84, y: 68, icon: '🏰', label: 'Kembali ke The Grand Hall', action: 'goto_grand_hall', prompt: '✦ [E] Ke The Grand Hall' },
      { id: 'hs_lib_door_gallery', x: 14, y: 68, icon: '🖼️', label: 'Ke The Memory Gallery', action: 'goto_gallery', prompt: '✦ [E] Ke Galeri Kenangan' }
    ]
  },
  {
    id: 'bedroom',
    name: 'The Royal Bedroom',
    title: 'The Royal Bedroom — Bilik Peristirahatan Kerajaan',
    subtitle: 'Ranjang Kanopi Velvet Midnight, Meja Rias Kristal, Wardrobe & Balkon Bintang',
    icon: '🛏️',
    themeColor: '#a855f7',
    bgImage: '/assets/eclipse_bedroom.jpg',
    description: 'Kamar tidur luas bernuansa velvet midnight dan ungu amethyst. Ranjang kanopi berornamen perak, chandelier kristal kecil, cermin rias berukir bulan sabit, dan balkon pribadi menghadap galaksi tanpa batas.',
    spawnX: 18,
    spawnY: 65,
    bounds: { minX: 12, maxX: 88, minY: 36, maxY: 82 },
    obstacles: [
      { id: 'royal_bed', minX: 16, maxX: 40, minY: 36, maxY: 62 },
      { id: 'royal_vanity', minX: 48, maxX: 64, minY: 36, maxY: 48 },
      { id: 'wardrobe_walkin', minX: 72, maxX: 88, minY: 36, maxY: 56 }
    ],
    hotspots: [
      { id: 'hs_bed_rest', x: 28, y: 49, icon: '🛏️', label: 'Istirahat di Ranjang Kanopi Velvet', action: 'royal_sleep', prompt: '✦ [E] Istirahat & Renungan Malam' },
      { id: 'hs_royal_vanity', x: 56, y: 42, icon: '🪞', label: 'Meja Rias Kristal Bulan', action: 'royal_vanity', prompt: '✦ [E] Rias & Mahkota Bulan' },
      { id: 'hs_royal_wardrobe', x: 80, y: 46, icon: '👑', label: 'Lemari Busana Kerajaan Author', action: 'royal_wardrobe', prompt: '✦ [E] Ganti Busana & Jubah' },
      { id: 'hs_bedroom_decor', x: 68, y: 62, icon: '🎨', label: 'Kustomisasi Dekorasi Bilik', action: 'bedroom_decor', prompt: '✦ [E] Kustomisasi Bilik Kerajaan' },
      { id: 'hs_bedroom_balcony', x: 48, y: 74, icon: '🌙', label: 'Balkon Pribadi Langit Malam', action: 'bedroom_balcony', prompt: '✦ [E] Menatap Langit dari Balkon' },
      { id: 'hs_bed_door_hall', x: 14, y: 65, icon: '🏰', label: 'Kembali ke The Grand Hall', action: 'goto_grand_hall', prompt: '✦ [E] Ke The Grand Hall' }
    ]
  },
  {
    id: 'observatory',
    name: 'The Celestial Observatory',
    title: 'The Celestial Observatory — Menara Observatorium Bintang',
    subtitle: 'Kubah Terbuka, Teleskop Raksasa, Peta Rasi Bintang & Gerhana Abadi',
    icon: '🔭',
    themeColor: '#38bdf8',
    bgImage: '/assets/eclipse_observatory.jpg',
    description: 'Puncak menara tertinggi istana The Eclipse dengan kubah kaca bundar yang memandang langsung ke galaksi, cincin planet, rasi bintang kuno, dan gerhana abadi. Di tengah berdiri teleskop obsidian berlapis perak.',
    spawnX: 48,
    spawnY: 72,
    bounds: { minX: 10, maxX: 88, minY: 36, maxY: 82 },
    obstacles: [
      { id: 'giant_telescope', minX: 38, maxX: 62, minY: 40, maxY: 58 },
      { id: 'astrolabe_l', minX: 16, maxX: 28, minY: 46, maxY: 60 },
      { id: 'globe_r', minX: 72, maxX: 84, minY: 46, maxY: 60 }
    ],
    hotspots: [
      { id: 'hs_obs_telescope', x: 50, y: 49, icon: '🔭', label: 'Teropong Bintang & Gerhana', action: 'use_telescope', prompt: '✦ [E] Amati Bintang & Planet' },
      { id: 'hs_obs_starmap', x: 22, y: 53, icon: '🗺️', label: 'Peta Konstelasi Semesta OLU', action: 'starmap', prompt: '✦ [E] Pelajari Peta Konstelasi' },
      { id: 'hs_obs_star_globe', x: 78, y: 53, icon: '🌐', label: 'Globe Langit Kristal', action: 'star_globe', prompt: '✦ [E] Putar Globe Langit' },
      { id: 'hs_obs_stairs_down', x: 50, y: 76, icon: '🪜', label: 'Turun ke The Grand Hall', action: 'goto_grand_hall', prompt: '✦ [E] Turun ke The Grand Hall' }
    ]
  },
  {
    id: 'gallery',
    name: 'The Memory Gallery',
    title: 'The Memory Gallery — Galeri Kenangan Author',
    subtitle: 'Bingkai Kenangan, Surat Sahabat, Ilustrasi Kanvas & Arsip Momen',
    icon: '🖼️',
    themeColor: '#ec4899',
    bgImage: '/assets/eclipse_grand_hall.jpg',
    description: 'Lorong galeri megah berhias bingkai perak dan kanvas lukisan momen-momen paling berharga dari seluruh 8 karakter Our Little Universe. Rak khusus menyimpan surat-surat tulisan tangan dan artefak persahabatan.',
    spawnX: 80,
    spawnY: 65,
    bounds: { minX: 10, maxX: 88, minY: 36, maxY: 82 },
    obstacles: [
      { id: 'gallery_bench', minX: 38, maxX: 62, minY: 56, maxY: 68 },
      { id: 'art_easel', minX: 18, maxX: 30, minY: 40, maxY: 54 }
    ],
    hotspots: [
      { id: 'hs_gallery_frames', x: 50, y: 42, icon: '🖼️', label: 'Koleksi Bingkai Kenangan OLU', action: 'view_frames', prompt: '✦ [E] Lihat Bingkai Kenangan' },
      { id: 'hs_gallery_letters', x: 24, y: 47, icon: '💌', label: 'Kotak Surat Kerajaan Sahabat', action: 'view_letters', prompt: '✦ [E] Buka Surat-surat Berharga' },
      { id: 'hs_gallery_custom_frame', x: 76, y: 45, icon: '✨', label: 'Kustomisasi Bingkai Foto', action: 'custom_frame', prompt: '✦ [E] Pajang Momen Baru' },
      { id: 'hs_gal_door_library', x: 84, y: 68, icon: '📚', label: 'Kembali ke The Library', action: 'goto_library', prompt: '✦ [E] Kembali ke Library' }
    ]
  },
  {
    id: 'secret_chamber',
    name: 'The Secret Author Chamber',
    title: 'The Secret Author Chamber — Ruangan Rahasia Sang Pencipta',
    subtitle: 'Peta Utama Semesta, Dinding Takdir OLU & Naskah Rahasia',
    icon: '🔮',
    themeColor: '#c084fc',
    bgImage: '/assets/eclipse_library.jpg',
    description: 'Ruangan suci tersembunyi di balik rak buku perpustakaan. Hanya sang author yang dapat menemukannya. Dindingnya memuat peta kosmologi lengkap 8 semesta OLU, naskah takdir, dan artefak penciptaan dunia.',
    spawnX: 48,
    spawnY: 72,
    bounds: { minX: 10, maxX: 88, minY: 36, maxY: 82 },
    obstacles: [
      { id: 'secret_altar', minX: 40, maxX: 60, minY: 42, maxY: 58 }
    ],
    hotspots: [
      { id: 'hs_secret_cosmology_map', x: 50, y: 38, icon: '🌌', label: 'Peta Kosmologi Semesta OLU', action: 'cosmology_map', prompt: '✦ [E] Amati Peta Semesta Utama' },
      { id: 'hs_secret_manuscripts', x: 50, y: 50, icon: '📜', label: 'Naskah Rahasia Penciptaan Dunia', action: 'creation_manuscript', prompt: '✦ [E] Buka Naskah Rahasia' },
      { id: 'hs_secret_relic_chest', x: 24, y: 54, icon: '💎', label: 'Peti Artefak Eclipse Crystal', action: 'eclipse_relic', prompt: '✦ [E] Sentuh Kristal Gerhana' },
      { id: 'hs_secret_exit', x: 78, y: 68, icon: '🚪', label: 'Kembali ke The Library', action: 'goto_library', prompt: '✦ [E] Keluar ke Perpustakaan' }
    ]
  }
];

// -----------------------------------------------------------------------------
// 3. THE AUTHOR'S DESK DATA CATALOGS
// -----------------------------------------------------------------------------

// A. STORY ARCHIVES & DRAFTS
export const AUTHOR_STORY_DRAFTS = [
  {
    id: 'draft_chronicles',
    title: 'Chronicles of Our Little Universe: Bab Kejayaan',
    genre: 'Celestial Fairytale',
    status: 'In Progress ✦',
    excerpt: 'Di awal permulaan, sebelum bintang-bintang memiliki nama, sebuah melodi sunyi lahir dari kegelapan yang paling tenang. Melodi itu menjadi detak jantung semesta kita...',
    wordCount: '12,450 kata',
    lastModified: 'Hari ini'
  },
  {
    id: 'draft_eight_souls',
    title: 'The Eight Constellations (Kisah Delapan Jiwa)',
    genre: 'Cosmic Friendship',
    status: 'Draft Selesai ✨',
    excerpt: 'Delapan sahabat dari delapan sudut semesta: Nyanya dengan mimpi masa kecilnya, Lala dengan sayap peri bunganya, Lele dalam keheningan bayangan malam, Syma yang melayang di angin, Akhira penjaga pantai tidur, Ela pemetik teratai hening, Ruben penjaga bara api salju, dan Royan pencipta kembang api abadi.',
    wordCount: '24,800 kata',
    lastModified: 'Kemarin'
  },
  {
    id: 'draft_the_eclipse',
    title: 'The Eclipse: Tempat Waktu Berhenti',
    genre: 'Dark Academia Poetry',
    status: 'Masterpiece 🌙',
    excerpt: 'Ketika matahari dan bulan saling berpelukan dalam gerhana abadi, tidak ada lagi siang yang melelahkan atau malam yang menakutkan. Hanya ada keheningan di mana kata-kata menemukan rumahnya.',
    wordCount: '8,920 kata',
    lastModified: 'Minggu ini'
  }
];

// B. UNIVERSE MAP & LORE OF OLU
export const OLU_UNIVERSE_LORE = [
  { id: 'kidult', name: 'KIDULT (Nyanya ⭐)', realm: 'Alam Mimpi Masa Kecil', element: 'Starlight Lavender', desc: 'Dunia dongeng tempat impian masa kanak-kanak tetap hidup dalam jiwa yang tumbuh dewasa.' },
  { id: 'to_you', name: 'TO YOU (Lala ☀️)', realm: 'Hutan Peri Pagi & Mekar', element: 'Sunbeam Peach', desc: 'Kubah kehangatan bunga mekar, kepakan sayap peri, dan sukacita kebahagiaan kecil.' },
  { id: 'shadow', name: 'SHADOW (Lele 🌙)', realm: 'Istana Bayangan Kristal', element: 'Moonlit Amethyst', desc: 'Ketenangan hening, harmoni malam, dan perlindungan bagi jiwa yang mencari kedamaian.' },
  { id: 'pinwheel', name: 'PINWHEEL (Syma / Abil ☁️)', realm: 'Bukit Kincir Angin', element: 'Zephyr Sage', desc: 'Embusan angin sejuk pegunungan, studio lensa fotografi, dan ketulusan awan putih.' },
  { id: 'yawn', name: 'YAWN (Akhira 🌊)', realm: 'Pesisir Pantai Melamun', element: 'Tide Aqua', desc: 'Suara deburan ombak lembut yang meninabobokan kegelisahan menjadi mimpi indah.' },
  { id: 'us_again', name: 'US AGAIN (Ela 🪷)', realm: 'Danau Teratai Fajar', element: 'Lotus Jade', desc: 'Tempat bertemunya kembali jiwa-jiwa murni dalam ketenangan danau cermin.' },
  { id: 'ash', name: 'ASH (Ruben 🐉)', realm: 'Negeri Salju & Bara Hangat', element: 'Ember Crimson', desc: 'Keberanian, kesetiaan abadi, dan kehangatan bara naga di tengah musim salju.' },
  { id: 'hot', name: 'HOT (Royan 🎆)', realm: 'Festival Cahaya Semarak', element: 'Blaze Gold', desc: 'Kilau kembang api di langit malam hutan, perayaan persahabatan tanpa akhir.' },
  { id: 'the_eclipse', name: 'THE ECLIPSE (Lele 👑)', realm: 'The Author\'s Eternal Sanctuary', element: 'Royal Eclipse Void', desc: 'Pusat penciptaan dan kesunyian agung tempat seluruh benang takdir OLU ditulis.' }
];

// C. CELESTIAL OBSERVATIONS & CONSTELLATIONS
export const CELESTIAL_OBSERVATIONS = [
  { id: 'const_crown', name: 'Corona Authoris (Mahkota Sang Penulis)', icon: '👑', status: 'Terpetakan', desc: 'Gugusan 7 bintang perak yang melingkar sempurna di atas istana The Eclipse.' },
  { id: 'const_eclipse', name: 'Totality of Amethyst (Gerhana Abadi)', icon: '🌑', status: 'Aktif Abadi', desc: 'Fenomena gerhana ketika piringan bulan menutupi matahari, menyisakan korona ungu keemasan.' },
  { id: 'const_quill', name: 'The Golden Quill (Pena Takdir)', icon: '🪶', status: 'Terpetakan', desc: 'Rasi bintang menyerupai pena bulu yang melintasi langit utara setiap tengah malam.' },
  { id: 'const_mirror', name: 'The Dual Mirror (Cermin Jiwa)', icon: '🪞', status: 'Terpetakan', desc: 'Konstelasi kembar yang melambangkan keharmonisan antara bayangan dan cahaya.' }
];

// D. ROYAL WARDROBE COLLECTION
export const ROYAL_WARDROBE_COLLECTION = [
  { id: 'robe_eclipse', name: 'The Eternal Eclipse Robe', icon: '👑', desc: 'Jubah beludru hitam midnight berhias bordir perak rasi bintang dan sulur kristal amethyst.' },
  { id: 'robe_moonlight', name: 'Moonlight Silk Kimono', icon: '🌙', desc: 'Kimono sutra perak selembut kabut malam dengan obi ungu gelap dan gantungan giok bulan.' },
  { id: 'coat_academia', name: 'Dark Academia Velvet Tailcoat', icon: '🧥', desc: 'Jas berekor beludru navy pekat dengan kancing emas champagne dan kerah satin tinggi.' },
  { id: 'gown_starlight', name: 'Celestial Amethyst Gown', icon: '✨', desc: 'Gaun malam bertabur ribuan partikel kristal berkilauan seperti langit malam berbintang.' }
];

// -----------------------------------------------------------------------------
// 4. STORAGE PERSISTENCE & INITIAL STATE
// -----------------------------------------------------------------------------
const ECLIPSE_STORAGE_KEY = 'the_eclipse_author_state_lele';

export function getDefaultEclipseState() {
  return {
    owner: 'lele',
    currentRoom: 'grand_hall',
    playerPos: { x: 50, y: 74 },
    secretChamberUnlocked: false,
    activeWardrobe: 'The Eternal Eclipse Robe',
    stats: {
      pianoNotesPlayed: 12,
      starsObserved: 4,
      draftsWritten: 3,
      memoriesViewed: 8,
      gardenVisits: 5
    },
    authorJournal: [
      {
        id: 'j1',
        date: 'Malam Pertama Gerhana',
        title: 'Tempat Dimana Kata-Kata Bernapas',
        content: 'Aku membangun The Eclipse bukan untuk menjauh dari mereka, tetapi untuk menjaga agar semesta ini tetap utuh. Di sini, di antara marmer obsidian dan kristal ungu, setiap ide menemukan keabadian.'
      },
      {
        id: 'j2',
        date: 'Tengah Malam Purnama',
        title: 'Melihat Delapan Bintang',
        content: 'Dari teropong di menara observatorium, aku melihat pulau-pulau mereka berkilau di kejauhan. Nyanya dengan lentera lavender, Lala dengan bunga mawarnya... Betapa indahnya dunia yang telah kita rajut bersama.'
      }
    ],
    inspirationBoard: [
      { id: 'b1', title: 'Bab Selanjutnya', note: 'Tambahkan jembatan kristal yang menghubungkan galeri ke menara waktu.' },
      { id: 'b2', title: 'Simfoni Gerhana', note: 'Kombinasikan tangga nada minor melodik untuk tema malam di Grand Hall.' }
    ],
    customFrames: [
      { id: 'f1', title: 'Delapan Sahabat di Bawah Langit OLU', char: 'All Characters', year: 'Tahun Penciptaan' },
      { id: 'f2', title: 'Gazebo Kidult & Teh Lavender', char: 'Nyanya ⭐', year: 'Momen Keemasan' },
      { id: 'f3', title: 'Kubah Bunga & Senyuman Lala', char: 'Lala ☀️', year: 'Pagi Hari' }
    ],
    collectedRelics: ['amethyst_crystal_core'],
    lastUpdated: new Date().toISOString()
  };
}

export function loadEclipseState(charId = 'lele') {
  if (!isAuthorAuthorized(charId)) {
    return null; // Access Denied
  }
  try {
    const loaded = getSynchronousState(
      OLU_STORE_HOUSE_STATES,
      ECLIPSE_STORAGE_KEY,
      () => getDefaultEclipseState()
    );
    return { ...getDefaultEclipseState(), ...loaded };
  } catch (err) {
    console.error('Failed to load The Eclipse state:', err);
    return getDefaultEclipseState();
  }
}

export function saveEclipseState(charId, state) {
  if (!isAuthorAuthorized(charId)) {
    return false; // Access Denied
  }
  try {
    state.lastUpdated = new Date().toISOString();
    setSynchronousState(
      OLU_STORE_HOUSE_STATES,
      ECLIPSE_STORAGE_KEY,
      state,
      { character: 'lele', universe: 'SHADOW' }
    );
    return true;
  } catch (err) {
    console.error('Failed to save The Eclipse state:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// 5. AUDIO SYNTHESIS ENGINE (GOTHIC CELESTIAL PIANO & CHIMES)
// -----------------------------------------------------------------------------
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playGothicPianoNote(freq = 440) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Fundamental oscillator (Warm triangle)
  const osc1 = ctx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(freq, now);

  // Sub-harmonic for deep grand piano body (Sine)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq / 2, now);

  // High overtone shimmer (Sine)
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(freq * 2, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

  osc1.connect(gain);
  osc2.connect(gain);
  osc3.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  osc1.stop(now + 2.3);
  osc2.stop(now + 2.3);
  osc3.stop(now + 2.3);
}

export function playCelestialBell(freq = 880) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.9);
}

export function playEclipseChordSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 523.25, 659.25, 880]; // A Minor Royal Celestial Chord
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playCelestialBell(freq);
    }, idx * 120);
  });
}
