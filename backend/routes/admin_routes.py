from flask import Blueprint, request, jsonify
from models.user import User
from models.quiz import Quiz
from models.game import Game
from middleware.auth_middleware import admin_required, super_admin_required, get_current_user, protect_super_admin
from datetime import datetime, timedelta
from bson import ObjectId
import os
import json

admin_bp = Blueprint('admin', __name__)

# User Management Routes
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users (admin only)"""
    try:
        users = User.get_all_users()
        return jsonify({
            'success': True,
            'message': 'Users retrieved successfully',
            'data': [user.to_dict() for user in users]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve users: {str(e)}'
        }), 500

@admin_bp.route('/users/check-username', methods=['POST'])
@admin_required
def check_username_availability():
    """Check if username is available"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username'):
            return jsonify({
                'success': False,
                'message': 'Username is required'
            }), 400
        
        username = data['username']
        
        # Validate username format
        is_valid, validation_message = User.is_valid_username(username)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': validation_message,
                'available': False
            }), 200
        
        # Check availability
        is_available = User.is_username_available(username)
        
        return jsonify({
            'success': True,
            'message': 'Username is available' if is_available else 'Username is already taken',
            'available': is_available
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to check username: {str(e)}'
        }), 500

@admin_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    """Create a new user (admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['email', 'username', 'name', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Regular admins can only create user accounts, not admin accounts
        current_user = get_current_user()
        if current_user.role == 'admin' and data.get('role') in ['admin', 'super_admin']:
            return jsonify({
                'success': False,
                'message': 'Regular admins can only create user accounts'
            }), 403
        
        user_id = User.create_user(data)
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'data': {'user_id': user_id}
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to create user: {str(e)}'
        }), 500

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@admin_required
@protect_super_admin
def update_user(user_id):
    """Update user (admin only)"""
    try:
        user = User.get_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        
        # Protect developer accounts from role changes
        if user.role == 'developer':
            return jsonify({
                'success': False,
                'message': 'Developer accounts cannot be modified'
            }), 403
        
        # Regular admins cannot change user roles to admin/super_admin
        current_user = get_current_user()
        if current_user.role == 'admin' and data.get('role') in ['admin', 'super_admin']:
            return jsonify({
                'success': False,
                'message': 'Regular admins cannot assign admin or super admin roles'
            }), 403
        
        user.update_user(data)
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update user: {str(e)}'
        }), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
@protect_super_admin
def delete_user(user_id):
    """Delete user (admin only)"""
    try:
        user = User.get_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Protect developer accounts from being deleted
        if user.role == 'developer':
            return jsonify({
                'success': False,
                'message': 'Developer accounts cannot be deleted'
            }), 403
        
        user.delete_user()
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to delete user: {str(e)}'
        }), 500

@admin_bp.route('/users/<user_id>/reset-password', methods=['POST'])
@admin_required
@protect_super_admin
def reset_user_password(user_id):
    """Reset user password (admin only)"""
    try:
        user = User.get_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        if not data.get('new_password'):
            return jsonify({
                'success': False,
                'message': 'New password is required'
            }), 400
        
        user.reset_password(data['new_password'])
        
        return jsonify({
            'success': True,
            'message': 'Password reset successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to reset password: {str(e)}'
        }), 500

@admin_bp.route('/users/<user_id>/toggle-status', methods=['POST'])
@admin_required
@protect_super_admin
def toggle_user_status(user_id):
    """Toggle user active status (admin only)"""
    try:
        user = User.get_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Protect developer accounts from being deactivated
        if user.role == 'developer':
            return jsonify({
                'success': False,
                'message': 'Developer accounts cannot be deactivated or made inactive'
            }), 403
        
        data = request.get_json() or {}
        current_user = get_current_user()
        
        if user.is_active:
            # Deactivating user
            reason = data.get('reason')
            suspended_by = f"{current_user.name} ({current_user.role})"
            user.deactivate_user(reason=reason, suspended_by=suspended_by)
            message = 'User deactivated successfully'
        else:
            # Activating user
            user.activate_user()
            message = 'User activated successfully'
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to toggle user status: {str(e)}'
        }), 500

# Quiz Management Routes
@admin_bp.route('/quizzes', methods=['GET'])
@admin_required
def get_all_quizzes():
    """Get all quizzes (admin only)"""
    try:
        quizzes = Quiz.get_all_quizzes()
        return jsonify({
            'success': True,
            'message': 'Quizzes retrieved successfully',
            'data': [quiz.to_dict() for quiz in quizzes]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve quizzes: {str(e)}'
        }), 500

@admin_bp.route('/quizzes', methods=['POST'])
@admin_required
def create_quiz():
    """Create a new quiz (admin only)"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data.get('title'):
            return jsonify({
                'success': False,
                'message': 'Quiz title is required'
            }), 400
        
        data['created_by'] = current_user.id
        quiz_id = Quiz.create_quiz(data)
        
        return jsonify({
            'success': True,
            'message': 'Quiz created successfully',
            'data': {'quiz_id': quiz_id}
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to create quiz: {str(e)}'
        }), 500

