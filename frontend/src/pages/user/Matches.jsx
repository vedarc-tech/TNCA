import React, { useState, useEffect } from "react";
import { 
  Users, 
  Clock, 
  Check, 
  X, 
  Trophy, 
  Target, 
  Timer, 
  AlertCircle,
  Play,
  Pause,
  User,
  Gamepad2,
  TrendingUp,
  Calendar,
  Zap,
  Crown
} from "lucide-react";
import { toast } from "react-hot-toast";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchMatches();
    fetchPendingMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/game/matches', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.data);
      } else {
        toast.error(data.message);
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to fetch matches. Please try again.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingMatches = async () => {
    try {
      const response = await fetch('/api/game/matches/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setPendingMatches(data.data);
      } else {
        toast.error(data.message);
        setPendingMatches([]);
      }
    } catch (error) {
      console.error('Error fetching pending matches:', error);
      toast.error('Failed to fetch pending matches. Please try again.');
      setPendingMatches([]);
    }
  };

  const handleAcceptMatch = async (matchId) => {
    try {
      const response = await fetch(`/api/game/matches/${matchId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Match accepted successfully!');
        fetchPendingMatches();
        fetchMatches();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error accepting match:', error);
      toast.error('Failed to accept match. Please try again.');
    }
  };

  const handleDeclineMatch = async (matchId) => {
    try {
      const response = await fetch(`/api/game/matches/${matchId}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Match declined successfully');
        fetchPendingMatches();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error declining match:', error);
      toast.error('Failed to decline match. Please try again.');
    }
  };

  const handleJoinMatch = (match) => {
    // This would navigate to the actual game interface
    toast.success(`Joining ${match.game_name} match...`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <Trophy className="w-4 h-4" />;
      case 'declined': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMatches = activeTab === 'all' ? matches : matches.filter(match => match.status === activeTab);

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
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
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">1v1 Matches</h1>
            <p className="text-gray-600">Manage your chess and cube challenges</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingMatches.length}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{matches.filter(m => m.status === 'active').length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{matches.filter(m => m.status === 'completed').length}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Matches */}
      {pendingMatches.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            Pending Match Invitations
          </h2>
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      match.game_type === 'chess' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      <Gamepad2 className={`w-5 h-5 ${
                        match.game_type === 'chess' ? 'text-blue-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{match.game_name}</h3>
                      <p className="text-sm text-gray-600">Level {match.level_id.split('_')[1]}</p>
                      <p className="text-xs text-gray-500">Invited {formatDate(match.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptMatch(match.id)}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleDeclineMatch(match.id)}
                      className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Matches', count: matches.length },
              { key: 'active', label: 'Active', count: matches.filter(m => m.status === 'active').length },
              { key: 'completed', label: 'Completed', count: matches.filter(m => m.status === 'completed').length },
              { key: 'declined', label: 'Declined', count: matches.filter(m => m.status === 'declined').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600">You don't have any {activeTab === 'all' ? '' : activeTab} matches yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        match.game_type === 'chess' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        <Gamepad2 className={`w-6 h-6 ${
                          match.game_type === 'chess' ? 'text-blue-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{match.game_name}</h3>
                        <p className="text-sm text-gray-600">Level {match.level_id.split('_')[1]}</p>
                        <p className="text-xs text-gray-500">{formatDate(match.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                            {getStatusIcon(match.status)}
                            <span className="ml-1">{match.status}</span>
                          </span>
                        </div>
                        
                        {match.status === 'completed' && (
                          <div className="mt-2 flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4 text-gray-400" />
                              <span>{match.challenger_score} vs {match.opponent_score}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Timer className="w-4 h-4 text-gray-400" />
                              <span>{formatTime(match.challenger_time)} vs {formatTime(match.opponent_time)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMatch(match);
                            setShowMatchDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 px-3 py-2 rounded-lg hover:bg-blue-50"
                        >
                          View Details
                        </button>
                        
                        {match.status === 'active' && (
                          <button
                            onClick={() => handleJoinMatch(match)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-1"
                          >
                            <Play className="w-4 h-4" />
                            <span>Join</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Match Details Modal */}
      <Modal isOpen={showMatchDetails} onClose={() => setShowMatchDetails(false)} title="Match Details">
        {selectedMatch && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Game Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Game:</span>
                    <span className="font-medium">{selectedMatch.game_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{selectedMatch.game_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{selectedMatch.level_id.split('_')[1]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMatch.status)}`}>
                      {getStatusIcon(selectedMatch.status)}
                      <span className="ml-1">{selectedMatch.status}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Match Results</h3>
                {selectedMatch.status === 'completed' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Challenger Score:</span>
                      <span className="font-medium">{selectedMatch.challenger_score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Opponent Score:</span>
                      <span className="font-medium">{selectedMatch.opponent_score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Challenger Time:</span>
                      <span className="font-medium">{formatTime(selectedMatch.challenger_time)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Opponent Time:</span>
                      <span className="font-medium">{formatTime(selectedMatch.opponent_time)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Winner:</span>
                        <div className="flex items-center space-x-1">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">
                            {selectedMatch.winner_id === selectedMatch.challenger_id ? 'Challenger' : 'Opponent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Match results will appear here once completed.</p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{formatDate(selectedMatch.created_at)}</span>
                </div>
                {selectedMatch.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span>{formatDate(selectedMatch.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {selectedMatch.status === 'active' && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    handleJoinMatch(selectedMatch);
                    setShowMatchDetails(false);
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Join Match</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Matches; 