const masterDataService = {
    getPropertyTypes: async () => {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/master/property-types`, { withCredentials: true });
        return response.data;
    },

    getAmenities: async () => {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/master/amenities`, { withCredentials: true });
        return response.data;
    }
};
