"""
Training Runner for Female Hair Loss and Scalp Disease Models.
Author: Antigravity Pair Programmer
"""
import os
import sys
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from pathlib import Path

# Training Parameters
BATCH_SIZE = 8
EPOCHS = 25  # Fast training epochs suitable for small/custom dataset
LEARNING_RATE = 1e-4
IMAGE_SIZE = 224

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def train_one_dataset(name, train_dir, test_dir, save_path):
    print("=" * 60)
    print(f"STARTING TRAINING FOR: {name.upper()}")
    print("=" * 60)
    
    if not os.path.exists(train_dir) or not os.path.exists(test_dir):
        print(f"Error: Dataset directories not found for {name}.")
        return

    # Image Augmentation and Preprocessing (Enhanced for minority classes)
    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(20),
        transforms.RandomAffine(degrees=15, translate=(0.1, 0.1), scale=(0.9, 1.1)),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    test_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    # Load dataset partitions
    train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
    test_dataset = datasets.ImageFolder(test_dir, transform=test_transform)
    
    # Multi-worker is disabled (num_workers=0) to prevent subprocess loops on Windows
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    
    class_names = train_dataset.classes
    num_classes = len(class_names)
    print(f"Found {len(train_dataset)} training images, {len(test_dataset)} testing images.")
    print("Class mapping:", {i: c for i, c in enumerate(class_names)})
    
    # Calculate inverse class frequency weights to balance loss gradients
    from collections import Counter
    class_counts = Counter()
    for _, label in train_dataset.samples:
        class_counts[label] += 1
        
    counts = [class_counts[i] for i in range(num_classes)]
    total_samples = sum(counts)
    
    # Calculate balanced class weights
    weights = [total_samples / (num_classes * count) for count in counts]
    class_weights_tensor = torch.FloatTensor(weights).to(DEVICE)
    print(f"Class distribution counts: {counts}")
    print(f"Calculated loss class weights: {[f'{w:.3f}' for w in weights]}")
    
    # Instantiate EfficientNet Transfer Learning
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    # Increase dropout to prevent overfitting on tiny classes
    model.classifier[0] = nn.Dropout(p=0.4, inplace=True)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    model = model.to(DEVICE)
    
    criterion = nn.CrossEntropyLoss(weight=class_weights_tensor)
    # Add weight decay for L2 regularization
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-3)
    
    best_loss = float('inf')
    best_acc = 0.0
    
    for epoch in range(1, EPOCHS + 1):
        model.train()
        train_loss = 0.0
        train_corrects = 0
        
        for inputs, labels in train_loader:
            inputs = inputs.to(DEVICE)
            labels = labels.to(DEVICE)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            _, preds = torch.max(outputs, 1)
            train_loss += loss.item() * inputs.size(0)
            train_corrects += torch.sum(preds == labels.data)
            
        epoch_loss = train_loss / len(train_dataset)
        epoch_acc = train_corrects.double() / len(train_dataset)
        
        # Validation pass
        model.eval()
        test_loss = 0.0
        test_corrects = 0
        
        with torch.no_grad():
            for inputs, labels in test_loader:
                inputs = inputs.to(DEVICE)
                labels = labels.to(DEVICE)
                
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                _, preds = torch.max(outputs, 1)
                test_loss += loss.item() * inputs.size(0)
                test_corrects += torch.sum(preds == labels.data)
                
        val_loss = test_loss / len(test_dataset)
        val_acc = test_corrects.double() / len(test_dataset)
        
        print(f"Epoch {epoch}/{EPOCHS} - Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f} | Val Loss: {val_loss:.4f} Val Acc: {val_acc:.4f}")
        
        # Save checkpoints based on minimum validation loss to prevent overfitting
        if val_loss <= best_loss:
            best_loss = val_loss
            best_acc = val_acc
            torch.save(model.state_dict(), save_path)
            
    print(f"--> Best validation accuracy achieved: {best_acc:.4f}")
    print(f"Saved best model weights to: {save_path}")
    
    # Save classes metadata
    meta_path = Path(save_path).parent / f"{name}_classes.json"
    with open(meta_path, "w") as f:
        json.dump(class_names, f)
    print(f"Saved class metadata to: {meta_path}\n")

if __name__ == "__main__":
    training_root = Path(__file__).resolve().parent
    datasets_root = training_root / "datasets"
    models_dir = training_root / "models"
    models_dir.mkdir(exist_ok=True)
    
    # 1. Train Female Hair Loss Stage Detector
    train_one_dataset(
        name="female_hair_loss",
        train_dir=str(datasets_root / "female_hair_loss" / "train"),
        test_dir=str(datasets_root / "female_hair_loss" / "test"),
        save_path=str(models_dir / "female_hair_loss_model.pth")
    )
    
    # 2. Train Scalp Disease Classifier
    train_one_dataset(
        name="scalp_disease",
        train_dir=str(datasets_root / "scalp_disease" / "train"),
        test_dir=str(datasets_root / "scalp_disease" / "test"),
        save_path=str(models_dir / "scalp_disease_model.pth")
    )
