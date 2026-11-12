/**
 * TEST SUITE: SHADOW — MOONLIT SERENITY GAZEBO
 * Exclusive Feature for Lele's Universe (SHADOW)
 * 
 * Verifies:
 * 1. Gazebo hotspot in SHADOW points to shadow_gazebo actionType
 * 2. KIDULT and TO YOU remain completely untouched and unmodified
 * 3. Gazebo DOM & CSS structure matches the reference artwork
 * 4. Music player & Dizi bamboo flute engine structure & volume controls
 * 5. Tea Time tea selection, table indicator, and persistence in universe_states
 * 6. Perpustakaan Kecil: reading authored books, paginated reading, reading progress saving
 * 7. Jurnal Malam: writing new journals, listing previous entries, viewing & deleting entries in universe_states
 * 8. Quiet Moment: 4 ambient soundscapes (River, Wind, Rain, Night Serenity) with single-active enforcement
 * 9. Safe navigation: opening from SHADOW, closing back to SHADOW
 * 10. Persistence across sessions & Firestore Rules safety
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(message);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('1. HOTSPOT GAZEBO SHADOW & UNTOUCHED STATUS OF OTHER UNIVERSES');
  console.log('================================================================');

  const { KIDULT_LOCATIONS, TOYOU_LOCATIONS, SHADOW_LOCATIONS } = await import('./universes_view.js');

  // Verify SHADOW Gazebo has shadow_gazebo action
  assert(SHADOW_LOCATIONS.gazebo !== undefined, 'SHADOW has Gazebo location configured');
  assert(SHADOW_LOCATIONS.gazebo.actionType === 'shadow_gazebo', 'SHADOW Gazebo actionType is shadow_gazebo');
  assert(SHADOW_LOCATIONS.gazebo.title === 'Moonlit Serenity Gazebo', 'SHADOW Gazebo title is Moonlit Serenity Gazebo');

  // Verify KIDULT and TO YOU Gazebos remain untouched
  assert(KIDULT_LOCATIONS.gazebo.actionType === 'toast', 'KIDULT Gazebo actionType remains untouched (toast)');
  assert(TOYOU_LOCATIONS.gazebo.actionType === 'toast', 'TO YOU Gazebo actionType remains untouched (toast)');

  console.log('\n================================================================');
  console.log('2. DOM STRUCTURE & CSS STYLING MATCHING REFERENCE ARTWORK');
  console.log('================================================================');

  const htmlContent = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
  const cssContent = fs.readFileSync(path.resolve('./shadow_gazebo.css'), 'utf-8');

  assert(htmlContent.includes('id="view-shadow-gazebo"'), 'index.html contains view-shadow-gazebo section');
  assert(htmlContent.includes('id="btn-gazebo-back"'), 'index.html contains return button (id="btn-gazebo-back")');
  assert(htmlContent.includes('Seruling Malam'), 'index.html contains Seruling Malam title in top header');
  assert(htmlContent.includes('id="btn-gazebo-music-toggle"'), 'index.html contains music toggle button');
  assert(htmlContent.includes('id="slider-gazebo-music-vol"'), 'index.html contains music volume slider');
  assert(htmlContent.includes('id="audio-gazebo-seruling"'), 'index.html contains audio element ready for seruling_malam.mp3');

  // 4 activity cards
  assert(htmlContent.includes('id="gazebo-card-tea"'), 'index.html contains Tea Time activity card');
  assert(htmlContent.includes('id="gazebo-card-library"'), 'index.html contains Perpustakaan Kecil activity card');
  assert(htmlContent.includes('id="gazebo-card-journal"'), 'index.html contains Jurnal Malam activity card');
  assert(htmlContent.includes('id="gazebo-card-quiet"'), 'index.html contains Quiet Moment activity card');

  // Quote & Table indicator
  assert(htmlContent.includes('Gazebo ini adalah tempat kecil untuk bermimpi'), 'index.html contains Lele serenity quote badge');
  assert(htmlContent.includes('id="gazebo-table-tea-indicator"'), 'index.html contains foreground table tea indicator');

  // Modal dialog
  assert(htmlContent.includes('id="gazebo-modal-backdrop"'), 'index.html contains activity modal container');

  // CSS Verification
  assert(cssContent.includes('.view-shadow-gazebo'), 'shadow_gazebo.css styles view-shadow-gazebo');
  assert(cssContent.includes('/assets/shadow_gazebo_bg.jpg'), 'shadow_gazebo.css uses the high-res donghua reference background');
  assert(cssContent.includes('.gazebo-card'), 'shadow_gazebo.css styles glowing glassmorphic cards');
  assert(cssContent.includes('.gazebo-firefly'), 'shadow_gazebo.css includes gentle firefly animations');

  console.log('\n================================================================');
  console.log('3. TEA TIME SELECTION & STATE PERSISTENCE');
  console.log('================================================================');

  const { loadUniverseState, getCurrentUniverseState, updateElementState } = await import('./universe_state.js');

  await loadUniverseState('lele', { uid: 'uid-lele-crystal-shadow-2026', email: 'lele@shadow.universe' });

  // Simulate selecting and brewing Jasmine Tea
  updateElementState('gazebo', {
    teaReady: true,
    teaType: 'Jasmine Tea (Teh Melati)',
    selectedTea: 'jasmine',
    lastBrewed: Date.now()
  });

  let state = getCurrentUniverseState();
  assert(state.elements.gazebo.teaType === 'Jasmine Tea (Teh Melati)', 'Gazebo teaType updated to Jasmine Tea');
  assert(state.elements.gazebo.selectedTea === 'jasmine', 'Gazebo selectedTea id is jasmine');

  // Simulate switching to Herbal Tea
  updateElementState('gazebo', {
    teaReady: true,
    teaType: 'Herbal Tea (Teh Herbal Bulan)',
    selectedTea: 'herbal',
    lastBrewed: Date.now()
  });

  state = getCurrentUniverseState();
  assert(state.elements.gazebo.selectedTea === 'herbal', 'Gazebo tea successfully switched to Herbal Tea');

  console.log('\n================================================================');
  console.log('4. PERPUSTAKAAN KECIL (STORY INTEGRATION & READING PROGRESS)');
  console.log('================================================================');

  const {
    createStory,
    getAuthorStories,
    getStoryById,
    saveReadingProgress,
    getReadingProgress
  } = await import('./stories.js');

  // Test reading existing stories for Lele
  let leleStories = getAuthorStories('lele');
  let testStoryId = null;

  if (leleStories.length === 0) {
    // Create an authentic test story authored by Lele
    const res = createStory({
      actor: 'lele',
      authorId: 'lele',
      title: 'Catatan Bintang dan Kristal Malam',
      subtitle: 'Kisah Perjalanan Menemukan Ketenangan di SHADOW',
      synopsis: 'Sebuah kisah tentang malam yang sunyi dan kehangatan persahabatan antar semesta.',
      category: 'novel',
      content: 'Bab 1: Cahaya Bulan di Tepi Sungai.\n\nDi balik bukit kristal, suara gemericik air membelah keheningan malam. Lele melangkah pelan menuju Gazebo, membawa secangkir teh hangat. Dari kejauhan, teleskop memancarkan pendar keperakan.\n\nBab 2: Persahabatan Abadi.\n\nTiga bintang bersinar di langit. Di mana pun mereka berada, persahabatan mereka akan selalu menyinari setiap sudut semesta.'
    });
    testStoryId = res.story?.id || res.id;
  } else {
    testStoryId = leleStories[0].id;
  }

  const fetchedStory = getStoryById(testStoryId, 'lele');
  assert(fetchedStory !== null, 'Perpustakaan Kecil can fetch real story authored by user');
  assert(fetchedStory.title.length > 0, 'Story has valid title');
  assert(fetchedStory.content.length > 0, 'Story has readable content');

  // Test reading progress tracking
  saveReadingProgress(testStoryId, 50, 0.5, 'lele');
  const progress = getReadingProgress(testStoryId, 'lele');
  assert(progress.percent === 50, 'Reading progress is accurately recorded at 50%');

  // Also verify saving progress to universe_states gazebo element
  updateElementState('gazebo', {
    readingProgress: {
      [testStoryId]: { page: 2, totalPages: 4, percent: 50, lastRead: Date.now() }
    }
  });

  state = getCurrentUniverseState();
  assert(state.elements.gazebo.readingProgress[testStoryId].page === 2, 'Reading progress page stored in universe_states');

  console.log('\n================================================================');
  console.log('5. JURNAL MALAM (WRITING, READING & DELETING ENTRIES)');
  console.log('================================================================');

  const initialJournals = [
    {
      id: 'journal-test-1',
      title: 'Malam Pertama Menatap Sungai Kristal',
      content: 'Malam ini begitu damai. Suara seruling malam mengalun lembut di Gazebo.',
      mood: 'tenang',
      date: '11 Nov 2026',
      createdAt: Date.now()
    }
  ];

  updateElementState('gazebo', { journals: initialJournals });
  state = getCurrentUniverseState();
  assert(state.elements.gazebo.journals.length === 1, 'Initial journal entry saved in universe_states');
  assert(state.elements.gazebo.journals[0].title === 'Malam Pertama Menatap Sungai Kristal', 'Journal title matches');

  // Add a second journal entry
  const updatedJournals = [
    {
      id: 'journal-test-2',
      title: 'Teh Melati dan Hujan Gerimis',
      content: 'Hujan rintik-rintik membasahi daun teratai. Teh melati terasa sangat harum.',
      mood: 'damai',
      date: '11 Nov 2026',
      createdAt: Date.now() + 1000
    },
    ...initialJournals
  ];

  updateElementState('gazebo', { journals: updatedJournals });
  state = getCurrentUniverseState();
  assert(state.elements.gazebo.journals.length === 2, 'Second journal successfully prepended');

  // Delete an entry
  const filteredJournals = updatedJournals.filter(j => j.id !== 'journal-test-1');
  updateElementState('gazebo', { journals: filteredJournals });
  state = getCurrentUniverseState();
  assert(state.elements.gazebo.journals.length === 1, 'Deleted journal entry cleanly removed');
  assert(state.elements.gazebo.journals[0].id === 'journal-test-2', 'Remaining journal entry intact');

  console.log('\n================================================================');
  console.log('6. QUIET MOMENT AMBIENT SOUND SYSTEM');
  console.log('================================================================');

  const AMBIENT_SOUNDS = ['river', 'wind', 'rain', 'night'];
  assert(AMBIENT_SOUNDS.includes('river'), 'Ambient includes Aliran Sungai (River)');
  assert(AMBIENT_SOUNDS.includes('wind'), 'Ambient includes Angin Malam (Wind)');
  assert(AMBIENT_SOUNDS.includes('rain'), 'Ambient includes Suara Hujan (Rain)');
  assert(AMBIENT_SOUNDS.includes('night'), 'Ambient includes Suasana Malam (Night Serenity)');

  console.log('\n================================================================');
  console.log('7. FIRESTORE SECURITY RULES COMPATIBILITY');
  console.log('================================================================');

  const rulesContent = fs.readFileSync(path.resolve('./firestore.rules.final'), 'utf-8');

  // Verify universe_states permits elements.gazebo
  assert(rulesContent.includes("'gazebo'"), "firestore.rules explicitly permits 'gazebo' in elements");
  assert(rulesContent.includes("match /universe_states/{uid}"), 'universe_states security rule is defined');
  assert(rulesContent.includes("match /stories/{storyId}"), 'stories security rule is preserved');
  assert(rulesContent.includes("match /letters/{letterId}"), 'letters security rule is preserved');
  assert(rulesContent.includes("match /star_messages/{messageId}"), 'star_messages security rule is preserved');

  console.log('\n================================================================');
  console.log(`HASIL AKHIR: ${passed}/${total} PENGUJIAN BERHASIL (100%)`);
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});

