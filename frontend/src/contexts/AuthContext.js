import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, signup as signupApi, googleAuth as googleAuthApi, githubAuth as githubAuthApi, getCurrentUser } from '../services/auth';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);
  const navigate = useNavigate();

  // Token expiration check (24 hours = 1440 minutes = 86400000 ms)
  const TOKEN_LIFETIME = 1440 * 60 * 1000; // 24 hours (matches backend)
  const WARNING_BEFORE_EXPIRY = 30 * 60 * 1000; // Show warning 30 minutes before expiry

  useEffect(() => {
    // Set up unauthorized handler for API client
    apiClient.setUnauthorizedHandler(() => {
      handleSessionExpired();
    });

    // Check for existing session on initial load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const loginTime = localStorage.getItem('loginTime');
        
        if (token && loginTime) {
          const timeElapsed = Date.now() - parseInt(loginTime);
          
          // If token is expired, clear it silently
          if (timeElapsed >= TOKEN_LIFETIME) {
            localStorage.removeItem('token');
            localStorage.removeItem('loginTime');
            setUser(null);
            return;
          }
          
          // Try to get current user (but don't block the app)
          try {
            const userData = await getCurrentUser();
            setUser(userData);
            setupSessionWarning(timeElapsed);
          } catch (error) {
            // If getCurrentUser fails, just clear auth silently
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('loginTime');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('loginTime');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Start auth check in background - don't block app rendering
    checkAuth();
  }, []);

  const setupSessionWarning = (timeElapsed) => {
    const timeUntilWarning = TOKEN_LIFETIME - WARNING_BEFORE_EXPIRY - timeElapsed;
    
    if (timeUntilWarning > 0) {
      setTimeout(() => {
        setSessionWarning(true);
      }, timeUntilWarning);
    }
    
    // Auto logout after token expires
    const timeUntilExpiry = TOKEN_LIFETIME - timeElapsed;
    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        handleSessionExpired();
      }, timeUntilExpiry);
    }
  };

  const handleSessionExpired = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    setUser(null);
    setSessionWarning(false);
    
    // Only redirect if not on a public page
    const publicPaths = ['/', '/about', '/help', '/leaderboard', '/pricing', '/privacy-policy', '/terms', '/refund-policy', '/shipping-policy', '/contact'];
    const currentPath = window.location.pathname;
    if (!publicPaths.includes(currentPath)) {
      navigate('/', { replace: true });
    }
  };

  const extendSession = async () => {
    // Re-validate token and extend session
    try {
      const userData = await getCurrentUser();
      if (userData) {
        // Reset login time
        localStorage.setItem('loginTime', Date.now().toString());
        setSessionWarning(false);
        setupSessionWarning(0);
      }
    } catch (error) {
      handleSessionExpired();
    }
  };

  const login = async (email, password) => {
    try {
      const { user: userData, token } = await loginApi(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('loginTime', Date.now().toString());
      setUser(userData);
      setupSessionWarning(0);
      // Don't navigate automatically - let components handle it
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await signupApi(userData);
      
      // The backend now returns token and user data directly on signup
      if (response.access_token && response.user) {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('loginTime', Date.now().toString());
        setUser(response.user);
        setupSessionWarning(0);
        // Don't navigate automatically - let components handle it
        return { success: true };
      }
      
      return { success: false, error: 'Unexpected response from server' };
    } catch (error) {
      console.error('Signup failed:', error);
      throw error; // Let the component handle the error
    }
  };

  const googleLogin = async (credential) => {
    try {
      const { user: userData, token } = await googleAuthApi(credential);
      localStorage.setItem('token', token);
      localStorage.setItem('loginTime', Date.now().toString());
      setUser(userData);
      setupSessionWarning(0);
      // Don't navigate automatically - let components handle it
      return { success: true };
    } catch (error) {
      console.error('Google login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const githubLogin = async (code) => {
    try {
      const { user: userData, token } = await githubAuthApi(code);
      localStorage.setItem('token', token);
      localStorage.setItem('loginTime', Date.now().toString());
      setUser(userData);
      setupSessionWarning(0);
      // Don't navigate automatically - let components handle it
      return { success: true };
    } catch (error) {
      console.error('GitHub login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    setUser(null);
    setSessionWarning(false);
    
    // Only redirect if not on a public page
    const publicPaths = ['/', '/about', '/help', '/leaderboard', '/pricing', '/privacy-policy', '/terms', '/refund-policy', '/shipping-policy', '/contact'];
    const currentPath = window.location.pathname;
    if (!publicPaths.includes(currentPath)) {
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      googleLogin, 
      githubLogin, 
      logout,
      sessionWarning,
      extendSession,
      dismissWarning: () => setSessionWarning(false)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
