// mailbox_view.js
// KOTAK POS — DIGITAL LETTERS & MAILBOX SYSTEM
// Shared across all 3 Universes: KIDULT, TO YOU, and SHADOW

import {
  auth,
  CANONICAL_CHARACTERS,
  identifyUserCharacter,
  getVerifiedCharacterKey,
  LETTER_PAPER_THEMES,
  dbSendLetter,
  dbFetchLetters,
  dbSubscribeLetters,
  dbMarkLetterRead,
  dbDeleteLetter
} from './firebase.js';

export function initKotakPosView({
  onShowToast,
  onTriggerSparkle,
  onNavigateBack
} = {}) {
  const viewKotakPos = document.getElementById('view-kotak-pos');
  if (!viewKotakPos) return null;

  // Header Elements
  const mailboxUnivTag = document.getElementById('mailbox-univ-tag');
  const btnMailboxReturn = document.getElementById('btn-mailbox-return-univ');
  const tabInbox = document.getElementById('mailbox-tab-inbox');
  const tabCompose = document.getElementById('mailbox-tab-compose');
  const tabSent = document.getElementById('mailbox-tab-sent');
  const unreadCounterBadge = document.getElementById('mailbox-inbox-unread-count');
  const userAvatarEl = document.getElementById('mailbox-user-avatar');
  const userNameEl = document.getElementById('mailbox-user-name');

  // Panels
  const panelInbox = document.getElementById('mailbox-panel-inbox');
  const panelCompose = document.getElementById('mailbox-panel-compose');
  const panelSent = document.getElementById('mailbox-panel-sent');

  // Counts & Grids
  const inboxTotalEl = document.getElementById('mailbox-inbox-total');
  const sentTotalEl = document.getElementById('mailbox-sent-total');
  const inboxGrid = document.getElementById('mailbox-inbox-grid');
  const sentGrid = document.getElementById('mailbox-sent-grid');
  const emptyInbox = document.getElementById('mailbox-empty-inbox');
  const emptySent = document.getElementById('mailbox-empty-sent');
  const btnEmptyInboxCompose = document.getElementById('btn-empty-inbox-compose');
  const btnEmptySentCompose = document.getElementById('btn-empty-sent-compose');

  // Compose Form Elements
  const recipientCardsContainer = document.getElementById('mailbox-recipient-cards');
  const paperSelectorContainer = document.getElementById('mailbox-paper-selector');
  const inputTitle = document.getElementById('mailbox-input-title');
  const inputBody = document.getElementById('mailbox-input-body');
  const titleCounter = document.getElementById('mailbox-title-counter');
  const bodyCounter = document.getElementById('mailbox-body-counter');
  const btnCancelCompose = document.getElementById('btn-mailbox-cancel-compose');
  const btnSubmit = document.getElementById('btn-mailbox-submit');

  // Read Modal Elements
  const readModal = document.getElementById('mailbox-read-modal');
  const sheetCard = document.getElementById('mailbox-sheet-card');
  const sheetAvatar = document.getElementById('sheet-sender-avatar');
  const sheetName = document.getElementById('sheet-sender-name');
  const sheetSub = document.getElementById('sheet-sender-sub');
  const sheetDate = document.getElementById('sheet-date-text');
  const sheetTitle = document.getElementById('sheet-letter-title');
  const sheetBody = document.getElementById('sheet-letter-body');
  const btnSheetClose = document.getElementById('btn-sheet-close');
  const btnSheetDelete = document.getElementById('btn-sheet-delete');
  const btnSheetReply = document.getElementById('btn-sheet-reply');

  // State
  let activeOriginUniverse = 'kidult'; // 'kidult' | 'to_you' | 'shadow'
  let activeUserCharKey = 'nyanya';
  let activeAuthUser = auth?.currentUser || null;
  let currentTab = 'inbox'; // 'inbox' | 'compose' | 'sent'
  let selectedRecipientChar = 'lala';
  let selectedPaperTheme = 'dreamy';
  let allLetters = [];
  let unsubscribeRealtime = null;
  let activeModalLetter = null;

  // ==========================================================================
  // 1. THEMES & VIEW NAVIGATION
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

  function openKotakPos(originUniverse = 'kidult', fromCharKey = null) {
    activeOriginUniverse = originUniverse || 'kidult';
    if (fromCharKey) {
      activeUserCharKey = fromCharKey;
    } else if (auth?.currentUser) {
      activeUserCharKey = getVerifiedCharacterKey(auth.currentUser) || identifyUserCharacter(auth.currentUser) || 'nyanya';
    }
    activeAuthUser = auth?.currentUser || null;

    // Apply theme
    viewKotakPos.classList.remove('theme-kidult', 'theme-toyou', 'theme-to_you', 'theme-shadow');
    viewKotakPos.classList.add(getOriginClass(activeOriginUniverse));

    if (mailboxUnivTag) {
      mailboxUnivTag.textContent = getUniverseTitle(activeOriginUniverse);
    }

    // Default paper theme to match universe
    if (activeOriginUniverse === 'to_you' || activeOriginUniverse === 'toyou') {
      selectPaperTheme('morning');
    } else if (activeOriginUniverse === 'shadow') {
      selectPaperTheme('crystal');
    } else {
      selectPaperTheme('dreamy');
    }

    // Show View
    viewKotakPos.classList.add('active');
    viewKotakPos.setAttribute('aria-hidden', 'false');

    // Sync UI elements
    updateUserChip();
    renderRecipientCards();
    switchTab('inbox');

    // Subscribe to live letters
    syncLettersData();
  }

  function closeKotakPos() {
    closeReadModal();
    if (unsubscribeRealtime) {
      try { unsubscribeRealtime(); } catch (_) {}
      unsubscribeRealtime = null;
    }

    viewKotakPos.classList.remove('active');
    viewKotakPos.setAttribute('aria-hidden', 'true');

    if (typeof onNavigateBack === 'function') {
      onNavigateBack(activeOriginUniverse);
    } else {
      // Fallback
      let targetViewId = 'view-kidult-world';
      if (activeOriginUniverse === 'to_you' || activeOriginUniverse === 'toyou') targetViewId = 'view-toyou-world';
      else if (activeOriginUniverse === 'shadow') targetViewId = 'view-shadow-world';

      const targetEl = document.getElementById(targetViewId);
      if (targetEl) {
        targetEl.classList.add('active');
        targetEl.setAttribute('aria-hidden', 'false');
      }
    }
  }

  function syncKotakPosActiveCharacter(charKey, user = null) {
    activeUserCharKey = charKey || 'nyanya';
    activeAuthUser = user || auth?.currentUser || null;
    updateUserChip();
    renderRecipientCards();
    if (viewKotakPos.classList.contains('active')) {
      syncLettersData();
    }
  }

  function updateUserChip() {
    const config = CANONICAL_CHARACTERS[activeUserCharKey] || CANONICAL_CHARACTERS.nyanya;
    if (userAvatarEl) {
      userAvatarEl.src = config.avatar || `/assets/avatar_${activeUserCharKey}_hd.png`;
    }
    if (userNameEl) {
      userNameEl.textContent = `${config.name} ${config.symbol || ''}`;
    }
  }

  // ==========================================================================
  // 2. RECIPIENT CARDS SELECTION
  // ==========================================================================

  function renderRecipientCards() {
    if (!recipientCardsContainer) return;
    recipientCardsContainer.innerHTML = '';

    const allKeys = ['nyanya', 'lala', 'lele'];
    const candidates = allKeys.filter(k => k !== activeUserCharKey);

    if (!candidates.includes(selectedRecipientChar)) {
      selectedRecipientChar = candidates[0] || 'lala';
    }

    candidates.forEach(k => {
      const cfg = CANONICAL_CHARACTERS[k];
      if (!cfg) return;

      const card = document.createElement('div');
      card.className = `recipient-option-card ${selectedRecipientChar === k ? 'selected' : ''}`;
      card.setAttribute('data-recipient', k);

      card.innerHTML = `
        <img src="${cfg.avatar || `/assets/avatar_${k}_hd.png`}" alt="${cfg.name}" class="recipient-card-avatar">
        <div class="recipient-card-text">
          <span class="recipient-card-name">${cfg.name} ${cfg.symbol || ''}</span>
          <span class="recipient-card-univ">Universe ${cfg.universe}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        selectedRecipientChar = k;
        recipientCardsContainer.querySelectorAll('.recipient-option-card').forEach(c => {
          c.classList.toggle('selected', c.getAttribute('data-recipient') === k);
        });
      });

      recipientCardsContainer.appendChild(card);
    });
  }

  // ==========================================================================
  // 3. PAPER THEME SELECTOR
  // ==========================================================================

  function selectPaperTheme(themeKey) {
    selectedPaperTheme = themeKey || 'dreamy';
    if (!paperSelectorContainer) return;
    paperSelectorContainer.querySelectorAll('.paper-theme-pill').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-paper') === themeKey);
    });
  }

  if (paperSelectorContainer) {
    paperSelectorContainer.querySelectorAll('.paper-theme-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-paper');
        selectPaperTheme(theme);
      });
    });
  }

  // ==========================================================================
  // 4. TAB NAVIGATION
  // ==========================================================================

  function switchTab(tabName) {
    currentTab = tabName;

    // Tabs
    [tabInbox, tabCompose, tabSent].forEach(btn => {
      if (!btn) return;
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Panels
    [panelInbox, panelCompose, panelSent].forEach(p => {
      if (!p) return;
      p.classList.remove('active');
    });

    if (tabName === 'inbox' && panelInbox) panelInbox.classList.add('active');
    else if (tabName === 'compose' && panelCompose) panelCompose.classList.add('active');
    else if (tabName === 'sent' && panelSent) panelSent.classList.add('active');

    renderLetters();
  }

  if (tabInbox) tabInbox.addEventListener('click', () => switchTab('inbox'));
  if (tabCompose) tabCompose.addEventListener('click', () => switchTab('compose'));
  if (tabSent) tabSent.addEventListener('click', () => switchTab('sent'));
  if (btnEmptyInboxCompose) btnEmptyInboxCompose.addEventListener('click', () => switchTab('compose'));
  if (btnEmptySentCompose) btnEmptySentCompose.addEventListener('click', () => switchTab('compose'));
  if (btnMailboxReturn) btnMailboxReturn.addEventListener('click', closeKotakPos);

  // Form Character Counters
  if (inputTitle && titleCounter) {
    inputTitle.addEventListener('input', () => {
      titleCounter.textContent = `${inputTitle.value.length} / 120`;
    });
  }
  if (inputBody && bodyCounter) {
    inputBody.addEventListener('input', () => {
      bodyCounter.textContent = `${inputBody.value.length} / 4000`;
    });
  }
  if (btnCancelCompose) {
    btnCancelCompose.addEventListener('click', () => switchTab('inbox'));
  }

  // ==========================================================================
  // 5. LETTERS DATA SYNC & RENDERING
  // ==========================================================================

  function syncLettersData() {
    activeAuthUser = auth?.currentUser || null;
    if (!activeAuthUser || !activeAuthUser.uid) {
      allLetters = [];
      renderLetters();
      return;
    }

    // Load cached letters immediately for instant UI responsiveness
    try {
      const cached = JSON.parse(localStorage.getItem(`olu_letters_${activeAuthUser.uid}`) || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        allLetters = cached;
        renderLetters();
      }
    } catch (_) {}

    // Clean previous listener
    if (unsubscribeRealtime) {
      try { unsubscribeRealtime(); } catch (_) {}
      unsubscribeRealtime = null;
    }

    // Subscribe realtime
    unsubscribeRealtime = dbSubscribeLetters(activeAuthUser, (letters) => {
      allLetters = letters || [];
      renderLetters();
    }, (err) => {
      console.warn('Realtime letters error:', err);
      // Fallback one-time fetch
      dbFetchLetters(activeAuthUser).then(letters => {
        allLetters = letters || [];
        renderLetters();
      }).catch(() => {});
    });
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'Baru saja';
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return String(timestamp);
    }
  }

  function renderLetters() {
    const currentUid = activeAuthUser?.uid || '';

    // Filter letters
    const inboxLetters = allLetters.filter(l =>
      l.recipientUid === currentUid && !l.deletedByRecipient
    );

    const sentLetters = allLetters.filter(l =>
      l.senderUid === currentUid && !l.deletedBySender
    );

    // Calculate unread count
    const unreadCount = inboxLetters.filter(l => !l.read).length;
    if (unreadCounterBadge) {
      if (unreadCount > 0) {
        unreadCounterBadge.style.display = 'inline-flex';
        unreadCounterBadge.textContent = String(unreadCount);
      } else {
        unreadCounterBadge.style.display = 'none';
      }
    }

    if (inboxTotalEl) inboxTotalEl.textContent = String(inboxLetters.length);
    if (sentTotalEl) sentTotalEl.textContent = String(sentLetters.length);

    // Render Inbox
    if (inboxGrid) {
      inboxGrid.innerHTML = '';
      if (inboxLetters.length === 0) {
        if (emptyInbox) emptyInbox.style.display = 'flex';
      } else {
        if (emptyInbox) emptyInbox.style.display = 'none';
        inboxLetters.forEach(letter => {
          inboxGrid.appendChild(createLetterCard(letter, 'inbox'));
        });
      }
    }

    // Render Sent
    if (sentGrid) {
      sentGrid.innerHTML = '';
      if (sentLetters.length === 0) {
        if (emptySent) emptySent.style.display = 'flex';
      } else {
        if (emptySent) emptySent.style.display = 'none';
        sentLetters.forEach(letter => {
          sentGrid.appendChild(createLetterCard(letter, 'sent'));
        });
      }
    }
  }

  function createLetterCard(letter, mode = 'inbox') {
    const card = document.createElement('article');
    const isUnread = mode === 'inbox' && !letter.read;
    card.className = `letter-card ${isUnread ? 'is-unread' : ''}`;
    card.setAttribute('data-letter-id', letter.id);

    const isInbox = mode === 'inbox';
    const otherAvatar = isInbox ? letter.senderAvatar : letter.recipientAvatar;
    const otherName = isInbox ? letter.senderName : letter.recipientName;
    const otherUniv = isInbox ? (letter.universeOrigin || letter.senderCharacter) : letter.recipientCharacter;
    const prefix = isInbox ? 'Dari:' : 'Untuk:';

    const statusBadgeHtml = isInbox
      ? (letter.read
          ? '<span class="letter-status-badge read">✓ Sudah Dibaca</span>'
          : '<span class="letter-status-badge unread">💌 Surat Baru</span>')
      : (letter.read
          ? '<span class="letter-status-badge read">✓ Dibaca Sahabat</span>'
          : '<span class="letter-status-badge unread">✉ Terkirim</span>');

    const paperName = LETTER_PAPER_THEMES[letter.paperTheme]?.name || 'Surat Klasik';

    card.innerHTML = `
      <div class="letter-card-header">
        <div class="letter-author-info">
          <img src="${otherAvatar || '/assets/avatar_nyanya_hd.png'}" alt="${otherName}" class="letter-author-avatar">
          <div>
            <div class="letter-author-name">${prefix} ${otherName || 'Sahabat'}</div>
            <div class="letter-author-univ">UNIVERSE ${String(otherUniv || 'KIDULT').toUpperCase()}</div>
          </div>
        </div>
        ${statusBadgeHtml}
      </div>

      <h3 class="letter-card-title">${escapeHtml(letter.title || 'Surat Tanpa Judul')}</h3>
      <p class="letter-card-snippet">${escapeHtml(letter.body || '')}</p>

      <div class="letter-card-footer">
        <span class="letter-paper-pill">📜 ${paperName}</span>
        <div class="letter-actions-group">
          <span>${formatDate(letter.createdAt)}</span>
          <button type="button" class="btn-letter-icon-action btn-delete-card" title="Hapus Surat" aria-label="Hapus Surat">
            🗑️
          </button>
        </div>
      </div>
    `;

    // Click card to read
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-card')) return;
      openReadModal(letter);
    });

    // Delete card button
    const btnDel = card.querySelector('.btn-delete-card');
    btnDel?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteLetter(letter);
    });

    return card;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // 6. READ LETTER MODAL
  // ==========================================================================

  function openReadModal(letter) {
    activeModalLetter = letter;
    if (!readModal || !sheetCard) return;

    // Apply paper theme class
    sheetCard.className = `letter-sheet-card paper-${letter.paperTheme || 'dreamy'}`;

    if (sheetAvatar) sheetAvatar.src = letter.senderAvatar || '/assets/avatar_nyanya_hd.png';
    if (sheetName) sheetName.textContent = letter.senderName || 'Sahabat';
    if (sheetSub) {
      sheetSub.textContent = `DARI UNIVERSE ${String(letter.universeOrigin || letter.senderCharacter || 'KIDULT').toUpperCase()}`;
    }
    if (sheetDate) sheetDate.textContent = formatDate(letter.createdAt);
    if (sheetTitle) sheetTitle.textContent = letter.title || 'Surat Tanpa Judul';
    if (sheetBody) sheetBody.textContent = letter.body || '';

    // Mark as read if user is the recipient and it's unread
    if (activeAuthUser && letter.recipientUid === activeAuthUser.uid && !letter.read) {
      letter.read = true;
      letter.readAt = Date.now();
      dbMarkLetterRead(letter.id, activeAuthUser).catch(err => {
        console.warn('Error marking letter read in Firestore:', err);
      });
      renderLetters();
    }

    readModal.classList.add('open');
    readModal.setAttribute('aria-hidden', 'false');

    if (onTriggerSparkle) {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  function closeReadModal() {
    activeModalLetter = null;
    if (readModal) {
      readModal.classList.remove('open');
      readModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnSheetClose) btnSheetClose.addEventListener('click', closeReadModal);
  if (readModal) {
    readModal.addEventListener('click', (e) => {
      if (e.target === readModal) closeReadModal();
    });
  }

  // Reply from modal
  if (btnSheetReply) {
    btnSheetReply.addEventListener('click', () => {
      if (!activeModalLetter) return;
      const targetChar = activeModalLetter.senderCharacter;
      closeReadModal();
      if (targetChar && targetChar !== activeUserCharKey) {
        selectedRecipientChar = targetChar;
        renderRecipientCards();
      }
      if (inputTitle) {
        inputTitle.value = `Balasan: ${activeModalLetter.title.replace(/^Balasan:\s*/i, '')}`;
        if (titleCounter) titleCounter.textContent = `${inputTitle.value.length} / 120`;
      }
      switchTab('compose');
      if (inputBody) inputBody.focus();
    });
  }

  // Delete from modal
  if (btnSheetDelete) {
    btnSheetDelete.addEventListener('click', () => {
      if (!activeModalLetter) return;
      handleDeleteLetter(activeModalLetter);
    });
  }

  // ==========================================================================
  // 7. DELETE LETTER (SOFT DELETE PER PARTY)
  // ==========================================================================

  async function handleDeleteLetter(letter) {
    if (!letter || !letter.id) return;
    activeAuthUser = auth?.currentUser || null;
    if (!activeAuthUser || !activeAuthUser.uid) {
      if (onShowToast) onShowToast('Silakan login terlebih dahulu untuk menghapus surat.');
      return;
    }

    const isSender = letter.senderUid === activeAuthUser.uid;
    const confirmMsg = isSender
      ? 'Hapus surat ini dari Surat Terkirim milikmu? (Penerima tetap dapat membacanya di Surat Masuk miliknya)'
      : 'Hapus surat ini dari Surat Masuk milikmu? (Pengirim tetap dapat melihatnya di Surat Terkirim miliknya)';

    if (!window.confirm(confirmMsg)) return;

    try {
      await dbDeleteLetter(letter.id, activeAuthUser);

      // Local optimistic update
      const idx = allLetters.findIndex(l => l.id === letter.id);
      if (idx !== -1) {
        if (isSender) allLetters[idx].deletedBySender = true;
        else allLetters[idx].deletedByRecipient = true;
      }

      closeReadModal();
      renderLetters();

      if (onShowToast) onShowToast('🗑️ Surat berhasil dihapus dari kotak posmu.');
    } catch (err) {
      console.error('Error deleting letter:', err);
      if (onShowToast) onShowToast(`Gagal menghapus surat: ${err.message || 'Error permission'}`);
    }
  }

  // ==========================================================================
  // 8. COMPOSE & SEND LETTER
  // ==========================================================================

  if (btnSubmit) {
    btnSubmit.addEventListener('click', handleSendLetter);
  }

  async function handleSendLetter() {
    activeAuthUser = auth?.currentUser || null;
    if (!activeAuthUser || !activeAuthUser.uid) {
      if (onShowToast) onShowToast('Silakan login terlebih dahulu untuk mengirim surat.');
      return;
    }

    const title = inputTitle ? inputTitle.value.trim() : '';
    const body = inputBody ? inputBody.value.trim() : '';

    if (!title) {
      if (onShowToast) onShowToast('Mohon isi judul surat terlebih dahulu.');
      inputTitle?.focus();
      return;
    }
    if (!body) {
      if (onShowToast) onShowToast('Mohon tulis isi surat sebelum mengirim.');
      inputBody?.focus();
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>⏳ Mengirim Surat...</span>';

    try {
      const sentPayload = await dbSendLetter({
        recipientCharacter: selectedRecipientChar,
        title,
        body,
        paperTheme: selectedPaperTheme,
        universeOrigin: activeOriginUniverse
      });

      // Optimistically add to allLetters if not already present
      if (!allLetters.some(l => l.id === sentPayload.id)) {
        allLetters.unshift(sentPayload);
      }

      // Reset form
      if (inputTitle) inputTitle.value = '';
      if (inputBody) inputBody.value = '';
      if (titleCounter) titleCounter.textContent = '0 / 120';
      if (bodyCounter) bodyCounter.textContent = '0 / 4000';

      const targetCfg = CANONICAL_CHARACTERS[selectedRecipientChar] || {};
      if (onShowToast) {
        onShowToast(`✉✨ Surat berhasil dikirimkan ke Kotak Pos ${targetCfg.name || selectedRecipientChar}!`);
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      }

      // Switch to Sent tab to view the letter
      switchTab('sent');
    } catch (err) {
      console.error('Error sending letter:', err);
      if (onShowToast) {
        onShowToast(`Gagal mengirim surat: ${err.message || 'Permission denied'}`);
      }
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<span>✉✨</span><span>Kirim Surat</span>';
    }
  }

  // ==========================================================================
  // 9. RETURN PUBLIC API
  // ==========================================================================

  return {
    openKotakPos,
    closeKotakPos,
    syncKotakPosActiveCharacter,
    refreshKotakPos: syncLettersData
  };
}

