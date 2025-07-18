import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ScrollView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { OrderContext } from '../contexts/OrderContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProduct } from '../contexts/ProductContext';

export default function OrderHistory() {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderHistory, loadOrderHistory, clearOrderHistory } = useContext(OrderContext);
    const { theme } = useTheme();
    const { getImageUrl } = useProduct();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    // Route params'tan gelinen sayfayı al
    const { fromScreen } = route.params || {};

    const handleBackPress = () => {
        if (fromScreen === 'Account') {
            // Account'tan gelindiyse goBack
            navigation.goBack();
        } else {
            // Diğer sayfalardan  gelindiyse Account tab'ına git
            navigation.navigate('HomeScreen', { screen: 'Account' });
        }
    };

    useEffect(() => {
        loadOrderHistory();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const formatDate = (item) => {
        const timestamp = item.date ? new Date(item.date) : new Date(parseInt(item.id));
        return timestamp.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };


    const STATUS_COLOR = '#F59E0B';
    const STATUS_ICON = 'time';
    const STATUS_TEXT = 'Hazırlanıyor';

    const handleClearHistory = () => {
        Alert.alert(
            'Geçmişi Temizle',
            'Tüm sipariş geçmişini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Temizle',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearOrderHistory();
                            Alert.alert('Başarılı', 'Sipariş geçmişi başarıyla temizlendi.');
                        } catch (error) {
                            Alert.alert('Hata', 'Sipariş geçmişi temizlenemedi. Lütfen tekrar deneyin.');
                        }
                    },
                },
            ]
        );
    };

    const renderOrderItem = ({ item, index }) => (
        <Animated.View style={[
            styles.orderCard,
            {
                backgroundColor: theme.cardBackground,
                opacity: fadeAnim,
                transform: [{
                    translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                    }),
                }],
            }
        ]}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <View style={styles.orderIdContainer}>
                        <Ionicons name="receipt" size={18} color={theme.primary} />
                        <Text style={[styles.orderId, { color: theme.text }]}>#{item.id}</Text>
                    </View>
                    <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                        {formatDate(item)}
                    </Text>
                </View>
                <View style={[styles.statusContainer, { backgroundColor: STATUS_COLOR }]}>
                    <Ionicons name={STATUS_ICON} size={16} color="#fff" />
                    <Text style={styles.statusText}>{STATUS_TEXT}</Text>
                </View>
            </View>

            {/* Products Preview */}
            <View style={styles.productsPreview}>
                {item.items?.slice(0, 3).map((product, idx) => (
                    <Image
                        key={idx}
                        source={{ uri: getImageUrl(product.frontImagePath || product.frontImageUrl || product.imageUrl || product.image) }}
                        style={[styles.productPreviewImage, { marginLeft: idx * -8 }]}
                    />
                ))}
                {/* 3 den fazla urun olursa */}
                {item.items?.length > 3 && (
                    <View style={[styles.moreProductsIndicator, { backgroundColor: theme.primary }]}>
                        <Text style={styles.moreProductsText}>+{item.items.length - 3}</Text>
                    </View>
                )}
            </View>

            {/* Order Footer */}
            <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
                <View style={styles.orderSummary}>
                    <View style={styles.summaryItem}>
                        <Ionicons name="cube-outline" size={16} color={theme.textSecondary} />
                        <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
                            {item.items?.length || 0} Ürün
                        </Text>
                    </View>
                </View>
                <View style={styles.orderActions}>
                    <Text style={[styles.totalAmount, { color: theme.primary }]}>
                        ₺{item.totalAmount}
                    </Text>
                    <TouchableOpacity
                        style={[styles.detailButton, { backgroundColor: theme.primary }]}
                        onPress={() => {
                            setSelectedOrder(item);
                            setModalVisible(true);
                        }}
                    >
                        <Text style={styles.detailButtonText}>Detaylar</Text>
                        <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );

    const renderEmptyState = () => (
        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.cardBackground }]}>
                <Ionicons name="receipt-outline" size={64} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Henüz Sipariş Yok</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                İlk siparişinizi vererek alışveriş deneyiminizi başlatın
            </Text>
            <TouchableOpacity
                style={[styles.shopButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('HomeScreen', { screen: 'Home' })}
            >
                <Ionicons name="storefront" size={20} color="#fff" />
                <Text style={styles.shopButtonText}>Alışverişe Başla</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderOrderModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackground}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={1}
                />
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <View style={styles.modalTitleContainer}>
                            <Ionicons name="receipt" size={24} color={theme.primary} />
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                Sipariş Detayları
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: theme.cardBackground }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.modalContent}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {/* Order Info Card */}
                        <View style={[styles.orderInfoCard, { backgroundColor: theme.cardBackground, borderLeftColor: theme.primary }]}>
                            <View style={styles.orderInfoHeader}>
                                <Text style={[styles.orderNumber, { color: theme.text }]}>
                                    Sipariş #{selectedOrder?.id}
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR }]}>
                                    <Ionicons name={STATUS_ICON} size={14} color="#fff" />
                                    <Text style={styles.statusBadgeText}>{STATUS_TEXT}</Text>
                                </View>
                            </View>

                        </View>

                        {/* Products Section */}
                        <View style={[styles.productsSection, { backgroundColor: theme.cardBackground }]}>
                            <View style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
                                <View style={styles.sectionTitleContainer}>
                                    <Ionicons name="bag-handle" size={20} color={theme.primary} />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                        Sipariş Edilen Ürünler
                                    </Text>
                                </View>
                                <View style={[styles.itemCountBadge, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.itemCountText}>
                                        {selectedOrder?.items?.length || 0}
                                    </Text>
                                </View>
                            </View>

                            {selectedOrder?.items?.map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.productItem,
                                        {
                                            borderBottomColor: theme.border,
                                            borderBottomWidth: index === selectedOrder.items.length - 1 ? 0 : 1
                                        }
                                    ]}
                                >
                                    <Image
                                        source={{ uri: getImageUrl(item.frontImagePath || item.frontImageUrl || item.imageUrl || item.image) }}
                                        style={styles.productImage}

                                    />
                                    <View style={styles.productDetails}>
                                        <Text style={[styles.productName, { color: theme.text }]}>
                                            {item.name}
                                        </Text>
                                        <Text style={[styles.productCategory, { color: theme.textSecondary }]}>
                                            {item.category}
                                        </Text>
                                        <View style={styles.productMeta}>
                                            <View style={[styles.metaChip, { backgroundColor: theme.primary + '20' }]}>
                                                <Text style={[styles.metaText, { color: theme.primary }]}>
                                                    Beden: {item.size}
                                                </Text>
                                            </View>
                                            <View style={[styles.metaChip, { backgroundColor: theme.primary + '20' }]}>
                                                <Text style={[styles.metaText, { color: theme.primary }]}>
                                                    Adet: {item.amount}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.productPricing}>
                                        <Text style={[styles.productPrice, { color: theme.primary }]}>
                                            ₺{((typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₺', '').replace(',', '.')) || 0) * item.amount).toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Order Summary */}
                        <View style={[styles.summarySection, { backgroundColor: theme.cardBackground }]}>
                            <View style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
                                <View style={styles.sectionTitleContainer}>
                                    <Ionicons name="calculator" size={20} color={theme.primary} />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                        Sipariş Özeti
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.summaryContent}>
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                                        Ürün Adedi
                                    </Text>
                                    <Text style={[styles.summaryValue, { color: theme.text }]}>
                                        {selectedOrder?.items?.length || 0} Adet
                                    </Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                                        Ödeme Yöntemi
                                    </Text>
                                    <Text style={[styles.summaryValue, { color: theme.text }]}>
                                        Kredi Kartı - {selectedOrder?.paymentMethod || 'Kartım'}
                                    </Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                                        Teslimat Adresi
                                    </Text>
                                    <Text style={[styles.summaryValue, { color: theme.text }]} numberOfLines={2}>
                                        {selectedOrder?.shippingAddress || 'Adres Bulunamadı'}
                                    </Text>
                                </View>
                                <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: theme.border }]}>
                                    <Text style={[styles.totalLabel, { color: theme.text }]}>
                                        Toplam Tutar
                                    </Text>
                                    <Text style={[styles.totalValue, { color: theme.primary }]}>
                                        ₺{selectedOrder?.totalAmount}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    if (orderHistory.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme.background }]}
                        onPress={handleBackPress}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Sipariş Geçmişi</Text>
                    <View style={styles.headerSpacer} />
                </View>
                {renderEmptyState()}
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.background }]}
                    onPress={handleBackPress}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Sipariş Geçmişi</Text>
                <TouchableOpacity
                    style={[styles.clearButton, { backgroundColor: '#EF4444' }]}
                    onPress={handleClearHistory}
                >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Stats Card */}
            <Animated.View style={[
                styles.statsCard,
                {
                    backgroundColor: theme.cardBackground,
                    opacity: fadeAnim,
                    transform: [{
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                        }),
                    }],
                }
            ]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.primary }]}>{orderHistory.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Toplam Sipariş</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.primary }]}>
                        ₺{orderHistory.reduce((total, order) => total + parseFloat(order.totalAmount), 0).toFixed(2)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Toplam Harcama</Text>
                </View>
            </Animated.View>

            {/* Orders List */}
            <FlatList
                data={orderHistory}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            {renderOrderModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    clearButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    statsCard: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
        padding: 20,
        borderWidth: 2,
        borderRadius: 20
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: '100%',
        marginHorizontal: 20,
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
    },
    orderCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderInfo: {
        flex: 1,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    orderDate: {
        fontSize: 14,
        opacity: 0.7,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    productsPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingLeft: 8,
    },
    productPreviewImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    moreProductsIndicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -8,
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    moreProductsText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
    },
    orderSummary: {
        flexDirection: 'row',
        gap: 16,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 12,
        marginLeft: 6,
    },
    orderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    detailButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        opacity: 0.7,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        opacity: 0.7,
    },
    shopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalBackground: {
        flex: 1,
    },
    modalContainer: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '85%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    orderInfoCard: {
        marginVertical: 20,
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    orderInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    orderDateTime: {
        fontSize: 14,
        opacity: 0.7,
    },
    productsSection: {
        marginBottom: 20,
        borderRadius: 16,
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 20

    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    itemCountBadge: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
    },
    itemCountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    productItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 12,
        marginBottom: 8,
        opacity: 0.7,
    },
    productMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    metaChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '600',
    },
    productPricing: {
        alignItems: 'flex-end',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    summarySection: {
        marginBottom: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "black",
        borderRadius: 20
    },
    summaryContent: {
        padding: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    summaryLabel: {
        fontSize: 14,
        flex: 1,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
    },
    totalRow: {
        borderTopWidth: 1,
        marginTop: 12,
        paddingTop: 16,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
