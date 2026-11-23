import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
lines.slice(0, 50).forEach((l, i) => {
  if (l.includes('<link rel="stylesheet"') || l.includes('</head>')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
