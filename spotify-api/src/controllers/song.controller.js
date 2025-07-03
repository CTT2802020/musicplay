const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const Song = require('../models/Song');
const History = require('../models/History');
const { getAudioDurationInSeconds } = require('../utils/audioUtils');

/**
 * @desc    Upload song
 * @route   POST /api/v1/songs/upload
 * @access  Private
 */
exports.uploadSong = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please upload an audio file' 
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Get audio duration
    let duration = 0;
    try {
      duration = await getAudioDurationInSeconds(req.file.path);
    } catch (err) {
      console.error('Error getting audio duration:', err);
    }
    
    // Create song in database
    const song = await Song.create({
      title: req.body.title,
      artist: req.body.artist,
      album: req.body.album || 'Single',
      genre: req.body.genre,
      releaseYear: req.body.releaseYear,
      coverImage: req.body.coverImage || 'default-cover.jpg',
      filePath: req.file.path,
      duration,
      uploader: req.user.id
    });

    res.status(201).json({
      success: true,
      data: song
    });
  } catch (err) {
    console.error(err);
    // Remove uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get all songs with pagination and filtering
 * @route   GET /api/v1/songs
 * @access  Public
 */
exports.getSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isPublic: true, isActive: true };
    
    if (req.query.genre) {
      filter.genre = { $regex: req.query.genre, $options: 'i' };
    }
    
    if (req.query.artist) {
      filter.artist = { $regex: req.query.artist, $options: 'i' };
    }

    const songs = await Song.find(filter)
      .select('title artist album genre duration audioUrl coverImageUrl coverUrl streamUrl playCount createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name email');

    const totalSongs = await Song.countDocuments(filter);

    res.json({
      success: true,
      count: songs.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSongs / limit),
        totalSongs,
        hasNext: page < Math.ceil(totalSongs / limit),
        hasPrev: page > 1
      },
      data: songs
    });

  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * @desc    Get single song
 * @route   GET /api/v1/songs/:id
 * @access  Public
 */
exports.getSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('uploader', 'name email'); // Legacy support

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Check if song is public or user is owner
    if (!song.isPublic && (!req.user || song.uploadedBy.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Song is private'
      });
    }

    res.json({
      success: true,
      data: song
    });

  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * @desc    Update song
 * @route   PUT /api/v1/songs/:id
 * @access  Private
 */
exports.updateSong = async (req, res) => {
  try {
    let song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    // Make sure user owns the song or is an admin
    if (song.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this song'
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Fields that can be updated
    const fieldsToUpdate = {};
    if (req.body.title) fieldsToUpdate.title = req.body.title;
    if (req.body.artist) fieldsToUpdate.artist = req.body.artist;
    if (req.body.album) fieldsToUpdate.album = req.body.album;
    if (req.body.genre) fieldsToUpdate.genre = req.body.genre;
    if (req.body.releaseYear) fieldsToUpdate.releaseYear = req.body.releaseYear;
    if (req.body.coverImage) fieldsToUpdate.coverImage = req.body.coverImage;

    song = await Song.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: song
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
 * @desc    Delete song
 * @route   DELETE /api/v1/songs/:id
 * @access  Private
 */
exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    // Make sure user owns the song or is an admin
    if (song.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this song'
      });
    }

    // Delete the actual file
    if (fs.existsSync(song.filePath)) {
      fs.unlinkSync(song.filePath);
    }
    
    // Remove song from database
    await song.remove();

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
 * @desc    Search songs by title, artist or album
 * @route   GET /api/v1/songs/search
 * @access  Public
 */
exports.searchSongs = async (req, res) => {
  try {
    const { q, genre, limit = 20, page = 1 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;
    
    // Build search filter
    const filter = {
      isPublic: true,
      isActive: true,
      $text: { $search: q }
    };
    
    if (genre) {
      filter.genre = { $regex: genre, $options: 'i' };
    }

    const songs = await Song.find(filter)
      .select('title artist album genre duration audioUrl coverImageUrl coverUrl streamUrl playCount createdAt')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name email');

    const totalResults = await Song.countDocuments(filter);

    res.json({
      success: true,
      count: songs.length,
      totalResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / limit),
        hasNext: page < Math.ceil(totalResults / limit),
        hasPrev: page > 1
      },
      data: songs
    });

  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * @desc    Play song - increment play count
 * @route   POST /api/v1/songs/:id/play
 * @access  Public
 */
exports.playSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Check if song is public
    if (!song.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Song is private'
      });
    }

    // Increment play count
    song.playCount += 1;
    await song.save();

    // Add to user's listening history if authenticated
    if (req.user) {
      const History = require('../models/History');
      await History.create({
        user: req.user.id,
        song: song._id,
        playedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Play count updated',
      data: {
        playCount: song.playCount,
        streamUrl: song.streamUrl,
        audioUrl: song.audioUrl
      }
    });

  } catch (error) {
    console.error('Error playing song:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * @desc    Get popular songs
 * @route   GET /api/v1/songs/popular
 * @access  Public
 */
exports.getPopularSongs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const songs = await Song.find({ isPublic: true, isActive: true })
      .select('title artist album genre duration audioUrl coverImageUrl coverUrl streamUrl playCount createdAt')
      .sort({ playCount: -1, createdAt: -1 })
      .limit(limit)
      .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      count: songs.length,
      data: songs
    });

  } catch (error) {
    console.error('Error fetching popular songs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * @desc    Get recent songs
 * @route   GET /api/v1/songs/recent
 * @access  Public
 */
exports.getRecentSongs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const songs = await Song.find({ isPublic: true, isActive: true })
      .select('title artist album genre duration audioUrl coverImageUrl coverUrl streamUrl playCount createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      count: songs.length,
      data: songs
    });

  } catch (error) {
    console.error('Error fetching recent songs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * @desc    Get songs by genre
 * @route   GET /api/v1/songs/genre/:genre
 * @access  Public
 */
exports.getSongsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const songs = await Song.find({ 
      genre: { $regex: genre, $options: 'i' }, 
      isPublic: true, 
      isActive: true 
    })
      .select('title artist album genre duration audioUrl coverImageUrl coverUrl streamUrl playCount createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name email');

    const totalSongs = await Song.countDocuments({ 
      genre: { $regex: genre, $options: 'i' }, 
      isPublic: true, 
      isActive: true 
    });

    res.json({
      success: true,
      count: songs.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSongs / limit),
        totalSongs,
        hasNext: page < Math.ceil(totalSongs / limit),
        hasPrev: page > 1
      },
      data: songs
    });

  } catch (error) {
    console.error('Error fetching songs by genre:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// All functions are already exported using exports.functionName syntax above 