from flask import Blueprint, request, jsonify, send_file
from models.user import User
from models.quiz import Quiz
from models.content import Content
from middleware.auth_middleware import admin_required, get_current_user
from models.database import get_db
from datetime import datetime, timedelta
import pandas as pd
import io
import json
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from io import BytesIO
import base64

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/performance', methods=['GET'])
@admin_required
def get_performance_analytics():
    """Get overall performance analytics"""
    try:
        db = get_db()
        
        # Get basic statistics
        total_users = db.users.count_documents({})
        active_users = db.users.count_documents({"is_active": True})
        total_quizzes = db.quizzes.count_documents({})
        total_quiz_attempts = db.quiz_attempts.count_documents({})
        total_game_scores = db.game_scores.count_documents({})
        
        # Get average IQ score
        avg_iq = db.users.aggregate([
            {"$group": {"_id": None, "avg_iq": {"$avg": "$iq_score"}}}
        ]).next().get('avg_iq', 0)
        
        # Get performance by category
        quiz_categories = db.quizzes.aggregate([
            {"$group": {"_id": "$category", "count": {"$sum": 1}, "avg_score": {"$avg": "$average_score"}}}
        ])
        
        category_stats = []
        for category in quiz_categories:
            category_stats.append({
                "category": category["_id"],
                "quiz_count": category["count"],
                "avg_score": category["avg_score"]
            })
        
        # Get recent activity
        recent_attempts = list(db.quiz_attempts.find().sort("created_at", -1).limit(10))
        recent_games = list(db.game_scores.find().sort("completed_at", -1).limit(10))
        
        return jsonify({
            'success': True,
            'message': 'Performance analytics retrieved successfully',
            'data': {
                'total_users': total_users,
                'active_users': active_users,
                'total_quizzes': total_quizzes,
                'total_quiz_attempts': total_quiz_attempts,
                'total_game_scores': total_game_scores,
                'average_iq': round(avg_iq, 2),
                'category_stats': category_stats,
                'recent_attempts': recent_attempts,
                'recent_games': recent_games
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get performance analytics: {str(e)}'
        }), 500

@analytics_bp.route('/iq-growth', methods=['GET'])
@admin_required
def get_iq_growth_analytics():
    """Get IQ growth analytics for all users"""
    try:
        db = get_db()
        
        # Get IQ growth data for the last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Get all users with their performance history
        users = list(db.users.find({
            "performance_history": {"$exists": True, "$ne": []}
        }))
        
        iq_growth_data = []
        for user in users:
            performance_history = user.get('performance_history', [])
            if performance_history:
                # Get recent performance entries
                recent_performance = [
                    entry for entry in performance_history 
                    if entry.get('date') and entry['date'] >= thirty_days_ago
                ]
                
                if recent_performance:
                    # Sort by date
                    recent_performance.sort(key=lambda x: x['date'])
                    
                    # Calculate IQ growth
                    initial_iq = recent_performance[0].get('iq_score', 100)
                    final_iq = recent_performance[-1].get('iq_score', 100)
                    iq_growth = final_iq - initial_iq
                    
                    iq_growth_data.append({
                        'user_id': str(user['_id']),
                        'user_name': user.get('name', 'Unknown'),
                        'initial_iq': initial_iq,
                        'final_iq': final_iq,
                        'iq_growth': iq_growth,
                        'attempts_count': len(recent_performance),
                        'performance_trend': [
                            {
                                'date': entry['date'].strftime('%Y-%m-%d'),
                                'iq_score': entry.get('iq_score', 100),
                                'raw_score': entry.get('raw_score', 0)
                            }
                            for entry in recent_performance
                        ]
                    })
        
        # Sort by IQ growth
        iq_growth_data.sort(key=lambda x: x['iq_growth'], reverse=True)
        
        return jsonify({
            'success': True,
            'message': 'IQ growth analytics retrieved successfully',
            'data': {
                'iq_growth_data': iq_growth_data,
                'total_users_tracked': len(iq_growth_data),
                'average_iq_growth': sum(item['iq_growth'] for item in iq_growth_data) / len(iq_growth_data) if iq_growth_data else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get IQ growth analytics: {str(e)}'
        }), 500

@analytics_bp.route('/performance-heatmap', methods=['GET'])
@admin_required
def get_performance_heatmap():
    """Get performance heatmap data"""
    try:
        db = get_db()
        
        # Get performance data for heatmap
        # Group by hour of day and day of week
        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$gte": datetime.utcnow() - timedelta(days=30)
                    }
                }
            },
            {
                "$addFields": {
                    "hour": {"$hour": "$created_at"},
                    "dayOfWeek": {"$dayOfWeek": "$created_at"}
                }
            },
            {
                "$group": {
                    "_id": {
                        "hour": "$hour",
                        "dayOfWeek": "$dayOfWeek"
                    },
                    "count": {"$sum": 1},
                    "avg_score": {"$avg": "$percentage"}
                }
            }
        ]
        
        heatmap_data = list(db.quiz_attempts.aggregate(pipeline))
        
        # Convert to heatmap format
        heatmap_matrix = [[0 for _ in range(24)] for _ in range(7)]
        
        for item in heatmap_data:
            day = item['_id']['dayOfWeek'] - 1  # Convert to 0-based index
            hour = item['_id']['hour']
            heatmap_matrix[day][hour] = item['avg_score']
        
        return jsonify({
            'success': True,
            'message': 'Performance heatmap retrieved successfully',
            'data': {
                'heatmap_matrix': heatmap_matrix,
                'max_value': max(max(row) for row in heatmap_matrix) if heatmap_matrix else 0,
                'min_value': min(min(row) for row in heatmap_matrix) if heatmap_matrix else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get performance heatmap: {str(e)}'
        }), 500

@analytics_bp.route('/leaderboard', methods=['GET'])
@admin_required
def get_filtered_leaderboard():
    """Get filtered leaderboard data"""
    try:
        db = get_db()
        
        # Get filter parameters
        quiz_id = request.args.get('quiz_id')
        game_type = request.args.get('game_type')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        limit = int(request.args.get('limit', 50))
        
        # Build query based on filters
        query = {}
        
        if quiz_id:
            query['quiz_id'] = quiz_id
        if game_type:
            query['game_type'] = game_type
        if date_from:
            query['created_at'] = query.get('created_at', {})
            query['created_at']['$gte'] = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
        if date_to:
            query['created_at'] = query.get('created_at', {})
            query['created_at']['$lte'] = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
        
        # Get leaderboard data
        if quiz_id:
            # Quiz leaderboard
            pipeline = [
                {"$match": query},
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "user_id",
                        "foreignField": "_id",
                        "as": "user"
                    }
                },
                {"$unwind": "$user"},
                {
                    "$group": {
                        "_id": "$user_id",
                        "user_name": {"$first": "$user.name"},
                        "username": {"$first": "$user.username"},
                        "best_score": {"$max": "$percentage"},
                        "attempts": {"$sum": 1},
                        "avg_time": {"$avg": "$time_taken"}
                    }
                },
                {"$sort": {"best_score": -1}},
                {"$limit": limit}
            ]
            leaderboard_data = list(db.quiz_attempts.aggregate(pipeline))
        elif game_type:
            # Game leaderboard
            pipeline = [
                {"$match": query},
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "user_id",
                        "foreignField": "_id",
                        "as": "user"
                    }
                },
                {"$unwind": "$user"},
                {
                    "$group": {
                        "_id": "$user_id",
                        "user_name": {"$first": "$user.name"},
                        "username": {"$first": "$user.username"},
                        "best_score": {"$max": "$score"},
                        "attempts": {"$sum": 1},
                        "avg_time": {"$avg": "$time_taken"}
                    }
                },
                {"$sort": {"best_score": -1}},
                {"$limit": limit}
            ]
            leaderboard_data = list(db.game_scores.aggregate(pipeline))
        else:
            # Overall IQ leaderboard
            leaderboard_data = list(db.users.find().sort("iq_score", -1).limit(limit))
            leaderboard_data = [
                {
                    "user_name": user.get('name', 'Unknown'),
                    "username": user.get('username', 'unknown'),
                    "iq_score": user.get('iq_score', 0),
                    "badge_level": user.get('badge_level', 'Novice Cubist')
                }
                for user in leaderboard_data
            ]
        
        return jsonify({
            'success': True,
            'message': 'Leaderboard data retrieved successfully',
            'data': {
                'leaderboard': leaderboard_data,
                'filters_applied': {
                    'quiz_id': quiz_id,
                    'game_type': game_type,
                    'date_from': date_from,
                    'date_to': date_to
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get leaderboard data: {str(e)}'
        }), 500

@analytics_bp.route('/export/<export_type>', methods=['GET'])
@admin_required
def export_data(export_type):
    """Export data in various formats"""
    try:
        db = get_db()
        
        if export_type == 'users':
            # Export user data
            users = list(db.users.find())
            data = []
            for user in users:
                data.append({
                    'ID': str(user['_id']),
                    'Name': user.get('name', ''),
                    'Email': user.get('email', ''),
                    'Username': user.get('username', ''),
                    'Role': user.get('role', ''),
                    'IQ Score': user.get('iq_score', 0),
                    'Badge Level': user.get('badge_level', ''),
                    'Total Quizzes': user.get('total_quizzes', 0),
                    'Total Games': user.get('total_games', 0),
                    'Is Active': user.get('is_active', True),
                    'Created At': user.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S') if user.get('created_at') else '',
                    'Last Login': user.get('last_login', '').strftime('%Y-%m-%d %H:%M:%S') if user.get('last_login') else ''
                })
            
            df = pd.DataFrame(data)
            
        elif export_type == 'quiz_results':
            # Export quiz results
            attempts = list(db.quiz_attempts.find())
            data = []
            for attempt in attempts:
                quiz = Quiz.get_by_id(attempt['quiz_id'])
                user = User.get_by_id(attempt['user_id'])
                data.append({
                    'Attempt ID': str(attempt['_id']),
                    'Quiz Title': quiz.title if quiz else 'Unknown',
                    'User Name': user.name if user else 'Unknown',
                    'Score': attempt.get('score', 0),
                    'Percentage': attempt.get('percentage', 0),
                    'Time Taken (seconds)': attempt.get('time_taken', 0),
                    'Status': attempt.get('status', ''),
                    'Created At': attempt.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S') if attempt.get('created_at') else ''
                })
            
            df = pd.DataFrame(data)
            
        elif export_type == 'iq_analytics':
            # Export IQ analytics
            users = list(db.users.find({"performance_history": {"$exists": True, "$ne": []}}))
            data = []
            for user in users:
                performance_history = user.get('performance_history', [])
                if performance_history:
                    for entry in performance_history:
                        data.append({
                            'User ID': str(user['_id']),
                            'User Name': user.get('name', 'Unknown'),
                            'Date': entry.get('date', '').strftime('%Y-%m-%d %H:%M:%S') if entry.get('date') else '',
                            'Raw Score': entry.get('raw_score', 0),
                            'IQ Score': entry.get('iq_score', 0),
                            'Badge Level': entry.get('badge_level', ''),
                            'Quiz Difficulty': entry.get('quiz_difficulty', ''),
                            'Z Score': entry.get('z_score', 0)
                        })
            
            df = pd.DataFrame(data)
            
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid export type'
            }), 400
        
        # Create Excel file
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Data', index=False)
        
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'{export_type}_export_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.xlsx'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to export data: {str(e)}'
        }), 500

