// ===================================
// GlobeTrotter - Complete 12-Screen Application
// LocalStorage + Mock Data + Real Authentication Logic
// ===================================

// ===================================
// GLOBAL STATE MANAGEMENT
// ===================================
const AppState = {
    currentUser: null,
    currentScreen: 'login',
    selectedTrip: null,
    selectedLocation: null,
    heroCarouselIndex: 0,
    calendarDate: new Date(),
    adminView: 'users',
    searchResults: [],
    communityPosts: []
};

// ===================================
// LOCAL STORAGE KEYS
// ===================================
const STORAGE_KEYS = {
    USERS: 'globetrotter_users',
    CURRENT_USER: 'globetrotter_current_user',
    TRIPS: 'globetrotter_trips',
    POSTS: 'globetrotter_posts',
    ACTIVITIES: 'globetrotter_activities'
};

// ===================================
// MOCK DATA
// ===================================
const API_BASE = 'http://localhost:8000';

const MOCK_DESTINATIONS = [
    { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', stats: '2.5M visitors' },
    { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', stats: '1.8M visitors' },
    { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', stats: '3.2M visitors' },
    { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', stats: '1.5M visitors' },
    { name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', stats: '2.8M visitors' },
    { name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', stats: '2.1M visitors' },
    { name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', stats: '1.9M visitors' },
    { name: 'Sydney', country: 'Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', stats: '1.6M visitors' }
];

const MOCK_ACTIVITIES = [
    { id: 1, name: 'Eiffel Tower Visit', category: 'sightseeing', price: 'moderate', rating: 4.8, image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600', city: 'Paris' },
    { id: 2, name: 'Tokyo Food Tour', category: 'dining', price: 'moderate', rating: 4.9, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', city: 'Tokyo' },
    { id: 3, name: 'Central Park Bike Tour', category: 'adventure', price: 'budget', rating: 4.7, image: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=600', city: 'New York' },
    { id: 4, name: 'Bali Temple Tour', category: 'culture', price: 'budget', rating: 4.6, image: 'https://images.unsplash.com/photo-1555400082-6b3a1c8f8f0e?w=600', city: 'Bali' },
    { id: 5, name: 'London Eye Experience', category: 'sightseeing', price: 'moderate', rating: 4.5, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600', city: 'London' },
    { id: 6, name: 'Desert Safari', category: 'adventure', price: 'luxury', rating: 4.9, image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600', city: 'Dubai' }
];

// ===================================
// UTILITY FUNCTIONS
// ===================================
function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCurrencySymbol(currency) {
    const symbols = {
        USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
        AUD: 'A$', CAD: 'C$', CHF: 'Fr', CNY: '¥', AED: 'د.إ'
    };
    return symbols[currency] || '$';
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// ===================================
// NAVIGATION
// ===================================
function navigateTo(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    let targetId = screenId;
    if (screenId === 'landing') targetId = 'main-app'; // Redirect landing to main-app

    const targetScreen = document.getElementById(`${targetId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        AppState.currentScreen = targetId;

        // Load screen-specific data
        switch (targetId) {
            case 'main-app':
                // Default to itinerary view when entering the main app
                switchMainView('itinerary');
                break;
            case 'trip-list':
                loadTripList();
                break;
            case 'profile':
                loadProfile();
                break;
            case 'search':
                loadSearchResults();
                break;
            case 'community':
                loadCommunityFeed();
                break;
            case 'calendar':
                loadCalendar();
                break;
            case 'admin':
                loadAdminPanel();
                break;
        }
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

window.navigateTo = navigateTo;

// ===================================
// AUTHENTICATION
// ===================================
function initAuth() {
    seedDemoUser(); // Ensure demo user exists
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
        navigateTo('landing');
    } else {
        navigateTo('login');
    }
}

function seedDemoUser() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (!users.find(u => u.email === 'demo@example.com')) {
        const demoUser = {
            id: 'demo-user-id',
            firstName: 'Demo',
            lastName: 'Traveler',
            email: 'demo@example.com',
            phone: '1234567890',
            city: 'Paris',
            country: 'France',
            bio: 'I love traveling!',
            password: 'password',
            username: 'demo',
            profilePhoto: null,
            joinedDate: new Date().toISOString(),
            isAdmin: false
        };
        users.push(demoUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        console.log('Demo user seeded');
    }
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    showLoading();

    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const user = users.find(u =>
            (u.email === username || u.username === username) && u.password === password
        );

        hideLoading();

        if (user) {
            // Remove password from stored user
            const { password, ...userWithoutPassword } = user;
            AppState.currentUser = userWithoutPassword;
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));

            showToast('Welcome back, ' + user.firstName + '!', 'success');
            navigateTo('landing');
        } else {
            showToast('Invalid credentials. Please try again.', 'error');
        }
    }, 500);
}

function handleSignup(event) {
    event.preventDefault();

    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const city = document.getElementById('signup-city').value;
    const country = document.getElementById('signup-country').value;
    const bio = document.getElementById('signup-bio').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters!', 'error');
        return;
    }

    showLoading();

    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            hideLoading();
            showToast('Email already registered!', 'error');
            return;
        }

        const newUser = {
            id: generateId(),
            firstName,
            lastName,
            email,
            phone,
            city,
            country,
            bio,
            password,
            username: email.split('@')[0],
            profilePhoto: null,
            joinedDate: new Date().toISOString(),
            isAdmin: users.length === 0 // First user is admin
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        // Auto-login
        const { password: _, ...userWithoutPassword } = newUser;
        AppState.currentUser = userWithoutPassword;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));

        hideLoading();
        showToast('Account created successfully!', 'success');
        navigateTo('landing');
    }, 500);
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    AppState.currentUser = null;
    showToast('Logged out successfully', 'success');
    navigateTo('login');
}

window.logout = logout;

// ===================================
// LANDING PAGE
// ===================================
function loadLandingPage() {
    // Load hero carousel
    initHeroCarousel();

    // Load destinations
    loadDestinations();

    // Load recent trips
    loadRecentTrips();
}

function initHeroCarousel() {
    const indicators = document.getElementById('hero-indicators');
    const slides = document.querySelectorAll('.hero-slide');

    // Create indicators
    indicators.innerHTML = '';
    slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = `hero-indicator ${index === 0 ? 'active' : ''}`;
        indicator.onclick = () => goToSlide(index);
        indicators.appendChild(indicator);
    });

    // Auto-advance carousel every 8 seconds
    setInterval(() => {
        AppState.heroCarouselIndex = (AppState.heroCarouselIndex + 1) % slides.length;
        goToSlide(AppState.heroCarouselIndex);
    }, 8000);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-indicator');

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });

    AppState.heroCarouselIndex = index;
}

function loadDestinations() {
    const grid = document.getElementById('destination-grid');
    grid.innerHTML = MOCK_DESTINATIONS.map(dest => `
        <div class="destination-card" onclick="exploreDestination('${dest.name}')">
            <img src="${dest.image}" alt="${dest.name}" loading="lazy">
            <div class="destination-overlay">
                <div class="destination-name">${dest.name}</div>
                <div class="destination-stats">📍 ${dest.country} • ${dest.stats}</div>
            </div>
        </div>
    `).join('');
}


function exploreDestination(name) {
    document.getElementById('search-input').value = name;
    navigateTo('search');
}

window.exploreDestination = exploreDestination;

// ===================================
// TRIP MANAGEMENT
// ===================================
function getTrips() {
    const trips = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || '[]');
    return trips.filter(t => t.userId === AppState.currentUser?.id);
}

function getAllTrips() {
    return AppState.allTrips || [];
}

function saveTrip(tripData) {
    const trips = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || '[]');

    tripData.id = generateId();
    tripData.userId = AppState.currentUser.id;
    tripData.createdAt = new Date().toISOString();
    tripData.status = getTripStatus(tripData.startDate, tripData.endDate);

    trips.push(tripData);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));

    return tripData;
}

function getTripStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now >= start && now <= end) return 'ongoing';
    if (now < start) return 'upcoming';
    return 'completed';
}

function handleCreateTrip(event) {
    event.preventDefault();

    const name = document.getElementById('trip-name').value;
    const startDate = document.getElementById('trip-start-date').value;
    const endDate = document.getElementById('trip-end-date').value;
    const destination = document.getElementById('trip-destination').value; // Get destination
    const budget = parseFloat(document.getElementById('trip-budget').value) || 0;

    console.log('Attempting to create trip:', { name, startDate, endDate, destination, budget });

    if (!name || !startDate || !endDate || !destination) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-sm"></span> Creating...';

    // 1. Create Trip
    fetch(`${API_BASE}/trip`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            start_date: startDate,
            end_date: endDate
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to create trip');
            return response.json();
        })
        .then(newTrip => {
            // 2. Add Default Stop (Destination)
            const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

            return fetch(`${API_BASE}/trip/${newTrip.id}/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city: destination,
                    duration_days: days || 1
                })
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add stop');
            return response.json();
        })
        .then(() => {
            showToast('Trip created successfully! 🚀', 'success');
            event.target.reset();
            navigateTo('trip-list');
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error creating trip. Please try again.', 'error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
}
function loadSuggestions(city) {
    const grid = document.getElementById('suggestion-grid');
    if (!city || city.length < 3) {
        grid.innerHTML = '<p class="text-muted">Type a destination to see suggestions.</p>';
        return;
    }

    // Call Backend API
    // Assuming backend is running on localhost:8000
    fetch(`http://localhost:8000/suggestions?city=${encodeURIComponent(city)}`)
        .then(response => response.json())
        .then(suggestions => {
            renderSuggestions(suggestions);
        })
        .catch(err => {
            console.error("Error fetching suggestions:", err);
            grid.innerHTML = '<p class="text-error">Failed to load suggestions.</p>';
        });
}

function renderSuggestions(suggestions) {
    const grid = document.getElementById('suggestion-grid');
    if (!suggestions || suggestions.length === 0) {
        grid.innerHTML = '<p class="text-muted">No suggestions found for this place.</p>';
        return;
    }

    grid.innerHTML = suggestions.map((item, index) => `
        <div class="suggestion-card" onclick="toggleSuggestion(this, '${item.name}', ${item.estimated_cost})">
            <img src="${item.image}" alt="${item.name}" class="suggestion-image" loading="lazy">
            <div class="suggestion-content">
                <div class="suggestion-title">${item.name}</div>
                <div class="suggestion-meta">
                    <span>${item.category}</span>
                    <span>$${item.estimated_cost}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleSuggestion(card, name, cost) {
    card.classList.toggle('selected');
    // Logic to add to itinerary data could go here
    if (card.classList.contains('selected')) {
        // Add to temporary set
    }
}

window.loadSuggestions = loadSuggestions;
window.toggleSuggestion = toggleSuggestion;

function loadTripList() {
    const container = document.getElementById('trip-list');

    // Show skeleton/loading state
    container.innerHTML = '<div class="loader">Loading trips...</div>';

    fetch(`${API_BASE}/trips`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch trips');
            return res.json();
        })
        .then(trips => {
            if (trips.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">✈️</div>
                        <h3>No trips planned yet</h3>
                        <p>Start your adventure by creating a new trip!</p>
                        <button class="btn btn-primary" onclick="navigateTo('create-trip')">Plan a Trip</button>
                    </div>
                `;
                return;
            }

            // Store trips globally so we can access them in viewTripDetails without re-fetching for now
            AppState.allTrips = trips;

            container.innerHTML = trips.map(trip => {
                const destination = trip.stops && trip.stops.length > 0 ? trip.stops[0].city : 'Undecided';
                return `
                <div class="trip-card" onclick="viewTripDetails(${trip.id})">
                    <div class="trip-image" style="background-image: url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800')">
                        <div class="trip-status ongoing">Planned</div>
                    </div>
                    <div class="trip-content">
                        <div class="trip-header">
                            <h3 class="trip-title">${trip.name}</h3>
                            <div class="trip-dates">${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}</div>
                        </div>
                        <div class="trip-destination-tag">📍 ${destination}</div>
                        <div class="trip-stats">
                            <div class="trip-stat">
                                <span class="stat-value">${trip.stops ? trip.stops.length : 0}</span>
                                <span class="stat-label">Stops</span>
                            </div>
                            <div class="trip-stat">
                                <span class="stat-value">${getDaysDifference(trip.start_date, trip.end_date)}</span>
                                <span class="stat-label">Days</span>
                            </div>
                        </div>
                    </div>
                </div>
            `}).join('');
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = '<p class="text-error">Failed to load trips.</p>';
        });
}

function filterTrips(status) {
    const cards = document.querySelectorAll('.trip-card-full');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === status);
    });

    cards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

window.filterTrips = filterTrips;

function viewTripDetails(tripId) {
    const trips = getAllTrips();
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
        AppState.selectedTrip = trip;
        loadItineraryView();
        navigateTo('itinerary-view');
    }
}

window.viewTripDetails = viewTripDetails;

function editItinerary(tripId) {
    const trips = getAllTrips();
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
        AppState.selectedTrip = trip;
        loadItineraryBuilder();
        navigateTo('itinerary-builder');
    }
}

window.editItinerary = editItinerary;

function shareTrip(tripId) {
    showToast('Share link copied to clipboard!', 'success');
}

window.shareTrip = shareTrip;

function deleteTrip() {
    if (confirm('Are you sure you want to delete this trip?')) {
        const trips = getAllTrips();
        const filtered = trips.filter(t => t.id !== AppState.selectedTrip.id);
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(filtered));
        showToast('Trip deleted successfully', 'success');
        navigateTo('trip-list');
    }
}

window.deleteTrip = deleteTrip;

// ===================================
// PROFILE
// ===================================
function loadProfile() {
    const user = AppState.currentUser;
    if (!user) return;

    document.getElementById('profile-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profile-location').textContent = `📍 ${user.city}, ${user.country}`;
    document.getElementById('profile-member-since').textContent = `Member since ${formatDate(user.joinedDate)}`;

    // Load form
    document.getElementById('profile-firstname').value = user.firstName;
    document.getElementById('profile-lastname').value = user.lastName;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-phone').value = user.phone;
    document.getElementById('profile-city').value = user.city;
    document.getElementById('profile-country').value = user.country;
    document.getElementById('profile-bio').value = user.bio || '';

    // Stats and recent trips are currently not linked to backend in this Profile view
    // We can todo: implement profile stats backend endpoint
}

function renderProfileTrips(trips) {
    if (trips.length === 0) {
        return '<p style="color: var(--text-muted);">No trips</p>';
    }

    return trips.map(trip => `
                    < div class="trip-card-carousel" onclick = "viewTripDetails('${trip.id}')" >
            <div class="trip-image-container">
                ${trip.imageUrl
            ? `<img src="${trip.imageUrl}" alt="${trip.name}" class="trip-image" loading="lazy">`
            : '<div class="trip-image-placeholder">🌍</div>'
        }
            </div>
            <div class="trip-content">
                <h4>${trip.name}</h4>
                <p>${trip.destination}</p>
                <button class="btn btn-sm btn-primary mt-sm">View</button>
            </div>
        </div >
                    `).join('');
}

function toggleProfileEdit() {
    const inputs = document.querySelectorAll('#profile-form input, #profile-form textarea');
    const btn = document.getElementById('edit-profile-btn');

    const isReadonly = inputs[0].hasAttribute('readonly');

    inputs.forEach(input => {
        if (isReadonly) {
            input.removeAttribute('readonly');
        } else {
            input.setAttribute('readonly', true);
        }
    });

    btn.textContent = isReadonly ? 'Save Changes' : 'Edit Profile';

    if (!isReadonly) {
        // Save changes
        const user = AppState.currentUser;
        user.firstName = document.getElementById('profile-firstname').value;
        user.lastName = document.getElementById('profile-lastname').value;
        user.city = document.getElementById('profile-city').value;
        user.country = document.getElementById('profile-country').value;
        user.bio = document.getElementById('profile-bio').value;

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

        // Update in users list
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...user };
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        showToast('Profile updated successfully!', 'success');
    }
}

window.toggleProfileEdit = toggleProfileEdit;

// ===================================
// SEARCH & ACTIVITIES
// ===================================
function loadSearchResults() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    let results = MOCK_ACTIVITIES;

    if (query) {
        results = results.filter(activity =>
            activity.name.toLowerCase().includes(query) ||
            activity.city.toLowerCase().includes(query)
        );
    }

    AppState.searchResults = results;
    renderSearchResults(results);

    // Add event listener for real-time search
    if (searchInput && !searchInput.hasAttribute('data-listener')) {
        searchInput.setAttribute('data-listener', 'true');
        searchInput.addEventListener('input', loadSearchResults);
    }
}

function renderSearchResults(results) {
    const container = document.getElementById('search-results');

    if (results.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No results found</p>';
        return;
    }

    container.innerHTML = results.map(activity => `
                    < div class="result-card" >
                        <img src="${activity.image}" alt="${activity.name}" class="result-image" loading="lazy">
                            <div class="result-content">
                                <h3 class="result-title">${activity.name}</h3>
                                <p class="result-description">${activity.city} • ${activity.category}</p>
                                <div class="result-meta">
                                    <span class="result-rating">⭐ ${activity.rating}</span>
                                    <span class="result-price">${activity.price === 'budget' ? '$' : activity.price === 'moderate' ? '$$' : '$$$'}</span>
                                </div>
                                <button class="btn btn-sm btn-primary mt-sm" onclick="viewActivityDetails(${activity.id})">View Details</button>
                            </div>
                        </div>
                `).join('');
}

function viewActivityDetails(activityId) {
    const activity = MOCK_ACTIVITIES.find(a => a.id === activityId);
    if (activity) {
        alert(`Activity: ${activity.name} \nLocation: ${activity.city} \nCategory: ${activity.category} \nRating: ${activity.rating}⭐\n\n(Full details view coming soon!)`);
    }
}

window.viewActivityDetails = viewActivityDetails;

// ===================================
// ITINERARY BUILDER
// ===================================
function loadItineraryBuilder() {
    const trip = AppState.selectedTrip;
    if (!trip) return;

    document.getElementById('itinerary-trip-name').textContent = trip.name;
    document.getElementById('itinerary-dates').textContent = `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)} `;
    document.getElementById('itinerary-budget-display').textContent = `Budget: ${getCurrencySymbol(trip.currency)}${Number(trip.budget).toLocaleString()} `;

    const container = document.getElementById('itinerary-days');
    const days = calculateDays(trip.startDate, trip.endDate);

    container.innerHTML = '';
    for (let i = 0; i < days; i++) {
        container.appendChild(createDayElement(i + 1, trip));
    }
}

function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff + 1;
}

function createDayElement(dayNumber, trip) {
    const div = document.createElement('div');
    div.className = 'itinerary-day';
    div.innerHTML = `
                    < div class="day-header" onclick = "toggleDay(this)" >
            <div class="day-title">Day ${dayNumber}</div>
            <div class="day-toggle">▼</div>
        </div >
                    <div class="day-content">
                        <div class="activities-list" id="day-${dayNumber}-activities">
                            <!-- Activities will be added here -->
                        </div>
                        <button class="add-activity-btn" onclick="addActivity(${dayNumber})">
                            ➕ Add Activity
                        </button>
                    </div>
                `;
    return div;
}

function toggleDay(header) {
    header.parentElement.classList.toggle('collapsed');
}

window.toggleDay = toggleDay;

function addActivity(dayNumber) {
    const name = prompt('Activity name:');
    if (!name) return;

    const time = prompt('Time (e.g., 09:00 AM):');
    const cost = prompt('Estimated cost:');

    const container = document.getElementById(`day - ${dayNumber} -activities`);
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-item';
    activityDiv.innerHTML = `
                    < div class="activity-header" >
            <div class="activity-name">${name}</div>
            <div class="activity-actions">
                <button class="btn btn-icon btn-sm" onclick="this.parentElement.parentElement.parentElement.remove()">🗑️</button>
            </div>
        </div >
                    <div class="activity-details">
                        <div>⏰ ${time || 'Not set'}</div>
                        <div>💰 ${cost || 'Not set'}</div>
                    </div>
                `;
    container.appendChild(activityDiv);
}

window.addActivity = addActivity;

function addItineraryDay() {
    const container = document.getElementById('itinerary-days');
    const dayNumber = container.children.length + 1;
    container.appendChild(createDayElement(dayNumber, AppState.selectedTrip));
}

window.addItineraryDay = addItineraryDay;

function saveItinerary() {
    showToast('Itinerary saved successfully!', 'success');
    navigateTo('trip-list');
}

window.saveItinerary = saveItinerary;

// ===================================
// ITINERARY VIEW
// ===================================
function loadItineraryView() {
    const trip = AppState.selectedTrip;
    if (!trip) return;

    document.getElementById('view-trip-name').textContent = trip.name;
    document.getElementById('view-trip-dates').textContent = `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)} `;
    document.getElementById('view-trip-destination').textContent = `📍 ${trip.stops && trip.stops.length > 0 ? trip.stops[0].city : 'Undecided'} `;

    const currencySymbol = getCurrencySymbol(trip.currency);
    document.getElementById('view-total-budget').textContent = `${currencySymbol}${Number(trip.budget).toLocaleString()} `;
    document.getElementById('view-spent-budget').textContent = `${currencySymbol} 0`;
    document.getElementById('view-remaining-budget').textContent = `${currencySymbol}${Number(trip.budget).toLocaleString()} `;
}

function addExpense() {
    const name = prompt('Expense name:');
    if (!name) return;

    const amount = prompt('Amount:');
    if (!amount) return;

    showToast(`Expense "${name}" added: $${amount} `, 'success');
}

window.addExpense = addExpense;

// ===================================
// COMMUNITY
// ===================================
function loadCommunityFeed() {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    AppState.communityPosts = posts;
    renderCommunityPosts(posts);
}

function renderCommunityPosts(posts) {
    const container = document.getElementById('community-feed');

    // If no posts, show demo posts
    if (posts.length === 0) {
        const demoPosts = [
            {
                id: 'demo1',
                username: 'Sarah Johnson',
                content: '🌴 Just got back from an amazing trip to Bali! The beaches were absolutely stunning and the local culture is so rich. Highly recommend visiting Ubud for the rice terraces!',
                location: 'Bali, Indonesia',
                likes: 42,
                comments: [],
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'demo2',
                username: 'Mike Chen',
                content: 'Planning my next adventure to Japan 🗾 Any recommendations for hidden gems in Tokyo? Looking for authentic local experiences!',
                location: 'Planning for Tokyo, Japan',
                likes: 28,
                comments: [],
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'demo3',
                username: 'Emma Williams',
                content: '✈️ Travel tip: Always pack a portable charger and download offline maps before your trip. Saved me so many times!',
                location: null,
                likes: 67,
                comments: [],
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        posts = demoPosts;
    }

    container.innerHTML = posts.map(post => `
                    < div class="post-card" >
            <div class="post-header">
                <div class="post-avatar">👤</div>
                <div class="post-user-info">
                    <div class="post-username">${post.username}</div>
                    <div class="post-time">${formatDate(post.createdAt)}</div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            ${post.location ? `<div class="post-location">📍 ${post.location}</div>` : ''}
                <div class="post-actions">
                    <button class="post-action-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                        ❤️ ${post.likes || 0}
                    </button>
                    <button class="post-action-btn" onclick="commentOnPost('${post.id}')">
                        💬 ${post.comments?.length || 0}
                    </button>
                    <button class="post-action-btn" onclick="sharePost('${post.id}')">
                        📤 Share
                    </button>
                </div>
        </div >
                    `).join('');
}

function createPost() {
    const content = prompt('What would you like to share?');
    if (!content) return;

    const location = prompt('Add location (optional):');

    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    const newPost = {
        id: generateId(),
        userId: AppState.currentUser.id,
        username: `${AppState.currentUser.firstName} ${AppState.currentUser.lastName} `,
        content,
        location,
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    showToast('Post created successfully!', 'success');
    loadCommunityFeed();
}

window.createPost = createPost;

function toggleLike(postId) {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.liked = !post.liked;
        post.likes = (post.likes || 0) + (post.liked ? 1 : -1);
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        loadCommunityFeed();
    }
}

window.toggleLike = toggleLike;

function commentOnPost(postId) {
    const comment = prompt('Add a comment:');
    if (comment) {
        showToast('Comment added!', 'success');
    }
}

window.commentOnPost = commentOnPost;

function sharePost(postId) {
    showToast('Post link copied to clipboard!', 'success');
}

window.sharePost = sharePost;

function filterPosts(filter) {
    const buttons = document.querySelectorAll('.community-filters .filter-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    // For now, just reload all posts
    loadCommunityFeed();
}

window.filterPosts = filterPosts;

// ===================================
// CALENDAR
// ===================================
function loadCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const container = document.getElementById('calendar-container');
    const date = AppState.calendarDate;

    document.getElementById('calendar-title').textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let html = '<div class="calendar-grid">';

    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="calendar-day other-month"></div>';
    }

    // Days of month
    const trips = getTrips();
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        const isToday = currentDate.toDateString() === new Date().toDateString();

        // Find trips for this day
        const dayTrips = trips.filter(trip => {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            return currentDate >= start && currentDate <= end;
        });

        html += `
                    <div class="calendar-day ${isToday ? 'today' : ''}">
                        <div class="calendar-day-number">${day}</div>
                ${dayTrips.map(trip => `
                    <div class="calendar-trip-marker ${trip.status}" title="${trip.name}">
                        ${trip.name}
                    </div>
                `).join('')
            }
            </div>
                    `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function previousMonth() {
    AppState.calendarDate = new Date(AppState.calendarDate.getFullYear(), AppState.calendarDate.getMonth() - 1);
    renderCalendar();
}

window.previousMonth = previousMonth;

function nextMonth() {
    AppState.calendarDate = new Date(AppState.calendarDate.getFullYear(), AppState.calendarDate.getMonth() + 1);
    renderCalendar();
}

window.nextMonth = nextMonth;

function changeCalendarView(view) {
    showToast(`${view} view coming soon!`, 'info');
}

window.changeCalendarView = changeCalendarView;

// ===================================
// ADMIN PANEL
// ===================================
function loadAdminPanel() {
    if (!AppState.currentUser?.isAdmin) {
        showToast('Access denied. Admin privileges required.', 'error');
        navigateTo('landing');
        return;
    }

    loadAdminStats();
    loadAdminUsers();
}

function loadAdminStats() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const trips = getAllTrips();
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');

    document.getElementById('admin-total-users').textContent = users.length;
    document.getElementById('admin-total-trips').textContent = trips.length;
    document.getElementById('admin-total-posts').textContent = posts.length;
    document.getElementById('admin-active-users').textContent = users.filter(u => {
        const lastActive = new Date(u.joinedDate);
        const daysSince = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
        return daysSince < 1;
    }).length;
}

function loadAdminUsers() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const container = document.getElementById('admin-users-table');

    container.innerHTML = `
                    < table >
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Joined</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.firstName} ${user.lastName}</td>
                        <td>${user.email}</td>
                        <td>${user.city}, ${user.country}</td>
                        <td>${formatDate(user.joinedDate)}</td>
                        <td>
                            <button class="btn btn-sm btn-secondary" onclick="viewUserDetails('${user.id}')">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table >
                    `;
}

function switchAdminTab(tab) {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    contents.forEach(c => c.classList.toggle('active', c.id === `admin - ${tab} -tab`));

    AppState.adminView = tab;
}

window.switchAdminTab = switchAdminTab;

function viewUserDetails(userId) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`User: ${user.firstName} ${user.lastName} \nEmail: ${user.email} \nLocation: ${user.city}, ${user.country} \nJoined: ${formatDate(user.joinedDate)} \n\n(Full user management coming soon!)`);
    }
}

