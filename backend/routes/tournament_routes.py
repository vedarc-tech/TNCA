from flask import Blueprint, request, jsonify
from models.tournament import Tournament
from models.user import User
from models.game import Game
from middleware.auth_middleware import auth_required, admin_required, get_current_user
from datetime import datetime, timedelta
from bson import ObjectId

tournament_bp = Blueprint('tournament', __name__)

# Tournament Management Routes (Admin)
@tournament_bp.route('/admin/tournaments', methods=['GET'])
@admin_required
def get_all_tournaments():
    """Get all tournaments (admin only)"""
    try:
        tournaments = Tournament.get_all_tournaments()
        return jsonify({
            'success': True,
            'message': 'Tournaments retrieved successfully',
            'data': [tournament.to_dict() for tournament in tournaments]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve tournaments: {str(e)}'
        }), 500

@tournament_bp.route('/admin/tournaments', methods=['POST'])
@admin_required
def create_tournament():
    """Create a new tournament (admin only)"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'description', 'game_id', 'tournament_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Validate game exists
        game = Game.get_by_id(data['game_id'])
        if not game:
            return jsonify({
                'success': False,
                'message': 'Game not found'
            }), 404
        
        # Add creator information
        data['created_by'] = current_user.id
        
        # Create tournament
        tournament = Tournament.create_tournament(data)
        
        return jsonify({
            'success': True,
            'message': 'Tournament created successfully',
            'data': tournament.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to create tournament: {str(e)}'
        }), 500

@tournament_bp.route('/admin/tournaments/<tournament_id>/start', methods=['POST'])
@admin_required
def start_tournament(tournament_id):
    """Start a tournament (admin only)"""
    try:
        tournament = Tournament.get_by_id(tournament_id)
        if not tournament:
            return jsonify({
                'success': False,
                'message': 'Tournament not found'
            }), 404
        
        tournament.start_tournament()
        
        return jsonify({
            'success': True,
            'message': 'Tournament started successfully',
            'data': tournament.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to start tournament: {str(e)}'
        }), 500

@tournament_bp.route('/admin/tournaments/<tournament_id>/update-match', methods=['POST'])
@admin_required
def update_tournament_match(tournament_id):
    """Update tournament match result (admin only)"""
    try:
        tournament = Tournament.get_by_id(tournament_id)
        if not tournament:
            return jsonify({
                'success': False,
                'message': 'Tournament not found'
            }), 404
        
        data = request.get_json()
        match_id = data.get('match_id')
        winner_id = data.get('winner_id')
        player1_score = data.get('player1_score', 0)
        player2_score = data.get('player2_score', 0)
        
        if not match_id or not winner_id:
            return jsonify({
                'success': False,
                'message': 'Match ID and winner ID are required'
            }), 400
        
        success = tournament.update_match_result(match_id, winner_id, player1_score, player2_score)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Match result updated successfully',
                'data': tournament.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Match not found'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update match result: {str(e)}'
        }), 500

# Tournament Routes (Users)
@tournament_bp.route('/tournaments', methods=['GET'])
@auth_required
def get_active_tournaments():
    """Get active tournaments for users"""
    try:
        tournaments = Tournament.get_active_tournaments()
        return jsonify({
            'success': True,
            'message': 'Tournaments retrieved successfully',
            'data': [tournament.to_dict() for tournament in tournaments]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve tournaments: {str(e)}'
        }), 500

@tournament_bp.route('/tournaments/<tournament_id>', methods=['GET'])
@auth_required
def get_tournament_details(tournament_id):
    """Get tournament details"""
    try:
        tournament = Tournament.get_by_id(tournament_id)
        if not tournament:
            return jsonify({
                'success': False,
                'message': 'Tournament not found'
            }), 404
        
        # Get participant details
        participant_details = []
        for participant in tournament.participants:
            user = User.get_by_id(str(participant['user_id']))
            if user:
                participant_details.append({
                    'user_id': str(participant['user_id']),
                    'username': user.username,
                    'name': user.name,
                    'registered_at': participant['registered_at'].isoformat() if participant['registered_at'] else None,
                    'status': participant['status'],
                    'matches_won': participant['matches_won'],
                    'matches_lost': participant['matches_lost'],
                    'total_score': participant['total_score']
                })
        
        tournament_data = tournament.to_dict()
        tournament_data['participant_details'] = participant_details
        tournament_data['progress'] = tournament.get_tournament_progress()
        
        return jsonify({
            'success': True,
            'message': 'Tournament details retrieved successfully',
            'data': tournament_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve tournament details: {str(e)}'
        }), 500

@tournament_bp.route('/tournaments/<tournament_id>/register', methods=['POST'])
@auth_required
def register_for_tournament(tournament_id):
    """Register for a tournament"""
    try:
        current_user = get_current_user()
        tournament = Tournament.get_by_id(tournament_id)
        
        if not tournament:
            return jsonify({
                'success': False,
                'message': 'Tournament not found'
            }), 404
        
        if tournament.status != 'registration':
            return jsonify({
                'success': False,
                'message': 'Tournament registration is closed'
            }), 400
        
        tournament.register_participant(current_user.id)
        
        return jsonify({
            'success': True,
            'message': 'Successfully registered for tournament',
            'data': tournament.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to register for tournament: {str(e)}'
        }), 500

@tournament_bp.route('/tournaments/<tournament_id>/unregister', methods=['POST'])
@auth_required
def unregister_from_tournament(tournament_id):
    """Unregister from a tournament"""
    try:
        current_user = get_current_user()
        tournament = Tournament.get_by_id(tournament_id)
        
        if not tournament:
            return jsonify({
                'success': False,
                'message': 'Tournament not found'
            }), 404
        
        if tournament.status != 'registration':
            return jsonify({
                'success': False,
                'message': 'Cannot unregister from active tournament'
            }), 400
        
        # Remove participant
        from models.database import get_db
        db = get_db()
        
        result = db.tournaments.update_one(
            {'_id': ObjectId(tournament_id)},
            {
                '$pull': {'participants': {'user_id': ObjectId(current_user.id)}},
                '$inc': {'current_participants': -1},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        if result.modified_count > 0:
            return jsonify({
                'success': True,
                'message': 'Successfully unregistered from tournament'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Not registered for this tournament'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to unregister from tournament: {str(e)}'
        }), 500

@tournament_bp.route('/tournaments/my-tournaments', methods=['GET'])
@auth_required
def get_my_tournaments():
    """Get tournaments where user is participating"""
    try:
        current_user = get_current_user()
        tournaments = Tournament.get_all_tournaments()
        
        my_tournaments = []
        for tournament in tournaments:
            # Check if user is participating
            for participant in tournament.participants:
                if str(participant['user_id']) == current_user.id:
                    tournament_data = tournament.to_dict()
                    tournament_data['my_stats'] = tournament.get_participant_stats(current_user.id)
                    my_tournaments.append(tournament_data)
                    break
        
        return jsonify({
            'success': True,
            'message': 'My tournaments retrieved successfully',
            'data': my_tournaments
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve my tournaments: {str(e)}'
        }), 500

@tournament_bp.route('/tournaments/<tournament_id>/brackets', methods=['GET'])
@auth_required
def get_tournament_brackets(tournament_id):
    """Get tournament brackets"""
    try:
        tournament = Tournament.get_by_id(tournament_id)
        if not tournament:
            return jsonify({
                'success': False,
                'message': 'Tournament not found'
            }), 404
        
        # Get user details for brackets
        brackets_with_users = []
        for bracket in tournament.brackets:
            bracket_data = bracket.copy()
            for match in bracket_data['matches']:
                # Get player details
                if match['player1_id'] and match['player1_id'] != 'bye':
                    player1 = User.get_by_id(match['player1_id'])
                    match['player1_name'] = player1.name if player1 else 'Unknown'
                else:
                    match['player1_name'] = 'Bye'
                
                if match['player2_id'] and match['player2_id'] != 'bye':
                    player2 = User.get_by_id(match['player2_id'])
                    match['player2_name'] = player2.name if player2 else 'Unknown'
                else:
                    match['player2_name'] = 'Bye'
                
                # Get winner details
                if match['winner_id'] and match['winner_id'] != 'bye':
                    winner = User.get_by_id(match['winner_id'])
                    match['winner_name'] = winner.name if winner else 'Unknown'
                else:
                    match['winner_name'] = None
            
            brackets_with_users.append(bracket_data)
        
        return jsonify({
            'success': True,
            'message': 'Tournament brackets retrieved successfully',
            'data': {
                'tournament': tournament.to_dict(),
                'brackets': brackets_with_users
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve tournament brackets: {str(e)}'
        }), 500 