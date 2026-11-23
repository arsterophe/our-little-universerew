const http = require('http');

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

const tokenNyanya = makeJwt('uid_nyanya_alenda', 'nyanya@ourlittleuniverse.com', true);
const tokenLala = makeJwt('uid_lala_bella', 'lala@ourlittleuniverse.com', true);
const tokenLele = makeJwt('uid_lele_vanya', 'lele@ourlittleuniverse.com', true);

async function runEdgeCaseTests() {
  console.log('================================================================');
  console.log('FINAL EDGE-CASE SECURITY CHECK: RESPONSES MAP STRUCTURE');
  console.log('================================================================');

  // Baseline meeting seeded by Nyanya with both Nyanya & Lele present initially
  const baselineSeed = await fetch(`${BASE_URL}/orbit_events/evt-edge-case-meeting`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        title: { stringValue: 'Meeting Akhir Pekan' },
        date: { stringValue: '2026-11-28' },
        time: { stringValue: '18:00' },
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
              },
              lele: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'tentative' },
                    uid: { stringValue: 'uid_lele_vanya' },
                    note: { stringValue: 'Sedang cek jadwal' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('Baseline meeting seed status:', baselineSeed.status, baselineSeed.status === 200 ? 'OK' : 'FAIL');

  const baselineNyanya = {
    status: { stringValue: 'accepted' },
    uid: { stringValue: 'uid_nyanya_alenda' },
    note: { stringValue: 'Pengaju meeting' }
  };
  const baselineLele = {
    status: { stringValue: 'tentative' },
    uid: { stringValue: 'uid_lele_vanya' },
    note: { stringValue: 'Sedang cek jadwal' }
  };

  // 1. Lala mengirim RSVP valid tetapi menyisipkan key 'hacker' di map responses
  console.log('\n--- UJI 1: Lala menyisipkan key "hacker" di map responses ---');
  const res1 = await fetch(`${BASE_URL}/orbit_events/evt-edge-case-meeting?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanya } },
              lele: { mapValue: { fields: baselineLele } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' },
                    note: { stringValue: 'Gas pol!' }
                  }
                }
              },
              hacker: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_hacker_evil' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('Hasil Uji 1 -> Status:', res1.status, res1.status === 403 ? 'BLOCKED (403 PERMISSION_DENIED) [PASSED]' : 'FAILED');

  // 2. Lala menyisipkan key 'admin' di map responses
  console.log('\n--- UJI 2: Lala menyisipkan key "admin" di map responses ---');
  const res2 = await fetch(`${BASE_URL}/orbit_events/evt-edge-case-meeting?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanya } },
              lele: { mapValue: { fields: baselineLele } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' }
                  }
                }
              },
              admin: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('Hasil Uji 2 -> Status:', res2.status, res2.status === 403 ? 'BLOCKED (403 PERMISSION_DENIED) [PASSED]' : 'FAILED');

  // 3. Lala menghapus key Lele
  console.log('\n--- UJI 3: Lala menghapus key Lele dari map responses ---');
  const res3 = await fetch(`${BASE_URL}/orbit_events/evt-edge-case-meeting?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanya } },
              // lele is omitted / deleted by Lala
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('Hasil Uji 3 -> Status:', res3.status, res3.status === 403 ? 'BLOCKED (403 PERMISSION_DENIED) [PASSED]' : 'FAILED');

  // 4. Lala mengubah respons Nyanya
  console.log('\n--- UJI 4: Lala mengubah respons Nyanya ---');
  const res4 = await fetch(`${BASE_URL}/orbit_events/evt-edge-case-meeting?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'declined' }, // Tampered by Lala
                    uid: { stringValue: 'uid_nyanya_alenda' },
                    note: { stringValue: 'Pengaju meeting' }
                  }
                }
              },
              lele: { mapValue: { fields: baselineLele } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('Hasil Uji 4 -> Status:', res4.status, res4.status === 403 ? 'BLOCKED (403 PERMISSION_DENIED) [PASSED]' : 'FAILED');

  // 5. Lala mengirim RSVP normal tanpa key tambahan
  console.log('\n--- UJI 5: Lala mengirim RSVP normal tanpa key tambahan ---');
  const res5 = await fetch(`${BASE_URL}/orbit_events/evt-edge-case-meeting?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanya } },
              lele: { mapValue: { fields: baselineLele } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' },
                    email: { stringValue: 'lala@ourlittleuniverse.com' },
                    note: { stringValue: 'Siap hadir!' },
                    respondedAt: { stringValue: '2026-11-07T09:15:00Z' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('Hasil Uji 5 -> Status:', res5.status, res5.status === 200 ? 'ALLOWED (200 OK) [PASSED]' : 'FAILED');

  // 6. Pastikan Nyanya, Lala, dan Lele tetap dapat mengirim RSVP yang sah, dan transisi ke confirmed
  console.log('\n--- UJI 6: Lele mengirim RSVP accepted -> Transisi otomatis ke confirmed ---');
  const lalaAcceptedResponse = {
    status: { stringValue: 'accepted' },
    uid: { stringValue: 'uid_lala_bella' },
    email: { stringValue: 'lala@ourlittleuniverse.com' },
    note: { stringValue: 'Siap hadir!' },
    respondedAt: { stringValue: '2026-11-07T09:15:00Z' }
  };

  const res6 = await fetch(`${BASE_URL}/orbit_events/evt-edge-case-meeting?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLele}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'confirmed' }, // all 3 are accepted!
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanya } },
              lala: { mapValue: { fields: lalaAcceptedResponse } },
              lele: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lele_vanya' },
                    email: { stringValue: 'lele@ourlittleuniverse.com' },
                    note: { stringValue: 'Semua oke, konfirmasi!' },
                    respondedAt: { stringValue: '2026-11-07T09:16:00Z' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('Hasil Uji 6 -> Status:', res6.status, res6.status === 200 ? 'ALLOWED (200 OK - CONFIRMED) [PASSED]' : 'FAILED');

  // 7. Pengaju mengedit & membatalkan meeting
  console.log('\n--- UJI 7: Pengaju mengedit & membatalkan meeting ---');
  const res7 = await fetch(`${BASE_URL}/orbit_events/evt-edge-case-meeting`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        title: { stringValue: 'Meeting Akhir Pekan (Diperbarui)' },
        date: { stringValue: '2026-11-29' },
        time: { stringValue: '19:00' },
        category: { stringValue: 'meeting' },
        proposer: { stringValue: 'nyanya' },
        proposerUid: { stringValue: 'uid_nyanya_alenda' },
        participants: {
          arrayValue: {
            values: [{ stringValue: 'nyanya' }, { stringValue: 'lala' }, { stringValue: 'lele' }]
          }
        },
        status: { stringValue: 'cancelled' },
        description: { stringValue: 'Jadwal diubah oleh pengaju' }
      }
    })
  });
  console.log('Hasil Uji 7 -> Status:', res7.status, res7.status === 200 ? 'ALLOWED (200 OK - PROPOSER CANCELLED) [PASSED]' : 'FAILED');

  console.log('\n================================================================');
  console.log('SEMUA PENGUJIAN EDGE-CASE RESPONSES MAP SELESAI');
  console.log('================================================================');
}

runEdgeCaseTests().catch(console.error);

