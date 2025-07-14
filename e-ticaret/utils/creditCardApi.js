import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.3:5207/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Credit Card API Error:', error.response?.data || error.message);
        throw error;
    }
);

export const creditCardApi = {
    // Tüm kredi kartlarını getir
    getAllCreditCards: async () => {
        try {
            const response = await api.get('/CreditCard');
            return response.data;
        } catch (error) {
            console.error('Error fetching credit cards:', error);
            throw error;
        }
    },

    // Belirli bir kredi kartını getir
    getCreditCardById: async (id) => {
        try {
            const response = await api.get(`/CreditCard/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching credit card ${id}:`, error);
            throw error;
        }
    },

    // Yeni kredi kartı ekle
    addCreditCard: async (cardData) => {
        try {
            const response = await api.post('/CreditCard', cardData);
            return response.data;
        } catch (error) {
            console.error('Error adding credit card:', error);
            throw error;
        }
    },

    // Kredi kartı güncelle
    updateCreditCard: async (id, cardData) => {
        try {
            const response = await api.put(`/CreditCard/${id}`, cardData);
            return response.data;
        } catch (error) {
            console.error(`Error updating credit card ${id}:`, error);
            throw error;
        }
    },

    // Kredi kartı sil
    deleteCreditCard: async (id) => {
        try {
            const response = await api.delete(`/CreditCard/${id}`);
            return response.status === 204;
        } catch (error) {
            console.error(`Error deleting credit card ${id}:`, error);
            throw error;
        }
    },

    // Varsayılan kredi kartını ayarla
    setDefaultCreditCard: async (id) => {
        try {
            const response = await api.post(`/CreditCard/${id}/SetDefault`);
            return response.data;
        } catch (error) {
            console.error(`Error setting default credit card ${id}:`, error);
            throw error;
        }
    }
};

export default creditCardApi;
