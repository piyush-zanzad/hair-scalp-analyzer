import os
import shutil
import random
from pathlib import Path

# Setup seed
random.seed(42)

ROOT = Path(__file__).resolve().parent.parent
DATASETS_DIR = ROOT / "datasets"

def split_female_hair_loss():
    print("Splitting Female Hair Loss dataset...")
    raw_dir = DATASETS_DIR / "female_hair_loss" / "raw" / "bald-women" / "files"
    dest_train = DATASETS_DIR / "female_hair_loss" / "train"
    dest_test = DATASETS_DIR / "female_hair_loss" / "test"
    
    # Re-create directories
    for d in [dest_train, dest_test]:
        if d.exists():
            shutil.rmtree(d)
        d.mkdir(parents=True, exist_ok=True)
        
    # Group patient IDs: 1, 2, 3, 4, 5
    # Let's map patients to classes:
    # 1, 2 -> Ludwig Stage I
    # 3, 4 -> Ludwig Stage II
    # 5 -> Ludwig Stage III
    patient_mapping = {
        "1": "Ludwig Stage I",
        "2": "Ludwig Stage I",
        "3": "Ludwig Stage II",
        "4": "Ludwig Stage II",
        "5": "Ludwig Stage III"
    }
    
    # Patient-wise split to avoid data leakage
    # Train patients: 1, 3, 5
    # Test patients: 2, 4
    train_patients = ["1", "3", "5"]
    test_patients = ["2", "4"]
    
    for patient_id, class_name in patient_mapping.items():
        patient_folder = raw_dir / patient_id
        if not patient_folder.exists():
            continue
            
        target_dir = dest_train if patient_id in train_patients else dest_test
        class_target = target_dir / class_name
        class_target.mkdir(parents=True, exist_ok=True)
        
        for img in patient_folder.glob("*.jpg"):
            # e.g. 1_Back.jpg
            new_name = f"{patient_id}_{img.name}"
            shutil.copy(img, class_target / new_name)
            
    print("Female Hair Loss split completed!")

def split_scalp_disease():
    print("Splitting Scalp Disease dataset...")
    raw_dir = DATASETS_DIR / "scalp_disease" / "raw" / "scalp-disease"
    dest_train = DATASETS_DIR / "scalp_disease" / "train"
    dest_test = DATASETS_DIR / "scalp_disease" / "test"
    
    # Re-create directories
    for d in [dest_train, dest_test]:
        if d.exists():
            shutil.rmtree(d)
        d.mkdir(parents=True, exist_ok=True)
        
    # We split each disease category stratified randomly (80% train, 20% test)
    for category in os.listdir(raw_dir):
        category_dir = raw_dir / category
        if not category_dir.is_dir():
            continue
            
        images = list(category_dir.glob("*.jpg")) + list(category_dir.glob("*.jpeg"))
        random.shuffle(images)
        
        split_idx = int(len(images) * 0.80)
        train_imgs = images[:split_idx]
        test_imgs = images[split_idx:]
        
        # Ensure at least one image in train and test if available
        if len(train_imgs) == 0 and len(images) > 0:
            train_imgs = images
        if len(test_imgs) == 0 and len(images) > 1:
            test_imgs = [images[-1]]
            train_imgs = images[:-1]
            
        for img in train_imgs:
            class_target = dest_train / category
            class_target.mkdir(parents=True, exist_ok=True)
            shutil.copy(img, class_target / img.name)
            
        for img in test_imgs:
            class_target = dest_test / category
            class_target.mkdir(parents=True, exist_ok=True)
            shutil.copy(img, class_target / img.name)
            
    print("Scalp Disease split completed!")

if __name__ == "__main__":
    split_female_hair_loss()
    split_scalp_disease()
