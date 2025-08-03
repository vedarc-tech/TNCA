from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models.user import User
from models.database import get_db
from datetime import datetime
import os
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('identifier') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email/Username and password are required'
            }), 400
        
        identifier = data['identifier']
        password = data['password']
        
        # Check for developer credentials from environment
        developer_email = os.getenv('DEVELOPER_EMAIL')
        developer_username = os.getenv('DEVELOPER_USERNAME')
        developer_password = os.getenv('DEVELOPER_PASSWORD')
        
        # Developer login check
        if ((identifier == developer_email or identifier == developer_username) and 
            password == developer_password):
            
            # Create or get developer user
            db = get_db()
            developer_user = db.users.find_one({"role": "developer"})
            
            if not developer_user:
                # Create developer user if doesn't exist
                developer_data = {
                    "email": developer_email,
                    "username": developer_username,
                    "name": "System Developer",
                    "password": password,  # Will be hashed in create_user
                    "role": "developer",
                    "is_active": True
                }
                user_id = User.create_user(developer_data)
                developer_user = User.get_by_id(user_id)
            else:
                # Check if the existing developer user's password matches
                if not bcrypt.checkpw(password.encode('utf-8'), developer_user['password']):
                    return jsonify({
                        'success': False,
                        'message': 'Invalid developer credentials'
                    }), 401
                developer_user = User(developer_user)
            
            # Create tokens
            access_token = create_access_token(identity=developer_user.id)
            refresh_token = create_refresh_token(identity=developer_user.id)
            
            return jsonify({
                'success': True,
                'message': 'Developer login successful',
                'data': {
                    'user': developer_user.to_dict(),
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }
            }), 200
        
        # Regular user authentication
        user = User.authenticate(identifier, password)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid email/username or password'
            }), 401
        
        if not user.is_active:
            # Check if user has suspension reason
            if user.suspension_reason:
                if user.suspended_by and 'developer' in user.suspended_by.lower():
                    message = f'Your Account is Suspended/Deactivated: {user.suspension_reason}'
                else:
                    message = f'Your Account is Suspended/Deactivated: {user.suspension_reason}'
            else:
                if user.suspended_by and 'developer' in user.suspended_by.lower():
                    message = 'Your Account is Suspended/Deactivated: Contact Developer'
                else:
                    message = 'Your Account is Suspended/Deactivated: Contact admin'
            
            return jsonify({
                'success': False,
                'message': message,
                'suspended': True,
                'suspension_reason': user.suspension_reason,
                'suspended_by': user.suspended_by
            }), 401
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user.to_dict(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Login failed: {str(e)}'
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'success': True,
            'message': 'Token refreshed successfully',
            'data': {
                'access_token': new_access_token
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Token refresh failed: {str(e)}'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_id = get_jwt_identity()
        user = User.get_by_id(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'User information retrieved successfully',
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get user information: {str(e)}'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout endpoint"""
    try:
        # In a real application, you might want to blacklist the token
        # For now, we'll just return a success message
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Logout failed: {str(e)}'
        }), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        user = User.get_by_id(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({
                'success': False,
                'message': 'Current password and new password are required'
            }), 400
        
        # Verify current password
        if not User.authenticate(user.email, data['current_password']):
            return jsonify({
                'success': False,
                'message': 'Current password is incorrect'
            }), 401
        
        # Update password
        user.reset_password(data['new_password'])
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Password change failed: {str(e)}'
        }), 500 