from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models import User, Scan, Prediction, Report
from typing import List, Optional
import json

class DatabaseService:
    @staticmethod
    def create_scan(
        db: Session,
        user_id: str,
        image_path: str,
        heatmap_path: str,
        lighting_score: float,
        blur_score: float,
        quality_passed: bool
    ) -> Scan:
        scan = Scan(
            user_id=user_id,
            image_path=image_path,
            heatmap_path=heatmap_path,
            lighting_score=lighting_score,
            blur_score=blur_score,
            quality_passed=quality_passed
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan

    @staticmethod
    def create_prediction(
        db: Session,
        scan_id: str,
        prediction_type: str,
        label: str,
        confidence: float,
        severity: str,
        explanation: str,
        recommendations: List[str]
    ) -> Prediction:
        pred = Prediction(
            scan_id=scan_id,
            prediction_type=prediction_type,
            label=label,
            confidence=confidence,
            severity=severity,
            explanation=explanation,
            recommendations=recommendations # SQLAlchemy JSON type takes Python list directly
        )
        db.add(pred)
        db.commit()
        db.refresh(pred)
        return pred

    @staticmethod
    def create_report(
        db: Session,
        scan_id: str,
        user_id: str,
        pdf_path: str,
        doctor_notes: str = ""
    ) -> Report:
        report = Report(
            scan_id=scan_id,
            user_id=user_id,
            pdf_path=pdf_path,
            doctor_notes=doctor_notes
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def get_scan(db: Session, scan_id: str) -> Optional[Scan]:
        return db.query(Scan).filter(Scan.id == scan_id).first()

    @staticmethod
    def get_user_scans(db: Session, user_id: str) -> List[Scan]:
        return db.query(Scan).filter(Scan.user_id == user_id).order_by(Scan.created_at.desc()).all()

    @staticmethod
    def get_report(db: Session, scan_id: str) -> Optional[Report]:
        return db.query(Report).filter(Report.scan_id == scan_id).first()

    @staticmethod
    def get_report_by_id(db: Session, report_id: str) -> Optional[Report]:
        return db.query(Report).filter(Report.id == report_id).first()

    @staticmethod
    def update_doctor_notes(db: Session, scan_id: str, notes: str) -> Optional[Report]:
        report = db.query(Report).filter(Report.scan_id == scan_id).first()
        if report:
            report.doctor_notes = notes
            db.commit()
            db.refresh(report)
        return report

    @staticmethod
    def get_dashboard_stats(db: Session, user_id: str) -> dict:
        # Total Scans
        total_scans = db.query(func.count(Scan.id)).filter(Scan.user_id == user_id).scalar() or 0
        
        # Healthy vs Diseased (determined by Scalp Disease prediction)
        # Fetch scans and filter in Python or use subquery
        scans = db.query(Scan).filter(Scan.user_id == user_id).all()
        
        healthy_scans = 0
        diseased_scans = 0
        
        for s in scans:
            is_diseased = False
            for p in s.predictions:
                if p.prediction_type == "scalp_disease" and p.label != "Healthy Scalp":
                    is_diseased = True
                    break
            if is_diseased:
                diseased_scans += 1
            else:
                healthy_scans += 1

        # Calculate month-over-month trend percentages dynamically
        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)
        sixty_days_ago = now - timedelta(days=60)
        
        scans_current = [s for s in scans if s.created_at >= thirty_days_ago]
        scans_previous = [s for s in scans if sixty_days_ago <= s.created_at < thirty_days_ago]
        
        current_total = len(scans_current)
        previous_total = len(scans_previous)
        
        current_healthy = 0
        current_diseased = 0
        for s in scans_current:
            is_diseased = any(p.prediction_type == "scalp_disease" and p.label != "Healthy Scalp" for p in s.predictions)
            if is_diseased:
                current_diseased += 1
            else:
                current_healthy += 1
                
        previous_healthy = 0
        previous_diseased = 0
        for s in scans_previous:
            is_diseased = any(p.prediction_type == "scalp_disease" and p.label != "Healthy Scalp" for p in s.predictions)
            if is_diseased:
                previous_diseased += 1
            else:
                previous_healthy += 1
                
        def calc_trend(curr: int, prev: int) -> str:
            if prev == 0:
                val = 100 if curr > 0 else 0
            else:
                val = int(((curr - prev) / prev) * 100)
            return f"{'+' if val >= 0 else ''}{val}% this month"
            
        total_scans_trend = calc_trend(current_total, previous_total)
        healthy_scans_trend = calc_trend(current_healthy, previous_healthy)
        diseased_scans_trend = calc_trend(current_diseased, previous_diseased)

        # Latest Prediction
        latest_scan = db.query(Scan).filter(Scan.user_id == user_id).order_by(Scan.created_at.desc()).first()

        # Monthly progress (last 6 months)
        # Mock or construct actual data
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        monthly_counts = {}
        for i in range(6):
            month_date = datetime.utcnow() - timedelta(days=30 * i)
            month_str = month_date.strftime("%b")
            monthly_counts[month_str] = 0

        scans_6m = db.query(Scan).filter(Scan.user_id == user_id, Scan.created_at >= six_months_ago).all()
        for s in scans_6m:
            m = s.created_at.strftime("%b")
            if m in monthly_counts:
                monthly_counts[m] += 1
                
        monthly_progress = [{"month": k, "scans": v} for k, v in reversed(list(monthly_counts.items()))]

        # Disease Frequency
        disease_freq = {"Healthy Scalp": 0, "Alopecia Areata": 0}
        all_preds = db.query(Prediction).join(Scan).filter(Scan.user_id == user_id, Prediction.prediction_type == "scalp_disease").all()
        for p in all_preds:
            if p.label in disease_freq:
                disease_freq[p.label] += 1
            else:
                disease_freq[p.label] = 1
        disease_frequency = [{"disease": k, "count": v} for k, v in disease_freq.items()]

        # Hair loss stage distribution
        hair_dist = {}
        all_hair_preds = db.query(Prediction).join(Scan).filter(Scan.user_id == user_id, Prediction.prediction_type == "hair_loss").all()
        for p in all_hair_preds:
            hair_dist[p.label] = hair_dist.get(p.label, 0) + 1
        hair_loss_distribution = [{"stage": k, "count": v} for k, v in hair_dist.items()]

        # Confidence trend (last 10 scans)
        recent_scans = db.query(Scan).filter(Scan.user_id == user_id).order_by(Scan.created_at.desc()).limit(10).all()
        confidence_trend = []
        for s in reversed(recent_scans):
            avg_conf = 0
            if s.predictions:
                avg_conf = sum(p.confidence for p in s.predictions) / len(s.predictions)
            confidence_trend.append({
                "date": s.created_at.strftime("%m/%d"),
                "confidence": round(avg_conf * 100, 1)
            })

        return {
            "total_scans": total_scans,
            "healthy_scans": healthy_scans,
            "diseased_scans": diseased_scans,
            "total_scans_trend": total_scans_trend,
            "healthy_scans_trend": healthy_scans_trend,
            "diseased_scans_trend": diseased_scans_trend,
            "latest_prediction": latest_scan,
            "confidence_trend": confidence_trend,
            "monthly_progress": monthly_progress,
            "disease_frequency": disease_frequency,
            "hair_loss_distribution": hair_loss_distribution
        }
