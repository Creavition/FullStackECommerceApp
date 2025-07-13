// screens/Home.js - Maximum update depth sorunu çözüldü
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity, ScrollView,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFilter } from '../contexts/FilterContext';

import ProductCardHorizontal from '../components/ProductCardHorizontal';

import { getAllProducts, getCategories, parsePrice, toggleProductFavorite, logProductDetails } from '../utils/productUtils';

export default function Home() {
    const navigation = useNavigation();
    const isMounted = useRef(true);

    const { favoriteItems, toggleFavorite } = useFavorites();
    const { translations, language } = useLanguage();
    const { theme, isDarkMode } = useTheme();
    const { updateFilters } = useFilter() || {};

    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Basit veri yükleme - dependency'leri sabitledik
    const loadProducts = useCallback(async () => {
        if (!isMounted.current) return;

        setLoading(true);
        try {
            const [products, categoryList] = await Promise.all([
                getAllProducts(),
                getCategories()
            ]);

            if (isMounted.current) {
                setAllProducts(products || []);
                setCategories(categoryList || []);
                setIsInitialLoad(false);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            if (isMounted.current) {
                setAllProducts([]);
                setCategories([]);
                setIsInitialLoad(false);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, []); // Dependency array'i boş bıraktık

    // İlk mount'ta yükle
    useEffect(() => {
        if (isInitialLoad) {
            loadProducts();
        }
    }, [isInitialLoad]); // Sadece isInitialLoad'a bağlı

    // Dil değiştiğinde yeniden yükle
    useEffect(() => {
        if (!isInitialLoad) {
            loadProducts();
        }
    }, [language]); // Sadece language'a bağlı

    // Sayfa odaklandığında - sadece gerektiğinde yükle (optimize edilmiş)
    useFocusEffect(
        useCallback(() => {
            // Sadece veriler tamamen boşsa yükle
            if (allProducts.length === 0 && !loading) {
                loadProducts();
            }
        }, [allProducts.length, loading])
    );

    // Cleanup fonksiyonu
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Basit kategori filtreleme
    const flashSaleProducts = useMemo(() => {
        const products = allProducts || [];
        return products.filter(p => p && p.badge_FlashSale);
    }, [allProducts]);

    const fastDeliveryProducts = useMemo(() => {
        const products = allProducts || [];
        return products.filter(p => p && p.label_FastDelivery);
    }, [allProducts]);

    const bestSellingProducts = useMemo(() => {
        const products = allProducts || [];
        return products.filter(p => p && p.badge_BestSelling);
    }, [allProducts]);

    const handleProductPress = useCallback((product) => {
        // Debug için product detaylarını log'la
        if (__DEV__) {
            logProductDetails(product);
        }
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    // Basit favori toggle
    const handleFavoritePress = useCallback(async (productId) => {
        const currentProduct = allProducts.find(p => p.id === productId);
        if (!currentProduct) return;

        // Optimistic update
        setAllProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === productId
                    ? { ...p, isFavorite: !p.isFavorite }
                    : p
            )
        );

        // API çağrısı
        const success = await toggleProductFavorite(productId, currentProduct.isFavorite);
        if (!success) {
            // Başarısızsa geri al
            setAllProducts(prevProducts =>
                prevProducts.map(p =>
                    p.id === productId
                        ? { ...p, isFavorite: currentProduct.isFavorite }
                        : p
                )
            );
        }
    }, [allProducts]);

    // Kategori basma fonksiyonu - Filter context'i de güncelle - Optimized
    const handleCategoryPress = useCallback((category) => {
        console.log(`Home: Category pressed: ${category}`);

        // Filter context'i güncelle
        if (updateFilters && typeof updateFilters === 'function') {
            updateFilters({
                selectedCategory: category,
                priceRange: { min: 0, max: 1000 },
                selectedSizes: []
            });
        }

        // Search sayfasına git - her seferinde yeni route ile
        navigation.navigate('Search', {
            selectedCategory: category,
            timestamp: Date.now() // Her seferinde farklı bir param ekle
        });
    }, [navigation, updateFilters]);

    // Render functions - sabit dependency'ler
    const renderHorizontalItem = useCallback(({ item }) => (
        <ProductCardHorizontal
            item={item}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            translations={translations}
            isDarkMode={isDarkMode}
        />
    ), [handleProductPress, handleFavoritePress, translations, isDarkMode]);

    const renderCategory = useCallback(({ item }) => (
        <TouchableOpacity
            style={[styles.categoryItem, { backgroundColor: theme.cardBackground }]}
            onPress={() => handleCategoryPress(item)}
        >
            <Text style={[styles.categoryText, { color: theme.text }]}>{item}</Text>
        </TouchableOpacity>
    ), [handleCategoryPress, theme]);

    if (loading) {
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
                <View style={[styles.header, { backgroundColor: theme.primary }]}>
                    <View style={styles.headerContent}>
                        <Image source={require('../assets/images/KombinSepeti-logo-kucuk.png')} style={styles.logo} />
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Ionicons name="search" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {translations.categories || 'Categories'}
                    </Text>
                    <FlatList
                        data={categories}
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
