from datetime import datetime
from models.database import get_db
from bson import ObjectId

class MaintenanceMode:
    def __init__(self, data=None):
        if data:
            self.id = str(data.get('_id')) if data.get('_id') else None
            self.route_path = data.get('route_path', '')
            self.page_name = data.get('page_name', '')
            self.is_maintenance = data.get('is_maintenance', False)
            self.start_time = data.get('start_time')
            self.end_time = data.get('end_time')
            self.message = data.get('message', 'This page is under maintenance')
            self.created_by = data.get('created_by', '')
            self.created_at = data.get('created_at', datetime.now())
            self.updated_at = data.get('updated_at', datetime.now())
        else:
            self.id = None
            self.route_path = ''
            self.page_name = ''
            self.is_maintenance = False
            self.start_time = None
            self.end_time = None
            self.message = 'This page is under maintenance'
            self.created_by = ''
            self.created_at = datetime.now()
            self.updated_at = datetime.now()

    def to_dict(self):
        return {
            'id': self.id,
            'route_path': self.route_path,
            'page_name': self.page_name,
            'is_maintenance': self.is_maintenance,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'message': self.message,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def save(self):
        db = get_db()
        data = {
            'route_path': self.route_path,
            'page_name': self.page_name,
            'is_maintenance': self.is_maintenance,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'message': self.message,
            'created_by': self.created_by,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        
        if self.id:
            # Update existing
            result = db.maintenance_modes.update_one(
                {'_id': ObjectId(self.id)},
                {'$set': data}
            )
            return result.modified_count > 0
        else:
            # Create new
            result = db.maintenance_modes.insert_one(data)
            self.id = str(result.inserted_id)
            return True

    @staticmethod
    def get_by_id(maintenance_id):
        db = get_db()
        data = db.maintenance_modes.find_one({'_id': ObjectId(maintenance_id)})
        return MaintenanceMode(data) if data else None

    @staticmethod
    def get_by_route(route_path):
        db = get_db()
        data = db.maintenance_modes.find_one({'route_path': route_path})
        return MaintenanceMode(data) if data else None

    @staticmethod
    def get_all():
        db = get_db()
        maintenance_modes = list(db.maintenance_modes.find().sort('created_at', -1))
        return [MaintenanceMode(mode) for mode in maintenance_modes]

    @staticmethod
    def get_active_maintenance():
        """Get all currently active maintenance modes"""
        db = get_db()
        now = datetime.now()
        
        # Find maintenance modes that are active and within their time window
        active_modes = list(db.maintenance_modes.find({
            'is_maintenance': True,
            '$or': [
                {'start_time': {'$lte': now}, 'end_time': {'$gte': now}},
                {'start_time': {'$lte': now}, 'end_time': None},
                {'start_time': None, 'end_time': {'$gte': now}},
                {'start_time': None, 'end_time': None}
            ]
        }))
        
        return [MaintenanceMode(mode) for mode in active_modes]

    @staticmethod
    def is_route_in_maintenance(route_path):
        """Check if a specific route is currently in maintenance"""
        maintenance = MaintenanceMode.get_by_route(route_path)
        if not maintenance or not maintenance.is_maintenance:
            return False
        
        now = datetime.now()
        
        # If no time constraints, always in maintenance
        if not maintenance.start_time and not maintenance.end_time:
            return True
        
        # Check if current time is within maintenance window
        if maintenance.start_time and maintenance.end_time:
            return maintenance.start_time <= now <= maintenance.end_time
        elif maintenance.start_time:
            return maintenance.start_time <= now
        elif maintenance.end_time:
            return now <= maintenance.end_time
        
        return False

    @staticmethod
    def delete_by_id(maintenance_id):
        db = get_db()
        result = db.maintenance_modes.delete_one({'_id': ObjectId(maintenance_id)})
        return result.deleted_count > 0

    @staticmethod
    def get_route_groups():
        """Get predefined route groups for bulk operations"""
        return {
            'admin_dashboard': [
                '/admin',
                '/admin/dashboard',
                '/admin/users',
                '/admin/games',
                '/admin/tournaments',
                '/admin/quizzes',
                '/admin/analytics',
                '/admin/reports',
                '/admin/settings',
                '/admin/play-games'
            ],
            'user_dashboard': [
                '/user',
                '/user/dashboard',
                '/user/games',
                '/user/matches',
                '/user/performance',
                '/user/profile',
                '/user/leaderboard',
                '/user/tournaments',
                '/user/quizzes',
                '/user/play-games',
                '/user/quiz-taking'
            ],
            'developer_dashboard': [
                '/developer',
                '/developer/dashboard',
                '/developer/system-control',
                '/developer/user-management',
                '/developer/database',
                '/developer/system-monitor',
                '/developer/security-audit',
                '/developer/analytics',
                '/developer/logs',
                '/developer/maintenance',
                '/developer/maintenance-management'
            ],
            'public_pages': [
                '/',
                '/home',
                '/about',
                '/contact',
                '/privacy',
                '/login',
                '/register'
            ]
        } 