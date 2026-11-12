/**
 * OUR LITTLE MOMENTS — UI CONTROLLER & INTERACTIONS
 *
 * Implements:
 * 1. Story Creation & Upload Modal (Photos & Videos, Live Preview, File Validation, Optional Caption).
 * 2. Stories Sahabat 24-Hour Tray (Nyanya ⭐, Lala ☀️, Lele 🌙) driven strictly by real stored data.
 * 3. Fullscreen Story Player (Image & Video playback, multi-segment progress bar, Next/Prev navigation, Close).
 * 4. Personal Gallery & Shared Scrapbook Feed with Filter Tabs (Semua, Nyanya, Lala, Lele, Arsip Kita)
 *    and strict ownership & privacy enforcement.
 */

import {
  CHARACTERS_MOMENTS,
  getActiveUserCharacter,
  setActiveUserCharacter,
  getActiveFilter,
  setActiveFilter,
  getStories,
  getStoriesByCharacter,
  hasActiveStories,
  hasUnseenStories,
  markStoryAsViewed,
  saveStoryToArchive,
  getMomentsFeed,
  toggleLikeMoment,
  toggleArchiveMoment,
  updateMomentPrivacy,
  deleteMomentItem,
  validateStoryMediaInput,
  addMoment,
  subscribeMoments,
  reloadMomentsFromStorage,
  getPersonalGallery,
  updateStoryTimestamp,
  clearAllMomentsStore
} from './moments.js';

