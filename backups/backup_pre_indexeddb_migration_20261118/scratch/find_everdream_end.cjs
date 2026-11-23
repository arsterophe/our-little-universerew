const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('id="view-everdream-house"');
const nextSection = html.indexOf('class="view-section', start + 40);
const closingBefore = html.lastIndexOf('</section>', nextSection);
console.log('Start:', start);
console.log('Next section:', nextSection);
console.log('Closing section:', closingBefore);
console.log('Context around closing:\n', html.substring(closingBefore - 200, closingBefore + 150));
