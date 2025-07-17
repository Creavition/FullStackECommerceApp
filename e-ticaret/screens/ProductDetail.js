// ProductDetail.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Alert, ScrollView, PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProduct } from '../contexts/ProductContext';
import { categoryApi } from '../utils/categoryApi';
import { productApi } from '../utils/productApi';
import { logProductDetails, extractSizeInfo } from '../utils/productUtils';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';

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
    const { getImageUrl } = useProduct();
    const navigation = useNavigation();

    // State'ler
    const [allSizes, setAllSizes] = useState(product.allSizes || []);
    const [availableSizes, setAvailableSizes] = useState(product.availableSizes || []);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showGoToCart, setShowGoToCart] = useState(false);
    const [toastOpacity] = useState(new Animated.Value(0));
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState(null); // Category bilgileri için
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [productData, setProductData] = useState(product); // Rating bilgisini güncellemek için
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 0: front, 1: back

    // Mevcut ürün için kullanılabilir resimler
    const availableImages = [
        getImageUrl(product.frontImagePath || product.frontImageUrl || product.image),
        getImageUrl(product.backImagePath || product.backImageUrl || product.image)
    ].filter(img => img); // null/undefined olanları filtrele

    // API'den ürün ve kategori verilerini çek
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
                        setProductData(currentProduct); // Rating bilgisini güncellemek için
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

                    // Kategori için TÜM mevcut bedenler (allSizes)
                    const categorySizes = category.sizes && Array.isArray(category.sizes)
                        ? category.sizes
                            .filter(size => size && size.sizeName)
                            .map(size => size.sizeName)
                        : [];

                    // Ürünün SADECE mevcut bedenleri (availableSizes)
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

    // Fotoğraf geçiş fonksiyonları
    const goToPreviousImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const goToNextImage = () => {
        if (currentImageIndex < availableImages.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            // Sadece yatay hareketi algıla
            return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
        },
        onPanResponderRelease: (evt, gestureState) => {
            const swipeThreshold = 50; 

            if (Math.abs(gestureState.dx) > swipeThreshold) {
                if (gestureState.dx > 0) {
                
                    goToPreviousImage();
                } else {
                   
                    goToNextImage();
                }
            }
        },
    });

    const showToast = (message) => {
        Animated.sequence([
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000), 
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
            Alert.alert('Hata','Lütfen bir beden seçin');
            return;
        }

        const itemToAdd = {
            ...product,
            size: selectedSize,
            amount: 1,
        };

        console.log('Sepetinize Eklendi', itemToAdd);

        // CartContext'teki addToCart'a gönder
        addToCart(itemToAdd);

        // Toast bildirimi göster
        showToast('Sepetinize Eklendi');

        // Go to Cart butonunu göster
        setShowGoToCart(true);
    };

    const handleSizePress = (size) => {
        const isAvailable = availableSizes.includes(size);
        if (isAvailable) {
            setSelectedSize(size);
        } else {
            // Mevcut olmayan beden için uyarı
            showToast('Bu beden mevcut değil');
        }
    };

    // Review fonksiyonları
    const handleRateProduct = () => {
        setReviewModalVisible(true);
    };

    const handleReviewSubmitted = async () => {
        // Yorum gönderildikten sonra ürün verilerini yenile
        try {
            const updatedProduct = await productApi.getProductById(product.id);
            setProductData(updatedProduct);
        } catch (error) {
            console.log('Could not refresh product data after review submission:', error);
        }
    };

    const handleViewReviews = () => {
        navigation.navigate('ProductReviews', {
            product: productData,
            productId: productData.id
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
                    Yükleniyor
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

            <View style={styles.imageContainer} {...panResponder.panHandlers}>
                <Image
                    source={{
                        uri: availableImages[currentImageIndex] || getImageUrl(product.frontImagePath || product.frontImageUrl || product.image)
                    }}
                    style={styles.image}
                />

                {/* Fotoğraf */}
                {availableImages.length > 1 && (
                    <View style={styles.imageIndicatorContainer}>
                        {availableImages.map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.imageIndicator,
                                    currentImageIndex === index && styles.activeImageIndicator
                                ]}
                                onPress={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </View>
                )}
            </View>
            <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}>{product.name}</Text>
            <Text style={[styles.price, { color: isDarkMode ? '#ce6302' : '#ce6302' }]}>{product.price} ₺</Text>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
                <StarRating
                    rating={productData.averageRating || 0}
                    disabled={true}
                    size={20}
                    showRating={true}
                />
                <TouchableOpacity onPress={handleViewReviews}>
                    <Text style={[styles.reviewCount, { color: isDarkMode ? '#aaa' : '#666' }]}>
                        ({productData.reviewCount || 0} değerlendirme)
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Rate and Review Buttons */}
            <View style={styles.reviewButtonsContainer}>
                <TouchableOpacity
                    style={styles.rateButton}
                    onPress={handleRateProduct}
                >
                    <Ionicons name="star" size={20} color="#FF8C00" />
                    <Text style={styles.rateButtonText}>Ürünü Değerlendir</Text>
                </TouchableOpacity>

            </View>

            <Text style={[styles.sizeTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                Beden Seçenekleri
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

                            {/* Mevcut olmayan bedenler için çarpı işareti */}
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
                        </TouchableOpacity>
                    );
                })}
            </View>

            
            <View style={styles.buttonContainer}>
                {/* Sepete Ekle Butonu */}
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
                        Sepete Ekle
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
                            Sepete Git
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
                        backgroundColor: isDarkMode ? '#333' : '#FF8C00',
                    }
                ]}
                pointerEvents="none"
            >
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.toastText}>Sepete Eklendi</Text>
            </Animated.View>

            {/* Review Modal */}
            <ReviewModal
                visible={reviewModalVisible}
                onClose={() => setReviewModalVisible(false)}
                product={productData}
                onReviewSubmitted={handleReviewSubmitted}
            />
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
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    image: {
        width: 210,
        height: 230,
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    imageIndicatorContainer: {
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    activeImageIndicator: {
        backgroundColor: '#fff',
        transform: [{ scale: 1.2 }],
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
        marginBottom: 20,
        fontWeight: '600',
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        gap: 10,
    },
    reviewCount: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    reviewButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
        paddingHorizontal: 8,
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E6',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FF8C00',
        gap: 6,
        elevation: 3,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        flex: 1,
        maxWidth: '48%',
    },
    rateButtonText: {
        color: '#FF6B00',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        flexShrink: 1,
    },
    viewReviewsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E6',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FF8C00',
        gap: 6,
        elevation: 3,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        flex: 1,
        maxWidth: '48%',
    },
    viewReviewsButtonText: {
        color: '#FF6B00',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        flexShrink: 1,
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
        backgroundColor: '#ce6302',
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