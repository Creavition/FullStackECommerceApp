import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoryApi } from './categoryApi';
import { productApi } from './productApi';

// API'den kategorileri ve bedenlerini çek
let apiCategories = null;
let apiSizeMap = null;
let isApiAvailable = true; // API durumunu takip et

export const fetchCategoriesFromAPI = async () => {
    try {
        // API mevcut değilse fallback'e git
        if (!isApiAvailable) {
            return getFallbackData();
        }

        if (!apiCategories) {
            console.log('Fetching categories from API...');
            const categories = await categoryApi.getAllCategories();

            // API'den gelen veriler boş mu kontrol et
            if (!categories || categories.length === 0) {
                console.log('No categories found in API, seeding default categories...');
                await categoryApi.seedCategories();
                const seededCategories = await categoryApi.getAllCategories();
                apiCategories = seededCategories;
            } else {
                apiCategories = categories;
            }

            // sizeMap'i API'den gelen verilerle oluştur
            apiSizeMap = {};
            if (Array.isArray(apiCategories)) {
                apiCategories.forEach(category => {
                    if (category && category.categoryName) {
                        if (category.sizes && Array.isArray(category.sizes) && category.sizes.length > 0) {
                            apiSizeMap[category.categoryName] = category.sizes
                                .filter(size => size && size.sizeName) // Güvenlik kontrolü
                                .map(size => size.sizeName);
                        } else {
                            // Eğer kategori bedenleri yoksa, varsayılan bedenler ata
                            apiSizeMap[category.categoryName] = getDefaultSizesForCategory(category.categoryName);
                        }
                    }
                });
            }

            console.log('Categories fetched successfully:', Array.isArray(apiCategories) ? apiCategories.length : 0);
            isApiAvailable = true;
        }
        return { categories: apiCategories, sizeMap: apiSizeMap };
    } catch (error) {
        console.error('Error fetching categories from API:', error);
        isApiAvailable = false;
        return getFallbackData();
    }
};

// Fallback static veriler
const getFallbackData = () => {
    console.log('Using fallback static data...');
    return {
        categories: [
            { id: 1, categoryName: 'Jacket', sizes: [{ sizeName: 'S' }, { sizeName: 'M' }, { sizeName: 'L' }, { sizeName: 'XL' }] },
            { id: 2, categoryName: 'Pants', sizes: [{ sizeName: '30' }, { sizeName: '32' }, { sizeName: '34' }, { sizeName: '36' }] },
            { id: 3, categoryName: 'T-Shirt', sizes: [{ sizeName: 'S' }, { sizeName: 'M' }, { sizeName: 'L' }, { sizeName: 'XL' }] },
            { id: 4, categoryName: 'Shoes', sizes: [{ sizeName: '40' }, { sizeName: '42' }, { sizeName: '43' }, { sizeName: '44' }] }
        ],
        sizeMap: {
            'Jacket': ['S', 'M', 'L', 'XL'],
            'Pants': ['30', '32', '34', '36'],
            'T-Shirt': ['S', 'M', 'L', 'XL'],
            'Shoes': ['40', '42', '43', '44'],
        }
    };
};

// Kategori için varsayılan bedenler
const getDefaultSizesForCategory = (categoryName) => {
    const defaultSizes = {
        'Jacket': ['S', 'M', 'L', 'XL'],
        'Pants': ['30', '32', '34', '36'],
        'T-Shirt': ['S', 'M', 'L', 'XL'],
        'Shoes': ['40', '42', '43', '44'],
    };
    return defaultSizes[categoryName] || ['S', 'M', 'L', 'XL'];
};

// API'den ürünleri çek
export const fetchProductsFromAPI = async () => {
    try {
        if (!isApiAvailable) {
            console.log('API not available, using fallback products');
            return null;
        }

        console.log('Fetching products from API...');
        const products = await productApi.getAllProducts();

        if (!products || products.length === 0) {
            console.log('No products found in API');
            return null;
        }

        console.log(`Fetched ${products.length} products from API`);
        return products;
    } catch (error) {
        console.error('Error fetching products from API:', error);
        isApiAvailable = false;
        return null;
    }
};

// Kategoriye göre ürünleri çek
export const fetchProductsByCategory = async (categoryId) => {
    try {
        if (!isApiAvailable) {
            return null;
        }

        console.log(`Fetching products for category ${categoryId}...`);
        const products = await productApi.getProductsByCategory(categoryId);
        return products || [];
    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        return null;
    }
};

