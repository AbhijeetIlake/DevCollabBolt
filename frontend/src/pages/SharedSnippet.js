/**
 * Shared Snippet Page Component
 * View publicly shared snippets
 */

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Code,
  User,
  Clock,
  Eye,
  Globe,
  Copy,
  Check,
} from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import LoadingSpinner from "../components/LoadingSpinner";
import snippetService from "../services/snippetService";

const SharedSnippet = () => {
  const { shareId } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shareId) loadSharedSnippet();
  }, [shareId]);

  const loadSharedSnippet = async () => {
    try {
      setLoading(true);
      const response = await snippetService.getSharedSnippet(shareId);
      if (!response?.snippet) {
        setError("Snippet not found or link has expired.");
      } else {
        setSnippet(response.snippet);
      }
    } catch (error) {
      console.error("Failed to load shared snippet:", error);
      if (error.response?.status === 404) {
        setError("Snippet not found or link has expired.");
      } else if (error.response?.status === 410) {
        setError("This share link has expired.");
      } else {
        setError("Failed to load snippet. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!snippet?.content) return;
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: "bg-yellow-100 text-yellow-800",
      typescript: "bg-blue-100 text-blue-800",
      python: "bg-green-100 text-green-800",
      java: "bg-red-100 text-red-800",
      cpp: "bg-purple-100 text-purple-800",
      html: "bg-orange-100 text-orange-800",
      css: "bg-pink-100 text-pink-800",
      default: "bg-gray-100 text-gray-800",
    };
    return colors[lang] || colors.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading shared snippet..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Snippet Not Available
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link to="/login" className="btn-primary">
            Go to DevCollab
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/login"
            className="flex items-center text-primary-600 hover:text-primary-700 font-semibold"
          >
            <Code className="w-6 h-6 mr-2" />
            DevCollab
          </Link>
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Snippet Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {snippet.title}
                </h1>
                {snippet.description && (
                  <p className="text-gray-600 mb-4">{snippet.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Globe className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-500">Shared publicly</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>by {snippet.author?.username || "Unknown"}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatDate(snippet.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>{snippet.views} views</span>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${getLanguageColor(
                  snippet.lang
                )}`}
              >
                {snippet.lang}
              </span>
            </div>

            {/* Tags */}
            {snippet.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {snippet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Code</h2>
              <button
                onClick={copyCode}
                className="flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" /> Copy Code
                  </>
                )}
              </button>
            </div>
            <div className="p-4">
              <CodeEditor
                value={snippet.content}
                lang={snippet.lang}
                height="400px"
                readOnly
                options={{
                  readOnly: true,
                  domReadOnly: true,
                  contextmenu: false,
                }}
              />
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Like this snippet?</h3>
              <p className="text-primary-100 mb-6">
                Join DevCollab to create, share, and collaborate on code
                snippets and workspaces.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/login"
                  className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedSnippet;
