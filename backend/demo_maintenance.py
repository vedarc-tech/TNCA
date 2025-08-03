#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

def demo_maintenance():
    base_url = "http://localhost:5000/api"
    
    print("🔧 Maintenance System Demonstration")
    print("=" * 60)
    
    # Step 1: Check initial status
    print("\n1️⃣ Checking initial maintenance status...")
    try:
        response = requests.get(f"{base_url}/maintenance/check/dashboard")
        if response.status_code == 200:
            data = response.json()
            print(f"   Dashboard maintenance: {data['data']['is_maintenance']}")
        else:
            print(f"   ❌ Failed to check dashboard: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 2: Set maintenance for dashboard (requires auth)
    print("\n2️⃣ Setting maintenance for dashboard...")
    print("   Note: This requires developer authentication")
    print("   To test this, you need to:")
    print("   1. Login as developer in the frontend")
    print("   2. Go to Developer Dashboard → Maintenance Management")
    print("   3. Set maintenance for /dashboard route")
    
    # Step 3: Show how to check maintenance programmatically
    print("\n3️⃣ How to check maintenance programmatically:")
    print("   GET /api/maintenance/check/{route_path}")
    print("   Example: GET /api/maintenance/check/dashboard")
    
    # Step 4: Show maintenance management endpoints
    print("\n4️⃣ Maintenance Management Endpoints (requires auth):")
    print("   GET  /api/maintenance/routes     - Get all routes")
    print("   GET  /api/maintenance/status     - Get maintenance status")
    print("   GET  /api/maintenance/groups     - Get route groups")
    print("   POST /api/maintenance/route      - Set individual route maintenance")
    print("   POST /api/maintenance/group      - Set group maintenance")
    print("   POST /api/maintenance/global     - Set global maintenance")
    print("   DELETE /api/maintenance/route/{id} - Delete maintenance")
    
    # Step 5: Show route groups
    print("\n5️⃣ Available Route Groups:")
    print("   - public_pages: /, /home, /about, /contact, /privacy, /login, /register")
    print("   - user_dashboard: /dashboard, /profile, /quizzes, /games, etc.")
    print("   - admin_dashboard: /admin, /admin/users, /admin/games, etc.")
    print("   - developer_dashboard: /developer, /developer/system-control, etc.")
    
    # Step 6: Show frontend integration
    print("\n6️⃣ Frontend Integration:")
    print("   The maintenance system is now integrated into the frontend routes.")
    print("   When you set maintenance for a route, users will see the maintenance page.")
    print("   Developer routes are exempt from maintenance checks.")
    
    print("\n" + "=" * 60)
    print("🎯 To test the maintenance system:")
    print("1. Start the frontend and backend servers")
    print("2. Login as a developer user")
    print("3. Go to Developer Dashboard → Maintenance Management")
    print("4. Set maintenance for any route (e.g., /dashboard)")
    print("5. Try accessing that route - you should see the maintenance page!")
    print("6. Disable maintenance to restore normal access")

if __name__ == "__main__":
    demo_maintenance() 