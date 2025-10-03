/**
 * Main App Component
 * Handles routing and global state management
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Import pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Snippets from './pages/Snippets';
import SnippetEditor from './pages/SnippetEditor';
import SharedSnippet from './pages/SharedSnippet';
import Workspaces from './pages/Workspaces';
import WorkspaceEditor from './pages/WorkspaceEditor';

// Import components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * App Layout Component
 * Provides consistent layout for authenticated pages
 */
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

/**
 * Main App Component
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={<Landing />} 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Shared snippet route (public) */}
            <Route 
              path="/share/:shareId" 
              element={<SharedSnippet />} 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </SocketProvider>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/snippets" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Snippets />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/snippets/new" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SnippetEditor />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/snippets/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SnippetEditor />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/workspaces" 
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <AppLayout>
                      <Workspaces />
                    </AppLayout>
                  </SocketProvider>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/workspaces/:id" 
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <AppLayout>
                      <WorkspaceEditor />
                    </AppLayout>
                  </SocketProvider>
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            
            {/* 404 fallback */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-slate-900">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                    <p className="text-slate-300 mb-8">Page not found</p>
                    <a 
                      href="/" 
                      className="btn-primary"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;