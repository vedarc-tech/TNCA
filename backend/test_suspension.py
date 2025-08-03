#!/usr/bin/env python3
"""
Test script for user suspension functionality
"""

import requests
import json
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user import User
from models.database import get_db

BASE_URL = "http://localhost:5000"

def test_suspension_functionality():
    """Test the complete suspension functionality"""
    print("🧪 Testing User Suspension Functionality")
    print("=" * 50)
    
    # Test 1: Create a test user
    print("\n1. Creating test user...")
    db = get_db()
    
    # Check if test user exists
    test_user = db.users.find_one({"email": "testuser@example.com"})
    if not test_user:
        print("   Creating new test user...")
        user_data = {
            "email": "testuser@example.com",
            "username": "testuser",
            "name": "Test User",
            "password": "password123",
            "role": "user"
        }
        user_id = User.create_user(user_data)
        print(f"   ✅ Test user created with ID: {user_id}")
    else:
        user_id = str(test_user['_id'])
        print(f"   ✅ Test user already exists with ID: {user_id}")
    
    # Test 2: Login as admin to get token
    print("\n2. Logging in as admin...")
    admin_login_data = {
        "identifier": "admin@tnca.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=admin_login_data)
        if response.status_code == 200:
            admin_data = response.json()
            admin_token = admin_data['data']['access_token']
            print("   ✅ Admin login successful")
        else:
            print(f"   ❌ Admin login failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Admin login error: {e}")
        return False
    
    # Test 3: Suspend user with reason
    print("\n3. Suspending user with reason...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    suspension_data = {"reason": "Violation of community guidelines"}
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/users/{user_id}/toggle-status",
            headers=headers,
            json=suspension_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ User suspended successfully: {result['message']}")
        else:
            print(f"   ❌ User suspension failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ User suspension error: {e}")
        return False
    
    # Test 4: Try to login as suspended user
    print("\n4. Testing login as suspended user...")
    user_login_data = {
        "identifier": "testuser@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=user_login_data)
        if response.status_code == 401:
            result = response.json()
            print(f"   ✅ Login correctly blocked: {result['message']}")
            print(f"   📝 Suspension reason: {result.get('suspension_reason', 'None')}")
            print(f"   👤 Suspended by: {result.get('suspended_by', 'None')}")
        else:
            print(f"   ❌ Login should have been blocked but wasn't: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Login test error: {e}")
        return False
    
    # Test 5: Suspend user without reason
    print("\n5. Testing suspension without reason...")
    
    # First reactivate the user
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/users/{user_id}/toggle-status",
            headers=headers
        )
        if response.status_code == 200:
            print("   ✅ User reactivated")
        else:
            print(f"   ❌ User reactivation failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ User reactivation error: {e}")
        return False
    
    # Now suspend without reason
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/users/{user_id}/toggle-status",
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ User suspended without reason: {result['message']}")
        else:
            print(f"   ❌ User suspension failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ User suspension error: {e}")
        return False
    
    # Test 6: Try to login as suspended user (no reason)
    print("\n6. Testing login as suspended user (no reason)...")
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=user_login_data)
        if response.status_code == 401:
            result = response.json()
            print(f"   ✅ Login correctly blocked: {result['message']}")
            print(f"   📝 Suspension reason: {result.get('suspension_reason', 'None')}")
            print(f"   👤 Suspended by: {result.get('suspended_by', 'None')}")
        else:
            print(f"   ❌ Login should have been blocked but wasn't: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Login test error: {e}")
        return False
    
    # Test 7: Test developer protection
    print("\n7. Testing developer account protection...")
    
    # Find a developer user
    developer = db.users.find_one({"role": "developer"})
    if developer:
        dev_id = str(developer['_id'])
        print(f"   Found developer user: {developer['name']} ({developer['email']})")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/admin/users/{dev_id}/toggle-status",
                headers=headers,
                json={"reason": "Test suspension"}
            )
            
            if response.status_code == 403:
                result = response.json()
                print(f"   ✅ Developer protection working: {result['message']}")
            else:
                print(f"   ❌ Developer should be protected: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Developer protection test error: {e}")
            return False
    else:
        print("   ⚠️  No developer user found to test protection")
    
    print("\n" + "=" * 50)
    print("🎉 All suspension tests passed!")
    return True

if __name__ == "__main__":
    try:
        success = test_suspension_functionality()
        if success:
            print("\n✅ Suspension functionality is working correctly!")
            sys.exit(0)
        else:
            print("\n❌ Some tests failed!")
            sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test script error: {e}")
        sys.exit(1) 