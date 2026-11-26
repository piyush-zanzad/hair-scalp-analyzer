import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image
import numpy as np

# --- CONFIGURATIONS ---
BATCH_SIZE = 16
LEARNING_RATE = 1e-4
EPOCHS = 50
PATIENCE = 7
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
HAIR_LOSS_CLASSES_COUNT = 11   # Healthy, Norwood I-VII, Ludwig I-III
SCALP_DISEASE_CLASSES_COUNT = 3 # Healthy, Dandruff, Psoriasis

# --- DATASET LOADER ---
class ScalpDataset(Dataset):
    def __init__(self, image_paths, labels, transform=None):
        """
        Args:
            image_paths (list): List of absolute paths to scalp images.
            labels (list): List of integer labels corresponding to classifications.
            transform (callable, optional): PyTorch image transforms.
        """
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert("RGB")
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
            
        return image, torch.tensor(label, dtype=torch.long)

# --- IMAGE AUGMENTATIONS ---
# Augmentations for deep learning generalization
train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=15),
    transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

val_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# --- MODEL ARCHITECTURE INITIALIZER ---
def build_model(num_classes, architecture="resnet50"):
    """
    Builds the Deep Learning Classifier model using transfer learning.
    Prefers EfficientNet-B3. If unavailable, falls back to ResNet50.
    """
    print(f"Initializing {architecture} model architecture...")
    if architecture == "efficientnet_b3":
        try:
            # Attempt to import and build EfficientNet-B3
            model = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.DEFAULT)
            in_features = model.classifier[1].in_features
            model.classifier[1] = nn.Linear(in_features, num_classes)
            return model
        except Exception as e:
            print(f"Could not load pre-trained EfficientNet: {e}. Falling back to ResNet50.")
            
    # Fallback to ResNet50
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    return model

# --- EARLY STOPPING & CHECKPOINTING ---
class EarlyStopping:
    def __init__(self, patience=7, delta=0.0, checkpoint_path="checkpoint.pth"):
        self.patience = patience
        self.delta = delta
        self.checkpoint_path = checkpoint_path
        self.counter = 0
        self.best_loss = None
        self.early_stop = False

    def __call__(self, val_loss, model):
        if self.best_loss is None:
            self.best_loss = val_loss
            self.save_checkpoint(model)
        elif val_loss > self.best_loss + self.delta:
            self.counter += 1
            print(f"EarlyStopping count: {self.counter} out of {self.patience}")
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_loss = val_loss
            self.save_checkpoint(model)
            self.counter = 0

    def save_checkpoint(self, model):
        print(f"Validation loss decreased. Saving model state checkpoints to {self.checkpoint_path}...")
        torch.save(model.state_dict(), self.checkpoint_path)

# --- TRAINING PIPELINE ---
def train_model(train_loader, val_loader, num_classes, model_save_path, arch="resnet50"):
    model = build_model(num_classes, architecture=arch).to(DEVICE)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3)
    
    early_stopping = EarlyStopping(patience=PATIENCE, checkpoint_path=model_save_path)
    
    for epoch in range(1, EPOCHS + 1):
        # 1. Training Phase
        model.train()
        train_loss = 0.0
        train_corrects = 0
        total_train_samples = 0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            train_corrects += torch.sum(preds == labels.data)
            total_train_samples += inputs.size(0)
            
        epoch_train_loss = train_loss / total_train_samples
        epoch_train_acc = train_corrects.double() / total_train_samples
        
        # 2. Validation Phase
        model.eval()
        val_loss = 0.0
        val_corrects = 0
        total_val_samples = 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * inputs.size(0)
                _, preds = torch.max(outputs, 1)
                val_corrects += torch.sum(preds == labels.data)
                total_val_samples += inputs.size(0)
                
        epoch_val_loss = val_loss / total_val_samples
        epoch_val_acc = val_corrects.double() / total_val_samples
        
        scheduler.step(epoch_val_loss)
        
        print(f"Epoch {epoch}/{EPOCHS} | Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc:.4f} | "
              f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc:.4f}")
              
        # Check early stopping
        early_stopping(epoch_val_loss, model)
        if early_stopping.early_stop:
            print("Early stopping triggered. Training terminated.")
            break
            
    print(f"Optimal training session weights locked in at: {model_save_path}")
    return model

if __name__ == "__main__":
    print("AI Scalp System Deep Learning training library initialized.")
    # Here is an example of mock execution for syntax checks
    # inputs = torch.randn(2, 3, 224, 224)
    # model = build_model(11, "resnet50")
    # print("Output shape check:", model(inputs).shape)
