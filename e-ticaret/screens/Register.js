// screens/Register.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { saveUser, registerUser } from "../utils/authStorage";

const { width, height } = Dimensions.get('window');

export default function Register({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Animation değerleri
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    React.useEffect(() => {
        // Sayfa yüklendiğinde animasyon
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const hasMinLength = (password) => password.length >= 6;
    const hasUpperCase = (password) => /[A-Z]/.test(password);
    const hasLowerCase = (password) => /[a-z]/.test(password);
    const hasNumber = (password) => /\d/.test(password);
    const passwordsMatch = (password, confirmPassword) => password === confirmPassword && password.length > 0;

    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Lütfen tüm alanları doldurun.';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Ad en az 2 karakter olmalıdır';
        }

        if (!email.trim()) {
            newErrors.email = 'Lütfen tüm alanları doldurun.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }

        if (!password.trim()) {
            newErrors.password = 'Lütfen tüm alanları doldurun.';
        } else if (password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalı';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Lütfen tüm alanları doldurun.';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        // Klavyeyi kapat
        Keyboard.dismiss();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await registerUser(name.trim(), email.trim(), password, confirmPassword);
            Alert.alert(
                'Başarılı',
                'Başarıyla Kayıt Olundu',
                [{
                    text: 'Tamam',
                    onPress: () => navigation.navigate('Login')
                }]
            );
        } catch (error) {
            const errorMessage = error.message || 'Kayıt Olunamadı';
            Alert.alert(
                'Hata',
                errorMessage,
                [{ text: 'Tamam' }]
            );
            console.error("Kayıt Hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    // Klavyeyi kapatma fonksiyonu
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#f7931e', '#ff6b35']}
                    style={styles.gradient}
                >
                    <KeyboardAvoidingView
                        style={styles.keyboardAvoidingView}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={0}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            bounces={false}
                            automaticallyAdjustKeyboardInsets={true}
                            contentInsetAdjustmentBehavior="automatic"
                        >
                            <Animated.View
                                style={[
                                    styles.formContainer,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{ translateY: slideAnim }]
                                    }
                                ]}
                            >
                                {/* Logo/Icon */}
                                <View style={styles.logoContainer}>
                                    <Ionicons name="person-add" size={80} color="#fff" />
                                </View>



                                {/* Form Card */}
                                <View style={styles.formCard}>
                                    {/* Name Input */}
                                    <View style={styles.inputContainer}>
                                        <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                                            <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder={'İsim'}
                                                value={name}
                                                onChangeText={setName}
                                                autoCapitalize="words"
                                                placeholderTextColor="#999"
                                                returnKeyType="next"
                                                blurOnSubmit={false}
                                            />
                                        </View>
                                        {errors.name && (
                                            <Text style={styles.errorText}>{errors.name}</Text>
                                        )}
                                    </View>

                                    {/* Email Input */}
                                    <View style={styles.inputContainer}>
                                        <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                                            <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder={'E-Mail'}
                                                value={email}
                                                onChangeText={setEmail}
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                                placeholderTextColor="#999"
                                                returnKeyType="next"
                                                blurOnSubmit={false}
                                            />
                                        </View>
                                        {errors.email && (
                                            <Text style={styles.errorText}>{errors.email}</Text>
                                        )}
                                    </View>

                                    {/* Password Input */}
                                    <View style={styles.inputContainer}>
                                        <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                                            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder={'Şifre'}
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry={!showPassword}
                                                placeholderTextColor="#999"
                                                returnKeyType="next"
                                                blurOnSubmit={false}
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => setShowPassword(!showPassword)}
                                            >
                                                <Ionicons
                                                    name={showPassword ? 'eye-off' : 'eye'}
                                                    size={20}
                                                    color="#666"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {errors.password && (
                                            <Text style={styles.errorText}>{errors.password}</Text>
                                        )}
                                    </View>

                                    {/* Confirm Password Input */}
                                    <View style={styles.inputContainer}>
                                        <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                                            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder={'Şifrenizi onaylayın'}
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                secureTextEntry={!showConfirmPassword}
                                                placeholderTextColor="#999"
                                                returnKeyType="done"
                                                onSubmitEditing={handleRegister}
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                <Ionicons
                                                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                                                    size={20}
                                                    color="#666"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {errors.confirmPassword && (
                                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                                        )}
                                    </View>

                                    {/* Password Requirements */}
                                    <View style={styles.requirementsContainer}>
                                        <View style={{ flexDirection: "row" }}>
                                            <View style={styles.requirementItem}>
                                                <Ionicons
                                                    name={hasMinLength(password) ? 'checkmark-circle' : 'close-circle'}
                                                    size={16}
                                                    color={hasMinLength(password) ? '#4CAF50' : '#f44336'}
                                                />
                                                <Text style={[styles.requirementText, { color: hasMinLength(password) ? '#4CAF50' : '#f44336' }]}>
                                                    En az 6 karakter
                                                </Text>
                                            </View>
                                            <View style={styles.requirementItem}>
                                                <Ionicons
                                                    name={hasUpperCase(password) ? 'checkmark-circle' : 'close-circle'}
                                                    size={16}
                                                    color={hasUpperCase(password) ? '#4CAF50' : '#f44336'}
                                                />
                                                <Text style={[styles.requirementText, { color: hasUpperCase(password) ? '#4CAF50' : '#f44336' }]}>
                                                    En az bir büyük harf
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: "row" }}>
                                            <View style={styles.requirementItem}>
                                                <Ionicons
                                                    name={hasLowerCase(password) ? 'checkmark-circle' : 'close-circle'}
                                                    size={16}
                                                    color={hasLowerCase(password) ? '#4CAF50' : '#f44336'}
                                                />
                                                <Text style={[styles.requirementText, { color: hasLowerCase(password) ? '#4CAF50' : '#f44336' }]}>
                                                    En az bir küçük harf
                                                </Text>
                                            </View>
                                            <View style={[styles.requirementItem]}>
                                                <Ionicons
                                                    name={hasNumber(password) ? 'checkmark-circle' : 'close-circle'}
                                                    size={16}
                                                    color={hasNumber(password) ? '#4CAF50' : '#f44336'}
                                                />
                                                <Text style={[styles.requirementText, { color: hasNumber(password) ? '#4CAF50' : '#f44336' }]}>
                                                    En az bir rakam
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.requirementItem}>
                                            <Ionicons
                                                name={passwordsMatch(password, confirmPassword) ? 'checkmark-circle' : 'close-circle'}
                                                size={16}
                                                color={passwordsMatch(password, confirmPassword) ? '#4CAF50' : '#f44336'}
                                            />
                                            <Text style={[styles.requirementText, { color: passwordsMatch(password, confirmPassword) ? '#4CAF50' : '#f44336' }]}>
                                                Şifreler eşleşiyor
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Register Button */}
                                    <TouchableOpacity
                                        style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                                        onPress={handleRegister}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {/* Login Link */}
                                <View style={styles.loginContainer}>
                                    <Text style={styles.loginText}>Zaten hesabınız var mı?</Text>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('Login')}
                                        style={styles.loginButton}
                                    >
                                        <Text style={styles.loginButtonText}>Giriş Yap</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </LinearGradient>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        minHeight: height,
        paddingVertical: 20,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        minHeight: height - 40,
    },
    logoContainer: {
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    sloganText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    inputContainer: {
        marginBottom: 20
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 15,
        height: 55,
    },
    inputError: {
        borderColor: '#f44336',
        backgroundColor: '#ffebee',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 5,
    },
    errorText: {
        color: '#f44336',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    requirementsContainer: {
        marginBottom: 20,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        marginRight: 60
    },
    requirementText: {
        fontSize: 12,
        marginLeft: 8,
    },
    registerButton: {
        backgroundColor: '#f7931e',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#f7931e',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    registerButtonDisabled: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
        elevation: 0,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    loginText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
    },
    loginButton: {
        marginLeft: 8,
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});