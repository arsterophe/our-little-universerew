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
    islandArt: '/assets/island_kidult_floating.png',
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
    islandArt: '/assets/island_toyou_floating.png',
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
    islandArt: '/assets/island_shadow_floating.png',
    quote: 'Same sky, different shadows.',
    palette: 'Dark Indigo, Deep Violet, & Cosmic Blue-Purple',
    description: 'Pulau fantasi gothic elegan dengan kastel gelap bertingkat, menara observatorium astronomi, layar proyeksi terbuka di bawah langit malam, pepohonan misterius berembun violet, dan planet bercincin di latar belakang.',
    accentColor: '#818cf8'
  }
};

// Interactive 2D Locations inside KIDULT World
export const KIDULT_LOCATIONS = {
  rumah: {
    id: 'rumah',
    icon: '🏠',
    tag: 'LOKASI UTAMA · KIDULT',
    title: 'Rumah Vanya',
    subtitle: 'Rumah Fantasi Berjendela Hangat & Atap Lavender',
    description: 'Rumah fantasi nyaman beratap lavender dengan jendela-jendela hangat yang bersinar lembut saat senja. Tempat beristirahat, menulis jurnal mimpi, dan mengumpulkan kenangan persahabatan.',
    highlight: '✨ Jendela bercahaya hangat · Ruang jurnal & kalender aktif',
    actionLabel: 'Buka Jurnal & Kalender (Orbit)',
    actionType: 'orbit',
    toastMsg: '🏠 Selamat datang di Rumah Vanya yang hangat & nyaman!'
  },
  rumah_kaca: {
    id: 'rumah_kaca',
    icon: '🌿',
    tag: 'TAMAN BOTANI · KIDULT',
    title: 'Rumah Kaca',
    subtitle: 'Starlight Conservatory & Taman Bunga Kosmik',
    description: 'Bangunan kubah kaca bercahaya yang dipenuhi tanaman hijau, mawar pastel, dan bunga lavender bintang yang mekar mengikuti cahaya senja galaksi.',
    highlight: '🌸 Tanaman mekar hari ini: Lavender Bintang & Mawar Senja',
    actionLabel: 'Rawat Bunga & Lihat Galeri Momen',
    actionType: 'moments',
    toastMsg: '🌿 Harum bunga lavender & cahaya hangat memenuhi Rumah Kaca ✨'
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
    tag: 'SUDUT SANTAI · KIDULT',
    title: 'Gazebo Tepi Sungai',
    subtitle: 'Paviliun Senja di Ujung Jembatan Kayu',
    description: 'Gazebo mungil beratap kubah ungu berhias bintang yang terhubung melalui jembatan kayu di atas Sungai Senja. Tempat terbaik untuk duduk tenang menikmati matahari terbenam di cakrawala galaksi.',
    highlight: '🍵 Teh hangat & semilir angin sore siap menemani',
    actionLabel: 'Duduk Santai Nikmati Senja',
    actionType: 'toast',
    toastMsg: '🏛 Menikmati langit senja galaksi yang damai dari Gazebo Tepi Sungai ☕✨'
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

// Interactive 2D Locations inside TO YOU — Bella's Fairy Forest World
export const TOYOU_LOCATIONS = {
  rumah: {
    id: 'rumah',
    icon: '🏠',
    tag: 'LOKASI A · TO YOU',
    title: 'Rumah Bella',
    subtitle: 'Rumah Peri Berjendela Hangat & Atap Peach Lembut',
    description: 'Rumah peri yang nyaman di antara pepohonan rindang dengan atap berwarna peach lembut, jendela besar yang bercahaya hangat, dan taman bunga pastel di sekeliling jalan setapak.',
    highlight: '🌞 Cahaya pagi menembus dedaunan · Jurnal & kalender aktif',
    actionLabel: 'Buka Jurnal & Kalender (Orbit)',
    actionType: 'orbit',
    toastMsg: '🏠 Selamat datang di Rumah Bella yang cerah dan dikelilingi bunga pagi!'
  },
  atelier: {
    id: 'atelier',
    icon: '👗',
    tag: 'LOKASI B · TO YOU',
    title: 'Galeri Busana — Atelier',
    subtitle: 'Studio Mode Kubah Kaca & Bingkai Kayu Peri',
    description: 'Bangunan studio fantasi dengan struktur kaca dan bingkai kayu berhias bunga merambat. Di dalamnya tampak manekin, gaun-gaun pastel, rak pakaian, serta dekorasi bunga tempat Bella menampilkan karya dan gaya favoritnya.',
    highlight: '🌸 Koleksi gaun peri pagi & sketsa busana Bella dipajang di galeri',
    actionLabel: 'Lihat Galeri & Scrapbook Momen',
    actionType: 'moments',
    toastMsg: '👗 Mengunjungi Atelier (Galeri Busana) Bella: Gaun pastel berkilau di bawah sinar matahari pagi!'
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
    title: 'Gazebo',
    subtitle: 'Paviliun Tepi Sungai Berhias Bunga & Tirai Lembut',
    description: 'Bangunan kecil terbuka di tepi aliran sungai jernih dan air terjun pulau peri. Dihiasi tanaman merambat, kelopak bunga pastel, serta cahaya matahari pagi yang hangat untuk bersantai.',
    highlight: '🍵 Semilir angin pagi & gemericik sungai jernih di tepi gazebo',
    actionLabel: 'Bersantai di Gazebo Pagi ☼',
    actionType: 'toast',
    toastMsg: '🏛 Duduk santai di Gazebo tepi sungai sambil menikmati cahaya pagi hutan peri TO YOU 🌸'
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
    icon: '🏰',
    tag: 'LOKASI A · CRYSTAL MOON SANCTUARY',
    title: 'Menara Kristal — Rumah Lele',
    subtitle: 'Menara Kristal Transparan Berornamen Bulan Sabit',
    description: 'Rumah utama Lele berbentuk menara kristal yang menjulang anggun di jantung Crystal Moon Sanctuary. Memiliki lapisan kristal transparan, jendela bercahaya hangat, ornamen bulan sabit, dan pendar cahaya biru-ungu dari bagian dalam.',
    highlight: '🌙 Cahaya kristal biru-ungu & keperakan bersinar tenang · Rumah 2D interaktif 6 ruangan',
    actionLabel: 'Masuk ke Ruang Kristal (2D Game) 🏰✨',
    actionType: 'shadow_crystal_tower',
    toastMsg: '🏰 Memasuki Menara Kristal — Rumah Lele: Jelajahi seluruh ruangan Crystal Tower 🌙'
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
      if (univKey === 'kidult') {
        openKidultWorld(e);
      } else if (univKey === 'to_you') {
        openToYouWorld(e);
      } else if (univKey === 'shadow') {
        openShadowWorld(e);
      } else if (UNIVERSE_DATA[univKey]) {
        openUniverseDetail(univKey, e);
      }
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
  const btnKidultBackBottom = document.getElementById('btn-kidult-back-bottom');
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
      if (loc.actionType === 'orbit' && typeof onNavigateOrbit === 'function') {
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
  if (btnKidultBackBottom) {
    btnKidultBackBottom.addEventListener('click', closeKidultWorld);
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

  // Quick Star Messages button (Direct chat access from KIDULT top-left HUD)
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
      } catch (_) {}

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
    } catch (_) {}
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

  let activeToYouLocationKey = null;

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
      selectToYouLocation(locKey, e);
    });
  });

  toyouQuickItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = item.getAttribute('data-toyou-nav');
      selectToYouLocation(locKey, e);
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
      if (loc.actionType === 'orbit' && typeof onNavigateOrbit === 'function') {
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
      selectShadowLocation(locKey, e);
    });
  });



  if (btnCloseShadowPanel) {
    btnCloseShadowPanel.addEventListener('click', closeShadowLocationPanel);
  }
  if (btnShadowPanelDismiss) {
    btnShadowPanelDismiss.addEventListener('click', closeShadowLocationPanel);
  }

  if (btnShadowLocAction) {
    btnShadowLocAction.addEventListener('click', (e) => {
      const loc = SHADOW_LOCATIONS[activeShadowLocationKey];
      if (!loc) return;
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
      }
      if (loc.actionType === 'shadow_crystal_tower' && typeof onNavigateShadowCrystalTower === 'function') {
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateShadowCrystalTower();
      } else if (loc.actionType === 'orbit' && typeof onNavigateOrbit === 'function') {
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateOrbit('view-shadow-world');
      } else if (loc.actionType === 'star_messages' && typeof onNavigateStarMessages === 'function') {
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateStarMessages('shadow');
      } else if (loc.actionType === 'kotak_pos' && typeof onNavigateKotakPos === 'function') {
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateKotakPos('shadow');
      } else if (loc.actionType === 'shadow_gazebo' && typeof onNavigateShadowGazebo === 'function') {
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateShadowGazebo();
      } else if (loc.actionType === 'shadow_garden' && typeof onNavigateShadowGarden === 'function') {
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateShadowGarden();
      } else if (loc.actionType === 'shadow_art_gallery' && typeof onNavigateShadowArtGallery === 'function') {
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateShadowArtGallery();
      } else if (loc.actionType === 'moments' && typeof onNavigateMoments === 'function') {
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateMoments('view-shadow-world');
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

  // Subtle 2D Multi-Layer Parallax on Mouse Move inside SHADOW World (Respects prefers-reduced-motion)
  const shadowStage = document.getElementById('shadow-2d-stage');
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
      }
    };

    const normalizedKey = (
      (charKey === 'vanya' || charKey === 'nyanya' || charKey === 'ale' || charKey === 'alenda_nyanya') ? 'nyanya' :
      (charKey === 'bella' || charKey === 'lala') ? 'lala' :
      (charKey === 'lele' || charKey === 'alenda_lele') ? 'lele' :
      (charKey === 'alenda' ? 'nyanya' : charKey)
    );
    const char = CHAR_MAP[normalizedKey] || CHAR_MAP.nyanya;
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
          <button type="button" class="btn-loc-element-interact" id="btn-interact-toyou-gaz">
            <span>☕</span>
            <span>Seduh Teh Pagi Hangat</span>
          </button>
        `;
        const btnInteract = box.querySelector('#btn-interact-toyou-gaz');
        btnInteract?.addEventListener('click', () => {
          updateElementState('gazebo', { teaReady: true, teaType: 'Teh Bunga Persik & Madu Hutan 🍯', lastBrewed: Date.now() });
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          if (onShowToast) onShowToast('☕ Teh bunga persik segar telah tersaji di Gazebo Pagi 🌸');
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
    openToYouWorld,
    closeToYouWorld,
    selectToYouLocation,
    openShadowWorld,
    closeShadowWorld,
    selectShadowLocation,
    applyKidultMood,
    getCurrentKidultMood: () => currentKidultMoodKey,
    restoreKidultMood
  };
}
