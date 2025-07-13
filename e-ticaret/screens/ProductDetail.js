// ProductDetail.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { categoryApi } from '../utils/categoryApi';
import { productApi } from '../utils/productApi';
import { logProductDetails, extractSizeInfo } from '../utils/productUtils';

// Ürünün mevcut bedenlerini özellikle availableSize field'ından çıkaran helper fonksiyon
const extractProductAvailableSizes = (product) => {
    console.log('Extracting available sizes from product:', product);

    // Öncelik sırası: availableSize -> availableSizes -> sizes -> size
    if (product.availableSize && Array.isArray(product.availableSize)) {
        console.log('Found availableSize array:', product.availableSize);
        return product.availableSize;
    } else if (product.availableSizes && Array.isArray(product.availableSizes)) {
        console.log('Found availableSizes array:', product.availableSizes);
        return product.availableSizes;
    } else if (product.sizes && Array.isArray(product.sizes)) {
        console.log('Found sizes array:', product.sizes);
        return product.sizes;
    } else if (product.size && typeof product.size === 'string') {
        console.log('Found single size string:', product.size);
        return [product.size];
    } else if (product.sizeOptions && Array.isArray(product.sizeOptions)) {
        console.log('Found sizeOptions array:', product.sizeOptions);
        return product.sizeOptions;
    }

    console.log('No available sizes found in product');
    return [];
};

