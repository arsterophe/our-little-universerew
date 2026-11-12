/**
 * OUR LITTLE UNIVERSE — STORIES VIEW CONTROLLER
 * 
 * Manages Our Stories (Public Library), Story (Personal Writing Space),
 * rich editing, publication workflow, and Book-like Reading Mode.
 */

import {
  STORY_CATEGORIES,
  STORY_GENRES,
  COVER_THEMES,
  CHARACTERS_STORIES,
  createStory,
  updateStory,
  deleteStory,
  publishStory,
  unpublishStory,
  getPublishedStories,
  getAuthorStories,
  getStoryById,
  toggleBookmark,
  isStoryBookmarked,
  saveReadingProgress,
  getReadingProgress,
  getReadingPreferences,
  saveReadingPreferences,
  subscribeStories,
  getActiveUserCharacter,
  getActiveUserUid,
  setActiveUserCharacter,
  calculateStoryStats
} from './stories.js';

export function initStoriesView(callbacks = {}) {
  const {
    onShowToast = (msg) => console.log('Toast:', msg),
    onTriggerSparkle = () => {},
    onNavigateBack = () => {}
  } = callbacks;

  // State
  let activeTab = 'library'; // 'library' | 'workspace' | 'reading'
  let workspaceMode = 'editor'; // 'editor' | 'my-works'
  let editingStoryId = null; // null for new story
  let readingStoryId = null;
  let activeFilterCategory = 'all';
  let activeFilterGenre = 'Semua Genre';
  let activeFilterUniverse = 'all';
  let searchQuery = '';
  let activeSortBy = 'latest';
  let bookmarksOnlyFilter = false;
  let myWorksFilter = 'all'; // 'all' | 'draft' | 'published'
  let isDirty = false; // Track unsaved changes in editor
  let autosaveTimer = null;
  let previousViewId = 'view-private-universe';

  // DOM Elements
  const viewOurStories = document.getElementById('view-our-stories');
  const viewStoryWorkspace = document.getElementById('view-story-workspace');
  const viewStoryReading = document.getElementById('view-story-reading');

  // Library Elements
  const storiesHero = document.getElementById('stories-hero');
  const storiesSearchInput = document.getElementById('stories-search-input');
  const btnClearSearch = document.getElementById('btn-stories-clear-search');
  const storiesCategoryPills = document.getElementById('stories-category-pills');
  const storiesUniversePills = document.getElementById('stories-universe-pills');
  const selectStoryGenre = document.getElementById('select-story-genre');
  const selectStorySort = document.getElementById('select-story-sort');
  const btnFilterBookmarks = document.getElementById('btn-filter-bookmarks');
  const featuredStoryContainer = document.getElementById('featured-story-container');
  const storiesGrid = document.getElementById('stories-grid');
  const storiesEmptyState = document.getElementById('stories-empty-state');
  const storiesResultsCount = document.getElementById('stories-results-count');

  // Library Top Actions
  const btnStoriesBackUniverse = document.getElementById('btn-stories-back-universe');
  const btnOpenWriteSpace = document.getElementById('btn-open-write-space');
  const btnOpenMyWorks = document.getElementById('btn-open-my-works');

  // Workspace Elements
  const btnWorkspaceBack = document.getElementById('btn-workspace-back');
  const workspaceTitle = document.getElementById('workspace-title');
  const workspaceAuthorBadge = document.getElementById('workspace-author-badge');
  const workspaceStatusIndicator = document.getElementById('workspace-status-indicator');
  const btnWorkspaceTabEditor = document.getElementById('btn-workspace-tab-editor');
  const btnWorkspaceTabMyWorks = document.getElementById('btn-workspace-tab-my-works');
  const workspaceEditorPane = document.getElementById('workspace-editor-pane');
  const workspaceMyWorksPane = document.getElementById('workspace-my-works-pane');

  // Editor Form Elements
  const inputStoryTitle = document.getElementById('input-story-title');
  const inputStorySubtitle = document.getElementById('input-story-subtitle');
  const selectStoryCategory = document.getElementById('select-story-category');
  const selectStoryFormGenre = document.getElementById('select-story-form-genre');
  const themeOptionsContainer = document.getElementById('story-theme-options');
  const inputStorySynopsis = document.getElementById('input-story-synopsis');
  const editorContent = document.getElementById('story-editor-content');
  const liveWordCountBadge = document.getElementById('live-word-count-badge');
  const btnSaveDraft = document.getElementById('btn-story-save-draft');
  const btnPublishStory = document.getElementById('btn-story-publish');
  const btnDiscardChanges = document.getElementById('btn-story-discard');

  // My Works Elements
  const myWorksList = document.getElementById('my-works-list');
  const myWorksFilterButtons = document.querySelectorAll('.my-works-filter-btn');
  const btnCreateNewFromMyWorks = document.getElementById('btn-create-new-from-my-works');

  // Reading Mode Elements
  const btnReadingBack = document.getElementById('btn-reading-back');
  const readingStoryTitleHeader = document.getElementById('reading-header-title');
  const readingHeaderAuthor = document.getElementById('reading-header-author');
  const btnReadingBookmark = document.getElementById('btn-reading-bookmark');
  const btnReadingSettings = document.getElementById('btn-reading-settings');
  const readingProgressBar = document.getElementById('reading-progress-bar');
  const readingProgressText = document.getElementById('reading-progress-text');
  const readingArticleContainer = document.getElementById('reading-article-container');
  const readingSettingsPanel = document.getElementById('reading-settings-panel');
  const btnCloseReadingSettings = document.getElementById('btn-close-reading-settings');

  // Selected Cover Theme
  let selectedCoverTheme = 'starlight';

  /**
   * Helper: Get active verified author config (NEVER defaults silently to 'nyanya')
   */
  function getCurrentAuthor() {
    const activeChar = getActiveUserCharacter();
    return activeChar ? (CHARACTERS_STORIES[activeChar] || null) : null;
  }

  /**
   * Helper: Resolve story author metadata from UID/character fields cleanly
   */
  function resolveStoryAuthorDisplay(story) {
    if (!story || typeof story !== 'object') {
      return {
        id: null,
        name: 'Penulis Tidak Diketahui',
        role: 'Anggota Our Little Universe',
        avatar: '',
        universeId: '',
        universeName: '-',
        symbol: '✦'
      };
    }

    let charCfg = null;
    if (story.authorUid) {
      charCfg = Object.values(CHARACTERS_STORIES).find((c) => c.uid === story.authorUid) || null;
    }
    if (!charCfg) {
      const charKey = story.authorChar || story.authorId || story.author;
      if (charKey && CHARACTERS_STORIES[charKey]) {
        charCfg = CHARACTERS_STORIES[charKey];
      }
    }

    if (charCfg) {
      return charCfg;
    }

    return {
      id: null,
      name: story.authorName || 'Penulis Tidak Diketahui',
      role: story.authorRole || 'Anggota Our Little Universe',
      avatar: story.authorAvatar || '',
      universeId: story.universeId || '',
      universeName: story.universeName || '-',
      symbol: '✦'
    };
  }

  /**
   * Initialize and setup event handlers
   */
  function init() {
    setupCategoriesUI();
    setupGenresUI();
    setupThemeOptionsUI();
    setupEventListeners();
    setupReadingPreferencesUI();
    applyReadingPreferences(getReadingPreferences());

    // Subscribe to store updates
    subscribeStories(() => {
      if (activeTab === 'library') {
        renderLibrary();
      } else if (activeTab === 'workspace' && workspaceMode === 'my-works') {
        renderMyWorks();
      } else if (activeTab === 'reading' && readingStoryId) {
        updateReadingBookmarkButton(readingStoryId);
      }
    });
  }

  /**
   * Setup Category Pills
   */
  function setupCategoriesUI() {
    if (!storiesCategoryPills) return;
    storiesCategoryPills.innerHTML = STORY_CATEGORIES.map(
      (cat) => `
      <button type="button" class="story-filter-pill ${cat.id === activeFilterCategory ? 'active' : ''}" data-cat="${cat.id}">
        <span class="pill-icon">${cat.icon}</span>
        <span class="pill-label">${cat.label}</span>
      </button>
    `
    ).join('');

    storiesCategoryPills.querySelectorAll('.story-filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        storiesCategoryPills.querySelectorAll('.story-filter-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilterCategory = btn.getAttribute('data-cat') || 'all';
        renderLibrary();
      });
    });
  }

  /**
   * Setup Genres Dropdowns
   */
  function setupGenresUI() {
    if (selectStoryGenre) {
      selectStoryGenre.innerHTML = STORY_GENRES.map(
        (g) => `<option value="${g}">${g}</option>`
      ).join('');
      selectStoryGenre.addEventListener('change', () => {
        activeFilterGenre = selectStoryGenre.value;
        renderLibrary();
      });
    }

    if (selectStoryFormGenre) {
      // Exclude 'Semua Genre' from editor options
      const editorGenres = STORY_GENRES.filter((g) => g !== 'Semua Genre');
      selectStoryFormGenre.innerHTML = editorGenres.map(
        (g) => `<option value="${g}">${g}</option>`
      ).join('');
    }
  }

  /**
   * Setup Cover Theme Palette Selector
   */
  function setupThemeOptionsUI() {
    if (!themeOptionsContainer) return;
    themeOptionsContainer.innerHTML = COVER_THEMES.map(
      (theme) => `
      <button type="button" class="theme-swatch-btn ${theme.id === selectedCoverTheme ? 'selected' : ''}" 
              data-theme="${theme.id}" title="${theme.label}" style="background: ${theme.gradient};">
        <span class="swatch-badge">${theme.badge}</span>
      </button>
    `
    ).join('');

    themeOptionsContainer.querySelectorAll('.theme-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        themeOptionsContainer.querySelectorAll('.theme-swatch-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedCoverTheme = btn.getAttribute('data-theme') || 'starlight';
        markEditorDirty();
      });
    });
  }

  /**
   * Setup Core Event Listeners
   */
  function setupEventListeners() {
    // Search Input
    if (storiesSearchInput) {
      storiesSearchInput.addEventListener('input', () => {
        searchQuery = storiesSearchInput.value.trim();
        if (btnClearSearch) {
          btnClearSearch.classList.toggle('hidden', !searchQuery);
        }
        renderLibrary();
      });
    }

    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        if (storiesSearchInput) storiesSearchInput.value = '';
        searchQuery = '';
        btnClearSearch.classList.add('hidden');
        renderLibrary();
      });
    }

    // Universe Filter Pills
    if (storiesUniversePills) {
      storiesUniversePills.querySelectorAll('.universe-filter-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          storiesUniversePills.querySelectorAll('.universe-filter-pill').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          activeFilterUniverse = btn.getAttribute('data-univ') || 'all';
          renderLibrary();
        });
      });
    }

    // Sort Dropdown
    if (selectStorySort) {
      selectStorySort.addEventListener('change', () => {
        activeSortBy = selectStorySort.value;
        renderLibrary();
      });
    }

    // Bookmarks Filter Toggle
    if (btnFilterBookmarks) {
      btnFilterBookmarks.addEventListener('click', () => {
        bookmarksOnlyFilter = !bookmarksOnlyFilter;
        btnFilterBookmarks.classList.toggle('active', bookmarksOnlyFilter);
        renderLibrary();
      });
    }

    // Return to Universes from Our Stories
    if (btnStoriesBackUniverse) {
      btnStoriesBackUniverse.addEventListener('click', () => {
        closeOurStories();
        if (typeof onNavigateBack === 'function') {
          onNavigateBack();
        }
      });
    }

    // Open Workspace: Create New Story
    if (btnOpenWriteSpace) {
      btnOpenWriteSpace.addEventListener('click', () => {
        openWorkspace('editor');
      });
    }

    // Open Workspace: My Works
    if (btnOpenMyWorks) {
      btnOpenMyWorks.addEventListener('click', () => {
        openWorkspace('my-works');
      });
    }

    // Workspace Back Button
    if (btnWorkspaceBack) {
      btnWorkspaceBack.addEventListener('click', () => {
        if (isDirty) {
          const leave = window.confirm('Ada perubahan yang belum tersimpan. Tinggalkan editor tanpa menyimpan?');
          if (!leave) return;
        }
        openOurStories();
      });
    }

    // Workspace Tab Switching
    if (btnWorkspaceTabEditor) {
      btnWorkspaceTabEditor.addEventListener('click', () => {
        switchWorkspaceMode('editor');
      });
    }
    if (btnWorkspaceTabMyWorks) {
      btnWorkspaceTabMyWorks.addEventListener('click', () => {
        switchWorkspaceMode('my-works');
      });
    }

    // Create New Story from My Works pane
    if (btnCreateNewFromMyWorks) {
      btnCreateNewFromMyWorks.addEventListener('click', () => {
        openEditorForNewStory();
      });
    }

    // My Works Filters
    myWorksFilterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        myWorksFilterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        myWorksFilter = btn.getAttribute('data-status') || 'all';
        renderMyWorks();
      });
    });

    // Editor Form Inputs Tracking
    [inputStoryTitle, inputStorySubtitle, inputStorySynopsis, selectStoryCategory, selectStoryFormGenre].forEach(
      (el) => {
        if (el) {
          el.addEventListener('input', () => markEditorDirty());
          el.addEventListener('change', () => markEditorDirty());
        }
      }
    );

    // Rich Text Editor Toolbar Formatting Actions
    setupEditorToolbar();

    // Editor Live Stats
    if (editorContent) {
      editorContent.addEventListener('input', () => {
        updateLiveWordCount();
        markEditorDirty();
      });
    }

    // Save as Draft
    if (btnSaveDraft) {
      btnSaveDraft.addEventListener('click', () => {
        saveStoryAction('draft');
      });
    }

    // Publish to Our Stories
    if (btnPublishStory) {
      btnPublishStory.addEventListener('click', () => {
        const confirmMsg = editingStoryId
          ? 'Publikasikan pembaruan karya ini ke Our Stories agar dapat dibaca seluruh pengguna?'
          : 'Publikasikan karya ini ke Our Stories agar dapat dibaca oleh seluruh sahabat di Our Little Universe?';
        if (window.confirm(confirmMsg)) {
          saveStoryAction('published');
        }
      });
    }

    // Discard Changes
    if (btnDiscardChanges) {
      btnDiscardChanges.addEventListener('click', () => {
        if (isDirty) {
          if (!window.confirm('Batalkan perubahan dan kembali ke versi terakhir?')) return;
        }
        if (editingStoryId) {
          populateEditor(editingStoryId);
        } else {
          resetEditorForm();
        }
      });
    }

    // Reading Mode Navigation
    if (btnReadingBack) {
      btnReadingBack.addEventListener('click', () => {
        closeReadingMode();
        openOurStories();
      });
    }

    // Reading Mode Bookmark Button
    if (btnReadingBookmark) {
      btnReadingBookmark.addEventListener('click', (e) => {
        if (!readingStoryId) return;
        const res = toggleBookmark(readingStoryId, getActiveUserCharacter());
        updateReadingBookmarkButton(readingStoryId);
        onShowToast(res.isBookmarked ? '★ Karya ditambahkan ke Bookmark ✦' : 'Dihapus dari Bookmark');
        if (res.isBookmarked && onTriggerSparkle) {
          onTriggerSparkle(e.clientX, e.clientY);
        }
      });
    }

    // Reading Settings Drawer Toggle
    if (btnReadingSettings) {
      btnReadingSettings.addEventListener('click', () => {
        if (readingSettingsPanel) {
          readingSettingsPanel.classList.toggle('active');
        }
      });
    }

    if (btnCloseReadingSettings) {
      btnCloseReadingSettings.addEventListener('click', () => {
        if (readingSettingsPanel) {
          readingSettingsPanel.classList.remove('active');
        }
      });
    }

    // Scroll progress tracker inside reading article
    if (viewStoryReading) {
      viewStoryReading.addEventListener('scroll', handleReadingScroll);
    }
  }

  /**
   * Setup Editor Formatting Toolbar
   */
  function setupEditorToolbar() {
    const toolbarButtons = document.querySelectorAll('.editor-tool-btn');
    toolbarButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-cmd');
        const val = btn.getAttribute('data-val') || null;

        if (!editorContent) return;
        editorContent.focus();

        if (cmd === 'formatBlock') {
          document.execCommand(cmd, false, val);
        } else if (cmd) {
          document.execCommand(cmd, false, val);
        }

        updateLiveWordCount();
        markEditorDirty();
      });
    });
  }

  /**
   * Mark Editor as having unsaved changes
   */
  function markEditorDirty() {
    isDirty = true;
    if (workspaceStatusIndicator) {
      workspaceStatusIndicator.innerHTML = '<span class="status-dot dirty"></span> ● Perubahan belum disimpan';
    }
  }

  function setEditorSavedStatus(status = 'draft') {
    isDirty = false;
    if (workspaceStatusIndicator) {
      if (status === 'published') {
        workspaceStatusIndicator.innerHTML = '<span class="status-dot published"></span> 🌐 Terbit di Our Stories';
      } else {
        workspaceStatusIndicator.innerHTML = '<span class="status-dot draft"></span> ✦ Draft tersimpan aman';
      }
    }
  }

  /**
   * Update Live Word Count and Reading Estimate
   */
  function updateLiveWordCount() {
    if (!editorContent || !liveWordCountBadge) return;
    const content = editorContent.innerHTML || '';
    const { wordCount, readingTimeMinutes } = calculateStoryStats(content);
    liveWordCountBadge.textContent = `${wordCount} kata · ± ${readingTimeMinutes} mnt baca`;
  }

  /**
   * Open Our Stories (Public Library View)
   */
  function openOurStories(fromViewId = 'view-private-universe') {
    if (fromViewId) previousViewId = fromViewId;
    activeTab = 'library';
    
    // Hide other full views
    ['view-selection', 'view-login', 'view-private-universe', 'view-orbit', 'view-moments', 'view-photobooth', 'view-kidult-world', 'view-toyou-world', 'view-shadow-world', 'view-story-workspace', 'view-story-reading'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.setAttribute('aria-hidden', 'true');
      }
    });

    if (viewOurStories) {
      viewOurStories.classList.add('active');
      viewOurStories.setAttribute('aria-hidden', 'false');
      viewOurStories.scrollTop = 0;
    }
    renderLibrary();
  }

  function closeOurStories() {
    if (viewOurStories) {
      viewOurStories.classList.remove('active');
      viewOurStories.setAttribute('aria-hidden', 'true');
    }

    const viewKidultWorld = document.getElementById('view-kidult-world');
    const viewToYouWorld = document.getElementById('view-toyou-world');
    const viewShadowWorld = document.getElementById('view-shadow-world');
    const viewPrivateUniverse = document.getElementById('view-private-universe');

    if (previousViewId === 'view-kidult-world' && viewKidultWorld) {
      viewKidultWorld.classList.add('active');
      viewKidultWorld.setAttribute('aria-hidden', 'false');
    } else if (previousViewId === 'view-toyou-world' && viewToYouWorld) {
      viewToYouWorld.classList.add('active');
      viewToYouWorld.setAttribute('aria-hidden', 'false');
    } else if (previousViewId === 'view-shadow-world' && viewShadowWorld) {
      viewShadowWorld.classList.add('active');
      viewShadowWorld.setAttribute('aria-hidden', 'false');
    } else {
      if (viewPrivateUniverse) {
        viewPrivateUniverse.classList.add('active');
        viewPrivateUniverse.setAttribute('aria-hidden', 'false');
      }
      const navButtons = document.querySelectorAll('.univ-nav-btn');
      navButtons.forEach(b => b.classList.remove('active'));
      const btnUniv = document.getElementById('nav-btn-universes');
      if (btnUniv) btnUniv.classList.add('active');
    }

    if (onShowToast) onShowToast('🌌 Kembali ke Universe ✦');
  }

  /**
   * Hide all Story views
   */
  function hideAllStoryViews() {
    [viewOurStories, viewStoryWorkspace, viewStoryReading].forEach((el) => {
      if (el) {
        el.classList.remove('active');
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /**
   * Render Public Library: Featured story + Grid + Empty state
   */
  function renderLibrary() {
    if (!storiesGrid) return;

    const currentAuthor = getCurrentAuthor();
    if (!currentAuthor) {
      if (featuredStoryContainer) featuredStoryContainer.innerHTML = '';
      storiesGrid.innerHTML = '';
      if (storiesResultsCount) storiesResultsCount.textContent = '0 karya ditemukan';
      if (storiesEmptyState) {
        storiesEmptyState.classList.remove('hidden');
        const emptyTitle = storiesEmptyState.querySelector('.empty-title');
        const emptyDesc = storiesEmptyState.querySelector('.empty-desc');
        if (emptyTitle) emptyTitle.textContent = 'Sesi Akun Belum Aktif ✦';
        if (emptyDesc) emptyDesc.textContent = 'Silakan login menggunakan akun karaktermu untuk melihat koleksi Our Stories pribadimu.';
      }
      return;
    }

    const published = getPublishedStories({
      actor: currentAuthor.id,
      uid: getActiveUserUid(),
      category: activeFilterCategory,
      genre: activeFilterGenre,
      universe: activeFilterUniverse,
      searchQuery: searchQuery,
      sortBy: activeSortBy,
      bookmarksOnly: bookmarksOnlyFilter
    });

    // Update Result count
    if (storiesResultsCount) {
      storiesResultsCount.textContent = `${published.length} karya ditemukan`;
    }

    // Empty state handling
    if (published.length === 0) {
      if (featuredStoryContainer) featuredStoryContainer.innerHTML = '';
      storiesGrid.innerHTML = '';
      if (storiesEmptyState) {
        storiesEmptyState.classList.remove('hidden');
        const emptyTitle = storiesEmptyState.querySelector('.empty-title');
        const emptyDesc = storiesEmptyState.querySelector('.empty-desc');
        if (bookmarksOnlyFilter) {
          if (emptyTitle) emptyTitle.textContent = 'Belum Ada Bookmark Tersimpan ✦';
          if (emptyDesc) emptyDesc.textContent = 'Tandai karya favoritmu dengan ikon bintang untuk membacanya kembali nanti.';
        } else if (searchQuery) {
          if (emptyTitle) emptyTitle.textContent = `Tidak ada hasil untuk "${searchQuery}"`;
          if (emptyDesc) emptyDesc.textContent = 'Coba kata kunci lain atau ubah filter kategori dan genre.';
        } else {
          if (emptyTitle) emptyTitle.textContent = 'Lembaran Cerita Masih Menanti Ditulis ✦';
          if (emptyDesc) emptyDesc.textContent = 'Belum ada karya yang dipublikasikan di Our Stories. Jadilah yang pertama menulis karya sastra dan membagikannya ke seluruh sahabat!';
        }
      }
      return;
    }

    if (storiesEmptyState) {
      storiesEmptyState.classList.add('hidden');
    }

    // Render Featured Story (First story if no search/filter active, or top item)
    if (featuredStoryContainer) {
      if (!searchQuery && activeFilterCategory === 'all' && activeFilterGenre === 'Semua Genre' && !bookmarksOnlyFilter && published.length > 0) {
        const feat = published[0];
        const featAuthor = resolveStoryAuthorDisplay(feat);
        const theme = COVER_THEMES.find((t) => t.id === feat.coverTheme) || COVER_THEMES[0];
        const isBkm = isStoryBookmarked(feat.id, getActiveUserCharacter());

        featuredStoryContainer.innerHTML = `
          <div class="featured-story-banner" style="--cover-gradient: ${theme.gradient};">
            <div class="featured-cover-visual" style="background: ${theme.gradient};">
              <span class="featured-universe-badge">${featAuthor.universeName} ${theme.badge}</span>
              <div class="featured-book-spine"></div>
              <div class="featured-book-title-overlay">
                <h3>${escapeHtml(feat.title)}</h3>
                <p class="feat-author-line">${escapeHtml(featAuthor.name)}</p>
              </div>
            </div>
            <div class="featured-details">
              <div class="featured-pill-row">
                <span class="story-category-tag">${getCategoryLabel(feat.category)}</span>
                <span class="story-genre-tag">${escapeHtml(feat.genre)}</span>
                <span class="story-reading-time">⏱️ ±${feat.readingTimeMinutes} mnt baca</span>
              </div>
              <h2 class="featured-title">${escapeHtml(feat.title)}</h2>
              ${feat.subtitle ? `<p class="featured-subtitle">${escapeHtml(feat.subtitle)}</p>` : ''}
              <p class="featured-synopsis">${escapeHtml(feat.synopsis || 'Sebuah karya sastra istimewa yang dipersembahkan untuk sahabat Our Little Universe.')}</p>
              
              <div class="featured-author-meta">
                <img src="${featAuthor.avatar}" alt="${escapeHtml(featAuthor.name)}" class="author-avatar-sm" />
                <div class="author-info-col">
                  <span class="author-name">${escapeHtml(featAuthor.name)}</span>
                  <span class="author-universe-tag">${featAuthor.universeName} · ${escapeHtml(featAuthor.role)}</span>
                </div>
              </div>

              <div class="featured-actions-row">
                <button type="button" class="btn-read-primary" data-story-id="${feat.id}">
                  <span>Mulai Membaca</span>
                  <span class="btn-arrow">→</span>
                </button>
                <button type="button" class="btn-bookmark-action ${isBkm ? 'active' : ''}" data-story-id="${feat.id}" title="Bookmark karya">
                  <span>${isBkm ? '★ Tersimpan' : '☆ Simpan'}</span>
                </button>
              </div>
            </div>
          </div>
        `;

        featuredStoryContainer.querySelector('.btn-read-primary')?.addEventListener('click', () => {
          openReadingMode(feat.id);
        });

        featuredStoryContainer.querySelector('.btn-bookmark-action')?.addEventListener('click', (e) => {
          const res = toggleBookmark(feat.id, getActiveUserCharacter());
          onShowToast(res.isBookmarked ? '★ Ditambahkan ke Bookmark' : 'Dihapus dari Bookmark');
          renderLibrary();
        });
      } else {
        featuredStoryContainer.innerHTML = '';
      }
    }

    // Render Story Cards Grid
    storiesGrid.innerHTML = published.map((story) => {
      const cardAuthor = resolveStoryAuthorDisplay(story);
      const theme = COVER_THEMES.find((t) => t.id === story.coverTheme) || COVER_THEMES[0];
      const isBkm = isStoryBookmarked(story.id, getActiveUserCharacter());
      const progress = getReadingProgress(story.id, getActiveUserCharacter());

      return `
        <article class="story-card" data-story-id="${story.id}">
          <div class="story-card-cover" style="background: ${theme.gradient};">
            <div class="cover-badge-top">
              <span class="univ-tag ${cardAuthor.universeId}">${cardAuthor.universeName} ${theme.badge}</span>
              <button type="button" class="btn-card-bookmark ${isBkm ? 'active' : ''}" data-story-id="${story.id}" title="Bookmark karya">
                ${isBkm ? '★' : '☆'}
              </button>
            </div>
            <div class="cover-center-content">
              <span class="cover-category-badge">${getCategoryLabel(story.category)}</span>
              <h3 class="cover-title">${escapeHtml(story.title)}</h3>
              ${story.subtitle ? `<p class="cover-subtitle">${escapeHtml(story.subtitle)}</p>` : ''}
            </div>
            ${progress.percent > 0 ? `
              <div class="card-progress-bar-wrap" title="Progress: ${progress.percent}%">
                <div class="card-progress-fill" style="width: ${progress.percent}%;"></div>
              </div>
            ` : ''}
          </div>

          <div class="story-card-body">
            <div class="card-meta-line">
              <span class="card-genre">${escapeHtml(story.genre)}</span>
              <span class="card-read-time">⏱️ ${story.readingTimeMinutes} mnt baca</span>
            </div>
            <h4 class="card-title-text">${escapeHtml(story.title)}</h4>
            <p class="card-synopsis-text">${escapeHtml(story.synopsis || 'Karya sastra dari universe ' + cardAuthor.universeName)}</p>

            <div class="card-footer-author">
              <div class="author-inline">
                <img src="${cardAuthor.avatar}" alt="${escapeHtml(cardAuthor.name)}" class="author-avatar-xs" />
                <span class="author-name-text">${escapeHtml(cardAuthor.name)}</span>
              </div>
              <button type="button" class="btn-card-read" data-story-id="${story.id}">
                <span>Baca</span> ✦
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card click handlers
    storiesGrid.querySelectorAll('.btn-card-read, .story-card-cover').forEach((el) => {
      el.addEventListener('click', (e) => {
        // Prevent trigger if bookmark clicked
        if (e.target.closest('.btn-card-bookmark')) return;
        const storyId = el.closest('.story-card').getAttribute('data-story-id');
        if (storyId) openReadingMode(storyId);
      });
    });

    storiesGrid.querySelectorAll('.btn-card-bookmark').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const storyId = btn.getAttribute('data-story-id');
        if (!storyId) return;
        const res = toggleBookmark(storyId, getActiveUserCharacter());
        onShowToast(res.isBookmarked ? '★ Ditambahkan ke Bookmark' : 'Dihapus dari Bookmark');
        renderLibrary();
      });
    });
  }

  /**
   * Helper: Category labels with symbols
   */
  function getCategoryLabel(catId) {
    const cat = STORY_CATEGORIES.find((c) => c.id === catId);
    return cat ? `${cat.icon} ${cat.label}` : '📖 Karya';
  }

  /**
   * Open Personal Writing Space / Workspace
   */
  function openWorkspace(mode = 'editor', storyId = null, fromViewId = null) {
    const author = getCurrentAuthor();
    if (!author) {
      onShowToast('⚠️ Identitas akun belum terverifikasi. Silakan login terlebih dahulu.');
      return;
    }

    if (fromViewId) previousViewId = fromViewId;
    activeTab = 'workspace';
    workspaceMode = mode;
    editingStoryId = storyId;

    ['view-selection', 'view-login', 'view-private-universe', 'view-orbit', 'view-moments', 'view-photobooth', 'view-kidult-world', 'view-toyou-world', 'view-shadow-world', 'view-our-stories', 'view-story-reading'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.setAttribute('aria-hidden', 'true');
      }
    });

    if (viewStoryWorkspace) {
      viewStoryWorkspace.classList.add('active');
      viewStoryWorkspace.setAttribute('aria-hidden', 'false');
      viewStoryWorkspace.scrollTop = 0;
    }

    if (workspaceAuthorBadge) {
      workspaceAuthorBadge.innerHTML = `
        <img src="${author.avatar}" alt="${author.name}" class="author-avatar-sm" />
        <div>
          <strong>${author.name} (${author.symbol})</strong>
          <span>Ruang Menulis Universe ${author.universeName}</span>
        </div>
      `;
    }

    if (storyId) {
      populateEditor(storyId);
      switchWorkspaceMode('editor');
    } else if (mode === 'editor') {
      openEditorForNewStory();
    } else {
      switchWorkspaceMode('my-works');
    }
  }

  /**
   * Switch between Editor and My Works
   */
  function switchWorkspaceMode(mode) {
    workspaceMode = mode;
    if (btnWorkspaceTabEditor) btnWorkspaceTabEditor.classList.toggle('active', mode === 'editor');
    if (btnWorkspaceTabMyWorks) btnWorkspaceTabMyWorks.classList.toggle('active', mode === 'my-works');

    if (workspaceEditorPane) workspaceEditorPane.classList.toggle('hidden', mode !== 'editor');
    if (workspaceMyWorksPane) workspaceMyWorksPane.classList.toggle('hidden', mode !== 'my-works');

    if (mode === 'my-works') {
      renderMyWorks();
    }
  }

  /**
   * Reset editor form for writing a new story
   */
  function openEditorForNewStory() {
    editingStoryId = null;
    resetEditorForm();
    switchWorkspaceMode('editor');
    if (workspaceTitle) workspaceTitle.textContent = 'Tulis Karya Baru ✦';
    setEditorSavedStatus('draft');
    if (inputStoryTitle) inputStoryTitle.focus();
  }

  /**
   * Reset editor form fields
   */
  function resetEditorForm() {
    if (inputStoryTitle) inputStoryTitle.value = '';
    if (inputStorySubtitle) inputStorySubtitle.value = '';
    if (inputStorySynopsis) inputStorySynopsis.value = '';
    if (selectStoryCategory) selectStoryCategory.value = 'cerpen';
    if (selectStoryFormGenre) selectStoryFormGenre.value = 'Fantasi Kosmik';
    if (editorContent) editorContent.innerHTML = '<p>Mulai menuliskan kisahmu di sini...</p>';
    selectedCoverTheme = 'starlight';
    setupThemeOptionsUI();
    updateLiveWordCount();
    isDirty = false;
  }

  /**
   * Populate Editor with an existing story
   */
  function populateEditor(storyId) {
    const story = getStoryById(storyId, getActiveUserCharacter());
    if (!story) {
      onShowToast('⚠️ Karya tidak ditemukan atau akses tidak diizinkan.');
      openWorkspace('my-works');
      return;
    }

    editingStoryId = story.id;
    if (workspaceTitle) workspaceTitle.textContent = `Edit Karya: ${story.title}`;

    if (inputStoryTitle) inputStoryTitle.value = story.title;
    if (inputStorySubtitle) inputStorySubtitle.value = story.subtitle || '';
    if (inputStorySynopsis) inputStorySynopsis.value = story.synopsis || '';
    if (selectStoryCategory) selectStoryCategory.value = story.category;
    if (selectStoryFormGenre) selectStoryFormGenre.value = story.genre;

    selectedCoverTheme = story.coverTheme || 'starlight';
    setupThemeOptionsUI();

    if (editorContent) {
      editorContent.innerHTML = story.content || '';
    }

    updateLiveWordCount();
    setEditorSavedStatus(story.status);
    isDirty = false;
  }

  /**
   * Save Story (Draft or Publish)
   */
  function saveStoryAction(targetStatus = 'draft') {
    const activeAuthor = getCurrentAuthor();
    if (!activeAuthor) {
      onShowToast('⚠️ Identitas akun belum terverifikasi. Silakan login terlebih dahulu.');
      return;
    }

    const title = inputStoryTitle ? inputStoryTitle.value.trim() : '';
    const content = editorContent ? editorContent.innerHTML.trim() : '';

    if (!title) {
      onShowToast('⚠️ Silakan masukkan judul karya terlebih dahulu.');
      inputStoryTitle?.focus();
      return;
    }

    if (!content || content === '<p><br></p>' || content === '<p>Mulai menuliskan kisahmu di sini...</p>') {
      onShowToast('⚠️ Isi tulisan karya belum boleh kosong.');
      editorContent?.focus();
      return;
    }

    const payload = {
      title: title,
      subtitle: inputStorySubtitle ? inputStorySubtitle.value.trim() : '',
      synopsis: inputStorySynopsis ? inputStorySynopsis.value.trim() : '',
      category: selectStoryCategory ? selectStoryCategory.value : 'cerpen',
      genre: selectStoryFormGenre ? selectStoryFormGenre.value : 'Fantasi Kosmik',
      coverTheme: selectedCoverTheme,
      content: content,
      status: targetStatus,
      actor: activeAuthor.id
    };

    if (editingStoryId) {
      const res = updateStory(editingStoryId, payload, activeAuthor.id);
      if (res.success) {
        if (res.cloudPromise && typeof res.cloudPromise.catch === 'function') {
          res.cloudPromise.catch((err) => {
            onShowToast(`⚠️ Gagal menyinkronkan ke Cloud: ${err?.message || 'Error'}`);
          });
        }
        setEditorSavedStatus(targetStatus);
        onShowToast(
          targetStatus === 'published'
            ? '✨ Karya berhasil diperbarui dan dipublikasikan ke Our Stories!'
            : '💾 Draft karya berhasil diperbarui.'
        );
      } else {
        onShowToast(`⚠️ ${res.error}`);
      }
    } else {
      const res = createStory(payload);
      if (res.success) {
        if (res.cloudPromise && typeof res.cloudPromise.catch === 'function') {
          res.cloudPromise.catch((err) => {
            onShowToast(`⚠️ Gagal menyinkronkan ke Cloud: ${err?.message || 'Error'}`);
          });
        }
        editingStoryId = res.story.id;
        setEditorSavedStatus(targetStatus);
        onShowToast(
          targetStatus === 'published'
            ? '✨ Selamat! Karyamu resmi dipublikasikan ke Our Stories ✦'
            : '💾 Karya berhasil disimpan ke Ruang Draft pribadimu.'
        );
      } else {
        onShowToast(`⚠️ ${res.error}`);
      }
    }
  }

  /**
   * Render My Works Pane (Author's drafts and published works)
   */
  function renderMyWorks() {
    if (!myWorksList) return;

    const myStories = getAuthorStories(getActiveUserCharacter(), myWorksFilter);

    if (myStories.length === 0) {
      myWorksList.innerHTML = `
        <div class="my-works-empty">
          <span class="empty-icon">📝</span>
          <h4>Belum Ada Karya ${myWorksFilter !== 'all' ? `berstatus ${myWorksFilter}` : ''}</h4>
          <p>Mulai goreskan ide dan ceritamu di ruang menulis pribadi ini.</p>
          <button type="button" class="btn-create-work-cta" id="btn-empty-start-writing">
            ✍️ Tulis Karya Baru
          </button>
        </div>
      `;
      myWorksList.querySelector('#btn-empty-start-writing')?.addEventListener('click', () => {
        openEditorForNewStory();
      });
      return;
    }

    myWorksList.innerHTML = myStories.map((story) => {
      const theme = COVER_THEMES.find((t) => t.id === story.coverTheme) || COVER_THEMES[0];
      const isPublished = story.status === 'published';

      return `
        <div class="my-work-item-card" data-story-id="${story.id}">
          <div class="my-work-cover-thumb" style="background: ${theme.gradient};">
            <span class="thumb-badge">${theme.badge}</span>
          </div>

          <div class="my-work-details">
            <div class="my-work-status-row">
              <span class="status-badge ${story.status}">
                ${isPublished ? '🌐 Dipublikasikan' : '📝 Draft Pribadi'}
              </span>
              <span class="category-badge-pill">${getCategoryLabel(story.category)}</span>
              <span class="genre-text">${escapeHtml(story.genre)}</span>
            </div>

            <h3 class="my-work-title">${escapeHtml(story.title)}</h3>
            ${story.subtitle ? `<p class="my-work-subtitle">${escapeHtml(story.subtitle)}</p>` : ''}

            <div class="my-work-stats">
              <span>📊 ${story.wordCount} kata</span>
              <span>⏱️ ±${story.readingTimeMinutes} mnt baca</span>
              <span>📅 Update: ${formatDate(story.updatedAt)}</span>
            </div>
          </div>

          <div class="my-work-actions">
            <button type="button" class="btn-action-edit" data-story-id="${story.id}">
              ✏️ Edit
            </button>
            ${isPublished ? `
              <button type="button" class="btn-action-unpublish" data-story-id="${story.id}" title="Tarik dari Our Stories">
                📥 Unpublish
              </button>
            ` : `
              <button type="button" class="btn-action-publish" data-story-id="${story.id}" title="Publikasikan ke Our Stories">
                🚀 Publish
              </button>
            `}
            <button type="button" class="btn-action-delete" data-story-id="${story.id}" title="Hapus karya">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach actions
    myWorksList.querySelectorAll('.btn-action-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-story-id');
        if (id) {
          populateEditor(id);
          switchWorkspaceMode('editor');
        }
      });
    });

    myWorksList.querySelectorAll('.btn-action-publish').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-story-id');
        if (window.confirm('Publikasikan karya ini ke Our Stories agar dapat dibaca semua pengguna?')) {
          const res = publishStory(id, getActiveUserCharacter());
          if (res.success) {
            onShowToast('✨ Karya berhasil dipublikasikan ke Our Stories!');
            renderMyWorks();
          } else {
            onShowToast(`⚠️ ${res.error}`);
          }
        }
      });
    });

    myWorksList.querySelectorAll('.btn-action-unpublish').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-story-id');
        if (window.confirm('Tarik publikasi karya ini? Karya akan kembali menjadi draft pribadi dan tidak lagi terlihat di Our Stories.')) {
          const res = unpublishStory(id, getActiveUserCharacter());
          if (res.success) {
            onShowToast('📥 Karya ditarik kembali ke draft pribadi.');
            renderMyWorks();
          } else {
            onShowToast(`⚠️ ${res.error}`);
          }
        }
      });
    });

    myWorksList.querySelectorAll('.btn-action-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-story-id');
        if (window.confirm('Hapus karya ini secara permanen? Tindakan ini tidak dapat dibatalkan.')) {
          const res = deleteStory(id, getActiveUserCharacter());
          if (res.success) {
            onShowToast('🗑️ Karya berhasil dihapus.');
            renderMyWorks();
          } else {
            onShowToast(`⚠️ ${res.error}`);
          }
        }
      });
    });
  }

  /**
   * Open Reading Mode for a story
   */
  function openReadingMode(storyId) {
    const story = getStoryById(storyId, getActiveUserCharacter());
    if (!story) {
      onShowToast('⚠️ Karya tidak ditemukan atau tidak tersedia untuk dibaca.');
      return;
    }

    readingStoryId = story.id;
    activeTab = 'reading';

    ['view-selection', 'view-login', 'view-private-universe', 'view-orbit', 'view-moments', 'view-photobooth', 'view-kidult-world', 'view-toyou-world', 'view-shadow-world', 'view-our-stories', 'view-story-workspace'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.setAttribute('aria-hidden', 'true');
      }
    });

    if (viewStoryReading) {
      viewStoryReading.classList.add('active');
      viewStoryReading.setAttribute('aria-hidden', 'false');
      viewStoryReading.scrollTop = 0;
    }

    // Top Header info
    const headerAuthor = resolveStoryAuthorDisplay(story);
    if (readingStoryTitleHeader) readingStoryTitleHeader.textContent = story.title;
    if (readingHeaderAuthor) readingHeaderAuthor.textContent = `${headerAuthor.name} (${headerAuthor.universeName})`;
    if (readingProgressBar) readingProgressBar.style.width = '0%';
    if (readingProgressText) readingProgressText.textContent = '0%';
    updateReadingBookmarkButton(story.id);

    // Render Article Body
    renderReadingArticle(story);

    // Restore Reading Progress if previously saved
    const savedProgress = getReadingProgress(story.id, getActiveUserCharacter());
    if (savedProgress && savedProgress.percent > 0) {
      if (readingProgressBar) readingProgressBar.style.width = `${savedProgress.percent}%`;
      if (readingProgressText) readingProgressText.textContent = `${savedProgress.percent}%`;
    }
    if (savedProgress && savedProgress.percent > 5 && savedProgress.scrollRatio > 0) {
      setTimeout(() => {
        if (viewStoryReading && viewStoryReading.scrollHeight > 0) {
          viewStoryReading.scrollTop = savedProgress.scrollRatio * (viewStoryReading.scrollHeight - viewStoryReading.clientHeight);
          onShowToast(`Melanjutkan membaca dari posisi sebelumnya (${savedProgress.percent}%) 📖`);
        }
      }, 350);
    }
  }

  function closeReadingMode() {
    if (viewStoryReading) {
      viewStoryReading.classList.remove('active');
      viewStoryReading.setAttribute('aria-hidden', 'true');
    }
    readingStoryId = null;
  }

  /**
   * Render Reading Article Content
   */
  function renderReadingArticle(story) {
    if (!readingArticleContainer) return;

    const theme = COVER_THEMES.find((t) => t.id === story.coverTheme) || COVER_THEMES[0];
    const author = resolveStoryAuthorDisplay(story);

    readingArticleContainer.innerHTML = `
      <header class="reader-header-editorial">
        <div class="reader-badge-universe">
          <span class="univ-symbol">${author.symbol}</span>
          <span>UNIVERSE ${author.universeName}</span>
          <span class="dot-sep">·</span>
          <span>${getCategoryLabel(story.category)}</span>
          <span class="dot-sep">·</span>
          <span>${escapeHtml(story.genre)}</span>
        </div>

        <h1 class="reader-story-title">${escapeHtml(story.title)}</h1>
        ${story.subtitle ? `<h2 class="reader-story-subtitle">${escapeHtml(story.subtitle)}</h2>` : ''}

        <div class="reader-author-byline">
          <img src="${author.avatar}" alt="${author.name}" class="reader-author-avatar" />
          <div class="reader-author-text">
            <span class="reader-author-name">${escapeHtml(author.name)}</span>
            <span class="reader-author-role">${escapeHtml(author.role)}</span>
          </div>
          <div class="reader-meta-right">
            <span>⏱️ ±${story.readingTimeMinutes} menit baca</span>
            <span>📅 ${formatDate(story.publishedAt || story.createdAt)}</span>
          </div>
        </div>

        ${story.synopsis ? `
          <blockquote class="reader-synopsis-quote">
            <span class="quote-mark">“</span>
            <p>${escapeHtml(story.synopsis)}</p>
          </blockquote>
        ` : ''}

        <div class="reader-divider-line">
          <span class="divider-gem">✦</span>
        </div>
      </header>

      <main class="reader-story-body" id="reader-story-body">
        ${story.content}
      </main>

      <footer class="reader-story-footer">
        <div class="story-end-ornament">
          <span>✦</span> · · <span>✧</span> · · <span>✦</span>
          <p class="end-tagline">Akhir dari karya</p>
        </div>

        <div class="reader-author-biocard">
          <img src="${author.avatar}" alt="${author.name}" class="biocard-avatar" />
          <div class="biocard-details">
            <span class="biocard-role-tag">${author.universeName} · ${author.role}</span>
            <h3>${author.name}</h3>
            <p class="biocard-universe-quote">"Di bawah langit yang sama, kata-kata adalah bintang yang menuntun kita saling menemukan."</p>
          </div>
        </div>

        <div class="reader-footer-actions">
          <button type="button" class="btn-footer-back-library" id="btn-footer-back">
            ← Kembali ke Our Stories
          </button>
        </div>
      </footer>
    `;

    readingArticleContainer.querySelector('#btn-footer-back')?.addEventListener('click', () => {
      closeReadingMode();
      openOurStories();
    });
  }

  /**
   * Track Reading Scroll Progress
   */
  function handleReadingScroll() {
    if (!viewStoryReading || !readingStoryId) return;

    const scrollTop = viewStoryReading.scrollTop;
    const scrollHeight = viewStoryReading.scrollHeight - viewStoryReading.clientHeight;

    if (scrollHeight <= 0) return;

    const progressRatio = Math.min(1, Math.max(0, scrollTop / scrollHeight));
    const percent = Math.round(progressRatio * 100);

    if (readingProgressBar) {
      readingProgressBar.style.width = `${percent}%`;
    }
    if (readingProgressText) {
      readingProgressText.textContent = `${percent}%`;
    }

    // Debounced save reading progress
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      saveReadingProgress(readingStoryId, percent, progressRatio, getActiveUserCharacter());
    }, 400);
  }

  /**
   * Update Reading Mode Bookmark Button state
   */
  function updateReadingBookmarkButton(storyId) {
    if (!btnReadingBookmark) return;
    const isBkm = isStoryBookmarked(storyId, getActiveUserCharacter());
    btnReadingBookmark.classList.toggle('active', isBkm);
    btnReadingBookmark.innerHTML = isBkm ? '★ Tersimpan' : '☆ Bookmark';
  }

  /**
   * Reading Customization Settings UI
   */
  function setupReadingPreferencesUI() {
    const prefs = getReadingPreferences();

    // Font size buttons
    document.querySelectorAll('.btn-pref-size').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-pref-size').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const size = btn.getAttribute('data-size') || 'medium';
        const updated = saveReadingPreferences({ fontSize: size });
        applyReadingPreferences(updated);
      });
    });

    // Font family buttons
    document.querySelectorAll('.btn-pref-font').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-pref-font').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const font = btn.getAttribute('data-font') || 'serif';
        const updated = saveReadingPreferences({ fontFamily: font });
        applyReadingPreferences(updated);
      });
    });

    // Line spacing buttons
    document.querySelectorAll('.btn-pref-spacing').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-pref-spacing').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const spacing = btn.getAttribute('data-spacing') || 'normal';
        const updated = saveReadingPreferences({ lineHeight: spacing });
        applyReadingPreferences(updated);
      });
    });

    // Reading measure width buttons
    document.querySelectorAll('.btn-pref-width').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-pref-width').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const width = btn.getAttribute('data-width') || 'standard';
        const updated = saveReadingPreferences({ readingWidth: width });
        applyReadingPreferences(updated);
      });
    });

    // Themes buttons (Light, Sepia, Dark)
    document.querySelectorAll('.btn-pref-theme').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-pref-theme').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const theme = btn.getAttribute('data-theme') || 'sepia';
        const updated = saveReadingPreferences({ theme: theme });
        applyReadingPreferences(updated);
      });
    });
  }

  /**
   * Apply Reading Preferences to DOM
   */
  function applyReadingPreferences(prefs) {
    if (!viewStoryReading) return;

    // Remove existing pref classes
    viewStoryReading.classList.remove(
      'read-size-small', 'read-size-medium', 'read-size-large', 'read-size-xlarge',
      'read-font-serif', 'read-font-sans', 'read-font-literary',
      'read-spacing-compact', 'read-spacing-normal', 'read-spacing-relaxed',
      'read-width-narrow', 'read-width-standard', 'read-width-wide',
      'read-theme-light', 'read-theme-sepia', 'read-theme-dark'
    );

    // Add configured classes
    viewStoryReading.classList.add(`read-size-${prefs.fontSize || 'medium'}`);
    viewStoryReading.classList.add(`read-font-${prefs.fontFamily || 'serif'}`);
    viewStoryReading.classList.add(`read-spacing-${prefs.lineHeight || 'normal'}`);
    viewStoryReading.classList.add(`read-width-${prefs.readingWidth || 'standard'}`);
    viewStoryReading.classList.add(`read-theme-${prefs.theme || 'sepia'}`);

    // Update active states on setting buttons if drawer opened
    document.querySelector(`.btn-pref-size[data-size="${prefs.fontSize}"]`)?.classList.add('active');
    document.querySelector(`.btn-pref-font[data-font="${prefs.fontFamily}"]`)?.classList.add('active');
    document.querySelector(`.btn-pref-spacing[data-spacing="${prefs.lineHeight}"]`)?.classList.add('active');
    document.querySelector(`.btn-pref-width[data-width="${prefs.readingWidth}"]`)?.classList.add('active');
    document.querySelector(`.btn-pref-theme[data-theme="${prefs.theme}"]`)?.classList.add('active');
  }

  /**
   * Format ISO date string nicely in Indonesian
   */
  function formatDate(isoStr) {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (_) {
      return isoStr;
    }
  }

  /**
   * Escape HTML to prevent XSS in text interpolations
   */
  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
  }

  // Run initialization
  init();

  return {
    openOurStories,
    closeOurStories,
    openWorkspace,
    openReadingMode,
    closeReadingMode,
    syncActiveUser: (charKey, authUser = null) => {
      const prevChar = getActiveUserCharacter();
      setActiveUserCharacter(charKey, authUser);
      const nextChar = getActiveUserCharacter();
      if (prevChar !== nextChar) {
        editingStoryId = null;
        readingStoryId = null;
        isDirty = false;
      }
      if (activeTab === 'library') {
        renderLibrary();
      } else if (activeTab === 'workspace' && workspaceMode === 'my-works') {
        renderMyWorks();
      }
    }
  };
}

