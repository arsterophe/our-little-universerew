/**
 * OUR LITTLE PHOTOBOOTH — INTERACTIVE STUDIO ENGINE
 * Comprehensive Photo Studio, Backgrounds, Stickers, Text, Multi-Layouts, Undo/Redo & Memory Gallery
 * Modular architecture configured for YAWN (Akhira ⚡) with cross-universe capability.
 */

import {
  savePhotoboothMemory,
  getPhotoboothMemories,
  getPhotoboothMemoryById,
  deletePhotoboothMemory,
  saveCustomAsset,
  getCustomAssets
} from './photobooth_storage.js';

// --- 1. BACKGROUND PRESETS (10 THEMATIC PRESETS) ---
export const PB_BACKGROUND_PRESETS = [
  {
    id: 'astral_ocean',
    name: 'Astral Ocean',
    icon: '🌊',
    bg: 'linear-gradient(180deg, #022c43 0%, #053f5c 50%, #115173 100%)',
    theme: 'yawn',
    desc: 'Samudra dalam bertabur cahaya bioluminescence dan kristal laut YAWN'
  },
  {
    id: 'galaxy_night',
    name: 'Galaxy Night',
    icon: '🌌',
    bg: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
    theme: 'galaxy',
    desc: 'Latar kosmik malam berbintang dan nebula gemerlap'
  },
  {
    id: 'flower_garden',
    name: 'Flower Garden',
    icon: '🌸',
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #ecfdf5 100%)',
    theme: 'garden',
    desc: 'Taman bunga pastel bermekaran dengan kelembutan musim semi'
  },
  {
    id: 'japanese_garden',
    name: 'Japanese Garden',
    icon: '🎋',
    bg: 'linear-gradient(135deg, #fdf4ff 0%, #ede9fe 50%, #fbcfe8 100%)',
    theme: 'zen',
    desc: 'Suaka ketenangan zen berhias kelopak teratai dan sakura'
  },
  {
    id: 'retro_vintage',
    name: 'Retro Vintage',
    icon: '🎞️',
    bg: 'linear-gradient(135deg, #f5efe6 0%, #e8dec8 50%, #d8caa8 100%)',
    theme: 'vintage',
    desc: 'Kertas foto kuno bernuansa sepia hangat dan serat film analog'
  },
  {
    id: 'cozy_room',
    name: 'Cozy Room',
    icon: '🛋️',
    bg: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fbcfe8 100%)',
    theme: 'cozy',
    desc: 'Ruang santai hangat dengan cahaya temaram dan perapian'
  },
  {
    id: 'crystal_palace',
    name: 'Crystal Palace',
    icon: '💎',
    bg: 'linear-gradient(180deg, #082f49 0%, #0284c7 50%, #38bdf8 100%)',
    theme: 'crystal',
    desc: 'Istana kristal bawah laut dengan pilar es dan pantulan air jernih'
  },
  {
    id: 'dreamy_clouds',
    name: 'Dreamy Clouds',
    icon: '☁️',
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #e0e7ff 50%, #ddd6fe 100%)',
    theme: 'clouds',
    desc: 'Awan kembang gula pastel melayang di langit senja impian'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    icon: '🌅',
    bg: 'linear-gradient(180deg, #7c2d12 0%, #ea580c 40%, #f59e0b 70%, #831843 100%)',
    theme: 'sunset',
    desc: 'Cahaya keemasan matahari terbenam menyatu dengan ungu temaram'
  },
  {
    id: 'seasonal',
    name: 'Seasonal Collection',
    icon: '❄️',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #38bdf8 100%)',
    theme: 'seasonal',
    desc: 'Koleksi musiman salju perak bercampur percikan kembang api festival'
  }
];

// --- 2. STICKER CATEGORIES (11 DIVERSE CATEGORIES) ---
export const PB_STICKER_CATEGORIES = [
  {
    id: 'stars_moon',
    name: 'Stars & Moon',
    icon: '⭐',
    stickers: ['⭐', '🌟', '✨', '💫', '🌙', '☾', '🪐', '✦', '✧', '🌠']
  },
  {
    id: 'flowers',
    name: 'Flowers',
    icon: '🌸',
    stickers: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🍃', '🌿', '🌱']
  },
  {
    id: 'hearts',
    name: 'Hearts',
    icon: '💖',
    stickers: ['💖', '💕', '💗', '💓', '💞', '💘', '💌', '❤️', '🫶', '💝']
  },
  {
    id: 'butterflies',
    name: 'Butterflies',
    icon: '🦋',
    stickers: ['🦋', '🕊️', '🪽', '🎐', '✨', '🫧', '🪶']
  },
  {
    id: 'ribbons_bows',
    name: 'Ribbons & Bows',
    icon: '🎀',
    stickers: ['🎀', '🎗️', '🎁', '🪄', '👑', '💎', '🪅', '🧁']
  },
  {
    id: 'cute_animals',
    name: 'Cute Animals',
    icon: '🐱',
    stickers: ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐋', '🐉', '🐥', '🦄']
  },
  {
    id: 'food_drinks',
    name: 'Food & Drinks',
    icon: '🧋',
    stickers: ['☕', '🍰', '🧋', '🍩', '🍓', '🍦', '🍡', '🍉', '🥐', '🧁']
  },
  {
    id: 'kawaii_expr',
    name: 'Kawaii Expressions',
    icon: '◕‿◕',
    stickers: ['(◕‿◕)', '(≧◡≦)', '٩(◕‿◕)۶', '(｡♥‿♥｡)', 'ദ്ദി(˵ •̀ ᴗ - ˵ )', '(✿◠‿◠)', '(⁄ ⁄•⁄ω⁄•⁄ ⁄)']
  },
  {
    id: 'doodles',
    name: 'Doodles',
    icon: '➰',
    stickers: ['➰', '〰️', '✦', '𖡼', '𖤣', '𖥧', '𖥸', '☼', '✎', '〰']
  },
  {
    id: 'seasonal_decor',
    name: 'Seasonal Decorations',
    icon: '🍁',
    stickers: ['🍁', '❄️', '⛄', '🎆', '🎃', '🎄', '🎐', '🏖️', '🎋', '🎏']
  },
  {
    id: 'fantasy_elem',
    name: 'Fantasy Elements',
    icon: '🔮',
    stickers: ['🔮', '⚡', '👑', '💎', '🫧', '🪷', '🌊', '🗝️', '🪄', '🛡️']
  }
];

