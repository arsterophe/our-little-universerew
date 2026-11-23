const fs = require('fs');
const rules = fs.readFileSync('firestore.rules', 'utf8');

const lines = rules.split('\n');
console.log(lines.slice(380, 520).join('\n'));
