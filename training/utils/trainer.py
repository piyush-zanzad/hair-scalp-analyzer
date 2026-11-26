"""
Training utilities for Hair Loss Classification.
"""

import copy
import json
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import EfficientNet_B0_Weights

from config import (
    NUM_CLASSES,
    LEARNING_RATE,
    MODEL_SAVE_PATH,
    HISTORY_SAVE_PATH,
    CLASS_NAMES_SAVE_PATH,
    PATIENCE,
)


# --------------------------------------------------
# Device
# --------------------------------------------------

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# --------------------------------------------------
# Create Model
# --------------------------------------------------

def create_model():

    weights = EfficientNet_B0_Weights.DEFAULT

    model = models.efficientnet_b0(
        weights=weights
    )

    # Enable full fine-tuning of the feature extractor for high-fidelity scalp features
    # for param in model.features.parameters():
    #     param.requires_grad = False

    in_features = model.classifier[1].in_features

    model.classifier[1] = nn.Linear(
        in_features,
        NUM_CLASSES,
    )

    model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()

    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=LEARNING_RATE,
    )

    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="min",
        factor=0.5,
        patience=2,
    )

    return (
        model,
        criterion,
        optimizer,
        scheduler,
    )


# --------------------------------------------------
# Train One Epoch
# --------------------------------------------------

def train_one_epoch(
    model,
    dataloader,
    criterion,
    optimizer,
):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in dataloader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        predicted = outputs.argmax(1)

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

    epoch_loss = running_loss / len(dataloader)

    epoch_acc = correct / total

    return epoch_loss, epoch_acc


# --------------------------------------------------
# Evaluate
# --------------------------------------------------

@torch.no_grad()
def evaluate(
    model,
    dataloader,
    criterion,
):

    model.eval()

    running_loss = 0.0

    correct = 0
    total = 0

    predictions = []
    targets = []

    for images, labels in dataloader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        loss = criterion(outputs, labels)

        running_loss += loss.item()

        predicted = outputs.argmax(1)

        predictions.extend(
            predicted.cpu().numpy()
        )

        targets.extend(
            labels.cpu().numpy()
        )

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

    loss = running_loss / len(dataloader)

    accuracy = correct / total

    return (
        loss,
        accuracy,
        predictions,
        targets,
    )


# --------------------------------------------------
# Full Training
# --------------------------------------------------

def train_model(
    model,
    train_loader,
    test_loader,
    criterion,
    optimizer,
    scheduler,
    epochs,
):

    history = {
        "train_loss": [],
        "train_acc": [],
        "test_loss": [],
        "test_acc": [],
    }

    best_loss = float("inf")

    best_weights = copy.deepcopy(
        model.state_dict()
    )

    early_stop_counter = 0

    for epoch in range(epochs):

        print()

        print("=" * 60)
        print(f"Epoch {epoch+1}/{epochs}")
        print("=" * 60)

        train_loss, train_acc = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
        )

        test_loss, test_acc, preds, labels = evaluate(
            model,
            test_loader,
            criterion,
        )

        scheduler.step(test_loss)

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["test_loss"].append(test_loss)
        history["test_acc"].append(test_acc)

        print(f"Train Loss : {train_loss:.4f}")
        print(f"Train Acc  : {train_acc:.4f}")

        print()

        print(f"Test Loss  : {test_loss:.4f}")
        print(f"Test Acc   : {test_acc:.4f}")

        if test_loss < best_loss:

            best_loss = test_loss

            best_weights = copy.deepcopy(
                model.state_dict()
            )

            early_stop_counter = 0

        else:

            early_stop_counter += 1

        if early_stop_counter >= PATIENCE:

            print()

            print("Early stopping triggered.")

            break

    model.load_state_dict(best_weights)

    return (
        model,
        history,
        preds,
        labels,
    )


# --------------------------------------------------
# Save Model
# --------------------------------------------------

def save_model(
    model,
    history,
    class_names,
):

    MODEL_SAVE_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    torch.save(
        model.state_dict(),
        MODEL_SAVE_PATH,
    )

    with open(
        HISTORY_SAVE_PATH,
        "w",
    ) as file:

        json.dump(
            history,
            file,
            indent=4,
        )

    with open(
        CLASS_NAMES_SAVE_PATH,
        "w",
    ) as file:

        json.dump(
            class_names,
            file,
            indent=4,
        )

    print()

    print("Model Saved Successfully")

    print(MODEL_SAVE_PATH)