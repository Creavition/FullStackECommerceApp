// screens/Home.js - API ile çalışacak şekilde güncellendi
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity, ScrollView,
    Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFilter } from '../contexts/FilterContext';
import { useProduct } from '../contexts/ProductContext';

import ProductCardHorizontal from '../components/ProductCardHorizontal';

import { parsePrice, logProductDetails } from '../utils/productUtils';

export default function Home() {
    const navigation = useNavigation();
    const isMounted = useRef(true);

    const { favoriteItems, toggleFavorite } = useFavorites();
    const { translations, language } = useLanguage();
    const { theme, isDarkMode } = useTheme();
    const { updateFilters } = useFilter() || {};
    const { products, loading, error, fetchProducts, fetchProductsByCategory, updateProductFavoriteStatus } = useProduct();

    const [categories] = useState(['Jacket', 'Pants', 'Shoes', 'T-Shirt']); // Static categories for now
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Component mount/unmount tracking
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Initial data loading
    useEffect(() => {
        if (isInitialLoad) {
            fetchProducts().finally(() => {
                setIsInitialLoad(false);
            });
        }
    }, [isInitialLoad, fetchProducts]);

    // Show loading only for initial load
    const isLoading = isInitialLoad && loading;

    // Basit kategori filtreleme
    const flashSaleProducts = useMemo(() => {
        const productList = products || [];
        return productList.filter(p => p && p.badge_FlashSale);
    }, [products]);

    const fastDeliveryProducts = useMemo(() => {
        const productList = products || [];
        return productList.filter(p => p && p.label_FastDelivery);
    }, [products]);

    const bestSellerProducts = useMemo(() => {
        const productList = products || [];
        return productList.filter(p => p && p.label_BestSeller);
    }, [products]);

    const bestSellingProducts = useMemo(() => {
        const productList = products || [];
        return productList.filter(p => p && p.badge_BestSelling);
    }, [products]);

    // Categories listesi - başına "All" seçeneği eklenir
    const categoriesWithAll = useMemo(() => {
        const allOption = translations.all || 'All';
        return [allOption, ...(categories || [])];
    }, [categories, translations.all]);

    const handleProductPress = useCallback((product) => {
        // Debug için product detaylarını log'la
        if (__DEV__) {
            logProductDetails(product);
        }
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    // Basit favori toggle
    const handleFavoritePress = useCallback(async (productId) => {
        console.log(`Home: Toggling favorite for product ${productId}`);

        const currentProduct = products.find(p => p.id === productId);
        if (!currentProduct) {
            return;
        }

        // Context'teki toggle fonksiyonunu kullan ve ProductContext'i güncelle
        const newFavoriteStatus = await toggleFavorite(productId, 'Home', updateProductFavoriteStatus);

        // Eğer API'den cevap gelmişse durumu logla
        if (newFavoriteStatus !== null) {
            console.log(`Home: Product ${productId} favorite status updated to: ${newFavoriteStatus}`);
        }
    }, [products, toggleFavorite, updateProductFavoriteStatus]);

    // Kategori basma fonksiyonu - Filter context'i de güncelle - Optimized
    const handleCategoryPress = useCallback((category) => {
        console.log(`Home: Category pressed: ${category}`);

        // "All" seçeneği için özel işlem
        const allOption = translations.all || 'All';
        const selectedCategory = category === allOption ? null : category;

        // Filter context'i güncelle
        if (updateFilters && typeof updateFilters === 'function') {
            updateFilters({
                selectedCategory: selectedCategory,
                priceRange: { min: 0, max: 1000 },
                selectedSizes: []
            });
        }

        // Search sayfasına git - her seferinde yeni route ile
        navigation.navigate('Search', {
            selectedCategory: selectedCategory,
            timestamp: Date.now() // Her seferinde farklı bir param ekle
        });
    }, [navigation, updateFilters, translations.all]);

    // Render functions - sadece gerekli dependency'ler (favoriteItems kaldırıldı)
    const renderHorizontalItem = useCallback(({ item }) => (
        <ProductCardHorizontal
            item={item}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            translations={translations}
            isDarkMode={isDarkMode}
            favoriteItems={favoriteItems}
        />
    ), [handleProductPress, handleFavoritePress, translations, isDarkMode]);

    const renderCategory = useCallback(({ item }) => {
        const allOption = translations.all || 'All';
        const isAllOption = item === allOption;

        return (
            <TouchableOpacity
                style={[
                    styles.categoryItem,
                    {
                        backgroundColor: isAllOption
                            ? '#000000'
                            : theme.cardBackground,
                    },
                    isAllOption && styles.allCategoryItem
                ]}
                onPress={() => handleCategoryPress(item)}
            >
                {isAllOption && (
                    <Ionicons
                        name="apps"
                        size={16}
                        color="white"
                        style={styles.allCategoryIcon}
                    />
                )}
                <Text style={[
                    styles.categoryText,
                    {
                        color: isAllOption ? 'white' : theme.text,
                        fontWeight: isAllOption ? 'bold' : '500'
                    }
                ]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    }, [handleCategoryPress, theme, translations.all]);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <Text style={[styles.loadingText, { color: theme.text }]}>
                    {translations.loading || 'Loading...'}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                backgroundColor={theme.primary}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}


                {/* Categories */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {translations.categories || 'Categories'}
                    </Text>
                    <FlatList
                        data={categoriesWithAll}
                        renderItem={renderCategory}
                        keyExtractor={(item, index) => `category-${index}-${item}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesList}
                    />
                </View>

                {/* Flash Sale */}
                {flashSaleProducts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="flash" size={20} color={theme.primary} style={styles.sectionIcon} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                    {translations.flashSale || 'Flash Sale'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('FlashSale')}>
                                <Text style={[styles.seeAll, { color: theme.primary }]}>
                                    {translations.seeAll || 'See All'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={flashSaleProducts.slice(0, 10)}
                            renderItem={renderHorizontalItem}
                            keyExtractor={item => `flash-${item.id}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}

                {/* Best Selling */}
                {bestSellingProducts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="trending-up" size={20} color={theme.primary} style={styles.sectionIcon} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                    {translations.bestSelling || 'Best Selling'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('BestSeller')}>
                                <Text style={[styles.seeAll, { color: theme.primary }]}>
                                    {translations.seeAll || 'See All'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={bestSellingProducts.slice(0, 10)}
                            renderItem={renderHorizontalItem}
                            keyExtractor={item => `best-${item.id}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}

                {/* Fast Delivery */}
                {fastDeliveryProducts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="rocket" size={20} color={theme.primary} style={styles.sectionIcon} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                    {translations.fastDelivery || 'Fast Delivery'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('FastDelivery')}>
                                <Text style={[styles.seeAll, { color: theme.primary }]}>
                                    {translations.seeAll || 'See All'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={fastDeliveryProducts.slice(0, 10)}
                            renderItem={renderHorizontalItem}
                            keyExtractor={item => `fast-${item.id}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 40,
        resizeMode: 'contain',
    },
    section: {
        marginVertical: 15,
        paddingHorizontal: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionIcon: {
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoriesList: {
        marginTop: 10,
    },
    categoryItem: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        flexDirection: 'row',
        alignItems: 'center',
    },
    allCategoryItem: {
        paddingHorizontal: 16,
        elevation: 4,
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    allCategoryIcon: {
        marginRight: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
