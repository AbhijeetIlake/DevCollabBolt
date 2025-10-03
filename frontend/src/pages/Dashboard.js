/**
 * Dashboard Page Component
 * Main dashboard showing overview of snippets and workspaces
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Code, 
  Users, 
  Plus, 
  FileText, 
  Clock, 
  Eye,
  Lock,
  Globe
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import snippetService from '../services/snippetService';
import workspaceService from '../services/workspaceService';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    snippets: 0,
    workspaces: 0,
    publicSnippets: 0,
    totalViews: 0
  });
  const [recentSnippets, setRecentSnippets] = useState([]);
  const [recentWorkspaces, setRecentWorkspaces] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent snippets
      const snippetsResponse = await snippetService.getSnippets({ limit: 5 });
      setRecentSnippets(snippetsResponse.snippets || []);
      
      // Load recent workspaces
      const workspacesResponse = await workspaceService.getWorkspaces({ limit: 5 });
      setRecentWorkspaces(workspacesResponse.workspaces || []);
      
      // Calculate stats
      const snippets = snippetsResponse.snippets || [];
      const workspaces = workspacesResponse.workspaces || [];
      
      const publicSnippets = snippets.filter(s => s.isPublic).length;
      const totalViews = snippets.reduce((sum, s) => sum + (s.views || 0), 0);
      
      setStats({
        snippets: snippetsResponse.total || 0,
        workspaces: workspacesResponse.total || 0,
        publicSnippets,
        totalViews
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set empty arrays to prevent UI errors
      setRecentSnippets([]);
      setRecentWorkspaces([]);
      setStats({
        snippets: 0,
        workspaces: 0,
        publicSnippets: 0,
        totalViews: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      python: 'bg-green-100 text-green-800',
      java: 'bg-red-100 text-red-800',
      cpp: 'bg-purple-100 text-purple-800',
      html: 'bg-orange-100 text-orange-800',
      css: 'bg-pink-100 text-pink-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[language] || colors.default;
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-blue-100">
          Ready to code and collaborate? Here's what's happening in your workspace.
        </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Code className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Snippets</p>
              <p className="text-2xl font-bold text-white">{stats.snippets}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Workspaces</p>
              <p className="text-2xl font-bold text-white">{stats.workspaces}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Public Snippets</p>
              <p className="text-2xl font-bold text-white">{stats.publicSnippets}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <Eye className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Views</p>
              <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/snippets/new"
          className="card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="p-4 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <Plus className="w-8 h-8 text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">Create New Snippet</h3>
              <p className="text-slate-400">Start coding with a new snippet</p>
            </div>
          </div>
        </Link>

        <Link
          to="/workspaces"
          className="card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="p-4 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <Plus className="w-8 h-8 text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">Create Workspace</h3>
              <p className="text-slate-400">Start a collaborative project</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Snippets */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Recent Snippets
              </h2>
              <Link
                to="/snippets"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {recentSnippets.length > 0 ? (
              recentSnippets.map((snippet) => (
                <Link
                  key={snippet._id}
                  to={`/snippets/${snippet._id}`}
                  className="block p-4 border border-slate-700 rounded-lg hover:border-blue-500/50 hover:shadow-sm transition-all bg-slate-800/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">
                        {snippet.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                        {snippet.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span className={`px-2 py-1 rounded-full ${getLanguageColor(snippet.language)}`}>
                          {snippet.language}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(snippet.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {snippet.views}
                        </span>
                        {snippet.isPublic ? (
                          <Globe className="w-3 h-3 text-green-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No snippets yet</p>
                <Link
                  to="/snippets/new"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Create your first snippet
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Workspaces */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Recent Workspaces
              </h2>
              <Link
                to="/workspaces"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {recentWorkspaces.length > 0 ? (
              recentWorkspaces.map((workspace) => (
                <Link
                  key={workspace._id}
                  to={`/workspaces/${workspace._id}`}
                  className="block p-4 border border-slate-700 rounded-lg hover:border-blue-500/50 hover:shadow-sm transition-all bg-slate-800/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">
                        {workspace.name}
                      </h3>
                      <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                        {workspace.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {workspace.members.length + 1} members
                        </span>
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {workspace.files?.length || 0} files
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(workspace.createdAt)}
                        </span>
                        {workspace.isPublic ? (
                          <Globe className="w-3 h-3 text-green-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No workspaces yet</p>
                <Link
                  to="/workspaces"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Create your first workspace
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;