/**
 * OUR LITTLE UNIVERSE — MOONLIT HYDRANGEA GARDEN CONTROLLER (SHADOW / LELE)
 * 
 * Implements:
 * 1. Little Gardener: Hydrangea and snowdrop plant care (water, clean leaves, help bloom)
 *    with time-based growth persistence.
 * 2. Flower of Feelings: Flower encyclopedia with SHADOW lore meanings & mood selector.
 * 3. Create Your Bouquet: Flower arranging mini-game, live preview, naming, and saving
 *    directly to Lele's Personal Gallery via `moments.js` and `universe_states`.
 * 4. Moonlight Pond: Relaxing moonlit waterside immersion with ambient nature sounds.
 * 5. Procedural Web Audio music & SFX (no autoplay).
 */

import { auth } from './firebase.js';
import { getCurrentUniverseState, updateElementState, onUniverseStateChange } from './universe_state.js';
import { addMoment, getMomentsFeed } from './moments.js';

// --- Flower Definitions with Official SHADOW Lore ---
export const GARDEN_FLOWERS = {
  blue: {
    id: 'blue',
    name: 'Hydrangea Biru',
    fullName: 'Hydrangea Biru Ketenangan',
    color: '#60a5fa',
    accentColor: '#3b82f6',
    icon: '🌸',
    meaning: 'Ketenangan',
    description: 'Bunga hortensia biru yang menyerap pendar keheningan malam dan embun kristal.',
    quote: 'Ketika pikiranmu riuh, biarkan pendar biru ini membawamu kembali ke keheningan yang teduh.'
  },
  purple: {
    id: 'purple',
    name: 'Hydrangea Ungu',
    fullName: 'Hydrangea Ungu Imajinasi',
    color: '#c084fc',
    accentColor: '#a855f7',
    icon: '🌺',
    meaning: 'Imajinasi',
    description: 'Hortensia ungu bergradasi misterius yang mekar di sudut observatorium langit.',
    quote: 'Di balik gelapnya langit malam, selalu ada mimpi-mimpi baru yang menunggu untuk dirajut.'
  },
  pink: {
    id: 'pink',
    name: 'Hydrangea Pink',
    fullName: 'Hydrangea Pink Kehangatan',
    color: '#f472b6',
    accentColor: '#ec4899',
    icon: '🌸',
    meaning: 'Kehangatan',
    description: 'Hortensia pastel merah muda yang memancarkan pendar hangat di tengah udara malam.',
    quote: 'Bahkan malam yang paling dingin pun selalu punya sudut hangat untuk mengingat orang-orang terkasih.'
  },
  white: {
    id: 'white',
    name: 'Hydrangea Putih',
    fullName: 'Hydrangea Putih Ketulusan',
    color: '#f8fafc',
    accentColor: '#cbd5e1',
    icon: '🤍',
    meaning: 'Ketulusan',
    description: 'Hortensia putih suci yang berkilau lembut layaknya lapisan salju dan cahaya rembulan.',
    quote: 'Ketulusan tidak perlu berteriak; ia mekar dalam hening dan tetap bersinar terang.'
  },
  snowdrop: {
    id: 'snowdrop',
    name: 'Snowdrop Kristal',
    fullName: 'Snowdrop Harapan Baru',
    color: '#e0f2fe',
    accentColor: '#38bdf8',
    icon: '❄️',
    meaning: 'Harapan Baru',
    description: 'Kuncup bunga lonceng salju yang tangguh menembus dingin malam dengan keanggunan abadi.',
    quote: 'Meski harus menembus dinginnya malam, harapan akan selalu menemukan jalannya untuk mekar.'
  }
};

export const RIBBON_OPTIONS = {
  lavender: { id: 'lavender', name: 'Pita Sutra Lavender', color: '#c084fc', icon: '🎀' },
  silver: { id: 'silver', name: 'Pita Perak Bulan', color: '#e2e8f0', icon: '🎗️' },
  gold: { id: 'gold', name: 'Pita Emas Senja', color: '#fbbf24', icon: '🎗️' },
  leaves: { id: 'leaves', name: 'Untaian Dedaunan Embun', color: '#4ade80', icon: '🌿' }
};

