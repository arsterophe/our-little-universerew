const { spawn, exec } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--remote-debugging-port=9231',
  'http://localhost:5174/'
]);

function pollCDP(retries = 10) {
  http.get('http://127.0.0.1:9231/json/list', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const tab = tabs.find(t => t.url.includes('localhost:5174'));
      if (!tab) {
        if (retries > 0) setTimeout(() => pollCDP(retries - 1), 400);
        else cleanup();
        return;
      }
      
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      let reloaded = false;

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      };

      ws.onmessage = (msg) => {
        const p = JSON.parse(msg.data);
        if (p.method === 'Page.loadEventFired') {
          if (!reloaded) {
            reloaded = true;
            console.log('First load complete. Triggering instant reload...');
            setTimeout(() => {
              ws.send(JSON.stringify({ id: 10, method: 'Page.reload' }));
            }, 600);
          } else {
            console.log('Second load complete! Measuring warm FCP & DOMContentLoaded...');
            setTimeout(() => {
              ws.send(JSON.stringify({
                id: 20,
                method: 'Runtime.evaluate',
                params: {
                  expression: `(() => {
                    const nav = performance.getEntriesByType('navigation')[0];
                    const paints = performance.getEntriesByType('paint');
                    const fcp = paints.find(p => p.name === 'first-contentful-paint');
                    const cardNyanya = document.getElementById('card-nyanya');
                    const viewSelection = document.getElementById('view-selection');
                    const loader = document.getElementById('cosmic-app-loader');

                    return {
                      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) + 'ms' : 'N/A',
                      loadEvent: nav ? Math.round(nav.loadEventEnd) + 'ms' : 'N/A',
                      firstContentfulPaint: fcp ? Math.round(fcp.startTime) + 'ms' : 'N/A',
                      cardsRendered: Boolean(cardNyanya),
                      selectionActive: Boolean(viewSelection && viewSelection.classList.contains('active')),
                      loaderHidden: loader ? loader.classList.contains('loaded') : false
                    };
                  })()`,
                  returnByValue: true
                }
              }));
            }, 300);
          }
        }
        if (p.id === 20) {
          console.log('\n=== REAL WARM LOAD AUDIT RESULT (localhost:5174) ===');
          console.log('State & Performance:', JSON.stringify(p.result.result.value, null, 2));
          cleanup();
        }
      };
    });
  }).on('error', () => {
    if (retries > 0) setTimeout(() => pollCDP(retries - 1), 400);
    else cleanup();
  });
}

pollCDP();

function cleanup() {
  exec('taskkill /F /IM chrome.exe /T', () => process.exit(0));
}