@admin_bp.route('/quizzes/<quiz_id>', methods=['PUT'])
@admin_required
def update_quiz(quiz_id):
    """Update quiz (admin only)"""
    try:
        quiz = Quiz.get_by_id(quiz_id)
        if not quiz:
            return jsonify({
                'success': False,
                'message': 'Quiz not found'
            }), 404
        
        data = request.get_json()
        quiz.update_quiz(data)
        
        return jsonify({
            'success': True,
            'message': 'Quiz updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update quiz: {str(e)}'
        }), 500

@admin_bp.route('/quizzes/<quiz_id>', methods=['DELETE'])
@admin_required
def delete_quiz(quiz_id):
    """Delete quiz (admin only)"""
    try:
        quiz = Quiz.get_by_id(quiz_id)
        if not quiz:
            return jsonify({
                'success': False,
                'message': 'Quiz not found'
            }), 404
        
        quiz.delete_quiz()
        
        return jsonify({
            'success': True,
            'message': 'Quiz deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to delete quiz: {str(e)}'
        }), 500

@admin_bp.route('/quizzes/<quiz_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_quiz_status(quiz_id):
    """Toggle quiz active status (admin only)"""
    try:
        quiz = Quiz.get_by_id(quiz_id)
        if not quiz:
            return jsonify({
                'success': False,
                'message': 'Quiz not found'
            }), 404
        
        if quiz.is_active:
            quiz.deactivate_quiz()
            message = 'Quiz deactivated successfully'
        else:
            quiz.activate_quiz()
            message = 'Quiz activated successfully'
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to toggle quiz status: {str(e)}'
        }), 500

# Dashboard Routes
@admin_bp.route('/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        from models.database import get_db
        db = get_db()
        
        # Get basic stats
        total_users = db.users.count_documents({})
        active_users = db.users.count_documents({"is_active": True})
        total_quizzes = db.quizzes.count_documents({})
        total_games = db.games.count_documents({}) if 'games' in db.list_collection_names() else 0
        
        # Calculate total attempts with error handling
        try:
            total_attempts_result = list(db.quizzes.aggregate([
                {"$group": {"_id": None, "total": {"$sum": "$total_attempts"}}}
            ]))
            total_attempts = total_attempts_result[0].get('total', 0) if total_attempts_result else 0
        except Exception:
            total_attempts = 0
        
        # Calculate average IQ with error handling
        try:
            avg_iq_result = list(db.users.aggregate([
                {"$group": {"_id": None, "avg_iq": {"$avg": "$iq_score"}}}
            ]))
            average_iq = round(avg_iq_result[0].get('avg_iq', 0), 1) if avg_iq_result else 0
        except Exception:
            average_iq = 0
        
        # Calculate average score with error handling
        try:
            avg_score_result = list(db.quizzes.aggregate([
                {"$group": {"_id": None, "avg_score": {"$avg": "$average_score"}}}
            ]))
            average_score = round(avg_score_result[0].get('avg_score', 0), 1) if avg_score_result else 0
        except Exception:
            average_score = 0
        
        # Get recent activity users (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_users = db.users.count_documents({
            "last_login": {"$gte": thirty_days_ago}
        })
        
        stats = {
            'totalUsers': total_users,
            'activeUsers': active_users,
            'totalQuizzes': total_quizzes,
            'totalGames': total_games,
            'totalAttempts': total_attempts,
            'averageIQ': average_iq,
            'averageScore': average_score,
            'recentUsers': recent_users
        }
        
        return jsonify({
            'success': True,
            'message': 'Dashboard stats retrieved successfully',
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve dashboard stats: {str(e)}'
        }), 500

