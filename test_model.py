#!/usr/bin/env python3
"""
Test script to diagnose model loading issues
"""

import torch
import os
import sys

def test_model_loading():
    model_path = 'improved_weapon_detection_10_epochs.pt'
    
    print("=== Model Loading Test ===")
    print(f"Python version: {sys.version}")
    print(f"PyTorch version: {torch.__version__}")
    print(f"Model path: {model_path}")
    print(f"Model exists: {os.path.exists(model_path)}")
    
    if not os.path.exists(model_path):
        print("❌ Model file not found!")
        return False
    
    print(f"Model file size: {os.path.getsize(model_path) / (1024*1024):.2f} MB")
    
    try:
        # Test 1: Basic torch.load
        print("\n--- Test 1: Basic torch.load ---")
        checkpoint = torch.load(model_path, map_location='cpu')
        print(f"✅ torch.load successful")
        print(f"Checkpoint type: {type(checkpoint)}")
        
        if isinstance(checkpoint, dict):
            print("Checkpoint keys:", list(checkpoint.keys()))
            if 'model' in checkpoint:
                print("Model state dict found")
            if 'epoch' in checkpoint:
                print(f"Epoch: {checkpoint['epoch']}")
        
    except Exception as e:
        print(f"❌ torch.load failed: {e}")
        return False
    
    try:
        # Test 2: ultralytics YOLO
        print("\n--- Test 2: ultralytics YOLO ---")
        from ultralytics import YOLO
        model = YOLO(model_path)
        print(f"✅ ultralytics YOLO successful")
        print(f"Model type: {type(model)}")
        return True
        
    except Exception as e:
        print(f"❌ ultralytics YOLO failed: {e}")
    
    try:
        # Test 3: torch.hub
        print("\n--- Test 3: torch.hub ---")
        model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path, force_reload=True)
        print(f"✅ torch.hub successful")
        print(f"Model type: {type(model)}")
        return True
        
    except Exception as e:
        print(f"❌ torch.hub failed: {e}")
    
    print("\n❌ All loading methods failed!")
    return False

if __name__ == "__main__":
    success = test_model_loading()
    if success:
        print("\n🎉 Model loading test passed!")
    else:
        print("\n💥 Model loading test failed!")
        print("\nTroubleshooting tips:")
        print("1. Ensure the model file is not corrupted")
        print("2. Try reinstalling PyTorch: pip install torch torchvision")
        print("3. Try installing ultralytics: pip install ultralytics")
        print("4. Check if the model was trained with a different PyTorch version")
