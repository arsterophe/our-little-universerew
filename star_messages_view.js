// star_messages_view.js
// STAR MESSAGES — Messages Across the Universe (Teleskop Feature)
// Shared across all 3 Universes: KIDULT, TO YOU, and SHADOW

import {
  auth,
  CANONICAL_CHARACTERS,
  identifyUserCharacter,
  dbSendStarMessage,
  dbFetchStarMessages,
  dbSubscribeStarMessages,
  dbMarkStarMessageRead,
  dbToggleStarMessageFavorite,
  STAR_CATEGORIES,
  STAR_TYPES
} from './firebase.js';

export function initStarMessagesView({
  onShowToast,
  onTriggerSparkle,
  onNavigateBack
} = {}) {
  const viewStarMessages = document.getElementById('view-star-messages');
  const skyCanvas = document.getElementById('star-sky-canvas');
  const starSkyViewport = document.getElementById('star-sky-viewport');
  const starSkyNodesContainer = document.getElementById('star-sky-nodes');
  const starEmptyPrompt = document.getElementById('star-empty-sky-prompt');

  // HUD Elements
  const observatoryUnivTag = document.getElementById('observatory-univ-tag');
  const btnStarReturnUniv = document.getElementById('btn-star-return-univ');
  const tabBtns = document.querySelectorAll('.star-tab-btn');
  const tabInboxUnread = document.getElementById('tab-inbox-unread');

  // Panels
  const panelExplore = document.getElementById('star-panel-explore');
  const panelInbox = document.getElementById('star-panel-inbox');
  const panelCompose = document.getElementById('star-panel-compose');
  const panelFavorites = document.getElementById('star-panel-favorites');

  // Composer Form Elements
  const composerBox = document.getElementById('star-composer-box');
  const recipientCardsContainer = document.getElementById('star-recipient-cards');
  const categoryPillsContainer = document.getElementById('star-category-pills');
  const typePillsContainer = document.getElementById('star-type-pills');
  const starMsgTextarea = document.getElementById('star-msg-text');
  const starCharCount = document.getElementById('star-char-count');
  const btnCancelCompose = document.getElementById('btn-cancel-compose');
  const btnSubmitStarMsg = document.getElementById('btn-submit-star-msg');
  const btnComposeFirst = document.getElementById('btn-compose-first-star');

  // Letter Modal Elements
  const letterModal = document.getElementById('star-letter-modal');
  const letterAvatar = document.getElementById('star-letter-avatar');
  const letterSenderName = document.getElementById('star-letter-sender-name');
  const letterUnivTag = document.getElementById('star-letter-univ-tag');
  const letterTime = document.getElementById('star-letter-time');
  const letterCategory = document.getElementById('star-letter-category');
  const letterBody = document.getElementById('star-letter-body');
  const btnFavToggle = document.getElementById('btn-star-fav-toggle');
  const favIcon = document.getElementById('star-fav-icon');
  const favText = document.getElementById('star-fav-text');
  const btnLetterReply = document.getElementById('btn-star-reply');
  const btnCloseLetter = document.getElementById('btn-close-star-letter');

  // State
  let activeOriginUniverse = 'kidult'; // 'kidult' | 'to_you' | 'shadow'
  let activeUserCharKey = 'nyanya';
  let activeAuthUser = auth?.currentUser || null;
  let currentTab = 'explore'; // 'explore' | 'inbox' | 'compose' | 'favorites'

  let allStarMessages = [];
  let unsubscribeRealtime = null;

  // Composer State
  let selectedRecipientChar = 'lala';
  let selectedCategory = 'warmth';
  let selectedStarType = 'gold';

  // Modal State
  let activeModalStar = null;

  // ==========================================================================
  // 1. UNIVERSE THEME & VIEW NAVIGATION
  // ==========================================================================

  function getOriginClass(univ) {
    if (univ === 'to_you' || univ === 'toyou') return 'theme-toyou';
    if (univ === 'shadow') return 'theme-shadow';
    return 'theme-kidult';
  }

  function getUniverseTitle(univ) {
    if (univ === 'to_you' || univ === 'toyou') return "TO YOU · LALA'S UNIVERSE";
    if (univ === 'shadow') return "SHADOW · LELE'S UNIVERSE";
    return "KIDULT · NYANYA'S UNIVERSE";
  }

  function openStarMessages(originUniverse = 'kidult', fromCharKey = null) {
    activeOriginUniverse = originUniverse || 'kidult';
    activeAuthUser = auth?.currentUser || activeAuthUser;
    if (fromCharKey) {
      activeUserCharKey = fromCharKey;
    } else if (activeAuthUser) {
      activeUserCharKey = identifyUserCharacter(activeAuthUser) || activeUserCharKey;
    }

    if (!viewStarMessages) return;

    // Apply theme
    viewStarMessages.classList.remove('theme-kidult', 'theme-toyou', 'theme-to_you', 'theme-shadow');
    viewStarMessages.classList.add(getOriginClass(activeOriginUniverse));
    viewStarMessages.classList.add('active');
    viewStarMessages.setAttribute('aria-hidden', 'false');

    if (observatoryUnivTag) {
      observatoryUnivTag.textContent = getUniverseTitle(activeOriginUniverse);
    }

    // Initialize composer recipients based on active character
    renderRecipientCards();
    renderCategoryPills();
    renderStarTypePills();

    // Default to Explore Stars view
    switchTab('explore');

    // Start Celestial Canvas Animation
    startSkyCanvas();

    // Fetch and subscribe to messages
    syncStarData();

    if (onTriggerSparkle) {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 3);
    }

    if (onShowToast) {
      const charName = CANONICAL_CHARACTERS[activeUserCharKey]?.name || 'Sahabat';
      onShowToast(`🔭 Membuka Lensa Teleskop Bintang: Selamat datang di Star Messages, ${charName}! ✨`);
    }
  }

  function closeStarMessages() {
    if (unsubscribeRealtime) {
      unsubscribeRealtime();
      unsubscribeRealtime = null;
    }
    closeLetterModal();
    stopSkyCanvas();

    if (viewStarMessages) {
      viewStarMessages.classList.remove('active');
      viewStarMessages.setAttribute('aria-hidden', 'true');
    }

    if (typeof onNavigateBack === 'function') {
      onNavigateBack(activeOriginUniverse);
    }
  }

  function syncStarMessagesActiveCharacter(charKey, authUser) {
    if (charKey) activeUserCharKey = charKey;
    if (authUser) activeAuthUser = authUser;
    renderRecipientCards();
    syncStarData();
  }

  // ==========================================================================
  // 2. TAB CONTROLLER & PANELS
  // ==========================================================================

  function switchTab(tabId) {
    currentTab = tabId;

    tabBtns.forEach(btn => {
      const matches = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', matches);
    });

    if (panelExplore) panelExplore.style.display = tabId === 'explore' ? 'block' : 'none';
    if (panelInbox) panelInbox.style.display = tabId === 'inbox' ? 'flex' : 'none';
    if (panelCompose) panelCompose.style.display = tabId === 'compose' ? 'flex' : 'none';
    if (panelFavorites) panelFavorites.style.display = tabId === 'favorites' ? 'flex' : 'none';

    if (tabId === 'explore') {
      renderSkyStars();
    } else if (tabId === 'inbox') {
      renderInboxList();
    } else if (tabId === 'favorites') {
      renderFavoritesList();
    } else if (tabId === 'compose') {
      if (starMsgTextarea) starMsgTextarea.focus();
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  if (btnStarReturnUniv) {
    btnStarReturnUniv.addEventListener('click', (e) => {
      e.stopPropagation();
      closeStarMessages();
    });
  }

  if (btnComposeFirst) {
    btnComposeFirst.addEventListener('click', (e) => {
      e.stopPropagation();
      switchTab('compose');
    });
  }

  // ==========================================================================
  // 3. FIRESTORE DATA SYNC & LOCAL CACHE
  // ==========================================================================

  function syncStarData() {
    activeAuthUser = auth?.currentUser || activeAuthUser;
    if (!activeAuthUser || !activeAuthUser.uid) {
      // Offline fallback: load mock/cached stars
      loadLocalCacheOrMock();
      return;
    }

    if (unsubscribeRealtime) {
      unsubscribeRealtime();
    }

    unsubscribeRealtime = dbSubscribeStarMessages(activeAuthUser, (stars) => {
      allStarMessages = stars || [];
      updateUnreadCounter();
      if (currentTab === 'explore') renderSkyStars();
      else if (currentTab === 'inbox') renderInboxList();
      else if (currentTab === 'favorites') renderFavoritesList();
    }, (err) => {
      console.warn('Realtime Star Messages subscription notice:', err);
      loadLocalCacheOrMock();
    });
  }

  function loadLocalCacheOrMock() {
    const userUid = activeAuthUser?.uid || CANONICAL_CHARACTERS[activeUserCharKey]?.uid || 'demo';
    let cached = [];
    try {
      cached = JSON.parse(localStorage.getItem(`olu_star_messages_${userUid}`) || '[]');
    } catch (_) {}

    if (cached.length === 0) {
      // Seed initial welcoming stars for the trio so the sky is magically alive!
      cached = getInitialCosmicStars(activeUserCharKey);
      try {
        localStorage.setItem(`olu_star_messages_${userUid}`, JSON.stringify(cached));
      } catch (_) {}
    }

    allStarMessages = cached;
    updateUnreadCounter();
    if (currentTab === 'explore') renderSkyStars();
    else if (currentTab === 'inbox') renderInboxList();
    else if (currentTab === 'favorites') renderFavoritesList();
  }

  function getInitialCosmicStars(charKey) {
    const now = Date.now();
    return [
      {
        id: 'star-seed-1',
        senderUid: '1uwba7MrGVU3xHu57VVLvztskrg2',
        senderCharacter: 'nyanya',
        senderName: 'Nyanya',
        senderAvatar: '/assets/avatar_nyanya_hd.png',
        recipientUid: charKey === 'nyanya' ? 'EqByKA8FXoTEt0OmIsSDPfnxMDB3' : (CANONICAL_CHARACTERS[charKey]?.uid || '1uwba7MrGVU3xHu57VVLvztskrg2'),
        recipientCharacter: charKey === 'nyanya' ? 'lala' : charKey,
        recipientName: charKey === 'nyanya' ? 'Lala' : (CANONICAL_CHARACTERS[charKey]?.name || 'Sahabat'),
        text: 'Small joys make a big universe. Terima kasih sudah selalu menjadi tempat pulang yang hangat di antara ribuan galaksi! ⭐💜',
        category: 'warmth',
        starType: 'lavender',
        x: 28.5,
        y: 28.0,
        universeOrigin: 'kidult',
        createdAt: now - 3600000 * 5,
        read: false,
        readAt: null,
        favorites: { [charKey]: true }
      },
      {
        id: 'star-seed-2',
        senderUid: 'EqByKA8FXoTEt0OmIsSDPfnxMDB3',
        senderCharacter: 'lala',
        senderName: 'Lala',
        senderAvatar: '/assets/avatar_lala_hd.png',
        recipientUid: charKey === 'lala' ? '1ArxphLQpAOoOIvH9BKYw0ebD1e2' : (CANONICAL_CHARACTERS[charKey]?.uid || 'EqByKA8FXoTEt0OmIsSDPfnxMDB3'),
        recipientCharacter: charKey === 'lala' ? 'lele' : charKey,
        recipientName: charKey === 'lala' ? 'Lele' : (CANONICAL_CHARACTERS[charKey]?.name || 'Sahabat'),
        text: 'A little closer, for a brighter tomorrow! Semoga harimu hari ini sehangat matahari pagi di taman peri TO YOU 🌸☀️',
        category: 'wish',
        starType: 'gold',
        x: 68.0,
        y: 22.5,
        universeOrigin: 'to_you',
        createdAt: now - 3600000 * 2,
        read: false,
        readAt: null,
        favorites: {}
      },
      {
        id: 'star-seed-3',
        senderUid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2',
        senderCharacter: 'lele',
        senderName: 'Lele',
        senderAvatar: '/assets/avatar_lele_hd.png',
        recipientUid: charKey === 'lele' ? '1uwba7MrGVU3xHu57VVLvztskrg2' : (CANONICAL_CHARACTERS[charKey]?.uid || '1ArxphLQpAOoOIvH9BKYw0ebD1e2'),
        recipientCharacter: charKey === 'lele' ? 'nyanya' : charKey,
        recipientName: charKey === 'lele' ? 'Nyanya' : (CANONICAL_CHARACTERS[charKey]?.name || 'Sahabat'),
        text: 'Find your light in the darkness. Meskipun malam terasa hening dan sunyi, kristal bulan selalu bersinar menemanimu 🌙💎',
        category: 'secret',
        starType: 'crystal',
        x: 48.0,
        y: 54.0,
        universeOrigin: 'shadow',
        createdAt: now - 3600000 * 8,
        read: true,
        readAt: now - 3600000 * 7,
        favorites: { [charKey]: true }
      }
    ];
  }

  function updateUnreadCounter() {
    const unreadCount = allStarMessages.filter(m => {
      const isRecipient = (m.recipientUid === activeAuthUser?.uid) || (m.recipientCharacter === activeUserCharKey);
      return isRecipient && !m.read;
    }).length;

    if (tabInboxUnread) {
      if (unreadCount > 0) {
        tabInboxUnread.textContent = unreadCount;
        tabInboxUnread.style.display = 'inline-flex';
      } else {
        tabInboxUnread.style.display = 'none';
      }
    }
  }

  // ==========================================================================
  // 4. CELESTIAL SKY STAR FIELD (A. JELAJAHI BINTANG)
  // ==========================================================================

  function renderSkyStars() {
    if (!starSkyNodesContainer) return;
    starSkyNodesContainer.innerHTML = '';

    if (allStarMessages.length === 0) {
      if (starEmptyPrompt) starEmptyPrompt.style.display = 'flex';
      return;
    }

    if (starEmptyPrompt) starEmptyPrompt.style.display = 'none';

    allStarMessages.forEach((msg, idx) => {
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'celestial-star-node';
      node.setAttribute('data-star-id', msg.id);
      node.setAttribute('aria-label', `Pesan Bintang dari ${msg.senderName}`);

      const left = Math.max(8, Math.min(92, msg.x || (15 + (idx * 21) % 70)));
      const top = Math.max(12, Math.min(84, msg.y || (18 + (idx * 17) % 64)));
      node.style.left = `${left}%`;
      node.style.top = `${top}%`;

      const typeConfig = STAR_TYPES[msg.starType] || STAR_TYPES.gold;
      const catConfig = STAR_CATEGORIES[msg.category] || STAR_CATEGORIES.warmth;
      const isRecipient = (msg.recipientUid === activeAuthUser?.uid) || (msg.recipientCharacter === activeUserCharKey);
      const isUnread = isRecipient && !msg.read;

      node.innerHTML = `
        <div class="star-glyph-wrap">
          <span class="star-core-glyph" style="color: ${typeConfig.color}; filter: drop-shadow(0 0 10px ${typeConfig.glow});">★</span>
          <span class="star-halo-ring"></span>
          ${isUnread ? '<span class="star-unread-indicator"></span>' : ''}
        </div>
        <span class="star-floating-label">
          ${catConfig.icon} ${msg.senderName} ✦
        </span>
      `;

      node.addEventListener('click', (e) => {
        e.stopPropagation();
        openLetterModal(msg);
      });

      starSkyNodesContainer.appendChild(node);
    });
  }

  // ==========================================================================
  // 5. INBOX LIST & FAVORITES LIST (B. PESAN UNTUKKU & D. BINTANG KENANGAN)
  // ==========================================================================

  function renderInboxList(filter = 'all') {
    const listGrid = document.getElementById('star-inbox-grid');
    if (!listGrid) return;
    listGrid.innerHTML = '';

    const inboxItems = allStarMessages.filter(m => {
      const isRecipient = (m.recipientUid === activeAuthUser?.uid) || (m.recipientCharacter === activeUserCharKey);
      if (!isRecipient) return false;
      if (filter === 'unread') return !m.read;
      if (filter === 'read') return m.read;
      return true;
    });

    if (inboxItems.length === 0) {
      listGrid.innerHTML = `
        <div class="star-empty-sky-prompt" style="position: static; transform: none; margin: 2rem auto;">
          <span class="empty-icon">📬</span>
          <h3>Kotak Bintang Kosong</h3>
          <p>Belum ada pesan bintang yang mendarat di teleskopmu. Tulis pesan hangat untuk sahabatmu lebih dulu!</p>
          <button type="button" class="btn-compose-first-star" id="btn-inbox-compose">Tulis Pesan Bintang ✦</button>
        </div>
      `;
      listGrid.querySelector('#btn-inbox-compose')?.addEventListener('click', () => switchTab('compose'));
      return;
    }

    inboxItems.forEach(msg => {
      listGrid.appendChild(createStarItemCard(msg));
    });
  }

  function renderFavoritesList() {
    const listGrid = document.getElementById('star-favorites-grid');
    if (!listGrid) return;
    listGrid.innerHTML = '';

    const favItems = allStarMessages.filter(m => {
      const userKey = activeUserCharKey;
      const userUid = activeAuthUser?.uid;
      return (m.favorites && (m.favorites[userKey] || (userUid && m.favorites[userUid])));
    });

    if (favItems.length === 0) {
      listGrid.innerHTML = `
        <div class="star-empty-sky-prompt" style="position: static; transform: none; margin: 2rem auto;">
          <span class="empty-icon">💖</span>
          <h3>Belum Ada Bintang Kenangan</h3>
          <p>Simpan pesan bintang favoritmu dengan menekan ikon hati pada kartu pesan bintang.</p>
        </div>
      `;
      return;
    }

    favItems.forEach(msg => {
      listGrid.appendChild(createStarItemCard(msg));
    });
  }

  function createStarItemCard(msg) {
    const card = document.createElement('div');
    card.className = `star-item-card ${(!msg.read && msg.recipientCharacter === activeUserCharKey) ? 'unread' : ''}`;
    const typeConfig = STAR_TYPES[msg.starType] || STAR_TYPES.gold;
    const catConfig = STAR_CATEGORIES[msg.category] || STAR_CATEGORIES.warmth;
    const isFav = msg.favorites && (msg.favorites[activeUserCharKey] || (activeAuthUser?.uid && msg.favorites[activeAuthUser.uid]));

    const dateStr = msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Hari ini';

    card.innerHTML = `
      <div class="star-item-top">
        <div class="star-item-sender">
          <img src="${msg.senderAvatar || '/assets/avatar_nyanya_hd.png'}" alt="${msg.senderName}" class="star-item-avatar">
          <div>
            <div class="star-item-name">${msg.senderName}</div>
            <div class="star-item-time">${dateStr}</div>
          </div>
        </div>
        <span style="color: ${typeConfig.color}; font-size: 1.15rem;">★</span>
      </div>
      <p class="star-item-snippet">${msg.text || ''}</p>
      <div class="star-item-meta">
        <span class="star-item-category">${catConfig.icon} ${catConfig.label}</span>
        ${isFav ? '<span class="star-fav-indicator">💖 Favorit</span>' : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      openLetterModal(msg);
    });

    return card;
  }

  // ==========================================================================
  // 6. STAR LETTER MODAL (Baca Pesan Bintang)
  // ==========================================================================

  function openLetterModal(star) {
    activeModalStar = star;
    if (!letterModal) return;

    if (letterAvatar) letterAvatar.src = star.senderAvatar || '/assets/avatar_nyanya_hd.png';
    if (letterSenderName) letterSenderName.textContent = star.senderName || 'Sahabat Kosmik';
    if (letterUnivTag) letterUnivTag.textContent = `UNIVERSE ${String(star.universeOrigin || star.senderCharacter || 'KIDULT').toUpperCase()}`;

    if (letterTime) {
      const d = star.createdAt ? new Date(star.createdAt) : new Date();
      letterTime.textContent = d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    const cat = STAR_CATEGORIES[star.category] || STAR_CATEGORIES.warmth;
    if (letterCategory) {
      letterCategory.innerHTML = `${cat.icon} <span>${cat.label}</span>`;
    }

    if (letterBody) {
      letterBody.textContent = star.text || '';
    }

    // Favorite button state
    updateFavButtonUI();

    // Mark as read if authenticated recipient
    const isRecipient = (star.recipientUid === activeAuthUser?.uid) || (star.recipientCharacter === activeUserCharKey);
    if (isRecipient && !star.read) {
      star.read = true;
      star.readAt = Date.now();
      updateUnreadCounter();
      if (activeAuthUser?.uid) {
        dbMarkStarMessageRead(star.id, activeAuthUser).catch(e => console.warn(e));
      }
    }

    letterModal.classList.add('open');

    if (onTriggerSparkle) {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  function closeLetterModal() {
    if (letterModal) {
      letterModal.classList.remove('open');
    }
    activeModalStar = null;
  }

  function updateFavButtonUI() {
    if (!btnFavToggle || !activeModalStar) return;
    const isFav = activeModalStar.favorites && (
      activeModalStar.favorites[activeUserCharKey] ||
      (activeAuthUser?.uid && activeModalStar.favorites[activeAuthUser.uid])
    );
    btnFavToggle.classList.toggle('favorited', Boolean(isFav));
    if (favIcon) favIcon.textContent = isFav ? '💖' : '🤍';
    if (favText) favText.textContent = isFav ? 'Bintang Kenangan' : 'Simpan Kenangan';
  }

  if (btnCloseLetter) {
    btnCloseLetter.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLetterModal();
    });
  }

  if (letterModal) {
    letterModal.addEventListener('click', (e) => {
      if (e.target === letterModal) closeLetterModal();
    });
  }

  if (btnFavToggle) {
    btnFavToggle.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!activeModalStar) return;
      const isFav = activeModalStar.favorites && (
        activeModalStar.favorites[activeUserCharKey] ||
        (activeAuthUser?.uid && activeModalStar.favorites[activeAuthUser.uid])
      );
      const nextFav = !isFav;

      if (!activeModalStar.favorites) activeModalStar.favorites = {};
      activeModalStar.favorites[activeUserCharKey] = nextFav;
      if (activeAuthUser?.uid) activeModalStar.favorites[activeAuthUser.uid] = nextFav;

      updateFavButtonUI();

      if (activeAuthUser?.uid) {
        await dbToggleStarMessageFavorite(activeModalStar.id, nextFav, activeAuthUser);
      }

      if (onShowToast) {
        onShowToast(nextFav
          ? '💖 Bintang ini telah disimpan ke Bintang Kenangan!'
          : '🤍 Bintang dihapus dari Bintang Kenangan.');
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      }
    });
  }

  if (btnLetterReply) {
    btnLetterReply.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!activeModalStar) return;
      const replyTarget = activeModalStar.senderCharacter;
      closeLetterModal();
      switchTab('compose');
      selectRecipient(replyTarget);
    });
  }

  // ==========================================================================
  // 7. STAR COMPOSER (C. KIRIM PESAN BINTANG)
  // ==========================================================================

  function renderRecipientCards() {
    if (!recipientCardsContainer) return;
    recipientCardsContainer.innerHTML = '';

    const allFriends = ['nyanya', 'lala', 'lele'];
    // Filter out the active user so they cannot send to themselves
    const availableRecipients = allFriends.filter(k => k !== activeUserCharKey);

    if (!availableRecipients.includes(selectedRecipientChar)) {
      selectedRecipientChar = availableRecipients[0] || 'lala';
    }

    availableRecipients.forEach(k => {
      const cfg = CANONICAL_CHARACTERS[k];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `recipient-select-card ${selectedRecipientChar === k ? 'active' : ''}`;
      card.setAttribute('data-recipient', k);
      card.innerHTML = `
        <img src="${cfg.avatar}" alt="${cfg.name}" class="rec-avatar-sm">
        <div class="rec-info-col">
          <span class="rec-name">${cfg.name} ${cfg.symbol}</span>
          <span class="rec-univ">Universe ${cfg.universe}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        selectRecipient(k);
      });

      recipientCardsContainer.appendChild(card);
    });
  }

  function selectRecipient(charKey) {
    selectedRecipientChar = charKey;
    recipientCardsContainer?.querySelectorAll('.recipient-select-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-recipient') === charKey);
    });
  }

  function renderCategoryPills() {
    if (!categoryPillsContainer) return;
    categoryPillsContainer.innerHTML = '';

    Object.values(STAR_CATEGORIES).forEach(cat => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `cat-pill-choice ${selectedCategory === cat.id ? 'active' : ''}`;
      pill.innerHTML = `${cat.icon} <span>${cat.label}</span>`;
      pill.addEventListener('click', () => {
        selectedCategory = cat.id;
        categoryPillsContainer.querySelectorAll('.cat-pill-choice').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
      categoryPillsContainer.appendChild(pill);
    });
  }

  function renderStarTypePills() {
    if (!typePillsContainer) return;
    typePillsContainer.innerHTML = '';

    Object.values(STAR_TYPES).forEach(st => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `type-pill-choice ${selectedStarType === st.id ? 'active' : ''}`;
      pill.innerHTML = `
        <span class="type-color-dot" style="background: ${st.color}; box-shadow: 0 0 6px ${st.glow};"></span>
        <span>${st.label}</span>
      `;
      pill.addEventListener('click', () => {
        selectedStarType = st.id;
        typePillsContainer.querySelectorAll('.type-pill-choice').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
      typePillsContainer.appendChild(pill);
    });
  }

  if (starMsgTextarea) {
    starMsgTextarea.addEventListener('input', () => {
      const len = starMsgTextarea.value.length;
      if (starCharCount) starCharCount.textContent = `${len} / 2000`;
    });
  }

  if (btnCancelCompose) {
    btnCancelCompose.addEventListener('click', (e) => {
      e.stopPropagation();
      switchTab('explore');
    });
  }

  if (btnSubmitStarMsg) {
    btnSubmitStarMsg.addEventListener('click', async (e) => {
      e.stopPropagation();
      const rawText = starMsgTextarea ? starMsgTextarea.value.trim() : '';

      if (!rawText) {
        if (onShowToast) onShowToast('⚠️ Tuliskan pesan bintangmu terlebih dahulu ✧');
        return;
      }

      btnSubmitStarMsg.disabled = true;
      btnSubmitStarMsg.style.opacity = '0.6';

      try {
        const payload = {
          recipientCharacter: selectedRecipientChar,
          text: rawText,
          category: selectedCategory,
          starType: selectedStarType,
          universeOrigin: activeOriginUniverse
        };

        const currentAuth = activeAuthUser || auth?.currentUser;
        const res = await dbSendStarMessage(payload, currentAuth);

        // Optimistic UI update
        if (res && res.id) {
          const exists = allStarMessages.some(m => m.id === res.id);
          if (!exists) {
            allStarMessages.unshift(res);
          }
        }

        // Reset Form
        if (starMsgTextarea) starMsgTextarea.value = '';
        if (starCharCount) starCharCount.textContent = '0 / 2000';

        const recName = CANONICAL_CHARACTERS[selectedRecipientChar]?.name || selectedRecipientChar;

        if (onTriggerSparkle) {
          onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        }

        if (onShowToast) {
          onShowToast(`🌟 Bintang pesanmu telah meluncur melintasi galaksi menuju langit ${recName}! ✨`);
        }

        // Switch back to Explore Tab to see stars
        switchTab('explore');
      } catch (err) {
        console.error('Error sending star message:', err);
        // Explicitly rollback and purge any unconfirmed star from in-memory state
        allStarMessages = allStarMessages.filter(m => m.text !== rawText || (m.createdAt && m.createdAt < (Date.now() - 5000)));
        if (currentTab === 'explore') renderSkyStars();
        else if (currentTab === 'inbox') renderInboxList();

        if (onShowToast) {
          onShowToast(`⚠️ Gagal mengirim pesan bintang: ${err.message}`);
        }
      } finally {
        btnSubmitStarMsg.disabled = false;
        btnSubmitStarMsg.style.opacity = '1';
      }
    });
  }

  // ==========================================================================
  // 8. CELESTIAL BACKGROUND CANVAS ANIMATION
  // ==========================================================================

  let canvasAnimId = null;
  let bgStars = [];

  function initCanvasStars(width, height) {
    bgStars = [];
    const count = Math.min(180, Math.floor((width * height) / 4500));
    for (let i = 0; i < count; i++) {
      bgStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        color: Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#fde047' : '#c4b5fd')
      });
    }
  }

  function startSkyCanvas() {
    if (!skyCanvas) return;
    const ctx = skyCanvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      skyCanvas.width = window.innerWidth;
      skyCanvas.height = window.innerHeight;
      initCanvasStars(skyCanvas.width, skyCanvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    function loop() {
      ctx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);

      bgStars.forEach(st => {
        st.alpha += st.twinkleSpeed;
        if (st.alpha > 1 || st.alpha < 0.2) {
          st.twinkleSpeed = -st.twinkleSpeed;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, st.alpha));
        ctx.fillStyle = st.color;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      canvasAnimId = requestAnimationFrame(loop);
    }

    if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
    canvasAnimId = requestAnimationFrame(loop);
  }

  function stopSkyCanvas() {
    if (canvasAnimId) {
      cancelAnimationFrame(canvasAnimId);
      canvasAnimId = null;
    }
  }

  // ==========================================================================
  // 9. RETURN PUBLIC API
  // ==========================================================================

  return {
    openStarMessages,
    closeStarMessages,
    syncStarMessagesActiveCharacter,
    refreshStarMessages: syncStarData
  };
}

