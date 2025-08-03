from flask import Blueprint, request, jsonify
from models.user import User
from models.game import Game
from models.match import Match
from middleware.auth_middleware import auth_required, admin_required, get_current_user
from datetime import datetime, timedelta
from bson import ObjectId
import random

game_bp = Blueprint('game', __name__)

# Game Management Routes (Admin)
@game_bp.route('/admin/games', methods=['GET'])
@admin_required
def get_all_games():
    """Get all games (admin only)"""
    try:
        games = Game.get_all_games()
        return jsonify({
            'success': True,
            'message': 'Games retrieved successfully',
            'data': [game.to_dict() for game in games]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve games: {str(e)}'
        }), 500

@game_bp.route('/admin/games/<game_id>/toggle-lock', methods=['POST'])
@admin_required
def toggle_game_lock(game_id):
    """Toggle game lock status (admin only)"""
    try:
        game = Game.get_by_id(game_id)
        if not game:
            return jsonify({
                'success': False,
                'message': 'Game not found'
            }), 404
        
        game.toggle_lock()
        message = 'Game unlocked successfully' if game.is_locked else 'Game locked successfully'
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to toggle game lock: {str(e)}'
        }), 500

@game_bp.route('/admin/games/<game_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_game_status(game_id):
    """Toggle game active status (admin only)"""
    try:
        game = Game.get_by_id(game_id)
        if not game:
            return jsonify({
                'success': False,
                'message': 'Game not found'
            }), 404
        
        game.toggle_status()
        message = 'Game activated successfully' if game.is_active else 'Game deactivated successfully'
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to toggle game status: {str(e)}'
        }), 500

@game_bp.route('/admin/games/<game_id>/settings', methods=['PUT'])
@admin_required
def update_game_settings(game_id):
    """Update game settings (admin only)"""
    try:
        game = Game.get_by_id(game_id)
        if not game:
            return jsonify({
                'success': False,
                'message': 'Game not found'
            }), 404
        
        data = request.get_json()
        allowed_fields = ['name', 'description', 'type', 'difficulty', 'max_levels', 'time_limit', 'unlimited_levels', 'allow_admin_challenges']
        
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if update_data:
            game.update_settings(update_data)
        
        return jsonify({
            'success': True,
            'message': 'Game settings updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update game settings: {str(e)}'
        }), 500

# Game Play Routes (Users)
@game_bp.route('/games', methods=['GET'])
@auth_required
def get_available_games():
    """Get available games for users"""
    try:
        games = Game.get_available_games()
        return jsonify({
            'success': True,
            'message': 'Games retrieved successfully',
            'data': [game.to_dict() for game in games]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve games: {str(e)}'
        }), 500

