import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Settings, 
  Users, 
  Database, 
  Activity, 
  Shield, 
  BarChart3, 
  Terminal, 
  Server, 
  LogOut, 
  Menu, 
  X,
  Home,
  Gamepad2,
  Trophy,
  FileText,
  AlertTriangle,
  HardDrive,
  Network,
  Cpu,
  Monitor,
  Zap,
  Lock,
  Eye,
  Trash2,
  Edit,
  Plus,
  Download,
  Upload,
  RotateCcw,
  Power,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench
} from 'lucide-react';

const DeveloperLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/developer',
      icon: Home,
      current: location.pathname === '/developer' || location.pathname === '/developer/'
    },
    {
      name: 'System Control',
      href: '/developer/system',
      icon: Settings,
      current: location.pathname.startsWith('/developer/system')
    },
    {
      name: 'User Management',
      href: '/developer/users',
      icon: Users,
      current: location.pathname.startsWith('/developer/users')
    },
    {
      name: 'Database',
      href: '/developer/database',
      icon: Database,
      current: location.pathname.startsWith('/developer/database')
    },
    {
      name: 'System Monitor',
      href: '/developer/monitor',
      icon: Monitor,
      current: location.pathname.startsWith('/developer/monitor')
    },
    {
      name: 'Security Audit',
      href: '/developer/security',
      icon: Shield,
      current: location.pathname.startsWith('/developer/security')
    },
    {
      name: 'Analytics',
      href: '/developer/analytics',
      icon: BarChart3,
      current: location.pathname.startsWith('/developer/analytics')
    },
    {
      name: 'Logs',
      href: '/developer/logs',
      icon: Terminal,
      current: location.pathname.startsWith('/developer/logs')
    },
    {
      name: 'Maintenance',
      href: '/developer/maintenance',
      icon: AlertTriangle,
      current: location.pathname.startsWith('/developer/maintenance') && !location.pathname.includes('maintenance-management')
    },
    {
      name: 'Maintenance Management',
      href: '/developer/maintenance-management',
      icon: Wrench,
      current: location.pathname.startsWith('/developer/maintenance-management')
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-900">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-white">Developer Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-700 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-900">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-white">Developer Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-700 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-x-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeveloperLayout; 