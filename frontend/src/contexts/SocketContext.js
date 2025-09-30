/**
 * Socket Context
 * Manages Socket.IO connection and real-time events
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

/**
 * Custom hook to use socket context
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

/**
 * Socket Provider Component
 */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, getToken } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: getToken()
        },
        transports: ['websocket', 'polling']
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [user, getToken]);

  /**
   * Join a workspace room for real-time collaboration
   */
  const joinWorkspace = (workspaceId) => {
    if (socket && connected) {
      socket.emit('join-workspace', workspaceId);
    }
  };

  /**
   * Leave a workspace room
   */
  const leaveWorkspace = (workspaceId) => {
    if (socket && connected) {
      socket.emit('leave-workspace', workspaceId);
    }
  };

  /**
   * Lock a file for editing
   */
  const lockFile = (workspaceId, fileId) => {
    if (socket && connected) {
      socket.emit('lock-file', {
        workspaceId,
        fileId,
        userId: user.id,
        username: user.username
      });
    }
  };

  /**
   * Unlock a file
   */
  const unlockFile = (workspaceId, fileId) => {
    if (socket && connected) {
      socket.emit('unlock-file', {
        workspaceId,
        fileId,
        userId: user.id
      });
    }
  };

  /**
   * Subscribe to file lock events
   */
  const onFileLocked = (callback) => {
    if (socket) {
      socket.on('file-locked', callback);
      return () => socket.off('file-locked', callback);
    }
  };

  /**
   * Subscribe to file unlock events
   */
  const onFileUnlocked = (callback) => {
    if (socket) {
      socket.on('file-unlocked', callback);
      return () => socket.off('file-unlocked', callback);
    }
  };

  /**
   * Subscribe to user joined events
   */
  const onUserJoined = (callback) => {
    if (socket) {
      socket.on('user-joined', callback);
      return () => socket.off('user-joined', callback);
    }
  };

  /**
   * Subscribe to execution result events
   */
  const onExecutionResult = (callback) => {
    if (socket) {
      socket.on('execution-result', callback);
      return () => socket.off('execution-result', callback);
    }
  };

  /**
   * Generic event listener
   */
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
  };

  /**
   * Generic event emitter
   */
  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    connected,
    joinWorkspace,
    leaveWorkspace,
    lockFile,
    unlockFile,
    onFileLocked,
    onFileUnlocked,
    onUserJoined,
    onExecutionResult,
    on,
    emit
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;