// --- 3. PHOTO LAYOUTS (10 COMPREHENSIVE LAYOUTS) ---
export const PB_STUDIO_LAYOUTS = [
  {
    id: 'single',
    name: 'Single Portrait',
    icon: '👤',
    desc: '1 Frame Fokus Utama',
    slotsCount: 1,
    aspectRatio: '3/4'
  },
  {
    id: 'two_person',
    name: 'Two Person',
    icon: '👥',
    desc: 'Duo Berdampingan',
    slotsCount: 2,
    aspectRatio: '3/4'
  },
  {
    id: 'three_person',
    name: 'Three Person',
    icon: '✨',
    desc: 'Trio 3 Panel Manis',
    slotsCount: 3,
    aspectRatio: '3/4'
  },
  {
    id: 'four_grid',
    name: 'Four Grid',
    icon: '🌟',
    desc: 'Grid 2x2 Simetris',
    slotsCount: 4,
    aspectRatio: '1/1'
  },
  {
    id: 'five_friends',
    name: 'Five Friends',
    icon: '💫',
    desc: '1 Sorotan Utama + 4 Sahabat',
    slotsCount: 5,
    aspectRatio: '3/4'
  },
  {
    id: 'six_friends',
    name: 'Six Friends',
    icon: '🎉',
    desc: 'Grid 2x3 Formasi Lengkap',
    slotsCount: 6,
    aspectRatio: '3/4'
  },
  {
    id: 'seven_friends',
    name: 'Seven Friends',
    icon: '🌈',
    desc: 'Lingkaran 7 Bintang Sahabat',
    slotsCount: 7,
    aspectRatio: '3/4'
  },
  {
    id: 'full_house',
    name: 'Full House (8 Sahabat)',
    icon: '🌌',
    desc: 'Semua 8 Karakter Universe',
    slotsCount: 8,
    aspectRatio: '3/4'
  },
  {
    id: 'classic_strip',
    name: 'Classic Photo Strip',
    icon: '🎞️',
    desc: 'Strip Vertikal Vintage 4 Pose',
    slotsCount: 4,
    aspectRatio: '1/3'
  },
  {
    id: 'collage',
    name: 'Artistic Collage',
    icon: '🖼️',
    desc: 'Kolase Bebas Polaroid Bertingkat',
    slotsCount: 4,
    aspectRatio: '3/4'
  }
];

// --- 4. TYPOGRAPHY & FONTS ---
export const PB_FONTS = [
  { id: 'modern', name: 'Modern Sans', family: "'Plus Jakarta Sans', sans-serif" },
  { id: 'handwriting', name: 'Handwriting Cursive', family: "'Caveat', cursive, sans-serif" },
  { id: 'serif', name: 'Elegant Serif', family: "'Playfair Display', serif" },
  { id: 'typewriter', name: 'Retro Typewriter', family: "'Courier New', monospace" },
  { id: 'cute', name: 'Cute Rounded', family: "'Fredoka', 'Quicksand', sans-serif" }
];

