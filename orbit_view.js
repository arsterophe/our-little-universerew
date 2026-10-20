/**
 * OUR LITTLE ORBIT — VIEW CONTROLLER & INTERACTION ENGINE
 * 
 * Handles DOM rendering for monthly/weekly calendars, category filtering,
 * event detail inspections, meeting response simulation (accept/reject/propose alt),
 * and modal management.
 */

import {
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
  navigateCalendar,
  getFilteredEvents,
  getEventsForDate,
  getUpcomingAgendas,
  getMeetingInvitations,
  addOrbitEvent,
  respondToMeeting,
  getCharacterDisplayName,
  getCategoryBadge,
  subscribeOrbit
} from './orbit.js';

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
  function openOrbit(fromViewId = 'view-selection') {
    previousViewId = fromViewId;

    if (viewSelection) {
      viewSelection.classList.remove('active');
      viewSelection.setAttribute('aria-hidden', 'true');
    }
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

    if (previousViewId === 'view-private-universe' && viewPrivateUniverse) {
      viewPrivateUniverse.classList.add('active');
      viewPrivateUniverse.setAttribute('aria-hidden', 'false');
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

  // Perspective switcher: Clicking viewer badge lets user toggle between Nyanya, Lala, Lele
  if (orbitUserBadge) {
    orbitUserBadge.style.cursor = 'pointer';
    orbitUserBadge.title = 'Klik untuk berganti sudut pandang sahabat (Nyanya / Lala / Lele)';
    orbitUserBadge.addEventListener('click', () => {
      const order = ['nyanya', 'lala', 'lele'];
      const current = getActiveUserCharacter();
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      const nextChar = order[nextIdx];
      setActiveUserCharacter(nextChar);
      if (onShowToast) onShowToast(`Melihat Our Little Orbit sebagai ${getCharacterDisplayName(nextChar).split(' ')[0]} ✦`);
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

  if (btnOpenProposeMeeting) {
    btnOpenProposeMeeting.addEventListener('click', () => {
      const selDate = getSelectedDateStr();
      if (meetingDateInput) meetingDateInput.value = selDate;
      openModal(modalProposeMeeting);
    });
  }

  // --- Form Submissions ---

  // 1. Create Event Form
  if (formCreateEvent) {
    formCreateEvent.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('event-title-input').value;
      const category = document.getElementById('event-cat-input').value;
      const date = document.getElementById('event-date-input').value;
      const time = document.getElementById('event-time-input').value;
      const location = document.getElementById('event-loc-input').value;
      const description = document.getElementById('event-desc-input').value;

      if (!title || !date) return;

      addOrbitEvent({
        title,
        category,
        date,
        time,
        location,
        description,
        proposer: getActiveUserCharacter()
      });

      formCreateEvent.reset();
      closeModal(modalCreateEvent);

      if (onShowToast) onShowToast(`Kegiatan "${title}" berhasil ditambahkan ke Orbit ✦`);
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    });
  }

  // 2. Propose Meeting Form
  if (formProposeMeeting) {
    formProposeMeeting.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('meeting-title-input').value;
      const date = document.getElementById('meeting-date-input').value;
      const time = document.getElementById('meeting-time-input').value;
      const location = document.getElementById('meeting-loc-input').value;
      const description = document.getElementById('meeting-desc-input').value;

      if (!title || !date || !time) return;

      addOrbitEvent({
        title,
        category: 'meeting',
        date,
        time,
        location,
        description,
        proposer: getActiveUserCharacter()
      });

      formProposeMeeting.reset();
      closeModal(modalProposeMeeting);

      if (onShowToast) onShowToast(`Undangan meeting "${title}" terkirim ke ketiga sahabat 🪐`);
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    });
  }

  // 3. Reject Reason Form
  if (formRejectReason) {
    formRejectReason.addEventListener('submit', (e) => {
      e.preventDefault();
      const evtId = rejectEventId.value;
      const note = rejectNoteInput.value;
      const userChar = getActiveUserCharacter();

      if (!evtId || !note) return;

      respondToMeeting(evtId, userChar, 'rejected', note);
      formRejectReason.reset();
      closeModal(modalRejectReason);

      if (onShowToast) onShowToast(`Respons penolakan meeting dengan alasan telah dikirimkan ✕`);
    });
  }

  // 4. Propose Alternate Time Form
  if (formProposeAlt) {
    formProposeAlt.addEventListener('submit', (e) => {
      e.preventDefault();
      const evtId = altEventId.value;
      const altDate = altDateInput.value;
      const altTime = altTimeInput.value;
      const note = altNoteInput.value;
      const userChar = getActiveUserCharacter();

      if (!evtId || !altDate || !altTime || !note) return;

      respondToMeeting(evtId, userChar, 'proposed_alt', note, altDate, altTime);
      formProposeAlt.reset();
      closeModal(modalProposeAlt);

      if (onShowToast) onShowToast(`Usulan waktu alternatif (${formatIndonesianDate(altDate)} ${altTime}) terkirim ⇄`);
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    });
  }

  // --- Open Modals for Meeting Responses ---
  function handleAcceptMeeting(evtId) {
    const userChar = getActiveUserCharacter();
    respondToMeeting(evtId, userChar, 'accepted', 'Menyetujui jadwal meeting ✨');
    if (onShowToast) onShowToast(`Kamu menyetujui jadwal meeting sahabat! ✨`);
    if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
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

    // Meeting Responses Breakdown
    if (evt.category === 'meeting' && evt.responses) {
      detailMeetingResponsesSection.style.display = 'block';
      detailResponsesList.innerHTML = '';

      ['nyanya', 'lala', 'lele'].forEach(charKey => {
        const resp = evt.responses[charKey] || { status: 'pending' };
        const charName = getCharacterDisplayName(charKey).split(' ')[0];

        let badgeClass = 'pending';
        let badgeText = 'Menunggu';
        if (resp.status === 'accepted') {
          badgeClass = 'accepted';
          badgeText = '✓ Setuju';
        } else if (resp.status === 'rejected') {
          badgeClass = 'rejected';
          badgeText = '✕ Menolak';
        } else if (resp.status === 'proposed_alt') {
          badgeClass = 'proposed_alt';
          badgeText = '⇄ Usul Alternatif';
        }

        const row = document.createElement('div');
        row.className = 'participant-response-pill';
        row.innerHTML = `
          <div style="display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <strong style="color: #ffffff;">${charName}</strong>
              <span class="resp-badge ${badgeClass}">${badgeText}</span>
            </div>
            ${resp.note ? `<span style="font-size: 0.72rem; color: #cbd5e1; margin-top: 0.15rem;">"${escapeHtml(resp.note)}"</span>` : ''}
            ${resp.altDate ? `<div class="alt-time-bubble">Usul: ${formatIndonesianDate(resp.altDate)} ${resp.altTime}</div>` : ''}
          </div>
        `;
        detailResponsesList.appendChild(row);
      });
    } else {
      detailMeetingResponsesSection.style.display = 'none';
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

  // 3. Render Meeting Proposals Section
  function renderMeetings() {
    if (!meetingProposalsContainer) return;
    meetingProposalsContainer.innerHTML = '';

    const meetings = getMeetingInvitations();
    if (meetingCounterBadge) {
      meetingCounterBadge.textContent = `${meetings.length} Terjadwal`;
    }

    if (meetings.length === 0) {
      meetingProposalsContainer.innerHTML = `
        <div style="padding: 1.2rem; text-align: center; font-size: 0.82rem; color: var(--text-muted);">
          Belum ada undangan meeting jarak jauh aktif.
        </div>
      `;
      return;
    }

    const currentViewer = getActiveUserCharacter();

    meetings.forEach(meeting => {
      const card = document.createElement('div');
      card.className = 'meeting-proposal-card';

      // Determine current user's response
      const responses = meeting.responses || {};
      const myResp = responses[currentViewer] || { status: 'pending' };

      // Build participants pill list
      let responsesHtml = '';
      ['nyanya', 'lala', 'lele'].forEach(charKey => {
        const r = responses[charKey] || { status: 'pending' };
        const name = getCharacterDisplayName(charKey).split(' ')[0];

        let badgeClass = 'pending';
        let badgeText = 'Menunggu';
        if (r.status === 'accepted') {
          badgeClass = 'accepted';
          badgeText = '✓ Setuju';
        } else if (r.status === 'rejected') {
          badgeClass = 'rejected';
          badgeText = '✕ Menolak';
        } else if (r.status === 'proposed_alt') {
          badgeClass = 'proposed_alt';
          badgeText = '⇄ Usul Lain';
        }

        responsesHtml += `
          <div class="participant-response-pill">
            <span style="font-weight: 500; color: #f3e8ff;">${name}</span>
            <span class="resp-badge ${badgeClass}">${badgeText}</span>
          </div>
        `;
      });

      // Show alternate time callout if any participant proposed one
      let altProposalBox = '';
      Object.entries(responses).forEach(([charKey, respObj]) => {
        if (respObj.status === 'proposed_alt') {
          const proposerName = getCharacterDisplayName(charKey).split(' ')[0];
          altProposalBox += `
            <div class="alt-time-bubble">
              <strong>${proposerName} mengusulkan:</strong> ${formatIndonesianDate(respObj.altDate)} pukul ${respObj.altTime}
              <div style="font-size: 0.7rem; opacity: 0.9; margin-top: 0.15rem;">"${escapeHtml(respObj.note)}"</div>
            </div>
          `;
        }
      });

      card.innerHTML = `
        <div class="meeting-card-title">${escapeHtml(meeting.title)}</div>
        <div class="meeting-meta-list">
          <div class="meeting-meta-item">
            <span>📅</span>
            <span>${formatIndonesianDate(meeting.date)} • ${meeting.time} WIB</span>
          </div>
          <div class="meeting-meta-item">
            <span>🪐</span>
            <span>Platform: <strong>${escapeHtml(meeting.location || 'Google Meet')}</strong></span>
          </div>
          <div class="meeting-meta-item">
            <span>👑</span>
            <span>Diajukan oleh: <strong>${escapeHtml(meeting.proposerName)}</strong></span>
          </div>
        </div>

        ${meeting.description ? `<p style="font-size: 0.78rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 0.5rem 0.7rem; border-radius: 8px; line-height: 1.4;">${escapeHtml(meeting.description)}</p>` : ''}

        <!-- Status Peserta -->
        <div class="meeting-responses-box">
          <div class="responses-header-row">
            <span>Respons Sahabat</span>
            <span style="font-size: 0.7rem; color: ${meeting.status === 'confirmed' ? '#86efac' : '#fef08a'};">
              ${meeting.status === 'confirmed' ? '✦ Terkonfirmasi' : '⏳ Proses Diskusi'}
            </span>
          </div>
          ${responsesHtml}
          ${altProposalBox}
        </div>

        <!-- Action Buttons for Current Viewing Character -->
        <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.3rem;">
          <div style="font-size: 0.72rem; color: #c4b5fd; font-weight: 500;">
            Status Responmu (${getCharacterDisplayName(currentViewer).split(' ')[0]}):
            <strong style="color: #ffffff;">${myResp.status === 'accepted' ? '✓ Setuju' : myResp.status === 'rejected' ? '✕ Menolak' : myResp.status === 'proposed_alt' ? '⇄ Mengusulkan Alternatif' : 'Menunggu responsmu'}</strong>
          </div>
          <div class="meeting-user-actions">
            <button type="button" class="btn-resp-acc" data-action="acc" data-id="${meeting.id}" title="Setujui jadwal ini">
              ✓ Setuju
            </button>
            <button type="button" class="btn-resp-rej" data-action="rej" data-id="${meeting.id}" title="Tolak dengan alasan">
              ✕ Tolak
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
      const parts = evt.date.split('-');
      const monthIdx = parseInt(parts[1], 10) - 1;
      const dayNum = parseInt(parts[2], 10);
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

  // Master re-render function
  function renderAll() {
    renderHeader();
    renderCalendar();
    renderMeetings();
    renderUpcoming();
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
