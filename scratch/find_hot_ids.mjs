import fs from 'fs';

const js = fs.readFileSync('hot_view.js', 'utf8');
const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
const ids = new Set();
let match;
while ((match = idRegex.exec(js)) !== null) {
  ids.add(match[1]);
}
console.log('IDs in hot_view.js:');
console.log(JSON.stringify(Array.from(ids).sort(), null, 2));

const queryRegex = /querySelector(?:All)?\(['"]([^'"]+)['"]\)/g;
const selectors = new Set();
while ((match = queryRegex.exec(js)) !== null) {
  selectors.add(match[1]);
}
console.log('Selectors in hot_view.js:');
console.log(JSON.stringify(Array.from(selectors).sort(), null, 2));

