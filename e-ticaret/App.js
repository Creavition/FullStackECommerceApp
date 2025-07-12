import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

// Screens
import Login from "./screens/Login";
import Register from './screens/Register';
import HomeScreen from './screens/HomeScreen';
import ProductDetail from './screens/ProductDetail';
import Payment from './screens/Payment';
import Filter from './screens/Filter';
import Home from './screens/Home';
import OrderHistory from './screens/OrderHistory';
import ChangePassword from './screens/ChangePassword';
import FastDelivery from './screens/FastDelivery';
import FlashSale from './screens/FlashSale';
import BestSeller from './screens/BestSeller';

// Splash Screen
import SplashScreen
 from './contexts/SplashScreen'; // Splash screen dosyanızın yolu

// Contexts
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { FilterProvider } from './contexts/FilterContext';
import { OrderProvider } from './contexts/OrderContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

const Stack = createNativeStackNavigator();

// Create a separate component for the navigation stack
function AppNavigator() {
  const { translations, language } = useLanguage();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: translations.login, headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ title: translations.register, headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: translations.home, headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: translations.home, headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetail}
          options={{ title: translations.productDetail, headerShown: false }}
        />
        <Stack.Screen
          name="Payment"
          component={Payment}
          options={{ title: translations.payment, headerShown: false }}
        />
        <Stack.Screen
          name="Filter"
          component={Filter}
          options={{ title: translations.filter, headerShown: false }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistory}
          options={{ title: translations.orderHistory, headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{ title: translations.changePassword, headerShown: false }}
        />
        <Stack.Screen
          name="FastDelivery"
          component={FastDelivery}
          options={{ title: 'Fast Delivery', headerShown: false }}
        />
        <Stack.Screen
          name="FlashSale"
          component={FlashSale}
          options={{ title: 'Flash Sale', headerShown: false }}
        />
        <Stack.Screen
          name="BestSeller"
          component={BestSeller}
          options={{ title: 'BestSeller', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen'i belirli bir süre sonra gizlemek için
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000); // 4 saniye sonra gizle

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <OrderProvider>
          <FilterProvider>
            <ProductProvider>
              <CartProvider>
                <FavoritesProvider>
                  {showSplash ? (
                    <SplashScreen
                      onAnimationEnd={() => setShowSplash(false)}
                    />
                  ) : (
                    <AppNavigator />
                  )}
                </FavoritesProvider>
              </CartProvider>
            </ProductProvider>
          </FilterProvider>
        </OrderProvider>
      </LanguageProvider>
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
