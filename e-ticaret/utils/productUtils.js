import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoryApi } from './categoryApi';

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

// Kategorileri ve sizeMap'i dinamik olarak al
export const getSizeMap = async () => {
    const { sizeMap } = await fetchCategoriesFromAPI();
    return sizeMap;
};

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

// Ürünleri cache'le ve dil değişikliklerini takip et
let cachedProducts = null;
let cachedLanguage = null;

export const getAllProducts = async () => {
    const currentLanguage = await getCurrentLanguage();

    // Dil değişmişse urunAdlari degisecegi icin cache'i temizle
    if (cachedLanguage !== currentLanguage) {
        cachedProducts = null;
        cachedLanguage = currentLanguage;
        console.log(`Language changed to ${currentLanguage}, clearing cache`);
    }

    //Dil degismisse ve cachedProducts bossa generateProducts() fonksiyonuyla urun
    if (!cachedProducts) {
        console.log('Generating new products...');
        cachedProducts = await generateProducts();

        // Eğer ürün üretilemezse API'yi tekrar dene
        if (!cachedProducts || cachedProducts.length === 0) {
            console.log('No products generated, retrying API...');
            await retryApiConnection();
            cachedProducts = await generateProducts();
        }
    }

    console.log(`Returning ${cachedProducts?.length || 0} cached products`);
    return cachedProducts || [];
};

// Cache'i temizlemek için yardımcı fonksiyon
export const clearProductCache = () => {
    cachedProducts = null;
    cachedLanguage = null;
    apiCategories = null;
    apiSizeMap = null;
    console.log('Product cache and API cache cleared');
};

// API'yi yeniden dene
export const retryApiConnection = async () => {
    console.log('Retrying API connection...');
    isApiAvailable = true;
    apiCategories = null;
    apiSizeMap = null;

    try {
        const result = await fetchCategoriesFromAPI();
        console.log('API connection successful!');
        return result;
    } catch (error) {
        console.log('API connection still failed');
        return getFallbackData();
    }
};

// API durumunu kontrol et
export const checkApiStatus = () => {
    return isApiAvailable;
};

// Dil değiştiğinde ürünleri yeniden yükle
export const refreshProductsForLanguage = async () => {
    clearProductCache();
    return await getAllProducts();
};

// Kategori yönetimi için yardımcı fonksiyonlar
export const categoryUtils = {
    // Yeni kategori ekle
    addCategory: async (categoryName) => {
        try {
            console.log(`Adding new category: ${categoryName}`);
            await categoryApi.createCategory(categoryName);

            // Cache'i temizle ki yeni kategori dahil edilsin
            clearProductCache();

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

            // Cache'i temizle ki yeni beden dahil edilsin
            clearProductCache();

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

            // Cache'i temizle ki yeni kategoriler dahil edilsin
            clearProductCache();

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
            console.log(`API test successful - found ${categories.length} categories`);
            return true;
        } catch (error) {
            console.error('API test failed:', error);
            return false;
        }
    }
};