window.viewUserDetails = viewUserDetails;

function saveAdminSettings() {
    showToast('Settings saved successfully!', 'success');
}

window.saveAdminSettings = saveAdminSettings;

// ===================================
// CHAT & WEBSOCKET
// ===================================
let chatSocket = null;
let reconnectInterval = null;

function openChat() {
    const modal = document.getElementById('chat-modal');
    modal.classList.add('active');

    if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
        connectChat();
    }
}

window.openChat = openChat;

function closeChat() {
    document.getElementById('chat-modal').classList.remove('active');
}

window.closeChat = closeChat;

function connectChat() {
    if (!AppState.selectedTrip) return;

    const tripId = AppState.selectedTrip.id;
    // Use a unique client ID, e.g., user ID or random string
    const clientId = AppState.currentUser ? AppState.currentUser.id : generateId();

    const statusEl = document.getElementById('chat-status');
    statusEl.textContent = 'Connecting...';
    statusEl.className = 'status-offline';

    // IMPORTANT: Change URL to match your backend port (usually 8000 for FastAPI)
    // If serving via same origin, specific port might be needed if dev server is different.
    // Assuming backend is at localhost:8000 for local dev
    const wsUrl = `ws://localhost:8000/ws/${tripId}/${clientId}`;

    chatSocket = new WebSocket(wsUrl);

    chatSocket.onopen = function () {
        console.log("Connected to Chat WS");
        statusEl.textContent = 'Online';
        statusEl.className = 'status-online';

        // Load history
        fetchChatHistory(tripId);
    };

    chatSocket.onmessage = function (event) {
        const msg = JSON.parse(event.data);
        appendMessage(msg);
    };

    chatSocket.onclose = function () {
        console.log("Chat WS Disconnected");
        statusEl.textContent = 'Offline';
        statusEl.className = 'status-offline';
        // Auto-reconnect logic could go here
    };

    chatSocket.onerror = function (error) {
        console.error("Chat WS Error", error);
    };
}

