import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { OrderContext } from '../contexts/OrderContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProduct } from '../contexts/ProductContext';

export default function OrderHistory() {
    const navigation = useNavigation();
    const { orderHistory, loadOrderHistory, clearOrderHistory } = useContext(OrderContext);
    const { translations } = useLanguage();
    const { theme, isDarkMode } = useTheme();
    const { getImageUrl } = useProduct();
    const [selectedOrder, setSelectedOrder] = useState(null); {/* Modal'da gosterilecek secili siparis */ }
    const [modalVisible, setModalVisible] = useState(false); {/* View Details a basildiginda modal in acik/kapali kontrolu */ }

    useEffect(() => {
        loadOrderHistory();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#E88A35';
            case 'Processing': return '#FF9800';
            case 'Shipped': return '#2196F3';
            case 'Delivered': return '#4CAF50';
            default: return '#999';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return 'checkmark-circle';
            case 'Processing': return 'time';
            case 'Shipped': return 'car';
            case 'Delivered': return 'checkmark-done-circle';
            default: return 'help-circle';
        }
    };

    // Clear order history fonksiyonu
    const handleClearHistory = () => {
        Alert.alert(
            translations.clearHistory || 'Clear History',
            translations.clearHistoryConfirm || 'Are you sure you want to clear all order history? This action cannot be undone.',
            [
                {
                    text: translations.cancel || 'Cancel',
                    style: 'cancel',
                },
                {
                    text: translations.clear || 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearOrderHistory();
                            Alert.alert(
                                translations.success || 'Success',
                                translations.historyCleared || 'Order history has been cleared successfully.'
                            );
                        } catch (error) {
                            Alert.alert(
                                translations.error || 'Error',
                                translations.clearHistoryError || 'Failed to clear order history. Please try again.'
                            );
                            console.error('Error clearing order history:', error);
                        }
                    },
                },
            ]
        );
    };

    const renderOrderItem = ({ item, index }) => (
        <View style={[styles.orderCard, { marginTop: index === 0 ? 0 : 16, backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <View style={styles.cardHeader}>
                <View style={styles.orderNumberContainer}>
                    <Ionicons name="receipt" size={16} color={isDarkMode ? '#b3b3b3' : '#666'} />
                    <Text style={[styles.orderNumber, { color: isDarkMode ? '#fff' : '#333' }]}>#{item.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Ionicons name={getStatusIcon(item.status)} size={14} color="#fff" />
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.orderMeta}>
                <View style={styles.metaItem}>
                    <Ionicons name="calendar" size={16} color={isDarkMode ? '#b3b3b3' : '#666'} />
                    <Text style={[styles.metaText, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="cube" size={16} color={isDarkMode ? '#b3b3b3' : '#666'} />
                    <Text style={[styles.metaText, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>{item.items?.length || 0} {translations.items}</Text>
                </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
                <View style={styles.totalSection}>
                    <Text style={[styles.totalLabel, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>{translations.total}</Text>
                    <Text style={[styles.totalAmount, { color: isDarkMode ? '#fff' : '#333' }]}>{item.totalAmount} ₺</Text>
                </View>
                <TouchableOpacity
                    style={[styles.detailsButton, { backgroundColor: isDarkMode ? '#1a2a3a' : '#f0f8ff' }]}
                    onPress={() => {
                        setSelectedOrder(item);
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.detailsButtonText}>{translations.viewDetails}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#E88A35" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderOrderModal = () => {
        if (!modalVisible) return null;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.bottomSheetOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
                    <TouchableOpacity
                        style={styles.overlayBackground}
                        onPress={() => setModalVisible(false)}
                        activeOpacity={1}
                    />

                    <View style={[styles.bottomSheetContainer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff' }]}>
                        {/* Drag Handle */}
                        <View style={[styles.dragHandle, { backgroundColor: isDarkMode ? '#444' : '#e0e0e0' }]} />

                        {/* Modal Header */}
                        <View style={[styles.bottomSheetHeader, { borderBottomColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
                            <View style={styles.headerLeft}>
                                <Ionicons name="receipt" size={24} color="#ce6302" />
                                <Text style={[styles.bottomSheetTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                                    {translations.orderDetails}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[styles.bottomSheetCloseButton, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}
                            >
                                <Ionicons name="close" size={24} color={isDarkMode ? '#b3b3b3' : '#666'} />
                            </TouchableOpacity>
                        </View>

                        {/* Order Info Card */}
                        <View style={[styles.orderInfoCard, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa', borderLeftColor: '#FF6B35' }]}>
                            <View style={styles.orderInfoHeader}>
                                <Text style={[styles.orderNumber, { color: isDarkMode ? '#fff' : '#333' }]}>#{selectedOrder?.id}</Text>
                                <View style={[styles.miniStatusBadge, { backgroundColor: getStatusColor(selectedOrder?.status) }]}>
                                    <Text style={styles.miniStatusText}>{selectedOrder?.status}</Text>
                                </View>
                            </View>
                            <Text style={[styles.orderDate, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>
                                {selectedOrder && formatDate(selectedOrder.date)}
                            </Text>
                        </View>

                        <ScrollView style={[styles.bottomSheetContent, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff' }]} showsVerticalScrollIndicator={false}>
                            {/* Quick Info */}
                            <View style={styles.quickInfoRow}>
                                <View style={[styles.quickInfoItem, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}>
                                    <Ionicons name="card" size={16} color={isDarkMode ? '#ce6302' : '#ce6302'} />
                                    <Text style={[styles.quickInfoLabel, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>Ödeme</Text>
                                    <Text style={[styles.quickInfoValue, { color: isDarkMode ? '#fff' : '#333' }]}>
                                        {selectedOrder?.paymentMethod || 'Kart'}
                                    </Text>
                                </View>
                                <View style={[styles.quickInfoItem, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}>
                                    <Ionicons name="cube" size={16} color={isDarkMode ? '#ce6302' : '#ce6302'} />
                                    <Text style={[styles.quickInfoLabel, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>Ürün</Text>
                                    <Text style={[styles.quickInfoValue, { color: isDarkMode ? '#fff' : '#333' }]}>{selectedOrder?.items?.length || 0} adet</Text>
                                </View>
                                <View style={[styles.quickInfoItem, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}>
                                    <Ionicons name="cash" size={16} color={isDarkMode ? '#ce6302' : '#ce6302'} />
                                    <Text style={[styles.quickInfoLabel, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>Toplam</Text>
                                    <Text style={[styles.quickInfoValue, { color: isDarkMode ? '#fff' : '#333' }]}>{selectedOrder?.totalAmount} ₺</Text>
                                </View>
                            </View>

                            {/* Items Section */}
                            <View style={styles.itemsSection}>
                                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                                    Sipariş Edilen Ürünler ({selectedOrder?.items?.length || 0} Adet)
                                </Text>
                                {selectedOrder?.items?.map((item, index) => (
                                    <View key={index} style={[styles.modernItemCard, { backgroundColor: isDarkMode ? '#333' : '#fff', borderColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
                                        <View style={{ flexDirection: "row" }}>
                                            <Image
                                                source={{ uri: getImageUrl(item.frontImagePath || item.frontImageUrl || item.imageUrl || item.image) }}
                                                style={[styles.modernItemImage, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}
                                                defaultSource={require('../assets/images/icon.png')}
                                                onError={(error) => console.log('OrderHistory Image load error:', error.nativeEvent.error)}
                                            />
                                            <View style={styles.modernItemInfo}>
                                                <Text style={[styles.modernItemName, { color: isDarkMode ? '#fff' : '#333' }]}>{item.name}</Text>
                                                <Text style={[styles.modernItemCategory, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>{item.category}</Text>

                                                {/* Ürün Detayları */}
                                                <View style={styles.itemDetailsContainer}>
                                                    <View style={styles.detailGroup}>
                                                        <Text style={[styles.detailGroupTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Beden & Adet</Text>
                                                        <View style={styles.detailRow}>
                                                            <View style={[styles.detailItem, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}>
                                                                <Ionicons name="shirt" size={16} color="#D06E16" />
                                                                <Text style={[styles.detailText, { color: isDarkMode ? '#fff' : '#333' }]}>Beden: {item.size}</Text>
                                                            </View>
                                                            <View style={[styles.detailItem, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}>
                                                                <Ionicons name="cube" size={16} color="#D06E16" />
                                                                <Text style={[styles.detailText, { color: isDarkMode ? '#fff' : '#333' }]}>Adet: {item.amount}</Text>
                                                            </View>
                                                        </View>
                                                    </View>

                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.detailGroup}>
                                            <Text style={[styles.detailGroupTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Fiyat</Text>
                                            <View style={[styles.priceContainer, { backgroundColor: isDarkMode ? '#1a2a3a' : '#e3f2fd', borderLeftColor: '#FF6B35' }]}>
                                                <Text style={[styles.totalPrice, { color: isDarkMode ? '#fff' : '#000' }]}>
                                                    Toplam: <Text style={{ color: '#FF6B35' }}>{((typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₺', '').replace(',', '.')) || 0) * item.amount).toFixed(2)} ₺</Text>
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Payment Details Section */}
                            <View style={styles.paymentSection}>
                                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                                    Sipariş Bilgileri
                                </Text>
                                <View style={[styles.paymentDetailsCard, { backgroundColor: isDarkMode ? '#333' : '#fff', borderColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
                                    <View style={styles.paymentDetailRow}>
                                        <View style={styles.paymentDetailItem}>
                                            <Ionicons name="card-outline" size={20} color="#FF6B35" />
                                            <View style={styles.paymentDetailInfo}>
                                                <Text style={[styles.paymentDetailLabel, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>
                                                    Kullanılan Kart
                                                </Text>
                                                <Text style={[styles.paymentDetailValue, { color: isDarkMode ? '#fff' : '#333' }]}>
                                                    {selectedOrder?.paymentMethod || 'Kart bilgisi bulunamadı'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={[styles.paymentDetailRow, { borderTopWidth: 1, borderTopColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
                                        <View style={styles.paymentDetailItem}>
                                            <Ionicons name="location-outline" size={20} color="#FF6B35" />
                                            <View style={styles.paymentDetailInfo}>
                                                <Text style={[styles.paymentDetailLabel, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>
                                                    Teslimat Adresi
                                                </Text>
                                                <Text style={[styles.paymentDetailValue, { color: isDarkMode ? '#fff' : '#333' }]} numberOfLines={3}>
                                                    {selectedOrder?.shippingAddress || 'Adres bilgisi bulunamadı'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Total Summary */}
                            <View style={[styles.totalSummaryCard, { backgroundColor: isDarkMode ? '#333' : '#f8f9fa', borderColor: isDarkMode ? '#444' : '#e0e0e0' }]}>
                                <View style={styles.totalSummaryRow}>
                                    <Text style={[styles.totalSummaryLabel, { color: isDarkMode ? '#fff' : '#333' }]}>Toplam Tutar</Text>
                                    <Text style={[styles.totalSummaryValue, { color: '#FF6B35' }]}>{selectedOrder?.totalAmount} ₺</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    if (orderHistory.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#f8f9fa' }]}>
                <TouchableOpacity
                    style={styles.closeButtonTopLeft}
                    onPress={() => navigation.navigate('HomeScreen', { screen: 'Account' })}
                >
                    <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
                </TouchableOpacity>

                {/* Empty State */}
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: isDarkMode ? '#444' : '#f5f5f5' }]}>
                        <Ionicons name="receipt-outline" size={80} color={isDarkMode ? '#ce6302' : '#ce6302'} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: isDarkMode ? '#fff' : '#333' }]}>{translations.noOrders}</Text>
                    <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>{translations.noOrdersMessage}</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => navigation.navigate('HomeScreen', { screen: 'Home' })}
                    >
                        <Ionicons name="storefront" size={20} color="#fff" />
                        <Text style={styles.shopButtonText}>{translations.startShopping || 'Start Shopping'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#f8f9fa' }]}>
            {/* Header with Close button only */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.closeButtonTopLeft}
                    onPress={() => navigation.navigate('HomeScreen', { screen: 'Account' })}
                >
                    <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
                    {translations.orderHistory || 'Order History'}
                </Text>

                <View style={styles.placeholder} />
            </View>

            {/* Clear button section */}
            {orderHistory.length > 0 && (
                <View style={styles.clearButtonSection}>
                    <TouchableOpacity
                        style={[
                            styles.clearButtonModern,
                            {
                                backgroundColor: '#c84955',
                                borderColor: '#b02a2f',
                                shadowColor: '#dc3545'
                            }
                        ]}
                        onPress={handleClearHistory}
                        activeOpacity={0.8}
                    >
                        <View style={styles.clearButtonContent}>
                            <Ionicons name="trash-outline" size={18} color="#000" />
                            <Text style={[styles.clearButtonTextModern, { color: '#000' }]}>
                                {translations.clear || 'Clear'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Orders List */}
            <FlatList
                data={orderHistory}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal - En altta render et */}
            {renderOrderModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    closeButtonTopLeft: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    clearButtonText: {
        color: '#ff6b6b',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    clearButtonSection: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
    },
    clearButtonModern: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1.5,
        elevation: 3,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        alignSelf: 'flex-end',
    },
    clearButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButtonTextModern: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
        marginLeft: 6,
    },
    placeholder: {
        width: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    listContainer: {
        padding: 20,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#ce6302',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    statusBadge: {
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
        marginLeft: 4,
    },
    orderMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    totalSection: {
        alignItems: 'flex-start',
    },
    totalLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f0f8ff',
    },
    detailsButtonText: {
        fontSize: 14,
        color: '#E88A35',
        fontWeight: '600',
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
        backgroundColor: '#f5f5f5',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
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
        marginLeft: 8,
    },
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    overlayBackground: {
        flex: 1,
    },
    bottomSheetContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '75%',
        paddingBottom: 20,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bottomSheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 12,
    },
    bottomSheetCloseButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
    },
    orderInfoCard: {
        backgroundColor: '#f8f9fa',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#007BFF',
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
        color: '#333',
    },
    miniStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    miniStatusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    orderDate: {
        fontSize: 14,
        color: '#666',
    },
    bottomSheetContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    quickInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20,
    },
    quickInfoItem: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginHorizontal: 4,
    },
    quickInfoLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    quickInfoValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 2,
    },
    itemsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    modernItemCard: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    modernItemImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#f8f9fa',
    },
    modernItemInfo: {
        flex: 1,
    },
    modernItemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    modernItemCategory: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    itemDetailsContainer: {
        marginTop: 8,
    },
    detailGroup: {
        marginBottom: 12,
    },
    detailGroupTitle: {
        textAlign: "center",
        fontSize: 12,
        fontWeight: '600',
        color: '#007BFF',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        flex: 0.48,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
        fontWeight: '500',
    },
    priceContainer: {
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#007BFF'

    },
    unitPrice: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007BFF',
        textAlign: 'center',
    },
    totalSummaryCard: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 20,
    },
    totalSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalSummaryLabel: {
        fontSize: 14,
        color: 'black',
        fontWeight: '500',
    },
    totalSummaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007BFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '90%',
        maxHeight: '80%',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    testContent: {
        padding: 20,
        alignItems: 'center',
    },
    testTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    testText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    testCloseButton: {
        backgroundColor: '#007BFF',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 30,
    },
    testCloseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    debugOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    debugText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    debugButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    debugButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    simpleModalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    simpleModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    simpleModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    simpleCloseButton: {
        padding: 8,
    },
    simpleModalContent: {
        flex: 1,
        padding: 20,
    },
    simpleDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    simpleLabel: {
        fontSize: 16,
        color: '#666',
    },
    simpleValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    simpleSubtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 15,
    },
    simpleItemCard: {
        flexDirection: 'row',
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
    },
    simpleItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 15,
    },
    simpleItemInfo: {
        flex: 1,
    },
    simpleItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    simpleItemMeta: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    simpleItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007BFF',
    },
    modalContent: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#f8f9fa',
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 12,
    },
    closeButton: {
        padding: 8,
        borderRadius: 8,
    },
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    statusIndicator: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statusInfo: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statusDate: {
        fontSize: 14,
        color: '#666',
    },
    detailsSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    itemsSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007BFF',
    },
    modalTotalSection: {
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007BFF',
    },

    // Payment Details Styles
    paymentSection: {
        marginVertical: 20,
        paddingHorizontal: 16,
    },
    paymentDetailsCard: {
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    paymentDetailRow: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    paymentDetailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    paymentDetailInfo: {
        marginLeft: 12,
        flex: 1,
    },
    paymentDetailLabel: {
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
    },
    paymentDetailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 22,
    },
});
