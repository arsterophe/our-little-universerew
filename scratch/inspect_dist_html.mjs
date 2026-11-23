import fs from 'fs';

const dist = fs.readFileSync('dist/index.html', 'utf8');
console.log('Dist length:', dist.length);
const views = dist.match(/id="view-[^"]+"/g) || [];
console.log('Dist views count:', views.length);
console.log('Dist views:', views);
