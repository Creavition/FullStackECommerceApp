import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CreditCard from '../components/CreditCard';
import { CartContext } from '../contexts/CartContext';
import { OrderContext } from '../contexts/OrderContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Payment() {
  const navigation = useNavigation();
  const { cartItems, clearCart } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const { translations } = useLanguage();
  const { theme, isDarkMode } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

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
      return total + (price * item.amount);
    }, 0);
  };

  // Ödeme işlemi
  const handlePayment = async () => {
    // Sepet boşluk kontrolü
    if (cartItems.length === 0) {
      Alert.alert(translations.error, 'Sepetiniz boş!');
      return;
    }

    setIsProcessing(true);

    try {
      // Sipariş verilerini hazırla
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          size: item.size,
          amount: item.amount,
          category: item.category
        })),
        totalAmount: calculateTotal().toFixed(2),
        paymentMethod: 'Credit Card',
        shippingAddress: 'Default Address', // Bu gerçek uygulamada formdan alınır
        billingAddress: 'Default Address'
      };

      // Siparişi kaydet
      await addOrder(orderData);

      // Sepeti temizle
      clearCart();

      // Başarı mesajı göster
      Alert.alert(
        translations.success,
        translations.paymentSuccessful,
        [
          {
            text: translations.viewOrderHistory,
            onPress: () => navigation.navigate('OrderHistory')
          },
          {
            text: translations.backToHome,
            onPress: () => navigation.navigate('HomeScreen', { screen: 'Home' })
          }
        ]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(translations.error, translations.paymentError);
    } finally {
      setIsProcessing(false);
    }
  };

  // Sipariş öğesi render fonksiyonu
  const renderOrderItem = (item, index) => (
    <View key={index} style={[styles.orderItem, { borderBottomColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: isDarkMode ? '#fff' : '#333' }]}>
          {item.name}
        </Text>
        <Text style={[styles.itemDetails, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>
          {translations.size}: {item.size || 'N/A'} | {translations.quantity}: {item.amount}
        </Text>
      </View>
      <Text style={[styles.itemPrice, { color: isDarkMode ? '#fff' : '#7f4612' }]}>
        {(parsePrice(item.price) * item.amount).toFixed(2)} ₺
      </Text>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDarkMode ? theme.background : '#f8f9fa' }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Kapatma Butonu */}
      <TouchableOpacity
        style={styles.closeButtonTopLeft}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
      </TouchableOpacity>

      {/* Başlık */}
      <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
        {translations.paymentInformation}
      </Text>

      {/* Kredi Kartı Komponenti */}
      <CreditCard />

      {/* Sipariş Özeti */}
      <View style={[
        styles.orderSummary,
        {
          backgroundColor: isDarkMode ? '#333' : '#fff',
          borderColor: isDarkMode ? '#444' : '#e0e0e0'
        }
      ]}>
        <Text style={[styles.summaryTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          {translations.orderSummary}
        </Text>

        {/* Sipariş Öğeleri */}
        {cartItems.map(renderOrderItem)}

        {/* Toplam Tutar */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          <Text style={[styles.totalLabel, { color: isDarkMode ? '#fff' : '#333' }]}>
            {translations.totalAmount}:
          </Text>
          <Text style={[styles.totalAmount, { color: isDarkMode ? '#fff' : '#7f4612' }]}>
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
              <Text style={styles.buttonText}>{translations.processing}</Text>
            </>
          ) : (
            <>
              <Ionicons name="card" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{translations.payNow}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Güvenlik Bilgisi */}
      <View style={styles.securityInfo}>
        <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
        <Text style={[styles.securityText, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>
          {translations.yourPaymentSecure}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 10,
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
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    paddingTop: 15,
    marginTop: 10,
    borderTopWidth: 2,
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