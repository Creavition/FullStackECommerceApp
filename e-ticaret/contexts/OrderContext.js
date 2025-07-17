import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orderHistory, setOrderHistory] = useState([]);

    // Sipariş geçmişini AsyncStorage'dan yükle
    const loadOrderHistory = async () => {
        try {
            const orders = await AsyncStorage.getItem('orderHistory');
            if (orders) {
                setOrderHistory(JSON.parse(orders));
            }
        } catch (error) {
            console.error('Error loading order history:', error);
        }
    };

    // Yeni sipariş ekle
    const addOrder = async (orderData) => {
        try {
            const newOrder = {
                id: Date.now().toString(),
                status: 'Hazırlanıyor',
                ...orderData
            };

            const updatedOrders = [newOrder, ...orderHistory];
            setOrderHistory(updatedOrders);

            await AsyncStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
            return newOrder;
        } catch (error) {
            console.error('Error adding order:', error);
            throw error;
        }
    };


    // Sipariş geçmişini temizle
    const clearOrderHistory = async () => {
        try {
            setOrderHistory([]);
            await AsyncStorage.removeItem('orderHistory');
        } catch (error) {
            console.error('Error clearing order history:', error);
        }
    };

    const value = {
        orderHistory,
        loadOrderHistory,
        addOrder,
        clearOrderHistory
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};

export { OrderContext };