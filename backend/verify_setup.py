#!/usr/bin/env python3

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def verify_setup():
    """Verify that the entire setup is working correctly"""
    print("🔍 Verifying TNCA Setup")
    print("=" * 50)
    
    # Test backend health
    try:
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            print("✅ Backend server is running")
        else:
            print("❌ Backend server is not responding")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {str(e)}")
        return False
    
    # Test authentication with super admin
    login_data = {
        "identifier": "tamilnaducubeassociation@gmail.com",
        "password": "Tnca@600101"
    }
    
    try:
        response = requests.post("http://localhost:5000/api/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Super admin authentication working")
                access_token = data['data']['access_token']
                
                # Test admin endpoints
                headers = {"Authorization": f"Bearer {access_token}"}
                
                # Test users endpoint
                users_response = requests.get("http://localhost:5000/api/admin/users", headers=headers)
                if users_response.status_code == 200:
                    print("✅ Admin users endpoint working")
                else:
                    print(f"❌ Admin users endpoint failed: {users_response.status_code}")
                
                # Test dashboard endpoint
                dashboard_response = requests.get("http://localhost:5000/api/admin/dashboard/stats", headers=headers)
                if dashboard_response.status_code == 200:
                    print("✅ Admin dashboard endpoint working")
                else:
                    print(f"❌ Admin dashboard endpoint failed: {dashboard_response.status_code}")
                
                # Test games endpoint
                games_response = requests.get("http://localhost:5000/api/game/admin/games", headers=headers)
                if games_response.status_code == 200:
                    print("✅ Admin games endpoint working")
                else:
                    print(f"❌ Admin games endpoint failed: {games_response.status_code}")
                
                return True
            else:
                print(f"❌ Authentication failed: {data.get('message')}")
                return False
        else:
            print(f"❌ Login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Authentication test failed: {str(e)}")
        return False

if __name__ == '__main__':
    success = verify_setup()
    if success:
        print("\n🎉 All systems are working correctly!")
        print("You can now start the frontend and login with:")
        print("Email: tamilnaducubeassociation@gmail.com")
        print("Password: Tnca@600101")
    else:
        print("\n❌ Setup verification failed. Please check the errors above.") 