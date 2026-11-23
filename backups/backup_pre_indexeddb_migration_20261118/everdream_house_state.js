/**
 * THE EVERDREAM HOUSE — NYANYA ⭐ (UNIVERSE KIDULT)
 * State Management, Lore Archives, Audio Synthesis & Persistence
 * Tagline: "Where Childhood Dreams Never Fade."
 * =============================================================================
 */

export const EVERDREAM_CHARACTER = {
  id: 'nyanya',
  name: 'Nyanya',
  role: 'The Moonlit Shadow Witch ♡',
  symbol: '⭐',
  universe: 'KIDULT',
  avatar: '/assets/avatar_nyanya_hd.png',
  chibi: '/assets/chibi_nyanya_avatar.png',
  quote: 'Where childhood dreams never fade.'
};

export const EVERDREAM_ROOMS = [
  {
    id: 'exterior',
    name: 'Halaman & Taman',
    title: 'Halaman & Taman Dongeng',
    subtitle: 'The Storybook Garden & Cottage Exterior',
    icon: '🏡',
    description: 'Halaman depan berbatu alam dengan taman bunga mawar pastel, lavender, lentera taman, serta pemandangan menuju greenhouse, gazebo, dan sungai senja.'
  },
  {
    id: 'living',
    name: 'Living Room',
    title: 'The Memory Living Room',
    subtitle: 'Perapian Hangat, Sofa Beludru & Rak Cerita',
    icon: '🛋️',
    description: 'Ruang keluarga yang hangat beralaskan karpet lembut, sofa empuk dusty pink, perapian batu dengan api yang menari, dan rak buku dongeng masa kecil.'
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    title: "The Dreamer's Bedroom",
    subtitle: 'Ranjang Kanopi, Lampu Bintang & Meja Jurnal',
    icon: '🛏️',
    description: 'Kamar tidur bertirai transparan dengan kanopi mimpi, lampu bintang emas yang berkilau, meja jurnal kayu ukir, dan balkon menghadap taman.'
  },
  {
    id: 'atelier',
    name: 'Atelier',
    title: 'The Little Wonder Atelier',
    subtitle: 'Ruang Seni, Sketsa Senja & Scrapbook',
    icon: '🎨',
    description: 'Studio kreativitas tempat Nyanya melukis di atas kanvas, merangkai scrapbook kenangan, dan menulis kartu ucapan bertabur stardust.'
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    title: 'The Sweet Memories Kitchen',
    subtitle: 'Dapur Vintage, Kue Bintang & Teh Bunga',
    icon: '🍳',
    description: 'Dapur harum berlemari kaca dengan toples madu kosmik, oven kue bintang, dan meja makan renda untuk menikmati afternoon tea.'
  },
  {
    id: 'attic',
    name: 'Secret Attic',
    title: 'The Little Memory Attic',
    subtitle: 'Ruang Rahasia Loteng & Peti Kenangan Abadi',
    icon: '🗝️',
    description: 'Loteng rahasia di bawah atap tinggi Victorian dengan jendela skylight bertabur bintang, tumpukan kotak kenangan, dan Peti Kenangan masa lalu Nyanya.'
  }
];

export const EVERDREAM_ATMOSPHERES = [
  {
    id: 'twilight',
    name: 'Golden Twilight',
    icon: '🌅',
    hint: 'Senja Keemasan',
    description: 'Cahaya keemasan senja magis dengan langit peach-lavender hangat dan bintang-bintang pertama.'
  },
  {
    id: 'rosy',
    name: 'Rosy Sunset',
    icon: '🌸',
    hint: 'Lembayung Mawar',
    description: 'Langit senja bernuansa dusty pink lembut dan kabut lavender yang menenangkan.'
  },
  {
    id: 'morning',
    name: 'Warm Morning',
    icon: '☀️',
    hint: 'Fajar Champagne',
    description: 'Cahaya pagi champagne gold dengan embun berkilau di atas dedaunan taman.'
  },
  {
    id: 'starry',
    name: 'Starry Night',
    icon: '🌌',
    hint: 'Malam Berbintang',
    description: 'Malam biru beludru bertabur jutaan bintang kosmik dan kunang-kunang berkilauan.'
  }
];

