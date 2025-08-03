import React, { useState, useEffect } from "react";
import { 
  FileBarChart, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Target,
  Brain,
  Clock,
  Filter,
  RefreshCw,
  Eye,
  Share2,
  Trash2,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { toast } from "react-hot-toast";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive report data
      const [analyticsRes, iqGrowthRes, dailyStatsRes] = await Promise.all([
        fetch("/api/analytics/performance", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("/api/analytics/iq-growth", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("/api/analytics/daily-stats", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);

      const [analyticsData, iqGrowthData, dailyStatsData] = await Promise.all([
        analyticsRes.json(),
        iqGrowthRes.json(),
        dailyStatsRes.json()
      ]);

      if (analyticsData.success && iqGrowthData.success && dailyStatsData.success) {
        setReportData({
          analytics: analyticsData.data,
          iqGrowth: iqGrowthData.data,
          dailyStats: dailyStatsData.data
        });
      }
    } catch (error) {
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type) => {
    try {
      setGeneratingReport(true);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const report = {
        id: Date.now().toString(),
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        generated_at: new Date().toISOString(),
        status: 'completed',
        data: reportData
      };
      
      setReports(prev => [report, ...prev]);
      toast.success(`${type} report generated successfully`);
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportReport = async (reportId, format = 'excel') => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Export based on report type
      let exportType = 'users';
      switch (report.type) {
        case 'performance':
          exportType = 'quiz_results';
          break;
        case 'iq_analytics':
          exportType = 'iq_analytics';
          break;
        default:
          exportType = 'users';
      }

      const response = await fetch(`/api/analytics/export/${exportType}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Report exported successfully");
      }
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const deleteReport = (reportId) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast.success("Report deleted successfully");
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center">
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last period
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const ReportCard = ({ report }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
          <p className="text-sm text-gray-600">
            Generated: {new Date(report.generated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {report.status}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => exportReport(report.id)}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          <Download className="w-3 h-3" />
          <span className="text-sm">Export</span>
        </button>
        <button
          onClick={() => exportReport(report.id, 'pdf')}
          className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
        >
          <FileBarChart className="w-3 h-3" />
          <span className="text-sm">PDF</span>
        </button>
        <button
          onClick={() => deleteReport(report.id)}
          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          <Trash2 className="w-3 h-3" />
          <span className="text-sm">Delete</span>
        </button>
      </div>
    </div>
  );

  const IQGrowthReport = ({ data }) => {
    if (!data || !data.iq_growth_data) return null;

    const topPerformers = data.iq_growth_data.slice(0, 5);
    const averageGrowth = data.average_iq_growth;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IQ Growth Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Total Users Tracked"
            value={data.total_users_tracked}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Average IQ Growth"
            value={`${averageGrowth.toFixed(1)}`}
            icon={Brain}
            color="bg-purple-500"
            trend={averageGrowth > 0 ? averageGrowth : null}
          />
          <StatCard
            title="Top Performer"
            value={topPerformers[0]?.user_name || 'N/A'}
            icon={TrendingUp}
            color="bg-green-500"
            subtitle={`${topPerformers[0]?.iq_growth.toFixed(1)} IQ growth`}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Top Performers</h4>
          {topPerformers.map((user, index) => (
            <div key={user.user_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-600">#{index + 1}</span>
                <div>
                  <p className="font-medium text-gray-900">{user.user_name}</p>
                  <p className="text-sm text-gray-600">{user.attempts_count} attempts</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+{user.iq_growth.toFixed(1)} IQ</p>
                <p className="text-sm text-gray-600">
                  {user.initial_iq} → {user.final_iq}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PerformanceReport = ({ data }) => {
    if (!data) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Users"
            value={data.analytics?.total_users || 0}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Users"
            value={data.analytics?.active_users || 0}
            icon={Activity}
            color="bg-green-500"
          />
          <StatCard
            title="Total Quizzes"
            value={data.analytics?.total_quizzes || 0}
            icon={Target}
            color="bg-yellow-500"
          />
          <StatCard
            title="Average IQ"
            value={`${data.analytics?.average_iq || 0}`}
            icon={Brain}
            color="bg-purple-500"
          />
        </div>

        {data.analytics?.category_stats && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Performance by Category</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.analytics.category_stats.map((category, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{category.category}</span>
                    <span className="text-sm text-gray-600">{category.quiz_count} quizzes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(category.avg_score || 0, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Avg Score: {Math.round(category.avg_score || 0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const DailyReport = ({ data }) => {
    if (!data) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">User Registrations (Last 7 Days)</h4>
            <div className="space-y-2">
              {data.dailyStats?.daily_registrations?.slice(-7).map((day, index) => (
                <div key={day._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{day._id}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(day.count / Math.max(...data.dailyStats.daily_registrations.map(d => d.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quiz Attempts (Last 7 Days)</h4>
            <div className="space-y-2">
              {data.dailyStats?.daily_quiz_attempts?.slice(-7).map((day, index) => (
                <div key={day._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{day._id}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(day.count / Math.max(...data.dailyStats.daily_quiz_attempts.map(d => d.count))) * 100}%` }}
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Generate and export comprehensive reports</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <button
              onClick={fetchReportData}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Report Generation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => generateReport('performance')}
          disabled={generatingReport}
          className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow disabled:opacity-50"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Report</h3>
              <p className="text-sm text-gray-600">Quiz and game performance analytics</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Generate comprehensive performance insights</span>
            {generatingReport && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
          </div>
        </button>

        <button
          onClick={() => generateReport('iq_analytics')}
          disabled={generatingReport}
          className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow disabled:opacity-50"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">IQ Analytics Report</h3>
              <p className="text-sm text-gray-600">IQ growth and cognitive development</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Track cognitive development progress</span>
            {generatingReport && <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />}
          </div>
        </button>

        <button
          onClick={() => generateReport('user_analytics')}
          disabled={generatingReport}
          className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow disabled:opacity-50"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">User Analytics Report</h3>
              <p className="text-sm text-gray-600">User engagement and activity</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Analyze user behavior and engagement</span>
            {generatingReport && <RefreshCw className="w-4 h-4 animate-spin text-green-600" />}
          </div>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: FileBarChart },
              { id: 'iq-growth', name: 'IQ Growth', icon: Brain },
              { id: 'performance', name: 'Performance', icon: BarChart3 },
              { id: 'daily', name: 'Daily Activity', icon: Activity },
              { id: 'generated', name: 'Generated Reports', icon: Download }
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
        {activeTab === 'overview' && reportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceReport data={reportData} />
            <IQGrowthReport data={reportData} />
          </div>
        )}

        {activeTab === 'iq-growth' && reportData && (
          <IQGrowthReport data={reportData} />
        )}

        {activeTab === 'performance' && reportData && (
          <PerformanceReport data={reportData} />
        )}

        {activeTab === 'daily' && reportData && (
          <DailyReport data={reportData} />
        )}

        {activeTab === 'generated' && (
      <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Generated Reports</h3>
            
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FileBarChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No reports generated yet</h4>
                <p className="text-gray-600">Generate your first report to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports; 