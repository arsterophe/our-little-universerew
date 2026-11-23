import fs from 'fs';

const files = fs.readdirSync('public/assets');
console.log('Room or interior backgrounds:');
files.filter(f => /manor|room|interior|studio|living|atelier|boutique|cottage/i.test(f)).forEach(f => console.log(' -', f));
