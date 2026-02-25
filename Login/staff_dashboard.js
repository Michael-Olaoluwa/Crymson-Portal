// staff_dashboard.js — ensures only non-admission staff can view this page
(function(){
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  const nameEl = document.getElementById('name');
  const regEl = document.getElementById('reg');
  const roleEl = document.getElementById('role');

  console.log('[staff_dashboard] token:', !!token, 'role:', role);

  function redirectToLogin() {
    console.log('[staff_dashboard] Redirecting to login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'Login.html';
  }

  if(!token || role !== 'staff') {
    console.warn('[staff_dashboard] Access denied - token:', !!token, 'role:', role);
    redirectToLogin();
    return;
  }

  console.log('[staff_dashboard] Fetching /api/auth/me');
  // Fetch profile info from backend
  fetch('http://localhost:3000/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => {
    console.log('[staff_dashboard] /me response status:', r.status);
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(data => {
    console.log('[staff_dashboard] /me data received:', data);
    nameEl.textContent = localStorage.getItem('userName') || (data.user && data.user.name) || '—';
    regEl.textContent = data.registrationNumber || '—';
    roleEl.textContent = data.role || role;
  }).catch(err => {
    console.error('[staff_dashboard] Fetch error:', err);
    redirectToLogin();
  });

  document.getElementById('logoutBtn').addEventListener('click', ()=>{
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'Login.html';
  });

})();
