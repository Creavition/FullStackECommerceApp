import apiClient, { API_ENDPOINTS } from './apiClient';

export const reviewApi = {
    // Ürün değerlendirmelerini getir
    getProductReviews: async (productId) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.REVIEW}/Product/${productId}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Ürün değerlendirme istatistiklerini getir
    getProductReviewStats: async (productId) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.REVIEW}/Stats/${productId}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Yeni değerlendirme ekle
    addReview: async (reviewData) => {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.REVIEW}`, reviewData);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Değerlendirme güncelle
    updateReview: async (reviewId, reviewData) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.REVIEW}/${reviewId}`, reviewData);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Değerlendirme sil
    deleteReview: async (reviewId) => {
        try {
            const response = await apiClient.delete(`${API_ENDPOINTS.REVIEW}/${reviewId}`);
            return response.status === 204;
        } catch (error) {
                        throw error;
        }
    },

    // Kullanıcının değerlendirmelerini getir
    getUserReviews: async (userId) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.REVIEW}/User/${userId}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Belirli bir değerlendirmeyi getir
    getReviewById: async (reviewId) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.REVIEW}/${reviewId}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    }
};

export default reviewApi;
