import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  HardDrive,
  FileText,
  Trash2,
  Eye,
  Settings,
  Activity,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';

const DatabaseManagement = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
    fetchBackups();
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

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/developer/database/backups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackups(data.data);
      } else {
        // If no backups endpoint exists, show empty list
        setBackups([]);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      setBackups([]);
    }
  };

  const handleCreateBackup = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/developer/database/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Backup created successfully: ${data.data.backup_file}`);
        fetchBackups();
      } else {
        const error = await response.json();
        alert(`Failed to create backup: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    if (!confirm(`Are you sure you want to restore from backup: ${selectedBackup.filename}? This will overwrite all current data.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/developer/database/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backup_file: selectedBackup.filename
        })
      });
      
      if (response.ok) {
        alert('Database restored successfully');
        setShowRestoreModal(false);
        setSelectedBackup(null);
      } else {
        const error = await response.json();
        alert(`Failed to restore database: ${error.message}`);
      }
    } catch (error) {
      console.error('Error restoring database:', error);
      alert('Error restoring database');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
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
          <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage database operations, backups, and monitoring
          </p>
        </div>

        {/* Database Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Database Status</h3>
                <p className="text-sm text-gray-500">Connection and health</p>
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
              <HardDrive className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Storage</h3>
                <p className="text-sm text-gray-500">Database size and usage</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {systemStatus?.database ? formatBytes(systemStatus.database.storage_size) : 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Total storage used</div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Collections</h3>
                <p className="text-sm text-gray-500">Number of collections</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {systemStatus?.database?.collections || 0}
              </div>
              <div className="text-sm text-gray-500">Active collections</div>
            </div>
          </div>
        </div>

        {/* Database Statistics */}
        {systemStatus?.database && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Database Statistics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div>
                  <dt className="text-sm font-medium text-gray-500">Index Size</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {formatBytes(systemStatus.database.index_size)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Backup Management</h3>
              <button
                onClick={handleCreateBackup}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Create Backup
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Backup File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
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
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {backup.filename}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(backup.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                        {backup.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {backup.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                        {backup.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Restore from this backup"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => alert('Download functionality would be implemented here')}
                          className="text-green-600 hover:text-green-900"
                          title="Download backup"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => alert('Delete functionality would be implemented here')}
                          className="text-red-600 hover:text-red-900"
                          title="Delete backup"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Restore Modal */}
        {showRestoreModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-medium text-gray-900">Restore Database</h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to restore the database from backup: <strong>{selectedBackup?.filename}</strong>?
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      This action will overwrite all current data and cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowRestoreModal(false);
                      setSelectedBackup(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRestoreBackup}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Restore
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default DatabaseManagement; 