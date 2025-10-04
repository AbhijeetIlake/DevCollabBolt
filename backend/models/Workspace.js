/**
 * Workspace Model
 * Defines the collaborative workspace schema for MongoDB
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const fileSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4()
  },
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
    enum: [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
      'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
      'sql', 'json', 'xml', 'yaml', 'markdown', 'shell', 'dockerfile'
    ]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


const workspaceSchema = new mongoose.Schema({
  workspaceId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    maxlength: [100, 'Workspace name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  files: [fileSchema],
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

workspaceSchema.index({ owner: 1, createdAt: -1 });
workspaceSchema.index({ 'collaborators.user': 1 });
workspaceSchema.index({ inviteCode: 1 });
workspaceSchema.index({ workspaceId: 1 });

workspaceSchema.methods.generateInviteCode = function() {
  this.inviteCode = uuidv4().substring(0, 8).toUpperCase();
};

workspaceSchema.methods.isCollaborator = function(userId) {
  return this.collaborators.some(collab => collab.user.toString() === userId.toString()) ||
         this.owner.toString() === userId.toString();
};

workspaceSchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

workspaceSchema.methods.addCollaborator = function(userId) {
  if (!this.isCollaborator(userId)) {
    this.collaborators.push({
      user: userId
    });
    return true;
  }
  return false;
};

workspaceSchema.methods.updateFile = function(fileId, content) {
  const file = this.files.find(f => f.id === fileId);
  if (file) {
    file.content = content;
    file.updatedAt = new Date();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Workspace', workspaceSchema);