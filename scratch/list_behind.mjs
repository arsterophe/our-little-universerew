import fs from 'fs';

const files = fs.readdirSync('.');
console.log('Behind files:');
files.filter(f => f.toLowerCase().includes('behind')).forEach(f => console.log(' -', f));
