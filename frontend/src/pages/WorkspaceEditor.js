import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import workspaceService from '../services/workspaceService';
import Editor from '@monaco-editor/react';

function WorkspaceEditor() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [socket, setSocket] = useState(null);

  // Fetch workspace
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const data = await workspaceService.getWorkspace(workspaceId);
        setWorkspace(data);
        if (data.files.length > 0) setActiveFile(data.files[0]);
      } catch (err) {
        console.error('Failed to load workspace', err);
      }
    };
    fetchWorkspace();
  }, [workspaceId]);

  // Setup socket
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
    });

    newSocket.emit('join-workspace', workspaceId);

    newSocket.on('workspace-updated', (updatedWorkspace) => {
      setWorkspace(updatedWorkspace);
      if (activeFile) {
        const updatedFile = updatedWorkspace.files.find(f => f.id === activeFile.id);
        if (updatedFile) setActiveFile(updatedFile);
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave-workspace', workspaceId);
        newSocket.disconnect();
        setSocket(null); // ✅ clear reference
      }
    };
  }, [workspaceId, activeFile]);

  // Save file content with debounce
  useEffect(() => {
    if (!activeFile) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await workspaceService.updateFile(workspaceId, activeFile.id, { content: activeFile.content });
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [activeFile?.content, workspaceId, activeFile?.id]);

  // Handle editor input
  const handleCodeChange = (value) => {
    setWorkspace((prev) => ({
      ...prev,
      files: prev.files.map((file) =>
        file.id === activeFile.id ? { ...file, content: value } : file
      ),
    }));
  };

  if (!workspace) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 overflow-y-auto">
        <h2 className="font-bold mb-2">{workspace.name}</h2>
        <div className="space-y-1">
          {workspace.files.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFile(file)}
              className={`block w-full text-left px-2 py-1 rounded ${
                activeFile?.id === file.id ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        {activeFile ? (
          <Editor
            height="100%"
            language={activeFile.language}
            value={activeFile.content}
            onChange={handleCodeChange}
            theme="vs-dark"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceEditor;
