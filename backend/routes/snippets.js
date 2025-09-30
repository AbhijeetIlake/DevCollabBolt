/**
 * Snippet Routes
 * Handles CRUD operations for code snippets
 */

const express = require('express');
const Snippet = require('../models/Snippet');

const router = express.Router();

/**
 * @route   GET /api/snippets
 * @desc    Get all snippets for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, language, isPublic } = req.query;
    
    // Build query
    const query = { author: req.user._id };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (language) {
      query.language = language;
    }
    
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const snippets = await Snippet.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Snippet.countDocuments(query);

    res.json({
      snippets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch snippets'
    });
  }
});

/**
 * @route   POST /api/snippets
 * @desc    Create a new snippet
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, content, language, isPublic, tags } = req.body;

    // Validation
    if (!title || !content || !language) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title, content, and language are required'
      });
    }

    const snippet = new Snippet({
      title,
      description,
      content,
      language,
      isPublic: isPublic || false,
      author: req.user._id,
      tags: tags || []
    });

    // Add initial version
    snippet.addVersion(content);

    await snippet.save();
    await snippet.populate('author', 'username');

    res.status(201).json({
      message: 'Snippet created successfully',
      snippet
    });

  } catch (error) {
    console.error('Create snippet error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create snippet'
    });
  }
});

/**
 * @route   GET /api/snippets/:id
 * @desc    Get a specific snippet
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      $or: [
        { author: req.user._id },
        { isPublic: true }
      ]
    }).populate('author', 'username');

    if (!snippet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Snippet not found or access denied'
      });
    }

    // Increment view count if not the author
    if (snippet.author._id.toString() !== req.user._id.toString()) {
      snippet.views += 1;
      await snippet.save();
    }

    res.json({ snippet });

  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch snippet'
    });
  }
});

/**
 * @route   PUT /api/snippets/:id
 * @desc    Update a snippet
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, content, language, isPublic, tags } = req.body;

    const snippet = await Snippet.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!snippet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Snippet not found or access denied'
      });
    }

    // Update fields
    if (title) snippet.title = title;
    if (description !== undefined) snippet.description = description;
    if (language) snippet.language = language;
    if (isPublic !== undefined) snippet.isPublic = isPublic;
    if (tags) snippet.tags = tags;

    // Add new version if content changed
    if (content && content !== snippet.content) {
      snippet.addVersion(content);
    }

    await snippet.save();
    await snippet.populate('author', 'username');

    res.json({
      message: 'Snippet updated successfully',
      snippet
    });

  } catch (error) {
    console.error('Update snippet error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update snippet'
    });
  }
});

/**
 * @route   DELETE /api/snippets/:id
 * @desc    Delete a snippet
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });

    if (!snippet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Snippet not found or access denied'
      });
    }

    res.json({
      message: 'Snippet deleted successfully'
    });

  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete snippet'
    });
  }
});

/**
 * @route   POST /api/snippets/:id/share
 * @desc    Generate a share link for a snippet
 * @access  Private
 */
router.post('/:id/share', async (req, res) => {
  try {
    const { expirationHours = 24 } = req.body;

    const snippet = await Snippet.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!snippet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Snippet not found or access denied'
      });
    }

    snippet.generateShareLink(expirationHours);
    await snippet.save();

    res.json({
      message: 'Share link generated successfully',
      shareId: snippet.shareId,
      expiresAt: snippet.shareExpiresAt
    });

  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to generate share link'
    });
  }
});

/**
 * @route   GET /api/snippets/share/:shareId
 * @desc    Get a shared snippet
 * @access  Public
 */
router.get('/share/:shareId', async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      shareId: req.params.shareId
    }).populate('author', 'username');

    if (!snippet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Shared snippet not found'
      });
    }

    if (!snippet.isShareLinkValid()) {
      return res.status(410).json({
        error: 'Link expired',
        message: 'This share link has expired'
      });
    }

    // Increment view count
    snippet.views += 1;
    await snippet.save();

    res.json({ snippet });

  } catch (error) {
    console.error('Get shared snippet error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch shared snippet'
    });
  }
});

/**
 * @route   POST /api/snippets/:id/restore/:versionIndex
 * @desc    Restore a previous version of a snippet
 * @access  Private
 */
router.post('/:id/restore/:versionIndex', async (req, res) => {
  try {
    const versionIndex = parseInt(req.params.versionIndex);

    const snippet = await Snippet.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!snippet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Snippet not found or access denied'
      });
    }

    const restored = snippet.restoreVersion(versionIndex);
    
    if (!restored) {
      return res.status(400).json({
        error: 'Invalid version',
        message: 'Version index is invalid'
      });
    }

    await snippet.save();
    await snippet.populate('author', 'username');

    res.json({
      message: 'Version restored successfully',
      snippet
    });

  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to restore version'
    });
  }
});

module.exports = router;