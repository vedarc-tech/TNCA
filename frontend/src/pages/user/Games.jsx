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
  Activity
} from "lucide-react";
import { toast } from "react-hot-toast";

const Games = () => {
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
    // This would start the actual game level
    toast.success(`Starting ${selectedGame.name} - ${level.title}`);
    // Navigate to game interface
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

  const handleChallengeAdmin = () => {
    // This would open admin challenge modal
    toast.success('Admin challenge feature coming soon!');
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Enhanced Chess & Cube Games</h1>
            <p className="text-gray-600">Unlimited chess levels, all cube types, and admin challenges</p>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Games Played</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total_games_played || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Gamepad2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">1v1 Matches</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total_matches || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wins</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.wins || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.average_score || 0}%</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admin Matches</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.admin_matches || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <Crown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.best_score || 0}%</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100">
              <Star className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center space-x-4">
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

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGames.map((game) => (
          <div key={game.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${
                    game.type === 'chess' ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    {game.type === 'chess' ? (
                      <Gamepad2 className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Box className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{game.name}</h3>
                    <p className="text-gray-600">{game.description}</p>
                  </div>
                </div>
                {game.is_locked && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Locked</span>
                  </div>
                )}
              </div>

              {/* Game Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {game.unlimited_levels && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      <Infinity className="w-3 h-3 mr-1" />
                      Unlimited Levels
                    </span>
                  )}
                  {game.allow_admin_challenges && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin Challenges
                    </span>
                  )}
                                     {game.type === 'chess' && (
                     <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                       <Target className="w-3 h-3 mr-1" />
                       Multiple Modes
                     </span>
                   )}
                  {game.type === 'cube' && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                      <Layers className="w-3 h-3 mr-1" />
                      All Cube Types
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>{game.max_levels} Levels</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{game.time_limit}s Limit</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{game.total_plays} Plays</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{game.average_score}% Avg</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePlayGame(game)}
                    disabled={game.is_locked}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                      game.is_locked 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    <span>Play Solo</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedGame(game);
                      setShowMatchModal(true);
                    }}
                    disabled={game.is_locked}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                      game.is_locked 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>1v1 Match</span>
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openLeaderboard(game.id)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">Leaderboard</span>
                  </button>
                  
                  {game.allow_admin_challenges && (
                    <button
                      onClick={handleChallengeAdmin}
                      className="flex items-center space-x-2 px-3 py-2 text-orange-600 hover:text-orange-900"
                    >
                      <Crown className="w-4 h-4" />
                      <span className="text-sm">Challenge Admin</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chess Levels Modal */}
      <Modal isOpen={showLevels} onClose={() => setShowLevels(false)} title={`${selectedGame?.name} - Unlimited Levels`}>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Infinity className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Unlimited Chess Levels</h3>
            </div>
            <p className="text-blue-700 text-sm">
              Chess puzzles are generated dynamically with increasing difficulty. 
              Each level features different chess modes: Checkmate, Tactics, Endgame, Opening, and Strategy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i + 1} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Level {i + 1}</h4>
                  <div className="flex items-center space-x-1">
                    <Timer className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{Math.max(60, 600 - (i + 1) * 10)}s</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {i < 5 ? 'Beginner' : i < 10 ? 'Intermediate' : i < 15 ? 'Advanced' : 'Expert'}
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {['Checkmate', 'Tactics', 'Endgame', 'Opening', 'Strategy'][i % 5]}
                  </span>
                </div>
                <button
                  onClick={() => handleStartLevel({ level_number: i + 1, title: `Level ${i + 1}` })}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Start Level
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-4">
            <p className="text-gray-600 text-sm">
              And many more levels... The difficulty increases as you progress!
            </p>
          </div>
        </div>
      </Modal>

      {/* Cube Types Modal */}
      <Modal isOpen={showCubeTypes} onClose={() => setShowCubeTypes(false)} title={`${selectedGame?.name} - All Cube Types`}>
        <div className="space-y-6">
          <div className="bg-orange-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Layers className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">All Cube Types Available</h3>
            </div>
            <p className="text-orange-700 text-sm">
              Choose from 34 different cube types across 5 categories. Each cube tracks your completion time and progress.
            </p>
          </div>
          
          {Object.entries(cubeTypes).map(([category, cubes]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                {category.replace('_', ' ')} Cubes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cubes.map((cube) => (
                  <div key={cube.name} className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{cube.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        cube.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        cube.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        cube.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cube.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>Time: {cube.time_limit}s</span>
                      <span>Points: {cube.points}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Best Time: 0s (First attempt)
                    </div>
                    <button
                      onClick={() => handleStartLevel({ 
                        level_number: 1, 
                        title: `${cube.name} Challenge`,
                        cube_type: cube.name,
                        time_limit: cube.time_limit
                      })}
                      className="w-full bg-orange-600 text-white py-1 px-2 rounded text-xs hover:bg-orange-700"
                    >
                      Start Challenge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Create Match Modal */}
      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} title="Create 1v1 Match">
        <form onSubmit={handleCreateMatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opponent User ID</label>
            <input
              type="text"
              required
              value={matchForm.opponent_id}
              onChange={(e) => setMatchForm({...matchForm, opponent_id: e.target.value})}
              placeholder="Enter opponent's user ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {selectedGame?.type === 'chess' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chess Mode</label>
              <select
                value={matchForm.chess_mode}
                onChange={(e) => setMatchForm({...matchForm, chess_mode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a mode</option>
                <option value="checkmate">Checkmate</option>
                <option value="tactics">Tactics</option>
                <option value="endgame">Endgame</option>
                <option value="opening">Opening</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
          )}
          
          {selectedGame?.type === 'cube' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cube Type</label>
              <select
                value={matchForm.cube_type}
                onChange={(e) => setMatchForm({...matchForm, cube_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a cube type</option>
                {Object.entries(cubeTypes).map(([category, cubes]) => (
                  <optgroup key={category} label={category.replace('_', ' ').toUpperCase()}>
                    {cubes.map((cube) => (
                      <option key={cube.name} value={cube.name}>{cube.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Level</label>
            <select
              required
              value={matchForm.level_id}
              onChange={(e) => setMatchForm({...matchForm, level_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a level</option>
              {selectedGame?.type === 'chess' ? (
                Array.from({ length: 20 }, (_, i) => (
                  <option key={i + 1} value={`level_${i + 1}`}>Level {i + 1}</option>
                ))
              ) : (
                Array.from({ length: 34 }, (_, i) => (
                  <option key={i + 1} value={`cube_level_${i + 1}`}>Cube Challenge {i + 1}</option>
                ))
              )}
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
            >
              Send Challenge
            </button>
            <button
              type="button"
              onClick={() => setShowMatchModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} title="Game Leaderboard">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Score</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Games</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.map((player) => (
                  <tr key={player.rank} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {player.rank <= 3 ? (
                          <Trophy className={`w-5 h-5 mr-2 ${
                            player.rank === 1 ? 'text-yellow-500' :
                            player.rank === 2 ? 'text-gray-400' : 'text-orange-500'
                          }`} />
                        ) : null}
                        <span className="font-medium">{player.rank}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className="text-sm text-gray-500">@{player.username}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{player.total_score}</td>
                    <td className="px-4 py-3 text-gray-600">{player.total_plays}</td>
                    <td className="px-4 py-3 text-gray-600">{player.average_score}%</td>
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

export default Games; 