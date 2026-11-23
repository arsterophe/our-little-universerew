import fs from 'fs';

const content = fs.readFileSync('universes_view.js', 'utf8');
const lines = content.split('\n');
lines.slice(1925, 1960).forEach((l, i) => {
  console.log(`Line ${1926 + i}: ${l}`);
});
