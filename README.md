# 🌍 GlobeTrotter - Premium Travel Planning Application

A modern, feature-rich travel planning web application with real-time OTP authentication, location autocomplete, automatic image loading, and multi-currency conversion.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🎨 Premium UI/UX Design
- **Light, clean, modern theme** with pastel backgrounds
- **Fully responsive** design (mobile-first approach)
- **Smooth micro-interactions** and animations
  - Page transitions
  - Button hover effects
  - Input focus animations
- **Glassmorphism effects** with subtle shadows and rounded cards
- **Modern typography** using Inter font family
- **WCAG 2.1 AA compliant** accessibility

### 📱 Real-Time OTP Authentication
- **Firebase Authentication** integration for SMS OTP
- **Strict numeric-only** phone number validation
- **International country code selector** (195+ countries)
- **OTP expiration** handling (5 minutes)
- **Resend functionality** with 60-second cooldown
- **Error states** for invalid/expired OTP
- **Demo mode** available without Firebase configuration

### 📍 Location Autocomplete
- **Google Places API** integration
- **Real-time predictions** while typing
- **Keyboard navigation** support (arrow keys, enter, escape)
- **Structured results** showing city, state, and country
- **Debounced search** (300ms delay)
- **Fallback to demo data** if API not configured

### 💰 Multi-Currency Support
- **20+ international currencies** with proper symbols
- **Real-time exchange rates** via ExchangeRate-API
- **Auto-conversion** on currency change
- **Rate caching** (24-hour expiry)
- **Offline fallback** with static rates

### 🖼️ Automatic Image Loading
- **Unsplash API** integration
- **High-quality images** based on selected location
- **Lazy loading** with Intersection Observer
- **Loading animations** and skeleton screens
- **Error handling** with fallback placeholders
- **Image attribution** support

### 📊 Dashboard Features
- **Trip summary cards** with images
- **Statistics display** (total trips, destinations, budget)
- **Local storage persistence**
- **Instant updates**
- **Currency-aware pricing**

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, but recommended)

### Installation

1. **Clone or download** this repository

2. **Open the project** in your preferred code editor

3. **Configure API keys** (optional - app works in demo mode without them):
   - Copy `.env.example` and review the setup instructions
   - Edit `frontend/config.js` and replace placeholder API keys
   - Set feature flags to `true` for enabled APIs

4. **Run the application**:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (npx)
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   
   # Or simply open frontend/index.html in your browser
   ```

5. **Access the app**:
   - Navigate to `http://localhost:8000/frontend` (or the port you chose)
   - Or open `frontend/index.html` directly in your browser

## 🔑 API Configuration

### Required APIs (Optional - Demo Mode Available)

#### 1. Firebase (Real-time OTP)
```javascript
// In frontend/config.js
FIREBASE: {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
}
FEATURES.REAL_OTP: true
```
**Get API Key**: https://console.firebase.google.com/

#### 2. Google Places (Location Autocomplete)
```javascript
// In frontend/config.js
GOOGLE_PLACES_API_KEY: "YOUR_API_KEY"
FEATURES.GOOGLE_PLACES: true
```
**Get API Key**: https://console.cloud.google.com/

#### 3. Unsplash (Automatic Images)
```javascript
// In frontend/config.js
UNSPLASH_ACCESS_KEY: "YOUR_ACCESS_KEY"
FEATURES.UNSPLASH_IMAGES: true
```
**Get API Key**: https://unsplash.com/developers

#### 4. ExchangeRate-API (Currency Conversion)
```javascript
// In frontend/config.js
EXCHANGE_RATE_API_KEY: "YOUR_API_KEY"
FEATURES.CURRENCY_CONVERSION: true
```
**Get API Key**: https://www.exchangerate-api.com/

### Demo Mode

The app works perfectly without any API keys:
- **OTP**: Generates random 6-digit codes (displayed in console and toast notification)
- **Location**: Uses predefined list of 25+ popular destinations
- **Images**: Uses Unsplash Source URLs (no API required)
- **Currency**: Uses static exchange rates

## 📁 Project Structure

```
GlobeTrotter/
├── frontend/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Complete CSS with design system
│   ├── script.js       # Consolidated JavaScript (all features)
│   └── config.js       # API configuration
├── .env.example        # API setup documentation
├── README.md           # This file
└── .git/               # Git repository
```

## 🎯 Usage Guide

### Creating an Account
1. Enter your full name and email
2. Select your country code from the dropdown
3. Enter your phone number (numeric only)
4. Create a password
5. Click "Send OTP"
6. Enter the 6-digit OTP received (or shown in demo mode)
7. Click "Verify OTP"

### Planning a Trip
1. Navigate to "Create New Trip"
2. Enter trip name and dates
3. Start typing a destination - autocomplete suggestions will appear
4. Select a destination (image loads automatically)
5. Choose currency and enter budget
6. Add a description (optional)
7. Click "Save Trip"

### Managing Trips
- View all trips on the dashboard
- See statistics (total trips, destinations, budget)
- Click on a trip card to view details
- All data is saved in browser local storage

## 🎨 Design System

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#ec4899` (Pink)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Base Size**: 16px
- **Scale**: 0.75rem to 2.5rem

### Spacing
- **XS**: 0.5rem
- **SM**: 1rem
- **MD**: 1.5rem
- **LG**: 2rem
- **XL**: 3rem

## ♿ Accessibility Features

- **WCAG 2.1 AA compliant** color contrast
- **Keyboard navigation** support
- **Screen reader** compatible (ARIA labels)
- **Skip to main content** link
- **Focus indicators** for all interactive elements
- **Reduced motion** support
- **Touch-friendly** targets (minimum 44x44px)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔒 Security Notes

⚠️ **Important**: Never commit real API keys to version control!

For production deployment:
1. Use environment variables
2. Implement server-side API proxy
3. Restrict API keys by domain/IP
4. Monitor usage and set quotas
5. Enable HTTPS

## 🐛 Troubleshooting

### OTP not working
- Check Firebase configuration in `frontend/config.js`
- Ensure Firebase Authentication is enabled
- Verify phone number format includes country code
- Check browser console for errors

### Location autocomplete not showing
- Verify Google Places API key in `frontend/config.js`
- Ensure Places API is enabled in Google Cloud Console
- Check API key restrictions
- Demo mode should work without API key

### Images not loading
- Check Unsplash API key in `frontend/config.js`
- Verify API rate limits haven't been exceeded
- Fallback to Unsplash Source should work automatically

### Currency conversion not updating
- Check ExchangeRate-API key in `frontend/config.js`
- Verify internet connection
- Static rates should work as fallback

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for travelers worldwide** 🌍✈️
