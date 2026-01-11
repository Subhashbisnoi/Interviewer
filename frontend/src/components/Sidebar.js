import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Trophy, Settings, HelpCircle, FileText, Users, Sun, Moon, History, Pin, DollarSign, Crown, Zap, Menu, X, Lightbulb, TrendingUp, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import logo from '../images/ChatGPT_Image_Dec_12__2025_at_11_57_18_AM-removebg-preview.png';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // Close upgrade menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUpgradeMenu && !event.target.closest('.upgrade-menu-container')) {
        setShowUpgradeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUpgradeMenu]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payment/subscription`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleUpgrade = async (planType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Create order
      const orderResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payment/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ plan_type: planType })
        }
      );

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'AI Interviewer',
        description: orderData.order.plan_description,
        order_id: orderData.order.order_id,
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await fetch(
            `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payment/verify`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            }
          );

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert('Payment successful! Your premium subscription is now active.');
            fetchSubscription(); // Refresh subscription status
            setShowUpgradeMenu(false);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.full_name || user.email || '',
          email: user.email || '',
        },
        theme: {
          color: '#4F46E5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  // Menu items for logged-in users
  const loggedInMenuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tips', icon: Lightbulb, label: 'Interview Tips', badge: 'Free' },
    { path: '/resources', icon: BookOpen, label: 'Resources', badge: 'Free' },
    { path: '/dashboard', icon: MessageSquare, label: 'Dashboard' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/pinned', icon: Pin, label: 'Pinned' },
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
      {/* Mobile Menu Button - Fixed at far right */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-3 right-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
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
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3">
            <img
              src={logo}
              alt="InterviewForge Logo"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">InterviewForge</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Practice & Excel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
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

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="relative upgrade-menu-container">
            <button
              onClick={() => setShowUpgradeMenu(!showUpgradeMenu)}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.full_name || user?.email || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                  {subscription?.tier === 'premium' ? (
                    <>
                      <Crown className="h-3 w-3 mr-1 text-accent-400" />
                      Premium Plan
                    </>
                  ) : (
                    'Free Plan'
                  )}
                </p>
              </div>
            </button>

            {/* Upgrade Menu */}
            {showUpgradeMenu && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-3">
                {subscription?.tier === 'premium' ? (
                  <div className="text-center">
                    <Crown className="h-8 w-8 text-accent-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Premium Active</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {subscription?.expires_at ? (() => {
                        const expiryDate = new Date(subscription.expires_at);
                        const today = new Date();
                        const diffTime = expiryDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays > 0) {
                          return `${diffDays} days remaining`;
                        } else if (diffDays === 0) {
                          return 'Expires today';
                        } else {
                          return 'Expired';
                        }
                      })() : 'Active'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-3">
                      <Zap className="h-6 w-6 text-primary-500 mx-auto mb-1" />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Upgrade to Premium</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Unlimited interviews & more</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleUpgrade('monthly')}
                        className="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        ₹49/month
                      </button>

                      <button
                        onClick={() => handleUpgrade('yearly')}
                        className="w-full px-3 py-2 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        ₹499/year
                        <span className="ml-1 text-xs bg-secondary-400 px-1 rounded">Save 15%</span>
                      </button>
                    </div>

                    <button
                      onClick={() => navigate('/pricing')}
                      className="w-full mt-2 px-3 py-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                    >
                      View all features →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
