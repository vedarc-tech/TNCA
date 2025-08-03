from models.database import get_db
from datetime import datetime
from bson import ObjectId
import os
import base64
import uuid

class Quiz:
    def __init__(self, quiz_data):
        self.id = str(quiz_data.get('_id'))
        self.title = quiz_data.get('title')
        self.description = quiz_data.get('description')
        self.category = quiz_data.get('category', 'General')
        self.difficulty = quiz_data.get('difficulty', 'Medium')
        self.time_limit = quiz_data.get('time_limit', 30)  # minutes
        self.total_marks = quiz_data.get('total_marks', 100)
        self.questions = quiz_data.get('questions', [])
        self.is_active = quiz_data.get('is_active', True)
        self.created_by = quiz_data.get('created_by')
        self.created_at = quiz_data.get('created_at', datetime.utcnow())
        self.updated_at = quiz_data.get('updated_at', datetime.utcnow())
        self.total_attempts = quiz_data.get('total_attempts', 0)
        self.average_score = quiz_data.get('average_score', 0)
        self.answer_key = quiz_data.get('answer_key', {})  # Store answer key separately
        self.allow_image_questions = quiz_data.get('allow_image_questions', True)
        self.allow_image_answers = quiz_data.get('allow_image_answers', True)

    @staticmethod
    def create_quiz(quiz_data):
        """Create a new quiz"""
        db = get_db()
        
        # Process questions and extract answer key
        questions = quiz_data.get('questions', [])
        answer_key = {}
        
        for i, question in enumerate(questions):
            # Store correct answer in answer key
            answer_key[str(i)] = {
                'correct_answer': question.get('correct_answer'),
                'correct_answer_image': question.get('correct_answer_image'),
                'explanation': question.get('explanation', ''),
                'marks': question.get('marks', 1)
            }
            
            # Remove correct answer from question for user display
            question.pop('correct_answer', None)
            question.pop('correct_answer_image', None)
            question.pop('explanation', None)
        
        quiz_doc = {
            "title": quiz_data['title'],
            "description": quiz_data.get('description', ''),
            "category": quiz_data.get('category', 'General'),
            "difficulty": quiz_data.get('difficulty', 'Medium'),
            "time_limit": quiz_data.get('time_limit', 30),
            "total_marks": quiz_data.get('total_marks', 100),
            "questions": questions,
            "answer_key": answer_key,
            "is_active": quiz_data.get('is_active', True),
            "allow_image_questions": quiz_data.get('allow_image_questions', True),
            "allow_image_answers": quiz_data.get('allow_image_answers', True),
            "created_by": quiz_data['created_by'],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "total_attempts": 0,
            "average_score": 0
        }
        
        result = db.quizzes.insert_one(quiz_doc)
        return str(result.inserted_id)

    @staticmethod
    def upload_image(image_data, image_type="question"):
        """Upload and store image for questions or answers"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            
            # Generate unique filename
            filename = f"{image_type}_{uuid.uuid4().hex}.png"
            
            # Create uploads directory if it doesn't exist
            upload_dir = "uploads/quiz_images"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Save image
            filepath = os.path.join(upload_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            return f"/uploads/quiz_images/{filename}"
        except Exception as e:
            print(f"Error uploading image: {e}")
            return None

    @staticmethod
    def get_by_id(quiz_id):
        """Get quiz by ID"""
        db = get_db()
        quiz = db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        return Quiz(quiz) if quiz else None

    @staticmethod
    def get_active_quizzes():
        """Get all active quizzes"""
        db = get_db()
        quizzes = list(db.quizzes.find({"is_active": True}))
        return [Quiz(quiz) for quiz in quizzes]

    @staticmethod
    def get_all_quizzes():
        """Get all quizzes (for admin)"""
        db = get_db()
        quizzes = list(db.quizzes.find({}))
        return [Quiz(quiz) for quiz in quizzes]

    @staticmethod
    def get_quizzes_by_category(category):
        """Get quizzes by category"""
        db = get_db()
        quizzes = list(db.quizzes.find({"category": category, "is_active": True}))
        return [Quiz(quiz) for quiz in quizzes]

    @staticmethod
    def get_quizzes_by_difficulty(difficulty):
        """Get quizzes by difficulty"""
        db = get_db()
        quizzes = list(db.quizzes.find({"difficulty": difficulty, "is_active": True}))
        return [Quiz(quiz) for quiz in quizzes]

    def update_quiz(self, update_data):
        """Update quiz"""
        db = get_db()
        allowed_fields = [
            'title', 'description', 'category', 'difficulty', 
            'time_limit', 'total_marks', 'questions', 'is_active',
            'allow_image_questions', 'allow_image_answers'
        ]
        update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
        update_fields['updated_at'] = datetime.utcnow()
        
        # Process questions and update answer key if questions are updated
        if 'questions' in update_fields:
            questions = update_fields['questions']
            answer_key = {}
            
            for i, question in enumerate(questions):
                answer_key[str(i)] = {
                    'correct_answer': question.get('correct_answer'),
                    'correct_answer_image': question.get('correct_answer_image'),
                    'explanation': question.get('explanation', ''),
                    'marks': question.get('marks', 1)
                }
                
                # Remove correct answer from question for user display
                question.pop('correct_answer', None)
                question.pop('correct_answer_image', None)
                question.pop('explanation', None)
            
            update_fields['answer_key'] = answer_key
        
        if update_fields:
            db.quizzes.update_one(
                {"_id": ObjectId(self.id)},
                {"$set": update_fields}
            )
            return True
        return False

    def delete_quiz(self):
        """Delete quiz"""
        db = get_db()
        db.quizzes.delete_one({"_id": ObjectId(self.id)})
        return True

    def deactivate_quiz(self):
        """Deactivate quiz"""
        db = get_db()
        db.quizzes.update_one(
            {"_id": ObjectId(self.id)},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        self.is_active = False

    def activate_quiz(self):
        """Activate quiz"""
        db = get_db()
        db.quizzes.update_one(
            {"_id": ObjectId(self.id)},
            {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
        )
        self.is_active = True

    def increment_attempts(self):
        """Increment total attempts"""
        db = get_db()
        db.quizzes.update_one(
            {"_id": ObjectId(self.id)},
            {"$inc": {"total_attempts": 1}}
        )
        self.total_attempts += 1

    def update_average_score(self, new_score):
        """Update average score"""
        db = get_db()
        # Calculate new average
        new_average = ((self.average_score * self.total_attempts) + new_score) / (self.total_attempts + 1)
        db.quizzes.update_one(
            {"_id": ObjectId(self.id)},
            {"$set": {"average_score": new_average}}
        )
        self.average_score = new_average

    def calculate_score(self, answers):
        """Calculate score based on answers"""
        score = 0
        total_questions = len(self.questions)
        
        for i, question in enumerate(self.questions):
            if i < len(answers):
                user_answer = answers[i]
                correct_answer_data = self.answer_key.get(str(i), {})
                correct_answer = correct_answer_data.get('correct_answer')
                marks = correct_answer_data.get('marks', 1)
                
                # Check if answer is correct (supports both text and image answers)
                if user_answer == correct_answer:
                    score += marks
        
        # Convert to percentage
        percentage = (score / self.total_marks) * 100 if self.total_marks > 0 else 0
        return {
            'score': score,
            'total_questions': total_questions,
            'percentage': percentage,
            'max_marks': self.total_marks
        }

    def to_dict(self):
        """Convert quiz to dictionary (admin view with answer key)"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "difficulty": self.difficulty,
            "time_limit": self.time_limit,
            "total_marks": self.total_marks,
            "questions": self.questions,
            "answer_key": self.answer_key,
            "is_active": self.is_active,
            "allow_image_questions": self.allow_image_questions,
            "allow_image_answers": self.allow_image_answers,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "total_attempts": self.total_attempts,
            "average_score": self.average_score
        }

    def to_dict_for_user(self):
        """Convert quiz to dictionary for user (without correct answers)"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "difficulty": self.difficulty,
            "time_limit": self.time_limit,
            "total_marks": self.total_marks,
            "questions": self.questions,
            "total_attempts": self.total_attempts,
            "average_score": self.average_score
        } 