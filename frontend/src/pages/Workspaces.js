import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import workspaceService from '../services/workspaceService';

function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  // Fetch workspaces on component mount
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const data = await workspaceService.getWorkspaces();
        // Backend returns { workspaces: [...], total: X }
        setWorkspaces(Array.isArray(data.workspaces) ? data.workspaces : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load workspaces');
      }
    };
    fetchWorkspaces();
  }, []);

  // Handle creating a new workspace
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const response = await workspaceService.createWorkspace(newName);
      // Backend returns { message: '...', workspace: {...} }
      setWorkspaces([...workspaces, response.workspace]);
      setNewName('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workspace');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Workspaces</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New workspace name"
          className="flex-1 border rounded px-2 py-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
          Create
        </button>
      </form>

      {workspaces.length === 0 ? (
        <p className="text-gray-500">No workspaces yet. Create one above!</p>
      ) : (
        <div className="grid gap-3">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.workspaceId}  // ✅ use UUID consistently
              to={`/workspaces/${workspace.workspaceId}`}
              className="block p-4 border rounded-lg hover:shadow"
            >
              <h2 className="font-semibold">{workspace.name}</h2>
              <p className="text-sm text-gray-500">
                {(workspace.collaborators?.length ?? 0) + 1} collaborators
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Workspaces;
