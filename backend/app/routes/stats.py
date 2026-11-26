from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.security import get_current_user
from app.models import User
from app.schemas import DashboardStats
from app.services.db_service import DatabaseService

router = APIRouter(prefix="/stats", tags=["statistics"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stats = DatabaseService.get_dashboard_stats(db, current_user.id)
    return stats
