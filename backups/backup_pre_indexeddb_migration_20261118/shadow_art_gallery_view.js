/**
 * SHADOW — MOONLIT ART GALLERY (LELE'S PERSONAL ART MUSEUM) UI CONTROLLER
 *
 * Implements:
 * - Atmospheric Night Museum Entrance & Dust Motes
 * - Calm Nocturnal Instrumental Web Audio Engine (no autoplay, Play/Pause + Volume)
 * - Room 1: The Exhibition (My Favorite Masterpiece + Curated Collections + Salon Wall)
 * - Room 2: Little Atelier (Upload, Live Preview, Edit, Validation, Safe Delete Confirm)
 * - Room 3: Artwork Status Manager (Published / Draft / In Development, Privacy, Ordering, Notes)
 * - Room 4: Quiet Corner (Moonlit Window Sofa Sanctuary + Quote Reflections + Audio)
 * - Fullscreen Zoom Lightbox (Prev/Next Navigation + Story Behind the Art + Privacy Isolation)
 */

import {
  ARTWORK_STATUSES,
  resolveActiveViewerCharacter,
  validateArtworkImageInput,
  loadArtGalleryStore,
  subscribeGalleryChanges,
  getCollections,
  getExhibitionArtworks,
  getStudioArtworks,
  getArtworkById,
  getFavoriteMasterpiece,
  getArtworkCounts,
  saveArtworkItem,
  updateArtworkStatus,
  moveArtworkToCollection,
  reorderArtwork,
  deleteArtworkItem,
  setFavoriteMasterpiece,
  createCustomCollection,
  renameCollection,
  deleteCustomCollection,
  reorderCollection,
  getGalleryStorageDiagnostics,
  markArtworkImageLoadError
} from './shadow_art_gallery.js';

const QUIET_QUOTES = [
  '“Di sudut tenang museum malam ini, setiap sapuan kuas menyimpan suara hati yang tak perlu terucap.” — Lele ☾',
  '“Cahaya bulan jatuh lembut di atas kanvas; biarkan pikiranmu beristirahat di antara warna dan bayangan.”',
  '“Karya yang belum selesai bukanlah kegagalan, melainkan kisah yang sedang mencari bentuk terbaiknya.”',
  '“Seni adalah cara malam menjaga kenangan tetap hidup selamanya di bawah taburan bintang.”'
];

