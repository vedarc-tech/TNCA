from models.database import get_db
from datetime import datetime, timedelta
from bson import ObjectId
import random
import math

class Tournament:
    def __init__(self, tournament_data):
        self.id = str(tournament_data.get('_id'))
        self.name = tournament_data.get('name')
        self.description = tournament_data.get('description')
        self.game_id = str(tournament_data.get('game_id'))
        self.tournament_type = tournament_data.get('tournament_type', 'single_elimination')  # single_elimination, double_elimination, round_robin
        self.status = tournament_data.get('status', 'registration')  # registration, active, completed, cancelled
        self.max_participants = tournament_data.get('max_participants', 32)
        self.current_participants = tournament_data.get('current_participants', 0)
        self.start_date = tournament_data.get('start_date')
        self.end_date = tournament_data.get('end_date')
        self.registration_deadline = tournament_data.get('registration_deadline')
        self.prize_pool = tournament_data.get('prize_pool', {})
        self.rules = tournament_data.get('rules', [])
        self.brackets = tournament_data.get('brackets', [])
        self.matches = tournament_data.get('matches', [])
        self.participants = tournament_data.get('participants', [])
        self.winner_id = str(tournament_data.get('winner_id')) if tournament_data.get('winner_id') else None
        self.created_by = str(tournament_data.get('created_by'))
        self.created_at = tournament_data.get('created_at', datetime.utcnow())
        self.updated_at = tournament_data.get('updated_at', datetime.utcnow())

    @staticmethod
    def create_tournament(tournament_data):
        """Create a new tournament"""
        db = get_db()
        
        # Set default dates if not provided
        if not tournament_data.get('start_date'):
            tournament_data['start_date'] = datetime.utcnow() + timedelta(days=7)
        if not tournament_data.get('registration_deadline'):
            tournament_data['registration_deadline'] = datetime.utcnow() + timedelta(days=6)
        if not tournament_data.get('end_date'):
            tournament_data['end_date'] = tournament_data['start_date'] + timedelta(days=3)
        
        tournament_data.update({
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'current_participants': 0,
            'brackets': [],
            'matches': [],
            'participants': []
        })
        
        result = db.tournaments.insert_one(tournament_data)
        tournament_data['_id'] = result.inserted_id
        
        return Tournament(tournament_data)

    @staticmethod
    def get_all_tournaments():
        """Get all tournaments"""
        db = get_db()
        tournaments_data = db.tournaments.find().sort('created_at', -1)
        return [Tournament(tournament_data) for tournament_data in tournaments_data]

    @staticmethod
    def get_active_tournaments():
        """Get active tournaments"""
        db = get_db()
        tournaments_data = db.tournaments.find({
            'status': {'$in': ['registration', 'active']}
        }).sort('start_date', 1)
        return [Tournament(tournament_data) for tournament_data in tournaments_data]

    @staticmethod
    def get_by_id(tournament_id):
        """Get tournament by ID"""
        db = get_db()
        tournament_data = db.tournaments.find_one({'_id': ObjectId(tournament_id)})
        return Tournament(tournament_data) if tournament_data else None

    def register_participant(self, user_id):
        """Register a user for the tournament"""
        db = get_db()
        
        if self.status != 'registration':
            raise ValueError('Tournament registration is closed')
        
        if self.current_participants >= self.max_participants:
            raise ValueError('Tournament is full')
        
        # Check if user is already registered
        if str(user_id) in [str(p['user_id']) for p in self.participants]:
            raise ValueError('User is already registered')
        
        # Add participant
        participant_data = {
            'user_id': ObjectId(user_id),
            'registered_at': datetime.utcnow(),
            'status': 'active',
            'matches_won': 0,
            'matches_lost': 0,
            'total_score': 0
        }
        
        db.tournaments.update_one(
            {'_id': ObjectId(self.id)},
            {
                '$push': {'participants': participant_data},
                '$inc': {'current_participants': 1},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        self.participants.append(participant_data)
        self.current_participants += 1

    def start_tournament(self):
        """Start the tournament and generate brackets"""
        db = get_db()
        
        if self.status != 'registration':
            raise ValueError('Tournament cannot be started')
        
        if self.current_participants < 2:
            raise ValueError('Need at least 2 participants to start tournament')
        
        # Generate brackets based on tournament type
        if self.tournament_type == 'single_elimination':
            brackets = self.generate_single_elimination_brackets()
        elif self.tournament_type == 'double_elimination':
            brackets = self.generate_double_elimination_brackets()
        else:  # round_robin
            brackets = self.generate_round_robin_brackets()
        
        # Update tournament status
        db.tournaments.update_one(
            {'_id': ObjectId(self.id)},
            {
                '$set': {
                    'status': 'active',
                    'brackets': brackets,
                    'start_date': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        self.status = 'active'
        self.brackets = brackets
        self.start_date = datetime.utcnow()

    def generate_single_elimination_brackets(self):
        """Generate single elimination brackets"""
        participants = [str(p['user_id']) for p in self.participants]
        random.shuffle(participants)
        
        # Ensure even number of participants
        if len(participants) % 2 != 0:
            participants.append('bye')  # Bye round
        
        brackets = []
        round_num = 1
        
        while len(participants) > 1:
            round_matches = []
            for i in range(0, len(participants), 2):
                if i + 1 < len(participants):
                    match = {
                        'match_id': f'round_{round_num}_match_{i//2}',
                        'round': round_num,
                        'player1_id': participants[i],
                        'player2_id': participants[i + 1],
                        'winner_id': None,
                        'status': 'pending',
                        'scheduled_time': None,
                        'completed_time': None,
                        'player1_score': 0,
                        'player2_score': 0
                    }
                    round_matches.append(match)
                else:
                    # Handle bye
                    if participants[i] != 'bye':
                        match = {
                            'match_id': f'round_{round_num}_match_{i//2}',
                            'round': round_num,
                            'player1_id': participants[i],
                            'player2_id': 'bye',
                            'winner_id': participants[i],
                            'status': 'completed',
                            'scheduled_time': datetime.utcnow(),
                            'completed_time': datetime.utcnow(),
                            'player1_score': 1,
                            'player2_score': 0
                        }
                        round_matches.append(match)
            
            brackets.append({
                'round': round_num,
                'matches': round_matches
            })
            
            # Prepare next round participants
            next_round = []
            for match in round_matches:
                if match['winner_id'] and match['winner_id'] != 'bye':
                    next_round.append(match['winner_id'])
            
            participants = next_round
            round_num += 1
        
        return brackets

    def generate_double_elimination_brackets(self):
        """Generate double elimination brackets"""
        # Simplified double elimination - can be enhanced
        return self.generate_single_elimination_brackets()

    def generate_round_robin_brackets(self):
        """Generate round robin brackets"""
        participants = [str(p['user_id']) for p in self.participants]
        brackets = []
        
        # Generate all possible pairs
        matches = []
        for i in range(len(participants)):
            for j in range(i + 1, len(participants)):
                match = {
                    'match_id': f'rr_match_{len(matches)}',
                    'round': 1,
                    'player1_id': participants[i],
                    'player2_id': participants[j],
                    'winner_id': None,
                    'status': 'pending',
                    'scheduled_time': None,
                    'completed_time': None,
                    'player1_score': 0,
                    'player2_score': 0
                }
                matches.append(match)
        
        brackets.append({
            'round': 1,
            'matches': matches
        })
        
        return brackets

    def update_match_result(self, match_id, winner_id, player1_score, player2_score):
        """Update match result and advance tournament"""
        db = get_db()
        
        # Find and update the match
        for bracket in self.brackets:
            for match in bracket['matches']:
                if match['match_id'] == match_id:
                    match['winner_id'] = winner_id
                    match['status'] = 'completed'
                    match['completed_time'] = datetime.utcnow()
                    match['player1_score'] = player1_score
                    match['player2_score'] = player2_score
                    
                    # Update tournament in database
                    db.tournaments.update_one(
                        {'_id': ObjectId(self.id)},
                        {
                            '$set': {
                                'brackets': self.brackets,
                                'updated_at': datetime.utcnow()
                            }
                        }
                    )
                    
                    # Check if tournament is complete
                    self.check_tournament_completion()
                    return True
        
        return False

    def check_tournament_completion(self):
        """Check if tournament is complete and set winner"""
        db = get_db()
        
        # For single elimination, check if final match is complete
        if self.tournament_type == 'single_elimination':
            final_bracket = self.brackets[-1] if self.brackets else None
            if final_bracket and len(final_bracket['matches']) == 1:
                final_match = final_bracket['matches'][0]
                if final_match['status'] == 'completed' and final_match['winner_id']:
                    # Tournament complete
                    db.tournaments.update_one(
                        {'_id': ObjectId(self.id)},
                        {
                            '$set': {
                                'status': 'completed',
                                'winner_id': ObjectId(final_match['winner_id']),
                                'end_date': datetime.utcnow(),
                                'updated_at': datetime.utcnow()
                            }
                        }
                    )
                    self.status = 'completed'
                    self.winner_id = final_match['winner_id']
                    self.end_date = datetime.utcnow()

    def get_tournament_progress(self):
        """Get tournament progress information"""
        total_matches = sum(len(bracket['matches']) for bracket in self.brackets)
        completed_matches = sum(
            len([m for m in bracket['matches'] if m['status'] == 'completed'])
            for bracket in self.brackets
        )
        
        return {
            'total_matches': total_matches,
            'completed_matches': completed_matches,
            'progress_percentage': (completed_matches / total_matches * 100) if total_matches > 0 else 0,
            'current_round': max([bracket['round'] for bracket in self.brackets]) if self.brackets else 0
        }

    def get_participant_stats(self, user_id):
        """Get participant statistics"""
        for participant in self.participants:
            if str(participant['user_id']) == str(user_id):
                return participant
        return None

    def to_dict(self):
        """Convert tournament to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'game_id': self.game_id,
            'tournament_type': self.tournament_type,
            'status': self.status,
            'max_participants': self.max_participants,
            'current_participants': self.current_participants,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'registration_deadline': self.registration_deadline.isoformat() if self.registration_deadline else None,
            'prize_pool': self.prize_pool,
            'rules': self.rules,
            'brackets': self.brackets,
            'matches': self.matches,
            'participants': self.participants,
            'winner_id': self.winner_id,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 