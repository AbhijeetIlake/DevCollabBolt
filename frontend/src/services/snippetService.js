/**
 * Snippet Service
 * Handles all API calls for snippets
 */

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) {
  console.error("Missing REACT_APP_API_URL in environment!");
}

const api = axios.create({
  baseURL: `${API_URL}/snippets`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const formatError = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

const snippetService = {
  getSnippets: async () => {
    try {
      const { data } = await api.get("/");
      return data;
    } catch (error) {
      throw new Error(formatError(error));
    }
  },

  getSnippet: async (id) => {
    try {
      const { data } = await api.get(`/${id}`);
      return data;
    } catch (error) {
      throw new Error(formatError(error));
    }
  },

  createSnippet: async (snippet) => {
    try {
      const { data } = await api.post("/", snippet);
      return data;
    } catch (error) {
      throw new Error(formatError(error));
    }
  },

  updateSnippet: async (id, snippet) => {
    try {
      const { data } = await api.put(`/${id}`, snippet);
      return data;
    } catch (error) {
      throw new Error(formatError(error));
    }
  },

  deleteSnippet: async (id) => {
    try {
      await api.delete(`/${id}`);
    } catch (error) {
      throw new Error(formatError(error));
    }
  },

  shareSnippet: async (id) => {
    try {
      const { data } = await api.post(`/${id}/share`);
      return data;
    } catch (error) {
      throw new Error(formatError(error));
    }
  },

  restoreVersion: async (id, versionId) => {
    try {
      const { data } = await api.post(`/${id}/restore/${versionId}`);
      return data;
    } catch (error) {
      throw new Error(formatError(error));
    }
  },

  /**
   * Like/unlike a snippet
   */
  likeSnippet: async (id) => {
    try {
      const { data } = await api.post(`/${id}/like`);
      return data;
    } catch (error) {
      throw new Error(formatError(error));
    }
  },

  getSharedSnippet: async (shareId) => {
    try {
      const { data } = await axios.get(`${API_URL}/snippets/share/${shareId}`);
      return data;
    } catch (error) {
      throw new Error(formatError(error));
    }
  },
};

export default snippetService;
