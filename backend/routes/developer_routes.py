from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from middleware.auth_middleware import developer_required, get_current_user
from models.user import User
from models.database import get_db
from models.game import Game
from models.tournament import Tournament
from models.quiz import Quiz
from models.content import Content
from models.match import Match
from datetime import datetime, timedelta
import os
import json
import subprocess
import platform
import psutil
import pymongo
from bson import ObjectId

developer_bp = Blueprint('developer', __name__)

@developer_bp.route('/dashboard', methods=['GET'])
@developer_required
def developer_dashboard():
    """Get developer dashboard overview"""
    try:
        db = get_db()
        
        # System statistics
        total_users = db.users.count_documents({})
        active_users = db.users.count_documents({"is_active": True})
        total_games = db.games.count_documents({})
        total_tournaments = db.tournaments.count_documents({})
        total_quizzes = db.quizzes.count_documents({})
        total_matches = db.matches.count_documents({})
        
        # Recent activity
        recent_users = list(db.users.find().sort("created_at", -1).limit(5))
        recent_games = list(db.games.find().sort("created_at", -1).limit(5))
        recent_tournaments = list(db.tournaments.find().sort("created_at", -1).limit(5))
        
        # System health
        system_info = {
            "platform": platform.system(),
            "platform_version": platform.version(),
            "python_version": platform.python_version(),
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total,
            "memory_available": psutil.virtual_memory().available,
            "disk_usage": psutil.disk_usage('/').percent
        }
        
        return jsonify({
            'success': True,
            'data': {
                'statistics': {
                    'total_users': total_users,
                    'active_users': active_users,
                    'total_games': total_games,
                    'total_tournaments': total_tournaments,
                    'total_quizzes': total_quizzes,
                    'total_matches': total_matches
                },
                'recent_activity': {
                    'users': [User(user).to_dict() for user in recent_users],
                    'games': recent_games,
                    'tournaments': recent_tournaments
                },
                'system_info': system_info
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get dashboard data: {str(e)}'
        }), 500

@developer_bp.route('/system/status', methods=['GET'])
@developer_required
def system_status():
    """Get detailed system status"""
    try:
        # Database status
        db = get_db()
        db_stats = db.command("dbStats")
        
        # System resources
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Process information
        current_process = psutil.Process()
        
        system_status = {
            "database": {
                "collections": db_stats.get("collections", 0),
                "data_size": db_stats.get("dataSize", 0),
                "storage_size": db_stats.get("storageSize", 0),
                "indexes": db_stats.get("indexes", 0),
                "index_size": db_stats.get("indexSize", 0)
            },
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_used": memory.used,
                "memory_total": memory.total,
                "disk_percent": disk.percent,
                "disk_used": disk.used,
                "disk_total": disk.total
            },
            "process": {
                "pid": current_process.pid,
                "memory_info": current_process.memory_info()._asdict(),
                "cpu_percent": current_process.cpu_percent(),
                "create_time": current_process.create_time()
            }
        }
        
        return jsonify({
            'success': True,
            'data': system_status
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get system status: {str(e)}'
        }), 500

@developer_bp.route('/users/manage', methods=['GET'])
@developer_required
def get_all_users_developer():
    """Get all users with developer privileges"""
    try:
        users = User.get_all_users()
        return jsonify({
            'success': True,
            'data': [user.to_dict() for user in users]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get users: {str(e)}'
        }), 500

@developer_bp.route('/users/<user_id>/modify', methods=['PUT'])
@developer_required
def modify_user_developer(user_id):
    """Modify any user with developer privileges"""
    try:
        data = request.get_json()
        user = User.get_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Developer can modify any field including role
        allowed_fields = ['name', 'email', 'username', 'is_active', 'role', 'iq_score', 'badge_level']
        update_fields = {k: v for k, v in data.items() if k in allowed_fields}
        
        if update_fields:
            user.update_user(update_fields)
            
        return jsonify({
            'success': True,
            'message': 'User modified successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to modify user: {str(e)}'
        }), 500

@developer_bp.route('/users/<user_id>/delete', methods=['DELETE'])
@developer_required
def delete_user_developer(user_id):
    """Delete any user with developer privileges"""
    try:
        user = User.get_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Developer can delete any user
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

