import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllProducts, getCategories } from '../utils/productUtils';
import { productApi } from '../utils/productApi';

const ProductContext = createContext();

// API Base URL
const API_BASE_URL = 'http://10.241.64.12:5207';

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all products using cached version from utils
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const products = await getAllProducts(); // ProductUtils'ten cached versiyon
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
        return `${API_BASE_URL}/${imagePath}`;
    };

    // Update product favorite status in local state
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
                const categories = await getCategories();
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
        API_BASE_URL
    };

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => useContext(ProductContext);