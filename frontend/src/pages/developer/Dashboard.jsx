import React from 'react';

const DeveloperDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Complete system overview and control panel
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">Online</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Users</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">0</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Games</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">0</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Quizzes</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">0</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">System Control</h3>
            <p className="text-sm text-gray-600">Monitor and control system operations</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">User Management</h3>
            <p className="text-sm text-gray-600">Manage all users with complete control</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">Database</h3>
            <p className="text-sm text-gray-600">Database operations and monitoring</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">System Monitor</h3>
            <p className="text-sm text-gray-600">Real-time system monitoring</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">Security Audit</h3>
            <p className="text-sm text-gray-600">Security analysis and vulnerabilities</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600">Advanced analytics and reporting</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">Logs</h3>
            <p className="text-sm text-gray-600">System logs and activity monitoring</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">Maintenance</h3>
            <p className="text-sm text-gray-600">System maintenance and updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard; 