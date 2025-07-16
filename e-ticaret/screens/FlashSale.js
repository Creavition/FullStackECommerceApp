// screens/FlashSale.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    View, Text, TextInput, StyleSheet, FlatList, StatusBar, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFavorites } from '../contexts/FavoritesContext';
import { useTheme } from '../contexts/ThemeContext';

import ProductCard from '../components/ProductCard';
import { getAllProducts, productUtils, toggleProductFavorite } from '../utils/productUtils';

export default function FlashSale() {
    const navigation = useNavigation();
    const { favoriteItems, toggleFavorite } = useFavorites();
    const { theme, isDarkMode } = useTheme();

    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            // API'den flash sale ürünlerini almaya çalış
            const flashSaleProducts = await productUtils.getFlashSaleProducts();

            if (flashSaleProducts && flashSaleProducts.length > 0) {
                console.log('Using API flash sale products');
                setAllProducts(flashSaleProducts);
            } else {
                console.log('API flash sale products not available, using all products');
                const products = await getAllProducts();
                // Fallback: badge_FlashSale true olan ürünleri filtrele
                const filteredProducts = products.filter(p => p.badge_FlashSale);
                setAllProducts(filteredProducts.length > 0 ? filteredProducts : products);
            }
        } catch (e) {
            console.error('Error loading flash sale products:', e);
            // Hata durumunda tüm ürünleri yükle
            const products = await getAllProducts();
            setAllProducts(products);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Sayfa odaklandığında yeniden yükle (favorite durumlarını güncellemek için)
    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [loadProducts])
    );

    // API'den gelen verilere göre ürünleri kategorize et - Flash Sale için basitleştir
    const flashSaleFilteredProducts = useMemo(() => {
        return allProducts.filter(item =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [allProducts, searchText]);

    const handleProductPress = useCallback(product => {
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    const handleFavoritePress = useCallback(async (productId) => {
        const currentProduct = allProducts.find(p => p.id === productId);
        if (currentProduct) {
            // Önce UI'yi güncelle (optimistic update)
            setAllProducts(prevProducts =>
                prevProducts.map(p =>
                    p.id === productId
                        ? { ...p, isFavorite: !p.isFavorite }
                        : p
                )
            );

            const success = await toggleProductFavorite(productId, currentProduct.isFavorite);
            if (!success) {
                // API başarısızsa eski duruma geri al
                setAllProducts(prevProducts =>
                    prevProducts.map(p =>
                        p.id === productId
                            ? { ...p, isFavorite: currentProduct.isFavorite }
                            : p
                    )
                );
                // Fallback context'i de güncelle
                toggleFavorite(productId);
            }
        }
    }, [allProducts, toggleFavorite]);

    const renderItem = useCallback(({ item }) => (
        <ProductCard
            item={item}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            isDarkMode={isDarkMode}
        />
    ), [handleProductPress, handleFavoritePress, isDarkMode]);

    const keyExtractor = useCallback((item) => item.id, []);

    const clearSearch = useCallback(() => setSearchText(''), []);

    const EmptyComponent = useCallback(() => (
        <View style={styles.emptyContainer}>
            <Ionicons name="pricetag" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Flash Sale ürünü bulunamadı</Text>
        </View>
    ), []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />
                <Ionicons name="refresh" size={40} color="#FF6B35" />
                <Text style={styles.loadingText}>Yükleniyor</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface || '#fff' }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Ionicons name="pricetag" size={24} color="#FF6B35" />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Flash Sale</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            {/* Search Box */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: theme.surface || '#f0f0f0', borderColor: theme.border || '#e0e0e0' }]}>
                    <Ionicons name="search" size={22} color={theme.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        placeholder="Ürün ara..."
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
            </View>

            {/* Product Count */}
            <View style={styles.countContainer}>
                <Text style={[styles.countText, { color: theme.textSecondary }]}>
                    {flashSaleFilteredProducts.length} ürün bulundu
                </Text>
            </View>

            {/* Products List */}
            <FlatList
                data={flashSaleFilteredProducts}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={EmptyComponent}
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingTop: 20,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        padding: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginLeft: -29, // Compensate for back button width
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginLeft: 8,
    },
    placeholder: {
        width: 29, // Same width as back button for centering
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
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
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    productList: {
        paddingTop: 10,
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