// En çok satanları çek
export const fetchBestSellers = async () => {
    try {
        if (!isApiAvailable) {
            return null;
        }

        console.log('Fetching best sellers...');
        const products = await productApi.getBestSellers();
        return products || [];
    } catch (error) {
        console.error('Error fetching best sellers:', error);
        return null;
    }
};

// Flash sale ürünlerini çek
export const fetchFlashSaleProducts = async () => {
    try {
        if (!isApiAvailable) {
            return null;
        }

        console.log('Fetching flash sale products...');
        const products = await productApi.getFlashSaleProducts();
        return products || [];
    } catch (error) {
        console.error('Error fetching flash sale products:', error);
        return null;
    }
};

// Hızlı teslimat ürünlerini çek
export const fetchFastDeliveryProducts = async () => {
    try {
        if (!isApiAvailable) {
            return null;
        }

        console.log('Fetching fast delivery products...');
        const products = await productApi.getFastDeliveryProducts();
        return products || [];
    } catch (error) {
        console.error('Error fetching fast delivery products:', error);
        return null;
    }
};
// Kategorileri ve sizeMap'i dinamik olarak al
export const getSizeMap = async () => {
    const { sizeMap } = await fetchCategoriesFromAPI();
    return sizeMap;
};

// Favori durumunu değiştir - Basitleştirilmiş versiyon
export const toggleProductFavorite = async (productId, currentFavoriteStatus) => {
    try {
        if (!isApiAvailable) {
            console.log('API not available, cannot update favorite status');
            return false;
        }

        const newStatus = !currentFavoriteStatus;
        await productApi.toggleFavorite(productId, newStatus);

        // Sadece cache'te bulunan ürünü güncelle
        if (cachedProducts) {
            const productIndex = cachedProducts.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                cachedProducts[productIndex].isFavorite = newStatus;
            }
        }

        console.log(`Product ${productId} favorite status updated to ${newStatus}`);
        return true;
    } catch (error) {
        console.error('Error toggling product favorite:', error);
        return false;
    }
};

// Ürünleri filtrele
export const filterProducts = async (filters) => {
    try {
        if (!isApiAvailable) {
            console.log('API not available, using local filtering');
            return await filterLocalProducts(filters);
        }

        console.log('Filtering products via API...');
        const result = await productApi.filterProducts(filters);
        return result;
    } catch (error) {
        console.error('Error filtering products:', error);
        return await filterLocalProducts(filters);
    }
};

// Yerel filtreleme (fallback)
const filterLocalProducts = async (filters) => {
    const allProducts = await getAllProducts();
    let filtered = [...allProducts];

    if (filters.categoryId) {
        filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters.minPrice) {
        filtered = filtered.filter(p => {
            const price = typeof p.price === 'number' ? p.price : parseFloat(p.price.replace('₺', ''));
            return price >= filters.minPrice;
        });
    }

    if (filters.maxPrice) {
        filtered = filtered.filter(p => {
            const price = typeof p.price === 'number' ? p.price : parseFloat(p.price.replace('₺', ''));
            return price <= filters.maxPrice;
        });
    }

    if (filters.badge_FlashSale !== undefined) {
        filtered = filtered.filter(p => p.badge_FlashSale === filters.badge_FlashSale);
    }

    if (filters.badge_BestSelling !== undefined) {
        filtered = filtered.filter(p => p.badge_BestSelling === filters.badge_BestSelling);
    }

    if (filters.label_BestSeller !== undefined) {
        filtered = filtered.filter(p => p.label_BestSeller === filters.label_BestSeller);
    }

    if (filters.label_FastDelivery !== undefined) {
        filtered = filtered.filter(p => p.label_FastDelivery === filters.label_FastDelivery);
    }

    if (filters.isFavorite !== undefined) {
        filtered = filtered.filter(p => p.isFavorite === filters.isFavorite);
    }

    return {
        products: filtered,
        totalCount: filtered.length,
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        totalPages: Math.ceil(filtered.length / (filters.pageSize || 20))
    };
};

// Ürünleri cache'le ve dil değişikliklerini takip et
let cachedProducts = null;
let cachedLanguage = null;

