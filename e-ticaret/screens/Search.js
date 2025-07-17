// screens/Search.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    View, Text, TextInput, StyleSheet, FlatList, StatusBar, TouchableOpacity, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFavorites } from '../contexts/FavoritesContext';
import { useFilter } from '../contexts/FilterContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProduct } from '../contexts/ProductContext';

import SelectableOptions from '../components/SelectableOptions';
import ProductCard from '../components/ProductCard';

import { parsePrice } from '../utils/productUtils';

export default function Search() {
    const navigation = useNavigation();
    const route = useRoute();
    const scrollViewRef = useRef(null); // ScrollView için ref

    const { favoriteItems, toggleFavorite } = useFavorites() || { favoriteItems: {}, toggleFavorite: () => { } };
    const { filters, updateFilters } = useFilter() || {
        filters: {
            minPrice: null,
            maxPrice: null,
            selectedCategory: null,
            selectedSizes: []
        },
        updateFilters: () => { }
    };
    const { theme, isDarkMode } = useTheme() || { theme: {}, isDarkMode: false };
    const { products, loading, fetchProducts, updateProductFavoriteStatus } = useProduct();

    const [searchText, setSearchText] = useState('');
    const [sortOption, setSortOption] = useState(null);
    const [categories] = useState(['Jacket', 'Pants', 'Shoes', 'T-Shirt']);

    const { minPrice, maxPrice, selectedCategory, selectedSizes } = filters || {};

    // Navigation başlığını güncelle
    useEffect(() => {
        const title = selectedCategory
            ? `${selectedCategory} 'Ürün'`
            : 'Tüm Ürünler';

        navigation.setOptions({
            title: title,
            headerStyle: {
                backgroundColor: theme.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        });
    }, [selectedCategory, navigation, theme.primary]);


    useEffect(() => {
        if (products.length === 0 && !loading) {
            fetchProducts();
        }
    }, []);

    // Route params'tan kategori al ve filter'a set et 
    useEffect(() => {
        const { selectedCategory: routeCategory, timestamp } = route.params || {};
        if (routeCategory && updateFilters && typeof updateFilters === 'function') {
            console.log(`Search: Route params changed - Category: ${routeCategory}, Timestamp: ${timestamp}`);

            updateFilters({
                selectedCategory: routeCategory,
                priceRange: filters?.priceRange || { min: 0, max: 1000 },
                selectedSizes: filters?.selectedSizes || []
            });
        }
    }, [route.params?.selectedCategory, route.params?.timestamp]);

    // FavoriteItems değiştiğinde ProductContext'teki ürünlerin isFavorite durumunu güncelle
    useEffect(() => {
        if (products && products.length > 0) {
            products.forEach(product => {
                const isFavoriteInContext = favoriteItems[product.id] || false;
                if (product.isFavorite !== isFavoriteInContext) {
                    updateProductFavoriteStatus(product.id, isFavoriteInContext);
                }
            });
        }
    }, [favoriteItems, products, updateProductFavoriteStatus]);

    // Arama tab'ına tıklandığında en üste scroll yapma
    useFocusEffect(
        useCallback(() => {
            const unsubscribe = navigation.addListener('tabPress', (e) => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToOffset({ offset: 0, animated: true });
                }
            });

            return unsubscribe;
        }, [navigation])
    );


    const flashSaleProducts = useMemo(() => {
        const ids = new Set();
        const productList = products || [];

        // API'den gelen ürünlerin badge özelliği var mı kontrol et
        const hasApiFlags = productList.some(p => p && typeof p.badge_FlashSale === 'boolean');

        if (hasApiFlags) {
            // API verilerini kullan
            productList.forEach(p => {
                if (p && p.id && p.badge_FlashSale === true) {
                    ids.add(p.id);
                }
            });
        } else {
            const categoryList = categories && categories.length > 0 ? categories : ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];

            categoryList.forEach(cat => {
                products.filter(p => p && p.category === cat && p.price)
                    .sort((a, b) => {
                        const priceA = parsePrice(a.price);
                        const priceB = parsePrice(b.price);
                        return priceA - priceB;
                    })
                    .slice(0, 6)
                    .forEach(p => p && p.id && ids.add(p.id));
            });
        }
        return ids;
    }, [products]);

    const fastDeliveryProducts = useMemo(() => {
        const ids = new Set();
        const productList = products || [];

        // API'den gelen ürünlerin label özelliği var mı kontrol et
        const hasApiFlags = productList.some(p => p && typeof p.label_FastDelivery === 'boolean');

        if (hasApiFlags) {
            // API verilerini kullan
            productList.forEach(p => {
                if (p && p.id && p.label_FastDelivery === true) {
                    ids.add(p.id);
                }
            });
        } else {
            products.forEach(p => {
                if (p && p.id && typeof p.id === 'string') {
                    const hash = p.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
                    if (Math.abs(hash) % 10 < 3) ids.add(p.id);
                }
            });
        }
        return ids;
    }, [products]);

    const bestSellingProducts = useMemo(() => {
        const ids = new Set();
        const productList = products || [];

        // API'den gelen ürünlerin label özelliği var mı kontrol et
        const hasApiFlags = productList.some(p => p && typeof p.label_BestSeller === 'boolean');

        if (hasApiFlags) {
            productList.forEach(p => {
                if (p && p.id && p.label_BestSeller === true) {
                    ids.add(p.id);
                }
            });
        } else {

            productList.forEach(p => {
                if (p && p.id && typeof p.id === 'string') {
                    const hash = p.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
                    if (Math.abs(hash) % 10 >= 7) ids.add(p.id);
                }
            });
        }
        return ids;
    }, [products]);


    const filteredProducts = useMemo(() => {
        const productList = products || [];
        const searchLower = searchText.toLowerCase();

        return productList.filter(item => {
            if (!item || !item.name) return false;

            const price = parsePrice(item.price);

            // Category filtreleme 
            const categoryMatch = !selectedCategory ||
                item.category === selectedCategory ||
                item.categoryName === selectedCategory;

            // Size filtreleme 
            const sizeMatch = !selectedSizes || selectedSizes.length === 0 ||
                selectedSizes.every(selectedSize => {
                    return (Array.isArray(item.availableSizes) && item.availableSizes.includes(selectedSize)) ||
                        (Array.isArray(item.sizes) && item.sizes.includes(selectedSize)) ||
                        (typeof item.size === 'string' && item.size === selectedSize);
                });

            return (
                item.name.toLowerCase().includes(searchLower) &&
                (!minPrice || price >= minPrice) &&
                (!maxPrice || price <= maxPrice) &&
                categoryMatch &&
                sizeMatch
            );
        }).sort((a, b) => {
            if (!a || !b) return 0;

            const priceA = parsePrice(a.price);
            const priceB = parsePrice(b.price);
            const lowestPrice = 'En Düşük Fiyat';
            const highestPrice = 'En Yüksek Fiyat';

            switch (sortOption) {
                case lowestPrice: return priceA - priceB;
                case highestPrice: return priceB - priceA;
                default: return 0;
            }
        });
    }, [products, searchText, minPrice, maxPrice, selectedCategory, selectedSizes, sortOption]); // Updated to use products from context

    const handleProductPress = useCallback(product => {
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    const handleFavoritePress = useCallback(async (productId) => {
        console.log(`Search: Toggling favorite for product ${productId}`);


        const newFavoriteStatus = await toggleFavorite(productId, updateProductFavoriteStatus);


        if (newFavoriteStatus !== null) {
            console.log(`Search: Product ${productId} favorite status updated to: ${newFavoriteStatus}`);
        }
    }, [toggleFavorite, updateProductFavoriteStatus]);


    const renderItem = useCallback(({ item }) => (
        <ProductCard
            item={item}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            isDarkMode={isDarkMode}
            favoriteItems={favoriteItems}
        />
    ), [handleProductPress, handleFavoritePress, isDarkMode, favoriteItems]);


    const getItemLayout = useCallback((data, index) => ({
        length: 200,
        offset: 200 * index,
        index
    }), []);


    const keyExtractor = useCallback((item) => item.id, []);


    const EmptyComponent = useCallback(() => (
        <View style={styles.emptyContainer}>
            <Ionicons name="search" size={60} color="#ccc" />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Ürün Bulunamadı</Text>
        </View>
    ), [theme.textSecondary]);

    const clearSearch = useCallback(() => setSearchText(''), []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />
                <Ionicons name="refresh" size={40} color="#FF6B35" />
                <Text style={styles.loadingText}>Yükleniyor</Text>
            </View>
        );
    }


    const ListHeaderComponent = useCallback(() => (
        <View>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />

            {/* Arama ve Sıralama */}
            <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
                <View style={[styles.searchBox, { backgroundColor: theme.surface || '#f0f0f0', borderColor: theme.border || '#e0e0e0' }]}>
                    <Ionicons name="search" size={22} color={theme.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        placeholder={'Ürün Arama'}
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
                    categories={categories}
                    sizeOptions={products.length > 0 ? [...new Set(products.flatMap(p => p.availableSizes || p.sizes || []))] : []}
                    onSelect={setSortOption}
                    onFilter={(min, max) => updateFilters && typeof updateFilters === 'function' ? updateFilters({ minPrice: min, maxPrice: max }) : null}
                />
            </View>

            {/* Product Count */}
            <View style={styles.countContainer}>
                <Text style={[styles.countText, { color: theme.textSecondary }]}>
                    {filteredProducts.length} Ürün Bulundu
                </Text>
            </View>
        </View>
    ), [isDarkMode, theme, searchText, clearSearch, categories, products, updateFilters, setSortOption, filteredProducts.length]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                ref={scrollViewRef}
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
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={EmptyComponent}
                onEndReachedThreshold={0.5}
            />
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