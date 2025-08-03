#!/usr/bin/env python3

from models.database import get_db, init_db
from models.user import User
from datetime import datetime
import hashlib
import os

def create_admin_user():
    """Create an admin user for testing"""
    db = get_db()
    
    # Check if admin user already exists
    existing_user = db.users.find_one({'email': 'admin@tnca.com'})
    
    if existing_user:
        print("Admin user already exists")
        return
    
    # Create admin user
    admin_data = {
        'name': 'Admin User',
        'email': 'admin@tnca.com',
        'username': 'admin',
        'password': hashlib.sha256('admin123'.encode()).hexdigest(),
        'role': 'admin',
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
    
    result = db.users.insert_one(admin_data)
    
    if result.inserted_id:
        print("✅ Admin user created successfully")
        print("Email: admin@tnca.com")
        print("Password: admin123")
    else:
        print("❌ Failed to create admin user")

if __name__ == '__main__':
    # Initialize database connection
    from flask import Flask
    app = Flask(__name__)
    app.config['MONGO_URI'] = 'mongodb://localhost:27017/tnca_iq_platform'
    init_db(app)
    
    create_admin_user() 