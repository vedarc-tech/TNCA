from pymongo import MongoClient
from flask import current_app
import os

# Global database connection
db = None

def init_db(app):
    """Initialize database connection"""
    global db
    try:
        client = MongoClient(app.config['MONGO_URI'])
        db = client.tnca_iq_platform
        
        # Create indexes for better performance
        db.users.create_index("email", unique=True)
        db.users.create_index("username", unique=True)
        db.quizzes.create_index("title")
        db.quiz_attempts.create_index([("user_id", 1), ("quiz_id", 1)])
        db.game_scores.create_index([("user_id", 1), ("game_type", 1)])
        db.analytics.create_index([("user_id", 1), ("date", -1)])
        
        # Create super admin if not exists
        create_super_admin()
        
        print("Database initialized successfully")
        return db
    except Exception as e:
        print(f"Database initialization error: {e}")
        return None

def create_super_admin():
    """Create super admin account if it doesn't exist"""
    from models.user import User
    
    super_admin_data = {
        "email": os.getenv('SUPER_ADMIN_EMAIL', 'tamilnaducubeassociation@gmail.com'),
        "username": os.getenv('SUPER_ADMIN_USERNAME', 'TNCA'),
        "password": os.getenv('SUPER_ADMIN_PASSWORD', 'Tnca@600101'),
        "role": "super_admin",
        "name": os.getenv('SUPER_ADMIN_NAME', 'TNCA Super Admin'),
        "is_active": True
    }
    
    try:
        # Check if super admin already exists
        existing_admin = db.users.find_one({"email": super_admin_data["email"]})
        if not existing_admin:
            User.create_user(super_admin_data)
            print("Super admin account created successfully")
        else:
            print("Super admin account already exists")
    except Exception as e:
        print(f"Error creating super admin: {e}")

def get_db():
    """Get database instance"""
    return db 