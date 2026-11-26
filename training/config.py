"""
Project Configuration
Author: Piyush Zanzad
"""

from pathlib import Path

# =====================================================
# Project Paths
# =====================================================

ROOT = Path(__file__).resolve().parent

# Dataset
DATASET_ROOT = ROOT / "datasets" / "male_hair_loss"

RAW_DATASET = (
    DATASET_ROOT
    / "raw"
    / "bald-men"
    / "bald-men-structured"
)

CSV_FILE = RAW_DATASET / "bald_men.csv"
IMAGE_FOLDER = RAW_DATASET / "files"

PROCESSED_DATASET = DATASET_ROOT / "processed"

TRAIN_DIR = DATASET_ROOT / "train"
VAL_DIR = DATASET_ROOT / "val"
TEST_DIR = DATASET_ROOT / "test"

# =====================================================
# Output Directories
# =====================================================

MODELS_DIR = ROOT / "models"
OUTPUTS_DIR = ROOT / "outputs"
LOGS_DIR = ROOT / "logs"

MODELS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

# =====================================================
# Saved Files
# =====================================================

MODEL_SAVE_PATH = MODELS_DIR / "hair_loss_model.pth"

HISTORY_SAVE_PATH = MODELS_DIR / "training_history.json"

CLASS_NAMES_SAVE_PATH = MODELS_DIR / "class_names.json"

LOG_FILE = LOGS_DIR / "training.log"

# =====================================================
# Training Settings
# =====================================================

IMAGE_SIZE = 224

BATCH_SIZE = 8

EPOCHS = 20

LEARNING_RATE = 1e-4

RANDOM_SEED = 42

PATIENCE = 5

MODEL_NAME = "efficientnet_b0"

# =====================================================
# Dataset Classes
# =====================================================

# These are the classes currently available
# in your dataset.

CLASS_TO_IDX = {
    "Stage 1": 0,
    "Stage 2": 1,
    "Stage 3": 2,
    "Stage 4": 3,
    "Stage 5": 4,
    "Stage 6": 5,
    "Stage 7": 6,
}

IDX_TO_CLASS = {
    value: key
    for key, value in CLASS_TO_IDX.items()
}

CLASS_NAMES = list(CLASS_TO_IDX.keys())

NUM_CLASSES = len(CLASS_TO_IDX)

# =====================================================
# Image Extensions
# =====================================================

SUPPORTED_IMAGE_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".tif",
    ".tiff",
    ".webp",
)