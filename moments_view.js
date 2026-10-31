/**
 * OUR LITTLE MOMENTS — VIEW CONTROLLER & INTERACTION ENGINE
 * 
 * Handles rendering for 24-hour Stories, interactive Story Viewer modal with progress bars,
 * scrapbook memories feed, heart reactions, filter tabs, photo file upload, and archive collection.
 */

import {
  CHARACTERS_MOMENTS,
  getStories,
  getStoriesByCharacter,
  hasActiveStories,
  hasUnseenStories,
  getActiveFilter,
  setActiveFilter,
  getActiveUserCharacter,
  setActiveUserCharacter,
  getMomentsFeed,
  getArchiveMoments,
  markStoryAsViewed,
  saveStoryToArchive,
  toggleLikeMoment,
  toggleArchiveMoment,
  addMoment,
  subscribeMoments
} from './moments.js';

// Escape HTML utility
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Initialize Our Little Moments View Controller
 */
export function initMomentsView(options = {}) {
  const { onShowToast, onTriggerSparkle } = options;

  // DOM Elements: Views
  const viewSelection = document.getElementById('view-selection');
  const viewLogin = document.getElementById('view-login');
  const viewPrivateUniverse = document.getElementById('view-private-universe');
  const viewOrbit = document.getElementById('view-orbit');
  const viewMoments = document.getElementById('view-moments');

  // DOM Elements: Navigation Buttons
  const btnQuickOpenMoments = document.getElementById('btn-quick-open-moments');
  const portalOpenMoments = document.getElementById('portal-open-moments');
  const btnMomentsBackUniverse = document.getElementById('btn-moments-back-universe');
  const btnMomentsGotoOrbit = document.getElementById('btn-moments-goto-orbit');

  // Header & Controls
  const momentsViewerBadge = document.getElementById('moments-viewer-badge');
  const momentsViewerName = document.getElementById('moments-viewer-name');
  const btnOpenUploadMoment = document.getElementById('btn-open-upload-moment');

  // Stories Elements
  const storiesTray = document.getElementById('stories-tray');

  // Story Viewer Modal Elements
  const storyViewerOverlay = document.getElementById('story-viewer-overlay');
  const storyProgressContainer = document.getElementById('story-progress-container');
  const storyHeaderAvatar = document.getElementById('story-header-avatar');
  const storyHeaderName = document.getElementById('story-header-name');
  const storyHeaderTime = document.getElementById('story-header-time');
  const btnStoryArchive = document.getElementById('btn-story-archive');
  const btnStoryClose = document.getElementById('btn-story-close');
  const storyMainImage = document.getElementById('story-main-image');
  const storyCaptionText = document.getElementById('story-caption-text');
  const btnStoryReact = document.getElementById('btn-story-react');
  const storyReactCount = document.getElementById('story-react-count');
  const storyNavPrev = document.getElementById('story-nav-prev');
  const storyNavNext = document.getElementById('story-nav-next');
  const storyZonePrev = document.getElementById('story-zone-prev');
  const storyZoneNext = document.getElementById('story-zone-next');

  // Feed & Filter Elements
  const momentsFilterChips = document.querySelectorAll('.moments-filter-chip');
  const scrapbookGrid = document.getElementById('scrapbook-grid');

  // Upload Modal Elements
  const modalUploadMoment = document.getElementById('modal-upload-moment');
  const formUploadMoment = document.getElementById('form-upload-moment');
  const uploadDropzone = document.getElementById('upload-dropzone');
  const momentFileInput = document.getElementById('moment-file-input');
  const dropzonePrompt = document.getElementById('dropzone-prompt');
  const dropzonePreview = document.getElementById('dropzone-preview');
  const previewImage = document.getElementById('preview-image');
  const btnRemovePreview = document.getElementById('btn-remove-preview');
  const momentCaptionInput = document.getElementById('moment-caption-input');
  const uploadTypeOptions = document.querySelectorAll('.upload-type-option');

  // Story Player State
  let currentStoriesList = [];
  let currentStoryIndex = 0;
  let storyTimer = null;
  let storyProgressStartTime = 0;
  let storyProgressAnimationId = null;
  const STORY_DURATION = 5000; // 5 seconds per story

  // Upload State
  let uploadedPhotoDataUrl = null;
  let selectedPublicationType = 'both'; // 'story', 'feed', or 'both'
  let previousViewId = 'view-selection';

  // --- Modal Helpers ---
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
  }

  // --- View Switching ---
  function openMoments(fromViewId = 'view-selection') {
    previousViewId = fromViewId;

    if (viewSelection) {
      viewSelection.classList.remove('active');
      viewSelection.setAttribute('aria-hidden', 'true');
    }
    if (viewLogin) {
      viewLogin.classList.remove('active');
      viewLogin.setAttribute('aria-hidden', 'true');
    }
    if (viewPrivateUniverse) {
      viewPrivateUniverse.classList.remove('active');
      viewPrivateUniverse.setAttribute('aria-hidden', 'true');
    }
    if (viewOrbit) {
      viewOrbit.classList.remove('active');
      viewOrbit.setAttribute('aria-hidden', 'true');
    }
    const viewKidultWorld = document.getElementById('view-kidult-world');
    if (viewKidultWorld) {
      viewKidultWorld.classList.remove('active');
      viewKidultWorld.setAttribute('aria-hidden', 'true');
    }
    const viewToYouWorld = document.getElementById('view-toyou-world');
    if (viewToYouWorld) {
      viewToYouWorld.classList.remove('active');
      viewToYouWorld.setAttribute('aria-hidden', 'true');
    }
    const viewShadowWorld = document.getElementById('view-shadow-world');
    if (viewShadowWorld) {
      viewShadowWorld.classList.remove('active');
      viewShadowWorld.setAttribute('aria-hidden', 'true');
    }

    if (viewMoments) {
      viewMoments.classList.add('active');
      viewMoments.setAttribute('aria-hidden', 'false');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderAll();
    if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, 100);
  }

  function closeMoments() {
    if (viewMoments) {
      viewMoments.classList.remove('active');
      viewMoments.setAttribute('aria-hidden', 'true');
    }

    const viewKidultWorld = document.getElementById('view-kidult-world');
    const viewToYouWorld = document.getElementById('view-toyou-world');
    const viewShadowWorld = document.getElementById('view-shadow-world');

    if (previousViewId === 'view-orbit' && viewOrbit) {
      viewOrbit.classList.add('active');
      viewOrbit.setAttribute('aria-hidden', 'false');
    } else if (previousViewId === 'view-kidult-world' && viewKidultWorld) {
      viewKidultWorld.classList.add('active');
      viewKidultWorld.setAttribute('aria-hidden', 'false');
    } else if (previousViewId === 'view-toyou-world' && viewToYouWorld) {
      viewToYouWorld.classList.add('active');
      viewToYouWorld.setAttribute('aria-hidden', 'false');
    } else if (previousViewId === 'view-shadow-world' && viewShadowWorld) {
      viewShadowWorld.classList.add('active');
      viewShadowWorld.setAttribute('aria-hidden', 'false');
    } else if (previousViewId === 'view-private-universe' && viewPrivateUniverse) {
      viewPrivateUniverse.classList.add('active');
      viewPrivateUniverse.setAttribute('aria-hidden', 'false');
    } else if (viewSelection) {
      viewSelection.classList.add('active');
      viewSelection.setAttribute('aria-hidden', 'false');
    }
  }

  // Navigation Event Listeners
  if (btnQuickOpenMoments) {
    btnQuickOpenMoments.addEventListener('click', () => openMoments('view-selection'));
  }
  if (portalOpenMoments) {
    portalOpenMoments.addEventListener('click', () => openMoments('view-private-universe'));
  }
  const btnDashOpenMoments = document.getElementById('btn-dash-open-moments');
  if (btnDashOpenMoments) {
    btnDashOpenMoments.addEventListener('click', () => openMoments('view-private-universe'));
  }
  if (btnMomentsBackUniverse) {
    btnMomentsBackUniverse.addEventListener('click', closeMoments);
  }
  if (btnMomentsGotoOrbit) {
    btnMomentsGotoOrbit.addEventListener('click', () => {
      closeMoments();
      if (viewOrbit) {
        viewOrbit.classList.add('active');
        viewOrbit.setAttribute('aria-hidden', 'false');
      }
    });
  }

  // Perspective Toggle in Moments Header
  if (momentsViewerBadge) {
    momentsViewerBadge.title = 'Klik untuk berganti sudut pandang sahabat (Nyanya / Lala / Lele)';
    momentsViewerBadge.addEventListener('click', () => {
      const order = ['nyanya', 'lala', 'lele'];
      const current = getActiveUserCharacter();
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      const nextChar = order[nextIdx];
      setActiveUserCharacter(nextChar);
      if (onShowToast) onShowToast(`Melihat Our Little Moments sebagai ${CHARACTERS_MOMENTS[nextChar].name} ✦`);
    });
  }

  // --- Render Header & User Badge ---
  function renderHeader() {
    if (!momentsViewerName) return;
    const current = getActiveUserCharacter();
    const char = CHARACTERS_MOMENTS[current] || CHARACTERS_MOMENTS.nyanya;
    momentsViewerName.textContent = char.name;
  }

  // --- 1. RENDER STORIES BAR ---
  function renderStoriesBar() {
    if (!storiesTray) return;
    storiesTray.innerHTML = '';

    const characters = ['nyanya', 'lala', 'lele'];

    characters.forEach(charKey => {
      const char = CHARACTERS_MOMENTS[charKey];
      const hasStory = hasActiveStories(charKey);
      const isUnseen = hasUnseenStories(charKey);

      let ringClass = 'no-story';
      let statusText = 'Belum upload';
      let statusClass = '';

      if (hasStory) {
        if (isUnseen) {
          ringClass = 'has-unseen';
          statusText = '✦ Story baru';
          statusClass = 'unseen';
        } else {
          ringClass = 'seen';
          statusText = '✓ Dilihat';
        }
      }

      const item = document.createElement('div');
      item.className = 'story-avatar-item';
      item.setAttribute('data-character', charKey);

      item.innerHTML = `
        <div class="story-ring-wrapper ${ringClass}">
          <img src="${char.avatar}" alt="${char.name}" class="story-avatar-img" />
          ${!hasStory ? '<span class="story-no-story-badge" title="Belum upload story hari ini">+</span>' : '<span class="story-active-badge">✦</span>'}
        </div>
        <div class="story-char-meta">
          <span class="story-char-name">
            <span>${char.name}</span>
            <span style="font-size: 0.75rem; color: ${char.accentColor};">${char.symbol}</span>
          </span>
          <span class="story-status-text ${statusClass}">${statusText}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        if (hasStory) {
          openStoryViewer(charKey);
        } else {
          // If no story yet, prompt to create one!
          if (onShowToast) {
            onShowToast(`${char.name} belum mengunggah story hari ini. Buat momen sekarang! ✦`);
          }
          openUploadModal('story');
        }
      });

      storiesTray.appendChild(item);
    });
  }

  // --- 2. STORY VIEWER PLAYER (24-Hour Stories Dialog) ---
  function openStoryViewer(startCharKey) {
    const allStories = getStories();
    if (allStories.length === 0) return;

    currentStoriesList = [...allStories];

    // Find first story of startCharKey
    const targetIdx = currentStoriesList.findIndex(s => s.author === startCharKey);
    currentStoryIndex = targetIdx >= 0 ? targetIdx : 0;

    openModal(storyViewerOverlay);
    displayStoryAt(currentStoryIndex);
  }

  function displayStoryAt(index) {
    if (index < 0 || index >= currentStoriesList.length) {
      closeStoryViewer();
      return;
    }

    currentStoryIndex = index;
    const story = currentStoriesList[currentStoryIndex];

    // Mark as viewed
    markStoryAsViewed(story.id);

    // Populate Viewer Header & Content
    if (storyHeaderAvatar) storyHeaderAvatar.src = story.avatar;
    if (storyHeaderName) storyHeaderName.textContent = story.authorName;
    if (storyHeaderTime) storyHeaderTime.textContent = story.timeAgo || 'Baru saja';
    if (storyMainImage) storyMainImage.src = story.photoUrl;
    if (storyCaptionText) storyCaptionText.textContent = story.caption || '';
    if (storyReactCount) storyReactCount.textContent = story.likes || 0;

    // Archive Button State
    if (btnStoryArchive) {
      if (story.isArchived) {
        btnStoryArchive.textContent = '★ Tersimpan di Arsip';
        btnStoryArchive.style.background = 'rgba(251, 191, 36, 0.4)';
      } else {
        btnStoryArchive.textContent = '☆ Simpan ke Arsip';
        btnStoryArchive.style.background = 'rgba(0, 0, 0, 0.4)';
      }
    }

    // Build Progress Segments
    renderProgressSegments();

    // Start 5-second Auto-advance Timer
    startStoryTimer();
  }

  function renderProgressSegments() {
    if (!storyProgressContainer) return;
    storyProgressContainer.innerHTML = '';

    currentStoriesList.forEach((_, idx) => {
      const seg = document.createElement('div');
      seg.className = `story-progress-segment ${idx < currentStoryIndex ? 'completed' : ''}`;
      seg.innerHTML = '<div class="story-progress-fill"></div>';
      storyProgressContainer.appendChild(seg);
    });
  }

  function startStoryTimer() {
    stopStoryTimer();

    storyProgressStartTime = performance.now();

    function updateProgress(now) {
      const elapsed = now - storyProgressStartTime;
      const progressRatio = Math.min(1, elapsed / STORY_DURATION);

      const segments = storyProgressContainer.querySelectorAll('.story-progress-segment');
      if (segments[currentStoryIndex]) {
        const fill = segments[currentStoryIndex].querySelector('.story-progress-fill');
        if (fill) fill.style.width = `${progressRatio * 100}%`;
      }

      if (elapsed < STORY_DURATION) {
        storyProgressAnimationId = requestAnimationFrame(updateProgress);
      } else {
        // Time expired: advance to next story
        nextStory();
      }
    }

    storyProgressAnimationId = requestAnimationFrame(updateProgress);
  }

  function stopStoryTimer() {
    if (storyProgressAnimationId) {
      cancelAnimationFrame(storyProgressAnimationId);
      storyProgressAnimationId = null;
    }
  }

  function nextStory() {
    if (currentStoryIndex < currentStoriesList.length - 1) {
      displayStoryAt(currentStoryIndex + 1);
    } else {
      closeStoryViewer();
      if (onShowToast) onShowToast('Kamu telah melihat semua story aktif sahabat ✦');
    }
  }

  function prevStory() {
    if (currentStoryIndex > 0) {
      displayStoryAt(currentStoryIndex - 1);
    } else {
      // Replay first story from start
      displayStoryAt(0);
    }
  }

  function closeStoryViewer() {
    stopStoryTimer();
    closeModal(storyViewerOverlay);
  }

  // Story Viewer Controls Listeners
  if (btnStoryClose) btnStoryClose.addEventListener('click', closeStoryViewer);
  if (storyNavNext) storyNavNext.addEventListener('click', nextStory);
  if (storyNavPrev) storyNavPrev.addEventListener('click', prevStory);
  if (storyZoneNext) storyZoneNext.addEventListener('click', nextStory);
  if (storyZonePrev) storyZonePrev.addEventListener('click', prevStory);

  // Save Story to Archive Button
  if (btnStoryArchive) {
    btnStoryArchive.addEventListener('click', () => {
      const currentStory = currentStoriesList[currentStoryIndex];
      if (currentStory) {
        saveStoryToArchive(currentStory.id);
        btnStoryArchive.textContent = '★ Tersimpan di Arsip';
        btnStoryArchive.style.background = 'rgba(251, 191, 36, 0.4)';
        if (onShowToast) onShowToast('Story disimpan ke Our Archive ✦');
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      }
    });
  }

  // Quick React in Story Viewer
  if (btnStoryReact) {
    btnStoryReact.addEventListener('click', (e) => {
      const currentStory = currentStoriesList[currentStoryIndex];
      if (currentStory) {
        currentStory.likes = (currentStory.likes || 0) + 1;
        if (storyReactCount) storyReactCount.textContent = currentStory.likes;

        // Visual Sparkle Reaction
        const rect = btnStoryReact.getBoundingClientRect();
        if (onTriggerSparkle) onTriggerSparkle(rect.left + rect.width / 2, rect.top);
        if (onShowToast) onShowToast('Mengirim cinta kosmik ke story sahabat! 💖');
      }
    });
  }

  // Keyboard navigation for stories
  window.addEventListener('keydown', (e) => {
    if (!storyViewerOverlay.classList.contains('open')) return;
    if (e.key === 'ArrowRight') nextStory();
    if (e.key === 'ArrowLeft') prevStory();
    if (e.key === 'Escape') closeStoryViewer();
  });

  // --- 3. RENDER SCRAPBOOK FEED & FILTER BAR ---
  function renderFeed() {
    if (!scrapbookGrid) return;
    scrapbookGrid.innerHTML = '';

    const currentFilter = getActiveFilter();
    const moments = getMomentsFeed(currentFilter);

    // Update Filter Chip active states
    momentsFilterChips.forEach(chip => {
      const cat = chip.getAttribute('data-filter');
      if (cat === currentFilter) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Empty State Check
    if (moments.length === 0) {
      let emptyMsg = 'Belum ada momen foto yang dibagikan.';
      if (currentFilter === 'archive') {
        emptyMsg = 'Belum ada momen atau story yang disimpan ke arsip. Tandai foto dengan tombol arsip atau simpan dari story!';
      } else if (currentFilter !== 'all') {
        const charName = CHARACTERS_MOMENTS[currentFilter] ? CHARACTERS_MOMENTS[currentFilter].name : currentFilter;
        emptyMsg = `Belum ada momen foto dari ${charName}. Yuk ingatkan ${charName} untuk berbagi sepotong dunianya hari ini! ✦`;
      }

      scrapbookGrid.innerHTML = `
        <div class="moments-empty-state">
          <span class="empty-state-symbol">📖</span>
          <h3 class="empty-state-title">Halaman Scrapbook Masih Tenang</h3>
          <p class="empty-state-desc">${escapeHtml(emptyMsg)}</p>
          <button type="button" class="btn-upload-moment" id="btn-empty-upload">
            <span>+</span>
            <span>Unggah Momen Pertama ✦</span>
          </button>
        </div>
      `;

      const btnEmptyUpload = document.getElementById('btn-empty-upload');
      if (btnEmptyUpload) {
        btnEmptyUpload.addEventListener('click', () => openUploadModal());
      }
      return;
    }

    // Render Scrapbook Cards
    moments.forEach(item => {
      const card = document.createElement('article');
      card.className = 'scrapbook-card';
      card.setAttribute('data-moment-id', item.id);

      card.innerHTML = `
        <!-- Washi Pin Ornament -->
        <div class="scrapbook-pin-ornament">✦</div>

        <!-- Author Row -->
        <div class="scrapbook-author-row">
          <div class="author-profile-info">
            <img src="${item.authorAvatar}" alt="${item.authorName}" class="author-mini-avatar" />
            <div class="author-meta-text">
              <span class="author-name-tag">${escapeHtml(item.authorName)}</span>
              <span class="author-location-tag">📍 ${escapeHtml(item.location || 'Our Little Universe')}</span>
            </div>
          </div>
          <span class="scrapbook-time-tag">${escapeHtml(item.timestamp)}</span>
        </div>

        <!-- Photo -->
        <div class="scrapbook-photo-wrapper">
          <img src="${item.photoUrl}" alt="${escapeHtml(item.caption)}" class="scrapbook-photo" loading="lazy" />
        </div>

        <!-- Caption -->
        <div class="scrapbook-caption-box">
          <p class="scrapbook-caption-text">${escapeHtml(item.caption)}</p>
        </div>

        <!-- Footer Actions -->
        <div class="scrapbook-footer-row">
          <div class="scrapbook-likes-group">
            <button type="button" class="btn-heart-like ${item.likedByMe ? 'liked' : ''}" data-action="like" aria-label="Sukai momen">
              <span>${item.likedByMe ? '💖' : '🤍'}</span>
            </button>
            <span class="like-count-text">${item.likes} suka</span>
          </div>

          <button type="button" class="btn-archive-toggle ${item.isArchived ? 'archived' : ''}" data-action="archive">
            <span>${item.isArchived ? '★' : '☆'}</span>
            <span>${item.isArchived ? 'Arsip Kita' : 'Simpan'}</span>
          </button>
        </div>
      `;

      // Like Button Event
      const btnLike = card.querySelector('[data-action="like"]');
      if (btnLike) {
        btnLike.addEventListener('click', (e) => {
          e.stopPropagation();
          const updated = toggleLikeMoment(item.id);
          if (updated && updated.likedByMe) {
            const rect = btnLike.getBoundingClientRect();
            if (onTriggerSparkle) onTriggerSparkle(rect.left + 15, rect.top);
          }
        });
      }

      // Archive Button Event
      const btnArchive = card.querySelector('[data-action="archive"]');
      if (btnArchive) {
        btnArchive.addEventListener('click', (e) => {
          e.stopPropagation();
          const isArchived = toggleArchiveMoment(item.id);
          if (onShowToast) {
            onShowToast(isArchived ? 'Momen disimpan ke Our Archive ✦' : 'Momen dihapus dari Our Archive ✧');
          }
        });
      }

      // Photo Click opens story or enlarged view
      const photoWrap = card.querySelector('.scrapbook-photo-wrapper');
      if (photoWrap) {
        photoWrap.addEventListener('click', () => {
          // Open Story viewer starting from this author
          openStoryViewer(item.author);
        });
      }

      scrapbookGrid.appendChild(card);
    });
  }

  // Filter Chips Listeners
  momentsFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter');
      setActiveFilter(filter || 'all');
    });
  });

  // --- 4. FORM TAMBAH MOMEN (UPLOAD MODAL) ---
  function openUploadModal(defaultType = 'both') {
    selectedPublicationType = defaultType;
    updateUploadTypeSelection(selectedPublicationType);
    openModal(modalUploadMoment);
  }

  function resetUploadForm() {
    uploadedPhotoDataUrl = null;
    if (momentFileInput) momentFileInput.value = '';
    if (momentCaptionInput) momentCaptionInput.value = '';

    if (uploadDropzone) uploadDropzone.classList.remove('has-preview');
    if (dropzonePrompt) dropzonePrompt.style.display = 'flex';
    if (dropzonePreview) dropzonePreview.style.display = 'none';
    if (previewImage) previewImage.src = '';

    selectedPublicationType = 'both';
    updateUploadTypeSelection('both');
  }

  function updateUploadTypeSelection(type) {
    selectedPublicationType = type;
    uploadTypeOptions.forEach(opt => {
      if (opt.getAttribute('data-type') === type) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  // Upload Type Selector Click
  uploadTypeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const t = opt.getAttribute('data-type');
      updateUploadTypeSelection(t);
    });
  });

  // Open Upload Modal Trigger
  if (btnOpenUploadMoment) {
    btnOpenUploadMoment.addEventListener('click', () => openUploadModal('both'));
  }

  // File Input Change
  if (momentFileInput) {
    momentFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleSelectedFile(file);
      }
    });
  }

  // Dropzone Click -> triggers file input
  if (uploadDropzone) {
    uploadDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btn-remove-preview')) return;
      if (momentFileInput) momentFileInput.click();
    });

    // Drag and Drop
    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.style.borderColor = '#f472b6';
    });

    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.style.borderColor = 'rgba(244, 114, 182, 0.4)';
    });

    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.style.borderColor = 'rgba(244, 114, 182, 0.4)';
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleSelectedFile(file);
      } else if (onShowToast) {
        onShowToast('Mohon pilih file gambar yang valid (JPG, PNG, WebP) ⚠️');
      }
    });
  }

  // Handle Chosen Image File (via FileReader)
  function handleSelectedFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedPhotoDataUrl = event.target.result;

      if (uploadDropzone) uploadDropzone.classList.add('has-preview');
      if (dropzonePrompt) dropzonePrompt.style.display = 'none';
      if (dropzonePreview) dropzonePreview.style.display = 'block';
      if (previewImage) previewImage.src = uploadedPhotoDataUrl;
    };
    reader.readAsDataURL(file);
  }

  // Remove Preview Button
  if (btnRemovePreview) {
    btnRemovePreview.addEventListener('click', (e) => {
      e.stopPropagation();
      resetUploadForm();
    });
  }

  // Close Upload Modal Buttons
  document.querySelectorAll('#modal-upload-moment [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(modalUploadMoment);
      resetUploadForm();
    });
  });

  // Upload Form Submit
  if (formUploadMoment) {
    formUploadMoment.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validation: Photo is mandatory
      if (!uploadedPhotoDataUrl) {
        if (onShowToast) onShowToast('Silakan pilih foto terlebih dahulu sebelum membagikan ⚠️');
        if (uploadDropzone) {
          uploadDropzone.style.borderColor = '#ef4444';
          setTimeout(() => {
            uploadDropzone.style.borderColor = 'rgba(244, 114, 182, 0.4)';
          }, 1500);
        }
        return;
      }

      const caption = momentCaptionInput ? momentCaptionInput.value : '';
      const currentAuthor = getActiveUserCharacter();
      const char = CHARACTERS_MOMENTS[currentAuthor] || CHARACTERS_MOMENTS.nyanya;

      // Add to Moments Store
      addMoment({
        photoUrl: uploadedPhotoDataUrl,
        caption,
        type: selectedPublicationType,
        author: currentAuthor,
        location: `Universe ${char.name}`
      });

      closeModal(modalUploadMoment);
      resetUploadForm();

      if (onShowToast) onShowToast(`Momen baru berhasil dibagikan ke Our Little Moments ✦`);
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    });
  }

  // Master Render Function
  function renderAll() {
    renderHeader();
    renderStoriesBar();
    renderFeed();
  }

  // Subscribe to Moments Store
  subscribeMoments(() => {
    renderAll();
  });

  // Initial Render
  renderAll();

  return {
    openMoments,
    closeMoments,
    renderAll
  };
}
