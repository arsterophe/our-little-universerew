const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const shadowStart = html.indexOf('id="view-shadow-world"');
console.log('shadowStart:', shadowStart);
const nextSection = html.indexOf('</section>', shadowStart);
console.log('shadowSectionEnd:', nextSection);
console.log('Context after shadowSectionEnd:', html.slice(nextSection, nextSection + 200));
