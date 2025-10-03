/**
 * Snippets Page Component
 * Complete snippet management with advanced features
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, ListFilter as Filter, Eye, Heart, Share2, Lock, Globe, Clock, Code, Star, TrendingUp, CreditCard as Edit, Trash2, Copy, Check, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import snippetService from '../services/snippetService';

const Snippets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '');
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get('filter') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState(null);

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
    'sql', 'json', 'xml', 'yaml', 'markdown', 'shell', 'dockerfile'
  ];

  const filters = [
    { value: 'all', label: 'All Snippets', icon: Code },
    { value: 'my', label: 'My Snippets', icon: User },
    { value: 'public', label: 'Public', icon: Globe },
    { value: 'private', label: 'Private', icon: Lock },
    { value: 'liked', label: 'Liked', icon: Heart },
    { value: 'trending', label: 'Trending', icon: TrendingUp }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'title', label: 'Alphabetical' }
  ];

  useEffect(() => {
    loadSnippets();
  }, [searchTerm, selectedLanguage, selectedFilter, sortBy, currentPage]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedLanguage) params.set('language', selectedLanguage);
    if (selectedFilter !== 'all') params.set('filter', selectedFilter);
    if (sortBy !== 'recent') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchTerm, selectedLanguage, selectedFilter, sortBy, setSearchParams]);

  const loadSnippets = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        language: selectedLanguage,
        sortBy,
        ...(selectedFilter === 'public' && { isPublic: true }),
        ...(selectedFilter === 'private' && { isPublic: false }),
        ...(selectedFilter === 'my' && { author: 'me' })
      };

      const response = await snippetService.getSnippets(params);
      setSnippets(response.snippets || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to load snippets:', error);
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    
    try {
      await snippetService.deleteSnippet(id);
      setSnippets(snippets.filter(s => s._id !== id));
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      alert('Failed to delete snippet. Please try again.');
    }
  };

  const handleLike = async (id) => {
    try {
      await snippetService.likeSnippet(id);
      // Refresh snippets to get updated like count
      loadSnippets();
    } catch (error) {
      console.error('Failed to like snippet:', error);
    }
  };

  const copyShareLink = async (snippet) => {
    try {
      const shareResponse = await snippetService.shareSnippet(snippet._id);
      const shareUrl = `${window.location.origin}/share/${shareResponse.shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(snippet._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy share link:', error);
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
      javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      python: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      java: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      cpp: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      html: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      css: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[language] || colors.default;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Code Snippets</h1>
          <p className="mt-2 text-slate-400">
            Create, share, and discover amazing code snippets
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

      {/* Filters and Search */}
      <div className="card space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search snippets..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.value}
                onClick={() => {
                  setSelectedFilter(filter.value);
                  setCurrentPage(1);
                }}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Language and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              className="form-input"
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Snippets Grid */}
      {loading ? (
        <LoadingSpinner text="Loading snippets..." />
      ) : snippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snippets.map((snippet) => (
            <div key={snippet._id} className="card hover:shadow-lg transition-all duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Link
                    to={`/snippets/${snippet._id}`}
                    className="font-semibold text-white hover:text-blue-400 transition-colors line-clamp-1"
                  >
                    {snippet.title}
                  </Link>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                    {snippet.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {snippet.isPublic ? (
                    <div className="flex items-center bg-green-500/20 px-2 py-1 rounded-full">
                      <Globe className="w-3 h-3 text-green-400 mr-1" />
                      <span className="text-xs text-green-400 font-medium">Public</span>
                    </div>
                  ) : (
                    <div className="flex items-center bg-slate-700 px-2 py-1 rounded-full">
                      <Lock className="w-3 h-3 text-slate-400 mr-1" />
                      <span className="text-xs text-slate-400 font-medium">Private</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Language Badge */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(snippet.lang)}`}>
                  {snippet.lang}
                </span>
              </div>

              {/* Tags */}
              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {snippet.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                  {snippet.tags.length > 3 && (
                    <span className="text-xs text-slate-400">+{snippet.tags.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {snippet.views || 0}
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    {snippet.likes?.length || 0}
                  </span>
                </div>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(snippet.createdAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLike(snippet._id)}
                    className="p-2 text-slate-400 hover:text-pink-400 transition-colors"
                    title="Like snippet"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyShareLink(snippet)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Share snippet"
                  >
                    {copiedId === snippet._id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/snippets/${snippet._id}`}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Edit snippet"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(snippet._id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete snippet"
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
          <Code className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No snippets found</h3>
          <p className="text-slate-400 mb-6">
            {searchTerm || selectedLanguage || selectedFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first snippet'}
          </p>
          <Link
            to="/snippets/new"
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Snippet
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Snippets;
