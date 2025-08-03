#!/usr/bin/env python3

from models.database import get_db, init_db
from models.user import User
from datetime import datetime
import hashlib
import os

def create_developer_user():
    """Create a developer user for testing"""
    db = get_db()
    
    # Check if developer user already exists
    existing_user = db.users.find_one({'email': 'developer@tnca.com'})
    
    if existing_user:
        print("Developer user already exists")
        return
    
    # Create developer user
    developer_data = {
        'name': 'Developer User',
        'email': 'developer@tnca.com',
        'password': hashlib.sha256('developer123'.encode()).hexdigest(),
        'role': 'developer',
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
    
    result = db.users.insert_one(developer_data)
    
    if result.inserted_id:
        print("✅ Developer user created successfully")
        print("Email: developer@tnca.com")
        print("Password: developer123")
    else:
        print("❌ Failed to create developer user")

if __name__ == '__main__':
    # Initialize database connection
    from flask import Flask
    app = Flask(__name__)
    app.config['MONGO_URI'] = 'mongodb://localhost:27017/tnca_iq_platform'
    init_db(app)
    
    create_developer_user() 