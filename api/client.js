export function getApiBaseUrl() {
    return '/api';
}

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    const baseUrl = getApiBaseUrl();

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, config);

        if (response.status === 401) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('jwt_token');
            sessionStorage.removeItem('currentUser');

            const text = await response.text();
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch (parseErr) {}

            const msg = data.error?.message || data.message || 'Invalid email or password';
            if (typeof window !== 'undefined' && !window.location.pathname.includes('loginRegister.html') && !endpoint.includes('/auth/login')) {
                window.location.href = '../pages/loginRegister.html';
            }
            throw new Error(msg);
        }

        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (parseErr) {
            throw new Error(`Server returned non-JSON response (${response.status}). Please make sure backend is running on port 5000.`);
        }

        if (!response.ok) {
            const msg = data.error?.message || data.message || `API Error (${response.status})`;
            throw new Error(msg);
        }

        return data;
    } catch (error) {
        console.error(`API request (${endpoint}):`, error);
        throw error;
    }
}