import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../contexts/CartContext';
import { OrderContext } from '../contexts/OrderContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { creditCardApi } from '../utils/creditCardApi';
import { addressApi } from '../utils/addressApi';

export default function Payment() {
  const navigation = useNavigation();
  const { cartItems, clearCart } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const { translations } = useLanguage();
  const { theme, isDarkMode } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kredi kartları state'leri
  const [creditCards, setCreditCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // Adres state'leri
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Modal state'leri - Artık kullanılmıyor
  // const [showAddCardModal, setShowAddCardModal] = useState(false);
  // const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  // Yeni kart form state'leri - Artık kullanılmıyor  
  // const [newCard, setNewCard] = useState({
  //   cardNumber: '',
  //   cardHolderName: '',
  //   expiryMonth: '',
  //   expiryYear: '',
  //   cvv: '',
  //   cardTitle: ''
  // });

  // Yeni adres form state'leri - Artık kullanılmıyor
  // const [newAddress, setNewAddress] = useState({
  //   title: '',
  //   fullName: '',
  //   phoneNumber: '',
  //   addressLine1: '',
  //   addressLine2: '',
  //   city: '',
  //   district: '',
  //   postalCode: ''
  // });

  // Load data on component mount
  useEffect(() => {
    loadPaymentData();
  }, []);

  // Focus listener to reload data when returning from add screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPaymentData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadPaymentData = async () => {
    try {
      const [cardsData, addressesData] = await Promise.all([
        creditCardApi.getAllCreditCards(),
        addressApi.getAllAddresses()
      ]);

      setCreditCards(cardsData);
      setAddresses(addressesData);

      // İlk kartı ve adresi seç
      if (cardsData.length > 0) {
        setSelectedCard(cardsData[0]);
      }
      if (addressesData.length > 0) {
        setSelectedAddress(addressesData[0]);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      Alert.alert('Hata', 'Ödeme bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Silme fonksiyonları artık edit sayfalarında
  // const deleteCreditCard = async (cardId) => { ... };
  // const deleteAddress = async (addressId) => { ... };

  // Yeni kart ekleme fonksiyonu - Artık ayrı sayfada
  // const addCreditCard = async () => { ... };

  // Yeni adres ekleme fonksiyonu - Artık ayrı sayfada  
  // const addAddress = async () => { ... };

  // Price parsing fonksiyonu - Cart.js'den alındı
  const parsePrice = (priceValue) => {
    // Null/undefined kontrolü
    if (!priceValue && priceValue !== 0) {
      return 0;
    }

    // Eğer zaten sayıysa direkt döndür
    if (typeof priceValue === 'number') {
      return priceValue;
    }

    // String değilse 0 döndür
    if (typeof priceValue !== 'string') {
      return 0;
    }

    try {
      return parseFloat(priceValue.replace('₺', '').replace(',', '.')) || 0;
    } catch (error) {
      console.error('parsePrice error:', error, 'for value:', priceValue);
      return 0;
    }
  };

  // Toplam tutarı hesapla
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parsePrice(item.price);
      const amount = item.amount || 1;
      return total + (price * amount);
    }, 0);
  };

  // Ödeme işlemi
  const handlePayment = async () => {
    // Sepet boşluk kontrolü
    if (cartItems.length === 0) {
      Alert.alert(translations.error || 'Hata', 'Sepetiniz boş!');
      return;
    }

    // Kart seçimi kontrolü
    if (!selectedCard) {
      Alert.alert(translations.error || 'Hata', 'Lütfen bir kart seçin!');
      return;
    }

    // Adres seçimi kontrolü
    if (!selectedAddress) {
      Alert.alert(translations.error || 'Hata', 'Lütfen bir teslimat adresi seçin!');
      return;
    }

    setIsProcessing(true);

    try {
      // Sipariş verilerini hazırla
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          frontImagePath: item.frontImagePath,
          frontImageUrl: item.frontImageUrl,
          backImagePath: item.backImagePath,
          backImageUrl: item.backImageUrl,
          imageUrl: item.imageUrl,
          image: item.image,
          price: item.price,
          size: item.size,
          amount: item.amount,
          category: item.category
        })),
        totalAmount: calculateTotal().toFixed(2),
        paymentMethod: selectedCard ? selectedCard.cardTitle || 'Kartım' : 'Kart bilgisi bulunamadı',
        shippingAddress: selectedAddress ? `${selectedAddress.title} - ${selectedAddress.addressLine1}, ${selectedAddress.district}/${selectedAddress.city}` : 'Adres bilgisi bulunamadı',
        billingAddress: selectedAddress ? `${selectedAddress.title} - ${selectedAddress.addressLine1}, ${selectedAddress.district}/${selectedAddress.city}` : 'Adres bilgisi bulunamadı'
      };

      // Siparişi kaydet
      await addOrder(orderData);

      // Sepeti temizle
      clearCart();

      // Başarı mesajı göster
      Alert.alert(
        translations.success || 'Başarılı',
        translations.paymentSuccessful || 'Ödeme başarıyla tamamlandı',
        [
          {
            text: translations.viewOrderHistory || 'Sipariş Geçmişi',
            onPress: () => navigation.navigate('OrderHistory')
          },
          {
            text: translations.backToHome || 'Ana Sayfa',
            onPress: () => navigation.navigate('HomeScreen', { screen: 'Home' })
          }
        ]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(translations.error || 'Hata', translations.paymentError || 'Ödeme sırasında bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Sipariş öğesi render fonksiyonu
  const renderOrderItem = (item, index) => (
    <View key={index} style={[styles.orderItem, { borderBottomColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: isDarkMode ? '#fff' : '#333' }]}>
          {item.name || 'Ürün Adı'}
        </Text>
        <Text style={[styles.itemDetails, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>
          {translations.size || 'Boyut'}: {item.size || 'N/A'} | {translations.quantity || 'Adet'}: {item.amount || 1}
        </Text>
      </View>
      <Text style={[styles.itemPrice, { color: '#FF6B35' }]}>
        {(parsePrice(item.price) * (item.amount || 1)).toFixed(2)} ₺
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>

        {/* Kapatma Butonu */}
        <TouchableOpacity
          style={styles.closeButtonTopLeft}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
        </TouchableOpacity>

        {/* Başlık */}
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          {translations.paymentInformation || 'Ödeme Bilgileri'}
        </Text>

        {/* Kredi Kartları Bölümü */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle2, { color: theme.text }]}>
              Kayıtlı Kartlarım
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { borderColor: theme.primary }]}
              onPress={() => navigation.navigate('AddCreditCard')}
            >
              <Ionicons name="add" size={16} color={theme.primary} />
              <Text style={[styles.addButtonText, { color: theme.primary }]}>Kart Ekle</Text>
            </TouchableOpacity>
          </View>

          {creditCards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Henüz kayıtlı kartınız bulunmamaktadır
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsScrollContainer}
            >
              {creditCards.map((card, index) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.cardContainer,
                    selectedCard?.id === card.id && styles.selectedCard
                  ]}
                  onPress={() => setSelectedCard(card)}
                >
                  {/* Simple Blue Credit Card */}
                  <View style={[
                    styles.creditCardView,
                    { backgroundColor: selectedCard?.id === card.id ? '#4A90E2' : '#5BA4F2' }
                  ]}>
                    <Text style={styles.cardTitle}>{card.cardTitle || 'Kartım'}</Text>
                    <Text style={styles.cardNumber}>
                      **** **** **** {card.cardNumber ? card.cardNumber.slice(-4) : '****'}
                    </Text>
                    <View style={styles.cardBottom}>
                      <Text style={styles.cardHolder}>{card.cardHolderName}</Text>
                      <Text style={styles.cardExpiry}>
                        {card.expiryMonth}/{card.expiryYear}
                      </Text>
                    </View>
                  </View>

                  {/* Edit Button */}
                  <TouchableOpacity
                    style={[styles.cardEditButton, { backgroundColor: theme.primary }]}
                    onPress={() => navigation.navigate('EditCreditCard', { cardId: card.id })}
                  >
                    <Ionicons name="pencil" size={12} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Adresler Bölümü */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle2, { color: theme.text }]}>
              Teslimat Adreslerim
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { borderColor: theme.primary }]}
              onPress={() => navigation.navigate('AddAddress')}
            >
              <Ionicons name="add" size={16} color={theme.primary} />
              <Text style={[styles.addButtonText, { color: theme.primary }]}>Adres Ekle</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Henüz kayıtlı adresiniz bulunmamaktadır
              </Text>
            </View>
          ) : (
            addresses.map((address) => (
              <View key={address.id} style={styles.addressWithEditContainer}>
                <TouchableOpacity
                  style={[
                    styles.addressItem,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: selectedAddress?.id === address.id ? '#FF6B35' : (isDarkMode ? '#444' : '#f0f0f0'),
                      borderWidth: selectedAddress?.id === address.id ? 2 : 1,
                      shadowColor: selectedAddress?.id === address.id ? '#FF6B35' : '#000',
                      shadowOpacity: selectedAddress?.id === address.id ? 0.15 : 0.05,
                      shadowRadius: selectedAddress?.id === address.id ? 8 : 3,
                      elevation: selectedAddress?.id === address.id ? 4 : 2,
                    }
                  ]}
                  onPress={() => setSelectedAddress(address)}
                >
                  <View style={styles.addressHeader}>
                    <View style={styles.addressTitleContainer}>
                      <View style={[
                        styles.locationIconContainer,
                        { backgroundColor: selectedAddress?.id === address.id ? '#FF6B35' : (isDarkMode ? '#444' : '#f5f5f5') }
                      ]}>
                        <Ionicons
                          name="location"
                          size={14}
                          color={selectedAddress?.id === address.id ? 'white' : (isDarkMode ? '#ccc' : '#666')}
                        />
                      </View>
                      <Text style={[styles.addressTitle, { color: theme.text }]}>
                        {address.title}
                      </Text>
                    </View>
                    {selectedAddress?.id === address.id && (
                      <View style={[styles.selectedBadge, { backgroundColor: '#FF6B35' }]}>
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </View>

                  <View style={styles.addressContent}>
                    <View style={styles.addressDetailsContainer}>
                      <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                        {address.addressLine1}
                      </Text>
                      {address.addressLine2 && (
                        <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                          {address.addressLine2}
                        </Text>
                      )}
                      <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                        {address.district}, {address.city} {address.postalCode}
                      </Text>
                      <View style={styles.phoneContainer}>
                        <View style={[styles.phoneIconContainer, { backgroundColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
                          <Ionicons name="call" size={10} color={isDarkMode ? '#ccc' : '#666'} />
                        </View>
                        <Text style={[styles.addressText, styles.phoneText, { color: theme.textSecondary }]}>
                          {address.phoneNumber}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Edit Button */}
                <TouchableOpacity
                  style={[styles.addressEditButton, { backgroundColor: '#FF6B35' }]}
                  onPress={() => navigation.navigate('EditAddress', { addressId: address.id })}
                >
                  <Ionicons name="pencil" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>        {/* Sipariş Özeti */}
        <View style={[
          styles.orderSummary,
          {
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fafafa',
            borderColor: '#FF6B35',
            borderWidth: 2,
            shadowColor: isDarkMode ? '#000' : '#FF6B35',
            shadowOpacity: isDarkMode ? 0.3 : 0.15,
            shadowRadius: 12,
            elevation: 6,
          }
        ]}>
          <View style={styles.summaryHeader}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#FF6B35' }]}>
              <Ionicons name="receipt" size={16} color="white" />
            </View>
            <Text style={[styles.summaryTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
              {translations.orderSummary || 'Sipariş Özeti'}
            </Text>
          </View>

          {/* Sipariş Öğeleri */}
          <View style={styles.orderItemsContainer}>
            {cartItems.map(renderOrderItem)}
          </View>

          {/* Toplam Tutar - Artık border içerisinde */}
          <View style={[
            styles.totalRow,
            {
              backgroundColor: isDarkMode ? '#333' : '#fff',
              borderRadius: 8,
              padding: 12,
              marginTop: 16,
              borderTopWidth: 1,
              borderTopColor: isDarkMode ? '#555' : '#e0e0e0'
            }
          ]}>
            <Text style={[styles.totalLabel, { color: isDarkMode ? '#fff' : '#333' }]}>
              {translations.totalAmount || 'Toplam Tutar'}:
            </Text>
            <Text style={[styles.totalAmount, { color: '#FF6B35' }]}>
              {calculateTotal().toFixed(2)} ₺
            </Text>
          </View>
        </View>

        {/* Ödeme Butonu */}
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              isProcessing && styles.processingButton
            ]}
            onPress={handlePayment}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <>
                <Ionicons name="time" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>{translations.processing || 'İşleniyor...'}</Text>
              </>
            ) : (
              <>
                <Ionicons name="card" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>{translations.payNow || 'Ödeme Yap'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Güvenlik Bilgisi */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={[styles.securityText, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>
            {translations.yourPaymentSecure || 'Ödemeniz güvende'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardsScrollContainer: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 30,
    paddingLeft: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
  },
  addButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardContainer: {
    position: 'relative',
    marginRight: 15,
  },
  creditCardView: {
    width: 300,
    height: 160,
    borderRadius: 12,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolder: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  cardExpiry: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#FF6B35',
    borderRadius: 15,
    padding: 3,
  },
  cardEditButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  addressWithEditContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  addressItem: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContent: {
    paddingLeft: 2,
  },
  addressDetailsContainer: {
    gap: 2,
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  phoneText: {
    marginLeft: 2,
    fontWeight: '500',
  },
  addressEditButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
  },
  closeButtonTopLeft: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 80,
    textAlign: 'center',
  },
  orderSummary: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderItemsContainer: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 14,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  paymentButton: {
    backgroundColor: '#FF6B35',
    width: '100%',
    height: 55,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  processingButton: {
    backgroundColor: '#ccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 14,
    marginLeft: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});