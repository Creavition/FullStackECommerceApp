import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const StarRating = ({
    rating = 0,
    maxStars = 5,
    onRatingChange = null,
    disabled = false,
    size = 24,
    showRating = true
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
                            style={styles.starButton}
                        >
                            <FontAwesome
                                name={isFilled ? 'star' : isHalfFilled ? 'star-half-o' : 'star-o'}
                                size={size}
                                color={isFilled || isHalfFilled ? '#FFD700' : '#CCCCCC'}
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
        marginHorizontal: 2,
    },
    ratingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});

export default StarRating;
