import fs from 'fs';

const content = fs.readFileSync('verify_pinwheel_studio_live.mjs', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(50, 100).join('\n'));
