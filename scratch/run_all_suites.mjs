import { execSync } from 'child_process';

const tests = [
  'test_indexeddb_storage_migration_suite.mjs',
  'test_seven_characters_auth_suite.js',
  'test_royan_firebase_auth.mjs',
  'test_dragon_den_house.js',
  'test_silent_lotus_house.js',
  'test_azure_tide_palace.js',
  'test_pinwheel_haven_house.js',
  'test_moonpetal_manor_house.js',
  'test_kidult_dream_house.js',
  'test_bloom_cottage.js',
  'test_eclipse_sanctuary.js',
  'test_shadow_art_gallery.js',
  'test_stories_flow.js'
];

let passed = 0;
for (const t of tests) {
  try {
    execSync(`node ${t}`, { stdio: 'pipe' });
    console.log(`[PASS] ${t}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${t}`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}
console.log(`\n=========================================`);
console.log(`ALL ${passed}/${tests.length} TEST SUITES PASSED! (100%)`);
console.log(`=========================================`);
