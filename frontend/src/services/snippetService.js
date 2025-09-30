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
    return config;
  },
  (error) => {
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
      const response = await api.post('/snippets', snippetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an existing snippet
   */
  updateSnippet: async (id, snippetData) => {
    try {
      const response = await api.put(`/snippets/${id}`, snippetData);
      return response.data;
    } catch (error) {
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
      const response = await api.get(`/snippets/share/${shareId}`);
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