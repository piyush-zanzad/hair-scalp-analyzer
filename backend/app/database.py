import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("uvicorn.error")

Base = declarative_base()
SessionLocal = None

# Attempt to connect to PostgreSQL, fallback to SQLite on failure
try:
    logger.info(f"Connecting to database: {settings.DATABASE_URL}")
    # Setup PostgreSQL engine
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )
    # Test connection
    with engine.connect() as conn:
        pass
    logger.info("Successfully connected to PostgreSQL database.")
except Exception as e:
    logger.warning(f"Failed to connect to PostgreSQL: {e}. Falling back to SQLite.")
    logger.info(f"Connecting to SQLite database: {settings.SQLITE_FALLBACK_URL}")
    engine = create_engine(
        settings.SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False}  # Needed only for SQLite
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
