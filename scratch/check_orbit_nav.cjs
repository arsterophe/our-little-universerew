const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const worldViews = [
  { char: 'Nyanya', view: 'view-kidult-world' },
  { char: 'Lala', view: 'view-toyou-world' },
  { char: 'Lele', view: 'view-shadow-world' },
  { char: 'Syma', view: 'view-pinwheel-world' },
  { char: 'Akhira', view: 'view-yawn-world' },
  { char: 'Ruben', view: 'view-ash-world' },
  { char: 'Ela', view: 'view-usagain-world' },
  { char: 'Royan', view: 'view-hot-world' }
];

worldViews.forEach(({ char, view }) => {
  const idx = html.indexOf(`id="${view}"`);
  if (idx === -1) {
    console.log(char, view, 'NOT FOUND');
    return;
  }
  const nextIdx = html.indexOf('id="view-', idx + 10);
  const chunk = html.substring(idx, nextIdx !== -1 ? nextIdx : idx + 8000);
  console.log(`\n=================== ${char} (${view}) ===================`);
  
  const matches = chunk.match(/<(button|a)[^>]*id=["'][^"']+["'][^>]*>[\s\S]*?<\/\1>/gi) || [];
  matches.forEach(m => {
    const idMatch = m.match(/id=["']([^"']+)["']/);
    const textMatch = m.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    console.log(`  - [${idMatch ? idMatch[1] : 'no-id'}]: "${textMatch.substring(0, 40)}"`);
  });
});
