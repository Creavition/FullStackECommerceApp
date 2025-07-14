import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useProduct } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ProductEditModal({ visible, product, onClose, onUpdate }) {
    const { updateProductCategory, updateProductSizes, updateProductCategoryAndSizes } = useProduct();
    const { translations } = useLanguage();
    const { theme, isDarkMode } = useTheme();

    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedSizeIds, setSelectedSizeIds] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock categories - bu gerçek uygulamada API'den gelecek
    const mockCategories = [
        { id: 1, name: 'Jacket' },
        { id: 2, name: 'Pants' },
        { id: 3, name: 'Shoes' },
        { id: 4, name: 'T-Shirt' }
    ];

    // Mock sizes - bu gerçek uygulamada API'den gelecek
    const mockSizes = [
        { id: 1, name: 'XS' },
        { id: 2, name: 'S' },
        { id: 3, name: 'M' },
        { id: 4, name: 'L' },
        { id: 5, name: 'XL' },
        { id: 6, name: 'XXL' }
    ];

    useEffect(() => {
        if (product) {
            setSelectedCategoryId(product.categoryId);
            // AvailableSizes string array'i - bunları ID'lere çevirmeliyiz
            // Bu örnekte basit bir mapping yapıyoruz
            const sizeNameToId = {
                'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6
            };
            const currentSizeIds = product.availableSizes?.map(sizeName =>
                sizeNameToId[sizeName]
            ).filter(id => id) || [];
            setSelectedSizeIds(currentSizeIds);
        }
    }, [product]);

    const handleSizeToggle = (sizeId) => {
        setSelectedSizeIds(prev => {
            if (prev.includes(sizeId)) {
                return prev.filter(id => id !== sizeId);
            } else {
                return [...prev, sizeId];
            }
        });
    };

    const handleUpdate = async () => {
        if (!product) return;

        if (selectedSizeIds.length === 0) {
            Alert.alert(
                translations.error || 'Error',
                'Please select at least one size'
            );
            return;
        }

        setLoading(true);
        try {
            const success = await updateProductCategoryAndSizes(
                product.id,
                selectedCategoryId,
                selectedSizeIds
            );

            if (success) {
                Alert.alert(
                    translations.success || 'Success',
                    'Product updated successfully'
                );
                onUpdate?.();
                onClose();
            } else {
                Alert.alert(
                    translations.error || 'Error',
                    'Failed to update product'
                );
            }
        } catch (error) {
            Alert.alert(
                translations.error || 'Error',
                error.message || 'Something went wrong'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.background }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.title, { color: theme.text }]}>
                            Edit Product
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Product Info */}
                        <View style={styles.section}>
                            <Text style={[styles.productName, { color: theme.text }]}>
                                {product.name}
                            </Text>
                            <Text style={[styles.productPrice, { color: theme.primary }]}>
                                {product.price} ₺
                            </Text>
                        </View>

                        {/* Category Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Category
                            </Text>
                            <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Picker
                                    selectedValue={selectedCategoryId}
                                    onValueChange={setSelectedCategoryId}
                                    style={[styles.picker, { color: theme.text }]}
                                >
                                    {mockCategories.map(category => (
                                        <Picker.Item
                                            key={category.id}
                                            label={category.name}
                                            value={category.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Size Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Available Sizes
                            </Text>
                            <View style={styles.sizeGrid}>
                                {mockSizes.map(size => (
                                    <TouchableOpacity
                                        key={size.id}
                                        style={[
                                            styles.sizeItem,
                                            {
                                                backgroundColor: selectedSizeIds.includes(size.id)
                                                    ? theme.primary
                                                    : theme.surface,
                                                borderColor: theme.border
                                            }
                                        ]}
                                        onPress={() => handleSizeToggle(size.id)}
                                    >
                                        <Text style={[
                                            styles.sizeText,
                                            {
                                                color: selectedSizeIds.includes(size.id)
                                                    ? '#fff'
                                                    : theme.text
                                            }
                                        ]}>
                                            {size.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: theme.border }]}>
                        <TouchableOpacity
                            style={[styles.updateButton, { backgroundColor: theme.primary }]}
                            onPress={handleUpdate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.updateButtonText}>
                                    Update Product
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 20,
        overflow: 'hidden',
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
    },
    closeButton: {
        padding: 5,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    sizeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sizeItem: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        minWidth: 60,
        alignItems: 'center',
    },
    sizeText: {
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    updateButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
