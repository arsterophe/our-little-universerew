const http = require('http');
const { spawn, exec } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:5173'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', async () => {
      const p = JSON.parse(d)[0];
      const ws = new WebSocket(p.webSocketDebuggerUrl);
      await new Promise(r => ws.onopen = r);
      let id = 1;
      const send = (m, params = {}) => new Promise(resolve => {
        const i = id++;
        const onm = (e) => {
          const data = JSON.parse(e.data);
          if (data.id === i) { ws.removeEventListener('message', onm); resolve(data.result); }
        };
        ws.addEventListener('message', onm);
        ws.send(JSON.stringify({ id: i, method: m, params }));
      });
      await send('Page.enable');
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('.view-section').forEach(e => e.classList.remove('active'));
          const v = document.getElementById('view-ash-world');
          if (v) { v.classList.add('active'); v.setAttribute('aria-hidden', 'false'); }
          document.querySelectorAll('.ash-modal-overlay').forEach(m => { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); });
        `
      });
      await new Promise(r => setTimeout(r, 1000));
      const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
      fs.writeFileSync('C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62\\ash_mobile_world_390x844.jpg', Buffer.from(shot.data, 'base64'));
      console.log('Mobile world screenshot saved!');
      ws.close();
      chrome.kill();
      exec('taskkill /F /IM chrome.exe /T', () => process.exit(0));
    });
  });
}, 2000);

