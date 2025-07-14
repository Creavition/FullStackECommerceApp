import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { addressApi } from '../utils/addressApi';

export default function EditAddress() {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme, isDarkMode } = useTheme();
    const { addressId } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(true);

    // Adres form state'leri
    const [addressData, setAddressData] = useState({
        title: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        district: '',
        postalCode: ''
    });

    // Adres bilgilerini yükle
    useEffect(() => {
        loadAddressData();
    }, []);

    const loadAddressData = async () => {
        try {
            const address = await addressApi.getAddressById(addressId);
            setAddressData({
                title: address.title || '',
                phoneNumber: address.phoneNumber || '',
                addressLine1: address.addressLine1 || '',
                addressLine2: address.addressLine2 || '',
                city: address.city || '',
                district: address.district || '',
                postalCode: address.postalCode || ''
            });
        } catch (error) {
            console.error('Error loading address data:', error);
            Alert.alert('Hata', 'Adres bilgileri yüklenemedi');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // Adres güncelleme fonksiyonu
    const updateAddress = async () => {
        if (!addressData.title || !addressData.phoneNumber || !addressData.addressLine1 || !addressData.city || !addressData.district) {
            Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun');
            return;
        }

        setIsLoading(true);

        try {
            const updateData = {
                title: addressData.title,
                phoneNumber: addressData.phoneNumber,
                addressLine1: addressData.addressLine1,
                addressLine2: addressData.addressLine2,
                city: addressData.city,
                district: addressData.district,
                postalCode: addressData.postalCode
            };

            await addressApi.updateAddress(addressId, updateData);
            Alert.alert('Başarılı', 'Adres başarıyla güncellendi', [
                {
                    text: 'Tamam',
                    onPress: () => navigation.goBack()
                }
            ]);
        } catch (error) {
            console.error('Error updating address:', error);
            Alert.alert('Hata', 'Adres güncellenirken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    // Adres silme fonksiyonu
    const deleteAddress = async () => {
        Alert.alert(
            'Adresi Sil',
            'Bu adresi silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await addressApi.deleteAddress(addressId);
                            Alert.alert('Başarılı', 'Adres başarıyla silindi', [
                                {
                                    text: 'Tamam',
                                    onPress: () => navigation.goBack()
                                }
                            ]);
                        } catch (error) {
                            console.error('Error deleting address:', error);
                            Alert.alert('Hata', 'Adres silinirken bir hata oluştu');
                        }
                    },
                },
            ]
        );
    };

    if (isLoadingAddress) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <Text style={[styles.loadingText, { color: theme.text }]}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Adres Düzenle</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                    placeholder="Adres Başlığı *"
                    placeholderTextColor={theme.textSecondary}
                    value={addressData.title}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, title: text }))}
                />

                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                    placeholder="05325674356"
                    placeholderTextColor={theme.textSecondary}
                    value={addressData.phoneNumber}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, phoneNumber: text }))}
                    keyboardType="phone-pad"
                />

                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                    placeholder="Adres Satırı 1 *"
                    placeholderTextColor={theme.textSecondary}
                    value={addressData.addressLine1}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, addressLine1: text }))}
                    multiline
                    numberOfLines={3}
                />

                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                    placeholder="Adres Satırı 2"
                    placeholderTextColor={theme.textSecondary}
                    value={addressData.addressLine2}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, addressLine2: text }))}
                    multiline
                    numberOfLines={2}
                />

                <View style={styles.rowInput}>
                    <TextInput
                        style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                        placeholder="İl *"
                        placeholderTextColor={theme.textSecondary}
                        value={addressData.city}
                        onChangeText={(text) => setAddressData(prev => ({ ...prev, city: text }))}
                    />

                    <TextInput
                        style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                        placeholder="İlçe *"
                        placeholderTextColor={theme.textSecondary}
                        value={addressData.district}
                        onChangeText={(text) => setAddressData(prev => ({ ...prev, district: text }))}
                    />
                </View>

                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                    placeholder="Posta Kodu"
                    placeholderTextColor={theme.textSecondary}
                    value={addressData.postalCode}
                    onChangeText={(text) => setAddressData(prev => ({ ...prev, postalCode: text }))}
                    keyboardType="numeric"
                    maxLength={5}
                />

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
                    onPress={updateAddress}
                    disabled={isLoading}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Güncelleniyor...' : 'Adresi Güncelle'}
                    </Text>
                </TouchableOpacity>

                {/* Silme Butonu */}
                <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: theme.primary }]}
                    onPress={deleteAddress}
                >
                    <Ionicons name="trash" size={20} color="white" />
                    <Text style={styles.deleteButtonText}>Adresi Sil</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingTop: 50,
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 34,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    rowInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    saveButton: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 30,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
