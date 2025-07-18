import apiClient, { API_ENDPOINTS } from './apiClient';

export const categoryApi = {
    // Tüm kategorileri getir (bedenler dahil)
    getAllCategories: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.CATEGORY);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Tek kategori getir
    getCategory: async (id) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.CATEGORY}/${id}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Kategori oluştur
    createCategory: async (categoryName) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.CATEGORY, { categoryName });
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Kategori güncelle
    updateCategory: async (id, categoryName) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.CATEGORY}/${id}`, { categoryName });
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Kategori sil
    deleteCategory: async (id) => {
        try {
            const response = await apiClient.delete(`${API_ENDPOINTS.CATEGORY}/${id}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Kategoriye beden ekle
    addSizeToCategory: async (categoryId, sizeName) => {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.CATEGORY}/${categoryId}/sizes`, {
                sizeName,
                categoryId
            });
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Kategori bedenlerini getir
    getCategorySizes: async (categoryId) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.CATEGORY}/${categoryId}/sizes`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Beden sil
    deleteSize: async (sizeId) => {
        try {
            const response = await apiClient.delete(`${API_ENDPOINTS.CATEGORY}/sizes/${sizeId}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Varsayılan kategorileri ekle
    seedCategories: async () => {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.CATEGORY}/seed`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    }
};
