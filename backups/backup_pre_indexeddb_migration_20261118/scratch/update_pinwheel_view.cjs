const fs = require('fs');
let code = fs.readFileSync('pinwheel_view.js', 'utf8');

const oldSnippet = "const btnEnterPinwheelResidence = document.getElementById('btn-enter-pinwheel-residence');";
if (code.includes(oldSnippet)) {
  const target = code.substring(code.indexOf(oldSnippet));
  const endBlock = target.indexOf('  }');
  const oldBlock = target.substring(0, endBlock + 3);
  console.log('Found old block:\n', oldBlock);
  const newBlock = `const btnEnterPinwheelResidence = document.getElementById('btn-enter-pinwheel-residence');
  if (btnEnterPinwheelResidence) {
    btnEnterPinwheelResidence.addEventListener('click', () => {
      closeAllPinwheelModals();
      if (typeof onOpenResidence === 'function') {
        onOpenResidence();
      } else if (pinwheelResidenceCtrl && typeof pinwheelResidenceCtrl.openResidence === 'function') {
        pinwheelResidenceCtrl.openResidence(currentActiveUid);
      }
    });
  }`;
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('pinwheel_view.js', code, 'utf8');
  console.log('Successfully updated pinwheel_view.js!');
} else {
  console.error('Snippet not found!');
  process.exit(1);
}
