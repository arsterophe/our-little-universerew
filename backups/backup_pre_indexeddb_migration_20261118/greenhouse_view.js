/**
 * THE ENCHANTED GREENHOUSE 🌿 — NYANYA ⭐ (UNIVERSE KIDULT)
 * View Controller & Interactive Farming Simulator Engine
 * =============================================================================
 */

import {
  PLANT_CATALOG,
  GREENHOUSE_LEVELS,
  GREENHOUSE_CHARACTERS,
  normalizeGreenhouseCharKey,
  loadGreenhouseState,
  saveGreenhouseState,
  updateCropsGrowth,
  getPlantStage,
  checkLevelUp,
  playWateringSound,
  playHarvestSound,
  playPlantingSound,
  playCoinSound
} from './greenhouse_state.js';

export function initGreenhouseView(options = {}) {
  const { onShowToast, onTriggerSparkle, onNavigateBack } = options;

  const greenhouseView = document.getElementById('view-enchanted-greenhouse');
  if (!greenhouseView) {
    console.warn('[GreenhouseView] #view-enchanted-greenhouse element not found.');
    return null;
  }

  // Load state for active character
  let activeCharKey = 'nyanya';
  let state = loadGreenhouseState(activeCharKey);

  // Update growth from timestamp on load
  updateCropsGrowth(state, Date.now());
  saveGreenhouseState(state, activeCharKey);

  // Tool Selection State
  let activeTool = 'water'; // 'water' | 'seed' | 'fertilize' | 'harvest' | 'inspect'
  let selectedSeedId = 'carrot';
  let gameTicker = null;

  // DOM Elements - Top Bar
  const btnBack = document.getElementById('btn-gh-back');
  const levelTextEl = document.getElementById('gh-level-text');
  const xpFillEl = document.getElementById('gh-xp-fill');
  const coinsTextEl = document.getElementById('gh-coins-text');
  const btnSoundToggle = document.getElementById('btn-gh-sound-toggle');

  // DOM Elements - Navigation Tabs
  const navGarden = document.getElementById('btn-gh-nav-garden');
  const navShop = document.getElementById('btn-gh-nav-shop');
  const navBarn = document.getElementById('btn-gh-nav-barn');
  const navBook = document.getElementById('btn-gh-nav-book');
  const navQuests = document.getElementById('btn-gh-nav-quests');
  const navExpand = document.getElementById('btn-gh-nav-expand');

  // DOM Elements - Plots & Tools
  const plotsContainer = document.getElementById('gh-plots-container');
  const seedTray = document.getElementById('gh-seed-tray');
  const toolButtons = greenhouseView.querySelectorAll('.btn-gh-tool');

  // DOM Elements - Modals
  const shopModal = document.getElementById('gh-shop-modal');
  const barnModal = document.getElementById('gh-barn-modal');
  const bookModal = document.getElementById('gh-book-modal');
  const questsModal = document.getElementById('gh-quests-modal');
  const expandModal = document.getElementById('gh-expand-modal');

  function showToast(msg) {
    if (typeof onShowToast === 'function') {
      onShowToast(msg);
    } else {
      const toast = document.getElementById('universe-toast');
      const text = document.getElementById('toast-text');
      if (toast && text) {
        text.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
    }
  }

  function triggerSparkle(e) {
    if (typeof onTriggerSparkle === 'function') {
      const x = e?.clientX || window.innerWidth / 2;
      const y = e?.clientY || window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
  }

  function closeAllModals() {
    [shopModal, barnModal, bookModal, questsModal, expandModal].forEach(m => {
      if (m) {
        m.classList.remove('open');
        m.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // UPDATE HUD STATS (LEVEL, XP, COINS)
  // ---------------------------------------------------------------------------
  function updateHUD() {
    if (levelTextEl) {
      const lvlInfo = GREENHOUSE_LEVELS.find(l => l.level === state.level) || GREENHOUSE_LEVELS[0];
      levelTextEl.textContent = `Lv. ${state.level} — ${lvlInfo.name}`;
    }
    if (xpFillEl) {
      const curLvlInfo = GREENHOUSE_LEVELS.find(l => l.level === state.level) || GREENHOUSE_LEVELS[0];
      const nextLvlInfo = GREENHOUSE_LEVELS.find(l => l.level === state.level + 1);
      const reqXp = nextLvlInfo ? nextLvlInfo.xpRequired : curLvlInfo.xpRequired;
      const prevXp = curLvlInfo.xpRequired;
      const pct = nextLvlInfo ? Math.min(100, Math.max(5, ((state.xp - prevXp) / (reqXp - prevXp)) * 100)) : 100;
      xpFillEl.style.width = `${pct}%`;
    }
    if (coinsTextEl) {
      coinsTextEl.textContent = `${state.coins} 🪙`;
    }

    // Update Gardener Profile Indicator
    const gardenerEl = document.getElementById('gh-gardener-info');
    if (gardenerEl) {
      const charInfo = GREENHOUSE_CHARACTERS[activeCharKey] || GREENHOUSE_CHARACTERS.nyanya;
      gardenerEl.innerHTML = `
        <img class="gh-gardener-avatar" src="${charInfo.avatar}" alt="${charInfo.name}" loading="lazy" decoding="async">
        <div class="gh-gardener-meta">
          <span class="gh-gardener-name">${charInfo.name} ${charInfo.symbol}</span>
          <span class="gh-gardener-badge ${charInfo.isHost ? 'host' : 'visitor'}">${charInfo.isHost ? '★ Kidult Conservatory' : '✦ Kebun Pengunjung'}</span>
        </div>
      `;
    }

    // Update tool badge counts
    const fertCountEl = document.getElementById('gh-fert-count');
    if (fertCountEl) fertCountEl.textContent = state.fertilizers || 0;
  }

  // ---------------------------------------------------------------------------
  // RENDER SEED QUICK SELECTOR TRAY
  // ---------------------------------------------------------------------------
  function renderSeedTray() {
    if (!seedTray) return;
    const ownedSeeds = Object.entries(state.seeds || {}).filter(([_, count]) => count > 0);

    if (ownedSeeds.length === 0) {
      seedTray.innerHTML = `
        <span style="font-size: 0.8rem; color: #a5d6a7; padding: 4px 10px;">
          Benih habis! Kunjungi Toko Benih 🏪
        </span>
      `;
      return;
    }

    seedTray.innerHTML = ownedSeeds.map(([id, count]) => {
      const plant = PLANT_CATALOG[id];
      if (!plant) return '';
      const isSelected = selectedSeedId === id;
      return `
        <button type="button" class="btn-seed-option ${isSelected ? 'selected' : ''}" data-seed-id="${id}">
          <span>${plant.icon}</span>
          <span>${plant.name.split(' ')[0]}</span>
          <span style="font-size: 0.72rem; opacity: 0.85;">(x${count})</span>
        </button>
      `;
    }).join('');

    seedTray.querySelectorAll('.btn-seed-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.getAttribute('data-seed-id');
        if (sid) {
          selectedSeedId = sid;
          renderSeedTray();
          const p = PLANT_CATALOG[sid];
          showToast(`🌱 Benih dipilih: ${p?.name || sid}`);
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // RENDER 20 SOIL PLOTS
  // ---------------------------------------------------------------------------
  function renderPlots() {
    if (!plotsContainer) return;

    plotsContainer.innerHTML = state.plots.map(plot => {
      if (!plot.isUnlocked) {
        return `
          <div class="gh-plot-card is-locked" data-plot-id="${plot.id}">
            <div class="plot-locked-content">
              <span class="plot-locked-icon">🔒</span>
              <span class="plot-locked-text">Petak #${plot.index}</span>
              <span style="font-size: 0.7rem; opacity: 0.75;">Terkunci</span>
            </div>
          </div>
        `;
      }

      const plant = plot.plantId ? PLANT_CATALOG[plot.plantId] : null;
      const isReady = plot.state === 'ready';
      const isWet = plot.isWatered;

      let statusBadgeHtml = '';
      if (isReady) {
        statusBadgeHtml = `<span class="plot-status-badge ready">✨ Siap Panen</span>`;
      } else if (plot.plantId) {
        statusBadgeHtml = isWet
          ? `<span class="plot-status-badge wet">🌊 Basah</span>`
          : `<span class="plot-status-badge dry">💧 Butuh Air</span>`;
      }

      let centerGraphic = '';
      if (!plot.plantId) {
        centerGraphic = `
          <div class="plot-empty-prompt">
            <span class="plot-empty-icon">🟫</span>
            <span>Petak Kosong</span>
          </div>
        `;
      } else {
        const stage = getPlantStage(plot.growthProgress);
        centerGraphic = `
          <div class="plot-plant-graphic">
            <span class="plot-crop-icon">${isReady ? plant.icon : stage.icon}</span>
            <span style="font-size: 0.72rem; color: #c8e6c9; margin-top: 2px;">${stage.label}</span>
          </div>
        `;
      }

      return `
        <div class="gh-plot-card ${isWet ? 'is-wet' : ''} ${isReady ? 'is-ready' : ''}" data-plot-id="${plot.id}">
          <div class="plot-header-row">
            <span class="plot-index-badge">#${plot.index}</span>
            ${statusBadgeHtml}
          </div>
          ${centerGraphic}
          <div class="plot-footer-info">
            <span class="plot-crop-name">${plant ? plant.name : 'Siap Ditanami'}</span>
            ${plot.plantId ? `
              <div class="plot-progress-bar">
                <div class="plot-progress-fill" style="width: ${plot.growthProgress}%;"></div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Bind plot clicks
    plotsContainer.querySelectorAll('.gh-plot-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const plotId = card.getAttribute('data-plot-id');
        handlePlotClick(plotId, e);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // INTERACTIVE PLOT CLICK HANDLER
  // ---------------------------------------------------------------------------
  function handlePlotClick(plotId, event) {
    const plot = state.plots.find(p => p.id === plotId);
    if (!plot) return;

    if (!plot.isUnlocked) {
      showToast('🔒 Petak ini masih terkunci. Tingkatkan Level Greenhouse untuk membukanya!');
      return;
    }

    triggerSparkle(event);

    // 1. Auto Harvest if ready
    if (plot.state === 'ready' && plot.plantId) {
      harvestPlot(plot, event);
      return;
    }

    // 2. Based on Selected Tool
    if (activeTool === 'water') {
      waterPlot(plot);
    } else if (activeTool === 'seed') {
      plantPlot(plot);
    } else if (activeTool === 'fertilize') {
      fertilizePlot(plot);
    } else if (activeTool === 'harvest') {
      if (plot.state === 'ready') {
        harvestPlot(plot, event);
      } else if (plot.plantId) {
        showToast('⏳ Tanaman belum matang! Sirami dan beri pupuk agar lekas tumbuh.');
      } else {
        showToast('🌱 Petak masih kosong. Tanam benih terlebih dahulu.');
      }
    } else if (activeTool === 'inspect') {
      inspectPlot(plot);
    }
  }

  function waterPlot(plot) {
    if (!plot.plantId) {
      plot.isWatered = true;
      plot.lastWateredAt = Date.now();
      saveState();
      renderPlots();
      if (state.soundEnabled) playWateringSound();
      showToast('💧 Tanah disiram air segar hingga gembur.');
      return;
    }

    plot.isWatered = true;
    plot.lastWateredAt = Date.now();
    if (plot.state === 'needs_water') {
      plot.state = 'growing';
    }

    // Daily Quest progress
    updateQuestProgress('quest_water_3', 1);
    updateAchievementProgress('ach_green_thumb', 1);

    saveState();
    renderPlots();
    if (state.soundEnabled) playWateringSound();
    const plant = PLANT_CATALOG[plot.plantId];
    showToast(`💧 ${plant?.name || 'Tanaman'} disiram segar!`);
  }

  function plantPlot(plot) {
    if (plot.plantId) {
      showToast('⚠️ Petak ini sudah ditanami! Tunggu hingga panen atau pilih petak kosong.');
      return;
    }

    const seedCount = state.seeds[selectedSeedId] || 0;
    if (seedCount <= 0) {
      showToast('❌ Stok benih ini habis! Beli benih di Seed Shop 🏪');
      return;
    }

    const plant = PLANT_CATALOG[selectedSeedId];
    if (!plant) return;

    // Deduct seed
    state.seeds[selectedSeedId] -= 1;
    plot.plantId = selectedSeedId;
    plot.plantedAt = Date.now();
    plot.lastWateredAt = Date.now();
    plot.isWatered = true;
    plot.fertilizerApplied = false;
    plot.growthProgress = 0;
    plot.state = 'growing';

    // Update Encyclopedia
    if (!state.encyclopedia[selectedSeedId]) {
      state.encyclopedia[selectedSeedId] = { discovered: true, plantedCount: 0, harvestedCount: 0 };
    }
    state.encyclopedia[selectedSeedId].plantedCount += 1;

    // Daily Quest
    updateQuestProgress('quest_plant_3', 1);

    saveState();
    renderPlots();
    renderSeedTray();
    updateHUD();

    if (state.soundEnabled) playPlantingSound();
    showToast(`🌱 Menanam ${plant.name}! Rawat dengan teratur agar tumbuh subur.`);
  }

  function fertilizePlot(plot) {
    if (!plot.plantId) {
      showToast('⚠️ Tanam benih terlebih dahulu sebelum memberikan pupuk.');
      return;
    }

    if (plot.state === 'ready') {
      showToast('✨ Tanaman sudah siap dipanen!');
      return;
    }

    if (plot.fertilizerApplied) {
      showToast('🧪 Petak ini sudah diberi pupuk berkebun.');
      return;
    }

    if ((state.fertilizers || 0) <= 0) {
      showToast('❌ Pupuk habis! Dapatkan dari hadiah misi harian atau toko.');
      return;
    }

    state.fertilizers -= 1;
    plot.fertilizerApplied = true;
    plot.growthProgress = Math.min(100, plot.growthProgress + 35);
    if (plot.growthProgress >= 100) {
      plot.state = 'ready';
    }

    saveState();
    renderPlots();
    updateHUD();

    if (state.soundEnabled) playWateringSound();
    showToast('✨ Pupuk ajaib diberikan! Pertumbuhan tanaman melonjak pesat.');
  }

  function harvestPlot(plot, event) {
    const plant = PLANT_CATALOG[plot.plantId];
    if (!plant) return;

    const yieldAmount = Math.floor(Math.random() * (plant.yieldMax - plant.yieldMin + 1)) + plant.yieldMin;
    state.harvest[plot.plantId] = (state.harvest[plot.plantId] || 0) + yieldAmount;
    state.xp += plant.xpReward;

    // Check level up
    const { leveledUp, currentLevel } = checkLevelUp(state);

    // Update Encyclopedia
    if (!state.encyclopedia[plot.plantId]) {
      state.encyclopedia[plot.plantId] = { discovered: true, plantedCount: 0, harvestedCount: 0 };
    }
    state.encyclopedia[plot.plantId].harvestedCount += yieldAmount;

    // Reset plot
    plot.plantId = null;
    plot.plantedAt = null;
    plot.lastWateredAt = null;
    plot.isWatered = false;
    plot.fertilizerApplied = false;
    plot.growthProgress = 0;
    plot.state = 'empty';

    // Daily Quests & Achievements
    updateQuestProgress('quest_harvest_2', 1);
    updateAchievementProgress('ach_first_harvest', 1);
    updateAchievementProgress('ach_harvester_10', yieldAmount);

    saveState();
    renderPlots();
    updateHUD();

    if (state.soundEnabled) playHarvestSound();
    triggerSparkle(event);

    showToast(`🧺 Panen Berhasil! Mendapatkan ${yieldAmount}x ${plant.name} (+${plant.xpReward} XP)`);

    if (leveledUp) {
      showToast(`🎉 LEVEL UP! Greenhouse naik ke Level ${currentLevel}! Petak tanah baru terbuka.`);
    }
  }

  function inspectPlot(plot) {
    if (!plot.plantId) {
      showToast(`Petak #${plot.index}: Kosong & gembur. Pilih benih untuk menanam.`);
      return;
    }
    const plant = PLANT_CATALOG[plot.plantId];
    const stage = getPlantStage(plot.growthProgress);
    showToast(`Petak #${plot.index}: ${plant?.name} (${stage.label} - ${plot.growthProgress}%) | ${plot.isWatered ? '💧 Cukup Air' : '⚠️ Butuh Air'}`);
  }

  // ---------------------------------------------------------------------------
  // QUESTS & ACHIEVEMENTS PROGRESS ENGINE
  // ---------------------------------------------------------------------------
  function updateQuestProgress(questId, amount = 1) {
    const q = state.dailyQuests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.progress = Math.min(q.target, q.progress + amount);
      if (q.progress >= q.target) {
        q.completed = true;
        showToast(`📜 Misi Selesai: "${q.title}"! Buka menu Misi untuk klaim hadiah.`);
      }
    }
  }

  function updateAchievementProgress(achId, amount = 1) {
    const a = state.achievements.find(item => item.id === achId);
    if (a && !a.unlocked) {
      a.progress = Math.min(a.target, a.progress + amount);
      if (a.progress >= a.target) {
        a.unlocked = true;
        state.coins += a.rewardCoins;
        state.xp += a.rewardXp;
        checkLevelUp(state);
        showToast(`🏆 PRESTASI DIBUKA: "${a.title}"! (+${a.rewardCoins} 🪙 & +${a.rewardXp} XP)`);
      }
    }
  }

  function saveState() {
    saveGreenhouseState(state, activeCharKey);
  }

  // ---------------------------------------------------------------------------
  // SEED SHOP MODAL
  // ---------------------------------------------------------------------------
  function openSeedShop(category = 'all') {
    closeAllModals();
    if (!shopModal) return;

    const listEl = document.getElementById('gh-shop-items');
    if (!listEl) return;

    const plants = Object.values(PLANT_CATALOG).filter(p => {
      if (category === 'all') return true;
      return p.category === category;
    });

    listEl.innerHTML = plants.map(p => {
      const canAfford = state.coins >= p.seedPrice;
      const isLevelUnlocked = state.level >= (p.levelReq || 1);
      return `
        <div class="gh-item-card">
          <div class="gh-item-top">
            <span class="gh-item-icon">${p.icon}</span>
            <div>
              <div class="gh-item-name">${p.name}</div>
              <span style="font-size: 0.72rem; color: #a5d6a7;">${p.categoryName} · ${p.rarity}</span>
            </div>
          </div>
          <div class="gh-item-desc">${p.desc}</div>
          <div class="gh-item-meta">
            <span>⏱️ ${p.growthTime}s tumbuh</span>
            <span>🧺 Hasil: ${p.yieldMin}-${p.yieldMax}</span>
          </div>
          <button type="button" class="btn-gh-action btn-buy-seed" data-plant-id="${p.id}" ${(!canAfford || !isLevelUnlocked) ? 'disabled' : ''}>
            ${!isLevelUnlocked ? `🔒 Level ${p.levelReq}` : `🪙 Beli (${p.seedPrice} Koin)`}
          </button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.btn-buy-seed').forEach(btn => {
      btn.addEventListener('click', (e) => {
        triggerSparkle(e);
        const pid = btn.getAttribute('data-plant-id');
        const plant = PLANT_CATALOG[pid];
        if (plant && state.coins >= plant.seedPrice) {
          state.coins -= plant.seedPrice;
          state.seeds[pid] = (state.seeds[pid] || 0) + 1;
          updateQuestProgress('quest_buy_seed', 1);
          saveState();
          updateHUD();
          renderSeedTray();
          openSeedShop(category); // re-render buttons
          if (state.soundEnabled) playCoinSound();
          showToast(`🛍️ Berhasil membeli benih ${plant.name}!`);
        }
      });
    });

    shopModal.classList.add('open');
    shopModal.setAttribute('aria-hidden', 'false');
  }

  // ---------------------------------------------------------------------------
  // INVENTORY & HARVEST BARN MODAL
  // ---------------------------------------------------------------------------
  function openBarn() {
    closeAllModals();
    if (!barnModal) return;

    const seedsListEl = document.getElementById('gh-barn-seeds');
    const harvestListEl = document.getElementById('gh-barn-harvest');

    // Render Seeds
    if (seedsListEl) {
      const ownedSeeds = Object.entries(state.seeds || {}).filter(([_, c]) => c > 0);
      if (ownedSeeds.length === 0) {
        seedsListEl.innerHTML = `<p style="font-size: 0.85rem; color: #a5d6a7;">Belum ada benih di kantong. Beli di Toko Benih 🏪</p>`;
      } else {
        seedsListEl.innerHTML = ownedSeeds.map(([id, count]) => {
          const p = PLANT_CATALOG[id];
          return `
            <div class="gh-item-card" style="padding: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.8rem;">${p?.icon || '🌱'}</span>
                <div>
                  <strong style="font-size: 0.88rem; color: #ffffff;">${p?.name || id}</strong>
                  <div style="font-size: 0.76rem; color: #a5d6a7;">Tersedia: ${count} benih</div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Harvested Crops
    if (harvestListEl) {
      const harvested = Object.entries(state.harvest || {}).filter(([_, c]) => c > 0);
      if (harvested.length === 0) {
        harvestListEl.innerHTML = `<p style="font-size: 0.85rem; color: #a5d6a7;">Lumbung kosong. Tanam dan panen tanamanmu di kebun!</p>`;
      } else {
        harvestListEl.innerHTML = harvested.map(([id, count]) => {
          const p = PLANT_CATALOG[id];
          const totalVal = (p?.sellPrice || 10) * count;
          return `
            <div class="gh-item-card" style="padding: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 2rem;">${p?.icon || '🧺'}</span>
                  <div>
                    <strong style="color: #ffffff;">${p?.name || id}</strong>
                    <div style="font-size: 0.76rem; color: #ffd54f;">Stok: ${count} buah (Nilai: ${totalVal} 🪙)</div>
                  </div>
                </div>
                <button type="button" class="btn-gh-action btn-sell-crop" data-plant-id="${id}" style="padding: 6px 12px; font-size: 0.78rem;">
                  🪙 Jual (${totalVal} Koin)
                </button>
              </div>
            </div>
          `;
        }).join('');

        harvestListEl.querySelectorAll('.btn-sell-crop').forEach(btn => {
          btn.addEventListener('click', (e) => {
            triggerSparkle(e);
            const pid = btn.getAttribute('data-plant-id');
            const p = PLANT_CATALOG[pid];
            const count = state.harvest[pid] || 0;
            if (p && count > 0) {
              const coinsEarned = p.sellPrice * count;
              state.coins += coinsEarned;
              delete state.harvest[pid];
              saveState();
              updateHUD();
              openBarn(); // refresh
              if (state.soundEnabled) playCoinSound();
              showToast(`💰 Menjual ${count}x ${p.name} seharga ${coinsEarned} Koin!`);
            }
          });
        });
      }
    }

    barnModal.classList.add('open');
    barnModal.setAttribute('aria-hidden', 'false');
  }

  // ---------------------------------------------------------------------------
  // BOTANICAL BOOK (PLANT ENCYCLOPEDIA)
  // ---------------------------------------------------------------------------
  function openBook() {
    closeAllModals();
    if (!bookModal) return;

    const listEl = document.getElementById('gh-book-list');
    if (!listEl) return;

    const plants = Object.values(PLANT_CATALOG);
    listEl.innerHTML = plants.map(p => {
      const entry = state.encyclopedia[p.id];
      const isDiscovered = !!entry;
      return `
        <div class="gh-item-card" style="opacity: ${isDiscovered ? '1' : '0.65'};">
          <div class="gh-item-top">
            <span class="gh-item-icon">${isDiscovered ? p.icon : '❓'}</span>
            <div>
              <div class="gh-item-name">${isDiscovered ? p.name : 'Belum Ditemukan'}</div>
              <span style="font-size: 0.72rem; color: #a5d6a7;">${p.categoryName} · ${p.rarity}</span>
            </div>
          </div>
          <div class="gh-item-desc">${isDiscovered ? p.desc : 'Tanam atau temukan benih ini untuk membuka catatan botani.'}</div>
          <div class="gh-item-meta">
            <span>🌱 Ditanam: ${entry?.plantedCount || 0}x</span>
            <span>🧺 Dipanen: ${entry?.harvestedCount || 0}x</span>
          </div>
        </div>
      `;
    }).join('');

    bookModal.classList.add('open');
    bookModal.setAttribute('aria-hidden', 'false');
  }

  // ---------------------------------------------------------------------------
  // DAILY QUESTS & ACHIEVEMENTS MODAL
  // ---------------------------------------------------------------------------
  function openQuests() {
    closeAllModals();
    if (!questsModal) return;

    const questsListEl = document.getElementById('gh-quests-list');
    const achListEl = document.getElementById('gh-achievements-list');

    if (questsListEl) {
      questsListEl.innerHTML = state.dailyQuests.map(q => {
        const canClaim = q.completed && !q.claimed;
        return `
          <div class="gh-item-card" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff;">${q.title}</strong>
                <p style="margin: 2px 0; font-size: 0.78rem; color: #c8e6c9;">${q.desc}</p>
                <span style="font-size: 0.72rem; color: #ffd54f;">Hadiah: +${q.rewardCoins} 🪙, +${q.rewardXp} XP</span>
              </div>
              <div>
                ${q.claimed
                  ? `<span style="font-size: 0.8rem; color: #81c784; font-weight: 700;">✓ Selesai</span>`
                  : `<button type="button" class="btn-gh-action btn-claim-quest" data-quest-id="${q.id}" ${!canClaim ? 'disabled' : ''}>
                      ${canClaim ? '🎁 Klaim' : `${q.progress}/${q.target}`}
                     </button>`
                }
              </div>
            </div>
          </div>
        `;
      }).join('');

      questsListEl.querySelectorAll('.btn-claim-quest').forEach(btn => {
        btn.addEventListener('click', (e) => {
          triggerSparkle(e);
          const qid = btn.getAttribute('data-quest-id');
          const q = state.dailyQuests.find(item => item.id === qid);
          if (q && q.completed && !q.claimed) {
            q.claimed = true;
            state.coins += q.rewardCoins;
            state.xp += q.rewardXp;
            checkLevelUp(state);
            saveState();
            updateHUD();
            openQuests();
            if (state.soundEnabled) playCoinSound();
            showToast(`🎁 Hadiah Misi Diklaim: +${q.rewardCoins} 🪙 & +${q.rewardXp} XP!`);
          }
        });
      });
    }

    if (achListEl) {
      achListEl.innerHTML = state.achievements.map(a => `
        <div class="gh-item-card" style="padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: ${a.unlocked ? '#ffd54f' : '#ffffff'};">${a.title}</strong>
              <p style="margin: 2px 0; font-size: 0.78rem; color: #c8e6c9;">${a.desc}</p>
            </div>
            <span style="font-size: 0.8rem; font-weight: 700; color: ${a.unlocked ? '#81c784' : '#888'};">
              ${a.unlocked ? '🏆 Terbuka' : `${a.progress}/${a.target}`}
            </span>
          </div>
        </div>
      `).join('');
    }

    questsModal.classList.add('open');
    questsModal.setAttribute('aria-hidden', 'false');
  }

  // ---------------------------------------------------------------------------
  // GREENHOUSE LEVEL & EXPANSION MODAL
  // ---------------------------------------------------------------------------
  function openExpansion() {
    closeAllModals();
    if (!expandModal) return;

    const listEl = document.getElementById('gh-expansion-levels');
    if (listEl) {
      listEl.innerHTML = GREENHOUSE_LEVELS.map(lvl => {
        const isCurrent = state.level === lvl.level;
        const isReached = state.level >= lvl.level;
        return `
          <div class="gh-item-card" style="border-color: ${isCurrent ? 'var(--gh-gold)' : 'var(--gh-border)'};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #ffffff;">Level ${lvl.level}: ${lvl.name}</strong>
                <p style="margin: 2px 0; font-size: 0.8rem; color: #c8e6c9;">${lvl.desc}</p>
                <span style="font-size: 0.74rem; color: #ffd54f;">Syarat XP: ${lvl.xpRequired} XP · Petak Terbuka: ${lvl.unlockedPlots}</span>
              </div>
              <span style="font-weight: 700; font-size: 0.85rem; color: ${isReached ? '#81c784' : '#888'};">
                ${isCurrent ? '⭐ Aktif' : (isReached ? '✓ Terbuka' : '🔒 Terkunci')}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    expandModal.classList.add('open');
    expandModal.setAttribute('aria-hidden', 'false');
  }

  // ---------------------------------------------------------------------------
  // OPEN & CLOSE GREENHOUSE
  // ---------------------------------------------------------------------------
  function openGreenhouse(charKey = 'nyanya') {
    activeCharKey = normalizeGreenhouseCharKey(charKey || 'nyanya');
    state = loadGreenhouseState(activeCharKey);
    updateCropsGrowth(state, Date.now());

    closeAllModals();

    const viewKidult = document.getElementById('view-kidult-world');
    if (viewKidult) {
      viewKidult.classList.remove('active');
      viewKidult.setAttribute('aria-hidden', 'true');
    }

    greenhouseView.classList.add('active');
    greenhouseView.setAttribute('aria-hidden', 'false');

    updateHUD();
    renderPlots();
    renderSeedTray();

    // Start live growth ticker
    if (gameTicker) clearInterval(gameTicker);
    gameTicker = setInterval(() => {
      const changed = updateCropsGrowth(state, Date.now());
      if (changed) {
        saveState();
        renderPlots();
      }
    }, 1500);

    const charInfo = GREENHOUSE_CHARACTERS[activeCharKey] || GREENHOUSE_CHARACTERS.nyanya;
    if (charInfo.isHost) {
      showToast('🌿 Memasuki The Enchanted Greenhouse — Starlight Conservatory milik Nyanya ⭐');
    } else {
      showToast(`🌿 Memasuki The Enchanted Greenhouse — Kebun Pribadi ${charInfo.name} ${charInfo.symbol} (Mode Pengunjung)`);
    }
  }

  function closeGreenhouse() {
    closeAllModals();
    if (gameTicker) {
      clearInterval(gameTicker);
      gameTicker = null;
    }

    saveState();

    greenhouseView.classList.remove('active');
    greenhouseView.setAttribute('aria-hidden', 'true');

    if (typeof onNavigateBack === 'function') {
      onNavigateBack();
    } else {
      const viewKidult = document.getElementById('view-kidult-world');
      if (viewKidult) {
        viewKidult.classList.add('active');
        viewKidult.setAttribute('aria-hidden', 'false');
      }
    }

    showToast('★ Kembali ke Pulau 2D KIDULT');
  }

  // ---------------------------------------------------------------------------
  // EVENT LISTENERS BINDING
  // ---------------------------------------------------------------------------
  if (btnBack) {
    btnBack.addEventListener('click', closeGreenhouse);
  }

  // Tool Switching
  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool');
      if (tool) {
        activeTool = tool;
        toolButtons.forEach(b => b.classList.toggle('active', b === btn));
        if (seedTray) {
          seedTray.classList.toggle('open', tool === 'seed');
        }
      }
    });
  });

  // Sound Toggle
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      btnSoundToggle.textContent = state.soundEnabled ? '🔊' : '🔇';
      saveState();
      showToast(state.soundEnabled ? '🔊 Suara kebun diaktifkan.' : '🔇 Suara kebun dibisukan.');
    });
  }

  // Navigation Activities
  if (navGarden) {
    navGarden.addEventListener('click', () => {
      closeAllModals();
    });
  }
  if (navShop) {
    navShop.addEventListener('click', () => openSeedShop('all'));
  }
  if (navBarn) {
    navBarn.addEventListener('click', openBarn);
  }
  if (navBook) {
    navBook.addEventListener('click', openBook);
  }
  if (navQuests) {
    navQuests.addEventListener('click', openQuests);
  }
  if (navExpand) {
    navExpand.addEventListener('click', openExpansion);
  }

  // Modal Category Filters (Shop)
  greenhouseView.querySelectorAll('.btn-gh-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      greenhouseView.querySelectorAll('.btn-gh-filter').forEach(b => b.classList.toggle('active', b === btn));
      openSeedShop(cat || 'all');
    });
  });

  // Modal Close Buttons & Backdrop Clicks
  greenhouseView.querySelectorAll('.btn-gh-modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  greenhouseView.querySelectorAll('.gh-modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  return {
    openGreenhouse,
    closeGreenhouse,
    waterPlot,
    plantPlot,
    fertilizePlot,
    harvestPlot,
    openSeedShop,
    openBarn,
    openBook,
    openQuests,
    openExpansion
  };
}
