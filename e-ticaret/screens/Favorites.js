import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useProduct } from '../contexts/ProductContext';
import { getAllProducts, productUtils, toggleProductFavorite } from '../utils/productUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

import ProductCard from '../components/ProductCard';

export default function Favorites() {
    const navigation = useNavigation();
    const { favoriteItems, favoriteSource, toggleFavorite } = useFavorites();
    const { products, loading, fetchProducts, updateProductFavoriteStatus } = useProduct();
    const { translations, language } = useLanguage();
    const { theme, isDarkMode } = useTheme();

    // Ürünleri yükle - ProductContext'den favori olanları al
    const favoriteProducts = useMemo(() => {
        return products.filter(p => p.isFavorite === true);
    }, [products]);

    // Sayfa yüklendiğinde sadece bir kez yükle
    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, []);

    // Sayfa odaklandığında sadece gerekirse yeniden yükle
    useFocusEffect(
        useCallback(() => {
            // Eğer ürünler yoksa veya çok az varsa yeniden yükle
            if (products.length === 0) {
                fetchProducts();
            }
        }, [products.length, fetchProducts])
    );

    // API'den gelen verilere göre ürünleri kategorize et - Favorites için basitleştir
    const handleProductPress = useCallback((product) => {
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    const handleFavoritePress = useCallback(async (productId) => {
        console.log(`Favorites: Toggling favorite for product ${productId}`);

        const currentProduct = favoriteProducts.find(p => p.id === productId);
        if (!currentProduct) return;

        // Context'teki toggle fonksiyonunu kullan ve ProductContext'i güncelle
        const newFavoriteStatus = await toggleFavorite(productId, 'Favorites', updateProductFavoriteStatus);

        // Eğer API'den cevap gelmişse durumu logla
        if (newFavoriteStatus !== null) {
            console.log(`Favorites: Product ${productId} favorite status updated to: ${newFavoriteStatus}`);
        }
    }, [favoriteProducts, toggleFavorite, updateProductFavoriteStatus]);

    const renderItem = useCallback(({ item }) => {
        return (
            <ProductCard
                item={item}
                onProductPress={handleProductPress}
                onFavoritePress={handleFavoritePress}
                translations={translations}
                isDarkMode={isDarkMode}
            />
        );
    }, [handleProductPress, handleFavoritePress, translations, isDarkMode]);

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
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>{translations.favoritesText}</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Ionicons name="storefront" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.shopButtonText}>{translations.startShopping}</Text>
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
