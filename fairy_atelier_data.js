/**
 * FAIRY ATELIER DATA & ASSET DEFINITIONS
 * LALA'S UNIVERSE · TO YOU (THE EVERGLOW FAIRY)
 * =============================================================================
 */

export const WARDROBE_CATEGORIES = [
  { id: 'dresses', label: 'Dresses', icon: '👗', description: 'Gaun-gaun fantasi peri anggun dan berenda' },
  { id: 'tops', label: 'Tops', icon: '👚', description: 'Blus sutra, atasan renda, dan korset kelopak' },
  { id: 'skirts', label: 'Skirts', icon: '🩳', description: 'Rok berlipit, rok tulle mengembang, dan rok kelopak' },
  { id: 'outerwear', label: 'Outerwear', icon: '🧥', description: 'Mantel sutra, capelet beludru, dan jubah tipis' },
  { id: 'cardigans', label: 'Cardigans', icon: '🧶', description: 'Cardigan rajut lembut dan bolero renda' },
  { id: 'shoes', label: 'Shoes', icon: '🩰', description: 'Sepatu balet, sandal kelopak bunga, dan sepatu kaca' },
  { id: 'fairy_outfits', label: 'Fairy Outfits', icon: '✨', description: 'Setelan lengkap busana peri tematik' }
];

export const ACCESSORY_CATEGORIES = [
  { id: 'wings', label: 'Fairy Wings', icon: '🧚‍♀️', description: 'Sayap peri berselubung cahaya dan kilau emas' },
  { id: 'hair', label: 'Hair Accessories', icon: '🎀', description: 'Pita sutra, jepit kupu-kupu, dan sisir mutiara' },
  { id: 'crowns', label: 'Flower Crowns', icon: '👑', description: 'Mahkota bunga segar, tiara kristal, dan lingkaran ranting' },
  { id: 'earrings', label: 'Earrings', icon: '💎', description: 'Anting tetesan embun, mutiara, dan kelopak kaca' },
  { id: 'necklaces', label: 'Necklaces', icon: '📿', description: 'Kalung liontin bintang, kuarsa mawar, dan choker pita' },
  { id: 'bags', label: 'Bags', icon: '👜', description: 'Tas serut kelopak bunga dan keranjang anyaman peri' },
  { id: 'magical', label: 'Magical Accessories', icon: '🪄', description: 'Tongkat bintang, serbuk peri, dan botol embun ajaib' }
];