// Initial default plants in Lele's garden
const DEFAULT_PLANTS = [
  {
    id: 'h1',
    flowerKey: 'blue',
    name: 'Hydrangea Biru Ketenangan',
    stage: 'mekar_sempurna', // 'kuncup' | 'bertunas' | 'setengah_mekar' | 'mekar_sempurna'
    health: 98,
    waterLevel: 85,
    cleanliness: 90,
    growthPoints: 120,
    lastWatered: Date.now() - 3600000,
    lastCleaned: Date.now() - 7200000,
    lastBloomed: Date.now()
  },
  {
    id: 'h2',
    flowerKey: 'purple',
    name: 'Hydrangea Ungu Imajinasi',
    stage: 'setengah_mekar',
    health: 90,
    waterLevel: 75,
    cleanliness: 82,
    growthPoints: 85,
    lastWatered: Date.now() - 7200000,
    lastCleaned: Date.now() - 10800000,
    lastBloomed: null
  },
  {
    id: 'h3',
    flowerKey: 'pink',
    name: 'Hydrangea Pink Kehangatan',
    stage: 'bertunas',
    health: 80,
    waterLevel: 65,
    cleanliness: 70,
    growthPoints: 45,
    lastWatered: Date.now() - 14400000,
    lastCleaned: Date.now() - 18000000,
    lastBloomed: null
  },
  {
    id: 'h4',
    flowerKey: 'white',
    name: 'Hydrangea Putih Ketulusan',
    stage: 'mekar_sempurna',
    health: 95,
    waterLevel: 80,
    cleanliness: 92,
    growthPoints: 110,
    lastWatered: Date.now() - 5400000,
    lastCleaned: Date.now() - 9000000,
    lastBloomed: Date.now()
  },
  {
    id: 'h5',
    flowerKey: 'snowdrop',
    name: 'Snowdrop Harapan Baru',
    stage: 'mekar_sempurna',
    health: 100,
    waterLevel: 90,
    cleanliness: 95,
    growthPoints: 130,
    lastWatered: Date.now() - 1800000,
    lastCleaned: Date.now() - 3600000,
    lastBloomed: Date.now()
  }
];

// Relaxing night pond thoughts from Lele
const POND_MEDITATION_THOUGHTS = [
  'Air kolam yang tenang memantulkan bulan tanpa gelombang. Begitu pula hati ketika melepaskan semua keresahan.',
  'Dengarkan suara air yang mengalir pelan... Di sini, waktu berjalan begitu lembut untukmu.',
  'Kelopak bunga yang terapung tidak pernah tergesa-gesa; ia tahu aliran akan membawanya ke tempat yang indah.',
  'Cahaya bulan malam ini begitu teduh. Bernapaslah dalam-dalam, dan rasakan ketenangan meresap ke dalam jiwamu.',
  'Sahabat-sahabat kita di seberang semesta mungkin juga sedang menatap langit malam yang sama.'
];

// --- Internal State ---
let audioCtx = null;
let isMusicPlaying = false;
let musicGainNode = null;
let musicTimer = null;
let isPondAmbientPlaying = false;
let pondGainNode = null;
let pondTimer = null;

let currentSelectedPlantId = 'h1';
let currentSelectedFeelingKey = 'blue';
let bouquetSelectedFlowers = ['blue', 'purple'];
let bouquetSelectedRibbon = 'lavender';
let currentGardenState = {
  plants: DEFAULT_PLANTS,
  moodFlower: null,
  moodHistory: [],
  bouquets: []
};

let navigationCallbacks = {
  onReturnToUniverse: null,
  onShowToast: null,
  onTriggerSparkle: null
};

/**
 * Initializes Web Audio Context safely on user interaction.
 */
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

/**
 * Procedural Night Garden Melody (Celesta / Harp Arpeggios in Pentatonic Scale)
 */
function startProceduralGardenMelody() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (musicGainNode) {
    musicGainNode.disconnect();
  }

  musicGainNode = ctx.createGain();
  const volumeSlider = document.getElementById('garden-music-volume');
  const initialVol = volumeSlider ? parseFloat(volumeSlider.value) : 0.45;
  musicGainNode.gain.setValueAtTime(initialVol * 0.18, ctx.currentTime);
  musicGainNode.connect(ctx.destination);

  // Pentatonic notes for peaceful night garden (D4, E4, F#4, A4, B4, D5, E5, F#5)
  const notes = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 659.25, 739.99];
  let noteIndex = 0;

  function playNextArpeggio() {
    if (!isMusicPlaying) return;
    try {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      // Pick soothing sequence
      const freq = notes[noteIndex % notes.length];
      noteIndex = (noteIndex + (Math.random() > 0.4 ? 1 : 2)) % notes.length;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc.connect(noteGain);
      noteGain.connect(musicGainNode);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.9);
    } catch (_) {}

    const nextDelay = 800 + Math.random() * 600;
    musicTimer = setTimeout(playNextArpeggio, nextDelay);
  }

  playNextArpeggio();
}

function stopProceduralGardenMelody() {
  if (musicTimer) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
  if (musicGainNode && audioCtx) {
    try {
      musicGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    } catch (_) {}
  }
}

/**
 * Procedural Sound Effects for Garden Care
 */
function playGardenSFX(type) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'water') {
      // Gentle water trickle sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.38);
    } else if (type === 'clean') {
      // Sparkle chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.42);
    } else if (type === 'bloom') {
      // Celestial harmonic bloom chord
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.85);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.9);
    }
  } catch (_) {}
}

/**
 * Procedural Moonlight Pond Ambient Soundscape (Water Ripples & Night Wind)
 */
