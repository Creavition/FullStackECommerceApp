import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

// Çeviri metinleri
const translations = {
    en: {
        // Account Screen
        account: 'Account',
        loading: 'Loading...',
        welcome: "Welcome",
        welcomeToKombinSepeti: "Welcome to KombinSepeti",
        personalInfo: 'Personal Information',
        fullName: 'Full Name',
        email: 'Email',
        memberSince: 'Member Since',
        orderHistory: 'Order History',
        changePassword: 'Change Password',
        changeLanguage: 'Change Language',
        logout: 'Logout',
        logoutConfirmTitle: 'Logout',
        logoutConfirmMessage: 'Are you sure you want to logout?',
        cancel: 'Cancel',
        appVersion: 'App Version',
        madeWith: 'Made with',

        // Order History
        noOrders: 'No Orders Yet',
        noOrdersMessage: 'You haven\'t placed any orders yet.',
        items: 'items',
        viewDetails: 'View Details',
        orderDetails: 'Order Details',
        orderDate: 'Order Date',
        status: 'Status',
        paymentMethod: 'Payment Method',
        orderedItems: 'Ordered Items',
        size: 'Size',
        quantity: 'Quantity',
        total: 'Total',

        // Change Password
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmNewPassword: 'Confirm New Password',
        enterCurrentPassword: 'Enter your current password',
        enterNewPassword: 'Enter new password',
        passwordChangeInfo: 'For security reasons, please enter your current password to change to a new password.',
        passwordRequirements: 'Password Requirements',
        atLeast6Characters: 'At least 6 characters',
        passwordsMatch: 'Passwords match',
        changing: 'Changing',

        // Errors and Messages
        error: 'Error',
        success: 'Success',
        fillAllFields: 'Please fill in all fields',
        passwordsDoNotMatch: 'Passwords do not match',
        passwordTooShort: 'Password must be at least 6 characters',
        userNotFound: 'User not found',
        currentPasswordWrong: 'Current password is incorrect',
        passwordChangedSuccessfully: 'Password changed successfully',
        somethingWentWrong: 'Something went wrong',
        ok: 'OK',

        // General
        home: 'Home',
        favorites: 'Favorites',
        cart: 'Cart',
        profile: 'Profile',
        search: 'Search',
        filter: 'Filter',
        sortBy: 'Sort By',
        price: 'Price',
        category: 'Category',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        checkout: 'Checkout',
        payment: 'Payment',
        login: 'Login',
        register: 'Register',
        rememberMe: 'Remember Me',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: 'Don\'t have an account?',
        getStarted: 'Get Started',
        continueWithEmail: 'Continue with Email',
        or: 'or',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        aboutUs: 'About Us',
        contactUs: 'Contact Us',
        help: 'Help',
        settings: 'Settings',
        notifications: 'Notifications',
        language: 'Language',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        theme: 'Theme',
        version: 'Version',
        rateApp: 'Rate App',
        shareApp: 'Share App',
        feedback: 'Feedback',

        // Login & Register
        nameLabel: 'Name',
        emailLabel: 'Email address',
        passwordLabel: 'Password',
        confirmPasswordLabel: 'Confirm your password',
        loginButton: 'Login',
        registerButton: 'Register',
        loginSlogan: 'Your wardrobe is just one click away.',
        registerSlogan: 'Join your style',
        warning: 'Warning',
        pleaseEnterEmailPassword: 'Please enter email and password.',
        loginFailed: 'Login Failed',
        emailPasswordIncorrect: 'Email or password is incorrect.',
        pleaseEnterAllFields: 'Please fill in all fields.',
        passwordsDoNotMatch: 'Passwords do not match!',
        registrationSuccessful: 'Registration successful! You can now login.',
        loginSuccessful: 'Login successful! Welcome back.',
        emailAlreadyExists: 'This email is already registered.',
        registrationError: 'An error occurred during registration.',

        // Cart
        yourCartEmpty: 'Your Cart is Empty',
        noItemsInCart: 'You haven\'t added any items to your cart yet',
        continueShopping: 'Continue Shopping',
        totalAmount: 'Total Amount',
        proceedToPayment: 'Proceed to Payment',
        removeFromCart: 'Remove from Cart',
        increase: 'Increase',
        decrease: 'Decrease',

        // Home & Products
        searchForProducts: 'Search for products',
        lowestPrice: 'Lowest Price',
        highestPrice: 'Highest Price',
        flashSale: 'FLASH SALE',
        bestSelling: 'BEST SELLING',
        bestSellingLine1: 'BEST',        // İlk satır için
        bestSellingLine2: 'SELLING',     // İkinci satır için
        fastDelivery: 'Fast Delivery',
        bestSeller: 'Best Seller',
        products: 'products',
        viewAll: 'View All',
        productsFound: 'products found',
        noProductsFound: 'No products found',
        allProducts: 'All Products',

        // Product Detail
        productDetail: 'Product Detail',
        sizeOptions: 'Size Options',
        addedToCart: 'Added to Cart ✓',
        productAddedToCart: 'Product added to cart!',
        goToCart: 'Go to Cart',
        pleaseSelectSize: 'Please select a size',
        sizeNotAvailable: 'This size is not available',

        // Filter
        minAmount: 'Min Amount',
        maxAmount: 'Max Amount',
        sizeOptionsFilter: 'Size Options',
        selectCategory: 'Please select a category',
        clear: 'Clear',
        apply: 'Apply',

        // Product Categories
        jacket: 'Jacket',
        pants: 'Pants',
        shoes: 'Shoes',
        tshirt: 'T-Shirt',

        //Favorites
        favoritesText: "You don't have any favorite products yet.",
        favoritesProduct: "Product",

        // Payment
        name: 'Name Surname',
        paymentInformation: 'Payment Information',
        orderSummary: 'Order Summary',
        payNow: 'Pay Now',
        processing: 'Processing...',
        paymentSuccessful: 'Payment completed successfully! Your order has been confirmed.',
        viewOrderHistory: 'View Order History',
        backToHome: 'Back to Home',
        paymentError: 'An error occurred during payment.',
        yourPaymentSecure: 'Your payment information is secure and encrypted',
        cartEmpty: 'Your cart is empty!',
        pleaseSelectCard: 'Please select a card!',
        pleaseSelectAddress: 'Please select a delivery address!',

        // Credit Card
        creditCard: 'CREDIT CARD',
        nameSurname: 'Name Surname',
        cardNumber: 'Card Number',
        expiryMMYY: 'Expiry (MM/YY)',
        cvv: 'CVV',

        // Order History Additional
        startShopping: 'Start Shopping',
        clearHistory: 'Clear History',
        clearHistoryConfirm: 'Are you sure you want to clear all order history? This action cannot be undone.',
        historyCleared: 'Order history has been cleared successfully.',
        clearHistoryError: 'Failed to clear order history. Please try again.',

        // Reviews and Ratings
        rateProduct: 'Rate Product',
        viewReviews: 'View Reviews',
        writeReview: 'Write Review',
        submitReview: 'Submit Review',
        reviewSubmitted: 'Review submitted successfully!',
        pleaseSelectRating: 'Please select a rating',
        pleaseWriteReview: 'Please write a review',
        reviews: 'Reviews',
        noReviews: 'No reviews yet',
        beFirstToReview: 'Be the first to review this product',
        stars: 'stars',
        star: 'star',
        reviewPlaceholder: 'Write your review here...',
        reviewTooLong: 'Review can be maximum 1000 characters.',
        pleaseLogin: 'Please login and try again.',
        invalidSession: 'Invalid session. Please login again.',
        sessionExpired: 'Your session has expired. Please login again.',
        reviewError: 'An error occurred. Please try again.',
        yourRating: 'Your Rating',
        yourReview: 'Your Review',
        giveRating: 'Give a rating',
        veryBad: 'Very Bad',
        bad: 'Bad',
        average: 'Average',
        good: 'Good',
        excellent: 'Excellent',
        reviewPlaceholderText: 'Share your thoughts about this product...',
        characters: 'characters',
        sending: 'Sending...',
        send: 'Send',

        // Additional UI Elements
        close: 'Close',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        update: 'Update',
        add: 'Add',
        remove: 'Remove',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
    },
    tr: {
        // Account Screen
        account: 'Hesap',
        loading: 'Yükleniyor...',
        welcome: "Hoşgeldin",
        welcomeToKombinSepeti: "KombinSepeti'ne Hoşgeldiniz",
        personalInfo: 'Kişisel Bilgiler',
        fullName: 'Ad Soyad',
        email: 'E-posta',
        memberSince: 'Üye Olma Tarihi',
        orderHistory: 'Sipariş Geçmişi',
        changePassword: 'Şifre Değiştir',
        changeLanguage: 'Dil Değiştir',
        logout: 'Çıkış Yap',
        logoutConfirmTitle: 'Çıkış Yap',
        logoutConfirmMessage: 'Çıkış yapmak istediğinizden emin misiniz?',
        cancel: 'İptal',
        appVersion: 'Uygulama Sürümü',
        madeWith: 'İle yapıldı',

        // Order History
        noOrders: 'Henüz Sipariş Yok',
        noOrdersMessage: 'Henüz herhangi bir sipariş vermediniz.',
        items: 'ürün',
        viewDetails: 'Detayları Gör',
        orderDetails: 'Sipariş Detayları',
        orderDate: 'Sipariş Tarihi',
        status: 'Durum',
        paymentMethod: 'Ödeme Yöntemi',
        orderedItems: 'Sipariş Edilen Ürünler',
        size: 'Beden',
        quantity: 'Adet',
        total: 'Toplam',

        // Change Password
        currentPassword: 'Mevcut Şifre',
        newPassword: 'Yeni Şifre',
        confirmNewPassword: 'Yeni Şifre Tekrar',
        enterCurrentPassword: 'Mevcut şifrenizi girin',
        enterNewPassword: 'Yeni şifrenizi girin',
        passwordChangeInfo: 'Güvenlik nedeniyle, yeni şifrenizi değiştirmek için mevcut şifrenizi girmeniz gerekmektedir.',
        passwordRequirements: 'Şifre Gereksinimleri',
        atLeast6Characters: 'En az 6 karakter',
        passwordsMatch: 'Şifreler eşleşiyor',
        changing: 'Değiştiriliyor',

        // Errors and Messages
        error: 'Hata',
        success: 'Başarılı',
        fillAllFields: 'Lütfen tüm alanları doldurun',
        passwordsDoNotMatch: 'Şifreler eşleşmiyor',
        passwordTooShort: 'Şifre en az 6 karakter olmalıdır',
        userNotFound: 'Kullanıcı bulunamadı',
        currentPasswordWrong: 'Mevcut şifre yanlış',
        passwordChangedSuccessfully: 'Şifre başarıyla değiştirildi',
        somethingWentWrong: 'Bir şeyler yanlış gitti',
        ok: 'Tamam',

        // General
        home: 'Ana Sayfa',
        favorites: 'Favoriler',
        cart: 'Sepet',
        profile: 'Profil',
        search: 'Ara',
        filter: 'Filtre',
        sortBy: 'Sırala',
        price: 'Fiyat',
        category: 'Kategori',
        addToCart: 'Sepete Ekle',
        buyNow: 'Hemen Al',
        checkout: 'Satın Al',
        payment: 'Ödeme',
        login: 'Giriş Yap',
        register: 'Kayıt Ol',
        rememberMe: 'Beni Hatırla',
        alreadyHaveAccount: 'Zaten hesabınız var mı?',
        dontHaveAccount: 'Hesabınız yok mu?',
        getStarted: 'Başlayın',
        continueWithEmail: 'E-posta ile Devam Et',
        or: 'veya',
        terms: 'Kullanım Şartları',
        privacy: 'Gizlilik Politikası',
        aboutUs: 'Hakkımızda',
        contactUs: 'İletişim',
        help: 'Yardım',
        settings: 'Ayarlar',
        notifications: 'Bildirimler',
        language: 'Dil',
        darkMode: 'Karanlık Mod',
        lightMode: 'Aydınlık Mod',
        theme: 'Tema',
        version: 'Sürüm',
        rateApp: 'Uygulamayı Değerlendir',
        shareApp: 'Uygulamayı Paylaş',
        feedback: 'Geri Bildirim',

        // Login & Register
        nameLabel: 'Ad',
        emailLabel: 'E-posta adresi',
        passwordLabel: 'Şifre',
        confirmPasswordLabel: 'Şifrenizi doğrulayın',
        loginButton: 'Giriş Yap',
        registerButton: 'Kayıt Ol',
        loginSlogan: 'Gardırobunuz sadece bir tık uzağınızda.',
        registerSlogan: 'Stilinize katılın',
        warning: 'Uyarı',
        pleaseEnterEmailPassword: 'Lütfen e-posta ve şifre girin.',
        loginFailed: 'Giriş Başarısız',
        emailPasswordIncorrect: 'E-posta veya şifre yanlış.',
        pleaseEnterAllFields: 'Lütfen tüm alanları doldurun.',
        passwordsDoNotMatch: 'Şifreler eşleşmiyor!',
        registrationSuccessful: 'Kayıt başarılı! Artık giriş yapabilirsiniz.',
        loginSuccessful: 'Giriş başarılı! Hoş geldiniz.',
        emailAlreadyExists: 'Bu e-posta zaten kayıtlı.',
        registrationError: 'Kayıt sırasında bir hata oluştu.',

        // Cart
        yourCartEmpty: 'Sepetiniz Boş',
        noItemsInCart: 'Henüz sepetinize ürün eklemediniz',
        continueShopping: 'Alışverişe Devam Et',
        totalAmount: 'Toplam Tutar',
        proceedToPayment: 'Ödeme Sayfasına Git',
        removeFromCart: 'Sepetten Çıkar',
        increase: 'Artır',
        decrease: 'Azalt',

        // Home & Products
        searchForProducts: 'Ürün ara',
        lowestPrice: 'En Düşük Fiyat',
        highestPrice: 'En Yüksek Fiyat',
        flashSale: 'FLASH İNDİRİM',
        bestSelling: 'EN ÇOK SATAN',
        bestSellingLine1: 'EN ÇOK',      // İlk satır için
        bestSellingLine2: 'SATAN',       // İkinci satır için
        fastDelivery: 'Hızlı Teslimat',
        bestSeller: 'En Çok Satan',
        products: 'ürün',
        viewAll: 'Tümü',
        productsFound: 'ürün bulundu',
        noProductsFound: 'Ürün bulunamadı',
        allProducts: 'Tüm Ürünler',

        // Product Detail
        productDetail: 'Ürün Detayı',
        sizeOptions: 'Beden Seçenekleri',
        addedToCart: 'Sepete Eklendi ✓',
        productAddedToCart: 'Ürün sepete eklendi!',
        goToCart: 'Sepete Git',
        pleaseSelectSize: 'Lütfen bir beden seçin',
        sizeNotAvailable: 'Bu beden mevcut değil',

        // Filter
        minAmount: 'Min Tutar',
        maxAmount: 'Max Tutar',
        sizeOptionsFilter: 'Beden Seçenekleri',
        selectCategory: 'Lütfen bir kategori seçin',
        clear: 'Temizle',
        apply: 'Uygula',

        // Product Categories
        jacket: 'Ceket',
        pants: 'Pantolon',
        shoes: 'Ayakkabı',
        tshirt: 'Tişört',

        //Favorites
        favoritesText: "Henüz favori ürününüz yok",
        favoritesProduct: "Ürün",

        // Payment
        paymentInformation: 'Ödeme Bilgileri',
        orderSummary: 'Sipariş Özeti',
        payNow: 'Şimdi Öde',
        processing: 'İşleniyor...',
        paymentSuccessful: 'Ödemeniz başarıyla tamamlandı! Siparişiniz onaylandı.',
        viewOrderHistory: 'Sipariş Geçmişini Gör',
        backToHome: 'Ana Sayfaya Dön',
        paymentError: 'Ödeme işlemi sırasında bir hata oluştu.',
        yourPaymentSecure: 'Ödeme bilgileriniz güvenli ve şifrelidir',
        cartEmpty: 'Sepetiniz boş!',
        pleaseSelectCard: 'Lütfen bir kart seçin!',
        pleaseSelectAddress: 'Lütfen bir teslimat adresi seçin!',

        // Credit Card
        creditCard: 'KREDİ KARTI',
        nameSurname: 'Ad Soyad',
        cardNumber: 'Kart Numarası',
        expiryMMYY: 'Son Kullanma (AA/YY)',
        cvv: 'CVV',

        // Order History Additional
        startShopping: 'Alışverişe Başla',
        clearHistory: 'Geçmişi Temizle',
        clearHistoryConfirm: 'Tüm sipariş geçmişini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
        historyCleared: 'Sipariş geçmişi başarıyla temizlendi.',
        clearHistoryError: 'Sipariş geçmişi temizlenirken hata oluştu. Lütfen tekrar deneyin.',

        // Reviews and Ratings
        rateProduct: 'Ürünü Değerlendir',
        viewReviews: 'Değerlendirmeleri Gör',
        writeReview: 'Değerlendirme Yaz',
        submitReview: 'Değerlendirmeyi Gönder',
        reviewSubmitted: 'Değerlendirmeniz başarıyla gönderildi!',
        pleaseSelectRating: 'Lütfen bir puan verin.',
        pleaseWriteReview: 'Lütfen bir yorum yazın.',
        reviews: 'Değerlendirmeler',
        noReviews: 'Henüz değerlendirme yok',
        beFirstToReview: 'Bu ürünü değerlendiren ilk kişi olun',
        stars: 'yıldız',
        star: 'yıldız',
        reviewPlaceholder: 'Değerlendirmenizi buraya yazın...',
        reviewTooLong: 'Yorum en fazla 1000 karakter olabilir.',
        pleaseLogin: 'Lütfen giriş yapın ve tekrar deneyin.',
        invalidSession: 'Geçersiz oturum. Lütfen tekrar giriş yapın.',
        sessionExpired: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
        reviewError: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        yourRating: 'Puanınız',
        yourReview: 'Yorumunuz',
        giveRating: 'Puan verin',
        veryBad: 'Çok Kötü',
        bad: 'Kötü',
        average: 'Orta',
        good: 'İyi',
        excellent: 'Mükemmel',
        reviewPlaceholderText: 'Bu ürün hakkındaki düşüncelerinizi paylaşın...',
        characters: 'karakter',
        sending: 'Gönderiliyor...',
        send: 'Gönder',

        // Additional UI Elements
        close: 'Kapat',
        edit: 'Düzenle',
        delete: 'Sil',
        save: 'Kaydet',
        update: 'Güncelle',
        add: 'Ekle',
        remove: 'Kaldır',
        confirm: 'Onayla',
        yes: 'Evet',
        no: 'Hayır',
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('tr');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
            if (savedLanguage) {
                setLanguage(savedLanguage);
            }
        } catch (error) {
            console.error('Error loading language:', error);
        }
    };

    const changeLanguage = async (newLanguage) => {
        try {
            setLanguage(newLanguage);
            await AsyncStorage.setItem('selectedLanguage', newLanguage);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const toggleLanguage = () => {
        const newLanguage = language === 'en' ? 'tr' : 'en';
        changeLanguage(newLanguage);
    };

    const value = {
        language,
        translations: translations[language],
        changeLanguage,
        toggleLanguage,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};