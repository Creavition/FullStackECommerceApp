import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { toggleProductFavorite } from '../utils/productUtils';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    // Favoriye eklenen ürünler - sadece true/false
    const [favoriteItems, setFavoriteItems] = useState({});

    // Basit toggle fonksiyonu 
    // FavoritesContext.js içindeki toggleFavorite fonksiyonunu bu şekilde değiştirin:

    const toggleFavorite = useCallback(async (itemId, updateProductContext = null) => {
        try {
            console.log('Product ID:', itemId);

            // State'i functional update ile güncelle
            let currentStatus;
            let newStatus;

            setFavoriteItems(prev => {
                currentStatus = Boolean(prev[itemId]);
                newStatus = !currentStatus;

                console.log('Current favoriteItems state:', prev);
                console.log('Current status:', currentStatus);
                console.log('New status will be:', newStatus);

                const newState = {
                    ...prev,
                    [itemId]: newStatus
                };
                console.log('New favoriteItems state:', newState);
                return newState;
            });

            // ProductContext'i güncelle
            if (updateProductContext && typeof updateProductContext === 'function') {
                console.log('Updating ProductContext...');
                try {
                    updateProductContext(itemId, newStatus);
                } catch (error) {
                    console.log(error);
                }
            }

            // API çağrısını yap
            console.log('Making API call...');
            const success = await toggleProductFavorite(itemId, newStatus);

            if (success) {
                console.log('API call successful');
                console.log(`Product ${itemId} favorite status changed to: ${newStatus}`);
                return newStatus;
            } else {

                // API başarısız olursa değişiklikleri geri al
                setFavoriteItems(prev => ({
                    ...prev,
                    [itemId]: currentStatus
                }));

                if (updateProductContext && typeof updateProductContext === 'function') {
                    updateProductContext(itemId, currentStatus);
                }
                return null;
            }

        } catch (error) {
            console.error('Error in toggleFavorite:', error);

            // Hata durumunda da geri al 
            setFavoriteItems(prev => {
                const originalStatus = Boolean(prev[itemId]);
                console.log('Reverting to original status:', originalStatus);
                return {
                    ...prev,
                    [itemId]: originalStatus  // Orijinal duruma geri al
                };
            });

            if (updateProductContext && typeof updateProductContext === 'function') {
                // Error durumunda context'i güncelle
                updateProductContext(itemId, Boolean(favoriteItems[itemId]));
            }

            return null;
        }
    }, []);


    const value = useMemo(() => ({
        // Degisken
        favoriteItems,

        // Functions
        toggleFavorite,

        // Helpers
        isFavorite: (productId) => favoriteItems[productId] || false,
        getFavoriteCount: () => Object.values(favoriteItems).filter(Boolean).length,
        getFavoriteIds: () => Object.keys(favoriteItems).filter(id => favoriteItems[id]),
        hasFavorites: Object.values(favoriteItems).some(Boolean)
    }), [favoriteItems]);

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};