@game_bp.route('/user/games', methods=['GET'])
@auth_required
def get_user_games():
    """Get games available for the current user"""
    try:
        current_user = get_current_user()
        games = Game.get_available_games()
        
        # If no games exist, create default games
        if not games:
            from models.database import get_db
            db = get_db()
            
            # Create default chess game
            chess_game_data = {
                'name': 'Chess Puzzles',
                'description': 'Strategic chess puzzles and challenges',
                'type': 'chess',
                'difficulty': 'beginner',
                'is_active': True,
                'is_locked': False,
                'max_levels': 10,
                'time_limit': 300,
                'total_plays': 0,
                'total_matches': 0,
                'average_score': 0,
                'game_modes': ['checkmate', 'tactics', 'endgame'],
                'allow_admin_challenges': True,
                'unlimited_levels': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # Create default cube game
            cube_game_data = {
                'name': 'Cube Challenges',
                'description': 'Rubik\'s cube solving challenges',
                'type': 'cube',
                'difficulty': 'intermediate',
                'is_active': True,
                'is_locked': False,
                'max_levels': 10,
                'time_limit': 300,
                'total_plays': 0,
                'total_matches': 0,
                'average_score': 0,
                'cube_types': ['3x3', '4x4', '5x5', '2x2'],
                'allow_admin_challenges': True,
                'unlimited_levels': False,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # Insert default games
            db.games.insert_one(chess_game_data)
            db.games.insert_one(cube_game_data)
            
            # Get the games again
            games = Game.get_available_games()
        
        # Add user-specific data to each game
        for game in games:
            game_dict = game.to_dict()
            # Add user's progress for this game
            try:
                game_dict['user_progress'] = {
                    'highest_level': game.get_user_highest_level(str(current_user.id)),
                    'total_plays': game.get_user_total_plays(str(current_user.id)),
                    'best_score': game.get_user_best_score(str(current_user.id))
                }
            except Exception as progress_error:
                # If there's an error getting user progress, provide default values
                game_dict['user_progress'] = {
                    'highest_level': 0,
                    'total_plays': 0,
                    'best_score': 0
                }
        
        return jsonify({
            'success': True,
            'message': 'User games retrieved successfully',
            'data': [game_dict for game in games]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve user games: {str(e)}'
        }), 500

@game_bp.route('/games/<game_id>/levels', methods=['GET'])
@auth_required
def get_game_levels(game_id):
    """Get levels for a specific game"""
    try:
        current_user = get_current_user()
        game = Game.get_by_id(game_id)
        if not game:
            return jsonify({
                'success': False,
                'message': 'Game not found'
            }), 404
        
        if game.is_locked:
            return jsonify({
                'success': False,
                'message': 'This game is currently locked'
            }), 403
        
        # Get limit from query params
        limit = request.args.get('limit', type=int)
        levels = game.get_levels(user_id=current_user.id, limit=limit)
        
        return jsonify({
            'success': True,
            'message': 'Levels retrieved successfully',
            'data': levels
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve levels: {str(e)}'
        }), 500

@game_bp.route('/games/<game_id>/levels/<level_id>/start', methods=['POST'])
@auth_required
def start_game_level(game_id, level_id):
    """Start a specific game level"""
    try:
        current_user = get_current_user()
        game = Game.get_by_id(game_id)
        
        if not game:
            return jsonify({
                'success': False,
                'message': 'Game not found'
            }), 404
        
        if game.is_locked:
            return jsonify({
                'success': False,
                'message': 'This game is currently locked'
            }), 403
        
        # Start the game session
        session_data = game.start_level(level_id, current_user.id)
        
        return jsonify({
            'success': True,
            'message': 'Game level started successfully',
            'data': session_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to start game level: {str(e)}'
        }), 500

@game_bp.route('/games/<game_id>/levels/<level_id>/submit', methods=['POST'])
@auth_required
def submit_game_solution(game_id, level_id):
    """Submit solution for a game level"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        game = Game.get_by_id(game_id)
        if not game:
            return jsonify({
                'success': False,
                'message': 'Game not found'
            }), 404
        
        solution = data.get('solution')
        time_taken = data.get('time_taken', 0)
        
        if not solution:
            return jsonify({
                'success': False,
                'message': 'Solution is required'
            }), 400
        
        # Submit and validate solution
        result = game.submit_solution(level_id, current_user.id, solution, time_taken)
        
        return jsonify({
            'success': True,
            'message': 'Solution submitted successfully',
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to submit solution: {str(e)}'
        }), 500

# 1v1 Match Routes
@game_bp.route('/matches/create', methods=['POST'])
@auth_required
def create_match():
    """Create a 1v1 match"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        opponent_id = data.get('opponent_id')
        game_id = data.get('game_id')
        level_id = data.get('level_id')
        cube_type = data.get('cube_type')
        chess_mode = data.get('chess_mode')
        
        if not all([opponent_id, game_id, level_id]):
            return jsonify({
                'success': False,
                'message': 'Opponent ID, game ID, and level ID are required'
            }), 400
        
        # Check if opponent exists
        opponent = User.get_by_id(opponent_id)
        if not opponent:
            return jsonify({
                'success': False,
                'message': 'Opponent not found'
            }), 404
        
        # Check if game is available
        game = Game.get_by_id(game_id)
        if not game or game.is_locked:
            return jsonify({
                'success': False,
                'message': 'Game not available'
            }), 400
        
        # Create match
        match = Match.create_match(
            challenger_id=current_user.id,
            opponent_id=opponent_id,
            game_id=game_id,
            level_id=level_id,
            cube_type=cube_type,
            chess_mode=chess_mode
        )
        
        return jsonify({
            'success': True,
            'message': 'Match created successfully',
            'data': match.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to create match: {str(e)}'
        }), 500

# Admin Challenge Routes
@game_bp.route('/matches/admin/challenge', methods=['POST'])
@admin_required
def create_admin_challenge():
    """Create an admin challenge to a student"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        student_id = data.get('student_id')
        game_id = data.get('game_id')
        level_id = data.get('level_id')
        cube_type = data.get('cube_type')
        chess_mode = data.get('chess_mode')
        
        if not all([student_id, game_id, level_id]):
            return jsonify({
                'success': False,
                'message': 'Student ID, game ID, and level ID are required'
            }), 400
        
        # Check if student exists
        student = User.get_by_id(student_id)
        if not student or student.role != 'user':
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
        
        # Check if game is available
        game = Game.get_by_id(game_id)
        if not game or game.is_locked:
            return jsonify({
                'success': False,
                'message': 'Game not available'
            }), 400
        
        # Create admin challenge
        match = Match.create_admin_challenge(
            admin_id=current_user.id,
            student_id=student_id,
            game_id=game_id,
            level_id=level_id,
            cube_type=cube_type,
            chess_mode=chess_mode
        )
        
        return jsonify({
            'success': True,
            'message': 'Admin challenge created successfully',
            'data': match.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to create admin challenge: {str(e)}'
        }), 500

@game_bp.route('/matches/challenge-admin', methods=['POST'])
@auth_required
def challenge_admin():
    """Challenge an admin (students only)"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        admin_id = data.get('admin_id')
        game_id = data.get('game_id')
        level_id = data.get('level_id')
        cube_type = data.get('cube_type')
        chess_mode = data.get('chess_mode')
        
        if not all([admin_id, game_id, level_id]):
            return jsonify({
                'success': False,
                'message': 'Admin ID, game ID, and level ID are required'
            }), 400
        
        # Check if admin exists
        admin = User.get_by_id(admin_id)
        if not admin or admin.role not in ['admin', 'super_admin']:
            return jsonify({
                'success': False,
                'message': 'Admin not found'
            }), 404
        
        # Check if game allows admin challenges
        game = Game.get_by_id(game_id)
        if not game or game.is_locked or not game.allow_admin_challenges:
            return jsonify({
                'success': False,
                'message': 'Game does not allow admin challenges'
            }), 400
        
        # Create student challenge to admin
        match = Match.create_student_challenge_to_admin(
            student_id=current_user.id,
            admin_id=admin_id,
            game_id=game_id,
            level_id=level_id,
            cube_type=cube_type,
            chess_mode=chess_mode
        )
        
        return jsonify({
            'success': True,
            'message': 'Challenge to admin created successfully',
            'data': match.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to create challenge to admin: {str(e)}'
        }), 500

@game_bp.route('/matches/<match_id>/accept', methods=['POST'])
@auth_required
def accept_match(match_id):
    """Accept a match invitation"""
    try:
        current_user = get_current_user()
        match = Match.get_by_id(match_id)
        
        if not match:
            return jsonify({
                'success': False,
                'message': 'Match not found'
            }), 404
        
        if match.opponent_id != current_user.id:
            return jsonify({
                'success': False,
                'message': 'You can only accept matches sent to you'
            }), 403
        
        if match.status != 'pending':
            return jsonify({
                'success': False,
                'message': 'Match is no longer pending'
            }), 400
        
        match.accept()
        
        return jsonify({
            'success': True,
            'message': 'Match accepted successfully',
            'data': match.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to accept match: {str(e)}'
        }), 500

@game_bp.route('/matches/<match_id>/decline', methods=['POST'])
@auth_required
def decline_match(match_id):
    """Decline a match invitation"""
    try:
        current_user = get_current_user()
        match = Match.get_by_id(match_id)
        
        if not match:
            return jsonify({
                'success': False,
                'message': 'Match not found'
            }), 404
        
        if match.opponent_id != current_user.id:
            return jsonify({
                'success': False,
                'message': 'You can only decline matches sent to you'
            }), 403
        
        match.decline()
        
        return jsonify({
            'success': True,
            'message': 'Match declined successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to decline match: {str(e)}'
        }), 500

@game_bp.route('/matches/<match_id>/submit', methods=['POST'])
@auth_required
def submit_match_solution(match_id):
    """Submit solution for a match"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        match = Match.get_by_id(match_id)
        if not match:
            return jsonify({
                'success': False,
                'message': 'Match not found'
            }), 404
        
        if match.status != 'active':
            return jsonify({
                'success': False,
                'message': 'Match is not active'
            }), 400
        
        if match.challenger_id != current_user.id and match.opponent_id != current_user.id:
            return jsonify({
                'success': False,
                'message': 'You are not part of this match'
            }), 403
        
        solution = data.get('solution')
        time_taken = data.get('time_taken', 0)
        
        if not solution:
            return jsonify({
                'success': False,
                'message': 'Solution is required'
            }), 400
        
        # Submit solution and determine winner
        result = match.submit_solution(current_user.id, solution, time_taken)
        
        return jsonify({
            'success': True,
            'message': 'Solution submitted successfully',
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to submit match solution: {str(e)}'
        }), 500

@game_bp.route('/matches', methods=['GET'])
@auth_required
def get_user_matches():
    """Get matches for current user"""
    try:
        current_user = get_current_user()
        matches = Match.get_user_matches(current_user.id)
        
        return jsonify({
            'success': True,
            'message': 'Matches retrieved successfully',
            'data': [match.to_dict() for match in matches]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve matches: {str(e)}'
        }), 500

@game_bp.route('/matches/pending', methods=['GET'])
@auth_required
def get_pending_matches():
    """Get pending match invitations"""
    try:
        current_user = get_current_user()
        matches = Match.get_pending_matches(current_user.id)
        
        return jsonify({
            'success': True,
            'message': 'Pending matches retrieved successfully',
            'data': [match.to_dict() for match in matches]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve pending matches: {str(e)}'
        }), 500

@game_bp.route('/matches/admin-challenges', methods=['GET'])
@auth_required
def get_admin_challenges():
    """Get admin challenges for current user (students)"""
    try:
        current_user = get_current_user()
        matches = Match.get_admin_challenges(current_user.id)
        
        return jsonify({
            'success': True,
            'message': 'Admin challenges retrieved successfully',
            'data': [match.to_dict() for match in matches]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve admin challenges: {str(e)}'
        }), 500

@game_bp.route('/matches/student-challenges', methods=['GET'])
@admin_required
def get_student_challenges_to_admin():
    """Get student challenges to current admin"""
    try:
        current_user = get_current_user()
        matches = Match.get_student_challenges_to_admin(current_user.id)
        
        return jsonify({
            'success': True,
            'message': 'Student challenges retrieved successfully',
            'data': [match.to_dict() for match in matches]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve student challenges: {str(e)}'
        }), 500

# Leaderboard Routes
@game_bp.route('/leaderboard/<game_id>', methods=['GET'])
@auth_required
def get_game_leaderboard(game_id):
    """Get leaderboard for a specific game"""
    try:
        game = Game.get_by_id(game_id)
        if not game:
            return jsonify({
                'success': False,
                'message': 'Game not found'
            }), 404
        
        leaderboard = game.get_leaderboard()
        
        return jsonify({
            'success': True,
            'message': 'Leaderboard retrieved successfully',
            'data': leaderboard
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve leaderboard: {str(e)}'
        }), 500

@game_bp.route('/leaderboard/global', methods=['GET'])
@auth_required
def get_global_leaderboard():
    """Get global leaderboard across all games"""
    try:
        leaderboard = Game.get_global_leaderboard()
        
        return jsonify({
            'success': True,
            'message': 'Global leaderboard retrieved successfully',
            'data': leaderboard
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve global leaderboard: {str(e)}'
        }), 500

# Health check for debugging
@game_bp.route('/health', methods=['GET'])
def game_health_check():
    """Health check for game routes"""
    try:
        return jsonify({
            'success': True,
            'message': 'Game routes are working',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Game routes error: {str(e)}'
        }), 500

# Cube Types Route
@game_bp.route('/cube-types', methods=['GET'])
@auth_required
def get_cube_types():
    """Get all available cube types"""
    try:
        cube_types = {
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
        
        return jsonify({
            'success': True,
            'message': 'Cube types retrieved successfully',
            'data': cube_types
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve cube types: {str(e)}'
        }), 500 