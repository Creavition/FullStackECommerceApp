// contexts/FilterContext.js
import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext(); // context olusturma

export function FilterProvider({ children }) {
    const [filters, setFilters] = useState({
        minPrice: null,
        maxPrice: null,
        selectedCategory: null,
        selectedSizes: [],
    });

    const updateFilters = (newFilters) => {
        setFilters(prevFilters => ({
            ...prevFilters, //...prev: Mevcut filtrelerin hepsini alır.
            ...newFilters //Yeni gelen değerleri öncekilerin üzerine ezerek yazar.
        }));
    };

    const clearFilters = () => {
        setFilters({
            minPrice: null,
            maxPrice: null,
            selectedCategory: null,
            selectedSizes: [],
        });
    };

    const applyFilters = (filterData) => {
        setFilters({
            minPrice: filterData.minPrice,
            maxPrice: filterData.maxPrice,
            selectedCategory: filterData.selectedCategory,
            selectedSizes: filterData.selectedSizes || [],
        });
    };

    return (
        <FilterContext.Provider value={{
            filters,
            setFilters,
            updateFilters,
            clearFilters,
            applyFilters
        }}>
            {children}
        </FilterContext.Provider>
        // value kismi icerisinde belirtilen degiskenlere ve fonksiyonlara FilterContext altindaki yapilar (childrenlar) erisebilir.
    );
}

export const useFilter = () => useContext(FilterContext); // childrenlar useFilter kullanarak 
// const { filters, updateFilters } = useFilter(); gibi value icerisinde belirtilen ozelliklerden hepsini veya istenilen kadarini kullanabilir.
