const fs = require('fs');
let main = fs.readFileSync('main.js', 'utf8');

// Check how many times view-eclipse is already in main.js
const existingCount = (main.match(/view-eclipse/g) || []).length;
console.log('Existing view-eclipse count in main.js:', existingCount);

if (existingCount < 4) {
  // Place 1 & 3: array with view-bloom-cottage].forEach
  main = main.replace(/'view-bloom-cottage'\]\.forEach/g, "'view-bloom-cottage', 'view-eclipse'].forEach");

  // Place 4: in allProtectedViews array
  main = main.replace(/'view-bloom-cottage'\r?\n\s*\];/g, "'view-bloom-cottage',\n    'view-eclipse'\n  ];");

  fs.writeFileSync('main.js', main, 'utf8');
  console.log('main.js updated.');
}

const newCount = (fs.readFileSync('main.js', 'utf8').match(/view-eclipse/g) || []).length;
console.log('New view-eclipse count in main.js:', newCount);
