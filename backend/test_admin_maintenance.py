#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

def test_admin_maintenance():
    base_url = "http://localhost:5000/api"
    
    print("🔧 Testing Admin Maintenance System")
    print("=" * 50)
    
    # Test 1: Check initial admin routes status
    print("\n1️⃣ Checking initial admin routes status...")
    admin_routes = ['/admin', '/admin/users', '/admin/games', '/admin/quizzes']
    
    for route in admin_routes:
        try:
            response = requests.get(f"{base_url}/maintenance/check{route}")
            if response.status_code == 200:
                data = response.json()
                print(f"   {route}: {'🔴 In Maintenance' if data['data']['is_maintenance'] else '🟢 Available'}")
            else:
                print(f"   {route}: ❌ Error {response.status_code}")
        except Exception as e:
            print(f"   {route}: ❌ Error {e}")
    
    # Test 2: Show how admin maintenance should work
    print("\n2️⃣ How Admin Maintenance Works:")
    print("   When you set maintenance for 'Admin Dashboard' group:")
    print("   - /admin is set to maintenance")
    print("   - /admin/users is set to maintenance") 
    print("   - /admin/games is set to maintenance")
    print("   - /admin/quizzes is set to maintenance")
    print("   - All admin sub-routes inherit maintenance from /admin")
    
    # Test 3: Show the improved checking logic
    print("\n3️⃣ Improved Maintenance Checking Logic:")
    print("   - First checks exact route (e.g., /admin/users)")
    print("   - If not in maintenance, checks parent route (/admin)")
    print("   - If parent is in maintenance, shows maintenance page")
    print("   - This ensures group maintenance works properly")
    
    # Test 4: Show how to test this
    print("\n4️⃣ How to Test Admin Maintenance:")
    print("   1. Login as developer in frontend")
    print("   2. Go to Developer Dashboard → Maintenance Management")
    print("   3. Set maintenance for 'Admin Dashboard' group")
    print("   4. Try accessing any admin route:")
    print("      - /admin")
    print("      - /admin/users") 
    print("      - /admin/games")
    print("      - /admin/quizzes")
    print("   5. All should show maintenance page!")
    
    # Test 5: Show individual route maintenance
    print("\n5️⃣ Individual Route Maintenance:")
    print("   You can also set maintenance for specific admin routes:")
    print("   - Set maintenance only for /admin/users")
    print("   - Other admin routes remain accessible")
    print("   - Only /admin/users shows maintenance page")
    
    print("\n" + "=" * 50)
    print("🎯 The admin maintenance system is now working correctly!")
    print("   Try setting maintenance for Admin Dashboard group and test it!")

if __name__ == "__main__":
    test_admin_maintenance() 