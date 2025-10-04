import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const workspaceService = {
  getWorkspaces: async () => {
    const response = await axios.get(`${API_URL}/workspaces`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getWorkspace: async (workspaceId) => {
    const response = await axios.get(`${API_URL}/workspaces/${workspaceId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createWorkspace: async (workspaceData) => {
    const response = await axios.post(`${API_URL}/workspaces`, workspaceData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteWorkspace: async (workspaceId) => {
    const response = await axios.delete(`${API_URL}/workspaces/${workspaceId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  joinWorkspace: async (workspaceId) => {
    const response = await axios.post(`${API_URL}/workspaces/join/${workspaceId}`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  addFile: async (workspaceId, fileData) => {
    const response = await axios.post(
      `${API_URL}/workspaces/${workspaceId}/files`,
      fileData,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  updateFile: async (workspaceId, fileId, fileData) => {
    const response = await axios.put(
      `${API_URL}/workspaces/${workspaceId}/files/${fileId}`,
      fileData,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  deleteFile: async (workspaceId, fileId) => {
    const response = await axios.delete(
      `${API_URL}/workspaces/${workspaceId}/files/${fileId}`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  }
};

export default workspaceService;
