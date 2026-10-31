/**
 * OUR LITTLE UNIVERSE — UNIVERSES VIEW CONTROLLER
 * 
 * Manages the Three Worlds interactive floating islands,
 * universe modal dialogs, pill navbar interactions, and navigation.
 */

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
    icon: '★',
    tag: 'OBSERVATORIUM · KIDULT',
    title: 'Area Teleskop Bintang (Star Messages)',
    subtitle: 'Teras Pengamatan Bintang & Pesan Kosmik',
    description: 'Teras batu melingkar di sisi barat pulau dengan teleskop bintang menghadap langit galaksi. Digunakan untuk menemukan bintang sahabat dan membaca pesan rahasia yang tersimpan di angkasa.',
    highlight: '🔭 3 Bintang bersinar terang malam ini: "Small joys make a big universe."',
    actionLabel: 'Amati Bintang & Baca Pesan ★',
    actionType: 'toast',
    toastMsg: '★ Star Message ditemukan: "Terima kasih sudah selalu menjadi tempat pulang yang hangat!"'
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
    actionType: 'toast',
    toastMsg: '✉ Membuka Kotak Pos: Ada surat hangat bertuliskan "Semoga harimu seindah senja di KIDULT!"'
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
    icon: '★',
    tag: 'LOKASI C · TO YOU',
    title: 'Teleskop',
    subtitle: 'Teras Observasi Terbuka Menghadap Langit Pagi',
    description: 'Area pengamatan terbuka dengan teleskop berornamen emas lembut di teras batu sisi kiri pulau. Menghadap langsung ke langit biru cerah dan pulau-pulau melayang di kejauhan untuk mengamati langit dan pesan sahabat.',
    highlight: '🔭 Langit pagi jernih · Awan putih lembut & pulau melayang terlihat jelas',
    actionLabel: 'Amati Langit & Pesan Sahabat ☼',
    actionType: 'toast',
    toastMsg: '★ Teleskop TO YOU: "A little closer, for a brighter tomorrow — semoga harimu secerah mentari pagi!"'
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
    actionLabel: 'Periksa Surat Sahabat ✉',
    actionType: 'toast',
    toastMsg: '✉ Membuka Kotak Pos TO YOU: "Selamat pagi Bella & Lala! Terima kasih selalu membawa kehangatan 🌞"'
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
    highlight: '🌙 Cahaya kristal biru-ungu & keperakan bersinar tenang · Jurnal & kalender aktif',
    actionLabel: 'Buka Jurnal & Kalender (Orbit)',
    actionType: 'orbit',
    toastMsg: '🏰 Memasuki Menara Kristal — Rumah Lele: Cahaya kristal biru-ungu menyambutmu dengan tenang 🌙'
  },
  teleskop: {
    id: 'teleskop',
    icon: '🔭',
    tag: 'LOKASI B · CRYSTAL MOON SANCTUARY',
    title: 'Observatorium Kristal — Teleskop',
    subtitle: 'Teras Pengamatan Langit Malam & Kristal Perak',
    description: 'Tempat pengamatan langit malam di titik tinggi pulau dengan teleskop dari kristal murni dan logam perak berpadu bola armillary. Dari sini, Lele mengamati bulan sabit, gugusan bintang, dan galaksi yang bertaburan partikel cahaya.',
    highlight: '✨ Langit malam indigo berbintang · Fitur observasi mendalam siap dikembangkan di tahap berikutnya',
    actionLabel: 'Amati Bulan & Bintang Malam ☾',
    actionType: 'toast',
    toastMsg: '🔭 Observatorium Kristal: "Find your light in the darkness — bintang malam bersinar lembut di atas Crystal Moon Sanctuary ✦"'
  },
  gazebo: {
    id: 'gazebo',
    icon: '💎',
    tag: 'LOKASI C · CRYSTAL MOON SANCTUARY',
    title: 'Gazebo Kristal',
    subtitle: 'Paviliun Mahkota Kelopak Kristal di Tepi Sungai',
    description: 'Gazebo berstruktur kristal transparan dengan atap berbentuk mahkota kelopak kristal dan sofa nyaman berhiaskan cahaya keperakan lembut di bagian dalam, terletak tenang di dekat aliran Sungai Kristal.',
    highlight: '💎 Pantulan kristal malam & gemericik air sungai menghadirkan ketenangan',
    actionLabel: 'Bersantai di Gazebo Kristal ☾',
    actionType: 'toast',
    toastMsg: '💎 Duduk tenang di Gazebo Kristal sambil menikmati pendar cahaya bulan dan gemericik Sungai Kristal 🌙'
  },
  kotak_pos: {
    id: 'kotak_pos',
    icon: '✉',
    tag: 'LOKASI D · CRYSTAL MOON SANCTUARY',
    title: 'Kotak Pos Kristal',
    subtitle: 'Kotak Surat Kristal Bulan Bercahaya Biru-Ungu',
    description: 'Kotak pos unik dari kristal bercahaya yang menyerupai lentera kristal bulan di dekat hamparan bunga snowdrop. Tempat Lele menerima dan membaca surat hangat dari sahabat tanpa mengganggu ketenangan malam.',
    highlight: '💌 Kotak Pos Kristal aktif · Siap terhubung dengan fitur surat sahabat pada tahap berikutnya',
    actionLabel: 'Buka Kotak Pos Kristal ✉',
    actionType: 'toast',
    toastMsg: '✉ Membuka Kotak Pos Kristal: "In the darkest night, we bloom the brightest — salam hangat dari sahabatmu! 🌙"'
  },
  ladang_bunga: {
    id: 'ladang_bunga',
    icon: '🌸',
    tag: 'LOKASI E · CRYSTAL MOON SANCTUARY',
    title: 'Ladang Bunga — Hydrangea & Snowdrop',
    subtitle: 'Hamparan Hortensia Gradasi & Snowdrop Putih Malam',
    description: 'Ladang bunga alami yang menyatu dengan lanskap malam, dipenuhi bunga Hydrangea (hortensia) bergradasi biru, ungu, merah muda, dan putih, berpadu dengan bunga Snowdrop putih mungil yang elegan serta kunang-kunang yang terbang perlahan.',
    highlight: '🦋 Hydrangea biru-ungu-pink & Snowdrop putih mekar di bawah tarian kunang-kunang',
    actionLabel: 'Telusuri Ladang Hydrangea & Snowdrop 🌸',
    actionType: 'toast',
    toastMsg: '🌸 Kelopak Hydrangea dan Snowdrop bergerak lembut tertiup angin malam bersama kilau kunang-kunang ✨'
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
    title: 'Galeri Seni Kristal',
    subtitle: 'Paviliun Kaca & Kristal Tempat Pajangan Lukisan Lele',
    description: 'Paviliun seni bercahaya dengan arsitektur kristal, batu, dan kubah kaca transparan. Di dalamnya terpajang deretan bingkai lukisan di atas easel kayu dan dinding kaca tempat Lele memamerkan karya-karya seninya.',
    highlight: '🖼 Beberapa bingkai lukisan malam & kanvas kosmik Lele terpajang rapi di galeri',
    actionLabel: 'Lihat Koleksi Lukisan & Momen',
    actionType: 'moments',
    toastMsg: '🎨 Mengunjungi Galeri Seni Kristal: Lukisan-lukisan malam karya Lele berkilau di bawah cahaya kristal!'
  }
};

