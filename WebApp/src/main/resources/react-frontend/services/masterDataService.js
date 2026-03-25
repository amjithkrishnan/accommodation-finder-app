const masterDataService = {
    getAllMasterData: async () => {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/master/all`, { withCredentials: true });
        return response.data;
    }
};
