from models.database import get_db
from datetime import datetime
from bson import ObjectId
import os
import base64
import uuid

class Content:
    def __init__(self, content_data):
        self.id = str(content_data.get('_id'))
        self.title = content_data.get('title')
        self.content_type = content_data.get('content_type')  # 'announcement', 'homepage', 'instruction'
        self.content = content_data.get('content')
        self.image_url = content_data.get('image_url')
        self.is_active = content_data.get('is_active', True)
        self.priority = content_data.get('priority', 1)  # 1-5, higher = more important
        self.start_date = content_data.get('start_date')
        self.end_date = content_data.get('end_date')
        self.created_by = content_data.get('created_by')
        self.created_at = content_data.get('created_at', datetime.utcnow())
        self.updated_at = content_data.get('updated_at', datetime.utcnow())
        self.view_count = content_data.get('view_count', 0)
        self.tags = content_data.get('tags', [])

    @staticmethod
    def create_content(content_data):
        """Create new content"""
        db = get_db()
        
        content_doc = {
            "title": content_data['title'],
            "content_type": content_data['content_type'],
            "content": content_data.get('content', ''),
            "image_url": content_data.get('image_url'),
            "is_active": content_data.get('is_active', True),
            "priority": content_data.get('priority', 1),
            "start_date": content_data.get('start_date'),
            "end_date": content_data.get('end_date'),
            "created_by": content_data['created_by'],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "view_count": 0,
            "tags": content_data.get('tags', [])
        }
        
        result = db.content.insert_one(content_doc)
        return str(result.inserted_id)

    @staticmethod
    def upload_image(image_data):
        """Upload and store image for content"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            
            # Generate unique filename
            filename = f"content_{uuid.uuid4().hex}.png"
            
            # Create uploads directory if it doesn't exist
            upload_dir = "uploads/content_images"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Save image
            filepath = os.path.join(upload_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            return f"/uploads/content_images/{filename}"
        except Exception as e:
            print(f"Error uploading image: {e}")
            return None

    @staticmethod
    def get_by_id(content_id):
        """Get content by ID"""
        db = get_db()
        content = db.content.find_one({"_id": ObjectId(content_id)})
        return Content(content) if content else None

    @staticmethod
    def get_active_content(content_type=None):
        """Get active content, optionally filtered by type"""
        db = get_db()
        query = {"is_active": True}
        
        if content_type:
            query["content_type"] = content_type
        
        # Add date range filter if start_date and end_date are set
        now = datetime.utcnow()
        query["$or"] = [
            {"start_date": {"$exists": False}},
            {"start_date": {"$lte": now}}
        ]
        query["$and"] = [
            {"$or": [
                {"end_date": {"$exists": False}},
                {"end_date": {"$gte": now}}
            ]}
        ]
        
        content_list = list(db.content.find(query).sort("priority", -1).sort("created_at", -1))
        return [Content(content) for content in content_list]

    @staticmethod
    def get_all_content():
        """Get all content (admin)"""
        db = get_db()
        content_list = list(db.content.find().sort("created_at", -1))
        return [Content(content) for content in content_list]

    def update_content(self, update_data):
        """Update content"""
        db = get_db()
        allowed_fields = [
            'title', 'content', 'image_url', 'is_active', 'priority',
            'start_date', 'end_date', 'tags'
        ]
        update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
        update_fields['updated_at'] = datetime.utcnow()
        
        if update_fields:
            db.content.update_one(
                {"_id": ObjectId(self.id)},
                {"$set": update_fields}
            )
            return True
        return False

    def delete_content(self):
        """Delete content"""
        db = get_db()
        db.content.delete_one({"_id": ObjectId(self.id)})
        return True

    def increment_view_count(self):
        """Increment view count"""
        db = get_db()
        db.content.update_one(
            {"_id": ObjectId(self.id)},
            {"$inc": {"view_count": 1}}
        )
        self.view_count += 1

    def to_dict(self):
        """Convert content to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "content_type": self.content_type,
            "content": self.content,
            "image_url": self.image_url,
            "is_active": self.is_active,
            "priority": self.priority,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "view_count": self.view_count,
            "tags": self.tags
        } 