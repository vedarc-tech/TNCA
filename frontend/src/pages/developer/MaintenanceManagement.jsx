import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Settings, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Calendar,
  Globe,
  Users,
  Shield,
  Database,
  Activity,
  FileText,
  Download,
  Upload
} from 'lucide-react';

const MaintenanceManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [maintenanceStatus, setMaintenanceStatus] = useState({});
  const [routeGroups, setRouteGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [formData, setFormData] = useState({
    is_maintenance: false,
    start_time: '',
    end_time: '',
    message: 'This page is under maintenance'
  });

  useEffect(() => {
    fetchRoutes();
    fetchMaintenanceStatus();
    fetchRouteGroups();
  }, []);

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/maintenance/routes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/maintenance/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaintenanceStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    }
  };

  const fetchRouteGroups = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/maintenance/groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRouteGroups(data.data);
      }
    } catch (error) {
      console.error('Error fetching route groups:', error);
    }
  };

  const handleToggleMaintenance = async (route) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const currentMaintenance = route.maintenance_status;
      const isCurrentlyInMaintenance = currentMaintenance.is_maintenance;
      
      const response = await fetch('http://localhost:5000/api/maintenance/route', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route_path: route.path,
          page_name: route.name,
          is_maintenance: !isCurrentlyInMaintenance,
          start_time: currentMaintenance.start_time,
          end_time: currentMaintenance.end_time,
          message: currentMaintenance.message || 'This page is under maintenance'
        })
      });
      
      if (response.ok) {
        await fetchRoutes();
        await fetchMaintenanceStatus();
      } else {
        const error = await response.json();
        alert(`Failed to toggle maintenance: ${error.message}`);
      }
    } catch (error) {
      console.error('Error toggling maintenance:', error);
      alert('Error toggling maintenance mode');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetMaintenance = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/maintenance/route', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route_path: selectedRoute.path,
          page_name: selectedRoute.name,
          ...formData
        })
      });
      
      if (response.ok) {
        alert('Maintenance mode updated successfully');
        setShowAddModal(false);
        setSelectedRoute(null);
        setFormData({
          is_maintenance: false,
          start_time: '',
          end_time: '',
          message: 'This page is under maintenance'
        });
        await fetchRoutes();
        await fetchMaintenanceStatus();
      } else {
        const error = await response.json();
        alert(`Failed to update maintenance: ${error.message}`);
      }
    } catch (error) {
      console.error('Error setting maintenance:', error);
      alert('Error setting maintenance mode');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetGroupMaintenance = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/maintenance/group', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group_name: selectedGroup,
          ...formData
        })
      });
      
      if (response.ok) {
        alert('Group maintenance mode updated successfully');
        setShowGroupModal(false);
        setSelectedGroup('');
        setFormData({
          is_maintenance: false,
          start_time: '',
          end_time: '',
          message: 'This section is under maintenance'
        });
        await fetchRoutes();
        await fetchMaintenanceStatus();
      } else {
        const error = await response.json();
        alert(`Failed to update group maintenance: ${error.message}`);
      }
    } catch (error) {
      console.error('Error setting group maintenance:', error);
      alert('Error setting group maintenance mode');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetGlobalMaintenance = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      console.log('Setting global maintenance with data:', formData);
      
      const response = await fetch('http://localhost:5000/api/maintenance/global', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData
        })
      });
      
      console.log('Global maintenance response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Global maintenance result:', result);
        alert(`Global maintenance mode updated successfully! ${result.data.routes_updated} routes updated.`);
        setShowGlobalModal(false);
        setFormData({
          is_maintenance: false,
          start_time: '',
          end_time: '',
          message: 'The application is under maintenance'
        });
        await fetchRoutes();
        await fetchMaintenanceStatus();
      } else {
        const error = await response.json();
        console.error('Global maintenance error:', error);
        alert(`Failed to update global maintenance: ${error.message}`);
      }
    } catch (error) {
      console.error('Error setting global maintenance:', error);
      alert('Error setting global maintenance mode');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMaintenance = async (maintenanceId) => {
    if (!confirm('Are you sure you want to delete this maintenance configuration?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/api/maintenance/route/${maintenanceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Maintenance configuration deleted successfully');
        await fetchRoutes();
        await fetchMaintenanceStatus();
      } else {
        const error = await response.json();
        alert(`Failed to delete maintenance: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      alert('Error deleting maintenance configuration');
    }
  };

  const openEditModal = (route) => {
    setSelectedRoute(route);
    const maintenance = route.maintenance_status;
    setFormData({
      is_maintenance: maintenance.is_maintenance || false,
      start_time: maintenance.start_time ? maintenance.start_time.slice(0, 16) : '',
      end_time: maintenance.end_time ? maintenance.end_time.slice(0, 16) : '',
      message: maintenance.message || 'This page is under maintenance'
    });
    setShowAddModal(true);
  };

  const openGroupModal = (groupName) => {
    setSelectedGroup(groupName);
    setFormData({
      is_maintenance: false,
      start_time: '',
      end_time: '',
      message: 'This section is under maintenance'
    });
    setShowGroupModal(true);
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = 
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.path.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = groupFilter === 'all' || route.group === groupFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && route.maintenance_status.is_maintenance) ||
      (statusFilter === 'inactive' && !route.maintenance_status.is_maintenance);
    
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const getGroupIcon = (group) => {
    switch (group) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'developer':
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getGroupColor = (group) => {
    switch (group) {
      case 'public':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'developer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage maintenance mode for individual pages, groups, or the entire application
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setFormData({
                  is_maintenance: false,
                  start_time: '',
                  end_time: '',
                  message: 'The application is under maintenance'
                });
                setShowGlobalModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              <Globe className="h-4 w-4 mr-2" />
              Global Maintenance
            </button>
            <button
              onClick={() => {
                setFormData({
                  is_maintenance: false,
                  start_time: '',
                  end_time: '',
                  message: 'This page is under maintenance'
                });
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Maintenance
            </button>
            <button
              onClick={() => {
                fetchRoutes();
                fetchMaintenanceStatus();
                fetchRouteGroups();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Routes</h3>
              <p className="text-sm text-gray-500">All available pages</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              {routes.length}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">In Maintenance</h3>
              <p className="text-sm text-gray-500">Currently under maintenance</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              {maintenanceStatus.total_active || 0}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active</h3>
              <p className="text-sm text-gray-500">Available pages</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              {routes.length - (maintenanceStatus.total_active || 0)}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Scheduled</h3>
              <p className="text-sm text-gray-500">Future maintenance</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              {routes.filter(r => r.maintenance_status.start_time && new Date(r.maintenance_status.start_time) > new Date()).length}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(routeGroups).map(([groupName, groupData]) => (
              <button
                key={groupName}
                onClick={() => openGroupModal(groupName)}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {getGroupIcon(groupName)}
                <span className="text-sm font-medium text-gray-900 mt-2 capitalize">
                  {groupName.replace('_', ' ')} Dashboard
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {groupData.route_count} routes
                </span>
                {groupData.active_maintenance_count > 0 && (
                  <span className="text-xs text-red-600 mt-1">
                    {groupData.active_maintenance_count} in maintenance
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Groups</option>
              <option value="public">Public</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">In Maintenance</option>
              <option value="inactive">Active</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setGroupFilter('all');
                setStatusFilter('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Routes ({filteredRoutes.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoutes.map((route, index) => (
                <tr key={`${route.path}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {route.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {route.path}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGroupColor(route.group)}`}>
                      {getGroupIcon(route.group)}
                      <span className="ml-1 capitalize">{route.group}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {route.maintenance_status.is_maintenance ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        In Maintenance
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.maintenance_status.start_time && route.maintenance_status.end_time ? (
                      <div>
                        <div>Start: {new Date(route.maintenance_status.start_time).toLocaleString()}</div>
                        <div>End: {new Date(route.maintenance_status.end_time).toLocaleString()}</div>
                      </div>
                    ) : route.maintenance_status.start_time ? (
                      <div>Start: {new Date(route.maintenance_status.start_time).toLocaleString()}</div>
                    ) : route.maintenance_status.end_time ? (
                      <div>End: {new Date(route.maintenance_status.end_time).toLocaleString()}</div>
                    ) : (
                      <span className="text-gray-400">No schedule</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(route)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit maintenance"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleMaintenance(route)}
                        disabled={actionLoading}
                        className={`${
                          route.maintenance_status.is_maintenance 
                            ? 'text-green-600 hover:text-green-900' 
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        title={route.maintenance_status.is_maintenance ? 'Disable maintenance' : 'Enable maintenance'}
                      >
                        {route.maintenance_status.is_maintenance ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </button>
                      {route.maintenance_status.maintenance_id && (
                        <button
                          onClick={() => handleDeleteMaintenance(route.maintenance_status.maintenance_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete maintenance"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Maintenance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedRoute ? `Edit Maintenance for ${selectedRoute.name}` : 'Add Maintenance'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
                  <div className="mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_maintenance}
                        onChange={(e) => setFormData({...formData, is_maintenance: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable maintenance mode</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Maintenance message to display to users"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetMaintenance}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Maintenance Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Set Group Maintenance for {selectedGroup.replace('_', ' ')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
                  <div className="mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_maintenance}
                        onChange={(e) => setFormData({...formData, is_maintenance: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable maintenance mode</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Maintenance message to display to users"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetGroupMaintenance}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Maintenance Modal */}
      {showGlobalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Globe className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                Global Maintenance Mode
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
                  <div className="mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_maintenance}
                        onChange={(e) => setFormData({...formData, is_maintenance: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable maintenance mode for entire application</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Maintenance message to display to users"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGlobalModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetGlobalMaintenance}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : 'Set Global Maintenance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagement; 