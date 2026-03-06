const propertyService = {
    createProperty: async (formData) => {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/api/properties`, formData, { 
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateProperty: async (propertyId, formData) => {
        const response = await axios.put(`${API_CONFIG.BASE_URL}/api/properties/${propertyId}`, formData, { 
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getUserProperties: async () => {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/properties/user`, { withCredentials: true });
        return response.data;
    },

    getProperty: async (propertyId) => {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/properties/${propertyId}`, { withCredentials: true });
        return response.data;
    },

    deleteProperty: async (propertyId) => {
        const response = await axios.delete(`${API_CONFIG.BASE_URL}/api/properties/${propertyId}`, { withCredentials: true });
        return response.data;
    }
};
