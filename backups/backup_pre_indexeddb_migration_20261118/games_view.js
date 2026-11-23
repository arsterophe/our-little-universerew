/**
 * OUR LITTLE UNIVERSE — GAMES VIEW CONTROLLER (FASE 7)
 * Interactive UI Controller for Going Seventeen Zone:
 * How Well Do You Know Me?, This or That, Who Said That?!, and Bestie Mission.
 */

import {
  GAME_METADATA,
  getActiveUserCharacter,
  setActiveUserCharacter,
  getKnowMeQuestions,
  evaluateKnowMeScore,
  THIS_OR_THAT_ROUNDS,
  calculateThisOrThatAura,
  getWhoSaidItQuestions,
  getBestieMissions,
  toggleBestieMission,
  saveGameResult,
  getCachedGameRecords,
  fetchCloudGameRecords,
  subscribeGameChanges
} from './games.js';

let isGamesInitialized = false;
let previousGamesViewId = 'view-private-universe';
let onShowToastCallback = null;
let onNavigateFeatureCallback = null;

// Game State
let currentGameId = null;
let currentRoundIndex = 0;
let currentScore = 0;
let currentQuestions = [];
let currentAnswers = {};
let selectedKnowMeTarget = 'lala';
let thisOrThatPicks = {};

const CHARACTER_DISPLAY = {
  nyanya: { name: 'Nyanya', role: 'The Moonlit Shadow Witch', symbol: '★', avatar: '/assets/avatar_nyanya_hd.png' },
  lala: { name: 'Lala', role: 'The Sunshine Healer', symbol: '☼', avatar: '/assets/avatar_lala_hd.png' },
  lele: { name: 'Lele', role: 'The Crystal Shadow Artist', symbol: '☾', avatar: '/assets/avatar_lele_hd.png' }
};

export function openGamesView(fromView = 'view-private-universe', charKey = null) {
  previousGamesViewId = fromView || 'view-private-universe';

  if (charKey && CHARACTER_DISPLAY[charKey]) {
    setActiveUserCharacter(charKey);
  }

  const allViews = [
    'view-selection',
    'view-login',
    'view-private-universe',
    'view-kidult-world',
    'view-toyou-world',
    'view-shadow-world',
    'view-orbit',
    'view-moments',
    'view-photobooth',
    'view-our-stories',
    'view-story-workspace',
    'view-story-reading',
    'view-messages',
    'view-games'
  ];

  allViews.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    }
  });

  const viewGames = document.getElementById('view-games');
  if (viewGames) {
    viewGames.classList.add('active');
    viewGames.setAttribute('aria-hidden', 'false');
  }

  // Update navbar active state
  document.querySelectorAll('.univ-nav-btn[data-nav]').forEach((btn) => {
    const active = btn.getAttribute('data-nav') === 'games';
    btn.classList.toggle('active', active);
    if (active) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderPlayerHeader();
  showHubView();
  renderHistoryList();
  fetchCloudGameRecords().then(() => renderHistoryList()).catch(() => {});
}

export function closeGamesView() {
  const viewGames = document.getElementById('view-games');
  if (viewGames) {
    viewGames.classList.remove('active');
    viewGames.setAttribute('aria-hidden', 'true');
  }

  const targetViewId = previousGamesViewId || 'view-private-universe';
  const targetView = document.getElementById(targetViewId);
  if (targetView) {
    targetView.classList.add('active');
    targetView.setAttribute('aria-hidden', 'false');
  }

  // Restore active state on navbar
  document.querySelectorAll('.univ-nav-btn[data-nav]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-nav') === 'universes');
  });

  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function syncGamesActiveCharacter(charKey) {
  if (CHARACTER_DISPLAY[charKey]) {
    setActiveUserCharacter(charKey);
    renderPlayerHeader();
    renderMissionsList();
  }
}

function renderPlayerHeader() {
  const current = getActiveUserCharacter();
  const info = CHARACTER_DISPLAY[current] || CHARACTER_DISPLAY.nyanya;

  const avatarEl = document.getElementById('games-current-user-avatar');
  const nameEl = document.getElementById('games-current-user-name');
  const roleEl = document.getElementById('games-current-user-role');

  if (avatarEl) {
    avatarEl.src = info.avatar;
    avatarEl.alt = `${info.name} Avatar`;
  }
  if (nameEl) nameEl.textContent = `${info.name} ${info.symbol}`;
  if (roleEl) roleEl.textContent = info.role;
}

