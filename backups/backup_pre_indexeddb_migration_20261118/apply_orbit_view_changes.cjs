const fs = require('fs');

const path = 'orbit_view.js';
let content = fs.readFileSync(path, 'utf8');

function replaceFlexible(str, target, replacement) {
  const normStr = str.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  const normRepl = replacement.replace(/\r\n/g, '\n');
  if (!normStr.includes(normTarget)) {
    throw new Error('Target string not found: ' + target.substring(0, 80));
  }
  return normStr.replace(normTarget, normRepl);
}

// 1. Update imports
const targetImports = `import {
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
  deleteOrbitEvent,
  updateOrbitEvent,
  respondToMeeting,
  getCharacterDisplayName,
  getCategoryBadge,
  subscribeOrbit
} from './orbit.js';`;

const replacementImports = `import {
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
} from './orbit.js';`;

content = replaceFlexible(content, targetImports, replacementImports);

// 2. Add formatIndonesianMeetingDateTime
const targetDateFn = `export function formatIndonesianDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return \`\${day} \${MONTH_NAMES[month] || ''} \${year}\`;
}`;

const replacementDateFn = `export function formatIndonesianDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return \`\${day} \${MONTH_NAMES[month] || ''} \${year}\`;
}

// Format friendly Indonesian date with day of week & time (e.g. "Sabtu, 21 November 2026 • 15:00 WIB")
export function formatIndonesianMeetingDateTime(dateStr, timeStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return \`\${dateStr} \${timeStr || ''}\`;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, month, day);
  const dayName = DAY_NAMES_FULL[(dateObj.getDay() + 6) % 7];
  const dateFormatted = \`\${dayName}, \${day} \${MONTH_NAMES[month]} \${year}\`;
  const timeFormatted = timeStr ? \`\${timeStr} WIB\` : '';
  return timeFormatted ? \`\${dateFormatted} • \${timeFormatted}\` : dateFormatted;
}`;

content = replaceFlexible(content, targetDateFn, replacementDateFn);

// 3. Update closeOrbit to support all 8 universes
const targetCloseOrbit = `  function closeOrbit() {
    if (viewOrbit) {
      viewOrbit.classList.remove('active');
      viewOrbit.setAttribute('aria-hidden', 'true');
    }

    const viewKidultWorld = document.getElementById('view-kidult-world');
    const viewToYouWorld = document.getElementById('view-toyou-world');
    const viewShadowWorld = document.getElementById('view-shadow-world');

    if (previousViewId === 'view-kidult-world' && viewKidultWorld) {
      viewKidultWorld.classList.add('active');
      viewKidultWorld.setAttribute('aria-hidden', 'false');
    } else if (previousViewId === 'view-toyou-world' && viewToYouWorld) {
      viewToYouWorld.classList.add('active');
      viewToYouWorld.setAttribute('aria-hidden', 'false');
    } else if (previousViewId === 'view-shadow-world' && viewShadowWorld) {
      viewShadowWorld.classList.add('active');
      viewShadowWorld.setAttribute('aria-hidden', 'false');
    } else if (previousViewId === 'view-private-universe' && viewPrivateUniverse) {
      viewPrivateUniverse.classList.add('active');
      viewPrivateUniverse.setAttribute('aria-hidden', 'false');
      // Reset active nav button in navbar
      const navButtons = document.querySelectorAll('.univ-nav-btn');
      navButtons.forEach(b => b.classList.remove('active'));
      const btnUniv = document.getElementById('nav-btn-universes');
      if (btnUniv) btnUniv.classList.add('active');
    } else if (viewSelection) {
      viewSelection.classList.add('active');
      viewSelection.setAttribute('aria-hidden', 'false');
    }
  }`;

const replacementCloseOrbit = `  function closeOrbit() {
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
  }`;

content = replaceFlexible(content, targetCloseOrbit, replacementCloseOrbit);

