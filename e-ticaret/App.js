import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

// Screens
import Login from "./screens/Login";
import Register from './screens/Register';
import HomeScreen from './screens/HomeScreen';
import ProductDetail from './screens/ProductDetail';
import Payment from './screens/Payment';
import OrderHistory from './screens/OrderHistory';
import Filter from './screens/Filter';
import BestSeller from './screens/BestSeller';
import FlashSale from './screens/FlashSale';
import FastDelivery from './screens/FastDelivery';
import ChangePassword from './screens/ChangePassword';
import ProductReviews from './screens/ProductReviews';
import AddCreditCard from './screens/AddCreditCard';
import AddAddress from './screens/AddAddress';
import EditCreditCard from './screens/EditCreditCard';
import EditAddress from './screens/EditAddress';

// Splash Screen
import SplashScreen
  from './contexts/SplashScreen'; // Splash screen dosyanızın yolu

// Contexts
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { FilterProvider } from './contexts/FilterContext';
import { OrderProvider } from './contexts/OrderContext';
import { ThemeProvider } from './contexts/ThemeContext';

const Stack = createNativeStackNavigator();


const AppNavigator = React.memo(function AppNavigator() {
  const screenOptions = React.useMemo(() => ({
    headerShown: false,
    gestureEnabled: true,
    presentation: 'card',
    animationTypeForReplace: 'push'
  }), []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: 'Giriş Yap', headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ title: 'Kayıt Ol', headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: 'Ana Sayfa', headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetail}
          options={{ title: 'Ürün Detayı', headerShown: false }}
        />
        <Stack.Screen
          name="Payment"
          component={Payment}
          options={{ title: 'Ödeme', headerShown: false }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistory}
          options={{ title: 'Sipariş Geçmişi', headerShown: false }}
        />
        <Stack.Screen
          name="Filter"
          component={Filter}
          options={{ title: 'Filtrele', headerShown: false }}
        />
        <Stack.Screen
          name="BestSeller"
          component={BestSeller}
          options={{ title: 'En Çok Satanlar', headerShown: false }}
        />
        <Stack.Screen
          name="FlashSale"
          component={FlashSale}
          options={{ title: 'Fırsat Ürünleri', headerShown: false }}
        />
        <Stack.Screen
          name="FastDelivery"
          component={FastDelivery}
          options={{ title: 'Hızlı Teslimat', headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{ title: 'Şifre Değiştir', headerShown: false }}
        />
        <Stack.Screen
          name="ProductReviews"
          component={ProductReviews}
          options={{ title: 'Ürün Değerlendirmeleri', headerShown: false }}
        />
        <Stack.Screen
          name="AddCreditCard"
          component={AddCreditCard}
          options={{ title: 'Kredi Kartı Ekle', headerShown: false }}
        />
        <Stack.Screen
          name="AddAddress"
          component={AddAddress}
          options={{ title: 'Adres Ekle', headerShown: false }}
        />
        <Stack.Screen
          name="EditCreditCard"
          component={EditCreditCard}
          options={{ title: 'Kredi Kartı Düzenle', headerShown: false }}
        />
        <Stack.Screen
          name="EditAddress"
          component={EditAddress}
          options={{ title: 'Adres Düzenle', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen callback'ini useCallback ile optimize et
  const handleSplashEnd = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Splash screen'i belirli bir süre sonra gizlemek için
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000); // 4 saniye sonra gizle

    return () => clearTimeout(timer);
  }, []);

  // Context provider'ları her zaman aynı sırada render et
  const appContent = useMemo(() => {
    if (showSplash) {
      return (
        <SplashScreen
          onAnimationEnd={handleSplashEnd}
        />
      );
    }
    return <AppNavigator />;
  }, [showSplash, handleSplashEnd]);

  return (
    <ThemeProvider>
      <OrderProvider>
        <FilterProvider>
          <ProductProvider>
            <CartProvider>
              <FavoritesProvider>
                {appContent}
              </FavoritesProvider>
            </CartProvider>
          </ProductProvider>
        </FilterProvider>
      </OrderProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
