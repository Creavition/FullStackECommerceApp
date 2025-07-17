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
        console.error('Kategoriler Çekilemedi', error);
        return ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
    }
};

// ID'ye gore API
export const getCategoryById = async (categoryId) => {
    try {
        let category = await categoryApi.getCategory(categoryId);
        console.log('API returned category:', category);
        return category;
    } catch (error) {
        console.error('Idye göre kategori getirilemedi:', error);
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
                console.log('APIde ürün bulunamadı');
                cachedProducts = [];
            }
        }

        return cachedProducts || [];
    } catch (error) {
        console.error('Product verileri çekilemedi', error);
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
            console.log('Ürün Bulunamadı');
            return null;
        }
    } catch (error) {
        console.error('Ürün ID sine göre ürün getirilemedi:', error);
        return null;
    }
};

// Kategori Id ye gore Urunler
export const getProductsByCategory = async (categoryId) => {
    try {
        const products = await productApi.getProductsByCategory(categoryId);
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        console.error('Kategoriye Göre Ürün Getirilemedi:', error);
        return [];
    }
};

// Get best sellers
export const getBestSellers = async () => {
    try {
        const products = await productApi.getBestSellers();
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        console.error('Best Sellers ürünleri getirilemedi', error);
        return [];
    }
};

// Get flash sale products
export const getFlashSaleProducts = async () => {
    try {
        const products = await productApi.getFlashSaleProducts();
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        console.error('Flash Sale ürünleri getirilemedi', error);
        return [];
    }
};

// Get fast delivery products
export const getFastDeliveryProducts = async () => {
    try {
        const products = await productApi.getFastDeliveryProducts();
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        console.error('Hızlı Teslimat Ürünleri Getirilemedi', error);
        return [];
    }
};

// Ürünleri Filtreleme
export const filterProducts = async (filters) => {
    try {
        const products = await productApi.filterProducts(filters);
        return products ? await enrichProductsWithCategoryData(products) : [];
    } catch (error) {
        console.error('Error filtering products:', error);
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
        console.error('Favori durumu degiştirme hatası', error);
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

                console.log(`Enriched product ${product.name || product.id} with category ${category.categoryName}`);
            }

            return enrichedProduct;
        });

        console.log(`Enriched ${enrichedProducts.length} products with category data`);
        return enrichedProducts;
    } catch (error) {
        console.error('Error enriching products with category data:', error);
        return products;
    }
};

// Bir ürün için kategori ismi, kategori bilgisi ve tüm bedenlerini ekler.
const enrichSingleProductWithCategoryData = async (product) => {
    try {
        if (product.categoryId) {
            console.log(`Fetching category with ID: ${product.categoryId}`);
            const category = await getCategoryById(product.categoryId);
            console.log('Fetched category:', category);

            if (category) {
                product.category = category.categoryName;
                product.categoryData = category;
                console.log(`Set category name to: ${category.categoryName}`);

                if (category.sizes && Array.isArray(category.sizes)) {
                    product.allSizes = category.sizes.map(size => size.sizeName);
                    console.log('Set allSizes to:', product.allSizes);
                }
            } else {
                console.log('No category found for categoryId:', product.categoryId);
            }
        } else {
            console.log('Product has no categoryId');
        }

        return product;
    } catch (error) {
        console.error('Error enriching single product:', error);
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
        console.error('Error parsing price:', error);
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
    console.log('=== Product Details ===');
    console.log('ID:', product.id);
    console.log('Name:', product.name);
    console.log('CategoryID:', product.categoryId);
    console.log('Category Name:', product.category);

    const sizeInfo = extractSizeInfo(product);
    console.log('All Sizes (from category):', sizeInfo.allSizes);
    console.log('Available Sizes (from product):', sizeInfo.availableSizes);
    console.log('Category Data:', sizeInfo.categoryData ? 'Available' : 'Not Available');
    console.log('======================');
};

// cachedProducts ve cachedCategories degiskenlerini temizler
export const clearProductCache = () => {
    clearCache();
    console.log('Product cache cleared');
};

// API den yeniden veri cekmek icin
export const refreshData = async () => {
    clearCache();
    await getAllProducts();
    await getCategories();
    console.log('Data refreshed from API');
};





// Product yardimci fonksiyonlari
export const productUtils = {
    // Get best sellers
    getBestSellers: async () => {
        try {
            return await getBestSellers();
        } catch (error) {
            console.error('Error getting best sellers:', error);
            return [];
        }
    },

    // Get flash sale products
    getFlashSaleProducts: async () => {
        try {
            return await getFlashSaleProducts();
        } catch (error) {
            console.error('Error getting flash sale products:', error);
            return [];
        }
    },

    // Get fast delivery products
    getFastDeliveryProducts: async () => {
        try {
            return await getFastDeliveryProducts();
        } catch (error) {
            console.error('Error getting fast delivery products:', error);
            return [];
        }
    },

    // Get products by category
    getProductsByCategory: async (categoryId) => {
        try {
            return await getProductsByCategory(categoryId);
        } catch (error) {
            console.error('Error getting products by category:', error);
            return [];
        }
    },

    // Favori urunleri getirme
    getFavoriteProducts: async () => {
        try {
            const allProducts = await getAllProducts();
            return allProducts.filter(product => product.isFavorite);
        } catch (error) {
            console.error('Error getting favorite products:', error);
            return [];
        }
    }
};



// Kategori yardimci fonksiyonlar
export const categoryUtils = {
    // Yeni kategori ekleme
    addCategory: async (categoryName) => {
        try {
            console.log(`Adding new category: ${categoryName}`);
            await categoryApi.createCategory({ categoryName });
            clearCache();
            console.log(`Category ${categoryName} added successfully`);
            return true;
        } catch (error) {
            console.error('Error adding category:', error);
            return false;
        }
    },

    // Kategori guncelleme
    updateCategory: async (categoryId, updateData) => {
        try {
            console.log(`Updating category ${categoryId}`);
            await categoryApi.updateCategory(categoryId, updateData);
            clearCache();
            console.log(`Category ${categoryId} updated successfully`);
            return true;
        } catch (error) {
            console.error('Error updating category:', error);
            return false;
        }
    }
};