import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const regex = /id=["'](view-[^"']+)["']/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[1]);
}