// Universe Character Visual Metadata for Studio Engine
export const PB_UNIVERSE_INFO = {
  nyanya: {
    name: 'Nyanya',
    symbol: '⭐',
    universe: 'KIDULT',
    preset: 'galaxy_night',
    border: '#f472b6',
    stickers: ['⭐', '💖'],
    text: 'NYANYA ⭐ · TWINKLING KIDULT',
    shadow: 'rgba(49, 46, 129, 0.85)'
  },
  lala: {
    name: 'Lala',
    symbol: '☀️',
    universe: 'TO YOU',
    preset: 'flower_garden',
    border: '#fbbf24',
    stickers: ['☀️', '🌸'],
    text: 'LALA ☀️ · WARM MORNING SUNSHINE',
    shadow: 'rgba(6, 95, 70, 0.85)'
  },
  lele: {
    name: 'Lele',
    symbol: '🌙',
    universe: 'SHADOW',
    preset: 'japanese_garden',
    border: '#a855f7',
    stickers: ['🌙', '✨'],
    text: 'LELE 🌙 · CRYSTAL MOONLIGHT',
    shadow: 'rgba(30, 27, 75, 0.85)'
  },
  abil: {
    name: 'Syma',
    symbol: '☁️',
    universe: 'PINWHEEL',
    preset: 'dreamy_clouds',
    border: '#38bdf8',
    stickers: ['☁️', '🍃'],
    text: 'SYMA ☁️ · GENTLE PINWHEEL BREEZE',
    shadow: 'rgba(12, 74, 110, 0.85)'
  },
  syma: {
    name: 'Syma',
    symbol: '☁️',
    universe: 'PINWHEEL',
    preset: 'dreamy_clouds',
    border: '#38bdf8',
    stickers: ['☁️', '🍃'],
    text: 'SYMA ☁️ · GENTLE PINWHEEL BREEZE',
    shadow: 'rgba(12, 74, 110, 0.85)'
  },
  akhira: {
    name: 'Akhira',
    symbol: '⚡',
    universe: 'YAWN',
    preset: 'astral_ocean',
    border: '#38bdf8',
    stickers: ['⚡', '🌊'],
    text: 'AKHIRA ⚡ · ASTRAL OCEAN',
    shadow: 'rgba(2, 44, 67, 0.85)'
  },
  ela: {
    name: 'Ela',
    symbol: '🪷',
    universe: 'US AGAIN',
    preset: 'flower_garden',
    border: '#ec4899',
    stickers: ['🪷', '🌸'],
    text: 'ELA 🪷 · SILENT LOTUS MEMORY',
    shadow: 'rgba(112, 26, 117, 0.85)'
  },
  ruben: {
    name: 'Ruben',
    symbol: '🐉',
    universe: 'ASH',
    preset: 'sunset',
    border: '#f97316',
    stickers: ['🐉', '🔥'],
    text: 'RUBEN 🐉 · EMBER DRAGON FLAME',
    shadow: 'rgba(124, 45, 18, 0.85)'
  },
  royan: {
    name: 'Royan',
    symbol: '🎆',
    universe: 'HOT',
    preset: 'galaxy_night',
    border: '#f43f5e',
    stickers: ['🎆', '✨'],
    text: 'ROYAN 🎆 · SPARKLING FESTIVAL NIGHT',
    shadow: 'rgba(136, 19, 55, 0.85)'
  }
};

// Default Project Canvas State (Universe & Character Aware)
export function createDefaultStudioState(activeChar = 'akhira') {
  const canon = activeChar === 'syma' ? 'abil' : (activeChar || 'akhira');
  const info = PB_UNIVERSE_INFO[canon] || PB_UNIVERSE_INFO.akhira;

  return {
    version: '1.0',
    title: `Kenangan Manis di ${info.universe} ${info.symbol}`,
    activeChar: canon,
    participants: [canon],
    layout: 'four_grid',
    background: {
      type: 'preset',
      presetId: info.preset,
      customUrl: null,
      panX: 0,
      panY: 0,
      zoom: 1.0,
      fit: 'cover'
    },
    frame: {
      borderColor: info.border,
      borderWidth: 14,
      borderRadius: 18,
      shadow: true,
      showDate: true,
      dateText: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      captionText: `Our Little Universe · ${info.universe} ✦`
    },
    stickers: [
      {
        id: 'stk-init-1',
        type: 'emoji',
        content: info.stickers[0] || '✨',
        x: 60,
        y: 60,
        scale: 1.4,
        rotation: -12,
        opacity: 0.95,
        zIndex: 10
      },
      {
        id: 'stk-init-2',
        type: 'emoji',
        content: info.stickers[1] || '🌟',
        x: 880,
        y: 70,
        scale: 1.3,
        rotation: 15,
        opacity: 0.9,
        zIndex: 11
      }
    ],
    texts: [
      {
        id: 'txt-init-1',
        text: info.text,
        font: "'Plus Jakarta Sans', sans-serif",
        size: 26,
        color: '#ffffff',
        x: 480,
        y: 1220,
        rotation: 0,
        shadow: true,
        shadowColor: info.shadow,
        bold: true,
        italic: false,
        zIndex: 20
      }
    ],
    poses: {}, // { [slotIndex]: dataUrl }
    zoomLevel: 1.0
  };
}

/**
 * Photobooth Studio Manager Class
 */
export class PhotoboothStudioManager {
  constructor(options = {}) {
    this.activeChar = options.activeChar || 'akhira';
    this.state = createDefaultStudioState(this.activeChar);
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 30;
    this.selectedElement = null; // { type: 'sticker'|'text', id: string }
    this.listeners = new Set();
    this.canvasEl = null;
    this.ctx = null;
  }

  setCanvas(canvas) {
    this.canvasEl = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
  }

