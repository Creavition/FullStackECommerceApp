// screens/Search.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
    View, Text, TextInput, StyleSheet, FlatList, StatusBar, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFavorites } from '../contexts/FavoritesContext';
import { useFilter } from '../contexts/FilterContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

import SelectableOptions from '../components/SelectableOptions';
import ProductCard from '../components/ProductCard';

import { getAllProducts, getCategories, categoryUtils, checkApiStatus } from '../utils/productUtils';

export default function Search() {
    const navigation = useNavigation();
    const route = useRoute();

    const { favoriteItems, toggleFavorite } = useFavorites() || { favoriteItems: {}, toggleFavorite: () => { } };
    const { filters, updateFilters } = useFilter() || {
        filters: {
            minPrice: null,
            maxPrice: null,
            selectedCategory: null,
            selectedSize: null
        },
        updateFilters: () => { }
    };
    const { translations, language } = useLanguage() || { translations: {}, language: 'en' };
    const { theme, isDarkMode } = useTheme() || { theme: {}, isDarkMode: false };

    const [searchText, setSearchText] = useState('');
    const [sortOption, setSortOption] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState(['Jacket', 'Pants', 'Shoes', 'T-Shirt']); // Fallback kategoriler
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState(true);

    const { minPrice, maxPrice, selectedCategory, selectedSize } = filters || {};

    // parsePrice fonksiyonunu useCallback ile memoize et
    const parsePrice = useCallback((str) => parseFloat(str.replace('₺', '').replace(',', '.')), []);

    // loadProducts fonksiyonunu dependency array'den parsePrice'ı kaldır
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            // API durumunu kontrol et
            const apiOk = checkApiStatus();
            setApiStatus(apiOk);

            // Kategorileri ve ürünleri paralel olarak yükle
            const [products, categoryList] = await Promise.all([
                getAllProducts().catch(() => []), // Hata durumunda boş array
                getCategories().catch(() => ['Jacket', 'Pants', 'Shoes', 'T-Shirt']) // Fallback
            ]);

            // Güvenli veri kontrolü
            const safeProducts = Array.isArray(products) ? products : [];
            const safeCategories = Array.isArray(categoryList) ? categoryList : ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];

            setAllProducts(safeProducts);
            setCategories(safeCategories);

            console.log(`Search: Loaded ${safeProducts.length} products and ${safeCategories.length} categories`);
        } catch (e) {
            console.error('Error loading products in Search:', e);
            // Hata durumunda API'yi tekrar test et
            try {
                const testResult = await categoryUtils.testApiConnection();
                setApiStatus(testResult);
            } catch (testError) {
                console.error('Error testing API connection in Search:', testError);
                setApiStatus(false);
            }

            // Fallback verilerini ayarla
            setAllProducts([]);
            setCategories(['Jacket', 'Pants', 'Shoes', 'T-Shirt']);
        } finally {
            setLoading(false);
        }
    }, []); // parsePrice'ı dependency array'den kaldırdık

    useEffect(() => {
        loadProducts();
    }, [loadProducts, language]);

    useEffect(() => {
        if (route.params && updateFilters && typeof updateFilters === 'function') {
            updateFilters(route.params);
        }
    }, [route.params, updateFilters]);

    const flashSaleProducts = useMemo(() => {
        const ids = new Set();
        const categoryList = categories && categories.length > 0 ? categories : ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
        const products = allProducts || [];

        categoryList.forEach(cat => {
            products.filter(p => p && p.category === cat)
                .sort((a, b) => {
                    const priceA = a && a.price ? parseFloat(a.price.replace('₺', '').replace(',', '.')) : 0;
                    const priceB = b && b.price ? parseFloat(b.price.replace('₺', '').replace(',', '.')) : 0;
                    return priceA - priceB;
                })
                .slice(0, 6)
                .forEach(p => p && p.id && ids.add(p.id));
        });
        return ids;
    }, [allProducts, categories]);

    const fastDeliveryProducts = useMemo(() => {
        const ids = new Set();
        const products = allProducts || [];

        products.forEach(p => {
            if (p && p.id) {
                const hash = p.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
                if (Math.abs(hash) % 10 < 3) ids.add(p.id);
            }
        });
        return ids;
    }, [allProducts]);

    const bestSellingProducts = useMemo(() => {
        const ids = new Set();
        const products = allProducts || [];

        products.forEach(p => {
            if (p && p.id) {
                const hash = p.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
                if (Math.abs(hash) % 10 >= 7) ids.add(p.id);
            }
        });
        return ids;
    }, [allProducts]);

    const filteredProducts = useMemo(() => {
        const products = allProducts || [];
        return products.filter(item => {
            if (!item || !item.price || !item.name) return false;

            const price = parseFloat(item.price.replace('₺', '').replace(',', '.'));
            return (
                item.name.toLowerCase().includes(searchText.toLowerCase()) &&
                (!minPrice || price >= minPrice) &&
                (!maxPrice || price <= maxPrice) &&
                (!selectedCategory || item.category === selectedCategory) &&
                (!selectedSize || (Array.isArray(item.availableSizes) && item.availableSizes.includes(selectedSize)))
            );
        }).sort((a, b) => {
            if (!a || !a.price || !b || !b.price) return 0;

            const priceA = a && a.price ? parseFloat(a.price.replace('₺', '').replace(',', '.')) : 0;
            const priceB = b && b.price ? parseFloat(b.price.replace('₺', '').replace(',', '.')) : 0;
            switch (sortOption) {
                case translations?.lowestPrice: return priceA - priceB;
                case translations?.highestPrice: return priceB - priceA;
                default: return 0;
            }
        });
    }, [allProducts, searchText, minPrice, maxPrice, selectedCategory, selectedSize, sortOption, translations]);

    const handleProductPress = useCallback(product => {
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    const handleFavoritePress = useCallback(productId => {
        toggleFavorite(productId, 'Search');
    }, [toggleFavorite]);

    // Optimize renderItem with stable references
    const renderItem = useCallback(({ item }) => (
        <ProductCard
            item={item}
            isFavorite={!!favoriteItems[item.id]}
            isFlashSale={flashSaleProducts.has(item.id)}
            hasFastDelivery={fastDeliveryProducts.has(item.id)}
            isBestSelling={bestSellingProducts.has(item.id)}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            translations={translations}
            isDarkMode={isDarkMode}
        />
    ), [favoriteItems, flashSaleProducts, fastDeliveryProducts, bestSellingProducts, handleProductPress, handleFavoritePress, translations, isDarkMode]);

    // Optimize getItemLayout
    const getItemLayout = useCallback((data, index) => ({
        length: 200,
        offset: 200 * index,
        index
    }), []);

    // Optimize keyExtractor
    const keyExtractor = useCallback((item) => item.id, []);

    // Optimize empty component
    const EmptyComponent = useCallback(() => (
        <View style={styles.emptyContainer}>
            <Ionicons name="search" size={60} color="#ccc" />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{translations?.noProductsFound || 'No products found'}</Text>
        </View>
    ), [theme.textSecondary, translations?.noProductsFound]);

    const clearSearch = useCallback(() => setSearchText(''), []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />
                <Ionicons name="refresh" size={40} color="#FF6B35" />
                <Text style={styles.loadingText}>{translations?.loading || 'Loading...'}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />

            {/* Arama ve Sıralama */}
            <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
                {/* API Status Indicator */}
                <View style={styles.apiStatusContainer}>
                    <Ionicons
                        name={apiStatus ? "checkmark-circle" : "alert-circle"}
                        size={16}
                        color={apiStatus ? "#4CAF50" : "#FF6B35"}
                    />
                    <Text style={[styles.apiStatusText, { color: apiStatus ? "#4CAF50" : "#FF6B35" }]}>
                        {apiStatus ? "API Connected" : "Using Offline Data"}
                    </Text>
                </View>

                <View style={[styles.searchBox, { backgroundColor: theme.surface || '#f0f0f0', borderColor: theme.border || '#e0e0e0' }]}>
                    <Ionicons name="search" size={22} color={theme.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        placeholder={translations?.searchForProducts || 'Search for products...'}
                        placeholderTextColor={theme.textTertiary}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Ionicons name="close" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
                <SelectableOptions
                    onSelect={setSortOption}
                    onFilter={(min, max) => updateFilters && typeof updateFilters === 'function' ? updateFilters({ minPrice: min, maxPrice: max }) : null}
                />
            </View>

            {/* Product Count */}
            <View style={styles.countContainer}>
                <Text style={[styles.countText, { color: theme.textSecondary }]}>
                    {filteredProducts.length} {translations?.productsFound || 'products found'}
                </Text>
            </View>

            {/* Ana Ürün Listesi */}
            <View style={styles.mainListContainer}>
                <FlatList
                    data={filteredProducts}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.productList}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={false}
                    maxToRenderPerBatch={20}
                    updateCellsBatchingPeriod={100}
                    initialNumToRender={20}
                    windowSize={10}
                    keyboardShouldPersistTaps="handled"
                    getItemLayout={getItemLayout}
                    ListEmptyComponent={EmptyComponent}
                    onEndReachedThreshold={0.5}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        fontWeight: '500'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingTop: 50,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginLeft: 8,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    apiStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignSelf: 'center',
    },
    apiStatusText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    searchIcon: {
        marginRight: 12
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '400'
    },
    countContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    countText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500'
    },
    mainListContainer: {
        flex: 1,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    productList: {
        paddingTop: 20,
        paddingBottom: 20
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: '#999',
        fontWeight: '500'
    },
});