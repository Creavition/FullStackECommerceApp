import apiClient, { API_ENDPOINTS } from './apiClient';

export const productApi = {
    getAllProducts: async () => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    },

    getProductById: async (id) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    },

    getProductsByCategory: async (categoryId) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT}/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            throw error;
        }
    },

    getBestSellers: async () => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT}`);
            return (response.data || []).filter(p => p.badge_BestSelling);
        } catch (error) {
            console.error('Error fetching best sellers:', error);
            try {
                const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT}`);
                return response.data || [];
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw fallbackError;
            }
        }
    },

    getFlashSaleProducts: async () => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT}`);
            return (response.data || []).filter(p => p.badge_FlashSale);
        } catch (error) {
            console.error('Error fetching flash sale products:', error);
            try {
                const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT}`);
                return response.data || [];
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw fallbackError;
            }
        }
    },

    getFastDeliveryProducts: async () => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT}`);
            return (response.data || []).filter(p => p.label_FastDelivery);
        } catch (error) {
            console.error('Error fetching fast delivery products:', error);
            try {
                const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT}`);
                return response.data || [];
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw fallbackError;
            }
        }
    },

    filterProducts: async (filters) => {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.PRODUCT}/filter`, filters);
            return response.data;
        } catch (error) {
            console.error('Error filtering products:', error);
            throw error;
        }
    },

    createProduct: async (productData) => {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.PRODUCT}`, productData);
            return response.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.PRODUCT}/${id}`, productData);
            return response.data;
        } catch (error) {
            console.error(`Error updating product ${id}:`, error);
            throw error;
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await apiClient.delete(`${API_ENDPOINTS.PRODUCT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting product ${id}:`, error);
            throw error;
        }
    },

    toggleFavorite: async (productId, isFavorite) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.PRODUCT}/${productId}`, { isFavorite });
            return response.data;
        } catch (error) {
            console.error(`Error toggling favorite for product ${productId}:`, error);
            throw error;
        }
    },

    updateProductCategory: async (productId, categoryId) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.PRODUCT}/${productId}`, { categoryId });
            return response.data;
        } catch (error) {
            console.error(`Error updating product category for ${productId}:`, error);
            throw error;
        }
    },

    updateProductSizes: async (productId, sizeIds) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.PRODUCT}/${productId}/sizes`, { sizeIds });
            return response.data;
        } catch (error) {
            console.error(`Error updating product sizes for ${productId}:`, error);
            throw error;
        }
    },

    updateProductSizesGeneral: async (productId, sizeIds) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.PRODUCT}/${productId}`, { sizeIds });
            return response.data;
        } catch (error) {
            console.error(`Error updating product sizes (general) for ${productId}:`, error);
            throw error;
        }
    },

    updateProductCategoryAndSizes: async (productId, categoryId, sizeIds) => {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.PRODUCT}/${productId}`, { categoryId, sizeIds });
            return response.data;
        } catch (error) {
            console.error(`Error updating product category and sizes for ${productId}:`, error);
            throw error;
        }
    },

    updateProductSizesFromJson: async (productId, sizesData) => {
        try {
            let sizeIds = [];

            if (Array.isArray(sizesData)) {
                if (typeof sizesData[0] === 'number') {
                    sizeIds = sizesData;
                } else if (typeof sizesData[0] === 'string') {
                    const sizeNameToId = {
                        'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6
                    };
                    sizeIds = sizesData.map(name => sizeNameToId[name]).filter(Boolean);
                }
            } else if (sizesData?.sizeIds) {
                sizeIds = sizesData.sizeIds;
            }

            if (sizeIds.length === 0) throw new Error('No valid size IDs provided');

            const response = await apiClient.put(`${API_ENDPOINTS.PRODUCT}/${productId}/sizes`, { sizeIds });
            return response.data;
        } catch (error) {
            console.error(`Error updating product sizes from JSON for ${productId}:`, error);
            throw error;
        }
    }
};

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
    const filter = { page, pageSize };

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
