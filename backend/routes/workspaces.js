/**
 * Workspace Routes
 * Handles CRUD operations for collaborative workspaces
 */

const express = require('express');
const Workspace = require('../models/Workspace');

const router = express.Router();

/**
 * @route   GET /api/workspaces
 * @desc    Get all workspaces for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('owner', 'username email')
    .populate('collaborators.user', 'username email')
    .sort({ updatedAt: -1 });

    res.json({
      workspaces,
      total: workspaces.length
    });

  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch workspaces'
    });
  }
});

/**
 * @route   POST /api/workspaces
 * @desc    Create a new workspace
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Workspace name is required'
      });
    }

    const workspace = new Workspace({
      name,
      description,
      owner: req.user._id,
      isPublic: isPublic || false
    });

    workspace.generateInviteCode();
    await workspace.save();
    await workspace.populate('owner', 'username');

    res.status(201).json({
      message: 'Workspace created successfully',
      workspace
    });

  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create workspace'
    });
  }
});

/**
 * @route   GET /api/workspaces/:workspaceId
 * @desc    Get a specific workspace
 * @access  Private
 */
router.get('/:workspaceId', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId })
      .populate('owner', 'username email')
      .populate('collaborators.user', 'username email')
      .populate('files.createdBy', 'username email');

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isCollaborator(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this workspace'
      });
    }

    res.json({ workspace });

  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch workspace'
    });
  }
});

/**
 * @route   POST /api/workspaces/join/:workspaceId
 * @desc    Join a workspace using workspace ID
 * @access  Private
 */
router.post('/join/:workspaceId', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (workspace.isCollaborator(req.user._id)) {
      return res.status(400).json({
        error: 'Already member',
        message: 'You are already a collaborator in this workspace'
      });
    }

    workspace.addCollaborator(req.user._id);
    await workspace.save();
    await workspace.populate('collaborators.user', 'username email');

    const io = req.app.get('io');
    io.to(workspace.workspaceId).emit('collaborator-joined', {
      userId: req.user._id,
      username: req.user.username
    });

    res.json({
      message: 'Successfully joined workspace',
      workspace
    });

  } catch (error) {
    console.error('Join workspace error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to join workspace'
    });
  }
});

/**
 * @route   POST /api/workspaces/:workspaceId/files
 * @desc    Add a file to workspace
 * @access  Private
 */
router.post('/:workspaceId/files', async (req, res) => {
  try {
    const { name, content, language } = req.body;

    if (!name || !language) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'File name and language are required'
      });
    }

    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isCollaborator(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this workspace'
      });
    }

    const file = {
      name,
      content: content || '',
      language,
      createdBy: req.user._id
    };

    workspace.files.push(file);
    await workspace.save();
    await workspace.populate('files.createdBy', 'username email');

    const newFile = workspace.files[workspace.files.length - 1];

    const io = req.app.get('io');
    io.to(workspace.workspaceId).emit('file-created', {
      file: newFile,
      userId: req.user._id
    });

    res.status(201).json({
      message: 'File added successfully',
      file: newFile
    });

  } catch (error) {
    console.error('Add file error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to add file'
    });
  }
});

/**
 * @route   PUT /api/workspaces/:workspaceId/files/:fileId
 * @desc    Update a file in workspace
 * @access  Private
 */
router.put('/:workspaceId/files/:fileId', async (req, res) => {
  try {
    const { content, name } = req.body;

    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isCollaborator(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this workspace'
      });
    }

    const file = workspace.files.find(f => f.id === req.params.fileId);

    if (!file) {
      return res.status(404).json({
        error: 'Not found',
        message: 'File not found'
      });
    }

    if (name) file.name = name;
    if (content !== undefined) {
      workspace.updateFile(file.id, content);
    }

    await workspace.save();

    const io = req.app.get('io');
    io.to(workspace.workspaceId).emit('file-updated', {
      fileId: file.id,
      content,
      name,
      userId: req.user._id
    });

    res.json({
      message: 'File updated successfully',
      file
    });

  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update file'
    });
  }
});

/**
 * @route   DELETE /api/workspaces/:workspaceId
 * @desc    Delete a workspace
 * @access  Private
 */
router.delete('/:workspaceId', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isOwner(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only the workspace owner can delete it'
      });
    }

    await Workspace.deleteOne({ workspaceId: req.params.workspaceId });

    const io = req.app.get('io');
    io.to(workspace.workspaceId).emit('workspace-deleted', {
      workspaceId: workspace.workspaceId
    });

    res.json({
      message: 'Workspace deleted successfully'
    });

  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete workspace'
    });
  }
});

/**
 * @route   DELETE /api/workspaces/:workspaceId/files/:fileId
 * @desc    Delete a file from workspace
 * @access  Private
 */
router.delete('/:workspaceId/files/:fileId', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ workspaceId: req.params.workspaceId });

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isCollaborator(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this workspace'
      });
    }

    const fileIndex = workspace.files.findIndex(f => f.id === req.params.fileId);

    if (fileIndex === -1) {
      return res.status(404).json({
        error: 'Not found',
        message: 'File not found'
      });
    }

    workspace.files.splice(fileIndex, 1);
    await workspace.save();

    const io = req.app.get('io');
    io.to(workspace.workspaceId).emit('file-deleted', {
      fileId: req.params.fileId,
      userId: req.user._id
    });

    res.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete file'
    });
  }
});

module.exports = router;