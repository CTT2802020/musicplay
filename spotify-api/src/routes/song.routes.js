const express = require('express');
const { getSongs, getSong, searchSongs, playSong, getPopularSongs, getRecentSongs, getSongsByGenre } = require('../controllers/song.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all songs with pagination and filtering
router.get('/', getSongs);

// Get popular songs
router.get('/popular', getPopularSongs);

// Get recent songs  
router.get('/recent', getRecentSongs);

// Search songs
router.get('/search', searchSongs);

// Get songs by genre
router.get('/genre/:genre', getSongsByGenre);

// Get single song
router.get('/:id', getSong);

// Play song - increment play count (public)
router.post('/:id/play', playSong);

module.exports = router; 