// Switch between Main Tabs: Hub vs Missions vs History
function switchGamesTab(tabName) {
  const tabBtns = document.querySelectorAll('.games-tab-btn[data-tab]');
  tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));

  const hubSection = document.getElementById('games-hub-section');
  const arenaSection = document.getElementById('games-arena-section');
  const missionsSection = document.getElementById('games-missions-section');
  const historySection = document.getElementById('games-history-section');

  if (tabName === 'hub') {
    showHubView();
  } else if (tabName === 'missions') {
    if (hubSection) hubSection.style.display = 'none';
    if (arenaSection) arenaSection.style.display = 'none';
    if (missionsSection) missionsSection.style.display = 'block';
    if (historySection) historySection.style.display = 'none';
    renderMissionsList();
  } else if (tabName === 'history') {
    if (hubSection) hubSection.style.display = 'none';
    if (arenaSection) arenaSection.style.display = 'none';
    if (missionsSection) missionsSection.style.display = 'none';
    if (historySection) historySection.style.display = 'block';
    renderHistoryList();
  }
}

function showHubView() {
  currentGameId = null;
  const hubSection = document.getElementById('games-hub-section');
  const arenaSection = document.getElementById('games-arena-section');
  const missionsSection = document.getElementById('games-missions-section');
  const historySection = document.getElementById('games-history-section');

  if (hubSection) hubSection.style.display = 'block';
  if (arenaSection) arenaSection.style.display = 'none';
  if (missionsSection) missionsSection.style.display = 'none';
  if (historySection) historySection.style.display = 'block'; // History displayed under hub
}

// Start Game In Arena
export function startGame(gameId, options = {}) {
  currentGameId = gameId;
  currentRoundIndex = 0;
  currentScore = 0;
  currentAnswers = {};

  const hubSection = document.getElementById('games-hub-section');
  const arenaSection = document.getElementById('games-arena-section');
  const missionsSection = document.getElementById('games-missions-section');

  if (hubSection) hubSection.style.display = 'none';
  if (missionsSection) missionsSection.style.display = 'none';
  if (arenaSection) {
    arenaSection.style.display = 'block';
    arenaSection.classList.add('active');
  }

  const resultView = document.getElementById('arena-result-view');
  if (resultView) resultView.classList.remove('active');

  const questionBox = document.getElementById('arena-question-box');
  const optionsGrid = document.getElementById('arena-options-grid');
  const feedbackCard = document.getElementById('arena-feedback-card');

  if (questionBox) questionBox.style.display = 'block';
  if (optionsGrid) optionsGrid.style.display = 'grid';
  if (feedbackCard) feedbackCard.classList.remove('active');

  if (gameId === 'know_me') {
    // Select friend to test
    const current = getActiveUserCharacter();
    const otherChars = Object.keys(CHARACTER_DISPLAY).filter(c => c !== current);
    selectedKnowMeTarget = options.targetChar || otherChars[0] || 'lala';
    currentQuestions = getKnowMeQuestions(selectedKnowMeTarget);
    renderKnowMeRound();
  } else if (gameId === 'this_or_that') {
    thisOrThatPicks = {};
    currentQuestions = THIS_OR_THAT_ROUNDS;
    renderThisOrThatRound();
  } else if (gameId === 'who_said_it') {
    currentQuestions = getWhoSaidItQuestions(5);
    renderWhoSaidItRound();
  } else if (gameId === 'bestie_mission') {
    switchGamesTab('missions');
  }
}

