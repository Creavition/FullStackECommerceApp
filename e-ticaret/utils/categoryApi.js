import axios from 'axios';

const API_BASE_URL = 'http://10.241.64.12:5207/api/Category';

export const categoryApi = {
    // Tüm kategorileri getir (bedenler dahil)
    getAllCategories: async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    // Tek kategori getir
    getCategory: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category:', error);
            throw error;
        }
    },

    // Kategori oluştur
    createCategory: async (categoryName) => {
        try {
            const response = await axios.post(API_BASE_URL, { categoryName });
            return response.data;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    // Kategori güncelle
    updateCategory: async (id, categoryName) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, { categoryName });
            return response.data;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },

    // Kategori sil
    deleteCategory: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    },

    // Kategoriye beden ekle
    addSizeToCategory: async (categoryId, sizeName) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${categoryId}/sizes`, {
                sizeName,
                categoryId
            });
            return response.data;
        } catch (error) {
            console.error('Error adding size:', error);
            throw error;
        }
    },

    // Kategori bedenlerini getir
    getCategorySizes: async (categoryId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${categoryId}/sizes`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category sizes:', error);
            throw error;
        }
    },

    // Beden sil
    deleteSize: async (sizeId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/sizes/${sizeId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting size:', error);
            throw error;
        }
    },

    // Varsayılan kategorileri ekle
    seedCategories: async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/seed`);
            return response.data;
        } catch (error) {
            console.error('Error seeding categories:', error);
            throw error;
        }
    }
};
