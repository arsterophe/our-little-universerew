const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<[^>]+id=["']view-selection["'][^>]*>/);
console.log('view-selection tag:', m ? m[0] : 'not found');