export const SEASONAL_COLLECTIONS = [
  {
    id: 'spring_fairy',
    title: 'Spring Fairy Collection',
    tagline: 'Mekar bersama bunga pertama musim semi',
    icon: '🌸',
    accentColor: '#f472b6',
    bgColor: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(254,240,138,0.15))',
    description: 'Koleksi busana bernuansa kelopak bunga mekar, warna pastel merah muda, cream, dan kuning hangat, disinari embun fajar yang berkilau.',
    keyPieces: ['Gaun Kelopak Sakura', 'Sayap Emas Gemerlap', 'Mahkota Cherry Blossom', 'Cardigan Rajut Blossom']
  },
  {
    id: 'summer_breeze',
    title: 'Summer Breeze Collection',
    tagline: 'Semilir angin hangat padang rumput cerah',
    icon: '☀️',
    accentColor: '#f59e0b',
    bgColor: 'linear-gradient(135deg, rgba(253,224,71,0.18), rgba(251,146,60,0.15))',
    description: 'Koleksi berbahan linen dan sutra super ringan. Didesain untuk hari-hari penuh sinar matahari cerah, petualangan taman, dan piknik peri.',
    keyPieces: ['Sundress Sutra Kuning Mentari', 'Topi Jerami Berpita Peach', 'Sandal Tali Bunga Emas', 'Tas Keranjang Buah']
  },
  {
    id: 'moonlight_fairy',
    title: 'Moonlight Fairy Collection',
    tagline: 'Elegansi tenang di bawah sinar rembulan perak',
    icon: '🌙',
    accentColor: '#c084fc',
    bgColor: 'linear-gradient(135deg, rgba(192,132,252,0.18), rgba(147,197,253,0.15))',
    description: 'Nuansa lavender mistik, perak keperakan, dan biru malam. Dihiasi bordir konstelasi bintang halus dan satin berpendar lembut.',
    keyPieces: ['Gaun Sutra Malam Berbintang', 'Sayap Sutra Rembulan Perak', 'Tiara Kristal Bintang', 'Choker Kuarsa Biru']
  },
  {
    id: 'flower_festival',
    title: 'Flower Festival Collection',
    tagline: 'Perayaan karnaval bunga penuh sukacita',
    icon: '🌺',
    accentColor: '#ec4899',
    bgColor: 'linear-gradient(135deg, rgba(236,72,153,0.18), rgba(251,113,133,0.15))',
    description: 'Warna-warni riang dengan aksen rumbai bunga, sulaman kelopak mawar, dan rok tulle bertingkat yang berputar indah saat menari.',
    keyPieces: ['Gaun Festival Mawar Merona', 'Rok Tulle Berlapis Tiga', 'Mahkota Bunga Pelangi', 'Sepatu Pita Renda']
  },
  {
    id: 'butterfly_garden',
    title: 'Butterfly Garden Collection',
    tagline: 'Keanggunan kepakan sayap di antara semak mawar',
    icon: '🦋',
    accentColor: '#2dd4bf',
    bgColor: 'linear-gradient(135deg, rgba(45,212,191,0.18), rgba(251,207,232,0.15))',
    description: 'Terinspirasi langsung dari Ladang Kupu-kupu TO YOU. Siluet sayap gradasi mint, peach, dan lavender dengan detail renda transparan.',
    keyPieces: ['Blus Sayap Kupu-kupu Mint', 'Rok Kelopak Transparan', 'Jepit Kupu-kupu Berkilau', 'Sayap Kupu-kupu Peach']
  },
  {
    id: 'starlight_dream',
    title: 'Starlight Dream Collection',
    tagline: 'Mimpi indah di atas awan bertabur debu bintang',
    icon: '⭐',
    accentColor: '#38bdf8',
    bgColor: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(254,240,138,0.18))',
    description: 'Kain sifon tembus pandang ditaburi serbuk glitter kosmik emas dan biru langit fajar, menciptakan kesan melayang di angkasa.',
    keyPieces: ['Gaun Awan Fajar Berbintang', 'Sayap Kristal Embun Angkasa', 'Tongkat Cahaya Bintang', 'Anting Tetesan Galaksi']
  }
];

