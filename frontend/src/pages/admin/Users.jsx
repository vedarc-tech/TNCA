import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Lock, 
  Unlock,
  Download,
  MoreVertical,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authService } from "../../services/authService";

// Move Modal component outside to prevent re-creation on every render
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "user"
  });
  const [usernameValidation, setUsernameValidation] = useState({
    isValid: false,
    isAvailable: false,
    message: "",
    checking: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset form data when modal closes
  useEffect(() => {
    if (!showCreateModal) {
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "user"
      });
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        message: "",
        checking: false
      });
    }
  }, [showCreateModal]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error(data.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Improved form input handler with proper event handling
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle input change with event
  const handleInputChangeEvent = useCallback((field, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  // Username validation with debouncing
  const validateUsername = useCallback(async (username) => {
    // Clear validation if username is empty
    if (!username || username.trim() === '') {
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        message: "",
        checking: false
      });
      return;
    }

    // Basic client-side validation first
    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 3) {
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        message: "Username must be at least 3 characters",
        checking: false
      });
      return;
    }

    if (trimmedUsername.length > 20) {
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        message: "Username must be at most 20 characters",
        checking: false
      });
      return;
    }

    // Check for valid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        message: "Username can only contain letters, numbers, underscores, and hyphens",
        checking: false
      });
      return;
    }

    // Check if starts with alphanumeric
    if (!/^[a-zA-Z0-9]/.test(trimmedUsername)) {
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        message: "Username must start with a letter or number",
        checking: false
      });
      return;
    }

    // Check if ends with alphanumeric
    if (!trimmedUsername[trimmedUsername.length - 1].match(/[a-zA-Z0-9]/)) {
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        message: "Username must end with a letter or number",
        checking: false
      });
      return;
    }

    // Check for reserved usernames
    const reservedUsernames = ['admin', 'administrator', 'root', 'system', 'support', 'help', 'info', 'test', 'guest', 'user', 'users'];
    if (reservedUsernames.includes(trimmedUsername.toLowerCase())) {
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        message: "This username is reserved and cannot be used",
        checking: false
      });
      return;
    }

    // If basic validation passes, check availability
    setUsernameValidation(prev => ({ ...prev, checking: true }));

    try {
      const response = await authService.checkUsernameAvailability(trimmedUsername);
      
      if (response.success) {
        setUsernameValidation({
          isValid: true,
          isAvailable: response.available,
          message: response.available ? "Username is available" : "Username is already taken",
          checking: false
        });
      } else {
        setUsernameValidation({
          isValid: false,
          isAvailable: false,
          message: response.message || "Error checking username",
          checking: false
        });
      }
    } catch (error) {
      console.error('Username validation error:', error);
      setUsernameValidation({
        isValid: false,
        isAvailable: false,
        message: "Error checking username availability",
        checking: false
      });
    }
  }, []);

  // Debounced username validation - trigger on every username change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username !== undefined) {
        validateUsername(formData.username);
      }
    }, 300); // Reduced debounce time for more responsive feedback

    return () => clearTimeout(timeoutId);
  }, [formData.username, validateUsername]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Check if username is valid and available
    if (!usernameValidation.isValid || !usernameValidation.isAvailable) {
      toast.error('Please fix username validation issues before creating user');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('User created successfully');
        setShowCreateModal(false);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user. Please try again.');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    // Check if username is valid and available (only if username changed)
    if (formData.username !== currentUser.username) {
      if (!usernameValidation.isValid || !usernameValidation.isAvailable) {
        toast.error('Please fix username validation issues before updating user');
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setCurrentUser(null);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    // Get user details to check if it's a developer
    const user = users.find(u => u.id === userId);
    if (user && user.role === 'developer') {
      toast.error('Developer accounts cannot be deleted');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    // Get user details to check if it's a developer
    const user = users.find(u => u.id === userId);
    if (user && user.role === 'developer') {
      toast.error('Developer accounts cannot be deactivated');
      return;
    }
    
    if (currentStatus) {
      // Deactivating user - show suspension modal
      setCurrentUser(user);
      setSuspensionReason('');
      setShowSuspensionModal(true);
    } else {
      // Activating user - proceed directly
      try {
        const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success(data.message);
          fetchUsers();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error('Error toggling user status:', error);
        toast.error('Failed to update user status. Please try again.');
      }
    }
  };

  const handleSuspensionConfirm = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${currentUser.id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ reason: suspensionReason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setShowSuspensionModal(false);
        setCurrentUser(null);
        setSuspensionReason('');
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/users/${currentUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ new_password: formData.password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Password reset successfully');
        setShowResetModal(false);
        setCurrentUser(null);
        setFormData({ name: "", email: "", username: "", password: "", role: "user" });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && user.is_active) ||
                         (filterStatus === "inactive" && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openEditModal = (user) => {
    if (user.role === 'developer') {
      toast.error('Developer accounts cannot be modified');
      return;
    }
    
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "",
      role: user.role
    });
    // Reset username validation for edit mode
    setUsernameValidation({
      isValid: true, // Assume current username is valid
      isAvailable: true, // Assume current username is available for the same user
      message: "Current username",
      checking: false
    });
    setShowEditModal(true);
  };

  const openResetModal = (user) => {
    if (user.role === 'developer') {
      toast.error('Developer accounts cannot be modified');
      return;
    }
    
    setCurrentUser(user);
    setFormData({ name: "", email: "", username: "", password: "", role: "user" });
    setShowResetModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "user"
    });
    setShowCreateModal(true);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage student accounts and permissions</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create User</span>
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="user">Student</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="developer">Developer</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IQ Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'admin' ? 'bg-yellow-100 text-yellow-800' :
                      user.role === 'developer' ? 'bg-gray-100 text-black' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{user.iq_score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        <span>{user.total_quizzes}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        disabled={user.role === 'developer'}
                        className={`p-1 ${user.role === 'developer' ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-900'}`}
                        title={user.role === 'developer' ? 'Developer accounts cannot be modified' : 'Edit User'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openResetModal(user)}
                        disabled={user.role === 'developer'}
                        className={`p-1 ${user.role === 'developer' ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-600 hover:text-yellow-900'}`}
                        title={user.role === 'developer' ? 'Developer accounts cannot be modified' : 'Reset Password'}
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        disabled={user.role === 'developer'}
                        className={`p-1 ${user.role === 'developer' ? 'text-gray-400 cursor-not-allowed' : user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.role === 'developer' ? 'Developer accounts cannot be deactivated' : (user.is_active ? 'Deactivate User' : 'Activate User')}
                      >
                        {user.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'developer'}
                        className={`p-1 ${user.role === 'developer' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                        title={user.role === 'developer' ? 'Developer accounts cannot be deleted' : 'Delete User'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChangeEvent('name', e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChangeEvent('email', e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
                      <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => handleInputChangeEvent('username', e)}
                  className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    usernameValidation.checking 
                      ? 'border-blue-300' 
                      : usernameValidation.isValid && usernameValidation.isAvailable 
                        ? 'border-green-300' 
                        : formData.username && !usernameValidation.isValid 
                          ? 'border-red-300' 
                          : 'border-gray-300'
                  }`}
                  placeholder="Enter username (3-20 characters, letters, numbers, _-)"
                />
                {usernameValidation.checking && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {!usernameValidation.checking && usernameValidation.isValid && usernameValidation.isAvailable && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
                {!usernameValidation.checking && formData.username && !usernameValidation.isValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
                {!usernameValidation.checking && formData.username && usernameValidation.isValid && !usernameValidation.isAvailable && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {usernameValidation.message && (
                <p className={`mt-1 text-sm ${
                  usernameValidation.isValid && usernameValidation.isAvailable 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {usernameValidation.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Username must be 3-20 characters, contain only letters, numbers, underscores, and hyphens
              </p>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChangeEvent('password', e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChangeEvent('role', e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Create User
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChangeEvent('name', e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChangeEvent('email', e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => handleInputChangeEvent('username', e)}
                className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  usernameValidation.checking 
                    ? 'border-blue-300' 
                    : usernameValidation.isValid && usernameValidation.isAvailable 
                      ? 'border-green-300' 
                      : formData.username && !usernameValidation.isValid 
                        ? 'border-red-300' 
                        : 'border-gray-300'
                }`}
                placeholder="Enter username (3-20 characters, letters, numbers, _-)"
              />
              {usernameValidation.checking && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {!usernameValidation.checking && usernameValidation.isValid && usernameValidation.isAvailable && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
              {!usernameValidation.checking && formData.username && !usernameValidation.isValid && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
              {!usernameValidation.checking && formData.username && usernameValidation.isValid && !usernameValidation.isAvailable && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {usernameValidation.message && (
              <p className={`mt-1 text-sm ${
                usernameValidation.isValid && usernameValidation.isAvailable 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {usernameValidation.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Username must be 3-20 characters, contain only letters, numbers, underscores, and hyphens
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChangeEvent('role', e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Update User
            </button>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Password">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-gray-600">
            Reset password for user: <strong>{currentUser?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChangeEvent('password', e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700"
            >
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Suspension Modal */}
      <Modal isOpen={showSuspensionModal} onClose={() => setShowSuspensionModal(false)} title="Suspend User">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Suspend user: <strong>{currentUser?.name}</strong> ({currentUser?.email})
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suspension Reason (Optional)
            </label>
            <textarea
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter reason for suspension (optional)"
              rows="3"
            />
            <p className="mt-1 text-xs text-gray-500">
              If no reason is provided, the user will see "Contact admin" message
            </p>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleSuspensionConfirm}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Suspend User
            </button>
            <button
              type="button"
              onClick={() => setShowSuspensionModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users; 