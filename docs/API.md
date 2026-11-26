# API Documentation: AI Scalp Diagnostics API

The Scalp Diagnostics server exposes endpoints for clinical operators, image scans, analytics, and PDF reports. The server runs at `http://localhost:8000` (or behind the Nginx proxy at port 80).

---

## 1. Authentication Endpoints

### Register Operator
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Request Body**:
```json
{
  "email": "doctor@example.com",
  "password": "password123",
  "full_name": "Dr. Elizabeth Blackburn",
  "gender": "female"
}
```
* **Success Response (201 Created)**:
```json
{
  "id": "e4b6d92f-124b-4b2a-89a1-a67b841cd1d4",
  "email": "doctor@example.com",
  "full_name": "Dr. Elizabeth Blackburn",
  "gender": "female",
  "created_at": "2026-07-23T20:26:14.341Z"
}
```

### Login (JSON-based)
* **URL**: `/api/auth/login-json`
* **Method**: `POST`
* **Request Body**:
```json
{
  "email": "doctor@example.com",
  "password": "password123"
}
```
* **Success Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer"
}
```

### Current User Profile
* **URL**: `/api/auth/me`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "id": "e4b6d92f-124b-4b2a-89a1-a67b841cd1d4",
  "email": "doctor@example.com",
  "full_name": "Dr. Elizabeth Blackburn",
  "gender": "female",
  "created_at": "2026-07-23T20:26:14.341Z"
}
```

---

## 2. Scan & Analysis Endpoints

### Upload & Analyze Scan
* **URL**: `/api/scans/upload`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Content-Type**: `multipart/form-data`
* **Request Payload**:
  - `file`: Binary image file (Webcam JPG frame)
* **Success Response (201 Created)**:
```json
{
  "id": "c1a8d052-16e5-4f40-8451-b8471c0d45a9",
  "user_id": "e4b6d92f-124b-4b2a-89a1-a67b841cd1d4",
  "image_path": "/static/uploads/c1a8d052...jpg",
  "heatmap_path": "/static/uploads/c1a8d052..._heatmap.jpg",
  "lighting_score": 122.4,
  "blur_score": 142.1,
  "quality_passed": true,
  "created_at": "2026-07-23T20:29:12.112Z",
  "predictions": [
    {
      "id": "pred-uuid-1",
      "scan_id": "c1a8d052-16e5-4f40-8451-b8471c0d45a9",
      "prediction_type": "hair_loss",
      "label": "Norwood Stage III",
      "confidence": 0.88,
      "severity": "Moderate",
      "explanation": "Frontal hairline receded...",
      "recommendations": ["Consult dermatologist...", "Incorporate biotin..."]
    },
    {
      "id": "pred-uuid-2",
      "scan_id": "c1a8d052-16e5-4f40-8451-b8471c0d45a9",
      "prediction_type": "scalp_disease",
      "label": "Dandruff",
      "confidence": 0.94,
      "severity": "Mild to Moderate",
      "explanation": "Flaking observed...",
      "recommendations": ["Use zinc pyrithione...", "Avoid heavy oils..."]
    }
  ]
}
```

### Scan History
* **URL**: `/api/scans/history`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**: Returns list of Scan Response objects.

### Single Scan Detail
* **URL**: `/api/scans/{scan_id}`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**: Single Scan Response object.

### Delete Scan Record
* **URL**: `/api/scans/{scan_id}`
* **Method**: `DELETE`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "detail": "Scan and associated assets successfully deleted"
}
```

---

## 3. PDF Report Endpoints

### Retrieve Report Metadata
* **URL**: `/api/reports/{scan_id}`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "id": "report-uuid",
  "scan_id": "scan-uuid",
  "user_id": "user-uuid",
  "doctor_notes": "Clinical follow-up required...",
  "pdf_path": "/static/reports/scan-uuid_report.pdf",
  "created_at": "2026-07-23T20:29:12.112Z"
}
```

### Update Practitioner Comments (PDF Regenerator)
* **URL**: `/api/reports/{scan_id}/notes`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "doctor_notes": "Patient hair loss Norwood III vertex is stabilizing. Scalp dermatitis is cleared. Maintain standard therapy."
}
```
* **Success Response (200 OK)**: Returns updated Report Metadata. Also rebuilds the physical PDF report on disk.

---

## 4. Statistics Endpoints

### Dashboard Aggregate Data
* **URL**: `/api/stats/dashboard`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "total_scans": 4,
  "healthy_scans": 2,
  "diseased_scans": 2,
  "latest_prediction": { ...latest scan... },
  "confidence_trend": [
    { "date": "05/23", "confidence": 92.5 },
    { "date": "06/23", "confidence": 88.0 }
  ],
  "monthly_progress": [
    { "month": "May", "scans": 1 },
    { "month": "Jun", "scans": 3 }
  ],
  "disease_frequency": [
    { "disease": "Healthy Scalp", "count": 2 },
    { "disease": "Dandruff", "count": 2 },
    { "disease": "Psoriasis", "count": 0 }
  ],
  "hair_loss_distribution": [
    { "stage": "Norwood Stage III", "count": 3 },
    { "stage": "Healthy Hair", "count": 1 }
  ]
}
```