export const FABRIC_LIBRARY = [
  {
    id: 'fabric_lace',
    name: 'Fine Fairy Lace',
    type: 'Lace',
    textureDesc: 'Renda bermotif sulur tanaman dan kelopak bunga yang sangat halus dan lentur.',
    sheen: 'Matte Ethereal',
    feel: 'Lembut, bernapas, dan klasik',
    colorHex: '#fff1f2',
    swatchPattern: 'radial-gradient(circle, #f472b6 10%, transparent 11%), radial-gradient(circle, #f472b6 10%, transparent 11%)',
    bgSize: '16px 16px',
    bgPos: '0 0, 8px 8px'
  },
  {
    id: 'fabric_satin',
    name: 'Glimmer Silk Satin',
    type: 'Satin',
    textureDesc: 'Satin sutra alami dengan kilau mewah memantulkan cahaya matahari pagi.',
    sheen: 'High Luster Gloss',
    feel: 'Licin, jatuh dengan anggun, dan sejuk',
    colorHex: '#fed7aa',
    swatchPattern: 'linear-gradient(135deg, #fef08a 0%, #f472b6 50%, #fed7aa 100%)',
    bgSize: '100% 100%',
    bgPos: '0 0'
  },
  {
    id: 'fabric_chiffon',
    name: 'Breeze Cloud Chiffon',
    type: 'Chiffon',
    textureDesc: 'Sifon semi-transparan yang melayang anggun saat peri terbang berputar.',
    sheen: 'Semi-Sheer Subtle Glow',
    feel: 'Sangat ringan, seperti udara berembun',
    colorHex: '#fbcfe8',
    swatchPattern: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 3px, transparent 3px, transparent 10px)',
    bgSize: '20px 20px',
    bgPos: '0 0'
  },
  {
    id: 'fabric_silk',
    name: 'Pure Mulberry Fairy Silk',
    type: 'Silk',
    textureDesc: 'Sutra murni ditenun dari ulat sutra kebun mawar TO YOU dengan kilau keperakan.',
    sheen: 'Pearlescent Shimmer',
    feel: 'Sangat lembut di kulit peri',
    colorHex: '#fdf4ff',
    swatchPattern: 'linear-gradient(45deg, #fae8ff 25%, #fdf4ff 25%, #fdf4ff 50%, #fae8ff 50%, #fae8ff 75%, #fdf4ff 75%, #fdf4ff 100%)',
    bgSize: '24px 24px',
    bgPos: '0 0'
  },
  {
    id: 'fabric_tulle',
    name: 'Sparkling Stardust Tulle',
    type: 'Tulle',
    textureDesc: 'Jaring tule tipis berstruktur kaku bervolume ditaburi glitter emas dan peach.',
    sheen: 'Glitter Shimmer',
    feel: 'Bervolume, renyah, dan mengembang indah',
    colorHex: '#fef08a',
    swatchPattern: 'radial-gradient(circle, #fde047 15%, transparent 20%), repeating-linear-gradient(0deg, rgba(244,114,182,0.2) 0, rgba(244,114,182,0.2) 1px, transparent 1px, transparent 8px)',
    bgSize: '12px 12px',
    bgPos: '0 0'
  }
];

export const MOTIF_PATTERNS = [
  { id: 'motif_floral', name: 'Petal Bloom & Rose Vines', symbol: '🌸', desc: 'Bunga sakura, kuncup mawar, dan sulur daun mint muda' },
  { id: 'motif_butterfly', name: 'Dancing Butterflies', symbol: '🦋', desc: 'Kupu-kupu mungil mengepakkan sayap di antara lipatan kain' },
  { id: 'motif_starlight', name: 'Celestial Star Dust', symbol: '✨', desc: 'Taburan debu bintang empat sudut berwarna emas dan perak' },
  { id: 'motif_dewdrop', name: 'Morning Dew Pearls', symbol: '💧', desc: 'Tetesan embun berkilau di ujung renda dan kelopak gaun' }
];

export const COLOR_PALETTES = [
  {
    id: 'palette_spring_sunrise',
    name: 'Spring Sunrise',
    colors: ['#f472b6', '#fbcfe8', '#fef08a', '#fed7aa', '#fdf4ff'],
    desc: 'Warna fajar hangat TO YOU: Peach, merah muda lembut, dan kuning madu'
  },
  {
    id: 'palette_mint_meadow',
    name: 'Mint Meadow Bliss',
    colors: ['#a7f3d0', '#6ee7b7', '#ccfbf1', '#fef9c3', '#ffffff'],
    desc: 'Kesegaran rerumputan pagi dan embun Ladang Kupu-kupu'
  },
  {
    id: 'palette_moonlight_whisper',
    name: 'Moonlight Whisper',
    colors: ['#e9d5ff', '#c084fc', '#93c5fd', '#38bdf8', '#f8fafc'],
    desc: 'Keanggunan lavender ungu muda, biru langit malam, dan perak'
  },
  {
    id: 'palette_golden_honey',
    name: 'Sunlight Honey Nectar',
    colors: ['#fef08a', '#fde047', '#f59e0b', '#fbbf24', '#fffbeb'],
    desc: 'Cahaya keemasan mentari pagi yang memberi kehangatan abadi'
  },
  {
    id: 'palette_sakura_blossom',
    name: 'Sakura Petal Fantasy',
    colors: ['#fda4af', '#f43f5e', '#fecdd3', '#fbcfe8', '#fff1f2'],
    desc: 'Gradasi lembut kelopak sakura yang berhamburan dihembus angin'
  }
];

