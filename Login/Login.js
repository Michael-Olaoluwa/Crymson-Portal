// ====== CONFIG ======
const API_URL = 'http://localhost:3000/api/auth/login';

// Select wrappers and forms
const wrapper = document.querySelector('.wrapper');
const staffLink = document.querySelector('.staff-link');
const studentLink = document.querySelector('.student-link');

staffLink.onclick = () => {
    wrapper.classList.add('active');
}
studentLink.onclick = () => {
    wrapper.classList.remove('active');
}

// ====== LOGIN FUNCTIONALITY ======

// Student form
const studentForm = document.querySelector('.form-box.student form');
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent page reload

    const registrationNumber = studentForm.querySelector('.form-box.student input[type="text"]').value.trim();
    const password = studentForm.querySelector('.form-box.student input[type="password"]').value.trim();

    if (!registrationNumber || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationNumber, password, userType: 'student' })
        });

        const data = await res.json();

        if(res.ok) {
            // Store token and user info if provided
            if(data.token) {
                localStorage.setItem('authToken', data.token);
            }
            if(data.user?.name) {
                localStorage.setItem('userName', data.user.name);
            }
            // Redirect to student dashboard
            window.location.href = 'student_dashboard.html';
        } else {
            alert(data.message || 'Login failed. Please try again.');
        }
    } catch (err) {
        console.error('Student login error:', err);
        alert('An error occurred during login. Please check your connection.');
    }
});

// Staff form
const staffForm = document.querySelector('.form-box.staff form');
staffForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const registrationNumber = staffForm.querySelector('.form-box.staff input[type="text"]').value.trim();
    const password = staffForm.querySelector('.form-box.staff input[type="password"]').value.trim();

    if (!registrationNumber || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationNumber, password, userType: 'staff' })
        });

        const data = await res.json();

        if(res.ok) {
            // Store token and role if provided
            if(data.token) {
                localStorage.setItem('authToken', data.token);
            }
            if(data.role) {
                localStorage.setItem('userRole', data.role);
            }
            if(data.user?.name) {
                localStorage.setItem('userName', data.user.name);
            }
            // Redirect based on role
            const role = data.role || 'lecturer';
            if(role === 'admission') {
                window.location.href = '../AdmissionOffice/AdmissionOffice.html';
            } else if(role === 'staff') {
                window.location.href = '../AdmissionOffice/AdmissionOffice.html'; // Staff can also access admission office
            } else {
                window.location.href = 'lecturer_dashboard.html'; // default
            }
        } else {
            alert(data.message || 'Login failed. Please try again.');
        }
    } catch (err) {
        console.error('Staff login error:', err);
        alert('An error occurred during login. Please check your connection.');
    }
});
