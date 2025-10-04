/**
 * Workspace Model
 * Represents collaborative coding workspaces with real-time file editing
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// File schema inside workspace
const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

// Collaborator schema
const collaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['editor', 'viewer'],
    default: 'editor',
  }
}, { timestamps: true });

// Workspace schema
const workspaceSchema = new mongoose.Schema({
  workspaceId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [collaboratorSchema],
  files: [fileSchema],
  inviteCode: {
    type: String,
    unique: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

/**
 * Instance Methods
 */

// Generate unique invite code
workspaceSchema.methods.generateInviteCode = function () {
  this.inviteCode = uuidv4().slice(0, 8); // short code
};

// Check if user is a collaborator or owner
workspaceSchema.methods.isCollaborator = function (userId) {
  if (!userId) return false;
  if (this.owner.toString() === userId.toString()) return true;
  return this.collaborators.some(c => c.user.toString() === userId.toString());
};

// Check if user is the owner
workspaceSchema.methods.isOwner = function (userId) {
  if (!userId) return false;
  return this.owner.toString() === userId.toString();
};

// Add collaborator
workspaceSchema.methods.addCollaborator = function (userId, role = 'editor') {
  if (!this.isCollaborator(userId)) {
    this.collaborators.push({ user: userId, role });
  }
};

// Update file content
workspaceSchema.methods.updateFile = function (fileId, content) {
  const file = this.files.id(fileId);
  if (file) {
    file.content = content;
  }
  return file;
};

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
