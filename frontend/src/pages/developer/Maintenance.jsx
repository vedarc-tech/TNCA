import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Power,
  Shield,
  Database,
  Server,
  Activity,
  Calendar,
  Bell,
  Wrench,
  Zap
} from 'lucide-react';

const Maintenance = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [scheduledMaintenance, setScheduledMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMaintenanceStatus();
    fetchSystemHealth();
    fetchScheduledMaintenance();
  }, []);

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
        // Check if any routes are in maintenance
        const hasActiveMaintenance = data.data.total_active > 0;
        setMaintenanceMode(hasActiveMaintenance);
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/developer/system/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data.data);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledMaintenance = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/maintenance/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter for scheduled maintenance (future start times)
        const now = new Date();
        const scheduled = data.data.all_maintenance.filter(maintenance => {
          if (!maintenance.start_time) return false;
          const startTime = new Date(maintenance.start_time);
          return startTime > now;
        });
        setScheduledMaintenance(scheduled);
      }
    } catch (error) {
      console.error('Error fetching scheduled maintenance:', error);
    }
  };

  const toggleMaintenanceMode = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (maintenanceMode) {
        // Disable all maintenance
        const response = await fetch('http://localhost:5000/api/maintenance/global', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_maintenance: false,
            message: 'Maintenance mode disabled'
          })
        });
        
        if (response.ok) {
          setMaintenanceMode(false);
          alert('Maintenance mode disabled for all routes');
        } else {
          alert('Failed to disable maintenance mode');
        }
      } else {
        // Enable global maintenance
        const response = await fetch('http://localhost:5000/api/maintenance/global', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_maintenance: true,
            message: 'The application is under maintenance'
          })
        });
        
        if (response.ok) {
          setMaintenanceMode(true);
          alert('Maintenance mode enabled for all routes');
        } else {
          alert('Failed to enable maintenance mode');
        }
      }
      
      // Refresh data
      await fetchMaintenanceStatus();
      await fetchScheduledMaintenance();
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      alert('Error toggling maintenance mode');
    } finally {
      setActionLoading(false);
    }
  };

  const getHealthStatus = (component) => {
    if (!systemHealth) return 'unknown';
    
    switch (component) {
      case 'database':
        return 'healthy';
      case 'server':
        return 'healthy';
      case 'security':
        return 'healthy';
      default:
        return 'unknown';
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
          <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
          <p className="mt-2 text-sm text-gray-600">
            System maintenance and health monitoring
          </p>
        </div>

        {/* Maintenance Mode Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Maintenance Mode</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  System Access Control
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {maintenanceMode 
                    ? 'System is currently in maintenance mode. Users will see a maintenance page.' 
                    : 'System is running normally. Enable maintenance mode to restrict access for system updates.'
                  }
                </p>
              </div>
              <button
                onClick={toggleMaintenanceMode}
                disabled={actionLoading}
                className={`px-6 py-3 rounded-md text-sm font-medium ${
                  maintenanceMode
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin inline" />
                ) : maintenanceMode ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 inline" />
                    Disable Maintenance Mode
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2 inline" />
                    Enable Maintenance Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Database</h3>
                <p className="text-sm text-gray-500">Database health status</p>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(getHealthStatus('database'))}`}>
                <CheckCircle className="h-4 w-4 mr-1" />
                {getHealthStatus('database')}
              </span>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Server</h3>
                <p className="text-sm text-gray-500">Server health status</p>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(getHealthStatus('server'))}`}>
                <CheckCircle className="h-4 w-4 mr-1" />
                {getHealthStatus('server')}
              </span>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Security</h3>
                <p className="text-sm text-gray-500">Security system status</p>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(getHealthStatus('security'))}`}>
                <CheckCircle className="h-4 w-4 mr-1" />
                {getHealthStatus('security')}
              </span>
            </div>
          </div>
        </div>

        {/* System Health Details */}
        {systemHealth && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Health Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">CPU Usage</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {systemHealth.system?.cpu_percent || 0}%
                  </dd>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.system?.cpu_percent || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Memory Usage</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {systemHealth.system?.memory_percent || 0}%
                  </dd>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.system?.memory_percent || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Disk Usage</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {systemHealth.system?.disk_percent || 0}%
                  </dd>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${systemHealth.system?.disk_percent || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Database Collections</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {systemHealth.database?.collections || 0}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Maintenance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Scheduled Maintenance</h3>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule New
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled For
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduledMaintenance.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(task.scheduled_for).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'text-green-600 bg-green-100' :
                        task.status === 'in_progress' ? 'text-yellow-600 bg-yellow-100' :
                        'text-blue-600 bg-blue-100'
                      }`}>
                        {task.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {task.status === 'in_progress' && <RefreshCw className="h-3 w-3 mr-1" />}
                        {task.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Wrench className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Maintenance Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Maintenance Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Database className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Database Backup</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Clear Cache</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Security Scan</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">System Check</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Maintenance; 