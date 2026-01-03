# GlobeTrotter Backend 🌍

**FastAPI + SQLite backend for travel itinerary planning**

Built for hackathon demo - simple, reliable, offline-ready.

---

## 🚀 Quick Start

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Server:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

---

## 📋 API Endpoints

### Create Trip
```bash
POST /trip
{
  "name": "Europe Tour",
  "start_date": "2024-06-01",
  "end_date": "2024-06-15"
}
```

### Add Stop to Trip
```bash
POST /trip/{trip_id}/stop
{
  "city": "Paris",
  "duration_days": 3
}
```

### Add Activity to Stop
```bash
POST /stop/{stop_id}/activity
{
  "name": "Eiffel Tower",
  "cost": 25.0
}
```

### Get Full Itinerary
```bash
GET /trip/{trip_id}
```

### Calculate Budget
```bash
GET /trip/{trip_id}/budget
```

**Budget Formula:**
- Stay Cost = duration_days × ₹3000
- Activities Cost = sum of all activities
- Total = Stay + Activities

---

## 🛡️ Validation

- `duration_days` must be > 0
- `cost` must be >= 0
- `end_date` must be after `start_date`

---

## 🗂️ Database

**SQLite** (`globetrotter.db`) - auto-created on startup

**Schema:**
- **Trip** → **Stop** → **Activity**
- One-to-many relationships with cascade delete

---

## ✨ Features

✅ CORS enabled for frontend  
✅ Auto-generated API docs  
✅ Local database (no cloud needed)  
✅ Input validation  
✅ Dynamic budget calculation  

---

## 🧪 Test with Sample Data

```bash
# Create trip
curl -X POST http://localhost:8000/trip \
  -H "Content-Type: application/json" \
  -d '{"name": "India Tour", "start_date": "2024-07-01", "end_date": "2024-07-10"}'

# Add stop
curl -X POST http://localhost:8000/trip/1/stop \
  -H "Content-Type: application/json" \
  -d '{"city": "Goa", "duration_days": 5}'

# Add activity
curl -X POST http://localhost:8000/stop/1/activity \
  -H "Content-Type: application/json" \
  -d '{"name": "Beach Hopping", "cost": 500}'

# Get itinerary
curl http://localhost:8000/trip/1

# Get budget
curl http://localhost:8000/trip/1/budget
```

---

## 📦 Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database
- **Pydantic** - Data validation
- **SQLite** - Lightweight local database
- **Uvicorn** - ASGI server

---

## 🎯 Hackathon-Ready

- **Zero cloud dependencies** - runs offline
- **Simple setup** - 3 commands
- **Clear validation** - prevents demo crashes
- **Transparent budget logic** - easy to explain to judges

---

## 📝 File Structure

```
backend/
├── main.py          # FastAPI app + routes
├── models.py        # Database models
├── schemas.py       # Request/response schemas
├── database.py      # SQLite setup
├── requirements.txt # Dependencies
└── globetrotter.db  # Database (auto-created)
```

---

Built for GlobeTrotter hackathon project
