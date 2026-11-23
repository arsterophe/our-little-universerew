const { execSync } = require('child_process');

const testScripts = [
  'test_all_eight_orbit_suite.js',
  'test_orbit_equal_access.cjs',
  'test_shadow_mood_suite.js',
  'test_behind_shadow.js',
  'test_behind_ash.js',
  'test_behind_yawn.js',
  'test_behind_lotus.js',
  'test_behind_pinwheel_suite.js',
  'test_seven_characters_auth_suite.js'
];

console.log('=== RUNNING ALL REPOSITORY TEST SUITES ===\n');
let passed = 0;
let failed = 0;

for (const script of testScripts) {
  try {
    process.stdout.write(`Running ${script}... `);
    execSync(`node ${script}`, { stdio: 'pipe' });
    console.log('✓ PASS');
    passed++;
  } catch (err) {
    console.log('✕ FAIL');
    console.error(err.stdout ? err.stdout.toString() : err.message);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testScripts.length} suites.`);
if (failed > 0) process.exit(1);
