import React, { useState, useEffect } from "react";
import { 
  Gamepad2, 
  Box, 
  Play, 
  Users, 
  Target, 
  Clock, 
  Trophy, 
  Search,
  Filter,
  UserPlus,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  Star,
  Timer,
  Zap,
  Crown,
  Shield,
  Infinity,
  Layers,
  Activity,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Users as UsersIcon,
  Activity as ActivityIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  Target as TargetIcon,
  UserCheck,
  UserX,
  MessageSquare,
  Send,
  RotateCcw,
  Pause,
  Square,
  CheckSquare,
  EyeOff,
  Calendar,
  Medal
} from "lucide-react";
import { toast } from "react-hot-toast";
import ChessGame from "../../components/games/ChessGame";
import CubeGame from "../../components/games/CubeGame";

const AdminPlayGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showLevels, setShowLevels] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCubeTypes, setShowCubeTypes] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [cubeTypes, setCubeTypes] = useState({});
  const [matchForm, setMatchForm] = useState({
    opponent_id: "",
    level_id: "",
    cube_type: "",
    chess_mode: ""
  });
  const [userStats, setUserStats] = useState({});
  const [filterType, setFilterType] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeGameSession, setActiveGameSession] = useState(null);
  const [showGameInterface, setShowGameInterface] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    fetchGames();
    fetchUserStats();
    fetchCubeTypes();
    getCurrentUser();
  }, []);

  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/game/user/games', {
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
    } finally {
      setLoading(false);
    }
  };

  const fetchCubeTypes = async () => {
    try {
      const response = await fetch('/api/game/cube-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCubeTypes(data.data);
      } else {
        toast.error(data.message);
        setCubeTypes({});
      }
    } catch (error) {
      console.error('Error fetching cube types:', error);
      toast.error('Failed to fetch cube types. Please try again.');
      setCubeTypes({});
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.data);
      } else {
        toast.error(data.message);
        setUserStats(null);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast.error('Failed to fetch user statistics. Please try again.');
      setUserStats(null);
    }
  };

  const fetchLeaderboard = async (gameId) => {
    try {
      const response = await fetch(`/api/game/leaderboard/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.data);
      } else {
        toast.error(data.message);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to fetch leaderboard. Please try again.');
      setLeaderboard([]);
    }
  };

  const handlePlayGame = (game) => {
    setSelectedGame(game);
    if (game.type === 'cube') {
      setShowCubeTypes(true);
    } else {
      setShowLevels(true);
    }
  };

  const handleStartLevel = (level) => {
    setSelectedLevel(level);
    setShowGameInterface(true);
    setShowLevels(false);
    setShowCubeTypes(false);
  };

  const handleGameComplete = (result) => {
    toast.success(`Game completed! Score: ${result.score}`);
    setShowGameInterface(false);
    setSelectedLevel(null);
    setActiveGameSession(null);
  };

  const handleExitGame = () => {
    setShowGameInterface(false);
    setSelectedLevel(null);
    setActiveGameSession(null);
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    
    if (!matchForm.opponent_id || !matchForm.level_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/game/matches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          opponent_id: matchForm.opponent_id,
          game_id: selectedGame.id,
          level_id: matchForm.level_id,
          cube_type: matchForm.cube_type,
          chess_mode: matchForm.chess_mode
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Match invitation sent successfully!');
        setShowMatchModal(false);
        setMatchForm({ opponent_id: "", level_id: "", cube_type: "", chess_mode: "" });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error('Failed to create match. Please try again.');
    }
  };

  const handleChallengeUser = () => {
    // This would open user challenge modal
    toast.success('User challenge feature coming soon!');
  };

  const openLeaderboard = (gameId) => {
    fetchLeaderboard(gameId);
    setShowLeaderboard(true);
  };

  const filteredGames = games.filter(game => {
    if (filterType === "all") return true;
    return game.type === filterType;
  });

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
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

  // Show game interface if active
  if (showGameInterface && selectedGame && selectedLevel) {
    if (selectedGame.type === 'chess') {
      return (
        <ChessGame 
          gameData={selectedGame}
          levelData={selectedLevel}
          onComplete={handleGameComplete}
          onExit={handleExitGame}
        />
      );
    } else if (selectedGame.type === 'cube') {
      return (
        <CubeGame 
          gameData={selectedGame}
          levelData={selectedLevel}
          onComplete={handleGameComplete}
          onExit={handleExitGame}
        />
      );
    }
  }

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
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Games</h1>
              <p className="text-gray-600">Play games, test features, and challenge users</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Admin Mode
            </span>
          </div>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Games Played</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.games_played || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tournaments Won</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.tournaments_won || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.best_score || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.win_rate || 0}%</p>
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
                placeholder="Search games..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Games</option>
              <option value="chess">Chess</option>
              <option value="cube">Cube</option>
            </select>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Games</h2>
        
        {filteredGames.length === 0 ? (
          <div className="text-center py-8">
            <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No games found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <div key={game.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      game.type === 'chess' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {game.type === 'chess' ? (
                        <Crown className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Box className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{game.type} Game</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {game.is_locked ? (
                      <Lock className="w-4 h-4 text-red-500" />
                    ) : (
                      <Unlock className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Target className="w-4 h-4 mr-2" />
                    <span>Difficulty: {game.difficulty}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Layers className="w-4 h-4 mr-2" />
                    <span>Levels: {game.max_levels}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Time Limit: {game.time_limit}s</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Total Plays: {game.total_plays}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePlayGame(game)}
                    disabled={game.is_locked}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play Game
                  </button>
                  <button
                    onClick={() => openLeaderboard(game.id)}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <Trophy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowMatchModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game Levels Modal */}
      <Modal isOpen={showLevels} onClose={() => setShowLevels(false)} title={`${selectedGame?.name} - Select Level`}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: selectedGame?.max_levels || 10 }, (_, i) => (
              <div key={i + 1} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleStartLevel({
                id: `level_${i + 1}`,
                level_number: i + 1,
                title: `Level ${i + 1}`,
                description: `Challenge level ${i + 1}`,
                difficulty: i < 3 ? 'beginner' : i < 6 ? 'intermediate' : 'advanced',
                time_limit: selectedGame?.time_limit || 300,
                points: 100 + (i * 25)
              })}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Level {i + 1}</h3>
                  <span className="text-sm text-gray-500">{100 + (i * 25)} pts</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Challenge level {i + 1}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{i < 3 ? 'Beginner' : i < 6 ? 'Intermediate' : 'Advanced'}</span>
                  <span>{selectedGame?.time_limit || 300}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Cube Types Modal */}
      <Modal isOpen={showCubeTypes} onClose={() => setShowCubeTypes(false)} title={`${selectedGame?.name} - Select Cube Type`}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(cubeTypes).map(([category, cubes]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-semibold text-gray-900 capitalize">{category.replace('_', ' ')}</h3>
                {cubes.map((cube, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleStartLevel({
                    id: `cube_${category}_${index}`,
                    level_number: index + 1,
                    title: cube.name,
                    description: `Solve the ${cube.name}`,
                    difficulty: cube.difficulty,
                    time_limit: cube.time_limit,
                    points: cube.points,
                    cube_type: cube.name
                  })}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cube.name}</span>
                      <span className="text-sm text-gray-500">{cube.points} pts</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span className="capitalize">{cube.difficulty}</span>
                      <span>{cube.time_limit}s</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Match Creation Modal */}
      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} title="Create Match">
        <form onSubmit={handleCreateMatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opponent (User ID)</label>
            <input
              type="text"
              value={matchForm.opponent_id}
              onChange={(e) => setMatchForm({...matchForm, opponent_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter user ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level ID</label>
            <input
              type="text"
              value={matchForm.level_id}
              onChange={(e) => setMatchForm({...matchForm, level_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter level ID"
              required
            />
          </div>
          {selectedGame?.type === 'cube' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cube Type</label>
              <input
                type="text"
                value={matchForm.cube_type}
                onChange={(e) => setMatchForm({...matchForm, cube_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 3x3, 4x4, etc."
              />
            </div>
          )}
          {selectedGame?.type === 'chess' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chess Mode</label>
              <input
                type="text"
                value={matchForm.chess_mode}
                onChange={(e) => setMatchForm({...matchForm, chess_mode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., checkmate, tactics, etc."
              />
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowMatchModal(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Create Match
            </button>
          </div>
        </form>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} title="Game Leaderboard">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Player</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {index === 0 && <Crown className="w-4 h-4 text-yellow-500 mr-2" />}
                        {index === 1 && <Medal className="w-4 h-4 text-gray-500 mr-2" />}
                        {index === 2 && <Medal className="w-4 h-4 text-orange-500 mr-2" />}
                        <span className="font-medium">{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {entry.user_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="font-medium">{entry.user_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{entry.score}</td>
                    <td className="py-3 px-4">{entry.time_taken}s</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPlayGames; 