import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const StarRating = ({
    rating = 0, //Mevcut Puan
    maxStars = 5, //Max yıldız sayısı
    onRatingChange = null, //Puan degıstıgınde cagrılacak fonksıyon
    disabled = false, // Etkileşim olup olmayacağı
    size = 24,
    showRating = true // Puanı sayfada gosterme
}) => {
    const [tempRating, setTempRating] = useState(0);

    const handleStarPress = (selectedRating) => {
        if (!disabled && onRatingChange) {
            onRatingChange(selectedRating);
        }
    };

    const handleStarPressIn = (selectedRating) => {
        if (!disabled) {
            setTempRating(selectedRating);
        }
    };

    const handleStarPressOut = () => {
        if (!disabled) {
            setTempRating(0);
        }
    };

    const displayRating = tempRating || rating;

    return (
        <View style={styles.container}>
            <View style={styles.starsContainer}>
                {Array.from({ length: maxStars }, (_, index) => {
                    const starRating = index + 1;
                    const isFilled = starRating <= displayRating;
                    const isHalfFilled = starRating - 0.5 <= displayRating && starRating > displayRating;

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleStarPress(starRating)}
                            onPressIn={() => handleStarPressIn(starRating)}
                            onPressOut={handleStarPressOut}
                            disabled={disabled}
                            style={[styles.starButton, {
                                borderRadius: 12,
                                padding: 4,
                                backgroundColor: isFilled || isHalfFilled ? '#FFF8DC' : 'transparent',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.2,
                                shadowRadius: 2,
                                elevation: 2,
                            }]}
                        >
                            <FontAwesome
                                name={isFilled ? 'star' : isHalfFilled ? 'star-half-o' : 'star-o'}
                                size={size}
                                color={isFilled || isHalfFilled ? '#FF8C00' : '#999999'}
                                style={{
                                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                    textShadowOffset: { width: 1, height: 1 },
                                    textShadowRadius: 2,
                                }}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
            {showRating && (
                <Text style={styles.ratingText}>
                    {rating.toFixed(1)} / {maxStars}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starButton: {
        marginHorizontal: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});

export default StarRating;