export const getCategories = async () => {
    try {
        const { categories, sizeMap } = await fetchCategoriesFromAPI();

        // Güvenlik kontrolü - sizeMap var mı ve object mi?
        if (sizeMap && typeof sizeMap === 'object') {
            const categoryNames = Object.keys(sizeMap);
            return categoryNames.length > 0 ? categoryNames : ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
        }

        // categories array'i varsa kategori isimlerini al
        if (Array.isArray(categories)) {
            const categoryNames = categories
                .filter(cat => cat && cat.categoryName)
                .map(cat => cat.categoryName);
            return categoryNames.length > 0 ? categoryNames : ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
        }

        // Fallback
        return ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
    } catch (error) {
        console.error('Error in getCategories:', error);
        return ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
    }
};
// Görsel eşleşmeleri
const imageMap = {
    Jacket: 'https://www.pierrecassi.com/wp-content/uploads/2015/01/Erkek-blazer-ceket-kombinasyonlari.png',
    Pants: 'https://www.dgnonline.com/jack-jones-jjiglenn-jjoriginal-sq-703-noos-erkek-jean-pantolon-gri-jean-pantolon-jackjones-12249189-262598-51-B.jpg',
    'Shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?crop=entropy&cs=tinysrgb&fit=crop&h=300&w=300',
    'T-Shirt': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?crop=entropy&cs=tinysrgb&fit=crop&h=300&w=300',
};

// Kategoriye Gore rastgele fiyat üretme
const getRandomPrice = (category) => {
    let min, max;
    switch (category) {
        case 'Jacket': min = 1500; max = 2500; break;
        case 'Pants': min = 900; max = 1300; break;
        case 'Shoes': min = 2000; max = 3000; break;
        case 'T-Shirt': min = 300; max = 500; break;
        default: return '0₺';
    }
    const price = Math.floor(Math.random() * ((max - min) / 10 + 1)) * 10 + min;
    return price + '₺';
};

// Tum bedenlerden(allSizes) Rastgele 3 beden seç
const getRandomSizes = (allSizes) => {
    const shuffled = [...allSizes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};

// Dile göre ürün ismini al
const getProductName = (category, index, language = 'en') => {
    const names = {
        en: {
            'Jacket': ['Business Jacket', 'Casual Blazer', 'Winter Coat', 'Denim Jacket', 'Leather Jacket', 'Sports Jacket', 'Formal Blazer', 'Bomber Jacket', 'Windbreaker', 'Hoodie Jacket', 'Varsity Jacket', 'Puffer Jacket', 'Trench Coat', 'Peacoat', 'Field Jacket', 'Track Jacket'],
            'Pants': ['Slim Jeans', 'Cargo Pants', 'Chino Pants', 'Dress Pants', 'Joggers', 'Straight Jeans', 'Skinny Jeans', 'Wide Leg Pants', 'Bootcut Jeans', 'Sweatpants', 'Formal Trousers', 'Khaki Pants', 'Corduroy Pants', 'Linen Pants', 'Track Pants', 'Cropped Pants'],
            'Shoes': ['Running Shoes', 'Casual Sneakers', 'Dress Shoes', 'Boots', 'Loafers', 'Canvas Shoes', 'High Tops', 'Sandals', 'Oxfords', 'Moccasins', 'Hiking Boots', 'Basketball Shoes', 'Tennis Shoes', 'Slip-ons', 'Boat Shoes', 'Combat Boots'],
            'T-Shirt': ['Basic Tee', 'Graphic T-Shirt', 'Polo Shirt', 'V-Neck Tee', 'Henley Shirt', 'Long Sleeve Tee', 'Striped Shirt', 'Vintage Tee', 'Sports Tee', 'Plain T-Shirt', 'Printed Tee', 'Crew Neck Tee', 'Pocket Tee', 'Fitted Tee', 'Oversized Tee', 'Tank Top']
        },
        tr: {
            'Jacket': ['İş Ceketi', 'Günlük Blazer', 'Kış Montu', 'Kot Ceket', 'Deri Ceket', 'Spor Ceketi', 'Resmi Blazer', 'Bomber Ceket', 'Rüzgarlık', 'Kapüşonlu Ceket', 'Varsity Ceket', 'Şişme Mont', 'Trençkot', 'Palto', 'Arazi Ceketi', 'Eşofman Ceketi'],
            'Pants': ['Dar Kot', 'Kargo Pantolon', 'Chino Pantolon', 'Kumaş Pantolon', 'Eşofman Altı', 'Düz Kot', 'Skinny Kot', 'Bol Paça Pantolon', 'İspanyol Paça', 'Sweatpants', 'Resmi Pantolon', 'Haki Pantolon', 'Kadife Pantolon', 'Keten Pantolon', 'Antrenman Pantolonu', 'Kısa Paça Pantolon'],
            'Shoes': ['Koşu Ayakkabısı', 'Günlük Spor Ayakkabı', 'Klasik Ayakkabı', 'Bot', 'Loafer', 'Kanvas Ayakkabı', 'Yüksek Bilek', 'Sandalet', 'Oxford Ayakkabı', 'Mokasen', 'Trekking Botu', 'Basketbol Ayakkabısı', 'Tenis Ayakkabısı', 'Terlik', 'Tekne Ayakkabısı', 'Muharebe Botu'],
            'T-Shirt': ['Basic Tişört', 'Grafik Tişört', 'Polo Tişört', 'V Yaka Tişört', 'Henley Tişört', 'Uzun Kol Tişört', 'Çizgili Tişört', 'Vintage Tişört', 'Spor Tişört', 'Düz Tişört', 'Baskılı Tişört', 'Bisiklet Yaka', 'Cepli Tişört', 'Dar Kesim Tişört', 'Oversize Tişört', 'Atlet']
        }
    };

    return names[language][category][index - 1] || `${category} ${index}`;
    // Eger names[language][category][index - 1] varsa onu don yoksa `${category} ${index}` don 
};

// Güvenli fiyat parsing fonksiyonu
export const parsePrice = (priceValue) => {
    // Null/undefined kontrolü
    if (!priceValue && priceValue !== 0) return 0;

    // Eğer zaten sayıysa direkt döndür
    if (typeof priceValue === 'number') return priceValue;

    // String değilse 0 döndür
    if (typeof priceValue !== 'string') return 0;

    try {
        return parseFloat(priceValue.replace('₺', '').replace(',', '.')) || 0;
    } catch (error) {
        console.error('Error parsing price:', error);
        return 0;
    }
};

// Dil tercihini al
const getCurrentLanguage = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        return savedLanguage || 'en';
    } catch (error) {
        return 'en';
    }
};