function startPondAmbientSoundscape() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (pondGainNode) {
    pondGainNode.disconnect();
  }

  pondGainNode = ctx.createGain();
  pondGainNode.gain.setValueAtTime(0.08, ctx.currentTime);
  pondGainNode.connect(ctx.destination);

  // Soft pink noise simulation for water stream
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    output[i] = (b0 + b1 + b2) * 0.1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, ctx.currentTime);

  whiteNoise.connect(filter);
  filter.connect(pondGainNode);
  whiteNoise.start();

  isPondAmbientPlaying = true;
}

function stopPondAmbientSoundscape() {
  if (pondGainNode && audioCtx) {
    try {
      pondGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    } catch (_) {}
  }
  isPondAmbientPlaying = false;
}

/**
 * Loads and reconciles garden state from universe_states
 */
function loadGardenStateFromUniverse() {
  const univState = getCurrentUniverseState();
  if (univState && univState.elements) {
    // Check elements.greenhouse or elements.gazebo.garden
    const savedGreenhouse = univState.elements.greenhouse;
    if (savedGreenhouse && typeof savedGreenhouse === 'object') {
      if (Array.isArray(savedGreenhouse.plants) && savedGreenhouse.plants.length > 0) {
        currentGardenState.plants = savedGreenhouse.plants;
      }
      if (savedGreenhouse.moodFlower) {
        currentGardenState.moodFlower = savedGreenhouse.moodFlower;
      }
      if (Array.isArray(savedGreenhouse.moodHistory)) {
        currentGardenState.moodHistory = savedGreenhouse.moodHistory;
      }
      if (Array.isArray(savedGreenhouse.bouquets)) {
        currentGardenState.bouquets = savedGreenhouse.bouquets;
      }
    }
  }

  // Calculate realistic natural decay based on elapsed time (no instant bloom, but flowers thirst over time)
  applyNaturalTimeProgression();
}

/**
 * Natural time-based decay of water & leaf cleanliness.
 */
function applyNaturalTimeProgression() {
  const now = Date.now();
  currentGardenState.plants = currentGardenState.plants.map(plant => {
    const hoursSinceWater = (now - (plant.lastWatered || now)) / 3600000;
    const hoursSinceClean = (now - (plant.lastCleaned || now)) / 3600000;

    // Slowly decrease water & cleanliness over hours
    const currentWater = Math.max(15, Math.round((plant.waterLevel || 80) - (hoursSinceWater * 3.5)));
    const currentClean = Math.max(20, Math.round((plant.cleanliness || 80) - (hoursSinceClean * 2.2)));
    const currentHealth = Math.min(100, Math.round((currentWater * 0.5) + (currentClean * 0.5)));

    return {
      ...plant,
      waterLevel: currentWater,
      cleanliness: currentClean,
      health: currentHealth
    };
  });
}

/**
 * Persists garden state to universe_states under `elements.greenhouse`.
 */
function saveGardenStateToUniverse() {
  updateElementState('greenhouse', {
    plants: currentGardenState.plants,
    moodFlower: currentGardenState.moodFlower,
    moodHistory: currentGardenState.moodHistory,
    bouquets: currentGardenState.bouquets,
    lastTended: Date.now()
  });
}

// --- RENDERING FUNCTIONS ---

/**
 * Updates status bar on garden main view
 */
function renderGardenStatusBar() {
  const countBlooming = currentGardenState.plants.filter(p => p.stage === 'mekar_sempurna').length;
  const elBloomingVal = document.getElementById('garden-status-blooming-val');
  if (elBloomingVal) {
    elBloomingVal.textContent = `${countBlooming} / ${currentGardenState.plants.length} Bunga`;
  }

  const elMoodVal = document.getElementById('garden-status-mood-val');
  if (elMoodVal) {
    if (currentGardenState.moodFlower) {
      elMoodVal.textContent = `${currentGardenState.moodFlower.name} (${currentGardenState.moodFlower.meaning})`;
    } else {
      elMoodVal.textContent = 'Belum Dipilih';
    }
  }
}

/**
 * Renders Little Gardener modal contents
 */
