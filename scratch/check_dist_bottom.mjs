import fs from 'fs';

const dist = fs.readFileSync('dist/index.html', 'utf8');
const bodyEnd = dist.indexOf('</body>');
console.log('Snippet before </body>:');
console.log(dist.substring(bodyEnd - 300, bodyEnd + 7));
