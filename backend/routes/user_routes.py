from flask import Blueprint, request, jsonify
from models.user import User
from models.quiz import Quiz
from middleware.auth_middleware import user_required, get_current_user
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard', methods=['GET'])
@user_required
def get_user_dashboard():
    """Get user dashboard data"""
    try:
        current_user = get_current_user()
        
        # Get user's quiz attempts
        from models.database import get_db
        db = get_db()
        
        quiz_attempts = list(db.quiz_attempts.find({"user_id": current_user.id}).sort("created_at", -1).limit(5))
        game_scores = list(db.game_scores.find({"user_id": current_user.id}).sort("created_at", -1).limit(5))
        
        # Get available quizzes
        available_quizzes = Quiz.get_active_quizzes()
        
        return jsonify({
            'success': True,
            'message': 'Dashboard data retrieved successfully',
            'data': {
                'user': current_user.to_dict(),
                'recent_quiz_attempts': quiz_attempts,
                'recent_game_scores': game_scores,
                'available_quizzes': [quiz.to_dict_for_user() for quiz in available_quizzes]
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get dashboard data: {str(e)}'
        }), 500

@user_bp.route('/profile', methods=['GET'])
@user_required
def get_user_profile():
    """Get user profile"""
    try:
        current_user = get_current_user()
        
        return jsonify({
            'success': True,
            'message': 'Profile retrieved successfully',
            'data': current_user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get profile: {str(e)}'
        }), 500

@user_bp.route('/profile', methods=['PUT'])
@user_required
def update_user_profile():
    """Update user profile (limited fields)"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        # Only allow updating name and profile picture
        allowed_fields = ['name', 'profile_picture']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if update_data:
            current_user.update_profile(update_data)
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update profile: {str(e)}'
        }), 500

@user_bp.route('/performance', methods=['GET'])
@user_required
def get_user_performance():
    """Get user performance history"""
    try:
        current_user = get_current_user()
        
        return jsonify({
            'success': True,
            'message': 'Performance data retrieved successfully',
            'data': {
                'iq_score': current_user.iq_score,
                'badge_level': current_user.badge_level,
                'total_quizzes': current_user.total_quizzes,
                'total_games': current_user.total_games,
                'performance_history': current_user.performance_history
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get performance data: {str(e)}'
        }), 500

@user_bp.route('/leaderboard', methods=['GET'])
@user_required
def get_leaderboard():
    """Get leaderboard"""
    try:
        from models.database import get_db
        db = get_db()
        
        # Get top performers by IQ score
        top_performers = list(db.users.find({"is_active": True}).sort("iq_score", -1).limit(20))
        
        return jsonify({
            'success': True,
            'message': 'Leaderboard retrieved successfully',
            'data': [User(user).to_dict() for user in top_performers]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get leaderboard: {str(e)}'
        }), 500

@user_bp.route('/quizzes', methods=['GET'])
@user_required
def get_available_quizzes():
    """Get available quizzes for user"""
    try:
        quizzes = Quiz.get_active_quizzes()
        
        return jsonify({
            'success': True,
            'message': 'Available quizzes retrieved successfully',
            'data': [quiz.to_dict_for_user() for quiz in quizzes]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get quizzes: {str(e)}'
        }), 500

@user_bp.route('/quizzes/<quiz_id>', methods=['GET'])
@user_required
def get_quiz(quiz_id):
    """Get specific quiz for user"""
    try:
        quiz = Quiz.get_by_id(quiz_id)
        if not quiz:
            return jsonify({
                'success': False,
                'message': 'Quiz not found'
            }), 404
        
        if not quiz.is_active:
            return jsonify({
                'success': False,
                'message': 'Quiz is not available'
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Quiz retrieved successfully',
            'data': quiz.to_dict_for_user()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get quiz: {str(e)}'
        }), 500

@user_bp.route('/stats', methods=['GET'])
@user_required
def get_user_stats():
    """Get user statistics"""
    try:
        current_user = get_current_user()
        from models.database import get_db
        db = get_db()
        
        # Get user's game statistics
        game_scores = list(db.game_scores.find({"user_id": current_user.id}))
        quiz_attempts = list(db.quiz_attempts.find({"user_id": current_user.id}))
        
        # Calculate statistics
        total_games_played = len(game_scores)
        total_quizzes_taken = len(quiz_attempts)
        average_game_score = sum(score.get('score', 0) for score in game_scores) / max(total_games_played, 1)
        average_quiz_score = sum(attempt.get('score', 0) for attempt in quiz_attempts) / max(total_quizzes_taken, 1)
        
        # Get recent activity
        recent_games = list(db.game_scores.find({"user_id": current_user.id}).sort("created_at", -1).limit(5))
        recent_quizzes = list(db.quiz_attempts.find({"user_id": current_user.id}).sort("created_at", -1).limit(5))
        
        return jsonify({
            'success': True,
            'message': 'User statistics retrieved successfully',
            'data': {
                'total_games_played': total_games_played,
                'total_quizzes_taken': total_quizzes_taken,
                'average_game_score': round(average_game_score, 2),
                'average_quiz_score': round(average_quiz_score, 2),
                'iq_score': current_user.iq_score,
                'badge_level': current_user.badge_level,
                'recent_games': recent_games,
                'recent_quizzes': recent_quizzes
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get user statistics: {str(e)}'
        }), 500 