export const WARDROBE_ITEMS = [
  // DRESSES
  {
    id: 'dress_spring_morning',
    category: 'dresses',
    name: 'Gaun Peri Pagi (Spring Bloom Gown)',
    season: 'spring_fairy',
    colorHex: '#f472b6',
    previewIcon: '👗',
    tags: ['Bestseller', 'Fairy Signature'],
    description: 'Gaun ikonis Lala dengan potongan rok bertingkat seperti kelopak bunga mekar, berhias pita satin di dada.',
    silhouette: 'ballgown',
    fabric: 'Silk & Chiffon'
  },
  {
    id: 'dress_sakura_petal',
    category: 'dresses',
    name: 'Gaun Kelopak Sakura Lembut',
    season: 'spring_fairy',
    colorHex: '#fbcfe8',
    previewIcon: '🌸',
    tags: ['Ethereal', 'Sweet'],
    description: 'Gaun merah muda pucat dengan sulaman bunga sakura di pinggang dan hem rok bergelombang.',
    silhouette: 'a-line',
    fabric: 'Fine Lace'
  },
  {
    id: 'dress_sunlight_sundress',
    category: 'dresses',
    name: 'Gaun Sutra Mentari Pagi',
    season: 'summer_breeze',
    colorHex: '#fef08a',
    previewIcon: '☀️',
    tags: ['Bright', 'Warm'],
    description: 'Gaun kuning mentari dengan aksen kancing mutiara dan pita emas di punggung.',
    silhouette: 'empire',
    fabric: 'Mulberry Silk'
  },
  {
    id: 'dress_starry_night',
    category: 'dresses',
    name: 'Gaun Sutra Malam Berbintang',
    season: 'moonlight_fairy',
    colorHex: '#c084fc',
    previewIcon: '🌙',
    tags: ['Mystical', 'Elegant'],
    description: 'Gaun ungu lavender tua dengan taburan gliter keperakan menyerupai rasi bintang malam TO YOU.',
    silhouette: 'mermaid',
    fabric: 'Stardust Tulle'
  },
  {
    id: 'dress_mint_butterfly',
    category: 'dresses',
    name: 'Gaun Kepakan Kupu-kupu Mint',
    season: 'butterfly_garden',
    colorHex: '#a7f3d0',
    previewIcon: '🦋',
    tags: ['Fresh', 'Whimsical'],
    description: 'Gaun hijau mint pastel dengan rok bertumpuk transparan menyerupai bentuk sayap kupu-kupu.',
    silhouette: 'layered',
    fabric: 'Cloud Chiffon'
  },

  // TOPS
  {
    id: 'top_silk_peach',
    category: 'tops',
    name: 'Blus Sutra Peach Kerah Kelopak',
    season: 'spring_fairy',
    colorHex: '#fed7aa',
    previewIcon: '👚',
    tags: ['Delicate'],
    description: 'Atasan sutra berkerah kelopak mawar dengan lengan lonceng tipis tembus pandang.',
    silhouette: 'fitted',
    fabric: 'Mulberry Silk'
  },
  {
    id: 'top_lace_corset',
    category: 'tops',
    name: 'Korset Renda Putih & Pita Emas',
    season: 'flower_festival',
    colorHex: '#fef9c3',
    previewIcon: '🎀',
    tags: ['Formal'],
    description: 'Korset renda bermotif sulur daun dengan tali pengikat emas berkilau di belakang.',
    silhouette: 'corset',
    fabric: 'Fine Fairy Lace'
  },
  {
    id: 'top_chiffon_breeze',
    category: 'tops',
    name: 'Atasan Sifon Semilir Angin',
    season: 'summer_breeze',
    colorHex: '#fbcfe8',
    previewIcon: '☁️',
    tags: ['Casual'],
    description: 'Blus sifon longgar warna pink pastel yang sangat nyaman untuk merancang sketsa seharian.',
    silhouette: 'loose',
    fabric: 'Cloud Chiffon'
  },

  // SKIRTS
  {
    id: 'skirt_petal_rose',
    category: 'skirts',
    name: 'Rok Mekar Kelopak Mawar Peach',
    season: 'spring_fairy',
    colorHex: '#f472b6',
    previewIcon: '🩳',
    tags: ['Romantic'],
    description: 'Rok mini berlayer kelopak mawar yang mengembang manis saat berjalan.',
    silhouette: 'flare',
    fabric: 'Silk Satin'
  },
  {
    id: 'skirt_tulle_shimmer',
    category: 'skirts',
    name: 'Rok Tulle Gemerlap Tiga Lapis',
    season: 'starlight_dream',
    colorHex: '#fef08a',
    previewIcon: '✨',
    tags: ['Sparkly'],
    description: 'Rok tulle emas lembut dengan lapisan gliter halus yang bersinar di setiap langkah.',
    silhouette: 'tutu',
    fabric: 'Sparkling Tulle'
  },
  {
    id: 'skirt_mint_pleated',
    category: 'skirts',
    name: 'Rok Lipit Sutra Mint Pagi',
    season: 'butterfly_garden',
    colorHex: '#a7f3d0',
    previewIcon: '🍃',
    tags: ['Chic'],
    description: 'Rok midi berlipit halus warna hijau mint yang bergoyang mengikuti irama angin.',
    silhouette: 'pleated',
    fabric: 'Mulberry Silk'
  },

  // OUTERWEAR & CARDIGANS
  {
    id: 'outer_silk_capelet',
    category: 'outerwear',
    name: 'Capelet Sutra Embun Fajar',
    season: 'spring_fairy',
    colorHex: '#fdf4ff',
    previewIcon: '🧥',
    tags: ['Royal'],
    description: 'Jubah pundak mungil dengan kancing kristal embun dan pinggiran bulu angsa lembut.',
    silhouette: 'capelet',
    fabric: 'Fine Silk'
  },
  {
    id: 'cardigan_blossom_knit',
    category: 'cardigans',
    name: 'Cardigan Rajut Blossom Cream',
    season: 'spring_fairy',
    colorHex: '#fef08a',
    previewIcon: '🧶',
    tags: ['Cozy'],
    description: 'Cardigan rajutan tangan berhias sulaman bunga mungil di kerah dan lengan.',
    silhouette: 'cropped',
    fabric: 'Soft Wool Blend'
  },
  {
    id: 'cardigan_lavender_ribbon',
    category: 'cardigans',
    name: 'Bolero Renda Lavender Mistik',
    season: 'moonlight_fairy',
    colorHex: '#e9d5ff',
    previewIcon: '💜',
    tags: ['Mystic'],
    description: 'Bolero rajut tipis berhiaskan pita beludru lavender di bagian pergelangan tangan.',
    silhouette: 'bolero',
    fabric: 'Lace Knit'
  },

  // SHOES
  {
    id: 'shoes_fairy_slippers',
    category: 'shoes',
    name: 'Sepatu Balet Kelopak Emas',
    season: 'spring_fairy',
    colorHex: '#fef08a',
    previewIcon: '🩰',
    tags: ['Dance'],
    description: 'Sepatu balet berujung pita satin emas dengan sol lembut tanpa suara untuk melangkah anggun.',
    silhouette: 'flats',
    fabric: 'Silk Satin'
  },
  {
    id: 'shoes_crystal_dew',
    category: 'shoes',
    name: 'Sepatu Kaca Tetesan Embun',
    season: 'starlight_dream',
    colorHex: '#93c5fd',
    previewIcon: '💎',
    tags: ['Magic'],
    description: 'Sepatu transparan berkilau seolah terbuat dari air embun beku yang tidak pernah meleleh.',
    silhouette: 'heels',
    fabric: 'Enchanted Crystal'
  },

  // FAIRY OUTFIT SETS
  {
    id: 'set_everglow_signature',
    category: 'fairy_outfits',
    name: 'Set Gaun Peri Pagi Abadi (Everglow)',
    season: 'spring_fairy',
    colorHex: '#f472b6',
    previewIcon: '👑',
    tags: ['Signature Set'],
    description: 'Kombinasi sempurna Gaun Peri Pagi, Sayap Emas, Mahkota Sakura, dan Sepatu Balet Kelopak.',
    silhouette: 'full_set',
    fabric: 'Full Ensemble'
  },
  {
    id: 'set_moonlight_dreamer',
    category: 'fairy_outfits',
    name: 'Set Rembulan & Galaksi Peri (Moonlight)',
    season: 'moonlight_fairy',
    colorHex: '#c084fc',
    previewIcon: '🌙',
    tags: ['Evening Set'],
    description: 'Setelan lengkap Gaun Malam Berbintang dengan Sayap Perak dan Tiara Kristal Konstelasi.',
    silhouette: 'full_set',
    fabric: 'Full Ensemble'
  }
];

