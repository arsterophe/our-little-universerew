/**
 * OUR LITTLE UNIVERSE — GAMES CORE MODULE (FASE 7)
 * Going Seventeen Zone: 4 Interactive Games for Nyanya ★, Lala ☼, and Lele 🌙.
 */

import {
  auth,
  dbSaveGameRecord,
  dbFetchGameRecords,
  dbSaveGameSession,
  dbFetchGameSession,
  dbSubscribeGameSession,
  SUPPORTED_GAMES
} from './firebase.js';

export const STORAGE_KEY_GAMES_CACHE = 'olu_games_records_cache_v1';
export const STORAGE_KEY_MISSIONS_CACHE = 'olu_bestie_missions_cache_v1';

export const GAME_METADATA = {
  know_me: {
    id: 'know_me',
    title: 'How Well Do You Know Me?',
    subtitle: 'Kuis Seberapa Kenal Kamu dengan Sahabat Kosmik',
    badge: '🧠 Kuis Sahabat',
    icon: '✨',
    color: '#ec4899',
    description: 'Pilih sahabat yang ingin kamu uji pengetahuannya dan tebak fakta unik serta rahasia kecil tentang mereka!'
  },
  this_or_that: {
    id: 'this_or_that',
    title: 'This or That: Kosmik Edition',
    subtitle: 'Pilihan Cepat Penguji Kecocokan Karakter',
    badge: '⚖️ Pilihan Cepat',
    icon: '🌓',
    color: '#10b981',
    description: 'Pilih antara dua hal dalam 5 ronde cepat untuk mengetahui aura kepribadian kosmik dan kecocokanmu dengan Nyanya, Lala, dan Lele!'
  },
  who_said_it: {
    id: 'who_said_it',
    title: 'Who Said That?!',
    subtitle: 'Tebak Siapa Pemilik Kutipan Kosmik Ini',
    badge: '💬 Tebak Kutipan',
    icon: '🔮',
    color: '#8b5cf6',
    description: 'Baca kutipan khas dari tiga universe dan tebak siapa di antara Nyanya ★, Lala ☼, atau Lele 🌙 yang mengatakannya!'
  },
  bestie_mission: {
    id: 'bestie_mission',
    title: 'Bestie Mission: Misi Persahabatan',
    subtitle: 'Tantangan Harian & Misi Kolaboratif Bertiga',
    badge: '🏆 Misi Harian',
    icon: '🪐',
    color: '#f59e0b',
    description: 'Selesaikan misi persahabatan kosmik bersama-sama dan raih lencana kehormatan Trio Cosmic!'
  }
};

