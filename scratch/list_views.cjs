const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /id=["'](view-[^"']+)["']/g;
let m;
const viewIds = [];
while ((m = regex.exec(html)) !== null) {
  viewIds.push(m[1]);
}
console.log('All view IDs:', viewIds);
