import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SessionWarningModal = () => {
  const { sessionWarning, extendSession, dismissWarning, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (sessionWarning) {
      setTimeLeft(300);
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sessionWarning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStayLoggedIn = async () => {
    await extendSession();
  };

  if (!sessionWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-in">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Session Expiring Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your session will expire in <span className="font-bold text-yellow-600 dark:text-yellow-400">{formatTime(timeLeft)}</span>. 
              Would you like to stay logged in?
            </p>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Clock className="h-4 w-4" />
              <span>Sessions last 30 minutes for security</span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Stay Logged In
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Log Out
              </button>
            </div>
            
            <button
              onClick={dismissWarning}
              className="w-full mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Dismiss (you'll be logged out automatically)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