function renderGardenerModal() {
  const listContainer = document.getElementById('gardener-plants-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  currentGardenState.plants.forEach(plant => {
    const flowerDef = GARDEN_FLOWERS[plant.flowerKey] || GARDEN_FLOWERS.blue;
    const isSelected = plant.id === currentSelectedPlantId;

    let stageLabel = 'Kuncup ✦';
    if (plant.stage === 'bertunas') stageLabel = 'Bertunas Segar 🌱';
    else if (plant.stage === 'setengah_mekar') stageLabel = 'Setengah Mekar 🌸';
    else if (plant.stage === 'mekar_sempurna') stageLabel = 'Mekar Sempurna ✨';

    const item = document.createElement('div');
    item.className = `gardener-plant-item ${isSelected ? 'selected' : ''}`;
    item.innerHTML = `
      <div class="gardener-plant-icon" style="color: ${flowerDef.color}">
        ${flowerDef.icon}
      </div>
      <div class="gardener-plant-details">
        <div class="gardener-plant-name">${plant.name}</div>
        <div class="gardener-plant-stage">${stageLabel} · Kesehatan: ${plant.health}%</div>
      </div>
    `;

    item.addEventListener('click', () => {
      currentSelectedPlantId = plant.id;
      renderGardenerModal();
    });

    listContainer.appendChild(item);
  });

  // Render selected plant active stage
  const selectedPlant = currentGardenState.plants.find(p => p.id === currentSelectedPlantId) || currentGardenState.plants[0];
  const flowerDef = GARDEN_FLOWERS[selectedPlant.flowerKey] || GARDEN_FLOWERS.blue;

  const visualFlower = document.getElementById('gardener-visual-flower');
  if (visualFlower) {
    visualFlower.textContent = flowerDef.icon;
    visualFlower.style.color = flowerDef.color;
    visualFlower.style.filter = `drop-shadow(0 0 28px ${flowerDef.accentColor})`;
  }

  const titleEl = document.getElementById('gardener-active-title');
  if (titleEl) titleEl.textContent = selectedPlant.name;

  const descEl = document.getElementById('gardener-active-desc');
  if (descEl) descEl.textContent = flowerDef.description;

  // Metrics
  const waterFill = document.getElementById('gardener-water-fill');
  const waterVal = document.getElementById('gardener-water-val');
  if (waterFill && waterVal) {
    waterFill.style.width = `${selectedPlant.waterLevel}%`;
    waterFill.style.background = 'linear-gradient(90deg, #60a5fa, #38bdf8)';
    waterVal.textContent = `${selectedPlant.waterLevel}%`;
  }

  const cleanFill = document.getElementById('gardener-clean-fill');
  const cleanVal = document.getElementById('gardener-clean-val');
  if (cleanFill && cleanVal) {
    cleanFill.style.width = `${selectedPlant.cleanliness}%`;
    cleanFill.style.background = 'linear-gradient(90deg, #c084fc, #a855f7)';
    cleanVal.textContent = `${selectedPlant.cleanliness}%`;
  }

  const healthFill = document.getElementById('gardener-health-fill');
  const healthVal = document.getElementById('gardener-health-val');
  if (healthFill && healthVal) {
    healthFill.style.width = `${selectedPlant.health}%`;
    healthFill.style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
    healthVal.textContent = `${selectedPlant.health}%`;
  }

  // Buttons state
  const btnBloom = document.getElementById('btn-gardener-bloom');
  if (btnBloom) {
    const canBloom = selectedPlant.stage !== 'mekar_sempurna' && selectedPlant.growthPoints >= 70;
    btnBloom.disabled = !canBloom;
    btnBloom.title = canBloom ? 'Bantu kelopak bermekaran dengan energi rembulan' : 'Siram dan bersihkan daun terlebih dahulu agar bunga cukup kuat mekar';
  }
}

/**
 * Care Action: Water Plant
 */
function handleWaterPlant() {
  const plantIndex = currentGardenState.plants.findIndex(p => p.id === currentSelectedPlantId);
  if (plantIndex === -1) return;

  const plant = { ...currentGardenState.plants[plantIndex] };
  plant.waterLevel = Math.min(100, plant.waterLevel + 25);
  plant.cleanliness = Math.min(100, plant.cleanliness + 8);
  plant.growthPoints = (plant.growthPoints || 0) + 15;
  plant.health = Math.min(100, Math.round((plant.waterLevel * 0.5) + (plant.cleanliness * 0.5)));
  plant.lastWatered = Date.now();

  currentGardenState.plants[plantIndex] = plant;
  saveGardenStateToUniverse();
  renderGardenerModal();
  renderGardenStatusBar();

  playGardenSFX('water');
  if (navigationCallbacks.onShowToast) {
    navigationCallbacks.onShowToast(`💧 Menyiram ${plant.name} dengan embun kristal segar!`);
  }
}

/**
 * Care Action: Clean Leaves
 */
function handleCleanLeaves() {
  const plantIndex = currentGardenState.plants.findIndex(p => p.id === currentSelectedPlantId);
  if (plantIndex === -1) return;

  const plant = { ...currentGardenState.plants[plantIndex] };
  plant.cleanliness = Math.min(100, plant.cleanliness + 30);
  plant.growthPoints = (plant.growthPoints || 0) + 12;
  plant.health = Math.min(100, Math.round((plant.waterLevel * 0.5) + (plant.cleanliness * 0.5)));
  plant.lastCleaned = Date.now();

  currentGardenState.plants[plantIndex] = plant;
  saveGardenStateToUniverse();
  renderGardenerModal();
  renderGardenStatusBar();

  playGardenSFX('clean');
  if (navigationCallbacks.onShowToast) {
    navigationCallbacks.onShowToast(`✨ Membersihkan dedaunan ${plant.name}. Pendar cahayanya semakin berkilau!`);
  }
}

