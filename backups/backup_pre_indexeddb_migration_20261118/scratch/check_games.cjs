const fs = require('fs');
const rules = fs.readFileSync('firestore.rules', 'utf8');

const start = rules.indexOf('function isValidGameRecord');
const end = rules.indexOf('function isValidStarMessage');
console.log(rules.slice(start, end));
