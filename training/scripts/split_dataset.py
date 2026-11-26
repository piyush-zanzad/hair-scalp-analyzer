"""
Split Dataset by Patient ID

This script keeps all five views of the same patient
(Front, Back, Left, Right, Top-Down) in the same dataset
to avoid data leakage.

Author: Piyush Zanzad
"""

import sys
import shutil
import random
from pathlib import Path
from collections import defaultdict

# -----------------------------------------------------
# Import project config
# -----------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from config import (  # noqa: E402
    PROCESSED_DATASET,
    TRAIN_DIR,
    VAL_DIR,
    TEST_DIR,
    RANDOM_SEED,
)

# -----------------------------------------------------

TRAIN_RATIO = 0.80
VAL_RATIO = 0.10
TEST_RATIO = 0.10

random.seed(RANDOM_SEED)

# -----------------------------------------------------


def recreate_directory(directory: Path):
    """Delete and recreate directory."""

    if directory.exists():
        shutil.rmtree(directory)

    directory.mkdir(parents=True, exist_ok=True)


# -----------------------------------------------------


def group_by_patient(image_list):
    """
    Groups images by patient ID.

    Example

    1_Front.jpg
    1_Back.jpg

    becomes

    {
        "1":[...]
    }
    """

    patients = defaultdict(list)

    for image in image_list:

        patient_id = image.stem.split("_")[0]

        patients[patient_id].append(image)

    return patients


# -----------------------------------------------------


def split_patients(patient_ids):
    """
    Split patient IDs into train/val/test.
    """

    random.shuffle(patient_ids)

    total = len(patient_ids)

    # Tiny datasets need special handling
    if total <= 2:

        train = patient_ids[:1]
        val = []
        test = patient_ids[1:]

        return train, val, test

    if total == 3:

        train = patient_ids[:2]
        val = []
        test = patient_ids[2:]

        return train, val, test

    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    train = patient_ids[:train_end]
    val = patient_ids[train_end:val_end]
    test = patient_ids[val_end:]

    # Ensure at least one patient in train
    if len(train) == 0:
        train.append(test.pop(0))

    return train, val, test


# -----------------------------------------------------


def copy_patient_images(patient_group, patient_ids, destination):

    destination.mkdir(parents=True, exist_ok=True)

    copied = 0

    for pid in patient_ids:

        for image in patient_group[pid]:

            shutil.copy2(image, destination / image.name)

            copied += 1

    return copied


# -----------------------------------------------------


def main():

    print("=" * 70)
    print("Patient-wise Dataset Split")
    print("=" * 70)

    if not PROCESSED_DATASET.exists():
        raise FileNotFoundError(
            f"Processed dataset not found:\n{PROCESSED_DATASET}"
        )

    recreate_directory(TRAIN_DIR)
    recreate_directory(VAL_DIR)
    recreate_directory(TEST_DIR)

    total_train = 0
    total_val = 0
    total_test = 0

    print()

    for stage_folder in sorted(PROCESSED_DATASET.iterdir()):

        if not stage_folder.is_dir():
            continue

        stage = stage_folder.name

        images = list(stage_folder.glob("*.jpg"))

        patient_group = group_by_patient(images)

        patient_ids = list(patient_group.keys())

        train_patients, val_patients, test_patients = split_patients(patient_ids)

        train_count = copy_patient_images(
            patient_group,
            train_patients,
            TRAIN_DIR / stage,
        )

        val_count = copy_patient_images(
            patient_group,
            val_patients,
            VAL_DIR / stage,
        )

        test_count = copy_patient_images(
            patient_group,
            test_patients,
            TEST_DIR / stage,
        )

        total_train += train_count
        total_val += val_count
        total_test += test_count

        print(f"{stage}")
        print("-" * 40)
        print(f"Patients")
        print(f"  Train : {len(train_patients)}")
        print(f"  Val   : {len(val_patients)}")
        print(f"  Test  : {len(test_patients)}")

        print()

        print("Images")
        print(f"  Train : {train_count}")
        print(f"  Val   : {val_count}")
        print(f"  Test  : {test_count}")

        print()

    print("=" * 70)
    print("Dataset Split Complete")
    print("=" * 70)

    print(f"Training Images   : {total_train}")
    print(f"Validation Images : {total_val}")
    print(f"Testing Images    : {total_test}")

    print()

    print("Train Folder")
    print(TRAIN_DIR)

    print()

    print("Validation Folder")
    print(VAL_DIR)

    print()

    print("Test Folder")
    print(TEST_DIR)

    print()

    print("Done ✔")


# -----------------------------------------------------

if __name__ == "__main__":
    main()