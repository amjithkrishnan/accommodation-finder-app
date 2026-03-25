const mediaUploadService = {
    uploadImage: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
            `${API_CONFIG.BASE_URL}/api/uploads/image`,
            formData,
            {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                }
            }
        );
        return response.data;
    },

    uploadVideo: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
            `${API_CONFIG.BASE_URL}/api/uploads/video`,
            formData,
            {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                }
            }
        );
        return response.data;
    }
};
