# AI-Powered Hair Fall Stage & Scalp Disease Diagnostics System

An enterprise-ready diagnostic SaaS application utilizing deep convolutional neural networks (ResNet50 / EfficientNet) to perform real-time scalp health assessment. The application analyzes inputs captured via a laptop webcam, checks frames for lighting/exposure quality, and maps target diagnostics onto visual overlays using Gradient-weighted Class Activation Mapping (Grad-CAM).

---

## Technical Features
- **Real-Time Webcam Quality Assessor**: Live canvas frame analysis tracking lighting levels and blur indexes.
- **Deep Learning Classifiers**: Categorizes Norwood Stages I-VII (Male Baldness), Ludwig Stages I-III (Female Thinning), Dandruff (Seborrheic Dermatitis), and Scalp Psoriasis.
- **Visual Explainability (Grad-CAM)**: Renders feature activation heatmaps detailing why the networks classified the target label.
- **Dynamic PDF Diagnostics Compiler**: Generates printable clinical records including comparative history.
- **Clinical Admin Dashboard**: Modern UI showing progress graphs, disease metrics, and past logs.
- **Automatic DB Failover**: Connects to PostgreSQL in production and fallback automates to SQLite locally for zero-configuration testing.

---

## Project Structure

```
hair-scalp-analyzer/
├── backend/                  # FastAPI Application codebase
│   ├── app/
│   │   ├── auth/             # Password crypt & token validators
│   │   ├── routes/           # Scan, report, and statistic endpoints
│   │   ├── services/         # PyTorch inference, Grad-CAM, and ReportLab PDF compilation
│   │   └── main.py           # Core app launchpad
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Vite React TypeScript client
│   ├── src/
│   │   ├── components/       # Camera canvas, sidebars, charts, cards
│   │   ├── pages/            # Landing page, dashboard, settings, help centers
│   │   └── App.tsx           # Router navigation
│   └── package.json          # Node dependencies
├── models/                   # PyTorch training module (train.py)
├── database/                 # SQL schemas and seed.py helpers
├── docs/                     # Dataset structures and API specs
├── docker-compose.yml        # Multi-container orchestration
├── Dockerfile.backend        # Python production container build
├── Dockerfile.frontend       # Node & Nginx production container build
└── README.md                 # Documentation
```

---

## 1. Quick Start: Local Development Setup

Run the application locally without Docker.

### Backend Setup (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database (creates default login `doctor@example.com` / `password123` and inserts mock historical scan metrics):
   ```bash
   python ../database/seed.py
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The Swagger API documentation will be available at `http://localhost:8000/docs`.*

### Frontend Setup (React & Tailwind)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Vite dev-server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`. Sign in with:
   - **Email**: `doctor@example.com`
   - **Password**: `password123`

---

## 2. Production Deployment: Docker Compose

Deploy the production stack (PostgreSQL + FastAPI + Nginx React Frontend).

1. Ensure you have Docker and Docker Compose installed.
2. In the root directory, build and run the services:
   ```bash
   docker-compose up --build
   ```
3. Docker will:
   - Spin up a PostgreSQL instance on port `5432`.
   - Build the backend Python environment, wait for DB connection, and run FastAPI on port `8000`.
   - Compile the React client and serve it via Nginx on port `80` (handles proxy routing for API calls).
4. Access the production portal at `http://localhost`.

---

## 3. Deep Learning & Custom Weights

By default, the backend loads architectures using random weights and renders simulated Grad-CAMs if custom-trained checkpoint files are not present. To train and run custom weights:

1. Collect images according to the guidelines in [docs/DATASET.md](file:///docs/DATASET.md).
2. Execute the PyTorch training pipeline:
   ```bash
   python models/train.py
   ```
3. Copy the output files to the target weight paths:
   - **Hair Loss Checkpoint**: Copy best weights file to `backend/models/hair_loss_resnet.pth`
   - **Scalp Disease Checkpoint**: Copy best weights file to `backend/models/scalp_disease_resnet.pth`
4. Reboot the FastAPI server; it will automatically detect and load your custom trained parameters.
