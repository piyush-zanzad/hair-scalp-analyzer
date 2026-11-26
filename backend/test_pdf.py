from app.services.pdf_generator import PDFReportGenerator
from datetime import datetime
from pathlib import Path
import os

# Create directories
os.makedirs("static/reports", exist_ok=True)
os.makedirs("static/uploads", exist_ok=True)

pdf_path = Path("static/reports/test_report.pdf")
img_path = Path("static/uploads/test_img.jpg")

# Create a dummy image
from PIL import Image as PILImage
PILImage.new('RGB', (100, 100), color='red').save(img_path)

try:
    print("Testing PDF Generation...")
    PDFReportGenerator.generate(
        output_pdf_path=str(pdf_path),
        patient_name="John Doe",
        patient_email="john@example.com",
        patient_gender="male",
        scan_date=datetime.now(),
        original_img_path=str(img_path),
        heatmap_img_path=str(img_path),
        hair_stage="Norwood Stage II",
        hair_confidence=0.85,
        hair_severity="Mild",
        disease_name="Healthy Scalp",
        disease_confidence=0.95,
        disease_severity="Normal",
        hair_recommendations=["Test rec 1", "Test rec 2"],
        disease_recommendations=["Test rec 3"],
        doctor_notes="Test notes"
    )
    print("SUCCESS: PDF compiled correctly at", pdf_path)
except Exception as e:
    import traceback
    print("FAILED:")
    traceback.print_exc()
