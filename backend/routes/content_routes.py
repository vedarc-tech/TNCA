from flask import Blueprint, request, jsonify
from models.content import Content
from middleware.auth_middleware import admin_required, get_current_user
from datetime import datetime

content_bp = Blueprint('content', __name__)

@content_bp.route('/', methods=['GET'])
def get_active_content():
    """Get active content for users"""
    try:
        content_type = request.args.get('type')
        content_list = Content.get_active_content(content_type)
        
        return jsonify({
            'success': True,
            'message': 'Content retrieved successfully',
            'data': [content.to_dict() for content in content_list]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get content: {str(e)}'
        }), 500

@content_bp.route('/admin', methods=['GET'])
@admin_required
def get_all_content():
    """Get all content (admin only)"""
    try:
        content_list = Content.get_all_content()
        
        return jsonify({
            'success': True,
            'message': 'All content retrieved successfully',
            'data': [content.to_dict() for content in content_list]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get content: {str(e)}'
        }), 500

@content_bp.route('/admin', methods=['POST'])
@admin_required
def create_content():
    """Create new content (admin only)"""
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data.get('title'):
            return jsonify({
                'success': False,
                'message': 'Content title is required'
            }), 400
        
        if not data.get('content_type'):
            return jsonify({
                'success': False,
                'message': 'Content type is required'
            }), 400
        
        # Process image upload if provided
        if data.get('image_data'):
            image_url = Content.upload_image(data['image_data'])
            if image_url:
                data['image_url'] = image_url
        
        # Process dates
        if data.get('start_date'):
            data['start_date'] = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        if data.get('end_date'):
            data['end_date'] = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        
        data['created_by'] = current_user.id
        content_id = Content.create_content(data)
        
        return jsonify({
            'success': True,
            'message': 'Content created successfully',
            'data': {'content_id': content_id}
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to create content: {str(e)}'
        }), 500

@content_bp.route('/admin/<content_id>', methods=['PUT'])
@admin_required
def update_content(content_id):
    """Update content (admin only)"""
    try:
        content = Content.get_by_id(content_id)
        if not content:
            return jsonify({
                'success': False,
                'message': 'Content not found'
            }), 404
        
        data = request.get_json()
        
        # Process image upload if provided
        if data.get('image_data'):
            image_url = Content.upload_image(data['image_data'])
            if image_url:
                data['image_url'] = image_url
        
        # Process dates
        if data.get('start_date'):
            data['start_date'] = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        if data.get('end_date'):
            data['end_date'] = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        
        content.update_content(data)
        
        return jsonify({
            'success': True,
            'message': 'Content updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update content: {str(e)}'
        }), 500

@content_bp.route('/admin/<content_id>', methods=['DELETE'])
@admin_required
def delete_content(content_id):
    """Delete content (admin only)"""
    try:
        content = Content.get_by_id(content_id)
        if not content:
            return jsonify({
                'success': False,
                'message': 'Content not found'
            }), 404
        
        content.delete_content()
        
        return jsonify({
            'success': True,
            'message': 'Content deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to delete content: {str(e)}'
        }), 500

@content_bp.route('/admin/<content_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_content_status(content_id):
    """Toggle content active status (admin only)"""
    try:
        content = Content.get_by_id(content_id)
        if not content:
            return jsonify({
                'success': False,
                'message': 'Content not found'
            }), 404
        
        new_status = not content.is_active
        content.update_content({'is_active': new_status})
        
        message = 'Content activated successfully' if new_status else 'Content deactivated successfully'
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to toggle content status: {str(e)}'
        }), 500

@content_bp.route('/<content_id>/view', methods=['POST'])
def increment_view_count(content_id):
    """Increment content view count"""
    try:
        content = Content.get_by_id(content_id)
        if not content:
            return jsonify({
                'success': False,
                'message': 'Content not found'
            }), 404
        
        content.increment_view_count()
        
        return jsonify({
            'success': True,
            'message': 'View count updated'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update view count: {str(e)}'
        }), 500 