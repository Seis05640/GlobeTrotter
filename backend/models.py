"""
Database models for GlobeTrotter.
Trip -> Stop -> Activity (nested relationships)
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime
import datetime
from sqlalchemy.orm import relationship
from database import Base


class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # Relationship
    stops = relationship("Stop", back_populates="trip", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="trip", cascade="all, delete-orphan")


class Stop(Base):
    __tablename__ = "stops"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    city = Column(String, nullable=False)
    duration_days = Column(Integer, nullable=False)
    stop_order = Column(Integer, nullable=False)  # Renamed from 'order' to avoid SQL keyword
    
    # Relationships
    trip = relationship("Trip", back_populates="stops")
    activities = relationship("Activity", back_populates="stop", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    stop_id = Column(Integer, ForeignKey("stops.id"), nullable=False)
    name = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    
    # Relationship
    stop = relationship("Stop", back_populates="activities")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    sender = Column(String, nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationship
    trip = relationship("Trip", back_populates="messages")
