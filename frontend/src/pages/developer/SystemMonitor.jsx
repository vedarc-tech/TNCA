import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  Server, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react';

const SystemMonitor = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemStatus();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchSystemStatus, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

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

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.critical) return 'text-red-600 bg-red-100';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value >= thresholds.critical) return <AlertTriangle className="h-4 w-4" />;
    if (value >= thresholds.warning) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
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
              <h1 className="text-3xl font-bold text-gray-900">System Monitor</h1>
              <p className="mt-2 text-sm text-gray-600">
                Real-time system performance and health monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
              </label>
              <button
                onClick={fetchSystemStatus}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Cpu className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">CPU Usage</h3>
                <p className="text-sm text-gray-500">Processor utilization</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {systemStatus?.system?.cpu_percent || 0}%
              </div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${systemStatus?.system?.cpu_percent || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                {getStatusIcon(systemStatus?.system?.cpu_percent || 0, { warning: 70, critical: 90 })}
                <span className={`ml-2 text-xs font-medium ${getStatusColor(systemStatus?.system?.cpu_percent || 0, { warning: 70, critical: 90 })}`}>
                  {systemStatus?.system?.cpu_percent >= 90 ? 'Critical' : 
                   systemStatus?.system?.cpu_percent >= 70 ? 'Warning' : 'Normal'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Memory Usage</h3>
                <p className="text-sm text-gray-500">RAM utilization</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {systemStatus?.system?.memory_percent || 0}%
              </div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${systemStatus?.system?.memory_percent || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                {getStatusIcon(systemStatus?.system?.memory_percent || 0, { warning: 80, critical: 95 })}
                <span className={`ml-2 text-xs font-medium ${getStatusColor(systemStatus?.system?.memory_percent || 0, { warning: 80, critical: 95 })}`}>
                  {systemStatus?.system?.memory_percent >= 95 ? 'Critical' : 
                   systemStatus?.system?.memory_percent >= 80 ? 'Warning' : 'Normal'}
                </span>
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
              <div className="text-2xl font-bold text-gray-900">
                {systemStatus?.system?.disk_percent || 0}%
              </div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${systemStatus?.system?.disk_percent || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                {getStatusIcon(systemStatus?.system?.disk_percent || 0, { warning: 85, critical: 95 })}
                <span className={`ml-2 text-xs font-medium ${getStatusColor(systemStatus?.system?.disk_percent || 0, { warning: 85, critical: 95 })}`}>
                  {systemStatus?.system?.disk_percent >= 95 ? 'Critical' : 
                   systemStatus?.system?.disk_percent >= 85 ? 'Warning' : 'Normal'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">System Status</h3>
                <p className="text-sm text-gray-500">Overall health</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                Healthy
              </span>
              <div className="mt-2 text-sm text-gray-500">
                All systems operational
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Memory Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Memory Details</h3>
            </div>
            <div className="p-6">
              {systemStatus?.system && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Memory</span>
                    <span className="text-sm font-medium">{formatBytes(systemStatus.system.memory_total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Used Memory</span>
                    <span className="text-sm font-medium">{formatBytes(systemStatus.system.memory_used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available Memory</span>
                    <span className="text-sm font-medium">{formatBytes(systemStatus.system.memory_available)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usage Percentage</span>
                    <span className="text-sm font-medium">{systemStatus.system.memory_percent}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Process Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Process Information</h3>
            </div>
            <div className="p-6">
              {systemStatus?.process && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Process ID</span>
                    <span className="text-sm font-medium">{systemStatus.process.pid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CPU Usage</span>
                    <span className="text-sm font-medium">{systemStatus.process.cpu_percent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <span className="text-sm font-medium">{formatBytes(systemStatus.process.memory_info.rss)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Virtual Memory</span>
                    <span className="text-sm font-medium">{formatBytes(systemStatus.process.memory_info.vms)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Database Performance */}
        {systemStatus?.database && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Database Performance</h3>
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

        {/* System Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Platform</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {systemStatus?.system_info?.platform || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Platform Version</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {systemStatus?.system_info?.platform_version || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Python Version</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {systemStatus?.system_info?.python_version || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">CPU Cores</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {systemStatus?.system_info?.cpu_count || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Memory</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {systemStatus?.system_info?.memory_total ? formatBytes(systemStatus.system_info.memory_total) : 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Available Memory</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {systemStatus?.system_info?.memory_available ? formatBytes(systemStatus.system_info.memory_available) : 'Unknown'}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SystemMonitor; 