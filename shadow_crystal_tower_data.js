/**
 * SHADOW — CRYSTAL TOWER LIFE SIMULATION: WORLD & CATALOG DATA
 *
 * Defines the 6 interconnected rooms of Lele's Crystal Tower:
 * - bedroom, living_room, kitchen, library, bathroom, balcony
 * Plus modular interactive objects, outfits, recipes, collectibles,
 * room decorations, time-of-day cycles, and weather configurations.
 */

export const TOWER_WORLD_WIDTH = 960;
export const TOWER_WORLD_HEIGHT = 600;
export const PLAYER_RADIUS = 18;
export const PLAYER_SPEED = 205; // px per second
export const DEFAULT_INTERACT_DISTANCE = 76;

export const TIME_CYCLES = [
  {
    id: 'evening',
    label: 'Evening',
    desc: 'Senja ungu keemasan menyelimuti menara',
    ambientOverlay: 'rgba(49, 24, 88, 0.24)',
    windowSkyTop: '#1e1348',
    windowSkyBottom: '#6d3b7d',
    moonOpacity: 0.65,
    starOpacity: 0.45,
    crystalGlow: 0.72
  },
  {
    id: 'night',
    label: 'Night',
    desc: 'Malam berbintang dengan cahaya bulan perak',
    ambientOverlay: 'rgba(9, 14, 42, 0.34)',
    windowSkyTop: '#050819',
    windowSkyBottom: '#1c2459',
    moonOpacity: 0.95,
    starOpacity: 0.88,
    crystalGlow: 0.9
  },
  {
    id: 'midnight',
    label: 'Midnight',
    desc: 'Tengah malam hening penuh kilau kristal',
    ambientOverlay: 'rgba(5, 7, 24, 0.44)',
    windowSkyTop: '#020410',
    windowSkyBottom: '#13133b',
    moonOpacity: 1,
    starOpacity: 1,
    crystalGlow: 1.05
  },
  {
    id: 'dawn',
    label: 'Dawn',
    desc: 'Fajar lembut lavender memeluk cakrawala',
    ambientOverlay: 'rgba(55, 42, 92, 0.16)',
    windowSkyTop: '#1b1b4b',
    windowSkyBottom: '#9b6b9e',
    moonOpacity: 0.4,
    starOpacity: 0.3,
    crystalGlow: 0.68
  }
];

export const WEATHER_MODES = [
  { id: 'clear', label: 'Clear Night', desc: 'Langit jernih bertabur bintang' },
  { id: 'rain', label: 'Rain', desc: 'Rintik hujan lembut di kaca jendela' },
  { id: 'mist', label: 'Mist', desc: 'Kabut perak tipis menyelimuti menara' },
  { id: 'snow', label: 'Snow', desc: 'Salju halus melayang di luar menara' }
];

export const LELE_OUTFITS = [
  {
    id: 'eclipse_cloak',
    name: 'Eclipse Guardian Cloak',
    desc: 'Jubah biru-tengah malam dengan pita lavender khas Lele.',
    primary: '#312e81',
    secondary: '#a78bfa',
    trim: '#e2e8f0',
    hairAccent: '#c4b5fd'
  },
  {
    id: 'lavender_pajamas',
    name: 'Moonlit Pajamas',
    desc: 'Piyama sutra lembut bermotif bulan sabit yang nyaman untuk tidur.',
    primary: '#6d28d9',
    secondary: '#ddd6fe',
    trim: '#fde68a',
    hairAccent: '#f5d0fe'
  },
  {
    id: 'silver_dress',
    name: 'Silver Starlight Dress',
    desc: 'Gaun perak keunguan untuk bersantai dan mengamati bintang.',
    primary: '#475569',
    secondary: '#c4b5fd',
    trim: '#f8fafc',
    hairAccent: '#e2e8f0'
  },
  {
    id: 'atelier_apron',
    name: 'Crystal Kitchen Apron',
    desc: 'Gaun kasual dengan celemek renda perak untuk menyeduh teh & memasak.',
    primary: '#3b0764',
    secondary: '#e9d5ff',
    trim: '#fcd34d',
    hairAccent: '#f9a8d4'
  }
];

