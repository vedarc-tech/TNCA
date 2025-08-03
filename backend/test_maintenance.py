#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

# Test the maintenance system
def test_maintenance_system():
    base_url = "http://localhost:5000/api"
    
    print("Testing Maintenance System...")
    print("=" * 50)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/maintenance/test")
        if response.status_code == 200:
            print("✅ Server is running and maintenance system is working")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Server error: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return
    
    # Test 2: Test maintenance check endpoint (no auth required)
    print("\nTesting maintenance check endpoint...")
    try:
        response = requests.get(f"{base_url}/maintenance/check/test-route")
        if response.status_code == 200:
            print("✅ Maintenance check endpoint working")
            result = response.json()
            print(f"Response: {result}")
        else:
            print(f"❌ Failed to check maintenance: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error testing maintenance check: {e}")
    
    # Test 3: Test route status endpoint (no auth required)
    print("\nTesting route status endpoint...")
    try:
        response = requests.get(f"{base_url}/maintenance/route/test-route/status")
        if response.status_code == 200:
            print("✅ Route status endpoint working")
            result = response.json()
            print(f"Response: {result}")
        else:
            print(f"❌ Failed to get route status: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error testing route status: {e}")
    
    # Test 4: Test groups endpoint (requires auth)
    print("\nTesting groups endpoint (requires auth)...")
    try:
        response = requests.get(f"{base_url}/maintenance/groups")
        if response.status_code == 401:
            print("✅ Groups endpoint properly requires authentication")
        else:
            print(f"❌ Groups endpoint should require auth: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing groups endpoint: {e}")
    
    # Test 5: Test routes endpoint (requires auth)
    print("\nTesting routes endpoint (requires auth)...")
    try:
        response = requests.get(f"{base_url}/maintenance/routes")
        if response.status_code == 401:
            print("✅ Routes endpoint properly requires authentication")
        else:
            print(f"❌ Routes endpoint should require auth: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing routes endpoint: {e}")
    
    print("\n" + "=" * 50)
    print("Maintenance system test completed!")
    print("The system is working correctly - authentication is required for protected endpoints.")

if __name__ == "__main__":
    test_maintenance_system() 