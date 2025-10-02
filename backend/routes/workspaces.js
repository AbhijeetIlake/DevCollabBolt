/**
 * Workspace Routes
 * Handles CRUD operations for collaborative workspaces
 */

const express = require('express');
const { spawn } = require('child_process');
const Workspace = require('../models/Workspace');

const router = express.Router();

// Job queue for code execution
const executionQueue = [];
let isProcessingQueue = false;

/**
 * Process the execution queue
 */
const processExecutionQueue = async () => {
  if (isProcessingQueue || executionQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (executionQueue.length > 0) {
    const job = executionQueue.shift();
    await executeCode(job);
  }
  
  isProcessingQueue = false;
};

/**
 * Execute code with timeout
 */
const executeCode = async ({ workspaceId, fileId, code, language, userId, io }) => {
  return new Promise(async (resolve) => {
    try {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        resolve();
        return;
      }

      // Create execution result record
      const executionResult = {
        fileId,
        executedBy: userId,
        status: 'running',
        stdout: '',
        stderr: '',
        executionTime: 0
      };

      workspace.executionResults.push(executionResult);
      await workspace.save();

      const resultId = executionResult._id;
      const startTime = Date.now();

      // Determine command based on language
      let command, args;
      
      switch (language) {
        case 'javascript':
          command = 'node';
          args = ['-e', code];
          break;
        case 'typescript':
          command = 'node';
          args = ['-e', code]; // For simplicity, treating as JS
          break;
        case 'python':
          command = 'python3';
          args = ['-c', code];
          break;
        case 'shell':
          command = 'bash';
          args = ['-c', code];
          break;
        default:
          // Update result with error
          const result = workspace.executionResults.id(resultId);
          if (result) {
            result.status = 'error';
            result.stderr = `Language ${language} is not supported for execution`;
            result.executionTime = Date.now() - startTime;
            await workspace.save();
            
            // Emit result via Socket.IO
            io.to(workspaceId).emit('execution-result', {
              fileId,
              result: result.toObject()
            });
          }
          resolve();
          return;
      }

      // Spawn child process
      const child = spawn(command, args, {
        timeout: 5000, // 5 second timeout
        killSignal: 'SIGKILL'
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', async (code) => {
        const executionTime = Date.now() - startTime;
        
        // Update execution result
        const updatedWorkspace = await Workspace.findById(workspaceId);
        if (!updatedWorkspace) {
          resolve();
          return;
        }
        
        const result = updatedWorkspace.executionResults.id(resultId);
        
        if (result) {
          result.stdout = stdout;
          result.stderr = stderr;
          result.exitCode = code;
          result.executionTime = executionTime;
          result.status = code === 0 ? 'completed' : 'error';
          
          await updatedWorkspace.save();
          
          // Emit result via Socket.IO
          if (io) {
            io.to(workspaceId).emit('execution-result', {
              fileId,
              result: result.toObject()
            });
          }
        }
        
        resolve();
      });

      child.on('error', async (error) => {
        const executionTime = Date.now() - startTime;
        
        // Update execution result
        const updatedWorkspace = await Workspace.findById(workspaceId);
        if (!updatedWorkspace) {
          resolve();
          return;
        }
        
        const result = updatedWorkspace.executionResults.id(resultId);
        
        if (result) {
          result.stderr = error.message;
          result.executionTime = executionTime;
          result.status = 'error';
          
          await updatedWorkspace.save();
          
          // Emit result via Socket.IO
          if (io) {
            io.to(workspaceId).emit('execution-result', {
              fileId,
              result: result.toObject()
            });
          }
        }
        
        resolve();
      });

    } catch (error) {
      console.error('Code execution error:', error);
      resolve();
    }
  });
};

/**
 * @route   GET /api/workspaces
 * @desc    Get all workspaces for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Find workspaces where user is owner or member
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'username')
    .populate('members.user', 'username')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Workspace.countDocuments({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    res.json({
      workspaces,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
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
 * @route   GET /api/workspaces/:id
 * @desc    Get a specific workspace
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    // Check if it's a valid ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid workspace ID format'
      });
    }

    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'username')
      .populate('members.user', 'username')
      .populate('files.createdBy', 'username')
      .populate('files.lockedBy', 'username')
      .populate('executionResults.executedBy', 'username');

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    // Check if user has access
    if (!workspace.isMember(req.user._id) && !workspace.isPublic) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this workspace'
      });
    }

    console.log('Workspace found:', workspace.name, 'Files:', workspace.files.length);
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
 * @route   POST /api/workspaces/:id/join
 * @desc    Join a workspace using invite code
 * @access  Private
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const workspace = await Workspace.findOne({
      _id: req.params.id,
      inviteCode
    });

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Invalid workspace or invite code'
      });
    }

    if (workspace.isMember(req.user._id)) {
      return res.status(400).json({
        error: 'Already member',
        message: 'You are already a member of this workspace'
      });
    }

    workspace.addMember(req.user._id);
    await workspace.save();
    await workspace.populate('members.user', 'username');

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
 * @route   POST /api/workspaces/:id/files
 * @desc    Add a file to workspace
 * @access  Private
 */