async function fetchChatHistory(tripId) {
    try {
        const res = await fetch(`http://localhost:8000/trip/${tripId}/messages`);
        if (res.ok) {
            const messages = await res.json();
            const container = document.getElementById('chat-messages');
            container.innerHTML = '<div class="message system"><p>Welcome to the trip chat!</p></div>';
            messages.forEach(appendMessage);
            scrollToBottom();
        }
    } catch (e) {
        console.error("Failed to fetch history", e);
    }
}

function sendChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const content = input.value.trim();

    if (content && chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(content);
        input.value = '';
    }
}

window.sendChatMessage = sendChatMessage;

function appendMessage(msg) {
    const container = document.getElementById('chat-messages');
    const isMe = msg.sender === (AppState.currentUser ? AppState.currentUser.id : 'me');

    const div = document.createElement('div');
    div.className = `message ${isMe ? 'sent' : 'received'}`;

    // Attempt to find sender name if possible, else use ID
    // For demo, just use ID or 'You'
    const senderName = isMe ? 'You' : (msg.sender === 'System' ? 'System' : 'User ' + msg.sender.substr(0, 4));

    div.innerHTML = `
        <div class="message-sender">${senderName}</div>
        <div class="message-content">${msg.content}</div>
        <div class="message-time">${new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;

    container.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🌍 GlobeTrotter 12-Screen Platform Initialized!');

    // Setup form handlers
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    const createTripForm = document.getElementById('create-trip-form');
    if (createTripForm) {
        createTripForm.addEventListener('submit', handleCreateTrip);
    }

    // Setup search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(loadSearchResults, 300));
    }

    // Setup Trip Destination Autocomplete/Suggestions
    const destInput = document.getElementById('trip-destination');
    if (destInput) {
        destInput.addEventListener('input', debounce((e) => {
            loadSuggestions(e.target.value);
        }, 500));
    }

    // Setup trip name character counter
    const tripNameInput = document.getElementById('trip-name');
    if (tripNameInput) {
        tripNameInput.addEventListener('input', function () {
            document.getElementById('trip-name-count').textContent = this.value.length;
        });
    }

    // Initialize auth
    initAuth();
});

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



// ===================================
// MAIN APP VIEW SWITCHER
// ===================================

function switchMainView(viewId) {
    // 1. Hide all app-views
    document.querySelectorAll('.app-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.app-view').forEach(el => el.classList.remove('active'));

    // 2. Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.style.display = 'block';
        setTimeout(() => target.classList.add('active'), 10);
    }

    // 3. Update Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.style.background = 'transparent';
        link.style.color = 'var(--text-muted)';
        link.classList.remove('active');
    });

    // 4. Highlight active link
    // simplified selection based on onclick attribute for now
    const activeLink = Array.from(document.querySelectorAll('.nav-link'))
        .find(link => link.getAttribute('onclick').includes(viewId));

    if (activeLink) {
        activeLink.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        activeLink.style.color = '#fff';
        activeLink.classList.add('active');
    }

    // 5. Load Data
    if (viewId === 'budget') loadBudgetDashboard();
    if (viewId === 'calendar') loadCalendarView();
    if (viewId === 'itinerary') loadItineraryList();
}

window.switchMainView = switchMainView;


// ===================================
// LOAD BUDGET DASHBOARD
// ===================================
function loadBudgetDashboard() {
    const root = document.getElementById('budget-root');
    const trip = AppState.selectedTrip;

    if (!trip) {
        root.innerHTML = '<p class="text-muted text-center p-lg">Please select a trip first to view the budget.</p>';
        return;
    }

    // Initialize with skeleton or loader
    root.innerHTML = '<div class="loader">Loading budget...</div>';

    // Fetch real budget from backend
    fetch(`${API_BASE}/trip/${trip.id}/budget`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch budget');
            return res.json();
        })
        .then(budgetData => {
            renderBudgetDashboard(trip, budgetData);
        })
        .catch(err => {
            console.error(err);
            // Fallback for demo if backend fails or trip serves from local storage only
            renderMockBudget(trip);
        });
}

function renderBudgetDashboard(trip, budgetData) {
    const root = document.getElementById('budget-root');

    // total_budget from backend is actually the "Total Cost" of stays + activities
    const totalCost = budgetData.total_budget;

    // We don't have a "Limit" stored in backend Trip model yet, so we'll mock a Target Budget
    // or assume a healthy buffer above the cost for the demo visual
    const targetBudget = Math.max(totalCost * 1.2, 5000); // Mock target
    const remaining = targetBudget - totalCost;
    const percentage = Math.min(100, Math.round((totalCost / targetBudget) * 100));

    // Generate Expense List from Breakdown
    const expenseListHTML = budgetData.breakdown.map(item => `
        <li class="expense-item" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--glass-border);">
            <div>
                <span style="font-weight: 500;">🏨 Stay in ${item.city}</span>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${item.duration_days} nights @ $3000/night</div>
            </div>
            <span style="font-weight: 600;">${getCurrencySymbol('USD')}${item.stay_cost.toLocaleString()}</span>
        </li>
        ${item.activities_cost > 0 ? `
        <li class="expense-item" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--glass-border);">
            <div>
                <span style="font-weight: 500;">🎡 Activities in ${item.city}</span>
            </div>
            <span style="font-weight: 600;">${getCurrencySymbol('USD')}${item.activities_cost.toLocaleString()}</span>
        </li>
        ` : ''}
    `).join('');

    root.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">$${totalCost.toLocaleString()}</div>
                <div class="stat-label">Estimated Cost</div>
            </div>
             <div class="stat-card">
                <div class="stat-value" style="color: ${remaining < 0 ? 'var(--error-color)' : 'var(--success-color)'}">
                    $${remaining.toLocaleString()}
                </div>
                <div class="stat-label">Remaining (vs Mock Budget)</div>
            </div>
             <div class="stat-card">
                <div class="stat-value">${percentage}%</div>
                <div class="stat-label">Budget Used</div>
            </div>
        </div>

        <div class="card mt-md">
            <h3>Budget Health</h3>
            <div style="margin-top: 1rem; width: 100%; height: 20px; background: var(--surface); border-radius: 999px; overflow: hidden; position: relative;">
                <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, var(--success-color), var(--warning-color)); transition: width 1s ease;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; color: var(--text-muted); font-size: 0.875rem;">
                <span>$0</span>
                <span>$${targetBudget.toLocaleString()}</span>
            </div>
        </div>

        <div class="card mt-md">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3>Expenses Breakdown</h3>
            </div>
            <ul id="expense-list-ul" style="list-style: none;">
                ${expenseListHTML || '<p class="text-muted">No expenses recorded yet.</p>'}
            </ul>
        </div>
    `;
}