export function initShadowArtGalleryView({
  onShowToast,
  onTriggerSparkle,
  onNavigateBack
} = {}) {
  const viewGallery = document.getElementById('view-shadow-art-gallery');
  if (!viewGallery) return null;

  // Entrance curtain
  const entranceCurtain = document.getElementById('museum-entrance-curtain');

  // Header & Nav Elements
  const btnBack = document.getElementById('btn-art-gallery-back');
  const roomTabs = document.querySelectorAll('.museum-room-tab');
  const roomPanels = document.querySelectorAll('.museum-room-panel');
  const btnAudioToggle = document.getElementById('btn-museum-audio-toggle');
  const sliderAudioVol = document.getElementById('slider-museum-audio-vol');
  const btnVisitorPreview = document.getElementById('btn-museum-visitor-preview');
  const visitorBanner = document.getElementById('museum-visitor-banner');
  const storageNoticeBanner = document.getElementById('museum-storage-notice');

  // Exhibition Elements
  const masterpieceContainer = document.getElementById('masterpiece-showcase-body');
  const btnChooseMasterpiece = document.getElementById('btn-choose-masterpiece');
  const collectionsPillsWrap = document.getElementById('museum-collections-pills');
  const btnManageCollections = document.getElementById('btn-manage-collections');
  const exhibitionWall = document.getElementById('museum-exhibition-wall');
  const exhibitionEmpty = document.getElementById('museum-exhibition-empty');
  const btnEmptyOpenAtelier = document.getElementById('btn-empty-open-atelier');

  // Atelier Elements
  const atelierHeading = document.getElementById('atelier-form-heading');
  const atelierForm = document.getElementById('atelier-artwork-form');
  const atelierFileInput = document.getElementById('atelier-file-input');
  const atelierDropzone = document.getElementById('atelier-dropzone');
  const atelierDropPrompt = document.getElementById('atelier-drop-prompt');
  const atelierPreviewFrame = document.getElementById('atelier-preview-frame');
  const atelierPreviewImg = document.getElementById('atelier-preview-img');
  const atelierPreviewMeta = document.getElementById('atelier-preview-meta');
  const btnAtelierChangeImg = document.getElementById('btn-atelier-change-img');
  const atelierErrorBanner = document.getElementById('atelier-error-banner');
  const inputTitle = document.getElementById('atelier-input-title');
  const inputDesc = document.getElementById('atelier-input-desc');
  const inputDate = document.getElementById('atelier-input-date');
  const selectCollection = document.getElementById('atelier-select-collection');
  const selectStatus = document.getElementById('atelier-select-status');
  const inputInsp = document.getElementById('atelier-story-inspiration');
  const inputMeaning = document.getElementById('atelier-story-meaning');
  const inputProcess = document.getElementById('atelier-story-process');
  const checkStoryPublic = document.getElementById('atelier-check-story-public');
  const inputPrivateNotes = document.getElementById('atelier-input-private-notes');
  const btnAtelierReset = document.getElementById('btn-atelier-reset');
  const btnAtelierDelete = document.getElementById('btn-atelier-delete');
  const btnAtelierSubmit = document.getElementById('btn-atelier-submit');

  // Manager Elements
  const managerCountsBar = document.getElementById('manager-counts-bar');
  const managerStatusFilters = document.querySelectorAll('.manager-status-filter');
  const managerCollectionSelect = document.getElementById('manager-collection-select');
  const managerArtworkList = document.getElementById('manager-artwork-list');

  // Quiet Corner Elements
  const quietQuoteText = document.getElementById('quiet-corner-quote-text');
  const btnQuietNextQuote = document.getElementById('btn-quiet-next-quote');
  const btnQuietAudio = document.getElementById('btn-quiet-audio-toggle');

  // Lightbox Modal Elements
  const modalLightbox = document.getElementById('modal-art-lightbox');
  const btnLightboxClose = document.getElementById('btn-lightbox-close');
  const btnLightboxPrev = document.getElementById('btn-lightbox-prev');
  const btnLightboxNext = document.getElementById('btn-lightbox-next');
  const lightboxImg = document.getElementById('lightbox-artwork-img');
  const btnLightboxZoom = document.getElementById('btn-lightbox-zoom');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxStoryWrap = document.getElementById('lightbox-story-wrap');
  const lightboxOwnerActions = document.getElementById('lightbox-owner-actions');

  // Other Modals
  const modalMasterpiecePicker = document.getElementById('modal-masterpiece-picker');
  const btnCloseMasterpiecePicker = document.getElementById('btn-close-masterpiece-picker');
  const masterpiecePickerList = document.getElementById('masterpiece-picker-list');

  const modalCollections = document.getElementById('modal-collections-manager');
  const btnCloseCollections = document.getElementById('btn-close-collections');
  const inputNewColIcon = document.getElementById('input-new-col-icon');
  const inputNewColName = document.getElementById('input-new-col-name');
  const btnCreateCollection = document.getElementById('btn-create-collection');
  const collectionsManagerList = document.getElementById('collections-manager-list');

  const modalDeleteConfirm = document.getElementById('modal-art-confirm-delete');
  const deleteConfirmTitle = document.getElementById('delete-confirm-art-title');
  const btnCancelDelete = document.getElementById('btn-cancel-art-delete');
  const btnExecuteDelete = document.getElementById('btn-execute-art-delete');

  // View State
  let activeRoom = 'exhibition';
  let activeCollectionFilter = 'all';
  let activeManagerStatus = 'all';
  let activeManagerCollection = 'all';
  let visitorPreviewMode = false;
  let editingArtworkId = null;
  let pendingDeleteArtworkId = null;

  // Atelier Pending Upload State
  let stagedFile = null;
  let stagedDataUrl = '';
  let stagedMimeType = 'image/jpeg';
  let stagedSizeBytes = 0;
  let stagedAspectRatio = 1;

  // Lightbox Navigation State
  let lightboxArtList = [];
  let lightboxIndex = 0;
  let quietQuoteIndex = 0;

  // Audio Engine State (No Autoplay)
  let audioCtx = null;
  let masterGain = null;
  let musicTimer = null;
  let isMusicPlaying = false;
  let musicVol = 0.55;

  // ==========================================================================
  // 1. CALM NOCTURNAL INSTRUMENTAL AUDIO ENGINE
  // ==========================================================================

  const NOCTURNE_NOTES = [261.63, 311.13, 392.00, 466.16, 523.25, 622.25, 783.99]; // Cm9 dreamy harp/piano

  function getAudioContext() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playGentlePianoNote(freq, delaySec = 0) {
    const ctx = getAudioContext();
    if (!ctx || !masterGain || !isMusicPlaying) return;

    const startTime = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(freq * 2, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, startTime);

    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.11, startTime + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 4.2);

    const harmGain = ctx.createGain();
    harmGain.gain.value = 0.18;

    osc.connect(filter);
    harmonic.connect(harmGain);
    harmGain.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(startTime);
    harmonic.start(startTime);
    osc.stop(startTime + 4.3);
    harmonic.stop(startTime + 4.3);
  }

  function scheduleNocturnePhrase() {
    if (!isMusicPlaying) return;
    const pattern = [0, 2, 4, 3, 5, 4, 2, 1];
    pattern.forEach((noteIdx, step) => {
      const n = NOCTURNE_NOTES[(noteIdx + Math.floor(Math.random() * 2)) % NOCTURNE_NOTES.length];
      playGentlePianoNote(n, step * 0.85);
    });
  }

  function startMuseumMusic() {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
    }
    masterGain.gain.setTargetAtTime(musicVol * 0.65, ctx.currentTime, 0.25);
    isMusicPlaying = true;
    scheduleNocturnePhrase();
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = setInterval(scheduleNocturnePhrase, 7000);
    updateAudioButtonsUI();
  }

  function stopMuseumMusic() {
    isMusicPlaying = false;
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
    if (audioCtx && masterGain) {
      try {
        masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.15);
      } catch (_) {}
    }
    updateAudioButtonsUI();
  }

  function toggleMuseumMusic() {
    if (isMusicPlaying) stopMuseumMusic();
    else startMuseumMusic();
  }

  function updateAudioButtonsUI() {
    if (btnAudioToggle) {
      btnAudioToggle.classList.toggle('playing', isMusicPlaying);
      btnAudioToggle.innerHTML = isMusicPlaying
        ? '<span>⏸️</span><span>Jeda Musik Malam</span>'
        : '<span>🎵</span><span>Putar Musik Museum</span>';
    }
    if (btnQuietAudio) {
      btnQuietAudio.textContent = isMusicPlaying
        ? '⏸️ Jeda Musik Instrumental'
        : '🎵 Putar Musik Malam Lembut';
    }
  }

  // ==========================================================================
  // 2. ACCESS CONTROL & UTILITIES
  // ==========================================================================

  function getViewerState() {
    const viewerChar = resolveActiveViewerCharacter();
    const isRealOwner = viewerChar === 'lele';
    const isEffectiveOwner = isRealOwner && !visitorPreviewMode;
    return { viewerChar, isRealOwner, isEffectiveOwner };
  }

  function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  function formatFriendlyDate(val) {
    if (!val) return '-';
    try {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (_) {
      return String(val);
    }
  }

  function getCollectionInfo(colId) {
    return getCollections().find((c) => c.id === colId) || { id: colId, name: colId || 'Lainnya', icon: '🎨' };
  }

  function renderMissingImagePlaceholderHtml(art) {
    const isCorrupt = art?.imageStatus === 'corrupted';
    const title = isCorrupt ? 'Gambar Tidak Dapat Dimuat' : 'Gambar Tersimpan Lokal';
    const fallbackDesc = art?.imageError || (isCorrupt
      ? 'File gambar di IndexedDB gagal didekode atau rusak.'
      : 'Gambar asli tersimpan di IndexedDB perangkat lain/browser pemilik dan tidak disinkronkan lewat Cloud Storage.');
    return `
      <div class="museum-missing-image-fallback">
        <div class="fallback-icon">${isCorrupt ? '⚠️' : '🖼️'}</div>
        <div class="fallback-title">${escapeHtml(title)}</div>
        <div class="fallback-desc">${escapeHtml(fallbackDesc)}</div>
      </div>
    `;
  }

  function renderArtworkMediaInnerHtml(art, extraImgAttrs = '') {
    if (!art || !art.imageDataUrl || art.imageStatus === 'missing_local' || art.imageStatus === 'corrupted') {
      return renderMissingImagePlaceholderHtml(art);
    }
    return `<img src="${escapeHtml(art.imageDataUrl)}" alt="${escapeHtml(art.title)}" data-artwork-img-id="${escapeHtml(art.id)}" ${extraImgAttrs} />`;
  }

  function bindImageFallbackInContainer(container, art) {
    if (!container || !art) return;
    const imgEl = container.querySelector(`img[data-artwork-img-id="${art.id}"]`) || container.querySelector('img');
    if (!imgEl) return;
    imgEl.addEventListener('error', () => {
      if (imgEl.dataset.fallbackHandled === '1') return;
      imgEl.dataset.fallbackHandled = '1';
      markArtworkImageLoadError(art.id, 'File gambar tidak dapat dibaca atau didekode oleh browser ini.');
      const wrap = imgEl.parentElement;
      if (wrap) {
        wrap.innerHTML = renderMissingImagePlaceholderHtml({
          ...art,
          imageStatus: 'corrupted',
          imageError: 'File gambar tidak dapat dibaca atau didekode oleh browser ini.'
        });
      }
      renderStorageDiagnosticsBanner();
    });
  }

  function renderStorageDiagnosticsBanner() {
    if (!storageNoticeBanner) return;
    const { isRealOwner } = getViewerState();
    const diag = getGalleryStorageDiagnostics();

    storageNoticeBanner.classList.remove('tone-info', 'tone-warning', 'tone-error');

    if (diag.storageStatus === 'quota_exceeded') {
      storageNoticeBanner.style.display = 'flex';
      storageNoticeBanner.classList.add('tone-error');
      storageNoticeBanner.innerHTML = `<span>🚨</span><div><strong>Penyimpanan Browser Penuh:</strong> ${escapeHtml(diag.lastStorageError || 'Kuota penyimpanan IndexedDB penuh. Karya lama tetap aman; kosongkan ruang penyimpanan browser sebelum mengunggah gambar baru.')}</div>`;
      return;
    }

    if (!diag.indexedDbAvailable) {
      storageNoticeBanner.style.display = 'flex';
      storageNoticeBanner.classList.add('tone-error');
      storageNoticeBanner.innerHTML = `<span>⚠️</span><div><strong>IndexedDB Tidak Tersedia:</strong> ${escapeHtml(diag.lastStorageError || 'Browser atau mode privat saat ini memblokir IndexedDB. Gambar karya seni tidak dapat disimpan secara persisten.')}</div>`;
      return;
    }

    const alerts = [];
    if (diag.corruptedCount > 0) {
      alerts.push(`${diag.corruptedCount} gambar tidak dapat dibaca/rusak di penyimpanan lokal.`);
    }
    if (diag.missingLocalCount > 0) {
      alerts.push(isRealOwner
        ? `${diag.missingLocalCount} karya tidak memiliki file gambar lokal di browser ini (kemungkinan diunggah dari perangkat lain).`
        : `${diag.missingLocalCount} karya hanya menampilkan metadata karena gambar aslinya tersimpan di IndexedDB browser perangkat pemilik.`);
    }
    if (isRealOwner && diag.legacyCloudCount > 0) {
      alerts.push(`${diag.legacyCloudCount} metadata karya masih mencatat jalur lama Firebase Storage (audit saja, tidak dihapus otomatis).`);
    }

    if (alerts.length > 0) {
      storageNoticeBanner.style.display = 'flex';
      storageNoticeBanner.classList.add('tone-warning');
      storageNoticeBanner.innerHTML = `<span>📌</span><div><strong>Info Penyimpanan Galeri:</strong> ${escapeHtml(alerts.join(' '))}</div>`;
      return;
    }

    if (activeRoom === 'atelier' || activeRoom === 'manager' || !isRealOwner) {
      storageNoticeBanner.style.display = 'flex';
      storageNoticeBanner.classList.add('tone-info');
      storageNoticeBanner.innerHTML = isRealOwner
        ? `<span>💾</span><div><strong>Penyimpanan Lokal IndexedDB:</strong> File gambar asli disimpan langsung di IndexedDB browser perangkat ini (tetap ada setelah refresh di browser ini, namun tidak otomatis tersinkron ke perangkat lain).</div>`
        : `<span>💾</span><div><strong>Catatan Galeri Lokal:</strong> File gambar museum disimpan langsung di IndexedDB perangkat pemilik, bukan di Cloud Storage; pengunjung di perangkat lain hanya melihat file yang tersedia di browser ini.</div>`;
      return;
    }

    storageNoticeBanner.style.display = 'none';
  }

  // ==========================================================================
  // 3. ROOM NAVIGATION & PERMISSION GUARD
  // ==========================================================================

  function switchRoom(roomId) {
    const { isRealOwner, isEffectiveOwner } = getViewerState();
    const targetRoom = (!isEffectiveOwner && (roomId === 'atelier' || roomId === 'manager'))
      ? 'exhibition'
      : (roomId || 'exhibition');

    activeRoom = targetRoom;
    viewGallery.classList.remove('room-exhibition', 'room-atelier', 'room-manager', 'room-quiet_corner');
    viewGallery.classList.add(`room-${activeRoom}`);

    roomTabs.forEach((tab) => {
      const r = tab.getAttribute('data-museum-room');
      const isOwnerTab = r === 'atelier' || r === 'manager';
      if (isOwnerTab) {
        tab.style.display = isEffectiveOwner ? 'inline-flex' : 'none';
      }
      tab.classList.toggle('active', r === activeRoom);
    });

    roomPanels.forEach((panel) => {
      const r = panel.getAttribute('data-room-panel');
      panel.classList.toggle('active', r === activeRoom);
    });

    if (btnVisitorPreview) {
      btnVisitorPreview.style.display = isRealOwner ? 'inline-flex' : 'none';
      btnVisitorPreview.classList.toggle('previewing', visitorPreviewMode);
      btnVisitorPreview.textContent = visitorPreviewMode
        ? '👁️ Keluar Pratinjau Pengunjung'
        : '👁️ Mode Pengunjung';
    }

    if (visitorBanner) {
      if (visitorPreviewMode && isRealOwner) {
        visitorBanner.style.display = 'block';
        visitorBanner.textContent = '👁️ Mode Pratinjau Pengunjung Aktif — Karya Draft, In Development, dan Catatan Pribadi disembunyikan.';
      } else if (!isRealOwner) {
        visitorBanner.style.display = 'block';
        visitorBanner.textContent = '🌙 Kamu berkunjung ke Moonlit Art Gallery milik Lele — menampilkan karya publik yang telah diterbitkan.';
      } else {
        visitorBanner.style.display = 'none';
      }
    }

    renderCurrentRoom();
  }

  function renderCurrentRoom() {
    renderStorageDiagnosticsBanner();
    renderCollectionsBar();
    if (activeRoom === 'exhibition') {
      renderMasterpieceShowcase();
      renderExhibitionWall();
    } else if (activeRoom === 'atelier') {
      populateCollectionSelects();
    } else if (activeRoom === 'manager') {
      populateCollectionSelects();
      renderArtworkManager();
    } else if (activeRoom === 'quiet_corner') {
      renderQuietCorner();
    }
  }

  // ==========================================================================
  // 4. EXHIBITION RENDERING (MASTERPIECE + COLLECTIONS + WALL)
  // ==========================================================================

  function renderMasterpieceShowcase() {
    if (!masterpieceContainer) return;
    const { viewerChar, isEffectiveOwner } = getViewerState();
    const fav = getFavoriteMasterpiece({ viewerChar, visitorPreview: visitorPreviewMode });

    if (btnChooseMasterpiece) {
      btnChooseMasterpiece.style.display = isEffectiveOwner ? 'inline-flex' : 'none';
    }

    if (!fav) {
      masterpieceContainer.innerHTML = `
        <div class="masterpiece-empty-niche">
          <div style="font-size: 2rem;">🌙 🖼️ ✨</div>
          <p>${isEffectiveOwner
            ? 'Belum ada karya utama publik (My Favorite Masterpiece) yang dipilih. Setelah kamu menerbitkan karya berstatus <strong>Published</strong>, klik <strong>Pilih Karya Utama</strong> untuk menyorotnya di tengah museum.'
            : 'Singgasana Karya Utama malam ini masih menantikan lukisan pilihan Lele.'
          }</p>
        </div>
      `;
      return;
    }

    const col = getCollectionInfo(fav.collectionId);
    masterpieceContainer.innerHTML = `
      <div class="masterpiece-frame-stage">
        <div class="masterpiece-ornate-frame" id="btn-open-masterpiece-lightbox" role="button" tabindex="0"
          aria-label="Lihat detail Karya Utama ${escapeHtml(fav.title)}">
          <div class="masterpiece-matting">
            ${renderArtworkMediaInnerHtml(fav)}
          </div>
        </div>
        <div class="masterpiece-brass-plaque">
          <h3>✦ ${escapeHtml(fav.title)} ✦</h3>
          <p>${escapeHtml(col.icon)} ${escapeHtml(col.name)} · ${escapeHtml(formatFriendlyDate(fav.createdDate))}</p>
          ${fav.description ? `<p style="margin-top:6px;color:#cbd5e1;">${escapeHtml(fav.description)}</p>` : ''}
        </div>
      </div>
    `;

    bindImageFallbackInContainer(masterpieceContainer, fav);
    const frameBtn = document.getElementById('btn-open-masterpiece-lightbox');
    if (frameBtn) {
      frameBtn.addEventListener('click', () => openArtworkLightbox(fav.id));
    }
  }

  function renderCollectionsBar() {
    if (!collectionsPillsWrap) return;
    const { isEffectiveOwner } = getViewerState();
    const cols = getCollections();

    if (btnManageCollections) {
      btnManageCollections.style.display = isEffectiveOwner ? 'inline-flex' : 'none';
    }

    let html = `
      <button type="button" class="collection-pill ${activeCollectionFilter === 'all' ? 'active' : ''}" data-col-filter="all">
        <span>🏛️</span><span>Semua Koleksi</span>
      </button>
    `;
    cols.forEach((col) => {
      html += `
        <button type="button" class="collection-pill ${activeCollectionFilter === col.id ? 'active' : ''}" data-col-filter="${escapeHtml(col.id)}">
          <span>${escapeHtml(col.icon)}</span><span>${escapeHtml(col.name)}</span>
        </button>
      `;
    });
    collectionsPillsWrap.innerHTML = html;

    collectionsPillsWrap.querySelectorAll('.collection-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCollectionFilter = btn.getAttribute('data-col-filter') || 'all';
        renderCollectionsBar();
        renderExhibitionWall();
      });
    });
  }

  function renderExhibitionWall() {
    if (!exhibitionWall || !exhibitionEmpty) return;
    const { viewerChar, isEffectiveOwner } = getViewerState();
    const artworks = getExhibitionArtworks({
      collectionId: activeCollectionFilter,
      viewerChar,
      visitorPreview: visitorPreviewMode
    });

    if (artworks.length === 0) {
      exhibitionWall.innerHTML = '';
      exhibitionWall.style.display = 'none';
      exhibitionEmpty.style.display = 'block';
      if (btnEmptyOpenAtelier) {
        btnEmptyOpenAtelier.style.display = isEffectiveOwner ? 'inline-flex' : 'none';
      }
      const emptyMsgEl = document.getElementById('museum-empty-desc');
      if (emptyMsgEl) {
        if (activeCollectionFilter !== 'all') {
          const colInfo = getCollectionInfo(activeCollectionFilter);
          emptyMsgEl.textContent = isEffectiveOwner
            ? `Belum ada karya berstatus Published pada koleksi "${colInfo.name}". Unggah karya baru atau terbitkan karya yang ada di Little Atelier.`
            : `Koleksi "${colInfo.name}" belum memiliki karya yang dipamerkan.`;
        } else {
          emptyMsgEl.textContent = isEffectiveOwner
            ? 'Dinding pameran masih menanti goresan kuas pertamamu, Lele. Masuk ke Little Atelier untuk mengunggah karya senimu sendiri dan menyusun pameran pribadi di bawah sinar bulan.'
            : 'Museum malam ini sedang menyiapkan pameran perdana dari Lele. Nantikan karya pertamanya yang segera dipajang di bawah sinar bulan.';
        }
      }
      return;
    }

    exhibitionEmpty.style.display = 'none';
    exhibitionWall.style.display = 'block';
    exhibitionWall.innerHTML = '';

    artworks.forEach((art) => {
      const col = getCollectionInfo(art.collectionId);
      const pedestal = document.createElement('article');
      pedestal.className = 'museum-artwork-pedestal';
      pedestal.innerHTML = `
        <div class="artwork-spotlight-beam" aria-hidden="true"></div>
        <div class="museum-picture-frame" role="button" tabindex="0" aria-label="Buka karya ${escapeHtml(art.title)}">
          <div class="museum-frame-inner-mat">
            ${renderArtworkMediaInnerHtml(art, 'loading="lazy"')}
          </div>
        </div>
        <div class="museum-placard">
          <h4 class="museum-placard-title">${escapeHtml(art.title)}</h4>
          <div class="museum-placard-meta">
            <span>${escapeHtml(col.icon)} ${escapeHtml(col.name)}</span>
            <span>·</span>
            <span>${escapeHtml(formatFriendlyDate(art.createdDate))}</span>
          </div>
          ${art.description ? `<p class="museum-placard-desc">${escapeHtml(art.description)}</p>` : ''}
        </div>
      `;

      bindImageFallbackInContainer(pedestal, art);
      const frameEl = pedestal.querySelector('.museum-picture-frame');
      frameEl.addEventListener('click', () => openArtworkLightbox(art.id));
      frameEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openArtworkLightbox(art.id);
        }
      });

      exhibitionWall.appendChild(pedestal);
    });
  }

  // ==========================================================================
  // 5. LITTLE ATELIER (UPLOAD, PREVIEW, EDIT, VALIDATION, SAFE DELETE)
  // ==========================================================================

  function populateCollectionSelects() {
    const cols = getCollections();
    if (selectCollection) {
      const prev = selectCollection.value;
      selectCollection.innerHTML = cols
        .map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.icon)} ${escapeHtml(c.name)}</option>`)
        .join('');
      if (prev && cols.some((c) => c.id === prev)) selectCollection.value = prev;
    }
    if (managerCollectionSelect) {
      const prev = managerCollectionSelect.value || 'all';
      managerCollectionSelect.innerHTML = `<option value="all">Semua Koleksi</option>` +
        cols.map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.icon)} ${escapeHtml(c.name)}</option>`).join('');
      managerCollectionSelect.value = prev;
    }
  }

  function showAtelierError(msg) {
    if (!atelierErrorBanner) return;
    if (msg) {
      atelierErrorBanner.textContent = `⚠️ ${msg}`;
      atelierErrorBanner.style.display = 'block';
    } else {
      atelierErrorBanner.textContent = '';
      atelierErrorBanner.style.display = 'none';
    }
  }

  function handleAtelierImageFile(file) {
    showAtelierError('');
    const validation = validateArtworkImageInput({ file });
    if (!validation.valid) {
      showAtelierError(validation.error);
      if (onShowToast) onShowToast(validation.error);
      if (atelierFileInput) atelierFileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      const msg = 'Gagal membaca file gambar. Pastikan file tidak rusak dan coba lagi.';
      showAtelierError(msg);
      if (onShowToast) onShowToast(msg);
    };
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result !== 'string' || !result.startsWith('data:image/')) {
        showAtelierError('File gagal diproses sebagai gambar.');
        return;
      }

      const probe = new Image();
      probe.onload = () => {
        stagedFile = file;
        stagedDataUrl = result;
        stagedMimeType = validation.mimeType;
        stagedSizeBytes = file.size || 0;
        stagedAspectRatio = (probe.naturalHeight > 0) ? Number((probe.naturalWidth / probe.naturalHeight).toFixed(3)) : 1;

        if (atelierPreviewImg) atelierPreviewImg.src = result;
        if (atelierPreviewMeta) {
          const kb = Math.round(stagedSizeBytes / 1024);
          atelierPreviewMeta.textContent = `Resolusi ${probe.naturalWidth}×${probe.naturalHeight} px · ${(kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB')}`;
        }
        if (atelierDropPrompt) atelierDropPrompt.style.display = 'none';
        if (atelierPreviewFrame) atelierPreviewFrame.classList.add('visible');
      };
      probe.onerror = () => {
        showAtelierError('Gambar tidak dapat dirender. Pilih file JPG, PNG, WebP, atau GIF yang valid.');
      };
      probe.src = result;
    };
    reader.readAsDataURL(file);
  }

  function resetAtelierForm() {
    editingArtworkId = null;
    stagedFile = null;
    stagedDataUrl = '';
    stagedMimeType = 'image/jpeg';
    stagedSizeBytes = 0;
    stagedAspectRatio = 1;

    if (atelierHeading) atelierHeading.textContent = '🎨 Little Atelier — Unggah Karya Baru';
    if (atelierFileInput) atelierFileInput.value = '';
    if (atelierPreviewImg) atelierPreviewImg.src = '';
    if (atelierPreviewMeta) atelierPreviewMeta.textContent = '';
    if (atelierPreviewFrame) atelierPreviewFrame.classList.remove('visible');
    if (atelierDropPrompt) atelierDropPrompt.style.display = 'flex';
    if (inputTitle) inputTitle.value = '';
    if (inputDesc) inputDesc.value = '';
    if (inputDate) inputDate.value = new Date().toISOString().slice(0, 10);
    if (selectStatus) selectStatus.value = 'published';
    if (inputInsp) inputInsp.value = '';
    if (inputMeaning) inputMeaning.value = '';
    if (inputProcess) inputProcess.value = '';
    if (checkStoryPublic) checkStoryPublic.checked = true;
    if (inputPrivateNotes) inputPrivateNotes.value = '';
    if (btnAtelierDelete) btnAtelierDelete.style.display = 'none';
    if (btnAtelierSubmit) btnAtelierSubmit.textContent = '✦ Simpan Karya ke Museum';
    showAtelierError('');
    populateCollectionSelects();
  }

  function loadArtworkIntoAtelier(artworkId) {
    const { isEffectiveOwner } = getViewerState();
    if (!isEffectiveOwner) return;
    const art = getArtworkById(artworkId, { viewerChar: 'lele', visitorPreview: false });
    if (!art) return;

    resetAtelierForm();
    editingArtworkId = art.id;
    stagedAspectRatio = art.aspectRatio || 1;
    if (atelierHeading) atelierHeading.textContent = `✏️ Edit Karya: ${art.title}`;
    if (inputTitle) inputTitle.value = art.title || '';
    if (inputDesc) inputDesc.value = art.description || '';
    if (inputDate) inputDate.value = art.createdDate || '';
    populateCollectionSelects();
    if (selectCollection) selectCollection.value = art.collectionId || 'memories';
    if (selectStatus) selectStatus.value = art.status || 'draft';
    if (inputInsp) inputInsp.value = art.story?.inspiration || '';
    if (inputMeaning) inputMeaning.value = art.story?.meaning || '';
    if (inputProcess) inputProcess.value = art.story?.process || '';
    if (checkStoryPublic) checkStoryPublic.checked = Boolean(art.storyPublic);
    if (inputPrivateNotes) inputPrivateNotes.value = art.privateNotes || '';

    if (art.imageDataUrl && atelierPreviewImg) {
      atelierPreviewImg.src = art.imageDataUrl;
      if (atelierPreviewMeta) atelierPreviewMeta.textContent = 'Gambar karya tersimpan (pilih file baru untuk mengganti)';
      if (atelierDropPrompt) atelierDropPrompt.style.display = 'none';
      if (atelierPreviewFrame) atelierPreviewFrame.classList.add('visible');
    }

    if (btnAtelierDelete) btnAtelierDelete.style.display = 'inline-flex';
    if (btnAtelierSubmit) btnAtelierSubmit.textContent = '✦ Simpan Perubahan Karya';
    switchRoom('atelier');
  }

  // ==========================================================================
  // 6. ARTWORK STATUS MANAGER (OWNER ONLY)
  // ==========================================================================

  function renderArtworkManager() {
    if (!managerArtworkList) return;
    const { viewerChar, isEffectiveOwner } = getViewerState();
    if (!isEffectiveOwner) {
      managerArtworkList.innerHTML = '';
      return;
    }

    const counts = getArtworkCounts(viewerChar);
    if (managerCountsBar) {
      managerCountsBar.innerHTML = `
        <span>✦ Total: <strong>${counts.total}</strong></span>
        <span>🟢 Published: <strong>${counts.published}</strong></span>
        <span>🔒 Draft: <strong>${counts.draft}</strong></span>
        <span>🛠️ In Development: <strong>${counts.in_development}</strong></span>
      `;
    }

    const items = getStudioArtworks({
      statusFilter: activeManagerStatus,
      collectionId: activeManagerCollection,
      viewerChar
    });

    const fav = getFavoriteMasterpiece({ viewerChar, visitorPreview: false });
    const cols = getCollections();

    if (items.length === 0) {
      managerArtworkList.innerHTML = `
        <div class="museum-artistic-empty" style="margin-top:0;">
          <p style="margin-bottom:14px;">Belum ada karya seni pada filter status ini.</p>
          <button type="button" class="btn-museum-primary" id="btn-manager-empty-upload">+ Unggah di Little Atelier</button>
        </div>
      `;
      document.getElementById('btn-manager-empty-upload')?.addEventListener('click', () => {
        resetAtelierForm();
        switchRoom('atelier');
      });
      return;
    }

    managerArtworkList.innerHTML = '';
    items.forEach((art) => {
      const statusMeta = ARTWORK_STATUSES[art.status] || ARTWORK_STATUSES.draft;
      const isFav = fav && fav.id === art.id;
      const row = document.createElement('div');
      row.className = 'manager-artwork-row';

      const colOptions = cols.map((c) =>
        `<option value="${escapeHtml(c.id)}" ${c.id === art.collectionId ? 'selected' : ''}>${escapeHtml(c.icon)} ${escapeHtml(c.name)}</option>`
      ).join('');

      row.innerHTML = `
        <div class="manager-thumb">
          ${renderArtworkMediaInnerHtml(art)}
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
            <strong style="font-size:1rem;color:#f8fafc;">${escapeHtml(art.title)}</strong>
            <span class="status-badge-pill ${escapeHtml(art.status)}">${escapeHtml(statusMeta.badge)}</span>
            ${isFav ? '<span class="status-badge-pill published" style="border-color:#e5b963;color:#fde68a;">⭐ Karya Utama</span>' : ''}
          </div>
          <div style="font-size:0.78rem;color:#94a3b8;margin-bottom:6px;">
            Dibuat: ${escapeHtml(formatFriendlyDate(art.createdDate))} · Diperbarui: ${escapeHtml(formatFriendlyDate(art.updatedAt))}
            ${art.storyPublic ? ' · 📖 Cerita Publik' : ' · 🔐 Cerita Privat'}
          </div>
          ${art.privateNotes ? `<div style="font-size:0.8rem;color:#ddd6fe;background:rgba(139,92,246,0.14);padding:6px 10px;border-radius:8px;border:1px solid rgba(196,181,253,0.22);">📝 Catatan Pribadi: ${escapeHtml(art.privateNotes)}</div>` : ''}
        </div>
        <div class="manager-row-controls">
          <select class="atelier-select" data-role="quick-status" style="width:auto;padding:6px 10px;font-size:0.8rem;" aria-label="Ubah status ${escapeHtml(art.title)}">
            <option value="published" ${art.status === 'published' ? 'selected' : ''}>Published</option>
            <option value="draft" ${art.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="in_development" ${art.status === 'in_development' ? 'selected' : ''}>In Development</option>
          </select>
          <select class="atelier-select" data-role="quick-col" style="width:auto;padding:6px 10px;font-size:0.8rem;" aria-label="Pindah koleksi ${escapeHtml(art.title)}">
            ${colOptions}
          </select>
          <button type="button" class="btn-museum-secondary" data-act="up" title="Naikkan urutan" style="padding:6px 10px;">↑</button>
          <button type="button" class="btn-museum-secondary" data-act="down" title="Turunkan urutan" style="padding:6px 10px;">↓</button>
          <button type="button" class="btn-museum-secondary" data-act="fav" title="Jadikan Karya Utama" style="padding:6px 11px;">${isFav ? '⭐ Utama' : '☆ Utama'}</button>
          <button type="button" class="btn-museum-secondary" data-act="view" style="padding:6px 11px;">👁️ Detail</button>
          <button type="button" class="btn-museum-secondary" data-act="edit" style="padding:6px 11px;">✏️ Edit</button>
          <button type="button" class="btn-museum-danger" data-act="delete" style="padding:6px 11px;">🗑️</button>
        </div>
      `;

      row.querySelector('[data-role="quick-status"]')?.addEventListener('change', async (e) => {
        try {
          await updateArtworkStatus(art.id, e.target.value, viewerChar);
          if (onShowToast) onShowToast(`Status "${art.title}" diperbarui ke ${e.target.value} ✦`);
          renderArtworkManager();
        } catch (err) {
          if (onShowToast) onShowToast(err.message);
        }
      });

      row.querySelector('[data-role="quick-col"]')?.addEventListener('change', async (e) => {
        try {
          await moveArtworkToCollection(art.id, e.target.value, viewerChar);
          if (onShowToast) onShowToast(`"${art.title}" dipindahkan ke koleksi ${getCollectionInfo(e.target.value).name}`);
        } catch (err) {
          if (onShowToast) onShowToast(err.message);
        }
      });

      row.querySelector('[data-act="up"]')?.addEventListener('click', () => reorderArtwork(art.id, 'up', viewerChar).then(renderArtworkManager));
      row.querySelector('[data-act="down"]')?.addEventListener('click', () => reorderArtwork(art.id, 'down', viewerChar).then(renderArtworkManager));
      row.querySelector('[data-act="fav"]')?.addEventListener('click', () => {
        try {
          setFavoriteMasterpiece(isFav ? null : art.id, viewerChar);
          if (onShowToast) onShowToast(isFav ? 'Karya Utama dikosongkan.' : `⭐ "${art.title}" dijadikan My Favorite Masterpiece!`);
          renderArtworkManager();
        } catch (err) {
          if (onShowToast) onShowToast(err.message);
        }
      });
      row.querySelector('[data-act="view"]')?.addEventListener('click', () => openArtworkLightbox(art.id, items));
      row.querySelector('[data-act="edit"]')?.addEventListener('click', () => loadArtworkIntoAtelier(art.id));
      row.querySelector('[data-act="delete"]')?.addEventListener('click', () => promptDeleteConfirm(art));
      bindImageFallbackInContainer(row, art);

      managerArtworkList.appendChild(row);
    });
  }

  // ==========================================================================
  // 7. LIGHTBOX MODAL & STORY BEHIND THE ART
  // ==========================================================================

  function openArtworkLightbox(artworkId, customPool = null) {
    const { viewerChar, isEffectiveOwner } = getViewerState();
    const pool = customPool && Array.isArray(customPool)
      ? customPool
      : getExhibitionArtworks({ collectionId: activeCollectionFilter, viewerChar, visitorPreview: visitorPreviewMode });

    let idx = pool.findIndex((a) => a.id === artworkId);
    if (idx === -1) {
      const single = getArtworkById(artworkId, { viewerChar, visitorPreview: visitorPreviewMode });
      if (!single) {
        if (onShowToast) onShowToast('Karya ini bersifat privat dan tidak dapat dibuka.');
        return;
      }
      lightboxArtList = [single];
      lightboxIndex = 0;
    } else {
      lightboxArtList = pool;
      lightboxIndex = idx;
    }

    renderLightboxContent();
    if (modalLightbox) {
      modalLightbox.classList.add('open');
      modalLightbox.setAttribute('aria-hidden', 'false');
    }
  }

  function renderLightboxContent() {
    const art = lightboxArtList[lightboxIndex];
    if (!art) return;
    const { viewerChar, isEffectiveOwner } = getViewerState();
    const col = getCollectionInfo(art.collectionId);
    const statusInfo = ARTWORK_STATUSES[art.status] || ARTWORK_STATUSES.published;

    if (lightboxImg) {
      lightboxImg.classList.remove('zoomed');
      lightboxImg.dataset.artworkId = art.id;
      const existingFb = lightboxImg.parentElement?.querySelector('.museum-missing-image-fallback');
      if (existingFb) existingFb.remove();

      if (!art.imageDataUrl || art.imageStatus === 'missing_local' || art.imageStatus === 'corrupted') {
        lightboxImg.style.display = 'none';
        lightboxImg.removeAttribute('src');
        if (lightboxImg.parentElement) {
          lightboxImg.parentElement.insertAdjacentHTML('beforeend', renderMissingImagePlaceholderHtml(art));
        }
      } else {
        lightboxImg.style.display = 'block';
        lightboxImg.src = art.imageDataUrl;
        lightboxImg.alt = art.title;
        lightboxImg.onerror = () => {
          if (lightboxImg.dataset.artworkId !== art.id) return;
          markArtworkImageLoadError(art.id, 'Gambar gagal didekode saat membuka pratinjau penuh.');
          lightboxImg.style.display = 'none';
          const prevFb = lightboxImg.parentElement?.querySelector('.museum-missing-image-fallback');
          if (prevFb) prevFb.remove();
          if (lightboxImg.parentElement) {
            lightboxImg.parentElement.insertAdjacentHTML('beforeend', renderMissingImagePlaceholderHtml({
              ...art,
              imageStatus: 'corrupted',
              imageError: 'Gambar gagal didekode saat membuka pratinjau penuh.'
            }));
          }
          renderStorageDiagnosticsBanner();
        };
      }
    }
    if (btnLightboxZoom) btnLightboxZoom.textContent = '🔍 Perbesar Detail';
    if (lightboxTitle) lightboxTitle.textContent = art.title;
    if (lightboxMeta) {
      lightboxMeta.innerHTML = `
        <span>${escapeHtml(col.icon)} ${escapeHtml(col.name)}</span> ·
        <span>📅 ${escapeHtml(formatFriendlyDate(art.createdDate))}</span> ·
        <span class="status-badge-pill ${escapeHtml(art.status)}">${escapeHtml(statusInfo.label)}</span>
      `;
    }
    if (lightboxDesc) {
      lightboxDesc.textContent = art.description || 'Tidak ada deskripsi tambahan.';
    }

    // Navigation visibility
    if (btnLightboxPrev) btnLightboxPrev.style.display = lightboxArtList.length > 1 ? 'flex' : 'none';
    if (btnLightboxNext) btnLightboxNext.style.display = lightboxArtList.length > 1 ? 'flex' : 'none';

    // Story Behind the Art (Respecting Public vs Private isolation)
    if (lightboxStoryWrap) {
      const canShowStory = isEffectiveOwner || Boolean(art.storyPublic);
      if (!canShowStory) {
        lightboxStoryWrap.innerHTML = `
          <div class="lightbox-story-card">
            <h4>📖 Story Behind the Art</h4>
            <p style="font-size:0.84rem;color:#94a3b8;margin:0;">☾ Cerita di balik karya ini disimpan secara pribadi oleh sang pelukis.</p>
          </div>
        `;
      } else {
        const s = art.story || {};
        const hasAny = s.inspiration || s.meaning || s.process || (isEffectiveOwner && art.privateNotes);
        lightboxStoryWrap.innerHTML = `
          <div class="lightbox-story-card">
            <h4>📖 Story Behind the Art ${!art.storyPublic && isEffectiveOwner ? '<span style="font-size:0.72rem;color:#cbd5e1;">(🔒 Privat)</span>' : ''}</h4>
            ${hasAny ? `
              ${s.inspiration ? `<div class="story-entry-block"><div class="story-entry-label">✨ Inspirasi</div><p class="story-entry-text">${escapeHtml(s.inspiration)}</p></div>` : ''}
              ${s.meaning ? `<div class="story-entry-block"><div class="story-entry-label">💭 Yang Ingin Disampaikan</div><p class="story-entry-text">${escapeHtml(s.meaning)}</p></div>` : ''}
              ${s.process ? `<div class="story-entry-block"><div class="story-entry-label">🖌️ Proses Pembuatan</div><p class="story-entry-text">${escapeHtml(s.process)}</p></div>` : ''}
              ${(isEffectiveOwner && art.privateNotes) ? `<div class="story-entry-block"><div class="story-entry-label">🔒 Catatan Pribadi Lele</div><p class="story-entry-text">${escapeHtml(art.privateNotes)}</p></div>` : ''}
            ` : `<p style="font-size:0.84rem;color:#94a3b8;margin:0;">Belum ada cerita tertulis untuk karya ini.</p>`}
          </div>
        `;
      }
    }

    if (lightboxOwnerActions) {
      if (!isEffectiveOwner) {
        lightboxOwnerActions.style.display = 'none';
      } else {
        const fav = getFavoriteMasterpiece({ viewerChar, visitorPreview: false });
        const isFav = fav && fav.id === art.id;
        lightboxOwnerActions.style.display = 'flex';
        lightboxOwnerActions.innerHTML = `
          <button type="button" class="btn-museum-secondary" id="btn-lb-edit">✏️ Edit Karya & Cerita</button>
          ${art.status === 'published' ? `<button type="button" class="btn-museum-primary" id="btn-lb-fav">${isFav ? '⭐ Karya Utama Aktif' : '⭐ Jadikan Karya Utama'}</button>` : ''}
        `;
        document.getElementById('btn-lb-edit')?.addEventListener('click', () => {
          closeArtworkLightbox();
          loadArtworkIntoAtelier(art.id);
        });
        document.getElementById('btn-lb-fav')?.addEventListener('click', () => {
          try {
            setFavoriteMasterpiece(isFav ? null : art.id, viewerChar);
            if (onShowToast) onShowToast(isFav ? 'Karya utama dilepas.' : `⭐ "${art.title}" dijadikan My Favorite Masterpiece!`);
            renderLightboxContent();
            renderMasterpieceShowcase();
          } catch (err) {
            if (onShowToast) onShowToast(err.message);
          }
        });
      }
    }
  }

  function closeArtworkLightbox() {
    if (modalLightbox) {
      modalLightbox.classList.remove('open');
      modalLightbox.setAttribute('aria-hidden', 'true');
    }
  }

  // ==========================================================================
  // 8. MODALS: FAVORITE MASTERPIECE PICKER, COLLECTIONS, DELETE CONFIRM
  // ==========================================================================

  function openMasterpiecePicker() {
    const { viewerChar, isEffectiveOwner } = getViewerState();
    if (!isEffectiveOwner || !modalMasterpiecePicker || !masterpiecePickerList) return;

    const pubArtworks = getExhibitionArtworks({ collectionId: 'all', viewerChar, visitorPreview: false });
    const currentFav = getFavoriteMasterpiece({ viewerChar, visitorPreview: false });

    if (pubArtworks.length === 0) {
      masterpiecePickerList.innerHTML = `<p style="color:#cbd5e1;font-size:0.9rem;">Belum ada karya berstatus <strong>Published</strong>. Hanya karya Published yang dapat dijadikan Karya Utama museum publik.</p>`;
    } else {
      masterpiecePickerList.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${currentFav ? `<button type="button" class="btn-museum-secondary" id="btn-clear-fav-masterpiece">Kosongkan Karya Utama</button>` : ''}
          ${pubArtworks.map((a) => `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px;border-radius:10px;background:rgba(15,23,52,0.8);border:1px solid ${currentFav?.id === a.id ? '#e5b963' : 'rgba(196,181,253,0.22)'};">
              <div style="display:flex;align-items:center;gap:10px;">
                ${a.imageDataUrl && a.imageStatus === 'ok'
                  ? `<img src="${escapeHtml(a.imageDataUrl)}" alt="${escapeHtml(a.title)}" style="width:52px;height:52px;object-fit:contain;background:#050814;border-radius:6px;" />`
                  : `<div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;background:#050814;border:1px dashed rgba(196,181,253,0.35);border-radius:6px;font-size:1.1rem;">🖼️</div>`
                }
                <div>
                  <div style="font-weight:700;color:#f8fafc;">${escapeHtml(a.title)}</div>
                  <div style="font-size:0.76rem;color:#94a3b8;">${escapeHtml(formatFriendlyDate(a.createdDate))}</div>
                </div>
              </div>
              <button type="button" class="btn-museum-primary" data-pick-fav="${escapeHtml(a.id)}" style="padding:6px 14px;font-size:0.8rem;">
                ${currentFav?.id === a.id ? '⭐ Aktif' : 'Pilih'}
              </button>
            </div>
          `).join('')}
        </div>
      `;

      masterpiecePickerList.querySelectorAll('[data-pick-fav]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-pick-fav');
          setFavoriteMasterpiece(id, viewerChar);
          modalMasterpiecePicker.classList.remove('open');
          modalMasterpiecePicker.setAttribute('aria-hidden', 'true');
          if (onShowToast) onShowToast('⭐ My Favorite Masterpiece berhasil diperbarui!');
          renderMasterpieceShowcase();
        });
      });

      document.getElementById('btn-clear-fav-masterpiece')?.addEventListener('click', () => {
        setFavoriteMasterpiece(null, viewerChar);
        modalMasterpiecePicker.classList.remove('open');
        modalMasterpiecePicker.setAttribute('aria-hidden', 'true');
        renderMasterpieceShowcase();
      });
    }

    modalMasterpiecePicker.classList.add('open');
    modalMasterpiecePicker.setAttribute('aria-hidden', 'false');
  }

  function renderCollectionsManagerList() {
    if (!collectionsManagerList) return;
    const { viewerChar } = getViewerState();
    const cols = getCollections();

    collectionsManagerList.innerHTML = cols.map((col) => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:10px;background:rgba(15,23,52,0.78);border:1px solid rgba(196,181,253,0.2);margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span>${escapeHtml(col.icon)}</span>
          <strong style="color:#f8fafc;">${escapeHtml(col.name)}</strong>
          ${col.isDefault ? '<span style="font-size:0.7rem;color:#94a3b8;">(Bawaan)</span>' : ''}
        </div>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn-museum-secondary" data-col-up="${escapeHtml(col.id)}" style="padding:4px 9px;">↑</button>
          <button type="button" class="btn-museum-secondary" data-col-down="${escapeHtml(col.id)}" style="padding:4px 9px;">↓</button>
          ${!col.isDefault ? `<button type="button" class="btn-museum-danger" data-col-del="${escapeHtml(col.id)}" style="padding:4px 9px;">Hapus</button>` : ''}
        </div>
      </div>
    `).join('');

    collectionsManagerList.querySelectorAll('[data-col-up]').forEach((b) => {
      b.addEventListener('click', () => {
        reorderCollection(b.getAttribute('data-col-up'), 'up', viewerChar);
        renderCollectionsManagerList();
        renderCollectionsBar();
      });
    });
    collectionsManagerList.querySelectorAll('[data-col-down]').forEach((b) => {
      b.addEventListener('click', () => {
        reorderCollection(b.getAttribute('data-col-down'), 'down', viewerChar);
        renderCollectionsManagerList();
        renderCollectionsBar();
      });
    });
    collectionsManagerList.querySelectorAll('[data-col-del]').forEach((b) => {
      b.addEventListener('click', async () => {
        await deleteCustomCollection(b.getAttribute('data-col-del'), viewerChar);
        if (activeCollectionFilter === b.getAttribute('data-col-del')) {
          activeCollectionFilter = 'all';
        }
        renderCollectionsManagerList();
        renderCollectionsBar();
        populateCollectionSelects();
      });
    });
  }

  function promptDeleteConfirm(art) {
    pendingDeleteArtworkId = art.id;
    if (deleteConfirmTitle) deleteConfirmTitle.textContent = art.title;
    if (modalDeleteConfirm) {
      modalDeleteConfirm.classList.add('open');
      modalDeleteConfirm.setAttribute('aria-hidden', 'false');
    }
  }

  function renderQuietCorner() {
    if (quietQuoteText) {
      quietQuoteText.textContent = QUIET_QUOTES[quietQuoteIndex % QUIET_QUOTES.length];
    }
    updateAudioButtonsUI();
  }

  // ==========================================================================
  // 9. EVENT LISTENERS
  // ==========================================================================

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      stopMuseumMusic();
      closeArtworkLightbox();
      viewGallery.classList.remove('active');
      viewGallery.setAttribute('aria-hidden', 'true');
      if (typeof onNavigateBack === 'function') onNavigateBack();
    });
  }

  roomTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-museum-room');
      if (target === 'atelier' && activeRoom !== 'atelier') {
        resetAtelierForm();
      }
      switchRoom(target);
    });
  });

  if (btnAudioToggle) btnAudioToggle.addEventListener('click', toggleMuseumMusic);
  if (btnQuietAudio) btnQuietAudio.addEventListener('click', toggleMuseumMusic);
  if (sliderAudioVol) {
    sliderAudioVol.addEventListener('input', (e) => {
      musicVol = Math.max(0, Math.min(1, Number(e.target.value) / 100));
      if (audioCtx && masterGain && isMusicPlaying) {
        masterGain.gain.setTargetAtTime(musicVol * 0.65, audioCtx.currentTime, 0.1);
      }
    });
  }

  if (btnVisitorPreview) {
    btnVisitorPreview.addEventListener('click', () => {
      visitorPreviewMode = !visitorPreviewMode;
      switchRoom('exhibition');
      if (onShowToast) {
        onShowToast(visitorPreviewMode
          ? '👁️ Mode Pratinjau Pengunjung aktif — hanya karya Published yang tampil.'
          : '🎨 Kembali ke Mode Pemilik Museum Lele.');
      }
    });
  }

  if (btnEmptyOpenAtelier) {
    btnEmptyOpenAtelier.addEventListener('click', () => {
      resetAtelierForm();
      switchRoom('atelier');
    });
  }

  if (btnChooseMasterpiece) {
    btnChooseMasterpiece.addEventListener('click', openMasterpiecePicker);
  }
  if (btnCloseMasterpiecePicker) {
    btnCloseMasterpiecePicker.addEventListener('click', () => {
      modalMasterpiecePicker?.classList.remove('open');
      modalMasterpiecePicker?.setAttribute('aria-hidden', 'true');
    });
  }

  if (btnManageCollections) {
    btnManageCollections.addEventListener('click', () => {
      renderCollectionsManagerList();
      modalCollections?.classList.add('open');
      modalCollections?.setAttribute('aria-hidden', 'false');
    });
  }
  if (btnCloseCollections) {
    btnCloseCollections.addEventListener('click', () => {
      modalCollections?.classList.remove('open');
      modalCollections?.setAttribute('aria-hidden', 'true');
    });
  }
  if (btnCreateCollection) {
    btnCreateCollection.addEventListener('click', () => {
      try {
        const { viewerChar } = getViewerState();
        createCustomCollection({
          name: inputNewColName?.value || '',
          icon: inputNewColIcon?.value || '🎨'
        }, viewerChar);
        if (inputNewColName) inputNewColName.value = '';
        renderCollectionsManagerList();
        renderCollectionsBar();
        populateCollectionSelects();
        if (onShowToast) onShowToast('✨ Koleksi baru berhasil ditambahkan!');
      } catch (err) {
        if (onShowToast) onShowToast(err.message);
      }
    });
  }

  // Atelier Upload & Form Events
  if (atelierDropzone) {
    atelierDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btn-atelier-change-img')) return;
      atelierFileInput?.click();
    });
    atelierDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      atelierDropzone.classList.add('drag-over');
    });
    atelierDropzone.addEventListener('dragleave', () => {
      atelierDropzone.classList.remove('drag-over');
    });
    atelierDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      atelierDropzone.classList.remove('drag-over');
      const f = e.dataTransfer?.files?.[0];
      if (f) handleAtelierImageFile(f);
    });
  }
  if (atelierFileInput) {
    atelierFileInput.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (f) handleAtelierImageFile(f);
    });
  }
  if (btnAtelierChangeImg) {
    btnAtelierChangeImg.addEventListener('click', (e) => {
      e.stopPropagation();
      atelierFileInput?.click();
    });
  }
  if (btnAtelierReset) {
    btnAtelierReset.addEventListener('click', () => {
      resetAtelierForm();
      if (onShowToast) onShowToast('Formulir Little Atelier dibersihkan.');
    });
  }
  if (btnAtelierDelete) {
    btnAtelierDelete.addEventListener('click', () => {
      if (!editingArtworkId) return;
      const art = getArtworkById(editingArtworkId, { viewerChar: 'lele', visitorPreview: false });
      if (art) promptDeleteConfirm(art);
    });
  }

  if (atelierForm) {
    atelierForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showAtelierError('');
      const { viewerChar } = getViewerState();
      try {
        const saved = await saveArtworkItem({
          id: editingArtworkId,
          file: stagedFile,
          newImageDataUrl: stagedDataUrl,
          mimeType: stagedMimeType,
          sizeBytes: stagedSizeBytes,
          aspectRatio: stagedAspectRatio,
          title: inputTitle?.value || '',
          description: inputDesc?.value || '',
          createdDate: inputDate?.value || new Date().toISOString().slice(0, 10),
          collectionId: selectCollection?.value || 'memories',
          status: selectStatus?.value || 'draft',
          storyPublic: Boolean(checkStoryPublic?.checked),
          story: {
            inspiration: inputInsp?.value || '',
            meaning: inputMeaning?.value || '',
            process: inputProcess?.value || ''
          },
          privateNotes: inputPrivateNotes?.value || ''
        }, viewerChar);

        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        if (onShowToast) {
          onShowToast(saved.status === 'published'
            ? `🎨 Karya "${saved.title}" berhasil dipamerkan di Moonlit Art Gallery!`
            : `🔒 Karya "${saved.title}" tersimpan sebagai ${ARTWORK_STATUSES[saved.status]?.label || saved.status}.`);
        }
        resetAtelierForm();
        switchRoom(saved.status === 'published' ? 'exhibition' : 'manager');
      } catch (err) {
        const msg = err.message || 'Gagal menyimpan karya seni.';
        showAtelierError(msg);
        if (onShowToast) onShowToast(msg);
      }
    });
  }

  // Manager Filters
  managerStatusFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeManagerStatus = btn.getAttribute('data-status-filter') || 'all';
      managerStatusFilters.forEach((b) => b.classList.toggle('active', b === btn));
      renderArtworkManager();
    });
  });
  if (managerCollectionSelect) {
    managerCollectionSelect.addEventListener('change', (e) => {
      activeManagerCollection = e.target.value || 'all';
      renderArtworkManager();
    });
  }

  // Delete Confirmation Events
  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', () => {
      pendingDeleteArtworkId = null;
      modalDeleteConfirm?.classList.remove('open');
      modalDeleteConfirm?.setAttribute('aria-hidden', 'true');
    });
  }
  if (btnExecuteDelete) {
    btnExecuteDelete.addEventListener('click', async () => {
      if (!pendingDeleteArtworkId) return;
      const { viewerChar } = getViewerState();
      try {
        await deleteArtworkItem(pendingDeleteArtworkId, viewerChar);
        if (editingArtworkId === pendingDeleteArtworkId) resetAtelierForm();
        pendingDeleteArtworkId = null;
        modalDeleteConfirm?.classList.remove('open');
        modalDeleteConfirm?.setAttribute('aria-hidden', 'true');
        if (onShowToast) onShowToast('🗑️ Karya berhasil dihapus dari museum.');
        renderCurrentRoom();
      } catch (err) {
        if (onShowToast) onShowToast(err.message);
      }
    });
  }

  // Lightbox Events
  if (btnLightboxClose) btnLightboxClose.addEventListener('click', closeArtworkLightbox);
  if (btnLightboxPrev) {
    btnLightboxPrev.addEventListener('click', () => {
      if (lightboxArtList.length <= 1) return;
      lightboxIndex = (lightboxIndex - 1 + lightboxArtList.length) % lightboxArtList.length;
      renderLightboxContent();
    });
  }
  if (btnLightboxNext) {
    btnLightboxNext.addEventListener('click', () => {
      if (lightboxArtList.length <= 1) return;
      lightboxIndex = (lightboxIndex + 1) % lightboxArtList.length;
      renderLightboxContent();
    });
  }
  function toggleLightboxZoom() {
    if (!lightboxImg) return;
    const isZoomed = lightboxImg.classList.toggle('zoomed');
    if (btnLightboxZoom) btnLightboxZoom.textContent = isZoomed ? '🔍 Kembalikan Ukuran' : '🔍 Perbesar Detail';
  }
  if (lightboxImg) lightboxImg.addEventListener('click', toggleLightboxZoom);
  if (btnLightboxZoom) btnLightboxZoom.addEventListener('click', toggleLightboxZoom);
  if (modalLightbox) {
    modalLightbox.addEventListener('click', (e) => {
      if (e.target === modalLightbox) closeArtworkLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (!modalLightbox || !modalLightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeArtworkLightbox();
    else if (e.key === 'ArrowLeft' && lightboxArtList.length > 1) {
      lightboxIndex = (lightboxIndex - 1 + lightboxArtList.length) % lightboxArtList.length;
      renderLightboxContent();
    } else if (e.key === 'ArrowRight' && lightboxArtList.length > 1) {
      lightboxIndex = (lightboxIndex + 1) % lightboxArtList.length;
      renderLightboxContent();
    }
  });

  if (btnQuietNextQuote) {
    btnQuietNextQuote.addEventListener('click', () => {
      quietQuoteIndex = (quietQuoteIndex + 1) % QUIET_QUOTES.length;
      renderQuietCorner();
    });
  }

  subscribeGalleryChanges(() => {
    if (viewGallery.classList.contains('active')) {
      renderCurrentRoom();
    }
  });

  // ==========================================================================
  // 10. PUBLIC SHOW METHOD
  // ==========================================================================

  async function showShadowArtGalleryView() {
    ['view-shadow-world', 'view-shadow-gazebo', 'view-shadow-garden', 'view-private-universe'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.setAttribute('aria-hidden', 'true');
      }
    });

    visitorPreviewMode = false;
    viewGallery.classList.add('active');
    viewGallery.setAttribute('aria-hidden', 'false');

    // Curtain entrance animation
    if (entranceCurtain) {
      entranceCurtain.classList.remove('revealing');
      void entranceCurtain.offsetWidth;
      entranceCurtain.classList.add('revealing');
    }

    const { viewerChar } = getViewerState();
    await loadArtGalleryStore(viewerChar);
    resetAtelierForm();
    switchRoom('exhibition');
  }

  return {
    showShadowArtGalleryView
  };
}