export const EVERDREAM_MEMORY_CHEST = [
  {
    id: 'mem_first_star',
    title: 'Bintang Pertama di Menara Jam',
    owner: 'Nyanya ⭐',
    date: 'Malam Permulaan · KIDULT',
    icon: '⭐',
    excerpt: 'Pecahan kristal bintang kecil yang kutemukan di bawah jarum jam menara saat pertama kali pulau KIDULT menyambutku. Kristal ini berbisik bahwa selama kita percaya pada keajaiban kecil, mimpi kita tidak akan pernah memudar.',
    gift: 'Kristal Bintang Abadi berbungkus pita satin lavender.'
  },
  {
    id: 'mem_lala_sunflower',
    title: 'Kelopak Bunga Matahari Senja dari Lala',
    owner: 'Lala ☀️ (TO YOU)',
    date: 'Musim Semi Cahaya',
    icon: '🌻',
    excerpt: 'Bunga matahari kecil yang dipetik Lala dari taman TO YOU. Walau matahari terbenam dan malam tiba, kelopak ini tetap menyimpan sedikit kehangatan sinar mentari agar aku tidak merasa kedinginan.',
    gift: 'Bunga Kering Tertekan dalam Buku Catatan Kulit Tipis.'
  },
  {
    id: 'mem_lele_chessboard',
    title: 'Pion Catur Perak & Obsidian Lele',
    owner: 'Lele 🌙 (SHADOW)',
    date: 'Malam Tanpa Bintang',
    icon: '♟️',
    excerpt: 'Dua buah pion catur yang dihadiahkan Lele padaku. Dia berkata: "Satu pion malaikat perak untuk hari-harimu yang penuh senyum, dan satu pion obsidian gelap untuk melindungimu saat dunia menjadi terlalu bising."',
    gift: 'Sepasang Pion Catur Antik Mini bertatahkan permata bulan.'
  },
  {
    id: 'mem_syma_pinwheel',
    title: 'Kincir Angin Lavender dari Syma',
    owner: 'Syma ☁️ (PINWHEEL)',
    date: 'Sore Berangin Tenang',
    icon: '🎐',
    excerpt: 'Kincir angin origami kertas ungu buatan tangan Syma. Saat angin berhembus melintasi beranda, kincir ini berputar lembut dan mendengungkan melodi nostalgia dari lembah kitsune.',
    gift: 'Kincir Angin Origami Lavender berlonceng kaca mini.'
  },
  {
    id: 'mem_akhira_seashell',
    title: 'Kerang Mutiara Berbisik dari Akhira',
    owner: 'Akhira 🌊 (YAWN)',
    date: 'Malam Berbuih Bintang',
    icon: '🐚',
    excerpt: 'Kerang samudra yang memancarkan pendar biru toska. Jika didekatkan ke telinga, kita bisa mendengar deburan ombak lembut yang menenangkan jiwa yang lelah.',
    gift: 'Kerang Mutiara Laut Dalam beraroma garam dan angin malam.'
  },
  {
    id: 'mem_ela_lotus',
    title: 'Kuncup Teratai Putih Kaca dari Ela',
    owner: 'Ela 🪷 (US AGAIN)',
    date: 'Fajar Lotus Bersemi',
    icon: '🪷',
    excerpt: 'Karya seni kaca tiup berbentuk kuncup teratai dari The Silent Lotus. Mengingatkanku bahwa ketenangan batin adalah rumah terindah yang bisa kita singgahi.',
    gift: 'Kuncup Teratai Kaca Bening beraroma melati lembut.'
  },
  {
    id: 'mem_ruben_royan_embers',
    title: 'Lentera Api Abadi & Kristal Kembang Api',
    owner: 'Ruben 🐉 (ASH) & Royan 🎆 (HOT)',
    date: 'Festival Malam Hangat',
    icon: '🔥',
    excerpt: 'Batu bara naga kecil dari Ruben yang memancarkan kehangatan abadi di dalam wadah perunggu, dipadukan dengan butiran kristal kembang api dari Royan yang berkilau warna-warni saat diputar.',
    gift: 'Lentera Mini Bersegel Kaca Tahan Panas berhias ukiran naga & percikan kembang api.'
  }
];

