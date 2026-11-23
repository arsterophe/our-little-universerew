/**
 * OUR LITTLE UNIVERSE — UNIVERSES VIEW CONTROLLER
 * 
 * Manages the Three Worlds interactive floating islands,
 * universe modal dialogs, pill navbar interactions, and navigation.
 */

import {
  loadUniverseState,
  scheduleUniverseSave,
  addDecoration,
  updateDecorationPosition,
  removeDecoration,
  updateElementState,
  resetDecorationsToDefault,
  onUniverseStateChange,
  onUniverseStatusChange,
  UNIVERSE_DECORATION_CATALOG,
  normalizeCharacterKey,
  flushPendingUniverseSave,
  cleanupUniverseStateOnLogout
} from './universe_state.js';
import { initShadowKingdomFx } from './shadow_kingdom_fx.js';
import { initShadowBehindView, stopShadowBehindVideo, closeBehindShadow } from './shadow_behind_view.js';
import {
  initShadowMoodView,
  SHADOW_MOODS,
  SHADOW_DUALITY_SIDES,
  LELE_UID
} from './shadow_mood_view.js';
export { SHADOW_MOODS, SHADOW_DUALITY_SIDES };
import { initKidultBehindView, closeBehindWitch, stopBehindWitchVideo } from './kidult_behind_view.js';
import { initToYouBehindView, closeBehindFairy, stopBehindFairyVideo } from './toyou_behind_view.js';
import { initEverdreamHouseView } from './everdream_house_view.js';
import { initKidultHouseView } from './kidult_house_view.js';
import { initGreenhouseView } from './greenhouse_view.js';
import { initKidultGazeboView } from './kidult_gazebo_view.js';
import { initBloomCottageView } from './bloom_cottage_view.js';
import { initFairyAtelierView } from './fairy_atelier_view.js';
import { initToyouGazeboView } from './toyou_gazebo_view.js';
import { initEclipseView } from './eclipse_view.js';
import { isAuthorAuthorized } from './eclipse_state.js';
import { openSongsWeShareModal } from './songs_we_share.js';
import { initPinwheelWorld } from './pinwheel_view.js';
import { initPinwheelHavenView } from './pinwheel_haven_view.js';
import { initYawnWorld, YAWN_MOODS } from './yawn_view.js';
export { YAWN_MOODS };
import { initYawnGazeboView } from './yawn_gazebo_view.js';
import { initYawnCinemaView } from './yawn_cinema_view.js';
import { initAzurePalaceView } from './azure_palace_view.js';
import { initAshWorld } from './ash_view.js';
import { initDragonDenView } from './dragon_den_view.js';
import { initUsAgainWorld } from './usagain_view.js';
import { initSilentLotusView } from './silent_lotus_view.js';
import { initHotWorld } from './hot_view.js';
import { initMoonpetalManorView } from './moonpetal_manor_view.js';
import { dbSubscribeLetters, dbFetchLetters } from './firebase.js';

// Universe Definitions matching the Reference Mockup and PRD
export const UNIVERSE_DATA = {
  kidult: {
    id: 'kidult',
    charKey: 'nyanya',
    charName: 'Nyanya',
    charRole: 'The Moonlit Shadow Witch',
    name: 'KIDULT',
    owner: "NYANYA'S UNIVERSE",
    ownerName: 'Alenda',
    symbol: '★',
    avatar: '/assets/avatar_nyanya_hd.png',
    characterArt: '/assets/card_nyanya_hd_2x.png',
    islandArt: '/assets/planet_kidult_sphere.jpg',
    quote: 'Small joys make a big universe.',
    palette: 'Lavender, Soft Blue, & Cosmic Purple',
    description: 'Pulau fantasi hangat penuh imajinasi dan kenyamanan di bawah cahaya bintang, dengan desa pastel, roda observasi (Ferris wheel) yang berputar perlahan di antara awan, dan lentera keemasan.',
    accentColor: '#c084fc'
  },
  to_you: {
    id: 'to_you',
    charKey: 'lala',
    charName: 'Lala',
    charRole: 'The Everglow Fairy',
    name: 'TO YOU',
    owner: "LALA'S UNIVERSE",
    ownerName: 'Bella',
    symbol: '☼',
    avatar: '/assets/avatar_lala_hd.png',
    characterArt: '/assets/card_lala_hd_2x.png',
    islandArt: '/assets/planet_toyou_sphere.jpg',
    quote: 'A little closer, for a brighter tomorrow.',
    palette: 'Peach, Warm Pink, & Soft Gold',
    description: 'Pulau fantasi cerah dengan arsitektur villa dongeng, menara mercusuar tepi laut, air terjun biru langit yang mengalir lembut ke angkasa, dan awan-awan pastel bertabur cahaya matahari lembut.',
    accentColor: '#f472b6'
  },
  shadow: {
    id: 'shadow',
    charKey: 'lele',
    charName: 'Lele',
    charRole: 'The Eclipse Guardian',
    name: 'SHADOW',
    owner: "LELE'S UNIVERSE",
    ownerName: 'Vanya',
    symbol: '☾',
    avatar: '/assets/avatar_lele_hd.png',
    characterArt: '/assets/card_lele_hd_2x.png',
    islandArt: '/assets/planet_shadow_sphere.jpg',
    quote: 'Same sky, different shadows.',
    palette: 'Dark Indigo, Deep Violet, & Cosmic Blue-Purple',
    description: 'Pulau fantasi gothic elegan dengan kastel gelap bertingkat, menara observatorium astronomi, layar proyeksi terbuka di bawah langit malam, pepohonan misterius berembun violet, dan planet bercincin di latar belakang.',
    accentColor: '#818cf8'
  },
  pinwheel: {
    id: 'pinwheel',
    charKey: 'abil',
    charName: 'Syma',
    charRole: 'PINWHEEL ☁️',
    name: 'PINWHEEL',
    owner: "SYMA'S UNIVERSE",
    ownerName: 'Syma',
    symbol: '☁️',
    avatar: '/assets/avatar_abil_hd.jpg',
    characterArt: '/assets/card_abil_hd.jpg',
    islandArt: '/assets/island_pinwheel_floating.jpg',
    quote: 'Quiet winds, drifting clouds.',
    palette: 'Moonlight Silver, Sky Mist, & Lavender Blue',
    description: "Universe PINWHEEL ☁️ milik Syma. Dunia fantasi bernuansa malam Jepang berhias istana megah, observatorium kubah bulan, studio seni, paviliun gazebo tepi danau teratai, dan taman kucing berkilau.",
    accentColor: '#93c5fd'
  },
  yawn: {
    id: 'yawn',
    charKey: 'akhira',
    charName: 'Akhira',
    charRole: 'YAWN ⚡',
    name: 'YAWN',
    owner: "AKHIRA'S UNIVERSE",
    ownerName: 'Akhira',
    symbol: '⚡',
    avatar: '/assets/avatar_akhira_hd.jpg',
    characterArt: '/assets/card_akhira_hd.jpg',
    islandArt: '/assets/island_yawn_floating.jpg',
    quote: 'Soft tides, dreaming pearls.',
    palette: 'Abyssal Lavender, Pearl Mist, & Starlight Violet',
    description: 'Universe YAWN ⚡ milik Akhira sedang disiapkan secara khusus. Menunggu desain dan konsep dunia lengkap dari pemiliknya.',
    accentColor: '#c084fc'
  },
  us_again: {
    id: 'us_again',
    charKey: 'ela',
    charName: 'Ela',
    charRole: 'US AGAIN 🌸',
    name: 'US AGAIN',
    owner: "ELA'S UNIVERSE",
    ownerName: 'Ela',
    symbol: '🌸',
    avatar: '/assets/avatar_ela_hd.jpg',
    characterArt: '/assets/card_ela_hd.jpg',
    islandArt: '/assets/island_usagain_floating.jpg',
    quote: 'In the silence, the soul blooms.',
    palette: 'Midnight Violet, Lavender, & Rose Gold',
    description: 'THE SILENT LOTUS — A Sanctuary of Stillness. Suaka damai bernuansa Buddhis modern & fantasi Jepang di bawah sinar rembulan ungu, dengan kolam teratai bercahaya, gazebo meditasi, taman mawar, perpustakaan, bioskop pribadi, dan observatorium bintang.',
    accentColor: '#f472b6'
  },
  ash: {
    id: 'ash',
    charKey: 'ruben',
    charName: 'Ruben',
    charRole: 'ASH ❄️',
    name: 'ASH',
    owner: "RUBEN'S UNIVERSE",
    ownerName: 'Ruben',
    symbol: '❄️',
    avatar: '/assets/avatar_ruben_hd.jpg',
    characterArt: '/assets/card_ruben_hd.jpg',
    islandArt: '/assets/island_ash_floating.jpg',
    quote: 'A thousand worlds, one dragon.',
    palette: 'Midnight Purple, Royal Violet, & Pearl Silver',
    description: "The Dragon's Den — Gothic floating castle di bawah rembulan perak raksasa dengan naga penjaga megah, laboratorium teknik sipil, observatorium astronomi, taman zen, dan outdoor gaming battlestation.",
    accentColor: '#c084fc'
  },
  hot: {
    id: 'hot',
    charKey: 'royan',
    charName: 'Royan',
    charRole: 'HOT 🎆',
    name: 'HOT',
    owner: "ROYAN'S UNIVERSE",
    ownerName: 'Royan',
    symbol: '🎆',
    avatar: '/assets/avatar_royan_hd.jpg',
    characterArt: '/assets/card_royan_hd.jpg',
    islandArt: '/assets/planet_hot_sphere.jpg',
    quote: 'Sparks of twilight, eternal embers.',
    palette: 'Mystic Violet, Starlight Purple, & Fireworks Lavender',
    description: "THE ENCHANTED ELVEN SANCTUARY — Suaka peri hutan ajaib di bawah rembulan ungu bercincin kosmik, dengan kediaman kayu elven wisteria, kubah observatorium langit, air terjun kristal kembar, paviliun teh gazebo, taman mistis, dan terrarium Kip sang gecko kesayangan.",
    accentColor: '#c084fc'
  }
};

// Interactive 2D Locations inside KIDULT World
export const KIDULT_LOCATIONS = {
  rumah: {
    id: 'rumah',
    icon: '🏡',
    tag: 'LOKASI UTAMA · THE EVERDREAM HOUSE · KIDULT DREAM HOUSE',
    title: 'The Everdream House · KIDULT DREAM HOUSE',
    subtitle: 'Where Childhood Dreams Never Fade · Cozy Dreamy Childhood Home',
    description: 'Rumah dongeng dua lantai bergaya Victorian Fantasy dengan atap tinggi, jendela melengkung berpendar hangat, dan perapian nyaman di bawah langit golden twilight. Tempat mimpi masa kecil tetap abadi, dipenuhi kehangatan perapian, ruang atelier, dan peti kenangan rahasia.',
    highlight: '✨ 5 Ruangan Dongeng · Perapian Hangat · Peti Kenangan Rahasia Nyanya',
    actionLabel: '🚪 Masuk ke The Everdream House',
    actionType: 'everdream_house',
    toastMsg: '🏡 Selamat datang di The Everdream House — Where Childhood Dreams Never Fade ⭐'
  },
  rumah_kaca: {
    id: 'rumah_kaca',
    icon: '🌿',
    tag: 'TAMAN BOTANI · THE ENCHANTED GREENHOUSE',
    title: 'The Enchanted Greenhouse',
    subtitle: 'Starlight Conservatory & Interactive Farming Simulator',
    description: 'Rumah kaca besar berkubah kaca transparan tempat bertualang dalam simulasi berkebun interaktif. Tanam benih sayuran, bunga pastel, herba aromatik, dan buah-buahan, sirami tanaman, beri pupuk ajaib, dan panen hasilnya ke lumbung!',
    highlight: '✨ 28 Spesies Tanaman · 20 Petak Tanah · Toko Benih & Lumbung Panen Aktif',
    actionLabel: '🌿 Masuk ke Enchanted Greenhouse',
    actionType: 'greenhouse',
    toastMsg: '🌿 Memasuki The Enchanted Greenhouse — Starlight Conservatory & Farming Simulator ✨'
  },
  sungai_senja: {
    id: 'sungai_senja',
    icon: '🌊',
    tag: 'ALAM PULAU · KIDULT',
    title: 'Sungai Senja',
    subtitle: 'Aliran Cahaya Peach, Lavender, dan Emas Lembut',
    description: 'Sungai tenang yang membelah pulau KIDULT dan memantulkan warna langit senja—peach, dusty pink, lavender, hingga emas lembut—lengkap dengan perahu kayu kecil di tepiannya.',
    highlight: '⛵ Pantulan senja berkilau · Air terjun kosmik mengalir tenang',
    actionLabel: 'Hanyutkan Lentera Harapan ✦',
    actionType: 'toast',
    toastMsg: '🌊 Lentera harapanmu mengalir lembut di atas Sungai Senja yang berkilau ✨'
  },
  gazebo: {
    id: 'gazebo',
    icon: '🏛',
    tag: 'SANCTUARY · MEMORY GARDEN GAZEBO',
    title: 'Gazebo Nyanya — Memory Garden',
    subtitle: 'The Starlight Pavilion of Sweet Memories & Warm Tea',
    description: 'Gazebo rotunda anggun berhias bunga wisteria ungu di tepi Sungai Senja. Tempat ternyaman untuk bersantai di sofa beludru lilac bersama anak anjing lucu, menyeduh teh hangat & camilan manis, menyalakan lentera magis, memutar musik menenangkan, dan menulis kenangan indah di buku catatan hati.',
    highlight: '☕ Teh Bunga Hangat · Lentera Magis · Kotak Kenangan Kecil · Melodi Dongeng',
    actionLabel: '🏛 Masuk ke Memory Garden Gazebo',
    actionType: 'kidult_gazebo',
    toastMsg: '🏛 Memasuki Gazebo Nyanya — Memory Garden Pavilion ✨'
  },
  teleskop: {
    id: 'teleskop',
    icon: '🔭',
    tag: 'OBSERVATORIUM · KIDULT',
    title: 'Area Teleskop Bintang (Star Messages)',
    subtitle: 'Teras Pengamatan Bintang & Pesan Kosmik',
    description: 'Teras batu melingkar di sisi barat pulau dengan teleskop bintang menghadap langit galaksi. Digunakan untuk menemukan bintang sahabat dan membaca serta mengirim pesan rahasia yang melintasi angkasa antar tiga universe.',
    highlight: '🔭 3 Bintang bersinar terang malam ini: "Small joys make a big universe."',
    actionLabel: 'Buka Star Messages 🔭✨',
    actionType: 'star_messages',
    toastMsg: '★ Membuka teleskop ajaib Star Messages KIDULT... 🔭✨'
  },
  kotak_pos: {
    id: 'kotak_pos',
    icon: '✉',
    tag: 'LITTLE POST OFFICE · KIDULT',
    title: 'Kotak Pos',
    subtitle: 'Kotak Surat Sahabat & Burung Hantu Pengantar',
    description: 'Kotak pos merah muda berornamen bintang di tepi jalan setapak yang dijaga oleh burung hantu putih. Tempat mengirim dan membaca surat hangat dari sahabat.',
    highlight: '💌 1 Surat baru menunggu dari sahabat di Little Post Office',
    actionLabel: 'Buka Kotak Surat Sahabat ✉',
    actionType: 'kotak_pos',
    toastMsg: '✉ Membuka Kotak Pos KIDULT... ✉✨'
  }
};

// Minimalist Mood Picker Definitions & Curated Soundtrack Recommendations
export const KIDULT_MOODS = {
  bahagia: {
    id: 'bahagia',
    label: 'Bahagia',
    icon: '😊',
    songTitle: '♫ Sweet Sunshine Melody ♫',
    songDesc: 'Melodi riang nan hangat penuh tawa sahabat (KIDULT)'
  },
  bersemangat: {
    id: 'bersemangat',
    label: 'Bersemangat',
    icon: '🥰',
    songTitle: '♫ Sparkling Galaxy Pop ♫',
    songDesc: 'Irama energetik penuh keceriaan bintang yang berpendar (KIDULT)'
  },
  tenang: {
    id: 'tenang',
    label: 'Tenang',
    icon: '🌸',
    songTitle: '♫ Dreamy Piano ♫',
    songDesc: 'Alunan piano lembut di bawah senja KIDULT'
  },
  sedih: {
    id: 'sedih',
    label: 'Sedih',
    icon: '🌧️',
    songTitle: '♫ Gentle Rainy Lullaby ♫',
    songDesc: 'Petikan senar lembut yang menenangkan hati gundah (KIDULT)'
  },
  lelah: {
    id: 'lelah',
    label: 'Lelah',
    icon: '🌙',
    songTitle: '♫ Twilight Music Box ♫',
    songDesc: 'Kotak musik pengantar istirahat di bawah temaram rembulan (KIDULT)'
  },
  bersyukur: {
    id: 'bersyukur',
    label: 'Bersyukur',
    icon: '✨',
    songTitle: '♫ Warm Acoustic Hug ♫',
    songDesc: 'Harmoni akustik hangat untuk momen persahabatan yang indah (KIDULT)'
  },
  melamun: {
    id: 'melamun',
    label: 'Melamun',
    icon: '💭',
    songTitle: '♫ Floating Clouds Lo-Fi ♫',
    songDesc: 'Alunan lo-fi santai mengembara di antara awan lavender (KIDULT)'
  }
};

// Minimalist Mood Picker Definitions & Curated Soundtrack Recommendations (TO YOU — Lala ☼)
export const TOYOU_MOODS = {
  bahagia: {
    id: 'bahagia',
    label: 'Bahagia',
    icon: '😊',
    songTitle: '♫ Sunny Blossom Waltz ♫',
    songDesc: 'Irama ceria menyambut semerbak bunga bermekaran di hutan TO YOU'
  },
  bersemangat: {
    id: 'bersemangat',
    label: 'Bersemangat',
    icon: '🥰',
    songTitle: '♫ Golden Sunbeam Sparkle ♫',
    songDesc: 'Melodi hangat penuh semangat langkah riang di padang bunga Lala'
  },
  tenang: {
    id: 'tenang',
    label: 'Tenang',
    icon: '🌸',
    songTitle: '♫ Forest Whispering Breeze ♫',
    songDesc: 'Alunan seruling dan petikan harpa di bawah naungan pohon peri'
  },
  sedih: {
    id: 'sedih',
    label: 'Sedih',
    icon: '🌧️',
    songTitle: '♫ Petal Droplet Lullaby ♫',
    songDesc: 'Tetesan embun lembut yang meredakan riak hati gundah'
  },
  lelah: {
    id: 'lelah',
    label: 'Lelah',
    icon: '🌙',
    songTitle: '♫ Twilight Firefly Glow ♫',
    songDesc: 'Harmoni pengantar tidur berhias pendar kunang-kunang temaram'
  },
  bersyukur: {
    id: 'bersyukur',
    label: 'Bersyukur',
    icon: '✨',
    songTitle: '♫ Everglow Blossom Hymn ♫',
    songDesc: 'Kidungan syukur penuh kehangatan kasih dan persahabatan'
  },
  melamun: {
    id: 'melamun',
    label: 'Melamun',
    icon: '💭',
    songTitle: '♫ Dandelion Dreams ♫',
    songDesc: 'Alunan lembut melayang bebas bersama spora dandelion di langit TO YOU'
  }
};


