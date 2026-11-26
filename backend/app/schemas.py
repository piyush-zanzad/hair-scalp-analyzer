from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    gender: Optional[str] = "male"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionBase(BaseModel):
    prediction_type: str
    label: str
    confidence: float
    severity: Optional[str] = None
    explanation: Optional[str] = None
    recommendations: Optional[List[str]] = None

class PredictionResponse(PredictionBase):
    id: str
    scan_id: str

    class Config:
        from_attributes = True

# Scan Schemas
class ScanResponse(BaseModel):
    id: str
    user_id: str
    image_path: str
    heatmap_path: Optional[str] = None
    lighting_score: Optional[float] = None
    blur_score: Optional[float] = None
    quality_passed: bool
    created_at: datetime
    predictions: List[PredictionResponse] = []

    class Config:
        from_attributes = True

# Report Schemas
class ReportResponse(BaseModel):
    id: str
    scan_id: str
    user_id: str
    doctor_notes: Optional[str] = None
    pdf_path: str
    created_at: datetime
    scan: Optional[ScanResponse] = None

    class Config:
        from_attributes = True

class DoctorNotesUpdate(BaseModel):
    doctor_notes: str

# Stats Schemas
class DashboardStats(BaseModel):
    total_scans: int
    healthy_scans: int
    diseased_scans: int
    total_scans_trend: Optional[str] = "0% this month"
    healthy_scans_trend: Optional[str] = "0% this month"
    diseased_scans_trend: Optional[str] = "0% this month"
    latest_prediction: Optional[ScanResponse] = None
    confidence_trend: List[dict] = []
    monthly_progress: List[dict] = []
    disease_frequency: List[dict] = []
    hair_loss_distribution: List[dict] = []
