#!/usr/bin/env python3

import requests
import json

def test_auth():
    """Test authentication endpoints"""
    base_url = "http://localhost:5000/api"
    
    print("🔍 Testing Authentication System")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            print("✅ Backend server is running")
        else:
            print("❌ Backend server is not responding")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {str(e)}")
        return
    
    # Test 2: Login with super admin
    login_data = {
        "identifier": "tamilnaducubeassociation@gmail.com",
        "password": "Tnca@600101"
    }
    
    try:
        response = requests.post(f"{base_url}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Super admin login successful")
                access_token = data['data']['access_token']
                print(f"   Token: {access_token[:20]}...")
                
                # Test 3: Get current user
                headers = {"Authorization": f"Bearer {access_token}"}
                user_response = requests.get(f"{base_url}/auth/me", headers=headers)
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    if user_data.get('success'):
                        print("✅ Token validation successful")
                        print(f"   User: {user_data['data']['name']} ({user_data['data']['role']})")
                    else:
                        print("❌ Token validation failed")
                else:
                    print(f"❌ Token validation failed: {user_response.status_code}")
                
                # Test 4: Access admin endpoint
                admin_response = requests.get(f"{base_url}/admin/users", headers=headers)
                if admin_response.status_code == 200:
                    print("✅ Admin access successful")
                else:
                    print(f"❌ Admin access failed: {admin_response.status_code}")
                    
            else:
                print(f"❌ Login failed: {data.get('message')}")
        else:
            print(f"❌ Login failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Login test failed: {str(e)}")

if __name__ == '__main__':
    test_auth() 