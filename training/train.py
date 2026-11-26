"""
Main training entrypoint for Piyush's custom pipeline.
"""
import sys
from pathlib import Path

# Add parent directory to path so we can resolve config
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.append(str(SCRIPT_DIR))

from utils.dataset import create_dataloaders
from utils.trainer import create_model, train_model, save_model
from config import EPOCHS

def main():
    print("=" * 60)
    print("AI Scalp Analyzer Custom Training Runner")
    print("=" * 60)

    # 1. Load DataLoaders
    train_loader, test_loader, class_names = create_dataloaders()
    
    # 2. Build Model
    model, criterion, optimizer, scheduler = create_model()
    
    # 3. Train Model
    print("\nStarting model training...")
    model, history, preds, labels = train_model(
        model=model,
        train_loader=train_loader,
        test_loader=test_loader,
        criterion=criterion,
        optimizer=optimizer,
        scheduler=scheduler,
        epochs=EPOCHS
    )
    
    # 4. Save model weights and training statistics
    save_model(model, history, class_names)
    print("\nTraining completed successfully!")

if __name__ == "__main__":
    main()
