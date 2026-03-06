const authService = {
    me: async () => {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/auth/me`, { withCredentials: true });
        return response.data;
    },

    login: async (email, password) => {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/login`, { email, password }, { withCredentials: true });
        return response.data;
    },

    register: async (email, password) => {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/register`, { email, password }, { withCredentials: true });
        return response.data;
    },

    logout: async () => {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
        return response.data;
    },

    checkSession: async () => {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/auth/check`, { withCredentials: true });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/forgot-password`, { email }, { withCredentials: true });
        return response.data;
    }
};
