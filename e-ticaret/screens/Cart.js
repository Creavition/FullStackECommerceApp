// Cart.js - Size debugging ile
import { useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { CartContext } from '../contexts/CartContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllProducts } from '../utils/productUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProduct } from '../contexts/ProductContext';

export default function Cart() {
  const { cartItems, removeFromCart, increaseAmount, decreaseAmount, updateAllCartItemsLanguage } = useContext(CartContext);
  const navigation = useNavigation();
  const { translations, language } = useLanguage();
  const { theme, isDarkMode } = useTheme();
  const { getImageUrl } = useProduct();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debug için cartItems'ı console'a yazdır
  useEffect(() => {
    console.log('Current cartItems:', cartItems);
    cartItems.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        id: item.id,
        name: item.name,
        size: item.size,
        amount: item.amount
      });
    });
  }, [cartItems]);

  // Ürünleri yükle
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const products = await getAllProducts();
      setAllProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sayfa yüklendiğinde ve dil değiştiğinde ürünleri yükle
  useEffect(() => {
    loadProducts();
  }, [loadProducts, language]);

  // Dil değiştiğinde sepetteki ürün isimlerini güncelle
  useEffect(() => {
    if (allProducts.length > 0 && cartItems.length > 0 && updateAllCartItemsLanguage) {
      updateAllCartItemsLanguage(allProducts);
    }
  }, [allProducts, language]);

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

  // Flash Sale ürünlerini belirle (her kategoriden en ucuz 6 ürün)
  const flashSaleProducts = useMemo(() => {
    const categories = ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
    const flashSaleIds = new Set();

    categories.forEach(category => {
      const categoryProducts = allProducts
        .filter(product => product.category === category && product.price) // price kontrolü ekle
        .sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
        .slice(0, 6);

      categoryProducts.forEach(product => flashSaleIds.add(product.id));
    });

    return flashSaleIds;
  }, [allProducts]);

  // Fast Delivery ürünlerini belirle (sabit seed ile tutarlı sonuçlar)
  const fastDeliveryProducts = useMemo(() => {
    const fastDeliveryIds = new Set();
    allProducts.forEach((product, index) => {
      // Product ve id güvenlik kontrolü
      if (!product || !product.id || typeof product.id !== 'string') {
        return; // Bu ürünü atla
      }

      const hash = product.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      if (Math.abs(hash) % 10 < 3) {
        fastDeliveryIds.add(product.id);
      }
    });
    return fastDeliveryIds;
  }, [allProducts]);

  const renderItem = useCallback(({ item, index }) => {
    const isFlashSale = flashSaleProducts.has(item.id);
    const hasFastDelivery = fastDeliveryProducts.has(item.id);

    // Debug için item bilgilerini yazdır
    console.log(`Rendering item ${index}:`, {
      id: item.id,
      name: item.name,
      price: item.price,
      priceType: typeof item.price,
      size: item.size,
      sizeType: typeof item.size,
      hasSize: !!item.size,
      hasPrice: !!item.price
    });

    // Price güvenlik kontrolü
    if (!item.price) {
      console.warn(`Item ${index} has no price:`, item);
    }

    return (
      <View style={[styles.itemContainer, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
        {/* Sol taraf - Ürün kartı */}
        <View style={[styles.productCard, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
          {/* Flash Sale or Best Selling Badge */}
          {isFlashSale ? (
            <View style={styles.flashSaleBadge}>
              <Text style={styles.flashSaleText}>
                {translations.flashSale && typeof translations.flashSale === 'string'
                  ? translations.flashSale.split(' ')[0] || 'Flash'
                  : 'Flash'}
              </Text>
              <Text style={styles.flashSaleText}>
                {translations.flashSale && typeof translations.flashSale === 'string'
                  ? translations.flashSale.split(' ')[1] || 'Sale'
                  : 'Sale'}
              </Text>
            </View>
          ) : (
            <View style={styles.bestSellingBadge}>
              <Text style={styles.bestSellingText}>{translations.bestSellingLine1 || 'Best'}</Text>
              <Text style={styles.bestSellingText}>{translations.bestSellingLine2 || 'Selling'}</Text>
            </View>
          )}

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl(item.frontImagePath || item.frontImageUrl || item.imageUrl || item.image) }}
              style={styles.productImage}
              defaultSource={require('../assets/images/icon.png')}
              onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
            />
          </View>

          {/* Fast Delivery or BestSeller Label */}
          {hasFastDelivery ? (
            <View style={styles.fastDeliveryBadge}>
              <Ionicons name="flash" size={12} color="white" style={styles.deliveryIcon} />
              <Text style={styles.fastDeliveryText}>{translations.fastDelivery || 'Fast Delivery'}</Text>
            </View>
          ) : (
            <View style={styles.bestSellerBadge}>
              <Ionicons name="star" size={12} color="white" style={styles.deliveryIcon} />
              <Text style={styles.bestSellerText}>{translations.bestSeller || 'Best Seller'}</Text>
            </View>
          )}

          <Text style={[styles.productName, { color: isDarkMode ? '#fff' : '#2c3e50' }]} numberOfLines={2}>
            {item.name || 'Ürün Adı'}
          </Text>
        </View>

        {/* Sağ taraf - Ürün detayları ve kontroller */}
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(index)}
            >
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsRow}>
            <Text style={[styles.detailLabel, { color: isDarkMode ? 'white' : "#333" }]}>
              {translations.size || 'Size'}:
            </Text>
            {/* Size değerini görüntüle - eğer yoksa "N/A" göster */}
            <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#333' }]}>
              {item.size || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={[styles.detailLabel, { color: isDarkMode ? 'white' : "#333" }]}>
              {translations.quantity || 'Quantity'}:
            </Text>
            <View style={styles.amountContainer}>
              <TouchableOpacity
                style={styles.amountButton}
                onPress={() => decreaseAmount(index)}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.amountText, { color: isDarkMode ? '#fff' : '#333' }]}>
                {item.amount || 1}
              </Text>
              <TouchableOpacity
                style={styles.amountButton}
                onPress={() => increaseAmount(index)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={[styles.detailLabel, { color: isDarkMode ? 'white' : "#333" }]}>
              {translations.total || 'Total'}:
            </Text>
            <Text style={styles.subtotalValue}>
              {item.price ? (parsePrice(item.price) * (item.amount || 1)).toFixed(2) : '0.00'} ₺
            </Text>
          </View>
        </View>
      </View>
    );
  }, [flashSaleProducts, fastDeliveryProducts, decreaseAmount, increaseAmount, removeFromCart, translations, isDarkMode, getImageUrl]);

  const total = cartItems.reduce((sum, item) => {
    if (!item.price) {
      console.warn('Cart item has no price:', item);
      return sum;
    }
    const price = parsePrice(item.price);
    const amount = item.amount || 1;
    return sum + (price * amount);
  }, 0);

  if (total === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDarkMode ? theme.background : '#f8f9fa' }]}>
        <Image style={styles.image} source={require("../assets/images/abandoned-cart.png")} />
        <Text style={[styles.emptyTitle, { color: isDarkMode ? '#fff' : '#333' }]}>{translations.yourCartEmpty || 'Your Cart is Empty'}</Text>
        <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>{translations.noItemsInCart || 'No items in your cart'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="storefront-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>{translations.continueShopping || 'Continue Shopping'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#f8f9fa' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>{translations.cart || 'Cart'}</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item, index) => item.id + index + language}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        extraData={language}
      />
      <View style={[styles.checkoutContainer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff' }]}>
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>{translations.totalAmount || 'Total Amount'}</Text>
          <Text style={[styles.total, { color: '#FF8C00' }]}>{total.toFixed(2)} ₺</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => { navigation.navigate("Payment") }}
        >
          <Ionicons name="card-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.checkoutButtonText}>{translations.proceedToPayment || 'Proceed to Payment'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#f8f9fa',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: 220,
    height: 50,
    backgroundColor: "#ce6302",
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  itemContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  productCard: {
    backgroundColor: '#fff',
    width: 130,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginRight: 16,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
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
  productName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
    color: '#2c3e50',
    lineHeight: 20,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingVertical: 8
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 5
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 4,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  subtotalValue: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  checkoutContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  totalContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  checkoutButton: {
    backgroundColor: "#d27c2e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});