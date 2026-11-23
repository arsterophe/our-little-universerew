const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

['view-kidult-world', 'view-toyou-world', 'view-shadow-world'].forEach(id => {
  const idx = html.indexOf(`id="${id}"`);
  const chunk = html.substring(idx, idx + 5000);
  console.log(`\n=================== ${id} ===================`);
  const buttons = chunk.match(/<button[\s\S]*?<\/button>/gi) || [];
  buttons.slice(0, 10).forEach(b => {
    const idM = b.match(/id=["']([^"']+)["']/);
    const clsM = b.match(/class=["']([^"']+)["']/);
    const txt = b.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    console.log(`  id: ${idM ? idM[1] : 'none'}, class: ${clsM ? clsM[1] : 'none'}, text: "${txt.substring(0, 40)}"`);
  });
});
