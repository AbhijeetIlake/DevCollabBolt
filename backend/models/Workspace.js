/**
 * Workspace Model
 * Defines the collaborative workspace schema for MongoDB
 */

const mongoose = require('mongoose');

const fileVersionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const fileSchema = new mongoose.Schema({
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
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lockedAt: {
    type: Date
  },
  versions: [fileVersionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const executionResultSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stdout: {
    type: String,
    default: ''
  },
  stderr: {
    type: String,
    default: ''
  },
  exitCode: {
    type: Number
  },
  executionTime: {
    type: Number // in milliseconds
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'error', 'timeout'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const workspaceSchema = new mongoose.Schema({
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
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  files: [fileSchema],
  executionResults: [executionResultSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true
  },
  settings: {
    allowExecution: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 1024 * 1024 // 1MB in bytes
    },
    allowedLanguages: [{
      type: String,
      enum: [
        'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
        'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
        'sql', 'json', 'xml', 'yaml', 'markdown', 'shell', 'dockerfile'
      ]
    }]
  }
}, {
  timestamps: true
});

// Index for better query performance
workspaceSchema.index({ owner: 1, createdAt: -1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ inviteCode: 1 });
workspaceSchema.index({ isPublic: 1, createdAt: -1 });

// Method to generate invite code
workspaceSchema.methods.generateInviteCode = function() {
  const { v4: uuidv4 } = require('uuid');
  this.inviteCode = uuidv4().substring(0, 8).toUpperCase();
};

// Method to check if user is member
workspaceSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString()) || 
         this.owner.toString() === userId.toString();
};

// Method to get user role
workspaceSchema.methods.getUserRole = function(userId) {
  if (this.owner.toString() === userId.toString()) {
    return 'owner';
  }
  
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member ? member.role : null;
};

// Method to add member
workspaceSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({
      user: userId,
      role: role
    });
    return true;
  }
  return false;
};

// Method to add file version
workspaceSchema.methods.addFileVersion = function(fileId, content, authorId) {
  const file = this.files.id(fileId);
  if (file) {
    file.versions.unshift({
      content: content,
      author: authorId
    });
    
    // Keep only the last 10 versions
    if (file.versions.length > 10) {
      file.versions = file.versions.slice(0, 10);
    }
    
    file.content = content;
    return true;
  }
  return false;
};

// Method to lock file
workspaceSchema.methods.lockFile = function(fileId, userId) {
  const file = this.files.id(fileId);
  if (file && !file.isLocked) {
    file.isLocked = true;
    file.lockedBy = userId;
    file.lockedAt = new Date();
    return true;
  }
  return false;
};

// Method to unlock file
workspaceSchema.methods.unlockFile = function(fileId, userId) {
  const file = this.files.id(fileId);
  if (file && file.isLocked && file.lockedBy.toString() === userId.toString()) {
    file.isLocked = false;
    file.lockedBy = undefined;
    file.lockedAt = undefined;
    return true;
  }
  return false;
};

module.exports = mongoose.model('Workspace', workspaceSchema);