/**
 * Care Action: Help Bloom
 */
function handleHelpBloom() {
  const plantIndex = currentGardenState.plants.findIndex(p => p.id === currentSelectedPlantId);
  if (plantIndex === -1) return;

  const plant = { ...currentGardenState.plants[plantIndex] };
  if (plant.stage === 'kuncup') plant.stage = 'bertunas';
  else if (plant.stage === 'bertunas') plant.stage = 'setengah_mekar';
  else if (plant.stage === 'setengah_mekar') plant.stage = 'mekar_sempurna';

  plant.health = 100;
  plant.lastBloomed = Date.now();

  currentGardenState.plants[plantIndex] = plant;
  saveGardenStateToUniverse();
  renderGardenerModal();
  renderGardenStatusBar();

  playGardenSFX('bloom');
  if (navigationCallbacks.onShowToast) {
    navigationCallbacks.onShowToast(`🌸 Cahaya rembulan membantu ${plant.name} mekar dengan sempurna!`);
  }
}

/**
 * Renders Flower of Feelings encyclopedia modal
 */
function renderFeelingsModal() {
  const grid = document.getElementById('feelings-grid');
  if (!grid) return;

  grid.innerHTML = '';

  Object.values(GARDEN_FLOWERS).forEach(flower => {
    const isSelected = flower.id === currentSelectedFeelingKey;
    const card = document.createElement('div');
    card.className = `feelings-card ${isSelected ? 'active' : ''}`;
    card.innerHTML = `
      <div class="feelings-card-icon" style="color: ${flower.color}">
        ${flower.icon}
      </div>
      <div class="feelings-card-color-name">${flower.name}</div>
      <div class="feelings-card-meaning">${flower.meaning}</div>
    `;

    card.addEventListener('click', () => {
      currentSelectedFeelingKey = flower.id;
      renderFeelingsModal();
    });

    grid.appendChild(card);
  });

  const activeFlower = GARDEN_FLOWERS[currentSelectedFeelingKey] || GARDEN_FLOWERS.blue;
  const artEl = document.getElementById('feelings-detail-art');
  if (artEl) {
    artEl.textContent = activeFlower.icon;
    artEl.style.color = activeFlower.color;
  }

  const titleEl = document.getElementById('feelings-detail-title');
  if (titleEl) titleEl.textContent = activeFlower.fullName;

  const meaningEl = document.getElementById('feelings-detail-meaning-tag');
  if (meaningEl) meaningEl.textContent = `Makna di SHADOW: ${activeFlower.meaning}`;

  const quoteEl = document.getElementById('feelings-detail-quote');
  if (quoteEl) quoteEl.textContent = `"${activeFlower.quote}" — Lele ☾`;

  const btnPick = document.getElementById('btn-feelings-pick');
  if (btnPick) {
    const isCurrentMood = currentGardenState.moodFlower && currentGardenState.moodFlower.id === activeFlower.id;
    btnPick.textContent = isCurrentMood ? '✓ Bunga Suasana Hatimu Saat Ini' : `Jadikan Bungaku Malam Ini (${activeFlower.meaning}) ✦`;
  }
}

/**
 * Saves selected flower of feelings as user's mood
 */
function handlePickFeelingFlower() {
  const flower = GARDEN_FLOWERS[currentSelectedFeelingKey] || GARDEN_FLOWERS.blue;
  const noteInput = document.getElementById('feelings-personal-note');
  const personalNote = noteInput ? noteInput.value.trim() : '';

  const moodEntry = {
    id: flower.id,
    name: flower.name,
    meaning: flower.meaning,
    color: flower.color,
    note: personalNote || flower.quote,
    pickedAt: Date.now()
  };

  currentGardenState.moodFlower = moodEntry;
  if (!Array.isArray(currentGardenState.moodHistory)) {
    currentGardenState.moodHistory = [];
  }
  currentGardenState.moodHistory.unshift(moodEntry);

  saveGardenStateToUniverse();
  renderFeelingsModal();
  renderGardenStatusBar();

  if (navigationCallbacks.onShowToast) {
    navigationCallbacks.onShowToast(`🌸 "${flower.name}" dipilih sebagai cerminan suasana hatimu (${flower.meaning}) ☾`);
  }
}

/**
 * Renders Bouquet preview on HTML5 Canvas
 */