// Category bilgisini categoryId ile çek
const fetchCategoryByProductCategoryId = async (product) => {
    try {
        // Önce categoryId var mı kontrol et
        if (product.categoryId) {
            console.log(`Fetching category by categoryId: ${product.categoryId}`);
            const category = await categoryApi.getCategory(product.categoryId);
            return category;
        }

        // Eğer categoryId yoksa, category name ile arama yap
        if (product.category) {
            console.log(`Searching category by name: ${product.category}`);
            const allCategories = await categoryApi.getAllCategories();
            const foundCategory = allCategories.find(cat =>
                cat.categoryName === product.category
            );
            return foundCategory;
        }

        console.log('No categoryId or category found in product');
        return null;
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
};

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
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState(null); // Category bilgileri için    // API'den ürün ve kategori verilerini çek
    useEffect(() => {
        const fetchProductAndCategoryData = async () => {
            try {
                setLoading(true);

                // Debug için başlangıç product bilgilerini log'la
                if (__DEV__) {
                    console.log('=== ProductDetail Initial Data ===');
                    logProductDetails(product);
                }

                console.log(`Fetching data for product: ${product?.name || product?.id}, categoryId: ${product?.categoryId || 'N/A'}`);

                // İlk olarak ürünün güncel verilerini API'den çek (isteğe bağlı)
                let currentProduct = product;
                if (product.id) {
                    try {
                        console.log(`Fetching fresh product data for ID: ${product.id}`);
                        currentProduct = await productApi.getProductById(product.id);
                        console.log('Fresh product data:', currentProduct);
                    } catch (error) {
                        console.log('Could not fetch fresh product data, using passed product:', error.message);
                        currentProduct = product;
                    }
                }

                // Category bilgisini çek
                const category = await fetchCategoryByProductCategoryId(currentProduct);
                setCategoryData(category);

                if (category) {
                    console.log(`Found category data:`, category);

                    // Kategori için TÜM mevcut bedenler (allSizes - kategoriden gelir)
                    const categorySizes = category.sizes && Array.isArray(category.sizes)
                        ? category.sizes
                            .filter(size => size && size.sizeName)
                            .map(size => size.sizeName)
                        : [];

                    // Ürünün SADECE mevcut bedenleri (availableSizes - üründen gelir)
                    const productAvailableSizes = extractProductAvailableSizes(currentProduct);

                    console.log(`Category all sizes (${category.categoryName}):`, categorySizes);
                    console.log(`Product available sizes:`, productAvailableSizes);

                    // State'leri güncelle
                    setAllSizes(categorySizes);
                    setAvailableSizes(productAvailableSizes);

                    // İlk mevcut bedeni seç
                    if (productAvailableSizes.length > 0) {
                        setSelectedSize(productAvailableSizes[0]);
                    } else {
                        setSelectedSize(null);
                    }
                } else {
                    console.log('No category found, using fallback data');
                    // Kategori bulunamadıysa fallback
                    const fallbackAvailableSizes = extractProductAvailableSizes(currentProduct);
                    setAllSizes(fallbackAvailableSizes);
                    setAvailableSizes(fallbackAvailableSizes);
                    setSelectedSize(fallbackAvailableSizes[0] || null);
                }
            } catch (error) {
                console.error('Error fetching product and category data:', error);
                // Hata durumunda fallback
                const fallbackAvailableSizes = extractProductAvailableSizes(product);
                setAllSizes(fallbackAvailableSizes);
                setAvailableSizes(fallbackAvailableSizes);
                setSelectedSize(fallbackAvailableSizes[0] || null);
            } finally {
                setLoading(false);
            }
        };

        fetchProductAndCategoryData();
    }, [product.id, product.categoryId]);

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

    const handleGoToCart = () => {
        // HomeScreen'e geri dön ve Cart tab'ını aç
        navigation.navigate('HomeScreen', {
            screen: 'Cart'
        });
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

    const handleSizePress = (size) => {
        const isAvailable = availableSizes.includes(size);
        if (isAvailable) {
            setSelectedSize(size);
        } else {
            // Mevcut olmayan beden için uyarı toast'ı
            showToast(translations.sizeNotAvailable || 'Bu beden mevcut değil');
        }
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

            {/* Debug Info - Sadece development modunda */}
            {__DEV__ && (
                <View style={styles.debugContainer}>
                    <Text style={[styles.debugText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        Debug: Product ID: {product.id} | CategoryID: {product.categoryId || 'N/A'}
                    </Text>
                    <Text style={[styles.debugText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        Category: {categoryData ? categoryData.categoryName : 'Loading...'} (ID: {categoryData ? categoryData.id : 'N/A'})
                    </Text>
                    <Text style={[styles.debugText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        All Sizes (from Category): {allSizes.join(', ') || 'None'}
                    </Text>
                    <Text style={[styles.debugText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        Available Sizes (from Product): {availableSizes.join(', ') || 'None'}
                    </Text>
                </View>
            )}

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
                                            ? (isAvailable ? '#444' : '#1a1a1a')
                                            : (isAvailable ? '#f8f9fa' : '#e8e8e8'),
                                    opacity: isAvailable ? 1 : 0.6
                                },
                                {
                                    borderColor: isSelected && isAvailable
                                        ? '#007BFF'
                                        : isDarkMode
                                            ? (isAvailable ? '#666' : '#444')
                                            : (isAvailable ? '#007BFF' : '#d0d0d0')
                                }
                            ]}
                            onPress={() => handleSizePress(size)}
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

                            {/* Mevcut olmayan bedenler için belirgin çarpı işareti */}
                            {!isAvailable && (
                                <View style={[
                                    styles.crossContainer,
                                    {
                                        backgroundColor: 'rgba(255, 68, 68, 0.9)'
                                    }
                                ]}>
                                    <Ionicons
                                        name="close"
                                        size={16}
                                        color="#fff"
                                        style={styles.crossIcon}
                                    />
                                </View>
                            )}

                            {/* Mevcut olan bedenler için tick işareti (seçili değilse) */}
                            {isAvailable && !isSelected && (
                                <View style={[
                                    styles.tickContainer,
                                    {
                                        backgroundColor: isDarkMode ? 'rgba(0, 123, 255, 0.1)' : 'rgba(0, 123, 255, 0.1)'
                                    }
                                ]}>
                                    <Ionicons
                                        name="checkmark"
                                        size={12}
                                        color="#007BFF"
                                        style={styles.tickIcon}
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
        opacity: 0.6,
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
        top: -3,
        right: -3,
        backgroundColor: 'rgba(255, 68, 68, 0.9)',
        borderRadius: 12,
        padding: 3,
        elevation: 6,
        shadowColor: '#ff4444',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        borderWidth: 2,
        borderColor: '#fff',
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    crossIcon: {
        // Icon kendisi için ekstra stil gerekmiyor
    },
    tickContainer: {
        position: 'absolute',
        bottom: -3,
        right: -3,
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderRadius: 8,
        padding: 1,
        elevation: 2,
        shadowColor: '#007BFF',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        borderWidth: 1,
        borderColor: 'rgba(0, 123, 255, 0.3)',
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tickIcon: {
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
    debugContainer: {
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    debugText: {
        fontSize: 11,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});