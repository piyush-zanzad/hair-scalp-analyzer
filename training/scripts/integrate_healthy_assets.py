"""
Integrate Stage 1 and Ludwig I assets into the Healthy Scalp dataset.
"""
import os
import shutil
import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MALE_ROOT = ROOT / "datasets" / "male_hair_loss"
FEMALE_ROOT = ROOT / "datasets" / "female_hair_loss"
DISEASE_ROOT = ROOT / "datasets" / "scalp_disease"

def main():
    print("Beginning healthy scalp dataset expansion...")
    
    # Destination raw directory
    healthy_raw_dir = DISEASE_ROOT / "raw" / "scalp-disease" / "healthy"
    healthy_raw_dir.mkdir(parents=True, exist_ok=True)
    
    copied_count = 0
    
    # 1. Copy Norwood Stage 1 images (Male)
    norwood1_folders = [MALE_ROOT / "train" / "Stage 1", MALE_ROOT / "test" / "Stage 1"]
    for folder in norwood1_folders:
        if not folder.exists():
            continue
        for f in folder.glob("*"):
            if f.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                dest_file = healthy_raw_dir / f"norwood1_{f.name}"
                shutil.copy(f, dest_file)
                copied_count += 1
                print(f"Copied Norwood Stage 1: {f.name} -> healthy/")
                
    # 2. Copy Ludwig Stage I images (Female)
    ludwig1_folders = [FEMALE_ROOT / "train" / "Ludwig Stage I", FEMALE_ROOT / "test" / "Ludwig Stage I"]
    for folder in ludwig1_folders:
        if not folder.exists():
            continue
        for f in folder.glob("*"):
            if f.suffix.lower() in [".jpg", ".jpeg", ".png"] and "aug_" not in f.name:
                # We only copy the original photos, not the augmented ones, to maintain natural distribution
                dest_file = healthy_raw_dir / f"ludwig1_{f.name}"
                shutil.copy(f, dest_file)
                copied_count += 1
                print(f"Copied Ludwig Stage I: {f.name} -> healthy/")
                
    print(f"\nExpansion complete! Copied {copied_count} clean scalp profiles to the raw healthy dataset.")

if __name__ == "__main__":
    main()