  setActiveChar(charKey) {
    const canon = charKey === 'syma' ? 'abil' : (charKey || 'akhira');
    this.activeChar = canon;
    this.state.activeChar = canon;
    if (!this.state.participants.includes(canon)) {
      this.state.participants = [canon, ...this.state.participants.filter(p => p !== canon)];
    }
    const def = createDefaultStudioState(canon);
    if (!this.undoStack.length) {
      this.state.title = def.title;
      this.state.background.presetId = def.background.presetId;
      this.state.frame.borderColor = def.frame.borderColor;
      this.state.frame.captionText = def.frame.captionText;
      this.state.stickers = def.stickers;
      this.state.texts = def.texts;
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.state); } catch (e) { console.error(e); }
    });
  }

  // --- UNDO / REDO HISTORY STACK ---
  pushHistory() {
    const snapshot = JSON.stringify(this.state);
    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notify();
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) return false;
    const currentState = JSON.stringify(this.state);
    this.redoStack.push(currentState);
    const prevState = this.undoStack.pop();
    this.state = JSON.parse(prevState);
    this.selectedElement = null;
    this.notify();
    return true;
  }

  redo() {
    if (!this.canRedo()) return false;
    const currentState = JSON.stringify(this.state);
    this.undoStack.push(currentState);
    const nextState = this.redoStack.pop();
    this.state = JSON.parse(nextState);
    this.selectedElement = null;
    this.notify();
    return true;
  }

  // --- BACKGROUND CONTROLS ---
  setBackgroundPreset(presetId) {
    this.pushHistory();
    this.state.background.type = 'preset';
    this.state.background.presetId = presetId;
    this.notify();
  }

  setCustomBackground(dataUrl) {
    this.pushHistory();
    this.state.background.type = 'custom';
    this.state.background.customUrl = dataUrl;
    this.notify();
  }

  updateBackgroundTransform({ panX, panY, zoom, fit }) {
    this.pushHistory();
    if (panX !== undefined) this.state.background.panX = panX;
    if (panY !== undefined) this.state.background.panY = panY;
    if (zoom !== undefined) this.state.background.zoom = Math.max(0.5, Math.min(3.0, zoom));
    if (fit !== undefined) this.state.background.fit = fit;
    this.notify();
  }

  // --- STICKER CONTROLS ---
  addSticker(stickerContent, type = 'emoji', options = {}) {
    this.pushHistory();
    const newSticker = {
      id: `stk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: type,
      content: stickerContent,
      x: options.x !== undefined ? options.x : 480,
      y: options.y !== undefined ? options.y : 600,
      scale: options.scale || 1.2,
      rotation: options.rotation || 0,
      opacity: options.opacity || 1.0,
      zIndex: (this.state.stickers.length + 1) * 2
    };
    this.state.stickers.push(newSticker);
    this.selectedElement = { type: 'sticker', id: newSticker.id };
    this.notify();
    return newSticker;
  }

  updateSticker(id, updates) {
    const stk = this.state.stickers.find(s => s.id === id);
    if (!stk) return;
    this.pushHistory();
    Object.assign(stk, updates);
    this.notify();
  }

  duplicateSticker(id) {
    const stk = this.state.stickers.find(s => s.id === id);
    if (!stk) return;
    this.pushHistory();
    const cloned = {
      ...stk,
      id: `stk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x: stk.x + 30,
      y: stk.y + 30
    };
    this.state.stickers.push(cloned);
    this.selectedElement = { type: 'sticker', id: cloned.id };
    this.notify();
  }

  deleteSticker(id) {
    const idx = this.state.stickers.findIndex(s => s.id === id);
    if (idx < 0) return;
    this.pushHistory();
    this.state.stickers.splice(idx, 1);
    if (this.selectedElement && this.selectedElement.id === id) {
      this.selectedElement = null;
    }
    this.notify();
  }

  bringStickerForward(id) {
    const idx = this.state.stickers.findIndex(s => s.id === id);
    if (idx < 0 || idx === this.state.stickers.length - 1) return;
    this.pushHistory();
    const item = this.state.stickers.splice(idx, 1)[0];
    this.state.stickers.push(item);
    this.notify();
  }

  sendStickerBackward(id) {
    const idx = this.state.stickers.findIndex(s => s.id === id);
    if (idx <= 0) return;
    this.pushHistory();
    const item = this.state.stickers.splice(idx, 1)[0];
    this.state.stickers.unshift(item);
    this.notify();
  }

  // --- TEXT CONTROLS ---
  addText(textContent, options = {}) {
    this.pushHistory();
    const newText = {
      id: `txt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text: textContent || 'Kenangan Bersama ✦',
      font: options.font || "'Plus Jakarta Sans', sans-serif",
      size: options.size || 28,
      color: options.color || '#ffffff',
      x: options.x !== undefined ? options.x : 480,
      y: options.y !== undefined ? options.y : 1100,
      rotation: options.rotation || 0,
      shadow: options.shadow !== undefined ? options.shadow : true,
      shadowColor: options.shadowColor || 'rgba(0,0,0,0.8)',
      bold: options.bold || true,
      italic: options.italic || false,
      zIndex: 50
    };
    this.state.texts.push(newText);
    this.selectedElement = { type: 'text', id: newText.id };
    this.notify();
    return newText;
  }

  updateText(id, updates) {
    const txt = this.state.texts.find(t => t.id === id);
    if (!txt) return;
    this.pushHistory();
    Object.assign(txt, updates);
    this.notify();
  }

  deleteText(id) {
    const idx = this.state.texts.findIndex(t => t.id === id);
    if (idx < 0) return;
    this.pushHistory();
    this.state.texts.splice(idx, 1);
    if (this.selectedElement && this.selectedElement.id === id) {
      this.selectedElement = null;
    }
    this.notify();
  }

  // --- LAYOUT & FRAME CONTROLS ---
  setLayout(layoutId) {
    if (!PB_STUDIO_LAYOUTS.find(l => l.id === layoutId)) return;
    this.pushHistory();
    this.state.layout = layoutId;
    this.notify();
  }

  setParticipants(participants) {
    if (Array.isArray(participants) && participants.length > 0) {
      this.state.participants = [...participants];
      this.notify();
    }
  }

  setPoses(poses) {
    if (Array.isArray(poses)) {
      this.state.poses = [...poses];
      this.notify();
    }
  }

  clearCanvas() {
    this.pushHistory();
    this.state.stickers = [];
    this.state.texts = [];
    this.selectedElement = null;
    this.notify();
  }

  duplicateSelectedSticker() {
    if (!this.selectedElement || this.selectedElement.type !== 'sticker') return null;
    return this.duplicateSticker(this.selectedElement.id);
  }

  deleteSelectedSticker() {
    if (!this.selectedElement || this.selectedElement.type !== 'sticker') return false;
    this.deleteSticker(this.selectedElement.id);
    return true;
  }

  findElementAt(x, y) {
    if (Array.isArray(this.state.texts)) {
      for (let i = this.state.texts.length - 1; i >= 0; i--) {
        const txt = this.state.texts[i];
        const dist = Math.hypot(txt.x - x, txt.y - y);
        if (dist <= (txt.fontSize || 28) * 1.5) {
          return { type: 'text', id: txt.id, element: txt };
        }
      }
    }
    if (Array.isArray(this.state.stickers)) {
      for (let i = this.state.stickers.length - 1; i >= 0; i--) {
        const stk = this.state.stickers[i];
        const size = stk.scale || 100;
        const dist = Math.hypot(stk.x - x, stk.y - y);
        if (dist <= size / 1.5) {
          return { type: 'sticker', id: stk.id, element: stk };
        }
      }
    }
    return null;
  }

  initCanvasInteractions(canvasEl) {
    if (!canvasEl || canvasEl.__pbInteractionsInitialized) return;
    canvasEl.__pbInteractionsInitialized = true;
    this.setCanvas(canvasEl);

    let isDragging = false;
    let dragElement = null;
    let dragStartPos = { x: 0, y: 0 };
    let hasMoved = false;

    const getCanvasCoords = (e) => {
      const rect = canvasEl.getBoundingClientRect();
      const scaleX = canvasEl.width / rect.width;
      const scaleY = canvasEl.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    canvasEl.addEventListener('pointerdown', (e) => {
      const { x, y } = getCanvasCoords(e);
      const hit = this.findElementAt(x, y);
      if (hit) {
        this.selectedElement = { type: hit.type, id: hit.id };
        dragElement = hit.element;
        dragStartPos = { x: hit.element.x - x, y: hit.element.y - y };
        isDragging = true;
        hasMoved = false;
        canvasEl.setPointerCapture(e.pointerId);
      } else {
        if (this.selectedElement) {
          this.selectedElement = null;
          this.notify();
          this.renderInteractiveCanvas();
        }
      }
      this.notify();
      this.renderInteractiveCanvas();
    });

    canvasEl.addEventListener('pointermove', (e) => {
      if (!isDragging || !dragElement) return;
      const { x, y } = getCanvasCoords(e);
      dragElement.x = Math.round(x + dragStartPos.x);
      dragElement.y = Math.round(y + dragStartPos.y);
      hasMoved = true;
      this.renderInteractiveCanvas();
    });

    const endDrag = (e) => {
      if (isDragging) {
        isDragging = false;
        dragElement = null;
        if (hasMoved) {
          this.pushHistory();
        }
        try { canvasEl.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };

    canvasEl.addEventListener('pointerup', endDrag);
    canvasEl.addEventListener('pointercancel', endDrag);
  }

  async renderInteractiveCanvas(targetCanvas = this.canvasEl) {
    if (!targetCanvas) return;
    const isStrip = this.state.layout === 'classic_strip';
    const baseW = isStrip ? 480 : 960;
    const baseH = isStrip ? 1440 : 1280;

    targetCanvas.width = baseW;
    targetCanvas.height = baseH;
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Background
    if (this.state.background.type === 'preset') {
      const preset = PB_BACKGROUND_PRESETS.find(p => p.id === this.state.background.presetId) || PB_BACKGROUND_PRESETS[0];
      const grad = ctx.createLinearGradient(0, 0, 0, baseH);
      if (preset.id === 'astral_ocean') {
        grad.addColorStop(0, '#022c43');
        grad.addColorStop(0.5, '#053f5c');
        grad.addColorStop(1, '#115173');
      } else if (preset.id === 'galaxy_night') {
        grad.addColorStop(0, '#090a0f');
        grad.addColorStop(0.5, '#1b2735');
        grad.addColorStop(1, '#090a0f');
      } else if (preset.id === 'crystal_palace') {
        grad.addColorStop(0, '#082f49');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#38bdf8');
      } else if (preset.id === 'flower_garden') {
        grad.addColorStop(0, '#fdf2f8');
        grad.addColorStop(0.5, '#fce7f3');
        grad.addColorStop(1, '#dcfce7');
      } else if (preset.id === 'sunset') {
        grad.addColorStop(0, '#4a044e');
        grad.addColorStop(0.5, '#9d174d');
        grad.addColorStop(1, '#f97316');
      } else {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, baseW, baseH);
    } else if (this.state.background.customUrl) {
      try {
        const bgImg = await loadImage(this.state.background.customUrl);
        const { panX = 0, panY = 0, zoom = 1.0 } = this.state.background;
        const dw = baseW * zoom;
        const dh = baseH * zoom;
        const dx = (baseW - dw) / 2 + panX;
        const dy = (baseH - dh) / 2 + panY;
        ctx.drawImage(bgImg, dx, dy, dw, dh);
      } catch (_) {
        ctx.fillStyle = '#022c43';
        ctx.fillRect(0, 0, baseW, baseH);
      }
    }

    // 2. Frame Border
    const borderW = this.state.frame.borderWidth || 12;
    ctx.strokeStyle = this.state.frame.borderColor || '#38bdf8';
    ctx.lineWidth = borderW;
    ctx.strokeRect(borderW / 2, borderW / 2, baseW - borderW, baseH - borderW);

    // 3. Photo Slots & Characters
    const slots = getLayoutSlotCoordinates(this.state.layout, baseW, baseH, borderW);
    const participants = this.state.participants.length > 0 ? this.state.participants : ['akhira'];

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const charKey = participants[i % participants.length];
      const charMeta = PB_CHARACTERS_REF[charKey] || PB_CHARACTERS_REF.akhira;
      const poseImgUrl = this.state.poses[i] || null;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(slot.x, slot.y, slot.w, slot.h, 12);
      } else {
        ctx.rect(slot.x, slot.y, slot.w, slot.h);
      }
      ctx.fill();
      ctx.stroke();
      ctx.clip();

      if (poseImgUrl) {
        try {
          const img = await loadImage(poseImgUrl);
          ctx.drawImage(img, slot.x, slot.y, slot.w, slot.h);
        } catch (_) {}
      } else if (charMeta?.avatar) {
        try {
          const avImg = await loadImage(charMeta.avatar);
          ctx.drawImage(avImg, slot.x, slot.y, slot.w, slot.h);
        } catch (_) {
          ctx.fillStyle = charMeta?.badgeColor || '#0284c7';
          ctx.font = `bold ${Math.round(slot.w * 0.22)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(charMeta?.symbol || '⚡', slot.x + slot.w / 2, slot.y + slot.h / 2 - 20);
        }
      }

      // Name banner on slot
      ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
      ctx.fillRect(slot.x, slot.y + slot.h - 32, slot.w, 32);
      ctx.fillStyle = '#f0f9ff';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${charMeta?.symbol || '⚡'} ${charMeta?.name || 'Akhira'}`, slot.x + slot.w / 2, slot.y + slot.h - 11);
      ctx.restore();
    }

    // 4. Stickers
    for (const stk of this.state.stickers) {
      ctx.save();
      ctx.translate(stk.x, stk.y);
      ctx.rotate((stk.rotation * Math.PI) / 180);
      ctx.globalAlpha = stk.opacity !== undefined ? stk.opacity : 1.0;

      if (stk.type === 'emoji') {
        ctx.font = `${stk.scale || 100}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stk.content, 0, 0);
      } else if (stk.type === 'custom' || stk.type === 'svg') {
        try {
          const stkImg = await loadImage(stk.content);
          const size = stk.scale || 120;
          ctx.drawImage(stkImg, -size / 2, -size / 2, size, size);
        } catch (_) {}
      }

      // Highlight selected
      if (this.selectedElement && this.selectedElement.id === stk.id) {
        ctx.globalAlpha = 1.0;
        const boxSize = (stk.scale || 100) + 16;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([6, 4]);
        ctx.strokeRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize);
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff';
        [-boxSize / 2, boxSize / 2].forEach(hx => {
          [-boxSize / 2, boxSize / 2].forEach(hy => {
            ctx.fillRect(hx - 4, hy - 4, 8, 8);
          });
        });
      }
      ctx.restore();
    }

    // 5. Texts
    for (const txt of this.state.texts) {
      ctx.save();
      ctx.translate(txt.x, txt.y);
      ctx.rotate((txt.rotation * Math.PI) / 180);
      ctx.font = `${txt.fontSize || 28}px ${txt.fontFamily || 'Plus Jakarta Sans, sans-serif'}`;
      ctx.fillStyle = txt.color || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (txt.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      ctx.fillText(txt.content, 0, 0);

      // Highlight selected
      if (this.selectedElement && this.selectedElement.id === txt.id) {
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        const metrics = ctx.measureText(txt.content);
        const tw = metrics.width + 20;
        const th = (txt.fontSize || 28) + 14;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([6, 4]);
        ctx.strokeRect(-tw / 2, -th / 2, tw, th);
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff';
        [-tw / 2, tw / 2].forEach(hx => {
          [-th / 2, th / 2].forEach(hy => {
            ctx.fillRect(hx - 4, hy - 4, 8, 8);
          });
        });
      }
      ctx.restore();
    }

    // 6. Date stamp if enabled
    if (this.state.frame.showDate) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '13px "Courier New", monospace';
      ctx.textAlign = 'right';
      const dateStr = new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      ctx.fillText(`⚡ YAWN PHOTOBOOTH · ${dateStr}`, baseW - borderW - 14, baseH - borderW - 10);
      ctx.restore();
    }
  }

  updateFrame(frameUpdates) {
    this.pushHistory();
    Object.assign(this.state.frame, frameUpdates);
    this.notify();
  }

  // --- CANVAS ZOOM ---
  setCanvasZoom(zoom) {
    this.state.zoomLevel = Math.max(0.5, Math.min(2.5, zoom));
    this.notify();
  }

  zoomIn() {
    this.setCanvasZoom(this.state.zoomLevel + 0.15);
  }

  zoomOut() {
    this.setCanvasZoom(this.state.zoomLevel - 0.15);
  }

  resetZoom() {
    this.setCanvasZoom(1.0);
  }

  // --- PROJECT EXPORT & MEMORY GALLERY ---
  async saveToGallery(title = null) {
    if (title) this.state.title = title;
    const finalDataUrl = await this.exportCompositeImage('image/png', 0.95);
    const previewDataUrl = await this.exportCompositeImage('image/jpeg', 0.6, 320);

    const info = PB_UNIVERSE_INFO[this.activeChar] || PB_UNIVERSE_INFO.akhira;
    const authorName = info ? `${info.name} ${info.symbol}` : this.activeChar;

    const memoryItem = {
      id: `pb-mem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: this.state.title,
      author: this.activeChar,
      authorName: authorName,
      participants: [...this.state.participants],
      layout: this.state.layout,
      imageDataUrl: finalDataUrl,
      previewUrl: previewDataUrl,
      projectData: JSON.parse(JSON.stringify(this.state)),
      createdAt: Date.now()
    };

    return await savePhotoboothMemory(memoryItem);
  }

  loadProject(projectData) {
    this.pushHistory();
    this.state = JSON.parse(JSON.stringify(projectData));
    this.selectedElement = null;
    this.notify();
  }

  /**
   * High-resolution canvas compositing and export
   */
  async exportCompositeImage(format = 'image/png', quality = 0.92, maxDim = 1200) {
    const isStrip = this.state.layout === 'classic_strip';
    const baseW = isStrip ? 480 : 960;
    const baseH = isStrip ? 1440 : 1280;

    const scale = maxDim ? Math.min(1, maxDim / Math.max(baseW, baseH)) : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(baseW * scale);
    canvas.height = Math.round(baseH * scale);
    const ctx = canvas.getContext('2d');

    ctx.scale(scale, scale);

    // 1. Render Background
    if (this.state.background.type === 'preset') {
      const preset = PB_BACKGROUND_PRESETS.find(p => p.id === this.state.background.presetId) || PB_BACKGROUND_PRESETS[0];
      const grad = ctx.createLinearGradient(0, 0, 0, baseH);
      if (preset.id === 'astral_ocean') {
        grad.addColorStop(0, '#022c43');
        grad.addColorStop(0.5, '#053f5c');
        grad.addColorStop(1, '#115173');
      } else if (preset.id === 'galaxy_night') {
        grad.addColorStop(0, '#090a0f');
        grad.addColorStop(0.5, '#1b2735');
        grad.addColorStop(1, '#090a0f');
      } else if (preset.id === 'crystal_palace') {
        grad.addColorStop(0, '#082f49');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#38bdf8');
      } else {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, baseW, baseH);
    } else if (this.state.background.customUrl) {
      try {
        const bgImg = await loadImage(this.state.background.customUrl);
        ctx.drawImage(bgImg, 0, 0, baseW, baseH);
      } catch (_) {
        ctx.fillStyle = '#022c43';
        ctx.fillRect(0, 0, baseW, baseH);
      }
    }

    // 2. Render Frame Border
    const borderW = this.state.frame.borderWidth || 12;
    ctx.strokeStyle = this.state.frame.borderColor || '#38bdf8';
    ctx.lineWidth = borderW;
    ctx.strokeRect(borderW / 2, borderW / 2, baseW - borderW, baseH - borderW);

    // 3. Render Photo Slots & Authentic Character Avatars
    const slots = getLayoutSlotCoordinates(this.state.layout, baseW, baseH, borderW);
    const participants = this.state.participants;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const charKey = participants[i % participants.length] || this.activeChar;

      // Slot frame background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);

      // Captured pose or authentic avatar
      const poseImgUrl = this.state.poses[i];
      if (poseImgUrl) {
        try {
          const img = await loadImage(poseImgUrl);
          ctx.drawImage(img, slot.x, slot.y, slot.w, slot.h);
        } catch (_) {}
      } else {
        // Authentic avatar placeholder
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${charKey.toUpperCase()} ✦`, slot.x + slot.w / 2, slot.y + slot.h / 2);
      }
    }

    // 4. Render Stickers
    for (const stk of this.state.stickers) {
      ctx.save();
      ctx.translate(stk.x, stk.y);
      ctx.rotate((stk.rotation * Math.PI) / 180);
      ctx.globalAlpha = stk.opacity;

      if (stk.type === 'emoji') {
        const fontSize = Math.round(36 * stk.scale);
        ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stk.content, 0, 0);
      } else if (stk.content) {
        try {
          const img = await loadImage(stk.content);
          const w = 60 * stk.scale;
          const h = (img.height / img.width) * w;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        } catch (_) {}
      }
      ctx.restore();
    }

    // 5. Render Texts
    for (const txt of this.state.texts) {
      ctx.save();
      ctx.translate(txt.x, txt.y);
      ctx.rotate((txt.rotation * Math.PI) / 180);
      ctx.fillStyle = txt.color;
      ctx.font = `${txt.bold ? 'bold ' : ''}${txt.size}px ${txt.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (txt.shadow) {
        ctx.shadowColor = txt.shadowColor || 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      ctx.fillText(txt.text, 0, 0);
      ctx.restore();
    }

    // 6. Date & Watermark
    if (this.state.frame.showDate) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✧ ${this.state.frame.dateText} · Our Little Universe ✧`, baseW / 2, baseH - 18);
      ctx.restore();
    }

    return canvas.toDataURL(format, quality);
  }
}

