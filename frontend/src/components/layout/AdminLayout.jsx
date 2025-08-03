import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  Shield,
  Trophy,
  Target,
  Activity,
  Gamepad2
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users
    },
    {
      name: "Quiz Management",
      href: "/admin/quizzes",
      icon: FileText
    },
    {
      name: "Game Management",
      href: "/admin/games",
      icon: Trophy
    },
    {
      name: "Play Games",
      href: "/admin/play-games",
      icon: Gamepad2
    },
    {
      name: "Content Management",
      href: "/admin/settings",
      icon: FileText
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: FileBarChart
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static lg:inset-0 lg:w-64`}>
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">TNCA Admin</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isCurrent = location.pathname === item.href || 
                             (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role?.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const Header = () => {
    const currentPage = navigation.find(item => 
      location.pathname === item.href || 
      (item.href !== "/admin" && location.pathname.startsWith(item.href))
    );
    
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 w-full">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6 w-full">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className="ml-3 sm:ml-4 lg:ml-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {currentPage?.name || 'Admin Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search */}
            <div className="hidden sm:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Notifications */}
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:block text-xs sm:text-sm font-medium text-gray-700 truncate">
                  {user?.name}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 w-full">
        <Header />
        
        <main className="flex-1 overflow-auto w-full">
          <div className="p-4 sm:p-6 lg:p-8 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 