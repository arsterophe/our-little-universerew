const fs = require('fs');
const rules = fs.readFileSync('firestore.rules', 'utf8');

const start = rules.indexOf('match /messages/{messageId}');
const end = rules.indexOf('match /game_records');
console.log(rules.slice(start, end));
