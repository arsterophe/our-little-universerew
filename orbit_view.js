/**
 * OUR LITTLE ORBIT — VIEW CONTROLLER & INTERACTION ENGINE
 * 
 * Handles DOM rendering for monthly/weekly calendars, category filtering,
 * event detail inspections, meeting response simulation (accept/reject/propose alt),
 * and modal management.
 */

import {
  ALL_ORBIT_CHARACTERS,
  normalizeCharacterKey,
  getCharacterDisplayName,
  getCharacterShortName,
  getCharacterAvatar,
  getCharacterUniverse,
  getCharacterRole,
  getOrbitNotifications,
  markOrbitNotificationRead,
  markAllOrbitNotificationsRead,
  getUnreadNotificationsCount,
  getOrbitEvents,
  getCurrentDate,
  getSelectedDateStr,
  getActiveViewMode,
  getActiveCategoryFilter,
  getActiveUserCharacter,
  setActiveUserCharacter,
  setViewMode,
  setCategoryFilter,
  setSelectedDate,
  setCurrentDate,
  focusCalendarOnDate,
  normalizeDateString,
  navigateCalendar,
  getFilteredEvents,
  getEventsForDate,
  getUpcomingAgendas,
  getMeetingInvitations,
  addOrbitEvent,
  deleteOrbitEvent,
  updateOrbitEvent,
  respondToMeeting,
  getCategoryBadge,
  subscribeOrbit
} from './orbit.js';
import { openSongsWeShareModal } from './songs_we_share.js';
import { subscribeDatabaseStatus, getDatabaseStatus, auth, identifyUserCharacter } from './firebase.js';

// Month names in Indonesian
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES_FULL = [
  'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
];

