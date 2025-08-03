from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from models.user import User

def auth_required(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.get_by_id(current_user_id)
            
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found'
                }), 404
            
            if not user.is_active:
                return jsonify({
                    'success': False,
                    'message': 'Account is deactivated'
                }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Authentication failed: {str(e)}'
            }), 401
    
    return decorated_function

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.get_by_id(current_user_id)
            
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found'
                }), 404
            
            if user.role not in ['admin', 'super_admin', 'developer']:
                return jsonify({
                    'success': False,
                    'message': 'Admin access required'
                }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Authentication failed: {str(e)}'
            }), 401
    
    return decorated_function

def super_admin_required(f):
    """Decorator to require super admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.get_by_id(current_user_id)
            
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found'
                }), 404
            
            if user.role not in ['super_admin', 'developer']:
                return jsonify({
                    'success': False,
                    'message': 'Super admin access required'
                }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Authentication failed: {str(e)}'
            }), 401
    
    return decorated_function

def protect_super_admin(f):
    """Decorator to protect super admin accounts from modification by other admins"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.get_by_id(current_user_id)
            
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User not found'
                }), 404
            
            # Get the target user ID from the route parameters
            target_user_id = kwargs.get('user_id')
            if target_user_id:
                target_user = User.get_by_id(target_user_id)
                if target_user and target_user.role == 'super_admin':
                    # Only super admins can modify other super admins
                    if current_user.role != 'super_admin':
                        return jsonify({
                            'success': False,
                            'message': 'Super admin accounts cannot be modified by regular admins'
                        }), 403
                    
                    # Super admins cannot modify themselves through these routes
                    if str(current_user.id) == str(target_user.id):
                        return jsonify({
                            'success': False,
                            'message': 'Super admin cannot modify their own account through this route'
                        }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Authentication failed: {str(e)}'
            }), 401
    
    return decorated_function

def user_required(f):
    """Decorator to require authenticated user"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.get_by_id(current_user_id)
            
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found'
                }), 404
            
            if not user.is_active:
                return jsonify({
                    'success': False,
                    'message': 'Account is deactivated'
                }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Authentication failed: {str(e)}'
            }), 401
    
    return decorated_function

def get_current_user():
    """Get current user from JWT token"""
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        return User.get_by_id(current_user_id)
    except:
        return None

def developer_required(f):
    """Decorator to require developer role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.get_by_id(current_user_id)
            
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found'
                }), 404
            
            if user.role != 'developer':
                return jsonify({
                    'success': False,
                    'message': 'Developer access required'
                }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Authentication failed: {str(e)}'
            }), 401
    
    return decorated_function

def is_super_admin(user_id):
    """Check if a user is a super admin"""
    try:
        user = User.get_by_id(user_id)
        return user and user.role == 'super_admin'
    except:
        return False

def is_developer(user_id):
    """Check if a user is a developer"""
    try:
        user = User.get_by_id(user_id)
        return user and user.role == 'developer'
    except:
        return False 

def maintenance_check(route_path):
    """Check if a route is in maintenance mode"""
    from models.maintenance import MaintenanceMode
    
    # Skip maintenance check for developer routes
    if route_path.startswith('/developer'):
        return False
    
    # Skip maintenance check for login and register routes
    if route_path in ['/login', '/register']:
        return False
    
    # First check the exact route
    if MaintenanceMode.is_route_in_maintenance(route_path):
        return True
    
    # If exact route not in maintenance, check parent routes
    # For admin routes, check if /admin is in maintenance
    if route_path.startswith('/admin/') and MaintenanceMode.is_route_in_maintenance('/admin'):
        return True
    
    # For user routes, check common parent paths
    user_parent_paths = ['/dashboard', '/profile', '/quizzes', '/games', '/play-games', '/tournaments', '/matches', '/leaderboard', '/performance']
    for parent_path in user_parent_paths:
        if route_path == parent_path or route_path.startswith(parent_path + '/'):
            if MaintenanceMode.is_route_in_maintenance(parent_path):
                return True
            break
    
    return False

def get_maintenance_info(route_path):
    """Get maintenance information for a route"""
    from models.maintenance import MaintenanceMode
    
    # First check the exact route
    maintenance = MaintenanceMode.get_by_route(route_path)
    if maintenance and maintenance.is_maintenance:
        return {
            'is_maintenance': True,
            'message': maintenance.message,
            'start_time': maintenance.start_time.isoformat() if maintenance.start_time else None,
            'end_time': maintenance.end_time.isoformat() if maintenance.end_time else None
        }
    
    # If exact route not in maintenance, check parent routes
    # For admin routes, check if /admin is in maintenance
    if route_path.startswith('/admin/'):
        admin_maintenance = MaintenanceMode.get_by_route('/admin')
        if admin_maintenance and admin_maintenance.is_maintenance:
            return {
                'is_maintenance': True,
                'message': admin_maintenance.message,
                'start_time': admin_maintenance.start_time.isoformat() if admin_maintenance.start_time else None,
                'end_time': admin_maintenance.end_time.isoformat() if admin_maintenance.end_time else None
            }
    
    # For user routes, check common parent paths
    user_parent_paths = ['/dashboard', '/profile', '/quizzes', '/games', '/play-games', '/tournaments', '/matches', '/leaderboard', '/performance']
    for parent_path in user_parent_paths:
        if route_path == parent_path or route_path.startswith(parent_path + '/'):
            parent_maintenance = MaintenanceMode.get_by_route(parent_path)
            if parent_maintenance and parent_maintenance.is_maintenance:
                return {
                    'is_maintenance': True,
                    'message': parent_maintenance.message,
                    'start_time': parent_maintenance.start_time.isoformat() if parent_maintenance.start_time else None,
                    'end_time': parent_maintenance.end_time.isoformat() if parent_maintenance.end_time else None
                }
            break
    
    return {'is_maintenance': False} 