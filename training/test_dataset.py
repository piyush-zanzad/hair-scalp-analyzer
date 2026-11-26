from utils.dataset import create_dataloaders

train_loader, test_loader, class_names = create_dataloaders()

print()

print("Train batches:", len(train_loader))
print("Test batches :", len(test_loader))