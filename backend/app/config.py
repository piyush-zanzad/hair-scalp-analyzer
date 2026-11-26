import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Directories
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
REPORT_DIR = STATIC_DIR / "reports"
TEMP_DIR = BASE_DIR / "temp"
MODELS_DIR = BASE_DIR / "models"

# Create required directories
for directory in [
    STATIC_DIR,
    UPLOAD_DIR,
    REPORT_DIR,
    TEMP_DIR,
    MODELS_DIR,
]:
    directory.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    # Project
    PROJECT_NAME: str = "AI Hair & Scalp Analysis System"
    API_V1_STR: str = "/api"

    # Directories (Path objects)
    BASE_DIR: Path = BASE_DIR
    STATIC_DIR: Path = STATIC_DIR
    UPLOAD_DIR: Path = UPLOAD_DIR
    REPORT_DIR: Path = REPORT_DIR
    TEMP_DIR: Path = TEMP_DIR
    MODELS_DIR: Path = MODELS_DIR

    # JWT
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "clinical_ai_super_secret_key_83a17d32",
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/scalp_analysis",
    )
    SQLITE_FALLBACK_URL: str = f"sqlite:///{BASE_DIR / 'scalp_analysis.db'}"

    # AI Models
    MODEL_HAIR_LOSS_PATH: Path = MODELS_DIR / "hair_loss_resnet.pth"
    MODEL_SCALP_DISEASE_PATH: Path = MODELS_DIR / "scalp_disease_resnet.pth"


settings = Settings()