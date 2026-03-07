// CSRF Token helper
const getCsrfToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
        }
    }
    return null;
};

// Fetch CSRF token on app load
axios.get(`${API_CONFIG.BASE_URL}/api/csrf`, { withCredentials: true }).catch(() => {});

// Axios interceptor to add CSRF token to all state-changing requests
axios.interceptors.request.use(config => {
    const token = getCsrfToken();
    if (token && (config.method === 'post' || config.method === 'put' || config.method === 'delete')) {
        config.headers['X-XSRF-TOKEN'] = token;
    }
    return config;
});
