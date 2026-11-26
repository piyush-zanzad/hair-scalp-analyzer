from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import engine, Base
from app.auth.routes import router as auth_router
from app.routes.scans import router as scans_router
from app.routes.reports import router as reports_router
from app.routes.stats import router as stats_router
from app.routes.settings import router as settings_router

# Initialize database tables on startup
# This creates all tables in the connected database (PostgreSQL or fallback SQLite)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI Scalp Stage and Disease Analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
# Allows typical development ports and production domains
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORT_DIR, exist_ok=True)

# Mount the static directory to serve images and PDF reports
app.mount("/static", StaticFiles(directory=str(settings.BASE_DIR / "static")), name="static")

# Mount Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(scans_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)

# Mount static files for frontend SPA (Single Page Application)
frontend_path = settings.BASE_DIR / "frontend_dist"
if frontend_path.exists():
    from fastapi.responses import FileResponse
    
    @app.get("/{fallback_path:path}")
    def spa_fallback(fallback_path: str):
        if fallback_path.startswith("static/") or fallback_path.startswith("api/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404)
            
        file_path = frontend_path / fallback_path
        if file_path.is_file():
            return FileResponse(file_path)
            
        return FileResponse(frontend_path / "index.html")

    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")
else:
    @app.get("/")
    def read_root():
        return {
            "status": "online",
            "app_name": settings.PROJECT_NAME,
            "api_docs": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
