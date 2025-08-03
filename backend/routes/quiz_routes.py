from flask import Blueprint, request, jsonify
from models.quiz import Quiz
from models.user import User
from middleware.auth_middleware import user_required, get_current_user
from models.database import get_db
from datetime import datetime
from bson import ObjectId

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/<quiz_id>/start', methods=['POST'])
@user_required
def start_quiz(quiz_id):
    """Start a quiz attempt"""
    try:
        current_user = get_current_user()
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
        
        # Check if user has already attempted this quiz recently
        db = get_db()
        recent_attempt = db.quiz_attempts.find_one({
            "user_id": current_user.id,
            "quiz_id": quiz_id,
            "created_at": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}
        })
        
        if recent_attempt:
            return jsonify({
                'success': False,
                'message': 'You have already attempted this quiz today'
            }), 400
        
        # Create quiz attempt
        attempt_data = {
            "user_id": current_user.id,
            "quiz_id": quiz_id,
            "started_at": datetime.utcnow(),
            "status": "in_progress",
            "answers": [],
            "score": 0,
            "time_taken": 0
        }
        
        attempt_id = db.quiz_attempts.insert_one(attempt_data).inserted_id
        
        return jsonify({
            'success': True,
            'message': 'Quiz started successfully',
            'data': {
                'attempt_id': str(attempt_id),
                'quiz': quiz.to_dict_for_user(),
                'time_limit': quiz.time_limit * 60  # Convert to seconds
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to start quiz: {str(e)}'
        }), 500

@quiz_bp.route('/<quiz_id>/submit', methods=['POST'])
@user_required
def submit_quiz(quiz_id):
    """Submit quiz answers"""
    try:
        current_user = get_current_user()
        quiz = Quiz.get_by_id(quiz_id)
        
        if not quiz:
            return jsonify({
                'success': False,
                'message': 'Quiz not found'
            }), 404
        
        data = request.get_json()
        answers = data.get('answers', [])
        attempt_id = data.get('attempt_id')
        time_taken = data.get('time_taken', 0)
        
        if not attempt_id:
            return jsonify({
                'success': False,
                'message': 'Attempt ID is required'
            }), 400
        
        # Get the quiz attempt
        db = get_db()
        attempt = db.quiz_attempts.find_one({
            "_id": ObjectId(attempt_id),
            "user_id": current_user.id,
            "quiz_id": quiz_id,
            "status": "in_progress"
        })
        
        if not attempt:
            return jsonify({
                'success': False,
                'message': 'Invalid quiz attempt'
            }), 400
        
        # Calculate score
        score_result = quiz.calculate_score(answers)
        
        # Update attempt
        db.quiz_attempts.update_one(
            {"_id": ObjectId(attempt_id)},
            {
                "$set": {
                    "answers": answers,
                    "score": score_result['score'],
                    "percentage": score_result['percentage'],
                    "time_taken": time_taken,
                    "completed_at": datetime.utcnow(),
                    "status": "completed"
                }
            }
        )
        
        # Update quiz statistics
        quiz.increment_attempts()
        quiz.update_average_score(score_result['percentage'])
        
        # Update user statistics
        current_user.increment_quiz_count()
        
        # Calculate new IQ score based on performance with proper formula
        new_iq_score = current_user.update_iq_score(
            score_result['percentage'], 
            quiz.difficulty, 
            user_age=18  # Default age, can be enhanced to get from user profile
        )
        
        return jsonify({
            'success': True,
            'message': 'Quiz submitted successfully',
            'data': {
                'score': score_result['score'],
                'total_questions': score_result['total_questions'],
                'percentage': score_result['percentage'],
                'time_taken': time_taken,
                'new_iq_score': new_iq_score,
                'badge_level': current_user.badge_level
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to submit quiz: {str(e)}'
        }), 500

@quiz_bp.route('/attempts', methods=['GET'])
@user_required
def get_quiz_attempts():
    """Get user's quiz attempts"""
    try:
        current_user = get_current_user()
        db = get_db()
        
        attempts = list(db.quiz_attempts.find({"user_id": current_user.id}).sort("created_at", -1))
        
        # Add quiz details to attempts
        for attempt in attempts:
            quiz = Quiz.get_by_id(attempt['quiz_id'])
            if quiz:
                attempt['quiz_title'] = quiz.title
                attempt['quiz_category'] = quiz.category
        
        return jsonify({
            'success': True,
            'message': 'Quiz attempts retrieved successfully',
            'data': attempts
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get quiz attempts: {str(e)}'
        }), 500

@quiz_bp.route('/attempts/<attempt_id>', methods=['GET'])
@user_required
def get_quiz_attempt(attempt_id):
    """Get specific quiz attempt with details"""
    try:
        current_user = get_current_user()
        db = get_db()
        
        attempt = db.quiz_attempts.find_one({
            "_id": ObjectId(attempt_id),
            "user_id": current_user.id
        })
        
        if not attempt:
            return jsonify({
                'success': False,
                'message': 'Quiz attempt not found'
            }), 404
        
        # Get quiz details
        quiz = Quiz.get_by_id(attempt['quiz_id'])
        if quiz:
            attempt['quiz'] = quiz.to_dict()
        
        return jsonify({
            'success': True,
            'message': 'Quiz attempt retrieved successfully',
            'data': attempt
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get quiz attempt: {str(e)}'
        }), 500

def calculate_iq_score(percentage, difficulty):
    """Calculate IQ score based on quiz performance"""
    # Base IQ score calculation
    base_iq = 100
    
    # Difficulty multipliers
    difficulty_multipliers = {
        'Easy': 0.8,
        'Medium': 1.0,
        'Hard': 1.2,
        'Expert': 1.5
    }
    
    multiplier = difficulty_multipliers.get(difficulty, 1.0)
    
    # Calculate IQ based on percentage
    if percentage >= 90:
        iq_increase = 30
    elif percentage >= 80:
        iq_increase = 20
    elif percentage >= 70:
        iq_increase = 10
    elif percentage >= 60:
        iq_increase = 5
    elif percentage >= 50:
        iq_increase = 0
    else:
        iq_increase = -10
    
    new_iq = base_iq + (iq_increase * multiplier)
    return max(0, min(200, new_iq))  # Clamp between 0-200 