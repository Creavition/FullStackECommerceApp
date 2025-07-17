import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFilter } from '../contexts/FilterContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { categoryApi } from '../utils/categoryApi';

export default function Filter() {
    const navigation = useNavigation();
    const { filters, applyFilters, clearFilters } = useFilter(); //Filtreleme
    const { theme, isDarkMode } = useTheme();

    // State'ler
    const [categories, setCategories] = useState([]); //Kategoriler
    const [allSizes, setAllSizes] = useState([]); //Tum bedenler
    const [categorySizes, setCategorySizes] = useState([]);//Category bedenleri
    const [loading, setLoading] = useState(true); //Yuklenme durumu

    // Filter durumlari
    //Secilen kategori basta null
    const [selectedCategory, setSelectedCategory] = useState(filters?.selectedCategory || null);
    const [selectedSizes, setSelectedSizes] = useState(filters?.selectedSizes || []); //secilenBeden
    const [minPrice, setMinPrice] = useState(filters?.minPrice ? filters.minPrice.toString() : '');
    const [maxPrice, setMaxPrice] = useState(filters?.maxPrice ? filters.maxPrice.toString() : '');

    // Başlangıçta verileri yükle
    useEffect(() => {
        loadInitialData();
    }, []);

    
    // Context'teki filtreleri local state ile senkronize et
    useEffect(() => {
        if (filters) {
            setSelectedCategory(filters.selectedCategory || null);
            setSelectedSizes(filters.selectedSizes || []);
            setMinPrice(filters.minPrice ? filters.minPrice.toString() : '');
            setMaxPrice(filters.maxPrice ? filters.maxPrice.toString() : '');

            // Eğer kategori seçiliyse ve kategoriler yüklenmişse, o kategorinin bedenlerini yükle
            if (filters.selectedCategory && categories.length > 0) {
                const selectedCategoryData = categories.find(cat => cat.categoryName === filters.selectedCategory);
                if (selectedCategoryData) {
                    loadCategorySizes(selectedCategoryData);
                }
            } else if (!filters.selectedCategory) {
                // Kategori seçimi kaldırıldıysa category sizes'ı temizle
                setCategorySizes([]);
            }
        }
    }, [filters, categories]);

    // Başlangıç verilerini yükle
    const loadInitialData = async () => {
        try {
            setLoading(true);

            console.log('Kategori ve Bedenler Apide Aliniyor');

            // API'den kategorileri al
            const categoriesFromAPI = await categoryApi.getAllCategories();

            // Kategorileri state'e kaydet
            setCategories(categoriesFromAPI);

            // Tüm kategorilerin bedenlerini birleştir
            const allSizesSet = new Set();

            categoriesFromAPI.forEach(category => {
                if (category.sizes && Array.isArray(category.sizes)) {
                    category.sizes.forEach(size => {
                        const sizeName = size.sizeName || size;
                        if (sizeName) {
                            allSizesSet.add(sizeName);
                        }
                    });
                }
            });

            setAllSizes(Array.from(allSizesSet));

            console.log(`Loaded ${categoriesFromAPI.length} categories`);
            console.log(`Found ${allSizesSet.size} unique sizes`);

        } catch (error) {
            console.error('Error loading initial data:', error);
            setError(error.message || 'Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Kategori seçimi
    const toggleCategory = async (category) => {
        const newCategory = category.categoryName === selectedCategory ? null : category.categoryName;
        setSelectedCategory(newCategory);
        setSelectedSizes([]); // Kategori değişince bedenler sıfırlansın

        // Kategori degistigi icin o kategoriye gore bedenler gelir
        if (newCategory) {
            await loadCategorySizes(category);
        } else {
            setCategorySizes([]);
        }
    };

    // Seçili kategorinin bedenlerini yükle
    const loadCategorySizes = async (category) => {
        try {
            console.log(`Loading sizes for category: ${category.categoryName}`);

            if (category.sizes && Array.isArray(category.sizes)) {
                const sizeNames = category.sizes.map(size => size.sizeName || size);
                setCategorySizes(sizeNames);
                console.log(`Loaded ${sizeNames.length} sizes for ${category.categoryName}`);
            } else {
                // Kategori ID'si ile API'den bedenleri al
                const sizes = await categoryApi.getCategorySizes(category.id);
                const sizeNames = sizes.map(size => size.sizeName || size);
                setCategorySizes(sizeNames);
                console.log(`Loaded ${sizeNames.length} sizes from API for ${category.categoryName}`);
            }
        } catch (error) {
            console.error(`Error loading sizes for category ${category.categoryName}:`, error);
            setCategorySizes([]);
        }
    };

    // Beden seçimi
    const toggleSize = (size) => {
        setSelectedSizes(prevSizes => {
            // Daha once secilen bedene bidaha tiklanirsa onu kaldirir.
            if (prevSizes.includes(size)) {
                return prevSizes.filter(s => s !== size);
            } else {
                return [...prevSizes, size];
            }
        });
    };

    // Gösterilecek kategori bedenlerini al
    const getDisplaySizes = () => {
        if (selectedCategory) {
            return categorySizes;
        }
        return allSizes;
    };

    // Filtreleri temizle
    const handleClearFilters = () => {
        clearFilters();

        setSelectedCategory(null);
        setSelectedSizes([]);
        setMinPrice('');
        setMaxPrice('');
        setCategorySizes([]);
    };

    // Filtreleri uygula
    const handleApplyFilters = () => {
        // Filtreye parametre olarak girecek veriler. minPrice ve maxPrice string old icin number cevrimi
        const filterData = {
            minPrice: minPrice ? parseFloat(minPrice) : null,
            maxPrice: maxPrice ? parseFloat(maxPrice) : null,
            selectedCategory,
            selectedSizes: selectedSizes || []
        };

        // Validation
        if (filterData.minPrice && filterData.maxPrice && filterData.minPrice > filterData.maxPrice) {
            Alert.alert('Hata', 'Minimum fiyat, maksimum fiyattan büyük olamaz');
            return;
        }

        applyFilters(filterData); //FilterContextteki fonksiyon kullanilir.
        navigation.goBack();
    };


    // Yuklenme durumu
    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: isDarkMode ? theme.background : '#fff' }]}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
                </TouchableOpacity>

                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={[styles.loadingText, { color: isDarkMode ? theme.text : '#000' }]}>
                        Kategoriler yükleniyor...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#fff' }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Close Button */}
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
            </TouchableOpacity>

            {/* Price Filter */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? theme.text : '#000' }]}>
                    Fiyat Aralığı
                </Text>
                <View style={styles.priceContainer}>
                    <TextInput
                        style={[
                            styles.priceInput,
                            {
                                borderColor: isDarkMode ? theme.border : '#ddd',
                                backgroundColor: isDarkMode ? theme.surface : '#fff',
                                color: isDarkMode ? theme.text : '#000'
                            }
                        ]}
                        keyboardType="numeric"
                        placeholder="Min Tutar"
                        placeholderTextColor={isDarkMode ? theme.textTertiary : '#999'}
                        value={minPrice}
                        onChangeText={setMinPrice}
                    />
                    <Text style={[styles.dash, { color: isDarkMode ? theme.text : '#000' }]}>
                        -
                    </Text>
                    <TextInput
                        style={[
                            styles.priceInput,
                            {
                                borderColor: isDarkMode ? theme.border : '#ddd',
                                backgroundColor: isDarkMode ? theme.surface : '#fff',
                                color: isDarkMode ? theme.text : '#000'
                            }
                        ]}
                        keyboardType="numeric"
                        placeholder="Max Tutar"
                        placeholderTextColor={isDarkMode ? theme.textTertiary : '#999'}
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                    />
                </View>
            </View>

            {/* Category Filter */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? theme.text : '#000' }]}>
                    Kategori
                </Text>
                <View style={styles.optionsContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => toggleCategory(category)}
                            style={[
                                styles.categoryButton,
                                {
                                    borderColor: isDarkMode ? theme.border : '#ddd',
                                    backgroundColor: isDarkMode ? theme.surface : '#fff'
                                },
                                selectedCategory === category.categoryName && styles.selectedButton
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    { color: isDarkMode ? theme.text : '#000' },
                                    selectedCategory === category.categoryName && styles.selectedText
                                ]}
                            >
                                {category.categoryName}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Size Filter */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? theme.text : '#000' }]}>
                    Beden
                </Text>
                <View style={styles.optionsContainer}>
                    {getDisplaySizes().map((size) => (
                        <TouchableOpacity
                            key={size}
                            onPress={() => toggleSize(size)}
                            style={[
                                styles.sizeButton,
                                {
                                    borderColor: isDarkMode ? theme.border : '#ddd',
                                    backgroundColor: isDarkMode ? theme.surface : '#f8f8f8'
                                },
                                selectedSizes.includes(size) && styles.selectedButton
                            ]}
                        >
                            <Text
                                style={[
                                    styles.sizeText,
                                    { color: isDarkMode ? theme.text : '#333' },
                                    selectedSizes.includes(size) && styles.selectedText
                                ]}
                            >
                                {size}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={handleClearFilters}
                >
                    <Text style={[styles.buttonText, styles.clearButtonText]}>
                        Temizle
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.applyButton]}
                    onPress={handleApplyFilters}
                >
                    <Text style={[styles.buttonText, styles.applyButtonText]}>
                        Filtreleri Uygula
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    errorContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        marginTop: 15,
        marginBottom: 20,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    retryButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        alignSelf: 'flex-start',
        padding: 10,
        marginBottom: 10,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceInput: {
        flex: 1,
        height: 50,
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        maxWidth: 120,
    },
    dash: {
        fontSize: 20,
        marginHorizontal: 15,
        fontWeight: '500',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    categoryButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        margin: 4,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    sizeButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        margin: 4,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 50,
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: '#ce6302',
        borderColor: '#ce6302',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    sizeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    selectedText: {
        color: '#fff',
    },
    infoText: {
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    },
    selectedInfo: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 15,
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    applyButton: {
        backgroundColor: '#ce6302',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    clearButtonText: {
        color: '#666',
    },
    applyButtonText: {
        color: '#fff',
    },
});