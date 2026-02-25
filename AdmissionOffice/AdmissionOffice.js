const API_URL = 'http://localhost:3000/api/auth';

// Check if user is authenticated and has admin access
document.addEventListener('DOMContentLoaded', () => {
    checkAuthorization();
    setupFormListener();
    loadAddedUsers();
});

function checkAuthorization() {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (!token) {
        alert('You must be logged in to access the admission office');
        window.location.href = '../Login/Login.html';
        return;
    }

    if (role !== 'admission') {
        alert('You do not have permission to access the admission office');
        window.location.href = '../Login/Login.html';
        return;
    }

    // Update greeting
    const userName = localStorage.getItem('userName') || 'Admin';
    document.getElementById('userGreeting').textContent = `Welcome, ${userName}`;
}

function setupFormListener() {
    const form = document.getElementById('addUserForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('fullName').value.trim();
        const registrationNumber = document.getElementById('registrationNumber').value.trim().toUpperCase();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const messageDiv = document.getElementById('formMessage');

        // Clear previous message
        messageDiv.textContent = '';
        messageDiv.classList.remove('success', 'error');

        // Validate input
        if (!name || !registrationNumber || !password || !role) {
            showMessage('Please fill in all fields', 'error', messageDiv);
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error', messageDiv);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    registrationNumber,
                    password,
                    role
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`✓ User "${name}" created successfully as ${role}`, 'success', messageDiv);
                form.reset();

                // Add to table
                addUserToTable(name, registrationNumber, role);

                // Save to localStorage for display
                saveUserToLocalStorage({ name, registrationNumber, role });
            } else {
                showMessage(`Error: ${data.message}`, 'error', messageDiv);
            }
        } catch (err) {
            console.error('Error adding user:', err);
            showMessage('Connection error. Make sure the server is running.', 'error', messageDiv);
        }
    });
}

function showMessage(message, type, element) {
    element.textContent = message;
    element.classList.add(type);
    element.style.display = 'block';

    // Auto-hide success message after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            element.textContent = '';
            element.classList.remove(type);
            element.style.display = 'none';
        }, 5000);
    }
}

function addUserToTable(name, registrationNumber, role) {
    const tableBody = document.getElementById('usersTableBody');

    // Remove "No users" message if present
    const noDataRow = tableBody.querySelector('.no-data');
    if (noDataRow) {
        noDataRow.parentElement.remove();
    }

    // Create new row
    const row = document.createElement('tr');
    const now = new Date().toLocaleString();

    row.innerHTML = `
        <td>${name}</td>
        <td>${registrationNumber}</td>
        <td><span class="role-badge role-${role}">${capitalizeRole(role)}</span></td>
        <td>${now}</td>
    `;

    tableBody.insertBefore(row, tableBody.firstChild);

    // Keep only last 5 entries in display
    while (tableBody.children.length > 5) {
        tableBody.removeChild(tableBody.lastChild);
    }
}

function loadAddedUsers() {
    const users = JSON.parse(localStorage.getItem('addedUsers') || '[]');
    const tableBody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        return;
    }

    tableBody.innerHTML = '';

    users.reverse().slice(0, 5).forEach(user => {
        addUserToTable(user.name, user.registrationNumber, user.role);
    });
}

function saveUserToLocalStorage(user) {
    const users = JSON.parse(localStorage.getItem('addedUsers') || '[]');
    users.push({ ...user, dateAdded: new Date().toLocaleString() });
    localStorage.setItem('addedUsers', JSON.stringify(users.slice(-20))); // Keep last 20
}

function capitalizeRole(role) {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    alert('You have been logged out');
    window.location.href = '../Login/Login.html';
}

// Add styles for role badges
const style = document.createElement('style');
style.textContent = `
    .role-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }

    .role-student {
        background: #cce5ff;
        color: #0052cc;
    }

    .role-staff {
        background: #ccf0f0;
        color: #005c5c;
    }

    .role-admission {
        background: #ffcccc;
        color: #cc0000;
    }
`;
document.head.appendChild(style);
