from pathlib import Path

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).resolve().parent

# training/datasets
DATASET_ROOT = SCRIPT_DIR.parent / "datasets"

print("=" * 60)
print("DATASET INSPECTION")
print("=" * 60)

if not DATASET_ROOT.exists():
    print(f"❌ Dataset folder not found: {DATASET_ROOT}")
    exit()

for dataset in DATASET_ROOT.iterdir():
    if not dataset.is_dir():
        continue

    print(f"\n📂 Dataset: {dataset.name}")

    raw = dataset / "raw"

    if not raw.exists():
        print("   ❌ No raw folder found")
        continue

    for folder in raw.rglob("*"):
        if folder.is_dir():

            images = []
            for ext in ("*.jpg", "*.jpeg", "*.png", "*.bmp", "*.webp"):
                images.extend(folder.glob(ext))

            if images:
                print(f"   📁 {folder.relative_to(raw)}")
                print(f"      Images: {len(images)}")