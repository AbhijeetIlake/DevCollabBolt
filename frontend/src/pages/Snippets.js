/**
 * Snippets.js
 * List & manage user's snippets
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Search, Plus } from "lucide-react";
import snippetService from "../services/snippetService";

const Snippets = () => {
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    try {
      setLoading(true);
      const data = await snippetService.getSnippets();
      setSnippets(data.snippets || []);
    } catch (err) {
      setError(err.message || "Failed to load snippets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this snippet?")) return;
    try {
      await snippetService.deleteSnippet(id);
      await loadSnippets();
    } catch (err) {
      alert(err.message || "Failed to delete snippet");
    }
  };

  const filtered = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.lang.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Snippets</h1>
        <Link
          to="/snippets/new"
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Snippet
        </Link>
      </div>

      <div className="mb-4 flex items-center border rounded px-2">
        <Search className="w-4 h-4 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search snippets..."
          className="w-full p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading snippets...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <p>No snippets found.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => (
            <li
              key={s._id}
              className="flex justify-between items-center border rounded p-2"
            >
              <div>
                <h2 className="font-semibold">{s.title}</h2>
                <p className="text-sm text-gray-600">{s.lang}</p>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/snippets/edit/${s._id}`}
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Snippets;
