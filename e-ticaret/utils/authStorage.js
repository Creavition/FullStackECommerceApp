// utils/authStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as base64Decode } from 'base-64';
import apiClient, { API_ENDPOINTS } from './apiClient';

// Auth token'ı al
export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};



// Giriş yapan kullanıcıyı oturumda tut
export const setCurrentUser = async (user) => {
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
};

// Oturumdaki kullanıcıyı al
export const getCurrentUser = async () => {
    try {
        // Önce token'dan almaya çalış
        const userFromToken = await getCurrentUserFromToken();
        if (userFromToken) {
            return userFromToken;
        }

        // Token yoksa AsyncStorage'dan al
        const data = await AsyncStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// Oturumu sil (logout)
export const clearCurrentUser = async () => {
    await AsyncStorage.removeItem('currentUser');
    await AsyncStorage.removeItem('authToken');
};

// API ile kullanici girisi
export const loginUser = async (email, password) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINTS.AUTH}/login`, { email, password });

        const { token } = response.data;
        if (!token) {
            throw new Error('Token not received from server');
        }

        await AsyncStorage.setItem('authToken', token);

        // Token'dan kullanıcı bilgilerini al ve AsyncStorage'a kaydet
        const userInfo = await getCurrentUserFromToken();
        if (userInfo) {
            await AsyncStorage.setItem('currentUser', JSON.stringify(userInfo));
        }

        return response.data;
    } catch (error) {
        // Console error mesajını kaldırdık

        // Error mesajını düzgün şekilde handle et
        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                throw new Error(error.response.data);
            } else if (error.response.data.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Login failed');
            }
        } else {
            throw new Error(error.message || 'Network error occurred');
        }
    }
};

// API ile kayit olma
export const registerUser = async (name, email, password, rePassword) => {
    try {
        console.log('API Request URL:', `${API_ENDPOINTS.AUTH}/register`);
        console.log('Request Data:', { name, email, password, rePassword });

        const response = await apiClient.post(`${API_ENDPOINTS.AUTH}/register`, {
            name,
            email,
            password,
            rePassword
        });

        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Registration failed');
    }
};

// Get current user from JWT token
export const getCurrentUserFromToken = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return null;

        // JWT token'ın payload kısmını decode et
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = base64Decode(base64);
        const payload = JSON.parse(jsonPayload);

        // Token'ın süresi dolmuş mu kontrol et
        if (payload.exp * 1000 < Date.now()) {
            await AsyncStorage.removeItem('authToken');
            return null;
        }

        const userInfo = {
            id: payload.sub || payload.nameid || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            name: payload.unique_name || payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        };

        return userInfo;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Token varsa useri cek
export const isAuthenticated = async () => {
    const user = await getCurrentUserFromToken();
    return user !== null;
};

// API ile sifre degisme
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await apiClient.post(`${API_ENDPOINTS.AUTH}/change-password`, {
            currentPassword,
            newPassword,
            confirmPassword
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Password change failed');
    }
};