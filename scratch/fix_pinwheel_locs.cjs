const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add data-pinwheel-loc to location buttons
html = html.replace(
  'class="pinwheel-loc-btn btn-loc-residence"',
  'class="pinwheel-loc-btn btn-loc-residence" data-pinwheel-loc="residence"'
);
html = html.replace(
  'class="pinwheel-loc-btn btn-loc-observatory"',
  'class="pinwheel-loc-btn btn-loc-observatory" data-pinwheel-loc="observatory"'
);
html = html.replace(
  'class="pinwheel-loc-btn btn-loc-studio"',
  'class="pinwheel-loc-btn btn-loc-studio" data-pinwheel-loc="studio"'
);
html = html.replace(
  'class="pinwheel-loc-btn btn-loc-gazebo"',
  'class="pinwheel-loc-btn btn-loc-gazebo" data-pinwheel-loc="gazebo"'
);
html = html.replace(
  'class="pinwheel-loc-btn btn-loc-fishing"',
  'class="pinwheel-loc-btn btn-loc-fishing" data-pinwheel-loc="fishing"'
);
html = html.replace(
  'class="pinwheel-loc-btn btn-loc-catgarden"',
  'class="pinwheel-loc-btn btn-loc-catgarden" data-pinwheel-loc="catgarden"'
);
html = html.replace(
  'class="pinwheel-loc-btn btn-loc-mailbox"',
  'class="pinwheel-loc-btn btn-loc-mailbox" data-pinwheel-loc="mailbox"'
);

// 2. Fix fishing modal IDs
html = html.replace('id="pinwheel-bobber"', 'id="fishing-bobber"');
html = html.replace('id="pinwheel-bite-alert"', 'id="fishing-bite-alert"');
html = html.replace('id="pinwheel-fish-status"', 'id="fishing-status-hint"');
html = html.replace('Lempar Kail 🎣</button>', '<span id="fish-action-label">Lempar Kail 🎣</span></button>');

// 3. Add recent catches grid container inside fishing modal
const modalTarget = '<div style="display:flex; justify-content:space-between; align-items:center;">';
if (html.includes(modalTarget)) {
  html = html.replace(
    modalTarget,
    '<div id="pinwheel-recent-catches-grid" class="pinwheel-catches-grid" style="margin-bottom:10px;"></div>\n            ' + modalTarget
  );
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully enhanced pinwheel location and fishing attributes');

