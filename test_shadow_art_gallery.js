import assert from 'node:assert';
import fs from 'node:fs';
import {
  SHADOW_LOCATIONS,
  KIDULT_LOCATIONS,
  TOYOU_LOCATIONS
} from './universes_view.js';
import {
  ARTWORK_STATUSES,
  DEFAULT_COLLECTIONS,
  validateArtworkImageInput,
  loadArtGalleryStore,
  getCollections,
  getExhibitionArtworks,
  getStudioArtworks,
  getArtworkById,
  getFavoriteMasterpiece,
  getArtworkCounts,
  saveArtworkItem,
  updateArtworkStatus,
  moveArtworkToCollection,
  reorderArtwork,
  deleteArtworkItem,
  setFavoriteMasterpiece,
  createCustomCollection,
  renameCollection,
  deleteCustomCollection,
  reorderCollection,
  getGalleryStorageDiagnostics,
  auditLegacyCloudStorageArtworks,
  markArtworkImageLoadError,
  setIndexedDBProviderForTest,
  clearMemoryGalleryStoreForTest
} from './shadow_art_gallery.js';

let passed = 0;
let total = 0;

function check(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(message);
  }
}

// ============================================================================
// DETERMINISTIC IN-MEMORY INDEXEDDB + LOCALSTORAGE + OBJECTURL TEST HARNESS
// ============================================================================
function createMockStorageEnvironment() {
  const databases = new Map();
  let simulateQuotaError = false;
  let objectUrlSeq = 0;
  const activeObjectUrls = new Map();
  const revokedObjectUrls = [];
  const lsMap = new Map();

  function makeMockIndexedDB() {
    return {
      open(dbName, version = 1) {
        const req = {
          result: null,
          error: null,
          onupgradeneeded: null,
          onsuccess: null,
          onerror: null
        };

        queueMicrotask(() => {
          let dbState = databases.get(dbName);
          const needsUpgrade = !dbState || dbState.version < version;
          if (!dbState) {
            dbState = { version, stores: new Map() };
            databases.set(dbName, dbState);
          }

          const dbHandle = {
            name: dbName,
            version,
            objectStoreNames: {
              contains: (s) => dbState.stores.has(s)
            },
            createObjectStore(storeName, opts = {}) {
              if (!dbState.stores.has(storeName)) {
                dbState.stores.set(storeName, {
                  keyPath: opts.keyPath || 'id',
                  records: new Map(),
                  indexes: new Map()
                });
              }
              const s = dbState.stores.get(storeName);
              return {
                createIndex(idxName, keyPath) {
                  s.indexes.set(idxName, keyPath);
                }
              };
            },
            transaction(storeNames) {
              const names = Array.isArray(storeNames) ? storeNames : [storeNames];
              const tx = {
                error: null,
                oncomplete: null,
                onerror: null,
                onabort: null,
                abort() {
                  queueMicrotask(() => {
                    if (typeof tx.onabort === 'function') tx.onabort({ target: tx });
                  });
                },
                objectStore(name) {
                  if (!names.includes(name) || !dbState.stores.has(name)) {
                    throw new Error(`ObjectStore ${name} missing`);
                  }
                  const s = dbState.stores.get(name);
                  return {
                    put(record) {
                      if (simulateQuotaError && name === 'artwork_files') {
                        const qErr = new Error('QuotaExceededError: Storage quota exceeded');
                        qErr.name = 'QuotaExceededError';
                        tx.error = qErr;
                        queueMicrotask(() => {
                          if (typeof tx.onerror === 'function') tx.onerror({ target: tx });
                        });
                        return {};
                      }
                      const key = record[s.keyPath];
                      s.records.set(key, record);
                      queueMicrotask(() => {
                        if (typeof tx.oncomplete === 'function') tx.oncomplete({ target: tx });
                      });
                      return {};
                    },
                    delete(key) {
                      s.records.delete(key);
                      queueMicrotask(() => {
                        if (typeof tx.oncomplete === 'function') tx.oncomplete({ target: tx });
                      });
                      return {};
                    },
                    get(key) {
                      const getReq = { result: s.records.get(key) || undefined, onsuccess: null, onerror: null };
                      queueMicrotask(() => {
                        if (typeof getReq.onsuccess === 'function') getReq.onsuccess({ target: getReq });
                        if (typeof tx.oncomplete === 'function') tx.oncomplete({ target: tx });
                      });
                      return getReq;
                    },
                    getAll() {
                      const list = Array.from(s.records.values());
                      const allReq = { result: list, onsuccess: null, onerror: null };
                      queueMicrotask(() => {
                        if (typeof allReq.onsuccess === 'function') allReq.onsuccess({ target: allReq });
                        if (typeof tx.oncomplete === 'function') tx.oncomplete({ target: tx });
                      });
                      return allReq;
                    },
                    index(idxName) {
                      const idxPath = s.indexes.get(idxName) || 'ownerUid';
                      return {
                        getAll(val) {
                          const filtered = Array.from(s.records.values()).filter((r) => r && r[idxPath] === val);
                          const idxReq = { result: filtered, onsuccess: null, onerror: null };
                          queueMicrotask(() => {
                            if (typeof idxReq.onsuccess === 'function') idxReq.onsuccess({ target: idxReq });
                          });
                          return idxReq;
                        }
                      };
                    }
                  };
                }
              };
              return tx;
            },
            close() {}
          };

          req.result = dbHandle;
          if (needsUpgrade && typeof req.onupgradeneeded === 'function') {
            req.onupgradeneeded({ target: req });
          }
          dbState.version = version;
          if (typeof req.onsuccess === 'function') {
            req.onsuccess({ target: req });
          }
        });

        return req;
      }
    };
  }

  globalThis.localStorage = {
    getItem: (k) => (lsMap.has(k) ? lsMap.get(k) : null),
    setItem: (k, v) => { lsMap.set(k, String(v)); },
    removeItem: (k) => { lsMap.delete(k); },
    clear: () => { lsMap.clear(); }
  };

  if (typeof globalThis.URL !== 'undefined') {
    globalThis.URL.createObjectURL = (blob) => {
      objectUrlSeq += 1;
      const u = `blob:mock-gallery/${objectUrlSeq}`;
      activeObjectUrls.set(u, blob);
      return u;
    };
    globalThis.URL.revokeObjectURL = (u) => {
      activeObjectUrls.delete(u);
      revokedObjectUrls.push(u);
    };
  }

  return {
    idbFactory: makeMockIndexedDB(),
    databases,
    lsMap,
    activeObjectUrls,
    revokedObjectUrls,
    setQuotaExceeded: (flag) => { simulateQuotaError = Boolean(flag); }
  };
}

