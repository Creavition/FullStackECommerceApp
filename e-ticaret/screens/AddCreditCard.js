import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { creditCardApi } from '../utils/creditCardApi';

export default function AddCreditCard() {
    const navigation = useNavigation();
    const { theme, isDarkMode } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    // Yeni kart form state'leri
    const [newCard, setNewCard] = useState({
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardTitle: ''
    });

    // Yeni kart ekleme fonksiyonu
    const addCreditCard = async () => {
        if (!newCard.cardNumber || !newCard.cardHolderName || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
            return;
        }

        // Ay ve yıl doğrulaması
        const month = parseInt(newCard.expiryMonth);
        const year = parseInt(newCard.expiryYear);

        if (month < 1 || month > 12) {
            Alert.alert('Hata', 'Ay 01-12 arasında olmalıdır');
            return;
        }

        if (year < 25 || year > 35) {
            Alert.alert('Hata', 'Yıl 25-35 arasında olmalıdır');
            return;
        }

        setIsLoading(true);

        try {
            const cardData = {
                cardNumber: newCard.cardNumber,
                cardHolderName: newCard.cardHolderName,
                expiryMonth: newCard.expiryMonth.padStart(2, '0'), // 2 haneli format
                expiryYear: newCard.expiryYear.padStart(2, '0'),   // 2 haneli format
                cvv: newCard.cvv,
                cardTitle: newCard.cardTitle || 'Kartım'
            };

            await creditCardApi.addCreditCard(cardData);
            Alert.alert('Başarılı', 'Kredi kartı başarıyla eklendi', [
                {
                    text: 'Tamam',
                    onPress: () => navigation.goBack()
                }
            ]);
        } catch (error) {
            console.error('Error adding credit card:', error);
            Alert.alert('Hata', 'Kredi kartı eklenirken bir hata oluştu');
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
                <Text style={[styles.headerTitle, { color: theme.text }]}>Yeni Kart Ekle</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {/* Kart Başlığı */}
                <Text style={[styles.fieldLabel, { color: theme.text }]}>Kart Başlığı</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="Kartınıza bir isim verin"
                    placeholderTextColor={theme.textSecondary}
                    value={newCard.cardTitle}
                    onChangeText={(text) => setNewCard(prev => ({ ...prev, cardTitle: text }))}
                />

                {/* Kart Numarası */}
                <Text style={[styles.fieldLabel, { color: theme.text }]}>Kart Numarası *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={theme.textSecondary}
                    value={newCard.cardNumber}
                    onChangeText={(text) => setNewCard(prev => ({ ...prev, cardNumber: text }))}
                    keyboardType="numeric"
                    maxLength={19}
                />

                {/* Kart Sahibi Adı */}
                <Text style={[styles.fieldLabel, { color: theme.text }]}>Kart Sahibi Adı *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="Kartın üzerindeki isim"
                    placeholderTextColor={theme.textSecondary}
                    value={newCard.cardHolderName}
                    onChangeText={(text) => setNewCard(prev => ({ ...prev, cardHolderName: text }))}
                />

                {/* Son Kullanma Tarihi */}
                <Text style={[styles.fieldLabel, { color: theme.text }]}>Son Kullanma Tarihi *</Text>
                <View style={styles.rowInput}>
                    <TextInput
                        style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                        placeholder="MM *"
                        placeholderTextColor={theme.textSecondary}
                        value={newCard.expiryMonth}
                        onChangeText={(text) => {
                            // Sadece rakam kabul et ve 2 haneli sınırla
                            const numericText = text.replace(/[^0-9]/g, '');
                            if (numericText.length <= 2) {
                                const monthValue = parseInt(numericText) || 0;
                                if (monthValue <= 12) {
                                    setNewCard(prev => ({ ...prev, expiryMonth: numericText }));
                                }
                            }
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                    />

                    <TextInput
                        style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                        placeholder="YY *"
                        placeholderTextColor={theme.textSecondary}
                        value={newCard.expiryYear}
                        onChangeText={(text) => {
                            // Sadece rakam kabul et ve 2 haneli sınırla
                            const numericText = text.replace(/[^0-9]/g, '');
                            if (numericText.length <= 2) {
                                const yearValue = parseInt(numericText) || 0;
                                if (yearValue >= 25 && yearValue <= 35) {
                                    setNewCard(prev => ({ ...prev, expiryYear: numericText }));
                                } else if (numericText.length === 1 || yearValue === 0) {
                                    // İlk haneli veya 0 ise yazmasına izin ver
                                    setNewCard(prev => ({ ...prev, expiryYear: numericText }));
                                }
                            }
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                    />
                </View>

                {/* CVV */}
                <Text style={[styles.fieldLabel, { color: theme.text }]}>CVV Kodu *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="123"
                    placeholderTextColor={theme.textSecondary}
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard(prev => ({ ...prev, cvv: text }))}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
                    onPress={addCreditCard}
                    disabled={isLoading}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Kaydediliyor...' : 'Kartı Kaydet'}
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
    helpText: {
        fontSize: 14,
        marginBottom: 10,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 10,
    },
});