export const ACCESSORY_ITEMS = [
  // WINGS
  {
    id: 'wings_gossamer_gold',
    category: 'wings',
    name: 'Sayap Gossamer Emas Gemerlap',
    colorHex: '#fef08a',
    previewIcon: '🧚‍♀️',
    description: 'Sayap transparan dengan venasi emas memancar hangat seperti sinar mentari pagi.'
  },
  {
    id: 'wings_peach_butterfly',
    category: 'wings',
    name: 'Sayap Kupu-kupu Kelopak Peach',
    colorHex: '#f472b6',
    previewIcon: '🦋',
    description: 'Sayap berbentuk sayap kupu-kupu besar bergradasi pink peach dan tepi keemasan.'
  },
  {
    id: 'wings_moonlight_silver',
    category: 'wings',
    name: 'Sayap Sutra Rembulan Perak',
    colorHex: '#c084fc',
    previewIcon: '🌙',
    description: 'Sayap anggun tipis berstruktur kristal perak yang memancarkan aura biru-lavender.'
  },
  {
    id: 'wings_crystal_prism',
    category: 'wings',
    name: 'Sayap Prisma Kristal Embun',
    colorHex: '#38bdf8',
    previewIcon: '✨',
    description: 'Membiaskan spektrum pelangi pelan saat terkena sinar matahari di langit TO YOU.'
  },

  // HAIR ACCESSORIES & FLOWER CROWNS
  {
    id: 'hair_buttercup_ribbon',
    category: 'hair',
    name: 'Pita Sutra Mentari Pagi',
    colorHex: '#fef08a',
    previewIcon: '🎀',
    description: 'Pita sutra kuning pastel yang diikatkan manis pada kuncir rambut Lala.'
  },
  {
    id: 'hair_butterfly_pins',
    category: 'hair',
    name: 'Jepit Kupu-kupu Kembar Emas',
    colorHex: '#f472b6',
    previewIcon: '🦋',
    description: 'Dua jepit rambut mungil yang sayapnya bergetar pelan seperti kupu-kupu sungguhan.'
  },
  {
    id: 'crown_cherry_blossom',
    category: 'crowns',
    name: 'Mahkota Bunga Sakura & Kuncup Mawar',
    colorHex: '#fbcfe8',
    previewIcon: '👑',
    description: 'Rangkaian kelopak sakura segar yang dipetik dari taman Bloom Cottage.'
  },
  {
    id: 'crown_golden_buttercup',
    category: 'crowns',
    name: 'Tiara Ranting Emas & Buttercup',
    colorHex: '#fde047',
    previewIcon: '🌼',
    description: 'Tiara emas tipis berbentuk ranting melingkar dengan taburan bunga buttercup cerah.'
  },

  // JEWELRY (EARRINGS & NECKLACES)
  {
    id: 'earrings_pearl_dew',
    category: 'earrings',
    name: 'Anting Tetesan Embun Mutiara',
    colorHex: '#ffffff',
    previewIcon: '💎',
    description: 'Mutiara alami yang berkilau lembut menyerupai tetes embun fajar di atas daun.'
  },
  {
    id: 'earrings_golden_star',
    category: 'earrings',
    name: 'Anting Bintang Empat Sudut Emas',
    colorHex: '#f59e0b',
    previewIcon: '⭐',
    description: 'Gantungan anting bintang emas yang berdentang pelan saat Lala bergerak riang.'
  },
  {
    id: 'necklace_fairy_pendant',
    category: 'necklaces',
    name: 'Liontin Kuarsa Mawar Bunga Merona',
    colorHex: '#f472b6',
    previewIcon: '📿',
    description: 'Batu kuarsa mawar berbentuk hati mungil yang memancarkan getaran kasih sayang.'
  },
  {
    id: 'necklace_starlight_choker',
    category: 'necklaces',
    name: 'Choker Renda Pita Rembulan',
    colorHex: '#c084fc',
    previewIcon: '✨',
    description: 'Choker pita beludru lavender dengan hiasan bintang perak di tengah.'
  },

  // BAGS & MAGICAL
  {
    id: 'bag_petal_pouch',
    category: 'bags',
    name: 'Tas Serut Kelopak Bunga Pastel',
    colorHex: '#f472b6',
    previewIcon: '👜',
    description: 'Tas serut sutra mungil untuk menyimpan buku catatan ide dan pensil desain.'
  },
  {
    id: 'bag_woven_basket',
    category: 'bags',
    name: 'Keranjang Anyaman Bunga Segar',
    colorHex: '#fed7aa',
    previewIcon: '🧺',
    description: 'Keranjang anyaman rotan peri berhias pita peach untuk mengumpulkan bunga inspirasi.'
  },
  {
    id: 'item_starlight_prism',
    category: 'magical',
    name: 'Prisma Cahaya Bintang Ajaib',
    colorHex: '#38bdf8',
    previewIcon: '🪄',
    description: 'Prisma kristal yang dapat memproyeksikan kilau warna pelangi ke atas sketsa busana.'
  },
  {
    id: 'item_fairy_dust_vial',
    category: 'magical',
    name: 'Botol Serbuk Peri Kemilau Pagi',
    colorHex: '#fef08a',
    previewIcon: '✨',
    description: 'Serbuk peri bercahaya emas yang memberi sentuhan sihir pada pakaian yang dikenakan.'
  }
];

export const CROQUIS_TEMPLATES = [
  {
    id: 'croquis_fairy_standard',
    name: 'Standard Fairy Croquis',
    desc: 'Proporsi tubuh peri 9-kepala yang anggun dengan posisi berdiri elegan',
    previewIcon: '🧍‍♀️'
  },
  {
    id: 'croquis_ballgown_flare',
    name: 'Ballgown Flare Silhouette',
    desc: 'Panduan garis luar siluet gaun mekar mengembang ala putri dongeng',
    previewIcon: '👗'
  },
  {
    id: 'croquis_ethereal_wings',
    name: 'Winged Fairy Pose',
    desc: 'Panduan gambar pose peri dengan garis kontur sayap terbentang luas',
    previewIcon: '🧚‍♀️'
  },
  {
    id: 'croquis_none',
    name: 'Blank Canvas (Freeform)',
    desc: 'Kanvas kosong bersih tanpa garis panduan untuk kebebasan berkreasi',
    previewIcon: '⬜'
  }
];