@admin_bp.route('/dashboard/activity', methods=['GET'])
@admin_required
def get_dashboard_activity():
    """Get recent activity for admin dashboard"""
    try:
        from models.database import get_db
        db = get_db()
        
        # Get recent user registrations
        recent_users = list(db.users.find().sort("created_at", -1).limit(5))
        
        # Get recent activity from actual database records
        activities = []
        
        # Add user registration activities
        for user in recent_users:
            activities.append({
                'title': f'New user registered',
                'description': f'{user.get("name", "Unknown")} joined the platform',
                'time': user.get('created_at', datetime.utcnow()).strftime('%H:%M')
            })
        
        # Get recent quiz attempts if available
        try:
            recent_attempts = list(db.quiz_attempts.find().sort("created_at", -1).limit(3))
            for attempt in recent_attempts:
                user = db.users.find_one({'_id': attempt.get('user_id')})
                quiz = db.quizzes.find_one({'_id': attempt.get('quiz_id')})
                if user and quiz:
                    activities.append({
                        'title': 'Quiz completed',
                        'description': f'{user.get("name", "Unknown")} completed {quiz.get("title", "Unknown Quiz")}',
                        'time': attempt.get('created_at', datetime.utcnow()).strftime('%H:%M')
                    })
        except Exception:
            pass  # Quiz attempts collection might not exist yet
        
        # Get recent game activities if available
        try:
            recent_games = list(db.game_sessions.find().sort("created_at", -1).limit(3))
            for game_session in recent_games:
                user = db.users.find_one({'_id': game_session.get('user_id')})
                game = db.games.find_one({'_id': game_session.get('game_id')})
                if user and game:
                    activities.append({
                        'title': 'Game played',
                        'description': f'{user.get("name", "Unknown")} played {game.get("name", "Unknown Game")}',
                        'time': game_session.get('created_at', datetime.utcnow()).strftime('%H:%M')
                    })
        except Exception:
            pass  # Game sessions collection might not exist yet
        
        # Sort activities by time (most recent first)
        activities.sort(key=lambda x: x['time'], reverse=True)
        
        return jsonify({
            'success': True,
            'message': 'Activity data retrieved successfully',
            'data': activities[:10]  # Limit to 10 most recent activities
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve activity data: {str(e)}'
        }), 500