router.post('/:id/files', async (req, res) => {
  try {
    const { name, content, language } = req.body;

    if (!name || !language) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'File name and language are required'
      });
    }

    // Check if it's a valid ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid workspace ID format'
      });
    }

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isMember(req.user._id)) {
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
    
    // Add initial version
    const newFile = workspace.files[workspace.files.length - 1];
    if (content) {
      workspace.addFileVersion(newFile._id, content, req.user._id);
    }

    await workspace.save();
    await workspace.populate('files.createdBy', 'username');

    console.log('File added to workspace:', newFile.name);

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
 * @route   PUT /api/workspaces/:id/files/:fileId
 * @desc    Update a file in workspace
 * @access  Private
 */
router.put('/:id/files/:fileId', async (req, res) => {
  try {
    const { content, name } = req.body;

    // Check if it's a valid ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid workspace ID format'
      });
    }

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isMember(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this workspace'
      });
    }

    const file = workspace.files.id(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({
        error: 'Not found',
        message: 'File not found'
      });
    }

    // Check if file is locked by another user
    if (file.isLocked && file.lockedBy.toString() !== req.user._id.toString()) {
      return res.status(423).json({
        error: 'File locked',
        message: 'File is currently locked by another user'
      });
    }

    // Update file
    if (name) file.name = name;
    if (content !== undefined && content !== file.content) {
      workspace.addFileVersion(file._id, content, req.user._id);
    } else if (content !== undefined) {
      file.content = content;
    }

    await workspace.save();

    console.log('File updated:', file.name, 'Content length:', content?.length || 0);

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
 * @route   POST /api/workspaces/:id/files/:fileId/lock
 * @desc    Lock a file for editing
 * @access  Private
 */
router.post('/:id/files/:fileId/lock', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isMember(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this workspace'
      });
    }

    const locked = workspace.lockFile(req.params.fileId, req.user._id);
    
    if (!locked) {
      return res.status(423).json({
        error: 'Cannot lock',
        message: 'File is already locked or not found'
      });
    }

    await workspace.save();

    // Emit lock event via Socket.IO
    const io = req.app.get('io');
    io.to(req.params.id).emit('file-locked', {
      fileId: req.params.fileId,
      userId: req.user._id,
      username: req.user.username
    });

    res.json({
      message: 'File locked successfully'
    });

  } catch (error) {
    console.error('Lock file error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to lock file'
    });
  }
});

/**
 * @route   POST /api/workspaces/:id/files/:fileId/unlock
 * @desc    Unlock a file
 * @access  Private
 */
router.post('/:id/files/:fileId/unlock', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isMember(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this workspace'
      });
    }

    const unlocked = workspace.unlockFile(req.params.fileId, req.user._id);
    
    if (!unlocked) {
      return res.status(400).json({
        error: 'Cannot unlock',
        message: 'File is not locked by you or not found'
      });
    }

    await workspace.save();

    // Emit unlock event via Socket.IO
    const io = req.app.get('io');
    io.to(req.params.id).emit('file-unlocked', {
      fileId: req.params.fileId,
      userId: req.user._id
    });

    res.json({
      message: 'File unlocked successfully'
    });

  } catch (error) {
    console.error('Unlock file error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to unlock file'
    });
  }
});

/**
 * @route   POST /api/workspaces/:id/files/:fileId/execute
 * @desc    Execute file code
 * @access  Private
 */
router.post('/:id/files/:fileId/execute', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Workspace not found'
      });
    }

    if (!workspace.isMember(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this workspace'
      });
    }

    if (!workspace.settings.allowExecution) {
      return res.status(403).json({
        error: 'Execution disabled',
        message: 'Code execution is disabled for this workspace'
      });
    }

    const file = workspace.files.id(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({
        error: 'Not found',
        message: 'File not found'
      });
    }

    // Add to execution queue
    const io = req.app.get('io');
    executionQueue.push({
      workspaceId: req.params.id,
      fileId: req.params.fileId,
      code: file.content,
      language: file.language,
      userId: req.user._id,
      io
    });

    // Process queue
    processExecutionQueue();

    res.json({
      message: 'Code execution queued successfully'
    });

  } catch (error) {
    console.error('Execute code error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to execute code'
    });
  }
});

module.exports = router;