function renderMockBudget(trip) {
    const root = document.getElementById('budget-root');
    root.innerHTML = `<p class="text-error">Unable to load budget data. Backend might be unreachable.</p>`;
}

// ===================================
// LOAD CALENDAR VIEW
// ===================================
function loadCalendarView() {
    const root = document.getElementById('calendar-root');
    const trip = AppState.selectedTrip;

    if (!trip) {
        root.innerHTML = '<p class="text-muted text-center p-lg">Please select a trip first to view the calendar.</p>';
        return;
    }

    const startDate = new Date(trip.start_date || trip.startDate); // Handle both camel/snake case
    const endDate = new Date(trip.end_date || trip.endDate);
    const monthName = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Generate days grid
    const startDay = startDate.getDay(); // 0 is Sunday
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    let calendarGridHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <button class="btn btn-icon btn-sm">←</button>
            <h3 style="margin: 0;">${monthName}</h3>
            <button class="btn btn-icon btn-sm">→</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; text-align: center; margin-bottom: 0.5rem;">
            <div class="text-muted font-bold text-xs">SUN</div>
            <div class="text-muted font-bold text-xs">MON</div>
            <div class="text-muted font-bold text-xs">TUE</div>
            <div class="text-muted font-bold text-xs">WED</div>
            <div class="text-muted font-bold text-xs">THU</div>
            <div class="text-muted font-bold text-xs">FRI</div>
            <div class="text-muted font-bold text-xs">SAT</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">
    `;

    // Empty cells for days before start of month/trip context
    for (let i = 0; i < startDay; i++) {
        calendarGridHTML += `<div></div>`;
    }

    // Map Stops/Activities to Dates
    // Stops are sequential. We need to map which days belong to which stop.
    // trip.stops is ordered ? We should assume so or sort.
    let stops = trip.stops || [];
    // If pulling from backend, stops are there.
    // We need to map date -> activities/city

    // Create a map of date -> {city, activities}
    const dayMap = {};
    let currentCursor = new Date(startDate);

    stops.forEach(stop => {
        for (let d = 0; d < stop.duration_days; d++) {
            const dateKey = currentCursor.toISOString().split('T')[0];
            dayMap[dateKey] = {
                city: stop.city,
                activities: stop.activities || [],
                isStart: d === 0
            };
            // Increment cursor
            currentCursor.setDate(currentCursor.getDate() + 1);
        }
    });

    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dayNum = currentDate.getDate();
        const dateKey = currentDate.toISOString().split('T')[0];

        const dayData = dayMap[dateKey];
        const city = dayData ? dayData.city : '';
        const activities = dayData ? dayData.activities : [];
        const isStart = dayData ? dayData.isStart : false;

        calendarGridHTML += `
            <div class="glass" style="
                padding: 0.5rem; 
                min-height: 80px; 
                border-radius: var(--radius-md); 
                position: relative; 
                border: ${isStart ? '1px solid var(--primary)' : '1px solid var(--glass-border)'};
                background: ${isStart ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass-bg)'};
                transition: transform 0.2s;
                cursor: pointer;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <div style="display:flex; justify-content:space-between;">
                    <span style="font-weight: bold; font-size: 0.9rem;">${dayNum}</span>
                    ${city ? `<span style="font-size: 0.6rem; color: var(--text-muted);">${city}</span>` : ''}
                </div>
                
                ${activities.length > 0 ? `<div style="margin-top: 4px; font-size: 0.65rem; background: var(--surface); padding: 2px 4px; border-radius: 4px; color: var(--text-secondary);">${activities.length} Activities</div>` : ''}
                ${isStart ? `<div style="margin-top: 4px; font-size: 0.65rem; background: var(--primary); padding: 2px 4px; border-radius: 4px; color: white;">Arrive</div>` : ''}
            </div>
        `;
    }

    calendarGridHTML += `</div>`;
    root.innerHTML = calendarGridHTML;
}

function getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
}


function loadItineraryList() {
    const container = document.getElementById('itinerary-list-container');
    container.innerHTML = `
        <h3>Your Upcoming Trips</h3>
         <div class="trip-card" onclick="alert('Trip details coming soon')" style="margin-top: 1rem;">
            <div class="trip-image" style="background-image: url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'); height: 150px; background-size: cover; border-radius: var(--radius-md);"></div>
            <div style="padding: 1rem;">
                <h3>Paris Adventure</h3>
                <p class="text-muted">June 15 - June 20, 2026</p>
            </div>
        </div>
    `;
}
