import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Users, 
  FileText, 
  Trophy, 
  TrendingUp, 
  BarChart3, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Target,
  Award,
  Activity,
  Brain
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalGames: 0,
    averageIQ: 0,
    activeUsers: 0,
    totalAttempts: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        } else {
          toast.error(statsData.message);
          setStats({
            totalUsers: 0,
            totalQuizzes: 0,
            totalGames: 0,
            averageIQ: 0,
            activeUsers: 0,
            totalAttempts: 0
          });
        }
      }
      
      // Fetch recent activity
      const activityResponse = await fetch('/api/admin/dashboard/activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setRecentActivity(activityData.data);
        } else {
          toast.error(activityData.message);
          setRecentActivity([]);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data. Please try again.');
      setStats({
        totalUsers: 0,
        totalQuizzes: 0,
        totalGames: 0,
        averageIQ: 0,
        activeUsers: 0,
        totalAttempts: 0
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 ${color} w-full`}>
      <div className="flex items-center justify-between w-full h-full">
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-xs font-medium text-gray-600 leading-tight">{title}</p>
          <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1 leading-tight">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-full ml-2 flex-shrink-0 ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, action, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group w-full">
      <div className="flex items-start space-x-3 sm:space-x-4 w-full">
        <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${color} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="w-full mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Here's what's happening with your TNCA platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="border-l-blue-500"
          subtitle="Active accounts"
        />
        <StatCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          icon={FileText}
          color="border-l-green-500"
          subtitle="Available tests"
        />
        <StatCard
          title="Total Games"
          value={stats.totalGames}
          icon={Trophy}
          color="border-l-purple-500"
          subtitle="Interactive games"
        />
        <StatCard
          title="Avg IQ Score"
          value={stats.averageIQ}
          icon={Brain}
          color="border-l-orange-500"
          subtitle="Platform average"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Activity}
          color="border-l-red-500"
          subtitle="This month"
        />
        <StatCard
          title="Total Attempts"
          value={stats.totalAttempts.toLocaleString()}
          icon={BarChart3}
          color="border-l-indigo-500"
          subtitle="All time"
        />
      </div>

      {/* Quick Actions */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Create User"
          description="Add new student account"
          icon={Plus}
          color="bg-blue-500"
          action={() => {/* Navigate to user creation */}}
        />
        <QuickActionCard
          title="Create Quiz"
          description="Design new assessment"
          icon={FileText}
          color="bg-green-500"
          action={() => {/* Navigate to quiz creation */}}
        />
        <QuickActionCard
          title="View Analytics"
          description="Performance insights"
          icon={BarChart3}
          color="bg-purple-500"
          action={() => {/* Navigate to analytics */}}
        />
        <QuickActionCard
          title="Export Reports"
          description="Download data"
          icon={Download}
          color="bg-orange-500"
          action={() => {/* Navigate to reports */}}
        />
      </div>

      {/* Recent Activity & Performance Charts */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Performance Overview</h2>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Average Quiz Score</span>
              <span className="text-sm sm:text-base lg:text-lg font-bold text-blue-600">85%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-gray-700">IQ Growth Rate</span>
              <span className="text-sm sm:text-base lg:text-lg font-bold text-green-600">+12%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-gray-700">User Engagement</span>
              <span className="text-sm sm:text-base lg:text-lg font-bold text-purple-600">78%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Completion Rate</span>
              <span className="text-sm sm:text-base lg:text-lg font-bold text-orange-600">92%</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">System Status</h2>
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-700">Database: Online</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-700">API: Operational</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-700">Security: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 