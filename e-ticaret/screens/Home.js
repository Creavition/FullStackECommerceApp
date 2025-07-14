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
    const scrollViewRef = useRef(null); // ScrollView için ref

    const { favoriteItems, toggleFavorite } = useFavorites();
    const { translations, language } = useLanguage();
    const { theme, isDarkMode } = useTheme();
    const { updateFilters } = useFilter() || {};
    const { products, loading, error, fetchProducts, fetchProductsByCategory, updateProductFavoriteStatus } = useProduct();

    const [categories] = useState(['Jacket', 'Pants', 'Shoes', 'T-Shirt']); // Static categories for now
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Show loading only for initial load - performance optimization
    const isLoading = useMemo(() => isInitialLoad && loading, [isInitialLoad, loading]);

    // Component mount/unmount tracking
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Initial data loading - sadece bir kez çalışsın
    useEffect(() => {
        if (isInitialLoad) {
            fetchProducts().finally(() => {
                if (isMounted.current) {
                    setIsInitialLoad(false);
                }
            });
        }
    }, [isInitialLoad]); // fetchProducts dependency'sini kaldırdık

    // Memoized products - sadece products değiştiğinde hesaplanır ve stable array döndürür
    const flashSaleProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        const filtered = products.filter(p => p?.badge_FlashSale);
        return filtered.slice(0, 10); // Slice'ı burada yap
    }, [products]);

    const fastDeliveryProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        const filtered = products.filter(p => p?.label_FastDelivery);
        return filtered.slice(0, 10); // Slice'ı burada yap
    }, [products]);

    const bestSellerProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        const filtered = products.filter(p => p?.label_BestSeller);
        return filtered.slice(0, 10); // Slice'ı burada yap
    }, [products]);

    const bestSellingProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        const filtered = products.filter(p => p?.badge_BestSelling);
        return filtered.slice(0, 10); // Slice'ı burada yap
    }, [products]);

    // Categories listesi - başına "All" seçeneği eklenir
    const categoriesWithAll = useMemo(() => {
        const allOption = translations.all || 'All';
        return [allOption, ...(categories || [])];
    }, [categories, translations.all]);

    const handleProductPress = useCallback((product) => {
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

    // Tüm içeriği bir data array'i olarak hazırla
    const homeData = useMemo(() => {
        const data = [];

        // Categories section
        data.push({ type: 'categories', data: categoriesWithAll });

        // Flash Sale section
        if (flashSaleProducts.length > 0) {
            data.push({
                type: 'section',
                title: translations.flashSale || 'Flash Sale',
                icon: 'flash',
                seeAllRoute: 'FlashSale',
                products: flashSaleProducts,
                keyPrefix: 'flash'
            });
        }

        // Best Selling section  
        if (bestSellingProducts.length > 0) {
            data.push({
                type: 'section',
                title: translations.bestSelling || 'Best Selling',
                icon: 'trending-up',
                seeAllRoute: 'BestSeller',
                products: bestSellingProducts,
                keyPrefix: 'bestselling'
            });
        }

        // Fast Delivery section
        if (fastDeliveryProducts.length > 0) {
            data.push({
                type: 'section',
                title: translations.fastDelivery || 'Fast Delivery',
                icon: 'rocket',
                seeAllRoute: 'FastDelivery',
                products: fastDeliveryProducts,
                keyPrefix: 'fastdelivery'
            });
        }

        return data;
    }, [categoriesWithAll, flashSaleProducts, bestSellingProducts, fastDeliveryProducts, translations]);

    // Ana render item function
    const renderMainItem = useCallback(({ item, index }) => {
        if (item.type === 'categories') {
            return (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {translations.categories || 'Categories'}
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesList}
                    >
                        {item.data.map((category, catIndex) => (
                            <TouchableOpacity
                                key={`category-${catIndex}-${category}`}
                                style={[
                                    styles.categoryItem,
                                    {
                                        backgroundColor: theme.cardBackground,
                                    }
                                ]}
                                onPress={() => handleCategoryPress(category)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    {
                                        color: theme.text,
                                        fontWeight: '500'
                                    }
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            );
        }

        if (item.type === 'section') {
            return (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Ionicons name={item.icon} size={20} color={theme.primary} style={styles.sectionIcon} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                {item.title}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate(item.seeAllRoute)}>
                            <Text style={[styles.seeAll, { color: theme.primary }]}>
                                {translations.seeAll || 'See All'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {item.products.map((product, prodIndex) => (
                            <ProductCardHorizontal
                                key={`${item.keyPrefix}-${product.id}-${prodIndex}`}
                                item={product}
                                onProductPress={handleProductPress}
                                onFavoritePress={handleFavoritePress}
                                translations={translations}
                                isDarkMode={isDarkMode}
                                favoriteItems={favoriteItems}
                            />
                        ))}
                    </ScrollView>
                </View>
            );
        }

        return null;
    }, [theme, translations, navigation, handleCategoryPress, handleProductPress, handleFavoritePress, isDarkMode, favoriteItems]);

    // useFocusEffect yerine navigation listener kullan - sadece gerektiğinde data refresh
    useFocusEffect(
        useCallback(() => {
            // Sadece favoriler güncellensin, tüm ürünler yeniden yüklenmesin
            console.log('Home screen focused - skipping full product refresh');
            return () => {
                // Cleanup function
            };
        }, [])
    );

    // Home tab'a basıldığında en üste kaydır
    useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress', (e) => {
            // Eğer zaten Home screen'deysek, en üste kaydır
            if (navigation.isFocused()) {
                scrollViewRef.current?.scrollToOffset({
                    offset: 0,
                    animated: true,
                });
            }
        });

        return unsubscribe;
    }, [navigation]);

    // Early return for loading state - after all hooks
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

            <FlatList
                ref={scrollViewRef}
                data={homeData}
                renderItem={renderMainItem}
                keyExtractor={(item, index) => `home-${item.type}-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.mainContainer}
                removeClippedSubviews={false}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={5}
            />
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
    mainContainer: {
        paddingBottom: 20,
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
        marginVertical: 20,
        paddingHorizontal: 15,
        paddingVertical: 20
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
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