// 4. Update perspective switcher order to all 8 characters
const targetBadgeSwitcher = `  // Perspective switcher: Clicking viewer badge lets user toggle between Nyanya, Lala, Lele
  if (orbitUserBadge) {
    orbitUserBadge.style.cursor = 'pointer';
    orbitUserBadge.title = 'Klik untuk berganti sudut pandang sahabat (Nyanya / Lala / Lele)';
    orbitUserBadge.addEventListener('click', () => {
      const order = ['nyanya', 'lala', 'lele'];
      const current = getActiveUserCharacter();
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      const nextChar = order[nextIdx];
      setActiveUserCharacter(nextChar);
      
      const authUser = auth?.currentUser;
      const verifiedAuthChar = authUser ? identifyUserCharacter(authUser) : null;
      if (verifiedAuthChar) {
        if (nextChar === verifiedAuthChar) {
          if (onShowToast) onShowToast(\`Melihat Our Little Orbit sebagai \${getCharacterDisplayName(nextChar).split(' ')[0]} (Akun Aktif ✦)\`);
        } else {
          if (onShowToast) onShowToast(\`Sudut pandang: \${getCharacterDisplayName(nextChar).split(' ')[0]} ✦ (Sesi autentikasi: \${getCharacterDisplayName(verifiedAuthChar).split(' ')[0]})\`);
        }
      } else {
        if (onShowToast) onShowToast(\`Melihat Our Little Orbit sebagai \${getCharacterDisplayName(nextChar).split(' ')[0]} ✦ (Mode Offline)\`);
      }
    });
  }`;

const replacementBadgeSwitcher = `  // Perspective switcher: Clicking viewer badge lets user toggle between all 8 characters
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
          if (onShowToast) onShowToast(\`Melihat Our Little Orbit sebagai \${charName} (\${univName}) [Akun Aktif ✦]\`);
        } else {
          if (onShowToast) onShowToast(\`Sudut pandang: \${charName} (\${univName}) ✦\`);
        }
      } else {
        if (onShowToast) onShowToast(\`Melihat Our Little Orbit sebagai \${charName} (\${univName}) ✦\`);
      }
    });
  }`;

content = replaceFlexible(content, targetBadgeSwitcher, replacementBadgeSwitcher);

// 5. Update propose meeting button click and add participant selector engine
const targetProposeMeetingBtn = `  if (btnOpenProposeMeeting) {
    btnOpenProposeMeeting.addEventListener('click', () => {
      const selDate = getSelectedDateStr();
      if (meetingDateInput) meetingDateInput.value = selDate;
      openModal(modalProposeMeeting);
    });
  }`;

const replacementProposeMeetingBtn = `  // Selective Meeting Participants Selector Engine
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
      card.className = \`participant-select-card \${isHost ? 'is-host' : ''} \${selectedMeetingParticipants.has(char.id) ? 'selected' : ''}\`;
      card.setAttribute('data-char-id', char.id);

      card.innerHTML = \`
        <img src="\${char.avatar}" alt="\${char.name}" class="participant-card-avatar" loading="lazy" />
        <div class="participant-card-name">\${char.name}</div>
        <div class="participant-card-universe">\${char.universe}</div>
        <div class="participant-card-indicator">
          \${isHost ? '👑 Host (Kamu)' : (selectedMeetingParticipants.has(char.id) ? '✓ Diundang' : '+ Undang')}
        </div>
      \`;

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
  }`;

content = replaceFlexible(content, targetProposeMeetingBtn, replacementProposeMeetingBtn);

// 6. Update formProposeMeeting submit handler
const targetFormPropose = `  // 2. Propose Meeting Form
  if (formProposeMeeting) {
    formProposeMeeting.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('meeting-title-input').value;
      const date = document.getElementById('meeting-date-input').value;
      const time = document.getElementById('meeting-time-input').value;
      const location = document.getElementById('meeting-loc-input').value;
      const description = document.getElementById('meeting-desc-input').value;

      if (!title || !date || !time) return;

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
          proposer: activeChar
        });

        formProposeMeeting.reset();
        closeModal(modalProposeMeeting);

        if (onShowToast) onShowToast(\`Undangan meeting "\${title}" terkirim ke ketiga sahabat 🪐\`);
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      } catch (err) {
        console.error('Error proposing meeting:', err);
        if (onShowToast) onShowToast('⚠️ Gagal mengajukan meeting: ' + (err.message || 'Error'));
      }
    });
  }`;

