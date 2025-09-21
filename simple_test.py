import os
import torch

print("=== Simple Model Test ===")
model_path = 'improved_weapon_detection_10_epochs.pt'

print(f"Model file exists: {os.path.exists(model_path)}")
if os.path.exists(model_path):
    print(f"File size: {os.path.getsize(model_path) / (1024*1024):.2f} MB")
    
    try:
        print("Trying to load with torch.load...")
        checkpoint = torch.load(model_path, map_location='cpu')
        print(f"Success! Checkpoint type: {type(checkpoint)}")
        if isinstance(checkpoint, dict):
            print(f"Keys: {list(checkpoint.keys())}")
    except Exception as e:
        print(f"Error: {e}")

print("Test complete.")