export const ROOM_DECOR_ITEMS = [
  { id: 'crescent_crystal', name: 'Kristal Bulan Sabit', category: 'dekorasi', desc: 'Memancarkan pendaran perak lembut di kamar.', spot: { x: 590, y: 162 } },
  { id: 'amethyst_geode', name: 'Geode Ametis Berpendar', category: 'kristal', desc: 'Batu kristal ungu alami dari kedalaman gua bulan.', spot: { x: 245, y: 470 } },
  { id: 'snowdrop_vase', name: 'Vas Snowdrop Perak', category: 'dekorasi', desc: 'Bunga snowdrop segar dari ladang SHADOW.', spot: { x: 645, y: 472 } },
  { id: 'starlight_lantern', name: 'Lentera Kunang-kunang', category: 'dekorasi', desc: 'Menangkap cahaya kunang-kunang malam.', spot: { x: 185, y: 245 } }
];

export const KITCHEN_RECIPES = [
  {
    id: 'jasmine_moon_tea',
    name: 'Teh Melati Embun Bulan',
    category: 'minuman',
    type: 'brew',
    durationMs: 2600,
    ingredients: ['Daun Melati', 'Embun Bulan'],
    desc: 'Teh hangat menenangkan dengan aroma bunga melati malam.'
  },
  {
    id: 'nebula_hot_cocoa',
    name: 'Cokelat Panas Nebula',
    category: 'minuman',
    type: 'brew',
    durationMs: 2800,
    ingredients: ['Bubuk Cokelat Malam', 'Susu Lavender'],
    desc: 'Minuman cokelat manis berpusar krim lembut berwarna violet.'
  },
  {
    id: 'lavender_mooncake',
    name: 'Kue Bulan Lavender',
    category: 'makanan',
    type: 'cook',
    durationMs: 3200,
    ingredients: ['Tepung Bintang', 'Madu Hutan'],
    desc: 'Camilan kue bulan lembut bertabur kelopak lavender manis.'
  },
  {
    id: 'silver_berry_tart',
    name: 'Tart Beri Perak',
    category: 'makanan',
    type: 'cook',
    durationMs: 3400,
    ingredients: ['Buah Beri Perak', 'Tepung Bintang'],
    desc: 'Tart renyah dengan kilau beri segar yang manis.'
  },
  {
    id: 'starlight_soup',
    name: 'Sup Krim Hangat Kristal',
    category: 'makanan',
    type: 'cook',
    durationMs: 3600,
    ingredients: ['Susu Lavender', 'Jamur Kristal'],
    desc: 'Hidangan makan malam hangat untuk menemani malam dingin.'
  }
];

export const INITIAL_INVENTORY_ITEMS = [
  { id: 'jasmine_leaf', name: 'Daun Melati', category: 'bahan', count: 3, desc: 'Daun teh harum dari gazebo malam.' },
  { id: 'moon_dew', name: 'Embun Bulan', category: 'bahan', count: 3, desc: 'Air jernih berkilau dari kolam kristal.' },
  { id: 'star_flour', name: 'Tepung Bintang', category: 'bahan', count: 2, desc: 'Tepung halus untuk membuat kue.' },
  { id: 'lavender_milk', name: 'Susu Lavender', category: 'bahan', count: 2, desc: 'Susu hangat beraroma lavender.' },
  { id: 'cocoa_night', name: 'Bubuk Cokelat Malam', category: 'bahan', count: 2, desc: 'Cokelat pekat lembut.' },
  { id: 'forest_honey', name: 'Madu Hutan', category: 'bahan', count: 2, desc: 'Madu keemasan manis.' },
  { id: 'silver_berry', name: 'Buah Beri Perak', category: 'bahan', count: 2, desc: 'Beri bercahaya lembut.' },
  { id: 'crystal_shroom_ing', name: 'Jamur Kristal', category: 'bahan', count: 2, desc: 'Jamur gurih dari taman bayangan.' },
  { id: 'crescent_crystal_col', name: 'Fragmen Kristal Bulan', category: 'kristal', count: 1, desc: 'Pecahan kristal murni Menara SHADOW.' },
  { id: 'tower_chronicle_book', name: 'Kronik Menara Kristal', category: 'buku', count: 1, desc: 'Catatan kuno penjaga gerhana.' }
];