const replacementFormPropose = `  // 2. Propose Meeting Form (With selective invitation)
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

        formProposeMeeting.reset();
        closeModal(modalProposeMeeting);

        if (onShowToast) onShowToast(\`✦ Undangan meeting "\${title}" berhasil dikirim ke \${invitedList.length} sahabat terpilih 🪐\`);
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      } catch (err) {
        console.error('Error proposing meeting:', err);
        if (onShowToast) onShowToast('⚠️ Gagal mengajukan meeting: ' + (err.message || 'Error'));
      }
    });
  }`;

content = replaceFlexible(content, targetFormPropose, replacementFormPropose);

// 7. Update formRejectReason submit handler
const targetRejectForm = `  // 3. Reject Reason Form
  if (formRejectReason) {
    formRejectReason.addEventListener('submit', async (e) => {
      e.preventDefault();
      const evtId = rejectEventId.value;
      const note = rejectNoteInput.value;
      const userChar = getActiveUserCharacter();

      if (!evtId || !note) return;

      try {
        await respondToMeeting(evtId, userChar, 'rejected', note);
        formRejectReason.reset();
        closeModal(modalRejectReason);

        if (onShowToast) onShowToast(\`Respons penolakan meeting dengan alasan telah dikirimkan ✕\`);
      } catch (err) {
        console.error('Error rejecting meeting:', err);
        if (onShowToast) onShowToast('⚠️ Gagal mengirim respons: ' + (err.message || 'Error'));
      }
    });
  }`;

const replacementRejectForm = `  // 3. Reject / Decline Reason Form
  if (formRejectReason) {
    formRejectReason.addEventListener('submit', async (e) => {
      e.preventDefault();
      const evtId = rejectEventId.value;
      const note = rejectNoteInput.value;
      const userChar = getActiveUserCharacter();

      if (!evtId || !note) return;

      try {
        await respondToMeeting(evtId, userChar, 'declined', note);
        formRejectReason.reset();
        closeModal(modalRejectReason);

        if (onShowToast) onShowToast(\`Respons penolakan meeting dengan alasan telah dikirimkan ✕\`);
      } catch (err) {
        console.error('Error rejecting meeting:', err);
        if (onShowToast) onShowToast('⚠️ Gagal mengirim respons: ' + (err.message || 'Error'));
      }
    });
  }`;

content = replaceFlexible(content, targetRejectForm, replacementRejectForm);

// 8. Update showEventDetail for all participants
const targetShowEventDetail = `    // Meeting Responses Breakdown
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
        row.innerHTML = \`
          <div style="display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <strong style="color: #ffffff;">\${charName}</strong>
              <span class="resp-badge \${badgeClass}">\${badgeText}</span>
            </div>
            \${resp.note ? \`<span style="font-size: 0.72rem; color: #cbd5e1; margin-top: 0.15rem;">"\${escapeHtml(resp.note)}"</span>\` : ''}
            \${resp.altDate ? \`<div class="alt-time-bubble">Usul: \${formatIndonesianDate(resp.altDate)} \${resp.altTime}</div>\` : ''}
          </div>
        \`;
        detailResponsesList.appendChild(row);
      });
    } else {
      detailMeetingResponsesSection.style.display = 'none';
    }`;