// Interactive 2D Locations inside TO YOU — Bella's Fairy Forest World
export const TOYOU_LOCATIONS = {
  rumah: {
    id: 'rumah',
    icon: '🌸',
    tag: 'LOKASI UTAMA · TO YOU',
    title: 'Enchanted Bloom Cottage',
    subtitle: "Where Fairy Blossoms Forever Bloom · Bella's Fairy Cottage",
    description: 'Rumah peri bergaya enchanted cottage dengan jendela kaca besar bercahaya hangat, perapian batu, dapur manis, kubah konservatori kupu-kupu, dan loteng memori berhias bunga pastel.',
    highlight: '🏡 5 Ruangan simulasi 2D interaktif: Living Room, Bedroom, Kitchen, Conservatory & Memory Attic!',
    actionLabel: '🚪 Masuk ke Enchanted Bloom Cottage',
    actionType: 'bloom_cottage',
    toastMsg: "🏡 Selamat datang di Enchanted Bloom Cottage — Bella's Fairy Home ☀️"
  },
  atelier: {
    id: 'atelier',
    icon: '👗',
    tag: 'LOKASI B · TO YOU',
    title: 'The Fairy Atelier',
    subtitle: 'Enchanted Fairy Fashion Boutique & Design Simulator',
    description: 'Studio dan butik fantasi kubah kaca berhias mawar merambat dan kelopak emas. Di dalamnya terdapat ruang kreasi busana peri Lala, manekin display, buku sketsa interaktif, lemari aksesori, serta album koleksi rancangan mode.',
    highlight: '👗 Wardrobe & Dressing Room · 🎨 Fashion Sketchbook · 🪡 Designer\'s Corner · 📖 Lookbook & Portfolio',
    actionLabel: 'Masuk ke Fairy Atelier 👗✨',
    actionType: 'fairy_atelier',
    toastMsg: '👗 Memasuki The Fairy Atelier — Studio & Butik Mode Lala 🌸'
  },
  teleskop: {
    id: 'teleskop',
    icon: '🔭',
    tag: 'LOKASI C · TO YOU',
    title: 'Teleskop Pagi (Star Messages)',
    subtitle: 'Teras Observasi Terbuka Menghadap Langit Pagi',
    description: 'Area pengamatan terbuka dengan teleskop berornamen emas lembut di teras batu sisi kiri pulau. Menghadap langsung ke langit biru cerah dan pulau-pulau melayang di kejauhan untuk mengamati bintang dan bertukar pesan sahabat.',
    highlight: '🔭 Langit pagi jernih · Awan putih lembut & bintang pesan terlihat jelas',
    actionLabel: 'Buka Star Messages 🔭✨',
    actionType: 'star_messages',
    toastMsg: '★ Membuka teleskop ajaib Star Messages TO YOU... 🔭✨'
  },
  gazebo: {
    id: 'gazebo',
    icon: '🏛',
    tag: 'LOKASI D · TO YOU',
    title: 'Gazebo Pagi',
    subtitle: 'Everglow Morning Gazebo Sanctuary',
    description: 'Gazebo melingkar anggun bernuansa wisteria ungu dan fajar keemasan di tepi sungai TO YOU. Tempat ternyaman untuk menikmati teh bunga segar, membaca dongeng, merenung, dan memetik melodi gitar akustik.',
    highlight: '🫖 Tea Time · 📖 Perpustakaan Kecil · 📜 Jurnal Kenangan · 🔮 Quiet Moment',
    actionLabel: 'Bersantai di Gazebo Pagi ☼',
    actionType: 'toyou_gazebo',
    toastMsg: '🏛 Memasuki Gazebo Lala — Everglow Morning Sanctuary 🌸'
  },
  ladang_kupu: {
    id: 'ladang_kupu',
    icon: '🦋',
    tag: 'LOKASI E · TO YOU',
    title: 'Ladang Kupu-kupu',
    subtitle: 'Taman Bunga Pastel & Kupu-kupu Bercahaya Pagi',
    description: 'Taman terbuka yang dipenuhi bunga warna-warni pastel dan kupu-kupu bersayap kemilau yang beterbangan di antara jalan setapak antara Atelier dan Gazebo, memberi kesan hidup dan ceria pada dunia Lala.',
    highlight: '🦋 Kupu-kupu sayap peach, emas, dan biru langit menari di atas bunga',
    actionLabel: 'Sapa Kupu-kupu Taman Peri 🦋',
    actionType: 'toast',
    toastMsg: '🦋 Kupu-kupu bercahaya beterbangan mengelilingi Lala di Ladang Kupu-kupu!'
  },
  kotak_pos: {
    id: 'kotak_pos',
    icon: '✉',
    tag: 'LOKASI F · TO YOU',
    title: 'Kotak Pos',
    subtitle: 'Kotak Surat Pastel Pink di Persimpangan Jalan Setapak',
    description: 'Kotak surat bergaya fantasi berwarna pink pastel dengan detail amplop dan bintang emas di dekat jembatan kayu. Tempat mengirim dan membuka surat hangat antar sahabat.',
    highlight: '💌 Kotak surat TO YOU siap menerima dan mengirim pesan persahabatan',
    actionLabel: 'Buka Kotak Pos TO YOU ✉',
    actionType: 'kotak_pos',
    toastMsg: '✉ Membuka Kotak Pos TO YOU... ✉✨'
  }
};

// Interactive 2D Locations inside SHADOW — Lele's Crystal Moon Sanctuary World
export const SHADOW_LOCATIONS = {
  rumah_kristal: {
    id: 'rumah_kristal',
    icon: '👑',
    tag: "RUMAH UTAMA · THE AUTHOR'S ETERNAL SANCTUARY",
    title: 'THE ECLIPSE — Rumah Lele',
    subtitle: 'Istana Kerajaan Celestial Pribadi Sang Penulis (The Author)',
    description: "Satu-satunya rumah utama Lele yang berdiri megah di tengah malam abadi. Memadukan arsitektur royal celestial, marmer obsidian, pilar kristal amethyst, chandelier gerhana, serta 7 ruangan istana dan konsol The Author's Desk.",
    highlight: "👑 Rumah Utama Lele · 7 Ruangan Kerajaan, Author's Desk, Piano Gothic & Menara Observatorium",
    actionLabel: 'Masuk ke THE ECLIPSE (Rumah Utama) 👑🌙',
    actionType: 'eclipse_sanctuary',
    toastMsg: "👑 Memasuki THE ECLIPSE — Rumah Utama Lele (The Author's Eternal Sanctuary) 🌙"
  },
  teleskop: {
    id: 'teleskop',
    icon: '🔭',
    tag: 'LOKASI B · CRYSTAL MOON SANCTUARY',
    title: 'Observatorium Kristal — Teleskop (Star Messages)',
    subtitle: 'Teras Pengamatan Langit Malam & Kristal Perak',
    description: 'Tempat pengamatan langit malam di titik tinggi pulau dengan teleskop dari kristal murni dan logam perak berpadu bola armillary. Dari sini, Lele mengamati bulan sabit, gugusan bintang, dan pesan sahabat kosmik.',
    highlight: '✨ Langit malam indigo berbintang · Bintang pesan kosmik siap diamati',
    actionLabel: 'Buka Star Messages 🔭✨',
    actionType: 'star_messages',
    toastMsg: '★ Membuka teleskop ajaib Star Messages SHADOW... 🔭✨'
  },
  gazebo: {
    id: 'gazebo',
    icon: '💎',
    tag: 'LOKASI C · CRYSTAL MOON SANCTUARY',
    title: 'Moonlit Serenity Gazebo',
    subtitle: 'Paviliun Kristal Bulan di Tepi Sungai Malam',
    description: 'Gazebo malam bernuansa fantasi donghua di tepi sungai berhiaskan lentera hangat, tirai sutra lavender yang berayun lembut, dan kristal gantung yang berkilauan di bawah rembulan.',
    highlight: '🌙 Tempat kecil untuk bermimpi, membaca, dan merasa tenang',
    actionLabel: 'Masuk ke Gazebo Kristal ☾✨',
    actionType: 'shadow_gazebo',
    toastMsg: '🌙 Memasuki Moonlit Serenity Gazebo...'
  },
  kotak_pos: {
    id: 'kotak_pos',
    icon: '✉',
    tag: 'LOKASI D · CRYSTAL MOON SANCTUARY',
    title: 'Kotak Pos Kristal',
    subtitle: 'Kotak Surat Kristal Bulan Bercahaya Biru-Ungu',
    description: 'Kotak pos unik dari kristal bercahaya yang menyerupai lentera kristal bulan di dekat hamparan bunga snowdrop. Tempat Lele menerima dan membaca surat hangat dari sahabat tanpa mengganggu ketenangan malam.',
    highlight: '💌 Kotak Pos Kristal aktif · Kirim dan baca surat sahabat di bawah cahaya bulan',
    actionLabel: 'Buka Kotak Pos Kristal ✉',
    actionType: 'kotak_pos',
    toastMsg: '✉ Membuka Kotak Pos Kristal... ✉✨'
  },
  ladang_bunga: {
    id: 'ladang_bunga',
    icon: '🌸',
    tag: 'LOKASI E · CRYSTAL MOON SANCTUARY',
    title: 'Moonlit Hydrangea Garden',
    subtitle: 'Hamparan Hortensia Gradasi & Snowdrop Putih Malam',
    description: 'Ladang bunga alami yang menyatu dengan lanskap malam, dipenuhi bunga Hydrangea (hortensia) bergradasi biru, ungu, merah muda, dan putih, berpadu dengan bunga Snowdrop putih mungil yang elegan serta kunang-kunang yang terbang perlahan.',
    highlight: '🌸 Lele\'s Secret Garden · Rawat bunga, ensiklopedia perasaan, rangkai buket & nikmati kolam bulan',
    actionLabel: 'Masuk ke Ladang Bunga 🌸✨',
    actionType: 'shadow_garden',
    toastMsg: '🌸 Memasuki Moonlit Hydrangea Garden...'
  },
  kolam_berendam: {
    id: 'kolam_berendam',
    icon: '💧',
    tag: 'LOKASI F · CRYSTAL MOON SANCTUARY',
    title: 'Kolam Berendam dan Sungai Kristal',
    subtitle: 'Kolam Pemandian Luar Ruangan Bertepi Batu & Kristal',
    description: 'Kolam luar ruangan yang tenang dan privat dengan tepian batu alam serta gugusan kristal ungu. Permukaan airnya memantulkan cahaya bulan sabit dan lentera terapung, terhubung langsung dengan aliran Sungai Kristal yang membelah lanskap.',
    highlight: '🌊 Pantulan bulan sabit & riak air lembut di Kolam Berendam dan Sungai Kristal',
    actionLabel: 'Nikmati Ketenangan Kolam Kristal 💧',
    actionType: 'toast',
    toastMsg: '💧 Riak air hangat Kolam Berendam memantulkan cahaya bulan sabit dan kilau kristal malam 🌙'
  },
  sungai_kristal: {
    id: 'sungai_kristal',
    icon: '✧',
    tag: 'LOKASI F · CRYSTAL MOON SANCTUARY',
    title: 'Sungai Kristal',
    subtitle: 'Aliran Air Malam yang Memantulkan Cahaya Kristal & Bintang',
    description: 'Sungai jernih yang mengalir tenang melewati jembatan lengkung kristal dari Kolam Berendam menuju tepian pulau. Airnya memantulkan kilau kristal biru-ungu, bunga snowdrop di tepian, dan taburan bintang malam.',
    highlight: '✨ Terhubung dengan Kolam Berendam · Air sungai berkilau memantulkan bintang',
    actionLabel: 'Susuri Tepian Sungai Kristal ✧',
    actionType: 'toast',
    toastMsg: '✧ Aliran Sungai Kristal berkilau lembut memantulkan cahaya bintang dan lentera malam 🌙'
  },
  galeri_seni: {
    id: 'galeri_seni',
    icon: '🎨',
    tag: 'LOKASI G · CRYSTAL MOON SANCTUARY',
    title: 'Moonlit Art Gallery — Lele\'s Personal Art Museum',
    subtitle: 'Paviliun Kaca & Kristal Tempat Pajangan Lukisan Lele',
    description: 'Paviliun seni bercahaya dengan arsitektur kristal, batu, dan kubah kaca transparan. Di dalamnya terpajang deretan bingkai lukisan di atas easel kayu dan dinding kaca tempat Lele memamerkan karya-karya seninya.',
    highlight: '🖼 Beberapa bingkai lukisan malam & kanvas kosmik Lele terpajang rapi di galeri',
    actionLabel: 'Masuk ke Moonlit Art Gallery 🎨🌙',
    actionType: 'shadow_art_gallery',
    toastMsg: '🎨 Mengunjungi Galeri Seni Kristal: Lukisan-lukisan malam karya Lele berkilau di bawah cahaya kristal!'
  }
};

