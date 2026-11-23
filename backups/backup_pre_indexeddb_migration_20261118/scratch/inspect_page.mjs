import http from 'http';

async function check() {
  const res = await fetch('http://localhost:5173');
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('HTML length:', text.length);
  console.log('Includes card-hot:', text.includes('card-hot'));
  console.log('Includes view-private-universe:', text.includes('view-private-universe'));
  console.log('Includes Eight worlds:', text.includes('Eight worlds'));
}
check();

