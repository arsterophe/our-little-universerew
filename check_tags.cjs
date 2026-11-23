const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('id="lotus-behind-overlay"');
const openDiv = html.lastIndexOf('<div class="lotus-behind-overlay"', start);
const endSection = html.indexOf('</section>', start);
const overlayChunk = html.slice(openDiv, endSection);

const openDivs = (overlayChunk.match(/<div\b/g) || []).length;
const closeDivs = (overlayChunk.match(/<\/div>/g) || []).length;
console.log('openDivs:', openDivs, 'closeDivs:', closeDivs);

const openArticles = (overlayChunk.match(/<article\b/g) || []).length;
const closeArticles = (overlayChunk.match(/<\/article>/g) || []).length;
console.log('openArticles:', openArticles, 'closeArticles:', closeArticles);

const openButtons = (overlayChunk.match(/<button\b/g) || []).length;
const closeButtons = (overlayChunk.match(/<\/button>/g) || []).length;
console.log('openButtons:', openButtons, 'closeButtons:', closeButtons);

const openHeaders = (overlayChunk.match(/<header\b/g) || []).length;
const closeHeaders = (overlayChunk.match(/<\/header>/g) || []).length;
console.log('openHeaders:', openHeaders, 'closeHeaders:', closeHeaders);
