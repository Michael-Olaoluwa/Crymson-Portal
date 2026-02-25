// staff_dashboard.js — ensures only non-admission staff can view this page
(function(){
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  const nameEl = document.getElementById('name');
  const regEl = document.getElementById('reg');
  const roleEl = document.getElementById('role');

  function redirectToLogin() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'Login.html';
  }

  if(!token || role !== 'staff') {
    redirectToLogin();
    return;
  }

  // Fetch profile info from backend
  fetch('http://localhost:3000/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => {
    if(!r.ok) throw new Error('Unauthorized');
    return r.json();
  }).then(data => {
    nameEl.textContent = localStorage.getItem('userName') || (data.user && data.user.name) || '—';
    regEl.textContent = data.registrationNumber || '—';
    roleEl.textContent = data.role || role;
  }).catch(err => {
    console.error('Error loading profile:', err);
    redirectToLogin();
  });

  document.getElementById('logoutBtn').addEventListener('click', ()=>{
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'Login.html';
  });

})();
