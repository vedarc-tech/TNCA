#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

def test_maintenance_routes():
    base_url = "http://localhost:5000/api"
    
    print("Testing Maintenance Route Checking...")
    print("=" * 50)
    
    # Test routes that should be checked for maintenance
    test_routes = [
        "/",
        "/dashboard", 
        "/admin",
        "/admin/users",
        "/quizzes",
        "/games",
        "/profile"
    ]
    
    for route in test_routes:
        print(f"\nTesting route: {route}")
        try:
            response = requests.get(f"{base_url}/maintenance/check{route}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Route {route} check successful")
                print(f"   In maintenance: {data['data']['is_maintenance']}")
                if data['data']['maintenance_info']['is_maintenance']:
                    print(f"   Message: {data['data']['maintenance_info']['message']}")
            else:
                print(f"❌ Failed to check route {route}: {response.status_code}")
        except Exception as e:
            print(f"❌ Error checking route {route}: {e}")
    
    print("\n" + "=" * 50)
    print("Maintenance route checking test completed!")

if __name__ == "__main__":
    test_maintenance_routes() 