import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser, clearCurrentUser } from '../utils/authStorage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { OrderContext } from '../contexts/OrderContext';

export default function Account() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { isDarkMode, toggleTheme, theme } = useTheme();
    const { orderHistory } = useContext(OrderContext);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const userData = await getCurrentUser();
                if (userData) {
                    setUser(userData);
                } else {
                    // Kullanıcı giriş yapmamışsa login sayfasına yönlendirir
                    navigation.replace('Login');
                }
            } catch (error) {
                navigation.replace('Login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigation]);

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinizden emin misiniz?',
            [
                {
                    text: 'İptal',
                    style: 'cancel',
                },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearCurrentUser();
                            navigation.replace('Login');
                        } catch (error) {
                            Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
                        }
                    },
                },
            ]
        );
    };

    const handleOrderHistory = () => {
        const parentNavigation = navigation.getParent();
        if (parentNavigation) {
            parentNavigation.navigate('OrderHistory');
        }
    };

    const handleChangePassword = () => {
        const parentNavigation = navigation.getParent();
        if (parentNavigation) {
            parentNavigation.navigate('ChangePassword');
        }
    };

    const menuItems = [
        {
            id: 'orders',
            title: 'Sipariş Geçmişi',
            icon: 'receipt-outline',
            onPress: handleOrderHistory,
            badge: orderHistory.length > 0 ? orderHistory.length.toString() : null,
        },
        {
            id: 'password',
            title: 'Şifre Değiştir',
            icon: 'lock-closed-outline',
            onPress: handleChangePassword,
        },
        {
            id: 'theme',
            title: 'Tema',
            icon: isDarkMode ? 'moon' : 'moon-outline',
            onPress: toggleTheme,
            rightText: isDarkMode ? 'Karanlık Mod' : 'Açık Mod',
        },
        {
            id: 'logout',
            title: 'Çıkış Yap',
            icon: 'log-out-outline',
            onPress: handleLogout,
            isDestructive: true,
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
                translucent={false}
            />

            {loading ? (
                <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.text }]}>Yükleniyor</Text>
                </View>
            ) : !user ? (
                <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                    <Text style={[styles.loadingText, { color: theme.text }]}>Kullanıcı bulunamadı</Text>
                </View>
            ) : (
                <ScrollView style={{ backgroundColor: theme.background }}>
                    {/* Profile Section - üst padding eklendi */}
                    <View style={[styles.profileSection, { backgroundColor: theme.surface }]}>
                        <View style={styles.profileImageContainer}>
                            {/* Icon-based profile placeholder */}
                            <View style={[styles.profileImage, { backgroundColor: theme.border }]}>
                                <Ionicons name="person" size={50} color={theme.textTertiary} />
                            </View>
                            <View style={styles.profileImageOverlay}>
                                <Ionicons name="camera" size={20} color="#fff" />
                            </View>
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={[styles.userName, { color: theme.text }]}>Hoşgeldin {user.name}</Text>
                        </View>
                    </View>

                    {/* User Info Card */}
                    <View style={[styles.infoCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
                        <View style={[styles.infoHeader, { borderBottomColor: theme.border }]}>
                            <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
                            <Text style={[styles.infoTitle, { color: theme.text }]}>Kişisel Bilgiler</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Ad Soyad:</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>{user.name}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>E-posta:</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>{user.email}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Uye Olma Tarihi:</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>{new Date().getFullYear()}</Text>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <View style={[styles.menuContainer, { backgroundColor: theme.background }]}>
                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.menuItem,
                                    { backgroundColor: theme.surface },
                                    item.isDestructive && styles.destructiveMenuItem
                                ]}
                                onPress={item.onPress}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Ionicons
                                        name={item.icon}
                                        size={24}
                                        color={item.isDestructive ? theme.error : theme.text}
                                    />
                                    <Text style={[
                                        styles.menuItemText,
                                        { color: theme.text },
                                        item.isDestructive && styles.destructiveMenuText
                                    ]}>
                                        {item.title}
                                    </Text>
                                </View>

                                <View style={styles.menuItemRight}>
                                    {item.badge && (
                                        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                                            <Text style={[styles.badgeText, { color: theme.surface }]}>{item.badge}</Text>
                                        </View>
                                    )}
                                    {item.rightText && (
                                        <Text style={[styles.rightText, { color: theme.textSecondary }]}>{item.rightText}</Text>
                                    )}
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="black"
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    // header style'ı tamamen kaldırıldı
    headerTitle: {
        // Bu style artık kullanılmıyor
    },
    profileSection: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 40, // Üst padding artırıldı
        paddingVertical: 30,
        marginBottom: 20,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1.5,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'orange',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    profileInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
    },
    infoCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    menuContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    menuItem: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 1,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    destructiveMenuItem: {
        borderLeftWidth: 4,
        borderLeftColor: '#ff4444',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
        fontWeight: '500',
    },
    destructiveMenuText: {
        color: '#ff4444',
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: 'orange',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    rightText: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
    },
    appInfoText: {
        fontSize: 14,
        color: '#999',
        marginBottom: 5,
    },
});