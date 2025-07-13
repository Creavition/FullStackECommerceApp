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
        console.error('Product API Error:', error.response?.data || error.message);
        throw error;
    }
);

export const productApi = {
    // Tüm ürünleri getir
    getAllProducts: async () => {
        try {
            const response = await api.get('/Product');
            return response.data;
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    },

    // Belirli bir ürünü getir
    getProductById: async (id) => {
        try {
            const response = await api.get(`/Product/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    },

    // Kategoriye göre ürünleri getir
    getProductsByCategory: async (categoryId) => {
        try {
            const response = await api.get(`/Product/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            throw error;
        }
    },

    // En çok satanları getir
    getBestSellers: async () => {
        try {
            const response = await api.get('/Product/bestsellers');
            return response.data;
        } catch (error) {
            console.error('Error fetching bestsellers:', error);
            throw error;
        }
    },

    // Flash sale ürünlerini getir
    getFlashSaleProducts: async () => {
        try {
            const response = await api.get('/Product/flashsale');
            return response.data;
        } catch (error) {
            console.error('Error fetching flash sale products:', error);
            throw error;
        }
    },

    // Hızlı teslimat ürünlerini getir
    getFastDeliveryProducts: async () => {
        try {
            const response = await api.get('/Product/fastdelivery');
            return response.data;
        } catch (error) {
            console.error('Error fetching fast delivery products:', error);
            throw error;
        }
    },

    // Ürünleri filtrele
    filterProducts: async (filters) => {
        try {
            const response = await api.post('/Product/filter', filters);
            return response.data;
        } catch (error) {
            console.error('Error filtering products:', error);
            throw error;
        }
    },

    // Yeni ürün oluştur
    createProduct: async (productData) => {
        try {
            const response = await api.post('/Product', productData);
            return response.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    // Ürün güncelle
    updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/Product/${id}`, productData);
            return response.data;
        } catch (error) {
            console.error(`Error updating product ${id}:`, error);
            throw error;
        }
    },

    // Ürün sil
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/Product/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting product ${id}:`, error);
            throw error;
        }
    },

    // Favori durumunu güncelle
    toggleFavorite: async (productId, isFavorite) => {
        try {
            const response = await api.put(`/Product/${productId}`, {
                isFavorite: isFavorite
            });
            return response.data;
        } catch (error) {
            console.error(`Error toggling favorite for product ${productId}:`, error);
            throw error;
        }
    }
};

// Ürün filtreleme yardımcı fonksiyonları
export const createProductFilter = ({
    categoryId = null,
    minPrice = null,
    maxPrice = null,
    sizeIds = null,
    badgeFlashSale = null,
    badgeBestSelling = null,
    labelBestSeller = null,
    labelFastDelivery = null,
    isFavorite = null,
    page = 1,
    pageSize = 20
} = {}) => {
    const filter = {
        page,
        pageSize
    };

    if (categoryId !== null) filter.categoryId = categoryId;
    if (minPrice !== null) filter.minPrice = minPrice;
    if (maxPrice !== null) filter.maxPrice = maxPrice;
    if (sizeIds !== null) filter.sizeIds = sizeIds;
    if (badgeFlashSale !== null) filter.badge_FlashSale = badgeFlashSale;
    if (badgeBestSelling !== null) filter.badge_BestSelling = badgeBestSelling;
    if (labelBestSeller !== null) filter.label_BestSeller = labelBestSeller;
    if (labelFastDelivery !== null) filter.label_FastDelivery = labelFastDelivery;
    if (isFavorite !== null) filter.isFavorite = isFavorite;

    return filter;
};

export default productApi;
