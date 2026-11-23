/**
 * THE FAIRY ATELIER CONTROLLER & VIEW MODULE
 * LALA'S UNIVERSE · TO YOU (THE EVERGLOW FAIRY)
 * =============================================================================
 * Interactive fairy fashion boutique and fashion design simulator.
 */

import {
  LALA_CANONICAL_UID,
  openAtelierIdb,
  getSketches,
  getSketchById,
  saveSketch,
  deleteSketch,
  getInspirationBoards,
  saveInspirationBoard,
  deleteInspirationBoard,
  getPortfolioDesigns,
  savePortfolioDesign,
  duplicatePortfolioDesign,
  deletePortfolioDesign,
  getLookbookOutfits,
  saveLookbookOutfit,
  toggleLookbookFavorite,
  deleteLookbookOutfit,
  getWardrobeState,
  saveWardrobeState
} from './fairy_atelier_storage.js';

import {
  WARDROBE_CATEGORIES,
  ACCESSORY_CATEGORIES,
  SEASONAL_COLLECTIONS,
  FABRIC_LIBRARY,
  MOTIF_PATTERNS,
  COLOR_PALETTES,
  WARDROBE_ITEMS,
  ACCESSORY_ITEMS,
  CROQUIS_TEMPLATES
} from './fairy_atelier_data.js';