// ---------------------------------------------------------------------
// GAME 1: HOW WELL DO YOU KNOW ME
// ---------------------------------------------------------------------
function renderKnowMeRound() {
  const q = currentQuestions[currentRoundIndex];
  if (!q) {
    finishKnowMeGame();
    return;
  }

  updateArenaHeader('How Well Do You Know Me?', currentRoundIndex + 1, currentQuestions.length);

  const targetInfo = CHARACTER_DISPLAY[selectedKnowMeTarget] || CHARACTER_DISPLAY.lala;
  const questionBox = document.getElementById('arena-question-box');
  if (questionBox) {
    questionBox.innerHTML = `
      <div class="arena-target-pill">
        <span>👤 Uji Pengetahuan: ${targetInfo.name} ${targetInfo.symbol}</span>
      </div>
      <h3 class="arena-question-text">${q.question}</h3>
    `;
  }

  const optionsGrid = document.getElementById('arena-options-grid');
  if (optionsGrid) {
    optionsGrid.className = 'arena-options-grid';
    optionsGrid.innerHTML = '';

    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'arena-option-btn';
      btn.innerHTML = `<span>${optText}</span><span class="option-tag">#${optIdx + 1}</span>`;

      btn.addEventListener('click', () => {
        handleKnowMeAnswer(optIdx, q);
      });

      optionsGrid.appendChild(btn);
    });
  }

  const feedbackCard = document.getElementById('arena-feedback-card');
  if (feedbackCard) feedbackCard.classList.remove('active');
}

function handleKnowMeAnswer(chosenIdx, q) {
  const optionsGrid = document.getElementById('arena-options-grid');
  if (!optionsGrid) return;

  const buttons = optionsGrid.querySelectorAll('.arena-option-btn');
  buttons.forEach((b, idx) => {
    b.disabled = true;
    if (idx === q.correctIndex) {
      b.classList.add('correct');
    } else if (idx === chosenIdx) {
      b.classList.add('wrong');
    }
  });

  const isCorrect = chosenIdx === q.correctIndex;
  if (isCorrect) currentScore += 1;
  currentAnswers[currentRoundIndex] = { question: q.question, chosenIdx, correctIndex: q.correctIndex, isCorrect };

  const feedbackCard = document.getElementById('arena-feedback-card');
  if (feedbackCard) {
    feedbackCard.classList.add('active');
    feedbackCard.innerHTML = `
      <div class="arena-feedback-text">
        <strong>${isCorrect ? '✨ Tepat Sekali!' : '🍂 Ups, Belum Tepat!'}</strong><br>
        <span>${q.explanation}</span>
      </div>
      <button type="button" class="btn-arena-next" id="btn-arena-next">
        ${currentRoundIndex + 1 < currentQuestions.length ? 'Lanjut ➜' : 'Lihat Hasil 🏆'}
      </button>
    `;

    const nextBtn = document.getElementById('btn-arena-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentRoundIndex += 1;
        renderKnowMeRound();
      });
    }
  }
}

async function finishKnowMeGame() {
  const evalResult = evaluateKnowMeScore(currentScore, currentQuestions.length);
  showResultScreen({
    icon: evalResult.percentage >= 80 ? '🎉' : '✨',
    badge: evalResult.badge,
    title: evalResult.title,
    message: `${evalResult.message} Kamu menjawab ${currentScore} dari ${currentQuestions.length} pertanyaan dengan benar (${evalResult.percentage}%).`,
    onRetry: () => startGame('know_me', { targetChar: selectedKnowMeTarget })
  });

  await saveGameResult({
    gameId: 'know_me',
    score: currentScore,
    maxScore: currentQuestions.length,
    summary: `${evalResult.badge} (${currentScore}/${currentQuestions.length})`,
    answers: currentAnswers
  });

  renderHistoryList();
}

// ---------------------------------------------------------------------
// GAME 2: THIS OR THAT
// ---------------------------------------------------------------------
function renderThisOrThatRound() {
  const r = currentQuestions[currentRoundIndex];
  if (!r) {
    finishThisOrThatGame();
    return;
  }

  updateArenaHeader('This or That: Kosmik Edition', currentRoundIndex + 1, currentQuestions.length);

  const questionBox = document.getElementById('arena-question-box');
  if (questionBox) {
    questionBox.innerHTML = `
      <div class="arena-target-pill">
        <span>⚖️ Kategori: ${r.category}</span>
      </div>
      <h3 class="arena-question-text">Pilihan mana yang paling menggambarkan dirimu?</h3>
    `;
  }

  const optionsGrid = document.getElementById('arena-options-grid');
  if (optionsGrid) {
    optionsGrid.className = 'arena-options-grid two-cols';
    optionsGrid.innerHTML = '';

    [ { key: 'A', opt: r.optionA }, { key: 'B', opt: r.optionB } ].forEach(({ key, opt }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'arena-option-btn';
      btn.innerHTML = `
        <div>
          <div style="font-weight:700; font-size:1.05rem;">${opt.label}</div>
          <div style="font-size:0.75rem; color:#94a3b8; margin-top:0.2rem;">${opt.desc}</div>
        </div>
        <span class="option-tag">Pilihan ${key}</span>
      `;

      btn.addEventListener('click', () => {
        thisOrThatPicks[r.id] = opt;
        currentRoundIndex += 1;
        renderThisOrThatRound();
      });

      optionsGrid.appendChild(btn);
    });
  }

  const feedbackCard = document.getElementById('arena-feedback-card');
  if (feedbackCard) feedbackCard.classList.remove('active');
}