// --- DATA PERTANYAAN: HOW WELL DO YOU KNOW ME ---
export const KNOW_ME_QUESTIONS = {
  nyanya: [
    {
      question: 'Di manakah tempat favorit Nyanya untuk mengamati rasi bintang malam?',
      options: ['Teras Observatorium Bintang', 'Taman Bunga Matahari', 'Paviliun Kristal', 'Pusat Kota Pelangi'],
      correctIndex: 0,
      explanation: 'Nyanya menghabiskan malam di Teras Observatorium dengan teleskop bintang pribadinya.'
    },
    {
      question: 'Minuman malam apakah yang paling disukai Nyanya saat menulis jurnal kosmik?',
      options: ['Susu Hangat Rasa Vanila & Bintang', 'Kopi Hitam Pekat', 'Jus Jeruk Asam Segar', 'Air Es Dingin'],
      correctIndex: 0,
      explanation: 'Susu hangat vanila berbintang menemani malam hening Nyanya di Kidult World.'
    },
    {
      question: 'Apa prinsip hidup yang paling dipegang teguh oleh Nyanya di Kidult World?',
      options: ['Menjadi dewasa bukan berarti melupakan mimpi masa kecil', 'Bekerja keras tanpa tidur malam', 'Selalu menang dalam perlombaan', 'Menyembunyikan perasaan dari sahabat'],
      correctIndex: 0,
      explanation: 'Kidult World adalah surga bagi mereka yang merawat keajaiban dan imajinasi masa kecil.'
    },
    {
      question: 'Simbol langit apakah yang menjadi identitas resmi Nyanya?',
      options: ['Bintang Berkilau (★)', 'Matahari Hangat (☼)', 'Bulan Sabit Kristal (☾)', 'Komet Melintas (☄)'],
      correctIndex: 0,
      explanation: 'Nyanya adalah The Moonlit Shadow Witch dengan simbol Bintang Berkilau ★.'
    },
    {
      question: 'Jika Nyanya membuat photobooth strip, dekorasi apa yang wajib ada?',
      options: ['Stiker Bintang & Bingkai Bulan Kosmik', 'Pita Merah Cabai', 'Daun Kering Cokelat', 'Tanpa Hiasan Sama Sekali'],
      correctIndex: 0,
      explanation: 'Tema kosmik retro berbintang adalah identitas scrapbook khas Nyanya.'
    }
  ],
  lala: [
    {
      question: 'Apakah bunga khas yang tumbuh subur di teras To You World milik Lala?',
      options: ['Bunga Matahari Emas 🌻', 'Bunga Mawar Berduri', 'Kaktus Pasir', 'Bunga Bangkai'],
      correctIndex: 0,
      explanation: 'Bunga matahari melambangkan kehangatan dan energi positif tak terbatas milik Lala.'
    },
    {
      question: 'Saat salah satu sahabatnya sedang sedih, apa yang pertama kali dilakukan Lala?',
      options: ['Mengirimkan teh hangat & pesan penyemangat panjang', 'Meninggalkannya sendirian seharian', 'Menertawakan kesalahannya', 'Berpura-pura tidak tahu'],
      correctIndex: 0,
      explanation: 'Lala selalu menjadi sahabat yang paling peka dan hangat memberikan semangat.'
    },
    {
      question: 'Aroma apa yang paling mencerminkan suasana rumah Lala di To You World?',
      options: ['Aroma teh chamomile & jeruk segar pagi hari', 'Aroma asap knalpot', 'Aroma bensin & cat', 'Aroma ruang tertutup'],
      correctIndex: 0,
      explanation: 'Teh chamomile dan hangatnya matahari pagi adalah aroma khas To You World.'
    },
    {
      question: 'Simbol alam semesta apakah yang menjadi lambang Lala?',
      options: ['Matahari Terbit (☼)', 'Bintang Kejora (★)', 'Bulan Sabit (☾)', 'Awan Mendung (☁)'],
      correctIndex: 0,
      explanation: 'Lala adalah The Sunshine Healer dengan simbol Matahari Hangat ☼.'
    },
    {
      question: 'Apa warna dominan yang menghiasi universe Lala?',
      options: ['Kuning Keemasan & Hijau Mint Segar', 'Hitam & Abu-abu Kelam', 'Merah Api Pekat', 'Biru Tua Gelap'],
      correctIndex: 0,
      explanation: 'Warna cerah kuning keemasan dan hijau mint mencerminkan alam To You World.'
    }
  ],
  lele: [
    {
      question: 'Karya seni apa yang paling sering dibuat oleh Lele di Galeri Seni Kristal?',
      options: ['Lukisan Kanvas Langit Malam & Kristal Cahaya', 'Patung Tanah Liat', 'Origami Kertas Lipat', 'Grafiti Tembok Jalanan'],
      correctIndex: 0,
      explanation: 'Lele melukis keindahan langit malam dan kristal bercahaya di Shadow World.'
    },
    {
      question: 'Suasana waktu apakah yang paling menginspirasi Lele untuk berkarya?',
      options: ['Tengah malam hening dengan cahaya rembulan', 'Siang bolong terik matahari', 'Jam sibuk pagi hari', 'Sore hari yang bising'],
      correctIndex: 0,
      explanation: 'Ketenangan tengah malam adalah saat di mana imajinasi artistik Lele bermekaran.'
    },
    {
      question: 'Benda pusaka apa yang dipajang di ruang tamu Shadow World milik Lele?',
      options: ['Lentera Kristal Ungu Berpendar', 'Jam Dinding Rusak', 'Piala Plastik Mainan', 'Sepeda Mini'],
      correctIndex: 0,
      explanation: 'Lentera kristal ungu menerangi lorong galeri seni kristal milik Lele.'
    },
    {
      question: 'Simbol kosmik apakah yang melekat pada kepribadian Lele?',
      options: ['Bulan Sabit Kristal (☾)', 'Matahari Terik (☼)', 'Bintang Berekor (★)', 'Petir Menyambar (⚡)'],
      correctIndex: 0,
      explanation: 'Lele adalah The Crystal Shadow Artist dengan simbol Bulan Sabit ☾.'
    },
    {
      question: 'Bagaimana cara Lele mengekspresikan rasa sayangnya kepada Nyanya dan Lala?',
      options: ['Membuatkan lukisan eksklusif & surat rahasia berharga', 'Menyembunyikan barang mereka', 'Jarang membalas pesan', 'Mengabaikan obrolan bersama'],
      correctIndex: 0,
      explanation: 'Lele adalah tipe sahabat yang tulus mengekspresikan kasih sayangnya melalui karya seni dan surat penuh makna.'
    }
  ]
};

