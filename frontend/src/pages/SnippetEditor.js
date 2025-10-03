/**
 * Snippet Editor Component
 * Complete snippet creation and editing with all features
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Save,
  Share2,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Clock,
  RotateCcw,
  Copy,
  Check,
  ArrowLeft,
  Heart,
  Star,
  Tag,
  X,
  Plus
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import snippetService from '../services/snippetService';

const SnippetEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [snippet, setSnippet] = useState({
    title: '',
    description: '',
    content: '',
    lang: 'javascript',
    isPublic: false,
    tags: []
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
    'sql', 'json', 'xml', 'yaml', 'markdown', 'shell', 'dockerfile'
  ];

  useEffect(() => {
    if (isEditing) {
      loadSnippet();
    }
  }, [id, isEditing]);

  // Auto-save functionality
  useEffect(() => {
    if (isEditing && snippet.title && snippet.content) {
      const autoSaveTimer = setTimeout(() => {
        handleSave(true); // Silent save
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [snippet.content, snippet.title, isEditing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleShare();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadSnippet = async () => {
    try {
      setLoading(true);
      const response = await snippetService.getSnippet(id);
      setSnippet(response.snippet);
      setVersions(response.snippet.versions || []);
    } catch (error) {
      console.error('Failed to load snippet:', error);
      navigate('/snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (silent = false) => {
    if (!snippet.title.trim() || !snippet.content.trim()) {
      if (!silent) alert('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      let result;

      const snippetData = {
        title: snippet.title.trim(),
        description: snippet.description.trim(),
        content: snippet.content,
        lang: snippet.lang,
        isPublic: snippet.isPublic,
        tags: snippet.tags
      };

      if (isEditing) {
        result = await snippetService.updateSnippet(id, snippetData);
      } else {
        result = await snippetService.createSnippet(snippetData);
        navigate(`/snippets/${result.snippet._id}`, { replace: true });
      }

      setSnippet(result.snippet);
      setVersions(result.snippet.versions || []);
      
      if (!silent) {
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg z-50';
        successMsg.textContent = 'Snippet saved successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => document.body.removeChild(successMsg), 3000);
      }
    } catch (error) {
      console.error('Failed to save snippet:', error);
      if (!silent) alert('Failed to save snippet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!isEditing) {
      alert('Please save the snippet first');
      return;
    }

    try {
      setSharing(true);
      const response = await snippetService.shareSnippet(id);
      const fullShareLink = `${window.location.origin}/share/${response.shareId}`;
      setShareLink(fullShareLink);
      
      // Auto-copy to clipboard
      await navigator.clipboard.writeText(fullShareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to share snippet:', error);
      alert('Failed to create share link');
    } finally {
      setSharing(false);
    }
  };

  const handleRestoreVersion = async (versionIndex) => {
    if (!window.confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
      return;
    }

    try {
      const result = await snippetService.restoreVersion(id, versionIndex);
      setSnippet(result.snippet);
      setVersions(result.snippet.versions || []);
      setShowVersions(false);
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert('Failed to restore version');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !snippet.tags.includes(newTag.trim())) {
      setSnippet({
        ...snippet,
        tags: [...snippet.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSnippet({
      ...snippet,
      tags: snippet.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading snippet..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/snippets')}
                className="btn-secondary flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {isEditing ? 'Edit Snippet' : 'Create New Snippet'}
                </h1>
                <p className="text-sm text-slate-400">
                  {isEditing ? `Last updated ${formatDate(snippet.updatedAt || snippet.createdAt)}` : 'Start creating your snippet'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {versions.length > 0 && (
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="btn-secondary flex items-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Versions ({versions.length})
                </button>
              )}
              
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="btn-secondary flex items-center"
              >
                {previewMode ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                disabled={!isEditing || sharing}
                className="btn-secondary flex items-center"
              >
                {sharing ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Share
              </button>

              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="btn-primary flex items-center"
              >
                {saving ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Info */}
            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter snippet title..."
                  value={snippet.title}
                  onChange={(e) => setSnippet({ ...snippet, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe what this snippet does..."
                  value={snippet.description}
                  onChange={(e) => setSnippet({ ...snippet, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Language *
                  </label>
                  <select
                    className="form-input"
                    value={snippet.lang}
                    onChange={(e) => setSnippet({ ...snippet, lang: e.target.value })}
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Visibility
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        checked={!snippet.isPublic}
                        onChange={() => setSnippet({ ...snippet, isPublic: false })}
                        className="mr-2"
                      />
                      <Lock className="w-4 h-4 mr-1" />
                      <span className="text-sm text-slate-300">Private</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        checked={snippet.isPublic}
                        onChange={() => setSnippet({ ...snippet, isPublic: true })}
                        className="mr-2"
                      />
                      <Globe className="w-4 h-4 mr-1" />
                      <span className="text-sm text-slate-300">Public</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Code</h3>
                <div className="text-sm text-slate-400">
                  Press Ctrl+S to save • Ctrl+Enter to share
                </div>
              </div>
              
              {previewMode ? (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <pre className="text-slate-300 whitespace-pre-wrap overflow-auto">
                    {snippet.content || 'No content to preview'}
                  </pre>
                </div>
              ) : (
                <CodeEditor
                  value={snippet.content}
                  onChange={(value) => setSnippet({ ...snippet, content: value || '' })}
                  language={snippet.lang}
                  height="500px"
                  theme="vs-dark"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Tags
              </h3>
              
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="text"
                    className="form-input flex-1 mr-2"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    onClick={addTag}
                    className="btn-secondary px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-slate-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Share Link */}
            {shareLink && (
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Link
                </h3>
                <div className="space-y-3">
                  <div className="flex">
                    <input
                      type="text"
                      className="form-input flex-1 mr-2 text-sm"
                      value={shareLink}
                      readOnly
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(shareLink)}
                      className="btn-secondary px-3"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    This link will expire in 24 hours
                  </p>
                </div>
              </div>
            )}

            {/* Stats */}
            {isEditing && (
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Views
                    </span>
                    <span className="text-white font-medium">{snippet.views || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      Likes
                    </span>
                    <span className="text-white font-medium">{snippet.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Created
                    </span>
                    <span className="text-white font-medium text-sm">
                      {formatDate(snippet.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Version History Modal */}
        {showVersions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Version History</h3>
                <button
                  onClick={() => setShowVersions(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={version._id} className="border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                          Version {versions.length - index}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {formatDate(version.createdAt)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(index)}
                        className="btn-secondary text-sm flex items-center"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restore
                      </button>
                    </div>
                    <pre className="text-slate-300 text-sm bg-slate-900 p-3 rounded overflow-auto max-h-32">
                      {version.content.substring(0, 200)}
                      {version.content.length > 200 && '...'}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetEditor;