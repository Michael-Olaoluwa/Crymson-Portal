const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ registrationNumber: '220001S', password: 'password123' })
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
