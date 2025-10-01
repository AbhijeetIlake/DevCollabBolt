/**
 * Snippet Service
 * Handles API calls for code snippets
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making snippet API request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('Snippet API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Snippet API error:', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

const snippetService = {
  /**
   * Get all snippets for the current user
   */
  getSnippets: async (params = {}) => {
    try {
      const response = await api.get('/snippets', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a specific snippet by ID
   */
  getSnippet: async (id) => {
    try {
      const response = await api.get(`/snippets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new snippet
   */
  createSnippet: async (snippetData) => {
    try {
      console.log('Creating snippet with data:', snippetData);
      const response = await api.post('/snippets', snippetData);
      console.log('Snippet created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create snippet error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update an existing snippet
   */
  updateSnippet: async (id, snippetData) => {
    try {
      console.log('Updating snippet', id, 'with data:', snippetData);
      const response = await api.put(`/snippets/${id}`, snippetData);
      console.log('Snippet updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update snippet error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete a snippet
   */
  deleteSnippet: async (id) => {
    try {
      const response = await api.delete(`/snippets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generate a share link for a snippet
   */
  generateShareLink: async (id, expirationHours = 24) => {
    try {
      const response = await api.post(`/snippets/${id}/share`, {
        expirationHours,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a shared snippet by share ID
   */
  getSharedSnippet: async (shareId) => {
    try {
      // Use axios directly without auth interceptor for shared snippets
      const response = await axios.get(`${API_URL}/snippets/share/${shareId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Restore a previous version of a snippet
   */
  restoreVersion: async (id, versionIndex) => {
    try {
      const response = await api.post(`/snippets/${id}/restore/${versionIndex}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default snippetService;