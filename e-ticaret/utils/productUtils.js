import { categoryApi } from './categoryApi';
import { productApi } from './productApi';

// Cache degiskenleri
let cachedProducts = null;
let cachedCategories = null;

// Cacheleme
const clearCache = () => {
    cachedProducts = null;
    cachedCategories = null;
};

// Category Fonksiyonları

// Tüm kategorileri getirir
export const getCategories = async () => {
    try {
        if (!cachedCategories) {
            const categories = await categoryApi.getAllCategories();
            cachedCategories = categories || [];
        }

        const categoryNames = cachedCategories
            .filter(cat => cat && cat.categoryName)
            .map(cat => cat.categoryName);

        return categoryNames;
    } catch (error) {
        return ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
    }
};

// ID'ye gore API
export const getCategoryById = async (categoryId) => {
    try {
        let category = await categoryApi.getCategory(categoryId);
        return category;
    } catch (error) {
        return null;
    }
};

//Product fonksiyonlari

// Tüm Ürünleri Getirir
export const getAllProducts = async () => {
    try {
        if (!cachedProducts) {
            const products = await productApi.getAllProducts();

            if (products && products.length > 0) {
                cachedProducts = await enrichProductsWithCategoryData(products);
            } else {
                cachedProducts = [];
            }
        }

        return cachedProducts || [];
    } catch (error) {
        return [];
    }
};