// Helper to escape HTML safely
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Format date into friendly Indonesian string: e.g. "20 Oktober 2026"
export function formatIndonesianDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${MONTH_NAMES[month] || ''} ${year}`;
}

// Format friendly Indonesian date with day of week & time (e.g. "Sabtu, 21 November 2026 • 15:00 WIB")
export function formatIndonesianMeetingDateTime(dateStr, timeStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return `${dateStr} ${timeStr || ''}`;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, month, day);
  const dayName = DAY_NAMES_FULL[(dateObj.getDay() + 6) % 7];
  const dateFormatted = `${dayName}, ${day} ${MONTH_NAMES[month]} ${year}`;
  const timeFormatted = timeStr ? `${timeStr} WIB` : '';
  return timeFormatted ? `${dateFormatted} • ${timeFormatted}` : dateFormatted;
}

export function formatShortMonth(monthIdx) {
  const short = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return short[monthIdx] || '';
}

/**
 * Initialize Our Little Orbit View Controller
 */
export function initOrbitView(options = {}) {
  const { onShowToast, onTriggerSparkle } = options;

  // DOM Elements: Navigation & View
  const viewSelection = document.getElementById('view-selection');
  const viewLogin = document.getElementById('view-login');
  const viewPrivateUniverse = document.getElementById('view-private-universe');
  const viewOrbit = document.getElementById('view-orbit');

  const btnQuickOpenOrbit = document.getElementById('btn-quick-open-orbit');
  const portalOpenOrbit = document.getElementById('portal-open-orbit');
  const btnOrbitBackUniverse = document.getElementById('btn-orbit-back-universe');

  // DOM Elements: Calendar Controls
  const orbitMonthDisplay = document.getElementById('orbit-month-display');
  const btnOrbitPrev = document.getElementById('btn-orbit-prev');
  const btnOrbitNext = document.getElementById('btn-orbit-next');
  const btnOrbitToday = document.getElementById('btn-orbit-today');

  const btnViewMonth = document.getElementById('btn-view-month');
  const btnViewWeek = document.getElementById('btn-view-week');
  const filterChips = document.querySelectorAll('.category-filter-bar .filter-chip');

  // DOM Elements: Calendar Sheet
  const calendarDaysHeader = document.getElementById('calendar-days-header');
  const orbitDaysGrid = document.getElementById('orbit-days-grid');
  const selectedDayStrip = document.getElementById('selected-day-strip');
  const stripDateText = document.getElementById('strip-date-text');
  const btnStripAddEvent = document.getElementById('btn-strip-add-event');

  // DOM Elements: Sidebar
  const btnOpenCreateEvent = document.getElementById('btn-open-create-event');
  const btnOpenProposeMeeting = document.getElementById('btn-open-propose-meeting');
  const meetingProposalsContainer = document.getElementById('meeting-proposals-container');
  const meetingCounterBadge = document.getElementById('meeting-counter-badge');
  const upcomingAgendasList = document.getElementById('upcoming-agendas-list');
  const upcomingCounterBadge = document.getElementById('upcoming-counter-badge');

  // DOM Elements: Perspective / User Badge
  const orbitViewerName = document.getElementById('orbit-viewer-name');
  const orbitUserBadge = document.getElementById('orbit-user-badge');

  // DOM Elements: Modals
  const modalCreateEvent = document.getElementById('modal-create-event');
  const formCreateEvent = document.getElementById('form-create-event');
  const eventDateInput = document.getElementById('event-date-input');

  const modalProposeMeeting = document.getElementById('modal-propose-meeting');
  const formProposeMeeting = document.getElementById('form-propose-meeting');
  const meetingDateInput = document.getElementById('meeting-date-input');

  const modalEventDetail = document.getElementById('modal-event-detail');
  const detailEventTitle = document.getElementById('detail-event-title');
  const detailCategoryIcon = document.getElementById('detail-category-icon');
  const detailCategoryBadge = document.getElementById('detail-category-badge');
  const detailEventDatetime = document.getElementById('detail-event-datetime');
  const detailEventLocation = document.getElementById('detail-event-location');
  const detailEventProposer = document.getElementById('detail-event-proposer');
  const detailEventStatus = document.getElementById('detail-event-status');
  const detailEventDesc = document.getElementById('detail-event-desc');
  const detailMeetingResponsesSection = document.getElementById('detail-meeting-responses-section');
  const detailResponsesList = document.getElementById('detail-responses-list');

  const modalRejectReason = document.getElementById('modal-reject-reason');
  const formRejectReason = document.getElementById('form-reject-reason');
  const rejectEventId = document.getElementById('reject-event-id');
  const rejectNoteInput = document.getElementById('reject-note-input');

  const modalProposeAlt = document.getElementById('modal-propose-alt');
  const formProposeAlt = document.getElementById('form-propose-alt');
  const altEventId = document.getElementById('alt-event-id');
  const altDateInput = document.getElementById('alt-date-input');
  const altTimeInput = document.getElementById('alt-time-input');
  const altNoteInput = document.getElementById('alt-note-input');

  // Track previous view for clean back navigation
  let previousViewId = 'view-selection';

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

  function closeAllModals() {
    document.querySelectorAll('.orbit-modal-overlay').forEach(el => {
      closeModal(el);
    });
  }

  // Setup click-outside and [data-close-modal] buttons
  document.querySelectorAll('.orbit-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-close-modal]')) {
        closeModal(overlay);
      }
    });
  });

  // ESC key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // --- View Switching ---
  function openOrbit(fromViewId = 'view-selection', charKey = null) {
    if (charKey) {
      setActiveUserCharacter(charKey);
    }
    previousViewId = fromViewId;

    document.querySelectorAll('.view-section').forEach(v => {
      v.classList.remove('active');
      v.setAttribute('aria-hidden', 'true');
    });
    if (viewLogin) {
      viewLogin.classList.remove('active');
      viewLogin.setAttribute('aria-hidden', 'true');
    }
    if (viewPrivateUniverse) {
      viewPrivateUniverse.classList.remove('active');
      viewPrivateUniverse.setAttribute('aria-hidden', 'true');
    }
    const viewMoments = document.getElementById('view-moments');
    if (viewMoments) {
      viewMoments.classList.remove('active');
      viewMoments.setAttribute('aria-hidden', 'true');
    }
    const viewKidultWorld = document.getElementById('view-kidult-world');
    if (viewKidultWorld) {
      viewKidultWorld.classList.remove('active');
      viewKidultWorld.setAttribute('aria-hidden', 'true');
    }
    const viewToYouWorld = document.getElementById('view-toyou-world');
    if (viewToYouWorld) {
      viewToYouWorld.classList.remove('active');
      viewToYouWorld.setAttribute('aria-hidden', 'true');
    }
    const viewShadowWorld = document.getElementById('view-shadow-world');
    if (viewShadowWorld) {
      viewShadowWorld.classList.remove('active');
      viewShadowWorld.setAttribute('aria-hidden', 'true');
    }
    const viewPhotobooth = document.getElementById('view-photobooth');
    if (viewPhotobooth) {
      viewPhotobooth.classList.remove('active');
      viewPhotobooth.setAttribute('aria-hidden', 'true');
    }

    if (viewOrbit) {
      viewOrbit.classList.add('active');
      viewOrbit.setAttribute('aria-hidden', 'false');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderAll();
    if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, 100);
  }

  function closeOrbit() {
    if (viewOrbit) {
      viewOrbit.classList.remove('active');
      viewOrbit.setAttribute('aria-hidden', 'true');
    }

    const worldIds = [
      'view-kidult-world',
      'view-toyou-world',
      'view-shadow-world',
      'view-pinwheel-world',
      'view-yawn-world',
      'view-ash-world',
      'view-usagain-world',
      'view-hot-world'
    ];

    if (worldIds.includes(previousViewId)) {
      const prevEl = document.getElementById(previousViewId);
      if (prevEl) {
        prevEl.classList.add('active');
        prevEl.setAttribute('aria-hidden', 'false');
        return;
      }
    }

    if (previousViewId === 'view-private-universe' && viewPrivateUniverse) {
      viewPrivateUniverse.classList.add('active');
      viewPrivateUniverse.setAttribute('aria-hidden', 'false');
      const navButtons = document.querySelectorAll('.univ-nav-btn');
      navButtons.forEach(b => b.classList.remove('active'));
      const btnUniv = document.getElementById('nav-btn-universes');
      if (btnUniv) btnUniv.classList.add('active');
    } else if (viewSelection) {
      viewSelection.classList.add('active');
      viewSelection.setAttribute('aria-hidden', 'false');
    }
  }

  if (btnQuickOpenOrbit) {
    btnQuickOpenOrbit.addEventListener('click', () => {
      openOrbit('view-selection');
    });
  }

  if (portalOpenOrbit) {
    portalOpenOrbit.addEventListener('click', () => {
      openOrbit('view-private-universe');
    });
  }

  const btnDashOpenOrbit = document.getElementById('btn-dash-open-orbit');
  if (btnDashOpenOrbit) {
    btnDashOpenOrbit.addEventListener('click', () => {
      openOrbit('view-private-universe');
    });
  }

  if (btnOrbitBackUniverse) {
    btnOrbitBackUniverse.addEventListener('click', () => {
      closeOrbit();
    });
  }

  const btnOrbitGotoMoments = document.getElementById('btn-orbit-goto-moments');
  if (btnOrbitGotoMoments) {
    btnOrbitGotoMoments.addEventListener('click', () => {
      closeOrbit();
      const viewMoments = document.getElementById('view-moments');
      if (viewMoments) {
        viewMoments.classList.add('active');
        viewMoments.setAttribute('aria-hidden', 'false');
      }
    });
  }

  // Perspective switcher: Clicking viewer badge lets user toggle between all 8 characters
  if (orbitUserBadge) {
    orbitUserBadge.style.cursor = 'pointer';
    orbitUserBadge.title = 'Klik untuk berganti sudut pandang 8 sahabat (Nyanya, Lala, Lele, Syma, Akhira, Ela, Ruben, Royan)';
    orbitUserBadge.addEventListener('click', () => {
      const order = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
      const current = normalizeCharacterKey(getActiveUserCharacter());
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      const nextChar = order[nextIdx];
      setActiveUserCharacter(nextChar);
      
      const authUser = auth?.currentUser;
      const verifiedAuthChar = authUser ? identifyUserCharacter(authUser) : null;
      const charName = getCharacterShortName(nextChar);
      const univName = getCharacterUniverse(nextChar);
      if (verifiedAuthChar) {
        if (nextChar === verifiedAuthChar) {
          if (onShowToast) onShowToast(`Melihat Our Little Orbit sebagai ${charName} (${univName}) [Akun Aktif ✦]`);
        } else {
          if (onShowToast) onShowToast(`Sudut pandang: ${charName} (${univName}) ✦`);
        }
      } else {
        if (onShowToast) onShowToast(`Melihat Our Little Orbit sebagai ${charName} (${univName}) ✦`);
      }
    });
  }

  // --- Cloud Database Sync Status Indicator ---
  const cloudBadge = document.getElementById('orbit-cloud-status');
  const cloudDot = document.getElementById('orbit-cloud-dot');
  const cloudText = document.getElementById('orbit-cloud-text');

  if (cloudBadge && cloudDot && cloudText) {
    cloudBadge.style.cursor = 'pointer';
    subscribeDatabaseStatus((status) => {
      if (status.state === 'synced') {
        cloudDot.style.background = '#22c55e';
        cloudDot.style.boxShadow = '0 0 8px #22c55e';
        cloudText.textContent = 'Cloud Firestore Terhubung ☁️';
        cloudBadge.title = status.message || 'Data tersimpan di Cloud Firestore';
        cloudBadge.removeAttribute('data-error-detail');
      } else if (status.state === 'syncing') {
        cloudDot.style.background = '#eab308';
        cloudDot.style.boxShadow = '0 0 8px #eab308';
        cloudText.textContent = 'Menyimpan ke Cloud...';
        cloudBadge.title = status.message;
        cloudBadge.removeAttribute('data-error-detail');
      } else if (status.state === 'error') {
        cloudDot.style.background = '#ef4444';
        cloudDot.style.boxShadow = '0 0 8px #ef4444';
        const codeSuffix = status.errorCode ? ` (${status.errorCode})` : '';
        cloudText.textContent = `⚠️ Gagal Sinkron Cloud${codeSuffix}`;
        const categoryTag = status.category ? `[${status.category}] ` : '';
        const fullDetail = `${categoryTag}Operasi: ${status.operation || '-'} | Path: ${status.targetPath || '-'} | Code: ${status.errorCode || '-'} | Pesan: ${status.errorMessage || status.lastError || status.message}`;
        cloudBadge.title = fullDetail;
        cloudBadge.setAttribute('data-error-detail', fullDetail);
      } else {
        cloudDot.style.background = '#94a3b8';
        cloudDot.style.boxShadow = 'none';
        cloudText.textContent = 'Mode Offline (Cache)';
        cloudBadge.title = status.message;
        cloudBadge.removeAttribute('data-error-detail');
      }
    });

    cloudBadge.addEventListener('click', () => {
      const current = getDatabaseStatus();
      if (current.state === 'error') {
        const fullDetail = cloudBadge.getAttribute('data-error-detail') || current.lastError || 'Kendala sinkronisasi Cloud Firestore';
        if (onShowToast) onShowToast(`⚠️ ${fullDetail}`);
        console.error('Firebase Cloud Error Details:', current);
      } else if (current.state === 'synced') {
        if (onShowToast) onShowToast(`☁️ Cloud Firestore Aktif: ${current.message}`);
      } else if (current.state === 'idle') {
        if (onShowToast) onShowToast(`ℹ️ ${current.message}`);
      }
    });
  }

  // --- Calendar Navigation ---
  if (btnOrbitPrev) {
    btnOrbitPrev.addEventListener('click', () => navigateCalendar(-1));
  }
  if (btnOrbitNext) {
    btnOrbitNext.addEventListener('click', () => navigateCalendar(1));
  }
  if (btnOrbitToday) {
    btnOrbitToday.addEventListener('click', () => navigateCalendar(0));
  }

  // View Mode Toggles
  if (btnViewMonth) {
    btnViewMonth.addEventListener('click', () => {
      btnViewMonth.classList.add('active');
      if (btnViewWeek) btnViewWeek.classList.remove('active');
      setViewMode('month');
    });
  }
  if (btnViewWeek) {
    btnViewWeek.addEventListener('click', () => {
      btnViewWeek.classList.add('active');
      if (btnViewMonth) btnViewMonth.classList.remove('active');
      setViewMode('week');
    });
  }

  // Category Filter Chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.getAttribute('data-category');
      setCategoryFilter(cat || 'all');
    });
  });

  // Selected Day Actions
  if (btnStripAddEvent) {
    btnStripAddEvent.addEventListener('click', () => {
      const selDate = getSelectedDateStr();
      if (eventDateInput) eventDateInput.value = selDate;
      openModal(modalCreateEvent);
    });
  }

  // Top Action Buttons
  if (btnOpenCreateEvent) {
    btnOpenCreateEvent.addEventListener('click', () => {
      const selDate = getSelectedDateStr();
      if (eventDateInput) eventDateInput.value = selDate;
      openModal(modalCreateEvent);
    });
  }

  // Selective Meeting Participants Selector Engine
  const orbitParticipantsSelectGrid = document.getElementById('orbit-participants-select-grid');
  const btnSelectAllParticipants = document.getElementById('btn-select-all-participants');
  const btnClearAllParticipants = document.getElementById('btn-clear-all-participants');
  const selectedParticipantsCount = document.getElementById('selected-participants-count');

  let selectedMeetingParticipants = new Set();

  function updateParticipantCount() {
    if (selectedParticipantsCount) {
      selectedParticipantsCount.textContent = String(selectedMeetingParticipants.size);
    }
  }

  function renderParticipantSelector() {
    if (!orbitParticipantsSelectGrid) return;
    orbitParticipantsSelectGrid.innerHTML = '';

    const currentViewer = normalizeCharacterKey(getActiveUserCharacter());

    ALL_ORBIT_CHARACTERS.forEach(char => {
      const isHost = char.id === currentViewer;
      const card = document.createElement('div');
      card.className = `participant-select-card ${isHost ? 'is-host' : ''} ${selectedMeetingParticipants.has(char.id) ? 'selected' : ''}`;
      card.setAttribute('data-char-id', char.id);

      card.innerHTML = `
        <img src="${char.avatar}" alt="${char.name}" class="participant-card-avatar" loading="lazy" />
        <div class="participant-card-name">${char.name}</div>
        <div class="participant-card-universe">${char.universe}</div>
        <div class="participant-card-indicator">
          ${isHost ? '👑 Host (Kamu)' : (selectedMeetingParticipants.has(char.id) ? '✓ Diundang' : '+ Undang')}
        </div>
      `;

      if (!isHost) {
        card.addEventListener('click', () => {
          if (selectedMeetingParticipants.has(char.id)) {
            selectedMeetingParticipants.delete(char.id);
            card.classList.remove('selected');
            const ind = card.querySelector('.participant-card-indicator');
            if (ind) ind.textContent = '+ Undang';
          } else {
            selectedMeetingParticipants.add(char.id);
            card.classList.add('selected');
            const ind = card.querySelector('.participant-card-indicator');
            if (ind) ind.textContent = '✓ Diundang';
          }
          updateParticipantCount();
        });
      }

      orbitParticipantsSelectGrid.appendChild(card);
    });

    updateParticipantCount();
  }

  if (btnSelectAllParticipants) {
    btnSelectAllParticipants.addEventListener('click', () => {
      const currentViewer = normalizeCharacterKey(getActiveUserCharacter());
      ALL_ORBIT_CHARACTERS.forEach(c => {
        if (c.id !== currentViewer) {
          selectedMeetingParticipants.add(c.id);
        }
      });
      renderParticipantSelector();
    });
  }

  if (btnClearAllParticipants) {
    btnClearAllParticipants.addEventListener('click', () => {
      selectedMeetingParticipants.clear();
      renderParticipantSelector();
    });
  }

  if (btnOpenProposeMeeting) {
    btnOpenProposeMeeting.addEventListener('click', () => {
      const selDate = getSelectedDateStr();
      if (meetingDateInput) meetingDateInput.value = selDate;
      const currentViewer = normalizeCharacterKey(getActiveUserCharacter());
      if (selectedMeetingParticipants.size === 0) {
        ALL_ORBIT_CHARACTERS.forEach(c => {
          if (c.id !== currentViewer) selectedMeetingParticipants.add(c.id);
        });
      } else {
        selectedMeetingParticipants.delete(currentViewer);
      }
      renderParticipantSelector();
      openModal(modalProposeMeeting);
    });
  }

  // --- Form Submissions ---

  // 1. Create Event Form
  if (formCreateEvent) {
    // Graceful auto-formatting for date input if user types DD/MM/YYYY or DD-MM-YYYY
    const dateInputEl = document.getElementById('event-date-input');
    if (dateInputEl) {
      const handleDateNormalize = () => {
        const raw = (dateInputEl.value || '').trim();
        if (raw) {
          const norm = normalizeDateString(raw);
          if (norm && norm !== raw) {
            dateInputEl.value = norm;
          }
        }
      };
      dateInputEl.addEventListener('change', handleDateNormalize);
      dateInputEl.addEventListener('blur', handleDateNormalize);
    }

    let isCreatingEvent = false;

    formCreateEvent.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isCreatingEvent) return; // Prevent double submit

      const submitBtn = formCreateEvent.querySelector('.btn-modal-submit');
      const origBtnText = submitBtn ? submitBtn.innerHTML : 'Simpan Kegiatan ✦';

      const title = (document.getElementById('event-title-input').value || '').trim();
      const category = document.getElementById('event-cat-input').value || 'together';
      const dateEl = document.getElementById('event-date-input');
      const dateRaw = (dateEl?.value || '').trim();
      const date = normalizeDateString(dateRaw);
      const time = (document.getElementById('event-time-input').value || '19:00').trim();
      const location = (document.getElementById('event-loc-input').value || '').trim();
      const description = (document.getElementById('event-desc-input').value || '').trim();

      if (!title) {
        if (onShowToast) onShowToast('⚠️ Masukkan judul kegiatan terlebih dahulu');
        document.getElementById('event-title-input')?.focus();
        return;
      }
      if (!date) {
        if (onShowToast) onShowToast('⚠️ Silakan pilih tanggal pelaksanaan kegiatan (format: YYYY-MM-DD atau DD/MM/YYYY)');
        dateEl?.focus();
        return;
      }

      // Preserve form values in case rollback is needed on failure
      const savedFormData = { title, category, date, time, location, description };

      isCreatingEvent = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Menyimpan Kegiatan... ⏳';
      }

      // 1. FAST OPTIMISTIC CLOSE: Close modal and reset form immediately (< 10ms response)
      closeModal(modalCreateEvent);
      formCreateEvent.reset();

      const authUser = auth?.currentUser;
      const verifiedChar = authUser ? identifyUserCharacter(authUser) : null;
      const activeChar = verifiedChar || getActiveUserCharacter();

      // 2. IMMEDIATE LOCAL INSERTION & BATCH CALENDAR FOCUS
      const created = addOrbitEvent({
        title,
        category,
        date,
        time,
        location,
        description,
        proposer: activeChar,
        syncStatus: 'syncing'
      });

      // Jump calendar to new event's date and reset category filter in ONE single render
      focusCalendarOnDate(date);

      if (onShowToast) onShowToast(`✦ Kegiatan "${title}" ditambahkan, menyinkronkan ke Cloud... ☁️`);

      // 3. ASYNC CLOUD SYNC & CONFIRMATION
      (async () => {
        try {
          if (created && typeof created.then === 'function') {
            await created;
          }
          created.syncStatus = 'synced';
          if (onShowToast) onShowToast(`✦ Kegiatan "${title}" berhasil disimpan di Cloud ✨`);
          if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        } catch (err) {
          console.error('Error saving orbit event to Firestore:', err);
          // Rollback: remove the optimistic item
          deleteOrbitEvent(created.id, activeChar);
          focusCalendarOnDate(date);

          const friendlyMsg = err.code === 'permission-denied'
            ? 'Izin Firestore ditolak (permission-denied). Periksa status akun.'
            : (err.message || 'Terjadi kesalahan sistem.');
          if (onShowToast) onShowToast('⚠️ Gagal menyimpan ke Cloud: ' + friendlyMsg);

          // Restore user input so data is not lost
          if (document.getElementById('event-title-input')) document.getElementById('event-title-input').value = savedFormData.title;
          if (document.getElementById('event-cat-input')) document.getElementById('event-cat-input').value = savedFormData.category;
          if (document.getElementById('event-date-input')) document.getElementById('event-date-input').value = savedFormData.date;
          if (document.getElementById('event-time-input')) document.getElementById('event-time-input').value = savedFormData.time;
          if (document.getElementById('event-loc-input')) document.getElementById('event-loc-input').value = savedFormData.location;
          if (document.getElementById('event-desc-input')) document.getElementById('event-desc-input').value = savedFormData.description;
          openModal(modalCreateEvent);
        } finally {
          isCreatingEvent = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnText;
          }
        }
      })();
    });
  }

  // 2. Propose Meeting Form (With selective invitation)
  if (formProposeMeeting) {
    formProposeMeeting.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = (document.getElementById('meeting-title-input').value || '').trim();
      const date = document.getElementById('meeting-date-input').value;
      const time = document.getElementById('meeting-time-input').value;
      const location = (document.getElementById('meeting-loc-input').value || 'Google Meet').trim();
      const description = (document.getElementById('meeting-desc-input').value || '').trim();

      if (!title) {
        if (onShowToast) onShowToast('⚠️ Masukkan topik atau agenda meeting');
        return;
      }
      if (!date || !time) {
        if (onShowToast) onShowToast('⚠️ Silakan tentukan tanggal dan waktu meeting');
        return;
      }

      const invitedList = Array.from(selectedMeetingParticipants);
      if (invitedList.length === 0) {
        if (onShowToast) onShowToast('⚠️ Silakan pilih minimal 1 peserta yang diundang ke meeting');
        return;
      }

      const submitBtn = formProposeMeeting.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim Undangan... ⏳';
      }

      try {
        const authUser = auth?.currentUser;
        const verifiedChar = authUser ? identifyUserCharacter(authUser) : null;
        const activeChar = verifiedChar || getActiveUserCharacter();

        await addOrbitEvent({
          title,
          category: 'meeting',
          date,
          time,
          location,
          description,
          proposer: activeChar,
          invitedParticipants: invitedList
        });

        selectedMeetingParticipants.clear();
        formProposeMeeting.reset();
        closeModal(modalProposeMeeting);

        if (onShowToast) onShowToast(`✦ Undangan meeting "${title}" berhasil dikirim ke ${invitedList.length} sahabat terpilih 🪐`);
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      } catch (err) {
        console.error('Error proposing meeting:', err);
        if (onShowToast) onShowToast('⚠️ Gagal mengajukan meeting: ' + (err.message || 'Error'));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origText || 'Kirim Undangan Meeting ✦';
        }
      }
    });
  }

  // 3. Reject / Decline Reason Form
  if (formRejectReason) {
    formRejectReason.addEventListener('submit', async (e) => {
      e.preventDefault();
      const evtId = rejectEventId.value;
      const note = rejectNoteInput.value;
      const userChar = getActiveUserCharacter();

      if (!evtId || !note) return;
      const submitBtn = formRejectReason.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim... ⏳';
      }

      try {
        await respondToMeeting(evtId, userChar, 'declined', note);
        formRejectReason.reset();
        closeModal(modalRejectReason);

        if (onShowToast) onShowToast(`✕ Respons penolakan meeting dengan alasan telah tersimpan.`);
        renderAll();
      } catch (err) {
        console.error('Error rejecting meeting:', err);
        if (onShowToast) onShowToast('⚠️ Gagal mengirim respons: ' + (err.message || 'Error'));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origText || 'Kirim Penolakan';
        }
      }
    });
  }

  // 4. Propose Alternate Time Form
  if (formProposeAlt) {
    formProposeAlt.addEventListener('submit', async (e) => {
      e.preventDefault();
      const evtId = altEventId.value;
      const altDate = altDateInput.value;
      const altTime = altTimeInput.value;
      const note = altNoteInput.value;
      const userChar = getActiveUserCharacter();

      if (!evtId || !altDate || !altTime || !note) return;
      const submitBtn = formProposeAlt.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim... ⏳';
      }

      try {
        await respondToMeeting(evtId, userChar, 'proposed_alt', note, altDate, altTime);
        formProposeAlt.reset();
        closeModal(modalProposeAlt);

        if (onShowToast) onShowToast(`⇄ Usulan waktu alternatif (${formatIndonesianDate(altDate)} ${altTime}) tersimpan.`);
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        renderAll();
      } catch (err) {
        console.error('Error proposing alternate meeting time:', err);
        if (onShowToast) onShowToast('⚠️ Gagal mengirim usulan waktu: ' + (err.message || 'Error'));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origText || 'Kirim Usulan Waktu';
        }
      }
    });
  }

  // --- Open Modals for Meeting Responses ---
  async function handleAcceptMeeting(evtId, btn = null) {
    const userChar = getActiveUserCharacter();
    const origText = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Menyimpan... ⏳';
    }
    try {
      await respondToMeeting(evtId, userChar, 'accepted', 'Menyetujui jadwal meeting ✨');
      if (onShowToast) onShowToast(`✓ Undangan berhasil disetujui! Responsmu telah tersimpan.`);
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      renderAll();
    } catch (err) {
      console.error('Error accepting meeting:', err);
      if (onShowToast) onShowToast('⚠️ Gagal menyetujui meeting: ' + (err.message || 'Error'));
      if (btn) {
        btn.disabled = false;
        btn.textContent = origText || '✓ Setuju';
      }
      renderAll();
    }
  }

  function handleOpenRejectModal(evtId) {
    if (rejectEventId) rejectEventId.value = evtId;
    if (rejectNoteInput) rejectNoteInput.value = '';
    openModal(modalRejectReason);
  }

  function handleOpenProposeAltModal(evtId) {
    const events = getOrbitEvents();
    const evt = events.find(e => e.id === evtId);
    if (altEventId) altEventId.value = evtId;
    if (altDateInput) altDateInput.value = evt ? evt.date : getSelectedDateStr();
    if (altTimeInput) altTimeInput.value = evt ? evt.time : '20:30';
    if (altNoteInput) altNoteInput.value = '';
    openModal(modalProposeAlt);
  }

  // --- Show Detail Modal ---
  function showEventDetail(evt) {
    if (!evt) return;

    const badge = getCategoryBadge(evt.category);

    if (detailEventTitle) detailEventTitle.textContent = evt.title;
    if (detailCategoryIcon) detailCategoryIcon.textContent = badge.icon;
    if (detailCategoryBadge) {
      detailCategoryBadge.textContent = badge.label;
      detailCategoryBadge.className = `audit-badge verified cat-${evt.category}`;
    }
    if (detailEventDatetime) {
      detailEventDatetime.textContent = `${formatIndonesianDate(evt.date)}${evt.time ? ' pukul ' + evt.time + ' WIB' : ''}`;
    }
    if (detailEventLocation) detailEventLocation.textContent = evt.location || 'Our Little Universe';
    if (detailEventProposer) detailEventProposer.textContent = evt.proposerName || getCharacterDisplayName(evt.proposer);
    if (detailEventStatus) {
      if (evt.status === 'confirmed') {
        detailEventStatus.textContent = '✦ Terkonfirmasi (Confirmed)';
        detailEventStatus.className = 'audit-badge verified';
      } else {
        detailEventStatus.textContent = '⏳ Menunggu Konfirmasi (Pending)';
        detailEventStatus.className = 'audit-badge pending';
      }
    }
    if (detailEventDesc) {
      detailEventDesc.textContent = evt.description || '(Tidak ada catatan tambahan)';
    }

    // Meeting Responses Breakdown (All 8 Characters & Selective Invites)
    if (evt.category === 'meeting' && evt.responses) {
      detailMeetingResponsesSection.style.display = 'block';
      detailResponsesList.innerHTML = '';

      const participantsList = Array.isArray(evt.participants) && evt.participants.length > 0
        ? evt.participants.map(normalizeCharacterKey)
        : Object.keys(evt.responses).map(normalizeCharacterKey);

      participantsList.forEach(charKey => {
        const resp = evt.responses[charKey] || (charKey === 'abil' && evt.responses['syma']) || { status: 'pending' };
        const charName = getCharacterShortName(charKey);
        const charAvatar = getCharacterAvatar(charKey);
        const isHost = normalizeCharacterKey(evt.proposer) === charKey;

        let badgeClass = 'pending';
        let badgeText = 'Menunggu';
        if (resp.status === 'accepted') {
          badgeClass = 'accepted';
          badgeText = '✓ Setuju';
        } else if (resp.status === 'rejected' || resp.status === 'declined') {
          badgeClass = 'declined';
          badgeText = '✕ Menolak';
        } else if (resp.status === 'proposed_alt') {
          badgeClass = 'proposed_alt';
          badgeText = '⇄ Usul Alternatif';
        }

        const row = document.createElement('div');
        row.className = 'participant-response-pill';
        row.innerHTML = `
          <div style="display: flex; flex-direction: column; width: 100%;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <img src="${charAvatar}" alt="${charName}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
                <strong style="color: #ffffff; font-size: 0.8rem;">${charName}</strong>
                ${isHost ? '<span style="color: #fbbf24; font-size: 0.68rem; font-weight: 600;">(Host)</span>' : ''}
              </div>
              <span class="resp-badge ${badgeClass}">${badgeText}</span>
            </div>
            ${resp.note ? `<span style="font-size: 0.72rem; color: #cbd5e1; margin-top: 0.2rem; padding-left: 1.8rem;">"${escapeHtml(resp.note)}"</span>` : ''}
            ${resp.altDate ? `<div class="alt-time-bubble" style="margin-left: 1.8rem;">Usul: ${formatIndonesianDate(resp.altDate)} ${resp.altTime}</div>` : ''}
          </div>
        `;
        detailResponsesList.appendChild(row);
      });
    } else {
      detailMeetingResponsesSection.style.display = 'none';
    }

    // Role-based actions: Only creator can delete/manage event
    const btnDelete = document.getElementById('btn-delete-event');
    const activeChar = getActiveUserCharacter();
    if (btnDelete) {
      if (evt.proposer === activeChar) {
        btnDelete.style.display = 'inline-flex';
        btnDelete.onclick = async () => {
          if (confirm(`Yakin ingin menghapus agenda "${evt.title}" dari Our Calendar?`)) {
            const res = await deleteOrbitEvent(evt.id, activeChar);
            if (res.success) {
              closeModal(modalEventDetail);
              if (onShowToast) onShowToast(`Agenda "${evt.title}" berhasil dihapus 🗑️`);
            } else {
              if (onShowToast) onShowToast('⚠️ ' + res.message);
            }
          }
        };
      } else {
        btnDelete.style.display = 'none';
        btnDelete.onclick = null;
      }
    }

    openModal(modalEventDetail);
  }

  // --- Rendering Engines ---

  // 1. Render Header & Viewer Badge
  function renderHeader() {
    const curDate = getCurrentDate();
    const curYear = curDate.getFullYear();
    const curMonth = curDate.getMonth();
    const mode = getActiveViewMode();

    if (orbitMonthDisplay) {
      if (mode === 'month') {
        orbitMonthDisplay.textContent = `${MONTH_NAMES[curMonth]} ${curYear}`;
      } else {
        orbitMonthDisplay.textContent = `Minggu ${MONTH_NAMES[curMonth]} ${curYear}`;
      }
    }

    const viewer = getActiveUserCharacter();
    if (orbitViewerName) {
      const shortName = getCharacterDisplayName(viewer).split(' ')[0];
      orbitViewerName.textContent = shortName;
    }

    if (stripDateText) {
      stripDateText.textContent = formatIndonesianDate(getSelectedDateStr());
    }
  }

  // 2. Render Calendar Grid (Month & Week)
  function renderCalendar() {
    if (!orbitDaysGrid) return;
    orbitDaysGrid.innerHTML = '';

    const viewMode = getActiveViewMode();
    const curDate = getCurrentDate();
    const selDateStr = getSelectedDateStr();
    const todayStr = '2026-10-20'; // Reference baseline date

    if (viewMode === 'month') {
      orbitDaysGrid.className = 'calendar-days-grid';
      if (calendarDaysHeader) calendarDaysHeader.style.display = 'grid';

      const year = curDate.getFullYear();
      const month = curDate.getMonth();

      // First day of current month
      const firstDay = new Date(year, month, 1);
      // Monday = 0, Tuesday = 1, ..., Sunday = 6
      const startDayIndex = (firstDay.getDay() + 6) % 7;

      // Number of days in current month
      const totalDays = new Date(year, month + 1, 0).getDate();

      // Number of days in previous month
      const prevMonthTotalDays = new Date(year, month, 0).getDate();

      // Previous Month Padding Cells
      for (let i = startDayIndex - 1; i >= 0; i--) {
        const prevDayNum = prevMonthTotalDays - i;
        const prevMonthIdx = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevDateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(prevDayNum).padStart(2, '0')}`;

        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        cell.innerHTML = `
          <div class="day-cell-top">
            <span class="day-number">${prevDayNum}</span>
          </div>
        `;
        cell.addEventListener('click', () => {
          setSelectedDate(prevDateStr);
        });
        orbitDaysGrid.appendChild(cell);
      }

      // Current Month Days Cells
      for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selDateStr;

        const cell = document.createElement('div');
        cell.className = `calendar-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`;
        cell.setAttribute('data-date', dateStr);

        // Fetch events matching category filter
        const events = getEventsForDate(dateStr);

        let eventsHtml = '';
        const maxDisplay = 3;
        events.slice(0, maxDisplay).forEach(evt => {
          eventsHtml += `
            <div class="event-cell-pill cat-${evt.category}" data-event-id="${evt.id}" title="${escapeHtml(evt.title)} (${evt.time || 'All-day'})">
              <span class="pill-dot">●</span>
              <span>${escapeHtml(evt.title)}</span>
            </div>
          `;
        });

        if (events.length > maxDisplay) {
          eventsHtml += `<span style="font-size: 0.65rem; color: #d8b4fe; padding-left: 0.3rem;">+${events.length - maxDisplay} lagi</span>`;
        }

        cell.innerHTML = `
          <div class="day-cell-top">
            <span class="day-number">${day}</span>
            ${isToday ? '<span class="today-star-badge" title="Hari Ini">✦</span>' : ''}
          </div>
          <div class="cell-events-list">
            ${eventsHtml}
          </div>
        `;

        // Day cell click selects date
        cell.addEventListener('click', (e) => {
          const pill = e.target.closest('.event-cell-pill');
          if (pill) {
            const evtId = pill.getAttribute('data-event-id');
            const allEvts = getOrbitEvents();
            const found = allEvts.find(item => item.id === evtId);
            if (found) {
              showEventDetail(found);
              return;
            }
          }
          setSelectedDate(dateStr);
        });

        orbitDaysGrid.appendChild(cell);
      }

      // Next Month Padding to fill clean 35 or 42 grid slots
      const currentCellCount = startDayIndex + totalDays;
      const totalSlots = currentCellCount <= 35 ? 35 : 42;
      const nextMonthPadding = totalSlots - currentCellCount;

      for (let day = 1; day <= nextMonthPadding; day++) {
        const nextMonthIdx = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const nextDateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        cell.innerHTML = `
          <div class="day-cell-top">
            <span class="day-number">${day}</span>
          </div>
        `;
        cell.addEventListener('click', () => {
          setSelectedDate(nextDateStr);
        });
        orbitDaysGrid.appendChild(cell);
      }

    } else {
      // --- Week View Rendering ---
      orbitDaysGrid.className = 'calendar-days-grid calendar-week-grid';
      if (calendarDaysHeader) calendarDaysHeader.style.display = 'none';

      // Find Monday of the week containing curDate
      const baseDate = new Date(curDate);
      const dayOfWeek = (baseDate.getDay() + 6) % 7; // Monday = 0
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() - dayOfWeek);

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + i);

        const y = dayDate.getFullYear();
        const m = String(dayDate.getMonth() + 1).padStart(2, '0');
        const d = String(dayDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selDateStr;

        const events = getEventsForDate(dateStr);

        let eventsHtml = '';
        if (events.length === 0) {
          eventsHtml = `<div style="font-size: 0.75rem; color: rgba(255,255,255,0.3); text-align: center; margin-top: 1rem; font-style: italic;">Tidak ada agenda</div>`;
        } else {
          events.forEach(evt => {
            const badge = getCategoryBadge(evt.category);
            eventsHtml += `
              <div class="event-cell-pill cat-${evt.category}" data-event-id="${evt.id}" style="padding: 0.45rem 0.5rem; white-space: normal; line-height: 1.35; margin-bottom: 0.4rem;">
                <span>${badge.icon}</span>
                <div style="display: flex; flex-direction: column;">
                  <strong style="color: #ffffff; font-size: 0.78rem;">${escapeHtml(evt.title)}</strong>
                  <span style="font-size: 0.68rem; opacity: 0.85;">${evt.time || 'All-day'} • ${escapeHtml(evt.location || 'Orbit')}</span>
                </div>
              </div>
            `;
          });
        }

        const col = document.createElement('div');
        col.className = `week-day-col ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`;
        col.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.4rem;">
            <div>
              <div style="font-family: var(--font-display); font-size: 0.72rem; color: #c4b5fd; text-transform: uppercase;">${DAY_NAMES_FULL[i]}</div>
              <div style="font-family: var(--font-serif); font-size: 1.15rem; font-weight: 700; color: #fff;">${dayDate.getDate()} ${formatShortMonth(dayDate.getMonth())}</div>
            </div>
            ${isToday ? '<span class="today-star-badge" title="Hari Ini">✦</span>' : ''}
          </div>
          <div style="display: flex; flex-direction: column; flex: 1; margin-top: 0.4rem;">
            ${eventsHtml}
          </div>
        `;

        col.addEventListener('click', (e) => {
          const pill = e.target.closest('.event-cell-pill');
          if (pill) {
            const evtId = pill.getAttribute('data-event-id');
            const allEvts = getOrbitEvents();
            const found = allEvts.find(item => item.id === evtId);
            if (found) {
              showEventDetail(found);
              return;
            }
          }
          setSelectedDate(dateStr);
        });

        orbitDaysGrid.appendChild(col);
      }
    }
  }

  // 3. Render Meeting Proposals Section (Selective Invites & Dynamic Participants)
  function renderMeetings() {
    if (!meetingProposalsContainer) return;
    meetingProposalsContainer.innerHTML = '';

    const currentViewer = normalizeCharacterKey(getActiveUserCharacter());
    const meetings = getMeetingInvitations(currentViewer);
    if (meetingCounterBadge) {
      meetingCounterBadge.textContent = `${meetings.length} Terjadwal`;
    }

    if (meetings.length === 0) {
      meetingProposalsContainer.innerHTML = `
        <div style="padding: 1.2rem; text-align: center; font-size: 0.82rem; color: var(--text-muted);">
          Belum ada undangan meeting jarak jauh untuk ${getCharacterShortName(currentViewer)}.
        </div>
      `;
      return;
    }

    meetings.forEach(meeting => {
      const card = document.createElement('div');
      card.className = 'meeting-proposal-card';

      // Determine current user's response
      const responses = meeting.responses || {};
      const myResp = responses[currentViewer] || (currentViewer === 'abil' && responses['syma']) || { status: 'pending' };

      // Build participants pill list based on meeting.participants
      const participantsList = Array.isArray(meeting.participants) && meeting.participants.length > 0
        ? meeting.participants.map(normalizeCharacterKey)
        : Object.keys(responses).map(normalizeCharacterKey);

      let responsesHtml = '';
      participantsList.forEach(charKey => {
        const r = responses[charKey] || (charKey === 'abil' && responses['syma']) || { status: 'pending' };
        const shortName = getCharacterShortName(charKey);
        const avatar = getCharacterAvatar(charKey);
        const isParticipantHost = normalizeCharacterKey(meeting.proposer) === charKey;

        let badgeClass = 'pending';
        let badgeText = 'Menunggu';
        if (r.status === 'accepted') {
          badgeClass = 'accepted';
          badgeText = '✓ Setuju';
        } else if (r.status === 'rejected' || r.status === 'declined') {
          badgeClass = 'declined';
          badgeText = '✕ Menolak';
        } else if (r.status === 'proposed_alt') {
          badgeClass = 'proposed_alt';
          badgeText = '⇄ Usul Lain';
        }

        responsesHtml += `
          <div class="participant-response-pill">
            <div class="participant-pill-identity">
              <img src="${avatar}" alt="${shortName}" class="participant-pill-avatar" />
              <span style="font-weight: 500; color: #f3e8ff; font-size: 0.78rem;">
                ${shortName} ${isParticipantHost ? '<span style="color: #fbbf24; font-size: 0.68rem; margin-left: 0.2rem;">(Host)</span>' : ''}
              </span>
            </div>
            <span class="resp-badge ${badgeClass}">${badgeText}</span>
          </div>
        `;
      });

      // Show alternate time callout if any participant proposed one
      let altProposalBox = '';
      Object.entries(responses).forEach(([charKey, respObj]) => {
        if (respObj && respObj.status === 'proposed_alt') {
          const proposerName = getCharacterShortName(charKey);
          altProposalBox += `
            <div class="alt-time-bubble">
              <strong>${proposerName} mengusulkan:</strong> ${formatIndonesianDate(respObj.altDate)} pukul ${respObj.altTime}
              <div style="font-size: 0.7rem; opacity: 0.9; margin-top: 0.15rem;">"${escapeHtml(respObj.note)}"</div>
            </div>
          `;
        }
      });

      const proposerAvatar = getCharacterAvatar(meeting.proposer);
      const proposerShortName = getCharacterShortName(meeting.proposer);
      const formattedDateTime = formatIndonesianMeetingDateTime(meeting.date, meeting.time);

      card.innerHTML = `
        <div class="meeting-card-title">${escapeHtml(meeting.title)}</div>
        <div class="meeting-meta-list">
          <div class="meeting-meta-item">
            <span>📅</span>
            <span><strong>${formattedDateTime}</strong></span>
          </div>
          <div class="meeting-meta-item">
            <span>🪐</span>
            <span>Platform: <strong>${escapeHtml(meeting.location || 'Google Meet')}</strong></span>
          </div>
          <div class="meeting-meta-item">
            <img src="${proposerAvatar}" alt="${proposerShortName}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.4);" />
            <span>Pengundang: <strong>${escapeHtml(meeting.proposerName || proposerShortName)}</strong></span>
          </div>
        </div>

        ${meeting.description ? `<p style="font-size: 0.78rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 0.5rem 0.7rem; border-radius: 8px; line-height: 1.4;">${escapeHtml(meeting.description)}</p>` : ''}

        <!-- Status Peserta -->
        <div class="meeting-responses-box">
          <div class="responses-header-row">
            <span>Peserta (${participantsList.length} Sahabat)</span>
            <span style="font-size: 0.7rem; color: ${meeting.status === 'confirmed' ? '#86efac' : '#fef08a'};">
              ${meeting.status === 'confirmed' ? '✦ Terkonfirmasi' : '⏳ Proses Konfirmasi'}
            </span>
          </div>
          ${responsesHtml}
          ${altProposalBox}
        </div>

        <!-- Action Buttons for Current Viewing Character -->
        <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.3rem;">
          <div style="font-size: 0.72rem; color: #c4b5fd; font-weight: 500;">
            Status Responmu (${getCharacterShortName(currentViewer)}):
            <strong style="color: #ffffff;">
              ${myResp.status === 'accepted' ? '✓ Setuju' : (myResp.status === 'rejected' || myResp.status === 'declined') ? '✕ Menolak' : myResp.status === 'proposed_alt' ? '⇄ Mengusulkan Alternatif' : 'Menunggu responsmu'}
            </strong>
          </div>
          <div class="meeting-user-actions">
            <button type="button" class="btn-resp-acc" data-action="acc" data-id="${meeting.id}" title="Setujui jadwal ini">
              ✓ Setuju
            </button>
            <button type="button" class="btn-resp-rej" data-action="rej" data-id="${meeting.id}" title="Tolak dengan alasan">
              ✕ Menolak
            </button>
            <button type="button" class="btn-resp-alt" data-action="alt" data-id="${meeting.id}" title="Usulkan tanggal atau jam lain">
              ⇄ Usul Lain
            </button>
          </div>
        </div>
      `;

      // Attach button events
      card.querySelectorAll('.btn-resp-acc').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleAcceptMeeting(meeting.id);
        });
      });

      card.querySelectorAll('.btn-resp-rej').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleOpenRejectModal(meeting.id);
        });
      });

      card.querySelectorAll('.btn-resp-alt').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleOpenProposeAltModal(meeting.id);
        });
      });

      meetingProposalsContainer.appendChild(card);
    });
  }

  // 4. Render Upcoming Agendas List
  function renderUpcoming() {
    if (!upcomingAgendasList) return;
    upcomingAgendasList.innerHTML = '';

    const agendas = getUpcomingAgendas(7);
    if (upcomingCounterBadge) {
      upcomingCounterBadge.textContent = `${agendas.length} Agenda`;
    }

    if (agendas.length === 0) {
      upcomingAgendasList.innerHTML = `
        <div style="padding: 1rem; text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          Tidak ada agenda mendatang.
        </div>
      `;
      return;
    }

    agendas.forEach(evt => {
      const normDate = normalizeDateString(evt.date);
      const parts = normDate.split('-');
      const monthIdx = parts.length >= 2 ? (parseInt(parts[1], 10) - 1) : 0;
      const dayNum = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
      const badge = getCategoryBadge(evt.category);

      const card = document.createElement('div');
      card.className = 'agenda-item-card';
      card.setAttribute('data-id', evt.id);

      card.innerHTML = `
        <div class="agenda-date-badge">
          <span class="agenda-badge-month">${formatShortMonth(monthIdx)}</span>
          <span class="agenda-badge-day">${dayNum}</span>
        </div>
        <div class="agenda-item-content">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span style="font-size: 0.8rem;">${badge.icon}</span>
            <div class="agenda-title-text">${escapeHtml(evt.title)}</div>
          </div>
          <div class="agenda-time-text">
            <span>🕒 ${evt.time || 'All-day'}</span>
            <span>•</span>
            <span>📍 ${escapeHtml(evt.location || 'Our Little Orbit')}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        showEventDetail(evt);
      });

      upcomingAgendasList.appendChild(card);
    });
  }

  // Orbit Notifications Bell & Modal Controller
  const btnOrbitNotifications = document.getElementById('btn-orbit-notifications');
  const orbitNotifCountBadge = document.getElementById('orbit-notif-count-badge');
  const modalOrbitNotifications = document.getElementById('modal-orbit-notifications');
  const orbitNotificationsList = document.getElementById('orbit-notifications-list');
  const notifViewerInfo = document.getElementById('notif-viewer-info');
  const btnMarkAllNotifsRead = document.getElementById('btn-mark-all-notifs-read');

  function renderNotifications() {
    const viewer = normalizeCharacterKey(getActiveUserCharacter());
    const notifs = getOrbitNotifications(viewer);
    const unreadCount = getUnreadNotificationsCount(viewer);

    if (orbitNotifCountBadge) {
      if (unreadCount > 0) {
        orbitNotifCountBadge.style.display = 'flex';
        orbitNotifCountBadge.textContent = String(unreadCount);
      } else {
        orbitNotifCountBadge.style.display = 'none';
      }
    }

    if (notifViewerInfo) {
      notifViewerInfo.textContent = `Notifikasi untuk ${getCharacterShortName(viewer)} (${getCharacterUniverse(viewer)})`;
    }

    if (orbitNotificationsList) {
      orbitNotificationsList.innerHTML = '';
      if (notifs.length === 0) {
        orbitNotificationsList.innerHTML = `
          <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            <span>🔔</span>
            <p style="margin-top: 0.5rem;">Belum ada notifikasi meeting baru untuk ${getCharacterShortName(viewer)}.</p>
          </div>
        `;
        return;
      }

      notifs.forEach(n => {
        const item = document.createElement('div');
        item.className = `orbit-notif-card ${!n.read ? 'unread' : ''}`;
        const proposerAvatar = getCharacterAvatar(n.proposer);

        if (n.type === 'music_recommendation' || n.type === 'song_recommendation') {
          item.innerHTML = `
            <img src="${proposerAvatar}" alt="${n.proposerName}" class="orbit-notif-avatar" />
            <div class="orbit-notif-content">
              <div class="orbit-notif-title">🎵 Rekomendasi Musik: ${escapeHtml(n.songTitle || 'Lagu Baru')}</div>
              <div class="orbit-notif-desc">${escapeHtml(n.message || '')}</div>
              <div class="orbit-notif-time">🎶 Artis: ${escapeHtml(n.songArtist || '')}</div>
              <button type="button" class="btn-notif-view-song" data-song-id="${n.songId}">
                Buka Music Corner di Gazebo 🎵 →
              </button>
            </div>
          `;

          const btnViewSong = item.querySelector('.btn-notif-view-song');
          if (btnViewSong) {
            btnViewSong.addEventListener('click', () => {
              markOrbitNotificationRead(n.id, viewer);
              closeModal(modalOrbitNotifications);
              openSongsWeShareModal({
                activeChar: viewer,
                highlightSongId: n.songId
              });
            });
          }
        } else {
          const meetingDateFormatted = formatIndonesianMeetingDateTime(n.meetingDate, n.meetingTime);

          item.innerHTML = `
            <img src="${proposerAvatar}" alt="${n.proposerName}" class="orbit-notif-avatar" />
            <div class="orbit-notif-content">
              <div class="orbit-notif-title">${escapeHtml(n.meetingTitle || 'Undangan Meeting')}</div>
              <div class="orbit-notif-desc">${escapeHtml(n.message || '')}</div>
              <div class="orbit-notif-time">📅 ${meetingDateFormatted}</div>
              <button type="button" class="btn-notif-view-meeting" data-meeting-id="${n.meetingId}">
                Buka Detail Meeting →
              </button>
            </div>
          `;

          const btnView = item.querySelector('.btn-notif-view-meeting');
          if (btnView) {
            btnView.addEventListener('click', () => {
              markOrbitNotificationRead(n.id, viewer);
              closeModal(modalOrbitNotifications);
              const events = getOrbitEvents();
              const meetingEvt = events.find(e => e.id === n.meetingId);
              if (meetingEvt) {
                showEventDetail(meetingEvt);
              }
            });
          }
        }

        orbitNotificationsList.appendChild(item);
      });
    }
  }

  if (btnOrbitNotifications) {
    btnOrbitNotifications.addEventListener('click', () => {
      renderNotifications();
      openModal(modalOrbitNotifications);
    });
  }

  if (btnMarkAllNotifsRead) {
    btnMarkAllNotifsRead.addEventListener('click', () => {
      const viewer = normalizeCharacterKey(getActiveUserCharacter());
      markAllOrbitNotificationsRead(viewer);
      renderNotifications();
      if (onShowToast) onShowToast('Semua notifikasi meeting telah ditandai dibaca.');
    });
  }

  // Master re-render function
  function renderAll() {
    renderHeader();
    renderSelectedDayEvents();
    renderCalendar();
    renderMeetings();
    renderUpcoming();
    renderNotifications();
  }

  // Render events for the selected date or empty state
  function renderSelectedDayEvents() {
    const container = document.getElementById('selected-day-events-container');
    if (!container) return;

    const selDate = getSelectedDateStr();
    const dayEvents = getEventsForDate(selDate);

    if (dayEvents.length === 0) {
      container.innerHTML = `
        <div class="orbit-empty-day-state">
          <span class="empty-sparkle">✦</span>
          <span>Belum ada agenda pada ${formatIndonesianDate(selDate)}. Klik <strong>"+ Tambah di Tanggal Ini"</strong> untuk menjadwalkan acara baru!</span>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    const listWrapper = document.createElement('div');
    listWrapper.className = 'selected-day-pills-row';

    dayEvents.forEach(evt => {
      const badge = getCategoryBadge(evt.category);
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `selected-day-event-card cat-${evt.category}`;
      pill.setAttribute('data-id', evt.id);
      pill.innerHTML = `
        <span class="event-icon">${badge.icon}</span>
        <div class="event-body">
          <strong class="event-title">${escapeHtml(evt.title)}</strong>
          <span class="event-time">${evt.time ? evt.time + ' WIB' : 'Sepanjang Hari'} • ${escapeHtml(evt.location || 'Universe')}</span>
        </div>
        <span class="arrow-peek">→</span>
      `;
      pill.addEventListener('click', () => {
        showEventDetail(evt);
      });
      listWrapper.appendChild(pill);
    });

    container.appendChild(listWrapper);
  }

  // Subscribe to reactive store changes
  subscribeOrbit(() => {
    renderAll();
  });

  // Initial render
  renderAll();

  return {
    openOrbit,
    closeOrbit,
    renderAll
  };
}
