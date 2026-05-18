import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Trophy, Settings, HelpCircle, Users, Sun, Moon, History, DollarSign, Menu, X, Lightbulb, TrendingUp, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import logo from '../images/ChatGPT_Image_Dec_12__2025_at_11_57_18_AM-removebg-preview.png';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  // Menu items for logged-in users
  const loggedInMenuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tips', icon: Lightbulb, label: 'Interview Tips', badge: 'Free' },
    { path: '/resources', icon: BookOpen, label: 'Resources', badge: 'Free' },
    { path: '/dashboard', icon: MessageSquare, label: 'Dashboard' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/pricing', icon: DollarSign, label: 'Pricing' },
    { path: '/insights', icon: TrendingUp, label: 'Insights' },
    { path: '/about', icon: Users, label: 'About' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ];

  // Menu items for logged-out users (no protected routes)
  const loggedOutMenuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tips', icon: Lightbulb, label: 'Interview Tips', badge: 'Free' },
    { path: '/resources', icon: BookOpen, label: 'Resources', badge: 'Free' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/insights', icon: TrendingUp, label: 'Insights' },
    { path: '/pricing', icon: DollarSign, label: 'Pricing' },
    { path: '/about', icon: Users, label: 'About' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ];

  const menuItems = user ? loggedInMenuItems : loggedOutMenuItems;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button - Fixed at right side in header */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg shadow-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile unless menu is open */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col shadow-xl border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-4">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3">
            <img
              src={logo}
              alt="InterviewForge Logo"
              className="h-10 w-10 object-contain"
            />
            <div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">InterviewForge</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Practice & Excel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-2 pb-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                      ? 'bg-primary-600 text-white shadow-primary'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary-500/20 text-secondary-400 border border-secondary-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white mb-2"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <Link
              to="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive('/settings')
                ? 'bg-primary-600 text-white shadow-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
