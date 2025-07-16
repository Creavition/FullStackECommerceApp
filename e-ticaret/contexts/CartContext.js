import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

// useCart hook'unu export et
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // İlk yüklenme anında 
    useEffect(() => {
        loadCartFromStorage();
    }, []);

    // Ekran yüklendiğinde ve cartItems degistiginde calısır
    useEffect(() => {
        if (isLoaded) {
            saveCartToStorage();
        }
    }, [cartItems, isLoaded]);

    //AsyncStorage dan sepette gosterilecek urunleri ceker
    const loadCartFromStorage = useCallback(async () => {
        try {
            const savedCart = await AsyncStorage.getItem('cartItems');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    //AsyncStorage sepetteki urunleri kaydeder. Baska sayfalara gecildiğinde urunlerin kalmasını sağlar
    const saveCartToStorage = useCallback(async () => {
        try {
            await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }, [cartItems]);

    // Sepete Ekleme fonksiyonu
    const addToCart = useCallback((productOrItem, selectedSize = null) => {
        // Create standardized cart item
        const createCartItem = (product, size) => ({
            id: product.id,
            name: product.name,
            frontImagePath: product.frontImagePath,
            frontImageUrl: product.frontImageUrl,
            backImagePath: product.backImagePath,
            backImageUrl: product.backImageUrl,
            image: product.image,
            price: product.price,
            size,
            amount: product.amount || 1,
            category: product.category
        });

        let itemToAdd;

        if (selectedSize) {
            // Bedeni secilmis urun ekleme
            itemToAdd = createCartItem(productOrItem, selectedSize);
        } else if (productOrItem.size) {
            // Apideki formattan farkli ozellikler eklenmis urunler icin
            itemToAdd = createCartItem(productOrItem, productOrItem.size);
        } else {
            console.error('Urun bedeni secilmedi');
            return false;
        }

        // Eklenen urunun idsi ve bedeni ayniysa miktarini arttir degilse yeni urun olarak ekle
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item.id === itemToAdd.id && item.size === itemToAdd.size
            );

            if (existingItemIndex !== -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].amount += itemToAdd.amount;
                return updatedItems;
            } else {
                return [...prevItems, itemToAdd];
            }
        });
        return true;
    }, []);

    //Sepetten urun silme
    const removeFromCart = useCallback((index) => {
        setCartItems(prevItems => prevItems.filter((_, i) => i !== index));
    }, []);

    // Urunlerin miktarini arttirmak icin 
    const increaseAmount = useCallback((index) => {
        setCartItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index].amount += 1;
            return updatedItems;
        });
    }, []);

    // // Urunlerin miktarini azaltmak icin
    const decreaseAmount = useCallback((index) => {
        setCartItems(prevItems => {
            const updatedItems = [...prevItems];
            if (updatedItems[index].amount > 1) {
                updatedItems[index].amount -= 1;
                return updatedItems;
            } else {
                return prevItems.filter((_, i) => i !== index);
            }
        });
    }, []);

    //Sepeti temizlemek icin kullanilir
    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // Sepetteki toplam urun ve toplam Fiyati verir
    const cartSummary = useMemo(() => {
        const totalItems = cartItems.reduce((sum, item) => sum + item.amount, 0);
        const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.amount), 0);

        return {
            totalItems,
            totalPrice: totalPrice.toFixed(2),
            itemCount: cartItems.length
        };
    }, [cartItems]);

    const value = useMemo(() => ({
        cartItems,
        isLoaded,
        cartSummary,
        addToCart,
        removeFromCart,
        increaseAmount,
        decreaseAmount,
        clearCart
    }), [cartItems, isLoaded, cartSummary, addToCart, removeFromCart, increaseAmount, decreaseAmount, clearCart]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};