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
import StarRating from './StarRating';
import { reviewApi } from '../utils/reviewApi';
import { useTheme } from '../contexts/ThemeContext';

const ReviewModal = ({ visible, onClose, product, onReviewSubmitted }) => {
    const { theme } = useTheme();
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
            const reviewData = {
                productId: product.id,
                rating: rating,
                comment: comment.trim(),
            };

            await reviewApi.addReview(reviewData);

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
        } catch (error) {

            if (error.response?.status === 401) {
                Alert.alert('Hata', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            } else if (error.response?.data) {
                Alert.alert('Hata', error.response.data.message || 'Yorum gönderilemedi.');
            } else {
                Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
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
            <View style={[styles.container, { backgroundColor: theme.surface }]}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: theme.borderLight }]}>
                        <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Ürünü Değerlendir</Text>

                </View>

                <ScrollView style={styles.content}>
                    {product && (
                        <View style={[styles.productInfo, { backgroundColor: theme.background }]}>
                            <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
                        </View>
                    )}

                    <View style={styles.ratingSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Puanınız</Text>
                        <View style={styles.starRatingContainer}>
                            <StarRating
                                rating={rating}
                                onRatingChange={setRating}
                                size={36}
                                showRating={false}
                            />
                            <Text style={[styles.ratingDescription, { color: theme.textSecondary }]}>
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
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Yorumunuz</Text>
                        <TextInput
                            style={[styles.commentInput, {
                                borderColor: "black",
                                backgroundColor: theme.background,
                                color: theme.text
                            }]}
                            placeholder={'Bu ürün hakkındaki düşüncelerinizi paylaşın...'}
                            placeholderTextColor={theme.textTertiary}
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            numberOfLines={4}
                            maxLength={1000}
                            textAlignVertical="top"
                        />
                        <Text style={[styles.characterCount, { color: theme.textTertiary }]}>
                            {comment.length}/1000 karakter
                        </Text>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton, { backgroundColor: theme.borderLight }]}
                        onPress={handleClose}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>İptal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.submitButton,
                            { backgroundColor: theme.primary },
                            (rating === 0 || comment.trim().length === 0 || isSubmitting) && [styles.disabledButton, { backgroundColor: theme.textTertiary }],
                        ]}
                        onPress={handleSubmit}
                        disabled={rating === 0 || comment.trim().length === 0 || isSubmitting}
                    >
                        <Text style={[styles.submitButtonText, { color: theme.surface }]}>
                            {isSubmitting ? 'Gönderiliyor' : 'Gönder'}
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingRight: 90
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    productInfo: {
        marginBottom: 30,
        padding: 15,
        borderRadius: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    ratingSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    starRatingContainer: {
        alignItems: 'center',
    },
    ratingDescription: {
        fontSize: 16,
        marginTop: 10,
        fontWeight: '500',
    },
    commentSection: {
        marginBottom: 30,
    },
    commentInput: {
        borderWidth: 2,
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        height: 120,
    },
    characterCount: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 5,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        gap: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        // backgroundColor dinamik olarak ayarlanacak
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        // backgroundColor dinamik olarak ayarlanacak
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        // backgroundColor dinamik olarak ayarlanacak
    },
});

export default ReviewModal;
