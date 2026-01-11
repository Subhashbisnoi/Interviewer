import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import logo from '../images/ChatGPT_Image_Dec_12__2025_at_11_57_18_AM-removebg-preview.png';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [openDropdown, setOpenDropdown] = useState(null);

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

  // Navigation items for the header (product-focused, not app navigation)
  const navItems = [
    {
      label: 'Features',
      dropdown: [
        { label: 'AI Mock Interviews', href: '/#features', description: 'Practice with realistic AI interviewer' },
        { label: 'Real-time Feedback', href: '/#features', description: 'Get instant performance analysis' },
        { label: 'Voice Interviews', href: '/#features', description: 'Practice speaking naturally' },
      ]
    },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Tips', href: '/tips' },
    { label: 'Resources', href: '/resources' },
    { label: 'Pricing', href: '/pricing' },
  ];

  const handleNavClick = (href) => {
    setOpenDropdown(null);
    if (href.startsWith('/#')) {
      // Handle hash navigation
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(href.replace('/', ''));
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(href.replace('/', ''));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={logo}
                alt="InterviewForge Logo"
                className="h-9 w-9 object-contain"
              />
              <h1 className="hidden sm:block text-xl font-bold text-slate-900 dark:text-white">
                InterviewForge
              </h1>
            </Link>

            {/* Main Navigation - Product focused */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <div key={index} className="relative">
                  {item.dropdown ? (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                        className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === index ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdown === index && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2">
                          {item.dropdown.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              onClick={() => handleNavClick(subItem.href)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <div className="text-sm font-medium text-slate-900 dark:text-white">{subItem.label}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{subItem.description}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side - Auth buttons or Profile */}
            <div className="flex items-center space-x-3 mr-12 lg:mr-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1 z-50">
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        📊 Dashboard
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        ⚙️ Settings
                      </Link>

                      <div className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          🚪 Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-5 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-amber-500 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors"
                  >
                    Start Practicing
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