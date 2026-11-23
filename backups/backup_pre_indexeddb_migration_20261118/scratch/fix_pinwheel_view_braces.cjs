const fs = require('fs');
let code = fs.readFileSync('pinwheel_view.js', 'utf8');

const needle = `    });
  }
    });
  }

  const btnEnterPinwheelGazebo`;

const replacement = `    });
  }

  const btnEnterPinwheelGazebo`;

if (code.includes(needle)) {
  code = code.replace(needle, replacement);
  fs.writeFileSync('pinwheel_view.js', code, 'utf8');
  console.log('Fixed extra closing braces in pinwheel_view.js!');
} else {
  console.error('Needle not found, checking with regex');
  code = code.replace(/    \}\);\r?\n  \}\r?\n    \}\);\r?\n  \}\r?\n\r?\n  const btnEnterPinwheelGazebo/, "    });\n  }\n\n  const btnEnterPinwheelGazebo");
  fs.writeFileSync('pinwheel_view.js', code, 'utf8');
  console.log('Regex fixed!');
}
