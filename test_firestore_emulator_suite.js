/**
 * OUR LITTLE UNIVERSE — FINAL PATCH REVIEW EMULATOR TEST SUITE
 * 
 * Verifies all finalized Firestore Security Rules on the real Cloud Firestore Emulator:
 * Section A: Email Verification & Character Binding
 *   1. Unverified character email (email_verified: false) tries RSVP -> 403 Forbidden
 *   2. Verified character email (email_verified: true) performs valid RSVP -> 200 OK
 *   3. Foreign account tries to RSVP as character -> 403 Forbidden
 *   4. Lala tries to RSVP as Lele -> 403 Forbidden
 * Section B: Meeting Status Integrity
 *   5. Participant tries to delete status field -> 403 Forbidden
 *   6. Participant tries to send empty status -> 403 Forbidden
 *   7. Participant tries to send invalid status ('super_confirmed') -> 403 Forbidden
 *   8. Participant tries to forge confirmed while not all accepted -> 403 Forbidden
 *   9. Participant tries to set status to cancelled -> 403 Forbidden
 *   10. Participant tries to revert confirmed meeting to pending -> 403 Forbidden
 * Section C: Response Object Validation & Manipulation
 *   11. Participant tries to delete their own response -> 403 Forbidden
 *   12. Participant tries to delete another character's response -> 403 Forbidden
 *   13. Participant sends response with extra properties -> 403 Forbidden
 *   14. Participant tries to tamper core title field -> 403 Forbidden
 * Section D: Proposer Rights & Other Features
 *   15. Proposer updates meeting details (title, time) -> 200 OK
 *   16. Proposer cancels their meeting (status: 'cancelled') -> 200 OK
 *   17. Anonymous user tries to RSVP -> 403 Forbidden
 *   18. Proposer deletes meeting -> 200 OK
 *   19. Personal agenda privacy -> 200 / 403
 *   20. Stories queries & draft isolation -> 200 / 403
 *   21. Moments queries & privacy isolation -> 200 / 403
 *   22. User profile protections -> 200 / 403
 *   23. Default deny on arbitrary collections -> 403
 */

function makeJwt(uid, email, emailVerified = true) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: uid,
    user_id: uid,
    email: email,
    email_verified: emailVerified,
    iss: 'https://securetoken.google.com/our-little-universe-dcd75',
    aud: 'our-little-universe-dcd75',
    auth_time: 1700000000,
    iat: 1700000000,
    exp: 1900000000
  })).toString('base64url');
  return `${header}.${payload}.`;
}

const BASE_URL = 'http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`✗ FAIL: ${message}`);
  }
}