export const BUILTIN_TOWER_BOOKS = [
  {
    id: 'book-crystal-tower-lore',
    title: 'Kronik Menara Kristal & Bulan Sabit',
    author: 'Lele ☾',
    category: 'Lore Fantasi',
    pages: [
      'Menara Kristal berdiri tenang di pusat Crystal Moon Sanctuary. Setiap dinding kaca ametisnya menyerap cahaya bulan dan menyimpannya sebagai kehangatan untuk penghuni di dalamnya.',
      'Saat malam tiba, kristal-kristal kecil ikut bernapas perlahan bersama angin lembah. Di lantai atas, jendela kamar menghadap langsung ke danau dan langit berbintang.',
      'Di sinilah tempat terbaik untuk meletakkan semua lelah, menyeduh secangkir teh melati hangat, dan merangkai kisah baru bersama teman-teman semesta.'
    ]
  },
  {
    id: 'book-tea-alchemy',
    title: 'Catatan Seduhan Malam & Bunga Snowdrop',
    author: 'Catatan Rahasia Lele',
    category: 'Resep & Ketentraman',
    pages: [
      'Teh melati terbaik diseduh tepat saat kabut turun menyentuh pagar balkon. Tambahkan satu tetes embun bulan agar aromanya bertahan lebih lama.',
      'Bila hujan turun cukup deras, secangkir cokelat panas nebula di depan perapian kristal mampu mengembalikan kehangatan dalam sekejap.'
    ]
  },
  {
    id: 'book-constellation-atlas',
    title: 'Atlas Rasi Bintang Sanctuary',
    author: 'Observatorium Kristal',
    category: 'Astronomi',
    pages: [
      'Rasi Crescent Veil tampak paling jelas tepat tengah malam saat langit cerah. Cahaya keperakannya selalu mengingatkan pada ikatan persahabatan KIDULT, TO YOU, dan SHADOW.',
      'Melalui teleskop di balkon, kilau bintang terkadang menjatuhkan serpihan cahaya kristal yang dapat dikoleksi.'
    ]
  }
];

/**
 * Room layouts (960x600 coordinate space).
 * Every room defines:
 * - bounds: walkable floor rectangle { minX, maxX, minY, maxY }
 * - walls: visual wall segments & exterior backdrop zone
 * - colliders: solid furniture rectangles { id, x, y, w, h }
 * - portals: doorway triggers { id, targetRoom, x, y, w, h, label, spawn: { x, y, facing } }
 * - objects: modular interactive objects { id, name, actionLabel, kind, x, y, w, h, interactX, interactY, radius, durationMs, pose }
 */