export function initMomentsView({ onShowToast, onTriggerSparkle } = {}) {
  // --- DOM Elements: Views ---
  const viewMoments = document.getElementById('view-moments');
  const viewSelection = document.getElementById('view-selection');
  const viewPrivateUniverse = document.getElementById('view-private-universe');
  const viewOrbit = document.getElementById('view-orbit');

  // --- DOM Elements: Navigation Buttons ---
  const btnQuickOpenMoments = document.getElementById('btn-quick-open-moments');
  const portalOpenMoments = document.getElementById('portal-open-moments');
  const btnMomentsBackUniverse = document.getElementById('btn-moments-back-universe');
  const btnMomentsGotoOrbit = document.getElementById('btn-moments-goto-orbit');
  const btnOpenUploadMoment = document.getElementById('btn-open-upload-moment');

  // --- DOM Elements: Header & Active User Badge ---
  const momentsViewerName = document.getElementById('moments-viewer-name');
  const momentsViewerBadge = document.getElementById('moments-viewer-badge');

  // --- DOM Elements: Stories Bar & Status Banner ---
  const storiesTray = document.getElementById('stories-tray');
  const storiesStatusBanner = document.getElementById('stories-status-banner');
  const storiesStatusText = document.getElementById('stories-status-text');

  // --- DOM Elements: Scrapbook Grid & Filter Bar ---
  const scrapbookGrid = document.getElementById('scrapbook-grid');
  const momentsFilterChips = document.querySelectorAll('.moments-filter-chip');
  const momentsGalleryAccessNote = document.getElementById('moments-gallery-access-note');

  // --- DOM Elements: Story Viewer Modal ---
  const storyViewerOverlay = document.getElementById('story-viewer-overlay');
  const storyProgressContainer = document.getElementById('story-progress-container');
  const storyHeaderAvatar = document.getElementById('story-header-avatar');
  const storyHeaderName = document.getElementById('story-header-name');
  const storyCounterBadge = document.getElementById('story-counter-badge');
  const storyHeaderTime = document.getElementById('story-header-time');
  const storyMainImage = document.getElementById('story-main-image');
  const storyMainVideo = document.getElementById('story-main-video');
  const storyCaptionText = document.getElementById('story-caption-text');
  const btnStoryArchive = document.getElementById('btn-story-archive');
  const btnStoryDelete = document.getElementById('btn-story-delete');
  const btnStoryClose = document.getElementById('btn-story-close');
  const storyZonePrev = document.getElementById('story-zone-prev');
  const storyZoneNext = document.getElementById('story-zone-next');
  const storyNavPrev = document.getElementById('story-nav-prev');
  const storyNavNext = document.getElementById('story-nav-next');
  const btnStoryReact = document.getElementById('btn-story-react');
  const storyReactCount = document.getElementById('story-react-count');

  // --- DOM Elements: Upload Modal ---
  const modalUploadMoment = document.getElementById('modal-upload-moment');
  const formUploadMoment = document.getElementById('form-upload-moment');
  const momentFileInput = document.getElementById('moment-file-input');
  const uploadDropzone = document.getElementById('upload-dropzone');
  const dropzonePrompt = document.getElementById('dropzone-prompt');
  const dropzonePreview = document.getElementById('dropzone-preview');
  const previewImage = document.getElementById('preview-image');
  const previewVideo = document.getElementById('preview-video');
  const previewMediaBadge = document.getElementById('preview-media-badge');
  const btnRemovePreview = document.getElementById('btn-remove-preview');
  const momentUploadError = document.getElementById('moment-upload-error');
  const momentCaptionInput = document.getElementById('moment-caption-input');
  const uploadTypeOptions = document.querySelectorAll('.upload-type-option');

  // --- Internal State ---
  let previousViewId = 'view-selection';
  let selectedPublicationType = 'both'; // 'both' | 'archive' | 'private'
  let selectedVisibility = 'friends'; // 'friends' | 'private'
  let uploadedMediaDataUrl = null;
  let uploadedMediaType = 'image'; // 'image' | 'video'
  let uploadedMimeType = 'image/jpeg';
  let uploadedFileSize = 0;

  // Story Player State
  let currentStoriesList = [];
  let currentStoryIndex = 0;
  let storyProgressAnimationId = null;
  let storyProgressStartTime = 0;
  const STORY_DURATION_MS = 5000; // 5 seconds per photo story

  // --- Escape HTML Utility ---
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

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

  function showUploadError(message) {
    if (momentUploadError) {
      if (message) {
        momentUploadError.textContent = `⚠️ ${message}`;
        momentUploadError.style.display = 'block';
      } else {
        momentUploadError.textContent = '';
        momentUploadError.style.display = 'none';
      }
    }
  }

  function updateStatusBanner(message, isHighlight = false) {
    if (storiesStatusText) {
      storiesStatusText.textContent = message;
    }
    if (storiesStatusBanner) {
      storiesStatusBanner.classList.toggle('highlight-alert', Boolean(isHighlight));
    }
  }

  // --- Open / Close Moments View ---
  function openMoments(fromViewId) {
    if (fromViewId) {
      previousViewId = fromViewId;
    } else if (viewPrivateUniverse && viewPrivateUniverse.classList.contains('active')) {
      previousViewId = 'view-private-universe';
    } else if (viewOrbit && viewOrbit.classList.contains('active')) {
      previousViewId = 'view-orbit';
    } else {
      previousViewId = 'view-selection';
    }

    ['view-selection', 'view-private-universe', 'view-orbit', 'view-kidult-world', 'view-toyou-world', 'view-shadow-world', 'view-photobooth'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.setAttribute('aria-hidden', 'true');
      }
    });

    if (viewMoments) {
      viewMoments.classList.add('active');
      viewMoments.setAttribute('aria-hidden', 'false');
    }

    reloadMomentsFromStorage().then(() => {
      renderAll();
    });
    renderAll();

    if (onShowToast) {
      onShowToast('Membuka Our Little Moments — Stories & Gallery Sahabat 📸');
    }
  }

  function closeMoments() {
    closeStoryViewer();
    closeModal(modalUploadMoment);

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

  // --- Navigation Event Listeners ---
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

  // --- Perspective Switcher in Moments Header ---
  if (momentsViewerBadge) {
    momentsViewerBadge.title = 'Klik untuk berganti akun aktif (Nyanya ⭐ / Lala ☀️ / Lele 🌙)';
    momentsViewerBadge.addEventListener('click', () => {
      const order = ['nyanya', 'lala', 'lele'];
      const current = getActiveUserCharacter();
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      const nextChar = order[nextIdx];
      setActiveUserCharacter(nextChar);
      const charInfo = CHARACTERS_MOMENTS[nextChar];
      updateStatusBanner(
        `Masuk sebagai ${charInfo.name} ${charInfo.symbol}. Kamu memiliki akses penuh ke Gallery Pribadi ${charInfo.name}.`,
        false
      );
      if (onShowToast) {
        onShowToast(`Melihat Our Little Moments sebagai ${charInfo.name} ${charInfo.symbol}`);
      }
    });
  }

  // --- Render Header & User Badge ---
  function renderHeader() {
    const current = getActiveUserCharacter();
    const char = CHARACTERS_MOMENTS[current] || CHARACTERS_MOMENTS.nyanya;
    if (momentsViewerName) {
      momentsViewerName.textContent = `${char.name} ${char.symbol}`;
    }
    if (momentsGalleryAccessNote) {
      const currentFilter = getActiveFilter();
      if (currentFilter === current) {
        momentsGalleryAccessNote.textContent = `🔓 Menampilkan Gallery Pribadi milikmu (${char.name} ${char.symbol}) — termasuk arsip Story >24 jam & item privat.`;
      } else if (currentFilter === 'nyanya' || currentFilter === 'lala' || currentFilter === 'lele') {
        const targetChar = CHARACTERS_MOMENTS[currentFilter];
        momentsGalleryAccessNote.textContent = `🔒 Melihat Gallery publik ${targetChar.name} ${targetChar.symbol}. Arsip Story pribadi (>24 jam) & item privat milik ${targetChar.name} dilindungi.`;
      } else if (currentFilter === 'archive') {
        momentsGalleryAccessNote.textContent = `🏛️ Menampilkan Arsip Kita bersama & arsip Story pribadimu (${char.name} ${char.symbol}).`;
      } else {
        momentsGalleryAccessNote.textContent = `🔒 Arsip Story (>24 jam) & Gallery pribadi hanya dapat diakses dan dikelola oleh pemiliknya.`;
      }
    }
  }

  // --- 1. RENDER STORIES BAR (STORIES SAHABAT) ---
  function renderStoriesBar() {
    if (!storiesTray) return;
    storiesTray.innerHTML = '';

    const characters = ['nyanya', 'lala', 'lele'];
    const nowMs = Date.now();
    const viewerChar = getActiveUserCharacter();

    characters.forEach((charKey) => {
      const char = CHARACTERS_MOMENTS[charKey];
      const activeCharStories = getStoriesByCharacter(charKey, nowMs, viewerChar);
      const storyCount = activeCharStories.length;
      const hasStory = storyCount > 0;
      const isUnseen = hasUnseenStories(charKey, nowMs, viewerChar);

      let ringClass = 'no-story';
      let statusText = 'Belum ada Story';
      let statusClass = 'empty-story';

      if (hasStory) {
        if (isUnseen) {
          ringClass = 'has-unseen';
          statusText = storyCount > 1 ? `✦ ${storyCount} Story baru` : '✦ 1 Story baru';
          statusClass = 'unseen';
        } else {
          ringClass = 'seen';
          statusText = storyCount > 1 ? `✓ ${storyCount} Story aktif` : '✓ Dilihat';
          statusClass = 'seen-story';
        }
      }

      const item = document.createElement('button');
      item.type = 'button';
      item.className = `story-avatar-item ${hasStory ? 'has-active-story' : 'no-active-story'}`;
      item.setAttribute('data-character', charKey);
      item.setAttribute('role', 'listitem');
      item.setAttribute(
        'aria-label',
        `${char.name} ${char.symbol} - ${hasStory ? `${storyCount} Story aktif` : 'Belum memiliki Story aktif dalam 24 jam terakhir'}`
      );

      item.innerHTML = `
        <div class="story-ring-wrapper ${ringClass}">
          <img src="${char.avatar}" alt="${char.name}" class="story-avatar-img" />
          ${
            hasStory
              ? `<span class="story-active-badge" title="${storyCount} Story aktif">${storyCount}</span>`
              : `<span class="story-no-story-badge" title="Belum ada Story aktif dalam 24 jam terakhir">–</span>`
          }
        </div>
        <div class="story-char-meta">
          <span class="story-char-name">
            <span>${char.name}</span>
            <span class="story-char-symbol" style="color: ${char.accentColor};">${char.symbol}</span>
          </span>
          <span class="story-status-text ${statusClass}">${statusText}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        const freshStories = getStoriesByCharacter(charKey, Date.now(), getActiveUserCharacter());
        if (freshStories.length > 0) {
          updateStatusBanner(
            `Membuka Story aktif milik ${char.name} ${char.symbol} (${freshStories.length} Story dalam 24 jam terakhir).`,
            false
          );
          openStoryViewerForCharacter(charKey);
        } else {
          // Clear, honest status when a user has no active story in the last 24 hours
          const msg = `${char.name} ${char.symbol} belum memiliki Story aktif dalam 24 jam terakhir.`;
          updateStatusBanner(msg, true);
          if (onShowToast) {
            onShowToast(msg);
          }
        }
      });

      storiesTray.appendChild(item);
    });
  }

  // --- 2. STORY VIEWER PLAYER (24-Hour Stories Dialog) ---
  function openStoryViewerForCharacter(charKey, startStoryId = null) {
    const charStories = getStoriesByCharacter(charKey, Date.now(), getActiveUserCharacter());
    if (charStories.length === 0) {
      const char = CHARACTERS_MOMENTS[charKey] || CHARACTERS_MOMENTS.nyanya;
      const msg = `${char.name} ${char.symbol} belum memiliki Story aktif dalam 24 jam terakhir.`;
      updateStatusBanner(msg, true);
      if (onShowToast) onShowToast(msg);
      return;
    }

    currentStoriesList = [...charStories];
    if (startStoryId) {
      const idx = currentStoriesList.findIndex((s) => s.id === startStoryId);
      currentStoryIndex = idx >= 0 ? idx : 0;
    } else {
      currentStoryIndex = 0;
    }

    openModal(storyViewerOverlay);
    displayStoryAt(currentStoryIndex);
  }

  // Also allow opening a specific Gallery card item in the fullscreen viewer if accessible
  function openGalleryItemInViewer(item) {
    if (!item) return;
    const activeCharStories = getStoriesByCharacter(item.author, Date.now(), getActiveUserCharacter());
    const inActive = activeCharStories.findIndex((s) => s.id === item.id);
    if (inActive >= 0) {
      openStoryViewerForCharacter(item.author, item.id);
      return;
    }

    // View single archived/gallery item in fullscreen player
    currentStoriesList = [item];
    currentStoryIndex = 0;
    openModal(storyViewerOverlay);
    displayStoryAt(0);
  }

  function displayStoryAt(index) {
    if (index < 0 || index >= currentStoriesList.length) {
      closeStoryViewer();
      return;
    }

    stopStoryTimer();
    currentStoryIndex = index;
    const story = currentStoriesList[currentStoryIndex];
    const currentViewer = getActiveUserCharacter();
    const isOwner = story.author === currentViewer;

    // Mark as viewed
    markStoryAsViewed(story.id, currentViewer);

    // Populate Viewer Header & Content
    if (storyHeaderAvatar) {
      storyHeaderAvatar.src = story.avatar || story.authorAvatar;
      storyHeaderAvatar.alt = story.authorName;
    }
    if (storyHeaderName) {
      storyHeaderName.textContent = `${story.authorName} ${story.authorSymbol || ''}`.trim();
    }
    if (storyCounterBadge) {
      storyCounterBadge.textContent = `${currentStoryIndex + 1} / ${currentStoriesList.length}`;
    }
    if (storyHeaderTime) {
      storyHeaderTime.textContent = story.timeAgo || 'Baru saja';
    }
    if (storyCaptionText) {
      storyCaptionText.textContent = story.caption || '';
      storyCaptionText.style.display = story.caption ? 'block' : 'none';
    }
    if (storyReactCount) {
      storyReactCount.textContent = story.likes || 0;
    }

    // Media Element Switching: Video vs Image
    if (story.mediaType === 'video') {
      if (storyMainImage) {
        storyMainImage.style.display = 'none';
        storyMainImage.src = '';
      }
      if (storyMainVideo) {
        storyMainVideo.style.display = 'block';
        storyMainVideo.src = story.mediaUrl || story.photoUrl;
        storyMainVideo.currentTime = 0;
        const playPromise = storyMainVideo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            // Autoplay with sound may be blocked by browser policy; mute and retry
            storyMainVideo.muted = true;
            storyMainVideo.play().catch(() => {});
          });
        }
      }
    } else {
      if (storyMainVideo) {
        try {
          storyMainVideo.pause();
        } catch (_) {}
        storyMainVideo.removeAttribute('src');
        storyMainVideo.style.display = 'none';
      }
      if (storyMainImage) {
        storyMainImage.style.display = 'block';
        storyMainImage.src = story.mediaUrl || story.photoUrl;
        storyMainImage.alt = story.caption || `Story ${story.authorName}`;
      }
    }

    // Navigation arrows visibility
    const hasMultiple = currentStoriesList.length > 1;
    if (storyNavPrev) {
      storyNavPrev.style.opacity = currentStoryIndex > 0 ? '0.9' : '0.35';
    }
    if (storyNavNext) {
      storyNavNext.style.opacity = hasMultiple ? '0.9' : '0.6';
    }

    // Owner vs Non-Owner Archive & Delete Buttons
    if (btnStoryArchive) {
      if (isOwner) {
        btnStoryArchive.disabled = false;
        btnStoryArchive.style.opacity = '1';
        if (story.isArchived) {
          btnStoryArchive.textContent = '★ Di Arsip Kita';
          btnStoryArchive.style.background = 'rgba(251, 191, 36, 0.4)';
        } else {
          btnStoryArchive.textContent = '☆ Pin ke Arsip Kita';
          btnStoryArchive.style.background = 'rgba(0, 0, 0, 0.45)';
        }
      } else {
        btnStoryArchive.disabled = true;
        btnStoryArchive.style.opacity = '0.75';
        btnStoryArchive.textContent = story.isArchived ? '★ Arsip Kita' : '⏳ Story Sahabat';
        btnStoryArchive.style.background = 'rgba(0, 0, 0, 0.35)';
      }
    }

    if (btnStoryDelete) {
      btnStoryDelete.style.display = isOwner ? 'inline-flex' : 'none';
    }

    // Build Progress Segments
    renderProgressSegments();

    // Start Progress Bar Timer
    startStoryTimer(story);
  }

  function renderProgressSegments() {
    if (!storyProgressContainer) return;
    storyProgressContainer.innerHTML = '';

    currentStoriesList.forEach((_, idx) => {
      const seg = document.createElement('div');
      seg.className = `story-progress-segment ${idx < currentStoryIndex ? 'completed' : ''} ${idx === currentStoryIndex ? 'active' : ''}`;
      const fill = document.createElement('div');
      fill.className = 'story-progress-fill';
      if (idx < currentStoryIndex) {
        fill.style.width = '100%';
      } else {
        fill.style.width = '0%';
      }
      seg.appendChild(fill);
      storyProgressContainer.appendChild(seg);
    });
  }

  function startStoryTimer(story) {
    stopStoryTimer();
    storyProgressStartTime = performance.now();

    function updateProgress(now) {
      let progressRatio = 0;

      if (
        story &&
        story.mediaType === 'video' &&
        storyMainVideo &&
        Number.isFinite(storyMainVideo.duration) &&
        storyMainVideo.duration > 0 &&
        !storyMainVideo.paused
      ) {
        progressRatio = Math.min(1, storyMainVideo.currentTime / storyMainVideo.duration);
      } else {
        const elapsed = now - storyProgressStartTime;
        progressRatio = Math.min(1, elapsed / STORY_DURATION_MS);
      }

      if (storyProgressContainer) {
        const segments = storyProgressContainer.querySelectorAll('.story-progress-segment');
        if (segments[currentStoryIndex]) {
          const fill = segments[currentStoryIndex].querySelector('.story-progress-fill');
          if (fill) fill.style.width = `${(progressRatio * 100).toFixed(1)}%`;
        }
      }

      if (progressRatio < 1) {
        storyProgressAnimationId = requestAnimationFrame(updateProgress);
      } else {
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
    if (storyMainVideo) {
      try {
        storyMainVideo.pause();
      } catch (_) {}
    }
  }

  function nextStory() {
    if (currentStoryIndex < currentStoriesList.length - 1) {
      displayStoryAt(currentStoryIndex + 1);
    } else {
      closeStoryViewer();
    }
  }

  function prevStory() {
    if (currentStoryIndex > 0) {
      displayStoryAt(currentStoryIndex - 1);
    } else {
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

  // Close story viewer when clicking outside card on backdrop
  if (storyViewerOverlay) {
    storyViewerOverlay.addEventListener('click', (e) => {
      if (e.target === storyViewerOverlay) {
        closeStoryViewer();
      }
    });
  }

  // Save Own Story to Shared Arsip Kita Button
  if (btnStoryArchive) {
    btnStoryArchive.addEventListener('click', () => {
      const currentStory = currentStoriesList[currentStoryIndex];
      if (!currentStory) return;
      try {
        const isNowArchived = toggleArchiveMoment(currentStory.id, getActiveUserCharacter());
        currentStory.isArchived = isNowArchived;
        btnStoryArchive.textContent = isNowArchived ? '★ Di Arsip Kita' : '☆ Pin ke Arsip Kita';
        btnStoryArchive.style.background = isNowArchived ? 'rgba(251, 191, 36, 0.4)' : 'rgba(0, 0, 0, 0.45)';
        if (onShowToast) {
          onShowToast(isNowArchived ? 'Story disematkan ke Arsip Kita ✦' : 'Story dilepas dari Arsip Kita ✧');
        }
        if (isNowArchived && onTriggerSparkle) {
          onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        }
      } catch (err) {
        if (onShowToast) onShowToast(err.message || 'Akses ditolak');
      }
    });
  }

  // Delete Own Story Button inside Viewer
  if (btnStoryDelete) {
    btnStoryDelete.addEventListener('click', () => {
      const currentStory = currentStoriesList[currentStoryIndex];
      if (!currentStory) return;
      try {
        deleteMomentItem(currentStory.id, getActiveUserCharacter());
        closeStoryViewer();
        if (onShowToast) onShowToast('Story berhasil dihapus dari Gallery Pribadimu ✧');
      } catch (err) {
        if (onShowToast) onShowToast(err.message || 'Akses ditolak');
      }
    });
  }

  // Quick React in Story Viewer
  if (btnStoryReact) {
    btnStoryReact.addEventListener('click', () => {
      const currentStory = currentStoriesList[currentStoryIndex];
      if (!currentStory) return;
      try {
        const updated = toggleLikeMoment(currentStory.id, getActiveUserCharacter());
        if (updated) {
          currentStory.likes = updated.likes;
          if (storyReactCount) storyReactCount.textContent = updated.likes;
          const rect = btnStoryReact.getBoundingClientRect();
          if (onTriggerSparkle) onTriggerSparkle(rect.left + rect.width / 2, rect.top);
          if (onShowToast) onShowToast('Mengirim apresiasi ke Story sahabat! 💖');
        }
      } catch (err) {
        if (onShowToast) onShowToast(err.message || 'Tidak dapat menyukai Story');
      }
    });
  }

  // Keyboard navigation for stories
  window.addEventListener('keydown', (e) => {
    if (!storyViewerOverlay || !storyViewerOverlay.classList.contains('open')) return;
    if (e.key === 'ArrowRight') nextStory();
    if (e.key === 'ArrowLeft') prevStory();
    if (e.key === 'Escape') closeStoryViewer();
  });

  // --- 3. RENDER PERSONAL GALLERY & SCRAPBOOK FEED ---
  function renderFeed() {
    if (!scrapbookGrid) return;
    scrapbookGrid.innerHTML = '';

    const currentFilter = getActiveFilter();
    const currentViewer = getActiveUserCharacter();
    const moments = getMomentsFeed(currentFilter, currentViewer, Date.now());

    // Update Filter Chip active states & ARIA attributes
    momentsFilterChips.forEach((chip) => {
      const cat = chip.getAttribute('data-filter');
      const isActive = cat === currentFilter;
      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Empty State Check
    if (moments.length === 0) {
      let emptyTitle = 'Gallery & Scrapbook Masih Kosong';
      let emptyMsg = 'Belum ada Story atau momen yang dibagikan. Unggah foto atau video pertamamu hari ini!';

      if (currentFilter === 'archive') {
        emptyTitle = 'Belum Ada Koleksi di Arsip';
        emptyMsg = 'Belum ada Story yang disematkan ke Arsip Kita atau Story yang melewati masa tayang 24 jam.';
      } else if (currentFilter === 'nyanya' || currentFilter === 'lala' || currentFilter === 'lele') {
        const charInfo = CHARACTERS_MOMENTS[currentFilter];
        if (currentViewer === currentFilter) {
          emptyTitle = `Gallery Pribadi ${charInfo.name} ${charInfo.symbol} Masih Kosong`;
          emptyMsg = `Setiap Story yang kamu unggah akan otomatis tersimpan permanen di Gallery ${charInfo.name}.`;
        } else {
          emptyTitle = `Belum Ada Konten Publik di Gallery ${charInfo.name} ${charInfo.symbol}`;
          emptyMsg = `${charInfo.name} belum membagikan Story aktif hari ini. Arsip pribadi milik ${charInfo.name} hanya dapat diakses oleh pemiliknya.`;
        }
      }

      scrapbookGrid.innerHTML = `
        <div class="moments-empty-state">
          <span class="empty-state-symbol">📸</span>
          <h3 class="empty-state-title">${escapeHtml(emptyTitle)}</h3>
          <p class="empty-state-desc">${escapeHtml(emptyMsg)}</p>
          <button type="button" class="btn-upload-moment" id="btn-empty-upload">
            <span>+</span>
            <span>Unggah Story Sekarang ✦</span>
          </button>
        </div>
      `;

      const btnEmptyUpload = document.getElementById('btn-empty-upload');
      if (btnEmptyUpload) {
        btnEmptyUpload.addEventListener('click', () => openUploadModal('both'));
      }
      return;
    }

    // Render Gallery & Scrapbook Cards
    moments.forEach((item) => {
      const card = document.createElement('article');
      card.className = `scrapbook-card ${item.isExpiredStory ? 'card-expired-archive' : 'card-active-story'}`;
      card.setAttribute('data-moment-id', item.id);
      card.setAttribute('data-author', item.author);
      card.setAttribute('data-visibility', item.visibility);

      // Build Status Badges
      let lifecycleBadgeHtml = '';
      if (item.visibility === 'private') {
        lifecycleBadgeHtml = `<span class="gallery-status-badge badge-private" title="Hanya dapat dilihat oleh ${escapeHtml(item.authorName)}">🔒 Arsip Pribadi</span>`;
      } else if (item.isActiveStory) {
        lifecycleBadgeHtml = `<span class="gallery-status-badge badge-active-24h" title="Tayang di Stories Sahabat selama 24 jam">⏳ Story Aktif (${item.remainingHours}j)</span>`;
      } else {
        lifecycleBadgeHtml = `<span class="gallery-status-badge badge-expired-gallery" title="Masa tayang 24 jam telah berakhir, tersimpan permanen di Gallery ${escapeHtml(item.authorName)}">📁 Gallery ${escapeHtml(item.authorName)} (24j+)</span>`;
      }

      const sharedArchiveBadgeHtml = item.isArchived
        ? `<span class="gallery-status-badge badge-shared-archive">⭐ Arsip Kita</span>`
        : '';

      // Media HTML (Image vs Video with explicit width & height for lazy-load-video-and-audio compliance)
      const mediaHtml =
        item.mediaType === 'video'
          ? `<video
               src="${item.mediaUrl}"
               class="scrapbook-photo scrapbook-video"
               controls
               playsinline
               loading="lazy"
               preload="metadata"
               width="640"
               height="480"
             ></video>
             <span class="media-type-chip">🎬 VIDEO</span>`
          : `<img
               src="${item.mediaUrl || item.photoUrl}"
               alt="${escapeHtml(item.caption || 'Story ' + item.authorName)}"
               class="scrapbook-photo"
               loading="lazy"
               width="640"
               height="480"
             />`;

      // Owner vs Viewer Controls in Card Footer
      const ownerActionsHtml = item.isOwner
        ? `
          <div class="scrapbook-owner-actions">
            <button type="button" class="btn-archive-toggle ${item.isArchived ? 'archived' : ''}" data-action="archive" title="Sematkan atau lepas dari Arsip Kita bersama">
              <span>${item.isArchived ? '★' : '☆'}</span>
              <span>${item.isArchived ? 'Arsip Kita' : 'Simpan Arsip'}</span>
            </button>
            <button type="button" class="btn-privacy-toggle ${item.visibility === 'private' ? 'is-private' : ''}" data-action="privacy" title="Ubah privasi item di Gallery Pribadimu">
              <span>${item.visibility === 'private' ? '🔒 Privat' : '🌐 Sahabat'}</span>
            </button>
            <button type="button" class="btn-delete-moment" data-action="delete" title="Hapus dari Gallery Pribadimu" aria-label="Hapus momen">
              <span>🗑️</span>
            </button>
          </div>
        `
        : `
          <div class="scrapbook-readonly-owner-tag" title="Hanya ${escapeHtml(item.authorName)} yang dapat mengubah atau menghapus konten ini">
            <span>Gallery ${escapeHtml(item.authorName)} ${item.authorSymbol || ''}</span>
          </div>
        `;

      card.innerHTML = `
        <div class="scrapbook-pin-ornament">✦</div>

        <div class="scrapbook-author-row">
          <div class="author-profile-info">
            <img src="${item.authorAvatar}" alt="${escapeHtml(item.authorName)}" class="author-mini-avatar" />
            <div class="author-meta-text">
              <span class="author-name-tag">${escapeHtml(item.authorName)} ${item.authorSymbol || ''}</span>
              <span class="author-location-tag">📍 ${escapeHtml(item.location || 'Our Little Universe')}</span>
            </div>
          </div>
          <div class="scrapbook-meta-right">
            <span class="scrapbook-time-tag">${escapeHtml(item.timestamp)}</span>
            <div class="scrapbook-badges-row">
              ${lifecycleBadgeHtml}
              ${sharedArchiveBadgeHtml}
            </div>
          </div>
        </div>

        <div class="scrapbook-photo-wrapper" data-action="view-media">
          ${mediaHtml}
        </div>

        <div class="scrapbook-caption-box">
          <p class="scrapbook-caption-text">${escapeHtml(item.caption || '✨ Momen tersimpan di Gallery')}</p>
        </div>

        <div class="scrapbook-footer-row">
          <div class="scrapbook-likes-group">
            <button type="button" class="btn-heart-like ${item.likedByMe ? 'liked' : ''}" data-action="like" aria-label="Sukai momen">
              <span>${item.likedByMe ? '💖' : '🤍'}</span>
            </button>
            <span class="like-count-text">${item.likes} suka</span>
          </div>
          ${ownerActionsHtml}
        </div>
      `;

      // Like Button Event
      const btnLike = card.querySelector('[data-action="like"]');
      if (btnLike) {
        btnLike.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            const updated = toggleLikeMoment(item.id, getActiveUserCharacter());
            if (updated && updated.likedByMe) {
              const rect = btnLike.getBoundingClientRect();
              if (onTriggerSparkle) onTriggerSparkle(rect.left + 15, rect.top);
            }
          } catch (err) {
            if (onShowToast) onShowToast(err.message);
          }
        });
      }

      // Archive Button Event (Owner Only)
      const btnArchive = card.querySelector('[data-action="archive"]');
      if (btnArchive) {
        btnArchive.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            const isArchived = toggleArchiveMoment(item.id, getActiveUserCharacter());
            if (onShowToast) {
              onShowToast(isArchived ? 'Disematkan ke Arsip Kita Bersama ✦' : 'Dilepas dari Arsip Kita Bersama ✧');
            }
          } catch (err) {
            if (onShowToast) onShowToast(err.message);
          }
        });
      }

      // Privacy Toggle Button Event (Owner Only)
      const btnPrivacy = card.querySelector('[data-action="privacy"]');
      if (btnPrivacy) {
        btnPrivacy.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            const nextVis = item.visibility === 'private' ? 'friends' : 'private';
            updateMomentPrivacy(item.id, nextVis, getActiveUserCharacter());
            if (onShowToast) {
              onShowToast(
                nextVis === 'private'
                  ? 'Privasi diubah ke Arsip Pribadi (Hanya kamu yang dapat melihat) 🔒'
                  : 'Privasi diubah ke Sahabat (Dapat dilihat oleh sahabat) 🌐'
              );
            }
          } catch (err) {
            if (onShowToast) onShowToast(err.message);
          }
        });
      }

      // Delete Button Event (Owner Only)
      const btnDelete = card.querySelector('[data-action="delete"]');
      if (btnDelete) {
        btnDelete.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            deleteMomentItem(item.id, getActiveUserCharacter());
            if (onShowToast) {
              onShowToast('Item berhasil dihapus dari Gallery Pribadimu ✧');
            }
          } catch (err) {
            if (onShowToast) onShowToast(err.message);
          }
        });
      }

      // Clicking Photo opens Story Viewer / Fullscreen Preview
      const photoWrap = card.querySelector('[data-action="view-media"]');
      if (photoWrap) {
        photoWrap.addEventListener('click', (e) => {
          // If clicking native video controls, let video play inline without hijacking click
          if (e.target && e.target.tagName === 'VIDEO') return;
          openGalleryItemInViewer(item);
        });
      }

      scrapbookGrid.appendChild(card);
    });
  }

  // Filter Chips Listeners
  momentsFilterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter');
      setActiveFilter(filter || 'all');
    });
  });

  // --- 4. FORM BUAT STORY & UNGGAH MOMEN (UPLOAD MODAL) ---
  function openUploadModal(defaultType = 'both') {
    resetUploadForm();
    updateUploadTypeSelection(defaultType);
    openModal(modalUploadMoment);
  }

  function resetUploadForm() {
    uploadedMediaDataUrl = null;
    uploadedMediaType = 'image';
    uploadedMimeType = 'image/jpeg';
    uploadedFileSize = 0;

    if (momentFileInput) momentFileInput.value = '';
    if (momentCaptionInput) momentCaptionInput.value = '';
    showUploadError('');

    if (uploadDropzone) uploadDropzone.classList.remove('has-preview');
    if (dropzonePrompt) dropzonePrompt.style.display = 'flex';
    if (dropzonePreview) dropzonePreview.style.display = 'none';

    if (previewImage) {
      previewImage.src = '';
      previewImage.style.display = 'none';
    }
    if (previewVideo) {
      try {
        previewVideo.pause();
      } catch (_) {}
      previewVideo.removeAttribute('src');
      previewVideo.style.display = 'none';
    }

    selectedPublicationType = 'both';
    selectedVisibility = 'friends';
    updateUploadTypeSelection('both');
  }

  function updateUploadTypeSelection(type) {
    selectedPublicationType = type || 'both';
    uploadTypeOptions.forEach((opt) => {
      const optType = opt.getAttribute('data-type');
      if (optType === selectedPublicationType) {
        opt.classList.add('active');
        selectedVisibility = opt.getAttribute('data-visibility') || 'friends';
      } else {
        opt.classList.remove('active');
      }
    });
  }

  uploadTypeOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      const t = opt.getAttribute('data-type');
      updateUploadTypeSelection(t);
    });
  });

  if (btnOpenUploadMoment) {
    btnOpenUploadMoment.addEventListener('click', () => openUploadModal('both'));
  }

  if (momentFileInput) {
    momentFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleSelectedFile(file);
      }
    });
  }

  if (uploadDropzone) {
    uploadDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btn-remove-preview') || e.target.tagName === 'VIDEO') return;
      if (momentFileInput) momentFileInput.click();
    });

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
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        handleSelectedFile(file);
      }
    });
  }

  function handleSelectedFile(file) {
    showUploadError('');
    const validation = validateStoryMediaInput({ file });
    if (!validation.valid) {
      showUploadError(validation.error);
      if (onShowToast) onShowToast(validation.error);
      if (momentFileInput) momentFileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      const errMsg = 'Gagal membaca file media. Pastikan file tidak rusak dan coba lagi.';
      showUploadError(errMsg);
      if (onShowToast) onShowToast(errMsg);
    };
    reader.onload = (event) => {
      const resultDataUrl = event.target && event.target.result;
      if (typeof resultDataUrl !== 'string' || !resultDataUrl.startsWith('data:')) {
        const errMsg = 'File tidak dapat diproses sebagai foto atau video.';
        showUploadError(errMsg);
        if (onShowToast) onShowToast(errMsg);
        return;
      }

      uploadedMediaDataUrl = resultDataUrl;
      uploadedMediaType = validation.mediaType;
      uploadedMimeType = validation.mimeType;
      uploadedFileSize = file.size || 0;

      if (uploadDropzone) uploadDropzone.classList.add('has-preview');
      if (dropzonePrompt) dropzonePrompt.style.display = 'none';
      if (dropzonePreview) dropzonePreview.style.display = 'block';

      if (uploadedMediaType === 'video') {
        if (previewImage) {
          previewImage.style.display = 'none';
          previewImage.src = '';
        }
        if (previewVideo) {
          previewVideo.src = uploadedMediaDataUrl;
          previewVideo.style.display = 'block';
        }
        if (previewMediaBadge) previewMediaBadge.textContent = '🎬 VIDEO';
      } else {
        if (previewVideo) {
          previewVideo.style.display = 'none';
          previewVideo.removeAttribute('src');
        }
        if (previewImage) {
          previewImage.src = uploadedMediaDataUrl;
          previewImage.style.display = 'block';
        }
        if (previewMediaBadge) previewMediaBadge.textContent = '📷 FOTO';
      }
    };
    reader.readAsDataURL(file);
  }

  if (btnRemovePreview) {
    btnRemovePreview.addEventListener('click', (e) => {
      e.stopPropagation();
      resetUploadForm();
    });
  }

  document.querySelectorAll('#modal-upload-moment [data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(modalUploadMoment);
      resetUploadForm();
    });
  });

  if (formUploadMoment) {
    formUploadMoment.addEventListener('submit', (e) => {
      e.preventDefault();
      showUploadError('');

      const validation = validateStoryMediaInput({
        mediaUrl: uploadedMediaDataUrl,
        mimeType: uploadedMimeType,
        sizeBytes: uploadedFileSize
      });

      if (!validation.valid) {
        showUploadError(validation.error);
        if (onShowToast) onShowToast(validation.error);
        if (uploadDropzone) {
          uploadDropzone.style.borderColor = '#ef4444';
          setTimeout(() => {
            uploadDropzone.style.borderColor = 'rgba(244, 114, 182, 0.4)';
          }, 1500);
        }
        return;
      }

      const caption = momentCaptionInput ? momentCaptionInput.value.trim() : '';
      const currentAuthor = getActiveUserCharacter();
      const char = CHARACTERS_MOMENTS[currentAuthor] || CHARACTERS_MOMENTS.nyanya;

      try {
        const created = addMoment({
          mediaUrl: uploadedMediaDataUrl,
          photoUrl: uploadedMediaDataUrl,
          mediaType: uploadedMediaType,
          mimeType: uploadedMimeType,
          sizeBytes: uploadedFileSize,
          caption,
          type: selectedPublicationType,
          visibility: selectedVisibility,
          isArchived: selectedPublicationType === 'archive',
          isStory: true,
          author: currentAuthor,
          location: `Universe ${char.universe}`
        });

        closeModal(modalUploadMoment);
        resetUploadForm();

        const statusMsg =
          created.visibility === 'private'
            ? `Konten berhasil disimpan ke Arsip Gallery Pribadi ${char.name} ${char.symbol} 🔒`
            : `Story ${char.name} ${char.symbol} berhasil diterbitkan (tayang 24 jam) & otomatis tersimpan ke Gallery ${char.name}! ✦`;

        updateStatusBanner(statusMsg, false);
        if (onShowToast) onShowToast(statusMsg);
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      } catch (err) {
        const errMsg = err.message || 'Gagal menyimpan Story.';
        showUploadError(errMsg);
        if (onShowToast) onShowToast(errMsg);
      }
    });
  }

  // --- Master Render Function ---
  function renderAll() {
    renderHeader();
    renderStoriesBar();
    renderFeed();
  }

  subscribeMoments(() => {
    renderAll();
  });

  renderAll();

  return {
    openMoments,
    closeMoments,
    renderAll,
    openStoryViewerForCharacter,
    openUploadModal,
    // Expose store API from the same module instance
    getActiveUserCharacter,
    setActiveUserCharacter,
    getActiveFilter,
    setActiveFilter,
    getStories,
    getStoriesByCharacter,
    hasActiveStories,
    hasUnseenStories,
    getMomentsFeed,
    getPersonalGallery,
    addMoment,
    toggleLikeMoment,
    toggleArchiveMoment,
    updateMomentPrivacy,
    deleteMomentItem,
    updateStoryTimestamp,
    clearAllMomentsStore,
    reloadMomentsFromStorage
  };
}
