const express = require('express');
const { check } = require('express-validator');
const { createPlaylist, getPlaylists, getMyPlaylists, getPlaylist, updatePlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist } = require('../controllers/playlist.controller');
const { protect } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const Playlist = require('../models/Playlist');

const router = express.Router();

// Get all public playlists
router.get('/', getPlaylists);

// Get user's playlists
router.get('/me', protect, getMyPlaylists);

// Get single playlist (public or if owned)
router.get('/:id', getPlaylist);

// Create new playlist (protected)
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty()
  ],
  protect,
  createPlaylist
);

// Update playlist (protected)
router.put(
  '/:id',
  [
    check('name', 'Name is required if provided').optional()
  ],
  protect,
  updatePlaylist
);

// Delete playlist (protected)
router.delete('/:id', protect, deletePlaylist);

// Add song to playlist (protected)
router.post(
  '/:id/songs',
  [
    check('songId', 'Song ID is required').not().isEmpty()
  ],
  protect,
  addSongToPlaylist
);

// Remove song from playlist (protected)
router.delete('/:id/songs/:songId', protect, removeSongFromPlaylist);

// Upload playlist cover image (protected)
router.post(
  '/:id/cover',
  protect,
  imageUpload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please upload an image file'
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
          error: 'Not authorized to update this playlist'
        });
      }
      
      // Update cover image
      playlist.coverImage = req.file.filename;
      await playlist.save();
      
      res.status(200).json({
        success: true,
        data: {
          coverImage: playlist.coverImage
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
);

module.exports = router;