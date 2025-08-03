import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Home,
  Mail,
  Phone,
  Calendar,
  CheckCircle
} from 'lucide-react';

const MaintenancePage = ({ maintenanceInfo, onRetry }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    // Check if user is developer
    const userRole = localStorage.getItem('user_role');
    setIsDeveloper(userRole === 'developer');

    // Calculate countdown if end time is provided
    if (maintenanceInfo?.end_time) {
      const endTime = new Date(maintenanceInfo.end_time);
      const updateCountdown = () => {
        const now = new Date();
        const difference = endTime - now;
        
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft(null);
        }
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(interval);
    }
  }, [maintenanceInfo]);

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Developer Banner */}
        {isDeveloper && (
          <div className="mb-8 bg-yellow-100 border border-yellow-400 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                Maintenance Mode Enabled (Developer View)
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              You can access this page because you are a developer. Regular users will see the maintenance page.
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Animated Icon */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Wrench className="h-12 w-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Under Maintenance
          </h1>

          {/* Message */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {maintenanceInfo?.message || 'This page is currently under maintenance. We are working hard to bring it back online as soon as possible.'}
          </p>

          {/* Countdown Timer */}
          {timeLeft && (
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Estimated completion time:
                </span>
              </div>
              <div className="flex justify-center space-x-4">
                {timeLeft.days > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatTime(timeLeft.days)}</div>
                    <div className="text-xs text-gray-500">Days</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(timeLeft.hours)}</div>
                  <div className="text-xs text-gray-500">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(timeLeft.minutes)}</div>
                  <div className="text-xs text-gray-500">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(timeLeft.seconds)}</div>
                  <div className="text-xs text-gray-500">Seconds</div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Info */}
          {maintenanceInfo?.start_time && (
            <div className="mb-8 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Maintenance Schedule</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Started: {new Date(maintenanceInfo.start_time).toLocaleString()}</div>
                {maintenanceInfo.end_time && (
                  <div>Expected End: {new Date(maintenanceInfo.end_time).toLocaleString()}</div>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {timeLeft && maintenanceInfo?.start_time && maintenanceInfo?.end_time && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>
                  {Math.round(
                    ((new Date() - new Date(maintenanceInfo.start_time)) /
                      (new Date(maintenanceInfo.end_time) - new Date(maintenanceInfo.start_time))) *
                      100
                  )}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      ((new Date() - new Date(maintenanceInfo.start_time)) /
                        (new Date(maintenanceInfo.end_time) - new Date(maintenanceInfo.start_time))) *
                        100,
                      100
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </button>
          </div>

          {/* Status Indicators */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Database</span>
            </div>
            <div className="flex items-center justify-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">Application</span>
            </div>
            <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
              <Wrench className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Need immediate assistance? Contact our support team:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@example.com"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              support@example.com
            </a>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              +1 (234) 567-890
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Thank you for your patience. We apologize for any inconvenience.</p>
          <p className="mt-1">
            Maintenance ID: {maintenanceInfo?.maintenance_id || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage; 