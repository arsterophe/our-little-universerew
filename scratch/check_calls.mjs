import fs from 'fs';

const files = [
  'dragon_den_view.js',
  'silent_lotus_view.js',
  'azure_palace_view.js',
  'pinwheel_haven_view.js',
  'moonpetal_manor_view.js',
  'kidult_house_view.js',
  'bloom_cottage_view.js',
  'eclipse_view.js'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  console.log(`\n=== ${f} ===`);
  content.split('\n').forEach((l, i) => {
    if (l.includes('load') && l.includes('State')) {
      console.log(`  L${i+1} [load]: ${l.trim().slice(0, 90)}`);
    }
    if (l.includes('save') && l.includes('State')) {
      console.log(`  L${i+1} [save]: ${l.trim().slice(0, 90)}`);
    }
  });
}
