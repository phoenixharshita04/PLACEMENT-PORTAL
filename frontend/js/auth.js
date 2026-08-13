const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
    ? 'http://localhost:8080/api/auth'
    : '/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        redirectBasedOnRole();
        return;
    }

    // Toggle between Login and Register
    document.getElementById('showRegister').addEventListener('click', () => {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('registerSection').classList.remove('hidden');
    });

    document.getElementById('showLogin').addEventListener('click', () => {
        document.getElementById('registerSection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
    });

    document.getElementById('showForgot').addEventListener('click', () => {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('forgotSection').classList.remove('hidden');
    });

    document.getElementById('showLoginFromForgot').addEventListener('click', () => {
        document.getElementById('forgotSection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
    });

    document.getElementById('forgotForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        window.setButtonLoading(submitBtn, true);
        const email = document.getElementById('forgotEmail').value;
        const msgDiv = document.getElementById('forgotMessage');
        msgDiv.style.color = 'var(--text-secondary)';
        msgDiv.textContent = 'Sending request...';

        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const text = await res.text();
            if (res.ok) {
                msgDiv.style.color = 'var(--success-color)';
                msgDiv.textContent = text;
                document.getElementById('forgotForm').reset();
            } else {
                msgDiv.style.color = 'var(--danger-color)';
                msgDiv.textContent = text;
            }
        } catch (error) {
            msgDiv.style.color = 'var(--danger-color)';
            msgDiv.textContent = 'Connection error. Is the backend running?';
        } finally {
            window.setButtonLoading(submitBtn, false);
        }
    });

    // Registration Role Tabs
    let currentRole = 'STUDENT';
    const tabStudent = document.getElementById('tabStudent');
    const tabCompany = document.getElementById('tabCompany');
    const studentFields = document.getElementById('studentFields');
    const companyFields = document.getElementById('companyFields');

    if(tabStudent && tabCompany) {
        tabStudent.addEventListener('click', () => {
            currentRole = 'STUDENT';
            tabStudent.style.color = 'var(--primary-color)';
            tabStudent.style.borderBottom = '2px solid var(--primary-color)';
            tabCompany.style.color = 'gray';
            tabCompany.style.borderBottom = 'none';
            studentFields.classList.remove('hidden');
            companyFields.classList.add('hidden');
        });

        tabCompany.addEventListener('click', () => {
            currentRole = 'COMPANY';
            tabCompany.style.color = 'var(--primary-color)';
            tabCompany.style.borderBottom = '2px solid var(--primary-color)';
            tabStudent.style.color = 'gray';
            tabStudent.style.borderBottom = 'none';
            companyFields.classList.remove('hidden');
            studentFields.classList.add('hidden');
        });
    }

    // Login Form Submit
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        window.setButtonLoading(submitBtn, true);
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const contentType = res.headers.get("content-type");

            if (res.ok) {
                if (!contentType || !contentType.includes("application/json")) {
                    const rawText = await res.text();
                    console.log("RAW_BACKEND_RESPONSE:", rawText);
                    errorDiv.textContent = 'Server is waking up/warming up. Please try again.';
                    return;
                }

                const data = await res.json();
                console.log("RAW_BACKEND_RESPONSE:", data);

                if (data && data.token) {
                    const token = data.token;
                    const role = data.role;
                    const userId = data.userId || (data.user && data.user.id);
                    localStorage.setItem('token', token);
                    localStorage.setItem('role', role);
                    localStorage.setItem('user', JSON.stringify({ id: userId, role: role }));
                    redirectBasedOnRole(role);
                } else {
                    console.error("Invalid login response payload:", data);
                    errorDiv.textContent = 'Invalid login response format';
                }
            } else {
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    console.log("RAW_BACKEND_RESPONSE:", data);
                } else {
                    const rawText = await res.text();
                    console.log("RAW_BACKEND_RESPONSE:", rawText);
                }
                errorDiv.textContent = 'Invalid email or password';
            }
        } catch (error) {
            console.error("Login request failed:", error);
            errorDiv.textContent = 'Connection error. Is the backend running?';
        } finally {
            window.setButtonLoading(submitBtn, false);
        }
    });

    // Register Form Submit
    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            window.setButtonLoading(submitBtn, true);
            const errorDiv = document.getElementById('registerError');
            
            const payload = {
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                role: currentRole
            };

            if (currentRole === 'STUDENT') {
                payload.name = document.getElementById('regName').value;
                payload.rollNo = document.getElementById('regRollNo').value;
                payload.branch = document.getElementById('regDept').value;
                payload.cgpa = parseFloat(document.getElementById('regCgpa').value);
                payload.graduationYear = parseInt(document.getElementById('regYear').value);
            } else if (currentRole === 'COMPANY') {
                payload.company_name = document.getElementById('regCompanyName').value;
            }

            try {
                const res = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert('Registration successful! Please log in.');
                    document.getElementById('registerSection').classList.add('hidden');
                    document.getElementById('loginSection').classList.remove('hidden');
                    registerForm.reset();
                } else {
                    const errorText = await res.text();
                    errorDiv.textContent = errorText;
                }
            } catch (error) {
                errorDiv.textContent = 'Connection error. Is the backend running?';
            } finally {
                window.setButtonLoading(submitBtn, false);
            }
        });
    }
});

function redirectBasedOnRole(roleOverride) {
    const role = roleOverride || localStorage.getItem('role');
    if (role === 'ADMIN') {
        window.location.href = 'admin-dashboard.html';
    } else if (role === 'COMPANY') {
        window.location.href = 'company-dashboard.html';
    } else {
        window.location.href = 'dashboard.html'; // Student dashboard
    }
}
