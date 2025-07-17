import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productApi } from '../utils/productApi';
import { categoryApi } from '../utils/categoryApi';
import { API_ENDPOINTS } from '../utils/apiClient';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Butun urunleri cekme
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const products = await productApi.getAllProducts();
            setProducts(products);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, []);


    // Get image URL helper
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // Base URL'i API_ENDPOINTS'ten al
        const baseUrl = API_ENDPOINTS.API.replace('/api', '');
        return `${baseUrl}/${imagePath}`;
    };

    // Localde urun guncelleme
    const updateProductFavoriteStatus = useCallback((productId, isFavorite) => {
        setProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === productId
                    ? { ...product, isFavorite }
                    : product
            )
        );
    }, []);

    // General product update function
    const updateProduct = useCallback(async (productId, updateData) => {
        try {
            await productApi.updateProduct(productId, updateData);

            // Refresh products to get all updated data from API
            await fetchProducts();

            return true;
        } catch (error) {
            console.error('Error updating product:', error);
            setError(error.message);
            return false;
        }
    }, [fetchProducts]);

    // Initialize data on mount - sadece bir kez
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Kategori isimleri - state ile yönet
    const [categoryNames, setCategoryNames] = useState([]);

    // Kategorileri yükle
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categories = await categoryApi.getAllCategories();
                setCategoryNames(categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoryNames([]);
            }
        };
        loadCategories();
    }, []);

    const contextValue = {
        products,
        loading,
        error,
        fetchProducts,
        getImageUrl,
        updateProductFavoriteStatus,
        updateProduct,
        categoryNames,
    };

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => useContext(ProductContext);