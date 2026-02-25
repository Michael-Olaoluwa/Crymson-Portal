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

    const registrationNumber = studentForm.querySelector('input[type="text"]').value;
    const password = studentForm.querySelector('input[type="password"]').value;

    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationNumber, password })
        });

        const text = await res.text();

        if(res.ok) {
            // redirect based on backend response
            if(text.includes('Student dashboard')) {
                window.location.href = 'student_dashboard.html'; // create this page later
            } else {
                alert(text);
            }
        } else {
            alert(text);
        }
    } catch (err) {
        console.error(err);
        alert(err);
    }
});

// Staff form
const staffForm = document.querySelector('.form-box.staff form');
staffForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const registrationNumber = staffForm.querySelector('input[type="text"]').value;
    const password = staffForm.querySelector('input[type="password"]').value;

    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationNumber, password })
        });

        const text = await res.text();

        if(res.ok) {
            // redirect based on role in backend response
            if(text.includes('Lecturer dashboard')) {
                window.location.href = 'lecturer_dashboard.html'; // create this page later
            } else if(text.includes('HOD dashboard')) {
                window.location.href = 'hod_dashboard.html';
            } else if(text.includes('Dean dashboard')) {
                window.location.href = 'dean_dashboard.html';
            } else {
                alert(text);
            }
        } else {
            alert(text);
        }
    } catch (err) {
        console.error(err);
        alert(err);
    }
});
