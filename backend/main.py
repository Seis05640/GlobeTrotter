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


# ===== Health Check =====

@app.get("/")
def health_check():
    """Simple health check endpoint."""
    return {"status": "GlobeTrotter API is running!"}
