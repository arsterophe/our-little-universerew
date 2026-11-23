const fs = require('fs');
const fb = fs.readFileSync('firebase.js', 'utf8');

const lines = fb.split('\n');
console.log(lines.slice(2880, 2940).join('\n'));
