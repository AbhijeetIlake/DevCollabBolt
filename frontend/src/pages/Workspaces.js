/**
 * Workspaces Page Component
 * Lists all user workspaces and allows creating new ones
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  FileText, 
  Clock, 
  Globe, 
  Lock,
  Search,
  UserPlus
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import workspaceService from '../services/workspaceService';

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create workspace form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const [creating, setCreating] = useState(false);

  // Join workspace form
  const [joinForm, setJoinForm] = useState({
    workspaceId: '',
    inviteCode: ''
  });
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, [currentPage, searchTerm]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm })
      };

      const response = await workspaceService.getWorkspaces(params);
      setWorkspaces(response.workspaces);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    
    if (!createForm.name.trim()) {
      alert('Please provide a workspace name.');
      return;
    }

    try {
      setCreating(true);
      await workspaceService.createWorkspace(createForm);
      alert('Workspace created successfully!');
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', isPublic: false });
      loadWorkspaces();
    } catch (error) {
      console.error('Failed to create workspace:', error);
      alert('Failed to create workspace. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinWorkspace = async (e) => {
    e.preventDefault();
    
    if (!joinForm.workspaceId.trim() || !joinForm.inviteCode.trim()) {
      alert('Please provide both workspace ID and invite code.');
      return;
    }

    try {
      setJoining(true);
      await workspaceService.joinWorkspace(joinForm.workspaceId, joinForm.inviteCode);
      alert('Successfully joined workspace!');
      setShowJoinModal(false);
      setJoinForm({ workspaceId: '', inviteCode: '' });
      loadWorkspaces();
    } catch (error) {
      console.error('Failed to join workspace:', error);
      alert(error.response?.data?.message || 'Failed to join workspace. Please check your invite code.');
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserRole = (workspace, userId) => {
    if (workspace.owner._id === userId) return 'Owner';
    const member = workspace.members.find(m => m.user._id === userId);
    return member ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workspaces</h1>
          <p className="mt-2 text-gray-600">
            Collaborate on code with your team in real-time
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Join Workspace
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workspace
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search workspaces..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Workspaces Grid */}
      {loading ? (
        <LoadingSpinner text="Loading workspaces..." />
      ) : workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Link
              key={workspace._id}
              to={`/workspaces/${workspace._id}`}
              className="card hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {workspace.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {workspace.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {workspace.isPublic ? (
                    <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                      <Globe className="w-3 h-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-700 font-medium">Public</span>
                    </div>
                  ) : (
                    <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                      <Lock className="w-3 h-3 text-gray-500 mr-1" />
                      <span className="text-xs text-gray-600 font-medium">Private</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {workspace.members.length + 1} members
                  </span>
                  <span className="flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {workspace.files?.length || 0} files
                  </span>
                </div>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(workspace.createdAt)}
                </span>
              </div>

              {/* Owner and Role */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  by {workspace.owner.username}
                </div>
                <div className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {getUserRole(workspace, workspace.owner._id)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Get started by creating your first workspace or joining an existing one'}
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Workspace
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Workspace
            </h3>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter workspace name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe your workspace"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={createForm.isPublic}
                    onChange={(e) => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Make this workspace public</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex items-center"
                >
                  {creating ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    'Create Workspace'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Workspace Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Join Workspace
            </h3>
            <form onSubmit={handleJoinWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace ID *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter workspace ID"
                  value={joinForm.workspaceId}
                  onChange={(e) => setJoinForm({ ...joinForm, workspaceId: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter invite code"
                  value={joinForm.inviteCode}
                  onChange={(e) => setJoinForm({ ...joinForm, inviteCode: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="btn-primary flex items-center"
                >
                  {joining ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    'Join Workspace'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspaces;