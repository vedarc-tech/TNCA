from models.database import get_db
from datetime import datetime
from bson import ObjectId

class Match:
    def __init__(self, match_data):
        self.id = str(match_data.get('_id'))
        self.challenger_id = str(match_data.get('challenger_id'))
        self.opponent_id = str(match_data.get('opponent_id'))
        self.game_id = str(match_data.get('game_id'))
        self.level_id = str(match_data.get('level_id'))
        self.status = match_data.get('status', 'pending')  # pending, active, completed, declined
        self.challenger_solution = match_data.get('challenger_solution')
        self.opponent_solution = match_data.get('opponent_solution')
        self.challenger_time = match_data.get('challenger_time', 0)
        self.opponent_time = match_data.get('opponent_time', 0)
        self.challenger_score = match_data.get('challenger_score', 0)
        self.opponent_score = match_data.get('opponent_score', 0)
        self.winner_id = str(match_data.get('winner_id')) if match_data.get('winner_id') else None
        self.created_at = match_data.get('created_at', datetime.utcnow())
        self.updated_at = match_data.get('updated_at', datetime.utcnow())
        self.completed_at = match_data.get('completed_at')
        
        # New fields for enhanced functionality
        self.match_type = match_data.get('match_type', 'student_vs_student')  # student_vs_student, student_vs_admin, admin_vs_student
        self.cube_type = match_data.get('cube_type', '3x3')
        self.chess_mode = match_data.get('chess_mode', 'standard')
        self.is_admin_challenge = match_data.get('is_admin_challenge', False)

    @staticmethod
    def create_match(challenger_id, opponent_id, game_id, level_id, match_type='student_vs_student', cube_type=None, chess_mode=None):
        """Create a new match"""
        db = get_db()
        
        # Check if opponent exists and get their role
        opponent = db.users.find_one({'_id': ObjectId(opponent_id)})
        challenger = db.users.find_one({'_id': ObjectId(challenger_id)})
        
        if not opponent or not challenger:
            raise ValueError('Invalid opponent or challenger')
        
        # Determine match type based on roles
        challenger_role = challenger.get('role', 'user')
        opponent_role = opponent.get('role', 'user')
        
        if challenger_role in ['admin', 'super_admin'] and opponent_role == 'user':
            match_type = 'admin_vs_student'
            is_admin_challenge = True
        elif challenger_role == 'user' and opponent_role in ['admin', 'super_admin']:
            match_type = 'student_vs_admin'
            is_admin_challenge = True
        else:
            match_type = 'student_vs_student'
            is_admin_challenge = False
        
        match_data = {
            'challenger_id': ObjectId(challenger_id),
            'opponent_id': ObjectId(opponent_id),
            'game_id': ObjectId(game_id),
            'level_id': level_id,
            'status': 'pending',
            'match_type': match_type,
            'is_admin_challenge': is_admin_challenge,
            'cube_type': cube_type,
            'chess_mode': chess_mode,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.matches.insert_one(match_data)
        match_data['_id'] = result.inserted_id
        
        # Increment total matches for the game
        db.games.update_one(
            {'_id': ObjectId(game_id)},
            {'$inc': {'total_matches': 1}}
        )
        
        return Match(match_data)

    @staticmethod
    def create_admin_challenge(admin_id, student_id, game_id, level_id, cube_type=None, chess_mode=None):
        """Create an admin challenge to a student"""
        return Match.create_match(
            challenger_id=admin_id,
            opponent_id=student_id,
            game_id=game_id,
            level_id=level_id,
            match_type='admin_vs_student',
            cube_type=cube_type,
            chess_mode=chess_mode
        )

    @staticmethod
    def create_student_challenge_to_admin(student_id, admin_id, game_id, level_id, cube_type=None, chess_mode=None):
        """Create a student challenge to an admin"""
        return Match.create_match(
            challenger_id=student_id,
            opponent_id=admin_id,
            game_id=game_id,
            level_id=level_id,
            match_type='student_vs_admin',
            cube_type=cube_type,
            chess_mode=chess_mode
        )

    @staticmethod
    def get_by_id(match_id):
        """Get match by ID"""
        db = get_db()
        match_data = db.matches.find_one({'_id': ObjectId(match_id)})
        return Match(match_data) if match_data else None

    @staticmethod
    def get_user_matches(user_id):
        """Get all matches for a user"""
        db = get_db()
        matches_data = db.matches.find({
            '$or': [
                {'challenger_id': ObjectId(user_id)},
                {'opponent_id': ObjectId(user_id)}
            ]
        }).sort('created_at', -1)
        
        return [Match(match_data) for match_data in matches_data]

    @staticmethod
    def get_pending_matches(user_id):
        """Get pending matches for a user"""
        db = get_db()
        matches_data = db.matches.find({
            'opponent_id': ObjectId(user_id),
            'status': 'pending'
        }).sort('created_at', -1)
        
        return [Match(match_data) for match_data in matches_data]

    @staticmethod
    def get_admin_challenges(user_id):
        """Get admin challenges for a user (student)"""
        db = get_db()
        matches_data = db.matches.find({
            'opponent_id': ObjectId(user_id),
            'match_type': 'admin_vs_student',
            'status': 'pending'
        }).sort('created_at', -1)
        
        return [Match(match_data) for match_data in matches_data]

    @staticmethod
    def get_student_challenges_to_admin(admin_id):
        """Get student challenges to an admin"""
        db = get_db()
        matches_data = db.matches.find({
            'opponent_id': ObjectId(admin_id),
            'match_type': 'student_vs_admin',
            'status': 'pending'
        }).sort('created_at', -1)
        
        return [Match(match_data) for match_data in matches_data]

    def accept(self):
        """Accept a match"""
        db = get_db()
        self.status = 'active'
        self.updated_at = datetime.utcnow()
        
        db.matches.update_one(
            {'_id': ObjectId(self.id)},
            {
                '$set': {
                    'status': 'active',
                    'updated_at': datetime.utcnow()
                }
            }
        )

    def decline(self):
        """Decline a match"""
        db = get_db()
        self.status = 'declined'
        self.updated_at = datetime.utcnow()
        
        db.matches.update_one(
            {'_id': ObjectId(self.id)},
            {
                '$set': {
                    'status': 'declined',
                    'updated_at': datetime.utcnow()
                }
            }
        )

    def submit_solution(self, user_id, solution, time_taken):
        """Submit solution for a match"""
        db = get_db()
        
        # Determine if user is challenger or opponent
        is_challenger = str(user_id) == self.challenger_id
        
        if is_challenger:
            self.challenger_solution = solution
            self.challenger_time = time_taken
        else:
            self.opponent_solution = solution
            self.opponent_time = time_taken
        
        # Calculate score (this would use the same logic as the Game model)
        score = self.calculate_score(solution, time_taken)
        
        if is_challenger:
            self.challenger_score = score
        else:
            self.opponent_score = score
        
        # Update match
        update_data = {
            'updated_at': datetime.utcnow()
        }
        
        if is_challenger:
            update_data.update({
                'challenger_solution': solution,
                'challenger_time': time_taken,
                'challenger_score': score
            })
        else:
            update_data.update({
                'opponent_solution': solution,
                'opponent_time': time_taken,
                'opponent_score': score
            })
        
        db.matches.update_one(
            {'_id': ObjectId(self.id)},
            {'$set': update_data}
        )
        
        # Check if both players have submitted solutions
        if self.challenger_solution and self.opponent_solution:
            self.complete_match()
        
        return {
            'score': score,
            'time_taken': time_taken,
            'match_completed': bool(self.challenger_solution and self.opponent_solution)
        }

    def complete_match(self):
        """Complete the match and determine winner"""
        db = get_db()
        
        # Determine winner based on score and time
        if self.challenger_score > self.opponent_score:
            winner_id = self.challenger_id
        elif self.opponent_score > self.challenger_score:
            winner_id = self.opponent_id
        else:
            # Tie - winner is the one who solved faster
            winner_id = self.challenger_id if self.challenger_time < self.opponent_time else self.opponent_id
        
        self.winner_id = winner_id
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        
        # Update match
        db.matches.update_one(
            {'_id': ObjectId(self.id)},
            {
                '$set': {
                    'winner_id': ObjectId(winner_id),
                    'status': 'completed',
                    'completed_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        # Update user stats
        self.update_user_stats()

    def calculate_score(self, solution, time_taken):
        """Calculate score for a solution"""
        # This should use the same logic as the Game model
        # Score calculation should be based on:
        # - Solution correctness
        # - Time taken vs time limit
        # - Difficulty level
        # - Game type specific factors
        
        # Placeholder for actual score calculation logic
        # TODO: Implement proper score calculation based on game type and solution validation
        return 0  # Default to 0 until proper calculation is implemented

    def update_user_stats(self):
        """Update user statistics after match completion"""
        db = get_db()
        
        # Update challenger stats
        db.user_match_stats.update_one(
            {
                'user_id': ObjectId(self.challenger_id),
                'game_id': ObjectId(self.game_id)
            },
            {
                '$inc': {
                    'total_matches': 1,
                    'wins': 1 if self.winner_id == self.challenger_id else 0,
                    'total_score': self.challenger_score,
                    'admin_matches': 1 if self.is_admin_challenge else 0,
                    'admin_wins': 1 if self.is_admin_challenge and self.winner_id == self.challenger_id else 0
                },
                '$set': {
                    'last_match': datetime.utcnow()
                }
            },
            upsert=True
        )
        
        # Update opponent stats
        db.user_match_stats.update_one(
            {
                'user_id': ObjectId(self.opponent_id),
                'game_id': ObjectId(self.game_id)
            },
            {
                '$inc': {
                    'total_matches': 1,
                    'wins': 1 if self.winner_id == self.opponent_id else 0,
                    'total_score': self.opponent_score,
                    'admin_matches': 1 if self.is_admin_challenge else 0,
                    'admin_wins': 1 if self.is_admin_challenge and self.winner_id == self.opponent_id else 0
                },
                '$set': {
                    'last_match': datetime.utcnow()
                }
            },
            upsert=True
        )

    def get_match_details(self):
        """Get detailed match information including user names"""
        db = get_db()
        
        # Get challenger info
        challenger = db.users.find_one({'_id': ObjectId(self.challenger_id)})
        opponent = db.users.find_one({'_id': ObjectId(self.opponent_id)})
        game = db.games.find_one({'_id': ObjectId(self.game_id)})
        
        return {
            'id': self.id,
            'challenger': {
                'id': self.challenger_id,
                'name': challenger.get('name') if challenger else 'Unknown',
                'username': challenger.get('username') if challenger else 'unknown',
                'role': challenger.get('role') if challenger else 'user'
            },
            'opponent': {
                'id': self.opponent_id,
                'name': opponent.get('name') if opponent else 'Unknown',
                'username': opponent.get('username') if opponent else 'unknown',
                'role': opponent.get('role') if opponent else 'user'
            },
            'game': {
                'id': self.game_id,
                'name': game.get('name') if game else 'Unknown',
                'type': game.get('type') if game else 'unknown'
            },
            'status': self.status,
            'match_type': self.match_type,
            'is_admin_challenge': self.is_admin_challenge,
            'cube_type': self.cube_type,
            'chess_mode': self.chess_mode,
            'challenger_score': self.challenger_score,
            'opponent_score': self.opponent_score,
            'challenger_time': self.challenger_time,
            'opponent_time': self.opponent_time,
            'winner_id': self.winner_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

    def to_dict(self):
        """Convert match to dictionary"""
        return {
            'id': self.id,
            'challenger_id': self.challenger_id,
            'opponent_id': self.opponent_id,
            'game_id': self.game_id,
            'level_id': self.level_id,
            'status': self.status,
            'match_type': self.match_type,
            'is_admin_challenge': self.is_admin_challenge,
            'cube_type': self.cube_type,
            'chess_mode': self.chess_mode,
            'challenger_score': self.challenger_score,
            'opponent_score': self.opponent_score,
            'challenger_time': self.challenger_time,
            'opponent_time': self.opponent_time,
            'winner_id': self.winner_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        } 