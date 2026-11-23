const fs = require('fs');
const rules = fs.readFileSync('firestore.rules', 'utf8');

const lines = rules.split('\n');
console.log(lines.slice(520, 650).join('\n'));
