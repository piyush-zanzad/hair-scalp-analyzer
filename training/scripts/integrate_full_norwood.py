"""
Integrate Full Norwood Scale Data
Processes and distributes images for Stages 1, 3, 4, and 6.
"""
import os
import csv
import shutil
import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MALE_ROOT = ROOT / "datasets" / "male_hair_loss"
ARTIFACTS_DIR = Path("C:/Users/piyus/.gemini/antigravity/brain/83a17d32-d87c-4f99-b5c3-74bea26b7d72")

def main():
    print("Beginning integration of Norwood Stages 1, 3, 4, and 6...")
    
    # 1. Integrate Norwood Stage 1 (Generated images)
    s1_train = MALE_ROOT / "train" / "Stage 1"
    s1_test = MALE_ROOT / "test" / "Stage 1"
    s1_train.mkdir(parents=True, exist_ok=True)
    s1_test.mkdir(parents=True, exist_ok=True)
    
    s1_src_files = glob.glob(str(ARTIFACTS_DIR / "norwood_1_scalp_*.jpg"))
    print(f"Found {len(s1_src_files)} Stage 1 images.")
    for i, f in enumerate(s1_src_files):
        dest_dir = s1_train if i < 2 else s1_test
        shutil.copy(f, dest_dir / Path(f).name)
        print(f"Copied Stage 1: {Path(f).name} -> {dest_dir}")
        
    # 2. Setup folders for Stages 3, 4, and 6
    stages_to_integrate = {
        "type_3": "Stage 3",
        "type_4": "Stage 4",
        "type_6": "Stage 6"
    }
    
    for s_name in stages_to_integrate.values():
        (MALE_ROOT / "train" / s_name).mkdir(parents=True, exist_ok=True)
        (MALE_ROOT / "test" / s_name).mkdir(parents=True, exist_ok=True)
        
    # Parse CSV to extract existing raw images from bald_people
    csv_path = MALE_ROOT / "raw" / "bald-men" / "bald-people" / "bald_people.csv"
    images_dir = MALE_ROOT / "raw" / "bald-men" / "bald-people"
    
    type_counts = {"type_3": 0, "type_4": 0, "type_6": 0}
    
    with open(csv_path, "r") as f:
        reader = csv.reader(f)
        next(reader)  # skip header
        for row in reader:
            if len(row) < 3:
                continue
            _, img_rel_path, img_type = row
            if img_type in stages_to_integrate:
                src_img_path = images_dir / img_rel_path
                if not src_img_path.exists():
                    # Fallback to check directly in images/ folder
                    src_img_path = images_dir / "images" / Path(img_rel_path).name
                    
                if src_img_path.exists():
                    stage_folder = stages_to_integrate[img_type]
                    # Split logic: first 70% in train, rest in test
                    current_idx = type_counts[img_type]
                    type_counts[img_type] += 1
                    
                    if img_type == "type_3":
                        dest_dir = MALE_ROOT / "train" / stage_folder if current_idx < 4 else MALE_ROOT / "test" / stage_folder
                    elif img_type == "type_4":
                        dest_dir = MALE_ROOT / "train" / stage_folder if current_idx < 5 else MALE_ROOT / "test" / stage_folder
                    else: # type_6
                        dest_dir = MALE_ROOT / "train" / stage_folder if current_idx < 3 else MALE_ROOT / "test" / stage_folder
                        
                    shutil.copy(src_img_path, dest_dir / src_img_path.name)
                    print(f"Copied {img_type}: {src_img_path.name} -> {dest_dir}")
                else:
                    print(f"Warning: Image {src_img_path} not found.")
                    
    # 3. Integrate generated Norwood Stage 3 images (add to Stage 3 train folder)
    s3_train = MALE_ROOT / "train" / "Stage 3"
    s3_src_files = glob.glob(str(ARTIFACTS_DIR / "norwood_3_scalp_*.jpg"))
    print(f"Found {len(s3_src_files)} generated Stage 3 images.")
    for f in s3_src_files:
        shutil.copy(f, s3_train / Path(f).name)
        print(f"Copied generated Stage 3: {Path(f).name} -> {s3_train}")
        
    print("\nFull Norwood scale integration completed!")

if __name__ == "__main__":
    main()
