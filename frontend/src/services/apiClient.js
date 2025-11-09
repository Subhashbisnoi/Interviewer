// API interceptor for handling token expiration and automatic logout
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.onUnauthorized = null;
  }

  setUnauthorizedHandler(handler) {
    this.onUnauthorized = handler;
  }

  async fetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    // Add authorization header if token exists
    const headers = {
      ...options.headers,
    };
    
    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && !options.skipAuth) {
        console.warn('Token expired or invalid, logging out...');
        
        // Clear token
        localStorage.removeItem('token');
        
        // Call unauthorized handler (logout)
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      if (error.message === 'Session expired. Please login again.') {
        throw error;
      }
      throw new Error(`Network error: ${error.message}`);
    }
  }

  async get(endpoint, options = {}) {
    return this.fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      ...options,
    });
  }

  async post(endpoint, data, options = {}) {
    return this.fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      ...options,
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
