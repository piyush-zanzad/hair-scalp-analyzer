"""
Data Integration Script
Copies generated clinical assets into active dataset directories.
"""
import os
import shutil
import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = Path("C:/Users/piyus/.gemini/antigravity/brain/83a17d32-d87c-4f99-b5c3-74bea26b7d72")

def main():
    print("Integrating synthetic clinical images...")
    
    # 1. Integrate Healthy Scalp images for Scalp Disease
    healthy_dest = ROOT / "datasets" / "scalp_disease" / "raw" / "scalp-disease" / "healthy"
    healthy_dest.mkdir(parents=True, exist_ok=True)
    
    healthy_src_files = glob.glob(str(ARTIFACTS_DIR / "healthy_scalp_*.jpg"))
    print(f"Found {len(healthy_src_files)} healthy scalp images in artifacts.")
    for f in healthy_src_files:
        dest_file = healthy_dest / Path(f).name
        shutil.copy(f, dest_file)
        print(f"Copied to {dest_file}")
        
    # 2. Integrate Norwood Stage 2 images for Male Hair Loss
    male_train_dest = ROOT / "datasets" / "male_hair_loss" / "train" / "Stage 2"
    male_test_dest = ROOT / "datasets" / "male_hair_loss" / "test" / "Stage 2"
    male_train_dest.mkdir(parents=True, exist_ok=True)
    male_test_dest.mkdir(parents=True, exist_ok=True)
    
    stage2_src_files = glob.glob(str(ARTIFACTS_DIR / "norwood_2_scalp_*.jpg"))
    print(f"Found {len(stage2_src_files)} Norwood Stage 2 images in artifacts.")
    
    for i, f in enumerate(stage2_src_files):
        # Put 2 in train and 1 in test
        dest_dir = male_train_dest if i < 2 else male_test_dest
        dest_file = dest_dir / Path(f).name
        shutil.copy(f, dest_file)
        print(f"Copied to {dest_file}")
        
    print("\nData integration complete!")

if __name__ == "__main__":
    main()
