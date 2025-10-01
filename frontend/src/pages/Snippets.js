/**
 * Snippets Page Component
 * Lists all user snippets with search and filter functionality
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ListFilter as Filter, Code, Eye, Clock, Globe, Lock, CreditCard as Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import snippetService from '../services/snippetService';

const Snippets = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
    'sql', 'json', 'xml', 'yaml', 'markdown', 'shell', 'dockerfile'
  ];

  useEffect(() => {
    loadSnippets();
  }, [currentPage, searchTerm, selectedLanguage, visibilityFilter]);

  const loadSnippets = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedLanguage && { language: selectedLanguage }),
        ...(visibilityFilter && { isPublic: visibilityFilter === 'public' })
      };

      const response = await snippetService.getSnippets(params);
      setSnippets(response.snippets);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLanguageFilter = (language) => {
    setSelectedLanguage(language);
    setCurrentPage(1);
  };

  const handleVisibilityFilter = (visibility) => {
    setVisibilityFilter(visibility);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('');
    setVisibilityFilter('');
    setCurrentPage(1);
  };

  const handleDeleteSnippet = async (snippetId) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await snippetService.deleteSnippet(snippetId);
        // Reload snippets after successful deletion
        await loadSnippets();
      } catch (error) {
        console.error('Failed to delete snippet:', error);
        alert('Failed to delete snippet. Please try again.');
      }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Code Snippets</h1>
          <p className="mt-2 text-gray-600">
            Manage your code snippets and share them with the community
          </p>
        </div>
        <Link
          to="/snippets/new"
          className="mt-4 sm:mt-0 btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Snippet
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search snippets by title, description, or tags..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            {(searchTerm || selectedLanguage || visibilityFilter) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programming Language
                </label>
                <select
                  className="form-input"
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageFilter(e.target.value)}
                >
                  <option value="">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  className="form-input"
                  value={visibilityFilter}
                  onChange={(e) => handleVisibilityFilter(e.target.value)}
                >
                  <option value="">All Snippets</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Only</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Snippets Grid */}
      {loading ? (
        <LoadingSpinner text="Loading snippets..." />
      ) : snippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snippets.map((snippet) => (
            <div key={snippet._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {snippet.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {snippet.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {snippet.isPublic ? (
                    <Globe className="w-4 h-4 text-green-500" title="Public" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" title="Private" />
                  )}
                </div>
              </div>

              {/* Language and Stats */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs ${getLanguageColor(snippet.language)}`}>
                  {snippet.language}
                </span>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {snippet.views}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(snippet.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <Link
                  to={`/snippets/${snippet._id}`}
                  className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Code className="w-4 h-4 mr-1" />
                  View Code
                </Link>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/snippets/${snippet._id}`}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteSnippet(snippet._id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No snippets found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedLanguage || visibilityFilter
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first code snippet'}
          </p>
          <Link to="/snippets/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create New Snippet
          </Link>
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
    </div>
  );
};

export default Snippets;