export function initFairyAtelierView(options = {}) {
  const {
    onShowToast = (msg) => console.log('[Atelier Toast]', msg),
    onTriggerSparkle = () => {},
    onNavigateBack = () => {}
  } = options;

  let activeUid = LALA_CANONICAL_UID;
  let currentActiveTab = 'wardrobe';
  let currentDesignerSubtab = 'sketchbook';
  let activeWardrobeCat = 'dresses';
  let activeAccessoryCat = 'wings';

  // Wardrobe / Dressing State
  let currentWardrobeState = null;
  let equippedItems = {};
  let favoriteItemIds = new Set();

  // Sketchbook Drawing State
  let canvas = null;
  let ctx = null;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = 'brush'; // 'brush' | 'eraser'
  let currentBrushSize = 6;
  let currentColor = '#f472b6';
  let currentCroquis = 'croquis_fairy_standard';
  let undoStack = [];
  let redoStack = [];
  const MAX_HISTORY = 25;
  let canvasZoom = 1;

  // Inspiration Board State
  let activeBoard = null;
  let allBoards = [];

  // Mannequin State
  let mannequinConfig = {
    silhouette: 'ballgown',
    topColor: '#fbcfe8',
    skirtColor: '#f472b6',
    accentColor: '#fef08a',
    hasWings: true,
    hasCrown: true
  };

  // Portfolio & Lookbook Caches
  let portfolioList = [];
  let lookbookList = [];

  // DOM Elements
  const viewSection = document.getElementById('view-fairy-atelier');
  if (viewSection) {
    viewSection.style.display = 'none';
  }
  const btnBack = document.getElementById('btn-fairy-atelier-back');

  // Navigation tab buttons
  const tabButtons = {
    wardrobe: document.getElementById('tab-atelier-wardrobe'),
    dressing_room: document.getElementById('tab-atelier-dressing-room'),
    accessories: document.getElementById('tab-atelier-accessories'),
    designer_corner: document.getElementById('tab-atelier-designer-corner'),
    lookbook: document.getElementById('tab-atelier-lookbook'),
    seasonal: document.getElementById('tab-atelier-seasonal')
  };

  // Panels
  const panels = {
    wardrobe: document.getElementById('panel-atelier-wardrobe'),
    dressing_room: document.getElementById('panel-atelier-dressing-room'),
    accessories: document.getElementById('panel-atelier-accessories'),
    designer_corner: document.getElementById('panel-atelier-designer-corner'),
    lookbook: document.getElementById('panel-atelier-lookbook'),
    seasonal: document.getElementById('panel-atelier-seasonal')
  };

  // Designer subpanels
  const designerSubpanels = {
    sketchbook: document.getElementById('subpanel-designer-sketchbook'),
    inspiration_board: document.getElementById('subpanel-designer-board'),
    fabric_library: document.getElementById('subpanel-designer-fabrics'),
    mannequin_studio: document.getElementById('subpanel-designer-mannequin'),
    portfolio: document.getElementById('subpanel-designer-portfolio')
  };

  // ===========================================================================
  // INITIALIZATION & TAB SWITCHING
  // ===========================================================================

  async function openFairyAtelier(uid = LALA_CANONICAL_UID) {
    activeUid = uid || LALA_CANONICAL_UID;
    if (viewSection) {
      viewSection.style.setProperty('display', 'flex', 'important');
      viewSection.classList.add('active');
      viewSection.setAttribute('aria-hidden', 'false');
    }

    // Load persisted state
    await loadAtelierState();

    // Render initial active tab
    switchTab('wardrobe');

    // Trigger opening sparkle & sound/toast
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    onShowToast('👗 Selamat datang di The Fairy Atelier — Studio & Butik Mode Lala ✨');
  }

  function closeFairyAtelier() {
    if (viewSection) {
      viewSection.classList.remove('active');
      viewSection.setAttribute('aria-hidden', 'true');
      viewSection.style.setProperty('display', 'none', 'important');
    }
    if (typeof onNavigateBack === 'function') {
      onNavigateBack();
    }
  }

  function switchTab(tabKey) {
    if (!panels[tabKey]) return;
    currentActiveTab = tabKey;

    // Update Tab Buttons
    Object.keys(tabButtons).forEach(key => {
      if (tabButtons[key]) {
        tabButtons[key].classList.toggle('active', key === tabKey);
      }
    });

    // Update Panels
    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        panels[key].classList.toggle('active', key === tabKey);
      }
    });

    // Refresh content for the active panel
    if (tabKey === 'wardrobe') renderWardrobe();
    else if (tabKey === 'dressing_room') renderDressingRoom();
    else if (tabKey === 'accessories') renderAccessories();
    else if (tabKey === 'designer_corner') switchDesignerSubtab(currentDesignerSubtab);
    else if (tabKey === 'lookbook') renderLookbook();
    else if (tabKey === 'seasonal') renderSeasonalCollections();
  }

  function switchDesignerSubtab(subtabKey) {
    if (!designerSubpanels[subtabKey]) return;
    currentDesignerSubtab = subtabKey;

    // Update Subnav buttons
    document.querySelectorAll('.designer-subnav-btn').forEach(btn => {
      const target = btn.getAttribute('data-subtab');
      btn.classList.toggle('active', target === subtabKey);
    });

    // Update Subpanels
    Object.keys(designerSubpanels).forEach(key => {
      if (designerSubpanels[key]) {
        designerSubpanels[key].classList.toggle('active', key === subtabKey);
      }
    });

    if (subtabKey === 'sketchbook') initSketchbookCanvas();
    else if (subtabKey === 'inspiration_board') renderInspirationBoard();
    else if (subtabKey === 'fabric_library') renderFabricLibrary();
    else if (subtabKey === 'mannequin_studio') renderMannequinStudio();
    else if (subtabKey === 'portfolio') renderPortfolio();
  }

  async function loadAtelierState() {
    currentWardrobeState = await getWardrobeState(activeUid);
    equippedItems = { ...(currentWardrobeState.wornOutfit || {}) };
    favoriteItemIds = new Set(currentWardrobeState.favoriteItemIds || []);

    // Preload portfolio & lookbook
    portfolioList = await getPortfolioDesigns(activeUid);
    lookbookList = await getLookbookOutfits(activeUid);
    allBoards = await getInspirationBoards(activeUid);

    // Default Seed Data if fresh user
    if (portfolioList.length === 0) {
      await seedInitialPortfolio();
      portfolioList = await getPortfolioDesigns(activeUid);
    }
    if (lookbookList.length === 0) {
      await seedInitialLookbook();
      lookbookList = await getLookbookOutfits(activeUid);
    }
    if (allBoards.length === 0) {
      await seedInitialInspirationBoard();
      allBoards = await getInspirationBoards(activeUid);
    }
  }

  // ===========================================================================
  // 1. FAIRY WARDROBE
  // ===========================================================================

  function renderWardrobe() {
    const sidebar = document.getElementById('wardrobe-cat-sidebar');
    const itemsGrid = document.getElementById('wardrobe-items-grid');
    if (!sidebar || !itemsGrid) return;

    // Render category sidebar buttons
    sidebar.innerHTML = WARDROBE_CATEGORIES.map(cat => `
      <button type="button" class="wardrobe-cat-btn ${cat.id === activeWardrobeCat ? 'active' : ''}" data-cat="${cat.id}">
        <span>${cat.icon}</span>
        <span>${cat.label}</span>
      </button>
    `).join('');

    sidebar.querySelectorAll('.wardrobe-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeWardrobeCat = btn.getAttribute('data-cat');
        renderWardrobe();
      });
    });

    // Filter items
    const filteredItems = WARDROBE_ITEMS.filter(it => it.category === activeWardrobeCat);

    if (filteredItems.length === 0) {
      itemsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
          <p style="font-size: 1.5rem;">🌸</p>
          <p>Belum ada pakaian di kategori ini.</p>
        </div>
      `;
      return;
    }

    itemsGrid.innerHTML = filteredItems.map(item => {
      const isEquipped = isItemEquipped(item);
      const isFav = favoriteItemIds.has(item.id);

      return `
        <div class="wardrobe-item-card ${isEquipped ? 'equipped' : ''}" data-id="${item.id}">
          <div class="wardrobe-item-icon-box" style="background: linear-gradient(135deg, ${item.colorHex}22, #fef9c3);">
            <span>${item.previewIcon}</span>
          </div>
          <div class="wardrobe-item-name">${item.name}</div>
          <div class="wardrobe-item-desc">${item.description}</div>
          <div class="wardrobe-item-actions">
            <button type="button" class="btn-try-on" data-id="${item.id}">
              ${isEquipped ? '✓ Dipakai' : '✨ Coba'}
            </button>
            <button type="button" class="btn-fav-toggle ${isFav ? 'active' : ''}" data-id="${item.id}" title="Favorit">
              ${isFav ? '♥' : '♡'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind item actions
    itemsGrid.querySelectorAll('.btn-try-on').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = WARDROBE_ITEMS.find(it => it.id === id);
        if (item) tryOnItem(item);
      });
    });

    itemsGrid.querySelectorAll('.btn-fav-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        toggleFavorite(id);
      });
    });
  }

  function isItemEquipped(item) {
    if (item.category === 'dresses') return equippedItems.dress === item.id;
    if (item.category === 'tops') return equippedItems.top === item.id;
    if (item.category === 'skirts') return equippedItems.skirt === item.id;
    if (item.category === 'outerwear') return equippedItems.outerwear === item.id;
    if (item.category === 'cardigans') return equippedItems.cardigan === item.id;
    if (item.category === 'shoes') return equippedItems.shoes === item.id;
    if (item.category === 'fairy_outfits') return equippedItems.dress === item.id;
    return false;
  }

  function tryOnItem(item) {
    if (item.category === 'dresses' || item.category === 'fairy_outfits') {
      equippedItems.dress = item.id;
      // If dress is equipped, clear top and skirt to avoid clipping
      equippedItems.top = null;
      equippedItems.skirt = null;
    } else if (item.category === 'tops') {
      equippedItems.top = item.id;
      equippedItems.dress = null;
    } else if (item.category === 'skirts') {
      equippedItems.skirt = item.id;
      equippedItems.dress = null;
    } else if (item.category === 'outerwear') {
      equippedItems.outerwear = item.id;
    } else if (item.category === 'cardigans') {
      equippedItems.cardigan = item.id;
    } else if (item.category === 'shoes') {
      equippedItems.shoes = item.id;
    }

    renderWardrobe();
    renderDressingRoom();
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    onShowToast(`✨ Mencoba ${item.name}!`);
  }

  async function toggleFavorite(itemId) {
    if (favoriteItemIds.has(itemId)) {
      favoriteItemIds.delete(itemId);
      onShowToast('Dihapus dari outfit favorit.');
    } else {
      favoriteItemIds.add(itemId);
      onShowToast('♥ Ditandai sebagai favorit!');
    }
    await saveWardrobeState({
      wornOutfit: equippedItems,
      favoriteItemIds: Array.from(favoriteItemIds)
    }, activeUid);
    renderWardrobe();
  }

  // ===========================================================================
  // 2. MAGIC DRESSING ROOM
  // ===========================================================================

  function renderDressingRoom() {
    const slotsCard = document.getElementById('dressing-slots-list');
    const badgeWrap = document.getElementById('dressing-active-badges');
    if (!slotsCard || !badgeWrap) return;

    // Helper to find item name
    const allItems = [...WARDROBE_ITEMS, ...ACCESSORY_ITEMS];
    const getItemName = (id) => {
      if (!id) return '<span style="color:#94a3b8; font-style:italic;">Kosong</span>';
      const it = allItems.find(x => x.id === id);
      return it ? it.name : id;
    };

    // Render Slots List
    slotsCard.innerHTML = `
      <div class="slot-row">
        <span class="slot-label">👗 Dress / Gown:</span>
        <span class="slot-current-item">${getItemName(equippedItems.dress)}</span>
      </div>
      <div class="slot-row">
        <span class="slot-label">👚 Top:</span>
        <span class="slot-current-item">${getItemName(equippedItems.top)}</span>
      </div>
      <div class="slot-row">
        <span class="slot-label">🩳 Skirt:</span>
        <span class="slot-current-item">${getItemName(equippedItems.skirt)}</span>
      </div>
      <div class="slot-row">
        <span class="slot-label">🧶 Cardigan:</span>
        <span class="slot-current-item">${getItemName(equippedItems.cardigan)}</span>
      </div>
      <div class="slot-row">
        <span class="slot-label">🩰 Shoes:</span>
        <span class="slot-current-item">${getItemName(equippedItems.shoes)}</span>
      </div>
      <div class="slot-row">
        <span class="slot-label">🧚‍♀️ Wings:</span>
        <span class="slot-current-item">${getItemName(equippedItems.wings)}</span>
      </div>
      <div class="slot-row">
        <span class="slot-label">👑 Crown:</span>
        <span class="slot-current-item">${getItemName(equippedItems.flowerCrown)}</span>
      </div>
      <div class="slot-row">
        <span class="slot-label">🎀 Hair Accent:</span>
        <span class="slot-current-item">${getItemName(equippedItems.hairAccessory)}</span>
      </div>
      <div class="slot-row">
        <span class="slot-label">💎 Jewelry:</span>
        <span class="slot-current-item">${getItemName(equippedItems.earrings)} & ${getItemName(equippedItems.necklace)}</span>
      </div>
    `;

    // Render Active Badges on Mirror
    const activeBadgeList = Object.entries(equippedItems)
      .filter(([_, id]) => Boolean(id))
      .map(([slot, id]) => {
        const it = allItems.find(x => x.id === id);
        return it ? `<span class="outfit-badge-pill">${it.previewIcon || '✨'} ${it.name}</span>` : '';
      }).join('');

    badgeWrap.innerHTML = activeBadgeList;

    // Dressing Action Buttons
    const btnApply = document.getElementById('btn-dressing-apply');
    const btnSaveLookbook = document.getElementById('btn-dressing-save-lookbook');
    const btnReset = document.getElementById('btn-dressing-reset');

    if (btnApply) {
      btnApply.onclick = async () => {
        await saveWardrobeState({
          wornOutfit: equippedItems,
          favoriteItemIds: Array.from(favoriteItemIds)
        }, activeUid);
        onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        onShowToast('🌸 Outfit berhasil diterapkan pada Lala! ✨');
      };
    }

    if (btnSaveLookbook) {
      btnSaveLookbook.onclick = () => {
        openSaveLookbookModal();
      };
    }

    if (btnReset) {
      btnReset.onclick = async () => {
        equippedItems = {
          dress: 'dress_spring_morning',
          top: null,
          skirt: null,
          outerwear: null,
          cardigan: 'cardigan_blossom_knit',
          shoes: 'shoes_fairy_slippers',
          wings: 'wings_gossamer_gold',
          hairAccessory: 'hair_buttercup_ribbon',
          flowerCrown: 'crown_cherry_blossom',
          earrings: 'earrings_pearl_dew',
          necklace: 'necklace_fairy_pendant',
          bag: 'bag_petal_pouch',
          magicalItem: 'item_starlight_prism'
        };
        await saveWardrobeState({
          wornOutfit: equippedItems,
          favoriteItemIds: Array.from(favoriteItemIds)
        }, activeUid);
        renderDressingRoom();
        onShowToast('↺ Outfit dikembalikan ke busana khas peri Lala.');
      };
    }
  }

  // ===========================================================================
  // 3. WINGS & ACCESSORIES
  // ===========================================================================

  function renderAccessories() {
    const sidebar = document.getElementById('accessories-cat-sidebar');
    const itemsGrid = document.getElementById('accessories-items-grid');
    if (!sidebar || !itemsGrid) return;

    // Render category sidebar
    sidebar.innerHTML = ACCESSORY_CATEGORIES.map(cat => `
      <button type="button" class="wardrobe-cat-btn ${cat.id === activeAccessoryCat ? 'active' : ''}" data-cat="${cat.id}">
        <span>${cat.icon}</span>
        <span>${cat.label}</span>
      </button>
    `).join('');

    sidebar.querySelectorAll('.wardrobe-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeAccessoryCat = btn.getAttribute('data-cat');
        renderAccessories();
      });
    });

    // Filter items
    const filteredItems = ACCESSORY_ITEMS.filter(it => it.category === activeAccessoryCat);

    itemsGrid.innerHTML = filteredItems.map(item => {
      const isEquipped = isAccessoryEquipped(item);

      return `
        <div class="wardrobe-item-card ${isEquipped ? 'equipped' : ''}" data-id="${item.id}">
          <div class="wardrobe-item-icon-box" style="background: linear-gradient(135deg, ${item.colorHex}22, #fef9c3);">
            <span>${item.previewIcon}</span>
          </div>
          <div class="wardrobe-item-name">${item.name}</div>
          <div class="wardrobe-item-desc">${item.description}</div>
          <div class="wardrobe-item-actions">
            <button type="button" class="btn-try-on" data-id="${item.id}">
              ${isEquipped ? '✓ Terpasang' : '✨ Pasang'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    itemsGrid.querySelectorAll('.btn-try-on').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = ACCESSORY_ITEMS.find(it => it.id === id);
        if (item) equipAccessory(item);
      });
    });
  }

  function isAccessoryEquipped(item) {
    if (item.category === 'wings') return equippedItems.wings === item.id;
    if (item.category === 'hair') return equippedItems.hairAccessory === item.id;
    if (item.category === 'crowns') return equippedItems.flowerCrown === item.id;
    if (item.category === 'earrings') return equippedItems.earrings === item.id;
    if (item.category === 'necklaces') return equippedItems.necklace === item.id;
    if (item.category === 'bags') return equippedItems.bag === item.id;
    if (item.category === 'magical') return equippedItems.magicalItem === item.id;
    return false;
  }

  function equipAccessory(item) {
    if (item.category === 'wings') equippedItems.wings = item.id;
    else if (item.category === 'hair') equippedItems.hairAccessory = item.id;
    else if (item.category === 'crowns') equippedItems.flowerCrown = item.id;
    else if (item.category === 'earrings') equippedItems.earrings = item.id;
    else if (item.category === 'necklaces') equippedItems.necklace = item.id;
    else if (item.category === 'bags') equippedItems.bag = item.id;
    else if (item.category === 'magical') equippedItems.magicalItem = item.id;

    renderAccessories();
    renderDressingRoom();
    onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    onShowToast(`✨ Mengenakan ${item.name}!`);
  }

  // ===========================================================================
  // 4. DESIGNER'S CORNER — RUANG DESAIN PRIBADI LALA
  // ===========================================================================

  // 4.A FASHION SKETCHBOOK
  function initSketchbookCanvas() {
    canvas = document.getElementById('atelier-drawing-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Setup canvas size
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== 650 || canvas.height !== 520) {
      canvas.width = 650;
      canvas.height = 520;
    }

    // Bind Drawing Pointer Events (Mouse + Touch)
    canvas.onpointerdown = handlePointerDown;
    canvas.onpointermove = handlePointerMove;
    canvas.onpointerup = handlePointerUp;
    canvas.onpointercancel = handlePointerUp;
    canvas.onpointerleave = handlePointerUp;

    // Render Croquis overlay
    renderCroquisGuide(currentCroquis);

    // Save initial blank state to undo stack if empty
    if (undoStack.length === 0) {
      pushUndoState();
    }

    // Bind tools UI
    setupSketchbookControls();
  }

  function handlePointerDown(e) {
    isDrawing = true;
    const pos = getCanvasPos(e);
    lastX = pos.x;
    lastY = pos.y;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = currentBrushSize;

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
    }

    ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
    ctx.stroke();
  }

  function handlePointerMove(e) {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;
  }

  function handlePointerUp() {
    if (!isDrawing) return;
    isDrawing = false;
    pushUndoState();
  }

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function pushUndoState() {
    if (!canvas || !ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(imgData);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = []; // reset redo on new stroke
    updateUndoRedoButtons();
  }

  function handleUndo() {
    if (undoStack.length <= 1) return;
    const current = undoStack.pop();
    redoStack.push(current);
    const previous = undoStack[undoStack.length - 1];
    ctx.putImageData(previous, 0, 0);
    updateUndoRedoButtons();
    onShowToast('↩ Undo');
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const next = redoStack.pop();
    undoStack.push(next);
    ctx.putImageData(next, 0, 0);
    updateUndoRedoButtons();
    onShowToast('↪ Redo');
  }

  function handleClearCanvas() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pushUndoState();
    onShowToast('🗑️ Kanvas sketsa dibersihkan.');
  }

  function updateUndoRedoButtons() {
    const btnUndo = document.getElementById('btn-sketch-undo');
    const btnRedo = document.getElementById('btn-sketch-redo');
    if (btnUndo) btnUndo.disabled = undoStack.length <= 1;
    if (btnRedo) btnRedo.disabled = redoStack.length === 0;
  }

  function renderCroquisGuide(type) {
    const guideOverlay = document.getElementById('croquis-guide-overlay');
    if (!guideOverlay) return;

    if (type === 'croquis_none') {
      guideOverlay.innerHTML = '';
      return;
    }

    if (type === 'croquis_fairy_standard') {
      guideOverlay.innerHTML = `
        <svg viewBox="0 0 650 520" width="100%" height="100%" style="opacity: 0.35;">
          <!-- Head & Neck -->
          <ellipse cx="325" cy="70" rx="22" ry="28" fill="none" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
          <line x1="325" y1="98" x2="325" y2="120" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
          <!-- Torso -->
          <path d="M 300 135 L 350 135 L 340 210 L 310 210 Z" fill="none" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
          <!-- Pelvis -->
          <path d="M 310 210 L 340 210 L 350 255 L 300 255 Z" fill="none" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
          <!-- Legs -->
          <line x1="315" y1="255" x2="315" y2="460" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
          <line x1="335" y1="255" x2="335" y2="460" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
          <!-- Feet -->
          <ellipse cx="315" cy="470" rx="8" ry="12" fill="none" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
          <ellipse cx="335" cy="470" rx="8" ry="12" fill="none" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
          <!-- Arms -->
          <line x1="300" y1="135" x2="270" y2="230" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
          <line x1="350" y1="135" x2="380" y2="230" stroke="#f472b6" stroke-width="2" stroke-dasharray="4,4" />
        </svg>
      `;
    } else if (type === 'croquis_ballgown_flare') {
      guideOverlay.innerHTML = `
        <svg viewBox="0 0 650 520" width="100%" height="100%" style="opacity: 0.35;">
          <ellipse cx="325" cy="70" rx="20" ry="26" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,4" />
          <path d="M 305 130 L 345 130 L 335 200 L 315 200 Z" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,4" />
          <!-- Giant Ballgown Skirt guide -->
          <path d="M 315 200 Q 220 330 180 470 L 470 470 Q 430 330 335 200 Z" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="6,4" />
        </svg>
      `;
    } else if (type === 'croquis_ethereal_wings') {
      guideOverlay.innerHTML = `
        <svg viewBox="0 0 650 520" width="100%" height="100%" style="opacity: 0.35;">
          <!-- Fairy Pose -->
          <ellipse cx="325" cy="80" rx="20" ry="26" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" />
          <line x1="325" y1="106" x2="325" y2="240" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" />
          <!-- Giant Fairy Wings outline -->
          <path d="M 325 150 C 230 40 100 100 120 280 C 140 370 270 320 325 240 Z" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="5,5" />
          <path d="M 325 150 C 420 40 550 100 530 280 C 510 370 380 320 325 240 Z" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="5,5" />
        </svg>
      `;
    }
  }

  function setupSketchbookControls() {
    // Tool buttons (Brush / Eraser)
    const btnBrush = document.getElementById('btn-sketch-brush');
    const btnEraser = document.getElementById('btn-sketch-eraser');
    if (btnBrush) {
      btnBrush.onclick = () => {
        currentTool = 'brush';
        btnBrush.classList.add('active');
        if (btnEraser) btnEraser.classList.remove('active');
      };
    }
    if (btnEraser) {
      btnEraser.onclick = () => {
        currentTool = 'eraser';
        btnEraser.classList.add('active');
        if (btnBrush) btnBrush.classList.remove('active');
      };
    }

    // Brush Sizes
    document.querySelectorAll('.btn-brush-size').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.btn-brush-size').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentBrushSize = parseInt(btn.getAttribute('data-size'), 10) || 6;
      };
    });

    // Color Swatches
    document.querySelectorAll('.btn-color-swatch').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.btn-color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.getAttribute('data-color');
        const customPicker = document.getElementById('input-custom-brush-color');
        if (customPicker) customPicker.value = currentColor;
      };
    });

    const customPicker = document.getElementById('input-custom-brush-color');
    if (customPicker) {
      customPicker.oninput = (e) => {
        currentColor = e.target.value;
        document.querySelectorAll('.btn-color-swatch').forEach(b => b.classList.remove('active'));
      };
    }

    // Undo / Redo / Clear
    const btnUndo = document.getElementById('btn-sketch-undo');
    const btnRedo = document.getElementById('btn-sketch-redo');
    const btnClear = document.getElementById('btn-sketch-clear');
    if (btnUndo) btnUndo.onclick = handleUndo;
    if (btnRedo) btnRedo.onclick = handleRedo;
    if (btnClear) btnClear.onclick = handleClearCanvas;

    // Croquis Template selector
    const selCroquis = document.getElementById('select-croquis-template');
    if (selCroquis) {
      selCroquis.onchange = (e) => {
        currentCroquis = e.target.value;
        renderCroquisGuide(currentCroquis);
      };
    }

    // Zoom buttons
    const btnZoomIn = document.getElementById('btn-sketch-zoom-in');
    const btnZoomOut = document.getElementById('btn-sketch-zoom-out');
    const btnZoomReset = document.getElementById('btn-sketch-zoom-reset');
    const canvasWrap = document.getElementById('sketch-canvas-zoom-target');

    if (btnZoomIn && canvasWrap) {
      btnZoomIn.onclick = () => {
        canvasZoom = Math.min(2.0, canvasZoom + 0.15);
        canvasWrap.style.transform = `scale(${canvasZoom})`;
      };
    }
    if (btnZoomOut && canvasWrap) {
      btnZoomOut.onclick = () => {
        canvasZoom = Math.max(0.6, canvasZoom - 0.15);
        canvasWrap.style.transform = `scale(${canvasZoom})`;
      };
    }
    if (btnZoomReset && canvasWrap) {
      btnZoomReset.onclick = () => {
        canvasZoom = 1;
        canvasWrap.style.transform = `scale(1)`;
      };
    }

    // New Page button
    const btnNewPage = document.getElementById('btn-sketch-new-page');
    if (btnNewPage) {
      btnNewPage.onclick = () => {
        if (confirm('Buka halaman sketsa baru? Sketsa saat ini yang belum disimpan akan dibersihkan.')) {
          handleClearCanvas();
        }
      };
    }

    // Save Sketch button
    const btnSaveSketch = document.getElementById('btn-sketch-save');
    if (btnSaveSketch) {
      btnSaveSketch.onclick = async () => {
        const title = prompt('Beri nama sketsa desain busanamu:', 'Sketsa Gaun Peri Lala') || 'Sketsa Tanpa Judul';
        const dataUrl = canvas.toDataURL('image/png');
        await saveSketch({
          title,
          imageDataUrl: dataUrl,
          croquisType: currentCroquis,
          theme: 'Spring Fairy'
        }, activeUid);
        onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        onShowToast(`💾 Sketsa "${title}" berhasil disimpan di Fairy Atelier! ✨`);
      };
    }

    // Export PNG button
    const btnExportPng = document.getElementById('btn-sketch-export-png');
    if (btnExportPng) {
      btnExportPng.onclick = () => {
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `lala_fairy_fashion_sketch_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        onShowToast('⬇️ Sketsa busana berhasil diekspor sebagai gambar PNG!');
      };
    }
  }

  // 4.B INSPIRATION BOARD
  function renderInspirationBoard() {
    const stage = document.getElementById('moodboard-canvas-stage');
    const boardTitleEl = document.getElementById('moodboard-active-title');
    if (!stage) return;

    if (!activeBoard && allBoards.length > 0) {
      activeBoard = allBoards[0];
    }

    if (boardTitleEl && activeBoard) {
      boardTitleEl.textContent = activeBoard.title;
    }

    if (!activeBoard) {
      stage.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
          <p>Belum ada papan inspirasi.</p>
        </div>
      `;
      return;
    }

    let cardsHtml = '';

    // Render palette swatches
    if (activeBoard.palette && activeBoard.palette.length > 0) {
      cardsHtml += `
        <div class="board-card-item" style="border-top: 4px solid #f472b6;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #831843; margin-bottom: 8px;">🎨 Palet Warna Inspirasi</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${activeBoard.palette.map(c => `
              <div style="width: 32px; height: 32px; border-radius: 8px; background: ${c}; border: 1px solid rgba(0,0,0,0.1);" title="${c}"></div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Render sticky notes
    (activeBoard.notes || []).forEach((note, index) => {
      cardsHtml += `
        <div class="board-sticky-note" style="background: ${note.color || '#fef9c3'};">
          <button type="button" class="btn-delete-board-item" data-type="note" data-index="${index}" style="position: absolute; top: 4px; right: 4px; border: none; background: transparent; cursor: pointer; color: #94a3b8;">✕</button>
          <p style="margin: 0; line-height: 1.4;">${note.text}</p>
        </div>
      `;
    });

    // Render images
    (activeBoard.images || []).forEach((img, index) => {
      cardsHtml += `
        <div class="board-card-item">
          <button type="button" class="btn-delete-board-item" data-type="image" data-index="${index}" style="position: absolute; top: 8px; right: 8px; border: none; background: rgba(0,0,0,0.4); color: #fff; width: 24px; height: 24px; border-radius: 50%; cursor: pointer;">✕</button>
          <img src="${img.dataUrl}" alt="Inspirasi" class="board-card-img" />
          <div style="font-size: 0.8rem; font-weight: 600; color: #334155;">${img.caption || 'Foto Referensi'}</div>
        </div>
      `;
    });

    stage.innerHTML = cardsHtml;

    // Delete item handlers
    stage.querySelectorAll('.btn-delete-board-item').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-type');
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (type === 'note') activeBoard.notes.splice(idx, 1);
        else if (type === 'image') activeBoard.images.splice(idx, 1);
        await saveInspirationBoard(activeBoard, activeUid);
        renderInspirationBoard();
        onShowToast('Elemen papan inspirasi dihapus.');
      };
    });

    // Setup Board Toolbar Buttons
    const btnAddNote = document.getElementById('btn-board-add-note');
    const btnUploadImg = document.getElementById('btn-board-upload-img');
    const inputImgFile = document.getElementById('input-board-file-upload');
    const btnNewBoard = document.getElementById('btn-board-new-board');

    if (btnAddNote) {
      btnAddNote.onclick = async () => {
        const text = prompt('Tulis catatan inspirasi busanamu:', 'Contoh: Gunakan renda kelopak sakura untuk aksen kerah') || '';
        if (text.trim()) {
          activeBoard.notes = activeBoard.notes || [];
          const colors = ['#fef9c3', '#fbcfe8', '#a7f3d0', '#e9d5ff'];
          const noteColor = colors[Math.floor(Math.random() * colors.length)];
          activeBoard.notes.push({ id: `note_${Date.now()}`, text: text.trim(), color: noteColor });
          await saveInspirationBoard(activeBoard, activeUid);
          renderInspirationBoard();
          onShowToast('📝 Catatan ditambahkan ke papan inspirasi!');
        }
      };
    }

    if (btnUploadImg && inputImgFile) {
      btnUploadImg.onclick = () => inputImgFile.click();
      inputImgFile.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const dataUrl = ev.target.result;
          activeBoard.images = activeBoard.images || [];
          activeBoard.images.push({
            id: `img_${Date.now()}`,
            dataUrl,
            caption: file.name.replace(/\.[^/.]+$/, "")
          });
          await saveInspirationBoard(activeBoard, activeUid);
          renderInspirationBoard();
          onShowToast('🖼️ Gambar referensi berhasil ditambahkan ke papan!');
        };
        reader.readAsDataURL(file);
      };
    }

    if (btnNewBoard) {
      btnNewBoard.onclick = async () => {
        const title = prompt('Beri nama Papan Inspirasi Baru:', 'Papan Gaun Pesta Bunga') || 'Papan Inspirasi Baru';
        const newBoard = await saveInspirationBoard({
          title,
          concept: 'Eksplorasi ide dan tekstur gaun fantasi peri',
          theme: 'Spring Fairy',
          images: [],
          notes: [{ id: `note_1`, text: `Ide pertama untuk ${title}!`, color: '#fef9c3' }],
          palette: ['#f472b6', '#fef08a', '#99f6e4', '#e9d5ff']
        }, activeUid);
        allBoards = await getInspirationBoards(activeUid);
        activeBoard = newBoard;
        renderInspirationBoard();
        onShowToast(`✨ Papan inspirasi "${title}" dibuat!`);
      };
    }
  }

  // 4.C FABRIC & COLOR LIBRARY
  function renderFabricLibrary() {
    const fabricsGrid = document.getElementById('fabrics-swatches-grid');
    const motifsGrid = document.getElementById('motifs-swatches-grid');
    const palettesGrid = document.getElementById('palettes-swatches-grid');

    if (fabricsGrid) {
      fabricsGrid.innerHTML = FABRIC_LIBRARY.map(f => `
        <div class="fabric-card">
          <div class="fabric-swatch-box" style="background: ${f.colorHex}; background-image: ${f.swatchPattern}; background-size: ${f.bgSize}; background-position: ${f.bgPos};"></div>
          <div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #831843;">${f.name}</div>
            <div style="font-size: 0.76rem; color: #db2777; font-weight: 600;">Jenis: ${f.type} · ${f.sheen}</div>
          </div>
          <p style="font-size: 0.8rem; color: #475569; margin: 0; line-height: 1.35;">${f.textureDesc}</p>
          <div style="font-size: 0.75rem; color: #64748b; font-style: italic;">Karakteristik: ${f.feel}</div>
        </div>
      `).join('');
    }

    if (motifsGrid) {
      motifsGrid.innerHTML = MOTIF_PATTERNS.map(m => `
        <div class="fabric-card">
          <div style="font-size: 2.2rem; text-align: center; padding: 10px 0; background: #fff1f2; border-radius: 12px;">${m.symbol}</div>
          <div style="font-size: 0.92rem; font-weight: 700; color: #831843;">${m.name}</div>
          <div style="font-size: 0.8rem; color: #475569;">${m.desc}</div>
        </div>
      `).join('');
    }

    if (palettesGrid) {
      palettesGrid.innerHTML = COLOR_PALETTES.map(p => `
        <div class="fabric-card">
          <div style="font-size: 0.9rem; font-weight: 700; color: #831843;">${p.name}</div>
          <div style="display: flex; gap: 8px; margin: 6px 0;">
            ${p.colors.map(hex => `<div style="flex: 1; height: 32px; border-radius: 8px; background: ${hex}; border: 1px solid rgba(0,0,0,0.1);" title="${hex}"></div>`).join('')}
          </div>
          <div style="font-size: 0.78rem; color: #64748b;">${p.desc}</div>
          <button type="button" class="atelier-btn-secondary btn-apply-palette" data-id="${p.id}" style="margin-top: 6px; padding: 6px 12px; font-size: 0.78rem;">
            💾 Simpan ke Palet Favorit
          </button>
        </div>
      `).join('');

      palettesGrid.querySelectorAll('.btn-apply-palette').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute('data-id');
          const p = COLOR_PALETTES.find(x => x.id === id);
          if (p) {
            onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
            onShowToast(`🎨 Palet "${p.name}" disimpan ke favorit Lala!`);
          }
        };
      });
    }
  }

  // 4.D MANNEQUIN STUDIO
  function renderMannequinStudio() {
    const mannequinStage = document.getElementById('mannequin-render-stage');
    if (!mannequinStage) return;

    mannequinStage.innerHTML = `
      <div class="mannequin-figure">
        <!-- SVG Mannequin & Gown Drape Preview -->
        <svg viewBox="0 0 280 440" width="100%" height="100%">
          <!-- Wings if active -->
          ${mannequinConfig.hasWings ? `
            <path d="M 140 120 C 60 20 10 90 20 220 C 30 280 110 240 140 180 Z" fill="${mannequinConfig.accentColor}" opacity="0.5" />
            <path d="M 140 120 C 220 20 270 90 260 220 C 250 280 170 240 140 180 Z" fill="${mannequinConfig.accentColor}" opacity="0.5" />
          ` : ''}

          <!-- Mannequin Stand Pole & Base -->
          <line x1="140" y1="280" x2="140" y2="420" stroke="#78350f" stroke-width="6" />
          <ellipse cx="140" cy="420" rx="45" ry="12" fill="#92400e" />

          <!-- Mannequin Neck & Top -->
          <ellipse cx="140" cy="40" rx="14" ry="18" fill="#fde68a" stroke="#d97706" stroke-width="2" />
          <path d="M 120 70 L 160 70 L 150 145 L 130 145 Z" fill="${mannequinConfig.topColor}" stroke="#db2777" stroke-width="2" />

          <!-- Flower Crown if active -->
          ${mannequinConfig.hasCrown ? `
            <ellipse cx="140" cy="30" rx="18" ry="6" fill="#f472b6" stroke="#fde047" stroke-width="2" />
          ` : ''}

          <!-- Skirt Silhouette Drape -->
          ${mannequinConfig.silhouette === 'ballgown' ? `
            <path d="M 130 145 Q 60 240 40 340 L 240 340 Q 220 240 150 145 Z" fill="${mannequinConfig.skirtColor}" stroke="#db2777" stroke-width="2.5" />
          ` : (mannequinConfig.silhouette === 'a-line' ? `
            <path d="M 130 145 L 80 340 L 200 340 L 150 145 Z" fill="${mannequinConfig.skirtColor}" stroke="#db2777" stroke-width="2.5" />
          ` : `
            <path d="M 130 145 Q 125 240 110 280 L 70 340 L 210 340 L 170 280 Q 155 240 150 145 Z" fill="${mannequinConfig.skirtColor}" stroke="#db2777" stroke-width="2.5" />
          `)}

          <!-- Waist Ribbon Accent -->
          <ellipse cx="140" cy="145" rx="14" ry="5" fill="${mannequinConfig.accentColor}" />
        </svg>
      </div>
    `;

    // Bind Mannequin customization inputs
    const selSilhouette = document.getElementById('mannequin-sel-silhouette');
    const inputTopColor = document.getElementById('mannequin-color-top');
    const inputSkirtColor = document.getElementById('mannequin-color-skirt');
    const inputAccentColor = document.getElementById('mannequin-color-accent');
    const chkWings = document.getElementById('mannequin-chk-wings');
    const chkCrown = document.getElementById('mannequin-chk-crown');
    const btnSaveDesign = document.getElementById('btn-mannequin-save-portfolio');

    if (selSilhouette) selSilhouette.onchange = (e) => { mannequinConfig.silhouette = e.target.value; renderMannequinStudio(); };
    if (inputTopColor) inputTopColor.oninput = (e) => { mannequinConfig.topColor = e.target.value; renderMannequinStudio(); };
    if (inputSkirtColor) inputSkirtColor.oninput = (e) => { mannequinConfig.skirtColor = e.target.value; renderMannequinStudio(); };
    if (inputAccentColor) inputAccentColor.oninput = (e) => { mannequinConfig.accentColor = e.target.value; renderMannequinStudio(); };
    if (chkWings) chkWings.onchange = (e) => { mannequinConfig.hasWings = e.target.checked; renderMannequinStudio(); };
    if (chkCrown) chkCrown.onchange = (e) => { mannequinConfig.hasCrown = e.target.checked; renderMannequinStudio(); };

    if (btnSaveDesign) {
      btnSaveDesign.onclick = async () => {
        const title = prompt('Nama rancangan busana manekin:', 'Gaun Kelopak Fajar Manekin') || 'Rancangan Manekin';
        const desc = prompt('Konsep rancangan:', 'Gaun pesta peri berhias aksen emas dan kelopak bunga') || '';

        await savePortfolioDesign({
          title,
          description: desc,
          theme: 'Spring Fairy',
          palette: [mannequinConfig.topColor, mannequinConfig.skirtColor, mannequinConfig.accentColor],
          status: 'In Progress',
          mannequinConfig: { ...mannequinConfig }
        }, activeUid);

        onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        onShowToast(`👗 Rancangan "${title}" berhasil disimpan ke My Fashion Portfolio! ✨`);
        switchDesignerSubtab('portfolio');
      };
    }
  }

  // 4.E MY FASHION PORTFOLIO
  async function renderPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    portfolioList = await getPortfolioDesigns(activeUid);

    if (portfolioList.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
          <p style="font-size: 2rem;">🪡</p>
          <p>Belum ada rancangan busana di portofoliomu. Buat sketsa atau manekin pertamamu!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = portfolioList.map(item => {
      const statusClass = (item.status || 'Idea').toLowerCase().replace(' ', '-');
      const dateStr = new Date(item.createdAt || Date.now()).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return `
        <div class="portfolio-card" data-id="${item.id}">
          <div class="portfolio-card-thumb" style="display: flex; align-items: center; justify-content: center; position: relative;">
            ${item.previewDataUrl ? `
              <img src="${item.previewDataUrl}" style="width: 100%; height: 100%; object-fit: contain;" alt="${item.title}" />
            ` : `
              <div style="font-size: 3rem; color: #f472b6;">👗</div>
            `}
          </div>
          <div class="portfolio-card-body">
            <span class="portfolio-status-pill ${statusClass}">${item.status || 'Idea'}</span>
            <div style="font-size: 0.98rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">${item.title}</div>
            <p style="font-size: 0.78rem; color: #64748b; margin: 0 0 10px 0; line-height: 1.35; flex: 1;">${item.description || 'Rancangan busana karya peri Lala'}</p>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 8px;">Dibuat: ${dateStr} · Tema: ${item.theme || 'Spring Fairy'}</div>
            
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" class="btn-portfolio-view atelier-btn-primary" data-id="${item.id}" style="flex: 1; padding: 6px 10px; font-size: 0.76rem;">
                🔍 Buka
              </button>
              <button type="button" class="btn-portfolio-duplicate atelier-btn-secondary" data-id="${item.id}" style="padding: 6px 10px; font-size: 0.76rem;" title="Gandakan">
                📋
              </button>
              <button type="button" class="btn-portfolio-delete atelier-btn-secondary" data-id="${item.id}" style="padding: 6px 10px; font-size: 0.76rem; color: #ef4444;" title="Hapus">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Actions
    grid.querySelectorAll('.btn-portfolio-view').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        openPortfolioDetailModal(id);
      };
    });

    grid.querySelectorAll('.btn-portfolio-duplicate').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        await duplicatePortfolioDesign(id, activeUid);
        onShowToast('📋 Rancangan berhasil digandakan!');
        renderPortfolio();
      };
    });

    grid.querySelectorAll('.btn-portfolio-delete').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus rancangan busana ini dari portofolio?')) {
          await deletePortfolioDesign(id, activeUid);
          onShowToast('Rancangan dihapus dari portofolio.');
          renderPortfolio();
        }
      };
    });
  }

  function openPortfolioDetailModal(id) {
    const item = portfolioList.find(x => x.id === id);
    if (!item) return;

    const modal = document.getElementById('modal-portfolio-detail');
    if (!modal) return;

    document.getElementById('modal-port-title').textContent = item.title;
    document.getElementById('modal-port-desc').textContent = item.description || 'Tidak ada deskripsi.';
    document.getElementById('modal-port-theme').textContent = item.theme || 'Spring Fairy';
    document.getElementById('modal-port-status').textContent = item.status || 'Idea';

    modal.classList.add('open');

    const btnClose = document.getElementById('btn-close-modal-port');
    if (btnClose) btnClose.onclick = () => modal.classList.remove('open');
  }

  // ===========================================================================
  // 5. MY LOOKBOOK
  // ===========================================================================

  async function renderLookbook() {
    const grid = document.getElementById('lookbook-grid');
    if (!grid) return;

    lookbookList = await getLookbookOutfits(activeUid);

    if (lookbookList.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
          <p style="font-size: 2rem;">📖</p>
          <p>Belum ada outfit yang disimpan di Lookbook. Padukan busanamu di Magic Dressing Room lalu klik "Save Outfit"!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = lookbookList.map(outfit => {
      const dateStr = new Date(outfit.createdAt || Date.now()).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return `
        <div class="lookbook-card" data-id="${outfit.id}">
          <div style="height: 180px; background: linear-gradient(135deg, ${outfit.previewColor || '#f472b6'}22, #fef9c3); display: flex; align-items: center; justify-content: center; position: relative;">
            <img src="/assets/avatar_lala_hd.png" alt="Lala" style="max-height: 80%; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));" />
            <button type="button" class="btn-lookbook-fav btn-fav-toggle ${outfit.isFavorite ? 'active' : ''}" data-id="${outfit.id}" style="position: absolute; top: 10px; right: 10px;">
              ${outfit.isFavorite ? '♥' : '♡'}
            </button>
          </div>
          <div style="padding: 14px; display: flex; flex-direction: column; flex: 1;">
            <div style="font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">${outfit.title}</div>
            <p style="font-size: 0.78rem; color: #64748b; margin: 0 0 10px 0; line-height: 1.35; flex: 1;">${outfit.description || 'Paduan busana anggun peri Lala'}</p>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 10px;">Musim: ${outfit.seasonTag || 'Spring Fairy'} · Dibuat: ${dateStr}</div>

            <div style="display: flex; gap: 6px;">
              <button type="button" class="atelier-btn-primary btn-lookbook-wear" data-id="${outfit.id}" style="flex: 1; padding: 6px 12px; font-size: 0.78rem;">
                👗 Pakai Outfit Ini
              </button>
              <button type="button" class="atelier-btn-secondary btn-lookbook-delete" data-id="${outfit.id}" style="padding: 6px 10px; font-size: 0.78rem; color: #ef4444;" title="Hapus">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Actions
    grid.querySelectorAll('.btn-lookbook-wear').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const outfit = lookbookList.find(x => x.id === id);
        if (outfit && outfit.items) {
          equippedItems = { ...outfit.items };
          await saveWardrobeState({
            wornOutfit: equippedItems,
            favoriteItemIds: Array.from(favoriteItemIds)
          }, activeUid);
          renderDressingRoom();
          onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
          onShowToast(`👗 Lala sekarang mengenakan "${outfit.title}"! ✨`);
        }
      };
    });

    grid.querySelectorAll('.btn-lookbook-fav').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await toggleLookbookFavorite(id, activeUid);
        renderLookbook();
      };
    });

    grid.querySelectorAll('.btn-lookbook-delete').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus outfit ini dari Lookbook?')) {
          await deleteLookbookOutfit(id, activeUid);
          onShowToast('Outfit dihapus dari Lookbook.');
          renderLookbook();
        }
      };
    });
  }

  function openSaveLookbookModal() {
    const title = prompt('Nama kombinasi outfit ini:', 'Outfit Anggun Pagi Hari') || 'Outfit Cantik Lala';
    const desc = prompt('Catatan gaya:', 'Paduan sempurna untuk menyapa bunga-bunga Bloom Cottage') || '';

    saveLookbookOutfit({
      title,
      description: desc,
      seasonTag: 'Spring Fairy',
      items: { ...equippedItems },
      previewColor: '#f472b6',
      isFavorite: false
    }, activeUid).then(() => {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      onShowToast(`📖 Outfit "${title}" tersimpan di My Lookbook! ✨`);
      renderLookbook();
    });
  }

  // ===========================================================================
  // 6. SEASONAL COLLECTIONS
  // ===========================================================================

  function renderSeasonalCollections() {
    const grid = document.getElementById('seasonal-collections-grid');
    if (!grid) return;

    grid.innerHTML = SEASONAL_COLLECTIONS.map(season => `
      <div class="seasonal-card" style="background: ${season.bgColor}; border-color: ${season.accentColor}55;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="font-size: 2rem;">${season.icon}</div>
          <span style="font-size: 0.74rem; font-weight: 700; color: ${season.accentColor}; padding: 3px 10px; border-radius: 9999px; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            KOLEKSI TEMATIK
          </span>
        </div>
        <div style="font-size: 1.15rem; font-weight: 800; color: #1e293b; margin-bottom: 2px;">${season.title}</div>
        <div style="font-size: 0.8rem; font-weight: 600; color: ${season.accentColor}; margin-bottom: 10px;">"${season.tagline}"</div>
        <p style="font-size: 0.82rem; color: #475569; line-height: 1.4; margin: 0 0 14px 0; flex: 1;">${season.description}</p>
        
        <div style="font-size: 0.78rem; font-weight: 700; color: #831843; margin-bottom: 6px;">Karya Unggulan:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
          ${season.keyPieces.map(piece => `
            <span style="padding: 3px 8px; border-radius: 6px; background: rgba(255,255,255,0.85); font-size: 0.72rem; color: #334155; border: 1px solid rgba(0,0,0,0.06);">
              ✨ ${piece}
            </span>
          `).join('')}
        </div>

        <button type="button" class="atelier-btn-primary btn-explore-season" data-id="${season.id}" style="width: 100%;">
          👗 Jelajahi Koleksi Ini
        </button>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-explore-season').forEach(btn => {
      btn.onclick = () => {
        const seasonId = btn.getAttribute('data-id');
        const s = SEASONAL_COLLECTIONS.find(x => x.id === seasonId);
        onShowToast(`🌸 Menjelajahi ${s ? s.title : 'Koleksi'}!`);
        switchTab('wardrobe');
      };
    });
  }

  // ===========================================================================
  // SEED DEFAULTS (PORTFOLIO, LOOKBOOK, BOARDS)
  // ===========================================================================

  async function seedInitialPortfolio() {
    await savePortfolioDesign({
      title: 'Gaun Peri Pagi Embun Abadi',
      description: 'Rancangan gaun kelopak bertingkat dengan aksen sulam emas halus dan renda transparan.',
      theme: 'Spring Fairy',
      palette: ['#f472b6', '#fbcfe8', '#fef08a'],
      status: 'Completed',
      mannequinConfig: {
        silhouette: 'ballgown',
        topColor: '#fbcfe8',
        skirtColor: '#f472b6',
        accentColor: '#fef08a',
        hasWings: true,
        hasCrown: true
      }
    }, activeUid);

    await savePortfolioDesign({
      title: 'Jubah Sutra Rembulan Perak',
      description: 'Eksplorasi gaun malam bervolume lembut dengan gradasi lavender dan sayap kristal perak.',
      theme: 'Moonlight Fairy',
      palette: ['#c084fc', '#e9d5ff', '#93c5fd'],
      status: 'In Progress',
      mannequinConfig: {
        silhouette: 'a-line',
        topColor: '#e9d5ff',
        skirtColor: '#c084fc',
        accentColor: '#38bdf8',
        hasWings: true,
        hasCrown: false
      }
    }, activeUid);
  }

  async function seedInitialLookbook() {
    await saveLookbookOutfit({
      title: 'Everglow Signature Bloom',
      description: 'Setelan ikonis Lala saat menyapa matahari terbit di taman bunga TO YOU.',
      seasonTag: 'Spring Fairy',
      isFavorite: true,
      previewColor: '#f472b6',
      items: {
        dress: 'dress_spring_morning',
        top: null,
        skirt: null,
        outerwear: null,
        cardigan: 'cardigan_blossom_knit',
        shoes: 'shoes_fairy_slippers',
        wings: 'wings_gossamer_gold',
        hairAccessory: 'hair_buttercup_ribbon',
        flowerCrown: 'crown_cherry_blossom',
        earrings: 'earrings_pearl_dew',
        necklace: 'necklace_fairy_pendant',
        bag: 'bag_petal_pouch',
        magicalItem: 'item_starlight_prism'
      }
    }, activeUid);
  }

  async function seedInitialInspirationBoard() {
    await saveInspirationBoard({
      title: 'Inspirasi Musim Semi & Kelopak Sakura',
      concept: 'Mengumpulkan kehangatan sinar mentari pagi, tekstur kelopak mekar, dan kepakan kupu-kupu.',
      theme: 'Spring Fairy',
      notes: [
        { id: 'note_1', text: '💡 Tambahkan aksen pita emas tipis pada pergelangan tangan.', color: '#fef9c3' },
        { id: 'note_2', text: '🌸 Bahan sifon membuat gaun melayang indah saat berputar!', color: '#fbcfe8' }
      ],
      palette: ['#f472b6', '#fef08a', '#99f6e4', '#e9d5ff'],
      images: []
    }, activeUid);
  }

  // ===========================================================================
  // BINDING GLOBAL TOP ACTIONS
  // ===========================================================================

  if (btnBack) {
    btnBack.addEventListener('click', closeFairyAtelier);
  }

  Object.keys(tabButtons).forEach(key => {
    if (tabButtons[key]) {
      tabButtons[key].addEventListener('click', () => switchTab(key));
    }
  });

  document.querySelectorAll('.designer-subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subtab = btn.getAttribute('data-subtab');
      if (subtab) switchDesignerSubtab(subtab);
    });
  });

  return {
    openFairyAtelier,
    closeFairyAtelier,
    switchTab,
    switchDesignerSubtab
  };
}
