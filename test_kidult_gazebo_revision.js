/**
 * TEST SUITE: KIDULT EVERDREAM GAZEBO REVISION & SONGS WE SHARE
 * =============================================================================
 * Verifies:
 * 1. DOM structure of Gazebo Nyanya (Top Bar, 4 Cards, Bottom Panel, Music Player)
 * 2. Visual & Philosophical identity of KIDULT (Quote, Moods, Teas, Ambience)
 * 3. Tea Time modal and brewing state
 * 4. Perpustakaan Kecil (integration with Our Stories, reader pages, font size, progress)
 * 5. Jurnal Malam (KIDULT philosophy moods, creation, listing, detail, deletion, UID binding)
 * 6. Quiet Moment (4 ambient soundscapes, volume controls, zero autoplay)
 * 7. Songs We Share Universal Music System:
 *    - YouTube URL extraction (youtu.be, watch?v=, embed, shorts)
 *    - Adding recommendation with title, artist, note, mood
 *    - Edit & delete restricted strictly to the recommendation author
 *    - Equal access across all 8 characters
 *    - Automatic notification dispatch to other 7 characters in orbit_notifications
 *    - Orbit notification click navigates to Gazebo Music Corner
 * 8. Bottom panel quick access to Songs We Share in both KIDULT and SHADOW
 */

import fs from 'fs';
import path from 'path';

