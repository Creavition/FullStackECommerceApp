import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProduct } from '../contexts/ProductContext';
import { useFilter } from '../contexts/FilterContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchCategoriesFromAPI, checkApiStatus, categoryUtils } from '../utils/productUtils';

export default function Filter() {
    const navigation = useNavigation();
    const route = useRoute();
    const { sizeMap } = useProduct() || { sizeMap: {} };
    const { filters, applyFilters } = useFilter() || {
        filters: {
            selectedCategory: null,
            selectedSize: null,
            minPrice: null,
            maxPrice: null
        },
        applyFilters: () => { }
    };
    const { translations } = useLanguage() || { translations: {} };
    const { theme, isDarkMode } = useTheme() || { theme: {}, isDarkMode: false };

    // Route params'tan gelen kategori ve size bilgileri
    const { categories: routeCategories = [], sizeOptions: routeSizeOptions = [] } = route.params || {};

    // API'den gelen kategoriler için state'ler
    const [apiCategories, setApiCategories] = useState(routeCategories.length > 0 ? routeCategories : []);
    const [apiSizeMap, setApiSizeMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState(true);

    // Kategori listesi (Route params'tan, API'den gelen veya fallback)
    const categories = apiCategories && apiCategories.length > 0 ?
        apiCategories.map(cat => cat && cat.categoryName ? cat.categoryName : cat) :
        (sizeMap && typeof sizeMap === 'object' ? Object.keys(sizeMap) : ['Jacket', 'Pants', 'Shoes', 'T-Shirt']);

    const [selectedCategory, setSelectedCategory] = useState(filters?.selectedCategory || null);
    const [selectedSize, setSelectedSize] = useState(filters?.selectedSize || null);
    const [minPrice, setMinPrice] = useState(filters?.minPrice ? filters.minPrice.toString() : '');
    const [maxPrice, setMaxPrice] = useState(filters?.maxPrice ? filters.maxPrice.toString() : '');

    // API'den kategorileri yükle
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const apiOk = checkApiStatus();
                setApiStatus(apiOk);

                console.log('Loading categories for filter...');
                const { categories, sizeMap } = await fetchCategoriesFromAPI();

                if (categories && categories.length > 0) {
                    setApiCategories(Array.isArray(categories) ? categories : []);
                    setApiSizeMap(sizeMap && typeof sizeMap === 'object' ? sizeMap : {});
                    console.log(`Filter loaded ${categories.length} categories from API`);
                } else {
                    console.log('No API categories, using fallback data');
                    setApiSizeMap(sizeMap && typeof sizeMap === 'object' ? sizeMap : {});
                }
            } catch (error) {
                console.error('Error loading categories for filter:', error);
                try {
                    const testResult = await categoryUtils.testApiConnection();
                    setApiStatus(testResult);
                } catch (testError) {
                    console.error('Error testing API connection in Filter:', testError);
                    setApiStatus(false);
                }
                setApiSizeMap(sizeMap && typeof sizeMap === 'object' ? sizeMap : {});
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    // Context'teki filtreleri local state ile senkronize et
    useEffect(() => {
        if (filters) {
            setSelectedCategory(filters.selectedCategory || null);
            setSelectedSize(filters.selectedSize || null);
            setMinPrice(filters.minPrice ? filters.minPrice.toString() : '');
            setMaxPrice(filters.maxPrice ? filters.maxPrice.toString() : '');
        }
    }, [filters]);

    const toggleCategory = (cat) => {
        const newCategory = cat === selectedCategory ? null : cat;
        setSelectedCategory(newCategory);
        setSelectedSize(null); // Kategori değişince beden sıfırlansın
    };

    const toggleSize = (size) => {
        setSelectedSize(size === selectedSize ? null : size);
    };

    // Seçili kategorinin bedenlerini al (Route params, API'den veya fallback'ten)
    const getSizesForCategory = (category) => {
        if (!category) return [];

        // Önce route params'tan gelen size options'ları kontrol et
        if (routeSizeOptions && routeSizeOptions.length > 0) {
            return routeSizeOptions;
        }

        // Sonra API'den gelen verilerden kontrol et
        if (apiSizeMap && apiSizeMap[category] && Array.isArray(apiSizeMap[category])) {
            return apiSizeMap[category];
        }

        // Fallback olarak context'ten al
        if (sizeMap && sizeMap[category] && Array.isArray(sizeMap[category])) {
            return sizeMap[category];
        }

        // Son fallback - kategori tipine göre varsayılan bedenler
        const defaultSizes = {
            'Jacket': ['XS', 'S', 'M', 'L', 'XL'],
            'Pants': ['28', '30', '32', '34', '36'],
            'Shoes': ['38', '39', '40', '41', '42'],
            'T-Shirt': ['XS', 'S', 'M', 'L', 'XL']
        };

        return defaultSizes[category] || [];
    };

    // Kategori isimlerini çevir
    const getCategoryName = (category) => {
        if (!translations) return category;

        switch (category) {
            case 'Jacket': return translations.jacket || 'Jacket';
            case 'Pants': return translations.pants || 'Pants';
            case 'Shoes': return translations.shoes || 'Shoes';
            case 'T-Shirt': return translations.tshirt || 'T-Shirt';
            default: return category;
        }
    };

    // Loading state için gösterim
    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: isDarkMode ? theme.background : '#fff' }]}>
                <TouchableOpacity
                    style={{ alignSelf: "flex-start", paddingTop: 20 }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
                </TouchableOpacity>
                <View style={styles.loadingContent}>
                    <Ionicons name="refresh" size={40} color="#FF6B35" />
                    <Text style={[styles.loadingText, { color: isDarkMode ? theme.text : '#000' }]}>
                        {translations?.loading || 'Loading categories...'}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#fff' }]}>
            <TouchableOpacity
                style={{ alignSelf: "flex-start", paddingTop: 20 }}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
            </TouchableOpacity>

            {/* API Status Indicator */}
            <View style={styles.apiStatusContainer}>
                <Ionicons
                    name={apiStatus ? "checkmark-circle" : "alert-circle"}
                    size={16}
                    color={apiStatus ? "#4CAF50" : "#FF6B35"}
                />
                <Text style={[styles.apiStatusText, { color: apiStatus ? "#4CAF50" : "#FF6B35" }]}>
                    {apiStatus ? "API Connected" : "Using Offline Data"}
                </Text>
            </View>
            {/* Price Filter */}
            <Text style={[styles.text, { color: isDarkMode ? theme.text : '#000' }]}>{translations?.price || 'Price'}</Text>
            <View style={styles.rowContainer}>
                <TextInput
                    style={[
                        styles.textBox,
                        {
                            borderColor: isDarkMode ? theme.border : 'black',
                            backgroundColor: isDarkMode ? theme.surface : '#fff',
                            color: isDarkMode ? theme.text : '#000'
                        }
                    ]}
                    keyboardType='numeric'
                    placeholder={translations?.minAmount || 'Min Amount'}
                    placeholderTextColor={isDarkMode ? theme.textTertiary : '#999'}
                    value={minPrice}
                    onChangeText={setMinPrice}
                />
                <Text style={[styles.dash, { color: isDarkMode ? theme.text : '#000' }]}>-</Text>
                <TextInput
                    style={[
                        styles.textBox,
                        {
                            borderColor: isDarkMode ? theme.border : 'black',
                            backgroundColor: isDarkMode ? theme.surface : '#fff',
                            color: isDarkMode ? theme.text : '#000'
                        }
                    ]}
                    keyboardType='numeric'
                    placeholder={translations?.maxAmount || 'Max Amount'}
                    placeholderTextColor={isDarkMode ? theme.textTertiary : '#999'}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                />
            </View>

            {/* Category Buttons */}
            <Text style={[styles.text, { color: isDarkMode ? theme.text : '#000' }]}>{translations?.category || 'Category'}</Text>
            <View style={styles.rowContainer}>
                {Array.isArray(categories) && categories.map((cat) => {
                    if (!cat) return null;
                    return (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => toggleCategory(cat)}
                            style={[
                                styles.categoryButton,
                                {
                                    borderColor: isDarkMode ? theme.border : 'gray',
                                    backgroundColor: isDarkMode ? theme.surface : '#fff'
                                },
                                selectedCategory === cat && styles.categoryButtonSelected
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    { color: isDarkMode ? theme.text : 'black' },
                                    selectedCategory === cat && styles.categoryTextSelected
                                ]}
                            >
                                {getCategoryName(cat)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Size Options */}
            <Text style={[styles.text, { color: isDarkMode ? theme.text : '#000' }]}>{translations?.sizeOptionsFilter || 'Size Options'}</Text>
            {selectedCategory ? (
                <View style={styles.rowContainer}>
                    {getSizesForCategory(selectedCategory).map((size) => {
                        if (!size) return null;
                        return (
                            <TouchableOpacity
                                key={size}
                                onPress={() => toggleSize(size)}
                                style={[
                                    styles.sizeBox,
                                    {
                                        borderColor: isDarkMode ? theme.border : '#999',
                                        backgroundColor: isDarkMode ? theme.surface : '#f2f2f2'
                                    },
                                    selectedSize === size && styles.sizeBoxSelected
                                ]}
                            >
                                <Text style={[
                                    styles.sizeText,
                                    { color: isDarkMode ? theme.text : '#333' },
                                    selectedSize === size && styles.sizeTextSelected
                                ]}>
                                    {size}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ) : (
                <Text style={[styles.placeholderText, { color: isDarkMode ? theme.textSecondary : '#888' }]}>
                    {translations?.selectCategory || 'Select a category first'}
                </Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={() => {
                        // Filtreleri temizle
                        setSelectedCategory(null);
                        setSelectedSize(null);
                        setMinPrice('');
                        setMaxPrice('');

                        // Context'i de temizle
                        if (applyFilters && typeof applyFilters === 'function') {
                            applyFilters({
                                minPrice: null,
                                maxPrice: null,
                                selectedCategory: null,
                                selectedSize: null
                            });
                        }
                    }}
                >
                    <Text style={[styles.buttonText, styles.clearButtonText]}>{translations?.clear || 'Clear'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        // FilterContext'e filtreleri kaydet
                        if (applyFilters && typeof applyFilters === 'function') {
                            applyFilters({
                                minPrice: minPrice ? parseFloat(minPrice) : null,
                                maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                                selectedCategory,
                                selectedSize
                            });
                        }

                        // Geri dön - hangi sayfadan geldiyse oraya
                        navigation.goBack();
                    }}
                >
                    <Text style={styles.buttonText}>{translations?.apply || 'Apply'}</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#000',
    },
    dash: {
        fontSize: 24,
        marginHorizontal: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    textBox: {
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: '#fff',
        height: 50,
        width: 140,
        paddingLeft: 15,
        color: '#000',
    },
    categoryButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        margin: 6,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'gray',
        backgroundColor: '#fff',
    },
    categoryButtonSelected: {
        backgroundColor: '#ce6302',
        borderColor: '#ce6302',
    },
    categoryText: {
        color: 'black',
        fontWeight: '500',
    },
    categoryTextSelected: {
        color: 'white',
    },
    sizeBox: {
        borderWidth: 1,
        borderColor: '#999',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        margin: 6,
        backgroundColor: '#f2f2f2',
    },
    sizeBoxSelected: {
        backgroundColor: '#ce6302',
        borderColor: '#ce6302',
    },
    sizeText: {
        fontSize: 14,
        color: '#333',
    },
    sizeTextSelected: {
        color: 'white',
    },
    placeholderText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#888',
        marginTop: 10,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    button: {
        width: 140,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ce6302',
    },
    clearButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 2,
        borderColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    clearButtonText: {
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    apiStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignSelf: 'center',
    },
    apiStatusText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 6,
    },
});