const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('view-shadow-world');
const end = html.indexOf('</section>', start);
const shadowHtml = html.substring(start, end);
const regex = /<button[\s\S]*?<\/button>/g;
let m;
while ((m = regex.exec(shadowHtml)) !== null) {
  const b = m[0];
  const idM = b.match(/id=["'](.*?)["']/);
  const clM = b.match(/class=["'](.*?)["']/);
  const locM = b.match(/data-shadow-loc=["'](.*?)["']/);
  console.log({
    id: idM ? idM[1] : null,
    class: clM ? clM[1] : null,
    loc: locM ? locM[1] : null
  });
}