// --- DATA PERTANYAAN: THIS OR THAT ---
export const THIS_OR_THAT_ROUNDS = [
  {
    id: 'tot_1',
    category: 'Suasana Waktu',
    optionA: { label: 'Malam Sunyi Berbintang ✨', trait: 'nyanya_lele', desc: 'Suka ketenangan, perenungan, dan keajaiban malam' },
    optionB: { label: 'Pagi Cerah Penuh Energi ☀️', trait: 'lala', desc: 'Penuh semangat baru, optimisme, dan kehangatan' }
  },
  {
    id: 'tot_2',
    category: 'Minuman Sahabat',
    optionA: { label: 'Susu Hangat Madu 🍯', trait: 'nyanya', desc: 'Menenangkan jiwa dan ramah nostalgia' },
    optionB: { label: 'Teh Jeruk Chamomile 🍵', trait: 'lala_lele', desc: 'Menyegarkan pikiran dan menenangkan detak waktu' }
  },
  {
    id: 'tot_3',
    category: 'Kegiatan Favorit',
    optionA: { label: 'Menulis Kisah di Buku Jurnal 📖', trait: 'nyanya_lala', desc: 'Mengabadikan kenangan dalam kata-kata puitis' },
    optionB: { label: 'Melukis Kanvas Penuh Warna 🎨', trait: 'lele', desc: 'Mengekspresikan rasa dalam visual dan goresan warna' }
  },
  {
    id: 'tot_4',
    category: 'Abadikan Kenangan',
    optionA: { label: 'Photobooth Strip 4 Pose 📸', trait: 'lala_nyanya', desc: 'Gaya seru spontan dan penuh ekspresi bersama' },
    optionB: { label: 'Kotak Surat Pesan Rahasia 💌', trait: 'lele_nyanya', desc: 'Ungkapan hati mendalam yang disimpan abadi' }
  },
  {
    id: 'tot_5',
    category: 'Petualangan Impian',
    optionA: { label: 'Jelajah Observatorium Planet 🪐', trait: 'nyanya', desc: 'Rasa ingin tahu tak terbatas menembus galaksi' },
    optionB: { label: 'Piknik Santai di Padang Bunga 🌻', trait: 'lala', desc: 'Menikmati kebersamaan hangat di alam terbuka' }
  }
];

