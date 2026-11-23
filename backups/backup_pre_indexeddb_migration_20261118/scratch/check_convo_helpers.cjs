const fs = require('fs');
const rules = fs.readFileSync('firestore.rules', 'utf8');

const start = rules.indexOf('function isAllowedConversation');
const end = rules.indexOf('function isValidMessage');
console.log(rules.slice(start, end));
