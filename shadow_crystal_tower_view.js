/**
 * SHADOW — CRYSTAL TOWER: 2D LIFE SIMULATION VIEW CONTROLLER
 *
 * Ties together:
 * - 60fps Game Loop (6 connected rooms inside Crystal Tower)
 * - 4-way Keyboard (WASD/Arrows), Interaction (E), Pause Menu (ESC), and Mobile Touch D-Pad
 * - Contextual Object Interaction Modals (Wardrobe, Recipes, Stories Library, Journal, Decor, Pause)
 * - Live Atmosphere Switcher (Evening / Night / Midnight / Dawn & Clear / Rain / Mist / Snow)
 * - Web Audio Fantasy Synth & Environmental Ambience (zero autoplay)
 * - UID-isolated IndexedDB + Firestore summary persistence
 */

import {
  TIME_CYCLES,
  WEATHER_MODES,
  LELE_OUTFITS,
  ROOM_DECOR_ITEMS,
  KITCHEN_RECIPES,
  BUILTIN_TOWER_BOOKS,
  TOWER_ROOMS,
  TOWER_WORLD_WIDTH,
  TOWER_WORLD_HEIGHT
} from './shadow_crystal_tower_data.js';
import {
  resolveCrystalViewerCharacter,
  loadCrystalTowerProgress,
  saveCrystalTowerProgress,
  stepPlayerMovement,
  getNearbyInteractable,
  startTimedActivity,
  cancelCurrentActivity,
  tickCrystalTowerState,
  craftKitchenRecipe,
  equipOutfit,
  toggleRoomDecoration,
  setTimeCycle,
  setWeatherMode,
  addJournalEntry,
  toggleFavoriteBook,
  recordBookRead,
  consumeInventoryItem,
  addInventoryItem,
  appendActivityLog
} from './shadow_crystal_tower_state.js';
import { createCrystalTowerRenderer } from './shadow_crystal_tower_renderer.js';
import { createCrystalTowerAudioEngine } from './shadow_crystal_tower_audio.js';
import {
  getPublishedStories,
  getAuthorStories,
  saveReadingProgress
} from './stories.js';

