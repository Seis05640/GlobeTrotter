# 🌍 GlobeTrotter - Unified Travel Planning Platform

A modern, full-stack travel planning application combining a high-performance FastAPI backend with a premium Vanilla JavaScript frontend. Features real-time budget tracking, interactive calendars, and seamless itinerary management.

![Version](https://img.shields.io/badge/version-2.1.0-indigo.svg)
![Backend](https://img.shields.io/badge/backend-FastAPI-green.svg)
![Frontend](https://img.shields.io/badge/frontend-Vanilla%20JS-yellow.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Key Features

### 🖥️ Unified Frontend
- **Single Page Application (SPA)** experience using Vanilla JavaScript.
- **Modern UI/UX**: Dark theme, glassmorphism, and smooth Framer-like animations.
- **Core Views**:
    - **Itinerary**: Detailed day-by-day trip planning.
    - **Calendar**: Visual timeline of your trip and activities.
    - **Budget**: Real-time cost estimation and breakdown.

### ⚙️ Robust Backend
- **FastAPI**: High-performance Python generic API.
- **SQLite Database**: Lightweight and reliable data persistence.
- **RESTful Endpoints**: Dedicated APIs for Trips, Stops, Activities, and Budgeting.

### 🎨 Premium Design System
- **Glassmorphism**: Translucent cards and elements.
- **Responsive**: Mobile-first design for on-the-go planning.
- **Accessibility**: WCAG 2.1 AA compliant.

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **pip** (Python package manager)
- **Modern Web Browser**

### 1. Clone the Repository
```bash
git clone https://github.com/Seis05640/GlobeTrotter.git
cd GlobeTrotter
```

### 2. Setup the Backend
The backend handles data persistence and business logic.
```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload
```
*The backend runs on `http://localhost:8000`.*

### 3. Run the Frontend
The frontend is a static Vanilla JS application that connects to the backend.
```bash
# Open a new terminal tab
cd frontend

# Serve the static files
python3 -m http.server 3000
```
*The frontend runs on `http://localhost:3000`.*

### 4. Use the App
1.  Open **http://localhost:3000** in your browser.
2.  Login with:
    *   **Email**: `demo@example.com`
    *   **Password**: `password`
3.  *Note: The app seeds this demo user automatically on first load.*

---

## 📁 Project Structure

```
GlobeTrotter/
├── backend/                # FastAPI Application
│   ├── main.py             # API Entry Point & Routes
│   ├── models.py           # Database Models
│   ├── schemas.py          # Pydantic Schemas
│   ├── database.py         # DB Configuration
│   ├── requirements.txt    # Python Dependencies
│   └── globetrotter.db     # SQLite Database (generated)
│
├── frontend/               # Vanilla JS Application
│   ├── index.html          # Main Entry & Layout
│   ├── styles.css          # Design System & CSS
│   ├── script.js           # App Logic & API Integration
│   └── config.js           # Configuration
│
├── modern-ui/              # (Deprecated) React Prototype
└── README.md               # Documentation
```

## 🛠️ Tech Stack

*   **Frontend**: HTML5, CSS3 (Variables, Flexbox/Grid), Vanilla JavaScript (ES6+).
*   **Backend**: Python, FastAPI, SQLAlchemy, Pydantic.
*   **Database**: SQLite.
*   **DevOps**: Git.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

## 📄 License

MIT License.