const replacementShowEventDetail = `    // Meeting Responses Breakdown (All 8 Characters & Selective Invites)
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
        row.innerHTML = \`
          <div style="display: flex; flex-direction: column; width: 100%;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <img src="\${charAvatar}" alt="\${charName}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
                <strong style="color: #ffffff; font-size: 0.8rem;">\${charName}</strong>
                \${isHost ? '<span style="color: #fbbf24; font-size: 0.68rem; font-weight: 600;">(Host)</span>' : ''}
              </div>
              <span class="resp-badge \${badgeClass}">\${badgeText}</span>
            </div>
            \${resp.note ? \`<span style="font-size: 0.72rem; color: #cbd5e1; margin-top: 0.2rem; padding-left: 1.8rem;">"\${escapeHtml(resp.note)}"</span>\` : ''}
            \${resp.altDate ? \`<div class="alt-time-bubble" style="margin-left: 1.8rem;">Usul: \${formatIndonesianDate(resp.altDate)} \${resp.altTime}</div>\` : ''}
          </div>
        \`;
        detailResponsesList.appendChild(row);
      });
    } else {
      detailMeetingResponsesSection.style.display = 'none';
    }`;

content = replaceFlexible(content, targetShowEventDetail, replacementShowEventDetail);

// 9. Update renderMeetings
const targetRenderMeetings = `  // 3. Render Meeting Proposals Section
  function renderMeetings() {
    if (!meetingProposalsContainer) return;
    meetingProposalsContainer.innerHTML = '';

    const meetings = getMeetingInvitations();
    if (meetingCounterBadge) {
      meetingCounterBadge.textContent = \`\${meetings.length} Terjadwal\`;
    }

    if (meetings.length === 0) {
      meetingProposalsContainer.innerHTML = \`
        <div style="padding: 1.2rem; text-align: center; font-size: 0.82rem; color: var(--text-muted);">
          Belum ada undangan meeting jarak jauh aktif.
        </div>
      \`;
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

        responsesHtml += \`
          <div class="participant-response-pill">
            <span style="font-weight: 500; color: #f3e8ff;">\${name}</span>
            <span class="resp-badge \${badgeClass}">\${badgeText}</span>
          </div>
        \`;
      });

      // Show alternate time callout if any participant proposed one
      let altProposalBox = '';
      Object.entries(responses).forEach(([charKey, respObj]) => {
        if (respObj.status === 'proposed_alt') {
          const proposerName = getCharacterDisplayName(charKey).split(' ')[0];
          altProposalBox += \`
            <div class="alt-time-bubble">
              <strong>\${proposerName} mengusulkan:</strong> \${formatIndonesianDate(respObj.altDate)} pukul \${respObj.altTime}
              <div style="font-size: 0.7rem; opacity: 0.9; margin-top: 0.15rem;">"\${escapeHtml(respObj.note)}"</div>
            </div>
          \`;
        }
      });

      card.innerHTML = \`
        <div class="meeting-card-title">\${escapeHtml(meeting.title)}</div>
        <div class="meeting-meta-list">
          <div class="meeting-meta-item">
            <span>📅</span>
            <span>\${formatIndonesianDate(meeting.date)} • \${meeting.time} WIB</span>
          </div>
          <div class="meeting-meta-item">
            <span>🪐</span>
            <span>Platform: <strong>\${escapeHtml(meeting.location || 'Google Meet')}</strong></span>
          </div>
          <div class="meeting-meta-item">
            <span>👑</span>
            <span>Diajukan oleh: <strong>\${escapeHtml(meeting.proposerName)}</strong></span>
          </div>
        </div>

        \${meeting.description ? \`<p style="font-size: 0.78rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 0.5rem 0.7rem; border-radius: 8px; line-height: 1.4;">\${escapeHtml(meeting.description)}</p>\` : ''}

        <!-- Status Peserta -->
        <div class="meeting-responses-box">
          <div class="responses-header-row">
            <span>Respons Sahabat</span>
            <span style="font-size: 0.7rem; color: \${meeting.status === 'confirmed' ? '#86efac' : '#fef08a'};">
              \${meeting.status === 'confirmed' ? '✦ Terkonfirmasi' : '⏳ Proses Diskusi'}
            </span>
          </div>
          \${responsesHtml}
          \${altProposalBox}
        </div>

        <!-- Action Buttons for Current Viewing Character -->
        <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.3rem;">
          <div style="font-size: 0.72rem; color: #c4b5fd; font-weight: 500;">
            Status Responmu (\${getCharacterDisplayName(currentViewer).split(' ')[0]}):
            <strong style="color: #ffffff;">\${myResp.status === 'accepted' ? '✓ Setuju' : myResp.status === 'rejected' ? '✕ Menolak' : myResp.status === 'proposed_alt' ? '⇄ Mengusulkan Alternatif' : 'Menunggu responsmu'}</strong>
          </div>
          <div class="meeting-user-actions">
            <button type="button" class="btn-resp-acc" data-action="acc" data-id="\${meeting.id}" title="Setujui jadwal ini">
              ✓ Setuju
            </button>
            <button type="button" class="btn-resp-rej" data-action="rej" data-id="\${meeting.id}" title="Tolak dengan alasan">
              ✕ Tolak
            </button>
            <button type="button" class="btn-resp-alt" data-action="alt" data-id="\${meeting.id}" title="Usulkan tanggal atau jam lain">
              ⇄ Usul Lain
            </button>
          </div>
        </div>
      \`;`;

