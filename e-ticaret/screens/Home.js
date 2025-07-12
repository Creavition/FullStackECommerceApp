// screens/Home.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity, ScrollView,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

import ProductCardHorizontal from '../components/ProductCardHorizontal';

import { getAllProducts, getCategories, categoryUtils, checkApiStatus } from '../utils/productUtils';

export default function Home() {
    const navigation = useNavigation();

    const { favoriteItems, toggleFavorite } = useFavorites();
    const { translations, language } = useLanguage();
    const { theme, isDarkMode } = useTheme();

    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState(['Jacket', 'Pants', 'Shoes', 'T-Shirt']); // Fallback kategoriler
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState(true);

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

            console.log(`Loaded ${safeProducts.length} products and ${safeCategories.length} categories`);
        } catch (e) {
            console.error('Error loading products:', e);
            // Hata durumunda API'yi tekrar test et
            try {
                const testResult = await categoryUtils.testApiConnection();
                setApiStatus(testResult);
            } catch (testError) {
                console.error('Error testing API connection:', testError);
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

    const fastDeliveryFilteredProducts = useMemo(() => {
        const products = allProducts || [];
        return products.filter(item => item && item.id && fastDeliveryProducts.has(item.id));
    }, [allProducts, fastDeliveryProducts]);

    const flashSaleFilteredProducts = useMemo(() => {
        const products = allProducts || [];
        return products.filter(item => item && item.id && flashSaleProducts.has(item.id));
    }, [allProducts, flashSaleProducts]);

    const bestSellingFilteredProducts = useMemo(() => {
        const products = allProducts || [];
        return products.filter(item => item && item.id && bestSellingProducts.has(item.id));
    }, [allProducts, bestSellingProducts]);

    const handleProductPress = useCallback(product => {
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    const handleFavoritePress = useCallback(productId => {
        toggleFavorite(productId, 'Home');
    }, [toggleFavorite]);

    // Optimize horizontal renderItem with stable references
    const renderHorizontalItem = useCallback(({ item }) => (
        <ProductCardHorizontal
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

    // Optimize keyExtractor
    const keyExtractorFast = useCallback((item) => `fast-${item.id}`, []);
    const keyExtractorFlash = useCallback((item) => `flash-${item.id}`, []);
    const keyExtractorBest = useCallback((item) => `best-${item.id}`, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />
                <Ionicons name="refresh" size={40} color="#FF6B35" />
                <Text style={styles.loadingText}>{translations.loading}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface || '#fff' }]}>
                <View style={styles.headerContent}>
                    <Image style={{ width: 60, height: 60, marginBottom: 10 }} source={require("../assets/images/KombinSepeti-logo-kucuk.png")} />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{translations.welcomeToKombinSepeti}</Text>

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
                </View>
            </View>

            {/* Fast Delivery Bölümü */}
            {fastDeliveryFilteredProducts.length > 0 && (
                <View style={[styles.specialSectionContainer, { backgroundColor: theme.surface || '#fff' }]}>
                    <View style={[styles.sectionHeader, { backgroundColor: theme.surface || '#fff' }]}>
                        <View style={styles.sectionHeaderLeft}>
                            <Ionicons name="flash" size={24} color="#FF6B35" />
                            <View>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>{translations.fastDelivery}</Text>
                                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                                    {fastDeliveryFilteredProducts.length} {translations.products}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('FastDelivery')}
                        >
                            <Text style={styles.viewAllText}>{translations.viewAll}</Text>
                            <Ionicons name="chevron-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={fastDeliveryFilteredProducts}
                        keyExtractor={keyExtractorFast}
                        renderItem={renderHorizontalItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={5}
                        windowSize={10}
                        getItemLayout={(data, index) => ({
                            length: 160,
                            offset: 160 * index,
                            index,
                        })}
                    />
                </View>
            )}

            {/* Flash Sale Bölümü */}
            {flashSaleFilteredProducts.length > 0 && (
                <View style={[styles.specialSectionContainer, { backgroundColor: theme.surface || '#fff' }]}>
                    <View style={[styles.sectionHeader, { backgroundColor: theme.surface || '#fff' }]}>
                        <View style={styles.sectionHeaderLeft}>
                            <Ionicons name="flash-outline" size={24} color="#FF6B35" />
                            <View>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>{translations.flashSale}</Text>
                                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                                    {flashSaleFilteredProducts.length} {translations.products}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('FlashSale')}
                        >
                            <Text style={styles.viewAllText}>{translations.viewAll}</Text>
                            <Ionicons name="chevron-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={flashSaleFilteredProducts}
                        keyExtractor={keyExtractorFlash}
                        renderItem={renderHorizontalItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={5}
                        windowSize={10}
                        getItemLayout={(data, index) => ({
                            length: 160,
                            offset: 160 * index,
                            index,
                        })}
                    />
                </View>
            )}

            {/* Best Selling Bölümü */}
            {bestSellingFilteredProducts.length > 0 && (
                <View style={[styles.specialSectionContainer, { backgroundColor: theme.surface || '#fff' }]}>
                    <View style={[styles.sectionHeader, { backgroundColor: theme.surface || '#fff' }]}>
                        <View style={styles.sectionHeaderLeft}>
                            <Ionicons name="trending-up" size={24} color="#FF6B35" />
                            <View>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>{translations.bestSeller}</Text>
                                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                                    {bestSellingFilteredProducts.length} {translations.products}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('BestSeller')}
                        >
                            <Text style={styles.viewAllText}>{translations.viewAll}</Text>
                            <Ionicons name="chevron-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={bestSellingFilteredProducts}
                        keyExtractor={keyExtractorBest}
                        renderItem={renderHorizontalItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={5}
                        windowSize={10}
                        getItemLayout={(data, index) => ({
                            length: 160,
                            offset: 160 * index,
                            index,
                        })}
                    />
                </View>
            )}
        </ScrollView>
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
        paddingHorizontal: 10,
        paddingVertical: 15,
        paddingTop: 20,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        flexDirection: 'column',
        alignItems: "center",
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginLeft: 12,
    },
    apiStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    apiStatusText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    specialSectionContainer: {
        marginVertical: 8,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff'
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginLeft: 12,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#666',
        marginLeft: 12,
        marginTop: 2,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF6B35',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    viewAllText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
        marginRight: 4,
    },
    horizontalList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexGrow: 1,
    },
});
