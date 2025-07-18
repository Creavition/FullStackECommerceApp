import apiClient, { API_ENDPOINTS } from './apiClient';

export const creditCardApi = {
    // Tüm kredi kartlarını getir
    getAllCreditCards: async () => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.CREDIT_CARD}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Belirli bir kredi kartını getir
    getCreditCardById: async (id) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.CREDIT_CARD}/${id}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Yeni kredi kartı ekle
    addCreditCard: async (cardData) => {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.CREDIT_CARD}`, cardData);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Kredi kartı güncelle
    updateCreditCard: async (id, cardData) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.CREDIT_CARD}/${id}`, cardData);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Kredi kartı sil
    deleteCreditCard: async (id) => {
        try {
            const response = await apiClient.delete(`${API_ENDPOINTS.CREDIT_CARD}/${id}`);
            return response.status === 204;
        } catch (error) {
                        throw error;
        }
    },

    // Varsayılan kredi kartını ayarla
    setDefaultCreditCard: async (id) => {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.CREDIT_CARD}/${id}/SetDefault`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    }
};

export default creditCardApi;
