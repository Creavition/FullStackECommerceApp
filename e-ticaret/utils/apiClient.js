// utils/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL configuration
const BASE_URL = 'http://192.168.1.210:5207';

// API endpoints
export const API_ENDPOINTS = {
    AUTH: `${BASE_URL}/Auth`,
    API: `${BASE_URL}/api`,
    PRODUCT: `${BASE_URL}/api/Product`,
    CATEGORY: `${BASE_URL}/api/Category`,
    ADDRESS: `${BASE_URL}/api/Address`,
    CREDIT_CARD: `${BASE_URL}/api/CreditCard`,
    REVIEW: `${BASE_URL}/api/Review`
};

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
                    }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear storage
            try {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('currentUser');
            } catch (storageError) {
                            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
