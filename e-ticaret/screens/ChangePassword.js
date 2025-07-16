import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { changePassword } from '../utils/authStorage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();
    const { theme, isDarkMode } = useTheme();

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Şifre en az 6 karakter olmalı');
            return;
        }

        setLoading(true);

        try {
            await changePassword(currentPassword, newPassword, confirmPassword);

            Alert.alert(
                'Başarılı',
                'Şifre başarıyla değiştirildi',
                [{
                    text: 'Tamam',
                    onPress: () => navigation.goBack()
                }]
            );

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error) {
            console.error('Password change error:', error);
            Alert.alert('Hata', error.message || 'Bir şeyler yanlış gitti');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#f8f9fa' }]}>
            <TouchableOpacity
                style={styles.closeButtonTopLeft}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1a2a3a' : '#e3f2fd' }]}>
                    <Ionicons name="information-circle" size={20} color="#ce6302" />
                    <Text style={[styles.infoText, { color: isDarkMode ? '#ce6302' : '#ce6302' }]}>'Güvenlik nedeniyle, yeni şifreye geçmek için mevcut şifrenizi girin.'</Text>
                </View>

                <View style={[styles.form, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
                    {/* Current Password */}
                    <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#333' }]}>'Mevcut Şifre'</Text>
                    <View style={[styles.passwordContainer, { borderColor: isDarkMode ? '#555' : '#ddd', backgroundColor: isDarkMode ? '#444' : '#f9f9f9' }]}>
                        <TextInput
                            style={[styles.passwordInput, { color: isDarkMode ? '#fff' : '#333' }]}
                            placeholder={'Mevcut şifrenizi girin'}
                            secureTextEntry={!showCurrentPassword}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholderTextColor={isDarkMode ? '#888' : '#999'}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            <Ionicons
                                name={showCurrentPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color={isDarkMode ? '#b3b3b3' : '#666'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* New Password */}
                    <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#333' }]}>Yeni Şifre</Text>
                    <View style={[styles.passwordContainer, { borderColor: isDarkMode ? '#555' : '#ddd', backgroundColor: isDarkMode ? '#444' : '#f9f9f9' }]}>
                        <TextInput
                            style={[styles.passwordInput, { color: isDarkMode ? '#fff' : '#333' }]}
                            placeholder={'Yeni şifre girin'}
                            secureTextEntry={!showNewPassword}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholderTextColor={isDarkMode ? '#888' : '#999'}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowNewPassword(!showNewPassword)}
                        >
                            <Ionicons
                                name={showNewPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color={isDarkMode ? '#b3b3b3' : '#666'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#333' }]}>Yeni Şifreyi Onayla</Text>
                    <View style={[styles.passwordContainer, { borderColor: isDarkMode ? '#555' : '#ddd', backgroundColor: isDarkMode ? '#444' : '#f9f9f9' }]}>
                        <TextInput
                            style={[styles.passwordInput, { color: isDarkMode ? '#fff' : '#333' }]}
                            placeholder={'Yeni Şifreyi Onayla'}
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholderTextColor={isDarkMode ? '#888' : '#999'}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color={isDarkMode ? '#b3b3b3' : '#666'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Password Requirements */}
                    <View style={[styles.requirementsContainer, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}>
                        <Text style={[styles.requirementsTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Şifre Gereksinimleri:</Text>
                        <View style={styles.requirement}>
                            <Ionicons
                                name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                                size={16}
                                color={newPassword.length >= 6 ? "#4CAF50" : isDarkMode ? "#666" : "#ccc"}
                            />
                            <Text style={[
                                styles.requirementText,
                                { color: isDarkMode ? '#b3b3b3' : '#666' },
                                newPassword.length >= 6 && styles.requirementMet
                            ]}>
                                En az 6 karakter
                            </Text>
                        </View>
                        <View style={styles.requirement}>
                            <Ionicons
                                name={newPassword === confirmPassword && newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"}
                                size={16}
                                color={newPassword === confirmPassword && newPassword.length > 0 ? "#4CAF50" : isDarkMode ? "#666" : "#ccc"}
                            />
                            <Text style={[
                                styles.requirementText,
                                { color: isDarkMode ? '#b3b3b3' : '#666' },
                                newPassword === confirmPassword && newPassword.length > 0 && styles.requirementMet
                            ]}>
                                Şifreler eşleşiyor
                            </Text>
                        </View>
                    </View>

                    {/* Change Password Button */}
                    <TouchableOpacity
                        style={[styles.changeButton, loading && styles.disabledButton]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="lock-closed" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Mevcut Şifre</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    content: {
        padding: 20,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#1976d2',
        lineHeight: 20,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    passwordInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 15,
    },
    requirementsContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    requirement: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    requirementText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    requirementMet: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    changeButton: {
        backgroundColor: '#ce6302',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    disabledButton: {
        backgroundColor: '#ce6302',
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

});
