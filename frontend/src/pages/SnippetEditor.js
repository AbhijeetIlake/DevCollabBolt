/**
 * SnippetEditor.js
 * Create / Edit code snippets with version history & sharing
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  Share2,
  Loader,
  RotateCcw,
  PlusCircle,
  XCircle,
} from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import LoadingSpinner from "../components/LoadingSpinner";
import snippetService from "../services/snippetService";

const SnippetEditor = () => {
  const { id } = useParams(); // snippet id if editing
  const navigate = useNavigate();

  const [snippet, setSnippet] = useState({
    title: "",
    description: "",
    content: "",
    lang: "javascript",
    tags: [],
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [versions, setVersions] = useState([]);
  const [restoring, setRestoring] = useState(false);

  // Load snippet if editing
  useEffect(() => {
    if (id && id !== "undefined" && id !== "null") {
      loadSnippet();
    }
  }, [id]);

  const loadSnippet = async () => {
    try {
      setLoading(true);
      const response = await snippetService.getSnippet(id);
      setSnippet(response.snippet);
      setVersions(response.versions || []);
    } catch (err) {
      setError(err.message || "Failed to load snippet");
    } finally {
      setLoading(false);
    }
  };

  // Ctrl+S / Cmd+S shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [snippet]);

  const handleSave = async () => {
    if (!snippet.title.trim() || !snippet.content.trim()) {
      setError("Title and content are required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      let result;
      if (id) {
        result = await snippetService.updateSnippet(id, snippet);
      } else {
        result = await snippetService.createSnippet(snippet);
        navigate(`/snippets/edit/${result._id}`);
      }
      setSnippet(result.snippet);
      setVersions(result.versions || []);
    } catch (err) {
      setError(err.message || "Failed to save snippet");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!id) {
      setError("Save the snippet before sharing");
      return;
    }
    try {
      const { shareUrl } = await snippetService.shareSnippet(id);
      setShareLink(shareUrl);
    } catch (err) {
      setError(err.message || "Failed to create share link");
    }
  };

  const handleRestore = async (versionId) => {
    try {
      setRestoring(true);
      const result = await snippetService.restoreVersion(id, versionId);
      setSnippet(result.snippet);
      setVersions(result.versions || []);
    } catch (err) {
      setError(err.message || "Failed to restore version");
    } finally {
      setRestoring(false);
    }
  };

  const handleChange = (field, value) => {
    setSnippet({ ...snippet, [field]: value });
  };

  const addTag = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      setSnippet({
        ...snippet,
        tags: [...snippet.tags, e.target.value.trim()],
      });
      e.target.value = "";
    }
  };

  const removeTag = (index) => {
    const newTags = snippet.tags.filter((_, i) => i !== index);
    setSnippet({ ...snippet, tags: newTags });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading snippet..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Title & Description */}
      <input
        className="w-full p-2 mb-2 border rounded"
        placeholder="Title"
        value={snippet.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />
      <textarea
        className="w-full p-2 mb-2 border rounded"
        placeholder="Description"
        value={snippet.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      {/* Tags */}
      <div className="flex flex-wrap mb-2">
        {snippet.tags.map((tag, i) => (
          <span
            key={i}
            className="bg-gray-200 rounded px-2 py-1 mr-2 mb-2 flex items-center"
          >
            {tag}
            <button
              onClick={() => removeTag(i)}
              className="ml-1 text-gray-600 hover:text-red-600"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder="Add tag & press Enter"
          onKeyDown={addTag}
          className="p-1 border rounded"
        />
      </div>

      {/* Code Editor */}
      <CodeEditor
        value={snippet.content}
        lang={snippet.lang}
        onChange={(val) => handleChange("content", val || "")}
        height="400px"
      />

      {/* Actions */}
      <div className="flex space-x-4 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? (
            <Loader className="animate-spin w-4 h-4 inline-block mr-2" />
          ) : (
            <Save className="w-4 h-4 inline-block mr-2" />
          )}
          Save
        </button>

        <button
          onClick={handleShare}
          disabled={!id}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          <Share2 className="w-4 h-4 inline-block mr-2" />
          Share
        </button>

        <button
          onClick={() => navigate("/snippets")}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>

      {/* Share Link */}
      {shareLink && (
        <div className="mt-2">
          <span className="font-semibold">Shareable Link: </span>
          <a href={shareLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            {shareLink}
          </a>
        </div>
      )}

      {/* Version History */}
      {versions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Version History</h3>
          <ul className="space-y-2">
            {versions.map((v) => (
              <li key={v._id} className="flex justify-between items-center">
                <span>
                  {new Date(v.createdAt).toLocaleString()} - {v.lang}
                </span>
                <button
                  onClick={() => handleRestore(v._id)}
                  disabled={restoring}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {restoring ? "Restoring..." : "Restore"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SnippetEditor;