@developer_bp.route('/database/backup', methods=['POST'])
@developer_required
def backup_database():
    """Create database backup"""
    try:
        # This is a simplified backup - in production, use proper backup tools
        db = get_db()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Get all collections
        collections = db.list_collection_names()
        backup_data = {}
        
        for collection in collections:
            backup_data[collection] = list(db[collection].find({}))
        
        # Save backup to file
        backup_dir = "backups"
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
            
        backup_file = f"{backup_dir}/backup_{timestamp}.json"
        with open(backup_file, 'w') as f:
            json.dump(backup_data, f, default=str)
        
        return jsonify({
            'success': True,
            'message': 'Database backup created successfully',
            'data': {
                'backup_file': backup_file,
                'timestamp': timestamp
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to create backup: {str(e)}'
        }), 500

@developer_bp.route('/database/backups', methods=['GET'])
@developer_required
def get_backups():
    """Get list of available backups"""
    try:
        backup_dir = 'backups'
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        backups = []
        for filename in os.listdir(backup_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(backup_dir, filename)
                file_stat = os.stat(file_path)
                backups.append({
                    'id': len(backups) + 1,
                    'filename': filename,
                    'size': f"{file_stat.st_size / (1024*1024):.1f} MB",
                    'created_at': datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
                    'status': 'completed'
                })
        
        # Sort by creation date (newest first)
        backups.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            'success': True,
            'data': backups
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get backups: {str(e)}'
        }), 500

@developer_bp.route('/database/restore', methods=['POST'])
@developer_required
def restore_database():
    """Restore database from backup"""
    try:
        data = request.get_json()
        backup_file = data.get('backup_file')
        
        if not backup_file:
            return jsonify({
                'success': False,
                'message': 'Backup file not specified'
            }), 400
        
        backup_path = os.path.join('backups', backup_file)
        if not os.path.exists(backup_path):
            return jsonify({
                'success': False,
                'message': 'Backup file not found'
            }), 404
        
        db = get_db()
        
        with open(backup_path, 'r') as f:
            backup_data = json.load(f)
        
        # Clear existing data and restore
        for collection_name, documents in backup_data.items():
            db[collection_name].delete_many({})
            if documents:
                db[collection_name].insert_many(documents)
        
        return jsonify({
            'success': True,
            'message': 'Database restored successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to restore database: {str(e)}'
        }), 500

@developer_bp.route('/system/restart', methods=['POST'])
@developer_required
def restart_system():
    """Restart the system (simulated)"""
    try:
        # In a real application, this would restart the server
        # For now, we'll just return a success message
        return jsonify({
            'success': True,
            'message': 'System restart initiated'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to restart system: {str(e)}'
        }), 500

