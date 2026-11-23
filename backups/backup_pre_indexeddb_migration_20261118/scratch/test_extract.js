const fs = require('fs');

const pyContent = fs.readFileSync('scratch/update_index_pinwheel_and_yawn.cjs', 'utf8');
const pToken = 'const pinwheelSection = `';
const pStart = pyContent.indexOf(pToken) + pToken.length;
const pEnd = pyContent.indexOf('`;\n\nconst yawnSection = `');
const pinwheelSection = pyContent.substring(pStart, pEnd).trim();

const yToken = 'const yawnSection = `';
const yStart = pyContent.indexOf(yToken) + yToken.length;
const yEnd = pyContent.indexOf('`;\n\nconst anchor =');
const yawnSection = pyContent.substring(yStart, yEnd).trim();

console.log('Pinwheel section has id view-pinwheel-world?', pinwheelSection.includes('id="view-pinwheel-world"'));
console.log('Yawn section has id view-yawn-world?', yawnSection.includes('id="view-yawn-world"'));

// Check ash
const ashContent = fs.readFileSync('scratch/insert_ash_section.cjs', 'utf8');
const aToken = 'const ashSection = `';
const aStart = ashContent.indexOf(aToken) + aToken.length;
const aEnd = ashContent.indexOf('`;\n\nconst anchor =');
const ashSection = ashContent.substring(aStart, aEnd).trim();
console.log('Ash section has id view-ash-world?', ashSection.includes('id="view-ash-world"'));

// Check usagain
const usaContent = fs.readFileSync('scratch/insert_usagain_section.cjs', 'utf8');
const uToken = 'const usagainSectionHtml = `';
const uStart = usaContent.indexOf(uToken) + uToken.length;
const uEnd = usaContent.indexOf('`;\n\nconst updatedHtml =');
const usagainSection = usaContent.substring(uStart, uEnd).trim();
console.log('Usagain section has id view-usagain-world?', usagainSection.includes('id="view-usagain-world"'));

// Check hot
const hotContent = fs.readFileSync('scratch/insert_hot_section.txt', 'utf8');
const hStart = hotContent.indexOf('<!-- VIEW: ROYAN');
const hEnd = hotContent.indexOf('<!-- ========================================================\n      <!-- VIEW: SHADOW');
const hotSection = hotContent.substring(hStart, hEnd).trim();
console.log('Hot section has id view-hot-world?', hotSection.includes('id="view-hot-world"'));
