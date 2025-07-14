// utils/authStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { decode as base64Decode } from 'base-64';

const API_BASE_URL = 'http://192.168.1.210:5207/Auth';

// Auth token'ı al
export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

// Tüm kullanıcıları getir
export const getAllUsers = async () => {
    const usersData = await AsyncStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [];
};

// Yeni kullanıcı kaydet
export const saveUser = async (name, email, password) => {
    const users = await getAllUsers();

    const emailExists = users.some(u => u.email === email);
    if (emailExists) {
        throw new Error("Bu e-posta zaten kayıtlı.");
    }

    const newUser = { name, email, password };
    users.push(newUser);

    await AsyncStorage.setItem('users', JSON.stringify(users));
};

// Giriş yapan kullanıcıyı bul
export const findUser = async (email, password) => {
    const users = await getAllUsers();
    return users.find(u => u.email === email && u.password === password) || null;
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

// Login user via API
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

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

// Register user via API
export const registerUser = async (name, email, password, rePassword) => {
    try {
        console.log('API Request URL:', `${API_BASE_URL}/register`);
        console.log('Request Data:', { name, email, password, rePassword });

        const response = await axios.post(`${API_BASE_URL}/register`, {
            name,
            email,
            password,
            rePassword
        });

        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Registration API Error:', error);
        console.error('Error Response:', error.response?.data);
        console.error('Error Status:', error.response?.status);
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

// Check if user is authenticated
export const isAuthenticated = async () => {
    const user = await getCurrentUserFromToken();
    return user !== null;
};

// Change password via API
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.post(`${API_BASE_URL}/change-password`, {
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
        console.error('Change password API Error:', error);
        throw new Error(error.response?.data || 'Password change failed');
    }
};
