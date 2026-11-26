"""
Update Alopecia Areata dataset with verified images.
"""
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ALOPECIA_DIR = ROOT / "datasets" / "scalp_disease" / "raw" / "scalp-disease" / "alopecia-areata"
USER_UPLOADED_DIR = Path("C:/Users/piyus/.gemini/antigravity/brain/83a17d32-d87c-4f99-b5c3-74bea26b7d72/.user_uploaded")

def main():
    print("Replacing Alopecia Areata dataset with verified clinical photos...")
    
    # 1. Clear the old raw directory
    if ALOPECIA_DIR.exists():
        shutil.rmtree(ALOPECIA_DIR)
    ALOPECIA_DIR.mkdir(parents=True, exist_ok=True)
    print("Cleared old Alopecia Areata dataset folder.")
    
    # 2. Define the new uploaded files to copy
    new_files = [
        "media__1785598160071.jpg",
        "media__1785598160080.jpg",
        "media__1785598160084.jpg",
        "media__1785598160088.jpg",
        "media__1785598160103.jpg"
    ]
    
    copied = 0
    for idx, filename in enumerate(new_files):
        src_path = USER_UPLOADED_DIR / filename
        if src_path.exists():
            dest_path = ALOPECIA_DIR / f"alopecia_areata_verified_{idx+1}.jpg"
            shutil.copy(src_path, dest_path)
            copied += 1
            print(f"Copied: {filename} -> alopecia-areata/")
        else:
            print(f"Warning: Uploaded file {filename} not found.")
            
    print(f"\nCompleted! Replaced Alopecia Areata dataset with {copied} verified clinical images.")

if __name__ == "__main__":
    main()
