/**
 * Workspace Editor Page Component
 * Collaborative workspace with file management and code execution
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Play, Save, Lock, Clock as Unlock, Users, FileText, Terminal, Copy, Check, Trash2, Settings } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import workspaceService from '../services/workspaceService';

const WorkspaceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    joinWorkspace, 
    leaveWorkspace, 
    onFileLocked, 
    onFileUnlocked, 
    onExecutionResult,
    connected 
  } = useSocket();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState([]);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add file form
  const [addFileForm, setAddFileForm] = useState({
    name: '',
    language: 'javascript'
  });

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
    'sql', 'json', 'xml', 'yaml', 'markdown', 'shell', 'dockerfile'
  ];

  useEffect(() => {
    if (!id || id === 'undefined') {
      console.error('Invalid workspace ID:', id);
      navigate('/workspaces');
      return;
    }
    loadWorkspace();
  }, [id]);

  useEffect(() => {
    if (workspace && connected) {
      joinWorkspace(id);
      
      // Set up socket event listeners
      const unsubscribeLocked = onFileLocked((data) => {
        setWorkspace(prev => ({
          ...prev,
          files: prev.files.map(file => 
            file._id === data.fileId 
              ? { ...file, isLocked: true, lockedBy: { _id: data.userId, username: data.username } }
              : file
          )
        }));
      });

      const unsubscribeUnlocked = onFileUnlocked((data) => {
        setWorkspace(prev => ({
          ...prev,
          files: prev.files.map(file => 
            file._id === data.fileId 
              ? { ...file, isLocked: false, lockedBy: null }
              : file
          )
        }));
      });

      const unsubscribeExecution = onExecutionResult((data) => {
        setExecutionResults(prev => [data.result, ...prev.slice(0, 9)]); // Keep last 10 results
        setExecuting(false);
      });

      return () => {
        leaveWorkspace(id);
        if (unsubscribeLocked) unsubscribeLocked();
        if (unsubscribeUnlocked) unsubscribeUnlocked();
        if (unsubscribeExecution) unsubscribeExecution();
      };
    }
  }, [workspace, connected, id]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      console.log('Loading workspace with ID:', id);
      
      if (!id || id === 'undefined') {
        throw new Error('Invalid workspace ID');
      }
      
      const response = await workspaceService.getWorkspace(id);
      console.log('Workspace loaded:', response);
      setWorkspace(response.workspace);
      
      // Select first file if available
      if (response.workspace.files.length > 0) {
        const firstFile = response.workspace.files[0];
        setSelectedFile(firstFile);
        setFileContent(firstFile.content);
      }
      
      // Load execution results
      setExecutionResults(response.workspace.executionResults ? response.workspace.executionResults.slice(0, 10) : []);
    } catch (error) {
      console.error('Failed to load workspace:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to load workspace: ${errorMessage}`);
      navigate('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (selectedFile && selectedFile.isLocked && selectedFile.lockedBy?._id === user.id) {
      handleUnlockFile(selectedFile._id);
    }
    
    setSelectedFile(file);
    setFileContent(file.content);
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    
    if (!addFileForm.name.trim()) {
      alert('Please provide a file name.');
      return;
    }

    try {
      await workspaceService.addFile(id, addFileForm);
      alert('File added successfully!');
      setShowAddFileModal(false);
      setAddFileForm({ name: '', language: 'javascript' });
      await loadWorkspace(); // Wait for reload to complete
    } catch (error) {
      console.error('Failed to add file:', error);
      alert(`Failed to add file: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;

    try {
      setSaving(true);
      await workspaceService.updateFile(id, selectedFile._id, {
        content: fileContent
      });
      
      // Update local state
      setWorkspace(prev => ({
        ...prev,
        files: prev.files.map(file => 
          file._id === selectedFile._id 
            ? { ...file, content: fileContent }
            : file
        )
      }));
      
      setSelectedFile(prev => ({ ...prev, content: fileContent }));
      alert('File saved successfully!');
    } catch (error) {
      console.error('Failed to save file:', error);
      alert(`Failed to save file: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLockFile = async (fileId) => {
    try {
      await workspaceService.lockFile(id, fileId);
    } catch (error) {
      console.error('Failed to lock file:', error);
      alert('Failed to lock file. It may already be locked by another user.');
    }
  };

  const handleUnlockFile = async (fileId) => {
    try {
      await workspaceService.unlockFile(id, fileId);
    } catch (error) {
      console.error('Failed to unlock file:', error);
    }
  };

  const handleExecuteFile = async () => {
    if (!selectedFile) return;

    try {
      setExecuting(true);
      await workspaceService.executeFile(id, selectedFile._id);
    } catch (error) {
      console.error('Failed to execute file:', error);
      alert('Failed to execute file. Please try again.');
      setExecuting(false);
    }
  };

  const copyInviteInfo = async () => {
    const inviteText = `Workspace ID: ${workspace._id}\nInvite Code: ${workspace.inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite info:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (language) => {
    return <FileText className="w-4 h-4" />;
  };

  const canEditFile = (file) => {
    return !file.isLocked || file.lockedBy?._id === user.id;
  };

  if (loading) {
    return <LoadingSpinner text="Loading workspace..." />;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/workspaces')}
              className="btn-secondary flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {workspace.name}
              </h1>
              <p className="text-sm text-gray-600">
                {workspace.members.length + 1} members • {workspace.files.length} files
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-secondary flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              Invite
            </button>
            {selectedFile && canEditFile(selectedFile) && (
              <>
                <button
                  onClick={handleSaveFile}
                  disabled={saving}
                  className="btn-secondary flex items-center"
                >
                  {saving ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save
                </button>
                {selectedFile.language === 'javascript' || selectedFile.language === 'python' ? (
                  <button
                    onClick={handleExecuteFile}
                    disabled={executing}
                    className="btn-primary flex items-center bg-green-600 hover:bg-green-700"
                  >
                    {executing ? (
                      <LoadingSpinner size="small" text="" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {executing ? 'Running...' : 'Run Code'}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Files</h3>
              <button
                onClick={() => setShowAddFileModal(true)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Add file"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="file-tree p-2">
              {workspace.files.map((file) => (
                <div
                  key={file._id}
                  onClick={() => handleFileSelect(file)}
                  className={`file-tree-item ${
                    selectedFile?._id === file._id ? 'active' : ''
                  } ${file.isLocked && file.lockedBy?._id !== user.id ? 'locked' : ''}`}
                >
                  <div className="flex items-center flex-1">
                    {getFileIcon(file.language)}
                    <span className="ml-2 text-sm truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {file.isLocked && (
                      <div className="flex items-center">
                        {file.lockedBy?._id === user.id ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlockFile(file._id);
                            }}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Unlock file"
                          >
                            <Unlock className="w-3 h-3" />
                          </button>
                        ) : (
                          <Lock 
                            className="w-3 h-3 text-yellow-600" 
                            title={`Locked by ${file.lockedBy?.username}`}
                          />
                        )}
                      </div>
                    )}
                    {selectedFile?._id === file._id && !file.isLocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLockFile(file._id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Lock file for editing"
                      >
                        <Lock className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* File Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="font-medium text-gray-900">{selectedFile.name}</h2>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {selectedFile.language}
                    </span>
                    {selectedFile.isLocked && (
                      <div className="flex items-center text-xs text-yellow-700">
                        <Lock className="w-3 h-3 mr-1" />
                        {selectedFile.lockedBy?._id === user.id 
                          ? 'Locked by you' 
                          : `Locked by ${selectedFile.lockedBy?.username}`
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 p-6">
                <CodeEditor
                  value={fileContent}
                  onChange={setFileContent}
                  language={selectedFile.language}
                  height="100%"
                  readOnly={!canEditFile(selectedFile)}
                  options={{
                    readOnly: !canEditFile(selectedFile)
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No file selected
                </h3>
                <p className="text-gray-600 mb-6">
                  Select a file from the sidebar or create a new one
                </p>
                <button
                  onClick={() => setShowAddFileModal(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Execution Results Panel */}
        {executionResults.length > 0 && (
          <div className="w-80 bg-gray-900 text-green-400 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-medium text-white flex items-center">
                <Terminal className="w-4 h-4 mr-2" />
                Execution Results
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {executionResults.map((result, index) => (
                <div key={index} className="text-sm">
                  <div className="text-gray-400 mb-1">
                    {formatDate(result.createdAt)} • 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      result.status === 'completed' ? 'bg-green-600 text-white' :
                      result.status === 'error' ? 'bg-red-600 text-white' :
                      result.status === 'running' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  {result.stdout && (
                    <div className="execution-output mb-2">
                      <div className="text-xs text-gray-400 mb-1">Output:</div>
                      <pre className="whitespace-pre-wrap">{result.stdout}</pre>
                    </div>
                  )}
                  {result.stderr && (
                    <div className="execution-error">
                      <div className="text-xs text-red-300 mb-1">Error:</div>
                      <pre className="whitespace-pre-wrap">{result.stderr}</pre>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Exit code: {result.exitCode ?? 'N/A'} • Time: {result.executionTime || 0}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add File Modal */}
      {showAddFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New File
            </h3>
            <form onSubmit={handleAddFile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., main.js, app.py"
                  value={addFileForm.name}
                  onChange={(e) => setAddFileForm({ ...addFileForm, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language *
                </label>
                <select
                  className="form-input"
                  value={addFileForm.language}
                  onChange={(e) => setAddFileForm({ ...addFileForm, language: e.target.value })}
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFileModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invite to Workspace
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Share these details with others to invite them to this workspace:
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workspace ID
                </label>
                <div className="form-input bg-gray-50 font-mono text-sm">
                  {workspace._id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code
                </label>
                <div className="form-input bg-gray-50 font-mono text-sm">
                  {workspace.inviteCode}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={copyInviteInfo}
                className="btn-secondary flex items-center"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Info'}
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceEditor;