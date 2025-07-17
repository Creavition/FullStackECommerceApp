import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { creditCardApi } from '../utils/creditCardApi';

export default function EditCreditCard() {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme, isDarkMode } = useTheme();
    const { cardId } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCard, setIsLoadingCard] = useState(true);

    // Kart form state'leri
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardTitle: ''
    });

    // Kart bilgilerini yükle
    useEffect(() => {
        loadCardData();
    }, []);

    const loadCardData = async () => {
        try {
            const card = await creditCardApi.getCreditCardById(cardId);
            setCardData({
                cardNumber: '', // Kullanıcı tekrar girer
                cardHolderName: card.cardHolderName || '',
                expiryMonth: card.expiryMonth || '',
                expiryYear: card.expiryYear || '',
                cvv: '', // CVV'yi de tekrar girere
                cardTitle: card.cardTitle || ''
            });
        } catch (error) {
            console.error('Error loading card data:', error);
            Alert.alert('Hata', 'Kart bilgileri yüklenemedi');
        } finally {
            setIsLoadingCard(false);
        }
    };

    // Kart güncelleme fonksiyonu
    const updateCreditCard = async () => {
        if (!cardData.cardNumber || !cardData.cardHolderName || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvv) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
            return;
        }

        // Ay ve yıl doğrulaması
        const month = parseInt(cardData.expiryMonth);
        const year = parseInt(cardData.expiryYear);

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
            const updateData = {
                cardNumber: cardData.cardNumber,
                cardHolderName: cardData.cardHolderName,
                expiryMonth: cardData.expiryMonth.padStart(2, '0'), // 2 haneli format
                expiryYear: cardData.expiryYear.padStart(2, '0'),   // 2 haneli format
                cvv: cardData.cvv,
                cardTitle: cardData.cardTitle || 'Kartım'
            };

            await creditCardApi.updateCreditCard(cardId, updateData);
            Alert.alert('Başarılı', 'Kredi kartı başarıyla güncellendi', [
                {
                    text: 'Tamam',
                    onPress: () => navigation.goBack()
                }
            ]);
        } catch (error) {
            console.error('Error updating credit card:', error);
            Alert.alert('Hata', 'Kredi kartı güncellenirken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    // Kart silme fonksiyonu
    const deleteCreditCard = async () => {
        Alert.alert(
            'Kartı Sil',
            'Bu kartı silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await creditCardApi.deleteCreditCard(cardId);
                            Alert.alert('Başarılı', 'Kredi kartı başarıyla silindi', [
                                {
                                    text: 'Tamam',
                                    onPress: () => navigation.goBack()
                                }
                            ]);
                        } catch (error) {
                            console.error('Error deleting credit card:', error);
                            Alert.alert('Hata', 'Kredi kartı silinirken bir hata oluştu');
                        }
                    },
                },
            ]
        );
    };

    if (isLoadingCard) {
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
                <Text style={[styles.headerTitle, { color: theme.text }]}>Kart Düzenle</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                <Text style={[styles.fieldLabel, { color: theme.text }]}>Kart Başlığı</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="Kart Başlığı"
                    placeholderTextColor={theme.textSecondary}
                    value={cardData.cardTitle}
                    onChangeText={(text) => setCardData(prev => ({ ...prev, cardTitle: text }))}
                />

                <Text style={[styles.fieldLabel, { color: theme.text }]}>Kart Numarası *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="Kart Numarası *"
                    placeholderTextColor={theme.textSecondary}
                    value={cardData.cardNumber}
                    onChangeText={(text) => setCardData(prev => ({ ...prev, cardNumber: text }))}
                    keyboardType="numeric"
                    maxLength={19}
                />

                <Text style={[styles.fieldLabel, { color: theme.text }]}>Kart Sahibi Adı *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="Kart Sahibi Adı *"
                    placeholderTextColor={theme.textSecondary}
                    value={cardData.cardHolderName}
                    onChangeText={(text) => setCardData(prev => ({ ...prev, cardHolderName: text }))}
                />

                <Text style={[styles.fieldLabel, { color: theme.text }]}>Son Kullanma Tarihi *</Text>
                <View style={styles.rowInput}>
                    <TextInput
                        style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                        placeholder="MM *"
                        placeholderTextColor={theme.textSecondary}
                        value={cardData.expiryMonth}
                        onChangeText={(text) => {
                            // Sadece rakam kabul et ve 2 haneli sınırla
                            const numericText = text.replace(/[^0-9]/g, '');
                            if (numericText.length <= 2) {
                                const monthValue = parseInt(numericText) || 0;
                                if (monthValue <= 12) {
                                    setCardData(prev => ({ ...prev, expiryMonth: numericText }));
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
                        value={cardData.expiryYear}
                        onChangeText={(text) => {
                            // Sadece rakam kabul et ve 2 haneli sınırla
                            const numericText = text.replace(/[^0-9]/g, '');
                            if (numericText.length <= 2) {
                                const yearValue = parseInt(numericText) || 0;
                                if (yearValue >= 25 && yearValue <= 35) {
                                    setCardData(prev => ({ ...prev, expiryYear: numericText }));
                                } else if (numericText.length === 1 || yearValue === 0) {
                                    // İlk haneli veya 0 ise yazmasına izin ver
                                    setCardData(prev => ({ ...prev, expiryYear: numericText }));
                                }
                            }
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                    />
                </View>

                <Text style={[styles.fieldLabel, { color: theme.text }]}>CVV Kodu *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: isDarkMode ? '#fff' : '#000' }]}
                    placeholder="CVV *"
                    placeholderTextColor={theme.textSecondary}
                    value={cardData.cvv}
                    onChangeText={(text) => setCardData(prev => ({ ...prev, cvv: text }))}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
                    onPress={updateCreditCard}
                    disabled={isLoading}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Güncelleniyor...' : 'Kartı Güncelle'}
                    </Text>
                </TouchableOpacity>

                {/* Silme Butonu */}
                <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: theme.primary }]}
                    onPress={deleteCreditCard}
                >
                    <Ionicons name="trash" size={20} color="white" />
                    <Text style={styles.deleteButtonText}>Kartı Sil</Text>
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
    scrollViewContent: {
        paddingBottom: 100,
    },
    input: {
        borderWidth: 2,
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
    helpText: {
        fontSize: 14,
        marginBottom: 15,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 10,
    },
});