async function runFinalPatchReviewTestSuite() {
  console.log('================================================================');
  console.log('CLOUDFIRESTORE EMULATOR FINAL PATCH REVIEW TEST SUITE');
  console.log('================================================================');

  const tokenNyanya = makeJwt('uid_nyanya_alenda', 'nyanya@ourlittleuniverse.com', true);
  const tokenLalaVerified = makeJwt('uid_lala_bella', 'lala@ourlittleuniverse.com', true);
  const tokenLalaUnverified = makeJwt('uid_lala_bella', 'lala@ourlittleuniverse.com', false);
  const tokenLele = makeJwt('uid_lele_vanya', 'lele@ourlittleuniverse.com', true);
  const tokenStranger = makeJwt('uid_stranger_guest', 'stranger@example.com', true);

  // ---------------------------------------------------------------
  // 1. PERSONAL AGENDA ISOLATION
  // ---------------------------------------------------------------
  console.log('\n--- 1. Testing Personal Agenda Privacy ---');
  
  const createPersonal = await fetch(`${BASE_URL}/orbit_events/evt-personal-patch`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        title: { stringValue: 'Tugas Kuliah Rahasia Alenda' },
        date: { stringValue: '2026-10-18' },
        category: { stringValue: 'personal' },
        proposerUid: { stringValue: 'uid_nyanya_alenda' }
      }
    })
  });
  assert(createPersonal.status === 200, 'Nyanya creates personal event (Status 200)');

  const readNyanya = await fetch(`${BASE_URL}/orbit_events/evt-personal-patch`, {
    headers: { 'Authorization': `Bearer ${tokenNyanya}` }
  });
  assert(readNyanya.status === 200, 'Nyanya allowed to read her own personal event (Status 200)');

  const readLala = await fetch(`${BASE_URL}/orbit_events/evt-personal-patch`, {
    headers: { 'Authorization': `Bearer ${tokenLalaVerified}` }
  });
  assert(readLala.status === 403, 'Lala BLOCKED from reading Nyanya personal event (Status 403 Forbidden)');

  // ---------------------------------------------------------------
  // 2. MEETING SEED & SECTION A: EMAIL VERIFICATION
  // ---------------------------------------------------------------
  console.log('\n--- 2. Testing Section A: Email Verification & Character Binding ---');

  // Nyanya creates meeting
  const createMeeting = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        title: { stringValue: 'Meeting Catch-Up & Perencanaan Akhir Tahun' },
        date: { stringValue: '2026-10-22' },
        time: { stringValue: '20:00' },
        category: { stringValue: 'meeting' },
        proposer: { stringValue: 'nyanya' },
        proposerUid: { stringValue: 'uid_nyanya_alenda' },
        participants: {
          arrayValue: {
            values: [{ stringValue: 'nyanya' }, { stringValue: 'lala' }, { stringValue: 'lele' }]
          }
        },
        status: { stringValue: 'pending' },
        responses: {
          mapValue: {
            fields: {
              nyanya: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_nyanya_alenda' },
                    note: { stringValue: 'Pengaju meeting' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  assert(createMeeting.status === 200, 'Baseline meeting created by Nyanya (Status 200)');

  // [TEST A-1] Akun karakter dengan email belum terverifikasi (email_verified: false) mencoba RSVP
  const testA1Unverified = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaUnverified}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' } } } },
              lala: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lala_bella' } } } }
            }
          }
        }
      }
    })
  });
  assert(testA1Unverified.status === 403, '[TEST A-1] Unverified character email BLOCKED from RSVP (Status 403 Forbidden)');

  // [TEST A-2] Akun karakter dengan email terverifikasi (email_verified: true) melakukan RSVP yang sah
  const testA2Verified = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        responses: {
          mapValue: {
            fields: {
              nyanya: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_nyanya_alenda' },
                    note: { stringValue: 'Pengaju meeting' }
                  }
                }
              },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' },
                    note: { stringValue: 'Gas pol!' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  assert(testA2Verified.status === 200, '[TEST A-2] Verified character email ALLOWED to perform valid RSVP (Status 200)');

  // [TEST A-3] Akun asing mencoba RSVP sebagai Lala
  const testA3Stranger = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenStranger}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' } } } },
              lala: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_stranger_guest' } } } }
            }
          }
        }
      }
    })
  });
  assert(testA3Stranger.status === 403, '[TEST A-3] Foreign account BLOCKED from RSVP as Lala (Status 403 Forbidden)');

  // [TEST A-4] Lala mencoba RSVP sebagai Lele
  const testA4LalaAsLele = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' } } } },
              lala: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lala_bella' } } } },
              lele: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lala_bella' } } } }
            }
          }
        }
      }
    })
  });
  assert(testA4LalaAsLele.status === 403, '[TEST A-4] Lala BLOCKED from RSVP as Lele (Status 403 Forbidden)');

  // ---------------------------------------------------------------
  // 3. SECTION B: STATUS VALIDATION INTEGRITY
  // ---------------------------------------------------------------
  console.log('\n--- 3. Testing Section B: Meeting Status Integrity ---');

  // [TEST B-1] Peserta mencoba menghapus field status (updateMask only responses)
  const testB1DeleteStatus = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLele}` },
    body: JSON.stringify({
      fields: {
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' }, note: { stringValue: 'Pengaju meeting' } } } },
              lala: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lala_bella' }, note: { stringValue: 'Gas pol!' } } } },
              lele: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lele_vanya' }, note: { stringValue: 'Semua oke!' } } } }
            }
          }
        }
      }
    })
  });
  assert(testB1DeleteStatus.status === 403, '[TEST B-1] Participant BLOCKED from omitting status field (Status 403 Forbidden)');

  // [TEST B-2] Peserta mencoba mengirim status kosong
  const testB2EmptyStatus = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLele}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: '' },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' }, note: { stringValue: 'Pengaju meeting' } } } },
              lala: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lala_bella' }, note: { stringValue: 'Gas pol!' } } } },
              lele: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lele_vanya' }, note: { stringValue: 'Semua oke!' } } } }
            }
          }
        }
      }
    })
  });
  assert(testB2EmptyStatus.status === 403, '[TEST B-2] Participant BLOCKED from sending empty status string (Status 403 Forbidden)');

  // [TEST B-3] Peserta mencoba mengirim status tidak valid ('super_confirmed')
  const testB3InvalidStatus = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLele}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'super_confirmed' },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' }, note: { stringValue: 'Pengaju meeting' } } } },
              lala: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lala_bella' }, note: { stringValue: 'Gas pol!' } } } },
              lele: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lele_vanya' }, note: { stringValue: 'Semua oke!' } } } }
            }
          }
        }
      }
    })
  });
  assert(testB3InvalidStatus.status === 403, '[TEST B-3] Participant BLOCKED from sending invalid status string (Status 403 Forbidden)');

  // [TEST B-4] Peserta mencoba memalsukan confirmed saat Lele proposed_alt
  const testB4ForgeConfirmed = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLele}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'confirmed' }, // Not all accepted yet!
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' } } } },
              lala: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lala_bella' } } } },
              lele: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'proposed_alt' },
                    uid: { stringValue: 'uid_lele_vanya' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  assert(testB4ForgeConfirmed.status === 403, '[TEST B-4] Participant BLOCKED from forging confirmed status before all accept (Status 403 Forbidden)');

  // [TEST B-5] Peserta mencoba mengubah status meeting menjadi cancelled
  const testB5ForgeCancelled = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLele}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'cancelled' },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' } } } },
              lala: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lala_bella' } } } },
              lele: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'declined' },
                    uid: { stringValue: 'uid_lele_vanya' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  assert(testB5ForgeCancelled.status === 403, '[TEST B-5] Participant BLOCKED from setting status to cancelled (Status 403 Forbidden)');

  // Legitimate: Lele accepts -> All 3 accepted -> Status confirmed
  const testLegitimateConfirm = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLele}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'confirmed' },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' }, note: { stringValue: 'Pengaju meeting' } } } },
              lala: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lala_bella' }, note: { stringValue: 'Gas pol!' } } } },
              lele: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lele_vanya' }, note: { stringValue: 'Semua oke!' } } } }
            }
          }
        }
      }
    })
  });
  assert(testLegitimateConfirm.status === 200, 'Legitimate: Lele accepts -> All 3 accepted -> Meeting confirmed (Status 200)');

  // [TEST B-6] Peserta mencoba mengembalikan status confirmed menjadi pending saat semua masih accepted
  const testB6RevertToPending = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      fields: { status: { stringValue: 'pending' } }
    })
  });
  assert(testB6RevertToPending.status === 403, '[TEST B-6] Participant BLOCKED from reverting confirmed meeting to pending (Status 403 Forbidden)');

  // ---------------------------------------------------------------
  // 4. SECTION C: RESPONSE OBJECT VALIDATION & MANIPULATION
  // ---------------------------------------------------------------
  console.log('\n--- 4. Testing Section C: Response Object Validation & Manipulation ---');

  // [TEST C-1] Peserta mencoba menghapus respons miliknya sendiri
  const testC1DeleteOwnResp = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' } } } },
              lele: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lele_vanya' } } } }
              // lala is deleted!
            }
          }
        }
      }
    })
  });
  assert(testC1DeleteOwnResp.status === 403, '[TEST C-1] Participant BLOCKED from deleting their own response entry (Status 403 Forbidden)');

  // [TEST C-2] Peserta mencoba menghapus respons karakter lain
  const testC2DeleteOtherResp = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        responses: {
          mapValue: {
            fields: {
              lala: { mapValue: { fields: { status: { stringValue: 'declined' }, uid: { stringValue: 'uid_lala_bella' } } } },
              lele: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lele_vanya' } } } }
              // nyanya is deleted!
            }
          }
        }
      }
    })
  });
  assert(testC2DeleteOtherResp.status === 403, '[TEST C-2] Participant BLOCKED from deleting another character response (Status 403 Forbidden)');

  // [TEST C-3] Peserta mengirim respons dengan properti tambahan yang tidak diizinkan
  const testC3ExtraProps = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=responses&updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_nyanya_alenda' } } } },
              lele: { mapValue: { fields: { status: { stringValue: 'accepted' }, uid: { stringValue: 'uid_lele_vanya' } } } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'declined' },
                    uid: { stringValue: 'uid_lala_bella' },
                    extraProp: { booleanValue: true },
                    isAdmin: { booleanValue: true }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  assert(testC3ExtraProps.status === 403, '[TEST C-3] Participant BLOCKED from injecting extra properties (Status 403 Forbidden)');

  // [TEST C-4] Peserta mencoba mengubah data inti meeting (title)
  const testC4TamperTitle = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=title`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      fields: { title: { stringValue: 'Meeting Hijacked by Lala!' } }
    })
  });
  assert(testC4TamperTitle.status === 403, '[TEST C-4] Participant BLOCKED from altering meeting core title (Status 403 Forbidden)');

  // ---------------------------------------------------------------
  // 5. SECTION D: PROPOSER MANAGEMENT & OTHER ACCESS
  // ---------------------------------------------------------------
  console.log('\n--- 5. Testing Section D: Proposer Rights & Other Access ---');

  // [TEST D-1] Pengaju mengubah data meeting miliknya sendiri (title, time, location)
  const testD1ProposerEdit = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=title&updateMask.fieldPaths=time`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        title: { stringValue: 'Meeting Catch-Up & Perencanaan Akhir Tahun (Rescheduled)' },
        time: { stringValue: '21:30' }
      }
    })
  });
  assert(testD1ProposerEdit.status === 200, '[TEST D-1] Proposer ALLOWED to reschedule meeting details (Status 200)');

  // [TEST D-2] Pengaju membatalkan meeting miliknya (status: 'cancelled')
  const testD2ProposerCancel = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: { status: { stringValue: 'cancelled' } }
    })
  });
  assert(testD2ProposerCancel.status === 200, '[TEST D-2] Proposer ALLOWED to cancel their own meeting (Status 200)');

  // [TEST D-3] Pengguna anonim mencoba melakukan RSVP
  const testD3AnonRsvp = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch?updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: { status: { stringValue: 'confirmed' } }
    })
  });
  assert(testD3AnonRsvp.status === 403, '[TEST D-3] Anonymous user BLOCKED from modifying meeting (Status 403 Forbidden)');

  // [TEST D-4] Pengaju menghapus meeting miliknya
  const testD4ProposerDelete = await fetch(`${BASE_URL}/orbit_events/evt-meeting-patch`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenNyanya}` }
  });
  assert(testD4ProposerDelete.status === 200, '[TEST D-4] Proposer ALLOWED to delete their meeting (Status 200)');

  // ---------------------------------------------------------------
  // 6. STORIES, MOMENTS & PROFILES REGRESSIONS
  // ---------------------------------------------------------------
  console.log('\n--- 6. Testing Stories, Moments, Profiles Regressions ---');

  // Stories query test
  const queryPublished = await fetch(`${BASE_URL}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'stories' }],
        where: {
          fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } }
        }
      }
    })
  });
  assert(queryPublished.status === 200, 'Lala allowed to query published stories (Status 200)');

  const queryDraftsForbidden = await fetch(`${BASE_URL}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'stories' }],
        where: {
          fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'draft' } }
        }
      }
    })
  });
  assert(queryDraftsForbidden.status === 403, 'Lala BLOCKED from querying draft stories of all users (Status 403 Forbidden)');

  // Moments query test
  const queryFriendsMoments = await fetch(`${BASE_URL}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'moments' }],
        where: {
          fieldFilter: { field: { fieldPath: 'visibility' }, op: 'EQUAL', value: { stringValue: 'friends' } }
        }
      }
    })
  });
  assert(queryFriendsMoments.status === 200, 'Lala allowed to query friends moments (Status 200)');

  const queryPrivateMomentsForbidden = await fetch(`${BASE_URL}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'moments' }],
        where: {
          fieldFilter: { field: { fieldPath: 'visibility' }, op: 'EQUAL', value: { stringValue: 'private' } }
        }
      }
    })
  });
  assert(queryPrivateMomentsForbidden.status === 403, 'Lala BLOCKED from querying private moments globally (Status 403 Forbidden)');

  // Profile protection test
  const lalaTamperProfile = await fetch(`${BASE_URL}/users/uid_nyanya_alenda`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLalaVerified}` },
    body: JSON.stringify({
      fields: { name: { stringValue: 'Hacked by Lala' } }
    })
  });
  assert(lalaTamperProfile.status === 403, 'Lala BLOCKED from tampering Nyanya profile (Status 403 Forbidden)');

  // Default deny test
  const arbitraryWrite = await fetch(`${BASE_URL}/secret_vault/doc1`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({ fields: { leak: { booleanValue: true } } })
  });
  assert(arbitraryWrite.status === 403, 'Default deny blocks arbitrary path (Status 403 Forbidden)');

  console.log('\n================================================================');
  console.log(`FINAL PATCH REVIEW RESULTS: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFinalPatchReviewTestSuite();
