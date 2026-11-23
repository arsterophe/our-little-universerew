const fs = require('fs');
const code = fs.readFileSync('eclipse_view.js', 'utf8');
const ids = [];
const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let m;
while ((m = regex.exec(code)) !== null) {
  ids.push(m[1]);
}
console.log('Unique IDs in eclipse_view.js:', Array.from(new Set(ids)));
