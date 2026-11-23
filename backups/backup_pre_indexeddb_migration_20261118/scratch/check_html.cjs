const http = require('http');
http.get('http://localhost:5174', res => {
  let s = '';
  res.on('data', c => s += c);
  res.on('end', () => {
    const scripts = s.match(/<script[^>]*>.*?<\/script>|<script[^>]*>/gis) || [];
    console.log('Scripts found in HTML:', scripts);
  });
});
