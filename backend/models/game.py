from models.database import get_db
from datetime import datetime
from bson import ObjectId
import random

class Game:
    def __init__(self, game_data):
        self.id = str(game_data.get('_id'))
        self.name = game_data.get('name')
        self.description = game_data.get('description')
        self.type = game_data.get('type')  # 'chess' or 'cube'
        self.difficulty = game_data.get('difficulty')
        self.is_active = game_data.get('is_active', True)
        self.is_locked = game_data.get('is_locked', False)
        self.max_levels = game_data.get('max_levels', 10)
        self.time_limit = game_data.get('time_limit', 300)
        self.total_plays = game_data.get('total_plays', 0)
        self.total_matches = game_data.get('total_matches', 0)
        self.average_score = game_data.get('average_score', 0)
        self.created_at = game_data.get('created_at', datetime.utcnow())
        self.updated_at = game_data.get('updated_at', datetime.utcnow())
        
        # New fields for enhanced functionality
        self.game_modes = game_data.get('game_modes', [])
        self.cube_types = game_data.get('cube_types', [])
        self.allow_admin_challenges = game_data.get('allow_admin_challenges', True)
        self.unlimited_levels = game_data.get('unlimited_levels', False)

    @staticmethod
    def get_all_games():
        """Get all games (admin)"""
        db = get_db()
        games_data = db.games.find()
        return [Game(game_data) for game_data in games_data]

    @staticmethod
    def get_available_games():
        """Get available games for users"""
        db = get_db()
        games_data = db.games.find({
            'is_active': True,
            'is_locked': False
        })
        return [Game(game_data) for game_data in games_data]

    @staticmethod
    def get_by_id(game_id):
        """Get game by ID"""
        db = get_db()
        game_data = db.games.find_one({'_id': ObjectId(game_id)})
        return Game(game_data) if game_data else None

    def toggle_lock(self):
        """Toggle game lock status"""
        db = get_db()
        self.is_locked = not self.is_locked
        db.games.update_one(
            {'_id': ObjectId(self.id)},
            {
                '$set': {
                    'is_locked': self.is_locked,
                    'updated_at': datetime.utcnow()
                }
            }
        )

    def toggle_status(self):
        """Toggle game active status"""
        db = get_db()
        self.is_active = not self.is_active
        db.games.update_one(
            {'_id': ObjectId(self.id)},
            {
                '$set': {
                    'is_active': self.is_active,
                    'updated_at': datetime.utcnow()
                }
            }
        )

    def update_settings(self, settings_data):
        """Update game settings"""
        db = get_db()
        settings_data['updated_at'] = datetime.utcnow()
        
        # Update instance attributes
        for key, value in settings_data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
        db.games.update_one(
            {'_id': ObjectId(self.id)},
            {'$set': settings_data}
        )

    def get_levels(self, user_id=None, limit=None):
        """Get levels for this game with user progress"""
        db = get_db()
        
        # For chess, generate unlimited levels dynamically
        if self.type == 'chess' and self.unlimited_levels:
            return self.generate_chess_levels(user_id, limit)
        
        # For cube, get specific cube type levels
        if self.type == 'cube':
            return self.get_cube_levels(user_id)
        
        # Default level fetching
        levels_data = db.game_levels.find({
            'game_id': ObjectId(self.id)
        }).sort('level_number', 1)
        
        if limit:
            levels_data = levels_data.limit(limit)
        
        levels = []
        for level_data in levels_data:
            level_info = {
                'id': str(level_data['_id']),
                'level_number': level_data['level_number'],
                'title': level_data['title'],
                'description': level_data['description'],
                'difficulty': level_data['difficulty'],
                'time_limit': level_data.get('time_limit', self.time_limit),
                'points': level_data.get('points', 100),
                'mode': level_data.get('mode', 'standard'),
                'cube_type': level_data.get('cube_type', '3x3')
            }
            
            # Add user progress if user_id provided
            if user_id:
                progress = self.get_user_level_progress(user_id, str(level_data['_id']))
                level_info.update(progress)
            
            levels.append(level_info)
        
        return levels

    def generate_chess_levels(self, user_id=None, limit=50):
        """Generate unlimited chess levels dynamically"""
        db = get_db()
        
        # Get user's highest completed level
        highest_level = 0
        if user_id:
            user_progress = db.user_game_progress.find_one({
                'user_id': ObjectId(user_id),
                'game_id': ObjectId(self.id)
            })
            if user_progress:
                highest_level = user_progress.get('highest_level', 0)
        
        levels = []
        start_level = max(1, highest_level - 5)  # Show 5 levels before highest
        end_level = start_level + (limit or 50)
        
        for level_num in range(start_level, end_level + 1):
            # Generate chess puzzle based on level
            puzzle_data = self.generate_chess_puzzle(level_num)
            
            level_info = {
                'id': f'chess_level_{level_num}',
                'level_number': level_num,
                'title': f'Chess Level {level_num}',
                'description': puzzle_data['description'],
                'difficulty': puzzle_data['difficulty'],
                'time_limit': puzzle_data['time_limit'],
                'points': puzzle_data['points'],
                'mode': puzzle_data['mode'],
                'puzzle_data': puzzle_data['puzzle'],
                'is_completed': False,
                'best_time': 0,
                'best_score': 0
            }
            
            # Add user progress if available
            if user_id:
                progress = self.get_user_level_progress(user_id, f'chess_level_{level_num}')
                level_info.update(progress)
            
            levels.append(level_info)
        
        return levels

    def generate_chess_puzzle(self, level_number):
        """Generate chess puzzle based on level number"""
        # Define chess modes and difficulties
        modes = ['checkmate', 'tactics', 'endgame', 'opening', 'strategy']
        difficulties = ['beginner', 'intermediate', 'advanced', 'expert', 'master']
        
        # Determine mode and difficulty based on level
        mode_index = (level_number - 1) % len(modes)
        difficulty_index = min((level_number - 1) // 10, len(difficulties) - 1)
        
        mode = modes[mode_index]
        difficulty = difficulties[difficulty_index]
        
        # Generate puzzle data
        puzzle_data = {
            'mode': mode,
            'difficulty': difficulty,
            'time_limit': max(60, 600 - (level_number * 10)),  # Decreasing time limit
            'points': 100 + (level_number * 25),  # Increasing points
            'description': f'{difficulty.title()} {mode.title()} puzzle - Level {level_number}',
            'puzzle': {
                'type': mode,
                'level': level_number,
                'difficulty': difficulty,
                'pieces': self.generate_chess_position(level_number, mode),
                'objective': self.get_chess_objective(mode, level_number),
                'hints': self.generate_chess_hints(level_number, mode)
            }
        }
        
        return puzzle_data

    def generate_chess_position(self, level, mode):
        """Generate chess position for the puzzle"""
        # TODO: Implement actual chess position generation
        # This should contain real chess position data in FEN format
        # For now, returning placeholder data structure
        
        return {
            'board': f'position_{level}_{mode}',
            'active_color': 'white' if level % 2 == 1 else 'black',
            'castling_rights': 'KQkq',
            'en_passant': None,
            'halfmove_clock': 0,
            'fullmove_number': level
        }

    def get_chess_objective(self, mode, level):
        """Get chess puzzle objective"""
        objectives = {
            'checkmate': f'Checkmate in {max(1, 10 - level // 5)} moves',
            'tactics': f'Find the best tactical move',
            'endgame': f'Win the endgame in {max(3, 15 - level // 3)} moves',
            'opening': f'Find the best opening move',
            'strategy': f'Develop a winning strategy'
        }
        return objectives.get(mode, 'Solve the puzzle')

    def generate_chess_hints(self, level, mode):
        """Generate hints for chess puzzle"""
        hints = []
        if level <= 5:
            hints.append('Look for basic checkmate patterns')
        elif level <= 10:
            hints.append('Consider piece coordination')
        elif level <= 15:
            hints.append('Think about positional advantages')
        else:
            hints.append('Advanced tactical thinking required')
        
        return hints

    def get_cube_levels(self, user_id=None):
        """Get cube levels organized by cube type"""
        db = get_db()
        
        # Define all cube types
        cube_types = {
            'standard': ['2x2', '3x3', '4x4', '5x5', '6x6', '7x7', '8x8'],
            'shape_mod': ['Mirror Cube', 'Ghost Cube', 'Windmill Cube', 'Axis Cube', 'Fisher Cube', 'Mastermorphix', 'Void Cube'],
            'non_cubic': ['Pyraminx', 'Megaminx', 'Gigaminx', 'Kilominx', 'Skewb', 'Skewb Ultimate', 'Curvy Copter', 'Square-1'],
            'cuboids': ['2x2x3', '3x3x2', '3x3x9', '1x3x3', '2x2x4', '3x3x4'],
            'advanced': ['Multi-layered Mirror', 'Ghost 4x4', 'Ghost 5x5', 'Petaminx', 'Redi Cube', 'Helicopter Cube']
        }
        
        levels = []
        
        for category, cube_list in cube_types.items():
            for cube_type in cube_list:
                level_info = {
                    'id': f'cube_{category}_{cube_type.replace(" ", "_").lower()}',
                    'level_number': len(levels) + 1,
                    'title': f'{cube_type} Challenge',
                    'description': f'Solve the {cube_type} cube',
                    'difficulty': self.get_cube_difficulty(cube_type),
                    'time_limit': self.get_cube_time_limit(cube_type),
                    'points': self.get_cube_points(cube_type),
                    'mode': 'speed_solve',
                    'cube_type': cube_type,
                    'category': category,
                    'is_completed': False,
                    'best_time': 0,
                    'best_score': 0,
                    'attempts': 0
                }
                
                # Add user progress if available
                if user_id:
                    progress = self.get_user_level_progress(user_id, level_info['id'])
                    level_info.update(progress)
                
                levels.append(level_info)
        
        return levels

    def get_cube_difficulty(self, cube_type):
        """Get difficulty for cube type"""
        difficulties = {
            '2x2': 'beginner',
            '3x3': 'beginner',
            '4x4': 'intermediate',
            '5x5': 'intermediate',
            '6x6': 'advanced',
            '7x7': 'advanced',
            '8x8': 'expert',
            'Mirror Cube': 'intermediate',
            'Ghost Cube': 'advanced',
            'Pyraminx': 'beginner',
            'Megaminx': 'advanced',
            'Square-1': 'expert'
        }
        return difficulties.get(cube_type, 'intermediate')

    def get_cube_time_limit(self, cube_type):
        """Get time limit for cube type"""
        time_limits = {
            '2x2': 30,
            '3x3': 60,
            '4x4': 180,
            '5x5': 300,
            '6x6': 600,
            '7x7': 900,
            '8x8': 1200,
            'Pyraminx': 45,
            'Megaminx': 600,
            'Square-1': 120
        }
        return time_limits.get(cube_type, 300)

    def get_cube_points(self, cube_type):
        """Get points for cube type"""
        base_points = {
            '2x2': 50,
            '3x3': 100,
            '4x4': 200,
            '5x5': 300,
            '6x6': 400,
            '7x7': 500,
            '8x8': 600,
            'Pyraminx': 75,
            'Megaminx': 400,
            'Square-1': 250
        }
        return base_points.get(cube_type, 150)

    def get_user_level_progress(self, user_id, level_id):
        """Get user progress for a specific level"""
        db = get_db()
        
        progress = db.user_level_progress.find_one({
            'user_id': ObjectId(user_id),
            'level_id': level_id
        })
        
        if progress:
            return {
                'is_completed': progress.get('is_completed', False),
                'best_time': progress.get('best_time', 0),
                'best_score': progress.get('best_score', 0),
                'attempts': progress.get('attempts', 0),
                'completion_date': progress.get('completion_date')
            }
        
        return {
            'is_completed': False,
            'best_time': 0,
            'best_score': 0,
            'attempts': 0,
            'completion_date': None
        }

    def start_level(self, level_id, user_id):
        """Start a game level"""
        db = get_db()
        
        # Create game session
        session_data = {
            'user_id': ObjectId(user_id),
            'game_id': ObjectId(self.id),
            'level_id': level_id,
            'start_time': datetime.utcnow(),
            'status': 'active',
            'solution': None,
            'time_taken': 0,
            'score': 0
        }
        
        result = db.game_sessions.insert_one(session_data)
        session_data['_id'] = result.inserted_id
        
        # Increment total plays
        db.games.update_one(
            {'_id': ObjectId(self.id)},
            {'$inc': {'total_plays': 1}}
        )
        
        return {
            'session_id': str(result.inserted_id),
            'start_time': session_data['start_time'].isoformat(),
            'time_limit': self.time_limit
        }

    def submit_solution(self, level_id, user_id, solution, time_taken):
        """Submit solution for a game level"""
        db = get_db()
        
        # Get the game session
        session = db.game_sessions.find_one({
            'user_id': ObjectId(user_id),
            'game_id': ObjectId(self.id),
            'level_id': level_id,
            'status': 'active'
        })
        
        if not session:
            return {'error': 'No active session found'}
        
        # Validate solution (this would contain game-specific logic)
        is_correct = self.validate_solution(level_id, solution)
        
        # Calculate score
        score = self.calculate_score(is_correct, time_taken, self.time_limit)
        
        # Update session
        db.game_sessions.update_one(
            {'_id': session['_id']},
            {
                '$set': {
                    'solution': solution,
                    'time_taken': time_taken,
                    'score': score,
                    'status': 'completed',
                    'completed_at': datetime.utcnow()
                }
            }
        )
        
        # Update user stats and progress
        self.update_user_stats(user_id, score, is_correct)
        self.update_user_level_progress(user_id, level_id, time_taken, score, is_correct)
        
        return {
            'correct': is_correct,
            'score': score,
            'time_taken': time_taken,
            'message': 'Correct!' if is_correct else 'Try again!'
        }

    def validate_solution(self, level_id, solution):
        """Validate solution for a level (game-specific logic)"""
        # This should contain the actual validation logic for chess/cube puzzles
        # Implementation depends on the specific game type and level
        # For chess: validate move sequences, checkmate patterns, etc.
        # For cube: validate solve state, time limits, etc.
        
        # Placeholder for actual validation logic
        # TODO: Implement proper validation based on game type and level
        return False  # Default to incorrect until proper validation is implemented

    def calculate_score(self, is_correct, time_taken, time_limit):
        """Calculate score based on correctness and time"""
        if not is_correct:
            return 0
        
        # Base score for correct solution
        base_score = 100
        
        # Time bonus (faster = higher bonus)
        time_bonus = max(0, int((time_limit - time_taken) / time_limit * 50))
        
        return base_score + time_bonus

    def update_user_stats(self, user_id, score, is_correct):
        """Update user statistics"""
        db = get_db()
        
        # Update user's game stats
        db.user_game_stats.update_one(
            {
                'user_id': ObjectId(user_id),
                'game_id': ObjectId(self.id)
            },
            {
                '$inc': {
                    'total_plays': 1,
                    'total_score': score,
                    'correct_answers': 1 if is_correct else 0
                },
                '$set': {
                    'last_played': datetime.utcnow()
                }
            },
            upsert=True
        )

    def update_user_level_progress(self, user_id, level_id, time_taken, score, is_correct):
        """Update user's progress for a specific level"""
        db = get_db()
        
        # Get current progress
        current_progress = db.user_level_progress.find_one({
            'user_id': ObjectId(user_id),
            'level_id': level_id
        })
        
        if current_progress:
            # Update existing progress
            best_time = min(current_progress.get('best_time', float('inf')), time_taken) if is_correct else current_progress.get('best_time', 0)
            best_score = max(current_progress.get('best_score', 0), score)
            
            db.user_level_progress.update_one(
                {'_id': current_progress['_id']},
                {
                    '$set': {
                        'best_time': best_time,
                        'best_score': best_score,
                        'is_completed': is_correct or current_progress.get('is_completed', False),
                        'completion_date': datetime.utcnow() if is_correct and not current_progress.get('is_completed') else current_progress.get('completion_date')
                    },
                    '$inc': {
                        'attempts': 1
                    }
                }
            )
        else:
            # Create new progress record
            db.user_level_progress.insert_one({
                'user_id': ObjectId(user_id),
                'level_id': level_id,
                'game_id': ObjectId(self.id),
                'best_time': time_taken if is_correct else 0,
                'best_score': score,
                'is_completed': is_correct,
                'attempts': 1,
                'completion_date': datetime.utcnow() if is_correct else None,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            })

    def get_leaderboard(self):
        """Get leaderboard for this game"""
        db = get_db()
        
        pipeline = [
            {
                '$match': {
                    'game_id': ObjectId(self.id)
                }
            },
            {
                '$group': {
                    '_id': '$user_id',
                    'total_score': {'$sum': '$total_score'},
                    'total_plays': {'$sum': '$total_plays'},
                    'correct_answers': {'$sum': '$correct_answers'}
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {
                '$unwind': '$user'
            },
            {
                '$project': {
                    'user_id': '$_id',
                    'username': '$user.username',
                    'name': '$user.name',
                    'total_score': 1,
                    'total_plays': 1,
                    'correct_answers': 1,
                    'average_score': {
                        '$cond': [
                            {'$eq': ['$total_plays', 0]},
                            0,
                            {'$divide': ['$total_score', '$total_plays']}
                        ]
                    }
                }
            },
            {
                '$sort': {'total_score': -1}
            },
            {
                '$limit': 50
            }
        ]
        
        leaderboard = list(db.user_game_stats.aggregate(pipeline))
        
        # Add rank
        for i, entry in enumerate(leaderboard):
            entry['rank'] = i + 1
            entry['user_id'] = str(entry['user_id'])
        
        return leaderboard

    @staticmethod
    def get_global_leaderboard():
        """Get global leaderboard across all games"""
        db = get_db()
        
        pipeline = [
            {
                '$group': {
                    '_id': '$user_id',
                    'total_score': {'$sum': '$total_score'},
                    'total_plays': {'$sum': '$total_plays'},
                    'correct_answers': {'$sum': '$correct_answers'}
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {
                '$unwind': '$user'
            },
            {
                '$project': {
                    'user_id': '$_id',
                    'username': '$user.username',
                    'name': '$user.name',
                    'total_score': 1,
                    'total_plays': 1,
                    'correct_answers': 1,
                    'average_score': {
                        '$cond': [
                            {'$eq': ['$total_plays', 0]},
                            0,
                            {'$divide': ['$total_score', '$total_plays']}
                        ]
                    }
                }
            },
            {
                '$sort': {'total_score': -1}
            },
            {
                '$limit': 50
            }
        ]
        
        leaderboard = list(db.user_game_stats.aggregate(pipeline))
        
        # Add rank
        for i, entry in enumerate(leaderboard):
            entry['rank'] = i + 1
            entry['user_id'] = str(entry['user_id'])
        
        return leaderboard

    def to_dict(self):
        """Convert game to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'difficulty': self.difficulty,
            'is_active': self.is_active,
            'is_locked': self.is_locked,
            'max_levels': self.max_levels,
            'time_limit': self.time_limit,
            'total_plays': self.total_plays,
            'total_matches': self.total_matches,
            'average_score': self.average_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'game_modes': self.game_modes,
            'cube_types': self.cube_types,
            'allow_admin_challenges': self.allow_admin_challenges,
            'unlimited_levels': self.unlimited_levels
        }

    def get_user_highest_level(self, user_id):
        """Get user's highest completed level for this game"""
        db = get_db()
        progress = db.user_game_progress.find_one({
            'user_id': ObjectId(user_id),
            'game_id': ObjectId(self.id)
        })
        return progress.get('highest_level', 0) if progress else 0

    def get_user_total_plays(self, user_id):
        """Get user's total plays for this game"""
        db = get_db()
        stats = db.user_game_stats.find_one({
            'user_id': ObjectId(user_id),
            'game_id': ObjectId(self.id)
        })
        return stats.get('total_plays', 0) if stats else 0

    def get_user_best_score(self, user_id):
        """Get user's best score for this game"""
        db = get_db()
        stats = db.user_game_stats.find_one({
            'user_id': ObjectId(user_id),
            'game_id': ObjectId(self.id)
        })
        return stats.get('best_score', 0) if stats else 0 