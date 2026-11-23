import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
let start = -1;
let end = -1;
lines.forEach((l, i) => {
  if (l.includes('id="view-kidult-gazebo"')) start = i;
  if (start !== -1 && end === -1 && i > start && l.includes('</section>')) end = i;
});

console.log(`view-kidult-gazebo found at lines ${start + 1} to ${end + 1}`);
console.log(lines.slice(start, end + 1).join('\n'));
