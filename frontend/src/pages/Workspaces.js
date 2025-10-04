import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Users,
  Clock,
  FileCode,
  Check,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import workspaceService from '../services/workspaceService';

const Workspaces = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });
  const [joinWorkspaceId, setJoinWorkspaceId] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data.workspaces || []);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await workspaceService.createWorkspace(newWorkspace);
      setShowCreateModal(false);
      setNewWorkspace({ name: '', description: '' });
      await loadWorkspaces();
    } catch (error) {
      console.error('Failed to create workspace:', error);
      setError(error.response?.data?.message || 'Failed to create workspace');
    }
  };

  const handleJoinWorkspace = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await workspaceService.joinWorkspace(joinWorkspaceId);
      setShowJoinModal(false);
      setJoinWorkspaceId('');
      await loadWorkspaces();
    } catch (error) {
      console.error('Failed to join workspace:', error);
      setError(error.response?.data?.message || 'Failed to join workspace');
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      setDeleteConfirm(null);
      await loadWorkspaces();
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      setError(error.response?.data?.message || 'Failed to delete workspace');
    }
  };

  const copyWorkspaceLink = (workspaceId) => {
    const link = `${window.location.origin}/workspaces/${workspaceId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(workspaceId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOwner = (workspace) => {
    return workspace.owner._id === user._id;
  };

  if (loading) {
    return <LoadingSpinner text="Loading workspaces..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workspaces</h1>
          <p className="text-slate-400">
            Collaborate with others in real-time coding environments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Join Workspace
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Workspace
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {workspaces.length === 0 ? (
        <div className="card text-center py-12">
          <FolderOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No workspaces yet</h3>
          <p className="text-slate-400 mb-6">
            Create your first workspace or join an existing one to start collaborating
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Join Workspace
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Workspace
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace._id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {workspace.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {workspace.description || 'No description'}
                  </p>
                </div>
                {isOwner(workspace) && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    Owner
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-slate-400">
                  <Users className="w-4 h-4 mr-2" />
                  {workspace.collaborators?.length + 1 || 1} collaborators
                </div>
                <div className="flex items-center text-sm text-slate-400">
                  <FileCode className="w-4 h-4 mr-2" />
                  {workspace.files?.length || 0} files
                </div>
                <div className="flex items-center text-sm text-slate-400">
                  <Clock className="w-4 h-4 mr-2" />
                  Updated {formatDate(workspace.updatedAt)}
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/workspaces/${workspace.workspaceId}`}
                  className="flex-1 btn-primary text-center"
                >
                  Open
                </Link>
                <button
                  onClick={() => copyWorkspaceLink(workspace.workspaceId)}
                  className="btn-secondary px-3"
                  title="Copy workspace link"
                >
                  {copiedId === workspace.workspaceId ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {isOwner(workspace) && (
                  <button
                    onClick={() => setDeleteConfirm(workspace.workspaceId)}
                    className="btn-secondary px-3 text-red-400 hover:bg-red-500/20"
                    title="Delete workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Create Workspace</h2>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspace.name}
                  onChange={(e) =>
                    setNewWorkspace({ ...newWorkspace, name: e.target.value })
                  }
                  className="input"
                  placeholder="My Awesome Project"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkspace.description}
                  onChange={(e) =>
                    setNewWorkspace({ ...newWorkspace, description: e.target.value })
                  }
                  className="input"
                  rows="3"
                  placeholder="A collaborative coding workspace for..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewWorkspace({ name: '', description: '' });
                    setError('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Join Workspace</h2>
            <form onSubmit={handleJoinWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Workspace ID
                </label>
                <input
                  type="text"
                  value={joinWorkspaceId}
                  onChange={(e) => setJoinWorkspaceId(e.target.value)}
                  className="input"
                  placeholder="Enter workspace ID"
                  required
                />
                <p className="text-xs text-slate-400 mt-2">
                  Ask the workspace owner to share the workspace link with you
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinWorkspaceId('');
                    setError('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Delete Workspace</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this workspace? This action cannot be undone
              and all files will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteWorkspace(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspaces;