export const TOWER_ROOMS = {
  bedroom: {
    id: 'bedroom',
    name: 'Kamar Pribadi Lele',
    subtitle: 'Bedroom · Lantai Atas Menara Kristal',
    floorTheme: 'lavender_wood',
    bounds: { minX: 64, maxX: 896, minY: 128, maxY: 536 },
    defaultSpawn: { x: 470, y: 340, facing: 'down' },
    portals: [
      {
        id: 'portal_bed_to_balcony',
        targetRoom: 'balcony',
        label: 'Ke Balkon Bulan',
        x: 245, y: 112, w: 92, h: 42,
        spawn: { x: 480, y: 470, facing: 'up' }
      },
      {
        id: 'portal_bed_to_bathroom',
        targetRoom: 'bathroom',
        label: 'Ke Kamar Mandi',
        x: 48, y: 420, w: 36, h: 86,
        spawn: { x: 805, y: 330, facing: 'left' }
      },
      {
        id: 'portal_bed_to_living',
        targetRoom: 'living_room',
        label: 'Ke Ruang Keluarga',
        x: 425, y: 516, w: 110, h: 38,
        spawn: { x: 480, y: 175, facing: 'down' }
      }
    ],
    colliders: [
      { id: 'col_wardrobe', x: 96, y: 118, w: 118, h: 72 },
      { id: 'col_decor_pedestal', x: 556, y: 122, w: 68, h: 52 },
      { id: 'col_bed', x: 678, y: 132, w: 168, h: 126 },
      { id: 'col_bed_bookshelf', x: 70, y: 242, w: 72, h: 130 },
      { id: 'col_study_desk', x: 718, y: 342, w: 136, h: 88 }
    ],
    objects: [
      {
        id: 'bed',
        name: 'Tempat Tidur Kristal',
        actionLabel: 'Tidur / Istirahat',
        kind: 'sleep',
        x: 678, y: 132, w: 168, h: 126,
        interactX: 760, interactY: 225,
        spotX: 760, spotY: 190,
        radius: 110,
        durationMs: 3600,
        pose: 'sleep'
      },
      {
        id: 'wardrobe',
        name: 'Lemari Pakaian Bulan',
        actionLabel: 'Ganti Pakaian',
        kind: 'wardrobe',
        x: 96, y: 118, w: 118, h: 72,
        interactX: 155, interactY: 210,
        spotX: 155, spotY: 212,
        radius: 82,
        durationMs: 0,
        pose: 'dress'
      },
      {
        id: 'bedroom_window',
        name: 'Jendela Bulan Besar',
        actionLabel: 'Lihat Pemandangan Malam',
        kind: 'window',
        x: 378, y: 92, w: 154, h: 48,
        interactX: 455, interactY: 156,
        spotX: 455, spotY: 158,
        radius: 88,
        durationMs: 2200,
        pose: 'idle'
      },
      {
        id: 'bedroom_bookshelf',
        name: 'Rak Buku Pribadi',
        actionLabel: 'Baca Novel',
        kind: 'library_browse',
        x: 70, y: 242, w: 72, h: 130,
        interactX: 162, interactY: 308,
        spotX: 164, spotY: 308,
        radius: 84,
        durationMs: 0,
        pose: 'read'
      },
      {
        id: 'study_desk',
        name: 'Meja Belajar & Jurnal',
        actionLabel: 'Duduk & Tulis Jurnal',
        kind: 'journal',
        x: 718, y: 342, w: 136, h: 88,
        interactX: 775, interactY: 446,
        spotX: 775, spotY: 438,
        radius: 88,
        durationMs: 0,
        pose: 'write'
      },
      {
        id: 'decor_pedestal',
        name: 'Sudut Dekorasi Kamar',
        actionLabel: 'Ubah Dekorasi Kamar',
        kind: 'decor',
        x: 556, y: 122, w: 68, h: 52,
        interactX: 590, interactY: 192,
        spotX: 590, spotY: 192,
        radius: 78,
        durationMs: 0,
        pose: 'idle'
      },
      {
        id: 'tidy_rug',
        name: 'Area Karpet Kamar',
        actionLabel: 'Rapikan Kamar',
        kind: 'clean',
        x: 345, y: 345, w: 130, h: 78,
        interactX: 410, interactY: 384,
        spotX: 410, spotY: 384,
        radius: 72,
        durationMs: 2400,
        pose: 'clean'
      }
    ]
  },

  living_room: {
    id: 'living_room',
    name: 'Ruang Keluarga Menara',
    subtitle: 'Living Room · Hangat oleh Perapian Kristal',
    floorTheme: 'indigo_marble',
    bounds: { minX: 64, maxX: 896, minY: 128, maxY: 536 },
    defaultSpawn: { x: 480, y: 215, facing: 'down' },
    portals: [
      {
        id: 'portal_living_to_bedroom',
        targetRoom: 'bedroom',
        label: 'Ke Kamar Pribadi',
        x: 425, y: 112, w: 110, h: 42,
        spawn: { x: 480, y: 472, facing: 'up' }
      },
      {
        id: 'portal_living_to_kitchen',
        targetRoom: 'kitchen',
        label: 'Ke Dapur Kristal',
        x: 874, y: 280, w: 38, h: 100,
        spawn: { x: 118, y: 330, facing: 'right' }
      },
      {
        id: 'portal_living_to_library',
        targetRoom: 'library',
        label: 'Ke Perpustakaan',
        x: 425, y: 516, w: 110, h: 38,
        spawn: { x: 480, y: 175, facing: 'down' }
      }
    ],
    colliders: [
      { id: 'col_fireplace', x: 638, y: 116, w: 148, h: 76 },
      { id: 'col_sofa', x: 196, y: 256, w: 166, h: 76 },
      { id: 'col_tea_table', x: 414, y: 278, w: 128, h: 68 },
      { id: 'col_collection_shelf', x: 74, y: 392, w: 86, h: 112 },
      { id: 'col_gramophone', x: 720, y: 400, w: 74, h: 68 }
    ],
    objects: [
      {
        id: 'living_window',
        name: 'Jendela Besar Sanctuary',
        actionLabel: 'Lihat Pemandangan Malam',
        kind: 'window',
        x: 150, y: 92, w: 190, h: 48,
        interactX: 245, interactY: 156,
        spotX: 245, spotY: 156,
        radius: 88,
        durationMs: 2200,
        pose: 'idle'
      },
      {
        id: 'crystal_fireplace',
        name: 'Perapian Kristal Hangat',
        actionLabel: 'Hangatkan Diri',
        kind: 'fireplace',
        x: 638, y: 116, w: 148, h: 76,
        interactX: 712, interactY: 222,
        spotX: 712, spotY: 222,
        radius: 90,
        durationMs: 2800,
        pose: 'sit'
      },
      {
        id: 'sofa',
        name: 'Sofa Beludru Malam',
        actionLabel: 'Duduk & Bersantai',
        kind: 'relax_sofa',
        x: 196, y: 256, w: 166, h: 76,
        interactX: 280, interactY: 295,
        spotX: 280, spotY: 290,
        radius: 98,
        durationMs: 3200,
        pose: 'sit'
      },
      {
        id: 'tea_table',
        name: 'Meja Teko & Camilan',
        actionLabel: 'Minum Teh / Makan Camilan',
        kind: 'tea_snack',
        x: 414, y: 278, w: 128, h: 68,
        interactX: 478, interactY: 368,
        spotX: 478, spotY: 368,
        radius: 86,
        durationMs: 2400,
        pose: 'sit'
      },
      {
        id: 'collection_shelf',
        name: 'Rak Koleksi Kenangan',
        actionLabel: 'Lihat Koleksi & Inventory',
        kind: 'inventory',
        x: 74, y: 392, w: 86, h: 112,
        interactX: 184, interactY: 446,
        spotX: 184, spotY: 446,
        radius: 84,
        durationMs: 0,
        pose: 'idle'
      },
      {
        id: 'music_gramophone',
        name: 'Pemutar Musik Kristal',
        actionLabel: 'Putar / Jeda Musik',
        kind: 'music_toggle',
        x: 720, y: 400, w: 74, h: 68,
        interactX: 702, interactY: 438,
        spotX: 702, spotY: 438,
        radius: 84,
        durationMs: 1400,
        pose: 'idle'
      }
    ]
  },

  kitchen: {
    id: 'kitchen',
    name: 'Dapur Kristal',
    subtitle: 'Crystal Kitchen · Seduhan Teh & Hidangan Hangat',
    floorTheme: 'kitchen_tile',
    bounds: { minX: 64, maxX: 896, minY: 128, maxY: 536 },
    defaultSpawn: { x: 145, y: 330, facing: 'right' },
    portals: [
      {
        id: 'portal_kitchen_to_living',
        targetRoom: 'living_room',
        label: 'Ke Ruang Keluarga',
        x: 48, y: 280, w: 38, h: 100,
        spawn: { x: 820, y: 330, facing: 'left' }
      }
    ],
    colliders: [
      { id: 'col_pantry', x: 130, y: 120, w: 124, h: 72 },
      { id: 'col_fridge', x: 284, y: 118, w: 94, h: 82 },
      { id: 'col_stove', x: 424, y: 120, w: 144, h: 74 },
      { id: 'col_kitchen_sink', x: 604, y: 120, w: 140, h: 74 },
      { id: 'col_utensil_rack', x: 778, y: 132, w: 88, h: 86 },
      { id: 'col_cooking_counter', x: 396, y: 310, w: 208, h: 78 }
    ],
    objects: [
      {
        id: 'pantry_cupboard',
        name: 'Lemari Bahan Makanan',
        actionLabel: 'Ambil Bahan Kering',
        kind: 'pantry',
        x: 130, y: 120, w: 124, h: 72,
        interactX: 192, interactY: 215,
        spotX: 192, spotY: 215,
        radius: 84,
        durationMs: 1400,
        pose: 'idle'
      },
      {
        id: 'fridge',
        name: 'Kulkas Embun Kristal',
        actionLabel: 'Pilih Bahan Segar',
        kind: 'fridge',
        x: 284, y: 118, w: 94, h: 82,
        interactX: 331, interactY: 222,
        spotX: 331, spotY: 222,
        radius: 84,
        durationMs: 1400,
        pose: 'idle'
      },
      {
        id: 'stove',
        name: 'Kompor Kristal & Ketel',
        actionLabel: 'Memasak / Membuat Teh',
        kind: 'cook_menu',
        x: 424, y: 120, w: 144, h: 74,
        interactX: 496, interactY: 216,
        spotX: 496, spotY: 216,
        radius: 88,
        durationMs: 0,
        pose: 'cook'
      },
      {
        id: 'kitchen_sink',
        name: 'Wastafel Air Jernih',
        actionLabel: 'Cuci Bahan & Gelas',
        kind: 'wash_dishes',
        x: 604, y: 120, w: 140, h: 74,
        interactX: 674, interactY: 216,
        spotX: 674, spotY: 216,
        radius: 86,
        durationMs: 2200,
        pose: 'clean'
      },
      {
        id: 'utensil_rack',
        name: 'Rak Peralatan Dapur',
        actionLabel: 'Lihat Resep & Peralatan',
        kind: 'cook_menu',
        x: 778, y: 132, w: 88, h: 86,
        interactX: 790, interactY: 242,
        spotX: 790, spotY: 242,
        radius: 84,
        durationMs: 0,
        pose: 'idle'
      },
      {
        id: 'cooking_counter',
        name: 'Meja Memasak & Camilan',
        actionLabel: 'Siapkan Camilan / Cicipi',
        kind: 'prep_snack',
        x: 396, y: 310, w: 208, h: 78,
        interactX: 500, interactY: 412,
        spotX: 500, spotY: 412,
        radius: 90,
        durationMs: 2400,
        pose: 'cook'
      }
    ]
  },

  library: {
    id: 'library',
    name: 'Perpustakaan Pribadi',
    subtitle: 'Private Library · Rak Novel & Sudut Baca Jendela',
    floorTheme: 'library_mahogany',
    bounds: { minX: 64, maxX: 896, minY: 128, maxY: 536 },
    defaultSpawn: { x: 480, y: 205, facing: 'down' },
    portals: [
      {
        id: 'portal_library_to_living',
        targetRoom: 'living_room',
        label: 'Ke Ruang Keluarga',
        x: 425, y: 112, w: 110, h: 42,
        spawn: { x: 480, y: 472, facing: 'up' }
      }
    ],
    colliders: [
      { id: 'col_grand_left', x: 84, y: 122, w: 220, h: 78 },
      { id: 'col_grand_right', x: 656, y: 122, w: 220, h: 78 },
      { id: 'col_reading_chair', x: 146, y: 325, w: 110, h: 92 },
      { id: 'col_archive_lectern', x: 615, y: 325, w: 126, h: 86 }
    ],
    objects: [
      {
        id: 'grand_shelves_left',
        name: 'Rak Novel & Sastra',
        actionLabel: 'Jelajahi Rak Buku',
        kind: 'library_browse',
        x: 84, y: 122, w: 220, h: 78,
        interactX: 194, interactY: 224,
        spotX: 194, spotY: 224,
        radius: 95,
        durationMs: 0,
        pose: 'read'
      },
      {
        id: 'grand_shelves_right',
        name: 'Rak Koleksi Malam',
        actionLabel: 'Pilih Buku & Favorit',
        kind: 'library_browse',
        x: 656, y: 122, w: 220, h: 78,
        interactX: 766, interactY: 224,
        spotX: 766, spotY: 224,
        radius: 95,
        durationMs: 0,
        pose: 'read'
      },
      {
        id: 'reading_nook_chair',
        name: 'Kursi Baca Dekat Jendela',
        actionLabel: 'Membaca di Kursi Jendela',
        kind: 'library_read_sit',
        x: 146, y: 325, w: 110, h: 92,
        interactX: 201, interactY: 372,
        spotX: 201, spotY: 372,
        radius: 88,
        durationMs: 3000,
        pose: 'read'
      },
      {
        id: 'archive_lectern',
        name: 'Meja Riwayat Bacaan',
        actionLabel: 'Lihat Riwayat & Buku Favorit',
        kind: 'library_history',
        x: 615, y: 325, w: 126, h: 86,
        interactX: 678, interactY: 432,
        spotX: 678, spotY: 432,
        radius: 88,
        durationMs: 0,
        pose: 'idle'
      }
    ]
  },

  bathroom: {
    id: 'bathroom',
    name: 'Kamar Mandi Kristal',
    subtitle: 'Crystal Bathroom · Air Hangat & Kelopak Snowdrop',
    floorTheme: 'crystal_bath',
    bounds: { minX: 64, maxX: 896, minY: 128, maxY: 536 },
    defaultSpawn: { x: 780, y: 330, facing: 'left' },
    portals: [
      {
        id: 'portal_bath_to_bedroom',
        targetRoom: 'bedroom',
        label: 'Ke Kamar Pribadi',
        x: 874, y: 280, w: 38, h: 100,
        spawn: { x: 118, y: 465, facing: 'right' }
      }
    ],
    colliders: [
      { id: 'col_bathtub', x: 116, y: 162, w: 184, h: 122 },
      { id: 'col_bath_sink', x: 410, y: 118, w: 150, h: 74 },
      { id: 'col_bath_shelf', x: 660, y: 126, w: 126, h: 72 }
    ],
    objects: [
      {
        id: 'crystal_bathtub',
        name: 'Bathtub Kristal Hangat',
        actionLabel: 'Mandi & Relaksasi',
        kind: 'bathe',
        x: 116, y: 162, w: 184, h: 122,
        interactX: 208, interactY: 224,
        spotX: 208, spotY: 215,
        radius: 104,
        durationMs: 3600,
        pose: 'bathe'
      },
      {
        id: 'bath_sink',
        name: 'Wastafel & Cermin Bulan',
        actionLabel: 'Cuci Muka & Bercermin',
        kind: 'freshen_up',
        x: 410, y: 118, w: 150, h: 74,
        interactX: 485, interactY: 214,
        spotX: 485, spotY: 214,
        radius: 86,
        durationMs: 2200,
        pose: 'idle'
      },
      {
        id: 'bath_shelf',
        name: 'Rak Perlengkapan Mandi',
        actionLabel: 'Tabur Garam Snowdrop',
        kind: 'bath_essence',
        x: 660, y: 126, w: 126, h: 72,
        interactX: 723, interactY: 218,
        spotX: 723, spotY: 218,
        radius: 84,
        durationMs: 1800,
        pose: 'idle'
      }
    ]
  },

  balcony: {
    id: 'balcony',
    name: 'Balkon Bulan Kristal',
    subtitle: 'Crystal Balcony · Langit Berbintang & Kristal Melayang',
    floorTheme: 'balcony_stone',
    bounds: { minX: 90, maxX: 870, minY: 168, maxY: 536 },
    defaultSpawn: { x: 480, y: 460, facing: 'up' },
    portals: [
      {
        id: 'portal_balcony_to_bedroom',
        targetRoom: 'bedroom',
        label: 'Masuk ke Kamar',
        x: 425, y: 516, w: 110, h: 38,
        spawn: { x: 290, y: 184, facing: 'down' }
      }
    ],
    colliders: [
      { id: 'col_balcony_chair', x: 186, y: 242, w: 108, h: 86 },
      { id: 'col_crystal_orb', x: 444, y: 236, w: 72, h: 68 },
      { id: 'col_telescope', x: 642, y: 190, w: 96, h: 74 }
    ],
    objects: [
      {
        id: 'balcony_telescope',
        name: 'Teleskop Langit Malam',
        actionLabel: 'Amati Bintang & Bulan',
        kind: 'stargaze',
        x: 642, y: 190, w: 96, h: 74,
        interactX: 690, interactY: 285,
        spotX: 690, spotY: 282,
        radius: 88,
        durationMs: 3200,
        pose: 'stargaze'
      },
      {
        id: 'lounge_chair',
        name: 'Kursi Santai Balkon',
        actionLabel: 'Nikmati Suasana Malam',
        kind: 'balcony_chill',
        x: 186, y: 242, w: 108, h: 86,
        interactX: 240, interactY: 286,
        spotX: 240, spotY: 286,
        radius: 88,
        durationMs: 3000,
        pose: 'sit'
      },
      {
        id: 'floating_crystal_orb',
        name: 'Kristal Melayang Sanctuary',
        actionLabel: 'Selaraskan & Kumpulkan Serbuk Kristal',
        kind: 'harvest_crystal',
        x: 444, y: 236, w: 72, h: 68,
        interactX: 480, interactY: 324,
        spotX: 480, spotY: 324,
        radius: 84,
        durationMs: 2400,
        pose: 'idle'
      }
    ]
  }
};

