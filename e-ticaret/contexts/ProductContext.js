import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sizeMap } from '../utils/productUtils';
import { productApi } from '../utils/productApi';

const ProductContext = createContext();

// API Base URL
const API_BASE_URL = 'http://192.168.1.210:5207';

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

    // Update product category
    const updateProductCategory = useCallback(async (productId, categoryId) => {
        try {
            await productApi.updateProductCategory(productId, categoryId);

            // Update local state
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === productId
                        ? { ...product, categoryId }
                        : product
                )
            );

            return true;
        } catch (error) {
            console.error('Error updating product category:', error);
            setError(error.message);
            return false;
        }
    }, []);

    // Update product available sizes
    const updateProductSizes = useCallback(async (productId, sizeIds) => {
        try {
            await productApi.updateProductSizes(productId, sizeIds);

            // Refresh products to get updated sizes from API
            await fetchProducts();

            return true;
        } catch (error) {
            console.error('Error updating product sizes:', error);
            setError(error.message);
            return false;
        }
    }, [fetchProducts]);

    // Update product category and sizes together
    const updateProductCategoryAndSizes = useCallback(async (productId, categoryId, sizeIds) => {
        try {
            await productApi.updateProductCategoryAndSizes(productId, categoryId, sizeIds);

            // Refresh products to get all updated data from API
            await fetchProducts();

            return true;
        } catch (error) {
            console.error('Error updating product category and sizes:', error);
            setError(error.message);
            return false;
        }
    }, [fetchProducts]);

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
        updateProductCategory,
        updateProductSizes,
        updateProductCategoryAndSizes,
        updateProduct,

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