const replacementRenderMeetings = `  // 3. Render Meeting Proposals Section (Selective Invites & Dynamic Participants)
  function renderMeetings() {
    if (!meetingProposalsContainer) return;
    meetingProposalsContainer.innerHTML = '';

    const currentViewer = normalizeCharacterKey(getActiveUserCharacter());
    const meetings = getMeetingInvitations(currentViewer);
    if (meetingCounterBadge) {
      meetingCounterBadge.textContent = \`\${meetings.length} Terjadwal\`;
    }

    if (meetings.length === 0) {
      meetingProposalsContainer.innerHTML = \`
        <div style="padding: 1.2rem; text-align: center; font-size: 0.82rem; color: var(--text-muted);">
          Belum ada undangan meeting jarak jauh untuk \${getCharacterShortName(currentViewer)}.
        </div>
      \`;
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

        responsesHtml += \`
          <div class="participant-response-pill">
            <div class="participant-pill-identity">
              <img src="\${avatar}" alt="\${shortName}" class="participant-pill-avatar" />
              <span style="font-weight: 500; color: #f3e8ff; font-size: 0.78rem;">
                \${shortName} \${isParticipantHost ? '<span style="color: #fbbf24; font-size: 0.68rem; margin-left: 0.2rem;">(Host)</span>' : ''}
              </span>
            </div>
            <span class="resp-badge \${badgeClass}">\${badgeText}</span>
          </div>
        \`;
      });

      // Show alternate time callout if any participant proposed one
      let altProposalBox = '';
      Object.entries(responses).forEach(([charKey, respObj]) => {
        if (respObj && respObj.status === 'proposed_alt') {
          const proposerName = getCharacterShortName(charKey);
          altProposalBox += \`
            <div class="alt-time-bubble">
              <strong>\${proposerName} mengusulkan:</strong> \${formatIndonesianDate(respObj.altDate)} pukul \${respObj.altTime}
              <div style="font-size: 0.7rem; opacity: 0.9; margin-top: 0.15rem;">"\${escapeHtml(respObj.note)}"</div>
            </div>
          \`;
        }
      });

      const proposerAvatar = getCharacterAvatar(meeting.proposer);
      const proposerShortName = getCharacterShortName(meeting.proposer);
      const formattedDateTime = formatIndonesianMeetingDateTime(meeting.date, meeting.time);

      card.innerHTML = \`
        <div class="meeting-card-title">\${escapeHtml(meeting.title)}</div>
        <div class="meeting-meta-list">
          <div class="meeting-meta-item">
            <span>📅</span>
            <span><strong>\${formattedDateTime}</strong></span>
          </div>
          <div class="meeting-meta-item">
            <span>🪐</span>
            <span>Platform: <strong>\${escapeHtml(meeting.location || 'Google Meet')}</strong></span>
          </div>
          <div class="meeting-meta-item">
            <img src="\${proposerAvatar}" alt="\${proposerShortName}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.4);" />
            <span>Pengundang: <strong>\${escapeHtml(meeting.proposerName || proposerShortName)}</strong></span>
          </div>
        </div>

        \${meeting.description ? \`<p style="font-size: 0.78rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 0.5rem 0.7rem; border-radius: 8px; line-height: 1.4;">\${escapeHtml(meeting.description)}</p>\` : ''}

        <!-- Status Peserta -->
        <div class="meeting-responses-box">
          <div class="responses-header-row">
            <span>Peserta (\${participantsList.length} Sahabat)</span>
            <span style="font-size: 0.7rem; color: \${meeting.status === 'confirmed' ? '#86efac' : '#fef08a'};">
              \${meeting.status === 'confirmed' ? '✦ Terkonfirmasi' : '⏳ Proses Konfirmasi'}
            </span>
          </div>
          \${responsesHtml}
          \${altProposalBox}
        </div>

        <!-- Action Buttons for Current Viewing Character -->
        <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.3rem;">
          <div style="font-size: 0.72rem; color: #c4b5fd; font-weight: 500;">
            Status Responmu (\${getCharacterShortName(currentViewer)}):
            <strong style="color: #ffffff;">
              \${myResp.status === 'accepted' ? '✓ Setuju' : (myResp.status === 'rejected' || myResp.status === 'declined') ? '✕ Menolak' : myResp.status === 'proposed_alt' ? '⇄ Mengusulkan Alternatif' : 'Menunggu responsmu'}
            </strong>
          </div>
          <div class="meeting-user-actions">
            <button type="button" class="btn-resp-acc" data-action="acc" data-id="\${meeting.id}" title="Setujui jadwal ini">
              ✓ Setuju
            </button>
            <button type="button" class="btn-resp-rej" data-action="rej" data-id="\${meeting.id}" title="Tolak dengan alasan">
              ✕ Menolak
            </button>
            <button type="button" class="btn-resp-alt" data-action="alt" data-id="\${meeting.id}" title="Usulkan tanggal atau jam lain">
              ⇄ Usul Lain
            </button>
          </div>
        </div>
      \`;`;

