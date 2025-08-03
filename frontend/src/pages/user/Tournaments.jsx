import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Clock, 
  Calendar,
  Target,
  Award,
  Play,
  UserCheck,
  UserX,
  Eye,
  BarChart3,
  Filter,
  Search,
  ChevronRight,
  Star,
  Crown,
  Medal,
  Zap,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBrackets, setShowBrackets] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    fetchTournaments();
    fetchMyTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tournament/tournaments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTournaments(data.data);
      } else {
        toast.error(data.message);
        setTournaments([]);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to fetch tournaments. Please try again.');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTournaments = async () => {
    try {
      const response = await fetch('/api/tournament/my-tournaments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMyTournaments(data.data);
      } else {
        toast.error(data.message);
        setMyTournaments([]);
      }
    } catch (error) {
      console.error('Error fetching my tournaments:', error);
      toast.error('Failed to fetch my tournaments. Please try again.');
      setMyTournaments([]);
    }
  };

  const handleRegister = async (tournamentId) => {
    try {
      const response = await fetch(`/api/tournament/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Successfully registered for tournament!');
        fetchTournaments();
        fetchMyTournaments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error registering for tournament:', error);
      toast.error('Failed to register for tournament. Please try again.');
    }
  };

  const handleUnregister = async (tournamentId) => {
    try {
      const response = await fetch(`/api/tournament/tournaments/${tournamentId}/unregister`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Successfully unregistered from tournament!');
        fetchTournaments();
        fetchMyTournaments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error unregistering from tournament:', error);
      toast.error('Failed to unregister from tournament. Please try again.');
    }
  };

  const handleViewDetails = async (tournament) => {
    try {
      const response = await fetch(`/api/tournament/tournaments/${tournament.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedTournament(data.data);
        setShowDetails(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      toast.error('Failed to fetch tournament details. Please try again.');
    }
  };

  const handleViewBrackets = async (tournamentId) => {
    try {
      const response = await fetch(`/api/tournament/tournaments/${tournamentId}/brackets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedTournament(data.data);
        setShowBrackets(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching tournament brackets:', error);
      toast.error('Failed to fetch tournament brackets. Please try again.');
    }
  };

  const isRegistered = (tournament) => {
    return myTournaments.some(t => t.id === tournament.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registration': return 'text-blue-400 bg-blue-600/20';
      case 'active': return 'text-green-400 bg-green-600/20';
      case 'completed': return 'text-purple-400 bg-purple-600/20';
      case 'cancelled': return 'text-red-400 bg-red-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'registration': return <UserCheck className="w-4 h-4" />;
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesStatus = filterStatus === 'all' || tournament.status === filterStatus;
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
              <p className="text-gray-600">Compete with other players in exciting tournaments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="registration">Registration Open</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* My Tournaments */}
      {myTournaments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
            My Tournaments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTournaments.map(tournament => (
              <div key={tournament.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{tournament.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                    {getStatusIcon(tournament.status)}
                    <span className="ml-1 capitalize">{tournament.status}</span>
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{tournament.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>Participants: {tournament.current_participants}/{tournament.max_participants}</span>
                  <span>{tournament.tournament_type.replace('_', ' ')}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(tournament)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1 inline" />
                    Details
                  </button>
                  {tournament.status === 'active' && (
                    <button
                      onClick={() => handleViewBrackets(tournament.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 mr-1 inline" />
                      Brackets
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Tournaments */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
          Available Tournaments
        </h2>
        
        {filteredTournaments.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tournaments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => (
              <div key={tournament.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{tournament.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                    {getStatusIcon(tournament.status)}
                    <span className="ml-1 capitalize">{tournament.status}</span>
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{tournament.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{tournament.current_participants}/{tournament.max_participants} participants</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Starts: {formatDate(tournament.start_date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Registration ends: {formatDate(tournament.registration_deadline)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Target className="w-4 h-4 mr-2" />
                    <span className="capitalize">{tournament.tournament_type.replace('_', ' ')}</span>
                  </div>
                </div>

                {tournament.prize_pool && Object.keys(tournament.prize_pool).length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Award className="w-4 h-4 mr-2 text-yellow-600" />
                      Prize Pool
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(tournament.prize_pool).map(([position, prize]) => (
                        <div key={position} className="flex justify-between text-sm">
                          <span className="text-gray-600">{position} Place:</span>
                          <span className="font-semibold text-gray-900">{prize}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {isRegistered(tournament) ? (
                    <button
                      onClick={() => handleUnregister(tournament.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Unregister
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(tournament.id)}
                      disabled={tournament.status !== 'registration'}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Register
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(tournament)}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tournament Details Modal */}
      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)} title="Tournament Details">
        {selectedTournament && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Tournament Info</h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedTournament.name}</p>
                  <p><strong>Description:</strong> {selectedTournament.description}</p>
                  <p><strong>Type:</strong> {selectedTournament.tournament_type.replace('_', ' ')}</p>
                  <p><strong>Status:</strong> <span className="capitalize">{selectedTournament.status}</span></p>
                  <p><strong>Participants:</strong> {selectedTournament.current_participants}/{selectedTournament.max_participants}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Schedule</h3>
                <div className="space-y-2">
                  <p><strong>Registration Deadline:</strong> {formatDate(selectedTournament.registration_deadline)}</p>
                  <p><strong>Start Date:</strong> {formatDate(selectedTournament.start_date)}</p>
                  <p><strong>End Date:</strong> {formatDate(selectedTournament.end_date)}</p>
                </div>
              </div>
            </div>

            {selectedTournament.participant_details && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Participants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedTournament.participant_details.map((participant, index) => (
                    <div key={participant.user_id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{participant.name}</span>
                        {index === 0 && <Crown className="w-4 h-4 text-yellow-600" />}
                        {index === 1 && <Medal className="w-4 h-4 text-gray-600" />}
                        {index === 2 && <Medal className="w-4 h-4 text-orange-600" />}
                      </div>
                      <p className="text-sm text-gray-600">@{participant.username}</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>W: {participant.matches_won}</span>
                        <span>L: {participant.matches_lost}</span>
                        <span>Score: {participant.total_score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTournament.progress && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Tournament Progress</h3>
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selectedTournament.progress.progress_percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{selectedTournament.progress.completed_matches}/{selectedTournament.progress.total_matches} matches completed</span>
                  <span>Round {selectedTournament.progress.current_round}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              {selectedTournament.status === 'active' && (
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleViewBrackets(selectedTournament.id);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  View Brackets
                </button>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tournament Brackets Modal */}
      <Modal isOpen={showBrackets} onClose={() => setShowBrackets(false)} title="Tournament Brackets">
        {selectedTournament && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedTournament.tournament.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTournament.tournament.status)}`}>
                {getStatusIcon(selectedTournament.tournament.status)}
                <span className="ml-1 capitalize">{selectedTournament.tournament.status}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="flex space-x-8 min-w-max">
                {selectedTournament.brackets.map((bracket, bracketIndex) => (
                  <div key={bracket.round} className="flex-shrink-0">
                    <h4 className="text-center font-semibold mb-4">Round {bracket.round}</h4>
                    <div className="space-y-4">
                      {bracket.matches.map((match, matchIndex) => (
                        <div key={match.match_id} className="bg-gray-50 rounded-lg p-3 min-w-48">
                          <div className="space-y-2">
                            <div className={`p-2 rounded ${match.winner_id === match.player1_id ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'}`}>
                              <p className="font-medium text-sm">{match.player1_name}</p>
                              {match.player1_score > 0 && (
                                <p className="text-xs text-gray-600">Score: {match.player1_score}</p>
                              )}
                            </div>
                            <div className="text-center text-xs text-gray-500">vs</div>
                            <div className={`p-2 rounded ${match.winner_id === match.player2_id ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'}`}>
                              <p className="font-medium text-sm">{match.player2_name}</p>
                              {match.player2_score > 0 && (
                                <p className="text-xs text-gray-600">Score: {match.player2_score}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              match.status === 'completed' ? 'bg-green-100 text-green-800' :
                              match.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {match.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowBrackets(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tournaments; 