// Tüm ürünleri oluştur (dil desteği ile)
export const generateProducts = async () => {
    try {
        const language = await getCurrentLanguage();
        console.log('Generating products with API data...');

        const { sizeMap } = await fetchCategoriesFromAPI();

        // Güvenlik kontrolü - sizeMap var mı?
        if (!sizeMap || typeof sizeMap !== 'object') {
            console.log('No valid sizeMap, using fallback categories');
            return generateFallbackProducts(language);
        }

        const categories = Object.keys(sizeMap);

        if (categories.length === 0) {
            console.log('No categories found, using fallback');
            return generateFallbackProducts(language);
        }

        const products = [];

        categories.forEach((category) => {
            const allSizes = sizeMap[category];

            // Güvenlik kontrolü - allSizes array mi?
            if (!Array.isArray(allSizes) || allSizes.length === 0) {
                console.log(`No sizes for category ${category}, skipping`);
                return;
            }

            // Her kategoriden 16 ürün oluştur
            for (let i = 1; i <= 16; i++) {
                const availableSizes = getRandomSizes(allSizes); // Rastgele 3 beden
                const displaySize = availableSizes && availableSizes.length > 0 ? availableSizes[0] : allSizes[0]; // İlk bedeni göster

                products.push({
                    id: `${category}-${i}`,
                    name: getProductName(category, i, language),
                    image: imageMap[category] || 'https://via.placeholder.com/300x300?text=Product', //resim linkine ulasma
                    price: getRandomPrice(category), // kategoriye gore belirlenen fiyat araliginda rastgele fiyat olusturma
                    category, // category: category yaziminin kisaltilmisidir.
                    size: displaySize, // Ilk beden
                    availableSizes: availableSizes || [displaySize], // Mevcut bedenler
                    allSizes: allSizes // Tüm beden seçenekleri
                });
            }
        });

        console.log(`Generated ${products.length} products from ${categories.length} categories`);
        return products;
    } catch (error) {
        console.error('Error generating products:', error);
        const language = await getCurrentLanguage();
        return generateFallbackProducts(language);
    }
};

