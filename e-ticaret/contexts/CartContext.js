import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // AsyncStorage'dan sepet verilerini yükle
    useEffect(() => {
        loadCartFromStorage();
    }, []);

    // Sepet değiştiğinde AsyncStorage'a kaydet
    useEffect(() => {
        saveCartToStorage();
    }, [cartItems]);

    const loadCartFromStorage = async () => {
        try {
            const savedCart = await AsyncStorage.getItem('cartItems');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
        }
    };

    const saveCartToStorage = async () => {
        try {
            await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    };

    // ✅ DÜZELTME: ProductDetail'dan gelen ürün objesi doğrudan kullanılacak
    const addToCart = (productOrItem, selectedSize = null) => {
        console.log('addToCart called with:', { productOrItem, selectedSize });

        let itemToAdd;

        // ProductDetail'dan geliyorsa (ürün objesi + seçilen beden)
        if (selectedSize) {
            itemToAdd = {
                id: productOrItem.id,
                name: productOrItem.name,
                frontImagePath: productOrItem.frontImagePath,
                frontImageUrl: productOrItem.frontImageUrl,
                backImagePath: productOrItem.backImagePath,
                backImageUrl: productOrItem.backImageUrl,
                image: productOrItem.image,
                price: productOrItem.price,
                size: selectedSize, // ✅ Seçilen beden
                amount: 1,
                category: productOrItem.category
            };
        }
        // ProductDetail'ın handleAddToCart'ından geliyorsa (hazır obje)
        else if (productOrItem.size) {
            itemToAdd = {
                id: productOrItem.id,
                name: productOrItem.name,
                frontImagePath: productOrItem.frontImagePath,
                frontImageUrl: productOrItem.frontImageUrl,
                backImagePath: productOrItem.backImagePath,
                backImageUrl: productOrItem.backImageUrl,
                image: productOrItem.image,
                price: productOrItem.price,
                size: productOrItem.size, // ✅ Zaten var olan beden
                amount: productOrItem.amount || 1,
                category: productOrItem.category
            };
        }
        // Hata durumu - beden yok
        else {
            console.error('No size provided for cart item');
            return;
        }

        console.log('Item to add:', itemToAdd);

        // Aynı ürün ve aynı beden var mı kontrol et
        const existingItemIndex = cartItems.findIndex(
            item => item.id === itemToAdd.id && item.size === itemToAdd.size
        );

        if (existingItemIndex !== -1) {
            // Mevcut ürün varsa miktarını artır
            const updatedItems = [...cartItems];
            updatedItems[existingItemIndex].amount += itemToAdd.amount;
            setCartItems(updatedItems);
            console.log('Updated existing item:', updatedItems[existingItemIndex]);
        } else {
            // Yeni ürün ekle
            setCartItems([...cartItems, itemToAdd]);
            console.log('Added new item:', itemToAdd);
        }
    };

    const removeFromCart = (index) => {
        const updatedItems = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedItems);
    };

    const increaseAmount = (index) => {
        const updatedItems = [...cartItems];
        updatedItems[index].amount += 1;
        setCartItems(updatedItems);
    };

    const decreaseAmount = (index) => {
        const updatedItems = [...cartItems];
        if (updatedItems[index].amount > 1) {
            updatedItems[index].amount -= 1;
            setCartItems(updatedItems);
        } else {
            // Miktar 1'se tamamen kaldır
            removeFromCart(index);
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Dil değişikliği için ürün bilgilerini güncelleme fonksiyonu
    const updateCartItemLanguage = (index, updatedItem) => {
        setCartItems(prev => {
            const newItems = [...prev];
            if (newItems[index]) {
                // Sadece name güncelle, size'ı koru
                newItems[index] = {
                    ...newItems[index],
                    name: updatedItem.name,
                    // ÖNEMLİ: size'ı koruyalım
                    size: newItems[index].size,
                };
            }
            return newItems;
        });
    };

    // Sepetteki tüm ürünlerin dilini toplu güncelleme
    const updateAllCartItemsLanguage = (allProducts) => {
        setCartItems(prev => {
            return prev.map(cartItem => {
                const updatedProduct = allProducts.find(p => p.id === cartItem.id);
                if (updatedProduct) {
                    return {
                        ...cartItem,
                        name: updatedProduct.name,
                        // ÖNEMLİ: size'ı koruyalım
                        size: cartItem.size,
                    };
                }
                return cartItem;
            });
        });
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        increaseAmount,
        decreaseAmount,
        clearCart,
        updateCartItemLanguage,
        updateAllCartItemsLanguage,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};