content = replaceFlexible(content, targetRenderMeetings, replacementRenderMeetings);

// 10. Add Notification Modal & Bell Handler + Update renderAll
const targetRenderAll = `  // Master re-render function
  function renderAll() {
    renderHeader();
    renderSelectedDayEvents();
    renderCalendar();
    renderMeetings();
    renderUpcoming();
  }`;

const replacementRenderAll = `  // Orbit Notifications Bell & Modal Controller
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
      notifViewerInfo.textContent = \`Notifikasi untuk \${getCharacterShortName(viewer)} (\${getCharacterUniverse(viewer)})\`;
    }

    if (orbitNotificationsList) {
      orbitNotificationsList.innerHTML = '';
      if (notifs.length === 0) {
        orbitNotificationsList.innerHTML = \`
          <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            <span>🔔</span>
            <p style="margin-top: 0.5rem;">Belum ada notifikasi meeting baru untuk \${getCharacterShortName(viewer)}.</p>
          </div>
        \`;
        return;
      }

      notifs.forEach(n => {
        const item = document.createElement('div');
        item.className = \`orbit-notif-card \${!n.read ? 'unread' : ''}\`;
        const proposerAvatar = getCharacterAvatar(n.proposer);
        const meetingDateFormatted = formatIndonesianMeetingDateTime(n.meetingDate, n.meetingTime);

        item.innerHTML = \`
          <img src="\${proposerAvatar}" alt="\${n.proposerName}" class="orbit-notif-avatar" />
          <div class="orbit-notif-content">
            <div class="orbit-notif-title">\${escapeHtml(n.meetingTitle || 'Undangan Meeting')}</div>
            <div class="orbit-notif-desc">\${escapeHtml(n.message || '')}</div>
            <div class="orbit-notif-time">📅 \${meetingDateFormatted}</div>
            <button type="button" class="btn-notif-view-meeting" data-meeting-id="\${n.meetingId}">
              Buka Detail Meeting →
            </button>
          </div>
        \`;

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
  }`;

content = replaceFlexible(content, targetRenderAll, replacementRenderAll);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated orbit_view.js for equal access & selective meeting invitations!');

