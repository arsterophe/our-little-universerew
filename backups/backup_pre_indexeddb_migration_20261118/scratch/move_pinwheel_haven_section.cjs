const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const startTag = '<!-- ============================================== -->\n      <!-- VIEW: THE PINWHEEL HAVEN — SYMA\'S RESIDENCE   -->';
const endTag = '</section>\n';

const havenStart = html.indexOf(startTag);
if (havenStart === -1) {
  console.error('Haven start not found');
  process.exit(1);
}

// Find the closing </section> of view-pinwheel-haven
const sectionTag = '<section class="view-section view-pinwheel-haven"';
const actualStart = html.indexOf(sectionTag, havenStart);
const sectionEnd = html.indexOf('</section>', actualStart);

const fullHavenBlock = html.substring(havenStart, sectionEnd + '</section>'.length);
console.log('Found full Haven block of length:', fullHavenBlock.length);

// Remove it from current spot
html = html.replace(fullHavenBlock, '');

// Place it right after view-dragon-den
const dragonDenEndTag = 'aria-label="THE DRAGON\'S DEN';
const dragonDenPos = html.indexOf(dragonDenEndTag);
if (dragonDenPos === -1) {
  console.error('Dragon den not found');
  process.exit(1);
}

const dragonDenSectionEnd = html.indexOf('</section>', dragonDenPos);
const insertPoint = dragonDenSectionEnd + '</section>'.length;

html = html.substring(0, insertPoint) + '\n\n      ' + fullHavenBlock + html.substring(insertPoint);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully moved view-pinwheel-haven to top level after view-dragon-den!');