// --- DATA PERTANYAAN: WHO SAID THAT?! ---
export const WHO_SAID_IT_QUESTIONS = [
  {
    id: 'wsi_1',
    quote: '"Di bawah langit Kidult, kita tidak pernah benar-benar menua. Imajinasi kita adalah kompas sejati."',
    author: 'nyanya',
    authorName: 'Nyanya ★',
    authorUniverse: 'KIDULT',
    hint: 'Diucapkan saat menatap teleskop bintang di Observatorium.'
  },
  {
    id: 'wsi_2',
    quote: '"Setiap hari matahari terbit untuk mengingatkanmu bahwa selalu ada alasan baru untuk tersenyum."',
    author: 'lala',
    authorName: 'Lala ☼',
    authorUniverse: 'TO YOU',
    hint: 'Sering diucapkan saat menyeduh teh pagi untuk sahabat.'
  },
  {
    id: 'wsi_3',
    quote: '"Cahaya kristal paling berkilau saat malam berada di titik paling heningnya."',
    author: 'lele',
    authorName: 'Lele 🌙',
    authorUniverse: 'SHADOW',
    hint: 'Tertulis di plakat pintu masuk Paviliun Galeri Seni.'
  },
  {
    id: 'wsi_4',
    quote: '"Jika kamu rindu, cukup tatap bintang ketiga di barat. Aku sudah menitipkan doa persahabatan di sana."',
    author: 'nyanya',
    authorName: 'Nyanya ★',
    authorUniverse: 'KIDULT',
    hint: 'Kutipan dari surat rahasia di Little Post Office.'
  },
  {
    id: 'wsi_5',
    quote: '"Hangatnya persahabatan kita sanggup meluruhkan dinginnya musim apa pun."',
    author: 'lala',
    authorName: 'Lala ☼',
    authorUniverse: 'TO YOU',
    hint: 'Kutipan catatan pada foto bersama di Moments.'
  },
  {
    id: 'wsi_6',
    quote: '"Warna malam bukan sekadar hitam, ada jutaan gradasi ungu dan perak yang menunggu untuk dilihat."',
    author: 'lele',
    authorName: 'Lele 🌙',
    authorUniverse: 'SHADOW',
    hint: 'Kutipan di balik kanvas lukisan kristal nomor 7.'
  }
];

// --- DATA BESTIE MISSIONS ---
export const DEFAULT_BESTIE_MISSIONS = [
  {
    id: 'msn_1',
    title: 'Kirim Pesan Bintang di Messages',
    badge: '✉️ Komunikasi',
    target: 'messages',
    description: 'Buka Little Post Office dan kirimkan satu pesan hangat untuk sahabatmu.',
    xp: 25
  },
  {
    id: 'msn_2',
    title: 'Abadikan Momen di Photobooth',
    badge: '📸 Scrapbook',
    target: 'photobooth',
    description: 'Buka Our Little Photobooth dan simpan satu strip foto kenangan baru.',
    xp: 35
  },
  {
    id: 'msn_3',
    title: 'Kunjungi Perpustakaan Our Stories',
    badge: '📖 Literasi',
    target: 'stories',
    description: 'Baca satu karya cerita atau buka editor Personal Writing.',
    xp: 20
  },
  {
    id: 'msn_4',
    title: 'Cek Kalender Persahabatan di Orbit',
    badge: '🪐 Kalender',
    target: 'orbit',
    description: 'Lihat agenda kumpul atau jadwal ulang tahun di Our Calendar.',
    xp: 20
  }
];

// --- STATE MANAGEMENT LOKAL ---
let activeUserCharacter = 'nyanya';
let gameRecordsCache = [];
let bestieMissionProgress = {};
let gameListeners = [];

function loadGamesCacheFromStorage() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAMES_CACHE);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveGamesCacheToStorage(records) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_GAMES_CACHE, JSON.stringify(records));
  } catch (_) {}
}

function loadMissionsCacheFromStorage() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MISSIONS_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveMissionsCacheToStorage(progress) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MISSIONS_CACHE, JSON.stringify(progress));
  } catch (_) {}
}

// Hydrate caches
gameRecordsCache = loadGamesCacheFromStorage();
bestieMissionProgress = loadMissionsCacheFromStorage();

export function setActiveUserCharacter(charKey) {
  if (charKey === null || charKey === undefined || charKey === '') {
    activeUserCharacter = null;
    notifyGameListeners();
    return;
  }
  if (['nyanya', 'lala', 'lele'].includes(charKey)) {
    activeUserCharacter = charKey;
    notifyGameListeners();
  }
}

export function getActiveUserCharacter() {
  return activeUserCharacter;
}

export function subscribeGameChanges(listener) {
  if (typeof listener === 'function') {
    gameListeners.push(listener);
    return () => {
      gameListeners = gameListeners.filter(l => l !== listener);
    };
  }
  return () => {};
}

