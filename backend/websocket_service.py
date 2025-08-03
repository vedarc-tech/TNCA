from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
from models.database import get_db
from models.user import User
from models.game import Game
from models.tournament import Tournament
from datetime import datetime
import json

socketio = SocketIO(cors_allowed_origins="*")

# Store active game sessions
active_sessions = {}
active_tournaments = {}

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to TNCA Game Server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'Client disconnected: {request.sid}')
    # Clean up any active sessions
    for session_id, session in active_sessions.items():
        if session.get('socket_id') == request.sid:
            del active_sessions[session_id]
            break

@socketio.on('join_game_session')
def handle_join_game_session(data):
    """Join a game session room"""
    session_id = data.get('session_id')
    user_id = data.get('user_id')
    
    if session_id:
        join_room(session_id)
        active_sessions[session_id] = {
            'socket_id': request.sid,
            'user_id': user_id,
            'game_id': data.get('game_id'),
            'level_id': data.get('level_id'),
            'started_at': datetime.utcnow()
        }
        emit('joined_session', {'session_id': session_id, 'message': 'Joined game session'})

@socketio.on('leave_game_session')
def handle_leave_game_session(data):
    """Leave a game session room"""
    session_id = data.get('session_id')
    if session_id:
        leave_room(session_id)
        if session_id in active_sessions:
            del active_sessions[session_id]
        emit('left_session', {'session_id': session_id, 'message': 'Left game session'})

@socketio.on('join_tournament')
def handle_join_tournament(data):
    """Join a tournament room"""
    tournament_id = data.get('tournament_id')
    user_id = data.get('user_id')
    
    if tournament_id:
        room_name = f'tournament_{tournament_id}'
        join_room(room_name)
        emit('joined_tournament', {
            'tournament_id': tournament_id,
            'message': 'Joined tournament room'
        })

@socketio.on('leave_tournament')
def handle_leave_tournament(data):
    """Leave a tournament room"""
    tournament_id = data.get('tournament_id')
    if tournament_id:
        room_name = f'tournament_{tournament_id}'
        leave_room(room_name)
        emit('left_tournament', {
            'tournament_id': tournament_id,
            'message': 'Left tournament room'
        })

@socketio.on('game_move')
def handle_game_move(data):
    """Handle game move updates"""
    session_id = data.get('session_id')
    move_data = data.get('move')
    user_id = data.get('user_id')
    
    if session_id and session_id in active_sessions:
        # Broadcast move to all players in the session
        emit('game_move_update', {
            'session_id': session_id,
            'move': move_data,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat()
        }, room=session_id)

@socketio.on('game_solution_submit')
def handle_game_solution(data):
    """Handle game solution submission"""
    session_id = data.get('session_id')
    solution = data.get('solution')
    time_taken = data.get('time_taken')
    user_id = data.get('user_id')
    
    if session_id and session_id in active_sessions:
        session = active_sessions[session_id]
        
        # Process solution
        try:
            game = Game.get_by_id(session['game_id'])
            if game:
                result = game.submit_solution(session['level_id'], user_id, solution, time_taken)
                
                # Broadcast result to session
                emit('game_solution_result', {
                    'session_id': session_id,
                    'result': result,
                    'user_id': user_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, room=session_id)
                
                # Update leaderboard if needed
                if result.get('is_correct'):
                    emit('leaderboard_update', {
                        'game_id': session['game_id'],
                        'user_id': user_id,
                        'score': result.get('score', 0)
                    }, broadcast=True)
        
        except Exception as e:
            emit('game_error', {
                'session_id': session_id,
                'error': str(e)
            }, room=session_id)

@socketio.on('tournament_match_update')
def handle_tournament_match(data):
    """Handle tournament match updates"""
    tournament_id = data.get('tournament_id')
    match_id = data.get('match_id')
    winner_id = data.get('winner_id')
    player1_score = data.get('player1_score', 0)
    player2_score = data.get('player2_score', 0)
    
    if tournament_id:
        try:
            tournament = Tournament.get_by_id(tournament_id)
            if tournament:
                success = tournament.update_match_result(match_id, winner_id, player1_score, player2_score)
                
                if success:
                    # Broadcast tournament update
                    room_name = f'tournament_{tournament_id}'
                    emit('tournament_update', {
                        'tournament_id': tournament_id,
                        'match_id': match_id,
                        'winner_id': winner_id,
                        'tournament_data': tournament.to_dict()
                    }, room=room_name)
                    
                    # Check if tournament is complete
                    if tournament.status == 'completed':
                        emit('tournament_completed', {
                            'tournament_id': tournament_id,
                            'winner_id': tournament.winner_id,
                            'tournament_data': tournament.to_dict()
                        }, room=room_name)
        
        except Exception as e:
            emit('tournament_error', {
                'tournament_id': tournament_id,
                'error': str(e)
            })

@socketio.on('chat_message')
def handle_chat_message(data):
    """Handle chat messages"""
    session_id = data.get('session_id')
    message = data.get('message')
    user_id = data.get('user_id')
    
    if session_id and message:
        # Get user details
        user = User.get_by_id(user_id)
        user_name = user.name if user else 'Unknown'
        
        # Broadcast message to session
        emit('chat_message', {
            'session_id': session_id,
            'message': message,
            'user_id': user_id,
            'user_name': user_name,
            'timestamp': datetime.utcnow().isoformat()
        }, room=session_id)

# Utility functions for broadcasting updates
def broadcast_tournament_update(tournament_id, update_data):
    """Broadcast tournament update to all participants"""
    room_name = f'tournament_{tournament_id}'
    socketio.emit('tournament_update', update_data, room=room_name)

def broadcast_game_update(session_id, update_data):
    """Broadcast game update to session participants"""
    socketio.emit('game_update', update_data, room=session_id)

def broadcast_leaderboard_update(game_id, leaderboard_data):
    """Broadcast leaderboard update"""
    socketio.emit('leaderboard_update', {
        'game_id': game_id,
        'leaderboard': leaderboard_data
    }, broadcast=True)

def broadcast_notification(user_id, notification_data):
    """Send notification to specific user"""
    # Find user's socket connection
    for session_id, session in active_sessions.items():
        if session.get('user_id') == user_id:
            socketio.emit('notification', notification_data, room=session_id)
            break

def broadcast_achievement(user_id, achievement_data):
    """Broadcast achievement to user"""
    for session_id, session in active_sessions.items():
        if session.get('user_id') == user_id:
            socketio.emit('achievement_unlocked', achievement_data, room=session_id)
            break 