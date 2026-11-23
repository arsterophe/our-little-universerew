const fs = require('fs');
const path = require('path');

const collections = new Set();
const colRegex = /collection\s*\(\s*(?:db|[a-zA-Z0-9_]+)\s*,\s*['"`]([a-zA-Z0-9_-]+)['"`]\s*\)/g;
const docRegex = /doc\s*\(\s*(?:db|[a-zA-Z0-9_]+)\s*,\s*['"`]([a-zA-Z0-9_-]+)['"`]\s*,/g;
const matchRegex = /match\s+\/([a-zA-Z0-9_-]+)\//g;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git' || f === 'dist' || f === 'scratch') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(full);
    } else if (f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.cjs')) {
      const content = fs.readFileSync(full, 'utf8');
      let m;
      while ((m = colRegex.exec(content)) !== null) {
        collections.add(m[1]);
      }
      while ((m = docRegex.exec(content)) !== null) {
        collections.add(m[1]);
      }
    }
  }
}

scanDir('.');
console.log('=== ALL FIRESTORE COLLECTIONS REFERENCED IN CODE ===');
const sorted = Array.from(collections).sort();
sorted.forEach(c => console.log(' - ' + c));

const rules = fs.readFileSync('firestore.rules', 'utf8');
const rulesMatches = new Set();
let rm;
while ((rm = matchRegex.exec(rules)) !== null) {
  rulesMatches.add(rm[1]);
}
console.log('\n=== ALL COLLECTIONS DEFINED IN FIRESTORE.RULES ===');
Array.from(rulesMatches).sort().forEach(c => console.log(' - ' + c));

console.log('\n=== COLLECTIONS IN CODE BUT MISSING IN RULES ===');
sorted.filter(c => !rulesMatches.has(c)).forEach(c => console.log(' * MISSING: ' + c));
