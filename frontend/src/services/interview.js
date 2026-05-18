/**
 * Interview Service for normal interview sessions with database storage
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ── Cache helpers ────────────────────────────────────────────────────────────
const CACHE_TTL = 30 * 60 * 1000; // 30 min — stale threshold

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { data: null, stale: true };
    const { data, ts } = JSON.parse(raw);
    return { data, stale: Date.now() - ts > CACHE_TTL };
  } catch {
    return { data: null, stale: true };
  }
}

function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

export function invalidateDashboardCache() {
  localStorage.removeItem('cache_sessions');
  localStorage.removeItem('cache_analytics');
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Get all interview sessions for the current user
 */
const _fetchSessions = async () => {
  const response = await fetch(`${API_URL}/interview/sessions`, { method: 'GET', headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  const sessions = data.sessions || [];
  cacheSet('cache_sessions', sessions);
  return sessions;
};

export const getUserInterviewSessions = async (onUpdate) => {
  const { data, stale } = cacheGet('cache_sessions');
  if (data) {
    if (stale) _fetchSessions().then(fresh => onUpdate && onUpdate(fresh)).catch(() => {});
    return data;
  }
  return _fetchSessions();
};

/**
 * Get chat history for a specific session
 */
export const getChatHistory = async (sessionId) => {
  try {
    const response = await fetch(`${API_URL}/interview/session/${sessionId}/chat`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the messages to include proper formatting
    const messages = data.messages || [];
    return {
      messages: messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

/**
 * Get user analytics
 */
const _fetchAnalytics = async () => {
  const response = await fetch(`${API_URL}/interview/analytics`, { method: 'GET', headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  cacheSet('cache_analytics', data);
  return data;
};

export const getUserAnalytics = async (onUpdate) => {
  const { data, stale } = cacheGet('cache_analytics');
  if (data) {
    if (stale) _fetchAnalytics().then(fresh => onUpdate && onUpdate(fresh)).catch(() => {});
    return data;
  }
  return _fetchAnalytics();
};

/**
 * Delete an interview session
 */
export const deleteInterviewSession = async (sessionId) => {
  try {
    const response = await fetch(`${API_URL}/interview/session/${sessionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

// Utility functions for formatting
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'in_progress':
      return 'text-blue-600';
    case 'abandoned':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const formatScore = (score) => {
  return Math.round(score * 10) / 10;
};