export function initShadowCrystalTowerView({
  onShowToast,
  onTriggerSparkle,
  onNavigateBack,
  onNavigateOrbit
} = {}) {
  const viewTower = document.getElementById('view-shadow-crystal-tower');
  if (!viewTower) return null;

  const canvas = document.getElementById('crystal-tower-canvas');
  const roomFade = document.getElementById('crystal-room-fade');
  const entranceCurtain = document.getElementById('crystal-entrance-curtain');
  const btnEnterPlay = document.getElementById('btn-crystal-enter-play');

  const hudRoomName = document.getElementById('crystal-hud-room-name');
  const hudAtmosphereBtn = document.getElementById('btn-crystal-atmosphere');
  const hudAudioBtn = document.getElementById('btn-crystal-audio-toggle');
  const hudPauseBtn = document.getElementById('btn-crystal-pause-menu');

  const activityBar = document.getElementById('crystal-activity-bar');
  const activityLabel = document.getElementById('crystal-activity-label');
  const activityFill = document.getElementById('crystal-progress-fill');
  const btnCancelActivity = document.getElementById('btn-crystal-cancel-activity');

  const touchControlsWrap = document.getElementById('crystal-touch-controls');
  const touchDpadButtons = document.querySelectorAll('.crystal-dpad-btn');
  const btnTouchInteract = document.getElementById('btn-crystal-touch-interact');

  const modalOverlay = document.getElementById('crystal-modal-overlay');
  const modalTitle = document.getElementById('crystal-modal-title');
  const modalBody = document.getElementById('crystal-modal-body');
  const btnCloseModal = document.getElementById('btn-crystal-modal-close');

  const renderer = createCrystalTowerRenderer();
  const audio = createCrystalTowerAudioEngine();

  let gameState = null;
  let activeViewerChar = 'lele';
  let isActiveView = false;
  let isPaused = false;
  let rafId = null;
  let lastFrameMs = 0;
  let lastSaveMs = 0;

  const pressedKeys = new Set();
  const touchDir = { up: false, down: false, left: false, right: false };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(TOWER_WORLD_WIDTH * dpr);
    const targetH = Math.round(TOWER_WORLD_HEIGHT * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }

  function updateHud() {
    if (!gameState) return;
    const room = TOWER_ROOMS[gameState.currentRoom];
    const tMeta = TIME_CYCLES.find((t) => t.id === gameState.timeOfDay) || TIME_CYCLES[1];
    const wMeta = WEATHER_MODES.find((w) => w.id === gameState.weather) || WEATHER_MODES[0];

    if (hudRoomName && room) {
      hudRoomName.textContent = `🏰 ${room.name}`;
    }
    if (hudAtmosphereBtn) {
      hudAtmosphereBtn.textContent = `🌙 ${tMeta.label} · ${wMeta.label}`;
    }
    if (hudAudioBtn) {
      const aStat = audio.getStatus();
      hudAudioBtn.textContent = aStat.isMuted
        ? '🔇 Bisu'
        : (aStat.isMusicPlaying ? '🎵 Audio Aktif' : '🎵 Putar Audio');
    }

    if (touchControlsWrap) {
      touchControlsWrap.classList.toggle('visible', Boolean(gameState.settings?.showMobileControls));
    }

    // Contextual Touch Interact Button
    if (btnTouchInteract) {
      const near = getNearbyInteractable(gameState);
      if (near && !isPaused) {
        btnTouchInteract.disabled = false;
        btnTouchInteract.textContent = `[ E ] ${near.actionLabel}`;
      } else {
        btnTouchInteract.disabled = true;
        btnTouchInteract.textContent = '[ E ] Dekati Objek';
      }
    }

    // Activity Progress Bar
    if (activityBar && activityLabel && activityFill) {
      if (gameState.activeActivity) {
        activityBar.classList.add('visible');
        activityLabel.textContent = `✨ ${gameState.activeActivity.label}`;
        activityFill.style.width = `${Math.round(gameState.activeActivity.progress * 100)}%`;
      } else {
        activityBar.classList.remove('visible');
        activityFill.style.width = '0%';
      }
    }
  }

  function triggerRoomFadeFlash() {
    if (!roomFade) return;
    roomFade.classList.add('fading');
    setTimeout(() => roomFade.classList.remove('fading'), 220);
  }

  function computeInputVector() {
    let dx = 0;
    let dy = 0;
    if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft') || touchDir.left) dx -= 1;
    if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight') || touchDir.right) dx += 1;
    if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp') || touchDir.up) dy -= 1;
    if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown') || touchDir.down) dy += 1;
    return { dx, dy };
  }

  function persistNow(syncCloud = true) {
    if (!gameState) return;
    saveCrystalTowerProgress(gameState, {
      viewerChar: activeViewerChar,
      syncCloudSummary: syncCloud
    });
  }

  function gameTick(nowMs) {
    if (!isActiveView || !gameState) return;
    const dtMs = lastFrameMs ? Math.min(60, Math.max(8, nowMs - lastFrameMs)) : 16;
    lastFrameMs = nowMs;
    const dtSec = dtMs / 1000;

    if (!isPaused && (!entranceCurtain || !entranceCurtain.classList.contains('visible'))) {
      const vec = computeInputVector();
      const moveRes = stepPlayerMovement(gameState, vec, dtSec);
      if (moveRes.moved && !moveRes.triggeredPortal) {
        audio.playFootstepSfx();
      }
      if (moveRes.triggeredPortal) {
        triggerRoomFadeFlash();
        audio.playPortalSfx();
        audio.updateAtmosphere({
          room: gameState.currentRoom,
          timeOfDay: gameState.timeOfDay,
          weather: gameState.weather
        });
        const newRoom = TOWER_ROOMS[gameState.currentRoom];
        if (onShowToast && newRoom) onShowToast(`✦ Memasuki ${newRoom.name}`);
        persistNow(true);
      }

      const completed = tickCrystalTowerState(gameState, dtMs);
      if (completed) {
        audio.playCompleteSfx();
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        if (onShowToast) {
          onShowToast(
            completed.reward
              ? `✦ ${completed.summaryText} (+${completed.reward.name})`
              : `✦ ${completed.summaryText}`
          );
        }
        persistNow(true);
      }

      if (nowMs - lastSaveMs > 9000) {
        lastSaveMs = nowMs;
        persistNow(false);
      }
    }

    const nearby = (!isPaused && !gameState.activeActivity) ? getNearbyInteractable(gameState) : null;
    renderer.renderFrame(canvas, gameState, nearby, dtSec);
    updateHud();
    rafId = requestAnimationFrame(gameTick);
  }

  // ==========================================================================
  // DIEGETIC OVERLAY DIALOGS (NO BROWSER ALERTS)
  // ==========================================================================

  function openModal(titleText, bodyHtml) {
    isPaused = true;
    pressedKeys.clear();
    if (modalTitle) modalTitle.textContent = titleText;
    if (modalBody) modalBody.innerHTML = bodyHtml;
    if (modalOverlay) {
      modalOverlay.classList.add('open');
      modalOverlay.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    isPaused = false;
    if (gameState && gameState.player.pose === 'write' && !gameState.activeActivity) {
      gameState.player.pose = 'idle';
    }
    if (modalOverlay) {
      modalOverlay.classList.remove('open');
      modalOverlay.setAttribute('aria-hidden', 'true');
    }
    updateHud();
  }

  function openWardrobeModal() {
    const itemsHtml = LELE_OUTFITS.map((o) => {
      const eq = gameState.player.outfitId === o.id;
      return `
        <div class="crystal-choice-item ${eq ? 'active' : ''}">
          <div>
            <div style="font-weight:700;color:#f8fafc;">${escapeHtml(o.name)}</div>
            <div style="font-size:0.78rem;color:#cbd5e1;">${escapeHtml(o.desc)}</div>
          </div>
          <button type="button" class="crystal-hud-btn" data-equip-outfit="${escapeHtml(o.id)}">
            ${eq ? '✓ Dipakai' : 'Pakai'}
          </button>
        </div>
      `;
    }).join('');
    openModal('👗 Lemari Pakaian Bulan', `<div class="crystal-choice-list">${itemsHtml}</div>`);

    modalBody?.querySelectorAll('[data-equip-outfit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const oid = btn.getAttribute('data-equip-outfit');
        const chosen = equipOutfit(gameState, oid);
        if (chosen) {
          audio.playInteractSfx();
          persistNow(true);
          if (onShowToast) onShowToast(`👗 Lele mengenakan ${chosen.name} ✨`);
          openWardrobeModal();
        }
      });
    });
  }

  function openRoomDecorModal() {
    const html = ROOM_DECOR_ITEMS.map((d) => {
      const equipped = gameState.equippedDecorations.includes(d.id);
      return `
        <div class="crystal-choice-item ${equipped ? 'active' : ''}">
          <div>
            <div style="font-weight:700;color:#f8fafc;">${escapeHtml(d.name)}</div>
            <div style="font-size:0.78rem;color:#cbd5e1;">${escapeHtml(d.desc)}</div>
          </div>
          <button type="button" class="crystal-hud-btn" data-toggle-decor="${escapeHtml(d.id)}">
            ${equipped ? '✓ Terpasang' : 'Pasang'}
          </button>
        </div>
      `;
    }).join('');
    openModal('💎 Dekorasi Kamar Pribadi', `<div class="crystal-choice-list">${html}</div>`);

    modalBody?.querySelectorAll('[data-toggle-decor]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const did = btn.getAttribute('data-toggle-decor');
        const res = toggleRoomDecoration(gameState, did);
        if (res) {
          audio.playInteractSfx();
          persistNow(true);
          if (onShowToast) {
            onShowToast(res.active ? `✦ ${res.decor.name} dipasang di kamar!` : `${res.decor.name} disimpan.`);
          }
          openRoomDecorModal();
        }
      });
    });
  }

  function openJournalModal() {
    gameState.player.pose = 'write';
    const entriesHtml = gameState.journalEntries.length > 0
      ? gameState.journalEntries.slice(0, 8).map((e) => `
          <div class="crystal-choice-item" style="flex-direction:column;align-items:flex-start;gap:4px;">
            <div style="font-size:0.72rem;color:#c4b5fd;">${new Date(e.createdAt).toLocaleString('id-ID')} · ${escapeHtml(e.timeOfDay)} / ${escapeHtml(e.weather)}</div>
            <div style="font-size:0.86rem;color:#f8fafc;white-space:pre-wrap;">${escapeHtml(e.text)}</div>
          </div>
        `).join('')
      : `<p style="font-size:0.84rem;color:#94a3b8;margin:4px 0;">Belum ada catatan jurnal malam. Tuliskan pikiranmu di meja belajar ini.</p>`;

    openModal('✒️ Meja Belajar — Jurnal Malam Lele', `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <textarea id="crystal-journal-input" class="crystal-textarea" placeholder="Tulis refleksi atau catatan malammu di Crystal Tower..."></textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between;">
          <button type="button" class="crystal-hud-btn" id="btn-crystal-open-orbit">📅 Buka Kalender Orbit</button>
          <button type="button" class="crystal-hud-btn" id="btn-crystal-save-journal" style="background:rgba(91,33,182,0.85);border-color:#fde68a;color:#fef3c7;">✦ Simpan Catatan</button>
        </div>
        <div class="crystal-choice-list" style="margin-top:6px;">${entriesHtml}</div>
      </div>
    `);

    document.getElementById('btn-crystal-save-journal')?.addEventListener('click', () => {
      const val = document.getElementById('crystal-journal-input')?.value || '';
      const entry = addJournalEntry(gameState, val);
      if (!entry) {
        if (onShowToast) onShowToast('Tulis catatan terlebih dahulu sebelum menyimpan.');
        return;
      }
      audio.playCompleteSfx();
      persistNow(true);
      if (onShowToast) onShowToast('✒️ Jurnal malam tersimpan dengan tenang.');
      openJournalModal();
    });

    document.getElementById('btn-crystal-open-orbit')?.addEventListener('click', () => {
      closeModal();
      exitTowerView();
      if (typeof onNavigateOrbit === 'function') {
        onNavigateOrbit('view-shadow-world');
      }
    });
  }

  function gatherAvailableBooks() {
    const pubStories = typeof getPublishedStories === 'function' ? getPublishedStories() : [];
    const ownStories = (activeViewerChar === 'lele' && typeof getAuthorStories === 'function')
      ? getAuthorStories('lele', 'all')
      : [];
    const mergedMap = new Map();

    [...ownStories, ...pubStories].forEach((s) => {
      if (s && s.id && s.content) {
        const text = String(s.content).trim();
        const chunks = [];
        for (let i = 0; i < text.length; i += 460) {
          chunks.push(text.slice(i, i + 460));
        }
        mergedMap.set(s.id, {
          id: s.id,
          title: s.title || 'Tanpa Judul',
          author: s.authorName || s.author || 'Sahabat Semesta',
          category: s.category || 'Karya Cerita',
          pages: chunks.length > 0 ? chunks : ['(Halaman masih kosong)'],
          isStoryModule: true
        });
      }
    });

    BUILTIN_TOWER_BOOKS.forEach((b) => {
      if (!mergedMap.has(b.id)) mergedMap.set(b.id, b);
    });

    return Array.from(mergedMap.values());
  }

  function openBookReader(book, pageIdx = 0) {
    const pages = book.pages && book.pages.length > 0 ? book.pages : ['(Kosong)'];
    const safeIdx = Math.max(0, Math.min(pages.length - 1, pageIdx));
    const isFav = gameState.favoriteBooks.includes(book.id);

    recordBookRead(gameState, book);
    if (book.isStoryModule && typeof saveReadingProgress === 'function') {
      try {
        saveReadingProgress(book.id, Math.round(((safeIdx + 1) / pages.length) * 100), 0, activeViewerChar);
      } catch (_) {}
    }
    persistNow(true);

    openModal(`📖 ${book.title}`, `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;color:#c4b5fd;">
          <span>Oleh ${escapeHtml(book.author)} · ${escapeHtml(book.category)}</span>
          <button type="button" class="crystal-hud-btn" id="btn-reader-fav">${isFav ? '⭐ Favorit' : '☆ Simpan Favorit'}</button>
        </div>
        <div style="padding:16px;border-radius:12px;background:rgba(15,23,52,0.84);border:1px solid rgba(196,181,253,0.25);line-height:1.75;font-size:0.93rem;color:#f1f5f9;">
          ${escapeHtml(pages[safeIdx])}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button type="button" class="crystal-hud-btn" id="btn-reader-back-shelf">← Rak Buku</button>
          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" class="crystal-hud-btn" id="btn-reader-prev" ${safeIdx <= 0 ? 'disabled' : ''}>‹ Hal Sebelumnya</button>
            <span style="font-size:0.78rem;color:#cbd5e1;">${safeIdx + 1} / ${pages.length}</span>
            <button type="button" class="crystal-hud-btn" id="btn-reader-next" ${safeIdx >= pages.length - 1 ? 'disabled' : ''}>Hal Berikutnya ›</button>
          </div>
        </div>
      </div>
    `);

    document.getElementById('btn-reader-fav')?.addEventListener('click', () => {
      const added = toggleFavoriteBook(gameState, book.id);
      persistNow(true);
      if (onShowToast) onShowToast(added ? '⭐ Buku ditambahkan ke favorit!' : 'Buku dihapus dari favorit.');
      openBookReader(book, safeIdx);
    });
    document.getElementById('btn-reader-back-shelf')?.addEventListener('click', () => openLibraryModal('all'));
    document.getElementById('btn-reader-prev')?.addEventListener('click', () => openBookReader(book, safeIdx - 1));
    document.getElementById('btn-reader-next')?.addEventListener('click', () => openBookReader(book, safeIdx + 1));
  }

  function openLibraryModal(initialTab = 'all') {
    const books = gatherAvailableBooks();
    let list = books;
    if (initialTab === 'favorites') {
      list = books.filter((b) => gameState.favoriteBooks.includes(b.id));
    } else if (initialTab === 'history') {
      const histIds = gameState.readingHistory.map((h) => h.id);
      list = histIds.map((id) => books.find((b) => b.id === id)).filter(Boolean);
    }

    const itemsHtml = list.length > 0
      ? list.map((b) => `
          <div class="crystal-choice-item">
            <div>
              <div style="font-weight:700;color:#f8fafc;">${gameState.favoriteBooks.includes(b.id) ? '⭐ ' : ''}${escapeHtml(b.title)}</div>
              <div style="font-size:0.78rem;color:#cbd5e1;">${escapeHtml(b.author)} · ${escapeHtml(b.category)} (${b.pages.length} hal)</div>
            </div>
            <button type="button" class="crystal-hud-btn" data-open-book="${escapeHtml(b.id)}">Baca</button>
          </div>
        `).join('')
      : `<p style="font-size:0.84rem;color:#94a3b8;">Belum ada buku pada tab ini.</p>`;

    openModal('📚 Perpustakaan Pribadi & Rak Novel', `
      <div>
        <div class="crystal-tabs-row">
          <button type="button" class="crystal-tab-btn ${initialTab === 'all' ? 'active' : ''}" data-lib-tab="all">Semua Buku (${books.length})</button>
          <button type="button" class="crystal-tab-btn ${initialTab === 'favorites' ? 'active' : ''}" data-lib-tab="favorites">Favorit (${gameState.favoriteBooks.length})</button>
          <button type="button" class="crystal-tab-btn ${initialTab === 'history' ? 'active' : ''}" data-lib-tab="history">Riwayat Baca (${gameState.readingHistory.length})</button>
        </div>
        <div class="crystal-choice-list">${itemsHtml}</div>
      </div>
    `);

    modalBody?.querySelectorAll('[data-lib-tab]').forEach((btn) => {
      btn.addEventListener('click', () => openLibraryModal(btn.getAttribute('data-lib-tab')));
    });
    modalBody?.querySelectorAll('[data-open-book]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const b = books.find((item) => item.id === btn.getAttribute('data-open-book'));
        if (b) openBookReader(b, 0);
      });
    });
  }

  function openRecipesModal(stoveObj) {
    const html = KITCHEN_RECIPES.map((r) => `
      <div class="crystal-choice-item">
        <div>
          <div style="font-weight:700;color:#f8fafc;">${r.type === 'brew' ? '🍵' : '🍰'} ${escapeHtml(r.name)}</div>
          <div style="font-size:0.78rem;color:#cbd5e1;">Bahan: ${escapeHtml(r.ingredients.join(' + '))} · ${escapeHtml(r.desc)}</div>
        </div>
        <button type="button" class="crystal-hud-btn" data-craft-recipe="${escapeHtml(r.id)}">
          ${r.type === 'brew' ? 'Seduh' : 'Masak'}
        </button>
      </div>
    `).join('');

    openModal('🍳 Resep Dapur Kristal', `<div class="crystal-choice-list">${html}</div>`);
    modalBody?.querySelectorAll('[data-craft-recipe]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rid = btn.getAttribute('data-craft-recipe');
        closeModal();
        const res = craftKitchenRecipe(gameState, rid, stoveObj);
        if (res.ok) {
          audio.playInteractSfx();
          if (onShowToast) onShowToast(`🔥 ${res.recipe.name} sedang dimasak...`);
        }
      });
    });
  }

  function openTeaTableModal(tableObj) {
    const consumables = gameState.inventory.filter((i) => (i.category === 'minuman' || i.category === 'makanan') && i.count > 0);
    if (consumables.length === 0) {
      startTimedActivity(gameState, tableObj, {
        label: 'Menikmati Secangkir Teh Hangat...',
        pose: 'sit',
        durationMs: 2400,
        summaryText: 'Bersantai menikmati teh melati hangat di Ruang Keluarga'
      });
      audio.playInteractSfx();
      return;
    }

    const html = consumables.map((c) => `
      <div class="crystal-choice-item">
        <div>
          <div style="font-weight:700;color:#f8fafc;">${c.category === 'minuman' ? '🍵' : '🍰'} ${escapeHtml(c.name)} (×${c.count})</div>
          <div style="font-size:0.78rem;color:#cbd5e1;">${escapeHtml(c.desc || 'Hasil olahan Dapur Kristal')}</div>
        </div>
        <button type="button" class="crystal-hud-btn" data-consume-id="${escapeHtml(c.id)}">Nikmati</button>
      </div>
    `).join('');

    openModal('🫖 Meja Teko & Camilan', `<div class="crystal-choice-list">${html}</div>`);
    modalBody?.querySelectorAll('[data-consume-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cid = btn.getAttribute('data-consume-id');
        const res = consumeInventoryItem(gameState, cid);
        closeModal();
        if (res.ok) {
          persistNow(true);
          startTimedActivity(gameState, tableObj, {
            label: `Menikmati ${res.itemName}...`,
            pose: 'sit',
            durationMs: 2200,
            summaryText: `Menikmati ${res.itemName} di Meja Ruang Keluarga`
          });
          audio.playInteractSfx();
        }
      });
    });
  }

  function openPauseMenu(section = 'main') {
    const tOptions = TIME_CYCLES.map((t) =>
      `<button type="button" class="crystal-tab-btn ${gameState.timeOfDay === t.id ? 'active' : ''}" data-set-time="${escapeHtml(t.id)}">${escapeHtml(t.label)}</button>`
    ).join('');
    const wOptions = WEATHER_MODES.map((w) =>
      `<button type="button" class="crystal-tab-btn ${gameState.weather === w.id ? 'active' : ''}" data-set-weather="${escapeHtml(w.id)}">${escapeHtml(w.label)}</button>`
    ).join('');

    let sectionHtml = '';
    if (section === 'main') {
      sectionHtml = `
        <div class="crystal-choice-list">
          <div style="font-size:0.82rem;color:#c4b5fd;padding:6px 4px;">
            Ruangan: <strong>${escapeHtml(TOWER_ROOMS[gameState.currentRoom]?.name)}</strong> · Energi Nyaman: <strong>${gameState.moodEnergy}%</strong> · Harmoni Kristal: <strong>${gameState.crystalResonance}%</strong>
          </div>
          <button type="button" class="crystal-hud-btn" id="btn-pm-resume">▶ Resume Permainan</button>
          <button type="button" class="crystal-hud-btn" data-pm-tab="inventory">🎒 Inventory & Koleksi (${gameState.inventory.length})</button>
          <button type="button" class="crystal-hud-btn" data-pm-tab="log">📜 Activity Log (${gameState.activityLog.length})</button>
          <button type="button" class="crystal-hud-btn" data-pm-tab="settings">⚙️ Settings (Waktu, Cuaca, Audio & Kontrol)</button>
          <button type="button" class="crystal-hud-btn" id="btn-pm-exit" style="border-color:rgba(251,113,133,0.45);color:#fecdd3;">🚪 Exit Room (Kembali ke SHADOW)</button>
        </div>
      `;
    } else if (section === 'inventory') {
      const invRows = gameState.inventory.map((i) => `
        <div class="crystal-choice-item">
          <div>
            <div style="font-weight:700;color:#f8fafc;">${escapeHtml(i.name)} <span style="font-size:0.74rem;color:#c4b5fd;">[${escapeHtml(i.category)}]</span></div>
            <div style="font-size:0.78rem;color:#cbd5e1;">${escapeHtml(i.desc || '')}</div>
          </div>
          <span class="crystal-key-chip">×${i.count}</span>
        </div>
      `).join('');
      sectionHtml = `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <button type="button" class="crystal-hud-btn" data-pm-tab="main">← Kembali ke Menu</button>
          <div style="font-size:0.82rem;color:#fde68a;">Koleksi Terbuka: ${escapeHtml(gameState.unlockedCollections.join(', '))}</div>
          <div class="crystal-choice-list">${invRows}</div>
        </div>
      `;
    } else if (section === 'log') {
      const logs = gameState.activityLog.length > 0
        ? gameState.activityLog.map((l) => `
            <div class="crystal-choice-item" style="flex-direction:column;align-items:flex-start;gap:2px;">
              <div style="font-size:0.72rem;color:#94a3b8;">${new Date(l.timestamp).toLocaleTimeString('id-ID')} · ${escapeHtml(TOWER_ROOMS[l.room]?.name || l.room)}</div>
              <div style="font-size:0.85rem;color:#f8fafc;">${escapeHtml(l.summary)}</div>
            </div>
          `).join('')
        : `<p style="font-size:0.84rem;color:#94a3b8;">Belum ada aktivitas tercatat di sesi ini.</p>`;
      sectionHtml = `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <button type="button" class="crystal-hud-btn" data-pm-tab="main">← Kembali ke Menu</button>
          <div class="crystal-choice-list">${logs}</div>
        </div>
      `;
    } else if (section === 'settings') {
      const aStat = audio.getStatus();
      sectionHtml = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <button type="button" class="crystal-hud-btn" data-pm-tab="main">← Kembali ke Menu</button>
          <div>
            <div style="font-size:0.8rem;color:#c4b5fd;margin-bottom:6px;">Siklus Waktu Menara:</div>
            <div class="crystal-tabs-row">${tOptions}</div>
          </div>
          <div>
            <div style="font-size:0.8rem;color:#c4b5fd;margin-bottom:6px;">Cuaca Luar Jendela & Balkon:</div>
            <div class="crystal-tabs-row">${wOptions}</div>
          </div>
          <div class="crystal-choice-item" style="flex-wrap:wrap;">
            <div>
              <div style="font-weight:700;">Audio Musik & Ambience</div>
              <div style="font-size:0.76rem;color:#cbd5e1;">Kontrol musik malam, angin/hujan, dan SFX langkah</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <button type="button" class="crystal-hud-btn" id="btn-set-music">${aStat.isMusicPlaying ? '⏸ Hentikan Musik' : '▶ Putar Musik'}</button>
              <button type="button" class="crystal-hud-btn" id="btn-set-ambience">${aStat.isAmbiencePlaying ? '🌬️ Matikan Ambience' : '🌬️ Nyalakan Ambience'}</button>
              <button type="button" class="crystal-hud-btn" id="btn-set-mute">${aStat.isMuted ? '🔊 Unmute' : '🔇 Mute'}</button>
            </div>
          </div>
          <label style="display:flex;align-items:center;justify-content:space-between;font-size:0.84rem;">
            <span>Volume Audio (${Math.round(aStat.masterVolume * 100)}%)</span>
            <input type="range" id="slider-crystal-vol" min="0" max="1" step="0.05" value="${aStat.masterVolume}" />
          </label>
          <div class="crystal-choice-item">
            <span>Tampilkan Tombol D-Pad Layar (Mobile/Desktop)</span>
            <button type="button" class="crystal-hud-btn" id="btn-toggle-touchpad">${gameState.settings.showMobileControls ? '✓ Aktif' : 'Nonaktif'}</button>
          </div>
        </div>
      `;
    }

    openModal('🏰 Menu Ruang Kristal', sectionHtml);

    document.getElementById('btn-pm-resume')?.addEventListener('click', closeModal);
    document.getElementById('btn-pm-exit')?.addEventListener('click', () => {
      closeModal();
      exitTowerView();
      if (typeof onNavigateBack === 'function') onNavigateBack();
    });
    modalBody?.querySelectorAll('[data-pm-tab]').forEach((b) => {
      b.addEventListener('click', () => openPauseMenu(b.getAttribute('data-pm-tab')));
    });
    modalBody?.querySelectorAll('[data-set-time]').forEach((b) => {
      b.addEventListener('click', () => {
        setTimeCycle(gameState, b.getAttribute('data-set-time'));
        audio.updateAtmosphere({ timeOfDay: gameState.timeOfDay });
        persistNow(true);
        openPauseMenu('settings');
      });
    });
    modalBody?.querySelectorAll('[data-set-weather]').forEach((b) => {
      b.addEventListener('click', () => {
        setWeatherMode(gameState, b.getAttribute('data-set-weather'));
        audio.updateAtmosphere({ weather: gameState.weather });
        persistNow(true);
        openPauseMenu('settings');
      });
    });
    document.getElementById('btn-set-music')?.addEventListener('click', () => {
      audio.unlockOnUserGesture();
      if (audio.getStatus().isMusicPlaying) audio.stopMusic();
      else audio.startMusic();
      openPauseMenu('settings');
    });
    document.getElementById('btn-set-ambience')?.addEventListener('click', () => {
      audio.unlockOnUserGesture();
      if (audio.getStatus().isAmbiencePlaying) audio.stopAmbience();
      else audio.startAmbience();
      openPauseMenu('settings');
    });
    document.getElementById('btn-set-mute')?.addEventListener('click', () => {
      audio.setMuted(!audio.getStatus().isMuted);
      openPauseMenu('settings');
    });
    document.getElementById('slider-crystal-vol')?.addEventListener('input', (e) => {
      audio.setVolume(e.target.value);
      gameState.settings.masterVolume = Number(e.target.value);
    });
    document.getElementById('btn-toggle-touchpad')?.addEventListener('click', () => {
      gameState.settings.showMobileControls = !gameState.settings.showMobileControls;
      persistNow(false);
      updateHud();
      openPauseMenu('settings');
    });
  }

  function interactWithNearbyObject() {
    if (!gameState || isPaused || gameState.activeActivity) return;
    const obj = getNearbyInteractable(gameState);
    if (!obj) return;

    audio.unlockOnUserGesture();
    audio.playInteractSfx();

    if (obj.kind === 'wardrobe') return openWardrobeModal();
    if (obj.kind === 'decor') return openRoomDecorModal();
    if (obj.kind === 'journal') return openJournalModal();
    if (obj.kind === 'library_browse') return openLibraryModal('all');
    if (obj.kind === 'library_history') return openLibraryModal('history');
    if (obj.kind === 'cook_menu') return openRecipesModal(obj);
    if (obj.kind === 'tea_snack') return openTeaTableModal(obj);
    if (obj.kind === 'inventory') return openPauseMenu('inventory');

    if (obj.kind === 'music_toggle') {
      if (audio.getStatus().isMusicPlaying) {
        audio.stopMusic();
        if (onShowToast) onShowToast('🎵 Pemutar musik kristal dijeda.');
      } else {
        audio.startMusic();
        audio.startAmbience();
        if (onShowToast) onShowToast('🎵 Alunan musik malam kristal mengalun tenang...');
      }
      updateHud();
      return;
    }

    if (obj.kind === 'window') {
      const tMeta = TIME_CYCLES.find((t) => t.id === gameState.timeOfDay);
      const wMeta = WEATHER_MODES.find((w) => w.id === gameState.weather);
      if (onShowToast) onShowToast(`🌌 Memandang langit ${tMeta?.label} (${wMeta?.label}) dari ${obj.name}`);
      startTimedActivity(gameState, obj, {
        label: `Mengamati langit malam (${wMeta?.label})...`,
        summaryText: `Menikmati pemandangan ${tMeta?.label} dari ${obj.name}`
      });
      return;
    }

    // Rewards for interactive rooms
    let reward = null;
    if (obj.kind === 'pantry') {
      reward = { id: 'jasmine_leaf', name: 'Daun Melati', category: 'bahan', desc: 'Stok daun teh harum.', delta: 1 };
    } else if (obj.kind === 'fridge') {
      reward = { id: 'lavender_milk', name: 'Susu Lavender', category: 'bahan', desc: 'Susu segar beraroma lavender.', delta: 1 };
    } else if (obj.kind === 'stargaze') {
      reward = { id: 'starlight_shard', name: 'Pendar Bintang Crescent', category: 'kristal', desc: 'Ditemukan saat mengamati bintang di balkon.', delta: 1 };
    } else if (obj.kind === 'harvest_crystal') {
      reward = { id: 'crystal_dust', name: 'Serbuk Kristal Murni', category: 'kristal', desc: 'Energi kristal Sanctuary.', delta: 1 };
    } else if (obj.kind === 'bath_essence') {
      reward = { id: 'snowdrop_bath_salt', name: 'Esens Snowdrop Perak', category: 'hasil', desc: 'Aromaterapi mandi relaksasi.', delta: 1 };
    } else if (obj.kind === 'prep_snack') {
      reward = { id: 'lavender_biscuit', name: 'Biskuit Lavender Hangat', category: 'makanan', desc: 'Camilan hangat dari meja Dapur Kristal.', delta: 1 };
    }

    startTimedActivity(gameState, obj, {
      reward,
      summaryText: obj.kind === 'sleep'
        ? 'Beristirahat nyenyak di Tempat Tidur Kristal'
        : (obj.kind === 'clean' ? 'Merapikan Kamar Pribadi dengan teliti' : `Menyelesaikan aktivitas di ${obj.name}`)
    });
  }

  // ==========================================================================
  // LIFECYCLE & INPUT BINDINGS
  // ==========================================================================

  function handleKeyDown(e) {
    if (!isActiveView) return;
    if (e.code === 'Escape') {
      e.preventDefault();
      if (modalOverlay && modalOverlay.classList.contains('open')) closeModal();
      else openPauseMenu('main');
      return;
    }

    const activeTag = document.activeElement?.tagName;
    if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') return;

    if (e.code === 'KeyE' || e.code === 'Enter') {
      e.preventDefault();
      if (entranceCurtain && entranceCurtain.classList.contains('visible')) {
        dismissEntranceCurtain();
        return;
      }
      interactWithNearbyObject();
      return;
    }

    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
      pressedKeys.add(e.code);
    }
  }

  function handleKeyUp(e) {
    pressedKeys.delete(e.code);
  }

  function dismissEntranceCurtain() {
    audio.unlockOnUserGesture();
    audio.playInteractSfx();
    if (entranceCurtain) entranceCurtain.classList.remove('visible');
  }

  function bindUiEvents() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', resizeCanvas);

    btnEnterPlay?.addEventListener('click', dismissEntranceCurtain);
    btnCloseModal?.addEventListener('click', closeModal);
    hudPauseBtn?.addEventListener('click', () => openPauseMenu('main'));
    hudAtmosphereBtn?.addEventListener('click', () => openPauseMenu('settings'));

    hudAudioBtn?.addEventListener('click', () => {
      audio.unlockOnUserGesture();
      const st = audio.getStatus();
      if (!st.isMusicPlaying) {
        audio.startMusic();
        audio.startAmbience();
      } else {
        audio.setMuted(!st.isMuted);
      }
      updateHud();
    });

    btnCancelActivity?.addEventListener('click', () => {
      if (gameState && cancelCurrentActivity(gameState)) {
        if (onShowToast) onShowToast('Aktivitas dihentikan.');
        updateHud();
      }
    });

    touchDpadButtons.forEach((btn) => {
      const dir = btn.getAttribute('data-dir');
      const setDir = (on) => {
        if (dir && dir in touchDir) touchDir[dir] = on;
        btn.classList.toggle('pressed', on);
      };
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        audio.unlockOnUserGesture();
        setDir(true);
      });
      btn.addEventListener('pointerup', () => setDir(false));
      btn.addEventListener('pointerleave', () => setDir(false));
      btn.addEventListener('pointercancel', () => setDir(false));
    });

    btnTouchInteract?.addEventListener('click', () => interactWithNearbyObject());
  }

  bindUiEvents();

  async function showShadowCrystalTowerView() {
    activeViewerChar = resolveCrystalViewerCharacter();
    gameState = await loadCrystalTowerProgress(activeViewerChar);
    resizeCanvas();

    audio.updateAtmosphere({
      room: gameState.currentRoom,
      timeOfDay: gameState.timeOfDay,
      weather: gameState.weather
    });

    if (entranceCurtain) entranceCurtain.classList.add('visible');
    viewTower.classList.add('active');
    viewTower.setAttribute('aria-hidden', 'false');
    isActiveView = true;
    isPaused = false;
    lastFrameMs = 0;

    updateHud();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(gameTick);
  }

  function exitTowerView() {
    persistNow(true);
    isActiveView = false;
    pressedKeys.clear();
    Object.keys(touchDir).forEach((k) => { touchDir[k] = false; });
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    audio.stopAll();
    viewTower.classList.remove('active');
    viewTower.setAttribute('aria-hidden', 'true');
  }

  return {
    showShadowCrystalTowerView,
    exitTowerView
  };
}
