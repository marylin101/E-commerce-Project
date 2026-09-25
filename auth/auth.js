import { apiRequest } from '../api/client.js';

export function getAuthToken() {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
}

export function getCurrentUser() {
    try {
        const u = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        return u ? JSON.parse(u) : null;
    } catch (e) {
        return null;
    }
}

export function isAuthenticated() {
    return !!getAuthToken();
}

export function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function storeSession(token, user, rememberMe = false) {
    if (rememberMe) {
        if (token) localStorage.setItem('jwt_token', token);
        if (user) localStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.removeItem('jwt_token');
        sessionStorage.removeItem('currentUser');
    } else {
        if (token) sessionStorage.setItem('jwt_token', token);
        if (user) sessionStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('currentUser');
    }
}

export async function registerUser(userData, rememberMe = false) {
    const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });

    const payload = res?.data || res;
    if (payload && payload.token) {
        storeSession(payload.token, payload.user, rememberMe);
    }
    return payload;
}

export async function loginUser(credentials, rememberMe = false) {
    const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

    const payload = res?.data || res;
    if (payload && payload.token && payload.user) {
        storeSession(payload.token, payload.user, rememberMe);
        return payload;
    }
    throw new Error(payload?.message || payload?.error?.message || 'Invalid email or password');
}

export function logoutUser() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('currentUser');
    window.location.href = '../pages/loginRegister.html';
}
