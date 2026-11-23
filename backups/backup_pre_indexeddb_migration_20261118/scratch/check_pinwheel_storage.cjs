const fs = require('fs');

const files = [
  'cat_garden.js',
  'fishing_pond.js',
  'pinwheel_gazebo_view.js',
  'pinwheel_residence_state.js',
  'pinwheel_studio_storage.js',
  'pinwheel_view.js'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    console.log(`=== ${f} ===`);
    const lines = c.split('\n');
    lines.forEach((l, idx) => {
      if (l.includes('localStorage') || l.includes('firebase') || l.includes('universe_states') || l.includes('dbSave') || l.includes('dbFetch')) {
        console.log(`  Line ${idx+1}: ${l.trim().slice(0, 100)}`);
      }
    });
  }
});
