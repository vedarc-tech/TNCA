import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  Filter,
  Download,
  Eye,
  Activity,
  Brain,
  Trophy,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [iqGrowthData, setIqGrowthData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [leaderboardFilters, setLeaderboardFilters] = useState({
    quiz_id: '',
    game_type: '',
    date_from: '',
    date_to: '',
    limit: 50
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data in parallel
      const [
        performanceRes,
        iqGrowthRes,
        heatmapRes,
        leaderboardRes,
        dailyStatsRes
      ] = await Promise.all([
        fetch("/api/analytics/performance", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("/api/analytics/iq-growth", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("/api/analytics/performance-heatmap", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("/api/analytics/leaderboard", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("/api/analytics/daily-stats", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);

      const [performanceData, iqGrowthData, heatmapData, leaderboardData, dailyStatsData] = await Promise.all([
        performanceRes.json(),
        iqGrowthRes.json(),
        heatmapRes.json(),
        leaderboardRes.json(),
        dailyStatsRes.json()
      ]);

      if (performanceData.success) setAnalyticsData(performanceData.data);
      if (iqGrowthData.success) setIqGrowthData(iqGrowthData.data);
      if (heatmapData.success) setHeatmapData(heatmapData.data);
      if (leaderboardData.success) setLeaderboardData(leaderboardData.data);
      if (dailyStatsData.success) setDailyStats(dailyStatsData.data);

    } catch (error) {
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredLeaderboard = async () => {
    try {
      const params = new URLSearchParams(leaderboardFilters);
      const response = await fetch(`/api/analytics/leaderboard?${params}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (data.success) {
        setLeaderboardData(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch leaderboard data");
    }
  };

  const exportData = async (type) => {
    try {
      const response = await fetch(`/api/analytics/export/${type}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`${type} data exported successfully`);
      }
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center">
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const PerformanceHeatmap = ({ data }) => {
    if (!data) return null;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getColor = (value) => {
      const max = data.max_value;
      const min = data.min_value;
      const normalized = (value - min) / (max - min);
      
      if (normalized === 0) return 'bg-gray-100';
      if (normalized < 0.25) return 'bg-red-200';
      if (normalized < 0.5) return 'bg-orange-200';
      if (normalized < 0.75) return 'bg-yellow-200';
      return 'bg-green-200';
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-25 gap-1">
              <div className="h-8"></div>
              {hours.map(hour => (
                <div key={hour} className="h-8 flex items-center justify-center text-xs text-gray-600">
                  {hour}:00
                </div>
              ))}
              
              {days.map((day, dayIndex) => (
                <React.Fragment key={day}>
                  <div className="h-8 flex items-center justify-center text-xs font-medium text-gray-700">
                    {day}
                  </div>
                  {hours.map(hour => (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-8 w-8 rounded-sm ${getColor(data.heatmap_matrix[dayIndex]?.[hour] || 0)}`}
                      title={`${day} ${hour}:00 - Score: ${data.heatmap_matrix[dayIndex]?.[hour] || 0}`}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-100 rounded-sm"></div>
            <span>No Activity</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-red-200 rounded-sm"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-orange-200 rounded-sm"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-yellow-200 rounded-sm"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-green-200 rounded-sm"></div>
            <span>Excellent</span>
          </div>
        </div>
      </div>
    );
  };

  const IQGrowthChart = ({ data }) => {
    if (!data || !data.iq_growth_data) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IQ Growth Tracking</h3>
        <div className="space-y-4">
          {data.iq_growth_data.slice(0, 10).map((user, index) => (
            <div key={user.user_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">{user.user_name}</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">Initial: {user.initial_iq}</span>
                  <span className="text-gray-600">Final: {user.final_iq}</span>
                  <span className={`font-semibold ${user.iq_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {user.iq_growth >= 0 ? '+' : ''}{user.iq_growth.toFixed(1)} IQ
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${user.iq_growth >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(user.iq_growth) / 2, 100)}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {user.attempts_count} attempts in the last 30 days
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LeaderboardTable = ({ data, filters, onFilterChange }) => {
    if (!data) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.quiz_id}
              onChange={(e) => onFilterChange('quiz_id', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">All Quizzes</option>
              <option value="overall">Overall IQ</option>
            </select>
            <select
              value={filters.game_type}
              onChange={(e) => onFilterChange('game_type', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">All Games</option>
              <option value="chess">Chess</option>
              <option value="cube">Cube</option>
            </select>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => onFilterChange('date_from', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => onFilterChange('date_to', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={fetchFilteredLeaderboard}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.leaderboard?.map((entry, index) => (
                <tr key={entry._id || index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <Trophy className={`w-5 h-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{entry.user_name}</div>
                      <div className="text-sm text-gray-500">{entry.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.best_score || entry.iq_score}
                      {entry.iq_score && <span className="text-xs text-gray-500 ml-1">IQ</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.attempts || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.avg_time ? `${Math.round(entry.avg_time / 60)}m` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const DailyStatsChart = ({ data }) => {
    if (!data) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Statistics (Last 30 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">User Registrations</h4>
            <div className="space-y-2">
              {data.daily_registrations?.slice(-7).map((day, index) => (
                <div key={day._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{day._id}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(day.count / Math.max(...data.daily_registrations.map(d => d.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quiz Attempts</h4>
            <div className="space-y-2">
              {data.daily_quiz_attempts?.slice(-7).map((day, index) => (
                <div key={day._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{day._id}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(day.count / Math.max(...data.daily_quiz_attempts.map(d => d.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive performance insights and data visualization</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => exportData('users')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export Users</span>
            </button>
            <button
              onClick={() => exportData('quiz_results')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              <span>Export Results</span>
            </button>
            <button
              onClick={() => exportData('iq_analytics')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Download className="w-4 h-4" />
              <span>Export IQ Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={analyticsData.total_users}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Users"
            value={analyticsData.active_users}
            icon={Activity}
            color="bg-green-500"
          />
          <StatCard
            title="Total Quizzes"
            value={analyticsData.total_quizzes}
            icon={Target}
            color="bg-yellow-500"
          />
          <StatCard
            title="Average IQ"
            value={`${analyticsData.average_iq}`}
            icon={Brain}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'iq-growth', name: 'IQ Growth', icon: TrendingUp },
              { id: 'performance', name: 'Performance', icon: Activity },
              { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
              { id: 'daily', name: 'Daily Stats', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceHeatmap data={heatmapData} />
            <IQGrowthChart data={iqGrowthData} />
          </div>
        )}

        {activeTab === 'iq-growth' && (
          <IQGrowthChart data={iqGrowthData} />
        )}

        {activeTab === 'performance' && (
          <PerformanceHeatmap data={heatmapData} />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTable 
            data={leaderboardData} 
            filters={leaderboardFilters}
            onFilterChange={(key, value) => setLeaderboardFilters(prev => ({ ...prev, [key]: value }))}
          />
        )}

        {activeTab === 'daily' && (
          <DailyStatsChart data={dailyStats} />
        )}
      </div>
    </div>
  );
};

export default Analytics; 