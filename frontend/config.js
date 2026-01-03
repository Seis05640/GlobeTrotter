// ===================================
// GlobeTrotter - API Configuration
// ===================================

/**
 * IMPORTANT: Replace placeholder values with your actual API keys
 * 
 * How to obtain API keys:
 * 
 * 1. Firebase (for OTP Authentication):
 *    - Go to https://console.firebase.google.com/
 *    - Create a new project or select existing
 *    - Enable Authentication > Phone
 *    - Copy your config from Project Settings
 * 
 * 2. Google Places API:
 *    - Go to https://console.cloud.google.com/
 *    - Enable "Places API"
 *    - Create credentials (API Key)
 *    - Restrict key to Places API
 * 
 * 3. Unsplash API:
 *    - Go to https://unsplash.com/developers
 *    - Create a new application
 *    - Copy your Access Key
 * 
 * 4. ExchangeRate API:
 *    - Go to https://www.exchangerate-api.com/
 *    - Sign up for free tier
 *    - Copy your API key
 */

const CONFIG = {
    // Environment
    ENV: 'development', // 'development' or 'production'

    // Firebase Configuration
    FIREBASE: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    },

    // Google Places API
    GOOGLE_PLACES_API_KEY: "YOUR_GOOGLE_PLACES_API_KEY",

    // Unsplash API
    UNSPLASH_ACCESS_KEY: "YOUR_UNSPLASH_ACCESS_KEY",

    // ExchangeRate API
    EXCHANGE_RATE_API_KEY: "YOUR_EXCHANGE_RATE_API_KEY",
    EXCHANGE_RATE_BASE_URL: "https://v6.exchangerate-api.com/v6",

    // Feature Flags
    FEATURES: {
        REAL_OTP: false, // Set to true when Firebase is configured
        GOOGLE_PLACES: false, // Set to true when Google Places API is configured
        UNSPLASH_IMAGES: false, // Set to true when Unsplash API is configured
        CURRENCY_CONVERSION: false, // Set to true when ExchangeRate API is configured
    },

    // App Settings
    OTP_EXPIRY_SECONDS: 300, // 5 minutes
    OTP_RESEND_COOLDOWN: 60, // 60 seconds
    LOCATION_SEARCH_DEBOUNCE: 300, // 300ms
    EXCHANGE_RATE_CACHE_HOURS: 24, // Cache rates for 24 hours
    NOTIFICATION_DURATION: 3000, // 3 seconds

    // Default Currency
    DEFAULT_CURRENCY: 'USD',

    // Supported Currencies
    CURRENCIES: [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
        { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
        { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
        { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
        { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
        { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
        { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
        { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
        { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
        { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
        { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
        { code: 'THB', symbol: '฿', name: 'Thai Baht' }
    ]
};

// Validate configuration
CONFIG.isConfigured = () => {
    const firebaseConfigured = CONFIG.FIREBASE.apiKey !== "YOUR_FIREBASE_API_KEY";
    const googlePlacesConfigured = CONFIG.GOOGLE_PLACES_API_KEY !== "YOUR_GOOGLE_PLACES_API_KEY";
    const unsplashConfigured = CONFIG.UNSPLASH_ACCESS_KEY !== "YOUR_UNSPLASH_ACCESS_KEY";
    const exchangeRateConfigured = CONFIG.EXCHANGE_RATE_API_KEY !== "YOUR_EXCHANGE_RATE_API_KEY";

    return {
        firebase: firebaseConfigured,
        googlePlaces: googlePlacesConfigured,
        unsplash: unsplashConfigured,
        exchangeRate: exchangeRateConfigured,
        allConfigured: firebaseConfigured && googlePlacesConfigured && unsplashConfigured && exchangeRateConfigured
    };
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
