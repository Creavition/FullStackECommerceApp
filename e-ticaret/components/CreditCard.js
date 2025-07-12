import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ImageBackground } from 'react-native';


export default function CreditCard() {
    const [name, setName] = useState("");
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isBackView, setIsBackView] = useState(false);

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
        <View style={styles.container}>
            <View style={{ alignItems: "center" }}>
                <ImageBackground
                    source={
                        isBackView
                            ? require('../assets/images/mavi.png')  // kartın arka yüzü
                            : require('../assets/images/mavi.png')  // kartın ön yüzü
                    }
                    resizeMode="cover"
                    style={styles.card}
                    imageStyle={{ borderRadius: 16 }}
                >
                    {isBackView ? (
                        <View style={styles.backContent}>
                            <Text style={styles.cvvValue}>{cvv || '***'}</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.cardTitle}>CREDIT CARD</Text>
                            <Text style={styles.cardText}>
                                {cardNumber || '**** **** **** ****'}
                            </Text>
                            <View style={styles.row}>
                                <Text style={{ color: 'white' }}>{name || "Name Surname"}</Text>
                                <Text style={{ color: 'white' }}>{expiry || "MM/YY"}</Text>
                            </View>
                        </>
                    )}
                </ImageBackground>
            </View>


            <TextInput
                style={styles.input}
                placeholder="Name Surname"
                keyboardType="default"
                autoCapitalize='words'
                onChangeText={(text) => setName(text)}
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
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    card: {
        width: 320,
        height: 200,
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        justifyContent: 'space-between'
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
