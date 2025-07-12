import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { getAllProducts } from '../utils/productUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

import ProductCard from '../components/ProductCard';

export default function Favorites() {
    const navigation = useNavigation();
    const { favoriteItems, favoriteSource, toggleFavorite } = useFavorites();
    const { translations, language } = useLanguage();
    const { theme, isDarkMode } = useTheme();
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Ürünleri yükle
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const products = await getAllProducts();
            setAllProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Sayfa yüklendiğinde ve dil değiştiğinde ürünleri yükle
    useEffect(() => {
        loadProducts();
    }, [loadProducts, language]);

    const favoriteProducts = useMemo(() => {
        return allProducts.filter(p => favoriteItems[p.id]);
    }, [allProducts, favoriteItems]);

    const parsePrice = (priceStr) => parseFloat(priceStr.replace('₺', '').replace(',', '.'));

    // Flash Sale ürünlerini belirle (her kategoriden en ucuz 6 ürün)
    const flashSaleProducts = useMemo(() => {
        const categories = ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
        const flashSaleIds = new Set();

        categories.forEach(category => {
            const categoryProducts = allProducts
                .filter(product => product.category === category)
                .sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
                .slice(0, 6);

            categoryProducts.forEach(product => flashSaleIds.add(product.id));
        });

        return flashSaleIds;
    }, [allProducts]);

    // Fast Delivery ürünlerini belirle (Home.js ile aynı mantık)
    const fastDeliveryProducts = useMemo(() => {
        const ids = new Set();
        allProducts.forEach(p => {
            const hash = p.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
            if (Math.abs(hash) % 10 < 3) ids.add(p.id);
        });
        return ids;
    }, [allProducts]);

    const handleProductPress = useCallback((product) => {
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    const handleFavoritePress = useCallback((productId) => {
        toggleFavorite(productId);
    }, [toggleFavorite]);

    // Best Selling ürünlerini belirle (Home.js ile aynı mantık)
    const bestSellingProducts = useMemo(() => {
        const ids = new Set();
        allProducts.forEach(p => {
            const hash = p.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
            if (Math.abs(hash) % 10 >= 7) ids.add(p.id);
        });
        return ids;
    }, [allProducts]);

    const renderItem = useCallback(({ item }) => {
        const isFavorite = favoriteItems[item.id];
        const isFlashSale = flashSaleProducts.has(item.id);
        const hasFastDelivery = fastDeliveryProducts.has(item.id);
        const isBestSelling = bestSellingProducts.has(item.id);

        return (
            <ProductCard
                item={item}
                isFavorite={isFavorite}
                isFlashSale={isFlashSale}
                hasFastDelivery={hasFastDelivery}
                isBestSelling={isBestSelling}
                onProductPress={handleProductPress}
                onFavoritePress={handleFavoritePress}
                translations={translations}
                isDarkMode={isDarkMode}
            />
        );
    }, [favoriteItems, flashSaleProducts, fastDeliveryProducts, bestSellingProducts, handleProductPress, handleFavoritePress, translations, isDarkMode]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                    backgroundColor={theme.statusBarBackground}
                    translucent={false}
                />
                <View style={styles.loadingContent}>
                    <Ionicons name="refresh" size={40} color="#FF6B35" />
                    <Text style={styles.loadingText}>{translations.loading}</Text>
                </View>
            </View>
        );
    }

    if (favoriteProducts.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
                <StatusBar
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                    backgroundColor={theme.statusBarBackground}
                    translucent={false}
                />
                <Ionicons name="heart-outline" size={80} color="#ce6302" />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>{translations.favorites}</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Henüz favori ürününüz yok</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Ionicons name="storefront" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.shopButtonText}>Alışverişe Başla</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.statusBarBackground}
                translucent={false}
            />

            {/* Header */}
            <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>{translations.favorites}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {favoriteProducts.length} {translations.favoritesProduct}
                </Text>
            </View>

            {/* Products List */}
            <View style={styles.mainListContainer}>
                <FlatList
                    data={favoriteProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.productList}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={16}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={10}
                    windowSize={3}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 23,
    },
    headerContainer: {
        backgroundColor: '#fff',
        paddingBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingContent: {
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: '#f8f9fa',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    shopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ce6302',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
});
