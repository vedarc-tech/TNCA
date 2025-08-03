import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Clock, 
  Calendar,
  Target,
  Award,
  Play,
  Plus,
  Edit,
  Trash2,
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
  AlertCircle,
  Settings,
  UserCheck,
  UserX,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showBrackets, setShowBrackets] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game_id: '',
    tournament_type: 'single_elimination',
    max_participants: 32,
    start_date: '',
    registration_deadline: '',
    end_date: '',
    prize_pool: {
      '1st': '',
      '2nd': '',
      '3rd': ''
    },
    rules: []
  });

  useEffect(() => {
    fetchTournaments();
    fetchGames();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tournament/admin/tournaments', {
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

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/game/admin/games', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setGames(data.data);
      } else {
        toast.error(data.message);
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to fetch games. Please try again.');
      setGames([]);
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/tournament/admin/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Tournament created successfully!');
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          game_id: '',
          tournament_type: 'single_elimination',
          max_participants: 32,
          start_date: '',
          registration_deadline: '',
          end_date: '',
          prize_pool: {
            '1st': '',
            '2nd': '',
            '3rd': ''
          },
          rules: []
        });
        fetchTournaments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament. Please try again.');
    }
  };

  const handleStartTournament = async (tournamentId) => {
    try {
      const response = await fetch(`/api/tournament/admin/tournaments/${tournamentId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Tournament started successfully!');
        fetchTournaments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error starting tournament:', error);
      toast.error('Failed to start tournament. Please try again.');
    }
  };

  const handleUpdateMatch = async (tournamentId, matchData) => {
    try {
      const response = await fetch(`/api/tournament/admin/tournaments/${tournamentId}/update-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(matchData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Match result updated successfully!');
        fetchTournaments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating match:', error);
      toast.error('Failed to update match result. Please try again.');
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
              <h1 className="text-3xl font-bold text-gray-900">Tournament Management</h1>
              <p className="text-gray-600">Create and manage competitive tournaments</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Tournament
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tournaments</p>
              <p className="text-2xl font-bold text-gray-900">{tournaments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {tournaments.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registration</p>
              <p className="text-2xl font-bold text-gray-900">
                {tournaments.filter(t => t.status === 'registration').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {tournaments.filter(t => t.status === 'completed').length}
              </p>
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

      {/* Tournaments List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tournaments</h2>
        
        {filteredTournaments.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tournaments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tournament</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Game</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Participants</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Start Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTournaments.map(tournament => (
                  <tr key={tournament.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{tournament.name}</h3>
                        <p className="text-sm text-gray-600">{tournament.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">
                        {games.find(g => g.id === tournament.game_id)?.name || 'Unknown Game'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">
                        {tournament.current_participants}/{tournament.max_participants}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                        {getStatusIcon(tournament.status)}
                        <span className="ml-1 capitalize">{tournament.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{formatDate(tournament.start_date)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(tournament)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {tournament.status === 'registration' && tournament.current_participants >= 2 && (
                          <button
                            onClick={() => handleStartTournament(tournament.id)}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {tournament.status === 'active' && (
                          <button
                            onClick={() => handleViewBrackets(tournament.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Tournament Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Tournament">
        <form onSubmit={handleCreateTournament} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Game</label>
              <select
                value={formData.game_id}
                onChange={(e) => setFormData({...formData, game_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a game</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Type</label>
              <select
                value={formData.tournament_type}
                onChange={(e) => setFormData({...formData, tournament_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="single_elimination">Single Elimination</option>
                <option value="double_elimination">Double Elimination</option>
                <option value="round_robin">Round Robin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
              <input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="2"
                max="128"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
              <input
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({...formData, registration_deadline: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prize Pool</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">1st Place</label>
                <input
                  type="text"
                  value={formData.prize_pool['1st']}
                  onChange={(e) => setFormData({
                    ...formData, 
                    prize_pool: {...formData.prize_pool, '1st': e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., $100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">2nd Place</label>
                <input
                  type="text"
                  value={formData.prize_pool['2nd']}
                  onChange={(e) => setFormData({
                    ...formData, 
                    prize_pool: {...formData.prize_pool, '2nd': e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., $50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">3rd Place</label>
                <input
                  type="text"
                  value={formData.prize_pool['3rd']}
                  onChange={(e) => setFormData({
                    ...formData, 
                    prize_pool: {...formData.prize_pool, '3rd': e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., $25"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Create Tournament
            </button>
          </div>
        </form>
      </Modal>

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
                  Manage Brackets
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
                          {match.status === 'pending' && (
                            <div className="mt-2 space-y-1">
                              <button
                                onClick={() => handleUpdateMatch(selectedTournament.tournament.id, {
                                  match_id: match.match_id,
                                  winner_id: match.player1_id,
                                  player1_score: 1,
                                  player2_score: 0
                                })}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs transition-colors"
                              >
                                {match.player1_name} Wins
                              </button>
                              <button
                                onClick={() => handleUpdateMatch(selectedTournament.tournament.id, {
                                  match_id: match.match_id,
                                  winner_id: match.player2_id,
                                  player1_score: 0,
                                  player2_score: 1
                                })}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs transition-colors"
                              >
                                {match.player2_name} Wins
                              </button>
                            </div>
                          )}
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

export default AdminTournaments; 