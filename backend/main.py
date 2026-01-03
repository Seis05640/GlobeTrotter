"""
FastAPI backend for GlobeTrotter.
Simple, demo-safe endpoints with SQLite database.
"""

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict

import models
import schemas
from database import engine, get_db, Base

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="GlobeTrotter API")

# CORS setup (hackathon-safe)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Trip Endpoints =====

@app.post("/trip", response_model=schemas.TripResponse)
def create_trip(trip: schemas.TripCreate, db: Session = Depends(get_db)):
    """Create a new trip."""
    db_trip = models.Trip(
        name=trip.name,
        start_date=trip.start_date,
        end_date=trip.end_date
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

    db.refresh(db_trip)
    return db_trip


@app.get("/trips", response_model=List[schemas.TripResponse])
def get_trips(db: Session = Depends(get_db)):
    """Get all trips."""
    return db.query(models.Trip).all()


@app.get("/trip/{trip_id}", response_model=schemas.TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get full trip itinerary with stops and activities."""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


# ===== Stop Endpoints =====

@app.post("/trip/{trip_id}/stop", response_model=schemas.StopResponse)
def add_stop(trip_id: int, stop: schemas.StopCreate, db: Session = Depends(get_db)):
    """Add a stop to a trip."""
    # Verify trip exists
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Calculate stop order (auto-increment)
    max_order = db.query(models.Stop).filter(
        models.Stop.trip_id == trip_id
    ).count()
    
    db_stop = models.Stop(
        trip_id=trip_id,
        city=stop.city,
        duration_days=stop.duration_days,
        stop_order=max_order + 1
    )
    db.add(db_stop)
    db.commit()
    db.refresh(db_stop)
    return db_stop


# ===== Activity Endpoints =====

@app.post("/stop/{stop_id}/activity", response_model=schemas.ActivityResponse)
def add_activity(stop_id: int, activity: schemas.ActivityCreate, db: Session = Depends(get_db)):
    """Add an activity to a stop."""
    # Verify stop exists
    stop = db.query(models.Stop).filter(models.Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    
    db_activity = models.Activity(
        stop_id=stop_id,
        name=activity.name,
        cost=activity.cost
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


# ===== Budget Endpoint =====

DAILY_STAY_RATE = 3000.0  # Fixed rate for stay cost calculation

@app.get("/trip/{trip_id}/budget", response_model=schemas.BudgetResponse)
def get_trip_budget(trip_id: int, db: Session = Depends(get_db)):
    """
    Calculate total trip budget dynamically.
    
    Budget = Stay Cost + Activities Cost
    - Stay Cost = duration_days × 3000 (fixed daily rate)
    - Activities Cost = sum of all activity costs
    """
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    breakdown = []
    total_budget = 0.0
    
    for stop in trip.stops:
        # Calculate stay cost
        stay_cost = stop.duration_days * DAILY_STAY_RATE
        
        # Calculate activities cost
        activities_cost = sum(activity.cost for activity in stop.activities)
        
        # Total for this stop
        stop_total = stay_cost + activities_cost
        total_budget += stop_total
        
        breakdown.append(
            schemas.StopBudgetBreakdown(
                city=stop.city,
                duration_days=stop.duration_days,
                stay_cost=stay_cost,
                activities_cost=activities_cost,
                total=stop_total
            )
        )
    
    return schemas.BudgetResponse(
        trip_id=trip_id,
        total_budget=total_budget,
        breakdown=breakdown
    )



# ===== Chat / WebSocket Endpoints =====

class ConnectionManager:
    def __init__(self):
        # trip_id -> list of active websockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, trip_id: int):
        await websocket.accept()
        if trip_id not in self.active_connections:
            self.active_connections[trip_id] = []
        self.active_connections[trip_id].append(websocket)

    def disconnect(self, websocket: WebSocket, trip_id: int):
        if trip_id in self.active_connections:
            if websocket in self.active_connections[trip_id]:
                self.active_connections[trip_id].remove(websocket)
            if not self.active_connections[trip_id]:
                del self.active_connections[trip_id]

    async def broadcast(self, message: dict, trip_id: int):
        if trip_id in self.active_connections:
            for connection in self.active_connections[trip_id]:
                await connection.send_json(message)

manager = ConnectionManager()


@app.get("/trip/{trip_id}/messages", response_model=List[schemas.MessageResponse])
def get_trip_messages(trip_id: int, db: Session = Depends(get_db)):
    """Get chat history for a trip."""
    # Verify trip exists
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    return db.query(models.Message).filter(
        models.Message.trip_id == trip_id
    ).order_by(models.Message.timestamp.asc()).all()


@app.websocket("/ws/{trip_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, trip_id: int, client_id: str, db: Session = Depends(get_db)):
    await manager.connect(websocket, trip_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Save message to DB
            db_message = models.Message(
                trip_id=trip_id,
                sender=client_id,
                content=data
            )
            db.add(db_message)
            db.commit()
            db.refresh(db_message)
            
            # Broadcast to all connected clients in this trip
            response = schemas.MessageResponse.model_validate(db_message)
            msg_dict = {
                "id": response.id,
                "trip_id": response.trip_id,
                "sender": response.sender,
                "content": response.content,
                "timestamp": response.timestamp.isoformat()
            }
            
            await manager.broadcast(msg_dict, trip_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, trip_id)


# ===== AI Suggestions Endpoint =====

MOCK_SUGGESTIONS = {
    "paris": [
        {"name": "Eiffel Tower Visit", "category": "Sightseeing", "estimated_cost": 30.0, "rating": 4.8, "image": "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=400"},
        {"name": "Louvre Museum", "category": "Culture", "estimated_cost": 20.0, "rating": 4.7, "image": "https://images.unsplash.com/photo-1499856871940-a09e3f90b4e1?w=400"},
        {"name": "Seine River Cruise", "category": "Adventure", "estimated_cost": 15.0, "rating": 4.5, "image": "https://images.unsplash.com/photo-1626577322967-33afc6cb51b7?w=400"},
    ],
    "tokyo": [
        {"name": "Senso-ji Temple", "category": "Culture", "estimated_cost": 0.0, "rating": 4.9, "image": "https://images.unsplash.com/photo-1542931287-023b922fa89b?w=400"},
        {"name": "Akihabara Shopping", "category": "Shopping", "estimated_cost": 100.0, "rating": 4.6, "image": "https://images.unsplash.com/photo-1616853534958-86d4e214ae90?w=400"},
        {"name": "Sushi Making Class", "category": "Dining", "estimated_cost": 80.0, "rating": 4.8, "image": "https://images.unsplash.com/photo-1579584425555-d3715dfd8d60?w=400"},
    ],
    "bali": [
        {"name": "Surf Lesson", "category": "Adventure", "estimated_cost": 40.0, "rating": 4.9, "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400"},
        {"name": "Rice Terrace Walk", "category": "Nature", "estimated_cost": 5.0, "rating": 4.7, "image": "https://images.unsplash.com/photo-1555400082-6b3a1c8f8f0e?w=400"},
        {"name": "Uluwatu Temple", "category": "Culture", "estimated_cost": 10.0, "rating": 4.8, "image": "https://images.unsplash.com/photo-1537553753697-3f365d953a77?w=400"},
    ]
}

@app.get("/suggestions", response_model=List[schemas.SuggestionResponse])
def get_suggestions(city: str):
    """
    Get AI-powered activity suggestions for a city.
    Uses mock data for demo purposes, falling back to generic items if city unknown.
    """
    city_lower = city.lower().strip()
    
    # Simple keyword matching for demo
    if city_lower in MOCK_SUGGESTIONS:
        return MOCK_SUGGESTIONS[city_lower]
    
    # Generic fallback
    return [
        {"name": f"Explore {city} City Center", "category": "Sightseeing", "estimated_cost": 0.0, "rating": 4.5, "image": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400"},
        {"name": f"Local Food Tour in {city}", "category": "Dining", "estimated_cost": 50.0, "rating": 4.6, "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400"},
        {"name": f"{city} Museum Visit", "category": "Culture", "estimated_cost": 25.0, "rating": 4.4, "image": "https://images.unsplash.com/photo-1518998053901-5348d3969105?w=400"},
    ]


# ===== Health Check =====

@app.get("/")
def health_check():
    """Simple health check endpoint."""
    return {"status": "GlobeTrotter API is running!"}
