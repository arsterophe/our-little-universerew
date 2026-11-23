const fs = require('fs');

const hotContent = fs.readFileSync('scratch/insert_hot_section.txt', 'utf8');
const start = hotContent.indexOf('<!-- ======================================================== -->\n      <!-- VIEW: ROYAN');
const end = hotContent.indexOf('<!-- ======================================================== -->\n      <!-- VIEW: SHADOW');
const hotSection = hotContent.substring(start, end).trim();

console.log('start:', start, 'end:', end);
console.log('hotSection includes id="view-hot-world"?', hotSection.includes('id="view-hot-world"'));