function notifyGameListeners() {
  gameListeners.forEach(fn => {
    try { fn(); } catch (e) { console.warn('Game listener error:', e); }
  });
}

// --- LOGIKA GAME 1: HOW WELL DO YOU KNOW ME ---
export function getKnowMeQuestions(targetChar = 'nyanya') {
  const list = KNOW_ME_QUESTIONS[targetChar] || KNOW_ME_QUESTIONS.nyanya;
  return list.map((q, idx) => ({
    id: `km_${targetChar}_${idx}`,
    targetChar,
    questionNumber: idx + 1,
    totalQuestions: list.length,
    question: q.question,
    options: [...q.options],
    correctIndex: q.correctIndex,
    explanation: q.explanation
  }));
}

export function evaluateKnowMeScore(score, maxScore = 5) {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  let title = 'Bestie Sejati!';
  let badge = '🏆 Cosmic Soulmate';
  let message = 'Luar biasa! Kamu hafal setiap detail kecil tentang sahabatmu!';

  if (percentage < 40) {
    title = 'Perlu Sering Ngobrol!';
    badge = '🌱 Bibit Persahabatan';
    message = 'Yuk ajak sahabatmu mengobrol di Little Post Office agar makin akrab!';
  } else if (percentage < 80) {
    title = 'Sahabat Baik!';
    badge = '⭐ Bestie Setia';
    message = 'Keren! Kamu sudah sangat mengenal kepribadian dan kebiasaan sahabatmu!';
  }

  return { score, maxScore, percentage, title, badge, message };
}

// --- LOGIKA GAME 2: THIS OR THAT ---
export function calculateThisOrThatAura(picks = {}) {
  let traitCounts = { nyanya: 0, lala: 0, lele: 0 };

  Object.values(picks).forEach(opt => {
    if (!opt || !opt.trait) return;
    if (opt.trait.includes('nyanya')) traitCounts.nyanya += 1;
    if (opt.trait.includes('lala')) traitCounts.lala += 1;
    if (opt.trait.includes('lele')) traitCounts.lele += 1;
  });

  const total = (traitCounts.nyanya + traitCounts.lala + traitCounts.lele) || 1;
  const affinity = {
    nyanya: Math.round((traitCounts.nyanya / total) * 100),
    lala: Math.round((traitCounts.lala / total) * 100),
    lele: Math.round((traitCounts.lele / total) * 100)
  };

  let dominant = 'nyanya';
  if (affinity.lala > affinity[dominant]) dominant = 'lala';
  if (affinity.lele > affinity[dominant]) dominant = 'lele';

  const auraTitles = {
    nyanya: {
      title: 'Aura Bintang Malam (Kidult Spirit)',
      desc: 'Kamu menyukai keajaiban, imajinasi, dan kehangatan masa kecil.',
      badge: '★ Soul of Starlight'
    },
    lala: {
      title: 'Aura Matahari Hangat (Sunshine Energy)',
      desc: 'Kamu adalah pembawa energi positif, ceria, dan selalu menyemangati sahabat.',
      badge: '☼ Heart of Sunshine'
    },
    lele: {
      title: 'Aura Kristal Rembulan (Poetic Shadow)',
      desc: 'Kamu memiliki jiwa artistik mendalam, reflektif, dan menghargai ketenangan malam.',
      badge: '☾ Mind of Crystal'
    }
  };

  return {
    dominant,
    affinity,
    title: auraTitles[dominant].title,
    desc: auraTitles[dominant].desc,
    badge: auraTitles[dominant].badge
  };
}

// --- LOGIKA GAME 3: WHO SAID THAT?! ---
export function getWhoSaidItQuestions(limit = 5) {
  return WHO_SAID_IT_QUESTIONS.slice(0, limit);
}

// --- LOGIKA GAME 4: BESTIE MISSIONS ---
export function getBestieMissions(charKey = activeUserCharacter) {
  const userProgress = bestieMissionProgress[charKey] || {};
  return DEFAULT_BESTIE_MISSIONS.map(m => ({
    ...m,
    completed: !!userProgress[m.id],
    completedAt: userProgress[m.id] || null
  }));
}

