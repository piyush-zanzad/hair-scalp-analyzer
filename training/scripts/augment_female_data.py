"""
Offline Data Augmentation for Female Hair Loss
Multiplies training dataset size by generating pre-augmented copies.
"""
import os
import glob
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
FEMALE_ROOT = ROOT / "datasets" / "female_hair_loss"

def main():
    print("Beginning offline augmentation of Female Hair Loss dataset...")
    
    # We only augment the train folder to prevent data leakage in test
    train_dir = FEMALE_ROOT / "train"
    
    for stage_folder in train_dir.iterdir():
        if not stage_folder.is_dir():
            continue
        print(f"Processing {stage_folder.name}...")
        
        # Get original non-augmented images
        images = [f for f in stage_folder.glob("*.jpg") if "aug_" not in f.name]
        print(f"  Found {len(images)} original images.")
        
        for img_path in images:
            img = Image.open(img_path)
            
            # Augment 1: Horizontal Flip
            hflip = ImageOps.mirror(img)
            hflip.save(img_path.parent / f"{img_path.stem}_aug_hflip.jpg")
            
            # Augment 2: Small Rotation (+15 degrees)
            rot = img.rotate(15, expand=False, fillcolor="black")
            rot.save(img_path.parent / f"{img_path.stem}_aug_rot1.jpg")
            
            # Augment 3: Small Rotation (-15 degrees)
            rot_ccw = img.rotate(-15, expand=False, fillcolor="black")
            rot_ccw.save(img_path.parent / f"{img_path.stem}_aug_rot2.jpg")
            
            print(f"    Augmented {img_path.name} -> 3 new images.")
            
    print("\nOffline augmentation complete!")

if __name__ == "__main__":
    main()
