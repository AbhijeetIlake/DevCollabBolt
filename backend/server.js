/**
 * DevCollab Backend Server
 * Main server file that sets up Express app, MongoDB connection, and Socket.IO
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const snippetRoutes = require('./routes/snippets');
const workspaceRoutes = require('./routes/workspaces');

// Import middleware
const authMiddleware = require('./middleware/auth');

const app = express();
app.set('trust proxy', 1); // or true
const server = http.createServer(app);

// Socket.IO setup for real-time features
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join workspace room for real-time collaboration
  socket.on('join-workspace', (workspaceId) => {
    socket.join(workspaceId);
    socket.to(workspaceId).emit('user-joined', socket.id);
    console.log(`👤 User ${socket.id} joined workspace ${workspaceId}`);
  });

  // Handle file locking
  socket.on('lock-file', (data) => {
    socket.to(data.workspaceId).emit('file-locked', {
      fileId: data.fileId,
      userId: data.userId,
      username: data.username
    });
  });

  // Handle file unlocking
  socket.on('unlock-file', (data) => {
    socket.to(data.workspaceId).emit('file-unlocked', {
      fileId: data.fileId,
      userId: data.userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/snippets', authMiddleware, snippetRoutes);
app.use('/api/workspaces', authMiddleware, workspaceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'DevCollab Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 DevCollab Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };