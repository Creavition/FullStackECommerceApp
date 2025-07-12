import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    // Favoriye eklenen urunler favoriteItems degiskeninde obje olarak tutuluyor.
    // Mesela {"Shoes-1":true, "Jacket-2":true} seklinde tutuluyor.
    const [favoriteItems, setFavoriteItems] = useState({});
    
    // Ürünün hangi sayfadan eklendiği bilgisini tutuyor
    // Mesela {"Shoes-1":"Home", "Jacket-2":"Search"} seklinde tutuluyor.
    const [favoriteSource, setFavoriteSource] = useState({});

    // prevden kasit bir urune tiklanmadan onceki durumda olan obje. {"Shoes-1":true, "Jacket-2":true} buydu.
    // Mesela Shoes-1 e tiklandi.Degeri true idi. Artik false degeri var.
    const toggleFavorite = (itemId, source = 'Search') => {
        setFavoriteItems(prev => {
            const newValue = prev[itemId] ? false : true;
            
            // Eğer favoriye ekleniyor ise source bilgisini kaydet
            if (newValue) {
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
            
            return {
                ...prev,
                [itemId]: newValue
            };
        });
    };

    return (
        <FavoritesContext.Provider value={{ favoriteItems, favoriteSource, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
