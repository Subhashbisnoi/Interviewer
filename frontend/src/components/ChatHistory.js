import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { HistorySkeleton } from './LoadingSkeleton';
import { Clock, Calendar, Star, User, MessageCircle, TrendingUp, FileText, Award, Target, Search, Filter, X, SlidersHorizontal } from 'lucide-react';

// Component to format roadmap content from markdown to styled HTML
const FormattedRoadmap = ({ content }) => {
  const formatRoadmapContent = (text) => {
    if (!text) return '';
    
    // Split by lines for processing
    const lines = text.split('\n');
    const formattedLines = [];
    let inList = false;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        // Main heading
        const text = trimmedLine.replace('# ', '');
        formattedLines.push(`<h2 class="text-xl font-bold text-gray-900 mb-4 mt-6">${text}</h2>`);
      } else if (trimmedLine.startsWith('## ')) {
        // Section heading
        const text = trimmedLine.replace('## ', '');
        formattedLines.push(`<h3 class="text-lg font-semibold text-gray-800 mb-3 mt-5">${text}</h3>`);
      } else if (trimmedLine.startsWith('### ')) {
        // Subsection heading
        const text = trimmedLine.replace('### ', '');
        formattedLines.push(`<h4 class="text-md font-medium text-gray-700 mb-2 mt-4">${text}</h4>`);
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        // List items
        if (!inList) {
          formattedLines.push('<ul class="list-disc pl-6 mb-3 space-y-1">');
          inList = true;
        }
        const text = trimmedLine.replace(/^[-*] /, '');
        // Handle nested formatting like **bold**
        const formattedText = text
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
        formattedLines.push(`<li class="text-gray-700">${formattedText}</li>`);
      } else if (trimmedLine.startsWith('---')) {
        // Horizontal rule
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        formattedLines.push('<hr class="my-6 border-gray-300">');
      } else if (trimmedLine === '') {
        // Empty line - close list if open and add spacing
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        } else {
          formattedLines.push('<div class="mb-2"></div>');
        }
      } else if (trimmedLine.length > 0) {
        // Regular paragraph
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        // Handle nested formatting
        const formattedText = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
        formattedLines.push(`<p class="text-gray-700 mb-3 leading-relaxed">${formattedText}</p>`);
      }
    });
    
    // Close any open list
    if (inList) {
      formattedLines.push('</ul>');
    }
    
    return formattedLines.join('');
  };

  return (
    <div 
      className="roadmap-content"
      dangerouslySetInnerHTML={{ __html: formatRoadmapContent(content) }}
    />
  );
};