export const EVERDREAM_BOOKSHELF = [
  {
    id: 'book_boy_stars',
    title: 'The Boy Who Kept the Stars',
    genre: 'Dongeng Klasik Victorian',
    author: 'Koleksi Masa Kecil Nyanya',
    icon: '📖',
    snippet: '"Setiap kali sebutir bintang jatuh dari langit beludru, anak itu menampungnya dengan toples kaca bertutup gabus. Bukan untuk mengurungnya, melainkan untuk membacakannya dongeng pengantar tidur sebelum melepaskannya kembali saat fajar."'
  },
  {
    id: 'book_clockwork_cloud',
    title: 'Fairytale of the Clockwork Cloud',
    genre: 'Kisah Fantasi Mesin & Impian',
    author: 'Penulis Misterius Jam Gadang',
    icon: '🕰️',
    snippet: '"Kota di atas awan tidak digerakkan oleh uap atau roda gigi tembaga semata, melainkan oleh debar harapan dan tawa anak-anak yang belum pernah melupakan mimpi pertama mereka."'
  },
  {
    id: 'book_whispering_river',
    title: 'The Secret of the Whispering River',
    genre: 'Antologi Puisi Senja',
    author: 'Catatan Pinggir Sungai KIDULT',
    icon: '🌊',
    snippet: '"Bawalah perahumu ke hilir saat matahari menyentuh pucuk lavender. Sungai tidak pernah meminta arah, ia hanya memeluk setiap kelopak mawar yang terjatuh tanpa syarat."'
  },
  {
    id: 'book_botanical_herbarium',
    title: "Little Witch's Botanical Herbarium",
    genre: 'Buku Herbarium & Sketsa Bunga',
    author: 'Nyanya ⭐',
    icon: '🌿',
    snippet: '"Resep merawat Mawar Senja: Siram dengan air embun fajar, beri sedikit lagu bersenandung lembut di senja hari, dan jangan pernah petik durinya—karena duri itu yang menjaga harumnya tetap manis."'
  },
  {
    id: 'book_plushie_tales',
    title: 'Catatan Tiga Sahabat Boneka',
    genre: 'Koleksi Boneka Antik',
    author: 'Starlight Bear, Pip si Kelinci, & Mochi Kucing',
    icon: '🧸',
    snippet: '"Starlight Bear selalu duduk di sisi kiri sofa perapian, Pip si kelinci telinga panjang gemar meringkuk di dekat tumpukan bantal dusty pink, dan Mochi kucing angkasa selalu mengawasi jendela jika ada bintang jatuh."'
  }
];

export const EVERDREAM_RECIPES = [
  {
    id: 'recipe_star_shortbread',
    name: 'Kue Bintang Madu Kosmik (Starry Shortbread)',
    category: 'Baking',
    icon: '⭐',
    prepTime: '15 menit memanggang',
    ingredients: ['Tepung Terigu Halus', 'Mentega Ivory Cream', 'Madu Kosmik Keemasan', 'Gula Bintang Berkilau'],
    desc: 'Kue mentega renyah berbentuk bintang dengan taburan gula kristal yang meleleh lembut di lidah.'
  },
  {
    id: 'recipe_strawberry_tart',
    name: 'Tart Stroberi Senja (Sunset Strawberry Tart)',
    category: 'Baking',
    icon: '🍓',
    prepTime: '20 menit memanggang',
    ingredients: ['Kulit Pie Renyah', 'Selai Stroberi Hutan', 'Krim Vanilla Segar', 'Kelopak Mawar Pastel'],
    desc: 'Tart mini beraroma stroberi segar dan kelopak mawar yang manis dan lembut seperti senja di tepi sungai.'
  },
  {
    id: 'recipe_chamomile_tea',
    name: 'Teh Hangat Chamomile & Bunga Lavender',
    category: 'Tea Brewing',
    icon: '🫖',
    prepTime: '5 menit menyeduh',
    ingredients: ['Kuntum Chamomile Kering', 'Lavender Bintang Segar', 'Air Mata Air Senja', 'Madu Hutan'],
    desc: 'Seduhan teh herbal aromatik yang menenangkan batin dan menghangatkan jemari di sore hari.'
  },
  {
    id: 'recipe_snow_vanilla',
    name: 'Kue Kering Vanilla Salju (Snowy Vanilla Biscuits)',
    category: 'Baking',
    icon: '🍪',
    prepTime: '12 menit memanggang',
    ingredients: ['Ekstrak Vanilla Manis', 'Kacang Almond Panggang', 'Gula Halus Salju', 'Mentega Dingin'],
    desc: 'Kue kering berbentuk bulan sabit berselimut gula salju putih, teman setia membaca buku di loteng.'
  }
];