// Utility to load image safely
function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error('No src'));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Computes coordinates for 10 layouts
function getLayoutSlotCoordinates(layoutId, w, h, borderW) {
  const pad = borderW + 16;
  const availW = w - pad * 2;
  const availH = h - pad * 2 - 40; // reserve bottom for date/watermark
  const slots = [];

  switch (layoutId) {
    case 'single':
      slots.push({ x: pad, y: pad, w: availW, h: availH });
      break;

    case 'two_person': {
      const halfW = (availW - 12) / 2;
      slots.push({ x: pad, y: pad, w: halfW, h: availH });
      slots.push({ x: pad + halfW + 12, y: pad, w: halfW, h: availH });
      break;
    }

    case 'three_person': {
      const halfH = (availH - 12) / 2;
      const halfW = (availW - 12) / 2;
      slots.push({ x: pad, y: pad, w: availW, h: halfH });
      slots.push({ x: pad, y: pad + halfH + 12, w: halfW, h: halfH });
      slots.push({ x: pad + halfW + 12, y: pad + halfH + 12, w: halfW, h: halfH });
      break;
    }

    case 'four_grid': {
      const halfW = (availW - 12) / 2;
      const halfH = (availH - 12) / 2;
      slots.push({ x: pad, y: pad, w: halfW, h: halfH });
      slots.push({ x: pad + halfW + 12, y: pad, w: halfW, h: halfH });
      slots.push({ x: pad, y: pad + halfH + 12, w: halfW, h: halfH });
      slots.push({ x: pad + halfW + 12, y: pad + halfH + 12, w: halfW, h: halfH });
      break;
    }

    case 'five_friends': {
      const topH = availH * 0.45;
      const botH = availH - topH - 12;
      const qW = (availW - 36) / 4;
      slots.push({ x: pad, y: pad, w: availW, h: topH });
      for (let i = 0; i < 4; i++) {
        slots.push({ x: pad + i * (qW + 12), y: pad + topH + 12, w: qW, h: botH });
      }
      break;
    }

    case 'six_friends': {
      const colW = (availW - 24) / 3;
      const rowH = (availH - 12) / 2;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          slots.push({ x: pad + c * (colW + 12), y: pad + r * (rowH + 12), w: colW, h: rowH });
        }
      }
      break;
    }

    case 'seven_friends':
    case 'full_house': {
      const count = layoutId === 'seven_friends' ? 7 : 8;
      const colW = (availW - 36) / 4;
      const rowH = (availH - 12) / 2;
      for (let i = 0; i < count; i++) {
        const c = i % 4;
        const r = Math.floor(i / 4);
        slots.push({ x: pad + c * (colW + 12), y: pad + r * (rowH + 12), w: colW, h: rowH });
      }
      break;
    }

    case 'classic_strip': {
      const slotH = (availH - 36) / 4;
      for (let i = 0; i < 4; i++) {
        slots.push({ x: pad, y: pad + i * (slotH + 12), w: availW, h: slotH });
      }
      break;
    }

    case 'collage':
    default: {
      const halfW = (availW - 12) / 2;
      const halfH = (availH - 12) / 2;
      slots.push({ x: pad + 10, y: pad + 10, w: halfW - 10, h: halfH - 10 });
      slots.push({ x: pad + halfW + 10, y: pad + 20, w: halfW - 10, h: halfH - 10 });
      slots.push({ x: pad + 20, y: pad + halfH + 10, w: halfW - 10, h: halfH - 10 });
      slots.push({ x: pad + halfW, y: pad + halfH + 10, w: halfW - 10, h: halfH - 10 });
      break;
    }
  }

  return slots;
}
