import apiClient, { API_ENDPOINTS } from './apiClient';

export const addressApi = {
    // Tüm adresleri getir
    getAllAddresses: async () => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.ADDRESS}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Belirli bir adresi getir
    getAddressById: async (id) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.ADDRESS}/${id}`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Yeni adres ekle
    addAddress: async (addressData) => {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.ADDRESS}`, addressData);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Adres güncelle
    updateAddress: async (id, addressData) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.ADDRESS}/${id}`, addressData);
            return response.data;
        } catch (error) {
                        throw error;
        }
    },

    // Adres sil
    deleteAddress: async (id) => {
        try {
            const response = await apiClient.delete(`${API_ENDPOINTS.ADDRESS}/${id}`);
            return response.status === 204;
        } catch (error) {
                        throw error;
        }
    },

    // Varsayılan adresi ayarla
    setDefaultAddress: async (id) => {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.ADDRESS}/${id}/SetDefault`);
            return response.data;
        } catch (error) {
                        throw error;
        }
    }
};

export default addressApi;
