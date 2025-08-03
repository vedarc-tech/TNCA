from models.database import get_db
import bcrypt
from datetime import datetime
from bson import ObjectId
import re

class User:
    def __init__(self, user_data):
        self.id = str(user_data.get('_id'))
        self.email = user_data.get('email')
        self.username = user_data.get('username')
        self.name = user_data.get('name')
        self.role = user_data.get('role', 'user')
        self.is_active = user_data.get('is_active', True)
        self.profile_picture = user_data.get('profile_picture')
        self.created_at = user_data.get('created_at', datetime.utcnow())
        self.last_login = user_data.get('last_login')
        self.iq_score = user_data.get('iq_score', 0)
        self.total_quizzes = user_data.get('total_quizzes', 0)
        self.total_games = user_data.get('total_games', 0)
        self.badge_level = user_data.get('badge_level', 'Bronze')
        self.performance_history = user_data.get('performance_history', [])
        self.suspension_reason = user_data.get('suspension_reason', None)
        self.suspended_by = user_data.get('suspended_by', None)
        self.suspended_at = user_data.get('suspended_at', None)

    @staticmethod
    def is_valid_username(username):
        """Validate username format"""
        if not username:
            return False, "Username is required"
        
        # Username constraints
        if len(username) < 3:
            return False, "Username must be at least 3 characters long"
        
        if len(username) > 20:
            return False, "Username must be at most 20 characters long"
        
        # Only allow alphanumeric characters, underscores, and hyphens
        if not re.match(r'^[a-zA-Z0-9_-]+$', username):
            return False, "Username can only contain letters, numbers, underscores, and hyphens"
        
        # Must start with a letter or number
        if not re.match(r'^[a-zA-Z0-9]', username):
            return False, "Username must start with a letter or number"
        
        # Must end with a letter or number
        if not re.search(r'[a-zA-Z0-9]$', username):
            return False, "Username must end with a letter or number"
        
        # Check for reserved usernames
        reserved_usernames = ['admin', 'administrator', 'root', 'system', 'support', 'help', 'info', 'test', 'guest', 'user', 'users']
        if username.lower() in reserved_usernames:
            return False, "This username is reserved and cannot be used"
        
        return True, "Username is valid"

    @staticmethod
    def is_username_available(username):
        """Check if username is available"""
        db = get_db()
        existing_user = db.users.find_one({"username": username})
        return existing_user is None

    @staticmethod
    def create_user(user_data):
        """Create a new user"""
        db = get_db()
        
        # Special handling for developer accounts
        is_developer = user_data.get('role') == 'developer'
        
        # Validate email format
        if not User.is_valid_email(user_data['email']):
            raise ValueError("Invalid email format")
        
        # Validate username (skip validation for developer accounts)
        if not is_developer:
            is_valid, username_error = User.is_valid_username(user_data['username'])
            if not is_valid:
                raise ValueError(username_error)
        
        # Check if email already exists
        if db.users.find_one({"email": user_data['email']}):
            raise ValueError("Email already exists")
        
        # Check if username already exists (skip for developer accounts)
        if not is_developer and not User.is_username_available(user_data['username']):
            raise ValueError("Username already exists")
        
        # Hash password
        hashed_password = bcrypt.hashpw(
            user_data['password'].encode('utf-8'), 
            bcrypt.gensalt()
        )
        
        user_doc = {
            "email": user_data['email'],
            "username": user_data['username'],
            "name": user_data['name'],
            "password": hashed_password,
            "role": user_data.get('role', 'user'),
            "is_active": user_data.get('is_active', True),
            "profile_picture": user_data.get('profile_picture'),
            "created_at": datetime.utcnow(),
            "last_login": None,
            "iq_score": 0,
            "total_quizzes": 0,
            "total_games": 0,
            "badge_level": "Bronze",
            "performance_history": []
        }
        
        result = db.users.insert_one(user_doc)
        return str(result.inserted_id)

    @staticmethod
    def authenticate(identifier, password):
        """Authenticate user with email/username and password"""
        db = get_db()
        
        # Try to find user by email or username
        user = db.users.find_one({
            "$or": [
                {"email": identifier},
                {"username": identifier}
            ],
            "is_active": True
        })
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            # Update last login
            db.users.update_one(
                {"_id": user['_id']},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            return User(user)
        return None

    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        db = get_db()
        user = db.users.find_one({"_id": ObjectId(user_id)})
        return User(user) if user else None

    @staticmethod
    def get_by_email(email):
        """Get user by email"""
        db = get_db()
        user = db.users.find_one({"email": email})
        return User(user) if user else None

    @staticmethod
    def get_by_username(username):
        """Get user by username"""
        db = get_db()
        user = db.users.find_one({"username": username})
        return User(user) if user else None

    @staticmethod
    def get_all_users():
        """Get all users (for admin)"""
        db = get_db()
        users = list(db.users.find({}))
        return [User(user) for user in users]

    @staticmethod
    def get_active_users():
        """Get all active users"""
        db = get_db()
        users = list(db.users.find({"is_active": True}))
        return [User(user) for user in users]

    def update_profile(self, update_data):
        """Update user profile"""
        db = get_db()
        allowed_fields = ['name', 'profile_picture']
        update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if update_fields:
            db.users.update_one(
                {"_id": ObjectId(self.id)},
                {"$set": update_fields}
            )
            return True
        return False

    def update_user(self, update_data):
        """Update user (admin only)"""
        db = get_db()
        allowed_fields = ['name', 'email', 'username', 'is_active', 'role']
        update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if update_fields:
            # Validate email if being updated
            if 'email' in update_fields and not User.is_valid_email(update_fields['email']):
                raise ValueError("Invalid email format")
            
            # Validate username if being updated
            if 'username' in update_fields:
                is_valid, username_error = User.is_valid_username(update_fields['username'])
                if not is_valid:
                    raise ValueError(username_error)
            
            # Check if email already exists (if being updated)
            if 'email' in update_fields:
                existing_user = db.users.find_one({
                    "email": update_fields['email'],
                    "_id": {"$ne": ObjectId(self.id)}
                })
                if existing_user:
                    raise ValueError("Email already exists")
            
            # Check if username already exists (if being updated)
            if 'username' in update_fields:
                existing_user = db.users.find_one({
                    "username": update_fields['username'],
                    "_id": {"$ne": ObjectId(self.id)}
                })
                if existing_user:
                    raise ValueError("Username already exists")
            
            db.users.update_one(
                {"_id": ObjectId(self.id)},
                {"$set": update_fields}
            )
            
            # Update instance attributes
            for field, value in update_fields.items():
                setattr(self, field, value)
            
            return True
        return False

    def update_iq_score(self, new_score, quiz_difficulty='Medium', user_age=18):
        """Update user's IQ score using proper calculation formula"""
        db = get_db()
        
        # Calculate IQ using proper formula
        # IQ = 100 + (15 * Z-score)
        # Z-score = (Raw Score - Mean) / Standard Deviation
        
        # Get user's performance history for baseline calculation
        performance_history = self.performance_history[-10:] if self.performance_history else []  # Last 10 attempts
        
        if performance_history:
            # Calculate baseline from recent performance
            recent_scores = [entry.get('raw_score', 0) for entry in performance_history]
            mean_score = sum(recent_scores) / len(recent_scores)
            
            # Calculate standard deviation
            variance = sum((score - mean_score) ** 2 for score in recent_scores) / len(recent_scores)
            std_dev = variance ** 0.5
            
            if std_dev > 0:
                # Calculate Z-score
                z_score = (new_score - mean_score) / std_dev
            else:
                z_score = 0
        else:
            # For new users, use difficulty-based baseline
            difficulty_baselines = {
                'Easy': 70,
                'Medium': 60,
                'Hard': 50,
                'Expert': 40
            }
            baseline = difficulty_baselines.get(quiz_difficulty, 60)
            z_score = (new_score - baseline) / 15  # Assume 15 as standard deviation
        
        # Calculate IQ score (100 is mean, 15 is standard deviation)
        iq_score = 100 + (15 * z_score)
        
        # Apply age correction factor (simplified)
        age_factor = 1.0
        if user_age < 16:
            age_factor = 1.1  # Younger users get slight boost
        elif user_age > 25:
            age_factor = 0.95  # Older users slight adjustment
        
        iq_score = iq_score * age_factor
        
        # Clamp IQ score to reasonable range (70-130 for most users, up to 160 for exceptional)
        iq_score = max(70, min(160, iq_score))
        
        # Update badge level based on IQ score
        badge_level = User.calculate_badge_level(iq_score)
        
        # Add to performance history
        performance_entry = {
            "date": datetime.utcnow(),
            "raw_score": new_score,
            "iq_score": iq_score,
            "badge_level": badge_level,
            "quiz_difficulty": quiz_difficulty,
            "z_score": z_score
        }
        
        db.users.update_one(
            {"_id": ObjectId(self.id)},
            {
                "$set": {
                    "iq_score": iq_score,
                    "badge_level": badge_level
                },
                "$push": {
                    "performance_history": performance_entry
                }
            }
        )
        
        # Update instance
        self.iq_score = iq_score
        self.badge_level = badge_level
        self.performance_history.append(performance_entry)
        
        return iq_score

    @staticmethod
    def calculate_badge_level(iq_score):
        """Calculate badge level based on IQ score"""
        if iq_score >= 180:
            return "Diamond Cubist"
        elif iq_score >= 160:
            return "Platinum Cubist"
        elif iq_score >= 140:
            return "Gold Cubist"
        elif iq_score >= 120:
            return "Silver Cubist"
        elif iq_score >= 100:
            return "Bronze Cubist"
        else:
            return "Novice Cubist"

    def increment_quiz_count(self):
        """Increment total quizzes attempted"""
        db = get_db()
        db.users.update_one(
            {"_id": ObjectId(self.id)},
            {"$inc": {"total_quizzes": 1}}
        )
        self.total_quizzes += 1

    def increment_game_count(self):
        """Increment total games played"""
        db = get_db()
        db.users.update_one(
            {"_id": ObjectId(self.id)},
            {"$inc": {"total_games": 1}}
        )
        self.total_games += 1

    def delete_user(self):
        """Delete user (admin only)"""
        db = get_db()
        db.users.delete_one({"_id": ObjectId(self.id)})
        return True

    def deactivate_user(self, reason=None, suspended_by=None):
        """Deactivate user with optional reason"""
        db = get_db()
        update_data = {
            "is_active": False,
            "suspended_at": datetime.utcnow()
        }
        
        if reason:
            update_data["suspension_reason"] = reason
        if suspended_by:
            update_data["suspended_by"] = suspended_by
            
        db.users.update_one(
            {"_id": ObjectId(self.id)},
            {"$set": update_data}
        )
        self.is_active = False
        self.suspension_reason = reason
        self.suspended_by = suspended_by
        self.suspended_at = datetime.utcnow()

    def activate_user(self):
        """Activate user and clear suspension data"""
        db = get_db()
        db.users.update_one(
            {"_id": ObjectId(self.id)},
            {
                "$set": {"is_active": True},
                "$unset": {
                    "suspension_reason": "",
                    "suspended_by": "",
                    "suspended_at": ""
                }
            }
        )
        self.is_active = True
        self.suspension_reason = None
        self.suspended_by = None
        self.suspended_at = None

    def reset_password(self, new_password):
        """Reset user password"""
        db = get_db()
        hashed_password = bcrypt.hashpw(
            new_password.encode('utf-8'), 
            bcrypt.gensalt()
        )
        db.users.update_one(
            {"_id": ObjectId(self.id)},
            {"$set": {"password": hashed_password}}
        )

    @staticmethod
    def is_valid_email(email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def to_dict(self):
        """Convert user to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "name": self.name,
            "role": self.role,
            "is_active": self.is_active,
            "profile_picture": self.profile_picture,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "iq_score": self.iq_score,
            "total_quizzes": self.total_quizzes,
            "total_games": self.total_games,
            "badge_level": self.badge_level,
            "performance_history": self.performance_history,
            "suspension_reason": self.suspension_reason,
            "suspended_by": self.suspended_by,
            "suspended_at": self.suspended_at.isoformat() if self.suspended_at else None
        } 