export async function toggleBestieMission(missionId, charKey = activeUserCharacter) {
  if (!bestieMissionProgress[charKey]) {
    bestieMissionProgress[charKey] = {};
  }

  const isDone = !bestieMissionProgress[charKey][missionId];
  if (isDone) {
    bestieMissionProgress[charKey][missionId] = Date.now();
  } else {
    delete bestieMissionProgress[charKey][missionId];
  }

  saveMissionsCacheToStorage(bestieMissionProgress);

  // Sync to Firestore if authenticated
  if (auth && auth.currentUser) {
    try {
      await dbSaveGameSession({
        id: `mission-${charKey}-${new Date().toISOString().slice(0, 10)}`,
        gameId: 'bestie_mission',
        participants: ['nyanya', 'lala', 'lele'],
        status: 'active',
        createdBy: charKey,
        progress: bestieMissionProgress[charKey]
      }, auth.currentUser);
    } catch (err) {
      console.warn('Sync mission to cloud skipped/failed:', err.message);
    }
  }

  notifyGameListeners();
  return isDone;
}

// --- SIMPAN RIWAYAT PERMAINAN (CLOUD + OFFLINE CACHE) ---
export async function saveGameResult({
  gameId,
  score = 0,
  maxScore = 5,
  summary = '',
  answers = {}
}) {
  const current = activeUserCharacter;
  const now = Date.now();
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const localRecord = {
    id: `local-rec-${gameId}-${now}`,
    gameId,
    playerUid: auth?.currentUser?.uid || 'local-guest',
    playerChar: current,
    playerName: current.toUpperCase(),
    playerAvatar: `/assets/avatar_${current}_hd.png`,
    score,
    maxScore,
    percentage,
    summary,
    answers,
    status: 'completed',
    createdAt: now,
    isLocalOnly: !auth?.currentUser
  };

  // 1. Simpan ke local cache selalu
  gameRecordsCache.unshift(localRecord);
  saveGamesCacheToStorage(gameRecordsCache);
  notifyGameListeners();

  // 2. Jika login ke Firebase, simpan ke Cloud Firestore
  if (auth && auth.currentUser) {
    try {
      const cloudRecord = await dbSaveGameRecord({
        gameId,
        score,
        maxScore,
        percentage,
        summary,
        answers
      }, auth.currentUser);

      // Ganti local record dengan data resmi Cloud
      const idx = gameRecordsCache.findIndex(r => r.id === localRecord.id);
      if (idx !== -1) {
        gameRecordsCache[idx] = cloudRecord;
        saveGamesCacheToStorage(gameRecordsCache);
      }
      notifyGameListeners();
      return cloudRecord;
    } catch (err) {
      console.warn('Gagal menyimpan riwayat ke Firestore, data tersimpan di local cache:', err);
      localRecord.offlineError = err.message || 'Gagal tersambung ke cloud';
      return localRecord;
    }
  }

  return localRecord;
}

export function getCachedGameRecords(gameId = null) {
  if (gameId && SUPPORTED_GAMES.includes(gameId)) {
    return gameRecordsCache.filter(r => r.gameId === gameId);
  }
  return [...gameRecordsCache];
}

export async function fetchCloudGameRecords(gameId = null) {
  try {
    const cloudRecords = await dbFetchGameRecords(gameId, 30);
    if (Array.isArray(cloudRecords) && cloudRecords.length > 0) {
      // Merge with cache avoiding duplicate ids
      const map = new Map();
      cloudRecords.forEach(r => map.set(r.id, r));
      gameRecordsCache.forEach(r => {
        if (!map.has(r.id)) map.set(r.id, r);
      });
      gameRecordsCache = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      saveGamesCacheToStorage(gameRecordsCache);
      notifyGameListeners();
    }
    return getCachedGameRecords(gameId);
  } catch (err) {
    console.warn('Gagal memuat rekor dari cloud, memakai cache lokal:', err.message);
    return getCachedGameRecords(gameId);
  }
}

