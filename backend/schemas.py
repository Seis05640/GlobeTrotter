"""
Pydantic schemas for request/response validation.
Minimal validation for hackathon demo safety.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List
from datetime import date


# ===== Request Schemas =====

class TripCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    
    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v, info):
        """Ensure end_date is after start_date."""
        if 'start_date' in info.data and v <= info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class StopCreate(BaseModel):
    city: str
    duration_days: int = Field(gt=0)  # Must be > 0


class ActivityCreate(BaseModel):
    name: str
    cost: float = Field(ge=0)  # Must be >= 0


# ===== Response Schemas =====

class ActivityResponse(BaseModel):
    id: int
    name: str
    cost: float
    
    class Config:
        from_attributes = True


class StopResponse(BaseModel):
    id: int
    city: str
    duration_days: int
    stop_order: int
    activities: List[ActivityResponse] = []
    
    class Config:
        from_attributes = True


class TripResponse(BaseModel):
    id: int
    name: str
    start_date: date
    end_date: date
    stops: List[StopResponse] = []
    
    class Config:
        from_attributes = True


# ===== Budget Schemas =====

class StopBudgetBreakdown(BaseModel):
    city: str
    duration_days: int
    stay_cost: float
    activities_cost: float
    total: float


class BudgetResponse(BaseModel):
    trip_id: int
    total_budget: float
    breakdown: List[StopBudgetBreakdown]
