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
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Users as UsersIcon,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  Target as TargetIcon
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCubeTypesModal, setShowCubeTypesModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameStats, setGameStats] = useState({});
  const [cubeTypes, setCubeTypes] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "chess",
    difficulty: "beginner",
    max_levels: 10,
    time_limit: 300,
    unlimited_levels: false,
    allow_admin_challenges: true,
    game_modes: [],
    cube_types: []
  });

  useEffect(() => {
    fetchGames();
    fetchCubeTypes();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
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

  const fetchGameStats = async (gameId) => {
    try {
      const response = await fetch(`/api/game/admin/games/${gameId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setGameStats(data.data);
      } else {
        toast.error(data.message);
        setGameStats(null);
      }
    } catch (error) {
      console.error('Error fetching game stats:', error);
      toast.error('Failed to fetch game statistics. Please try again.');
      setGameStats(null);
    }
  };

  const handleToggleLock = async (gameId) => {
    try {
      const response = await fetch(`/api/game/admin/games/${gameId}/toggle-lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchGames(); // Refresh games list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error toggling game lock:', error);
      toast.error('Failed to update game lock status. Please try again.');
    }
  };

  const handleToggleStatus = async (gameId) => {
    try {
      const response = await fetch(`/api/game/admin/games/${gameId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchGames(); // Refresh games list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error toggling game status:', error);
      toast.error('Failed to update game status. Please try again.');
    }
  };

  const handleEditGame = (game) => {
    setSelectedGame(game);
    setFormData({
      name: game.name,
      description: game.description,
      type: game.type,
      difficulty: game.difficulty,
      max_levels: game.max_levels,
      time_limit: game.time_limit,
      unlimited_levels: game.unlimited_levels,
      allow_admin_challenges: game.allow_admin_challenges,
      game_modes: game.game_modes || [],
      cube_types: game.cube_types || []
    });
    setShowEditModal(true);
  };

  const handleViewStats = (game) => {
    setSelectedGame(game);
    fetchGameStats(game.id);
    setShowStatsModal(true);
  };

  const handleViewCubeTypes = () => {
    setShowCubeTypesModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    try {
      const url = showEditModal 
        ? `/api/game/admin/games/${selectedGame.id}/settings`
        : '/api/game/admin/games';
      
      const method = showEditModal ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(showEditModal ? 'Game updated successfully!' : 'Game created successfully!');
        setShowAddModal(false);
        setShowEditModal(false);
        fetchGames(); // Refresh games list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error('Failed to save game. Please try again.');
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || game.type === filterType;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && game.is_active) ||
                         (filterStatus === "inactive" && !game.is_active) ||
                         (filterStatus === "locked" && game.is_locked);
    
    return matchesSearch && matchesType && matchesStatus;
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Enhanced Game Management</h1>
            <p className="text-gray-600">Manage unlimited chess levels, cube types, and admin challenges</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleViewCubeTypes}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Layers className="w-4 h-4" />
              <span>View Cube Types</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Games</p>
              <p className="text-2xl font-bold text-gray-900">{games.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Gamepad2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Games</p>
              <p className="text-2xl font-bold text-gray-900">{games.filter(g => g.is_active).length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plays</p>
              <p className="text-2xl font-bold text-gray-900">{games.reduce((sum, g) => sum + (g.total_plays || 0), 0)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900">{games.reduce((sum, g) => sum + (g.total_matches || 0), 0)}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <UsersIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="chess">Chess</option>
            <option value="cube">Cube</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>
          
          <button
            onClick={fetchGames}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGames.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        game.type === 'chess' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        {game.type === 'chess' ? (
                          <Gamepad2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Box className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{game.name}</div>
                        <div className="text-sm text-gray-500">{game.description}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        game.type === 'chess' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {game.type === 'chess' ? 'Chess' : 'Cube'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        game.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        game.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        game.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {game.difficulty}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {game.unlimited_levels && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          <Infinity className="w-3 h-3 mr-1" />
                          Unlimited
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
                          All Types
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Gamepad2 className="w-4 h-4 text-gray-400" />
                        <span>{game.total_plays || 0} plays</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <UsersIcon className="w-4 h-4 text-gray-400" />
                        <span>{game.total_matches || 0} matches</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <TargetIcon className="w-4 h-4 text-gray-400" />
                        <span>{game.average_score || 0}% avg</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {game.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                      {game.is_locked && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewStats(game)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="View Stats"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditGame(game)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                        title="Edit Game"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleLock(game.id)}
                        className={`p-2 rounded-lg ${
                          game.is_locked 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-yellow-600 hover:bg-yellow-100'
                        }`}
                        title={game.is_locked ? 'Unlock Game' : 'Lock Game'}
                      >
                        {game.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleToggleStatus(game.id)}
                        className={`p-2 rounded-lg ${
                          game.is_active 
                            ? 'text-red-600 hover:bg-red-100' 
                            : 'text-green-600 hover:bg-green-100'
                        }`}
                        title={game.is_active ? 'Deactivate Game' : 'Activate Game'}
                      >
                        {game.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Game Modal */}
      <Modal 
        isOpen={showAddModal || showEditModal} 
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }} 
        title={showEditModal ? 'Edit Game' : 'Add New Game'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Game Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Game Type</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="chess">Chess</option>
                <option value="cube">Cube</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                required
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Levels</label>
              <input
                type="number"
                required
                value={formData.max_levels}
                onChange={(e) => setFormData({...formData, max_levels: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
              <input
                type="number"
                required
                value={formData.time_limit}
                onChange={(e) => setFormData({...formData, time_limit: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.unlimited_levels}
                onChange={(e) => setFormData({...formData, unlimited_levels: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Unlimited Levels</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allow_admin_challenges}
                onChange={(e) => setFormData({...formData, allow_admin_challenges: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Allow Admin Challenges</span>
            </label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              {showEditModal ? 'Update Game' : 'Create Game'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Game Stats Modal */}
      <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} title={`${selectedGame?.name} - Statistics`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Gamepad2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Total Plays</h3>
              </div>
              <p className="text-2xl font-bold text-blue-900">{gameStats.total_plays || 0}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UsersIcon className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Total Matches</h3>
              </div>
              <p className="text-2xl font-bold text-purple-900">{gameStats.total_matches || 0}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TargetIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Avg Score</h3>
              </div>
              <p className="text-2xl font-bold text-green-900">{gameStats.average_score || 0}%</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">Completion Rate</h3>
              </div>
              <p className="text-2xl font-bold text-orange-900">{gameStats.completion_rate || 0}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Top Players</h3>
              <div className="space-y-2">
                {gameStats.top_players?.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className="text-sm text-gray-500">@{player.username}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{player.score}</div>
                      <div className="text-sm text-gray-500">{player.plays} plays</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {gameStats.recent_activity?.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{activity.action}</div>
                      <div className="text-xs text-gray-500">by {activity.user} • {activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Cube Types Modal */}
      <Modal isOpen={showCubeTypesModal} onClose={() => setShowCubeTypesModal(false)} title="All Cube Types">
        <div className="space-y-6">
          <div className="bg-orange-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Layers className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">34 Cube Types Available</h3>
            </div>
            <p className="text-orange-700 text-sm">
              The platform supports all major cube types across 5 categories. Each cube tracks completion time and progress.
            </p>
          </div>
          
          {Object.entries(cubeTypes).map(([category, cubes]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                {category.replace('_', ' ')} Cubes ({cubes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cubes.map((cube) => (
                  <div key={cube.name} className="border border-gray-200 rounded-lg p-3">
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
                    <div className="text-xs text-gray-500">
                      Completion tracking enabled
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default AdminGames; 