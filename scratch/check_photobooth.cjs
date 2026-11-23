const fs = require('fs');
const rules = fs.readFileSync('firestore.rules', 'utf8');

const start = rules.indexOf('function isValidPhotoboothSession');
const end = rules.indexOf('function ', start + 10);
console.log(rules.slice(start, end));