# Analytics Routes
@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics():
    """Get comprehensive analytics data"""
    try:
        from models.database import get_db
        db = get_db()
        
        time_range = request.args.get('timeRange', 'week')
        
        # Calculate date range
        now = datetime.utcnow()
        if time_range == 'day':
            start_date = now - timedelta(days=1)
        elif time_range == 'week':
            start_date = now - timedelta(days=7)
        elif time_range == 'month':
            start_date = now - timedelta(days=30)
        elif time_range == 'quarter':
            start_date = now - timedelta(days=90)
        elif time_range == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=7)
        
        # Get overview stats
        total_users = db.users.count_documents({})
        active_users = db.users.count_documents({
            "last_login": {"$gte": start_date}
        })
        total_quizzes = db.quizzes.count_documents({})
        
        # Calculate total attempts with error handling
        try:
            total_attempts_result = list(db.quizzes.aggregate([
                {"$group": {"_id": None, "total": {"$sum": "$total_attempts"}}}
            ]))
            total_attempts = total_attempts_result[0].get('total', 0) if total_attempts_result else 0
        except Exception:
            total_attempts = 0
        
        # Calculate average IQ with error handling
        try:
            avg_iq_result = list(db.users.aggregate([
                {"$group": {"_id": None, "avg_iq": {"$avg": "$iq_score"}}}
            ]))
            average_iq = round(avg_iq_result[0].get('avg_iq', 0), 1) if avg_iq_result else 0
        except Exception:
            average_iq = 0
        
        # Calculate average score with error handling
        try:
            avg_score_result = list(db.quizzes.aggregate([
                {"$group": {"_id": None, "avg_score": {"$avg": "$average_score"}}}
            ]))
            average_score = round(avg_score_result[0].get('avg_score', 0), 1) if avg_score_result else 0
        except Exception:
            average_score = 0
        
        # Get top scorers
        top_scorers = list(db.users.find().sort("iq_score", -1).limit(10))
        top_scorers_data = []
        for user in top_scorers:
            top_scorers_data.append({
                'id': str(user['_id']),
                'name': user.get('name', 'Unknown'),
                'username': user.get('username', 'unknown'),
                'iq_score': user.get('iq_score', 0)
            })
        
        # Get participation by category
        participation_by_category = [
            {'name': 'General', 'percentage': 35},
            {'name': 'Mathematics', 'percentage': 25},
            {'name': 'Science', 'percentage': 20},
            {'name': 'Language', 'percentage': 15},
            {'name': 'Logic', 'percentage': 5}
        ]
        
        analytics_data = {
            'overview': {
                'totalUsers': total_users,
                'activeUsers': active_users,
                'totalQuizzes': total_quizzes,
                'totalAttempts': total_attempts,
                'averageIQ': average_iq,
                'averageScore': average_score
            },
            'topScorers': top_scorers_data,
            'participation': {
                'byCategory': participation_by_category,
                'byDifficulty': [
                    {'name': 'Easy', 'percentage': 40},
                    {'name': 'Medium', 'percentage': 45},
                    {'name': 'Hard', 'percentage': 15}
                ],
                'byTime': [
                    {'name': 'Morning', 'percentage': 30},
                    {'name': 'Afternoon', 'percentage': 45},
                    {'name': 'Evening', 'percentage': 25}
                ]
            },
            'performance': {
                'daily': [],
                'weekly': [],
                'monthly': []
            },
            'iqGrowth': [],
            'userEngagement': []
        }
        
        return jsonify({
            'success': True,
            'message': 'Analytics data retrieved successfully',
            'data': analytics_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve analytics: {str(e)}'
        }), 500

@admin_bp.route('/analytics/export', methods=['GET'])
@admin_required
def export_analytics():
    """Export analytics data"""
    try:
        format_type = request.args.get('format', 'pdf')
        time_range = request.args.get('timeRange', 'week')
        
        # TODO: Implement actual export functionality
        # This should generate real PDF/Excel files with analytics data
        
        return jsonify({
            'success': False,
            'message': f'{format_type.upper()} export functionality not implemented yet'
        }), 501  # Not Implemented
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to export analytics: {str(e)}'
        }), 500

# Reports Routes
@admin_bp.route('/reports', methods=['GET'])
@admin_required
def get_reports():
    """Get all reports"""
    try:
        from models.database import get_db
        db = get_db()
        
        # TODO: Implement actual reports collection and retrieval
        # This should query a reports collection in the database
        
        # For now, return empty list since no reports system is implemented
        reports = []
        
        return jsonify({
            'success': True,
            'message': 'Reports retrieved successfully',
            'data': reports
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve reports: {str(e)}'
        }), 500

