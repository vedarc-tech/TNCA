import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Server, 
  Database, 
  Shield, 
  Power, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react';

const SystemControl = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
    fetchMaintenanceStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/developer/system/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
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
        // Check if any routes are in maintenance
        const hasActiveMaintenance = data.data.total_active > 0;
        setMaintenanceMode(hasActiveMaintenance);
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
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
          const error = await response.json();
          alert(`Failed to disable maintenance mode: ${error.message}`);
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
          const error = await response.json();
          alert(`Failed to enable maintenance mode: ${error.message}`);
        }
      }
      
      // Refresh data
      await fetchMaintenanceStatus();
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      alert('Error toggling maintenance mode');
    } finally {
      setActionLoading(false);
    }
  };

  const restartSystem = async () => {
    if (!confirm('Are you sure you want to restart the system? This will temporarily interrupt service.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/developer/system/restart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('System restart initiated. Please wait a moment for the system to come back online.');
      } else {
        const error = await response.json();
        alert(`Failed to restart system: ${error.message}`);
      }
    } catch (error) {
      console.error('Error restarting system:', error);
      alert('Error restarting system');
    } finally {
      setActionLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (value, thresholds = { warning: 80, critical: 95 }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (value, thresholds = { warning: 80, critical: 95 }) => {
    if (value >= thresholds.critical) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (value >= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
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
            <h1 className="text-3xl font-bold text-gray-900">System Control</h1>
            <p className="mt-2 text-sm text-gray-600">
              Monitor and control system operations
            </p>
          </div>
          <button
            onClick={fetchSystemStatus}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <Server className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Server Status</h3>
              <p className="text-sm text-gray-500">System health</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Online
            </span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Database</h3>
              <p className="text-sm text-gray-500">Connection status</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Connected
            </span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
              <p className="text-sm text-gray-500">Security status</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* System Resources */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Cpu className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">CPU Usage</h3>
                <p className="text-sm text-gray-500">Processor utilization</p>
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-2xl font-bold ${getStatusColor(systemStatus.system?.cpu_percent || 0)}`}>
                {systemStatus.system?.cpu_percent || 0}%
              </div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${systemStatus.system?.cpu_percent || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                {getStatusIcon(systemStatus.system?.cpu_percent || 0)}
                <span className={`ml-2 text-xs font-medium ${getStatusColor(systemStatus.system?.cpu_percent || 0)}`}>
                  {systemStatus.system?.cpu_percent >= 95 ? 'Critical' : 
                   systemStatus.system?.cpu_percent >= 80 ? 'Warning' : 'Normal'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <MemoryStick className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Memory Usage</h3>
                <p className="text-sm text-gray-500">RAM utilization</p>
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-2xl font-bold ${getStatusColor(systemStatus.system?.memory_percent || 0)}`}>
                {systemStatus.system?.memory_percent || 0}%
              </div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${systemStatus.system?.memory_percent || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {formatBytes(systemStatus.system?.memory_used || 0)} / {formatBytes(systemStatus.system?.memory_total || 0)}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Disk Usage</h3>
                <p className="text-sm text-gray-500">Storage utilization</p>
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-2xl font-bold ${getStatusColor(systemStatus.system?.disk_percent || 0)}`}>
                {systemStatus.system?.disk_percent || 0}%
              </div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${systemStatus.system?.disk_percent || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {formatBytes(systemStatus.system?.disk_used || 0)} / {formatBytes(systemStatus.system?.disk_total || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Controls</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Maintenance Mode</h4>
                  <p className="text-sm text-gray-500">
                    {maintenanceMode ? 'System is in maintenance mode' : 'System is operational'}
                  </p>
                </div>
                <button
                  onClick={toggleMaintenanceMode}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    maintenanceMode 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    maintenanceMode ? 'Disable' : 'Enable'
                  )}
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">System Restart</h4>
                  <p className="text-sm text-gray-500">
                    Restart the entire system
                  </p>
                </div>
                <button
                  onClick={restartSystem}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Information */}
      {systemStatus?.database && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Database Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Collections</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {systemStatus.database.collections}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Data Size</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {formatBytes(systemStatus.database.data_size)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Storage Size</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {formatBytes(systemStatus.database.storage_size)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Indexes</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {systemStatus.database.indexes}
                </dd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemControl; 