@developer_bp.route('/logs', methods=['GET'])
@developer_required
def get_system_logs():
    """Get system logs"""
    try:
        # This is a simplified log retrieval
        # In production, use proper logging systems
        logs = []
        
        # Simulate log entries
        log_entries = [
            {"timestamp": datetime.now().isoformat(), "level": "INFO", "message": "System running normally", "source": "system", "details": "All systems operational"},
            {"timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(), "level": "INFO", "message": "Database connection established", "source": "database", "details": "MongoDB connection successful"},
            {"timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(), "level": "WARNING", "message": "High memory usage detected", "source": "monitor", "details": "Memory usage at 85%"},
            {"timestamp": (datetime.now() - timedelta(minutes=15)).isoformat(), "level": "INFO", "message": "User login successful", "source": "auth", "details": "User ID: 12345"},
            {"timestamp": (datetime.now() - timedelta(minutes=20)).isoformat(), "level": "ERROR", "message": "Failed to process payment", "source": "payment", "details": "Payment gateway timeout"},
            {"timestamp": (datetime.now() - timedelta(minutes=25)).isoformat(), "level": "INFO", "message": "Backup completed", "source": "backup", "details": "Database backup successful"},
            {"timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(), "level": "WARNING", "message": "Slow query detected", "source": "database", "details": "Query took 2.5 seconds"},
            {"timestamp": (datetime.now() - timedelta(minutes=35)).isoformat(), "level": "INFO", "message": "Email sent successfully", "source": "email", "details": "Welcome email to user@example.com"},
            {"timestamp": (datetime.now() - timedelta(minutes=40)).isoformat(), "level": "ERROR", "message": "File upload failed", "source": "upload", "details": "File size exceeds limit"},
            {"timestamp": (datetime.now() - timedelta(minutes=45)).isoformat(), "level": "INFO", "message": "Cache cleared", "source": "cache", "details": "Redis cache cleared successfully"}
        ]
        
        return jsonify({
            'success': True,
            'data': log_entries
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get logs: {str(e)}'
        }), 500

@developer_bp.route('/logs/export', methods=['GET'])
@developer_required
def export_logs():
    """Export system logs"""
    try:
        # Get logs data
        log_entries = [
            {"timestamp": datetime.now().isoformat(), "level": "INFO", "message": "System running normally", "source": "system", "details": "All systems operational"},
            {"timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(), "level": "INFO", "message": "Database connection established", "source": "database", "details": "MongoDB connection successful"},
            {"timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(), "level": "WARNING", "message": "High memory usage detected", "source": "monitor", "details": "Memory usage at 85%"},
            {"timestamp": (datetime.now() - timedelta(minutes=15)).isoformat(), "level": "INFO", "message": "User login successful", "source": "auth", "details": "User ID: 12345"},
            {"timestamp": (datetime.now() - timedelta(minutes=20)).isoformat(), "level": "ERROR", "message": "Failed to process payment", "source": "payment", "details": "Payment gateway timeout"},
            {"timestamp": (datetime.now() - timedelta(minutes=25)).isoformat(), "level": "INFO", "message": "Backup completed", "source": "backup", "details": "Database backup successful"},
            {"timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(), "level": "WARNING", "message": "Slow query detected", "source": "database", "details": "Query took 2.5 seconds"},
            {"timestamp": (datetime.now() - timedelta(minutes=35)).isoformat(), "level": "INFO", "message": "Email sent successfully", "source": "email", "details": "Welcome email to user@example.com"},
            {"timestamp": (datetime.now() - timedelta(minutes=40)).isoformat(), "level": "ERROR", "message": "File upload failed", "source": "upload", "details": "File size exceeds limit"},
            {"timestamp": (datetime.now() - timedelta(minutes=45)).isoformat(), "level": "INFO", "message": "Cache cleared", "source": "cache", "details": "Redis cache cleared successfully"}
        ]
        
        from flask import Response
        return Response(
            json.dumps(log_entries, default=str, indent=2),
            mimetype='application/json',
            headers={'Content-Disposition': f'attachment; filename=system_logs_{datetime.now().strftime("%Y%m%d")}.json'}
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to export logs: {str(e)}'
        }), 500

@developer_bp.route('/analytics/advanced', methods=['GET'])
@developer_required
def advanced_analytics():
    """Get advanced analytics data"""
    try:
        db = get_db()
        
        # User analytics
        user_roles = list(db.users.aggregate([
            {"$group": {"_id": "$role", "count": {"$sum": 1}}}
        ]))
        
        # Game analytics
        game_stats = list(db.games.aggregate([
            {"$group": {"_id": "$game_type", "count": {"$sum": 1}}}
        ]))
        
        # Performance analytics
        performance_data = list(db.users.aggregate([
            {"$group": {
                "_id": "$badge_level",
                "avg_iq": {"$avg": "$iq_score"},
                "count": {"$sum": 1}
            }}
        ]))
        
        return jsonify({
            'success': True,
            'data': {
                'user_roles': user_roles,
                'game_stats': game_stats,
                'performance_data': performance_data
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get analytics: {str(e)}'
        }), 500

@developer_bp.route('/analytics/export', methods=['GET'])
@developer_required
def export_analytics():
    """Export analytics data as JSON"""
    try:
        db = get_db()
        
        # Get comprehensive analytics data
        analytics_data = {
            'exported_at': datetime.now().isoformat(),
            'user_roles': list(db.users.aggregate([
                {"$group": {"_id": "$role", "count": {"$sum": 1}}}
            ])),
            'game_stats': list(db.games.aggregate([
                {"$group": {"_id": "$game_type", "count": {"$sum": 1}}}
            ])),
            'performance_data': list(db.users.aggregate([
                {"$group": {
                    "_id": "$badge_level",
                    "avg_iq": {"$avg": "$iq_score"},
                    "count": {"$sum": 1}
                }}
            ])),
            'total_users': db.users.count_documents({}),
            'total_games': db.games.count_documents({}),
            'total_tournaments': db.tournaments.count_documents({}),
            'total_quizzes': db.quizzes.count_documents({})
        }
        
        from flask import Response
        return Response(
            json.dumps(analytics_data, default=str, indent=2),
            mimetype='application/json',
            headers={'Content-Disposition': f'attachment; filename=analytics_{datetime.now().strftime("%Y%m%d")}.json'}
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to export analytics: {str(e)}'
        }), 500

@developer_bp.route('/security/audit', methods=['GET'])
@developer_required
def security_audit():
    """Perform security audit"""
    try:
        db = get_db()
        
        # Check for inactive users
        inactive_users = db.users.count_documents({"is_active": False})
        
        # Check for users with default passwords (simplified)
        default_password_users = 0  # In real app, check for weak passwords
        
        # Check for suspicious activity
        recent_logins = list(db.users.find().sort("last_login", -1).limit(10))
        
        audit_results = {
            "inactive_users": inactive_users,
            "default_password_users": default_password_users,
            "recent_logins": [User(user).to_dict() for user in recent_logins],
            "security_score": 85  # Simplified security score
        }
        
        return jsonify({
            'success': True,
            'data': audit_results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to perform security audit: {str(e)}'
        }), 500 