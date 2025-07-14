import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ImageBackground } from 'react-native';

export default function CreditCard({ cardData, isSelected, isEditable = true }) {
    // Eğer cardData prop'u varsa onu kullan, yoksa local state kullan
    const [name, setName] = useState(cardData?.holderName || "");
    const [cardNumber, setCardNumber] = useState(cardData?.number || '');
    const [expiry, setExpiry] = useState(cardData?.expiry || '');
    const [cvv, setCvv] = useState('');
    const [isBackView, setIsBackView] = useState(false);

    // cardData varsa o verileri kullan (read-only mode)
    const displayName = cardData?.holderName || name;
    const displayCardNumber = cardData?.number || cardNumber || '**** **** **** ****';
    const displayExpiry = cardData?.expiry || expiry;
    const displayTitle = cardData?.title || 'CREDIT CARD';

    const handleCardNumberChange = (text) => {
        const cleaned = text.replace(/\D/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join('-') || '';
        setCardNumber(formatted);
    };

    const handleExpiryChange = (text) => {
        const cleaned = text.replace(/[^\d]/g, '');
        let formatted = '';
        if (cleaned.length <= 2) {
            formatted = cleaned;
        } else {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        setExpiry(formatted);
    };

    return (
        <View style={[styles.container, isSelected && styles.selectedContainer]}>
            <View style={{ alignItems: "center" }}>
                <ImageBackground
                    source={
                        isBackView
                            ? require('../assets/images/mavi.png')  // kartın arka yüzü
                            : require('../assets/images/mavi.png')  // kartın ön yüzü
                    }
                    resizeMode="cover"
                    style={[styles.card, isSelected && styles.selectedCard]}
                    imageStyle={{ borderRadius: 16 }}
                >
                    {isBackView ? (
                        <View style={styles.backContent}>
                            <Text style={styles.cvvValue}>{cvv || '***'}</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.cardTitle}>{displayTitle}</Text>
                            <Text style={styles.cardText}>
                                {displayCardNumber}
                            </Text>
                            <View style={styles.cardInfo}>
                                <View>
                                    <Text style={styles.cardLabel}>CARD HOLDER</Text>
                                    <Text style={styles.cardValue}>{displayName || 'CARD HOLDER'}</Text>
                                </View>
                                <View>
                                    <Text style={styles.cardLabel}>EXPIRES</Text>
                                    <Text style={styles.cardValue}>{displayExpiry || 'MM/YY'}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </ImageBackground>
            </View>

            {/* Sadece düzenlenebilir modda input'ları göster */}
            {isEditable && !cardData && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Name Surname"
                        keyboardType="default"
                        autoCapitalize='words'
                        onChangeText={(text) => setName(text)}
                        value={name}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Card Number"
                        keyboardType="numeric"
                        maxLength={19}
                        value={cardNumber}
                        onChangeText={handleCardNumberChange}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Expiry (MM/YY)"
                        maxLength={5}
                        keyboardType='numeric'
                        value={expiry}
                        onChangeText={handleExpiryChange}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="CVV"
                        maxLength={3}
                        keyboardType="numeric"
                        onFocus={() => setIsBackView(true)}
                        onBlur={() => setIsBackView(false)}
                        onChangeText={(text) => setCvv(text)}
                        value={cvv}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    selectedContainer: {
        backgroundColor: '#f0f8ff',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 12,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    card: {
        width: 300,
        height: 180,
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        justifyContent: 'space-between'
    },
    selectedCard: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 22,
        color: '#fff',
        letterSpacing: 2,
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    cardLabel: {
        color: '#fff',
        fontSize: 10,
        opacity: 0.7,
        marginBottom: 4,
    },
    cardValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: "space-between"
    },
    input: {
        height: 50,
        backgroundColor: '#f0f0f0',
        marginVertical: 10,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    backContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
    },

    cvvValue: {
        color: '#fff',
        fontSize: 18,
        backgroundColor: '#00000055',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    }
});
