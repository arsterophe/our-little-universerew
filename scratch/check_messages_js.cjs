const fs = require('fs');
const m = fs.readFileSync('messages.js', 'utf8');

const lines = m.split('\n');
console.log(lines.slice(0, 100).join('\n'));
