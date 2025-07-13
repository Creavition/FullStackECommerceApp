// components/ProductCardHorizontal.js
import React, { useCallback, memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductCardHorizontal = memo(({
    item,
    onProductPress,
    onFavoritePress,
    translations,
    isDarkMode,
}) => {
    const handleProductPress = useCallback(() => onProductPress(item), [item, onProductPress]);
    const handleFavoritePress = useCallback(() => onFavoritePress(item.id), [item.id, onFavoritePress]);

    // API'den gelen verilerden badge ve label bilgilerini al
    const isFavorite = item.isFavorite || false;
    const isFlashSale = item.badge_FlashSale || false;
    const isBestSelling = item.badge_BestSelling || false;
    const hasLabelBestSeller = item.label_BestSeller || false;
    const hasFastDelivery = item.label_FastDelivery || false;

    return (
        <TouchableOpacity
            onPress={handleProductPress}
            style={[styles.card, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}
            activeOpacity={0.8}
        >
            <Badge
                isFlashSale={isFlashSale}
                isBestSelling={isBestSelling}
                translations={translations}
            />

            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.imageUrl || item.image }}
                    style={styles.image}
                    resizeMode="cover"
                />
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

            <Label
                hasFastDelivery={hasFastDelivery}
                hasLabelBestSeller={hasLabelBestSeller}
                translations={translations}
            />

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
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.isFavorite === nextProps.item.isFavorite &&
        prevProps.item.badge_FlashSale === nextProps.item.badge_FlashSale &&
        prevProps.item.badge_BestSelling === nextProps.item.badge_BestSelling &&
        prevProps.item.label_BestSeller === nextProps.item.label_BestSeller &&
        prevProps.item.label_FastDelivery === nextProps.item.label_FastDelivery &&
        prevProps.isDarkMode === nextProps.isDarkMode &&
        prevProps.translations === nextProps.translations
    );
});

const Badge = memo(({ isFlashSale, isBestSelling, translations }) => {
    // Sadece badge true ise göster
    if (isFlashSale) {
        return (
            <View style={styles.flashSaleBadge}>
                <Text style={styles.flashSaleText}>{translations.flashSale.split(' ')[0]}</Text>
                <Text style={styles.flashSaleText}>{translations.flashSale.split(' ')[1]}</Text>
            </View>
        );
    }

    if (isBestSelling) {
        return (
            <View style={styles.bestSellingBadge}>
                <Text style={styles.bestSellingText}>{translations.bestSellingLine1}</Text>
                <Text style={styles.bestSellingText}>{translations.bestSellingLine2}</Text>
            </View>
        );
    }

    // Hiçbir badge true değilse badge gösterme
    return null;
});

const Label = memo(({ hasFastDelivery, hasLabelBestSeller, translations }) => {
    // Sadece label true ise göster
    if (hasFastDelivery) {
        return (
            <View style={styles.fastDeliveryBadge}>
                <Ionicons name="flash" size={12} color="white" style={styles.deliveryIcon} />
                <Text style={styles.fastDeliveryText}>
                    {translations.fastDelivery}
                </Text>
            </View>
        );
    }

    if (hasLabelBestSeller) {
        return (
            <View style={styles.bestSellerBadge}>
                <Ionicons name="star" size={12} color="white" style={styles.deliveryIcon} />
                <Text style={styles.bestSellerText}>
                    {translations.bestSeller}
                </Text>
            </View>
        );
    }

    // Hiçbir label true değilse label gösterme
    return null;
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        width: 160,
        marginBottom: 20,
        marginLeft: 6,
        borderRadius: 16,
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

ProductCardHorizontal.displayName = 'ProductCardHorizontal';

export default ProductCardHorizontal;
