const { spawn, exec } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--remote-debugging-port=9225',
  'http://localhost:5174'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9225/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const target = tabs.find(t => t.url.includes('localhost:5174'));
      if (!target) {
        cleanup();
        return;
      }
      
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      const t0 = Date.now();
      const requests = [];
      
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Network.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      };

      ws.onmessage = (msg) => {
        const p = JSON.parse(msg.data);
        if (p.method === 'Network.requestWillBeSent') {
          const url = p.params.request.url;
          requests.push({ id: p.params.requestId, url, time: Date.now() - t0 });
        }
        if (p.method === 'Network.loadingFinished') {
          const r = requests.find(x => x.id === p.params.requestId);
          if (r) {
            r.size = p.params.encodedDataLength;
            console.log(`[REQ FINISHED +${Date.now() - t0}ms] ${(r.size/1024).toFixed(1)} KB - ${r.url}`);
          }
        }
        if (p.method === 'Runtime.consoleAPICalled') {
          const text = p.params.args.map(a => a.value || a.description || '').join(' ');
          console.log(`[CONSOLE +${Date.now() - t0}ms] [${p.params.type}]`, text);
        }
      };

      setTimeout(() => {
        cleanup();
      }, 5000);
    });
  });
}, 1500);

function cleanup() {
  exec('taskkill /F /IM chrome.exe /T', () => process.exit(0));
}
