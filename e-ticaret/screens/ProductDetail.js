// ProductDetail.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { categoryApi } from '../utils/categoryApi';

export default function ProductDetail({ route }) {
    const { product } = route.params;
    const { addToCart } = useContext(CartContext);
    const { theme, isDarkMode } = useTheme();
    const { translations } = useLanguage();
    const navigation = useNavigation();

    // State'ler
    const [allSizes, setAllSizes] = useState(product.allSizes || []);
    const [availableSizes, setAvailableSizes] = useState(product.availableSizes || []);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showGoToCart, setShowGoToCart] = useState(false);
    const [toastOpacity] = useState(new Animated.Value(0));
    const [loading, setLoading] = useState(true);    // API'den kategori bedenlerini çek
    useEffect(() => {
        const fetchCategorySizes = async () => {
            try {
                setLoading(true);
                console.log(`Fetching sizes for category: ${product?.category || 'unknown'}`);

                // Güvenlik kontrolü - product ve category var mı?
                if (!product || !product.category) {
                    console.log('No product or category found, using fallback data');
                    setAllSizes(product?.allSizes || []);
                    setAvailableSizes(product?.availableSizes || []);
                    setSelectedSize(product?.availableSizes?.[0] || null);
                    return;
                }

                // API'den tüm kategorileri çek ve product.category'ye uygun olanı bul
                const categories = await categoryApi.getAllCategories();
                console.log(`Found ${Array.isArray(categories) ? categories.length : 0} categories from API`);

                // Güvenlik kontrolü - categories array mi?
                if (!Array.isArray(categories)) {
                    console.log('Invalid categories data from API');
                    setAllSizes(product?.allSizes || []);
                    setAvailableSizes(product?.availableSizes || []);
                    setSelectedSize(product?.availableSizes?.[0] || null);
                    return;
                }

                const currentCategory = categories.find(cat =>
                    cat && cat.categoryName === product.category
                );

                if (currentCategory && currentCategory.sizes && Array.isArray(currentCategory.sizes) && currentCategory.sizes.length > 0) {
                    const sizes = currentCategory.sizes
                        .filter(size => size && size.sizeName) // Güvenlik kontrolü
                        .map(size => size.sizeName);
                    console.log(`Found sizes for ${product.category}:`, sizes);

                    setAllSizes(sizes);

                    // Mevcut bedenler için rastgele 3 beden seç (demo amaçlı)
                    if (sizes.length > 0) {
                        const shuffled = [...sizes].sort(() => 0.5 - Math.random());
                        const randomAvailable = shuffled.slice(0, Math.min(3, sizes.length));
                        setAvailableSizes(randomAvailable);
                        setSelectedSize(randomAvailable[0]);
                    } else {
                        setAvailableSizes([]);
                        setSelectedSize(null);
                    }
                } else {
                    console.log(`No sizes found for ${product.category}, using fallback data`);
                    // Fallback: eski verilerden kullan veya API'den varsayılan kategorileri oluştur
                    if (categories.length === 0) {
                        console.log('No categories found, trying to seed default categories...');
                        try {
                            await categoryApi.seedCategories();
                            // Tekrar dene
                            const seededCategories = await categoryApi.getAllCategories();
                            const seededCategory = seededCategories.find(cat =>
                                cat.categoryName === product.category
                            );
                            if (seededCategory && seededCategory.sizes) {
                                const sizes = seededCategory.sizes.map(size => size.sizeName);
                                setAllSizes(sizes);
                                setAvailableSizes(sizes.slice(0, 3));
                                setSelectedSize(sizes[0]);
                                return;
                            }
                        } catch (seedError) {
                            console.error('Error seeding categories:', seedError);
                        }
                    }

                    // Hala çalışmazsa eski verilerden kullan
                    setAllSizes(product.allSizes || []);
                    setAvailableSizes(product.availableSizes || []);
                    setSelectedSize(product.availableSizes?.[0] || null);
                }
            } catch (error) {
                console.error('Error fetching category sizes:', error);
                // Hata durumunda eski verilerden kullan
                setAllSizes(product.allSizes || []);
                setAvailableSizes(product.availableSizes || []);
                setSelectedSize(product.availableSizes?.[0] || null);
            } finally {
                setLoading(false);
            }
        };

        fetchCategorySizes();
    }, [product.category]);

    const showToast = (message) => {
        // Toast'ı göster
        Animated.sequence([
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000), // 2 saniye bekle
            Animated.timing(toastOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleAddToCart = () => {
        console.log('handleAddToCart called with selectedSize:', selectedSize);

        if (!selectedSize) {
            Alert.alert(translations.error, 'Lütfen bir beden seçin');
            return;
        }

        const itemToAdd = {
            ...product,
            size: selectedSize,
            amount: 1,
        };

        console.log('Item being added to cart:', itemToAdd);

        // CartContext'teki addToCart'a gönder
        addToCart(itemToAdd);

        // Toast bildirimi göster
        showToast(translations.productAddedToCart);

        // Go to Cart butonunu göster
        setShowGoToCart(true);
    };

    const handleGoToCart = () => {
        // HomeScreen'e geri dön ve Cart tab'ını aç
        navigation.navigate('HomeScreen', {
            screen: 'Cart'
        });
    };

    // Loading state
    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: isDarkMode ? theme.background : '#fff' }]}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
                </TouchableOpacity>
                <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#000' }]}>
                    {translations.loading || 'Loading...'}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#fff' }]}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
            </TouchableOpacity>

            <Image source={{ uri: product.image }} style={styles.image} />
            <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}>{product.name}</Text>
            <Text style={[styles.price, { color: isDarkMode ? '#ce6302' : '#ce6302' }]}>{product.price}</Text>

            <Text style={[styles.sizeTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                {translations.sizeOptions}
            </Text>

            <View style={styles.sizeContainer}>
                {allSizes.map((size) => {
                    const isAvailable = availableSizes.includes(size);
                    const isSelected = selectedSize === size;

                    return (
                        <TouchableOpacity
                            key={size}
                            style={[
                                styles.sizeBox,
                                !isAvailable && styles.unavailableSizeBox,
                                isSelected && isAvailable && styles.selectedSizeBox,
                                {
                                    backgroundColor: isSelected && isAvailable
                                        ? '#007BFF'
                                        : isDarkMode
                                            ? (isAvailable ? '#444' : '#2a2a2a')
                                            : (isAvailable ? '#f8f9fa' : '#f0f0f0')
                                },
                                {
                                    borderColor: isSelected && isAvailable
                                        ? '#007BFF'
                                        : isDarkMode
                                            ? (isAvailable ? '#666' : '#444')
                                            : (isAvailable ? '#007BFF' : '#d0d0d0')
                                }
                            ]}
                            onPress={() => isAvailable && setSelectedSize(size)}
                            disabled={!isAvailable}
                        >
                            <Text style={[
                                styles.sizeText,
                                isSelected && isAvailable && styles.selectedSizeText,
                                !isAvailable && styles.unavailableSizeText,
                                {
                                    color: isSelected && isAvailable
                                        ? '#fff'
                                        : isDarkMode
                                            ? (isAvailable ? '#fff' : '#666')
                                            : (isAvailable ? '#007BFF' : '#999')
                                }
                            ]}>
                                {size}
                            </Text>

                            {/* İyileştirilmiş çarpı işareti */}
                            {!isAvailable && (
                                <View style={[
                                    styles.crossContainer,
                                    {
                                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.95)'
                                    }
                                ]}>
                                    <Ionicons
                                        name="close"
                                        size={14}
                                        color="#ff4444"
                                        style={styles.crossIcon}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Buton Container - Yan yana butonlar */}
            <View style={styles.buttonContainer}>
                {/* Sepete Ekle Butonu - Her zaman görünür */}
                <TouchableOpacity
                    style={[styles.cartButton, showGoToCart && styles.halfWidthButton]}
                    onPress={handleAddToCart}
                >
                    <Ionicons
                        name="cart-outline"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.cartButtonText}>
                        {translations.addToCart}
                    </Text>
                </TouchableOpacity>

                {/* Go to Cart Butonu - Sepete eklendikten sonra görünür */}
                {showGoToCart && (
                    <TouchableOpacity
                        style={[styles.goToCartButton, styles.halfWidthButton]}
                        onPress={handleGoToCart}
                    >
                        <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.goToCartButtonText}>
                            {translations.goToCart}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Toast Bildirimi - Sayfanın altında */}
            <Animated.View
                style={[
                    styles.toast,
                    {
                        opacity: toastOpacity,
                        backgroundColor: isDarkMode ? '#333' : '#4CAF50',
                    }
                ]}
                pointerEvents="none"
            >
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.toastText}>{translations.productAddedToCart}</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 40,
    },
    closeButton: {
        alignSelf: "flex-start",
        marginBottom: 15,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    image: {
        width: 210,
        height: 230,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    price: {
        fontSize: 18,
        color: '#ce6302',
        marginBottom: 28,
        fontWeight: '600',
    },
    sizeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        alignSelf: 'center',
    },
    sizeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 35,
    },
    sizeBox: {
        borderRadius: 12,
        margin: 6,
        borderWidth: 2,
        alignItems: 'center',
        width: 60,
        height: 60,
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 2.5,
        position: 'relative',
    },
    selectedSizeBox: {
        backgroundColor: '#007BFF',
        borderColor: '#007BFF',
        transform: [{ scale: 1.05 }],
        elevation: 6,
        shadowOpacity: 0.3,
    },
    unavailableSizeBox: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd',
        opacity: 0.7,
        elevation: 1,
    },
    sizeText: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 18,
    },
    selectedSizeText: {
        color: 'white',
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 18,
    },
    unavailableSizeText: {
        fontSize: 15,
        color: '#999',
        textDecorationLine: 'line-through',
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 18,
    },
    crossContainer: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 10,
        padding: 2,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.3)',
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    crossIcon: {
        // Icon kendisi için ekstra stil gerekmiyor
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: "center",
        width: '100%',
        gap: 12,
    },
    cartButton: {
        backgroundColor: '#ce6302',
        paddingVertical: 16,
        paddingHorizontal: 22,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    halfWidthButton: {
        width: '48%',
    },
    cartButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    goToCartButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    goToCartButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    toast: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    toastText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
    },
});