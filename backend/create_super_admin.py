#!/usr/bin/env python3

from models.database import get_db, init_db
from models.user import User
from datetime import datetime
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

def create_super_admin():
    """Create a super admin user based on environment variables"""
    db = get_db()
    
    # Get super admin credentials from environment
    super_admin_email = os.getenv('SUPER_ADMIN_EMAIL', 'tamilnaducubeassociation@gmail.com')
    super_admin_username = os.getenv('SUPER_ADMIN_USERNAME', 'TN')
    super_admin_password = os.getenv('SUPER_ADMIN_PASSWORD', 'Tn')
    super_admin_name = os.getenv('SUPER_ADMIN_NAME', 'TNCA Super Admin')
    
    # Check if super admin user already exists
    existing_user = db.users.find_one({'email': super_admin_email})
    
    if existing_user:
        print(f"Super admin user already exists: {super_admin_email}")
        return existing_user
    
    # Create super admin user
    super_admin_data = {
        'name': super_admin_name,
        'email': super_admin_email,
        'username': super_admin_username,
        'password': super_admin_password,  # Will be hashed in create_user
        'role': 'super_admin',
        'is_active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
        'last_login': None,
        'iq_score': 0,
        'badge_level': 'beginner',
        'total_quizzes_taken': 0,
        'total_games_played': 0,
        'total_tournaments_joined': 0
    }
    
    try:
        user_id = User.create_user(super_admin_data)
        print("✅ Super admin user created successfully")
        print(f"Email: {super_admin_email}")
        print(f"Username: {super_admin_username}")
        print(f"Password: {super_admin_password}")
        print(f"Role: super_admin")
        return user_id
    except Exception as e:
        print(f"❌ Failed to create super admin user: {str(e)}")
        return None

if __name__ == '__main__':
    # Initialize database connection
    from flask import Flask
    app = Flask(__name__)
    app.config['MONGO_URI'] = 'mongodb://localhost:27017/tnca_iq_platform'
    init_db(app)
    
    create_super_admin() 