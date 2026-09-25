import { loginUser, registerUser, logoutUser } from '../auth/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm') || document.getElementById('login-form');
    const registerForm = document.getElementById('registerForm') || document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-button');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const email = (document.getElementById('loginEmail') || document.getElementById('login-email'))?.value;
            const password = (document.getElementById('loginPassword') || document.getElementById('login-password'))?.value;
            const rememberMe = !!(document.getElementById('rememberMe')?.checked);

            if (!email || !password) {
                const msg = !email ? 'A valid email address is required.' : 'Password is required.';
                if (typeof showNotificationPrompt === 'function') {
                    showNotificationPrompt('Login Failed', msg, null);
                } else {
                    alert(msg);
                }
                return;
            }

            try {
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Logging in...';
                }

                const result = await loginUser({ email, password }, rememberMe);
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
                const msg = error.message || 'Invalid email or password.';
                if (typeof showNotificationPrompt === 'function') {
                    showNotificationPrompt('Login Failed', msg, null);
                } else {
                    alert(msg);
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Sign In';
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const name = (document.getElementById('regName') || document.getElementById('register-name'))?.value;
            const email = (document.getElementById('regEmail') || document.getElementById('register-email'))?.value;
            const password = (document.getElementById('regPassword') || document.getElementById('register-password'))?.value;

            if (!name || !email || !password) return;

            try {
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Registering...';
                }

                await registerUser({ name, email, password });
                if (typeof showNotificationPrompt === 'function') {
                    showNotificationPrompt('Account Created', 'Registration successful! Redirecting to products catalog...', () => {
                        window.location.href = '../pages/productlist.html';
                    });
                } else {
                    window.location.href = '../pages/productlist.html';
                }
            } catch (error) {
                const msg = error.message || 'An error occurred during registration.';
                if (typeof showNotificationPrompt === 'function') {
                    showNotificationPrompt('Registration Failed', msg, null);
                } else {
                    alert(msg);
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Create Account';
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