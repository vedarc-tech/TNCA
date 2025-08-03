from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from middleware.auth_middleware import developer_required, get_current_user
from models.maintenance import MaintenanceMode
from datetime import datetime, timedelta
import json

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route('/routes', methods=['GET'])
@developer_required
def get_all_routes():
    """Get all available routes in the application"""
    try:
        # Define all routes in the application
        routes = [
            # Public routes
            {'path': '/', 'name': 'Home', 'group': 'public'},
            {'path': '/home', 'name': 'Home', 'group': 'public'},
            {'path': '/about', 'name': 'About', 'group': 'public'},
            {'path': '/contact', 'name': 'Contact', 'group': 'public'},
            {'path': '/privacy', 'name': 'Privacy Policy', 'group': 'public'},
            {'path': '/login', 'name': 'Login', 'group': 'public'},
            {'path': '/register', 'name': 'Register', 'group': 'public'},
            
            # User routes
            {'path': '/user', 'name': 'User Dashboard', 'group': 'user'},
            {'path': '/user/dashboard', 'name': 'User Dashboard', 'group': 'user'},
            {'path': '/user/games', 'name': 'User Games', 'group': 'user'},
            {'path': '/user/matches', 'name': 'User Matches', 'group': 'user'},
            {'path': '/user/performance', 'name': 'User Performance', 'group': 'user'},
            {'path': '/user/profile', 'name': 'User Profile', 'group': 'user'},
            {'path': '/user/leaderboard', 'name': 'User Leaderboard', 'group': 'user'},
            {'path': '/user/tournaments', 'name': 'User Tournaments', 'group': 'user'},
            {'path': '/user/quizzes', 'name': 'User Quizzes', 'group': 'user'},
            {'path': '/user/play-games', 'name': 'Play Games', 'group': 'user'},
            {'path': '/user/quiz-taking', 'name': 'Quiz Taking', 'group': 'user'},
            
            # Admin routes
            {'path': '/admin', 'name': 'Admin Dashboard', 'group': 'admin'},
            {'path': '/admin/dashboard', 'name': 'Admin Dashboard', 'group': 'admin'},
            {'path': '/admin/users', 'name': 'Admin Users', 'group': 'admin'},
            {'path': '/admin/games', 'name': 'Admin Games', 'group': 'admin'},
            {'path': '/admin/tournaments', 'name': 'Admin Tournaments', 'group': 'admin'},
            {'path': '/admin/quizzes', 'name': 'Admin Quizzes', 'group': 'admin'},
            {'path': '/admin/analytics', 'name': 'Admin Analytics', 'group': 'admin'},
            {'path': '/admin/reports', 'name': 'Admin Reports', 'group': 'admin'},
            {'path': '/admin/settings', 'name': 'Admin Settings', 'group': 'admin'},
            {'path': '/admin/play-games', 'name': 'Admin Play Games', 'group': 'admin'},
            
            # Developer routes
            {'path': '/developer', 'name': 'Developer Dashboard', 'group': 'developer'},
            {'path': '/developer/dashboard', 'name': 'Developer Dashboard', 'group': 'developer'},
            {'path': '/developer/system-control', 'name': 'System Control', 'group': 'developer'},
            {'path': '/developer/user-management', 'name': 'User Management', 'group': 'developer'},
            {'path': '/developer/database', 'name': 'Database Management', 'group': 'developer'},
            {'path': '/developer/system-monitor', 'name': 'System Monitor', 'group': 'developer'},
            {'path': '/developer/security-audit', 'name': 'Security Audit', 'group': 'developer'},
            {'path': '/developer/analytics', 'name': 'Developer Analytics', 'group': 'developer'},
            {'path': '/developer/logs', 'name': 'System Logs', 'group': 'developer'},
            {'path': '/developer/maintenance', 'name': 'Maintenance Management', 'group': 'developer'},
            {'path': '/developer/maintenance-management', 'name': 'Maintenance Management', 'group': 'developer'},
        ]
        
        # Remove duplicates based on path
        seen_paths = set()
        unique_routes = []
        for route in routes:
            if route['path'] not in seen_paths:
                seen_paths.add(route['path'])
                unique_routes.append(route)
        
        # Get current maintenance status for each route
        for route in unique_routes:
            maintenance = MaintenanceMode.get_by_route(route['path'])
            route['maintenance_status'] = {
                'is_maintenance': maintenance.is_maintenance if maintenance else False,
                'start_time': maintenance.start_time.isoformat() if maintenance and maintenance.start_time else None,
                'end_time': maintenance.end_time.isoformat() if maintenance and maintenance.end_time else None,
                'message': maintenance.message if maintenance else None,
                'maintenance_id': maintenance.id if maintenance else None
            }
        
        return jsonify({
            'success': True,
            'data': unique_routes
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get routes: {str(e)}'
        }), 500

