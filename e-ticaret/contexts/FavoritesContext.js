import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useProduct } from './ProductContext';

const FavoritesContext = createContext();

// API Base URL
const API_BASE_URL = 'http://192.168.1.210:5207';

export const FavoritesProvider = ({ children }) => {
    // Favoriye eklenen urunler favoriteItems degiskeninde obje olarak tutuluyor.
    // Mesela {"1":true, "2":true} seklinde tutuluyor.
    const [favoriteItems, setFavoriteItems] = useState({});

    // Ürünün hangi sayfadan eklendiği bilgisini tutuyor
    // Mesela {"1":"Home", "2":"Search"} seklinde tutuluyor.
    const [favoriteSource, setFavoriteSource] = useState({});

    // FavoriteItems'ı manuel olarak güncelleme fonksiyonu
    const updateFavoriteItems = useCallback((productId, isFavorite) => {
        setFavoriteItems(prev => ({
            ...prev,
            [productId]: isFavorite
        }));
    }, []);

    // API ile favori durumunu toggle et
    const toggleFavorite = useCallback(async (itemId, source = 'Search', updateProductContext = null) => {
        try {
            console.log('Toggling favorite for product ID:', itemId);

            // API'ye favori toggle isteği gönder
            const response = await fetch(`${API_BASE_URL}/api/Product/${itemId}/favorite`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to toggle favorite');
            }

            const data = await response.json();
            console.log('API response:', data);

            // API'den gelen yeni favori durumunu local state'e yansıt
            setFavoriteItems(prev => {
                const newFavorites = {
                    ...prev,
                    [itemId]: data.isFavorite
                };

                // Eğer favoriye ekleniyor ise source bilgisini kaydet
                if (data.isFavorite) {
                    setFavoriteSource(prevSource => ({
                        ...prevSource,
                        [itemId]: source
                    }));
                } else {
                    // Eğer favoriden çıkarılıyor ise source bilgisini sil
                    setFavoriteSource(prevSource => {
                        const newSource = { ...prevSource };
                        delete newSource[itemId];
                        return newSource;
                    });
                }

                return newFavorites;
            });

            // ProductContext'i güncelle (eğer fonksiyon verilmişse)
            if (updateProductContext && typeof updateProductContext === 'function') {
                updateProductContext(itemId, data.isFavorite);
            }

            // Local favoriteItems'ı da güncelle
            updateFavoriteItems(itemId, data.isFavorite);

            return data.isFavorite; // Yeni durumu geri döndür

        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Hata durumunda kullanıcıya bilgi verilebilir
            return null;
        }
    }, []); // Dependency array boş

    return (
        <FavoritesContext.Provider value={{ favoriteItems, favoriteSource, toggleFavorite, updateFavoriteItems }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
