import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Trophy, Settings, HelpCircle, FileText, Users, Sun, Moon, History, Pin, DollarSign, Crown, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);

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

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: MessageSquare, label: 'Dashboard' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/pinned', icon: Pin, label: 'Pinned' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/pricing', icon: DollarSign, label: 'Pricing' },
    { path: '/about', icon: Users, label: 'About' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col shadow-xl z-40 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Interviewer</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Practice & Excel</p>
          </div>
        </div>
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white mb-2"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <Link
            to="/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/settings')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="relative upgrade-menu-container">
          <button
            onClick={() => setShowUpgradeMenu(!showUpgradeMenu)}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.full_name || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                {subscription?.tier === 'premium' ? (
                  <>
                    <Crown className="h-3 w-3 mr-1 text-yellow-500" />
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
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
              {subscription?.tier === 'premium' ? (
                <div className="text-center">
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Premium Active</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Expires: {subscription?.subscription_expires_at ? 
                      new Date(subscription.subscription_expires_at).toLocaleDateString() : 
                      'Never'
                    }
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-3">
                    <Zap className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Upgrade to Premium</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unlimited interviews & more</p>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleUpgrade('monthly')}
                      className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      ₹499/month
                    </button>
                    
                    <button
                      onClick={() => handleUpgrade('yearly')}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Crown className="h-4 w-4 mr-1" />
                      ₹4,999/year
                      <span className="ml-1 text-xs bg-green-500 px-1 rounded">Save 17%</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full mt-2 px-3 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
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
  );
};

export default Sidebar;
