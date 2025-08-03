import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Clock,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Calendar,
  Target
} from 'lucide-react';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/developer/analytics/advanced', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Mock data for demonstration
      setAnalyticsData({
        user_roles: [
          { _id: 'user', count: 150 },
          { _id: 'admin', count: 5 },
          { _id: 'super_admin', count: 2 },
          { _id: 'developer', count: 1 }
        ],
        game_stats: [
          { _id: 'chess', count: 45 },
          { _id: 'cube', count: 32 },
          { _id: 'quiz', count: 78 }
        ],
        performance_data: [
          { _id: 'Bronze', avg_iq: 85, count: 50 },
          { _id: 'Silver', avg_iq: 95, count: 35 },
          { _id: 'Gold', avg_iq: 105, count: 25 },
          { _id: 'Platinum', avg_iq: 115, count: 15 },
          { _id: 'Diamond', avg_iq: 125, count: 8 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/developer/analytics/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export analytics data');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      alert('Error exporting analytics data');
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
              <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="mt-2 text-sm text-gray-600">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={fetchAnalyticsData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                <p className="text-sm text-gray-500">All registered users</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                {analyticsData?.user_roles?.reduce((sum, role) => sum + role.count, 0) || 0}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Active Games</h3>
                <p className="text-sm text-gray-500">Games played today</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                {analyticsData?.game_stats?.reduce((sum, game) => sum + game.count, 0) || 0}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+8% from yesterday</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Avg IQ Score</h3>
                <p className="text-sm text-gray-500">Average user performance</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                {analyticsData?.performance_data?.length > 0 
                  ? Math.round(analyticsData.performance_data.reduce((sum, perf) => sum + perf.avg_iq, 0) / analyticsData.performance_data.length)
                  : 0}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+5 points this week</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Session Time</h3>
                <p className="text-sm text-gray-500">Average session duration</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">24m</div>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600">-2m from last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Role Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Role Distribution</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData?.user_roles?.map((role) => (
                <div key={role._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 capitalize">
                        {role._id}
                      </h4>
                      <p className="text-2xl font-bold text-gray-900">
                        {role.count}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {((role.count / analyticsData.user_roles.reduce((sum, r) => sum + r.count, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Statistics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Game Statistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analyticsData?.game_stats?.map((game) => (
                <div key={game._id} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {game.count}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {game._id} Games
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(game.count / analyticsData.game_stats.reduce((sum, g) => sum + g.count, 0)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance by Badge Level */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance by Badge Level</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Badge Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average IQ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData?.performance_data?.map((perf) => (
                    <tr key={perf._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {perf._id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {perf.avg_iq}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {perf.count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {((perf.count / analyticsData.performance_data.reduce((sum, p) => sum + p.count, 0)) * 100).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={exportAnalytics}
                className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Export Report</span>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">View Details</span>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-6 w-6 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Advanced Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Analytics; 