import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.210:5207/api';

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
        console.error('Address API Error:', error.response?.data || error.message);
        throw error;
    }
);

export const addressApi = {
    // Tüm adresleri getir
    getAllAddresses: async () => {
        try {
            const response = await api.get('/Address');
            return response.data;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw error;
        }
    },

    // Belirli bir adresi getir
    getAddressById: async (id) => {
        try {
            const response = await api.get(`/Address/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching address ${id}:`, error);
            throw error;
        }
    },

    // Yeni adres ekle
    addAddress: async (addressData) => {
        try {
            const response = await api.post('/Address', addressData);
            return response.data;
        } catch (error) {
            console.error('Error adding address:', error);
            throw error;
        }
    },

    // Adres güncelle
    updateAddress: async (id, addressData) => {
        try {
            const response = await api.put(`/Address/${id}`, addressData);
            return response.data;
        } catch (error) {
            console.error(`Error updating address ${id}:`, error);
            throw error;
        }
    },

    // Adres sil
    deleteAddress: async (id) => {
        try {
            const response = await api.delete(`/Address/${id}`);
            return response.status === 204;
        } catch (error) {
            console.error(`Error deleting address ${id}:`, error);
            throw error;
        }
    },

    // Varsayılan adresi ayarla
    setDefaultAddress: async (id) => {
        try {
            const response = await api.post(`/Address/${id}/SetDefault`);
            return response.data;
        } catch (error) {
            console.error(`Error setting default address ${id}:`, error);
            throw error;
        }
    }
};

export default addressApi;
