import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Animated,
    StatusBar,
    Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onAnimationEnd }) => {
    const logoAnimation = useRef(new Animated.Value(-width)).current;
    const fadeAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Logo soldan sağa animasyonu
        Animated.sequence([
            Animated.timing(logoAnimation, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(fadeAnimation, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onAnimationEnd && onAnimationEnd();
        });
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnimation }]}>
            <Image
                source={require('../assets/images/KombinSepeti-logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        position: 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#FF8C42', // Turuncu arka plan
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: '#FF8C42', // Turuncu arka plan
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: 200,
        height: 200,
    },
});

export default SplashScreen;