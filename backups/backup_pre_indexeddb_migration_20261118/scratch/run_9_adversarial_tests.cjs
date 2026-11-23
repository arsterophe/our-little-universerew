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

async function run() {
  console.log('=== SEEDING BASELINE MEETING FOR ADVERSARIAL TESTS ===');
  
  // 1. Seed meeting created by Nyanya
  const seedRes = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        title: { stringValue: 'Meeting Perencanaan Universe' },
        date: { stringValue: '2026-11-20' },
        time: { stringValue: '19:00' },
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
  console.log('Seed meeting response:', seedRes.status, seedRes.status === 200 ? 'OK' : 'FAILED');

  const baselineNyanyaResponse = {
    status: { stringValue: 'accepted' },
    uid: { stringValue: 'uid_nyanya_alenda' },
    note: { stringValue: 'Pengaju meeting' }
  };

  // 1. Menambahkan isAdmin: true pada objek respons (Lala mencoba inject privilege)
  console.log('\n--- UJI 1: Menambahkan isAdmin: true pada objek respons ---');
  const test1 = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanyaResponse } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' },
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
  console.log('UJI 1 Result -> Status HTTP:', test1.status, test1.status === 403 ? 'BLOCKED (PERMISSION_DENIED) [PASSED]' : 'UNEXPECTED');

  // 2. Menambahkan field yang tidak dikenal pada objek respons
  console.log('\n--- UJI 2: Menambahkan field yang tidak dikenal pada objek respons ---');
  const test2 = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanyaResponse } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' },
                    arbitraryProp: { stringValue: 'injected_value' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('UJI 2 Result -> Status HTTP:', test2.status, test2.status === 403 ? 'BLOCKED (PERMISSION_DENIED) [PASSED]' : 'UNEXPECTED');

  // 3. Mengubah email pada objek respons menjadi email karakter lain
  console.log('\n--- UJI 3: Mengubah email pada objek respons menjadi email karakter lain ---');
  const test3 = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanyaResponse } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' },
                    email: { stringValue: 'nyanya@ourlittleuniverse.com' } // Spoofed email
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('UJI 3 Result -> Status HTTP:', test3.status, test3.status === 403 ? 'BLOCKED (PERMISSION_DENIED) [PASSED]' : 'UNEXPECTED');

  // 4. Mengubah UID respons menjadi UID orang lain
  console.log('\n--- UJI 4: Mengubah UID respons menjadi UID orang lain ---');
  const test4 = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanyaResponse } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lele_vanya' } // Lala impersonating Lele's UID
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('UJI 4 Result -> Status HTTP:', test4.status, test4.status === 403 ? 'BLOCKED (PERMISSION_DENIED) [PASSED]' : 'UNEXPECTED');

  // 5. Mengubah respons karakter lain (Lala tries to alter Nyanya's response)
  console.log('\n--- UJI 5: Mengubah respons karakter lain ---');
  const test5 = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
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
                    status: { stringValue: 'declined' }, // Tampered Nyanya response
                    uid: { stringValue: 'uid_nyanya_alenda' },
                    note: { stringValue: 'Pengaju meeting' }
                  }
                }
              },
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
  console.log('UJI 5 Result -> Status HTTP:', test5.status, test5.status === 403 ? 'BLOCKED (PERMISSION_DENIED) [PASSED]' : 'UNEXPECTED');

  // 6. Menghapus respons sendiri
  console.log('\n--- UJI 6: Menghapus respons sendiri ---');
  const test6 = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanyaResponse } }
              // lala response omitted (deleted)
            }
          }
        }
      }
    })
  });
  console.log('UJI 6 Result -> Status HTTP:', test6.status, test6.status === 403 ? 'BLOCKED (PERMISSION_DENIED) [PASSED]' : 'UNEXPECTED');

  // 7. Menghapus field status meeting (updateMask targets status but status is deleted/omitted)
  console.log('\n--- UJI 7: Menghapus field status meeting ---');
  const test7 = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        // status is completely deleted / omitted
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanyaResponse } },
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
  console.log('UJI 7 Result -> Status HTTP:', test7.status, test7.status === 403 ? 'BLOCKED (PERMISSION_DENIED) [PASSED]' : 'UNEXPECTED');

  // 8. RSVP sah dengan akun terverifikasi
  console.log('\n--- UJI 8: RSVP sah dengan akun terverifikasi ---');
  const test8 = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test?updateMask.fieldPaths=responses&updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'pending' },
        updatedAt: { stringValue: new Date().toISOString() },
        responses: {
          mapValue: {
            fields: {
              nyanya: { mapValue: { fields: baselineNyanyaResponse } },
              lala: {
                mapValue: {
                  fields: {
                    status: { stringValue: 'accepted' },
                    uid: { stringValue: 'uid_lala_bella' },
                    email: { stringValue: 'lala@ourlittleuniverse.com' },
                    note: { stringValue: 'Siap hadir tepat waktu!' },
                    respondedAt: { stringValue: '2026-11-07T08:00:00Z' }
                  }
                }
              }
            }
          }
        }
      }
    })
  });
  console.log('UJI 8 Result -> Status HTTP:', test8.status, test8.status === 200 ? 'ALLOWED (SUCCESS) [PASSED]' : 'UNEXPECTED');

  // 9. Pengaju mengubah dan membatalkan meeting miliknya
  console.log('\n--- UJI 9: Pengaju mengubah dan membatalkan meeting miliknya ---');
  const test9 = await fetch(`${BASE_URL}/orbit_events/evt-adversarial-test`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        title: { stringValue: 'Meeting Perencanaan Universe (Rescheduled)' },
        date: { stringValue: '2026-11-25' },
        time: { stringValue: '20:30' },
        category: { stringValue: 'meeting' },
        proposer: { stringValue: 'nyanya' },
        proposerUid: { stringValue: 'uid_nyanya_alenda' },
        participants: {
          arrayValue: {
            values: [{ stringValue: 'nyanya' }, { stringValue: 'lala' }, { stringValue: 'lele' }]
          }
        },
        status: { stringValue: 'cancelled' },
        description: { stringValue: 'Dibatalkan oleh pengaju karena ada kendala jadwal' }
      }
    })
  });
  console.log('UJI 9 Result -> Status HTTP:', test9.status, test9.status === 200 ? 'ALLOWED (SUCCESS) [PASSED]' : 'UNEXPECTED');

  console.log('\n=== SELESAI PENGUJIAN 9 SKENARIO ===');
}

run().catch(console.error);
