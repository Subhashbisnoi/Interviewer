import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Interviewer</h1>
            </div>
            
            <nav className="flex space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span>🏠</span>
                <span>Home</span>
              </Link>
              
              {user && (
                <>
                  <Link
                    to="/history"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/history') 
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>📋</span>
                    <span>History</span>
                  </Link>
                  
                  <Link
                    to="/pinned"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/pinned') 
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>📌</span>
                    <span>Pinned</span>
                  </Link>
                  
                  <Link
                    to="/leaderboard"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/leaderboard') 
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>🏆</span>
                    <span>Leaderboard</span>
                  </Link>
                </>
              )}
              
              {location.pathname === '/interview' && (
                <Link
                  to="/interview"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  <span>🎤</span>
                  <span>Interview</span>
                </Link>
              )}
              
              {location.pathname === '/results' && (
                <Link
                  to="/results"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  <span>📈</span>
                  <span>Results</span>
                </Link>
              )}
              
              {location.pathname === '/pinned' && (
                <Link
                  to="/pinned"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  <span>📌</span>
                  <span>Pinned</span>
                </Link>
              )}
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400">👤</span>
                    </div>
                    <span className="hidden md:inline">{user.name || user.email.split('@')[0]}</span>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                          role="menuitem"
                        >
                          <span>📊</span>
                          <span>Dashboard</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                          role="menuitem"
                        >
                          <span>⚙️</span>
                          <span>Settings</span>
                        </Link>
                        
                        <Link
                          to="/leaderboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                          role="menuitem"
                        >
                          <span>🏆</span>
                          <span>Leaderboard</span>
                        </Link>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                          role="menuitem"
                        >
                          <span>🚪</span>
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="mr-1">🔑</span>
                    Log in
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="mr-1">➕</span>
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;