from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
import uuid
import shutil
import os
from datetime import datetime
from typing import List, Optional

from app.database import get_db
from app.auth.security import get_current_user
from app.models import User, Scan
from app.schemas import ScanResponse
from app.config import settings
from app.services.ai_inference import analyzer
from app.services.db_service import DatabaseService
from app.services.pdf_generator import PDFReportGenerator

router = APIRouter(prefix="/scans", tags=["scans"])

@router.post("/upload", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def upload_scan(
    file: UploadFile = File(...),
    gender: Optional[str] = Form(None),
    auto_email: Optional[bool] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Create a unique filename and save path
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{file_id}{ext}"
    heatmap_filename = f"{file_id}_heatmap{ext}"
    
    # Absolute paths
    save_path = settings.UPLOAD_DIR / filename
    heatmap_path = settings.UPLOAD_DIR / heatmap_filename
    
    # 2. Save the uploaded file
    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save uploaded image: {e}"
        )
        
    # 3. Run AI Inference and Quality checks
    try:
        # Determine the gender to use for the AI model mapping
        active_gender = gender or current_user.gender or "male"
        # Preprocessing, quality assessment, PyTorch predictions, Grad-CAM generation
        result = analyzer.run_inference(str(save_path), str(heatmap_path), gender=active_gender)
        
        # Clear of session-based overrides. Let model evaluate each upload independently.
        pass
    except ValueError as e:
        # Cleanup saved original image if validation fails
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        # Cleanup saved original image if inference completely crashes
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(
            status_code=500,
            detail=f"AI model inference error: {e}"
        )
        
    # Relative paths for frontend serving
    rel_image_path = f"/static/uploads/{filename}"
    rel_heatmap_path = f"/static/uploads/{heatmap_filename}"
    
    # 4. Save to Database
    # Save base scan
    scan = DatabaseService.create_scan(
        db=db,
        user_id=current_user.id,
        image_path=rel_image_path,
        heatmap_path=rel_heatmap_path,
        lighting_score=result["quality"]["brightness_score"],
        blur_score=result["quality"]["blur_score"],
        quality_passed=result["quality"]["passed"]
    )
    
    # Save predictions
    hair_pred = result["hair_loss"]
    DatabaseService.create_prediction(
        db=db,
        scan_id=scan.id,
        prediction_type="hair_loss",
        label=hair_pred["label"],
        confidence=hair_pred["confidence"],
        severity=hair_pred["severity"],
        explanation=hair_pred["explanation"],
        recommendations=hair_pred["recommendations"]
    )
    
    disease_pred = result["scalp_disease"]
    DatabaseService.create_prediction(
        db=db,
        scan_id=scan.id,
        prediction_type="scalp_disease",
        label=disease_pred["label"],
        confidence=disease_pred["confidence"],
        severity=disease_pred["severity"],
        explanation=disease_pred["explanation"],
        recommendations=disease_pred["recommendations"]
    )
    
    # 5. Compile PDF Report
    # Compile PDF filename dynamically using the actual database Scan ID
    # so that the frontend requests match the file on disk (scan.id_report.pdf)
    pdf_filename = f"{scan.id}_report.pdf"
    pdf_path = settings.REPORT_DIR / pdf_filename
    rel_pdf_path = f"/static/reports/{pdf_filename}"
    
    try:
        PDFReportGenerator.generate(
            output_pdf_path=str(pdf_path),
            patient_name=current_user.full_name or current_user.email,
            patient_email=current_user.email,
            patient_gender=current_user.gender or "male",
            scan_date=datetime.now(),
            original_img_path=str(save_path),
            heatmap_img_path=str(heatmap_path),
            hair_stage=hair_pred["label"],
            hair_confidence=hair_pred["confidence"],
            hair_severity=hair_pred["severity"],
            disease_name=disease_pred["label"],
            disease_confidence=disease_pred["confidence"],
            disease_severity=disease_pred["severity"],
            hair_recommendations=hair_pred["recommendations"],
            disease_recommendations=disease_pred["recommendations"],
            doctor_notes=""
        )
        
        # Save report info in Database
        DatabaseService.create_report(
            db=db,
            scan_id=scan.id,
            user_id=current_user.id,
            pdf_path=rel_pdf_path,
            doctor_notes=""
        )
        
        # 6. Auto-Email PDF Report if requested
        if auto_email:
            from app.services.email_service import EmailService
            EmailService.send_pdf_report(
                recipient_email=current_user.email,
                patient_name=current_user.full_name or "Patient",
                pdf_path=str(pdf_path),
                scan_id=scan.id
            )
    except Exception as e:
        # Log report generation errors but don't crash scan saving
        import logging
        logging.getLogger("uvicorn.error").error(f"Failed to generate PDF report: {e}")
        
    # Refresh scan to load relationship predictions
    db.refresh(scan)
    return scan

@router.get("/history", response_model=List[ScanResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DatabaseService.get_user_scans(db, current_user.id)

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan_details(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = DatabaseService.get_scan(db, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    if scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this scan")
    return scan

@router.delete("/{scan_id}", status_code=status.HTTP_200_OK)
def delete_scan(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = DatabaseService.get_scan(db, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    if scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this scan")
        
    # Delete physical files
    try:
        # Parse names from static paths
        filename = os.path.basename(scan.image_path)
        heatmap_filename = os.path.basename(scan.heatmap_path) if scan.heatmap_path else None
        
        orig_file = settings.UPLOAD_DIR / filename
        if os.path.exists(orig_file):
            os.remove(orig_file)
            
        if heatmap_filename:
            hm_file = settings.UPLOAD_DIR / heatmap_filename
            if os.path.exists(hm_file):
                os.remove(hm_file)
                
        # If report exists, delete report PDF
        if scan.report:
            pdf_filename = os.path.basename(scan.report.pdf_path)
            pdf_file = settings.REPORT_DIR / pdf_filename
            if os.path.exists(pdf_file):
                os.remove(pdf_file)
    except Exception as e:
        # Log error, proceed with DB deletion
        pass
        
    db.delete(scan)
    db.commit()
    return {"detail": "Scan and associated assets successfully deleted"}

@router.get("/export/dump")
def export_database_dump(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Fetch all scans of the user with their predictions and reports
        scans = db.query(Scan).filter(Scan.user_id == current_user.id).all()
        
        dump = []
        for s in scans:
            predictions = []
            for p in s.predictions:
                predictions.append({
                    "prediction_type": p.prediction_type,
                    "label": p.label,
                    "confidence": p.confidence,
                    "severity": p.severity,
                    "explanation": p.explanation,
                    "recommendations": p.recommendations
                })
            
            report = db.query(Report).filter(Report.scan_id == s.id).first()
            report_data = {
                "doctor_notes": report.doctor_notes if report else "",
                "pdf_path": report.pdf_path if report else ""
            }
            
            dump.append({
                "scan_id": s.id,
                "timestamp": s.created_at.isoformat(),
                "image_path": s.image_path,
                "heatmap_path": s.heatmap_path,
                "lighting_score": s.lighting_score,
                "blur_score": s.blur_score,
                "quality_passed": s.quality_passed,
                "predictions": predictions,
                "report": report_data
            })
            
        from fastapi.responses import JSONResponse
        
        # Return a pretty-printed JSON file as download attachment
        headers = {"Content-Disposition": f"attachment; filename=scalp_diagnostix_dump_{current_user.id}.json"}
        return JSONResponse(content=dump, headers=headers)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export system dump: {e}"
        )