export function initUniversesView({
  onShowToast,
  onTriggerSparkle,
  onNavigateOrbit,
  onNavigateMoments,
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
  let activeUser = 'ale';

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
        if (onShowToast) onShowToast('✦ Kamu berada di halaman utama Universes ✦');
        if (onTriggerSparkle) onTriggerSparkle(btn.getBoundingClientRect().left + 40, btn.getBoundingClientRect().top + 15);
      } else if (navTarget === 'gallery') {
        // Open Moments Scrapbook!
        if (typeof onNavigateMoments === 'function') {
          onNavigateMoments('view-private-universe');
        }
      } else if (navTarget === 'messages') {
        openInfoModal(
          '📬 Little Post Office (Fase 3)',
          'Kotak surat digital privat sahabat. Kamu akan bisa menulis surat rahasia, surat dengan cap waktu (Time Capsule), kartu pos bertema planet, dan lampiran catatan audio antar sahabat.'
        );
      } else if (navTarget === 'games') {
        openInfoModal(
          '🎮 Going Seventeen Zone (Fase 6)',
          'Arena permainan persahabatan privat tiga sahabat! Berisi: How Well Do You Know Me?, This or That, Who Said That?!, dan Bestie Mission untuk mengisi malam yang seru bersama.'
        );
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
    }

    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
    if (onShowToast) {
      onShowToast('✨ Memasuki Dunia 2D KIDULT — Pilih salah satu lokasi di pulau untuk menjelajah!');
    }
  }

  function closeKidultWorld() {
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
    if (onShowToast) {
      onShowToast('🪐 Kembali ke Pemilihan Tiga Universe');
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

  // ==========================================================
  // TO YOU — BELLA'S 2D FAIRY FOREST WORLD CONTROLLER
  // ==========================================================
  const viewToYouWorld = document.getElementById('view-toyou-world');
  const btnToYouBack = document.getElementById('btn-toyou-back');
  const btnToYouBackTop = document.getElementById('btn-toyou-back-top');
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

    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
    if (onShowToast) {
      onShowToast('☼ Memasuki Dunia 2D TO YOU (Bella\'s Universe) — Pilih lokasi di hutan peri untuk menjelajah!');
    }
  }

  function closeToYouWorld() {
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
    if (onShowToast) {
      onShowToast('🪐 Kembali ke Pemilihan Tiga Universe');
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
  const shadowHotspots = document.querySelectorAll('.shadow-hotspot[data-shadow-loc]');
  const shadowQuickItems = document.querySelectorAll('.shadow-quick-item[data-shadow-nav]');
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

    if (onTriggerSparkle) {
      const x = event ? event.clientX : window.innerWidth / 2;
      const y = event ? event.clientY : window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
    if (onShowToast) {
      onShowToast('☾ Memasuki Dunia 2D SHADOW (Crystal Moon Sanctuary) — Pilih lokasi kristal untuk menjelajah!');
    }
  }

  function closeShadowWorld() {
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
    if (onShowToast) {
      onShowToast('🪐 Kembali ke Pemilihan Tiga Universe');
    }
  }

  function selectShadowLocation(locKey, event) {
    const loc = SHADOW_LOCATIONS[locKey];
    if (!loc) return;

    activeShadowLocationKey = locKey;

    shadowHotspots.forEach(h => {
      h.classList.toggle('active-loc', h.getAttribute('data-shadow-loc') === locKey);
    });
    shadowQuickItems.forEach(q => {
      q.classList.toggle('active-nav', q.getAttribute('data-shadow-nav') === locKey);
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
    shadowQuickItems.forEach(q => q.classList.remove('active-nav'));
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

  shadowQuickItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const locKey = item.getAttribute('data-shadow-nav');
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
      if (loc.actionType === 'orbit' && typeof onNavigateOrbit === 'function') {
        closeShadowLocationPanel();
        if (viewShadowWorld) {
          viewShadowWorld.classList.remove('active');
          viewShadowWorld.setAttribute('aria-hidden', 'true');
        }
        onNavigateOrbit('view-shadow-world');
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

  // 8. Update Active User Profile in Universes Header
  function updateUserProfile(charKey) {
    if (!charKey) return;
    
    // Map charKey to user display name & avatar (preserving user account identity)
    let name = 'Ale';
    let avatarUrl = '/assets/avatar_nyanya_hd.png';

    if (charKey === 'lele' || charKey === 'vanya') {
      name = 'Vanya';
      avatarUrl = '/assets/avatar_lele_hd.png';
    } else if (charKey === 'lala' || charKey === 'bella') {
      name = 'Bella';
      avatarUrl = '/assets/avatar_lala_hd.png';
    } else {
      name = 'Ale';
      avatarUrl = '/assets/avatar_nyanya_hd.png';
    }

    activeUser = name.toLowerCase();

    if (userGreetingEl) {
      userGreetingEl.textContent = `Hello, ${name}`;
    }
    if (userAvatarEl) {
      userAvatarEl.src = avatarUrl;
      userAvatarEl.alt = name;
    }
  }

  return {
    updateUserProfile,
    openUniverseDetail,
    openKidultWorld,
    closeKidultWorld,
    selectKidultLocation,
    openToYouWorld,
    closeToYouWorld,
    selectToYouLocation,
    openShadowWorld,
    closeShadowWorld,
    selectShadowLocation
  };
}
