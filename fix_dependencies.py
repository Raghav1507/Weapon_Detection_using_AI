#!/usr/bin/env python3
"""
Dependency compatibility fix script
"""

import subprocess
import sys

def install_compatible_versions():
    """Install compatible versions of all dependencies"""
    
    print("🔧 Fixing dependency compatibility issues...")
    print("=" * 50)
    
    # Define compatible versions
    packages = [
        "flask==2.3.3",
        "werkzeug==2.3.7", 
        "flask-sqlalchemy==3.0.5",
        "torch==2.0.1",
        "torchvision==0.15.2",
        "opencv-python==4.8.1.78",
        "Pillow==10.0.1",
        "numpy==1.24.3",
        "ultralytics==8.0.196"
    ]
    
    for package in packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
            return False
    
    print("\n" + "=" * 50)
    print("🎉 All dependencies installed successfully!")
    print("\nNow you can run: python app.py")
    return True

if __name__ == "__main__":
    success = install_compatible_versions()
    if not success:
        print("\n❌ Some dependencies failed to install.")
        print("Please check the error messages above.")
        sys.exit(1)
