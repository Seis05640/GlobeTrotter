"""
Database setup for GlobeTrotter backend.
SQLite connection and session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file (auto-created)
DATABASE_URL = "sqlite:///./globetrotter.db"

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    """Get database session for request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
