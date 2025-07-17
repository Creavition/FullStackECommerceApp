import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import StarRating from '../components/StarRating';
import { useTheme } from '../contexts/ThemeContext';
import { reviewApi } from '../utils/reviewApi';

const ProductReviews = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { product, productId } = route.params;
    const { isDarkMode } = useTheme();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reviewStats, setReviewStats] = useState(null);

    const fetchReviews = async () => {
        try {
            const data = await reviewApi.getProductReviews(productId);
            setReviews(data.reviews || []);
            setReviewStats({
                averageRating: data.averageRating || 0,
                totalReviews: data.totalReviews || 0,
                productName: data.productName || product?.name || 'Ürün',
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            Alert.alert('Hata', 'Değerlendirmeler yüklenemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchReviewStats = async () => {
        try {
            const data = await reviewApi.getProductReviewStats(productId);
            setReviewStats(prev => ({
                ...prev,
                ...data,
                ratingDistribution: data.ratingDistribution || {},
            }));
        } catch (error) {
            console.error('Error fetching review stats:', error);
        }
    };

    useEffect(() => {
        fetchReviews();
        fetchReviewStats();
    }, [productId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReviews();
        fetchReviewStats();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderRatingDistribution = () => {
        if (!reviewStats?.ratingDistribution) return null;

        return (
            <View style={styles.distributionContainer}>
                <Text style={[styles.distributionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Puan Dağılımı
                </Text>
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewStats.ratingDistribution[star] || 0;
                    const percentage = reviewStats.totalReviews > 0
                        ? (count / reviewStats.totalReviews) * 100
                        : 0;

                    return (
                        <View key={star} style={styles.distributionRow}>
                            <Text style={[styles.starLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>
                                {star} yıldız
                            </Text>
                            <View style={styles.distributionBar}>
                                <View
                                    style={[
                                        styles.distributionFill,
                                        { width: `${percentage}%` }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.distributionCount, { color: isDarkMode ? '#aaa' : '#666' }]}>
                                {count}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderReviewItem = ({ item: review, index }) => (
        <View
            key={review.id || index}
            style={[
                styles.reviewItem,
                {
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                    borderColor: isDarkMode ? '#444' : '#e9ecef',
                }
            ]}
        >
            <View style={styles.reviewHeader}>
                <View style={styles.reviewUserInfo}>
                    <Text style={[styles.reviewUserName, { color: isDarkMode ? '#fff' : '#000' }]}>
                        {review.userName || 'Anonim'}
                    </Text>
                    <Text style={[styles.reviewDate, { color: isDarkMode ? '#aaa' : '#666' }]}>
                        {formatDate(review.createdAt)}
                    </Text>
                </View>
                <StarRating
                    rating={review.rating}
                    disabled={true}
                    size={16}
                    showRating={false}
                />
            </View>
            {review.comment && (
                <Text style={[styles.reviewComment, { color: isDarkMode ? '#ddd' : '#333' }]}>
                    {review.comment}
                </Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }]}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Değerlendirmeler yükleniyor...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }]}>
            <View style={[styles.header, { borderBottomColor: isDarkMode ? '#333' : '#e9ecef' }]}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Değerlendirmeler
                </Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007BFF']}
                        tintColor={isDarkMode ? '#fff' : '#007BFF'}
                    />
                }
            >
                {/* Ürün Başlığı */}
                <View style={styles.productHeader}>
                    <Text style={[styles.productName, { color: isDarkMode ? '#fff' : '#000' }]}>
                        {reviewStats?.productName}
                    </Text>
                </View>

                {/* Ortalama Rating */}
                {reviewStats && (
                    <View style={[styles.summaryContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }]}>
                        <View style={styles.averageRatingContainer}>
                            <Text style={[styles.averageRating, { color: isDarkMode ? '#fff' : '#000' }]}>
                                {reviewStats.averageRating.toFixed(1)}
                            </Text>
                            <StarRating
                                rating={reviewStats.averageRating}
                                disabled={true}
                                size={24}
                                showRating={false}
                            />
                            <Text style={[styles.totalReviews, { color: isDarkMode ? '#aaa' : '#666' }]}>
                                {reviewStats.totalReviews} değerlendirme
                            </Text>
                        </View>

                        {renderRatingDistribution()}
                    </View>
                )}

                {/* Değerlendirmeler Listesi */}
                <View style={styles.reviewsContainer}>
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => renderReviewItem({ item: review, index }))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={48}
                                color={isDarkMode ? '#666' : '#ccc'}
                            />
                            <Text style={[styles.emptyText, { color: isDarkMode ? '#aaa' : '#666' }]}>
                                Henüz değerlendirme yapılmamış
                            </Text>
                            <Text style={[styles.emptySubText, { color: isDarkMode ? '#666' : '#999' }]}>
                                Bu ürün için ilk değerlendirmeyi siz yapın!
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 50,
        borderBottomWidth: 1,
    },
    headerButton: {
        padding: 8,
        width: 40,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    productHeader: {
        padding: 20,
        alignItems: 'center',
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    summaryContainer: {
        margin: 16,
        padding: 20,
        borderRadius: 12,
    },
    averageRatingContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    averageRating: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    totalReviews: {
        fontSize: 14,
        marginTop: 8,
    },
    distributionContainer: {
        marginTop: 20,
    },
    distributionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    distributionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    starLabel: {
        width: 60,
        fontSize: 14,
    },
    distributionBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#e9ecef',
        borderRadius: 4,
        marginHorizontal: 12,
        overflow: 'hidden',
    },
    distributionFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 4,
    },
    distributionCount: {
        width: 30,
        textAlign: 'right',
        fontSize: 14,
    },
    reviewsContainer: {
        padding: 16,
    },
    reviewItem: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    reviewUserInfo: {
        flex: 1,
    },
    reviewUserName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    reviewDate: {
        fontSize: 12,
    },
    reviewComment: {
        fontSize: 14,
        lineHeight: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default ProductReviews;
