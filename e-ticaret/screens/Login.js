import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { findUser, setCurrentUser, loginUser } from '../utils/authStorage';

export default function Login({ navigation }) {
    // Hooks sıralaması sabit tutulmalı - React hooks kuralları
    const { width, height } = Dimensions.get('window');

    // State hooks - sıralama değişmemeli
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Ref hooks - animation optimizasyonu
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    // Performance optimization - memoized dimensions
    const dimensions = React.useMemo(() => ({ width, height }), [width, height]);

    // Effect hooks - dependency array'leri optimize edildi
    React.useEffect(() => {
        // Sayfa yüklendiğinde animasyon - sadece bir kez çalışır
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
    }, []); // Empty dependency array - sadece mount'ta çalışır

    // Memoized validation function - performance optimization
    const validateForm = React.useCallback(() => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Lütfen e-posta ve şifre girin.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }

        if (!password.trim()) {
            newErrors.password = 'Lütfen e-posta ve şifre girin.';
        } else if (password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalı';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [email, password]);

    const handleLogin = React.useCallback(async () => {
        // Klavyeyi kapat
        Keyboard.dismiss();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await loginUser(email.trim(), password);
            navigation.replace('HomeScreen');
        } catch (err) {
            Alert.alert(
                'Hata',
                err.message || 'Bir şeyler yanlış gitti',
                [{ text: 'Tamam' }]
            );
        } finally {
            setLoading(false);
        }
    }, [email, password, validateForm, navigation]);

    // Klavyeyi kapatma fonksiyonu
    const dismissKeyboard = React.useCallback(() => {
        Keyboard.dismiss();
    }, []);

    // Toggle password visibility
    const togglePasswordVisibility = React.useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // Navigate to register
    const navigateToRegister = React.useCallback(() => {
        navigation.navigate('Register');
    }, [navigation]);

    // Memoized styles - performance optimization
    const animatedStyle = React.useMemo(() => ({
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
    }), [fadeAnim, slideAnim]);

    const scrollContentStyle = React.useMemo(() => ({
        ...styles.scrollContent,
        minHeight: dimensions.height,
    }), [dimensions.height]);

    const formContainerStyle = React.useMemo(() => ({
        ...styles.formContainer,
        minHeight: dimensions.height - 40,
    }), [dimensions.height]);

    // KeyboardAvoidingView optimization - memoized behavior
    const keyboardBehavior = React.useMemo(() =>
        Platform.OS === 'ios' ? 'padding' : 'height'
        , []);

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#ff6b35', '#f7931e']}
                    style={styles.gradient}
                >
                    <KeyboardAvoidingView
                        style={styles.keyboardAvoidingView}
                        behavior={keyboardBehavior}
                        keyboardVerticalOffset={0}
                        enabled={true}
                    >
                        <ScrollView
                            contentContainerStyle={scrollContentStyle}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            bounces={false}
                            automaticallyAdjustKeyboardInsets={true}
                            contentInsetAdjustmentBehavior="automatic"
                        >
                            <Animated.View
                                style={[
                                    formContainerStyle,
                                    animatedStyle
                                ]}
                            >
                                {/* Logo/Icon */}
                                <View style={styles.logoContainer}>
                                    <Image style={{ width: 150, height: 150 }} source={require("../assets/images/KombinSepeti-logo.png")} />
                                </View>

                                {/* Welcome Slogan */}
                                <Text style={styles.sloganText}>Gardırobunuza bir adım kaldı</Text>

                                {/* Form Card */}
                                <View style={styles.formCard}>
                                    {/* Email Input */}
                                    <View style={styles.inputContainer}>
                                        <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                                            <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="E-posta adresi"
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
                                                placeholder="Şifre"
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry={!showPassword}
                                                placeholderTextColor="#999"
                                                returnKeyType="done"
                                                onSubmitEditing={handleLogin}
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={togglePasswordVisibility}
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

                                    {/* Login Button */}
                                    <TouchableOpacity
                                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                        onPress={handleLogin}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.loginButtonText}>Giriş Yap</Text>
                                        )}
                                    </TouchableOpacity>


                                </View>

                                {/* Register Link */}
                                <View style={styles.registerContainer}>
                                    <Text style={styles.registerText}>Hesabınız yok mu?</Text>
                                    <TouchableOpacity
                                        onPress={navigateToRegister}
                                        style={styles.registerButton}
                                    >
                                        <Text style={styles.registerButtonText}>Kayıt Ol</Text>
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
        paddingVertical: 20,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(216, 173, 190, 0.1)',
        borderWidth: 1,
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
        fontSize: 20,
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
        marginBottom: 20,
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
    loginButton: {
        backgroundColor: '#ff6b35',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#ff6b35',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonDisabled: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 15,
    },
    forgotPasswordText: {
        color: '#ff6b35',
        fontSize: 14,
        fontWeight: '500',
    },
    registerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
    },
    registerText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
    },
    registerButton: {
        marginLeft: 8,
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
