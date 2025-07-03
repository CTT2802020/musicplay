const express = require('express');
const { getStreamSong, trackPlayEvent } = require('../controllers/stream.controller');

const router = express.Router();

// Stream audio file
router.get('/:id', getStreamSong);

// Track play event
router.post('/:id/play', trackPlayEvent);

module.exports = router; 