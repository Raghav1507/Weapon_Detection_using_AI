#!/usr/bin/env python3
"""
Test script to verify the application is working correctly
"""

import requests
import time
import sys

def test_application():
    print("🧪 Testing Thermal Weapon Detection System...")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    
    try:
        # Test 1: Check if server is running
        print("1. Testing server connection...")
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Server is running")
            data = response.json()
            print(f"   📊 Model loaded: {data.get('model_loaded', False)}")
        else:
            print("   ❌ Server not responding properly")
            return False
        
        # Test 2: Check login page
        print("\n2. Testing login page...")
        response = requests.get(f"{base_url}/login", timeout=5)
        if response.status_code == 200:
            print("   ✅ Login page accessible")
        else:
            print("   ❌ Login page not accessible")
            return False
        
        # Test 3: Check signup page
        print("\n3. Testing signup page...")
        response = requests.get(f"{base_url}/signup", timeout=5)
        if response.status_code == 200:
            print("   ✅ Signup page accessible")
        else:
            print("   ❌ Signup page not accessible")
            return False
        
        # Test 4: Test authentication (try to access dashboard without login)
        print("\n4. Testing authentication...")
        response = requests.get(f"{base_url}/dashboard", timeout=5)
        if response.status_code == 302:  # Should redirect to login
            print("   ✅ Authentication working (redirects to login)")
        else:
            print("   ⚠️  Authentication may not be working properly")
        
        print("\n" + "=" * 50)
        print("🎉 Application tests completed!")
        print("\n🌐 Open your browser and go to: http://localhost:5000")
        print("👤 Default admin login:")
        print("   Username: admin")
        print("   Password: admin123")
        print("\n✨ Features available:")
        print("   - Modern login/signup system")
        print("   - Real-time weapon detection")
        print("   - Alert system with sound notifications")
        print("   - Dashboard with statistics")
        print("   - Mobile-responsive design")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to server. Make sure the app is running.")
        print("   💡 Run: python app.py")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

if __name__ == "__main__":
    # Wait a moment for the server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    success = test_application()
    
    if not success:
        print("\n🔧 Troubleshooting:")
        print("1. Make sure the server is running: python app.py")
        print("2. Check if all dependencies are installed: pip install -r requirements.txt")
        print("3. Verify the model file exists: improved_weapon_detection_10_epochs.pt")
        sys.exit(1)
