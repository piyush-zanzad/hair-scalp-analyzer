import uuid
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    gender = Column(String(50), nullable=True, default="male")  # male, female, other
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String(500), nullable=False)
    heatmap_path = Column(String(500), nullable=True)
    lighting_score = Column(Float, nullable=True)
    blur_score = Column(Float, nullable=True)
    quality_passed = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="scans")
    predictions = relationship("Prediction", back_populates="scan", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="scan", uselist=False, cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    prediction_type = Column(String(50), nullable=False)  # "hair_loss" or "scalp_disease"
    label = Column(String(100), nullable=False)            # e.g., "Norwood Stage III", "Dandruff"
    confidence = Column(Float, nullable=False)            # e.g., 0.85
    severity = Column(String(50), nullable=True)           # e.g., "Mild", "Moderate", "Severe"
    explanation = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    scan = relationship("Scan", back_populates="predictions")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_notes = Column(Text, nullable=True)
    pdf_path = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="reports")
    scan = relationship("Scan", back_populates="report")
