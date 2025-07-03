const { validationResult } = require('express-validator');
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

/**
 * @desc    Create new playlist
 * @route   POST /api/v1/playlists
 * @access  Private
 */
exports.createPlaylist = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Create playlist
    const playlist = await Playlist.create({
      name: req.body.name,
      description: req.body.description,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      coverImage: req.body.coverImage || 'default-playlist.jpg',
      user: req.user.id,
      songs: []
    });

    res.status(201).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get all public playlists
 * @route   GET /api/v1/playlists
 * @access  Public
 */
exports.getPlaylists = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Find public playlists
    const query = { isPublic: true };
    
    const total = await Playlist.countDocuments(query);

    // Query
    const playlists = await Playlist.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: playlists.length,
      pagination,
      data: playlists
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get user playlists
 * @route   GET /api/v1/playlists/me
 * @access  Private
 */
exports.getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get single playlist
 * @route   GET /api/v1/playlists/:id
 * @access  Public/Private (depends on playlist visibility)
 */
exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('user', 'name')
      .populate({
        path: 'songs',
        select: 'title artist album coverImage duration playCount'
      });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check if playlist is private and not owned by current user
    if (!playlist.isPublic && 
        (!req.user || playlist.user._id.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this playlist'
      });
    }

    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update playlist
 * @route   PUT /api/v1/playlists/:id
 * @access  Private
 */
exports.updatePlaylist = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this playlist'
      });
    }

    // Fields to update
    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.description !== undefined) fieldsToUpdate.description = req.body.description;
    if (req.body.isPublic !== undefined) fieldsToUpdate.isPublic = req.body.isPublic;
    if (req.body.coverImage) fieldsToUpdate.coverImage = req.body.coverImage;

    // Update playlist
    playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Delete playlist
 * @route   DELETE /api/v1/playlists/:id
 * @access  Private
 */
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this playlist'
      });
    }

    await playlist.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Add song to playlist
 * @route   POST /api/v1/playlists/:id/songs
 * @access  Private
 */
exports.addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a song ID'
      });
    }
    
    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }
    
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }
    
    // Check ownership
    if (playlist.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this playlist'
      });
    }
    
    // Check if song is already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({
        success: false,
        error: 'Song already in playlist'
      });
    }
    
    // Add song to playlist
    playlist.songs.push(songId);
    await playlist.save();
    
    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Remove song from playlist
 * @route   DELETE /api/v1/playlists/:id/songs/:songId
 * @access  Private
 */
exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }
    
    // Check ownership
    if (playlist.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this playlist'
      });
    }
    
    // Check if song is in playlist
    const songIndex = playlist.songs.indexOf(req.params.songId);
    if (songIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Song not found in playlist'
      });
    }
    
    // Remove song from playlist
    playlist.songs.splice(songIndex, 1);
    await playlist.save();
    
    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 