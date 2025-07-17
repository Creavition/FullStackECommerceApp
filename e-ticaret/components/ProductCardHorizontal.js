// components/ProductCardHorizontal.js
import React, { useCallback, useState, memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProduct } from '../contexts/ProductContext';
import { useFavorites } from '../contexts/FavoritesContext';

const ProductCardHorizontal = memo(({
    item,
    onProductPress,
    onFavoritePress,
    isDarkMode,
    favoriteItems: propFavoriteItems,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const { getImageUrl } = useProduct();
    const { favoriteItems: contextFavoriteItems } = useFavorites();

    // Prop'tan gelen favoriteItems'ı önceleyerek al
    const favoriteItems = propFavoriteItems || contextFavoriteItems;

    const handleProductPress = useCallback(() => onProductPress(item), [item, onProductPress]);
    const handleFavoritePress = useCallback(() => {
        onFavoritePress(item.id);
    }, [item.id, onFavoritePress]);

    // API'den gelen verilerden badge ve label bilgilerini al
    // Eğer prop olarak favoriteItems geçilmişse onu kullan, yoksa item.isFavorite'ı kullan
    const isFavorite = propFavoriteItems
        ? (favoriteItems[item.id] || false)
        : (item.isFavorite !== undefined ? item.isFavorite : (favoriteItems[item.id] || false));

    const isFlashSale = item.badge_FlashSale || false;
    const isBestSelling = item.badge_BestSelling || false;
    const hasLabelBestSeller = item.label_BestSeller || false;
    const hasFastDelivery = item.label_FastDelivery || false;

    // Get image URLs using the context helper
    const frontImageUrl = getImageUrl(item.frontImagePath || item.frontImageUrl || item.imageUrl || item.image);
    const backImageUrl = getImageUrl(item.backImagePath || item.backImageUrl || item.frontImagePath || item.frontImageUrl || item.imageUrl || item.image);

    return (
        <View
            style={[styles.card, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}
        >
            {/* Badge - sadece gerektiğinde render et */}
            {(isFlashSale || isBestSelling) && (
                <Badge
                    isFlashSale={isFlashSale}
                    isBestSelling={isBestSelling}
                />
            )}

            <View style={styles.imageContainer}>
                <TouchableOpacity
                    onPressIn={() => setIsHovered(true)}
                    onPressOut={() => setIsHovered(false)}
                    onPress={handleProductPress}
                    activeOpacity={1}
                    style={styles.imageWrapper}
                >
                    <Image
                        source={{
                            uri: isHovered ? backImageUrl : frontImageUrl
                        }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleFavoritePress}
                    style={styles.favoriteIcon}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite ? '#FF6B6B' : '#666'}
                    />
                </TouchableOpacity>
            </View>

            {/* Label - sadece gerektiğinde render et */}
            {(hasFastDelivery || hasLabelBestSeller) && (
                <Label
                    hasFastDelivery={hasFastDelivery}
                    hasLabelBestSeller={hasLabelBestSeller}
                />
            )}

            <Text
                style={[styles.name, { color: isDarkMode ? '#fff' : '#2c3e50' }]}
                numberOfLines={2}
            >
                {item.name}
            </Text>
            <Text
                style={[styles.price, { color: isDarkMode ? '#fff' : '#FF6B35' }]}
            >
                {typeof item.price === 'number' ? `${item.price}₺` : item.price}
            </Text>
        </View>
    );
}, (prevProps, nextProps) => {
    // Sadece bu ürünle ilgili değişiklikleri kontrol et
    const prevFavorite = prevProps.favoriteItems?.[prevProps.item.id] ?? prevProps.item.isFavorite;
    const nextFavorite = nextProps.favoriteItems?.[nextProps.item.id] ?? nextProps.item.isFavorite;

    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.name === nextProps.item.name &&
        prevProps.item.price === nextProps.item.price &&
        prevFavorite === nextFavorite &&
        prevProps.isDarkMode === nextProps.isDarkMode
    );
});

const Badge = memo(({ isFlashSale, isBestSelling }) => {
    //Flash sale badge öncelikli
    if (isFlashSale) {
        return (
            <View style={styles.flashSaleBadge}>
                <Text style={styles.flashSaleText}>FLASH</Text>
                <Text style={styles.flashSaleText}>İNDİRİM</Text>
            </View>
        );
    }

    // Best selling badge
    return (
        <View style={styles.bestSellingBadge}>
            <Text style={styles.bestSellingText}>EN ÇOK</Text>
            <Text style={styles.bestSellingText}>SATAN</Text>
        </View>
    );
});

const Label = memo(({ hasFastDelivery, hasLabelBestSeller }) => {
    // Fast delivery label öncelikli
    if (hasFastDelivery) {
        return (
            <View style={styles.fastDeliveryBadge}>
                <Ionicons name="flash" size={12} color="white" style={styles.deliveryIcon} />
                <Text style={styles.fastDeliveryText}>
                    Hızlı Teslimat
                </Text>
            </View>
        );
    }

    // Best seller label
    return (
        <View style={styles.bestSellerBadge}>
            <Ionicons name="star" size={12} color="white" style={styles.deliveryIcon} />
            <Text style={styles.bestSellerText}>
                EN ÇOK SATAN
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        width: 160,
        marginBottom: 20,
        marginLeft: 6,
        borderRadius: 16,
        borderWidth: 2,
        padding: 12,
        alignItems: 'center',
        position: 'relative',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    imageWrapper: {
        width: 130,
        height: 130,
        borderRadius: 12,
    },
    image: {
        width: 130,
        height: 130,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
    },
    favoriteIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    flashSaleBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF4757',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 1,
        alignItems: 'center',
        elevation: 2,
    },
    flashSaleText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
        lineHeight: 11,
    },
    bestSellingBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 1,
        alignItems: 'center',
        elevation: 2,
    },
    bestSellingText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
        lineHeight: 11,
    },
    fastDeliveryBadge: {
        backgroundColor: '#2ED573',
        width: '100%',
        paddingVertical: 6,
        marginTop: 8,
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    fastDeliveryText: {
        fontSize: 11,
        color: 'white',
        fontWeight: '600',
        marginLeft: 4,
    },
    bestSellerBadge: {
        backgroundColor: '#FF6B35',
        width: '100%',
        paddingVertical: 6,
        marginTop: 8,
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    bestSellerText: {
        fontSize: 11,
        color: 'white',
        fontWeight: '600',
        marginLeft: 4,
    },
    deliveryIcon: {
        marginRight: 2,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
        color: '#2c3e50',
        lineHeight: 20,
    },
    price: {
        fontSize: 16,
        color: '#FF6B35',
        marginTop: 6,
        fontWeight: '700',
    },
});

// Equality check function to prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.isDarkMode === nextProps.isDarkMode &&
        prevProps.favoriteItems?.[prevProps.item.id] === nextProps.favoriteItems?.[nextProps.item.id] &&
        prevProps.item.isFavorite === nextProps.item.isFavorite
    );
};

const ProductCardHorizontalWithMemo = memo(ProductCardHorizontal, areEqual);

ProductCardHorizontalWithMemo.displayName = 'ProductCardHorizontal';

export default ProductCardHorizontalWithMemo;
