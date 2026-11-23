const { spawn, exec } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9222',
  'http://localhost:5174'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      try {
        const tabs = JSON.parse(data);
        console.log('Open tabs:', tabs.map(t => ({ title: t.title, url: t.url })));
      } catch (err) {
        console.log('Response:', data);
      }
      exec('taskkill /F /IM chrome.exe /T', () => process.exit(0));
    });
  }).on('error', (e) => {
    console.error('CDP connect error:', e.message);
    exec('taskkill /F /IM chrome.exe /T', () => process.exit(0));
  });
}, 3000);

