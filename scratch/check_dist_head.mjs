import fs from 'fs';

const dist = fs.readFileSync('dist/index.html', 'utf8');
const headEnd = dist.indexOf('</head>');
console.log('--- HEAD OF DIST ---');
console.log(dist.substring(0, headEnd + 7));