// Fallback ürün üretimi
const generateFallbackProducts = (language = 'en') => {
    console.log('Generating fallback products');
    const fallbackCategories = ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
    const fallbackSizeMap = {
        'Jacket': ['S', 'M', 'L', 'XL'],
        'Pants': ['30', '32', '34', '36'],
        'Shoes': ['40', '42', '43', '44'],
        'T-Shirt': ['S', 'M', 'L', 'XL'],
    };

    const products = [];

    fallbackCategories.forEach((category) => {
        const allSizes = fallbackSizeMap[category];
        for (let i = 1; i <= 16; i++) {
            const availableSizes = getRandomSizes(allSizes);
            const displaySize = availableSizes[0];

            products.push({
                id: `${category}-${i}`,
                name: getProductName(category, i, language),
                image: imageMap[category] || 'https://via.placeholder.com/300x300?text=Product',
                price: getRandomPrice(category),
                category,
                size: displaySize,
                availableSizes: availableSizes,
                allSizes: allSizes
            });
        }
    });

    console.log(`Generated ${products.length} fallback products`);
    return products;
};

// Tüm ürünleri al (API öncelikli) - Category bilgileri ile birlikte
export const getAllProducts = async () => {
    try {
        const currentLanguage = await getCurrentLanguage();

        // Dil değişmişse cache'i temizle
        if (cachedLanguage !== currentLanguage) {
            cachedProducts = null;
            cachedLanguage = currentLanguage;
            console.log(`Language changed to ${currentLanguage}, clearing cache`);
        }

        if (!cachedProducts) {
            console.log('Generating new products...');

            // Önce API'den ürünleri almaya çalış
            const apiProducts = await fetchProductsFromAPI();

            if (apiProducts && apiProducts.length > 0) {
                console.log('Using API products');

                // Ürünlerin category bilgilerini enrich et
                const enrichedProducts = await enrichProductsWithCategoryData(apiProducts);
                cachedProducts = enrichedProducts;
                isApiAvailable = true;
            } else {
                console.log('API products not available, generating fallback products');
                cachedProducts = await generateProducts();
                isApiAvailable = false;
            }
        }

        console.log(`Returning ${cachedProducts?.length || 0} cached products`);
        return cachedProducts || [];
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        const language = await getCurrentLanguage();
        return generateFallbackProducts(language);
    }
};

