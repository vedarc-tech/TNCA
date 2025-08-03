#!/usr/bin/env python3

from models.database import get_db, init_db
from models.user import User
from datetime import datetime
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

def ensure_users_exist():
    """Ensure all necessary users exist in the database"""
    db = get_db()
    
    # Super Admin User (from .env)
    super_admin_email = os.getenv('SUPER_ADMIN_EMAIL', 'tamilnaducubeassociation@gmail.com')
    super_admin_username = os.getenv('SUPER_ADMIN_USERNAME', 'TN')
    super_admin_password = os.getenv('SUPER_ADMIN_PASSWORD', 'Tn')
    super_admin_name = os.getenv('SUPER_ADMIN_NAME', 'TNCA Super Admin')
    
    # Check if super admin exists
    existing_super_admin = db.users.find_one({'email': super_admin_email})
    if not existing_super_admin:
        print(f"Creating super admin user: {super_admin_email}")
        try:
            super_admin_data = {
                'name': super_admin_name,
                'email': super_admin_email,
                'username': super_admin_username,
                'password': super_admin_password,
                'role': 'super_admin',
                'is_active': True
            }
            user_id = User.create_user(super_admin_data)
            print(f"✅ Super admin created with ID: {user_id}")
        except Exception as e:
            print(f"❌ Failed to create super admin: {str(e)}")
    else:
        print(f"✅ Super admin already exists: {super_admin_email}")
    
    # Admin User (for testing)
    admin_email = 'admin@tnca.com'
    existing_admin = db.users.find_one({'email': admin_email})
    if not existing_admin:
        print(f"Creating admin user: {admin_email}")
        try:
            admin_data = {
                'name': 'Admin User',
                'email': admin_email,
                'username': 'admin',
                'password': 'admin123',
                'role': 'admin',
                'is_active': True
            }
            user_id = User.create_user(admin_data)
            print(f"✅ Admin created with ID: {user_id}")
        except Exception as e:
            print(f"❌ Failed to create admin: {str(e)}")
    else:
        print(f"✅ Admin already exists: {admin_email}")
    
    # Developer User (for testing)
    dev_email = 'developer@tnca.com'
    existing_dev = db.users.find_one({'email': dev_email})
    if not existing_dev:
        print(f"Creating developer user: {dev_email}")
        try:
            dev_data = {
                'name': 'Developer User',
                'email': dev_email,
                'username': 'developer',
                'password': 'developer123',
                'role': 'developer',
                'is_active': True
            }
            user_id = User.create_user(dev_data)
            print(f"✅ Developer created with ID: {user_id}")
        except Exception as e:
            print(f"❌ Failed to create developer: {str(e)}")
    else:
        print(f"✅ Developer already exists: {dev_email}")
    
    print("\n📋 Available Users:")
    print("=" * 50)
    print(f"Super Admin: {super_admin_email} / {super_admin_password}")
    print(f"Admin: admin@tnca.com / admin123")
    print(f"Developer: developer@tnca.com / developer123")
    print("=" * 50)

if __name__ == '__main__':
    # Initialize database connection
    from flask import Flask
    app = Flask(__name__)
    app.config['MONGO_URI'] = 'mongodb://localhost:27017/tnca_iq_platform'
    init_db(app)
    
    ensure_users_exist() 