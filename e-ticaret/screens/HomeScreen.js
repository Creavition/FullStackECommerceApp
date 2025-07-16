import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Home';
import Search from './Search';
import { Ionicons } from '@expo/vector-icons';
import Cart from './Cart';
import Favorites from './Favorites';
import Account from './Account';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  const { theme, isDarkMode } = useTheme();
  const { cartItems } = useCart();
  const { favoriteItems } = useFavorites();

  // favoriteItems object'ini array'e çevir ve sadece true olanları say
  const favoriteCount = Object.values(favoriteItems).filter(Boolean).length;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ce6302',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: isDarkMode ? theme.surface : '#fff',
        },
        headerShown: false,
      }}
      screenListeners={({ navigation, route }) => ({
        tabPress: (e) => {
          // Home tab'a basıldığında, sadece gerektiğinde navigation stack'i temizle
          if (route.name === 'Home') {
            const parentNavigation = navigation.getParent();
            if (parentNavigation) {
              const state = parentNavigation.getState();
              // Sadece ana stack'te birden fazla route varsa temizle
              if (state && state.routes && state.routes.length > 1) {
                // Mevcut route HomeScreen değilse HomeScreen'e git
                const currentRoute = state.routes[state.index];
                if (currentRoute.name !== 'HomeScreen') {
                  parentNavigation.navigate('HomeScreen');
                }
              }
            }
          }
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size || 24}
              color={color || '#ce6302'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarLabel: 'Ara',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size || 24}
              color={color || '#ce6302'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={Favorites}
        options={{
          tabBarLabel: 'Favoriler',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={size || 24}
              color={color || '#ce6302'}
            />
          ),
          tabBarBadge: favoriteCount > 0 ? favoriteCount : null,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarLabel: 'Sepet',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={size || 24}
              color={color || '#ce6302'}
            />
          ),
          tabBarBadge: cartItems.length > 0 ? cartItems.length : null,
        }}
      />
      <Tab.Screen
        name="Account"
        component={Account}
        options={{
          tabBarLabel: 'Hesap',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size || 24}
              color={color || '#ce6302'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}