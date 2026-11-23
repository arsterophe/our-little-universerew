/**
 * PINWHEEL — PHOTOGRAPHY: THE MOMENT ARCHIVE CONTROLLER
 * SYMA'S UNIVERSE · PINWHEEL
 * =============================================================================
 * Subtitle: "Every little moment deserves to be remembered."
 * Interactive Photo Studio & Camera Mode for Syma
 */

import {
  savePhoto,
  loadAllPhotos,
  deletePhoto,
  toggleFavoritePhoto,
  SYMA_CANONICAL_UID
} from './pinwheel_studio_storage.js';

export function initPinwheelPhotographyView(options = {}) {
  const {
    onShowToast,
    onNavigateBack,
    onSwitchToVisionStudio
  } = options;

  const viewEl = document.getElementById('view-pinwheel-photography');
  if (!viewEl) return null;

  let currentUid = SYMA_CANONICAL_UID;
  let activeTab = 'camera'; // 'camera' | 'album'
  let activeAlbumCategory = 'All Photos'; // 'All Photos' | 'Favorites' | 'Special Moments'

  // Photo Mode State
  let selectedOrientation = 'portrait'; // 'portrait' (3:4) | 'landscape' (16:9)
  let selectedSceneryId = 'garden';
  let selectedPoseId = 'portrait';
  let selectedFrameId = 'sakura';
  let selectedFilterId = 'soft_lavender';
  let cameraZoom = 1.0;
  let charPosX = 50; // percentage
  let charPosY = 50; // percentage
  let shutterTimerSec = 0; // 0, 3, 5, 10
  let isTimerRunning = false;

  // Pending captured photo for preview dialog
  let pendingPhotoData = null;

  // Cached photos list
  let photosList = [];

  // Sceneries Catalog (strictly adhering to project assets)
  const SCENERIES = [
    {
      id: 'garden',
      name: 'Pinwheel Garden',
      icon: '🎐',
      available: true,
      assetUrl: '/assets/pinwheel_world_bg.jpg',
      desc: 'Taman bunga lavender dan kincir angin semesta PINWHEEL'
    },
    {
      id: 'gazebo',
      name: 'Moonlit Blossom Gazebo',
      icon: '🌸',
      available: true,
      assetUrl: '/assets/pinwheel_gazebo_bg.jpg',
      desc: 'Paviliun kayu Jepang di bawah naungan bunga sakura dan bulan purnama'
    },
    {
      id: 'windmill',
      name: 'Windmill Hill',
      icon: '🏔️',
      available: true,
      assetUrl: '/assets/island_pinwheel_floating.jpg',
      desc: 'Puncak bukit kincir angin di atas pulau melayang'
    },
    {
      id: 'pond',
      name: 'The Whispering Pond',
      icon: '🎣',
      available: false,
      assetUrl: '',
      desc: 'Kolam magis di tepi hutan lavender (Belum Tersedia)'
    },
    {
      id: 'catgarden',
      name: 'Cat Garden',
      icon: '🐱',
      available: false,
      assetUrl: '',
      desc: 'Taman bermain para kucing ajaib Syma (Belum Tersedia)'
    },
    {
      id: 'sanctuary',
      name: 'Kitsune Sanctuary',
      icon: '🦊',
      available: false,
      assetUrl: '',
      desc: 'Kuil suci siluman rubah di puncak kabut (Belum Tersedia)'
    }
  ];

  // Poses Catalog using Syma's genuine assets
  const POSES = [
    {
      id: 'portrait',
      name: 'Syma Serene Portrait',
      icon: '✨',
      assetUrl: '/assets/portrait_abil_hd.jpg',
      desc: 'Pose anggun menawan dengan tatapan hangat'
    },
    {
      id: 'card',
      name: 'Mystic Kitsune',
      icon: '🦊',
      assetUrl: '/assets/card_abil_hd.jpg',
      desc: 'Pose mistis siluman rubah dengan pesona semesta'
    },
    {
      id: 'avatar',
      name: 'Peaceful Close-up',
      icon: '🌸',
      assetUrl: '/assets/avatar_abil_hd.jpg',
      desc: 'Potret wajah lembut tersenyum manis'
    }
  ];

  // Frames Catalog
  const FRAMES = [
    { id: 'sakura', name: 'Sakura Frame', icon: '🌸', border: '#f472b6', desc: 'Kelopak sakura lembut bercahaya' },
    { id: 'lavender', name: 'Lavender Frame', icon: '🪻', border: '#c084fc', desc: 'Bingkai ungu lavender royal' },
    { id: 'moonlight', name: 'Moonlight Frame', icon: '🌙', border: '#e2e8f0', desc: 'Lingkaran perak pendar rembulan' },
    { id: 'kitsune', name: 'Kitsune Frame', icon: '🦊', border: '#f59e0b', desc: 'Ornamen emas mistis Jepang' },
    { id: 'pinwheel', name: 'Pinwheel Frame', icon: '🎐', border: '#38bdf8', desc: 'Kincir angin origami perak' },
    { id: 'polaroid', name: 'Polaroid Frame', icon: '📷', border: '#ffffff', desc: 'Gaya foto instan retro klasik' }
  ];

  // Filters Catalog
  const FILTERS = [
    { id: 'soft_lavender', name: 'Soft Lavender', icon: '💜', css: 'sepia(0.15) hue-rotate(240deg) saturate(1.2) contrast(1.05)' },
    { id: 'moonlight_glow', name: 'Moonlight Glow', icon: '🌙', css: 'brightness(1.1) contrast(1.1) hue-rotate(190deg) saturate(1.1)' },
    { id: 'sakura_pink', name: 'Sakura Pink', icon: '🌸', css: 'saturate(1.3) hue-rotate(330deg) brightness(1.08)' },
    { id: 'vintage_dream', name: 'Vintage Dream', icon: '🎞️', css: 'sepia(0.4) contrast(0.95) brightness(1.05)' },
    { id: 'silver_twilight', name: 'Silver Twilight', icon: '✨', css: 'grayscale(0.6) contrast(1.2) brightness(0.95) hue-rotate(220deg)' },
    { id: 'normal', name: 'Natural Pure', icon: '🌿', css: 'none' }
  ];

  // DOM Elements
  const headerBackBtn = document.getElementById('btn-pinwheel-photo-back');
  const btnSwitchAtelier = document.getElementById('btn-photo-switch-atelier');
  const tabBtnCamera = document.getElementById('tab-photo-camera');
  const tabBtnAlbum = document.getElementById('tab-photo-album');
  const panelCamera = document.getElementById('panel-photo-camera');
  const panelAlbum = document.getElementById('panel-photo-album');

  // Camera elements
  const viewfinderStage = document.getElementById('photo-viewfinder-stage');
  const bgSceneryImg = document.getElementById('photo-bg-scenery');
  const unavailableSceneryBanner = document.getElementById('photo-scenery-unavailable-badge');
  const charSpriteImg = document.getElementById('photo-char-sprite');
  const viewfinderFrameOverlay = document.getElementById('photo-viewfinder-frame');
  const timerCountdownOverlay = document.getElementById('photo-timer-countdown');
  const btnCapture = document.getElementById('btn-photo-capture');

  // Controls
  const sceneriesListEl = document.getElementById('photo-sceneries-list');
  const posesListEl = document.getElementById('photo-poses-list');
  const framesListEl = document.getElementById('photo-frames-list');
  const filtersListEl = document.getElementById('photo-filters-list');
  const zoomSlider = document.getElementById('slider-photo-zoom');
  const zoomValText = document.getElementById('text-photo-zoom-val');
  const timerSelect = document.getElementById('select-photo-timer');
  const orientationPills = document.querySelectorAll('.photo-orientation-pill');

  // Preview Modal Elements
  const previewModal = document.getElementById('photo-preview-modal');
  const previewImg = document.getElementById('photo-preview-img');
  const previewTitleInput = document.getElementById('photo-preview-title');
  const previewCaptionInput = document.getElementById('photo-preview-caption');
  const previewCategorySelect = document.getElementById('photo-preview-category');
  const btnPreviewSave = document.getElementById('btn-photo-preview-save');
  const btnPreviewDownload = document.getElementById('btn-photo-preview-download');
  const btnPreviewClose = document.getElementById('btn-photo-preview-close');

  // Album Elements
  const albumGrid = document.getElementById('photo-album-grid');
  const albumEmptyState = document.getElementById('photo-album-empty');
  const albumCatTabs = document.querySelectorAll('.photo-album-tab');

  // Lightbox Modal Elements
  const lightboxModal = document.getElementById('photo-lightbox-modal');
  const lightboxImg = document.getElementById('photo-lightbox-img');
  const lightboxTitle = document.getElementById('photo-lightbox-title');
  const lightboxDate = document.getElementById('photo-lightbox-date');
  const lightboxCaption = document.getElementById('photo-lightbox-caption');
  const btnLightboxFav = document.getElementById('btn-photo-lightbox-fav');
  const btnLightboxDownload = document.getElementById('btn-photo-lightbox-download');
  const btnLightboxDelete = document.getElementById('btn-photo-lightbox-delete');
  const btnLightboxClose = document.getElementById('btn-photo-lightbox-close');
  let activeLightboxPhoto = null;

  // ---------------------------------------------------------------------------
  // INITIALIZATION & RENDER
  // ---------------------------------------------------------------------------

  function renderSceneries() {
    if (!sceneriesListEl) return;
    sceneriesListEl.innerHTML = SCENERIES.map((sc) => `
      <div class="photo-option-card ${sc.id === selectedSceneryId ? 'active' : ''} ${!sc.available ? 'disabled' : ''}"
        data-scenery-id="${sc.id}" tabindex="${sc.available ? '0' : '-1'}" title="${sc.desc}">
        <span class="photo-opt-icon">${sc.icon}</span>
        <div class="photo-opt-info">
          <div class="photo-opt-name">${sc.name}</div>
          <div class="photo-opt-status ${sc.available ? 'status-ok' : 'status-locked'}">
            ${sc.available ? 'Tersedia' : '🔒 Belum Tersedia'}
          </div>
        </div>
      </div>
    `).join('');

    sceneriesListEl.querySelectorAll('.photo-option-card:not(.disabled)').forEach((card) => {
      card.addEventListener('click', () => {
        selectedSceneryId = card.getAttribute('data-scenery-id');
        updateViewfinder();
        renderSceneries();
      });
    });
  }

  function renderPoses() {
    if (!posesListEl) return;
    posesListEl.innerHTML = POSES.map((pose) => `
      <div class="photo-option-card ${pose.id === selectedPoseId ? 'active' : ''}"
        data-pose-id="${pose.id}" tabindex="0" title="${pose.desc}">
        <img src="${pose.assetUrl}" alt="${pose.name}" class="photo-pose-thumb" />
        <div class="photo-opt-info">
          <div class="photo-opt-name">${pose.name}</div>
          <div class="photo-opt-desc">${pose.desc}</div>
        </div>
      </div>
    `).join('');

    posesListEl.querySelectorAll('.photo-option-card').forEach((card) => {
      card.addEventListener('click', () => {
        selectedPoseId = card.getAttribute('data-pose-id');
        updateViewfinder();
        renderPoses();
      });
    });
  }

  function renderFrames() {
    if (!framesListEl) return;
    framesListEl.innerHTML = FRAMES.map((fr) => `
      <button type="button" class="photo-frame-chip ${fr.id === selectedFrameId ? 'active' : ''}"
        data-frame-id="${fr.id}" title="${fr.desc}">
        <span>${fr.icon}</span>
        <span>${fr.name}</span>
      </button>
    `).join('');

    framesListEl.querySelectorAll('.photo-frame-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedFrameId = btn.getAttribute('data-frame-id');
        updateViewfinder();
        renderFrames();
      });
    });
  }

  function renderFilters() {
    if (!filtersListEl) return;
    filtersListEl.innerHTML = FILTERS.map((fl) => `
      <button type="button" class="photo-filter-chip ${fl.id === selectedFilterId ? 'active' : ''}"
        data-filter-id="${fl.id}">
        <span>${fl.icon}</span>
        <span>${fl.name}</span>
      </button>
    `).join('');

    filtersListEl.querySelectorAll('.photo-filter-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedFilterId = btn.getAttribute('data-filter-id');
        updateViewfinder();
        renderFilters();
      });
    });
  }

  function updateViewfinder() {
    if (!viewfinderStage) return;

    // 1. Aspect ratio orientation
    viewfinderStage.classList.toggle('portrait', selectedOrientation === 'portrait');
    viewfinderStage.classList.toggle('landscape', selectedOrientation === 'landscape');

    // 2. Scenery
    const activeScenery = SCENERIES.find((s) => s.id === selectedSceneryId) || SCENERIES[0];
    if (activeScenery && activeScenery.available) {
      if (bgSceneryImg) {
        bgSceneryImg.src = activeScenery.assetUrl;
        bgSceneryImg.style.display = 'block';
      }
      if (unavailableSceneryBanner) unavailableSceneryBanner.style.display = 'none';
      if (btnCapture) btnCapture.disabled = false;
    } else {
      if (bgSceneryImg) bgSceneryImg.style.display = 'none';
      if (unavailableSceneryBanner) {
        unavailableSceneryBanner.style.display = 'flex';
        unavailableSceneryBanner.innerHTML = `
          <span>🔒</span>
          <h4>Latar Belum Tersedia</h4>
          <p>${activeScenery ? activeScenery.name : 'Lokasi'} belum terbuka dalam semesta saat ini.</p>
        `;
      }
      if (btnCapture) btnCapture.disabled = true;
    }

    // 3. Pose
    const activePose = POSES.find((p) => p.id === selectedPoseId) || POSES[0];
    if (charSpriteImg && activePose) {
      charSpriteImg.src = activePose.assetUrl;
      charSpriteImg.style.transform = `translate(-50%, -50%) scale(${cameraZoom})`;
      charSpriteImg.style.left = `${charPosX}%`;
      charSpriteImg.style.top = `${charPosY}%`;
    }

    // 4. Filter
    const activeFilter = FILTERS.find((f) => f.id === selectedFilterId) || FILTERS[0];
    if (viewfinderStage) {
      viewfinderStage.style.filter = activeFilter ? activeFilter.css : 'none';
    }

    // 5. Frame Overlay
    if (viewfinderFrameOverlay) {
      viewfinderFrameOverlay.className = `photo-viewfinder-frame frame-${selectedFrameId}`;
    }
  }

  // ---------------------------------------------------------------------------
  // CAPTURE ENGINE (CANVAS COMPOSITOR)
  // ---------------------------------------------------------------------------

  async function capturePhoto() {
    if (isTimerRunning) return;

    if (shutterTimerSec > 0) {
      isTimerRunning = true;
      if (timerCountdownOverlay) {
        timerCountdownOverlay.style.display = 'flex';
      }

      for (let sec = shutterTimerSec; sec > 0; sec--) {
        if (timerCountdownOverlay) {
          timerCountdownOverlay.textContent = String(sec);
          timerCountdownOverlay.classList.remove('pulse');
          void timerCountdownOverlay.offsetWidth;
          timerCountdownOverlay.classList.add('pulse');
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (timerCountdownOverlay) {
        timerCountdownOverlay.style.display = 'none';
      }
      isTimerRunning = false;
    }

    // Shutter flash effect
    const flashEl = document.createElement('div');
    flashEl.className = 'photo-shutter-flash';
    viewfinderStage.appendChild(flashEl);
    setTimeout(() => flashEl.remove(), 600);

    // Audio click feedback via procedural Web Audio
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      }
    } catch (_) {}

    // Synthesize the real image onto an offscreen canvas
    const canvas = document.createElement('canvas');
    const isPortrait = selectedOrientation === 'portrait';
    canvas.width = isPortrait ? 900 : 1200;
    canvas.height = isPortrait ? 1200 : 675;
    const ctx = canvas.getContext('2d');

    const activeScenery = SCENERIES.find((s) => s.id === selectedSceneryId) || SCENERIES[0];
    const activePose = POSES.find((p) => p.id === selectedPoseId) || POSES[0];

    // Helper to load image
    const loadImg = (url) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });

    // 1. Draw Background
    if (activeScenery && activeScenery.available) {
      const bgImg = await loadImg(activeScenery.assetUrl);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Draw Character Sprite
    if (activePose) {
      const charImg = await loadImg(activePose.assetUrl);
      if (charImg) {
        ctx.save();
        const targetW = canvas.width * 0.52 * cameraZoom;
        const targetH = (targetW / charImg.width) * charImg.height;
        const cx = (canvas.width * (charPosX / 100));
        const cy = (canvas.height * (charPosY / 100));

        // Soft drop shadow
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 12;

        ctx.drawImage(charImg, cx - targetW / 2, cy - targetH / 2, targetW, targetH);
        ctx.restore();
      }
    }

    // 3. Apply Filter
    const activeFilter = FILTERS.find((f) => f.id === selectedFilterId);
    if (activeFilter && activeFilter.id !== 'normal') {
      ctx.save();
      if (activeFilter.id === 'soft_lavender') {
        ctx.fillStyle = 'rgba(192, 132, 252, 0.16)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (activeFilter.id === 'moonlight_glow') {
        ctx.fillStyle = 'rgba(147, 197, 253, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (activeFilter.id === 'sakura_pink') {
        ctx.fillStyle = 'rgba(244, 114, 182, 0.16)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (activeFilter.id === 'vintage_dream') {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (activeFilter.id === 'silver_twilight') {
        ctx.fillStyle = 'rgba(226, 232, 240, 0.14)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    }

    // 4. Draw Selected Frame
    drawFrameOnCanvas(ctx, canvas.width, canvas.height, selectedFrameId);

    // 5. Watermark & Date
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    ctx.fillText(`PINWHEEL · ${dateStr}`, canvas.width - 24, canvas.height - 24);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');

    pendingPhotoData = {
      title: `Momen di ${activeScenery.name}`,
      caption: `Foto Syma yang diabadikan di ${activeScenery.name} dengan nuansa ${activeFilter ? activeFilter.name : 'Lavender'}.`,
      category: 'Special Moments',
      sceneryId: selectedSceneryId,
      sceneryName: activeScenery.name,
      poseId: selectedPoseId,
      poseName: activePose.name,
      frameId: selectedFrameId,
      frameName: FRAMES.find((f) => f.id === selectedFrameId)?.name || 'Sakura Frame',
      filterId: selectedFilterId,
      filterName: activeFilter ? activeFilter.name : 'Soft Lavender',
      orientation: selectedOrientation,
      imageDataUrl: dataUrl
    };

    openPreviewModal();
  }

  function drawFrameOnCanvas(ctx, w, h, frameId) {
    ctx.save();
    const borderW = 22;

    if (frameId === 'sakura') {
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = borderW;
      ctx.strokeRect(borderW / 2, borderW / 2, w - borderW, h - borderW);
      // Sakura petal decorations
      ctx.fillStyle = '#fbcfe8';
      ctx.font = '28px serif';
      ctx.fillText('🌸', 24, 46);
      ctx.fillText('🌸', w - 54, 46);
      ctx.fillText('🌸', 24, h - 24);
      ctx.fillText('🌸', w - 54, h - 24);

    } else if (frameId === 'lavender') {
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = borderW;
      ctx.strokeRect(borderW / 2, borderW / 2, w - borderW, h - borderW);
      ctx.fillStyle = '#e9d5ff';
      ctx.font = '28px serif';
      ctx.fillText('🪻', 24, 46);
      ctx.fillText('🪻', w - 54, 46);
      ctx.fillText('🪻', 24, h - 24);
      ctx.fillText('🪻', w - 54, h - 24);

    } else if (frameId === 'moonlight') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = borderW;
      ctx.strokeRect(borderW / 2, borderW / 2, w - borderW, h - borderW);
      ctx.fillStyle = '#fef08a';
      ctx.font = '28px serif';
      ctx.fillText('🌙', 24, 46);
      ctx.fillText('✨', w - 54, 46);
      ctx.fillText('✨', 24, h - 24);
      ctx.fillText('🌙', w - 54, h - 24);

    } else if (frameId === 'kitsune') {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = borderW;
      ctx.strokeRect(borderW / 2, borderW / 2, w - borderW, h - borderW);
      ctx.fillStyle = '#fef3c7';
      ctx.font = '26px serif';
      ctx.fillText('🦊', 24, 46);
      ctx.fillText('⛩️', w - 54, 46);
      ctx.fillText('🏮', 24, h - 24);
      ctx.fillText('🦊', w - 54, h - 24);

    } else if (frameId === 'pinwheel') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = borderW;
      ctx.strokeRect(borderW / 2, borderW / 2, w - borderW, h - borderW);
      ctx.fillStyle = '#bae6fd';
      ctx.font = '26px serif';
      ctx.fillText('🎐', 24, 46);
      ctx.fillText('🎐', w - 54, 46);
      ctx.fillText('🎐', 24, h - 24);
      ctx.fillText('🎐', w - 54, h - 24);

    } else if (frameId === 'polaroid') {
      ctx.fillStyle = '#ffffff';
      const pTop = 26;
      const pSide = 26;
      const pBottom = 90;
      // White polaroid border
      ctx.fillRect(0, 0, w, pTop);
      ctx.fillRect(0, 0, pSide, h);
      ctx.fillRect(w - pSide, 0, pSide, h);
      ctx.fillRect(0, h - pBottom, w, pBottom);

      ctx.fillStyle = '#334155';
      ctx.font = 'italic bold 20px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Our Little Memories ✦ Syma', w / 2, h - 36);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // PREVIEW MODAL
  // ---------------------------------------------------------------------------

  function openPreviewModal() {
    if (!pendingPhotoData || !previewModal) return;
    previewImg.src = pendingPhotoData.imageDataUrl;
    previewTitleInput.value = pendingPhotoData.title;
    previewCaptionInput.value = pendingPhotoData.caption;
    previewCategorySelect.value = pendingPhotoData.category;

    previewModal.classList.add('active');
    previewModal.setAttribute('aria-hidden', 'false');
  }

  function closePreviewModal() {
    if (!previewModal) return;
    previewModal.classList.remove('active');
    previewModal.setAttribute('aria-hidden', 'true');
    pendingPhotoData = null;
  }

  async function savePendingPhoto() {
    if (!pendingPhotoData) return;
    pendingPhotoData.title = previewTitleInput.value.trim() || 'Momen Tanpa Judul';
    pendingPhotoData.caption = previewCaptionInput.value.trim();
    pendingPhotoData.category = previewCategorySelect.value;

    await savePhoto(pendingPhotoData, currentUid);
    closePreviewModal();
    if (onShowToast) onShowToast('📸 Foto kenangan berhasil disimpan ke Photo Album!', 'success');
    await loadAlbum();
  }

  function downloadPendingPhoto() {
    if (!pendingPhotoData) return;
    const a = document.createElement('a');
    a.href = pendingPhotoData.imageDataUrl;
    a.download = `Syma_PINWHEEL_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // ---------------------------------------------------------------------------
  // PHOTO ALBUM & GALLERY
  // ---------------------------------------------------------------------------

  async function loadAlbum() {
    photosList = await loadAllPhotos(currentUid);
    renderAlbum();
  }

  function renderAlbum() {
    if (!albumGrid) return;

    let filtered = photosList;
    if (activeAlbumCategory === 'Favorites') {
      filtered = photosList.filter((p) => p.isFavorite);
    } else if (activeAlbumCategory === 'Special Moments') {
      filtered = photosList.filter((p) => p.category === 'Special Moments');
    }

    if (filtered.length === 0) {
      albumGrid.innerHTML = '';
      if (albumEmptyState) albumEmptyState.style.display = 'flex';
      return;
    }

    if (albumEmptyState) albumEmptyState.style.display = 'none';

    albumGrid.innerHTML = filtered.map((p) => {
      const dateStr = new Date(p.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const imgUrl = p.imageDataUrl || p.thumbDataUrl || '/assets/card_abil_hd.jpg';

      return `
        <div class="photo-album-card ${p.isFavorite ? 'favorite' : ''}" data-photo-id="${p.id}" tabindex="0">
          <div class="photo-album-thumb-wrap">
            <img src="${imgUrl}" alt="${p.title}" class="photo-album-thumb" loading="lazy" />
            <button type="button" class="btn-album-fav-chip ${p.isFavorite ? 'active' : ''}" data-fav-id="${p.id}" title="Favorit">
              ${p.isFavorite ? '⭐' : '☆'}
            </button>
            <span class="photo-album-scenery-pill">${p.sceneryName || 'PINWHEEL'}</span>
          </div>
          <div class="photo-album-card-body">
            <h4 class="photo-album-card-title">${p.title || 'Momen Tanpa Judul'}</h4>
            <div class="photo-album-card-meta">
              <span>📅 ${dateStr}</span>
              <span>${p.frameName || 'Sakura'}</span>
            </div>
            ${p.caption ? `<p class="photo-album-card-caption">${p.caption}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Click cards to open lightbox
    albumGrid.querySelectorAll('.photo-album-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-album-fav-chip')) return;
        const id = card.getAttribute('data-photo-id');
        const photo = photosList.find((p) => p.id === id);
        if (photo) openLightbox(photo);
      });
    });

    // Favorite button quick toggle
    albumGrid.querySelectorAll('.btn-album-fav-chip').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-fav-id');
        const isFav = await toggleFavoritePhoto(id, currentUid);
        if (onShowToast) onShowToast(isFav ? '⭐ Ditambahkan ke Favorit!' : 'Dihapus dari Favorit.');
        await loadAlbum();
      });
    });
  }

  // ---------------------------------------------------------------------------
  // LIGHTBOX MODAL
  // ---------------------------------------------------------------------------

  function openLightbox(photo) {
    if (!lightboxModal) return;
    activeLightboxPhoto = photo;
    lightboxImg.src = photo.imageDataUrl || photo.thumbDataUrl;
    lightboxTitle.textContent = photo.title || 'Momen Tanpa Judul';
    lightboxDate.textContent = `📅 ${new Date(photo.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    lightboxCaption.textContent = photo.caption || 'Tanpa keterangan.';
    if (btnLightboxFav) {
      btnLightboxFav.innerHTML = photo.isFavorite ? '⭐ Hapus Favorit' : '☆ Jadikan Favorit';
    }

    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    activeLightboxPhoto = null;
  }

  // ---------------------------------------------------------------------------
  // NAVIGATION & TABS
  // ---------------------------------------------------------------------------

  function switchTab(tab) {
    activeTab = tab;
    if (tabBtnCamera) tabBtnCamera.classList.toggle('active', tab === 'camera');
    if (tabBtnAlbum) tabBtnAlbum.classList.toggle('active', tab === 'album');
    if (panelCamera) panelCamera.classList.toggle('active', tab === 'camera');
    if (panelAlbum) panelAlbum.classList.toggle('active', tab === 'album');

    if (tab === 'camera') {
      updateViewfinder();
    } else if (tab === 'album') {
      loadAlbum();
    }
  }

  // ---------------------------------------------------------------------------
  // EVENT BINDINGS
  // ---------------------------------------------------------------------------

  function bindEvents() {
    // Header back
    headerBackBtn?.addEventListener('click', () => {
      closePhotography();
      if (onNavigateBack) onNavigateBack();
    });

    // Switch to Vision Studio
    btnSwitchAtelier?.addEventListener('click', () => {
      closePhotography();
      if (onSwitchToVisionStudio) onSwitchToVisionStudio();
    });

    // Tabs
    tabBtnCamera?.addEventListener('click', () => switchTab('camera'));
    tabBtnAlbum?.addEventListener('click', () => switchTab('album'));

    // Orientation pills
    orientationPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        orientationPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        selectedOrientation = pill.getAttribute('data-orientation') || 'portrait';
        updateViewfinder();
      });
    });

    // Zoom Slider
    zoomSlider?.addEventListener('input', (e) => {
      cameraZoom = parseFloat(e.target.value);
      if (zoomValText) zoomValText.textContent = `${cameraZoom.toFixed(1)}x`;
      updateViewfinder();
    });

    // Timer Select
    timerSelect?.addEventListener('change', (e) => {
      shutterTimerSec = parseInt(e.target.value, 10) || 0;
    });

    // Drag / Touch positioning for character sprite
    if (viewfinderStage) {
      let isDragging = false;

      const handleMove = (clientX, clientY) => {
        const rect = viewfinderStage.getBoundingClientRect();
        const px = ((clientX - rect.left) / rect.width) * 100;
        const py = ((clientY - rect.top) / rect.height) * 100;
        charPosX = Math.max(15, Math.min(85, px));
        charPosY = Math.max(20, Math.min(80, py));
        if (charSpriteImg) {
          charSpriteImg.style.left = `${charPosX}%`;
          charSpriteImg.style.top = `${charPosY}%`;
        }
      };

      viewfinderStage.addEventListener('mousedown', (e) => {
        if (e.target.closest('#btn-photo-capture')) return;
        isDragging = true;
        handleMove(e.clientX, e.clientY);
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) handleMove(e.clientX, e.clientY);
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      // Touch support
      viewfinderStage.addEventListener('touchstart', (e) => {
        if (e.target.closest('#btn-photo-capture')) return;
        if (e.touches.length > 0) {
          isDragging = true;
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      viewfinderStage.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length > 0) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      viewfinderStage.addEventListener('touchend', () => {
        isDragging = false;
      });
    }

    // Capture button
    btnCapture?.addEventListener('click', capturePhoto);

    // Preview modal actions
    btnPreviewSave?.addEventListener('click', savePendingPhoto);
    btnPreviewDownload?.addEventListener('click', downloadPendingPhoto);
    btnPreviewClose?.addEventListener('click', closePreviewModal);

    // Album category filter tabs
    albumCatTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        albumCatTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        activeAlbumCategory = tab.getAttribute('data-album-cat') || 'All Photos';
        renderAlbum();
      });
    });

    // Lightbox actions
    btnLightboxClose?.addEventListener('click', closeLightbox);
    lightboxModal?.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    btnLightboxDownload?.addEventListener('click', () => {
      if (!activeLightboxPhoto) return;
      const a = document.createElement('a');
      a.href = activeLightboxPhoto.imageDataUrl || activeLightboxPhoto.thumbDataUrl;
      a.download = `${(activeLightboxPhoto.title || 'Syma_Photo').replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    btnLightboxFav?.addEventListener('click', async () => {
      if (!activeLightboxPhoto) return;
      const isFav = await toggleFavoritePhoto(activeLightboxPhoto.id, currentUid);
      activeLightboxPhoto.isFavorite = isFav;
      btnLightboxFav.innerHTML = isFav ? '⭐ Hapus Favorit' : '☆ Jadikan Favorit';
      if (onShowToast) onShowToast(isFav ? '⭐ Ditambahkan ke Favorit!' : 'Dihapus dari Favorit.');
      await loadAlbum();
    });

    btnLightboxDelete?.addEventListener('click', async () => {
      if (!activeLightboxPhoto) return;
      if (confirm(`Apakah kamu yakin ingin menghapus foto "${activeLightboxPhoto.title}"?`)) {
        await deletePhoto(activeLightboxPhoto.id, currentUid);
        closeLightbox();
        if (onShowToast) onShowToast('Foto berhasil dihapus.');
        await loadAlbum();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------

  function openPhotography(uid = SYMA_CANONICAL_UID, initialTab = 'camera') {
    currentUid = uid || SYMA_CANONICAL_UID;
    viewEl.classList.add('active');
    viewEl.setAttribute('aria-hidden', 'false');

    renderSceneries();
    renderPoses();
    renderFrames();
    renderFilters();
    switchTab(initialTab);
    updateViewfinder();
    loadAlbum();
  }

  function closePhotography() {
    viewEl.classList.remove('active');
    viewEl.setAttribute('aria-hidden', 'true');
    closePreviewModal();
    closeLightbox();
  }

  bindEvents();

  return {
    openPhotography,
    closePhotography,
    switchTab,
    capturePhoto,
    loadAlbum
  };
}