export function initUniversesView({
  onShowToast,
  onTriggerSparkle,
  onNavigateOrbit,
  onNavigateMoments,
  onNavigatePhotobooth,
  onNavigateStories,
  onNavigateStoryWorkspace,
  onNavigateMessages,
  onNavigateGames,
  onNavigateStarMessages,
  onNavigateKotakPos,
  onNavigateShadowGazebo,
  onNavigateShadowGarden,
  onNavigateShadowArtGallery,
  onNavigateShadowCrystalTower,
  onSwitchCharacter,
  onLogout
} = {}) {
  // DOM Elements
  const viewUniverses = document.getElementById('view-private-universe');
  const userGreetingEl = document.getElementById('univ-user-greeting');
  const userAvatarEl = document.getElementById('univ-user-avatar');
  const profilePill = document.getElementById('univ-profile-pill');
  const profileDropdown = document.getElementById('univ-profile-dropdown');
  const btnWhichUniverse = document.getElementById('btn-which-universe');

  // Universe Explorer Modal Elements
  const modalExplorer = document.getElementById('univ-modal-explorer');
  const modalTitle = document.getElementById('univ-modal-title');
  const modalOwner = document.getElementById('univ-modal-owner');
  const modalAvatar = document.getElementById('univ-modal-avatar');
  const modalDesc = document.getElementById('univ-modal-desc');
  const modalQuote = document.getElementById('univ-modal-quote');
  const btnModalOrbit = document.getElementById('btn-modal-open-orbit');
  const btnModalMoments = document.getElementById('btn-modal-open-moments');
  const btnModalVisitTown = document.getElementById('btn-modal-visit-town');
  const btnModalSwitchChar = document.getElementById('btn-modal-switch-char');

  // Info Modals (Messages & Games)
  const modalInfo = document.getElementById('univ-modal-info');
  const modalInfoTitle = document.getElementById('univ-info-title');
  const modalInfoDesc = document.getElementById('univ-info-desc');

  let currentActiveUnivKey = 'kidult';
  let activeUser = 'nyanya';
  let activeCharacterKey = 'nyanya';

  // Initialize Lele's Secret Journal (BEHIND THE SHADOW) controller
  const shadowBehindCtrl = typeof initShadowBehindView === 'function' ? initShadowBehindView({
    onShowToast,
    onTriggerSparkle
  }) : null;

  // Initialize Lele's Mood & Angel/Devil Duality Controller (SHADOW ☾)
  const shadowMoodCtrl = typeof initShadowMoodView === 'function' ? initShadowMoodView({
    getActiveAuthUser: () => activeAuthUser,
    onTriggerSparkle,
    onShowToast,
    updateElementState
  }) : null;

  // Initialize Nyanya's Secret Grimoire (BEHIND THE WITCH) controller
  const kidultBehindCtrl = typeof initKidultBehindView === 'function' ? initKidultBehindView({
    onShowToast,
    onTriggerSparkle
  }) : null;

  // Initialize Lala's Secret Fairy Journal (BEHIND THE FAIRY) controller
  const toyouBehindCtrl = typeof initToYouBehindView === 'function' ? initToYouBehindView({
    onShowToast,
    onTriggerSparkle
  }) : null;

  // Initialize Syma's Universe (PINWHEEL — The Nine Tailed Sanctuary) & The Pinwheel Haven controllers
  let pinwheelHavenCtrl = null;
  const pinwheelCtrl = typeof initPinwheelWorld === 'function' ? initPinwheelWorld({
    onShowToast,
    onTriggerSparkle,
    onOpenResidence: () => {
      if (pinwheelCtrl) pinwheelCtrl.closePinwheelWorld();
      if (pinwheelHavenCtrl) pinwheelHavenCtrl.openPinwheelHaven(activeAuthUser);
    },
    onNavigateStarMessages: (originUniv = 'pinwheel') => {
      if (typeof onNavigateStarMessages === 'function') {
        onNavigateStarMessages(originUniv);
      }
    },
    onNavigateKotakPos: (originUniv = 'pinwheel') => {
      if (typeof onNavigateKotakPos === 'function') {
        onNavigateKotakPos(originUniv);
      }
    },
    onNavigateOrbit: (fromView = 'view-pinwheel-world', characterKey = 'abil') => {
      if (typeof onNavigateOrbit === 'function') onNavigateOrbit(fromView, characterKey);
    },
    onNavigatePhotobooth: (fromView = 'view-pinwheel-world', characterKey = 'abil') => {
      if (typeof onNavigatePhotobooth === 'function') {
        onNavigatePhotobooth(fromView, characterKey);
      }
    }
  }) : null;

  pinwheelHavenCtrl = typeof initPinwheelHavenView === 'function' ? initPinwheelHavenView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      if (pinwheelHavenCtrl) pinwheelHavenCtrl.closePinwheelHaven();
      if (pinwheelCtrl) pinwheelCtrl.openPinwheelWorld(activeAuthUser);
    }
  }) : null;

  // Initialize Akhira's Universe (YAWN — Underwater Astral City) & The Azure Tide Palace controllers
  let azurePalaceCtrl = null;
  let yawnGazeboCtrl = null;
  let yawnCinemaCtrl = null;
  const yawnCtrl = typeof initYawnWorld === 'function' ? initYawnWorld({
    onShowToast,
    onTriggerSparkle,
    onOpenResidence: () => {
      if (yawnCtrl) yawnCtrl.closeYawnWorld();
      if (azurePalaceCtrl) azurePalaceCtrl.openAzurePalace(activeAuthUser);
    },
    onOpenKotakPos: () => {
      if (typeof onNavigateKotakPos === 'function') {
        onNavigateKotakPos('yawn');
      }
    },
    onOpenGazebo: () => {
      if (yawnCtrl) yawnCtrl.closeYawnWorld();
      if (yawnGazeboCtrl) yawnGazeboCtrl.openYawnGazebo(activeAuthUser);
    },
    onOpenCinema: () => {
      if (yawnCtrl) yawnCtrl.closeYawnWorld();
      if (yawnCinemaCtrl) yawnCinemaCtrl.openYawnCinema(activeAuthUser);
    },
    onNavigateStarMessages: (originUniv = 'yawn') => {
      if (typeof onNavigateStarMessages === 'function') {
        onNavigateStarMessages(originUniv);
      }
    },
    onNavigateOrbit: (fromView = 'view-yawn-world', characterKey = 'akhira') => {
      if (typeof onNavigateOrbit === 'function') onNavigateOrbit(fromView, characterKey);
    },
    onNavigatePhotobooth: (fromView = 'view-yawn-world', characterKey = 'akhira') => {
      if (typeof onNavigatePhotobooth === 'function') {
        onNavigatePhotobooth(fromView, characterKey);
      }
    }
  }) : null;

  yawnGazeboCtrl = typeof initYawnGazeboView === 'function' ? initYawnGazeboView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      if (yawnGazeboCtrl) yawnGazeboCtrl.closeYawnGazebo();
      if (yawnCtrl) yawnCtrl.openYawnWorld(activeAuthUser);
    },
    onNavigateStoryWorkspace
  }) : null;

  yawnCinemaCtrl = typeof initYawnCinemaView === 'function' ? initYawnCinemaView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      if (yawnCinemaCtrl) yawnCinemaCtrl.closeYawnCinema();
      if (yawnCtrl) yawnCtrl.openYawnWorld(activeAuthUser);
    }
  }) : null;

  azurePalaceCtrl = typeof initAzurePalaceView === 'function' ? initAzurePalaceView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      if (azurePalaceCtrl) azurePalaceCtrl.closeAzurePalace();
      if (yawnCtrl) yawnCtrl.openYawnWorld(activeAuthUser);
    }
  }) : null;

  // Initialize Ruben's Universe (ASH — The Dragon's Den) & The Dragon's Den Residence controllers
  let dragonDenCtrl = null;
  const ashCtrl = typeof initAshWorld === 'function' ? initAshWorld({
    onShowToast,
    onTriggerSparkle,
    onOpenResidence: () => {
      if (ashCtrl) ashCtrl.closeAshWorld();
      if (dragonDenCtrl) dragonDenCtrl.openDragonDen(activeAuthUser);
    },
    onNavigateOrbit: (fromView = 'view-ash-world', characterKey = 'ruben') => {
      if (typeof onNavigateOrbit === 'function') onNavigateOrbit(fromView, characterKey);
    },
    onNavigatePhotobooth: (fromView = 'view-ash-world', characterKey = 'ruben') => {
      if (typeof onNavigatePhotobooth === 'function') {
        onNavigatePhotobooth(fromView, characterKey);
      }
    }
  }) : null;

  dragonDenCtrl = typeof initDragonDenView === 'function' ? initDragonDenView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      if (dragonDenCtrl) dragonDenCtrl.closeDragonDen();
      if (ashCtrl) ashCtrl.openAshWorld(activeAuthUser);
    }
  }) : null;

  // Initialize Ela's Universe (US AGAIN — THE SILENT LOTUS) & The Silent Lotus House controllers
  let silentLotusCtrl = null;
  const usagainCtrl = typeof initUsAgainWorld === 'function' ? initUsAgainWorld({
    onShowToast,
    onTriggerSparkle,
    onOpenResidence: () => {
      if (usagainCtrl) usagainCtrl.closeUsAgainWorld();
      if (silentLotusCtrl) silentLotusCtrl.openSilentLotusHouse(activeAuthUser);
    },
    onNavigateStarMessages: (originUniv = 'us_again') => {
      if (typeof onNavigateStarMessages === 'function') {
        onNavigateStarMessages(originUniv);
      }
    },
    onNavigateMoments: (previousView = 'view-usagain-world', characterKey = 'ela') => {
      if (typeof onNavigateMoments === 'function') {
        onNavigateMoments(previousView, characterKey);
      }
    },
    onNavigateOrbit: (fromView = 'view-usagain-world', characterKey = 'ela') => {
      if (typeof onNavigateOrbit === 'function') onNavigateOrbit(fromView, characterKey);
    },
    onNavigatePhotobooth: (fromView = 'view-usagain-world', characterKey = 'ela') => {
      if (typeof onNavigatePhotobooth === 'function') {
        onNavigatePhotobooth(fromView, characterKey);
      }
    }
  }) : null;

  silentLotusCtrl = typeof initSilentLotusView === 'function' ? initSilentLotusView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      if (silentLotusCtrl) silentLotusCtrl.closeSilentLotusHouse();
      if (usagainCtrl) usagainCtrl.openUsAgainWorld(activeAuthUser);
    }
  }) : null;

  // Initialize Royan's Universe (HOT — THE ENCHANTED ELVEN SANCTUARY) & The Moonpetal Manor controllers
  let moonpetalManorCtrl = null;
  const hotCtrl = typeof initHotWorld === 'function' ? initHotWorld({
    onShowToast,
    onTriggerSparkle,
    onOpenResidence: () => {
      if (hotCtrl) hotCtrl.closeHotWorld();
      if (moonpetalManorCtrl) moonpetalManorCtrl.openMoonpetalManor(activeAuthUser);
    },
    onNavigateOrbit: (fromView = 'view-hot-world', characterKey = 'royan') => {
      if (typeof onNavigateOrbit === 'function') onNavigateOrbit(fromView, characterKey);
    },
    onNavigatePhotobooth: (fromView = 'view-hot-world', characterKey = 'royan') => {
      if (typeof onNavigatePhotobooth === 'function') {
        onNavigatePhotobooth(fromView, characterKey);
      }
    }
  }) : null;

  moonpetalManorCtrl = typeof initMoonpetalManorView === 'function' ? initMoonpetalManorView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      if (moonpetalManorCtrl) moonpetalManorCtrl.closeMoonpetalManor();
      if (hotCtrl) hotCtrl.openHotWorld(activeAuthUser);
    }
  }) : null;

  // Horizontal Planet Navigation (Mouse Drag, Touch Swipe, Arrow Buttons, Dots & Keyboard)
  const islandsStage = typeof document?.querySelector === 'function' ? document.querySelector('.universes-islands-stage') : null;
  const btnPlanetsPrev = typeof document?.getElementById === 'function' ? document.getElementById('btn-planets-prev') : null;
  const btnPlanetsNext = typeof document?.getElementById === 'function' ? document.getElementById('btn-planets-next') : null;
  const navDots = typeof document?.querySelectorAll === 'function' ? Array.from(document.querySelectorAll('.univ-nav-dot')) : [];
  const dragHintEl = typeof document?.getElementById === 'function' ? document.getElementById('univ-drag-hint') : null;
  let suppressNextPlanetClickUntil = 0;

  if (islandsStage) {
    islandsStage.scrollLeft = 0;

    const getPlanetCards = () => Array.from(islandsStage.querySelectorAll('.univ-island-card'));

    const getScrollStep = () => {
      const cards = getPlanetCards();
      if (cards.length >= 2) {
        const step = cards[1].offsetLeft - cards[0].offsetLeft;
        if (step > 0) return step;
      }
      if (cards.length === 1) {
        return cards[0].offsetWidth;
      }
      return Math.max(260, Math.round(islandsStage.clientWidth * 0.34));
    };

    const dismissDragHint = () => {
      if (dragHintEl && !dragHintEl.classList.contains('is-dismissed')) {
        dragHintEl.classList.add('is-dismissed');
      }
    };

    const updatePlanetNavigationUI = () => {
      const maxScroll = Math.max(0, islandsStage.scrollWidth - islandsStage.clientWidth);
      const currentScroll = islandsStage.scrollLeft;

      if (btnPlanetsPrev) {
        const atStart = currentScroll <= 8;
        btnPlanetsPrev.disabled = atStart;
        btnPlanetsPrev.classList.toggle('is-disabled', atStart);
      }

      if (btnPlanetsNext) {
        const atEnd = maxScroll <= 8 || currentScroll >= maxScroll - 8;
        btnPlanetsNext.disabled = atEnd;
        btnPlanetsNext.classList.toggle('is-disabled', atEnd);
      }

      // Highlight active dot based on leading/centered visible planet
      const cards = getPlanetCards();
      if (cards.length && navDots.length) {
        let activeIdx = 0;
        if (maxScroll > 8 && currentScroll >= maxScroll - 12) {
          activeIdx = cards.length - 1;
        } else {
          const step = getScrollStep();
          activeIdx = Math.min(cards.length - 1, Math.max(0, Math.round(currentScroll / Math.max(1, step))));
        }
        navDots.forEach((dot, idx) => {
          const isActive = idx === activeIdx;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }
    };

    if (btnPlanetsPrev) {
      btnPlanetsPrev.addEventListener('click', () => {
        dismissDragHint();
        islandsStage.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      });
    }

    if (btnPlanetsNext) {
      btnPlanetsNext.addEventListener('click', () => {
        dismissDragHint();
        islandsStage.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      });
    }

    navDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        dismissDragHint();
        const cards = getPlanetCards();
        const target = cards[idx];
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });

    islandsStage.addEventListener('scroll', () => {
      if (islandsStage.scrollLeft > 8) {
        dismissDragHint();
      }
      updatePlanetNavigationUI();
    }, { passive: true });

    window.addEventListener('resize', updatePlanetNavigationUI);
    if (typeof ResizeObserver !== 'undefined') {
      const stageResizeObserver = new ResizeObserver(() => {
        updatePlanetNavigationUI();
      });
      stageResizeObserver.observe(islandsStage);
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(updatePlanetNavigationUI);
    } else {
      updatePlanetNavigationUI();
    }

    let isPointerDown = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    const DRAG_THRESHOLD_PX = 6;

    islandsStage.addEventListener('pointerdown', (e) => {
      // Only handle primary mouse button for drag-to-scroll; touch uses native momentum swipe
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      isPointerDown = true;
      isDragging = false;
      dragStartX = e.clientX;
      dragStartScrollLeft = islandsStage.scrollLeft;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPointerDown || e.pointerType !== 'mouse') return;
      const dx = e.clientX - dragStartX;
      if (!isDragging && Math.abs(dx) > DRAG_THRESHOLD_PX) {
        isDragging = true;
        dismissDragHint();
        islandsStage.classList.add('is-dragging');
      }
      if (isDragging) {
        e.preventDefault();
        islandsStage.scrollLeft = dragStartScrollLeft - dx;
      }
    });

    const endMouseDrag = (e) => {
      if (!isPointerDown || (e && e.pointerType && e.pointerType !== 'mouse')) return;
      if (isDragging) {
        suppressNextPlanetClickUntil = Date.now() + 180;
      }
      isPointerDown = false;
      isDragging = false;
      islandsStage.classList.remove('is-dragging');
      updatePlanetNavigationUI();
    };

    window.addEventListener('pointerup', endMouseDrag);
    window.addEventListener('pointercancel', endMouseDrag);

    // Touch swipe click guard (prevents accidental click during momentum swipe)
    let touchStartX = 0;
    let touchStartY = 0;
    islandsStage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    islandsStage.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > 8 && dx >= dy) {
          suppressNextPlanetClickUntil = Date.now() + 250;
        }
      }
    }, { passive: true });

    // Keyboard navigation (ArrowLeft / ArrowRight) between planets
    islandsStage.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const cards = Array.from(islandsStage.querySelectorAll('.univ-island-card'));
      if (!cards.length) return;
      const currentIndex = cards.indexOf(document.activeElement);
      let nextIndex = 0;
      if (currentIndex === -1) {
        nextIndex = e.key === 'ArrowRight' ? 0 : cards.length - 1;
      } else {
        nextIndex = e.key === 'ArrowRight'
          ? Math.min(cards.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);
      }
      e.preventDefault();
      const targetCard = cards[nextIndex];
      targetCard.focus();
      targetCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  }

  // 1. Sync Island Cards DOM from UNIVERSE_DATA (Single Source of Truth) & Setup Click Handlers
  const islandCards = document.querySelectorAll('.univ-island-card');
  islandCards.forEach(card => {
    const univKey = card.getAttribute('data-universe');
    const data = UNIVERSE_DATA[univKey];
    if (data) {
      card.setAttribute('data-char', data.charKey);
      card.setAttribute('aria-label', `Buka Universe ${data.name} - ${data.owner} (${data.charName})`);

      const islandImg = card.querySelector('.floating-island-image');
      if (islandImg) {
        islandImg.src = data.islandArt;
        islandImg.alt = `${data.name} - ${data.owner} (${data.charName})`;
      }

      const miniAvatarImg = card.querySelector('.island-mini-avatar img');
      if (miniAvatarImg) {
        miniAvatarImg.src = data.avatar;
        miniAvatarImg.alt = `${data.charName} - ${data.charRole}`;
      }

      const badgeAvatarImg = card.querySelector('.island-avatar-badge img');
      if (badgeAvatarImg) {
        badgeAvatarImg.src = data.avatar;
        badgeAvatarImg.alt = `${data.charName} - ${data.charRole}`;
      }

      const titleEl = card.querySelector('.island-card-title');
      if (titleEl) {
        titleEl.innerHTML = `<span class="island-symbol-icon">${data.symbol}</span> ${data.name}`;
      }

      const subEl = card.querySelector('.island-card-sub');
      if (subEl) {
        subEl.textContent = data.owner;
      }

      const quoteEl = card.querySelector('.island-script-quote');
      if (quoteEl && data.quote) {
        quoteEl.textContent = data.quote;
      }
    }

    card.addEventListener('click', (e) => {
      if (Date.now() < suppressNextPlanetClickUntil) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (univKey === 'kidult') {
        openKidultWorld(e);
      } else if (univKey === 'to_you') {
        openToYouWorld(e);
      } else if (univKey === 'shadow') {
        openShadowWorld(e);
      } else if (univKey === 'pinwheel') {
        if (pinwheelCtrl && typeof pinwheelCtrl.openPinwheelWorld === 'function') {
          pinwheelCtrl.openPinwheelWorld(activeAuthUser);
        } else if (window.pinwheelWorldController && typeof window.pinwheelWorldController.openPinwheelWorld === 'function') {
          window.pinwheelWorldController.openPinwheelWorld(activeAuthUser);
        }
      } else if (univKey === 'yawn') {
        yawnCtrl?.openYawnWorld(activeAuthUser);
      } else if (univKey === 'ash') {
        ashCtrl?.openAshWorld(activeAuthUser);
      } else if (univKey === 'us_again') {
        usagainCtrl?.openUsAgainWorld(activeAuthUser);
      } else if (univKey === 'hot') {
        handleOpenHotWorld(e);
      } else if (UNIVERSE_DATA[univKey]) {
        openUniverseDetail(univKey, e);
      }
    });

    card.addEventListener('focus', () => {
      card.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    });
  });

  // 2. Open Universe Detail Explorer Modal
  function openUniverseDetail(univKey, event) {
    const data = UNIVERSE_DATA[univKey];
    if (!data) return;

    currentActiveUnivKey = univKey;

    if (modalTitle) modalTitle.textContent = `${data.symbol} ${data.name}`;
    if (modalOwner) modalOwner.textContent = data.owner;
    if (modalAvatar) {
      modalAvatar.src = data.avatar;
      modalAvatar.alt = `${data.charName} - ${data.charRole}`;
    }
    const modalCharName = document.getElementById('univ-modal-char-name');
    const modalCharRole = document.getElementById('univ-modal-char-role');
    if (modalCharName && data.charName) modalCharName.textContent = data.charName;
    if (modalCharRole && data.charRole) modalCharRole.textContent = data.charRole;
    if (modalDesc) modalDesc.textContent = data.description;
    if (modalQuote) modalQuote.textContent = `"${data.quote}"`;

    // Sparkle burst at click point
    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }

    if (modalExplorer) {
      modalExplorer.classList.add('open');
      modalExplorer.setAttribute('aria-hidden', 'false');
    }
  }

  // Handle Enter / Interact with Royan's Universe (HOT 🎆)
  // TEMPORARY PREVIEW ACCESS CONFIG: Easily toggled without breaking auth
  const ALLOW_HOT_PREVIEW_ACCESS = true;

  function handleOpenHotWorld(eventOrUser, forcePreview = false) {
    const isOwner = (activeUser === 'royan') || (activeAuthUser && activeAuthUser.uid === 'swBN9XodDWRuHE5YbYmeoytrcAx2');
    const isPreview = forcePreview || (!isOwner && ALLOW_HOT_PREVIEW_ACCESS);

    if (activeUser !== 'royan' && !isOwner && !ALLOW_HOT_PREVIEW_ACCESS) {
      if (onShowToast) onShowToast('⚠️ Akses dibatasi: Universe HOT 🎆 hanya dapat diakses oleh Royan.');
      return;
    }

    if (modalExplorer) {
      modalExplorer.classList.remove('open');
      modalExplorer.setAttribute('aria-hidden', 'true');
    }

    if (onTriggerSparkle) {
      const x = (eventOrUser && eventOrUser.clientX) ? eventOrUser.clientX : window.innerWidth / 2;
      const y = (eventOrUser && eventOrUser.clientY) ? eventOrUser.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }

    if (hotCtrl) {
      hotCtrl.openHotWorld(activeAuthUser, isPreview);
    } else {
      if (onShowToast) {
        onShowToast(isPreview
          ? "Membuka Royan's Universe — HOT 🎆 (PREVIEW MODE)"
          : "Selamat datang di Royan's Universe — HOT 🎆 The Enchanted Elven Sanctuary");
      }
      const hotCard = document.querySelector('.univ-island-card.card-hot');
      if (hotCard) {
        hotCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }

  // 3. Navigation Pill Buttons Handlers
  const navButtons = document.querySelectorAll('.univ-nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const navTarget = btn.getAttribute('data-nav');

      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (navTarget === 'universes') {
        const viewUniv = document.getElementById('view-private-universe');
        ['view-orbit', 'view-moments', 'view-kidult-world', 'view-toyou-world', 'view-shadow-world', 'view-photobooth', 'view-our-stories', 'view-story-workspace', 'view-story-reading', 'view-messages', 'view-games'].forEach((id) => {
          const el = document.getElementById(id);
          if (el) {
            el.classList.remove('active');
            el.setAttribute('aria-hidden', 'true');
          }
        });
        if (viewUniv) {
          viewUniv.classList.add('active');
          viewUniv.setAttribute('aria-hidden', 'false');
        }
        if (activeUser) {
          updateUserProfile(activeUser);
        }
        if (onShowToast) onShowToast('🪐 Halaman Pemilihan Tiga Universe ✦');
        if (onTriggerSparkle && typeof btn.getBoundingClientRect === 'function') {
          onTriggerSparkle(btn.getBoundingClientRect().left + 40, btn.getBoundingClientRect().top + 15);
        }
      } else if (navTarget === 'stories') {
        // Open Our Stories (Public Library)
        if (onTriggerSparkle && typeof btn.getBoundingClientRect === 'function') {
          onTriggerSparkle(btn.getBoundingClientRect().left + 40, btn.getBoundingClientRect().top + 15);
        }
        if (typeof onNavigateStories === 'function') {
          onNavigateStories('view-private-universe');
        }
      } else if (navTarget === 'calendar' || navTarget === 'orbit') {
        // Open Our Calendar (Orbit)
        if (typeof onNavigateOrbit === 'function') {
          onNavigateOrbit('view-private-universe');
        }
      } else if (navTarget === 'gallery') {
        // Open Moments Scrapbook!
        if (typeof onNavigateMoments === 'function') {
          onNavigateMoments('view-private-universe');
        }
      } else if (navTarget === 'photobooth') {
        // Open Our Little Photobooth (separate top-level feature)!
        if (typeof onNavigatePhotobooth === 'function') {
          onNavigatePhotobooth('view-private-universe');
        }
      } else if (navTarget === 'messages') {
        if (typeof onNavigateMessages === 'function') {
          onNavigateMessages('view-private-universe');
        } else {
          openInfoModal(
            '📬 Little Post Office (Fase 6)',
            'Pesan privat & pesan grup antar tiga karakter Our Little Universe.'
          );
        }
      } else if (navTarget === 'games') {
        if (typeof onNavigateGames === 'function') {
          onNavigateGames('view-private-universe');
        } else {
          openInfoModal(
            '🎮 Going Seventeen Zone (Fase 7)',
            'Arena permainan persahabatan privat tiga sahabat: How Well Do You Know Me?, This or That, Who Said That?!, dan Bestie Mission.'
          );
        }
      } else if (navTarget === 'more') {
        // Toggle profile / options dropdown
        toggleProfileDropdown();
      }
    });
  });

  function openInfoModal(title, desc) {
    if (modalInfoTitle) modalInfoTitle.textContent = title;
    if (modalInfoDesc) modalInfoDesc.textContent = desc;
    if (modalInfo) {
      modalInfo.classList.add('open');
      modalInfo.setAttribute('aria-hidden', 'false');
    }
  }

  // 4. Profile Pill & Dropdown Toggle
  if (profilePill) {
    profilePill.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleProfileDropdown();
    });
  }

  function toggleProfileDropdown() {
    if (!profileDropdown) return;
    profileDropdown.classList.toggle('open');
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (profileDropdown && !profileDropdown.contains(e.target) && (!profilePill || !profilePill.contains(e.target))) {
      profileDropdown.classList.remove('open');
    }
  });

  // Dropdown Action Items
  const btnDropOrbit = document.getElementById('btn-drop-orbit');
  if (btnDropOrbit) {
    btnDropOrbit.addEventListener('click', () => {
      if (profileDropdown) profileDropdown.classList.remove('open');
      if (typeof onNavigateOrbit === 'function') {
        onNavigateOrbit('view-private-universe');
      }
    });
  }

  const btnDropMoments = document.getElementById('btn-drop-moments');
  if (btnDropMoments) {
    btnDropMoments.addEventListener('click', () => {
      if (profileDropdown) profileDropdown.classList.remove('open');
      if (typeof onNavigateMoments === 'function') {
        onNavigateMoments('view-private-universe');
      }
    });
  }

  const btnDropPhotobooth = document.getElementById('btn-drop-photobooth');
  if (btnDropPhotobooth) {
    btnDropPhotobooth.addEventListener('click', () => {
      if (profileDropdown) profileDropdown.classList.remove('open');
      if (typeof onNavigatePhotobooth === 'function') {
        onNavigatePhotobooth('view-private-universe');
      }
    });
  }

  const btnDropSwitch = document.getElementById('btn-drop-switch');
  if (btnDropSwitch) {
    btnDropSwitch.addEventListener('click', () => {
      if (profileDropdown) profileDropdown.classList.remove('open');
      if (typeof onSwitchCharacter === 'function') {
        onSwitchCharacter();
      }
    });
  }

  const btnDropLogout = document.getElementById('btn-drop-logout');
  if (btnDropLogout) {
    btnDropLogout.addEventListener('click', () => {
      if (profileDropdown) profileDropdown.classList.remove('open');
      if (typeof onLogout === 'function') {
        onLogout();
      }
    });
  }

  // 5. Explorer Modal Buttons
  if (btnModalOrbit) {
    btnModalOrbit.addEventListener('click', () => {
      closeAllUnivModals();
      if (typeof onNavigateOrbit === 'function') {
        onNavigateOrbit('view-private-universe');
      }
    });
  }

  if (btnModalMoments) {
    btnModalMoments.addEventListener('click', () => {
      closeAllUnivModals();
      if (typeof onNavigateMoments === 'function') {
        onNavigateMoments('view-private-universe');
      }
    });
  }

  if (btnModalVisitTown) {
    btnModalVisitTown.addEventListener('click', (e) => {
      closeAllUnivModals();
      if (currentActiveUnivKey === 'kidult') {
        openKidultWorld(e);
        return;
      }
      if (currentActiveUnivKey === 'to_you') {
        openToYouWorld(e);
        return;
      }
      if (currentActiveUnivKey === 'shadow') {
        openShadowWorld(e);
        return;
      }
      if (currentActiveUnivKey === 'pinwheel') {
        if (pinwheelCtrl && typeof pinwheelCtrl.openPinwheelWorld === 'function') {
          pinwheelCtrl.openPinwheelWorld(activeAuthUser);
        } else if (window.pinwheelWorldController && typeof window.pinwheelWorldController.openPinwheelWorld === 'function') {
          window.pinwheelWorldController.openPinwheelWorld(activeAuthUser);
        }
        return;
      }
      if (currentActiveUnivKey === 'yawn') {
        yawnCtrl?.openYawnWorld(activeAuthUser);
        return;
      }
      if (currentActiveUnivKey === 'ash') {
        ashCtrl?.openAshWorld(activeAuthUser);
        return;
      }
      if (currentActiveUnivKey === 'us_again') {
        usagainCtrl?.openUsAgainWorld(activeAuthUser);
        return;
      }
      if (currentActiveUnivKey === 'hot') {
        handleOpenHotWorld(e);
        return;
      }
      const univ = UNIVERSE_DATA[currentActiveUnivKey];
      if (onShowToast) onShowToast(`🏰 Memasuki gerbang kota 2D ${univ ? univ.name : ''}... (Fase Interaktif Siap!)`);
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    });
  }

  // ==========================================================
  // KIDULT 2D DREAMY WORLD CONTROLLER
  // ==========================================================
  const viewKidultWorld = document.getElementById('view-kidult-world');
  const btnKidultBack = document.getElementById('btn-kidult-back');
  const btnKidultReturnUniv = document.getElementById('btn-kidult-return-univ');
  const kidultHotspots = document.querySelectorAll('.kidult-hotspot[data-kidult-loc]');
  const kidultLocationPanel = document.getElementById('kidult-location-panel');
  const kidultLocIcon = document.getElementById('kidult-loc-icon');
  const kidultLocTag = document.getElementById('kidult-loc-tag');
  const kidultLocTitle = document.getElementById('kidult-loc-title');
  const kidultLocSubtitle = document.getElementById('kidult-loc-subtitle');
  const kidultLocDesc = document.getElementById('kidult-loc-desc');
  const kidultLocHighlight = document.getElementById('kidult-loc-highlight');
  const btnKidultLocAction = document.getElementById('btn-kidult-loc-action');
  const kidultLocActionLabel = document.getElementById('kidult-loc-action-label');
  const btnCloseKidultPanel = document.getElementById('btn-close-kidult-panel');
  const btnKidultPanelDismiss = document.getElementById('btn-kidult-panel-dismiss');
  const kidultChibiActor = document.getElementById('kidult-chibi-actor');

  let activeKidultLocationKey = null;

  // Initialize The Everdream House Controller
  const everdreamHouseCtrl = typeof initEverdreamHouseView === 'function' ? initEverdreamHouseView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewKidult = document.getElementById('view-kidult-world');
      if (viewKidult) {
        viewKidult.classList.add('active');
        viewKidult.setAttribute('aria-hidden', 'false');
      }
    },
    onNavigateGreenhouse: () => {
      if (greenhouseCtrl && typeof greenhouseCtrl.openGreenhouse === 'function') {
        greenhouseCtrl.openGreenhouse(activeCharacterKey || activeUser || 'nyanya');
      } else if (typeof onNavigateMoments === 'function') {
        onNavigateMoments('view-kidult-world');
      }
    },
    onNavigateGazebo: () => {
      selectKidultLocation('gazebo');
    },
    onNavigateRiver: () => {
      selectKidultLocation('sungai_senja');
    },
    onNavigatePicnic: () => {
      if (onShowToast) onShowToast('🧺 Menikmati waktu piknik santai di tepi taman KIDULT bersama Nyanya 🌸');
    }
  }) : null;

  // Initialize KIDULT Dream House 2D Simulation Controller
  const kidultHouseCtrl = typeof initKidultHouseView === 'function' ? initKidultHouseView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewKidult = document.getElementById('view-kidult-world');
      if (viewKidult) {
        viewKidult.classList.add('active');
        viewKidult.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;

  // Initialize The Enchanted Greenhouse Controller (Farming Simulator)
  const greenhouseCtrl = typeof initGreenhouseView === 'function' ? initGreenhouseView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewKidult = document.getElementById('view-kidult-world');
      if (viewKidult) {
        viewKidult.classList.add('active');
        viewKidult.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;

  const btnKidultEverdream = document.getElementById('btn-kidult-everdream-house');
  if (btnKidultEverdream) {
    btnKidultEverdream.addEventListener('click', (e) => {
      if (onTriggerSparkle) onTriggerSparkle(e.clientX, e.clientY);
      if (kidultHouseCtrl && typeof kidultHouseCtrl.openKidultHouse === 'function') {
        kidultHouseCtrl.openKidultHouse(activeCharacterKey || activeUser || 'nyanya', 'living');
      } else if (everdreamHouseCtrl && typeof everdreamHouseCtrl.openEverdreamHouse === 'function') {
        everdreamHouseCtrl.openEverdreamHouse('exterior');
      }
    });
  }

  const btnKidultGH = document.getElementById('btn-kidult-greenhouse');
  if (btnKidultGH) {
    btnKidultGH.addEventListener('click', (e) => {
      if (onTriggerSparkle) onTriggerSparkle(e.clientX, e.clientY);
      if (greenhouseCtrl && typeof greenhouseCtrl.openGreenhouse === 'function') {
        greenhouseCtrl.openGreenhouse(activeCharacterKey || activeUser || 'nyanya');
      }
    });
  }

  // Initialize Gazebo Nyanya (Memory Garden) Controller
  const kidultGazeboCtrl = typeof initKidultGazeboView === 'function' ? initKidultGazeboView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewKidult = document.getElementById('view-kidult-world');
      if (viewKidult) {
        viewKidult.classList.add('active');
        viewKidult.setAttribute('aria-hidden', 'false');
      }
    },
    onNavigateStoryWorkspace: (fromView, tab) => {
      if (typeof onNavigateStoryWorkspace === 'function') {
        onNavigateStoryWorkspace(fromView, tab);
      }
    }
  }) : null;

  const btnKidultGazebo = document.getElementById('btn-kidult-gazebo');
  if (btnKidultGazebo) {
    btnKidultGazebo.addEventListener('click', (e) => {
      if (onTriggerSparkle) onTriggerSparkle(e.clientX, e.clientY);
      if (kidultGazeboCtrl && typeof kidultGazeboCtrl.openKidultGazebo === 'function') {
        kidultGazeboCtrl.openKidultGazebo(activeCharacterKey || activeUser || 'nyanya');
      }
    });
  }

  function openKidultWorld(event) {
    closeAllUnivModals();
    closeToYouLocationPanel();
    closeShadowLocationPanel();
    const viewSel = document.getElementById('view-selection');
    const viewLog = document.getElementById('view-login');
    const viewUniv = document.getElementById('view-private-universe');
    const viewToYou = document.getElementById('view-toyou-world');
    const viewShadow = document.getElementById('view-shadow-world');
    const viewKidult = document.getElementById('view-kidult-world');

    if (viewSel) {
      viewSel.classList.remove('active');
      viewSel.setAttribute('aria-hidden', 'true');
    }
    if (viewLog) {
      viewLog.classList.remove('active');
      viewLog.setAttribute('aria-hidden', 'true');
    }
    if (viewUniv) {
      viewUniv.classList.remove('active');
      viewUniv.setAttribute('aria-hidden', 'true');
    }
    if (viewToYou) {
      viewToYou.classList.remove('active');
      viewToYou.setAttribute('aria-hidden', 'true');
    }
    if (viewShadow) {
      viewShadow.classList.remove('active');
      viewShadow.setAttribute('aria-hidden', 'true');
    }
    if (viewKidult) {
      viewKidult.classList.add('active');
      viewKidult.setAttribute('aria-hidden', 'false');
      viewKidult.scrollTop = 0;
      viewKidult.scrollLeft = 0;
    }

    // Load persistent state and decorations from Firestore (Fase 8)
    loadUniverseState('nyanya', activeAuthUser);
    restoreKidultMood();

    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
    if (onShowToast) {
      const isOwner = (activeUser === 'nyanya');
      onShowToast(isOwner ? '★ Memasuki Dunia KIDULT — Selamat datang di Universe milikmu! (MY UNIVERSE)' : '✦ Mengunjungi Dunia KIDULT milik Nyanya — Mode Pengunjung (VISIT UNIVERSE) ✦');
    }
  }

  function closeKidultWorld() {
    flushPendingUniverseSave();
    closeKidultLocationPanel();
    if (typeof closeBehindWitch === 'function') {
      closeBehindWitch();
    }
    if (kidultHouseCtrl && typeof kidultHouseCtrl.closeKidultHouse === 'function') {
      const house = document.getElementById('view-everdream-house');
      if (house && house.classList.contains('active')) {
        kidultHouseCtrl.closeKidultHouse();
      }
    }
    if (everdreamHouseCtrl && typeof everdreamHouseCtrl.closeEverdreamHouse === 'function') {
      const house = document.getElementById('view-everdream-house');
      if (house && house.classList.contains('active')) {
        everdreamHouseCtrl.closeEverdreamHouse();
      }
    }
    if (greenhouseCtrl && typeof greenhouseCtrl.closeGreenhouse === 'function') {
      const gh = document.getElementById('view-enchanted-greenhouse');
      if (gh && gh.classList.contains('active')) {
        greenhouseCtrl.closeGreenhouse();
      }
    }
    if (kidultGazeboCtrl && typeof kidultGazeboCtrl.closeKidultGazebo === 'function') {
      const gz = document.getElementById('view-kidult-gazebo');
      if (gz && gz.classList.contains('active')) {
        kidultGazeboCtrl.closeKidultGazebo();
      }
    }
    const viewSel = document.getElementById('view-selection');
    const viewUniv = document.getElementById('view-private-universe');
    const viewToYou = document.getElementById('view-toyou-world');
    const viewShadow = document.getElementById('view-shadow-world');
    const viewKidult = document.getElementById('view-kidult-world');

    if (viewSel) {
      viewSel.classList.remove('active');
      viewSel.setAttribute('aria-hidden', 'true');
    }
    if (viewToYou) {
      viewToYou.classList.remove('active');
      viewToYou.setAttribute('aria-hidden', 'true');
    }
    if (viewShadow) {
      viewShadow.classList.remove('active');
      viewShadow.setAttribute('aria-hidden', 'true');
    }
    if (viewKidult) {
      viewKidult.classList.remove('active');
      viewKidult.setAttribute('aria-hidden', 'true');
    }
    if (viewUniv) {
      viewUniv.classList.add('active');
      viewUniv.setAttribute('aria-hidden', 'false');
    }

    // Refresh user profile and island badges according to currently logged in character
    if (activeUser) {
      updateUserProfile(activeUser);
    }
    // Ensure navbar Universes button is active
    const navButtons = document.querySelectorAll('.univ-nav-btn');
    navButtons.forEach(b => b.classList.remove('active'));
    const btnUniv = document.getElementById('nav-btn-universes');
    if (btnUniv) btnUniv.classList.add('active');

    if (onShowToast) {
      onShowToast('🌌 Kembali ke Pemilihan Tiga Universe');
    }
  }

  function selectKidultLocation(locKey, event) {
    const loc = KIDULT_LOCATIONS[locKey];
    if (!loc) return;

    activeKidultLocationKey = locKey;

    kidultHotspots.forEach(h => {
      h.classList.toggle('active-loc', h.getAttribute('data-kidult-loc') === locKey);
    });

    if (kidultLocIcon) kidultLocIcon.textContent = loc.icon;
    if (kidultLocTag) kidultLocTag.textContent = loc.tag;
    if (kidultLocTitle) kidultLocTitle.textContent = loc.title;
    if (kidultLocSubtitle) kidultLocSubtitle.textContent = loc.subtitle;
    if (kidultLocDesc) kidultLocDesc.textContent = loc.description;
    if (kidultLocHighlight) kidultLocHighlight.textContent = loc.highlight;
    if (kidultLocActionLabel) kidultLocActionLabel.textContent = loc.actionLabel;

    if (kidultLocationPanel) {
      kidultLocationPanel.classList.add('open');
      kidultLocationPanel.setAttribute('aria-hidden', 'false');
    }

    // 2D Character Movement Simulation towards selected location
    const KIDULT_WAYPOINTS = {
      rumah: { left: '42%', top: '50%', dir: -1 },
      rumah_kaca: { left: '56%', top: '52%', dir: 1 },
      teleskop: { left: '20%', top: '56%', dir: -1 },
      kotak_pos: { left: '35%', top: '66%', dir: -1 },
      sungai_senja: { left: '58%', top: '70%', dir: 1 },
      gazebo: { left: '78%', top: '64%', dir: 1 }
    };
    if (kidultChibiActor && KIDULT_WAYPOINTS[locKey]) {
      const pt = KIDULT_WAYPOINTS[locKey];
      kidultChibiActor.classList.add('is-walking');
      kidultChibiActor.style.transform = `scaleX(${pt.dir || 1})`;
      kidultChibiActor.style.left = pt.left;
      kidultChibiActor.style.top = pt.top;
      setTimeout(() => {
        kidultChibiActor.classList.remove('is-walking');
        kidultChibiActor.style.transform = 'scaleX(1)';
      }, 850);
    }

    // Render interactive element state (Fase 8)
    renderLocationElementState('kidult', locKey);

    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
    if (onShowToast && loc.toastMsg) {
      onShowToast(loc.toastMsg);
    }
  }

  function closeKidultLocationPanel() {
    activeKidultLocationKey = null;
    kidultHotspots.forEach(h => h.classList.remove('active-loc'));
    const box = document.getElementById('kidult-element-state-box');
    if (box) box.style.display = 'none';
    if (kidultLocationPanel) {
      kidultLocationPanel.classList.remove('open');
      kidultLocationPanel.setAttribute('aria-hidden', 'true');
    }
  }

  kidultHotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = btn.getAttribute('data-kidult-loc');
      selectKidultLocation(locKey, e);
    });
  });

  if (btnCloseKidultPanel) {
    btnCloseKidultPanel.addEventListener('click', closeKidultLocationPanel);
  }
  if (btnKidultPanelDismiss) {
    btnKidultPanelDismiss.addEventListener('click', closeKidultLocationPanel);
  }

  if (btnKidultLocAction) {
    btnKidultLocAction.addEventListener('click', (e) => {
      const loc = KIDULT_LOCATIONS[activeKidultLocationKey];
      if (!loc) return;
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if (loc.actionType === 'greenhouse') {
        closeKidultLocationPanel();
        if (greenhouseCtrl && typeof greenhouseCtrl.openGreenhouse === 'function') {
          greenhouseCtrl.openGreenhouse(activeCharacterKey || activeUser || 'nyanya');
        }
      } else if (loc.actionType === 'everdream_house') {
        closeKidultLocationPanel();
        if (kidultHouseCtrl && typeof kidultHouseCtrl.openKidultHouse === 'function') {
          kidultHouseCtrl.openKidultHouse(activeCharacterKey || activeUser || 'nyanya', 'living');
        } else if (everdreamHouseCtrl && typeof everdreamHouseCtrl.openEverdreamHouse === 'function') {
          everdreamHouseCtrl.openEverdreamHouse('exterior');
        }
      } else if (loc.actionType === 'kidult_gazebo') {
        closeKidultLocationPanel();
        if (kidultGazeboCtrl && typeof kidultGazeboCtrl.openKidultGazebo === 'function') {
          kidultGazeboCtrl.openKidultGazebo(activeCharacterKey || activeUser || 'nyanya');
        }
      } else if (loc.actionType === 'orbit' && typeof onNavigateOrbit === 'function') {
        closeKidultLocationPanel();
        if (viewKidultWorld) {
          viewKidultWorld.classList.remove('active');
          viewKidultWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateOrbit('view-kidult-world');
      } else if (loc.actionType === 'star_messages' && typeof onNavigateStarMessages === 'function') {
        closeKidultLocationPanel();
        if (viewKidultWorld) {
          viewKidultWorld.classList.remove('active');
          viewKidultWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateStarMessages('kidult');
      } else if (loc.actionType === 'kotak_pos' && typeof onNavigateKotakPos === 'function') {
        closeKidultLocationPanel();
        if (viewKidultWorld) {
          viewKidultWorld.classList.remove('active');
          viewKidultWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateKotakPos('kidult');
      } else if (loc.actionType === 'moments' && typeof onNavigateMoments === 'function') {
        closeKidultLocationPanel();
        if (viewKidultWorld) {
          viewKidultWorld.classList.remove('active');
          viewKidultWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateMoments('view-kidult-world');
      } else if (onShowToast) {
        onShowToast(loc.toastMsg);
      }
    });
  }

  if (kidultChibiActor) {
    kidultChibiActor.addEventListener('click', (e) => {
      e.stopPropagation();
      kidultChibiActor.classList.add('bubble-open');
      setTimeout(() => kidultChibiActor.classList.remove('bubble-open'), 3200);
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if (onShowToast) {
        onShowToast('⭐ Nyanya: "Small joys make a big universe! Klik lokasi mana saja di pulau KIDULT untuk menjelajah~"');
      }
    });
  }

  if (btnKidultBack) {
    btnKidultBack.addEventListener('click', closeKidultWorld);
  }
  if (btnKidultReturnUniv) {
    btnKidultReturnUniv.addEventListener('click', closeKidultWorld);
  }
  const btnKidultStory = document.getElementById('btn-kidult-story');
  if (btnKidultStory) {
    btnKidultStory.addEventListener('click', () => {
      if (typeof onNavigateStoryWorkspace === 'function') {
        if (viewKidultWorld) viewKidultWorld.classList.remove('active');
        onNavigateStoryWorkspace('view-kidult-world', 'my-works');
      }
    });
  }

  const btnKidultPhotobooth = document.getElementById('btn-kidult-photobooth');
  if (btnKidultPhotobooth) {
    btnKidultPhotobooth.addEventListener('click', () => {
      if (typeof onNavigatePhotobooth === 'function') {
        if (viewKidultWorld) viewKidultWorld.classList.remove('active');
        onNavigatePhotobooth('view-kidult-world', 'nyanya');
      } else if (window.photoboothController && typeof window.photoboothController.openPhotobooth === 'function') {
        if (viewKidultWorld) viewKidultWorld.classList.remove('active');
        window.photoboothController.openPhotobooth('view-kidult-world', 'nyanya');
      }
    });
  }

  // Quick Star Messages button (Direct chat access from KIDULT top-left HUD)
  
  const btnKidultOrbit = document.getElementById('btn-kidult-nav-orbit');
  if (btnKidultOrbit) {
    btnKidultOrbit.addEventListener('click', (e) => {
      if (onTriggerSparkle) onTriggerSparkle(e.clientX, e.clientY);
      if (typeof onNavigateOrbit === 'function') {
        onNavigateOrbit('view-kidult-world', 'nyanya');
      }
    });
  }
  const btnKidultStarMessages = document.getElementById('btn-kidult-star-messages');
  if (btnKidultStarMessages) {
    btnKidultStarMessages.addEventListener('click', (e) => {
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 4, e.clientY || 180);
      }
      if (typeof onNavigateStarMessages === 'function') {
        if (viewKidultWorld) viewKidultWorld.classList.remove('active');
        onNavigateStarMessages('kidult');
      } else if (typeof onNavigateMessages === 'function') {
        if (viewKidultWorld) viewKidultWorld.classList.remove('active');
        onNavigateMessages('view-kidult-world');
      } else if (onShowToast) {
        onShowToast('★ Star Messages: Membuka pesan sahabat antar universe... ✧');
      }
    });
  }

  // Floating Gallery Button (Bottom-Right corner)
  const btnKidultGallery = document.getElementById('btn-kidult-gallery');
  if (btnKidultGallery) {
    btnKidultGallery.addEventListener('click', (e) => {
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth - 60, e.clientY || window.innerHeight - 60);
      }
      if (typeof onNavigateMoments === 'function') {
        if (viewKidultWorld) viewKidultWorld.classList.remove('active');
        onNavigateMoments('view-kidult-world');
      } else if (onShowToast) {
        onShowToast('🌸 Membuka Galeri Kenangan & Momen Indah ✧');
      }
    });
  }

  // ==========================================================
  // KIDULT MOOD PICKER & MUSIC RECOMMENDATION CONTROLLER
  // ==========================================================
  const kidultMoodContainer = document.getElementById('kidult-mood-container');
  const kidultMoodCard = document.getElementById('kidult-mood-card');
  const kidultMoodIcon = document.getElementById('kidult-mood-icon');
  const kidultMoodText = document.getElementById('kidult-mood-text');
  const kidultMoodSong = document.getElementById('kidult-mood-song');
  const btnToggleMoodPicker = document.getElementById('btn-toggle-mood-picker');
  const kidultPickerCaret = document.getElementById('kidult-picker-caret');
  const kidultMoodOptionsBar = document.getElementById('kidult-mood-options-bar');
  const moodOptionPills = document.querySelectorAll('.mood-option-pill');
  const btnKidultMoodPlay = document.getElementById('btn-kidult-mood-play');
  const kidultMusicIcon = document.getElementById('kidult-music-icon');

  let currentKidultMoodKey = 'tenang';
  let isKidultMusicActive = false;

  function applyKidultMood(moodKey, saveToState = true) {
    const moodData = KIDULT_MOODS[moodKey] || KIDULT_MOODS.tenang;
    currentKidultMoodKey = moodData.id;

    if (kidultMoodIcon) {
      kidultMoodIcon.textContent = moodData.icon;
    }
    if (kidultMoodText) {
      kidultMoodText.textContent = moodData.label;
    }
    if (kidultMoodSong) {
      kidultMoodSong.textContent = moodData.songTitle;
    }

    // Update active pill styling
    if (moodOptionPills && moodOptionPills.length > 0) {
      moodOptionPills.forEach((pill) => {
        const isCurrent = pill.getAttribute('data-mood') === moodData.id;
        pill.classList.toggle('active', isCurrent);
      });
    }

    if (saveToState) {
      // 1. Persist in Firestore via gazebo element state
      try {
        updateElementState('gazebo', { mood: moodData.id });
      } catch (err) {
        console.warn('Notice saving mood to state:', err);
      }

      // 2. Persist in localStorage per UID
      const userUid = activeAuthUser?.uid || '1uwba7MrGVU3xHu57VVLvztskrg2';
      try {
        localStorage.setItem(`olu_kidult_mood_${userUid}`, moodData.id);
      } catch (_) { }

      if (onTriggerSparkle) {
        onTriggerSparkle(160, window.innerHeight - 50);
      }
      if (onShowToast) {
        onShowToast(isKidultMusicActive
          ? `✨ Mood hari ini: ${moodData.icon} ${moodData.label} · Memutar: ${moodData.songTitle} ♫`
          : `✨ Mood hari ini: ${moodData.icon} ${moodData.label} · Rekomendasi lagu: ${moodData.songTitle} ♫`
        );
      }
    }
  }

  function restoreKidultMood() {
    const userUid = activeAuthUser?.uid || '1uwba7MrGVU3xHu57VVLvztskrg2';
    let savedMood = null;
    try {
      savedMood = localStorage.getItem(`olu_kidult_mood_${userUid}`);
    } catch (_) { }
    if (!savedMood && activeUniverseState?.elements?.gazebo?.mood) {
      savedMood = activeUniverseState.elements.gazebo.mood;
    }
    applyKidultMood(savedMood || 'tenang', false);
  }

  function toggleMoodPicker(forceOpen = null) {
    if (!kidultMoodOptionsBar) return;
    const isOpen = forceOpen !== null ? forceOpen : !kidultMoodOptionsBar.classList.contains('is-open');
    kidultMoodOptionsBar.classList.toggle('is-open', isOpen);
    if (btnToggleMoodPicker) {
      btnToggleMoodPicker.classList.toggle('is-active', isOpen);
    }
    if (isOpen && onTriggerSparkle) {
      onTriggerSparkle(180, window.innerHeight - 45);
    }
  }

  if (btnToggleMoodPicker) {
    btnToggleMoodPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMoodPicker();
    });
  }

  if (kidultMoodText) {
    kidultMoodText.style.cursor = 'pointer';
    kidultMoodText.title = 'Klik untuk memilih mood hari ini';
    kidultMoodText.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMoodPicker();
    });
  }

  if (moodOptionPills && moodOptionPills.length > 0) {
    moodOptionPills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const chosenMood = pill.getAttribute('data-mood');
        applyKidultMood(chosenMood, true);
        toggleMoodPicker(false); // Collapses back to compact view!
      });
    });
  }

  // Close mood options when clicking outside
  document.addEventListener('click', (e) => {
    if (kidultMoodContainer && !kidultMoodContainer.contains(e.target)) {
      toggleMoodPicker(false);
    }
  });

  if (btnKidultMoodPlay) {
    btnKidultMoodPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      isKidultMusicActive = !isKidultMusicActive;
      const moodData = KIDULT_MOODS[currentKidultMoodKey] || KIDULT_MOODS.tenang;
      if (kidultMusicIcon) {
        kidultMusicIcon.textContent = isKidultMusicActive ? '⏸' : '▶';
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || 120, e.clientY || window.innerHeight - 80);
      }
      if (onShowToast) {
        onShowToast(isKidultMusicActive
          ? `♫ Memutar ${moodData.songTitle}: ${moodData.songDesc} ✧`
          : '⏸ Alunan musik suasana dijeda ✧'
        );
      }
    });
  }

  // ==========================================================
  // TO YOU — BELLA'S 2D FAIRY FOREST WORLD CONTROLLER
  // ==========================================================
  const viewToYouWorld = document.getElementById('view-toyou-world');
  const btnToYouBack = document.getElementById('btn-toyou-back');
  const btnToYouBackTop = document.getElementById('btn-toyou-back-top');
  const btnToYouTopReturn = document.getElementById('btn-toyou-top-return');
  const toyouHotspots = document.querySelectorAll('.toyou-hotspot[data-toyou-loc]');
  const toyouQuickItems = document.querySelectorAll('.toyou-quick-item[data-toyou-nav]');
  const toyouLocationPanel = document.getElementById('toyou-location-panel');
  const toyouLocIcon = document.getElementById('toyou-loc-icon');
  const toyouLocTag = document.getElementById('toyou-loc-tag');
  const toyouLocTitle = document.getElementById('toyou-loc-title');
  const toyouLocSubtitle = document.getElementById('toyou-loc-subtitle');
  const toyouLocDesc = document.getElementById('toyou-loc-desc');
  const toyouLocHighlight = document.getElementById('toyou-loc-highlight');
  const btnToYouLocAction = document.getElementById('btn-toyou-loc-action');
  const toyouLocActionLabel = document.getElementById('toyou-loc-action-label');
  const btnCloseToYouPanel = document.getElementById('btn-close-toyou-panel');
  const btnToYouPanelDismiss = document.getElementById('btn-toyou-panel-dismiss');
  const toyouChibiActor = document.getElementById('toyou-chibi-actor');
  // TO YOU Mood and Music Elements
  const toyouMoodContainer = document.getElementById('toyou-mood-container');
  const toyouMoodCard = document.getElementById('toyou-mood-card');
  const toyouMoodIcon = document.getElementById('toyou-mood-icon');
  const toyouMoodText = document.getElementById('toyou-mood-text');
  const toyouMoodSong = document.getElementById('toyou-mood-song');
  const toyouMoodOptionsBar = document.getElementById('toyou-mood-options-bar');
  const toyouMoodOptionPills = document.querySelectorAll('.toyou-mood-option-pill');
  const btnToggleToYouMoodPicker = document.getElementById('btn-toggle-toyou-mood-picker');
  const btnToYouMoodPlay = document.getElementById('btn-toyou-mood-play');
  const toyouMusicIcon = document.getElementById('toyou-music-icon');
  
  const btnToYouOrbit = document.getElementById('btn-toyou-nav-orbit');
  if (btnToYouOrbit) {
    btnToYouOrbit.addEventListener('click', (e) => {
      if (onTriggerSparkle) onTriggerSparkle(e.clientX, e.clientY);
      if (typeof onNavigateOrbit === 'function') {
        onNavigateOrbit('view-toyou-world', 'lala');
      }
    });
  }
  const btnToYouStarMessages = document.getElementById('btn-toyou-star-messages');

  let activeToYouLocationKey = null;

  // Initialize Enchanted Bloom Cottage Controller (Bella / Lala 2D Simulation)
  // Initialize THE ECLIPSE Controller (The Author's Eternal Sanctuary - Lele 🌙)
  const eclipseCtrl = typeof initEclipseView === 'function' ? initEclipseView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewShadow = document.getElementById('view-shadow-world');
      if (viewShadow) {
        viewShadow.classList.add('active');
        viewShadow.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;

  const bloomCottageCtrl = typeof initBloomCottageView === 'function' ? initBloomCottageView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewToYou = document.getElementById('view-toyou-world');
      if (viewToYou) {
        viewToYou.classList.add('active');
        viewToYou.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;

  const fairyAtelierCtrl = typeof initFairyAtelierView === 'function' ? initFairyAtelierView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewToYou = document.getElementById('view-toyou-world');
      if (viewToYou) {
        viewToYou.classList.add('active');
        viewToYou.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;

  const toyouGazeboCtrl = typeof initToyouGazeboView === 'function' ? initToyouGazeboView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewToYou = document.getElementById('view-toyou-world');
      if (viewToYou) {
        viewToYou.classList.add('active');
        viewToYou.setAttribute('aria-hidden', 'false');
      }
    },
    onNavigateStoryWorkspace
  }) : null;

  function openToYouWorld(event) {
    closeAllUnivModals();
    closeKidultLocationPanel();
    closeShadowLocationPanel();

    const viewSel = document.getElementById('view-selection');
    const viewLog = document.getElementById('view-login');
    const viewUniv = document.getElementById('view-private-universe');
    const viewKidult = document.getElementById('view-kidult-world');
    const viewShadow = document.getElementById('view-shadow-world');
    const viewToYou = document.getElementById('view-toyou-world');

    if (viewSel) {
      viewSel.classList.remove('active');
      viewSel.setAttribute('aria-hidden', 'true');
    }
    if (viewLog) {
      viewLog.classList.remove('active');
      viewLog.setAttribute('aria-hidden', 'true');
    }
    if (viewUniv) {
      viewUniv.classList.remove('active');
      viewUniv.setAttribute('aria-hidden', 'true');
    }
    if (viewKidult) {
      viewKidult.classList.remove('active');
      viewKidult.setAttribute('aria-hidden', 'true');
    }
    if (viewShadow) {
      viewShadow.classList.remove('active');
      viewShadow.setAttribute('aria-hidden', 'true');
    }
    if (viewToYou) {
      viewToYou.classList.add('active');
      viewToYou.setAttribute('aria-hidden', 'false');
    }

    // Load persistent state and decorations from Firestore (Fase 8)
    loadUniverseState('lala', activeAuthUser);
    restoreToYouMood();
    subscribeToYouMailboxUnread(activeAuthUser?.uid);

    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
    if (onShowToast) {
      const isOwner = (activeUser === 'lala');
      onShowToast(isOwner ? '☼ Memasuki Dunia TO YOU — Selamat datang di Universe milikmu! (MY UNIVERSE)' : '✦ Mengunjungi Dunia TO YOU milik Lala — Mode Pengunjung (VISIT UNIVERSE) ✦');
    }
  }

  function closeToYouWorld() {
    flushPendingUniverseSave();
    closeToYouLocationPanel();
    if (bloomCottageCtrl && typeof bloomCottageCtrl.closeBloomCottage === 'function') {
      bloomCottageCtrl.closeBloomCottage();
    }
    if (toyouBehindCtrl && typeof toyouBehindCtrl.closeBehindFairy === 'function') {
      toyouBehindCtrl.closeBehindFairy();
    }
    const viewSel = document.getElementById('view-selection');
    const viewUniv = document.getElementById('view-private-universe');
    const viewShadow = document.getElementById('view-shadow-world');
    const viewToYou = document.getElementById('view-toyou-world');

    if (viewSel) {
      viewSel.classList.remove('active');
      viewSel.setAttribute('aria-hidden', 'true');
    }
    if (viewShadow) {
      viewShadow.classList.remove('active');
      viewShadow.setAttribute('aria-hidden', 'true');
    }
    if (viewToYou) {
      viewToYou.classList.remove('active');
      viewToYou.setAttribute('aria-hidden', 'true');
    }
    if (viewUniv) {
      viewUniv.classList.add('active');
      viewUniv.setAttribute('aria-hidden', 'false');
    }

    // Refresh user profile and island badges according to currently logged in character
    if (activeUser) {
      updateUserProfile(activeUser);
    }
    // Ensure navbar Universes button is active
    const navButtons = document.querySelectorAll('.univ-nav-btn');
    navButtons.forEach(b => b.classList.remove('active'));
    const btnUniv = document.getElementById('nav-btn-universes');
    if (btnUniv) btnUniv.classList.add('active');

    if (onShowToast) {
      onShowToast('🌌 Kembali ke Pemilihan Tiga Universe');
    }
  }

  function selectToYouLocation(locKey, event) {
    const loc = TOYOU_LOCATIONS[locKey];
    if (!loc) return;

    activeToYouLocationKey = locKey;

    toyouHotspots.forEach(h => {
      h.classList.toggle('active-loc', h.getAttribute('data-toyou-loc') === locKey);
    });
    toyouQuickItems.forEach(q => {
      q.classList.toggle('active-nav', q.getAttribute('data-toyou-nav') === locKey);
    });

    if (toyouLocIcon) toyouLocIcon.textContent = loc.icon;
    if (toyouLocTag) toyouLocTag.textContent = loc.tag;
    if (toyouLocTitle) toyouLocTitle.textContent = loc.title;
    if (toyouLocSubtitle) toyouLocSubtitle.textContent = loc.subtitle;
    if (toyouLocDesc) toyouLocDesc.textContent = loc.description;
    if (toyouLocHighlight) toyouLocHighlight.textContent = loc.highlight;
    if (toyouLocActionLabel) toyouLocActionLabel.textContent = loc.actionLabel;

    if (toyouLocationPanel) {
      toyouLocationPanel.classList.add('open');
      toyouLocationPanel.setAttribute('aria-hidden', 'false');
    }

    // Render interactive element state (Fase 8)
    renderLocationElementState('toyou', locKey);

    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
    if (onShowToast && loc.toastMsg) {
      onShowToast(loc.toastMsg);
    }
  }

  function closeToYouLocationPanel() {
    activeToYouLocationKey = null;
    toyouHotspots.forEach(h => h.classList.remove('active-loc'));
    toyouQuickItems.forEach(q => q.classList.remove('active-nav'));
    const box = document.getElementById('toyou-element-state-box');
    if (box) box.style.display = 'none';
    if (toyouLocationPanel) {
      toyouLocationPanel.classList.remove('open');
      toyouLocationPanel.setAttribute('aria-hidden', 'true');
    }
  }

  toyouHotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = btn.getAttribute('data-toyou-loc');
      if (locKey === 'gazebo' && activeToYouLocationKey === 'gazebo') {
        if (toyouGazeboCtrl && typeof toyouGazeboCtrl.openToyouGazebo === 'function') {
          closeToYouLocationPanel();
          if (viewToYouWorld) {
            viewToYouWorld.classList.remove('active');
            viewToYouWorld.setAttribute('aria-hidden', 'true');
          }
          toyouGazeboCtrl.openToyouGazebo(activeCharacterKey || activeUser || 'lala');
          return;
        }
      }
      if (locKey === 'atelier' && activeToYouLocationKey === 'atelier') {
        if (fairyAtelierCtrl && typeof fairyAtelierCtrl.openFairyAtelier === 'function') {
          closeToYouLocationPanel();
          if (viewToYouWorld) {
            viewToYouWorld.classList.remove('active');
            viewToYouWorld.setAttribute('aria-hidden', 'true');
          }
          fairyAtelierCtrl.openFairyAtelier(activeCharacterKey || activeUser || 'lala');
          return;
        }
      }
      if (locKey === 'rumah' && activeToYouLocationKey === 'rumah') {
        // If already selected and clicked again, enter immediately
        if (bloomCottageCtrl && typeof bloomCottageCtrl.openBloomCottage === 'function') {
          closeToYouLocationPanel();
          if (viewToYouWorld) {
            viewToYouWorld.classList.remove('active');
            viewToYouWorld.setAttribute('aria-hidden', 'true');
          }
          bloomCottageCtrl.openBloomCottage(activeCharacterKey || activeUser || 'lala');
          return;
        }
      }
      if (locKey === 'kotak_pos' && activeToYouLocationKey === 'kotak_pos') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        if (typeof onNavigateKotakPos === 'function') {
          onNavigateKotakPos('to_you');
          return;
        }
      }
      selectToYouLocation(locKey, e);
    });
  });

  toyouQuickItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = item.getAttribute('data-toyou-nav');
      if (locKey === 'rumah' && activeToYouLocationKey === 'rumah') {
        // If already selected and clicked again, enter immediately
        if (bloomCottageCtrl && typeof bloomCottageCtrl.openBloomCottage === 'function') {
          closeToYouLocationPanel();
          if (viewToYouWorld) {
            viewToYouWorld.classList.remove('active');
            viewToYouWorld.setAttribute('aria-hidden', 'true');
          }
          bloomCottageCtrl.openBloomCottage(activeCharacterKey || activeUser || 'lala');
          return;
        }
      }
      selectToYouLocation(locKey, e);
    });
  });

  toyouHotspots.forEach(btn => {
    btn.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const locKey = btn.getAttribute('data-toyou-loc');
      if (locKey === 'gazebo' && toyouGazeboCtrl && typeof toyouGazeboCtrl.openToyouGazebo === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        toyouGazeboCtrl.openToyouGazebo(activeCharacterKey || activeUser || 'lala');
        return;
      }
      if (locKey === 'atelier' && fairyAtelierCtrl && typeof fairyAtelierCtrl.openFairyAtelier === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        fairyAtelierCtrl.openFairyAtelier(activeCharacterKey || activeUser || 'lala');
        return;
      }
      if (locKey === 'kotak_pos' && typeof onNavigateKotakPos === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateKotakPos('to_you');
      }
    });
  });

  if (btnCloseToYouPanel) {
    btnCloseToYouPanel.addEventListener('click', closeToYouLocationPanel);
  }
  if (btnToYouPanelDismiss) {
    btnToYouPanelDismiss.addEventListener('click', closeToYouLocationPanel);
  }

  if (btnToYouLocAction) {
    btnToYouLocAction.addEventListener('click', (e) => {
      const loc = TOYOU_LOCATIONS[activeToYouLocationKey];
      if (!loc) return;
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if (loc.actionType === 'toyou_gazebo') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        if (toyouGazeboCtrl && typeof toyouGazeboCtrl.openToyouGazebo === 'function') {
          toyouGazeboCtrl.openToyouGazebo(activeCharacterKey || activeUser || 'lala');
        }
      } else if (loc.actionType === 'fairy_atelier') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        if (fairyAtelierCtrl && typeof fairyAtelierCtrl.openFairyAtelier === 'function') {
          fairyAtelierCtrl.openFairyAtelier(activeCharacterKey || activeUser || 'lala');
        }
      } else if (loc.actionType === 'bloom_cottage') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        if (bloomCottageCtrl && typeof bloomCottageCtrl.openBloomCottage === 'function') {
          bloomCottageCtrl.openBloomCottage(activeCharacterKey || activeUser || 'lala');
        }
      } else if (loc.actionType === 'orbit' && typeof onNavigateOrbit === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateOrbit('view-toyou-world');
      } else if (loc.actionType === 'star_messages' && typeof onNavigateStarMessages === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateStarMessages('to_you');
      } else if (loc.actionType === 'kotak_pos' && typeof onNavigateKotakPos === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateKotakPos('to_you');
      } else if (loc.actionType === 'moments' && typeof onNavigateMoments === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateMoments('view-toyou-world');
      } else if (onShowToast) {
        onShowToast(loc.toastMsg);
      }
    });
  }

  if (toyouChibiActor) {
    toyouChibiActor.addEventListener('click', (e) => {
      e.stopPropagation();
      toyouChibiActor.classList.add('bubble-open');
      setTimeout(() => toyouChibiActor.classList.remove('bubble-open'), 3200);
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if (onShowToast) {
        onShowToast('☼ Lala: "Selamat pagi di dunia TO YOU milik Bella! Klik lokasi mana saja atau daftar di kanan untuk menjelajah~"');
      }
    });
  }

  if (btnToYouBack) {
    btnToYouBack.addEventListener('click', closeToYouWorld);
  }
  if (btnToYouBackTop) {
    btnToYouBackTop.addEventListener('click', closeToYouWorld);
  }
  if (btnToYouTopReturn) {
    btnToYouTopReturn.addEventListener('click', closeToYouWorld);
  }
  const btnToYouStory = document.getElementById('btn-toyou-story');
  if (btnToYouStory) {
    btnToYouStory.addEventListener('click', () => {
      if (typeof onNavigateStoryWorkspace === 'function') {
        if (viewToYouWorld) viewToYouWorld.classList.remove('active');
        onNavigateStoryWorkspace('view-toyou-world', 'my-works');
      }
    });
  }

  const btnToYouPhotobooth = document.getElementById('btn-toyou-photobooth');
  if (btnToYouPhotobooth) {
    btnToYouPhotobooth.addEventListener('click', () => {
      if (typeof onNavigatePhotobooth === 'function') {
        if (viewToYouWorld) viewToYouWorld.classList.remove('active');
        onNavigatePhotobooth('view-toyou-world', 'lala');
      } else if (window.photoboothController && typeof window.photoboothController.openPhotobooth === 'function') {
        if (viewToYouWorld) viewToYouWorld.classList.remove('active');
        window.photoboothController.openPhotobooth('view-toyou-world', 'lala');
      }
    });
  }

  // Interactive Lala Character Card click feedback
  const toyouCharCard = document.getElementById('toyou-char-card');
  if (toyouCharCard) {
    toyouCharCard.addEventListener('click', (e) => {
      e.stopPropagation();
      if (toyouChibiActor) {
        toyouChibiActor.classList.add('bubble-open');
        setTimeout(() => toyouChibiActor.classList.remove('bubble-open'), 3200);
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 4, e.clientY || window.innerHeight / 4);
      }
      if (onShowToast) {
        onShowToast('☼ Lala — The Everglow Fairy: "Small joy, make a big universe! Selamat menjelajahi dunia Bella~"');
      }
    });
  }


  // ==========================================================
  // TO YOU — KOTAK POS UNREAD NOTIFICATION LISTENER
  // ==========================================================
  let toyouMailboxUnsub = null;

  function updateToYouMailboxBadge(unreadCount) {
    const badge = document.getElementById('toyou-mailbox-unread-badge');
    const hotspot = document.querySelector('.hotspot-toyou-kotakpos');
    const loc = TOYOU_LOCATIONS?.kotak_pos;
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = 'inline-flex';
        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
      } else {
        badge.style.display = 'none';
      }
    }
    if (hotspot) {
      hotspot.classList.toggle('has-unread', unreadCount > 0);
    }
    if (loc) {
      loc.highlight = unreadCount > 0
        ? `💌 ${unreadCount} Surat baru menunggumu di Kotak Pos TO YOU!`
        : '💌 Kotak surat TO YOU siap menerima dan mengirim pesan persahabatan';
    }
  }

  function subscribeToYouMailboxUnread(uid) {
    if (typeof toyouMailboxUnsub === 'function') {
      try { toyouMailboxUnsub(); } catch (_) {}
      toyouMailboxUnsub = null;
    }
    const targetUid = uid || (activeAuthUser?.uid) || 'EqByKA8FXoTEt0OmIsSDPfnxMDB3';
    try {
      toyouMailboxUnsub = dbSubscribeLetters({ uid: targetUid }, (letters) => {
        const incoming = (letters || []).filter(l => l.recipientUid === targetUid);
        const unread = incoming.filter(l => !l.read).length;
        updateToYouMailboxBadge(unread);
      }, (err) => {
        console.warn('Notice subscribing TO YOU mailbox unread:', err);
        dbFetchLetters({ uid: targetUid }).then(letters => {
          const incoming = (letters || []).filter(l => l.recipientUid === targetUid);
          const unread = incoming.filter(l => !l.read).length;
          updateToYouMailboxBadge(unread);
        }).catch(() => {});
      });
    } catch (e) {
      console.warn('Notice setting up TO YOU mailbox unread listener:', e);
    }
  }

  // ==========================================================
  // TO YOU — MINIMALIST MOOD PICKER & FAIRY MUSIC CONTROLLER (LALA ☼)
  // ==========================================================
  let currentToYouMoodKey = 'tenang';
  let isToYouMusicActive = false;

  function applyToYouMood(moodKey, saveToState = true) {
    const moodData = TOYOU_MOODS[moodKey] || TOYOU_MOODS.tenang;
    currentToYouMoodKey = moodData.id;

    if (toyouMoodIcon) {
      toyouMoodIcon.textContent = moodData.icon;
    }
    if (toyouMoodText) {
      toyouMoodText.textContent = moodData.label;
    }
    if (toyouMoodSong) {
      toyouMoodSong.textContent = moodData.songTitle;
    }

    if (toyouMoodOptionPills && toyouMoodOptionPills.length > 0) {
      toyouMoodOptionPills.forEach((pill) => {
        const isCurrent = pill.getAttribute('data-mood') === moodData.id;
        pill.classList.toggle('active', isCurrent);
      });
    }

    if (saveToState) {
      try {
        updateElementState('gazebo', { mood: moodData.id });
      } catch (err) {
        console.warn('Notice saving Lala mood to state:', err);
      }

      const userUid = activeAuthUser?.uid || '1uwba7MrGVU3xHu57VVLvztskrg2';
      try {
        localStorage.setItem(`olu_toyou_mood_${userUid}`, moodData.id);
      } catch (_) { }

      if (onTriggerSparkle) {
        onTriggerSparkle(160, window.innerHeight - 50);
      }
      if (onShowToast) {
        onShowToast(isToYouMusicActive
          ? `☼ Mood hari ini: ${moodData.icon} ${moodData.label} · Memutar: ${moodData.songTitle} ♫`
          : `☼ Mood hari ini: ${moodData.icon} ${moodData.label} · Rekomendasi lagu: ${moodData.songTitle} ♫`
        );
      }
    }
  }

  function restoreToYouMood() {
    const userUid = activeAuthUser?.uid || '1uwba7MrGVU3xHu57VVLvztskrg2';
    let savedMood = null;
    try {
      savedMood = localStorage.getItem(`olu_toyou_mood_${userUid}`);
    } catch (_) { }
    if (!savedMood && activeUniverseState?.elements?.gazebo?.mood) {
      savedMood = activeUniverseState.elements.gazebo.mood;
    }
    applyToYouMood(savedMood || 'tenang', false);
  }

  function toggleToYouMoodPicker(forceOpen = null) {
    if (!toyouMoodOptionsBar) return;
    const isOpen = forceOpen !== null ? forceOpen : !toyouMoodOptionsBar.classList.contains('is-open');
    toyouMoodOptionsBar.classList.toggle('is-open', isOpen);
    if (btnToggleToYouMoodPicker) {
      btnToggleToYouMoodPicker.classList.toggle('is-active', isOpen);
    }
    if (isOpen && onTriggerSparkle) {
      onTriggerSparkle(180, window.innerHeight - 45);
    }
  }

  if (btnToggleToYouMoodPicker) {
    btnToggleToYouMoodPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleToYouMoodPicker();
    });
  }

  if (toyouMoodText) {
    toyouMoodText.style.cursor = 'pointer';
    toyouMoodText.title = 'Klik untuk memilih mood hari ini';
    toyouMoodText.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleToYouMoodPicker();
    });
  }

  if (toyouMoodOptionPills && toyouMoodOptionPills.length > 0) {
    toyouMoodOptionPills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const chosenMood = pill.getAttribute('data-mood');
        applyToYouMood(chosenMood, true);
        toggleToYouMoodPicker(false);
      });
    });
  }

  // Close mood options when clicking outside
  document.addEventListener('click', (e) => {
    if (toyouMoodContainer && !toyouMoodContainer.contains(e.target)) {
      toggleToYouMoodPicker(false);
    }
  });

  if (btnToYouMoodPlay) {
    btnToYouMoodPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      isToYouMusicActive = !isToYouMusicActive;
      const moodData = TOYOU_MOODS[currentToYouMoodKey] || TOYOU_MOODS.tenang;
      if (toyouMusicIcon) {
        toyouMusicIcon.textContent = isToYouMusicActive ? '⏸' : '▶';
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || 120, e.clientY || window.innerHeight - 80);
      }
      if (onShowToast) {
        onShowToast(isToYouMusicActive
          ? `♫ Memutar ${moodData.songTitle}: ${moodData.songDesc} ☼`
          : '⏸ Alunan musik suasana TO YOU dijeda ☼'
        );
      }
    });
  }

  // Top-left Quick Action Pill for Star Messages (Teleskop)
  if (btnToYouStarMessages) {
    btnToYouStarMessages.addEventListener('click', (e) => {
      e.stopPropagation();
      selectToYouLocation('teleskop', e);
    });
  }

  // Subtle 2D Multi-Layer Parallax on Mouse Move inside TO YOU World (Respects prefers-reduced-motion)
  const toyouStage = document.getElementById('toyou-2d-stage');
  if (viewToYouWorld && toyouStage) {
    let parallaxRaf = null;
    const reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

    viewToYouWorld.addEventListener('pointermove', (e) => {
      if (reducedMotionQuery.matches) return;
      if (parallaxRaf) return;
      parallaxRaf = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
        toyouStage.style.setProperty('--toyou-px', `${(nx * 7).toFixed(2)}px`);
        toyouStage.style.setProperty('--toyou-py', `${(ny * 5).toFixed(2)}px`);
        parallaxRaf = null;
      });
    });

    viewToYouWorld.addEventListener('pointerleave', () => {
      toyouStage.style.setProperty('--toyou-px', '0px');
      toyouStage.style.setProperty('--toyou-py', '0px');
    });
  }

  // ==========================================================
  // SHADOW — LELE'S 2D CRYSTAL MOON SANCTUARY WORLD CONTROLLER
  // ==========================================================
  const viewShadowWorld = document.getElementById('view-shadow-world');
  const btnShadowBack = document.getElementById('btn-shadow-back');
  const btnShadowBackTop = document.getElementById('btn-shadow-back-top');
  
  const btnShadowOrbit = document.getElementById('btn-shadow-nav-orbit');
  if (btnShadowOrbit) {
    btnShadowOrbit.addEventListener('click', (e) => {
      if (onTriggerSparkle) onTriggerSparkle(e.clientX, e.clientY);
      if (typeof onNavigateOrbit === 'function') {
        onNavigateOrbit('view-shadow-world', 'lele');
      }
    });
  }
  const btnShadowTopReturn = document.getElementById('btn-shadow-top-return');
  const shadowHotspots = document.querySelectorAll('.shadow-hotspot[data-shadow-loc]');
  const shadowLocationPanel = document.getElementById('shadow-location-panel');
  const shadowLocIcon = document.getElementById('shadow-loc-icon');
  const shadowLocTag = document.getElementById('shadow-loc-tag');
  const shadowLocTitle = document.getElementById('shadow-loc-title');
  const shadowLocSubtitle = document.getElementById('shadow-loc-subtitle');
  const shadowLocDesc = document.getElementById('shadow-loc-desc');
  const shadowLocHighlight = document.getElementById('shadow-loc-highlight');
  const btnShadowLocAction = document.getElementById('btn-shadow-loc-action');
  const shadowLocActionLabel = document.getElementById('shadow-loc-action-label');
  const btnCloseShadowPanel = document.getElementById('btn-close-shadow-panel');
  const btnShadowPanelDismiss = document.getElementById('btn-shadow-panel-dismiss');
  const shadowChibiActor = document.getElementById('shadow-chibi-actor');

  let activeShadowLocationKey = null;

  function openShadowWorld(event) {
    closeAllUnivModals();
    closeKidultLocationPanel();
    closeToYouLocationPanel();

    const viewSel = document.getElementById('view-selection');
    const viewLog = document.getElementById('view-login');
    const viewUniv = document.getElementById('view-private-universe');
    const viewKidult = document.getElementById('view-kidult-world');
    const viewToYou = document.getElementById('view-toyou-world');
    const viewShadow = document.getElementById('view-shadow-world');

    if (viewSel) {
      viewSel.classList.remove('active');
      viewSel.setAttribute('aria-hidden', 'true');
    }
    if (viewLog) {
      viewLog.classList.remove('active');
      viewLog.setAttribute('aria-hidden', 'true');
    }
    if (viewUniv) {
      viewUniv.classList.remove('active');
      viewUniv.setAttribute('aria-hidden', 'true');
    }
    if (viewKidult) {
      viewKidult.classList.remove('active');
      viewKidult.setAttribute('aria-hidden', 'true');
    }
    if (viewToYou) {
      viewToYou.classList.remove('active');
      viewToYou.setAttribute('aria-hidden', 'true');
    }
    if (viewShadow) {
      viewShadow.classList.add('active');
      viewShadow.setAttribute('aria-hidden', 'false');
    }

    // Load persistent state and decorations from Firestore (Fase 8)
    loadUniverseState('lele', activeAuthUser);
    if (shadowMoodCtrl && typeof shadowMoodCtrl.restoreShadowMood === 'function') {
      shadowMoodCtrl.restoreShadowMood(activeAuthUser?.uid || LELE_UID);
    }

    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
    if (onShowToast) {
      const isOwner = (activeUser === 'lele');
      onShowToast(isOwner ? '☾ Memasuki Dunia SHADOW — Selamat datang di Universe milikmu! (MY UNIVERSE)' : '✦ Mengunjungi Dunia SHADOW milik Lele — Mode Pengunjung (VISIT UNIVERSE) ✦');
    }
  }

  function closeShadowWorld() {
    flushPendingUniverseSave();
    closeShadowLocationPanel();
    if (typeof closeBehindShadow === 'function') {
      closeBehindShadow();
    }
    const viewSel = document.getElementById('view-selection');
    const viewUniv = document.getElementById('view-private-universe');
    const viewKidult = document.getElementById('view-kidult-world');
    const viewToYou = document.getElementById('view-toyou-world');
    const viewShadow = document.getElementById('view-shadow-world');

    if (viewSel) {
      viewSel.classList.remove('active');
      viewSel.setAttribute('aria-hidden', 'true');
    }
    if (viewKidult) {
      viewKidult.classList.remove('active');
      viewKidult.setAttribute('aria-hidden', 'true');
    }
    if (viewToYou) {
      viewToYou.classList.remove('active');
      viewToYou.setAttribute('aria-hidden', 'true');
    }
    if (viewShadow) {
      viewShadow.classList.remove('active');
      viewShadow.setAttribute('aria-hidden', 'true');
    }
    if (viewUniv) {
      viewUniv.classList.add('active');
      viewUniv.setAttribute('aria-hidden', 'false');
    }

    // Refresh user profile and island badges according to currently logged in character
    if (activeUser) {
      updateUserProfile(activeUser);
    }
    // Ensure navbar Universes button is active
    const navButtons = document.querySelectorAll('.univ-nav-btn');
    navButtons.forEach(b => b.classList.remove('active'));
    const btnUniv = document.getElementById('nav-btn-universes');
    if (btnUniv) btnUniv.classList.add('active');

    if (onShowToast) {
      onShowToast('🌌 Kembali ke Pemilihan Tiga Universe');
    }
  }

  function selectShadowLocation(locKey, event) {
    const loc = SHADOW_LOCATIONS[locKey];
    if (!loc) return;

    activeShadowLocationKey = locKey;

    shadowHotspots.forEach(h => {
      h.classList.toggle('active-loc', h.getAttribute('data-shadow-loc') === locKey);
    });

    if (shadowLocIcon) shadowLocIcon.textContent = loc.icon;
    if (shadowLocTag) shadowLocTag.textContent = loc.tag;
    if (shadowLocTitle) shadowLocTitle.textContent = loc.title;
    if (shadowLocSubtitle) shadowLocSubtitle.textContent = loc.subtitle;
    if (shadowLocDesc) shadowLocDesc.textContent = loc.description;
    if (shadowLocHighlight) shadowLocHighlight.textContent = loc.highlight;
    if (shadowLocActionLabel) shadowLocActionLabel.textContent = loc.actionLabel;

    if (shadowLocationPanel) {
      shadowLocationPanel.classList.add('open');
      shadowLocationPanel.setAttribute('aria-hidden', 'false');
    }

    // Render interactive element state (Fase 8)
    renderLocationElementState('shadow', locKey);

    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
    if (onShowToast && loc.toastMsg) {
      onShowToast(loc.toastMsg);
    }
  }

  function closeShadowLocationPanel() {
    activeShadowLocationKey = null;
    shadowHotspots.forEach(h => h.classList.remove('active-loc'));
    const box = document.getElementById('shadow-element-state-box');
    if (box) box.style.display = 'none';
    if (shadowLocationPanel) {
      shadowLocationPanel.classList.remove('open');
      shadowLocationPanel.setAttribute('aria-hidden', 'true');
    }
  }

  shadowHotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = btn.getAttribute('data-shadow-loc');
      if (shadowKingdomFx) {
        shadowKingdomFx.triggerClickBurst(e.clientX, e.clientY);
      }
      if (locKey === 'rumah_kristal') {
        const currentUser = activeUser || activeCharacterKey || 'lele';
        if (!isAuthorAuthorized(currentUser)) {
          if (onShowToast) {
            onShowToast('✦ THE ECLIPSE adalah rumah privat Lele 🌙 (The Author). Akses dibatasi oleh segel gerhana abadi.');
          }
          return;
        }
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        if (eclipseCtrl && typeof eclipseCtrl.openEclipseSanctuary === 'function') {
          eclipseCtrl.openEclipseSanctuary(currentUser, 'grand_hall');
        }
        if (onTriggerSparkle) {
          onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
        }
        if (onShowToast) {
          onShowToast('👑 Memasuki THE ECLIPSE — Rumah Utama Lele 🌙');
        }
        return;
      }
      selectShadowLocation(locKey, e);
    });
  });



  if (btnCloseShadowPanel) {
    btnCloseShadowPanel.addEventListener('click', closeShadowLocationPanel);
  }
  if (btnShadowPanelDismiss) {
    btnShadowPanelDismiss.addEventListener('click', closeShadowLocationPanel);
  }

  const runShadowLocationNav = (navigateFn) => {
    closeShadowLocationPanel();
    const doNavigate = () => {
      if (viewShadowWorld) {
        viewShadowWorld.classList.remove('active');
        viewShadowWorld.setAttribute('aria-hidden', 'true');
      }
      navigateFn();
    };
    if (shadowKingdomFx && typeof shadowKingdomFx.triggerTransition === 'function') {
      shadowKingdomFx.triggerTransition(doNavigate);
    } else {
      doNavigate();
    }
  };

  if (btnShadowLocAction) {
    btnShadowLocAction.addEventListener('click', (e) => {
      const loc = SHADOW_LOCATIONS[activeShadowLocationKey];
      if (!loc) return;
      if (shadowKingdomFx) {
        shadowKingdomFx.triggerClickBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if ((loc.actionType === 'eclipse_sanctuary' || loc.actionType === 'shadow_crystal_tower')) {
        const currentUser = activeUser || activeCharacterKey || 'lele';
        if (!isAuthorAuthorized(currentUser)) {
          if (onShowToast) {
            onShowToast('✦ THE ECLIPSE adalah rumah privat Lele 🌙 (The Author). Akses dibatasi oleh segel gerhana abadi.');
          }
          return;
        }
        runShadowLocationNav(() => {
          if (eclipseCtrl && typeof eclipseCtrl.openEclipseSanctuary === 'function') {
            eclipseCtrl.openEclipseSanctuary(currentUser, 'grand_hall');
          }
        });
      } else if (loc.actionType === 'orbit' && typeof onNavigateOrbit === 'function') {
        runShadowLocationNav(() => onNavigateOrbit('view-shadow-world'));
      } else if (loc.actionType === 'star_messages' && typeof onNavigateStarMessages === 'function') {
        runShadowLocationNav(() => onNavigateStarMessages('shadow'));
      } else if (loc.actionType === 'kotak_pos' && typeof onNavigateKotakPos === 'function') {
        runShadowLocationNav(() => onNavigateKotakPos('shadow'));
      } else if (loc.actionType === 'shadow_gazebo' && typeof onNavigateShadowGazebo === 'function') {
        runShadowLocationNav(() => onNavigateShadowGazebo());
      } else if (loc.actionType === 'shadow_garden' && typeof onNavigateShadowGarden === 'function') {
        runShadowLocationNav(() => onNavigateShadowGarden());
      } else if (loc.actionType === 'shadow_art_gallery' && typeof onNavigateShadowArtGallery === 'function') {
        runShadowLocationNav(() => onNavigateShadowArtGallery());
      } else if (loc.actionType === 'moments' && typeof onNavigateMoments === 'function') {
        runShadowLocationNav(() => onNavigateMoments('view-shadow-world'));
      } else if (onShowToast) {
        onShowToast(loc.toastMsg);
      }
    });
  }

  if (shadowChibiActor) {
    shadowChibiActor.addEventListener('click', (e) => {
      e.stopPropagation();
      shadowChibiActor.classList.add('bubble-open');
      setTimeout(() => shadowChibiActor.classList.remove('bubble-open'), 3200);
      if (shadowKingdomFx) {
        shadowKingdomFx.triggerClickBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if (onShowToast) {
        onShowToast('☾ Lele: "Find your light in the darkness. Klik lokasi kristal mana saja atau daftar di kanan untuk menjelajah~"');
      }
    });
  }

  if (btnShadowBack) {
    btnShadowBack.addEventListener('click', closeShadowWorld);
  }
  if (btnShadowBackTop) {
    btnShadowBackTop.addEventListener('click', closeShadowWorld);
  }
  if (btnShadowTopReturn) {
    btnShadowTopReturn.addEventListener('click', closeShadowWorld);
  }
  const btnShadowStory = document.getElementById('btn-shadow-story');
  if (btnShadowStory) {
    btnShadowStory.addEventListener('click', () => {
      if (typeof onNavigateStoryWorkspace === 'function') {
        if (viewShadowWorld) viewShadowWorld.classList.remove('active');
        onNavigateStoryWorkspace('view-shadow-world', 'my-works');
      }
    });
  }

  const btnShadowPhotobooth = document.getElementById('btn-shadow-photobooth');
  if (btnShadowPhotobooth) {
    btnShadowPhotobooth.addEventListener('click', () => {
      if (typeof onNavigatePhotobooth === 'function') {
        if (viewShadowWorld) viewShadowWorld.classList.remove('active');
        onNavigatePhotobooth('view-shadow-world', 'lele');
      } else if (window.photoboothController && typeof window.photoboothController.openPhotobooth === 'function') {
        if (viewShadowWorld) viewShadowWorld.classList.remove('active');
        window.photoboothController.openPhotobooth('view-shadow-world', 'lele');
      }
    });
  }

  // Interactive Lele Character Card click feedback
  const shadowCharCard = document.getElementById('shadow-char-card');
  if (shadowCharCard) {
    shadowCharCard.addEventListener('click', (e) => {
      e.stopPropagation();
      if (shadowChibiActor) {
        shadowChibiActor.classList.add('bubble-open');
        setTimeout(() => shadowChibiActor.classList.remove('bubble-open'), 3200);
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 4, e.clientY || window.innerHeight / 4);
      }
      if (onShowToast) {
        onShowToast('☾ Lele — The Eclipse Guardian: "In the darkest night, we bloom the brightest. Selamat datang di Crystal Moon Sanctuary~"');
      }
    });
  }

  // Subtle 2D Multi-Layer Parallax & Luxury Crystal FX inside SHADOW World (Respects prefers-reduced-motion)
  const shadowStage = document.getElementById('shadow-2d-stage');
  const shadowMagicCanvas = document.getElementById('shadow-magic-canvas');
  const shadowKingdomFx = (viewShadowWorld && shadowMagicCanvas)
    ? initShadowKingdomFx(viewShadowWorld, shadowMagicCanvas)
    : null;
  if (viewShadowWorld && shadowStage) {
    let shadowParallaxRaf = null;
    const reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

    viewShadowWorld.addEventListener('pointermove', (e) => {
      if (reducedMotionQuery.matches) return;
      if (shadowParallaxRaf) return;
      shadowParallaxRaf = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
        shadowStage.style.setProperty('--shadow-px', `${(nx * 7).toFixed(2)}px`);
        shadowStage.style.setProperty('--shadow-py', `${(ny * 5).toFixed(2)}px`);
        shadowParallaxRaf = null;
      });
    });

    viewShadowWorld.addEventListener('pointerleave', () => {
      shadowStage.style.setProperty('--shadow-px', '0px');
      shadowStage.style.setProperty('--shadow-py', '0px');
    });
  }

  if (btnModalSwitchChar) {
    btnModalSwitchChar.addEventListener('click', () => {
      closeAllUnivModals();
      const univ = UNIVERSE_DATA[currentActiveUnivKey];
      if (univ && typeof onSwitchCharacter === 'function') {
        onSwitchCharacter(univ.charKey);
      }
    });
  }

  // 6. Close Modal Buttons & Overlay Click
  document.querySelectorAll('.univ-modal-close, [data-close-univ-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllUnivModals();
    });
  });

  document.querySelectorAll('.univ-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAllUnivModals();
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllUnivModals();
      closeKidultLocationPanel();
      closeToYouLocationPanel();
      closeShadowLocationPanel();
    }
  });

  function closeAllUnivModals() {
    document.querySelectorAll('.univ-modal-overlay').forEach(m => {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
  }

  // 7. Bottom Button: "Which universe will you visit today?"
  if (btnWhichUniverse) {
    btnWhichUniverse.addEventListener('click', (e) => {
      const rect = btnWhichUniverse.getBoundingClientRect();
      if (onTriggerSparkle) {
        onTriggerSparkle(rect.left + rect.width / 2, rect.top);
      }

      // Stagger highlight on all three islands
      islandCards.forEach((c, idx) => {
        setTimeout(() => {
          c.classList.add('island-highlight-pulse');
          setTimeout(() => c.classList.remove('island-highlight-pulse'), 1200);
        }, idx * 250);
      });

      if (onShowToast) {
        onShowToast('✦ Pilih salah satu pulau universe di atas untuk dijelajahi ✦');
      }
    });
  }

  // 8. Update Active User Profile in Universes Header & Island Access Badges
  function updateUserProfile(charKey, authUser = null) {
    if (!charKey) return;
    if (authUser) {
      activeAuthUser = authUser;
    }

    // Primary Character Master Map matching character identities
    const CHAR_MAP = {
      nyanya: {
        name: 'Nyanya',
        role: 'The Moonlit Shadow Witch',
        symbol: '★',
        avatarUrl: '/assets/avatar_nyanya_hd.png',
        myUniverse: 'kidult'
      },
      lala: {
        name: 'Lala',
        role: 'The Everglow Fairy',
        symbol: '☼',
        avatarUrl: '/assets/avatar_lala_hd.png',
        myUniverse: 'to_you'
      },
      lele: {
        name: 'Lele',
        role: 'The Eclipse Guardian',
        symbol: '☾',
        avatarUrl: '/assets/avatar_lele_hd.png',
        myUniverse: 'shadow'
      },
      abil: {
        name: 'Syma',
        role: 'PINWHEEL ☁️',
        symbol: '☁️',
        avatarUrl: '/assets/avatar_abil_hd.jpg',
        myUniverse: 'pinwheel'
      },
      akhira: {
        name: 'Akhira',
        role: 'YAWN ⚡',
        symbol: '⚡',
        avatarUrl: '/assets/avatar_akhira_hd.jpg',
        myUniverse: 'yawn'
      },
      ela: {
        name: 'Ela',
        role: 'US AGAIN 🌸',
        symbol: '🌸',
        avatarUrl: '/assets/avatar_ela_hd.jpg',
        myUniverse: 'us_again'
      },
      ruben: {
        name: 'Ruben',
        role: 'ASH ❄️',
        symbol: '❄️',
        avatarUrl: '/assets/avatar_ruben_hd.jpg',
        myUniverse: 'ash'
      },
      royan: {
        name: 'Royan',
        role: 'The Gentle Guardian · Elven',
        symbol: '🎆',
        avatarUrl: '/assets/avatar_royan_hd.jpg',
        myUniverse: 'hot'
      }
    };

    const normalizedKey = (
      (charKey === 'alenda' || charKey === 'nyanya' || charKey === 'ale' || charKey === 'alenda_nyanya') ? 'nyanya' :
        (charKey === 'bella' || charKey === 'lala') ? 'lala' :
          (charKey === 'vanya' || charKey === 'lele' || charKey === 'alenda_lele') ? 'lele' :
            (charKey === 'abil' || charKey === 'syma' || charKey === 'pinwheel') ? 'abil' :
              (charKey === 'akhira' || charKey === 'yawn') ? 'akhira' :
                (charKey === 'ela' || charKey === 'us_again' || charKey === 'us again') ? 'ela' :
                  (charKey === 'ruben' || charKey === 'ash') ? 'ruben' :
                    (charKey === 'royan' || charKey === 'hot') ? 'royan' :
                      (charKey ? charKey.toLowerCase() : 'nyanya')
    );
    const char = CHAR_MAP[normalizedKey];
    if (!char) return;
    activeCharacterKey = normalizedKey;
    activeUser = char.name.toLowerCase();

    // 1. Update Profile Greeting & Avatar Pill
    if (userGreetingEl) {
      userGreetingEl.textContent = `Hello, ${char.name}`;
    }
    if (userAvatarEl) {
      userAvatarEl.src = char.avatarUrl;
      userAvatarEl.alt = char.name;
    }

    // Update World HUD Greetings & Avatars if present
    const kidultGreeting = document.getElementById('kidult-user-greeting');
    if (kidultGreeting) kidultGreeting.textContent = `Hello, ${char.name}`;
    const toyouGreeting = document.getElementById('toyou-user-greeting');
    if (toyouGreeting) toyouGreeting.textContent = `Hello, ${char.name}`;
    const shadowGreeting = document.getElementById('shadow-user-greeting');
    if (shadowGreeting) shadowGreeting.textContent = `Hello, ${char.name}`;

    const kidultAvatar = document.getElementById('kidult-user-avatar');
    if (kidultAvatar) kidultAvatar.src = char.avatarUrl;
    const toyouAvatar = document.getElementById('toyou-user-avatar');
    if (toyouAvatar) toyouAvatar.src = char.avatarUrl;
    const shadowAvatar = document.getElementById('shadow-user-avatar');
    if (shadowAvatar) shadowAvatar.src = char.avatarUrl;

    // 2. Update Three Island Cards Access Badges (MY UNIVERSE vs VISIT UNIVERSE)
    const islandCards = document.querySelectorAll('.univ-island-card');
    islandCards.forEach(card => {
      const cardChar = card.getAttribute('data-char');
      const isOwner = (cardChar === normalizedKey);

      card.classList.remove('is-my-universe', 'is-visit-universe');
      card.classList.add(isOwner ? 'is-my-universe' : 'is-visit-universe');

      let badgeEl = card.querySelector('.island-universe-badge');
      if (!badgeEl) {
        let badgeContainer = card.querySelector('.island-universe-badge-container');
        if (!badgeContainer) {
          const glassCard = card.querySelector('.island-glass-card');
          if (glassCard) {
            badgeContainer = document.createElement('div');
            badgeContainer.className = 'island-universe-badge-container';
            glassCard.appendChild(badgeContainer);
          }
        }
        if (badgeContainer) {
          badgeEl = document.createElement('span');
          badgeEl.className = 'island-universe-badge';
          badgeContainer.appendChild(badgeEl);
        }
      }

      if (badgeEl) {
        if (isOwner) {
          badgeEl.className = 'island-universe-badge univ-badge my-universe';
          badgeEl.innerHTML = `<span class="badge-star">★</span> MY UNIVERSE`;
        } else {
          badgeEl.className = 'island-universe-badge univ-badge visit-universe';
          badgeEl.innerHTML = `<span class="badge-star">✦</span> VISIT UNIVERSE`;
        }
      }
    });

    // Auto-scroll the horizontal stage to focus on active character's own universe
    const myCardClass = normalizedKey === 'royan' ? 'card-hot' :
      normalizedKey === 'us_again' || normalizedKey === 'ela' ? 'card-usagain' :
        normalizedKey === 'ruben' ? 'card-ash' :
          normalizedKey === 'abil' ? 'card-pinwheel' :
            normalizedKey === 'akhira' ? 'card-yawn' :
              normalizedKey === 'lele' ? 'card-shadow' :
                normalizedKey === 'lala' ? 'card-toyou' : 'card-kidult';
    const myCard = document.querySelector(`.univ-island-card.${myCardClass}`);
    if (myCard && typeof myCard.scrollIntoView === 'function') {
      setTimeout(() => {
        myCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 120);
    }
  }

  // ==========================================================
  // UNIVERSE STATE & DECORATIONS ENGINE UI BINDINGS (FASE 8)
  // ==========================================================
  let activeAuthUser = null;
  let activeUniverseState = null;

  function renderLocationElementState(univPrefix, locKey, customState = null) {
    const box = document.getElementById(`${univPrefix}-element-state-box`);
    if (!box) return;

    const state = customState || activeUniverseState;
    const elements = (state && state.elements) ? state.elements : {};

    box.style.display = 'none';
    box.innerHTML = '';

    if (univPrefix === 'kidult') {
      if (locKey === 'rumah_kaca') {
        const gh = elements.greenhouse || { watered: false, count: 2, plant: 'Lavender Bintang & Mawar Senja', status: 'Mekar Indah 🌸' };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>🌿 Status Starlight Conservatory</span>
            <span>${gh.status || 'Mekar Indah 🌸'}</span>
          </div>
          <div class="loc-element-state-desc">
            🌸 Tanaman: ${gh.plant || 'Lavender Bintang & Mawar Senja'}<br>
            💧 Frekuensi Rawat: <strong>${gh.count || 0} kali</strong>
          </div>
          <button type="button" class="btn-loc-element-interact" id="btn-interact-kidult-gh">
            <span>💧</span>
            <span>Siram &amp; Rawat Bunga Sekarang</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-kidult-gh');
        btnInteract?.addEventListener('click', () => {
          const nextCount = (gh.count || 0) + 1;
          updateElementState('greenhouse', {
            watered: true,
            count: nextCount,
            status: 'Mekar Sempurna & Harum ✨',
            lastWatered: Date.now()
          });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast('🌸 Bunga lavender & mawar senja telah disiram segar! ✨');
        });
      } else if (locKey === 'sungai_senja') {
        const riv = elements.river || { lanterns: 3, lastWish: 'Semoga harimu penuh kebahagiaan ✦' };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>🌊 Lentera Sungai Senja</span>
            <span>✨ ${riv.lanterns || 0} Lentera Mengapung</span>
          </div>
          <div class="loc-element-state-desc">
            Harapan Terakhir: <em>"${riv.lastWish || 'Semoga harimu seindah senja galaksi'}"</em>
          </div>
          <button type="button" class="btn-loc-element-interact" id="btn-interact-kidult-riv">
            <span>✦</span>
            <span>Hanyutkan Lentera Harapan</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-kidult-riv');
        btnInteract?.addEventListener('click', () => {
          const nextLanterns = (riv.lanterns || 0) + 1;
          const wishes = [
            'Semoga persahabatan kita abadi di antara bintang ★',
            'Semoga mimpi-mimpi manis terwujud malam ini ✦',
            'Small joys make a big universe 🌌',
            'Terima kasih sudah selalu ada sebagai tempat pulang yang hangat ✨'
          ];
          const newWish = wishes[nextLanterns % wishes.length];
          updateElementState('river', {
            lanterns: nextLanterns,
            lastWish: newWish,
            lastFloated: Date.now()
          });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast(`🌊 Lentera baru dihanyutkan: "${newWish}"`);
        });
      } else if (locKey === 'gazebo') {
        const gaz = elements.gazebo || { teaReady: true, teaType: 'Teh Chamomile Bintang 🍵' };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>🏛 Suasana Gazebo Tepi Sungai</span>
            <span>${gaz.teaReady ? 'Hangat & Nyaman ☕' : 'Menunggu Seduhan'}</span>
          </div>
          <div class="loc-element-state-desc">
            Sajian: <strong>${gaz.teaType || 'Teh Chamomile Bintang'}</strong>
          </div>
          <button type="button" class="btn-loc-element-interact" id="btn-interact-kidult-gaz">
            <span>🍵</span>
            <span>Seduh Teh Hangat Baru</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-kidult-gaz');
        btnInteract?.addEventListener('click', () => {
          updateElementState('gazebo', {
            teaReady: true,
            teaType: 'Teh Chamomile & Madu Lavender 🍯',
            lastBrewed: Date.now()
          });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast('🍵 Secangkir teh hangat baru telah diseduh di Gazebo Tepi Sungai ☕✨');
        });
      } else if (locKey === 'teleskop') {
        const tel = elements.telescope || { observedStars: 3, lastMessage: 'Small joys make a big universe ★' };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>🔭 Pengamatan Bintang (Star Messages)</span>
            <span>★ ${tel.observedStars || 3} Bintang Teramati</span>
          </div>
          <div class="loc-element-state-desc">
            Pesan Bintang: <em>"${tel.lastMessage || 'Small joys make a big universe'}"</em>
          </div>
          <button type="button" class="btn-loc-element-interact" id="btn-interact-kidult-tel">
            <span>★</span>
            <span>Amati Bintang Baru</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-kidult-tel');
        btnInteract?.addEventListener('click', () => {
          const nextStars = (tel.observedStars || 3) + 1;
          updateElementState('telescope', {
            observedStars: nextStars,
            lastMessage: `Bintang ke-${nextStars} bersinar terang di konstelasi KIDULT ✦`,
            lastObserved: Date.now()
          });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast(`★ Bintang ke-${nextStars} teramati: Langit senja bersinar semakin terang!`);
        });
      }
    } else if (univPrefix === 'toyou') {
      if (locKey === 'atelier') {
        const at = elements.atelier || { dressTheme: 'Gaun Peri Pagi 👗', sketchCount: 3 };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>👗 Atelier Mode Peri</span>
            <span>${at.dressTheme || 'Gaun Peri Pagi'}</span>
          </div>
          <div class="loc-element-state-desc">
            Koleksi Sketsa Desain: <strong>${at.sketchCount || 3} sketsa</strong>
          </div>
          <button type="button" class="btn-loc-element-interact" id="btn-interact-toyou-at">
            <span>✨</span>
            <span>Ganti Tema Gaun Peri</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-toyou-at');
        btnInteract?.addEventListener('click', () => {
          const themes = ['Gaun Peri Pagi Berkilau 👗', 'Gaun Kelopak Mawar Peach 🌸', 'Jubah Embun Pagi Emas ✨'];
          const nextTheme = themes[((at.sketchCount || 0) + 1) % themes.length];
          updateElementState('atelier', {
            dressTheme: nextTheme,
            sketchCount: (at.sketchCount || 3) + 1,
            lastUpdatedTheme: Date.now()
          });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast(`👗 Tema Atelier diperbarui: ${nextTheme}!`);
        });
      } else if (locKey === 'ladang_kupu') {
        const k = elements.butterfly || { friendlyFlock: 5 };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>🦋 Kawanan Kupu-kupu Peri</span>
            <span>${k.friendlyFlock || 5} Kupu-kupu Menari</span>
          </div>
          <button type="button" class="btn-loc-element-interact" id="btn-interact-toyou-kupu">
            <span>🌸</span>
            <span>Sapa Kawanan Kupu-kupu</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-toyou-kupu');
        btnInteract?.addEventListener('click', () => {
          const nextFlock = (k.friendlyFlock || 5) + 1;
          updateElementState('butterfly', { friendlyFlock: nextFlock, lastGreeted: Date.now() });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast(`🦋 ${nextFlock} kupu-kupu terbang mengelilingi taman dengan pendaran keemasan!`);
        });
      } else if (locKey === 'gazebo') {
        const gaz = elements.gazebo || { teaReady: true, teaType: 'Teh Earl Grey & Bunga Persik ☕' };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>🏛 Gazebo Tepi Sungai TO YOU</span>
            <span>${gaz.teaReady ? 'Sedia Hangat ☕' : 'Siap Seduh'}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="btn-loc-element-interact" id="btn-interact-toyou-gaz">
              <span>☕</span>
              <span>Seduh Teh Pagi Hangat</span>
            </button>
            <button type="button" class="btn-loc-element-interact" id="btn-interact-toyou-songs" style="background: linear-gradient(135deg, rgba(236,72,153,0.35), rgba(168,85,247,0.35)); border-color: rgba(244,114,182,0.5);">
              <span>🎵</span>
              <span>Songs We Share</span>
            </button>
          </div>
        `;
        const btnInteract = box.querySelector('#btn-interact-toyou-gaz');
        btnInteract?.addEventListener('click', () => {
          updateElementState('gazebo', { teaReady: true, teaType: 'Teh Bunga Persik & Madu Hutan 🍯', lastBrewed: Date.now() });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast('☕ Teh bunga persik segar telah tersaji di Gazebo Pagi 🌸');
        });
        const btnSongs = box.querySelector('#btn-interact-toyou-songs');
        btnSongs?.addEventListener('click', () => {
          openSongsWeShareModal({
            activeChar: 'lala',
            onShowToast,
            onTriggerSparkle
          });
        });
      }
    } else if (univPrefix === 'shadow') {
      if (locKey === 'rumah_kristal') {
        const ct = elements.crystal_tower || { resonance: 'Harmoni Kristal 98% 💎', energy: 'Tinggi' };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>🏰 Resonansi Menara Kristal</span>
            <span>${ct.resonance || 'Harmoni Kristal 98%'}</span>
          </div>
          <button type="button" class="btn-loc-element-interact" id="btn-interact-shadow-tower">
            <span>💎</span>
            <span>Selaraskan Energi Kristal</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-shadow-tower');
        btnInteract?.addEventListener('click', () => {
          updateElementState('crystal_tower', { resonance: 'Harmoni Kristal Sempurna 100% 💎✨', energy: 'Maksimal', lastTuned: Date.now() });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast('💎 Menara Kristal beresonansi dengan tenang memancarkan pendaran biru-ungu 🌙');
        });
      } else if (locKey === 'galeri_seni') {
        const gal = elements.gallery || { paintingTitle: 'Midnight Starlight 🎨', exhibited: true };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>🎨 Galeri Seni Kristal</span>
            <span>Dipajang</span>
          </div>
          <div class="loc-element-state-desc">
            Karya Utama: <strong>${gal.paintingTitle || 'Midnight Starlight'}</strong>
          </div>
          <button type="button" class="btn-loc-element-interact" id="btn-interact-shadow-gal">
            <span>🖌️</span>
            <span>Pajang Karya Kristal Baru</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-shadow-gal');
        btnInteract?.addEventListener('click', () => {
          const titles = ['Midnight Starlight 🎨', 'Crescent Moon Reflection 🌙', 'Nebula Shadow Echoes 🌌', 'Echoes of the Night Sky ✦'];
          const nextTitle = titles[Math.floor(Math.random() * titles.length)];
          updateElementState('gallery', { paintingTitle: nextTitle, lastExhibited: Date.now() });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast(`🎨 Karya baru terpajang di Galeri Seni Kristal: "${nextTitle}"!`);
        });
      } else if (locKey === 'kolam_berendam') {
        const b = elements.bath || { waterWarmth: 'Hangat Menenangkan 💧', petals: 'Snowdrop' };
        box.style.display = 'flex';
        box.innerHTML = `
          <div class="loc-element-state-header">
            <span>💧 Kolam Kristal Malam</span>
            <span>${b.waterWarmth || 'Hangat'}</span>
          </div>
          <button type="button" class="btn-loc-element-interact" id="btn-interact-shadow-bath">
            <span>❄️</span>
            <span>Tabur Kelopak Snowdrop</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-shadow-bath');
        btnInteract?.addEventListener('click', () => {
          updateElementState('bath', { waterWarmth: 'Hangat & Menenangkan dengan Kelopak Snowdrop 🌸💧', lastSprinkled: Date.now() });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast('💧 Kelopak snowdrop perak mengapung lembut di atas air kolam kristal 🌙');
        });
      }
    }
  }

  function setupUniverseStateDecorationsUI() {
    // 1. Sync Badges Listener
    onUniverseStatusChange((status, message) => {
      ['kidult', 'toyou', 'shadow'].forEach(p => {
        const badge = document.getElementById(`${p}-sync-badge`);
        if (!badge) return;
        badge.className = `universe-sync-badge status-${status}`;
        const textEl = badge.querySelector('.sync-text');
        const iconEl = badge.querySelector('.sync-icon');
        if (textEl) {
          if (status === 'saved') textEl.textContent = 'Tersimpan di Cloud ✦';
          else if (status === 'saving') textEl.textContent = 'Menyimpan...';
          else if (status === 'offline_saved') textEl.textContent = 'Offline (Tersimpan Lokal)';
          else if (status === 'loading') textEl.textContent = 'Memuat...';
          else if (status === 'error') textEl.textContent = 'Gagal Menyimpan';
          else textEl.textContent = message || 'Siap';
        }
        if (iconEl) {
          if (status === 'saved') iconEl.textContent = '☁️';
          else if (status === 'saving') iconEl.textContent = '⏳';
          else if (status === 'offline_saved') iconEl.textContent = '📡';
          else if (status === 'loading') iconEl.textContent = '🔮';
          else if (status === 'error') iconEl.textContent = '⚠️';
        }
      });
    });

    // 2. State Change Listener (Decorations on 2D Stage & Counters)
    onUniverseStateChange((state) => {
      if (!state) return;
      activeUniverseState = state;
      const charKey = normalizeCharacterKey(state.characterKey);
      const prefix = (charKey === 'nyanya' ? 'kidult' : (charKey === 'lala' ? 'toyou' : 'shadow'));

      // Render decorations
      const layer = document.getElementById(`${prefix}-decor-layer`);
      if (layer) {
        layer.innerHTML = '';
        const list = Array.isArray(state.decorations) ? state.decorations : [];
        list.forEach((d) => {
          const itemEl = document.createElement('div');
          itemEl.className = 'universe-decor-item';
          itemEl.style.left = `${d.x}%`;
          itemEl.style.top = `${d.y}%`;
          itemEl.setAttribute('data-decor-id', d.id);
          itemEl.setAttribute('title', `${d.name} (${d.x}%, ${d.y}%)`);
          itemEl.innerHTML = `
            <div class="decor-icon-orb">${d.icon || '✨'}</div>
            <span class="decor-label">${d.name}</span>
            <button type="button" class="decor-delete-btn" aria-label="Hapus dekorasi ${d.name}">✕</button>
          `;

          // Delete button
          const delBtn = itemEl.querySelector('.decor-delete-btn');
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeDecoration(d.id);
            if (onShowToast) onShowToast(`Dekorasi "${d.name}" telah dihapus`);
          });

          // Drag / reposition in decor mode
          let isDragging = false;
          itemEl.addEventListener('mousedown', (e) => {
            const stage = document.getElementById(`${prefix}-2d-stage`);
            if (!stage || !stage.classList.contains('stage-decor-mode-active')) return;
            e.stopPropagation();
            isDragging = true;

            const onMouseMove = (moveEv) => {
              if (!isDragging) return;
              const rect = stage.getBoundingClientRect();
              const newX = Math.min(95, Math.max(5, Math.round(((moveEv.clientX - rect.left) / rect.width) * 100)));
              const newY = Math.min(95, Math.max(10, Math.round(((moveEv.clientY - rect.top) / rect.height) * 100)));
              itemEl.style.left = `${newX}%`;
              itemEl.style.top = `${newY}%`;
            };

            const onMouseUp = (upEv) => {
              if (!isDragging) return;
              isDragging = false;
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
              const rect = stage.getBoundingClientRect();
              const finalX = Math.min(95, Math.max(5, Math.round(((upEv.clientX - rect.left) / rect.width) * 100)));
              const finalY = Math.min(95, Math.max(10, Math.round(((upEv.clientY - rect.top) / rect.height) * 100)));
              updateDecorationPosition(d.id, finalX, finalY);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          });

          layer.appendChild(itemEl);
        });
      }

      // Update counter
      const counterEl = document.getElementById(`${prefix}-decor-count`);
      if (counterEl) {
        const count = (state.decorations || []).length;
        counterEl.textContent = `${count} / 50`;
      }

      // Update location element status if location panel is currently active
      if (activeKidultLocationKey) {
        renderLocationElementState('kidult', activeKidultLocationKey, state);
      } else if (activeToYouLocationKey) {
        renderLocationElementState('toyou', activeToYouLocationKey, state);
      } else if (activeShadowLocationKey) {
        renderLocationElementState('shadow', activeShadowLocationKey, state);
      }

      // Sync Kidult mood from Firestore state if present
      if (charKey === 'nyanya' && state.elements?.gazebo?.mood) {
        applyKidultMood(state.elements.gazebo.mood, false);
      }

      // Sync TO YOU mood from Firestore state if present
      if (charKey === 'lala' && state.elements?.gazebo?.mood) {
        applyToYouMood(state.elements.gazebo.mood, false);
      }

      // Sync YAWN mood from Firestore state if present
      if (charKey === 'akhira' && state.elements?.gazebo?.mood) {
        yawnCtrl?.applyYawnMood(state.elements.gazebo.mood, false);
      }

      // Sync SHADOW mood & duality from Firestore state if present
      if (charKey === 'lele') {
        if (state.elements?.gazebo?.mood) {
          shadowMoodCtrl?.applyShadowMood(state.elements.gazebo.mood, false);
        }
        if (state.elements?.gazebo?.duality) {
          shadowMoodCtrl?.applyShadowDuality(state.elements.gazebo.duality, false);
        }
      }
    });

    // 3. Setup Catalogs & Docks for KIDULT, TO YOU, and SHADOW
    const universes = [
      { prefix: 'kidult', charKey: 'nyanya' },
      { prefix: 'toyou', charKey: 'lala' },
      { prefix: 'shadow', charKey: 'lele' }
    ];

    universes.forEach(({ prefix, charKey }) => {
      const catalog = UNIVERSE_DECORATION_CATALOG[charKey] || [];
      const catalogGrid = document.getElementById(`${prefix}-catalog-grid`);
      if (catalogGrid) {
        catalogGrid.innerHTML = '';
        catalog.forEach(item => {
          const card = document.createElement('div');
          card.className = 'decor-catalog-card';
          card.setAttribute('role', 'button');
          card.setAttribute('tabindex', '0');
          card.innerHTML = `
            <span class="decor-card-icon">${item.icon}</span>
            <span class="decor-card-name">${item.name}</span>
          `;
          card.addEventListener('click', () => {
            try {
              const randX = 35 + Math.floor(Math.random() * 30);
              const randY = 40 + Math.floor(Math.random() * 25);
              addDecoration(item.itemId, randX, randY);
              if (onShowToast) onShowToast(`✨ Menempatkan ${item.name} di pulau!`);
              if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.6);
            } catch (err) {
              if (onShowToast) onShowToast(err.message || 'Gagal menambahkan dekorasi');
            }
          });
          catalogGrid.appendChild(card);
        });
      }

      const resetBtn = document.getElementById(`btn-${prefix}-decor-reset`);
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('Kembalikan dekorasi pulau ke susunan awal?')) {
            resetDecorationsToDefault();
            if (onShowToast) onShowToast('Dekorasi dikembalikan ke pengaturan awal ✦');
          }
        });
      }

      const toggleBtn = document.getElementById(`btn-${prefix}-decor-toggle`);
      const dock = document.getElementById(`${prefix}-decor-dock`);
      const closeDockBtn = document.getElementById(`btn-close-${prefix}-dock`);
      const stage = document.getElementById(`${prefix}-2d-stage`);

      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const isOwner = (normalizeCharacterKey(activeUser) === charKey);
          if (!isOwner) {
            const ownerName = (charKey === 'nyanya' ? 'Nyanya' : (charKey === 'lala' ? 'Lala' : 'Lele'));
            if (onShowToast) onShowToast(`✦ Mode Pengunjung: Pengaturan pulau hanya dapat diubah oleh pemiliknya (${ownerName}).`);
            return;
          }
          const isOpen = dock && dock.classList.contains('open');
          if (isOpen) {
            dock?.classList.remove('open');
            stage?.classList.remove('stage-decor-mode-active');
            toggleBtn.classList.remove('active');
          } else {
            dock?.classList.add('open');
            stage?.classList.add('stage-decor-mode-active');
            toggleBtn.classList.add('active');
            if (onShowToast) onShowToast('🎨 Mode Dekorasi Aktif: Klik item di palet untuk menambahkan, tarik untuk memindahkan!');
          }
        });
      }

      if (closeDockBtn) {
        closeDockBtn.addEventListener('click', () => {
          dock?.classList.remove('open');
          stage?.classList.remove('stage-decor-mode-active');
          toggleBtn?.classList.remove('active');
        });
      }
    });
  }

  // Initialize Universe State & Decoration UI
  setupUniverseStateDecorationsUI();

  return {
    updateUserProfile,
    syncUniverseStateActiveCharacter: (charKey, authUser) => {
      updateUserProfile(charKey, authUser);
    },
    cleanupUniverseStateOnLogout,
    openUniverseDetail,
    openKidultWorld,
    closeKidultWorld,
    selectKidultLocation,
    kidultBehindController: kidultBehindCtrl,
    openBehindWitch: () => kidultBehindCtrl?.openBehindWitch(),
    closeBehindWitch: () => kidultBehindCtrl?.closeBehindWitch(),
    everdreamHouseController: everdreamHouseCtrl,
    openEverdreamHouse: (room = 'exterior') => (kidultHouseCtrl?.openKidultHouse ? kidultHouseCtrl.openKidultHouse(activeCharacterKey || activeUser || 'nyanya', room === 'exterior' ? 'living' : room) : everdreamHouseCtrl?.openEverdreamHouse(room)),
    closeEverdreamHouse: () => (kidultHouseCtrl?.closeKidultHouse ? kidultHouseCtrl.closeKidultHouse() : everdreamHouseCtrl?.closeEverdreamHouse()),
    kidultHouseController: kidultHouseCtrl || everdreamHouseCtrl,
    openKidultHouse: (char = null, room = 'living') => (kidultHouseCtrl?.openKidultHouse ? kidultHouseCtrl.openKidultHouse(char || activeCharacterKey || activeUser || 'nyanya', room) : everdreamHouseCtrl?.openEverdreamHouse(room)),
    closeKidultHouse: () => (kidultHouseCtrl?.closeKidultHouse ? kidultHouseCtrl.closeKidultHouse() : everdreamHouseCtrl?.closeEverdreamHouse()),
    greenhouseController: greenhouseCtrl,
    openGreenhouse: (char = null) => greenhouseCtrl?.openGreenhouse(char || activeCharacterKey || activeUser || 'nyanya'),
    closeGreenhouse: () => greenhouseCtrl?.closeGreenhouse(),
    kidultGazeboController: kidultGazeboCtrl,
    openKidultGazebo: (char = null) => kidultGazeboCtrl?.openKidultGazebo(char || activeCharacterKey || activeUser || 'nyanya'),
    closeKidultGazebo: () => kidultGazeboCtrl?.closeKidultGazebo(),
    openToYouWorld,
    closeToYouWorld,
    selectToYouLocation,
    bloomCottageController: bloomCottageCtrl,
    openBloomCottage: (char = null, room = 'living') => bloomCottageCtrl?.openBloomCottage(char || activeCharacterKey || activeUser || 'lala', room),
    closeBloomCottage: () => bloomCottageCtrl?.closeBloomCottage(),
    fairyAtelierController: fairyAtelierCtrl,
    openFairyAtelier: (char = null) => fairyAtelierCtrl?.openFairyAtelier(char || activeCharacterKey || activeUser || 'lala'),
    closeFairyAtelier: () => fairyAtelierCtrl?.closeFairyAtelier(),
    toyouGazeboController: toyouGazeboCtrl,
    openToyouGazebo: (char = null) => toyouGazeboCtrl?.openToyouGazebo(char || activeCharacterKey || activeUser || 'lala'),
    closeToyouGazebo: () => toyouGazeboCtrl?.closeToyouGazebo(),
    toyouBehindController: toyouBehindCtrl,
    openBehindFairy: () => toyouBehindCtrl?.openBehindFairy(),
    closeBehindFairy: () => toyouBehindCtrl?.closeBehindFairy(),
    openShadowWorld,
    closeShadowWorld,
    selectShadowLocation,
    shadowBehindController: shadowBehindCtrl,
    openBehindShadow: () => shadowBehindCtrl?.openBehindShadow(),
    closeBehindShadow: () => shadowBehindCtrl?.closeBehindShadow(),
    eclipseController: eclipseCtrl,
    openEclipseSanctuary: (char = null, room = 'grand_hall') => {
      const targetUser = char || activeUser || activeCharacterKey || 'lele';
      if (!isAuthorAuthorized(targetUser)) {
        if (onShowToast) {
          onShowToast('✦ The Eclipse Sanctuary dijaga oleh segel gerhana abadi. Hanya Lele 🌙 (The Author) yang dapat memasukinya.');
        }
        return false;
      }
      const viewShadow = document.getElementById('view-shadow-world');
      if (viewShadow) {
        viewShadow.classList.remove('active');
        viewShadow.setAttribute('aria-hidden', 'true');
      }
      return eclipseCtrl?.openEclipseSanctuary(targetUser, room);
    },
    closeEclipseSanctuary: () => eclipseCtrl?.closeEclipseSanctuary(),
    openPinwheelWorld: (user = activeAuthUser) => pinwheelCtrl?.openPinwheelWorld(user),
    closePinwheelWorld: () => pinwheelCtrl?.closePinwheelWorld(),
    openPinwheelPhotography: (uid, tab) => pinwheelCtrl?.openPhotography(uid, tab),
    openPinwheelVisionStudio: (uid, tab) => pinwheelCtrl?.openVisionStudio(uid, tab),
    pinwheelController: pinwheelCtrl,
    openBehindPinwheel: () => pinwheelCtrl?.openBehindPinwheel(),
    closeBehindPinwheel: () => pinwheelCtrl?.closeBehindPinwheel(),
    pinwheelBehindController: pinwheelCtrl?.pinwheelBehindController,
    openPinwheelHaven: (user = activeAuthUser, room = 'living') => pinwheelHavenCtrl?.openPinwheelHaven(user, room),
    closePinwheelHaven: () => pinwheelHavenCtrl?.closePinwheelHaven(),
    pinwheelHavenController: pinwheelHavenCtrl,
    openYawnWorld: (user = activeAuthUser) => yawnCtrl?.openYawnWorld(user),
    closeYawnWorld: () => yawnCtrl?.closeYawnWorld(),
    yawnController: yawnCtrl,
    openYawnGazebo: (user = activeAuthUser) => yawnGazeboCtrl?.openYawnGazebo(user),
    closeYawnGazebo: () => yawnGazeboCtrl?.closeYawnGazebo(),
    yawnGazeboController: yawnGazeboCtrl,
    openYawnCinema: (user = activeAuthUser) => yawnCinemaCtrl?.openYawnCinema(user),
    closeYawnCinema: () => yawnCinemaCtrl?.closeYawnCinema(),
    yawnCinemaController: yawnCinemaCtrl,
    openAzurePalace: (user = activeAuthUser) => azurePalaceCtrl?.openAzurePalace(user),
    closeAzurePalace: () => azurePalaceCtrl?.closeAzurePalace(),
    azurePalaceController: azurePalaceCtrl,
    openAshWorld: (user = activeAuthUser) => ashCtrl?.openAshWorld(user),
    closeAshWorld: () => ashCtrl?.closeAshWorld(),
    ashController: ashCtrl,
    openBehindAsh: () => ashCtrl?.openBehindAsh(),
    closeBehindAsh: () => ashCtrl?.closeBehindAsh(),
    ashBehindController: ashCtrl?.ashBehindController,
    openDragonDen: (user = activeAuthUser, room = 'hall') => dragonDenCtrl?.openDragonDen(user, room),
    closeDragonDen: () => dragonDenCtrl?.closeDragonDen(),
    dragonDenController: dragonDenCtrl,
    openUsAgainWorld: (user = activeAuthUser) => usagainCtrl?.openUsAgainWorld(user),
    closeUsAgainWorld: () => usagainCtrl?.closeUsAgainWorld(),
    usagainController: usagainCtrl,
    openBehindLotus: () => usagainCtrl?.openBehindLotus(),
    closeBehindLotus: () => usagainCtrl?.closeBehindLotus(),
    openSilentLotusHouse: (user = activeAuthUser, room = 'living') => silentLotusCtrl?.openSilentLotusHouse(user, room),
    closeSilentLotusHouse: () => silentLotusCtrl?.closeSilentLotusHouse(),
    silentLotusController: silentLotusCtrl,
    openHotWorld: (user = activeAuthUser) => handleOpenHotWorld(user),
    closeHotWorld: () => hotCtrl?.closeHotWorld(),
    hotController: hotCtrl,
    openMoonpetalManor: (user, room) => moonpetalManorCtrl?.openMoonpetalManor(user || activeAuthUser, room),
    closeMoonpetalManor: () => moonpetalManorCtrl?.closeMoonpetalManor(),
    moonpetalManorController: moonpetalManorCtrl,
    applyKidultMood,
    getCurrentKidultMood: () => currentKidultMoodKey,
    restoreKidultMood,
    applyToYouMood,
    getCurrentToYouMood: () => currentToYouMoodKey,
    restoreToYouMood,
    toggleToYouMoodPicker,
    applyYawnMood: (mood, save, user) => yawnCtrl?.applyYawnMood(mood, save, user),
    getCurrentYawnMood: () => yawnCtrl?.getCurrentYawnMood(),
    restoreYawnMood: (uid) => yawnCtrl?.restoreYawnMood(uid),
    toggleYawnMoodPicker: (force) => yawnCtrl?.toggleYawnMoodPicker(force),
    openYawnMoodHistory: () => yawnCtrl?.openYawnMoodHistory(),
    shadowMoodController: shadowMoodCtrl,
    applyShadowMood: (mood, save, user) => shadowMoodCtrl?.applyShadowMood(mood, save, user),
    getCurrentShadowMood: () => shadowMoodCtrl?.getCurrentShadowMood(),
    applyShadowDuality: (side, save, user) => shadowMoodCtrl?.applyShadowDuality(side, save, user),
    getCurrentShadowDuality: () => shadowMoodCtrl?.getCurrentShadowDuality(),
    restoreShadowMood: (uid) => shadowMoodCtrl?.restoreShadowMood(uid),
    toggleShadowMoodPicker: (force) => shadowMoodCtrl?.toggleShadowMoodPicker(force),
    openShadowMoodHistory: () => shadowMoodCtrl?.openShadowMoodHistory()
  };
}
