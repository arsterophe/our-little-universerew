/**
 * PINWHEEL — VISION STUDIO: THE CREATIVE ATELIER CONTROLLER
 * SYMA'S UNIVERSE · PINWHEEL
 * =============================================================================
 * Subtitle: "Create something beautiful, one little idea at a time."
 * Digital Art Studio & Creative Editor for Syma
 */

import {
  saveArtwork,
  loadAllArtworks,
  getArtworkById,
  deleteArtwork,
  renameArtwork,
  SYMA_CANONICAL_UID
} from './pinwheel_studio_storage.js';

export function initPinwheelVisionStudioView(options = {}) {
  const {
    onShowToast,
    onNavigateBack,
    onSwitchToPhotography
  } = options;

  const viewEl = document.getElementById('view-pinwheel-vision-studio');
  if (!viewEl) return null;

  let currentUid = SYMA_CANONICAL_UID;
  let activeTab = 'canvas'; // 'canvas' | 'editor' | 'gallery'
  let currentEditingArtId = null; // null if brand new artwork

  // Canvas Drawing Engine State
  let currentTool = 'brush'; // 'brush' | 'eraser'
  let currentColor = '#A855F7';
  let brushSize = 6;
  let canvasBgColor = '#18122B';
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // Undo / Redo History Stack (storing ImageData or dataURLs)
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 25;

  // Canvas Dimensions
  let canvasWidth = 800;
  let canvasHeight = 600;

  // Stickers / Elements on Canvas Layer (for both Drawing & Creative Editor)
  let studioElements = [];
  let selectedElementId = null;
  let isDraggingElement = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  // Creative Editor State
  let selectedTemplateId = 'greeting_card';
  let editorHeadline = 'Warm Wishes from PINWHEEL';
  let editorBodyText = 'May gentle winds carry peace and endless joy to your heart today and always.';
  let editorSubText = '— Syma · Our Little Universe';

  // Cached Gallery Artworks
  let galleryArtworks = [];
  let activeGalleryCategory = 'All Artworks';

  // Catalogs
  const COLOR_PALETTES = [
    {
      name: 'Lavender Dream',
      colors: ['#E9D5FF', '#C084FC', '#A855F7', '#7E22CE', '#3B0764']
    },
    {
      name: 'Sakura Blossom',
      colors: ['#FCE7F3', '#F472B6', '#EC4899', '#DB2777', '#9D174D']
    },
    {
      name: 'Moonlight Silver',
      colors: ['#FFFFFF', '#F8FAFC', '#CBD5E1', '#94A3B8', '#475569']
    },
    {
      name: 'Midnight Violet',
      colors: ['#818CF8', '#6366F1', '#4F46E5', '#3730A3', '#1E1B4B']
    },
    {
      name: 'Kitsune Gold',
      colors: ['#FEF3C7', '#FDE68A', '#FBBF24', '#F59E0B', '#D97706']
    },
    {
      name: 'Soft Pastel',
      colors: ['#FEE2E2', '#FEF08A', '#D1FAE5', '#E0E7FF', '#F3E8FF']
    }
  ];

  const STICKERS = [
    { id: 'sakura_flower', label: 'Bunga Sakura', symbol: '🌸' },
    { id: 'butterfly', label: 'Kupu-kupu', symbol: '🦋' },
    { id: 'kitsune', label: 'Siluman Rubah', symbol: '🦊' },
    { id: 'pinwheel', label: 'Kincir Angin', symbol: '🎐' },
    { id: 'sparkles', label: 'Kilau Bintang', symbol: '✨' },
    { id: 'moon', label: 'Bulan Sabit', symbol: '🌙' },
    { id: 'cloud', label: 'Awan Malam', symbol: '☁️' },
    { id: 'lavender', label: 'Bunga Lavender', symbol: '🪻' },
    { id: 'lantern', label: 'Lentera Jepang', symbol: '🏮' },
    { id: 'torii', label: 'Gerbang Suci', symbol: '⛩️' }
  ];

  const TEMPLATES = [
    {
      id: 'greeting_card',
      name: 'Greeting Card',
      category: 'Greeting Cards',
      icon: '💌',
      headline: 'Warm Wishes from PINWHEEL',
      body: 'May gentle winds carry peace, hope, and joy into your days.',
      sub: '— Syma · PINWHEEL',
      bg: '#241442',
      frameBorder: '#f472b6',
      defaultStickers: [{ symbol: '🌸', x: 70, y: 80, size: 48 }, { symbol: '🎐', x: 710, y: 80, size: 48 }]
    },
    {
      id: 'birthday_card',
      name: 'Birthday Card',
      category: 'Greeting Cards',
      icon: '🎂',
      headline: 'Happy Birthday, Dear Friend!',
      body: 'Wishing you another radiant year filled with wonder, sweet memories, and blooming happiness.',
      sub: 'With all love from Syma 🌸',
      bg: '#2b1055',
      frameBorder: '#fbbf24',
      defaultStickers: [{ symbol: '✨', x: 80, y: 70, size: 44 }, { symbol: '🦋', x: 700, y: 70, size: 48 }]
    },
    {
      id: 'quote_card',
      name: 'Quote Card',
      category: 'Posters',
      icon: '📜',
      headline: 'Whispers of the Wind',
      body: '"Even when the wind changes, a little heart can still find its way home."',
      sub: '— Syma · Pinwheel Sanctuary',
      bg: '#14142b',
      frameBorder: '#c084fc',
      defaultStickers: [{ symbol: '🌙', x: 710, y: 70, size: 46 }, { symbol: '🦊', x: 80, y: 490, size: 48 }]
    },
    {
      id: 'mini_poster',
      name: 'Mini Poster',
      category: 'Posters',
      icon: '🖼️',
      headline: 'MOONLIT PINWHEEL ATELIER',
      body: 'Where dreams are painted in shades of lavender and silver starlight.',
      sub: 'Syma’s Creative Studio Edition ✦ 2026',
      bg: '#1e1035',
      frameBorder: '#38bdf8',
      defaultStickers: [{ symbol: '✨', x: 390, y: 70, size: 42 }, { symbol: '🪻', x: 700, y: 500, size: 44 }]
    },
    {
      id: 'photo_collage',
      name: 'Photo Collage',
      category: 'Photo Collage',
      icon: '🎞️',
      headline: 'Treasured Memories',
      body: 'Moments frozen beneath the blossoms, held gently in our hearts.',
      sub: 'Our Little Universe Memories',
      bg: '#1f1b2e',
      frameBorder: '#e2e8f0',
      defaultStickers: [{ symbol: '🌸', x: 80, y: 80, size: 40 }, { symbol: '🦋', x: 700, y: 80, size: 40 }]
    },
    {
      id: 'scrapbook_page',
      name: 'Scrapbook Page',
      category: 'Scrapbook',
      icon: '📔',
      headline: 'A Day in the Garden',
      body: 'Tea was served hot, laughter echoed by the pond, and sakura petals danced softly in the breeze.',
      sub: 'Page 24 · Personal Journal',
      bg: '#261b3d',
      frameBorder: '#fbcfe8',
      defaultStickers: [{ symbol: '🏮', x: 80, y: 70, size: 44 }, { symbol: '🦊', x: 700, y: 500, size: 48 }]
    }
  ];

  // DOM Elements - Header & Tabs
  const btnBack = document.getElementById('btn-pinwheel-vision-back');
  const btnSwitchPhoto = document.getElementById('btn-vision-switch-photo');
  const tabBtnCanvas = document.getElementById('tab-vision-canvas');
  const tabBtnEditor = document.getElementById('tab-vision-editor');
  const tabBtnGallery = document.getElementById('tab-vision-gallery');
  const panelCanvas = document.getElementById('panel-vision-canvas');
  const panelEditor = document.getElementById('panel-vision-editor');
  const panelGallery = document.getElementById('panel-vision-gallery');

  // DOM Elements - Canvas Stage & Drawing Tools
  const mainCanvas = document.getElementById('vision-main-canvas');
  const elementsLayer = document.getElementById('vision-elements-layer');
  const canvasWrap = document.getElementById('vision-canvas-wrap');
  let ctx = mainCanvas ? mainCanvas.getContext('2d') : null;

  const btnToolBrush = document.getElementById('btn-tool-brush');
  const btnToolEraser = document.getElementById('btn-tool-eraser');
  const btnUndo = document.getElementById('btn-tool-undo');
  const btnRedo = document.getElementById('btn-tool-redo');
  const btnClearCanvas = document.getElementById('btn-tool-clear');
  const sliderBrushSize = document.getElementById('slider-brush-size');
  const textBrushSize = document.getElementById('text-brush-size-val');
  const customColorInput = document.getElementById('input-custom-color');
  const colorActivePreview = document.getElementById('color-active-preview');
  const palettesListContainer = document.getElementById('vision-palettes-container');
  const selectCanvasSize = document.getElementById('select-canvas-size');
  const selectCanvasBg = document.getElementById('select-canvas-bg');
  const stickersListContainer = document.getElementById('vision-stickers-container');
  const btnSaveArtwork = document.getElementById('btn-vision-save');
  const btnDownloadArtwork = document.getElementById('btn-vision-download');

  // DOM Elements - Creative Editor Panel
  const templatesListContainer = document.getElementById('vision-templates-container');
  const inputEditorTitle = document.getElementById('input-editor-headline');
  const inputEditorBody = document.getElementById('input-editor-body');
  const inputEditorSub = document.getElementById('input-editor-sub');
  const btnApplyTemplate = document.getElementById('btn-apply-template');

  // DOM Elements - Gallery Panel
  const galleryGrid = document.getElementById('vision-gallery-grid');
  const galleryEmptyState = document.getElementById('vision-gallery-empty');
  const galleryCatTabs = document.querySelectorAll('.vision-gallery-tab');

  // DOM Elements - Lightbox Modal
  const artLightboxModal = document.getElementById('vision-art-lightbox-modal');
  const artLightboxImg = document.getElementById('vision-art-lightbox-img');
  const artLightboxTitle = document.getElementById('vision-art-lightbox-title');
  const artLightboxDate = document.getElementById('vision-art-lightbox-date');
  const artLightboxCategory = document.getElementById('vision-art-lightbox-cat');
  const btnArtLightboxEdit = document.getElementById('btn-art-lightbox-edit');
  const btnArtLightboxRename = document.getElementById('btn-art-lightbox-rename');
  const btnArtLightboxDownload = document.getElementById('btn-art-lightbox-download');
  const btnArtLightboxDelete = document.getElementById('btn-art-lightbox-delete');
  const btnArtLightboxClose = document.getElementById('btn-art-lightbox-close');
  let activeLightboxArtwork = null;

  // ---------------------------------------------------------------------------
  // CANVAS CORE DRAWING ENGINE
  // ---------------------------------------------------------------------------

  function setupCanvas(w = 800, h = 600, bgColor = canvasBgColor) {
    if (!mainCanvas) return;
    canvasWidth = w;
    canvasHeight = h;
    mainCanvas.width = canvasWidth;
    mainCanvas.height = canvasHeight;
    canvasBgColor = bgColor;

    if (canvasWrap) {
      canvasWrap.style.width = `${canvasWidth}px`;
      canvasWrap.style.height = `${canvasHeight}px`;
    }

    ctx = mainCanvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear background
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    undoStack.length = 0;
    redoStack.length = 0;
    saveCanvasState();
    updateUndoRedoUI();
  }

  function saveCanvasState() {
    if (!ctx || !mainCanvas) return;
    try {
      const data = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
      undoStack.push(data);
      if (undoStack.length > MAX_HISTORY) undoStack.shift();
      redoStack.length = 0; // Clear redo on new action
      updateUndoRedoUI();
    } catch (_) {}
  }

  function undo() {
    if (undoStack.length <= 1 || !ctx || !mainCanvas) return;
    const current = undoStack.pop();
    redoStack.push(current);
    const prev = undoStack[undoStack.length - 1];
    ctx.putImageData(prev, 0, 0);
    updateUndoRedoUI();
  }

  function redo() {
    if (redoStack.length === 0 || !ctx || !mainCanvas) return;
    const next = redoStack.pop();
    undoStack.push(next);
    ctx.putImageData(next, 0, 0);
    updateUndoRedoUI();
  }

  function updateUndoRedoUI() {
    if (btnUndo) btnUndo.disabled = undoStack.length <= 1;
    if (btnRedo) btnRedo.disabled = redoStack.length === 0;
  }

  function getCanvasCoords(clientX, clientY) {
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDrawing(x, y) {
    isDrawing = true;
    lastX = x;
    lastY = y;
  }

  function drawMove(x, y) {
    if (!isDrawing || !ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);

    if (currentTool === 'eraser') {
      ctx.strokeStyle = canvasBgColor;
      ctx.lineWidth = brushSize * 2.2;
    } else {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
    }
    ctx.stroke();

    lastX = x;
    lastY = y;
  }

  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    saveCanvasState();
  }

  // ---------------------------------------------------------------------------
  // COLOR LAB & PALETTES
  // ---------------------------------------------------------------------------

  function renderColorLab() {
    if (!palettesListContainer) return;
    palettesListContainer.innerHTML = COLOR_PALETTES.map((pal) => `
      <div class="vision-palette-row">
        <span class="vision-palette-name">${pal.name}</span>
        <div class="vision-swatches">
          ${pal.colors.map((c) => `
            <button type="button" class="vision-color-swatch ${c.toUpperCase() === currentColor.toUpperCase() ? 'active' : ''}"
              data-color="${c}" style="background-color: ${c};" title="${c}" aria-label="${c}"></button>
          `).join('')}
        </div>
      </div>
    `).join('');

    palettesListContainer.querySelectorAll('.vision-color-swatch').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        setColor(swatch.getAttribute('data-color'));
      });
    });
  }

  function setColor(hex) {
    currentColor = hex;
    currentTool = 'brush';
    if (btnToolBrush) btnToolBrush.classList.add('active');
    if (btnToolEraser) btnToolEraser.classList.remove('active');
    if (customColorInput) customColorInput.value = hex;
    if (colorActivePreview) colorActivePreview.style.backgroundColor = hex;

    document.querySelectorAll('.vision-color-swatch').forEach((sw) => {
      sw.classList.toggle('active', sw.getAttribute('data-color').toUpperCase() === hex.toUpperCase());
    });
  }

  // ---------------------------------------------------------------------------
  // STICKERS & DECORATIONS LAYER
  // ---------------------------------------------------------------------------

  function renderStickersBar() {
    if (!stickersListContainer) return;
    stickersListContainer.innerHTML = STICKERS.map((s) => `
      <button type="button" class="vision-sticker-chip" data-sticker-symbol="${s.symbol}" title="${s.label}">
        <span class="sticker-emoji">${s.symbol}</span>
        <span class="sticker-label">${s.label}</span>
      </button>
    `).join('');

    stickersListContainer.querySelectorAll('.vision-sticker-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const symbol = btn.getAttribute('data-sticker-symbol');
        addStickerElement(symbol);
      });
    });
  }

  function addStickerElement(symbol, x = canvasWidth / 2, y = canvasHeight / 2, size = 52) {
    const id = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const elData = {
      id,
      type: 'sticker',
      symbol,
      x: x - size / 2,
      y: y - size / 2,
      size
    };
    studioElements.push(elData);
    renderElementsOnLayer();
    if (onShowToast) onShowToast(`✨ Dekorasi ${symbol} ditambahkan ke kanvas!`);
  }

  function renderElementsOnLayer() {
    if (!elementsLayer) return;
    elementsLayer.innerHTML = studioElements.map((el) => {
      const isSelected = el.id === selectedElementId;
      return `
        <div class="vision-canvas-element ${isSelected ? 'selected' : ''}" id="${el.id}"
          style="left: ${el.x}px; top: ${el.y}px; font-size: ${el.size}px;" tabindex="0">
          <span class="element-symbol">${el.symbol}</span>
          ${isSelected ? `
            <div class="element-controls">
              <button type="button" class="btn-el-action shrink" data-action="shrink" title="Perkecil">－</button>
              <button type="button" class="btn-el-action grow" data-action="grow" title="Perbesar">＋</button>
              <button type="button" class="btn-el-action delete" data-action="delete" title="Hapus">✕</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach drag & element controls
    elementsLayer.querySelectorAll('.vision-canvas-element').forEach((domEl) => {
      const id = domEl.id;

      domEl.addEventListener('mousedown', (e) => {
        if (e.target.closest('.btn-el-action')) return;
        selectedElementId = id;
        isDraggingElement = true;
        const rect = domEl.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        renderElementsOnLayer();
      });

      // Actions: grow, shrink, delete
      domEl.querySelectorAll('.btn-el-action').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          const item = studioElements.find((item) => item.id === id);
          if (!item) return;

          if (action === 'grow') {
            item.size = Math.min(160, item.size + 10);
          } else if (action === 'shrink') {
            item.size = Math.max(20, item.size - 10);
          } else if (action === 'delete') {
            studioElements = studioElements.filter((item) => item.id !== id);
            selectedElementId = null;
          }
          renderElementsOnLayer();
        });
      });
    });
  }

  // Window drag handlers for elements
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingElement || !selectedElementId || !elementsLayer) return;
    const targetItem = studioElements.find((item) => item.id === selectedElementId);
    if (!targetItem) return;

    const layerRect = elementsLayer.getBoundingClientRect();
    const scaleX = canvasWidth / layerRect.width;
    const scaleY = canvasHeight / layerRect.height;

    const newX = ((e.clientX - dragOffsetX) - layerRect.left) * scaleX;
    const newY = ((e.clientY - dragOffsetY) - layerRect.top) * scaleY;

    targetItem.x = Math.max(0, Math.min(canvasWidth - targetItem.size, newX));
    targetItem.y = Math.max(0, Math.min(canvasHeight - targetItem.size, newY));

    const domEl = document.getElementById(selectedElementId);
    if (domEl) {
      domEl.style.left = `${targetItem.x}px`;
      domEl.style.top = `${targetItem.y}px`;
    }
  });

  window.addEventListener('mouseup', () => {
    isDraggingElement = false;
  });

  // ---------------------------------------------------------------------------
  // CREATIVE EDITOR & TEMPLATES
  // ---------------------------------------------------------------------------

  function renderTemplatesList() {
    if (!templatesListContainer) return;
    templatesListContainer.innerHTML = TEMPLATES.map((tmpl) => `
      <div class="vision-template-card ${tmpl.id === selectedTemplateId ? 'active' : ''}"
        data-template-id="${tmpl.id}" tabindex="0">
        <span class="tmpl-icon">${tmpl.icon}</span>
        <div class="tmpl-info">
          <h4>${tmpl.name}</h4>
          <p>${tmpl.headline}</p>
        </div>
      </div>
    `).join('');

    templatesListContainer.querySelectorAll('.vision-template-card').forEach((card) => {
      card.addEventListener('click', () => {
        selectedTemplateId = card.getAttribute('data-template-id');
        const tmpl = TEMPLATES.find((t) => t.id === selectedTemplateId);
        if (tmpl) {
          editorHeadline = tmpl.headline;
          editorBodyText = tmpl.body;
          editorSubText = tmpl.sub;
          if (inputEditorTitle) inputEditorTitle.value = editorHeadline;
          if (inputEditorBody) inputEditorBody.value = editorBodyText;
          if (inputEditorSub) inputEditorSub.value = editorSubText;
        }
        renderTemplatesList();
      });
    });
  }

  function applySelectedTemplate() {
    const tmpl = TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!tmpl || !ctx || !mainCanvas) return;

    // 1. Reset canvas with template background
    setupCanvas(800, 600, tmpl.bg);

    // 2. Draw aesthetic template frame & borders
    ctx.save();
    ctx.strokeStyle = tmpl.frameBorder;
    ctx.lineWidth = 14;
    ctx.strokeRect(12, 12, canvasWidth - 24, canvasHeight - 24);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, canvasWidth - 52, canvasHeight - 52);

    // 3. Render Headline
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Cinzel", "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    ctx.fillText(inputEditorTitle?.value || editorHeadline, canvasWidth / 2, 160);

    // 4. Render Body Text (multi-line wrapped)
    ctx.fillStyle = '#FCE7F3';
    ctx.font = '500 21px "Plus Jakarta Sans", sans-serif';
    ctx.shadowBlur = 6;
    wrapText(ctx, inputEditorBody?.value || editorBodyText, canvasWidth / 2, 270, 640, 36);

    // 5. Render Subtext / Signature
    ctx.fillStyle = '#C084FC';
    ctx.font = 'italic 600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(inputEditorSub?.value || editorSubText, canvasWidth / 2, 450);

    ctx.restore();

    // 6. Populate default template stickers
    studioElements = (tmpl.defaultStickers || []).map((s) => ({
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'sticker',
      symbol: s.symbol,
      x: s.x,
      y: s.y,
      size: s.size
    }));
    renderElementsOnLayer();

    saveCanvasState();
    switchTab('canvas');
    if (onShowToast) onShowToast(`🎨 Template "${tmpl.name}" berhasil diterapkan!`);
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line.trim(), x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line.trim(), x, curY);
  }

  // ---------------------------------------------------------------------------
  // COMPOSITING & SAVING
  // ---------------------------------------------------------------------------

  function compositeFullArtworkDataUrl() {
    if (!mainCanvas) return '';
    // Create offscreen canvas to merge drawing + sticker layer
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = mainCanvas.width;
    exportCanvas.height = mainCanvas.height;
    const eCtx = exportCanvas.getContext('2d');

    // 1. Draw base canvas
    eCtx.drawImage(mainCanvas, 0, 0);

    // 2. Draw sticker elements
    studioElements.forEach((el) => {
      eCtx.font = `${el.size}px sans-serif`;
      eCtx.textBaseline = 'top';
      eCtx.fillText(el.symbol, el.x, el.y);
    });

    // 3. Studio watermark
    eCtx.save();
    eCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    eCtx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    eCtx.textAlign = 'right';
    eCtx.fillText('VISION STUDIO · SYMA’S PINWHEEL', exportCanvas.width - 24, exportCanvas.height - 18);
    eCtx.restore();

    return exportCanvas.toDataURL('image/png');
  }

  async function handleSaveArtwork() {
    const defaultTitle = currentEditingArtId ? 'Karya Diperbarui' : 'Karya Seni Syma';
    const title = prompt('Beri judul untuk karya seni ini:', defaultTitle);
    if (title === null) return; // User cancelled

    const fullDataUrl = compositeFullArtworkDataUrl();

    // Create thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 240;
    thumbCanvas.height = 180;
    const tCtx = thumbCanvas.getContext('2d');
    const img = new Image();
    img.src = fullDataUrl;
    await new Promise((r) => { img.onload = r; });
    tCtx.drawImage(img, 0, 0, 240, 180);
    const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.82);

    const tmpl = TEMPLATES.find((t) => t.id === selectedTemplateId);
    const category = tmpl ? tmpl.category : 'Digital Art';

    const artworkRecord = {
      id: currentEditingArtId || undefined,
      title: title.trim() || 'Karya Tanpa Judul',
      category,
      type: tmpl ? 'template_editor' : 'freehand',
      templateId: selectedTemplateId,
      dimensions: { width: canvasWidth, height: canvasHeight },
      bgColor: canvasBgColor,
      thumbnailDataUrl: thumbDataUrl,
      canvasDataUrl: fullDataUrl,
      editableState: {
        canvasBgColor,
        drawingDataUrl: mainCanvas.toDataURL('image/png'),
        studioElements: JSON.parse(JSON.stringify(studioElements)),
        templateId: selectedTemplateId,
        headline: inputEditorTitle?.value || editorHeadline,
        body: inputEditorBody?.value || editorBodyText,
        sub: inputEditorSub?.value || editorSubText
      }
    };

    const saved = await saveArtwork(artworkRecord, currentUid);
    currentEditingArtId = saved.id;

    if (onShowToast) onShowToast(`🎨 Karya "${saved.title}" berhasil disimpan ke Galeri!`, 'success');
    await loadGallery();
  }

  function handleDownloadArtwork() {
    const fullDataUrl = compositeFullArtworkDataUrl();
    const a = document.createElement('a');
    a.href = fullDataUrl;
    a.download = `Syma_VisionStudio_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // ---------------------------------------------------------------------------
  // CREATIVE GALLERY
  // ---------------------------------------------------------------------------

  async function loadGallery() {
    galleryArtworks = await loadAllArtworks(currentUid);
    renderGallery();
  }

  function renderGallery() {
    if (!galleryGrid) return;

    let filtered = galleryArtworks;
    if (activeGalleryCategory !== 'All Artworks') {
      filtered = galleryArtworks.filter((a) => a.category === activeGalleryCategory);
    }

    if (filtered.length === 0) {
      galleryGrid.innerHTML = '';
      if (galleryEmptyState) galleryEmptyState.style.display = 'flex';
      return;
    }

    if (galleryEmptyState) galleryEmptyState.style.display = 'none';

    galleryGrid.innerHTML = filtered.map((art) => {
      const dateStr = new Date(art.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const imgUrl = art.thumbnailDataUrl || art.canvasDataUrl || '';

      return `
        <div class="vision-gallery-card" data-art-id="${art.id}" tabindex="0">
          <div class="vision-card-thumb-wrap">
            <img src="${imgUrl}" alt="${art.title}" class="vision-card-thumb" loading="lazy" />
            <span class="vision-card-category-badge">${art.category || 'Digital Art'}</span>
          </div>
          <div class="vision-card-body">
            <h4 class="vision-card-title">${art.title || 'Karya Tanpa Judul'}</h4>
            <div class="vision-card-date">📅 ${dateStr}</div>
          </div>
        </div>
      `;
    }).join('');

    galleryGrid.querySelectorAll('.vision-gallery-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-art-id');
        const item = galleryArtworks.find((a) => a.id === id);
        if (item) openArtLightbox(item);
      });
    });
  }

  function openArtLightbox(artwork) {
    if (!artLightboxModal) return;
    activeLightboxArtwork = artwork;

    artLightboxImg.src = artwork.canvasDataUrl || artwork.thumbnailDataUrl;
    artLightboxTitle.textContent = artwork.title || 'Karya Tanpa Judul';
    artLightboxCategory.textContent = artwork.category || 'Digital Art';
    artLightboxDate.textContent = `Dibuat: ${new Date(artwork.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}`;

    artLightboxModal.classList.add('active');
    artLightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeArtLightbox() {
    if (!artLightboxModal) return;
    artLightboxModal.classList.remove('active');
    artLightboxModal.setAttribute('aria-hidden', 'true');
    activeLightboxArtwork = null;
  }

  async function resumeEditingArtwork(artId) {
    const artwork = await getArtworkById(artId, currentUid);
    if (!artwork || !artwork.editableState) {
      if (onShowToast) onShowToast('⚠️ Format karya ini tidak memiliki layer yang dapat diedit.', 'warning');
      return;
    }

    currentEditingArtId = artwork.id;
    const st = artwork.editableState;

    // Restore dimensions & background
    setupCanvas(
      artwork.dimensions?.width || 800,
      artwork.dimensions?.height || 600,
      st.canvasBgColor || '#18122B'
    );

    // Restore drawing on canvas
    if (st.drawingDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveCanvasState();
      };
      img.src = st.drawingDataUrl;
    }

    // Restore elements
    studioElements = Array.isArray(st.studioElements) ? JSON.parse(JSON.stringify(st.studioElements)) : [];
    renderElementsOnLayer();

    // Restore editor inputs
    if (st.headline && inputEditorTitle) inputEditorTitle.value = st.headline;
    if (st.body && inputEditorBody) inputEditorBody.value = st.body;
    if (st.sub && inputEditorSub) inputEditorSub.value = st.sub;

    closeArtLightbox();
    switchTab('canvas');
    if (onShowToast) onShowToast(`✏️ Melanjutkan pengeditan "${artwork.title}"!`);
  }

  // ---------------------------------------------------------------------------
  // NAVIGATION & TABS
  // ---------------------------------------------------------------------------

  function switchTab(tab) {
    activeTab = tab;
    if (tabBtnCanvas) tabBtnCanvas.classList.toggle('active', tab === 'canvas');
    if (tabBtnEditor) tabBtnEditor.classList.toggle('active', tab === 'editor');
    if (tabBtnGallery) tabBtnGallery.classList.toggle('active', tab === 'gallery');

    if (panelCanvas) panelCanvas.classList.toggle('active', tab === 'canvas');
    if (panelEditor) panelEditor.classList.toggle('active', tab === 'editor');
    if (panelGallery) panelGallery.classList.toggle('active', tab === 'gallery');

    if (tab === 'editor') {
      renderTemplatesList();
    } else if (tab === 'gallery') {
      loadGallery();
    }
  }

  // ---------------------------------------------------------------------------
  // EVENT BINDINGS
  // ---------------------------------------------------------------------------

  function bindEvents() {
    // Back navigation
    btnBack?.addEventListener('click', () => {
      closeVisionStudio();
      if (onNavigateBack) onNavigateBack();
    });

    // Switch to Photography
    btnSwitchPhoto?.addEventListener('click', () => {
      closeVisionStudio();
      if (onSwitchToPhotography) onSwitchToPhotography();
    });

    // Tabs
    tabBtnCanvas?.addEventListener('click', () => switchTab('canvas'));
    tabBtnEditor?.addEventListener('click', () => switchTab('editor'));
    tabBtnGallery?.addEventListener('click', () => switchTab('gallery'));

    // Tools
    btnToolBrush?.addEventListener('click', () => {
      currentTool = 'brush';
      btnToolBrush.classList.add('active');
      btnToolEraser?.classList.remove('active');
    });

    btnToolEraser?.addEventListener('click', () => {
      currentTool = 'eraser';
      btnToolEraser.classList.add('active');
      btnToolBrush?.classList.remove('active');
    });

    btnUndo?.addEventListener('click', undo);
    btnRedo?.addEventListener('click', redo);

    btnClearCanvas?.addEventListener('click', () => {
      if (confirm('Bersihkan seluruh kanvas lukis? Tindakan ini tidak dapat dibatalkan.')) {
        ctx.fillStyle = canvasBgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        studioElements = [];
        renderElementsOnLayer();
        saveCanvasState();
        if (onShowToast) onShowToast('Kanvas telah dibersihkan.');
      }
    });

    sliderBrushSize?.addEventListener('input', (e) => {
      brushSize = parseInt(e.target.value, 10);
      if (textBrushSize) textBrushSize.textContent = `${brushSize}px`;
    });

    customColorInput?.addEventListener('input', (e) => {
      setColor(e.target.value);
    });

    selectCanvasSize?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'square') setupCanvas(800, 800);
      else if (val === 'portrait') setupCanvas(600, 800);
      else if (val === 'landscape') setupCanvas(800, 600);
      else if (val === 'banner') setupCanvas(960, 540);
    });

    selectCanvasBg?.addEventListener('change', (e) => {
      canvasBgColor = e.target.value;
      ctx.fillStyle = canvasBgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      saveCanvasState();
    });

    // Canvas drawing mouse events
    if (mainCanvas) {
      mainCanvas.addEventListener('mousedown', (e) => {
        const { x, y } = getCanvasCoords(e.clientX, e.clientY);
        startDrawing(x, y);
      });

      mainCanvas.addEventListener('mousemove', (e) => {
        const { x, y } = getCanvasCoords(e.clientX, e.clientY);
        drawMove(x, y);
      });

      window.addEventListener('mouseup', stopDrawing);

      // Touch events for mobile/tablet drawing
      mainCanvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          const { x, y } = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
          startDrawing(x, y);
        }
      }, { passive: false });

      mainCanvas.addEventListener('touchmove', (e) => {
        if (isDrawing && e.touches.length > 0) {
          e.preventDefault();
          const { x, y } = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
          drawMove(x, y);
        }
      }, { passive: false });

      mainCanvas.addEventListener('touchend', stopDrawing);
    }

    // Creative editor apply button
    btnApplyTemplate?.addEventListener('click', applySelectedTemplate);

    // Save & Download buttons
    btnSaveArtwork?.addEventListener('click', handleSaveArtwork);
    btnDownloadArtwork?.addEventListener('click', handleDownloadArtwork);

    // Gallery category filter tabs
    galleryCatTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        galleryCatTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        activeGalleryCategory = tab.getAttribute('data-gallery-cat') || 'All Artworks';
        renderGallery();
      });
    });

    // Lightbox Modal actions
    btnArtLightboxClose?.addEventListener('click', closeArtLightbox);
    artLightboxModal?.addEventListener('click', (e) => {
      if (e.target === artLightboxModal) closeArtLightbox();
    });

    btnArtLightboxDownload?.addEventListener('click', () => {
      if (!activeLightboxArtwork) return;
      const a = document.createElement('a');
      a.href = activeLightboxArtwork.canvasDataUrl || activeLightboxArtwork.thumbnailDataUrl;
      a.download = `${(activeLightboxArtwork.title || 'Syma_Artwork').replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    btnArtLightboxEdit?.addEventListener('click', () => {
      if (activeLightboxArtwork) {
        resumeEditingArtwork(activeLightboxArtwork.id);
      }
    });

    btnArtLightboxRename?.addEventListener('click', async () => {
      if (!activeLightboxArtwork) return;
      const newTitle = prompt('Ubah judul karya seni:', activeLightboxArtwork.title);
      if (newTitle !== null && newTitle.trim()) {
        await renameArtwork(activeLightboxArtwork.id, newTitle.trim(), currentUid);
        activeLightboxArtwork.title = newTitle.trim();
        artLightboxTitle.textContent = activeLightboxArtwork.title;
        if (onShowToast) onShowToast('Judul karya berhasil diperbarui!');
        await loadGallery();
      }
    });

    btnArtLightboxDelete?.addEventListener('click', async () => {
      if (!activeLightboxArtwork) return;
      if (confirm(`Apakah kamu yakin ingin menghapus karya "${activeLightboxArtwork.title}"?`)) {
        await deleteArtwork(activeLightboxArtwork.id, currentUid);
        closeArtLightbox();
        if (onShowToast) onShowToast('Karya seni telah dihapus dari galeri.');
        await loadGallery();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------

  function openVisionStudio(uid = SYMA_CANONICAL_UID, initialTab = 'canvas') {
    currentUid = uid || SYMA_CANONICAL_UID;
    viewEl.classList.add('active');
    viewEl.setAttribute('aria-hidden', 'false');

    renderColorLab();
    renderStickersBar();
    renderTemplatesList();

    if (!ctx) {
      setupCanvas(800, 600, '#18122B');
    }

    switchTab(initialTab);
    loadGallery();
  }

  function closeVisionStudio() {
    viewEl.classList.remove('active');
    viewEl.setAttribute('aria-hidden', 'true');
    closeArtLightbox();
  }

  bindEvents();

  return {
    openVisionStudio,
    closeVisionStudio,
    switchTab,
    setupCanvas,
    loadGallery,
    resumeEditingArtwork
  };
}