async function finishThisOrThatGame() {
  const aura = calculateThisOrThatAura(thisOrThatPicks);
  showResultScreen({
    icon: '🔮',
    badge: aura.badge,
    title: aura.title,
    message: `${aura.desc}<br><br><strong>Kecocokan Kosmik:</strong> Nyanya (${aura.affinity.nyanya}%), Lala (${aura.affinity.lala}%), Lele (${aura.affinity.lele}%).`,
    onRetry: () => startGame('this_or_that')
  });

  await saveGameResult({
    gameId: 'this_or_that',
    score: 5,
    maxScore: 5,
    summary: `${aura.badge} - ${aura.title}`,
    answers: thisOrThatPicks
  });

  renderHistoryList();
}

// ---------------------------------------------------------------------
// GAME 3: WHO SAID THAT?!
// ---------------------------------------------------------------------
function renderWhoSaidItRound() {
  const q = currentQuestions[currentRoundIndex];
  if (!q) {
    finishWhoSaidItGame();
    return;
  }

  updateArenaHeader('Who Said That?!', currentRoundIndex + 1, currentQuestions.length);

  const questionBox = document.getElementById('arena-question-box');
  if (questionBox) {
    questionBox.innerHTML = `
      <div class="arena-target-pill">
        <span>💬 Tebak Kutipan Siapa Ini</span>
      </div>
      <p class="arena-quote-text">${q.quote}</p>
      <div class="arena-quote-hint">💡 Petunjuk: ${q.hint}</div>
    `;
  }

  const optionsGrid = document.getElementById('arena-options-grid');
  if (optionsGrid) {
    optionsGrid.className = 'arena-options-grid';
    optionsGrid.innerHTML = '';

    ['nyanya', 'lala', 'lele'].forEach(charKey => {
      const char = CHARACTER_DISPLAY[charKey];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'arena-option-btn';
      btn.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <img src="${char.avatar}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;" />
          <div>
            <div style="font-weight:700;">${char.name} ${char.symbol}</div>
            <div style="font-size:0.75rem; color:#94a3b8;">${char.role}</div>
          </div>
        </div>
        <span class="option-tag">Pilih</span>
      `;

      btn.addEventListener('click', () => {
        handleWhoSaidItAnswer(charKey, q);
      });

      optionsGrid.appendChild(btn);
    });
  }

  const feedbackCard = document.getElementById('arena-feedback-card');
  if (feedbackCard) feedbackCard.classList.remove('active');
}

function handleWhoSaidItAnswer(chosenChar, q) {
  const optionsGrid = document.getElementById('arena-options-grid');
  if (!optionsGrid) return;

  const buttons = optionsGrid.querySelectorAll('.arena-option-btn');
  const isCorrect = chosenChar === q.author;
  if (isCorrect) currentScore += 1;

  buttons.forEach((b, idx) => {
    b.disabled = true;
    const charList = ['nyanya', 'lala', 'lele'];
    if (charList[idx] === q.author) {
      b.classList.add('correct');
    } else if (charList[idx] === chosenChar) {
      b.classList.add('wrong');
    }
  });

  const feedbackCard = document.getElementById('arena-feedback-card');
  if (feedbackCard) {
    feedbackCard.classList.add('active');
    feedbackCard.innerHTML = `
      <div class="arena-feedback-text">
        <strong>${isCorrect ? '🎉 Benar Banget!' : '✨ Ternyata Bukan!'}</strong><br>
        <span>Kutipan ini diucapkan oleh <strong>${q.authorName}</strong> dari Universe ${q.authorUniverse}.</span>
      </div>
      <button type="button" class="btn-arena-next" id="btn-arena-next">
        ${currentRoundIndex + 1 < currentQuestions.length ? 'Lanjut ➜' : 'Lihat Hasil 🏆'}
      </button>
    `;

    const nextBtn = document.getElementById('btn-arena-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentRoundIndex += 1;
        renderWhoSaidItRound();
      });
    }
  }
}

async function finishWhoSaidItGame() {
  const percentage = Math.round((currentScore / currentQuestions.length) * 100);
  showResultScreen({
    icon: percentage >= 80 ? '👑' : '⭐',
    badge: percentage >= 80 ? '🏆 Pakar Kutipan Kosmik' : '✨ Sahabat Pendengar Baik',
    title: `Skor Kamu: ${currentScore} / ${currentQuestions.length}`,
    message: `Kamu berhasil menebak ${currentScore} dari ${currentQuestions.length} kutipan khas tiga universe (${percentage}%). Terus dengarkan suara hati sahabatmu!`,
    onRetry: () => startGame('who_said_it')
  });

  await saveGameResult({
    gameId: 'who_said_it',
    score: currentScore,
    maxScore: currentQuestions.length,
    summary: `Pakar Kutipan (${currentScore}/${currentQuestions.length})`,
    answers: currentAnswers
  });

  renderHistoryList();
}

// ---------------------------------------------------------------------
// GAME 4: BESTIE MISSIONS
// ---------------------------------------------------------------------
function renderMissionsList() {
  const container = document.getElementById('games-missions-list');
  if (!container) return;

  const missions = getBestieMissions();
  const completedCount = missions.filter(m => m.completed).length;

  const countBadge = document.getElementById('missions-progress-count');
  if (countBadge) {
    countBadge.textContent = `${completedCount} / ${missions.length} Selesai`;
  }

  container.innerHTML = '';
  missions.forEach(m => {
    const row = document.createElement('div');
    row.className = `mission-item-row ${m.completed ? 'completed' : ''}`;
    row.innerHTML = `
      <div class="mission-item-left">
        <button type="button" class="mission-checkbox" data-mission-id="${m.id}" title="${m.completed ? 'Batalkan Misi' : 'Selesaikan Misi'}">
          ${m.completed ? '✓' : ''}
        </button>
        <div class="mission-content">
          <h4>${m.title}</h4>
          <p>${m.description}</p>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:0.6rem;">
        <span class="mission-badge-xp">+${m.xp} XP</span>
        <button type="button" class="btn-game-play" style="padding:0.35rem 0.8rem; font-size:0.75rem; width:auto;" data-target="${m.target}">
          Buka ➜
        </button>
      </div>
    `;

    const checkBtn = row.querySelector('.mission-checkbox');
    if (checkBtn) {
      checkBtn.addEventListener('click', async () => {
        await toggleBestieMission(m.id);
        renderMissionsList();
        if (typeof onShowToastCallback === 'function') {
          onShowToastCallback(m.completed ? 'Misi ditandai belum selesai' : `✨ Hebat! Misi "${m.title}" selesai!`);
        }
      });
    }

    const gotoBtn = row.querySelector('[data-target]');
    if (gotoBtn) {
      gotoBtn.addEventListener('click', () => {
        const tgt = gotoBtn.dataset.target;
        if (typeof onNavigateFeatureCallback === 'function') {
          onNavigateFeatureCallback(tgt);
        }
      });
    }

    container.appendChild(row);
  });
}

// ---------------------------------------------------------------------
// COMMON ARENA HELPERS
// ---------------------------------------------------------------------
function updateArenaHeader(title, currentRound, totalRounds) {
  const titleEl = document.getElementById('arena-game-title');
  const roundEl = document.getElementById('arena-round-indicator');
  const fillEl = document.getElementById('arena-progress-fill');

  if (titleEl) titleEl.textContent = title;
  if (roundEl) roundEl.textContent = `Ronde ${currentRound} dari ${totalRounds}`;
  if (fillEl) {
    const pct = Math.round((currentRound / totalRounds) * 100);
    fillEl.style.width = `${pct}%`;
  }
}

function showResultScreen({ icon, badge, title, message, onRetry }) {
  const questionBox = document.getElementById('arena-question-box');
  const optionsGrid = document.getElementById('arena-options-grid');
  const feedbackCard = document.getElementById('arena-feedback-card');
  const resultView = document.getElementById('arena-result-view');

  if (questionBox) questionBox.style.display = 'none';
  if (optionsGrid) optionsGrid.style.display = 'none';
  if (feedbackCard) feedbackCard.classList.remove('active');

  if (resultView) {
    resultView.classList.add('active');
    resultView.innerHTML = `
      <div class="result-celebrate-icon">${icon || '🏆'}</div>
      <div class="result-badge">${badge || 'Selesai'}</div>
      <h2 class="result-score-title">${title}</h2>
      <div class="result-score-msg">${message}</div>
      <div class="result-actions">
        <button type="button" class="btn-result-retry" id="btn-result-retry">Main Lagi ↺</button>
        <button type="button" class="btn-result-hub" id="btn-result-hub">Kembali ke Zone 🎮</button>
      </div>
    `;

    const retryBtn = document.getElementById('btn-result-retry');
    if (retryBtn && typeof onRetry === 'function') {
      retryBtn.addEventListener('click', onRetry);
    }

    const hubBtn = document.getElementById('btn-result-hub');
    if (hubBtn) {
      hubBtn.addEventListener('click', showHubView);
    }
  }
}

// Render History / Leaderboard
function renderHistoryList() {
  const container = document.getElementById('games-history-list');
  if (!container) return;

  const records = getCachedGameRecords();
  if (records.length === 0) {
    container.innerHTML = `
      <div class="games-empty-state">
        <span>🎮</span>
        <p>Belum ada riwayat permainan. Pilih salah satu game di atas dan mulai keseruan bersama sahabat!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  records.slice(0, 10).forEach(r => {
    const meta = GAME_METADATA[r.gameId] || { title: r.gameId, icon: '🎮' };
    const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
    const char = CHARACTER_DISPLAY[r.playerChar] || CHARACTER_DISPLAY.nyanya;

    const row = document.createElement('div');
    row.className = 'history-item-row';
    row.innerHTML = `
      <div class="history-player-badge">
        <img src="${r.playerAvatar || char.avatar}" class="history-player-avatar" alt="${r.playerName}" />
        <div>
          <div class="history-game-title">${meta.icon} ${meta.title}</div>
          <div class="history-time">${r.playerName} • ${dateStr}</div>
        </div>
      </div>
      <div class="history-score-pill">
        ${r.summary || `Skor: ${r.score}/${r.maxScore}`}
      </div>
    `;
    container.appendChild(row);
  });
}

// ---------------------------------------------------------------------
// INIT GAMES VIEW CONTROLLER
// ---------------------------------------------------------------------
export function initGamesView(options = {}) {
  onShowToastCallback = options.onShowToast || null;
  onNavigateFeatureCallback = options.onNavigateFeature || null;

  const controller = {
    openGames: openGamesView,
    closeGames: closeGamesView,
    syncActiveUser: syncGamesActiveCharacter,
    startGame
  };

  if (typeof window !== 'undefined') {
    window.gamesController = controller;
  }

  if (isGamesInitialized) return controller;
  const root = document.getElementById('view-games');
  if (!root) return controller;

  isGamesInitialized = true;

  // 1. Back button
  const backBtn = document.getElementById('btn-games-return-home');
  if (backBtn) {
    backBtn.addEventListener('click', closeGamesView);
  }

  // 2. Tab Navigation
  root.querySelectorAll('.games-tab-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      switchGamesTab(btn.dataset.tab);
    });
  });

  // 3. Play Game Buttons on Hub Cards
  root.querySelectorAll('.btn-game-play[data-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const gId = btn.dataset.game;
      startGame(gId);
    });
  });

  // 4. Return to Hub from Arena button
  const exitArenaBtn = document.getElementById('btn-arena-exit');
  if (exitArenaBtn) {
    exitArenaBtn.addEventListener('click', showHubView);
  }

  // 5. Subscribe local/cloud updates
  subscribeGameChanges(() => {
    renderHistoryList();
    renderMissionsList();
  });

  return controller;
}

