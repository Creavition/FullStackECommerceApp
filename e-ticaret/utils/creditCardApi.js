import axios from 'axios';

const API_BASE_URL = 'http://10.241.64.12:5207/api';

export const creditCardApi = {
    // Tüm kredi kartlarını getir
    getAllCreditCards: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/CreditCard`);
            return response.data;
        } catch (error) {
            console.error('Error fetching credit cards:', error);
            throw error;
        }
    },

    // Belirli bir kredi kartını getir
    getCreditCardById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/CreditCard/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching credit card ${id}:`, error);
            throw error;
        }
    },

    // Yeni kredi kartı ekle
    addCreditCard: async (cardData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/CreditCard`, cardData);
            return response.data;
        } catch (error) {
            console.error('Error adding credit card:', error);
            throw error;
        }
    },

    // Kredi kartı güncelle
    updateCreditCard: async (id, cardData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/CreditCard/${id}`, cardData);
            return response.data;
        } catch (error) {
            console.error(`Error updating credit card ${id}:`, error);
            throw error;
        }
    },

    // Kredi kartı sil
    deleteCreditCard: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/CreditCard/${id}`);
            return response.status === 204;
        } catch (error) {
            console.error(`Error deleting credit card ${id}:`, error);
            throw error;
        }
    },

    // Varsayılan kredi kartını ayarla
    setDefaultCreditCard: async (id) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/CreditCard/${id}/SetDefault`);
            return response.data;
        } catch (error) {
            console.error(`Error setting default credit card ${id}:`, error);
            throw error;
        }
    }
};

export default creditCardApi;