export const EVERDREAM_NYANYA_DIALOGS = {
  exterior: [
    'Selamat datang di The Everdream House! Udara senja di taman terasa begitu harum, bukan? 🌸',
    'Bunga-bunga mawar rambat di balkon sedang mekar dengan warna dusty pink yang cantik sekali.',
    'Lentera taman kecil ini selalu menyala sendiri saat langit mulai berubah menjadi golden twilight. ✨',
    'Dari sini kita bisa melihat kubah kaca greenhouse dan mendengar gemericik sungai senja.'
  ],
  living: [
    'Duduklah di sofa empuk ini... Aku baru saja menyalakan perapian batu agar ruangan hangat. 🛋️',
    'Suara kayu perapian yang berderak selalu membuatku teringat dongeng masa kecil.',
    'Lihat, Starlight Bear dan Pip si kelinci lavender sedang menemaniku membaca buku hari ini. 🧸',
    'Bingkai foto di atas perapian ini menyimpan semua senyuman hangat sahabat-sahabatku.'
  ],
  bedroom: [
    'Ranjang kanopiku selalu terasa seperti awan lembut. Tirai transparannya bergoyang tertiup angin senja. 🛏️',
    'Lampu berbentuk bintang ini bisa dinyalakan atau diredupkan. Cahaya hangatnya sangat menenangkan.',
    'Di meja jurnal ini, aku sering menuliskan mimpi-mimpi kecil sebelum terlelap.',
    'Balkon kamarku menghadap langsung ke arah matahari terbenam. Pemandangannya luar biasa indah! 🌅'
  ],
  atelier: [
    'Selamat datang di duniaku yang penuh warna! Di sini aku melukis semua hal yang kusayangi. 🎨',
    'Kanvas di atas easel itu adalah lukisan pulau KIDULT yang sedang kuselesaikan.',
    'Ada banyak pita pastel, stempel bunga, dan kertas bertekstur untuk membuat scrapbook kenangan.',
    'Mari membuat kartu ucapan bintang kecil untuk kita kirimkan pada sahabat tersayang! 💌'
  ],
  kitchen: [
    'Mmm... aroma kue bintang mentega dan teh chamomile hangat sudah memenuhi dapur! 🍳',
    'Toples madu kosmik di rak kaca itu dipetik dari nektar bunga lavender yang tumbuh di greenhouse.',
    'Meja makan kecil bertaplak renda ini sudah kusiapkan untuk sesi afternoon tea kita.',
    'Apakah kamu ingin memanggang satu loyang kue bintang bersamaku sore ini? 🍪'
  ],
  attic: [
    'Ssst... ini adalah tempat rahasiaku yang paling istimewa: The Little Memory Attic! 🗝️',
    'Di bawah jendela langit berbentuk melengkung ini, bintang-bintang terasa begitu dekat.',
    'Peti kayu berukir bintang di sudut itu menyimpan kenangan paling berharga dari seluruh semesta.',
    'Setiap barang kecil di loteng ini punya detak cerita dan cinta yang takkan pernah pudar. ✨'
  ]
};

// Storage Keys
const STORAGE_PREFIX = 'olu_everdream_';

export function loadEverdreamState() {
  try {
    return {
      activeRoom: localStorage.getItem(`${STORAGE_PREFIX}room`) || 'exterior',
      atmosphere: localStorage.getItem(`${STORAGE_PREFIX}atmo`) || 'twilight',
      isFireplaceLit: localStorage.getItem(`${STORAGE_PREFIX}fireplace`) !== 'false',
      isStarLampOn: localStorage.getItem(`${STORAGE_PREFIX}starlamp`) !== 'false',
      unlockedMemories: JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}memories`) || '["mem_first_star"]'),
      savedJournals: JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}journals`) || '[]')
    };
  } catch (err) {
    console.warn('[EverdreamState] Failed to read localStorage:', err);
    return {
      activeRoom: 'exterior',
      atmosphere: 'twilight',
      isFireplaceLit: true,
      isStarLampOn: true,
      unlockedMemories: ['mem_first_star'],
      savedJournals: []
    };
  }
}

export function saveEverdreamState(patch = {}) {
  try {
    if (patch.activeRoom !== undefined) localStorage.setItem(`${STORAGE_PREFIX}room`, patch.activeRoom);
    if (patch.atmosphere !== undefined) localStorage.setItem(`${STORAGE_PREFIX}atmo`, patch.atmosphere);
    if (patch.isFireplaceLit !== undefined) localStorage.setItem(`${STORAGE_PREFIX}fireplace`, patch.isFireplaceLit ? 'true' : 'false');
    if (patch.isStarLampOn !== undefined) localStorage.setItem(`${STORAGE_PREFIX}starlamp`, patch.isStarLampOn ? 'true' : 'false');
    if (patch.unlockedMemories !== undefined) localStorage.setItem(`${STORAGE_PREFIX}memories`, JSON.stringify(patch.unlockedMemories));
    if (patch.savedJournals !== undefined) localStorage.setItem(`${STORAGE_PREFIX}journals`, JSON.stringify(patch.savedJournals));
  } catch (err) {
    console.warn('[EverdreamState] Failed to write localStorage:', err);
  }
}

// Procedural Audio Synthesizer via Web Audio API
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
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

export function playEverdreamChime(toneFreq = 659.25, duration = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(toneFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(toneFreq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

export function playEverdreamLullaby() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const notes = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } catch (e) {}
    }, idx * 260);
  });
}

export function playFireplaceCrackleSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05 * Math.exp(-i / (bufferSize * 0.4));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    noise.connect(filter);
    filter.connect(ctx.destination);
    noise.start();
  } catch (e) {}
}
