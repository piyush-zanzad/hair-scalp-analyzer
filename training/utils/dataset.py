"""
Custom Dataset Loader for Hair Loss Classification

Loads images manually instead of using ImageFolder.
This allows some classes to be absent in train/test
while keeping label indices consistent.
"""

from pathlib import Path

import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from torchvision import transforms

from config import (
    TRAIN_DIR,
    TEST_DIR,
    IMAGE_SIZE,
    BATCH_SIZE,
    CLASS_TO_IDX,
)

# ----------------------------------------------------
# Image Transforms
# ----------------------------------------------------

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(0.5),
    transforms.RandomRotation(10),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2,
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

test_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# ----------------------------------------------------
# Dataset
# ----------------------------------------------------

class HairDataset(Dataset):

    def __init__(self, root_dir, transform=None):

        self.root_dir = Path(root_dir)
        self.transform = transform

        self.samples = []

        for class_name, class_idx in CLASS_TO_IDX.items():

            class_folder = self.root_dir / class_name

            if not class_folder.exists():
                continue

            for image in class_folder.glob("*"):

                if image.suffix.lower() not in [
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".bmp",
                    ".tif",
                    ".tiff",
                    ".webp",
                ]:
                    continue

                self.samples.append(
                    (
                        image,
                        class_idx,
                    )
                )

    def __len__(self):

        return len(self.samples)

    def __getitem__(self, index):

        image_path, label = self.samples[index]

        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label


# ----------------------------------------------------
# DataLoaders
# ----------------------------------------------------

def create_dataloaders():

    train_dataset = HairDataset(
        TRAIN_DIR,
        transform=train_transform,
    )

    test_dataset = HairDataset(
        TEST_DIR,
        transform=test_transform,
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=2,
        pin_memory=torch.cuda.is_available(),
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=2,
        pin_memory=torch.cuda.is_available(),
    )

    print("=" * 60)
    print("Dataset Loaded")
    print("=" * 60)

    print(f"Training Images : {len(train_dataset)}")
    print(f"Testing Images  : {len(test_dataset)}")

    print()

    print("Classes")

    for name, idx in CLASS_TO_IDX.items():
        print(f"{idx}: {name}")

    print("=" * 60)

    return (
        train_loader,
        test_loader,
        list(CLASS_TO_IDX.keys()),
    )