function updateBouquetCanvas() {
  const canvas = document.getElementById('bouquet-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas with transparent or subtle dark background
  ctx.clearRect(0, 0, width, height);

  // Background radial glow
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width / 2);
  bgGrad.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
  bgGrad.addColorStop(1, 'rgba(15, 12, 32, 0.6)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Render Green Leaves & Stems
  ctx.save();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(width / 2, height - 30);
  ctx.quadraticCurveTo(width / 2 - 25, height / 2 + 30, width / 2 - 40, height / 2 - 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width / 2, height - 30);
  ctx.quadraticCurveTo(width / 2 + 25, height / 2 + 30, width / 2 + 40, height / 2 - 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width / 2, height - 30);
  ctx.lineTo(width / 2, height / 2 - 20);
  ctx.stroke();
  ctx.restore();

  // Render Bouquet Flower Petals
  const flowerPositions = [
    { x: width / 2 - 35, y: height / 2 - 15 },
    { x: width / 2 + 35, y: height / 2 - 15 },
    { x: width / 2, y: height / 2 - 45 },
    { x: width / 2, y: height / 2 - 5 }
  ];

  bouquetSelectedFlowers.forEach((flowerKey, idx) => {
    const pos = flowerPositions[idx % flowerPositions.length];
    const flowerDef = GARDEN_FLOWERS[flowerKey] || GARDEN_FLOWERS.blue;

    ctx.save();
    ctx.translate(pos.x, pos.y);

    // Draw cluster of petals for Hydrangea
    const petalCount = 6;
    for (let p = 0; p < petalCount; p++) {
      const angle = (p * 2 * Math.PI) / petalCount;
      const px = Math.cos(angle) * 14;
      const py = Math.sin(angle) * 14;

      ctx.beginPath();
      ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.fillStyle = flowerDef.color;
      ctx.shadowColor = flowerDef.accentColor;
      ctx.shadowBlur = 10;
      ctx.fill();
    }

    // Flower center
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.fill();

    ctx.restore();
  });

  // Render Ribbon
  const ribbonDef = RIBBON_OPTIONS[bouquetSelectedRibbon] || RIBBON_OPTIONS.lavender;
  ctx.save();
  ctx.translate(width / 2, height - 45);

  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = ribbonDef.color;
  ctx.shadowColor = ribbonDef.color;
  ctx.shadowBlur = 12;
  ctx.fill();

  // Ribbon tails
  ctx.beginPath();
  ctx.moveTo(-10, 5);
  ctx.lineTo(-20, 28);
  ctx.lineTo(-12, 28);
  ctx.lineTo(-4, 8);
  ctx.fillStyle = ribbonDef.color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, 5);
  ctx.lineTo(20, 28);
  ctx.lineTo(12, 28);
  ctx.lineTo(4, 8);
  ctx.fillStyle = ribbonDef.color;
  ctx.fill();

  ctx.restore();
}

/**
 * Renders Create Your Bouquet modal
 */
function renderBouquetModal() {
  const flowerSelectors = document.getElementById('bouquet-flower-selectors');
  if (flowerSelectors) {
    flowerSelectors.innerHTML = '';
    Object.values(GARDEN_FLOWERS).forEach(flower => {
      const isChosen = bouquetSelectedFlowers.includes(flower.id);
      const btn = document.createElement('div');
      btn.className = `bouquet-flower-btn ${isChosen ? 'active' : ''}`;
      btn.innerHTML = `
        <span style="font-size: 1.3rem; color: ${flower.color}">${flower.icon}</span>
        <span>${flower.name.split(' ')[1] || flower.name}</span>
      `;

      btn.addEventListener('click', () => {
        if (bouquetSelectedFlowers.includes(flower.id)) {
          if (bouquetSelectedFlowers.length > 1) {
            bouquetSelectedFlowers = bouquetSelectedFlowers.filter(f => f !== flower.id);
          }
        } else {
          if (bouquetSelectedFlowers.length < 4) {
            bouquetSelectedFlowers.push(flower.id);
          } else {
            bouquetSelectedFlowers.shift();
            bouquetSelectedFlowers.push(flower.id);
          }
        }
        renderBouquetModal();
      });

      flowerSelectors.appendChild(btn);
    });
  }

  const ribbonSelectors = document.getElementById('bouquet-ribbon-selectors');
  if (ribbonSelectors) {
    ribbonSelectors.innerHTML = '';
    Object.values(RIBBON_OPTIONS).forEach(ribbon => {
      const isChosen = bouquetSelectedRibbon === ribbon.id;
      const btn = document.createElement('div');
      btn.className = `bouquet-ribbon-btn ${isChosen ? 'active' : ''}`;
      btn.innerHTML = `<span>${ribbon.icon}</span> <span>${ribbon.name}</span>`;

      btn.addEventListener('click', () => {
        bouquetSelectedRibbon = ribbon.id;
        renderBouquetModal();
      });

      ribbonSelectors.appendChild(btn);
    });
  }

  // Update Canvas
  updateBouquetCanvas();

  // Render Bouquet History
  const historyList = document.getElementById('bouquet-history-list');
  if (historyList) {
    historyList.innerHTML = '';
    if (Array.isArray(currentGardenState.bouquets) && currentGardenState.bouquets.length > 0) {
      currentGardenState.bouquets.slice(0, 6).forEach(b => {
        const item = document.createElement('div');
        item.className = 'bouquet-history-item';
        item.innerHTML = `
          <img class="bouquet-history-thumb" src="${b.imageDataUrl}" alt="${b.title}" />
          <div class="bouquet-history-title">${b.title}</div>
          <div class="bouquet-history-date">${b.dateStr}</div>
        `;
        historyList.appendChild(item);
      });
    } else {
      historyList.innerHTML = '<div style="grid-column: 1 / -1; font-size: 0.8rem; color: #a5b4fc; text-align: center; padding: 12px;">Belum ada buket yang dirangkai. Buat buket pertamamu! 💐</div>';
    }
  }
}

