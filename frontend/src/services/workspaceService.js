/**
 * Workspace Service
 * Handles API calls for collaborative workspaces
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
    console.log('Making workspace API request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('Workspace API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Workspace API error:', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

const workspaceService = {
  /**
   * Get all workspaces for the current user
   */
  getWorkspaces: async (params = {}) => {
    try {
      const response = await api.get('/workspaces', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a specific workspace by ID
   */
  getWorkspace: async (id) => {
    try {
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid workspace ID provided');
      }
      console.log('Fetching workspace:', id);
      const response = await api.get(`/workspaces/${id}`);
      console.log('Workspace fetched successfully:', response.data.workspace.name);
      return response.data;
    } catch (error) {
      console.error('Get workspace error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create a new workspace
   */
  createWorkspace: async (workspaceData) => {
    try {
      const response = await api.post('/workspaces', workspaceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Join a workspace using invite code
   */
  joinWorkspace: async (id, inviteCode) => {
    try {
      const response = await api.post(`/workspaces/${id}/join`, {
        inviteCode,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add a file to workspace
   */
  addFile: async (workspaceId, fileData) => {
    try {
      console.log('Adding file to workspace:', workspaceId, fileData);
      const response = await api.post(`/workspaces/${workspaceId}/files`, fileData);
      console.log('File added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add file error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update a file in workspace
   */
  updateFile: async (workspaceId, fileId, fileData) => {
    try {
      console.log('Updating file:', fileId, 'in workspace:', workspaceId, fileData);
      const response = await api.put(`/workspaces/${workspaceId}/files/${fileId}`, fileData);
      console.log('File updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update file error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Lock a file for editing
   */
  lockFile: async (workspaceId, fileId) => {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/files/${fileId}/lock`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unlock a file
   */
  unlockFile: async (workspaceId, fileId) => {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/files/${fileId}/unlock`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Execute file code
   */
  executeFile: async (workspaceId, fileId) => {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/files/${fileId}/execute`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default workspaceService;