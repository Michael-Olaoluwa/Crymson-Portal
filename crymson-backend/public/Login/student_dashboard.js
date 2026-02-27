(async () => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || '';

  // Ensure only students access this page
  if (!token || role !== 'student') {
    alert('You must be logged in as a student to view this page');
    window.location.href = 'Login.html';
    return;
  }

  document.getElementById('studentName').textContent = userName || 'Student';

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      // Log response for debugging
      const contentType = res.headers.get('content-type') || '';
      let bodyText = '';
      if (contentType.includes('application/json')) {
        bodyText = JSON.stringify(await res.json());
      } else {
        bodyText = await res.text();
      }
      console.error('Failed /me response', res.status, bodyText);
      throw new Error(bodyText || 'Failed to fetch profile');
    }

    const data = await res.json();
    document.getElementById('profileName').textContent = localStorage.getItem('userName') || '—';
    document.getElementById('profileReg').textContent = data.registrationNumber || '—';
    document.getElementById('profileRole').textContent = data.role || '—';
  } catch (err) {
    console.error('Error loading profile:', err);
    alert('Unable to load profile. Please login again.');
    localStorage.removeItem('authToken');
    window.location.href = 'Login.html';
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'Login.html';
  });
})();
