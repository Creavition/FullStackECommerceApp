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

    // En çok satanları getir - API endpoint'i olmadığı için tüm ürünleri çekip filtrele
    getBestSellers: async () => {
        try {
            console.log('Fetching best sellers...');
            // Backend'de özel endpoint yok, tüm ürünleri çekip badge_BestSelling olanları filtrele
            const response = await api.get('/Product');
            const allProducts = response.data || [];
            const bestSellers = allProducts.filter(product => product.badge_BestSelling === true);
            console.log('Best sellers found:', bestSellers.length);
            return bestSellers;
        } catch (error) {
            console.error('Error fetching best sellers:', error);
            console.log('API best sellers not available, using all products');
            // Fallback: tüm ürünleri döndür
            try {
                const response = await api.get('/Product');
                return response.data || [];
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw fallbackError;
            }
        }
    },

    // Flash sale ürünlerini getir - API endpoint'i olmadığı için tüm ürünleri çekip filtrele
    getFlashSaleProducts: async () => {
        try {
            console.log('Fetching flash sale products...');
            // Backend'de özel endpoint yok, tüm ürünleri çekip badge_FlashSale olanları filtrele
            const response = await api.get('/Product');
            const allProducts = response.data || [];
            const flashSaleProducts = allProducts.filter(product => product.badge_FlashSale === true);
            console.log('Flash sale products found:', flashSaleProducts.length);
            return flashSaleProducts;
        } catch (error) {
            console.error('Error fetching flash sale products:', error);
            console.log('API flash sale products not available, using all products');
            // Fallback: tüm ürünleri döndür
            try {
                const response = await api.get('/Product');
                return response.data || [];
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw fallbackError;
            }
        }
    },

    // Hızlı teslimat ürünlerini getir - API endpoint'i olmadığı için tüm ürünleri çekip filtrele
    getFastDeliveryProducts: async () => {
        try {
            console.log('Fetching fast delivery products...');
            // Backend'de özel endpoint yok, tüm ürünleri çekip label_FastDelivery olanları filtrele
            const response = await api.get('/Product');
            const allProducts = response.data || [];
            const fastDeliveryProducts = allProducts.filter(product => product.label_FastDelivery === true);
            console.log('Fast delivery products found:', fastDeliveryProducts.length);
            return fastDeliveryProducts;
        } catch (error) {
            console.error('Error fetching fast delivery products:', error);
            console.log('API fast delivery products not available, using all products');
            // Fallback: tüm ürünleri döndür
            try {
                const response = await api.get('/Product');
                return response.data || [];
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw fallbackError;
            }
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
    },

    // Ürünü güncelle (CategoryId ve AvailableSizes dahil)
    updateProduct: async (productId, updateData) => {
        try {
            const response = await api.put(`/Product/${productId}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating product ${productId}:`, error);
            throw error;
        }
    },

    // Ürün kategorisini güncelle
    updateProductCategory: async (productId, categoryId) => {
        try {
            const response = await api.put(`/Product/${productId}`, {
                categoryId: categoryId
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating product category for ${productId}:`, error);
            throw error;
        }
    },

    // Ürün available sizes'ını güncelle (özel endpoint kullanarak)
    updateProductSizes: async (productId, sizeIds) => {
        try {
            const response = await api.put(`/Product/${productId}/sizes`, {
                sizeIds: sizeIds
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating product sizes for ${productId}:`, error);
            throw error;
        }
    },

    // Ürün available sizes'ını güncelle (genel endpoint kullanarak)
    updateProductSizesGeneral: async (productId, sizeIds) => {
        try {
            const response = await api.put(`/Product/${productId}`, {
                sizeIds: sizeIds
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating product sizes (general) for ${productId}:`, error);
            throw error;
        }
    },

    // Ürün kategori ve available sizes'ını beraber güncelle
    updateProductCategoryAndSizes: async (productId, categoryId, sizeIds) => {
        try {
            const response = await api.put(`/Product/${productId}`, {
                categoryId: categoryId,
                sizeIds: sizeIds
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating product category and sizes for ${productId}:`, error);
            throw error;
        }
    },

    // JSON formatında available sizes güncelle
    updateProductSizesFromJson: async (productId, sizesData) => {
        try {
            // sizesData can be:
            // 1. Array of size IDs: [1, 2, 3]
            // 2. Array of size names: ["S", "M", "L"]
            // 3. Object with sizeIds property: { sizeIds: [1, 2, 3] }

            let sizeIds = [];

            if (Array.isArray(sizesData)) {
                // If it's an array, check if it contains numbers or strings
                if (sizesData.length > 0 && typeof sizesData[0] === 'number') {
                    // Array of size IDs
                    sizeIds = sizesData;
                } else if (sizesData.length > 0 && typeof sizesData[0] === 'string') {
                    // Array of size names - convert to IDs
                    const sizeNameToId = {
                        'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6
                    };
                    sizeIds = sizesData.map(name => sizeNameToId[name]).filter(id => id);
                }
            } else if (sizesData && typeof sizesData === 'object' && sizesData.sizeIds) {
                // Object with sizeIds property
                sizeIds = sizesData.sizeIds;
            }

            if (sizeIds.length === 0) {
                throw new Error('No valid size IDs provided');
            }

            const response = await api.put(`/Product/${productId}/sizes`, {
                sizeIds: sizeIds
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating product sizes from JSON for ${productId}:`, error);
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