@analytics_bp.route('/daily-stats', methods=['GET'])
@admin_required
def get_daily_stats():
    """Get daily statistics for the last 30 days"""
    try:
        db = get_db()
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        # Get daily user registrations
        daily_registrations = list(db.users.aggregate([
            {"$match": {"created_at": {"$gte": start_date, "$lte": end_date}}},
            {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}, "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]))
        
        # Get daily quiz attempts
        daily_quiz_attempts = list(db.quiz_attempts.aggregate([
            {"$match": {"created_at": {"$gte": start_date, "$lte": end_date}}},
            {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}, "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]))
        
        # Get daily game scores
        daily_game_scores = list(db.game_scores.aggregate([
            {"$match": {"completed_at": {"$gte": start_date, "$lte": end_date}}},
            {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$completed_at"}}, "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]))
        
        # Get daily average IQ scores
        daily_avg_iq = list(db.users.aggregate([
            {"$match": {"performance_history": {"$exists": True, "$ne": []}}},
            {"$unwind": "$performance_history"},
            {"$match": {"performance_history.date": {"$gte": start_date, "$lte": end_date}}},
            {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$performance_history.date"}}, "avg_iq": {"$avg": "$performance_history.iq_score"}}},
            {"$sort": {"_id": 1}}
        ]))
        
        return jsonify({
            'success': True,
            'message': 'Daily statistics retrieved successfully',
            'data': {
                'daily_registrations': daily_registrations,
                'daily_quiz_attempts': daily_quiz_attempts,
                'daily_game_scores': daily_game_scores,
                'daily_avg_iq': daily_avg_iq
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get daily statistics: {str(e)}'
        }), 500

def calculate_performance_trends(quiz_attempts, game_scores):
    """Calculate performance trends over time"""
    trends = {
        'quiz_performance': [],
        'game_performance': [],
        'iq_progression': []
    }
    
    # Quiz performance trend
    for attempt in quiz_attempts:
        if attempt.get('percentage'):
            trends['quiz_performance'].append({
                'date': attempt.get('created_at', '').strftime('%Y-%m-%d') if attempt.get('created_at') else '',
                'score': attempt.get('percentage', 0)
            })
    
    # Game performance trend
    for score in game_scores:
        trends['game_performance'].append({
            'date': score.get('completed_at', '').strftime('%Y-%m-%d') if score.get('completed_at') else '',
            'score': score.get('score', 0)
        })
    
    return trends 