const ChatHistory = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // all, completed, in_progress
    scoreRange: 'all', // all, excellent (8-10), good (6-8), needs_improvement (0-6)
    dateRange: 'all', // all, today, week, month, custom
    customStartDate: '',
    customEndDate: ''
  });

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/interview/sessions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to load chat history');
      toast.error('Failed to load chat history');
      console.error('Error fetching chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and searched sessions
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.role?.toLowerCase().includes(query) ||
        session.company?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => session.status === filters.status);
    }

    // Apply score range filter
    if (filters.scoreRange !== 'all' && filters.scoreRange) {
      filtered = filtered.filter(session => {
        const score = session.score || 0;
        switch (filters.scoreRange) {
          case 'excellent':
            return score >= 8 && score <= 10;
          case 'good':
            return score >= 6 && score < 8;
          case 'needs_improvement':
            return score >= 0 && score < 6;
          default:
            return true;
        }
      });
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.created_at);
        
        switch (filters.dateRange) {
          case 'today':
            return sessionDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return sessionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return sessionDate >= monthAgo;
          case 'custom':
            if (filters.customStartDate && filters.customEndDate) {
              const start = new Date(filters.customStartDate);
              const end = new Date(filters.customEndDate);
              end.setHours(23, 59, 59, 999); // Include the entire end date
              return sessionDate >= start && sessionDate <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [sessions, searchQuery, filters]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      status: 'all',
      scoreRange: 'all',
      dateRange: 'all',
      customStartDate: '',
      customEndDate: ''
    });
  };

  const hasActiveFilters = searchQuery || filters.status !== 'all' || filters.scoreRange !== 'all' || filters.dateRange !== 'all';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleViewDetails = async (session) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/interview/session/${session.session_id}/chat`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }

      const details = await response.json();
      setSelectedSession({ ...session, details: details.messages });
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Failed to load session details');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return loading ? (
    <HistorySkeleton />
  ) : (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview History</h1>
        <p className="text-gray-600 dark:text-gray-400">View all your previous interview sessions and performance</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              hasActiveFilters
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <X className="h-5 w-5" />
              <span className="font-medium">Clear</span>
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>

              {/* Score Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Score Range
                </label>
                <select
                  value={filters.scoreRange}
                  onChange={(e) => setFilters({ ...filters, scoreRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Scores</option>
                  <option value="excellent">Excellent (8-10)</option>
                  <option value="good">Good (6-8)</option>
                  <option value="needs_improvement">Needs Improvement (&lt;6)</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.customStartDate}
                    onChange={(e) => setFilters({ ...filters, customStartDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.customEndDate}
                    onChange={(e) => setFilters({ ...filters, customEndDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Showing {filteredSessions.length} of {sessions.length} interviews
          </span>
          {hasActiveFilters && (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              Filters applied
            </span>
          )}
        </div>
      </div>

      {filteredSessions.length === 0 && sessions.length > 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching interviews</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Clear Filters
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No interview sessions yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Start your first interview to see your history here</p>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Start Interview
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredSessions.map((session) => (
            <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {session.role || 'Interview Session'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                      {session.status || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(session.created_at)}</span>
                    </div>
                    
                    {session.company && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4" />
                        <span>{session.company}</span>
                      </div>
                    )}
                    
                    {session.average_score && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className={`font-medium ${getScoreColor(session.average_score)}`}>
                          {session.average_score}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {session.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{Math.round(session.duration / 60)} minutes</span>
                    </div>
                  )}

                  {session.total_questions && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="font-medium">{session.answered_questions || 0}</span> of{' '}
                      <span className="font-medium">{session.total_questions}</span> questions answered
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
                          style={{
                            width: `${((session.answered_questions || 0) / session.total_questions) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(session)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    View Details
                  </button>
                  
                  {session.feedback_available && (
                    <button
                      onClick={() => window.location.href = `/results?session=${session.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Report
                    </button>
                  )}
                </div>
              </div>

              {session.key_topics && session.key_topics.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topics Covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {session.key_topics.slice(0, 5).map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        {topic}
                      </span>
                    ))}
                    {session.key_topics.length > 5 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        +{session.key_topics.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interview Session Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedSession.role} at {selectedSession.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {selectedSession.details && selectedSession.details.length > 0 ? (
                <div className="space-y-6">
                  {/* Session Overview */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(selectedSession.created_at)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedSession.status}
                        </div>
                      </div>
                      {selectedSession.score && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          <span className={`font-medium ${getScoreColor(selectedSession.score)}`}>
                            {selectedSession.score}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interview Content */}
                  {(() => {
                    const questions = selectedSession.details.filter(msg => msg.type === 'question');
                    const answers = selectedSession.details.filter(msg => msg.type === 'answer');
                    const feedback = selectedSession.details.filter(msg => msg.type === 'feedback');
                    const roadmap = selectedSession.details.find(msg => msg.type === 'roadmap');

                    return (
                      <div className="space-y-6">
                        {/* Questions and Answers */}
                        {questions.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <MessageCircle className="h-5 w-5 mr-2" />
                              Interview Questions & Answers
                            </h3>
                            <div className="space-y-4">
                              {questions.map((question, index) => {
                                const answer = answers.find(a => a.question_number === question.question_number);
                                const feedbackItem = feedback.find(f => f.question_number === question.question_number);
                                
                                return (
                                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-750">
                                    <div className="space-y-3">
                                      {/* Question */}
                                      <div>
                                        <div className="flex items-center mb-2">
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-medium mr-2">
                                            Q{question.question_number}
                                          </span>
                                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Question</span>
                                        </div>
                                        <p className="text-gray-800 dark:text-gray-200 ml-8">{question.content}</p>
                                      </div>
                                      
                                      {/* Answer */}
                                      {answer && (
                                        <div>
                                          <div className="flex items-center mb-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium mr-2">
                                              A{answer.question_number}
                                            </span>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Answer</span>
                                          </div>
                                          <p className="text-gray-800 dark:text-gray-200 ml-8 bg-gray-50 dark:bg-gray-700 p-3 rounded">{answer.content}</p>
                                        </div>
                                      )}
                                      
                                      {/* Feedback */}
                                      {feedbackItem && (
                                        <div>
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 text-sm font-medium mr-2">
                                                F{feedbackItem.question_number}
                                              </span>
                                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback</span>
                                            </div>
                                            {feedbackItem.marks && (
                                              <div className="flex items-center">
                                                <Award className="h-4 w-4 mr-1 text-yellow-500" />
                                                <span className={`font-medium ${getScoreColor(feedbackItem.marks)}`}>
                                                  {feedbackItem.marks}/10
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <p className="text-gray-800 dark:text-gray-200 ml-8 bg-orange-50 dark:bg-orange-900/20 p-3 rounded">{feedbackItem.content}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Roadmap */}
                        {roadmap && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <Target className="h-5 w-5 mr-2" />
                              Personalized Learning Roadmap
                            </h3>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                                <FormattedRoadmap content={roadmap.content} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No detailed information available for this session.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
