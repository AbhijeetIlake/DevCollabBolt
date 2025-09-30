/**
 * Snippet Editor Page Component
 * Create and edit code snippets with Monaco Editor
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Share, 
  Eye, 
  EyeOff, 
  Clock, 
  ArrowLeft,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import snippetService from '../services/snippetService';

const SnippetEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [snippet, setSnippet] = useState({
    title: '',
    description: '',
    content: '',
    language: 'javascript',
    isPublic: false,
    tags: []
  });
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tagInput, setTagInput] = useState('');

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

  const handleSave = async () => {
    if (!snippet.title.trim() || !snippet.content.trim()) {
      alert('Please provide both title and content for the snippet.');
      return;
    }

    try {
      setSaving(true);
      
      const snippetData = {
        ...snippet,
        tags: snippet.tags.filter(tag => tag.trim())
      };

      if (isEditing) {
        await snippetService.updateSnippet(id, snippetData);
      } else {
        const response = await snippetService.createSnippet(snippetData);
        navigate(`/snippets/${response.snippet._id}`);
      }
      
      // Reload snippet to get updated versions
      if (isEditing) {
        loadSnippet();
      }
    } catch (error) {
      console.error('Failed to save snippet:', error);
      alert('Failed to save snippet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const response = await snippetService.generateShareLink(id, 24);
      const fullShareLink = `${window.location.origin}/share/${response.shareId}`;
      setShareLink(fullShareLink);
      setShowShareModal(true);
    } catch (error) {
      console.error('Failed to generate share link:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleRestoreVersion = async (versionIndex) => {
    if (window.confirm('Are you sure you want to restore this version? Current changes will be saved as a new version.')) {
      try {
        await snippetService.restoreVersion(id, versionIndex);
        loadSnippet();
      } catch (error) {
        console.error('Failed to restore version:', error);
        alert('Failed to restore version. Please try again.');
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !snippet.tags.includes(tagInput.trim())) {
      setSnippet({
        ...snippet,
        tags: [...snippet.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSnippet({
      ...snippet,
      tags: snippet.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagInputKeyPress = (e) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/snippets')}
            className="btn-secondary flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Snippets
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Snippet' : 'Create New Snippet'}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {isEditing && (
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center"
          >
            {saving ? (
              <LoadingSpinner size="small" text="" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Snippet Details */}
          <div className="card">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter snippet title"
                  value={snippet.title}
                  onChange={(e) => setSnippet({ ...snippet, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe what this snippet does"
                  value={snippet.description}
                  onChange={(e) => setSnippet({ ...snippet, description: e.target.value })}
                />
              </div>

              {/* Language and Visibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language *
                  </label>
                  <select
                    className="form-input"
                    value={snippet.language}
                    onChange={(e) => setSnippet({ ...snippet, language: e.target.value })}
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <EyeOff className="w-4 h-4 mr-1" />
                      Private
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        checked={snippet.isPublic}
                        onChange={() => setSnippet({ ...snippet, isPublic: true })}
                        className="mr-2"
                      />
                      <Eye className="w-4 h-4 mr-1" />
                      Public
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {snippet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    className="form-input rounded-r-none"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="card">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code *
              </label>
            </div>
            <CodeEditor
              value={snippet.content}
              onChange={(value) => setSnippet({ ...snippet, content: value })}
              language={snippet.language}
              height="500px"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Version History */}
          {isEditing && versions.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Version History
              </h3>
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Version {index + 1}
                      </span>
                      <button
                        onClick={() => handleRestoreVersion(index)}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                        title="Restore this version"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Restore
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(version.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tips
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Use descriptive titles to make your snippets easy to find</p>
              <p>• Add tags to categorize your code</p>
              <p>• Make snippets public to share with the community</p>
              <p>• Version history keeps track of your changes</p>
              <p>• Use Ctrl+S (Cmd+S) to save quickly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Share Snippet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This link will expire in 24 hours and allows anyone to view your snippet.
            </p>
            <div className="flex">
              <input
                type="text"
                className="form-input rounded-r-none flex-1"
                value={shareLink}
                readOnly
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 flex items-center"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="btn-secondary"
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

export default SnippetEditor;