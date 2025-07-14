import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { addressApi } from '../utils/addressApi';

export default function AddAddress() {
    const navigation = useNavigation();
    const { theme, isDarkMode } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    // Yeni adres form state'leri
    const [newAddress, setNewAddress] = useState({
        title: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        district: '',
        postalCode: ''
    });

    // Yeni adres ekleme fonksiyonu
    const addAddress = async () => {
        if (!newAddress.title || !newAddress.phoneNumber || !newAddress.addressLine1 || !newAddress.city || !newAddress.district) {
            Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun');
            return;
        }

        setIsLoading(true);

        try {
            const addressData = {
                title: newAddress.title,
                phoneNumber: newAddress.phoneNumber,
                addressLine1: newAddress.addressLine1,
                addressLine2: newAddress.addressLine2,
                city: newAddress.city,
                district: newAddress.district,
                postalCode: newAddress.postalCode
            };

            await addressApi.addAddress(addressData);
            Alert.alert('Başarılı', 'Adres başarıyla eklendi', [
                {
                    text: 'Tamam',
                    onPress: () => navigation.goBack()
                }
            ]);
        } catch (error) {
            console.error('Error adding address:', error);
            Alert.alert('Hata', 'Adres eklenirken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

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
                <Text style={[styles.headerTitle, { color: theme.text }]}>Yeni Adres Ekle</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                <Text style={[styles.fieldLabel, { color: theme.text }]}>Adres Başlığı *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="Ev, İş, Ofis"
                    placeholderTextColor={theme.textSecondary}
                    value={newAddress.title}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, title: text }))}
                />

                <Text style={[styles.fieldLabel, { color: theme.text }]}>Telefon Numarası *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="05325674356"
                    placeholderTextColor={theme.textSecondary}
                    value={newAddress.phoneNumber}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, phoneNumber: text }))}
                    keyboardType="phone-pad"
                />

                <Text style={[styles.fieldLabel, { color: theme.text }]}>Adres Satırı 1 *</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="Mahalle, Sokak, Apartman No"
                    placeholderTextColor={theme.textSecondary}
                    value={newAddress.addressLine1}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, addressLine1: text }))}
                    multiline
                    numberOfLines={3}
                />

                <Text style={[styles.fieldLabel, { color: theme.text }]}>Adres Satırı 2</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="Daire No, Kat (Opsiyonel)"
                    placeholderTextColor={theme.textSecondary}
                    value={newAddress.addressLine2}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, addressLine2: text }))}
                    multiline
                    numberOfLines={2}
                />

                <Text style={[styles.fieldLabel, { color: theme.text }]}>İl ve İlçe *</Text>
                <View style={styles.rowInput}>
                    <TextInput
                        style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                        placeholder="İl *"
                        placeholderTextColor={theme.textSecondary}
                        value={newAddress.city}
                        onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
                    />

                    <TextInput
                        style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                        placeholder="İlçe *"
                        placeholderTextColor={theme.textSecondary}
                        value={newAddress.district}
                        onChangeText={(text) => setNewAddress(prev => ({ ...prev, district: text }))}
                    />
                </View>

                <Text style={[styles.fieldLabel, { color: theme.text }]}>Posta Kodu</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="34000"
                    placeholderTextColor={theme.textSecondary}
                    value={newAddress.postalCode}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, postalCode: text }))}
                    keyboardType="numeric"
                    maxLength={5}
                />

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
                    onPress={addAddress}
                    disabled={isLoading}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Kaydediliyor...' : 'Adresi Kaydet'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    scrollViewContent: {
        paddingBottom: 100,
    },
    input: {
        borderWidth: 2,
        borderColor: '#000',
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
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 10,
    },
});