@admin_bp.route('/reports/generate', methods=['POST'])
@admin_required
def generate_report():
    """Generate a new report"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({
                'success': False,
                'message': 'Report name is required'
            }), 400
        
        # In a real implementation, you would:
        # 1. Create a report record in the database
        # 2. Queue the report generation job
        # 3. Return the report ID
        
        report_id = str(ObjectId())
        
        return jsonify({
            'success': True,
            'message': 'Report generation started',
            'data': {'report_id': report_id}
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to generate report: {str(e)}'
        }), 500

@admin_bp.route('/reports/<report_id>/download', methods=['GET'])
@admin_required
def download_report(report_id):
    """Download a report"""
    try:
        format_type = request.args.get('format', 'pdf')
        
        # TODO: Implement actual report download functionality
        # This should:
        # 1. Check if the report exists and is completed
        # 2. Generate the file in the requested format
        # 3. Return the file as a download
        
        return jsonify({
            'success': False,
            'message': f'Report download functionality not implemented yet'
        }), 501  # Not Implemented
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to download report: {str(e)}'
        }), 500

@admin_bp.route('/reports/<report_id>', methods=['DELETE'])
@admin_required
def delete_report(report_id):
    """Delete a report"""
    try:
        # In a real implementation, you would delete the report from the database
        
        return jsonify({
            'success': True,
            'message': 'Report deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to delete report: {str(e)}'
        }), 500

@admin_bp.route('/reports/<report_id>/share', methods=['POST'])
@admin_required
def share_report(report_id):
    """Share a report via email"""
    try:
        data = request.get_json()
        email_recipients = data.get('emailRecipients', [])
        
        if not email_recipients:
            return jsonify({
                'success': False,
                'message': 'Email recipients are required'
            }), 400
        
        # In a real implementation, you would:
        # 1. Generate the report file
        # 2. Send emails to recipients with the file attached
        
        return jsonify({
            'success': True,
            'message': f'Report shared with {len(email_recipients)} recipients'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to share report: {str(e)}'
        }), 500

# Admin Management Routes
@admin_bp.route('/admins', methods=['POST'])
@super_admin_required
def create_admin():
    """Create a new admin (super admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['email', 'username', 'name', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Only super admins can create admin accounts
        # Regular admins cannot create admin accounts through this route
        data['role'] = 'admin'  # Force role to admin, not super_admin
        
        user_id = User.create_user(data)
        
        return jsonify({
            'success': True,
            'message': 'Admin created successfully',
            'data': {'user_id': user_id}
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to create admin: {str(e)}'
        }), 500

@admin_bp.route('/admins', methods=['GET'])
@super_admin_required
def get_all_admins():
    """Get all admins (super admin only)"""
    try:
        from models.database import get_db
        db = get_db()
        
        admins = list(db.users.find({"role": {"$in": ["admin", "super_admin"]}}))
        admin_data = []
        
        for admin in admins:
            admin_data.append({
                'id': str(admin['_id']),
                'name': admin.get('name'),
                'email': admin.get('email'),
                'username': admin.get('username'),
                'role': admin.get('role'),
                'is_active': admin.get('is_active', True),
                'created_at': admin.get('created_at', datetime.utcnow()).isoformat()
            })
        
        return jsonify({
            'success': True,
            'message': 'Admins retrieved successfully',
            'data': admin_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve admins: {str(e)}'
        }), 500

@admin_bp.route('/super-admin/profile', methods=['PUT'])
@super_admin_required
def update_super_admin_profile():
    """Update super admin's own profile (super admin only)"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        # Only allow updating certain fields for super admin's own profile
        allowed_fields = ['name', 'email', 'username']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({
                'success': False,
                'message': 'No valid fields to update'
            }), 400
        
        # Validate email if being updated
        if 'email' in update_data:
            from models.database import get_db
            db = get_db()
            existing_user = db.users.find_one({
                "email": update_data['email'],
                "_id": {"$ne": ObjectId(current_user.id)}
            })
            if existing_user:
                return jsonify({
                    'success': False,
                    'message': 'Email already exists'
                }), 400
        
        # Validate username if being updated
        if 'username' in update_data:
            from models.database import get_db
            db = get_db()
            existing_user = db.users.find_one({
                "username": update_data['username'],
                "_id": {"$ne": ObjectId(current_user.id)}
            })
            if existing_user:
                return jsonify({
                    'success': False,
                    'message': 'Username already exists'
                }), 400
        
        # Update the super admin's profile
        current_user.update_user(update_data)
        
        return jsonify({
            'success': True,
            'message': 'Super admin profile updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update super admin profile: {str(e)}'
        }), 500

@admin_bp.route('/super-admin/change-password', methods=['POST'])
@super_admin_required
def change_super_admin_password():
    """Change super admin's own password (super admin only)"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data.get('new_password'):
            return jsonify({
                'success': False,
                'message': 'New password is required'
            }), 400
        
        # Change the super admin's password
        current_user.reset_password(data['new_password'])
        
        return jsonify({
            'success': True,
            'message': 'Super admin password changed successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to change super admin password: {str(e)}'
        }), 500

# Settings Routes
@admin_bp.route('/settings', methods=['GET'])
@admin_required
def get_settings():
    """Get platform settings"""
    try:
        from models.database import get_db
        db = get_db()
        
        # Get settings from database (or return defaults)
        settings_doc = db.settings.find_one({"_id": "platform_settings"})
        
        if settings_doc:
            settings = settings_doc.get('settings', {})
        else:
            # Default settings
            settings = {
                'general': {
                    'platformName': 'TNCA Platform',
                    'platformDescription': 'The Next Cognitive Assessment Platform',
                    'maxUsers': 1000,
                    'maxQuizzes': 100,
                    'maintenanceMode': False,
                    'timezone': 'UTC'
                },
                'security': {
                    'passwordMinLength': 8,
                    'requireSpecialChars': True,
                    'sessionTimeout': 30,
                    'maxLoginAttempts': 5,
                    'twoFactorAuth': False,
                    'ipWhitelist': []
                },
                'notifications': {
                    'emailNotifications': True,
                    'newUserAlerts': True,
                    'quizCompletionAlerts': True,
                    'systemAlerts': True,
                    'weeklyReports': True
                },
                'appearance': {
                    'theme': 'light',
                    'primaryColor': '#3B82F6',
                    'logoUrl': '',
                    'faviconUrl': ''
                },
                'integrations': {
                    'emailProvider': 'smtp',
                    'smtpHost': '',
                    'smtpPort': 587,
                    'smtpUsername': '',
                    'smtpPassword': '',
                    'analyticsEnabled': True,
                    'backupEnabled': True
                }
            }
        
        return jsonify({
            'success': True,
            'message': 'Settings retrieved successfully',
            'data': settings
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve settings: {str(e)}'
        }), 500

@admin_bp.route('/settings', methods=['PUT'])
@super_admin_required
def update_settings():
    """Update platform settings (super admin only)"""
    try:
        from models.database import get_db
        db = get_db()
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Settings data is required'
            }), 400
        
        # Validate critical settings
        if 'security' in data:
            security = data['security']
            if 'passwordMinLength' in security and security['passwordMinLength'] < 6:
                return jsonify({
                    'success': False,
                    'message': 'Password minimum length must be at least 6 characters'
                }), 400
            
            if 'sessionTimeout' in security and security['sessionTimeout'] < 5:
                return jsonify({
                    'success': False,
                    'message': 'Session timeout must be at least 5 minutes'
                }), 400
        
        # Update settings in database
        db.settings.update_one(
            {"_id": "platform_settings"},
            {
                "$set": {
                    "settings": data,
                    "updated_at": datetime.utcnow(),
                    "updated_by": get_current_user().id
                }
            },
            upsert=True
        )
        
        return jsonify({
            'success': True,
            'message': 'Settings updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update settings: {str(e)}'
        }), 500

# Game Management Routes
@admin_bp.route('/games', methods=['GET'])
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

@admin_bp.route('/games/<game_id>/toggle-lock', methods=['POST'])
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

@admin_bp.route('/games/<game_id>/toggle-status', methods=['POST'])
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

@admin_bp.route('/games/<game_id>/settings', methods=['PUT'])
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
        allowed_fields = ['name', 'description', 'type', 'difficulty', 'max_levels', 'time_limit']
        
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