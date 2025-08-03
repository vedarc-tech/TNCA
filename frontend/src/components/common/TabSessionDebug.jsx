import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { debugSession, sessionManager, STORAGE_KEYS } from '../../utils/sessionManager';

const TabSessionDebug = () => {
  const { user, isAuthenticated, sessionId } = useAuth();
  const [showDebug, setShowDebug] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(true);

  const handleDebugStorage = () => {
    debugSession();
    setShowDebug(!showDebug);
  };

  const getAuthKeys = () => {
    return Object.values(STORAGE_KEYS).filter(key => 
      localStorage.getItem(key) !== null
    );
  };

  const authKeys = getAuthKeys();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-200">
      {isMinimized ? (
        // Minimized state - just a small icon button
        <button
          onClick={() => setIsMinimized(false)}
          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
          title="Session Debug"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      ) : (
        // Expanded state
        <div className="p-4 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Session Debug</h3>
            <div className="flex gap-1">
              <button
                onClick={handleDebugStorage}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                {showDebug ? 'Hide' : 'Debug'}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                title="Minimize"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="text-xs space-y-1">
            <div><strong>Session ID:</strong> {sessionId}</div>
            <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
            {user && (
              <div><strong>User:</strong> {user.name || user.email}</div>
            )}
            <div><strong>Auth Keys:</strong> {authKeys.length}</div>
          </div>

          {showDebug && (
            <div className="mt-3 text-xs">
              <div className="font-semibold mb-1">Auth Keys:</div>
              <div className="bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                {authKeys.map(key => (
                  <div key={key} className="text-gray-600">
                    {key}: {localStorage.getItem(key)?.substring(0, 50)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TabSessionDebug; 