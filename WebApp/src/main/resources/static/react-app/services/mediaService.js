const mediaService = {
    uploadFile: async (file, propertyId, mediaType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('propertyId', propertyId);
        formData.append('mediaType', mediaType);

        const response = await axios.post(`${API_CONFIG.BASE_URL}/api/media/upload`, formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getPresignedUrl: async (fileName, contentType, mediaType) => {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/media/presigned-url`, {
            params: { fileName, contentType, mediaType },
            withCredentials: true
        });
        return response.data;
    }
};