@maintenance_bp.route('/status', methods=['GET'])
@developer_required
def get_maintenance_status():
    """Get current maintenance status for all routes"""
    try:
        maintenance_modes = MaintenanceMode.get_all()
        active_maintenance = MaintenanceMode.get_active_maintenance()
        
        return jsonify({
            'success': True,
            'data': {
                'all_maintenance': [mode.to_dict() for mode in maintenance_modes],
                'active_maintenance': [mode.to_dict() for mode in active_maintenance],
                'total_active': len(active_maintenance)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get maintenance status: {str(e)}'
        }), 500

@maintenance_bp.route('/check/<path:route_path>', methods=['GET'])
def check_maintenance(route_path):
    """Check if a route is in maintenance mode (no auth required)"""
    try:
        from middleware.auth_middleware import maintenance_check, get_maintenance_info
        
        is_maintenance = maintenance_check(route_path)
        maintenance_info = get_maintenance_info(route_path)
        
        return jsonify({
            'success': True,
            'data': {
                'route_path': route_path,
                'is_maintenance': is_maintenance,
                'maintenance_info': maintenance_info
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to check maintenance: {str(e)}'
        }), 500

@maintenance_bp.route('/route/<path:route_path>/status', methods=['GET'])
def check_route_maintenance(route_path):
    """Check if a specific route is in maintenance mode"""
    try:
        is_maintenance = MaintenanceMode.is_route_in_maintenance(route_path)
        maintenance = MaintenanceMode.get_by_route(route_path)
        
        return jsonify({
            'success': True,
            'data': {
                'route_path': route_path,
                'is_maintenance': is_maintenance,
                'maintenance_info': maintenance.to_dict() if maintenance else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to check route maintenance: {str(e)}'
        }), 500

@maintenance_bp.route('/route', methods=['POST'])
@developer_required
def set_route_maintenance():
    """Set maintenance mode for a specific route"""
    try:
        data = request.get_json()
        current_user = get_current_user()
        
        route_path = data.get('route_path')
        page_name = data.get('page_name')
        is_maintenance = data.get('is_maintenance', False)
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        message = data.get('message', 'This page is under maintenance')
        
        if not route_path:
            return jsonify({
                'success': False,
                'message': 'Route path is required'
            }), 400
        
        # Parse datetime strings
        if start_time:
            start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        if end_time:
            end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        # Check if maintenance already exists for this route
        existing_maintenance = MaintenanceMode.get_by_route(route_path)
        
        if existing_maintenance:
            # Update existing
            existing_maintenance.is_maintenance = is_maintenance
            existing_maintenance.start_time = start_time
            existing_maintenance.end_time = end_time
            existing_maintenance.message = message
            existing_maintenance.updated_at = datetime.now()
            existing_maintenance.save()
            maintenance = existing_maintenance
        else:
            # Create new
            maintenance = MaintenanceMode()
            maintenance.route_path = route_path
            maintenance.page_name = page_name or route_path
            maintenance.is_maintenance = is_maintenance
            maintenance.start_time = start_time
            maintenance.end_time = end_time
            maintenance.message = message
            maintenance.created_by = current_user.email
            maintenance.save()
        
        return jsonify({
            'success': True,
            'message': f'Maintenance mode {"enabled" if is_maintenance else "disabled"} for {route_path}',
            'data': maintenance.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to set route maintenance: {str(e)}'
        }), 500

@maintenance_bp.route('/group', methods=['POST'])
@developer_required
def set_group_maintenance():
    """Set maintenance mode for a group of routes"""
    try:
        data = request.get_json()
        current_user = get_current_user()
        
        group_name = data.get('group_name')
        is_maintenance = data.get('is_maintenance', False)
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        message = data.get('message', 'This section is under maintenance')
        
        if not group_name:
            return jsonify({
                'success': False,
                'message': 'Group name is required'
            }), 400
        
        # Get route groups
        route_groups = MaintenanceMode.get_route_groups()
        
        if group_name not in route_groups:
            return jsonify({
                'success': False,
                'message': f'Invalid group name: {group_name}'
            }), 400
        
        routes = route_groups[group_name]
        results = []
        
        # Parse datetime strings
        if start_time:
            start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        if end_time:
            end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        for route_path in routes:
            # Check if maintenance already exists for this route
            existing_maintenance = MaintenanceMode.get_by_route(route_path)
            
            if existing_maintenance:
                # Update existing
                existing_maintenance.is_maintenance = is_maintenance
                existing_maintenance.start_time = start_time
                existing_maintenance.end_time = end_time
                existing_maintenance.message = message
                existing_maintenance.updated_at = datetime.now()
                existing_maintenance.save()
                results.append(existing_maintenance.to_dict())
            else:
                # Create new
                maintenance = MaintenanceMode()
                maintenance.route_path = route_path
                maintenance.page_name = route_path
                maintenance.is_maintenance = is_maintenance
                maintenance.start_time = start_time
                maintenance.end_time = end_time
                maintenance.message = message
                maintenance.created_by = current_user.email
                maintenance.save()
                results.append(maintenance.to_dict())
        
        return jsonify({
            'success': True,
            'message': f'Maintenance mode {"enabled" if is_maintenance else "disabled"} for {group_name} group ({len(routes)} routes)',
            'data': {
                'group_name': group_name,
                'routes_updated': len(routes),
                'results': results
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to set group maintenance: {str(e)}'
        }), 500

@maintenance_bp.route('/global', methods=['POST'])
@developer_required
def set_global_maintenance():
    """Set maintenance mode for the entire application"""
    try:
        data = request.get_json()
        current_user = get_current_user()
        
        is_maintenance = data.get('is_maintenance', False)
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        message = data.get('message', 'The application is under maintenance')
        
        # Parse datetime strings
        if start_time:
            start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        if end_time:
            end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        # Get all routes from the routes endpoint
        routes = [
            # Public routes
            {'path': '/', 'name': 'Home', 'group': 'public'},
            {'path': '/home', 'name': 'Home', 'group': 'public'},
            {'path': '/about', 'name': 'About', 'group': 'public'},
            {'path': '/contact', 'name': 'Contact', 'group': 'public'},
            {'path': '/privacy', 'name': 'Privacy Policy', 'group': 'public'},
            {'path': '/login', 'name': 'Login', 'group': 'public'},
            {'path': '/register', 'name': 'Register', 'group': 'public'},
            
            # User routes
            {'path': '/user', 'name': 'User Dashboard', 'group': 'user'},
            {'path': '/user/dashboard', 'name': 'User Dashboard', 'group': 'user'},
            {'path': '/user/games', 'name': 'User Games', 'group': 'user'},
            {'path': '/user/matches', 'name': 'User Matches', 'group': 'user'},
            {'path': '/user/performance', 'name': 'User Performance', 'group': 'user'},
            {'path': '/user/profile', 'name': 'User Profile', 'group': 'user'},
            {'path': '/user/leaderboard', 'name': 'User Leaderboard', 'group': 'user'},
            {'path': '/user/tournaments', 'name': 'User Tournaments', 'group': 'user'},
            {'path': '/user/quizzes', 'name': 'User Quizzes', 'group': 'user'},
            {'path': '/user/play-games', 'name': 'Play Games', 'group': 'user'},
            {'path': '/user/quiz-taking', 'name': 'Quiz Taking', 'group': 'user'},
            
            # Admin routes
            {'path': '/admin', 'name': 'Admin Dashboard', 'group': 'admin'},
            {'path': '/admin/dashboard', 'name': 'Admin Dashboard', 'group': 'admin'},
            {'path': '/admin/users', 'name': 'Admin Users', 'group': 'admin'},
            {'path': '/admin/games', 'name': 'Admin Games', 'group': 'admin'},
            {'path': '/admin/tournaments', 'name': 'Admin Tournaments', 'group': 'admin'},
            {'path': '/admin/quizzes', 'name': 'Admin Quizzes', 'group': 'admin'},
            {'path': '/admin/analytics', 'name': 'Admin Analytics', 'group': 'admin'},
            {'path': '/admin/reports', 'name': 'Admin Reports', 'group': 'admin'},
            {'path': '/admin/settings', 'name': 'Admin Settings', 'group': 'admin'},
            {'path': '/admin/play-games', 'name': 'Admin Play Games', 'group': 'admin'},
            
            # Developer routes
            {'path': '/developer', 'name': 'Developer Dashboard', 'group': 'developer'},
            {'path': '/developer/dashboard', 'name': 'Developer Dashboard', 'group': 'developer'},
            {'path': '/developer/system-control', 'name': 'System Control', 'group': 'developer'},
            {'path': '/developer/user-management', 'name': 'User Management', 'group': 'developer'},
            {'path': '/developer/database', 'name': 'Database Management', 'group': 'developer'},
            {'path': '/developer/system-monitor', 'name': 'System Monitor', 'group': 'developer'},
            {'path': '/developer/security-audit', 'name': 'Security Audit', 'group': 'developer'},
            {'path': '/developer/analytics', 'name': 'Developer Analytics', 'group': 'developer'},
            {'path': '/developer/logs', 'name': 'System Logs', 'group': 'developer'},
            {'path': '/developer/maintenance', 'name': 'Maintenance Management', 'group': 'developer'},
            {'path': '/developer/maintenance-management', 'name': 'Maintenance Management', 'group': 'developer'},
        ]
        
        # Remove duplicates based on path
        seen_paths = set()
        unique_routes = []
        for route in routes:
            if route['path'] not in seen_paths:
                seen_paths.add(route['path'])
                unique_routes.append(route)
        
        all_routes = [route['path'] for route in unique_routes]
        results = []
        
        print(f"Setting global maintenance for {len(all_routes)} routes: {all_routes}")
        
        for route_path in all_routes:
            # Check if maintenance already exists for this route
            existing_maintenance = MaintenanceMode.get_by_route(route_path)
            
            if existing_maintenance:
                # Update existing
                existing_maintenance.is_maintenance = is_maintenance
                existing_maintenance.start_time = start_time
                existing_maintenance.end_time = end_time
                existing_maintenance.message = message
                existing_maintenance.updated_at = datetime.now()
                existing_maintenance.save()
                results.append(existing_maintenance.to_dict())
            else:
                # Create new
                maintenance = MaintenanceMode()
                maintenance.route_path = route_path
                maintenance.page_name = route_path
                maintenance.is_maintenance = is_maintenance
                maintenance.start_time = start_time
                maintenance.end_time = end_time
                maintenance.message = message
                maintenance.created_by = current_user.email
                maintenance.save()
                results.append(maintenance.to_dict())
        
        return jsonify({
            'success': True,
            'message': f'Global maintenance mode {"enabled" if is_maintenance else "disabled"} for {len(all_routes)} routes',
            'data': {
                'routes_updated': len(all_routes),
                'results': results
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to set global maintenance: {str(e)}'
        }), 500

@maintenance_bp.route('/route/<maintenance_id>', methods=['DELETE'])
@developer_required
def delete_maintenance(maintenance_id):
    """Delete a maintenance mode configuration"""
    try:
        maintenance = MaintenanceMode.get_by_id(maintenance_id)
        
        if not maintenance:
            return jsonify({
                'success': False,
                'message': 'Maintenance configuration not found'
            }), 404
        
        route_path = maintenance.route_path
        MaintenanceMode.delete_by_id(maintenance_id)
        
        return jsonify({
            'success': True,
            'message': f'Maintenance configuration deleted for {route_path}'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to delete maintenance: {str(e)}'
        }), 500

@maintenance_bp.route('/test', methods=['GET'])
def test_maintenance():
    """Test endpoint to check maintenance system"""
    try:
        # Test creating a maintenance entry
        test_maintenance = MaintenanceMode()
        test_maintenance.route_path = '/test'
        test_maintenance.page_name = 'Test Page'
        test_maintenance.is_maintenance = True
        test_maintenance.message = 'Test maintenance'
        test_maintenance.created_by = 'test'
        test_maintenance.save()
        
        # Test retrieving it
        retrieved = MaintenanceMode.get_by_route('/test')
        
        # Clean up
        if retrieved:
            MaintenanceMode.delete_by_id(retrieved.id)
        
        return jsonify({
            'success': True,
            'message': 'Maintenance system is working correctly',
            'test_created': test_maintenance.id is not None,
            'test_retrieved': retrieved is not None
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Maintenance system test failed: {str(e)}'
        }), 500

@maintenance_bp.route('/groups', methods=['GET'])
@developer_required
def get_route_groups():
    """Get available route groups"""
    try:
        route_groups = MaintenanceMode.get_route_groups()
        
        # Add metadata for each group
        groups_with_metadata = {}
        for group_name, routes in route_groups.items():
            active_count = 0
            for route in routes:
                if MaintenanceMode.is_route_in_maintenance(route):
                    active_count += 1
            
            groups_with_metadata[group_name] = {
                'routes': routes,
                'route_count': len(routes),
                'active_maintenance_count': active_count
            }
        
        return jsonify({
            'success': True,
            'data': groups_with_metadata
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get route groups: {str(e)}'
        }), 500 