// ID ye göre Ürün
export const getProductById = async (productId) => {
    try {
        const product = await productApi.getProductById(productId);

        if (product) {
            const enrichedProduct = await enrichSingleProductWithCategoryData(product);
            return enrichedProduct;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

// Kategori Id ye gore Urunler
export const getProductsByCategory = async (categoryId) => {
    try {
        const products = await productApi.getProductsByCategory(categoryId);
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        return [];
    }
};

// Get best sellers
export const getBestSellers = async () => {
    try {
        const products = await productApi.getBestSellers();
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        return [];
    }
};

// Get flash sale products
export const getFlashSaleProducts = async () => {
    try {
        const products = await productApi.getFlashSaleProducts();
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        return [];
    }
};

// Get fast delivery products
export const getFastDeliveryProducts = async () => {
    try {
        const products = await productApi.getFastDeliveryProducts();
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        return [];
    }
};

// Ürünleri Filtreleme
export const filterProducts = async (filters) => {
    try {
        const products = await productApi.filterProducts(filters);
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        return [];
    }
};

// productId ye gore urunun favori status degisimi
export const toggleProductFavorite = async (productId, newStatus) => {
    try {
        await productApi.toggleFavorite(productId, newStatus);


        if (cachedProducts) {
            const productIndex = cachedProducts.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                cachedProducts[productIndex].isFavorite = newStatus;
            }
        }

        return true;
    } catch (error) {
        return false;
    }
};

// Enrich products with category data
const enrichProductsWithCategoryData = async (products) => {
    try {
        // cachedCategories boş ise ürünü al
        if (!cachedCategories) {
            cachedCategories = await categoryApi.getAllCategories() || [];
        }

        // categoryMap degiskeni Anahtar-değer seklınde 
        const categoryMap = {};
        cachedCategories.forEach(category => {
            if (category && category.id) {
                categoryMap[category.id] = category;
            }
        });

        // Ürünlerin özelliklerine kategori ismi, kategori bilgisi ve tüm bedenlerini ekler.
        const enrichedProducts = products.map(product => {
            const enrichedProduct = { ...product };

            if (product.categoryId && categoryMap[product.categoryId]) {
                const category = categoryMap[product.categoryId];
                enrichedProduct.category = category.categoryName;
                enrichedProduct.categoryData = category;

                // Add all sizes from category
                if (category.sizes && Array.isArray(category.sizes)) {
                    enrichedProduct.allSizes = category.sizes.map(size => size.sizeName);
                }

            }

            return enrichedProduct;
        });

        return enrichedProducts;
    } catch (error) {
        return products;
    }
};

// Bir ürün için kategori ismi, kategori bilgisi ve tüm bedenlerini ekler.
const enrichSingleProductWithCategoryData = async (product) => {
    try {
        if (product.categoryId) {
            const category = await getCategoryById(product.categoryId);

            if (category) {
                product.category = category.categoryName;
                product.categoryData = category;

                if (category.sizes && Array.isArray(category.sizes)) {
                    product.allSizes = category.sizes.map(size => size.sizeName);
                }
            } else {
            }
        } else {
        }

        return product;
    } catch (error) {
        return product;
    }
};


// Tip guvenligi
export const parsePrice = (priceValue) => {
    if (!priceValue && priceValue !== 0) return 0;
    if (typeof priceValue === 'number') return priceValue;
    if (typeof priceValue !== 'string') return 0;

    try {
        return parseFloat(priceValue.replace('₺', '').replace(',', '.')) || 0;
    } catch (error) {
        return 0;
    }
};

// Ürünün beden bilgilerini alma
export const extractSizeInfo = (product) => {
    const sizeInfo = {
        allSizes: [],
        availableSizes: [],
        categoryData: null
    };

    // Kategorideki Tüm Bedenler
    if (product.allSizes && Array.isArray(product.allSizes)) {
        sizeInfo.allSizes = product.allSizes;
    } else if (product.categoryData && product.categoryData.sizes) {
        sizeInfo.allSizes = product.categoryData.sizes.map(size => size.sizeName);
    }

    // Üründeki Aktif olan bedenler
    if (product.availableSizes && Array.isArray(product.availableSizes)) {
        sizeInfo.availableSizes = product.availableSizes;
    } else if (product.sizes && Array.isArray(product.sizes)) {
        sizeInfo.availableSizes = product.sizes;
    }

    // Kategori Bilgisi
    if (product.categoryData) {
        sizeInfo.categoryData = product.categoryData;
    }

    return sizeInfo;
};

// Urun bilgileri icin debug kodlari
export const logProductDetails = (product) => {
    // Log functionality removed
};

// cachedProducts ve cachedCategories degiskenlerini temizler
export const clearProductCache = () => {
    clearCache();
};

// API den yeniden veri cekmek icin
export const refreshData = async () => {
    clearCache();
    await getAllProducts();
    await getCategories();
};

// Product yardimci fonksiyonlari
export const productUtils = {
    // Get best sellers
    getBestSellers: async () => {
        try {
            return await getBestSellers();
        } catch (error) {
            return [];
        }
    },

    // Get flash sale products
    getFlashSaleProducts: async () => {
        try {
            return await getFlashSaleProducts();
        } catch (error) {
            return [];
        }
    },

    // Get fast delivery products
    getFastDeliveryProducts: async () => {
        try {
            return await getFastDeliveryProducts();
        } catch (error) {
            return [];
        }
    },

    // Get products by category
    getProductsByCategory: async (categoryId) => {
        try {
            return await getProductsByCategory(categoryId);
        } catch (error) {
            return [];
        }
    },

    // Favori urunleri getirme
    getFavoriteProducts: async () => {
        try {
            const allProducts = await getAllProducts();
            return allProducts.filter(product => product.isFavorite);
        } catch (error) {
            return [];
        }
    }
};

// Kategori yardimci fonksiyonlar
export const categoryUtils = {
    // Yeni kategori ekleme
    addCategory: async (categoryName) => {
        try {
            await categoryApi.createCategory({ categoryName });
            clearCache();
            return true;
        } catch (error) {
            return false;
        }
    },

    // Kategori guncelleme
    updateCategory: async (categoryId, updateData) => {
        try {
            await categoryApi.updateCategory(categoryId, updateData);
            clearCache();
            return true;
        } catch (error) {
            return false;
        }
    }
};