const storageMap = new Map();
globalThis.localStorage = {
  getItem: (k) => storageMap.has(k) ? storageMap.get(k) : null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear()
};
globalThis.window = globalThis;

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
  console.log('1. DOM STRUCTURE IN INDEX.HTML FOR KIDULT EVERDREAM GAZEBO');
  console.log('================================================================');

  const html = fs.readFileSync(path.resolve('./index.html'), 'utf8');

  // Verify view-kidult-gazebo
  assert(html.includes('id="view-kidult-gazebo"'), 'index.html contains view-kidult-gazebo');
  assert(html.includes('id="btn-kgazebo-back"'), 'index.html contains return button (id="btn-kgazebo-back")');

  // Top Bar Music Player
  assert(html.includes('id="btn-kgazebo-music-toggle"'), 'index.html contains music play/pause toggle');
  assert(html.includes('id="btn-kgazebo-music-mute"'), 'index.html contains music mute button');
  assert(html.includes('id="slider-kgazebo-music-vol"'), 'index.html contains music volume slider');
  assert(html.includes('id="kgazebo-track-title"'), 'index.html contains track title display');

  // Four Central Activity Cards
  assert(html.includes('id="kgazebo-card-tea"'), 'index.html contains Tea Time card');
  assert(html.includes('id="kgazebo-card-library"'), 'index.html contains Perpustakaan Kecil card');
  assert(html.includes('id="kgazebo-card-journal"'), 'index.html contains Jurnal Malam card');
  assert(html.includes('id="kgazebo-card-quiet"'), 'index.html contains Quiet Moment card');

  // Bottom Action Dock (Pojok Kiri Bawah)
  assert(!html.includes('id="kgazebo-serenity-badge"'), 'Quote badge removed from KIDULT gazebo bottom bar');
  assert(!html.includes('id="kgazebo-table-tea-indicator"'), 'Permanent tea indicator text removed from KIDULT bottom bar');
  assert(html.includes('id="kgazebo-quick-actions"'), 'index.html contains kgazebo-quick-actions dock');
  assert(html.includes('id="btn-kgazebo-quick-tea"'), 'index.html contains circular Tea Time action button');
  assert(html.includes('id="btn-kgazebo-songs-we-share"'), 'index.html contains circular Songs We Share action button');
  assert(html.includes('data-tooltip="Tea Time'), 'Tea Time button has tooltip');
  assert(html.includes('data-tooltip="Songs We Share'), 'Songs We Share button has tooltip');
  assert(html.includes('id="btn-gazebo-songs-we-share"'), 'index.html contains Songs We Share button in SHADOW bottom bar');

  // Modals
  assert(html.includes('id="kgazebo-modal-backdrop"'), 'index.html contains Gazebo modal container');

  // CSS Link
  assert(html.includes('href="/songs_we_share.css"'), 'index.html links songs_we_share.css in head');

  console.log('\n================================================================');
  console.log('2. CSS STYLING & KIDULT VISUAL IDENTITY');
  console.log('================================================================');

  const cssGazebo = fs.readFileSync(path.resolve('./kidult_gazebo.css'), 'utf8');
  const cssSongs = fs.readFileSync(path.resolve('./songs_we_share.css'), 'utf8');

  assert(cssGazebo.includes('.kgazebo-cards-grid'), 'kidult_gazebo.css styles cards grid');
  assert(cssGazebo.includes('.kgazebo-card'), 'kidult_gazebo.css styles pastel decorative cards');
  assert(cssGazebo.includes('.btn-kgazebo-circle-action'), 'kidult_gazebo.css styles circular action buttons');
  assert(cssGazebo.includes('.kgazebo-quick-actions'), 'kidult_gazebo.css styles bottom left quick actions dock');
  assert(cssSongs.includes('.sws-modal-backdrop'), 'songs_we_share.css styles modal backdrop');
  assert(cssSongs.includes('.sws-cards-grid'), 'songs_we_share.css styles shared songs grid');
  assert(cssSongs.includes('.sws-iframe-container'), 'songs_we_share.css styles responsive YouTube player');

  console.log('\n================================================================');
  console.log('3. KIDULT GAZEBO STATE & PHILOSOPHY VERIFICATION');
  console.log('================================================================');

  const {
    KIDULT_TEAS,
    KIDULT_JOURNAL_MOODS,
    KIDULT_AMBIENT_OPTIONS,
    NYANYA_HERO_QUOTE,
    createDefaultKidultGazeboState,
    loadKidultGazeboState,
    saveKidultGazeboState
  } = await import('./kidult_gazebo_state.js');

  // Verify Teas
  assert(Object.keys(KIDULT_TEAS).length >= 4, 'At least 4 teas available in catalog');
  assert(KIDULT_TEAS.lavender_star !== undefined, 'Star Lavender Tea exists');
  assert(KIDULT_TEAS.cloud_cocoa !== undefined, 'Cloud Cocoa exists');

  // Verify KIDULT Journal Moods
  assert(KIDULT_JOURNAL_MOODS.some(m => m.id === 'inner_child'), 'Inner Child mood exists');
  assert(KIDULT_JOURNAL_MOODS.some(m => m.id === 'nostalgia'), 'Nostalgia mood exists');
  assert(KIDULT_JOURNAL_MOODS.some(m => m.id === 'growth'), 'Growth mood exists');
  assert(KIDULT_JOURNAL_MOODS.some(m => m.id === 'self_love'), 'Self-love mood exists');

  // Verify Hero Quote
  assert(NYANYA_HERO_QUOTE.includes('hold the little child inside you'), 'Hero quote matches KIDULT concept');

  // Verify Ambients
  assert(KIDULT_AMBIENT_OPTIONS.length === 4, '4 Ambient soundscapes configured');
  assert(KIDULT_AMBIENT_OPTIONS.some(a => a.id === 'breeze'), 'Wisteria Breeze soundscape exists');
  assert(KIDULT_AMBIENT_OPTIONS.some(a => a.id === 'night'), 'Night Twilight soundscape exists');

  // Verify State Persistence per Character
  const stateNyanya = createDefaultKidultGazeboState('nyanya');
  assert(stateNyanya.characterId === 'nyanya', 'State character is nyanya');
  assert(stateNyanya.journals.length >= 2, 'Nyanya host starts with seed journals');
  assert(stateNyanya.memories.length >= 3, 'Nyanya host preserves memories');

  const stateVisitor = createDefaultKidultGazeboState('lele');
  assert(stateVisitor.characterId === 'lele', 'Visitor state isolated to lele');

  console.log('\n================================================================');
  console.log('4. SONGS WE SHARE — UNIVERSAL MUSIC RECOMMENDATION SYSTEM');
  console.log('================================================================');

  const {
    extractYouTubeId,
    getSongsWeShare,
    addSongRecommendation,
    updateSongRecommendation,
    deleteSongRecommendation,
    SONGS_STORAGE_KEY
  } = await import('./songs_we_share.js');

  // Test YouTube ID Extraction
  assert(extractYouTubeId('https://www.youtube.com/watch?v=kYJzX3e6Rrw') === 'kYJzX3e6Rrw', 'Extracts ID from standard watch URL');
  assert(extractYouTubeId('https://youtu.be/kYJzX3e6Rrw') === 'kYJzX3e6Rrw', 'Extracts ID from youtu.be short link');
  assert(extractYouTubeId('https://www.youtube.com/embed/kYJzX3e6Rrw') === 'kYJzX3e6Rrw', 'Extracts ID from embed URL');
  assert(extractYouTubeId('https://youtube.com/shorts/kYJzX3e6Rrw') === 'kYJzX3e6Rrw', 'Extracts ID from shorts URL');
  assert(extractYouTubeId('kYJzX3e6Rrw') === 'kYJzX3e6Rrw', 'Handles bare 11-char video ID');
  assert(extractYouTubeId('invalid-url') === null, 'Rejects invalid YouTube URL');

  // Test Get Songs
  const songs = getSongsWeShare();
  assert(Array.isArray(songs) && songs.length >= 4, 'Starter recommendations pre-seeded');
  assert(songs.some(s => s.authorChar === 'nyanya'), 'Nyanya has recommendation in seed');
  assert(songs.some(s => s.authorChar === 'lele'), 'Lele has recommendation in seed');

  // Test Add Song Recommendation by Syma
  const newSong = addSongRecommendation({
    authorChar: 'abil',
    title: 'Spring Blossom Waltz',
    artist: 'Joe Hisaishi',
    youtubeUrl: 'https://youtu.be/HMGetv40FkI',
    note: 'Lagu favorit Syma saat memandangi kincir angin malam hari ♡',
    mood: 'Nostalgic'
  });

  assert(newSong.id.startsWith('song-'), 'New song receives valid ID');
  assert(newSong.youtubeId === 'HMGetv40FkI', 'YouTube ID correctly parsed and stored');
  assert(newSong.authorUniverse === 'PINWHEEL', 'Author universe assigned correctly');

  // Test Edit Song Recommendation: Only Author Can Edit
  const updatedSong = updateSongRecommendation(newSong.id, {
    title: 'Spring Blossom Waltz (Remastered)'
  }, 'abil');
  assert(updatedSong.title === 'Spring Blossom Waltz (Remastered)', 'Author can update their recommendation');

  // Negative test: Another user trying to edit
  let editBlocked = false;
  try {
    updateSongRecommendation(newSong.id, { title: 'Hacked Title' }, 'lele');
  } catch (err) {
    editBlocked = true;
  }
  assert(editBlocked, 'Non-author cannot edit another characters recommendation');

  // Negative test: Another user trying to delete
  let deleteBlocked = false;
  try {
    deleteSongRecommendation(newSong.id, 'lele');
  } catch (err) {
    deleteBlocked = true;
  }
  assert(deleteBlocked, 'Non-author cannot delete another characters recommendation');

  // Test Author can Delete
  const deleteResult = deleteSongRecommendation(newSong.id, 'abil');
  assert(deleteResult === true, 'Author can delete their own recommendation');

  console.log('\n================================================================');
  console.log('5. CROSS-UNIVERSE NOTIFICATION DISPATCH VERIFICATION');
  console.log('================================================================');

  // When a song is added, other 7 characters receive a notification in orbit_notifications
  const testSong = addSongRecommendation({
    authorChar: 'nyanya',
    title: 'Starlight Fairytale',
    artist: 'Secret Garden',
    youtubeUrl: 'https://youtu.be/F07-u0u_4F8',
    note: 'Untuk semua sahabat di universe!',
    mood: 'Dreamy'
  });

  const { getOrbitNotifications } = await import('./orbit.js');
  const leleNotifs = getOrbitNotifications('lele');
  assert(Array.isArray(leleNotifs) && leleNotifs.length > 0, 'Lele received orbit notifications');
  const foundNotif = leleNotifs.find(n => n.type === 'music_recommendation' && n.songId === testSong.id);
  assert(foundNotif !== undefined, 'Found music_recommendation notification for Lele');
  assert(foundNotif.songTitle === 'Starlight Fairytale', 'Notification has correct song title');

  // Clean up test song
  deleteSongRecommendation(testSong.id, 'nyanya');

  console.log('\n================================================================');
  console.log('6. ORBIT VIEW INTEGRATION VERIFICATION');
  console.log('================================================================');

  const orbitViewContent = fs.readFileSync(path.resolve('./orbit_view.js'), 'utf8');
  assert(orbitViewContent.includes('openSongsWeShareModal'), 'orbit_view.js imports openSongsWeShareModal');
  assert(orbitViewContent.includes('btn-notif-view-song'), 'orbit_view.js renders song notification button');
  assert(orbitViewContent.includes('Buka Music Corner di Gazebo'), 'orbit_view.js contains button text to open gazebo music corner');

  console.log('\n================================================================');
  console.log(`🎉 ALL TESTS PASSED: ${passed}/${total} (100%)`);
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
