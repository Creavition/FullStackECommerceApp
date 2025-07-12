import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// Theme color palettes
const themes = {
    light: {
        // Backgrounds
        background: '#f8f9fa',
        surface: '#ffffff',
        card: '#ffffff',

        // Text colors
        text: '#333333',
        textSecondary: '#666666',
        textTertiary: '#999999',

        // Primary colors
        primary: '#FF6B35',
        primaryLight: '#ff8a5c',
        primaryDark: '#e55a2b',

        // UI elements
        border: '#e0e0e0',
        borderLight: '#f0f0f0',
        shadow: '#000000',

        // Status colors
        success: '#2ED573',
        error: '#ff4444',
        warning: '#ffa726',
        info: '#42a5f5',

        // Special colors
        gradient: ['#ff6b35', '#f7931e'],
        overlay: 'rgba(0, 0, 0, 0.5)',

        // Status bar
        statusBarStyle: 'dark-content',
        statusBarBackground: '#ffffff',
    },
    dark: {
        // Backgrounds
        background: '#121212',
        surface: '#1e1e1e',
        card: '#2d2d2d',

        // Text colors
        text: '#ffffff',
        textSecondary: '#b3b3b3',
        textTertiary: '#808080',

        // Primary colors
        primary: '#FF6B35',
        primaryLight: '#ff8a5c',
        primaryDark: '#e55a2b',

        // UI elements
        border: '#333333',
        borderLight: '#404040',
        shadow: '#000000',

        // Status colors
        success: '#2ED573',
        error: '#ff4444',
        warning: '#ffa726',
        info: '#42a5f5',

        // Special colors
        gradient: ['#ff6b35', '#f7931e'],
        overlay: 'rgba(0, 0, 0, 0.7)',

        // Status bar
        statusBarStyle: 'light-content',
        statusBarBackground: '#1e1e1e',
    }
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('selectedTheme');
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            await AsyncStorage.setItem('selectedTheme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const setTheme = async (themeName) => {
        try {
            const newIsDarkMode = themeName === 'dark';
            setIsDarkMode(newIsDarkMode);
            await AsyncStorage.setItem('selectedTheme', themeName);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const currentTheme = isDarkMode ? themes.dark : themes.light;

    const value = {
        isDarkMode,
        theme: currentTheme,
        themes,
        toggleTheme,
        setTheme,
        isLoading,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