async function runTests() {
  const env = createMockStorageEnvironment();
  setIndexedDBProviderForTest(env.idbFactory);
  clearMemoryGalleryStoreForTest();

  console.log('================================================================');
  console.log('1. SHADOW HOTSPOT INTEGRATION & UNTOUCHED OTHER UNIVERSES');
  console.log('================================================================');
  check(Boolean(SHADOW_LOCATIONS.galeri_seni), 'SHADOW has galeri_seni location');
  check(SHADOW_LOCATIONS.galeri_seni.actionType === 'shadow_art_gallery', 'SHADOW galeri_seni routes to shadow_art_gallery');
  check(KIDULT_LOCATIONS.rumah_kaca.actionType === 'moments', 'KIDULT Moments gallery remains untouched');
  check(TOYOU_LOCATIONS.atelier.actionType === 'moments', 'TO YOU Atelier moments gallery remains untouched');
  check(SHADOW_LOCATIONS.gazebo.actionType === 'shadow_gazebo', 'SHADOW Gazebo remains active');
  check(SHADOW_LOCATIONS.ladang_bunga.actionType === 'shadow_garden', 'SHADOW Moonlit Hydrangea Garden remains active');

  console.log('\n================================================================');
  console.log('2. DOM STRUCTURE, CSS & ARCHITECTURE VERIFICATION');
  console.log('================================================================');
  const indexHtml = fs.readFileSync('./index.html', 'utf8');
  const cssContent = fs.readFileSync('./shadow_art_gallery.css', 'utf8');
  const galleryEngineSrc = fs.readFileSync('./shadow_art_gallery.js', 'utf8');

  check(indexHtml.includes('id="view-shadow-art-gallery"'), 'index.html contains view-shadow-art-gallery');
  check(indexHtml.includes('id="museum-storage-notice"'), 'index.html contains museum-storage-notice diagnostics banner');
  check(indexHtml.includes('shadow_art_gallery.css'), 'index.html links shadow_art_gallery.css');
  check(indexHtml.includes('id="btn-art-gallery-back"'), 'index.html contains return to SHADOW button');
  check(indexHtml.includes('data-museum-room="exhibition"'), 'index.html contains Exhibition room tab');
  check(indexHtml.includes('data-museum-room="atelier"'), 'index.html contains Little Atelier room tab');
  check(indexHtml.includes('data-museum-room="manager"'), 'index.html contains Artwork Status Manager room tab');
  check(indexHtml.includes('data-museum-room="quiet_corner"'), 'index.html contains Quiet Corner room tab');
  check(indexHtml.includes('id="modal-art-lightbox"'), 'index.html contains Artwork Zoom Lightbox');
  check(indexHtml.includes('id="modal-art-confirm-delete"'), 'index.html contains Safe Delete Confirmation Dialog');
  check(cssContent.includes('shadow_art_museum_bg.jpg'), 'CSS uses high-res Moonlit Art Museum architectural backdrop');
  check(cssContent.includes('.museum-picture-frame'), 'CSS styles museum picture frames preserving aspect ratio');
  check(cssContent.includes('.artwork-spotlight-beam'), 'CSS styles overhead museum spotlight cones');
  check(cssContent.includes('.museum-missing-image-fallback'), 'CSS styles missing/corrupted local image fallback frame');

  console.log('\n================================================================');
  console.log('3. ZERO FAKE ARTWORKS & EMPTY INITIAL EXHIBITION');
  console.log('================================================================');
  check(getExhibitionArtworks({ viewerChar: 'lele' }).length === 0, 'Fresh exhibition has 0 fake/sample artworks');
  check(getFavoriteMasterpiece({ viewerChar: 'lele' }) === null, 'Fresh museum has null Favorite Masterpiece');
  check(DEFAULT_COLLECTIONS.length === 5, '5 initial Curated Collections defined');
  const initialCols = getCollections().map((c) => c.name);
  check(
    ['Nature', 'Memories', 'Fantasy', 'Portrait', 'Abstract'].every((n) => initialCols.includes(n)),
    'Initial collections cover Nature, Memories, Fantasy, Portrait, Abstract'
  );

  console.log('\n================================================================');
  console.log('4. UPLOAD VALIDATION & LITTLE ATELIER CRUD (INDEXEDDB BLOB)');
  console.log('================================================================');
  const invalidVideo = validateArtworkImageInput({ file: { type: 'video/mp4', size: 1024 } });
  check(!invalidVideo.valid, 'Validation rejects video files in Art Museum');
  const invalidEmpty = validateArtworkImageInput({ file: { type: 'image/png', size: 0 } });
  check(!invalidEmpty.valid, 'Validation rejects empty/corrupted files');
  const invalidOversize = validateArtworkImageInput({ file: { type: 'image/png', size: 30 * 1024 * 1024 } });
  check(!invalidOversize.valid, 'Validation rejects files larger than 25 MB');
  const validPng = validateArtworkImageInput({ file: { type: 'image/png', size: 204800 } });
  check(validPng.valid, 'Validation accepts valid PNG artwork image');

  const samplePngBlob = new Blob(
    [Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13])],
    { type: 'image/png' }
  );

  const art1 = await saveArtworkItem({
    title: 'Gerhana di Atas Menara Kristal',
    description: 'Lukisan cat air malam hari di beranda menara.',
    createdDate: '2026-11-12',
    collectionId: 'fantasy',
    status: 'published',
    file: samplePngBlob,
    mimeType: 'image/png',
    aspectRatio: 1.5,
    storyPublic: true,
    story: {
      inspiration: 'Langit tengah malam setelah hujan reda.',
      meaning: 'Ketenangan di balik bayangan.',
      process: 'Akrilik digital berlapis cahaya bulan.'
    },
    privateNotes: 'Perbaiki sedikit kontras di sudut kiri.'
  }, 'lele');

  check(Boolean(art1.id), 'Artwork 1 uploaded and saved');
  check(art1.imageStorageType === 'indexeddb', 'Artwork imageStorageType recorded as indexeddb');
  check(art1.imageDataUrl.startsWith('blob:'), 'Original Blob saved in IndexedDB & served via Object URL');
  check(art1.aspectRatio === 1.5, 'Original image aspect ratio preserved cleanly');
  check(art1.status === 'published', 'Artwork 1 status is published');

  // Edit existing artwork metadata while keeping existing IndexedDB Blob
  const updatedArt1 = await saveArtworkItem({
    id: art1.id,
    title: 'Gerhana di Menara Kristal (Revisi)',
    storyPublic: false
  }, 'lele');
  check(updatedArt1.title === 'Gerhana di Menara Kristal (Revisi)', 'Artwork metadata updated without losing existing image');
  check(Boolean(updatedArt1.imageDataUrl), 'Existing image preserved across metadata edit');

  // Upload Draft & In Development artworks
  const artDraft = await saveArtworkItem({
    title: 'Sketsa Awal Snowdrop',
    collectionId: 'nature',
    status: 'draft',
    newImageDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/',
    mimeType: 'image/jpeg',
    story: { inspiration: 'Ide pagi', meaning: '', process: '' },
    privateNotes: 'Belum diwarnai'
  }, 'lele');

  const artInDev = await saveArtworkItem({
    title: 'Potret Bayangan Senja',
    collectionId: 'portrait',
    status: 'in_development',
    newImageDataUrl: 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
    mimeType: 'image/webp'
  }, 'lele');

  check(artDraft.status === 'draft' && artInDev.status === 'in_development', 'Draft and In Development artworks saved');

  console.log('\n================================================================');
  console.log('5. STRICT PRIVACY ISOLATION (OWNER VS VISITOR)');
  console.log('================================================================');
  const countsOwner = getArtworkCounts('lele');
  const countsVisitor = getArtworkCounts('nyanya');
  check(countsOwner.total === 3 && countsOwner.published === 1 && countsOwner.draft === 1 && countsOwner.in_development === 1, 'Owner counts track all 3 statuses');
  check(countsVisitor.total === 1 && countsVisitor.draft === 0 && countsVisitor.in_development === 0, 'Visitor counts expose ONLY published artworks');

  const visitorExhibition = getExhibitionArtworks({ viewerChar: 'nyanya', visitorPreview: false });
  check(visitorExhibition.length === 1 && visitorExhibition[0].id === art1.id, 'Visitors see ONLY Published artworks in Exhibition');
  check(visitorExhibition[0].story === null, 'Private Story (storyPublic=false) is hidden from visitors');
  check(visitorExhibition[0].privateNotes === '', 'Private Artist Notes are stripped for visitors');

  const previewExhibition = getExhibitionArtworks({ viewerChar: 'lele', visitorPreview: true });
  check(previewExhibition.length === 1 && previewExhibition[0].story === null && previewExhibition[0].privateNotes === '', 'Visitor Preview mode accurately simulates public privacy');

  check(getArtworkById(artDraft.id, { viewerChar: 'lala' }) === null, 'Visitor cannot open Draft artwork by direct ID');
  check(getArtworkById(artInDev.id, { viewerChar: 'nyanya' }) === null, 'Visitor cannot open In Development artwork by direct ID');

  let deniedStudio = false;
  try {
    getStudioArtworks({ viewerChar: 'nyanya' });
  } catch (e) {
    deniedStudio = e.message.includes('Akses ditolak');
  }
  check(deniedStudio, 'Non-owner blocked from Little Atelier / Studio Manager');

  let deniedCreate = false;
  try {
    await saveArtworkItem({ title: 'Ilegal', newImageDataUrl: 'data:image/png;base64,abc' }, 'lala');
  } catch (e) {
    deniedCreate = e.message.includes('Akses ditolak');
  }
  check(deniedCreate, 'Non-owner blocked from creating artwork in SHADOW museum');

  console.log('\n================================================================');
  console.log('6. MY FAVORITE MASTERPIECE RULES');
  console.log('================================================================');
  let blockedDraftFav = false;
  try {
    setFavoriteMasterpiece(artDraft.id, 'lele');
  } catch (e) {
    blockedDraftFav = e.message.includes('Published');
  }
  check(blockedDraftFav, 'Setting Draft artwork as Favorite Masterpiece is rejected');

  const favSet = setFavoriteMasterpiece(art1.id, 'lele');
  check(favSet && favSet.id === art1.id, 'Published artwork successfully set as Favorite Masterpiece');
  check(getFavoriteMasterpiece({ viewerChar: 'nyanya' })?.id === art1.id, 'Public visitors see published Favorite Masterpiece');

  await updateArtworkStatus(art1.id, 'draft', 'lele');
  check(getFavoriteMasterpiece({ viewerChar: 'lele' }) === null, 'Unpublishing Favorite Masterpiece to Draft clears public centerpiece');

  await updateArtworkStatus(art1.id, 'published', 'lele');
  setFavoriteMasterpiece(art1.id, 'lele');
  check(getFavoriteMasterpiece({ viewerChar: 'lala' })?.id === art1.id, 'Re-published artwork restored as Favorite Masterpiece');

  console.log('\n================================================================');
  console.log('7. CURATED COLLECTIONS & ORDERING');
  console.log('================================================================');
  const customCol = createCustomCollection({ name: 'Sketsa Tengah Malam', icon: '🌙' }, 'lele');
  check(customCol.id && customCol.name === 'Sketsa Tengah Malam', 'Custom collection created');

  await moveArtworkToCollection(art1.id, customCol.id, 'lele');
  const filteredCustom = getExhibitionArtworks({ collectionId: customCol.id, viewerChar: 'nyanya' });
  check(filteredCustom.length === 1 && filteredCustom[0].id === art1.id, 'Artwork moved to custom collection & filterable');

  renameCollection(customCol.id, 'Nocturne Sketchbook', 'lele');
  check(getCollections().some((c) => c.name === 'Nocturne Sketchbook'), 'Custom collection renamed');

  const movedCol = reorderCollection(customCol.id, 'up', 'lele');
  check(movedCol === true, 'Collections reordered successfully');

  await deleteCustomCollection(customCol.id, 'lele');
  check(getArtworkById(art1.id, { viewerChar: 'lele' }).collectionId === 'memories', 'Deleting custom collection safely reassigns artworks to memories');

  await updateArtworkStatus(artDraft.id, 'published', 'lele');
  const reorderedArt = await reorderArtwork(artDraft.id, 'up', 'lele');
  check(reorderedArt === true, 'Artwork display order adjusted cleanly');

  console.log('\n================================================================');
  console.log('8. INDEXEDDB REFRESH PERSISTENCE, UID ISOLATION & ERROR HANDLING');
  console.log('================================================================');
  // Simulate full browser page refresh for Lele on the same browser
  clearMemoryGalleryStoreForTest({ keepPersistent: true });
  check(env.revokedObjectUrls.length > 0, 'Tracked Object URLs cleanly revoked on store reset');
  await loadArtGalleryStore('lele');
  const restoredArt1 = getArtworkById(art1.id, { viewerChar: 'lele' });
  check(Boolean(restoredArt1), 'Artwork metadata survives simulated page refresh via IndexedDB');
  check(restoredArt1.imageStatus === 'ok' && restoredArt1.imageDataUrl.startsWith('blob:'), 'Original image Blob survives page refresh in IndexedDB');

  // Strict UID separation check: Nyanya's session has ZERO access to Lele's local IndexedDB records
  clearMemoryGalleryStoreForTest({ keepPersistent: true });
  await loadArtGalleryStore('nyanya');
  check(getExhibitionArtworks({ viewerChar: 'nyanya' }).length === 0, 'UID Isolation: Nyanya local IndexedDB store does NOT leak Lele private/local IndexedDB rows');

  // Restore Lele session & test QuotaExceededError rollback
  clearMemoryGalleryStoreForTest({ keepPersistent: true });
  await loadArtGalleryStore('lele');
  env.setQuotaExceeded(true);
  let quotaThrew = false;
  try {
    await saveArtworkItem({
      id: art1.id,
      title: 'Judul Tidak Boleh Tersimpan Jika Kuota Penuh',
      file: samplePngBlob,
      mimeType: 'image/png'
    }, 'lele');
  } catch (qErr) {
    quotaThrew = qErr.message.includes('penuh');
  }
  env.setQuotaExceeded(false);
  check(quotaThrew, 'QuotaExceededError aborts save cleanly with actionable message');
  check(getGalleryStorageDiagnostics().storageStatus === 'quota_exceeded', 'Diagnostics records quota_exceeded state');
  check(getArtworkById(art1.id, { viewerChar: 'lele' })?.title === 'Gerhana di Menara Kristal (Revisi)', 'Existing saved artwork remains untouched/uncorrupted after QuotaExceededError');

  // Test Legacy storagePath audit without auto-deletion + corrupted image flag
  const legacyId = 'art-legacy-cloud-test';
  const idbMetaStore = env.databases.get('olu_shadow_art_gallery_db_v2').stores.get('artworks');
  idbMetaStore.records.set(`1ArxphLQpAOoOIvH9BKYw0ebD1e2::${legacyId}`, {
    compositeKey: `1ArxphLQpAOoOIvH9BKYw0ebD1e2::${legacyId}`,
    ownerUid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2',
    id: legacyId,
    authorUid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2',
    title: 'Karya Lama Cloud Storage',
    status: 'published',
    collectionId: 'memories',
    storagePath: 'artworks/published/1ArxphLQpAOoOIvH9BKYw0ebD1e2/legacy.jpg',
    createdAt: Date.now()
  });
  clearMemoryGalleryStoreForTest({ keepPersistent: true });
  await loadArtGalleryStore('lele');
  const legacyLoaded = getArtworkById(legacyId, { viewerChar: 'lele' });
  const auditRes = auditLegacyCloudStorageArtworks();
  check(legacyLoaded && legacyLoaded.imageStatus === 'missing_local', 'Artwork without local IndexedDB blob cleanly marked missing_local');
  check(auditRes.count === 1 && auditRes.items[0].storagePath.includes('legacy.jpg'), 'Legacy cloud storagePath audited and preserved without auto-deletion');

  markArtworkImageLoadError(art1.id, 'Simulated decode error');
  check(getArtworkById(art1.id, { viewerChar: 'lele' })?.imageStatus === 'corrupted', 'Corrupted/unreadable image marked gracefully while metadata stays readable');
  check(getGalleryStorageDiagnostics().corruptedCount === 1, 'Diagnostics tracks corrupted image count');

  // Test IndexedDB completely unavailable
  setIndexedDBProviderForTest(null);
  clearMemoryGalleryStoreForTest();
  await loadArtGalleryStore('lele');
  check(getGalleryStorageDiagnostics().indexedDbAvailable === false && getGalleryStorageDiagnostics().storageStatus === 'unavailable', 'Unavailable IndexedDB handled gracefully without crashing');

  // Restore mock IDB for Safe Delete test
  setIndexedDBProviderForTest(env.idbFactory);
  clearMemoryGalleryStoreForTest({ keepPersistent: true });
  await loadArtGalleryStore('lele');

  console.log('\n================================================================');
  console.log('9. SAFE DELETION & AUDIT RULES (ZERO FIREBASE STORAGE FOR GALLERY)');
  console.log('================================================================');
  await deleteArtworkItem(art1.id, 'lele');
  check(getArtworkById(art1.id, { viewerChar: 'lele' }) === null, 'Deleted artwork removed from IndexedDB & memory');
  check(getFavoriteMasterpiece({ viewerChar: 'lele' }) === null, 'Deleting Favorite Masterpiece clears centerpiece');

  const rulesMain = fs.readFileSync('./firestore.rules', 'utf8');
  const rulesFinal = fs.readFileSync('./firestore.rules.final', 'utf8');
  const storageRules = fs.readFileSync('./storage.rules', 'utf8');
  const firebaseJsSrc = fs.readFileSync('./firebase.js', 'utf8');

  check(rulesMain === rulesFinal, 'firestore.rules and firestore.rules.final are 100% identical');
  check(rulesMain.includes('match /artworks/{artworkId}'), 'Firestore rules protect artworks metadata collection');
  check(rulesMain.includes("'imageStorageType'") && rulesMain.includes("== 'indexeddb'"), 'Firestore rules validate imageStorageType == indexeddb');
  check(rulesMain.includes('match /artwork_notes/{artworkId}'), 'Firestore rules isolate owner-only artwork_notes');
  check(rulesMain.includes('match /star_messages/{messageId}') && rulesMain.includes('match /letters/{letterId}'), 'Existing star_messages & letters rules preserved');
  check(!storageRules.includes('artworks'), 'storage.rules has ZERO artworks Firebase Storage rules');
  check(storageRules.includes('match /moments/') && storageRules.includes('match /photobooth/'), 'storage.rules keeps moments & photobooth Storage intact');
  check(
    !galleryEngineSrc.includes('dbUploadArtworkImage') &&
    !galleryEngineSrc.includes('dbCreateArtworkObjectURL') &&
    !galleryEngineSrc.includes('dbRelocateArtworkStorage') &&
    !galleryEngineSrc.includes('cloudinary') &&
    !galleryEngineSrc.includes('supabase'),
    'shadow_art_gallery.js has ZERO Firebase Storage or external CDN upload/read/delete code'
  );
  check(
    !firebaseJsSrc.includes('dbUploadArtworkImage') &&
    !firebaseJsSrc.includes('dbCreateArtworkObjectURL') &&
    !firebaseJsSrc.includes('dbRelocateArtworkStorage'),
    'firebase.js artwork Storage helpers removed cleanly'
  );

  console.log(`\n================================================================`);
  console.log(`HASIL AKHIR: ${passed}/${total} PENGUJIAN BERHASIL (100%)`);
  console.log(`================================================================\n`);
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
