import axios from 'axios';

const API_BASE_URL = 'http://10.241.64.12:5207/api';

export const addressApi = {
    // Tüm adresleri getir
    getAllAddresses: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Address`);
            return response.data;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw error;
        }
    },

    // Belirli bir adresi getir
    getAddressById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Address/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching address ${id}:`, error);
            throw error;
        }
    },

    // Yeni adres ekle
    addAddress: async (addressData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Address`, addressData);
            return response.data;
        } catch (error) {
            console.error('Error adding address:', error);
            throw error;
        }
    },

    // Adres güncelle
    updateAddress: async (id, addressData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/Address/${id}`, addressData);
            return response.data;
        } catch (error) {
            console.error(`Error updating address ${id}:`, error);
            throw error;
        }
    },

    // Adres sil
    deleteAddress: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/Address/${id}`);
            return response.status === 204;
        } catch (error) {
            console.error(`Error deleting address ${id}:`, error);
            throw error;
        }
    },

    // Varsayılan adresi ayarla
    setDefaultAddress: async (id) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Address/${id}/SetDefault`);
            return response.data;
        } catch (error) {
            console.error(`Error setting default address ${id}:`, error);
            throw error;
        }
    }
};

export default addressApi;