// Ürünleri category bilgileri ile zenginleştir
const enrichProductsWithCategoryData = async (products) => {
    try {
        console.log('Enriching products with category data...');

        // Tüm kategorileri bir kez çek
        const categories = await fetchCategoriesFromAPI();
        const categoryMap = {};

        if (categories && categories.categories) {
            categories.categories.forEach(cat => {
                categoryMap[cat.id] = cat;
            });
        }

        // Her ürünü category bilgisi ile zenginleştir
        const enrichedProducts = products.map(product => {
            let enrichedProduct = { ...product };

            // categoryId varsa, category bilgilerini ekle
            if (product.categoryId && categoryMap[product.categoryId]) {
                const category = categoryMap[product.categoryId];
                enrichedProduct.category = category.categoryName;
                enrichedProduct.categoryData = category;

                // Category'den tüm bedenler (allSizes)
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
        return products; // Hata durumunda orijinal ürünleri döndür
    }
};

// API'yi yeniden dene - Basitleştirilmiş versiyon
export const retryApiConnection = async () => {
    console.log('Retrying API connection...');
    isApiAvailable = true;

    try {
        // Önce kategori API'sini test et
        const categoryResult = await fetchCategoriesFromAPI();

        // Sonra ürün API'sini test et
        const productResult = await fetchProductsFromAPI();

        if (productResult && productResult.length > 0) {
            console.log('API connection successful!');
            cachedProducts = productResult; // Yeni ürünleri cache'le
            return { categories: categoryResult.categories, products: productResult };
        } else {
            console.log('Product API still not available');
            return categoryResult;
        }
    } catch (error) {
        console.log('API connection still failed');
        return getFallbackData();
    }
};

// API durumunu kontrol et
export const checkApiStatus = () => {
    return isApiAvailable;
};

// Product'tan size bilgilerini çıkar
export const extractSizeInfo = (product) => {
    const sizeInfo = {
        allSizes: [],
        availableSizes: [],
        categoryData: null
    };

    // AllSizes - kategoriden gelen tüm bedenler
    if (product.allSizes && Array.isArray(product.allSizes)) {
        sizeInfo.allSizes = product.allSizes;
    } else if (product.categoryData && product.categoryData.sizes) {
        sizeInfo.allSizes = product.categoryData.sizes.map(size => size.sizeName);
    }

    // AvailableSizes - ürünün mevcut bedenleri
    if (product.availableSize && Array.isArray(product.availableSize)) {
        sizeInfo.availableSizes = product.availableSize;
    } else if (product.availableSizes && Array.isArray(product.availableSizes)) {
        sizeInfo.availableSizes = product.availableSizes;
    } else if (product.sizes && Array.isArray(product.sizes)) {
        sizeInfo.availableSizes = product.sizes;
    } else if (product.size && typeof product.size === 'string') {
        sizeInfo.availableSizes = [product.size];
    }

    // Category data
    if (product.categoryData) {
        sizeInfo.categoryData = product.categoryData;
    }

    return sizeInfo;
};

// Product bilgilerini detaylı log'la
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

// Dil değiştiğinde ürünleri yeniden yükle - Basitleştirilmiş versiyon
export const refreshProductsForLanguage = async () => {
    cachedProducts = null; // Sadece cache'i temizle
    return await getAllProducts();
};

// Kategori yönetimi için yardımcı fonksiyonlar
export const categoryUtils = {
    // Yeni kategori ekle
    addCategory: async (categoryName) => {
        try {
            console.log(`Adding new category: ${categoryName}`);
            await categoryApi.createCategory(categoryName);

            // Sadece cache'i temizle
            cachedProducts = null;

            console.log(`Category ${categoryName} added successfully`);
            return true;
        } catch (error) {
            console.error('Error adding category:', error);
            return false;
        }
    },

    // Kategoriye beden ekle
    addSizeToCategory: async (categoryId, sizeName) => {
        try {
            console.log(`Adding size ${sizeName} to category ${categoryId}`);
            await categoryApi.addSizeToCategory(categoryId, sizeName);

            // Sadece cache'i temizle
            cachedProducts = null;

            console.log(`Size ${sizeName} added to category ${categoryId} successfully`);
            return true;
        } catch (error) {
            console.error('Error adding size to category:', error);
            return false;
        }
    },

    // Varsayılan kategorileri oluştur
    initializeDefaultCategories: async () => {
        try {
            console.log('Initializing default categories...');
            await categoryApi.seedCategories();

            // Sadece cache'i temizle
            cachedProducts = null;

            console.log('Default categories initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing default categories:', error);
            return false;
        }
    },

    // API durumunu test et
    testApiConnection: async () => {
        try {
            console.log('Testing API connection...');
            const categories = await categoryApi.getAllCategories();
            const products = await productApi.getAllProducts();
            console.log(`API test successful - found ${categories.length} categories and ${products.length} products`);
            return true;
        } catch (error) {
            console.error('API test failed:', error);
            return false;
        }
    }
};

// Ürün yönetimi için yardımcı fonksiyonlar
export const productUtils = {
    // En çok satanları getir
    getBestSellers: async () => {
        try {
            const products = await fetchBestSellers();
            return products || [];
        } catch (error) {
            console.error('Error getting best sellers:', error);
            return [];
        }
    },

    // Flash sale ürünlerini getir
    getFlashSaleProducts: async () => {
        try {
            const products = await fetchFlashSaleProducts();
            return products || [];
        } catch (error) {
            console.error('Error getting flash sale products:', error);
            return [];
        }
    },

    // Hızlı teslimat ürünlerini getir
    getFastDeliveryProducts: async () => {
        try {
            const products = await fetchFastDeliveryProducts();
            return products || [];
        } catch (error) {
            console.error('Error getting fast delivery products:', error);
            return [];
        }
    },

    // Kategoriye göre ürünleri getir
    getProductsByCategory: async (categoryId) => {
        try {
            const products = await fetchProductsByCategory(categoryId);
            return products || [];
        } catch (error) {
            console.error('Error getting products by category:', error);
            return [];
        }
    },

    // Favori ürünleri getir
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