import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Search from '../screens/Search';
import { Ionicons } from '@expo/vector-icons';
import Cart from '../screens/Cart';
import Favorites from '../screens/Favorites';
import Account from '../screens/Account';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Tab = createBottomTabNavigator();

export default function BottomTab() {
    const { theme, isDarkMode } = useTheme();
    const { translations } = useLanguage();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#ce6302',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: isDarkMode ? theme.surface : '#fff',
                },
                headerShown: false, // Tüm tab'lar için header'ı gizle
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarLabel: translations.home,
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Search"
                component={Search}
                options={{
                    tabBarLabel: "Arama",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'search' : 'search-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={Favorites}
                options={{
                    tabBarLabel: translations.favorites,
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'heart' : 'heart-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Cart"
                component={Cart}
                options={{
                    tabBarLabel: translations.cart,
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'cart' : 'cart-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Account"
                component={Account}
                options={{
                    tabBarLabel: translations.account,
                    headerShown: false, // Account için özel olarak header'ı gizle
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
