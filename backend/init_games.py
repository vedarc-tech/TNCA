#!/usr/bin/env python3
"""
Initialize the database with enhanced Chess and Cube games
"""

from models.database import get_db, init_db
from datetime import datetime
from bson import ObjectId

def init_games():
    """Initialize the database with enhanced games"""
    db = get_db()
    
    # Enhanced Chess game with unlimited levels
    chess_game = {
        'name': 'Chess Puzzles',
        'description': 'Unlimited strategic chess puzzles and challenges with multiple modes',
        'type': 'chess',
        'difficulty': 'beginner',
        'is_active': True,
        'is_locked': False,
        'max_levels': 1000,  # High number for unlimited feel
        'time_limit': 300,
        'total_plays': 0,
        'total_matches': 0,
        'average_score': 0,
        'unlimited_levels': True,
        'allow_admin_challenges': True,
        'game_modes': ['checkmate', 'tactics', 'endgame', 'opening', 'strategy'],
        'cube_types': [],
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    # Enhanced Cube game with all cube types
    cube_game = {
        'name': 'Cube Challenges',
        'description': 'Comprehensive Rubik\'s cube solving challenges with all cube types',
        'type': 'cube',
        'difficulty': 'intermediate',
        'is_active': True,
        'is_locked': False,
        'max_levels': 50,  # Number of different cube types
        'time_limit': 600,
        'total_plays': 0,
        'total_matches': 0,
        'average_score': 0,
        'unlimited_levels': False,
        'allow_admin_challenges': True,
        'game_modes': ['speed_solve', 'blindfold', 'one_handed'],
        'cube_types': [
            'standard', 'shape_mod', 'non_cubic', 'cuboids', 'advanced'
        ],
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    # Check if games already exist
    existing_chess = db.games.find_one({'name': 'Chess Puzzles'})
    existing_cube = db.games.find_one({'name': 'Cube Challenges'})
    
    if not existing_chess:
        db.games.insert_one(chess_game)
        print("✓ Enhanced Chess Puzzles game created")
    else:
        # Update existing chess game with new features
        db.games.update_one(
            {'name': 'Chess Puzzles'},
            {
                '$set': {
                    'unlimited_levels': True,
                    'allow_admin_challenges': True,
                    'game_modes': ['checkmate', 'tactics', 'endgame', 'opening', 'strategy'],
                    'max_levels': 1000,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        print("✓ Enhanced Chess Puzzles game updated")
    
    if not existing_cube:
        db.games.insert_one(cube_game)
        print("✓ Enhanced Cube Challenges game created")
    else:
        # Update existing cube game with new features
        db.games.update_one(
            {'name': 'Cube Challenges'},
            {
                '$set': {
                    'allow_admin_challenges': True,
                    'game_modes': ['speed_solve', 'blindfold', 'one_handed'],
                    'cube_types': ['standard', 'shape_mod', 'non_cubic', 'cuboids', 'advanced'],
                    'updated_at': datetime.utcnow()
                }
            }
        )
        print("✓ Enhanced Cube Challenges game updated")
    
    # Create enhanced cube levels for each cube type
    create_enhanced_cube_levels(db)
    
    print("✓ Enhanced games initialization completed!")

def create_enhanced_cube_levels(db):
    """Create enhanced cube levels for all cube types"""
    
    # Get cube game ID
    cube_game = db.games.find_one({'name': 'Cube Challenges'})
    
    if not cube_game:
        print("⚠ Cube game not found, skipping level creation")
        return
    
    # Define all cube types with their details
    cube_types_data = {
        'standard': [
            {'name': '2x2', 'difficulty': 'beginner', 'time_limit': 30, 'points': 50},
            {'name': '3x3', 'difficulty': 'beginner', 'time_limit': 60, 'points': 100},
            {'name': '4x4', 'difficulty': 'intermediate', 'time_limit': 180, 'points': 200},
            {'name': '5x5', 'difficulty': 'intermediate', 'time_limit': 300, 'points': 300},
            {'name': '6x6', 'difficulty': 'advanced', 'time_limit': 600, 'points': 400},
            {'name': '7x7', 'difficulty': 'advanced', 'time_limit': 900, 'points': 500},
            {'name': '8x8', 'difficulty': 'expert', 'time_limit': 1200, 'points': 600}
        ],
        'shape_mod': [
            {'name': 'Mirror Cube', 'difficulty': 'intermediate', 'time_limit': 120, 'points': 150},
            {'name': 'Ghost Cube', 'difficulty': 'advanced', 'time_limit': 180, 'points': 200},
            {'name': 'Windmill Cube', 'difficulty': 'intermediate', 'time_limit': 120, 'points': 150},
            {'name': 'Axis Cube', 'difficulty': 'advanced', 'time_limit': 180, 'points': 200},
            {'name': 'Fisher Cube', 'difficulty': 'advanced', 'time_limit': 180, 'points': 200},
            {'name': 'Mastermorphix', 'difficulty': 'expert', 'time_limit': 240, 'points': 250},
            {'name': 'Void Cube', 'difficulty': 'intermediate', 'time_limit': 120, 'points': 150}
        ],
        'non_cubic': [
            {'name': 'Pyraminx', 'difficulty': 'beginner', 'time_limit': 45, 'points': 75},
            {'name': 'Megaminx', 'difficulty': 'advanced', 'time_limit': 600, 'points': 400},
            {'name': 'Gigaminx', 'difficulty': 'expert', 'time_limit': 1200, 'points': 600},
            {'name': 'Kilominx', 'difficulty': 'intermediate', 'time_limit': 300, 'points': 200},
            {'name': 'Skewb', 'difficulty': 'beginner', 'time_limit': 60, 'points': 100},
            {'name': 'Skewb Ultimate', 'difficulty': 'advanced', 'time_limit': 360, 'points': 300},
            {'name': 'Curvy Copter', 'difficulty': 'advanced', 'time_limit': 480, 'points': 350},
            {'name': 'Square-1', 'difficulty': 'expert', 'time_limit': 120, 'points': 250}
        ],
        'cuboids': [
            {'name': '2x2x3', 'difficulty': 'beginner', 'time_limit': 60, 'points': 100},
            {'name': '3x3x2', 'difficulty': 'beginner', 'time_limit': 60, 'points': 100},
            {'name': '3x3x9', 'difficulty': 'advanced', 'time_limit': 900, 'points': 500},
            {'name': '1x3x3', 'difficulty': 'beginner', 'time_limit': 30, 'points': 50},
            {'name': '2x2x4', 'difficulty': 'intermediate', 'time_limit': 120, 'points': 150},
            {'name': '3x3x4', 'difficulty': 'intermediate', 'time_limit': 180, 'points': 200}
        ],
        'advanced': [
            {'name': 'Multi-layered Mirror', 'difficulty': 'expert', 'time_limit': 600, 'points': 400},
            {'name': 'Ghost 4x4', 'difficulty': 'expert', 'time_limit': 720, 'points': 450},
            {'name': 'Ghost 5x5', 'difficulty': 'expert', 'time_limit': 900, 'points': 500},
            {'name': 'Petaminx', 'difficulty': 'expert', 'time_limit': 1800, 'points': 800},
            {'name': 'Redi Cube', 'difficulty': 'intermediate', 'time_limit': 120, 'points': 150},
            {'name': 'Helicopter Cube', 'difficulty': 'advanced', 'time_limit': 360, 'points': 250}
        ]
    }
    
    level_number = 1
    total_levels = 0
    
    for category, cube_list in cube_types_data.items():
        for cube_info in cube_list:
            level_data = {
                'game_id': cube_game['_id'],
                'level_number': level_number,
                'title': f'{cube_info["name"]} Challenge',
                'description': f'Solve the {cube_info["name"]} cube',
                'difficulty': cube_info['difficulty'],
                'time_limit': cube_info['time_limit'],
                'points': cube_info['points'],
                'mode': 'speed_solve',
                'cube_type': cube_info['name'],
                'category': category,
                'created_at': datetime.utcnow()
            }
            
            # Check if level already exists
            existing = db.game_levels.find_one({
                'game_id': cube_game['_id'],
                'cube_type': cube_info['name']
            })
            
            if not existing:
                db.game_levels.insert_one(level_data)
                total_levels += 1
            
            level_number += 1
    
    print(f"✓ Created {total_levels} enhanced cube levels across all categories")

if __name__ == '__main__':
    # Initialize database connection
    from flask import Flask
    app = Flask(__name__)
    app.config['MONGO_URI'] = 'mongodb://localhost:27017/tnca_iq_platform'
    init_db(app)
    
    # Initialize enhanced games
    init_games()
    
    print("\n🎮 Enhanced Chess & Cube Platform Ready!")
    print("Features:")
    print("✅ Unlimited Chess levels with multiple modes")
    print("✅ All cube types (Standard, Shape Mod, Non-Cubic, Cuboids, Advanced)")
    print("✅ Admin challenges (students can challenge admins)")
    print("✅ Admin can challenge students")
    print("✅ Completion time tracking for all cube types")
    print("✅ Progress tracking and leaderboards")
    print("✅ No sample data - only genuine user data") 