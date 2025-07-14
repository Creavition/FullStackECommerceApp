import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarRating from './StarRating';
import { getAuthToken } from '../utils/authStorage';

const { width } = Dimensions.get('window');

const ReviewModal = ({ visible, onClose, product, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setRating(0);
        setComment('');
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Hata', 'Lütfen bir puan verin.');
            return;
        }

        if (comment.trim().length === 0) {
            Alert.alert('Hata', 'Lütfen bir yorum yazın.');
            return;
        }

        if (comment.length > 1000) {
            Alert.alert('Hata', 'Yorum en fazla 1000 karakter olabilir.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Token'ı authStorage utility'sinden al
            const token = await getAuthToken();

            console.log('Token found:', token ? 'Yes' : 'No');
            console.log('Token value:', token ? token.substring(0, 50) + '...' : 'null');

            if (!token) {
                Alert.alert('Hata', 'Lütfen giriş yapın ve tekrar deneyin.');
                setIsSubmitting(false);
                return;
            }

            // Token formatını kontrol et
            if (typeof token !== 'string' || token.length < 10) {
                Alert.alert('Hata', 'Geçersiz oturum. Lütfen tekrar giriş yapın.');
                setIsSubmitting(false);
                return;
            }

            console.log('Making review request to:', 'http://192.168.1.3:5207/api/Review');
            console.log('Request body:', {
                productId: product.id,
                rating: rating,
                comment: comment.trim(),
            });

            const response = await fetch('http://192.168.1.3:5207/api/Review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: product.id,
                    rating: rating,
                    comment: comment.trim(),
                }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                Alert.alert(
                    'Başarılı',
                    'Yorumunuz başarıyla gönderildi!',
                    [
                        {
                            text: 'Tamam',
                            onPress: () => {
                                resetForm();
                                onClose();
                                if (onReviewSubmitted) {
                                    onReviewSubmitted();
                                }
                            },
                        },
                    ]
                );
            } else {
                const errorData = await response.json();
                console.log('Error response:', errorData);

                if (response.status === 401) {
                    Alert.alert('Hata', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
                } else {
                    Alert.alert('Hata', errorData.message || 'Yorum gönderilemedi.');
                }
            }
        } catch (error) {
            console.error('Review submission error:', error);
            Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Ürünü Değerlendir</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    {product && (
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                        </View>
                    )}

                    <View style={styles.ratingSection}>
                        <Text style={styles.sectionTitle}>Puanınız</Text>
                        <View style={styles.starRatingContainer}>
                            <StarRating
                                rating={rating}
                                onRatingChange={setRating}
                                size={36}
                                showRating={false}
                            />
                            <Text style={styles.ratingDescription}>
                                {rating === 0 && 'Puan verin'}
                                {rating === 1 && 'Çok Kötü'}
                                {rating === 2 && 'Kötü'}
                                {rating === 3 && 'Orta'}
                                {rating === 4 && 'İyi'}
                                {rating === 5 && 'Mükemmel'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.commentSection}>
                        <Text style={styles.sectionTitle}>Yorumunuz</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Bu ürün hakkındaki düşüncelerinizi paylaşın..."
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            numberOfLines={4}
                            maxLength={1000}
                            textAlignVertical="top"
                        />
                        <Text style={styles.characterCount}>
                            {comment.length}/1000 karakter
                        </Text>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleClose}
                    >
                        <Text style={styles.cancelButtonText}>İptal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.submitButton,
                            (rating === 0 || comment.trim().length === 0 || isSubmitting) && styles.disabledButton,
                        ]}
                        onPress={handleSubmit}
                        disabled={rating === 0 || comment.trim().length === 0 || isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666666',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    productInfo: {
        marginBottom: 30,
        padding: 15,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
    },
    ratingSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 15,
    },
    starRatingContainer: {
        alignItems: 'center',
    },
    ratingDescription: {
        fontSize: 16,
        color: '#666666',
        marginTop: 10,
        fontWeight: '500',
    },
    commentSection: {
        marginBottom: 30,
    },
    commentInput: {
        borderWidth: 2,
        borderColor: '#000000',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        height: 120,
        backgroundColor: '#FAFAFA',
    },
    characterCount: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'right',
        marginTop: 5,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        gap: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    cancelButtonText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#FF8C00',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
});

export default ReviewModal;
