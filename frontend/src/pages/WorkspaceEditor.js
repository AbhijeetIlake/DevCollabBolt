import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';
import { Plus, Trash2, Users, Copy, Check, Save, FileCode, CircleAlert as AlertCircle } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import workspaceService from '../services/workspaceService';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const WorkspaceEditor = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFile, setNewFile] = useState({ name: '', language: 'javascript' });
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    loadWorkspace();

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join-workspace', workspaceId);
    });

    newSocket.on('file-updated', (data) => {
      if (data.userId !== user._id) {
        setWorkspace((prev) => {
          if (!prev) return prev;
          const updatedFiles = prev.files.map((file) =>
            file.id === data.fileId
              ? { ...file, content: data.content, name: data.name || file.name }
              : file
          );
          return { ...prev, files: updatedFiles };
        });
      }
    });

    newSocket.on('file-created', (data) => {
      if (data.userId !== user._id) {
        setWorkspace((prev) => {
          if (!prev) return prev;
          return { ...prev, files: [...prev.files, data.file] };
        });
      }
    });

    newSocket.on('file-deleted', (data) => {
      if (data.userId !== user._id) {
        setWorkspace((prev) => {
          if (!prev) return prev;
          const updatedFiles = prev.files.filter((file) => file.id !== data.fileId);
          return { ...prev, files: updatedFiles };
        });
        if (activeFile?.id === data.fileId) {
          setActiveFile(null);
        }
      }
    });

    newSocket.on('collaborator-joined', (data) => {
      console.log('Collaborator joined:', data.username);
    });

    newSocket.on('workspace-deleted', () => {
      alert('This workspace has been deleted by the owner');
      navigate('/workspaces');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave-workspace', workspaceId);
        newSocket.disconnect();
      }
    };
  }, [workspaceId, user._id, navigate]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      const data = await workspaceService.getWorkspace(workspaceId);
      setWorkspace(data.workspace);
      if (data.workspace.files.length > 0) {
        setActiveFile(data.workspace.files[0]);
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
      setError(error.response?.data?.message || 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await workspaceService.addFile(workspaceId, {
        name: newFile.name,
        language: newFile.language,
        content: ''
      });
      setWorkspace((prev) => ({
        ...prev,
        files: [...prev.files, response.file]
      }));
      setActiveFile(response.file);
      setShowNewFileModal(false);
      setNewFile({ name: '', language: 'javascript' });
    } catch (error) {
      console.error('Failed to create file:', error);
      setError(error.response?.data?.message || 'Failed to create file');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await workspaceService.deleteFile(workspaceId, fileId);
      setWorkspace((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f.id !== fileId)
      }));
      if (activeFile?.id === fileId) {
        setActiveFile(workspace.files.find((f) => f.id !== fileId) || null);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      setError(error.response?.data?.message || 'Failed to delete file');
    }
  };

  const handleCodeChange = useCallback((value) => {
    if (!activeFile) return;

    setActiveFile((prev) => ({ ...prev, content: value }));
    setSaveStatus('saving');

    const saveTimeout = setTimeout(async () => {
      try {
        await workspaceService.updateFile(workspaceId, activeFile.id, {
          content: value
        });
        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to save file:', error);
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [activeFile, workspaceId]);

  const copyWorkspaceLink = () => {
    const link = `${window.location.origin}/workspaces/${workspaceId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isOwner = workspace?.owner._id === user?._id;

  if (loading) {
    return <LoadingSpinner text="Loading workspace..." />;
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Workspace not found</h2>
        <button onClick={() => navigate('/workspaces')} className="btn-primary">
          Back to Workspaces
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{workspace.name}</h1>
            <p className="text-sm text-slate-400">{workspace.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {workspace.collaborators?.length + 1 || 1}
              </span>
            </div>
            <button
              onClick={copyWorkspaceLink}
              className="btn-secondary flex items-center gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Share Link
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Files</h2>
              <button
                onClick={() => setShowNewFileModal(true)}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white"
                title="Create new file"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {workspace.files.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No files yet
                </p>
              ) : (
                workspace.files.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      activeFile?.id === file.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-700 text-slate-300'
                    }`}
                    onClick={() => setActiveFile(file)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileCode className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded text-red-400 flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {activeFile ? (
            <>
              <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-white">{activeFile.name}</h3>
                  <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                    {activeFile.language}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Save className="w-4 h-4" />
                  {saveStatus === 'saving' && 'Saving...'}
                  {saveStatus === 'saved' && 'Saved'}
                  {saveStatus === 'error' && (
                    <span className="text-red-400">Error saving</span>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  value={activeFile.content}
                  onChange={handleCodeChange}
                  language={activeFile.language}
                  height="100%"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FileCode className="w-16 h-16 mx-auto mb-4" />
                <p>Select a file to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Create New File</h2>
            <form onSubmit={handleCreateFile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={newFile.name}
                  onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                  className="input"
                  placeholder="index.js"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Language
                </label>
                <select
                  value={newFile.language}
                  onChange={(e) => setNewFile({ ...newFile, language: e.target.value })}
                  className="input"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="csharp">C#</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="swift">Swift</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="yaml">YAML</option>
                  <option value="markdown">Markdown</option>
                  <option value="shell">Shell</option>
                  <option value="dockerfile">Dockerfile</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewFileModal(false);
                    setNewFile({ name: '', language: 'javascript' });
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
    </div>
  );
};

export default WorkspaceEditor;
