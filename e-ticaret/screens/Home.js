
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity, ScrollView,
    Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFilter } from '../contexts/FilterContext';
import { useProduct } from '../contexts/ProductContext';

import ProductCardHorizontal from '../components/ProductCardHorizontal';

import { logProductDetails } from '../utils/productUtils';

export default function Home() {
    const navigation = useNavigation();
    const scrollViewRef = useRef(null); // ScrollView için ref

    const { favoriteItems, toggleFavorite } = useFavorites();
    const { theme, isDarkMode, isLoading: themeLoading } = useTheme();
    const { updateFilters } = useFilter() || {};
    const { products, loading, fetchProducts, updateProductFavoriteStatus } = useProduct();

    const [categories] = useState(['Jacket', 'Pants', 'Shoes', 'T-Shirt']);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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

    const flashSaleProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        const filtered = products.filter(p => p?.badge_FlashSale);
        return filtered.slice(0, 10);
    }, [products]);

    const fastDeliveryProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        const filtered = products.filter(p => p?.label_FastDelivery);
        return filtered.slice(0, 10);
    }, [products]);


    const bestSellingProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        const filtered = products.filter(p => p?.badge_BestSelling);
        return filtered.slice(0, 10);
    }, [products]);


    const categoriesWithAll = useMemo(() => {
        const allOption = 'Tümü';
        return [allOption, ...(categories || [])];
    }, [categories]);

    // Memoized styles to prevent unnecessary re-renders
    const categoryItemStyle = useMemo(() => ({
        backgroundColor: theme?.cardBackground || theme?.card || '#ffffff',
    }), [theme?.cardBackground, theme?.card]);

    const categoryTextStyle = useMemo(() => ({
        color: theme?.text || '#333333',
        fontWeight: '500'
    }), [theme?.text]);

    const handleProductPress = useCallback((product) => {
        logProductDetails(product);

        // Tab navigator'ın parent navigation'ını kullan
        const parentNavigation = navigation.getParent();
        if (parentNavigation) {
            parentNavigation.navigate('ProductDetail', { product });
        }
    }, [navigation]);

    // favori toggle
    const handleFavoritePress = useCallback(async (productId) => {
        const currentProduct = products.find(p => p.id === productId);
        if (!currentProduct) {
            return;
        }

        // Context'teki toggle fonksiyonunu kullan ve ProductContext'i güncelle
        const newFavoriteStatus = await toggleFavorite(productId, updateProductFavoriteStatus);
    }, [products, toggleFavorite, updateProductFavoriteStatus]); // favoriteItems dependency'sini kaldırdık

    // Kategori basma fonksiyonu
    const handleCategoryPress = useCallback((category) => {
        // "All" seçeneği secılırse bısey secmemıs gıbı olur. Dırek search sayfasına yonlendırmek ıcın
        const allOption = 'Tümü';
        const selectedCategory = category === allOption ? null : category;

        // Filter context'i güncelle
        if (updateFilters && typeof updateFilters === 'function') {
            updateFilters({
                selectedCategory: selectedCategory,
                priceRange: { min: 0, max: 1000 },
                selectedSizes: []
            });
        }

        // Search sayfasına git - Tab navigation kullanarak
        navigation.navigate('Search', {
            screen: 'SearchMain',
            params: {
                selectedCategory: selectedCategory,
                timestamp: Date.now() // Her seferinde farklı bir param ekle
            }
        });
    }, [navigation, updateFilters]);

    // Tüm içeriği bir data array'i olarak hazırla
    const homeData = useMemo(() => {
        const data = [];

        // Categories bolumu
        data.push({ type: 'categories', data: categoriesWithAll });

        // Flash Sale bolumu
        if (flashSaleProducts.length > 0) {
            data.push({
                type: 'section',
                title: 'FLASH İNDİRİM',
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
                title: 'EN ÇOK SATAN',
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
                title: 'Hızlı Teslimat',
                icon: 'rocket',
                seeAllRoute: 'FastDelivery',
                products: fastDeliveryProducts,
                keyPrefix: 'fastdelivery'
            });
        }

        return data;
    }, [categoriesWithAll, flashSaleProducts, bestSellingProducts, fastDeliveryProducts]);

    // Ana render item fonksiyonu
    const renderMainItem = useCallback(({ item, index }) => {
        if (item.type === 'categories') {
            return (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Kategoriler
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesList}
                    >
                        {item.data.map((category, catIndex) => (
                            <TouchableOpacity
                                key={`category-${catIndex}-${category}`}
                                style={[styles.categoryItem, categoryItemStyle]}
                                onPress={() => handleCategoryPress(category)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.categoryText, categoryTextStyle]}>
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
                        <TouchableOpacity onPress={() => {

                            const parentNavigation = navigation.getParent();
                            if (parentNavigation) {
                                parentNavigation.navigate(item.seeAllRoute);
                            }
                        }}>
                            <Text style={[styles.seeAll, { color: theme.primary }]}>
                                Tümünü Gör
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
                                isDarkMode={isDarkMode}
                                favoriteItems={favoriteItems}
                            />
                        ))}
                    </ScrollView>
                </View>
            );
        }

        return null;
    }, [theme?.text, theme?.primary, categoryItemStyle, categoryTextStyle, navigation, handleCategoryPress, handleProductPress, handleFavoritePress, isDarkMode, favoriteItems]);

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


    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                backgroundColor={theme.primary}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />

            {loading || themeLoading ? (
                <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                    <Text style={[styles.loadingText, { color: theme.text }]}>
                        Yükleniyor
                    </Text>
                </View>
            ) : (
                <FlatList
                    ref={scrollViewRef}
                    data={homeData}
                    renderItem={renderMainItem}
                    keyExtractor={(item, index) => `home-${item.type}-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.mainContainer}
                    removeClippedSubviews={false}
                    initialNumToRender={4}
                    maxToRenderPerBatch={4}
                    windowSize={5}
                />
            )}
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
        borderWidth: 2,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 40,
        justifyContent: 'center',
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
