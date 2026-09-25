import { loginUser, registerUSer, logoutUser} from '../auth/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-button');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const errorEl = document.getElementById('login-error');
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                if (errorEl) {
                    errorEl.textContent = '';
                }

                submitButton.disabled = true;
                submitButton.textContent = 'Logging in...';

                const result = await loginUser({ email, password });
                const user = result?.user || result?.data?.user;
                if (!result || !user) {
                    throw new Error('Invalid email or password.');
                }
                if (user.role === 'admin') {
                    window.location.href = '../pages/adminProducts.html';
                } else {
                    window.location.href = '../pages/productlist.html';
                }
            } catch (error) {
                if (errorEl) {
                    errorEl.textContent = error.message || 'Invalid email or password.';
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Login';
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const errorEl = document.getElementById('register-error');
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            try {
                if (errorEl) {
                    errorEl.textContent = '';
                }

                submitButton.disabled = true;
                submitButton.textContent = 'Registering...';

                await registerUSer({ name, email, password });
                alert('Registration successful! Please log in.');
                window.location.href = '/login.html';
            } catch (error) {
                if (errorEl) {
                    errorEl.textContent = error.message || 'An error occurred during registration.';
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Register';
                }
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();
            logoutUser();
        });
    }
});