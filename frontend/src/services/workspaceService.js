/**
 * Workspace Service
 * Handles API calls related to workspaces
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token'); // ✅ fixed to read directly
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const workspaceService = {
  createWorkspace: async (name) => {
    const response = await axios.post(
      `${API_URL}/workspaces`,
      { name },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getWorkspaces: async () => {
    const response = await axios.get(`${API_URL}/workspaces`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getWorkspace: async (id) => {
    const response = await axios.get(`${API_URL}/workspaces/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateFile: async (workspaceId, fileId, data) => {
    const response = await axios.put(
      `${API_URL}/workspaces/${workspaceId}/files/${fileId}`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export default workspaceService;
