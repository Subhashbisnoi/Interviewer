import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import SessionWarningModal from './components/SessionWarningModal';
import Home from './components/Home';
import Interview from './components/Interview';
import Result from './components/Result';
import ChatHistory from './components/ChatHistory';
import PinnedResults from './components/PinnedResults';
import Leaderboard from './components/Leaderboard';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Help from './pages/Help';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import CancellationAndRefund from './pages/CancellationAndRefund';
import ShippingAndDelivery from './pages/ShippingAndDelivery';
import ContactUs from './pages/ContactUs';
import Pricing from './pages/Pricing';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

// Component to handle OAuth callbacks
const OAuthHandler = () => {
  const { githubLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGitHubCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state === 'github-auth') {
        try {
          console.log('Handling GitHub OAuth callback with code:', code);
          const result = await githubLogin(code);
          
          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (result.success) {
            console.log('GitHub login successful, navigating to home');
            navigate('/', { replace: true });
          } else {
            console.error('GitHub login failed:', result.error);
            // Stay on current page and show error
          }
        } catch (error) {
          console.error('GitHub OAuth callback error:', error);
          // Stay on current page and show error
        }
      }
    };

    handleGitHubCallback();
  }, [location.search, githubLogin, navigate]);

  return null; // This component doesn't render anything
};

// Wrapper component to handle protected routes
const AppContent = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const { user } = useAuth();
  const location = useLocation();

  const startNewInterview = (data) => {
    setInterviewData(data);
    setCurrentSession(null);
  };

  const setSession = (session) => {
    setCurrentSession(session);
  };
  
  // Check if current route is interview to skip container padding and sidebar
  const isInterviewPage = location.pathname === '/interview';

  return (
    <div className={`min-h-screen ${isInterviewPage ? 'bg-gray-900' : 'bg-gray-50 dark:bg-gray-900'} flex`}>
      <OAuthHandler />
      <SessionWarningModal />
      {!isInterviewPage && <Sidebar />}
      <div className={`flex-1 flex flex-col ${!isInterviewPage ? 'ml-64' : ''}`}>
        {!isInterviewPage && <Header />}
        <main className={isInterviewPage ? 'flex-1' : 'flex-1 container mx-auto px-4 py-8'}>
          <Routes>
            <Route 
              path="/" 
              element={<Home onStartInterview={startNewInterview} />} 
            />
            <Route
              path="/about"
              element={<About />}
            />
            <Route
              path="/help"
              element={<Help />}
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <ChatHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pinned"
              element={
                <ProtectedRoute>
                  <PinnedResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={<Leaderboard />}
            />
            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />
            <Route
              path="/terms"
              element={<TermsAndConditions />}
            />
            <Route
              path="/refund-policy"
              element={<CancellationAndRefund />}
            />
            <Route
              path="/shipping-policy"
              element={<ShippingAndDelivery />}
            />
            <Route
              path="/contact"
              element={<ContactUs />}
            />
            <Route
              path="/pricing"
              element={<Pricing />}
            />
            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  {interviewData ? (
                    <Interview 
                      interviewData={interviewData} 
                      onSessionCreated={setSession}
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  {currentSession ? (
                    <Result session={currentSession} />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!isInterviewPage && <Footer />}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;