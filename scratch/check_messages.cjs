const fs = require('fs');
const rules = fs.readFileSync('firestore.rules', 'utf8');

const start = rules.indexOf('function isValidMessage');
const end = rules.indexOf('function isValidGameRecord');
console.log(rules.slice(start, end));
