/**
 * Snippet Model
 * Defines the code snippet schema for MongoDB
 */

const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Snippet title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Snippet content is required']
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
  isPublic: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  versions: [versionSchema],
  shareId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  shareExpiresAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
snippetSchema.index({ author: 1, createdAt: -1 });
snippetSchema.index({ isPublic: 1, createdAt: -1 });
snippetSchema.index({ shareId: 1 });
snippetSchema.index({ tags: 1 });

// Method to add a new version (keep only last 3 versions)
snippetSchema.methods.addVersion = function(content) {
  if (!content) return;
  
  this.versions.unshift({ content });
  
  // Keep only the last 3 versions
  if (this.versions.length > 3) {
    this.versions = this.versions.slice(0, 3);
  }
  
  this.content = content;
};

// Method to restore a version
snippetSchema.methods.restoreVersion = function(versionIndex) {
  if (versionIndex >= 0 && versionIndex < this.versions.length) {
    const versionContent = this.versions[versionIndex].content;
    this.addVersion(versionContent);
    return true;
  }
  return false;
};

// Method to generate share link
snippetSchema.methods.generateShareLink = function(expirationHours = 24) {
  const { v4: uuidv4 } = require('uuid');
  this.shareId = uuidv4();
  this.shareExpiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
};

// Method to check if share link is valid
snippetSchema.methods.isShareLinkValid = function() {
  return this.shareId && this.shareExpiresAt && new Date() < this.shareExpiresAt;
};

module.exports = mongoose.model('Snippet', snippetSchema);