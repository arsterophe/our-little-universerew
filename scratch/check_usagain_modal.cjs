const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('id="usagain-residence-modal"');
const end = html.indexOf('<!-- Modal 2:', start);
console.log(html.slice(start, end !== -1 ? end : start + 1500));
