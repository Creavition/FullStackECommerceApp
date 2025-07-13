import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sizeMap } from '../utils/productUtils';

const ProductContext = createContext();

// API Base URL
const API_BASE_URL = 'http://192.168.1.3:5207';

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Product`);
            if (response.ok) {
                const data = await response.json();
                // API direk array dönüyor, .value property'si yok
                setProducts(Array.isArray(data) ? data : []);
            } else {
                throw new Error('Failed to fetch products');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, []); // Dependency array boş - sadece mount'ta yenilensin

    // Fetch products by category
    const fetchProductsByCategory = useCallback(async (categoryName) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Product/category/${categoryName}`);
            if (response.ok) {
                const data = await response.json();
                return Array.isArray(data) ? data : [];
            } else {
                throw new Error(`Failed to fetch products for category: ${categoryName}`);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products by category:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []); // Dependency array boş

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

    // Initialize data on mount - sadece bir kez
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const contextValue = {
        // Data
        products,
        categories,
        loading,
        error,

        // Functions
        fetchProducts,
        fetchProductsByCategory,
        getImageUrl,
        updateProductFavoriteStatus,

        // Legacy
        sizeMap,

        // Constants
        API_BASE_URL
    };

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => useContext(ProductContext);
