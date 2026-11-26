from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.auth.security import get_current_user
from app.models import User, Report
from app.schemas import ReportResponse, DoctorNotesUpdate
from app.services.db_service import DatabaseService
from app.services.pdf_generator import PDFReportGenerator
from app.config import settings

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/{scan_id}", response_model=ReportResponse)
def get_report_details(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = DatabaseService.get_report(db, scan_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found for this scan")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this report")
    return report

@router.put("/{scan_id}/notes", response_model=ReportResponse)
def update_report_notes(
    scan_id: str,
    notes_in: DoctorNotesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = DatabaseService.get_report(db, scan_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this report")
        
    # Update notes in DB
    report = DatabaseService.update_doctor_notes(db, scan_id, notes_in.doctor_notes)
    
    # Regenerate PDF with the updated doctor notes
    try:
        scan = report.scan
        # Resolve physical paths
        orig_filename = os.path.basename(scan.image_path)
        heatmap_filename = os.path.basename(scan.heatmap_path) if scan.heatmap_path else ""
        pdf_filename = os.path.basename(report.pdf_path)
        
        orig_path = settings.UPLOAD_DIR / orig_filename
        heatmap_path = settings.UPLOAD_DIR / heatmap_filename if heatmap_filename else ""
        pdf_path = settings.REPORT_DIR / pdf_filename
        
        # Split predictions
        hair_pred = None
        disease_pred = None
        for p in scan.predictions:
            if p.prediction_type == "hair_loss":
                hair_pred = p
            elif p.prediction_type == "scalp_disease":
                disease_pred = p
                
        if hair_pred and disease_pred:
            PDFReportGenerator.generate(
                output_pdf_path=str(pdf_path),
                patient_name=current_user.full_name or current_user.email,
                patient_email=current_user.email,
                patient_gender=current_user.gender or "male",
                scan_date=scan.created_at,
                original_img_path=str(orig_path),
                heatmap_img_path=str(heatmap_path) if os.path.exists(heatmap_path) else "",
                hair_stage=hair_pred.label,
                hair_confidence=hair_pred.confidence,
                hair_severity=hair_pred.severity or "Normal",
                disease_name=disease_pred.label,
                disease_confidence=disease_pred.confidence,
                disease_severity=disease_pred.severity or "Normal",
                hair_recommendations=hair_pred.recommendations or [],
                disease_recommendations=disease_pred.recommendations or [],
                doctor_notes=report.doctor_notes
            )
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").error(f"Failed to regenerate PDF on notes update: {e}")
        
    return report
