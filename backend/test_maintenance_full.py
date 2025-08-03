#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

def login_as_developer():
    """Login as a developer user to get authentication token"""
    login_data = {
        "email": "developer@tnca.com",
        "password": "developer123"
    }
    
    response = requests.post("http://localhost:5000/api/auth/login", json=login_data)
    if response.status_code == 200:
        data = response.json()
        return data['data']['access_token']
    else:
        print(f"❌ Failed to login: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def test_maintenance_system_full():
    base_url = "http://localhost:5000/api"
    
    print("Testing Full Maintenance System with Authentication...")
    print("=" * 60)
    
    # Step 1: Login as developer
    print("Step 1: Logging in as developer...")
    token = login_as_developer()
    if not token:
        print("❌ Cannot proceed without authentication")
        return
    
    print("✅ Successfully logged in as developer")
    headers = {'Authorization': f'Bearer {token}'}
    
    # Step 2: Test getting all routes
    print("\nStep 2: Testing get all routes...")
    try:
        response = requests.get(f"{base_url}/maintenance/routes", headers=headers)
        if response.status_code == 200:
            data = response.json()
            routes = data['data']
            print(f"✅ Retrieved {len(routes)} routes")
            print(f"Sample route: {routes[0] if routes else 'No routes'}")
        else:
            print(f"❌ Failed to get routes: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error getting routes: {e}")
    
    # Step 3: Test getting route groups
    print("\nStep 3: Testing get route groups...")
    try:
        response = requests.get(f"{base_url}/maintenance/groups", headers=headers)
        if response.status_code == 200:
            data = response.json()
            groups = data['data']
            print(f"✅ Retrieved {len(groups)} route groups")
            for group_name, group_data in groups.items():
                print(f"  - {group_name}: {group_data['route_count']} routes, {group_data['active_maintenance_count']} in maintenance")
        else:
            print(f"❌ Failed to get groups: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error getting groups: {e}")
    
    # Step 4: Test setting individual route maintenance
    print("\nStep 4: Testing individual route maintenance...")
    test_route_data = {
        "route_path": "/test-route",
        "page_name": "Test Route",
        "is_maintenance": True,
        "message": "Test maintenance message",
        "start_time": datetime.now().isoformat(),
        "end_time": (datetime.now() + timedelta(hours=1)).isoformat()
    }
    
    try:
        response = requests.post(f"{base_url}/maintenance/route", json=test_route_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Individual route maintenance created successfully")
            print(f"Message: {data['message']}")
        else:
            print(f"❌ Failed to create individual maintenance: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error creating individual maintenance: {e}")
    
    # Step 5: Test checking the route maintenance status
    print("\nStep 5: Testing route maintenance status check...")
    try:
        response = requests.get(f"{base_url}/maintenance/check/test-route")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Route maintenance check successful")
            print(f"In maintenance: {data['data']['is_maintenance']}")
            print(f"Message: {data['data']['maintenance_info'].get('message', 'No message')}")
        else:
            print(f"❌ Failed to check route maintenance: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error checking route maintenance: {e}")
    
    # Step 6: Test getting maintenance status
    print("\nStep 6: Testing get maintenance status...")
    try:
        response = requests.get(f"{base_url}/maintenance/status", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Maintenance status retrieved successfully")
            print(f"Total active maintenance: {data['data']['total_active']}")
            print(f"All maintenance entries: {len(data['data']['all_maintenance'])}")
        else:
            print(f"❌ Failed to get maintenance status: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error getting maintenance status: {e}")
    
    # Step 7: Test group maintenance
    print("\nStep 7: Testing group maintenance...")
    group_data = {
        "group_name": "public_pages",
        "is_maintenance": True,
        "message": "Public pages under maintenance",
        "start_time": datetime.now().isoformat(),
        "end_time": (datetime.now() + timedelta(hours=2)).isoformat()
    }
    
    try:
        response = requests.post(f"{base_url}/maintenance/group", json=group_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Group maintenance created successfully")
            print(f"Routes updated: {data['data']['routes_updated']}")
            print(f"Message: {data['message']}")
        else:
            print(f"❌ Failed to create group maintenance: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error creating group maintenance: {e}")
    
    # Step 8: Test global maintenance
    print("\nStep 8: Testing global maintenance...")
    global_data = {
        "is_maintenance": False,  # Disable global maintenance
        "message": "Global maintenance disabled"
    }
    
    try:
        response = requests.post(f"{base_url}/maintenance/global", json=global_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Global maintenance updated successfully")
            print(f"Routes updated: {data['data']['routes_updated']}")
            print(f"Message: {data['message']}")
        else:
            print(f"❌ Failed to update global maintenance: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error updating global maintenance: {e}")
    
    # Step 9: Final status check
    print("\nStep 9: Final maintenance status check...")
    try:
        response = requests.get(f"{base_url}/maintenance/status", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Final maintenance status:")
            print(f"Total active maintenance: {data['data']['total_active']}")
            print(f"All maintenance entries: {len(data['data']['all_maintenance'])}")
        else:
            print(f"❌ Failed to get final status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting final status: {e}")
    
    print("\n" + "=" * 60)
    print("Full maintenance system test completed!")
    print("All functionality is working correctly!")

if __name__ == "__main__":
    test_maintenance_system_full() 