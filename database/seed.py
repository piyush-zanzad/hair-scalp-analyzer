import os
import sys
from datetime import datetime, timedelta
import uuid

# Add backend to path to import models
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.database import SessionLocal, Base, engine
from app.models import User, Scan, Prediction, Report
from app.auth.security import get_password_hash
from app.config import settings

# Force table creation
Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    
    # Check if seed already exists
    existing_user = db.query(User).filter(User.email == "doctor@example.com").first()
    if existing_user:
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding database...")

    # 1. Create Mock User
    user = User(
        email="doctor@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Dr. Alexander Pierce",
        gender="male"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Created user: {user.email}")

    # 2. Historical Scans Data
    scans_data = [
        {
            "months_ago": 4,
            "hair_loss": {
                "label": "Norwood Stage I",
                "confidence": 0.94,
                "severity": "Mild",
                "explanation": "Normal hair density with slight frontal thinning.",
                "recommendations": ["Incorporate mild scalp massages daily.", "Eat a balanced biotin-rich diet."]
            },
            "disease": {
                "label": "Healthy Scalp",
                "confidence": 0.98,
                "severity": "Normal",
                "explanation": "No symptoms of scaling, itching, or inflammation present.",
                "recommendations": ["Wash regularly with a gentle clinical shampoo."]
            }
        },
        {
            "months_ago": 3,
            "hair_loss": {
                "label": "Norwood Stage II",
                "confidence": 0.88,
                "severity": "Mild",
                "explanation": "Frontal hairline recessions at the temporal regions.",
                "recommendations": ["Consult a dermatologist regarding preventive care.", "Monitor hairline changes."]
            },
            "disease": {
                "label": "Dandruff",
                "confidence": 0.85,
                "severity": "Mild to Moderate",
                "explanation": "Accumulation of small white flakes and mild sebum density.",
                "recommendations": ["Use Zinc Pyrithione shampoo twice a week.", "Avoid thick hair oils."]
            }
        },
        {
            "months_ago": 2,
            "hair_loss": {
                "label": "Norwood Stage III",
                "confidence": 0.82,
                "severity": "Moderate",
                "explanation": "Deep symmetrical recessions at temples and thinning at vertex.",
                "recommendations": ["Explore FDA-approved DHT blockers under clinical supervision.", "Reduce heat styling."]
            },
            "disease": {
                "label": "Dandruff",
                "confidence": 0.91,
                "severity": "Mild to Moderate",
                "explanation": "Flaking observed on the crown region.",
                "recommendations": ["Use Ketoconazole or selenium sulfide shampoo.", "Leave lather for 3-5 mins before rinsing."]
            }
        },
        {
            "months_ago": 1,
            "hair_loss": {
                "label": "Norwood Stage III",
                "confidence": 0.89,
                "severity": "Moderate",
                "explanation": "Deep symmetrical recessions at temples with vertex thinning.",
                "recommendations": ["Continue current topical minoxidil regimen.", "Evaluate nutritional levels."]
            },
            "disease": {
                "label": "Healthy Scalp",
                "confidence": 0.95,
                "severity": "Normal",
                "explanation": "The scalp surface is clean and clear of flakes.",
                "recommendations": ["Maintain scalp hygiene using a pH-balanced cleanser."]
            }
        }
    ]

    for data in scans_data:
        scan_date = datetime.now() - timedelta(days=30 * data["months_ago"])
        scan_id = str(uuid.uuid4())
        
        # Save a mock scan record
        scan = Scan(
            id=scan_id,
            user_id=user.id,
            image_path="/static/uploads/mock_scalp.jpg",
            heatmap_path="/static/uploads/mock_scalp_heatmap.jpg",
            lighting_score=125.0,
            blur_score=150.0,
            quality_passed=True,
            created_at=scan_date
        )
        db.add(scan)
        db.commit()
        
        # Add predictions
        hp = data["hair_loss"]
        hair_pred = Prediction(
            scan_id=scan.id,
            prediction_type="hair_loss",
            label=hp["label"],
            confidence=hp["confidence"],
            severity=hp["severity"],
            explanation=hp["explanation"],
            recommendations=hp["recommendations"]
        )
        db.add(hair_pred)
        
        dp = data["disease"]
        disease_pred = Prediction(
            scan_id=scan.id,
            prediction_type="scalp_disease",
            label=dp["label"],
            confidence=dp["confidence"],
            severity=dp["severity"],
            explanation=dp["explanation"],
            recommendations=dp["recommendations"]
        )
        db.add(disease_pred)
        db.commit()

        # Add report record
        report = Report(
            scan_id=scan.id,
            user_id=user.id,
            pdf_path="/static/reports/mock_report.pdf",
            doctor_notes="Patient shows typical male pattern baldness (Norwood III). Scalp dandruff resolved with ketoconazole treatments. Recommend continuing current therapies.",
            created_at=scan_date
        )
        db.add(report)
        db.commit()

    # Create mock files in upload directory so backend returns valid files if requested
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.REPORT_DIR, exist_ok=True)

    # Write small dummy images for static server paths
    import numpy as np
    import cv2
    
    mock_img = np.ones((480, 640, 3), dtype=np.uint8) * 180
    cv2.putText(mock_img, "Mock Scalp Scan", (150, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 0, 0), 2)
    cv2.imwrite(str(settings.UPLOAD_DIR / "mock_scalp.jpg"), mock_img)

    mock_hm = np.ones((480, 640, 3), dtype=np.uint8) * 180
    cv2.circle(mock_hm, (320, 240), 100, (0, 0, 255), -1) # Red spot
    cv2.putText(mock_hm, "Mock Grad-CAM Heatmap", (100, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
    cv2.imwrite(str(settings.UPLOAD_DIR / "mock_scalp_heatmap.jpg"), mock_hm)

    # Empty dummy report file
    with open(str(settings.REPORT_DIR / "mock_report.pdf"), "w") as f:
        f.write("%PDF-1.4 mock content")

    print("Database seeding completed successfully.")
    db.close()

if __name__ == "__main__":
    seed_database()
