// API utility functions for making authenticated requests

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Get the stored JWT token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('mindbridge_token');
};

/**
 * Get the stored user data from localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem('mindbridge_user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Clear authentication data (for logout)
 */
export const clearAuth = () => {
  localStorage.removeItem('mindbridge_token');
  localStorage.removeItem('mindbridge_user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/mood')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} Response data
 */
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle token expiration
    if (response.status === 401 || response.status === 403) {
      clearAuth();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: (endpoint) => authenticatedFetch(endpoint, { method: 'GET' }),

  post: (endpoint, body) => authenticatedFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  put: (endpoint, body) => authenticatedFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),

  delete: (endpoint) => authenticatedFetch(endpoint, { method: 'DELETE' }),
};

export default api;