/**
 * Saves created Bouquet to Lele's Personal Gallery (via moments.js) and universe_states
 */
async function handleSaveBouquet() {
  const canvas = document.getElementById('bouquet-canvas');
  if (!canvas) return;

  const titleInput = document.getElementById('bouquet-name-input');
  const title = (titleInput ? titleInput.value.trim() : '') || 'Buket Hydrangea Kristal Malam';

  const dedicationInput = document.getElementById('bouquet-dedication-input');
  const dedication = dedicationInput ? dedicationInput.value.trim() : '';

  const imageDataUrl = canvas.toDataURL('image/png');
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const bouquetRecord = {
    id: `bouquet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    dedication,
    flowers: [...bouquetSelectedFlowers],
    ribbon: bouquetSelectedRibbon,
    imageDataUrl,
    dateStr,
    createdAt: Date.now()
  };

  if (!Array.isArray(currentGardenState.bouquets)) {
    currentGardenState.bouquets = [];
  }
  currentGardenState.bouquets.unshift(bouquetRecord);

  // 1. Save to Lele's Personal Gallery via `moments.js`
  try {
    addMoment({
      author: 'lele',
      type: 'feed',
      isStory: false,
      location: 'Moonlit Hydrangea Garden · SHADOW',
      mediaUrl: imageDataUrl,
      mediaType: 'image',
      mimeType: 'image/png',
      caption: `Buket Hydrangea: "${title}" 💐\n${dedication ? 'Dedikasi: ' + dedication + ' ✦ ' : ''}Dirangkai di Moonlit Hydrangea Garden.`
    });
  } catch (err) {
    console.warn('[Garden] addMoment gallery integration note:', err);
  }

  // 2. Save to universe_states
  saveGardenStateToUniverse();

  renderBouquetModal();
  playGardenSFX('bloom');

  if (titleInput) titleInput.value = '';
  if (dedicationInput) dedicationInput.value = '';

  if (navigationCallbacks.onShowToast) {
    navigationCallbacks.onShowToast(`💐 Buket "${title}" berhasil disimpan ke Galeri Lele!`);
  }
}

/**
 * Moonlight Pond Meditative Thought Generator
 */
function handlePondMeditate() {
  const pondView = document.getElementById('view-moonlight-pond');
  if (pondView) {
    pondView.classList.add('is-sitting');
  }

  const reflectionCard = document.getElementById('pond-reflection-card');
  if (reflectionCard) {
    const thought = POND_MEDITATION_THOUGHTS[Math.floor(Math.random() * POND_MEDITATION_THOUGHTS.length)];
    reflectionCard.textContent = `"${thought}" — Lele ☾`;
  }

  const btnMeditate = document.getElementById('btn-pond-meditate');
  if (btnMeditate) {
    btnMeditate.innerHTML = '<span>✦</span> <span>Duduk Tenang di Tepi Kolam Bunga ☾</span>';
  }

  playGardenSFX('water');
  setTimeout(() => playGardenSFX('clean'), 200);

  if (navigationCallbacks.onTriggerSparkle) {
    navigationCallbacks.onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.65);
  }

  if (navigationCallbacks.onShowToast) {
    navigationCallbacks.onShowToast('☾ Duduk tenang di tepi kolam, menikmati semerbak wangi hydrangea dan ketenangan malam...');
  }
}

// --- MODAL MANAGEMENT ---
function openGardenModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeGardenModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Initializes the entire Moonlit Hydrangea Garden view.
 */
export function initShadowGardenView({ onReturnToUniverse, onShowToast, onTriggerSparkle } = {}) {
  navigationCallbacks.onReturnToUniverse = onReturnToUniverse;
  navigationCallbacks.onShowToast = onShowToast;
  navigationCallbacks.onTriggerSparkle = onTriggerSparkle;

  // 1. Top return button
  const btnReturn = document.getElementById('btn-garden-back');
  if (btnReturn) {
    btnReturn.addEventListener('click', () => {
      stopProceduralGardenMelody();
      stopPondAmbientSoundscape();
      const viewGarden = document.getElementById('view-shadow-garden');
      if (viewGarden) {
        viewGarden.classList.remove('active');
        viewGarden.setAttribute('aria-hidden', 'true');
      }
      if (typeof onReturnToUniverse === 'function') {
        onReturnToUniverse();
      }
    });
  }

  // 2. Audio Player Controls (Seruling/Melodi Taman)
  const btnMusicToggle = document.getElementById('btn-garden-music-toggle');
  const musicIcon = document.getElementById('garden-music-icon');
  const volumeSlider = document.getElementById('garden-music-volume');

  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', () => {
      isMusicPlaying = !isMusicPlaying;
      if (musicIcon) {
        musicIcon.textContent = isMusicPlaying ? '⏸' : '▶';
      }
      if (isMusicPlaying) {
        startProceduralGardenMelody();
        if (onShowToast) onShowToast('♫ Memutar Melodi Taman Hydrangea Malam...');
      } else {
        stopProceduralGardenMelody();
        if (onShowToast) onShowToast('⏸ Melodi taman dijeda.');
      }
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      if (musicGainNode && audioCtx) {
        musicGainNode.gain.setValueAtTime(vol * 0.18, audioCtx.currentTime);
      }
    });
  }

  // 3. Four Activity Card Clicks
  const cardGardener = document.getElementById('garden-card-gardener');
  if (cardGardener) {
    cardGardener.addEventListener('click', () => {
      renderGardenerModal();
      openGardenModal('modal-little-gardener');
    });
  }

  const cardFeelings = document.getElementById('garden-card-feelings');
  if (cardFeelings) {
    cardFeelings.addEventListener('click', () => {
      renderFeelingsModal();
      openGardenModal('modal-flower-feelings');
    });
  }

  const cardBouquet = document.getElementById('garden-card-bouquet');
  if (cardBouquet) {
    cardBouquet.addEventListener('click', () => {
      renderBouquetModal();
      openGardenModal('modal-create-bouquet');
    });
  }

  const cardPond = document.getElementById('garden-card-pond');
  if (cardPond) {
    cardPond.addEventListener('click', () => {
      const pondView = document.getElementById('view-moonlight-pond');
      if (pondView) {
        pondView.classList.add('active');
        pondView.setAttribute('aria-hidden', 'false');
        startPondAmbientSoundscape();
        handlePondMeditate();
      }
    });
  }

  // 4. Modal Close Buttons
  const closeButtons = document.querySelectorAll('.btn-garden-modal-close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetModal = btn.closest('.garden-modal-backdrop');
      if (targetModal) {
        targetModal.classList.remove('open');
        targetModal.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // Close modals on clicking backdrop
  const modalBackdrops = document.querySelectorAll('.garden-modal-backdrop');
  modalBackdrops.forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
        backdrop.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // 5. Little Gardener Actions
  const btnWater = document.getElementById('btn-gardener-water');
  if (btnWater) btnWater.addEventListener('click', handleWaterPlant);

  const btnClean = document.getElementById('btn-gardener-clean');
  if (btnClean) btnClean.addEventListener('click', handleCleanLeaves);

  const btnBloom = document.getElementById('btn-gardener-bloom');
  if (btnBloom) btnBloom.addEventListener('click', handleHelpBloom);

  // 6. Flower of Feelings Actions
  const btnPickFeeling = document.getElementById('btn-feelings-pick');
  if (btnPickFeeling) btnPickFeeling.addEventListener('click', handlePickFeelingFlower);

  // 7. Create Your Bouquet Actions
  const btnSaveBouquet = document.getElementById('btn-save-bouquet');
  if (btnSaveBouquet) btnSaveBouquet.addEventListener('click', handleSaveBouquet);

  // 8. Moonlight Pond Controls
  const btnPondBack = document.getElementById('btn-pond-back');
  if (btnPondBack) {
    btnPondBack.addEventListener('click', () => {
      stopPondAmbientSoundscape();
      const pondView = document.getElementById('view-moonlight-pond');
      if (pondView) {
        pondView.classList.remove('is-sitting');
        pondView.classList.remove('active');
        pondView.setAttribute('aria-hidden', 'true');
      }
      const btnMeditate = document.getElementById('btn-pond-meditate');
      if (btnMeditate) {
        btnMeditate.innerHTML = '✦ Duduk Menikmati Suasana Malam';
      }
    });
  }

  const btnPondMeditate = document.getElementById('btn-pond-meditate');
  if (btnPondMeditate) {
    btnPondMeditate.addEventListener('click', handlePondMeditate);
  }

  // 9. Subscribe to Universe State Changes
  onUniverseStateChange(() => {
    loadGardenStateFromUniverse();
    renderGardenStatusBar();
  });

  // Initial Load
  loadGardenStateFromUniverse();
  renderGardenStatusBar();
}

/**
 * Activates and displays the Moonlit Hydrangea Garden view.
 */
export function showShadowGardenView() {
  const viewGarden = document.getElementById('view-shadow-garden');
  if (viewGarden) {
    viewGarden.classList.add('active');
    viewGarden.setAttribute('aria-hidden', 'false');
  }

  loadGardenStateFromUniverse();
  renderGardenStatusBar();

  if (navigationCallbacks.onShowToast) {
    navigationCallbacks.onShowToast('🌸 Selamat datang di Moonlit Hydrangea Garden — Lele\'s Secret Garden ☾');
  }
}

