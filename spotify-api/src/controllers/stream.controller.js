const fs = require('fs');
const path = require('path');
const Song = require('../models/Song');

/**
 * @desc    Stream a song
 * @route   GET /api/v1/stream/:id
 * @access  Public/Private (depending on song visibility)
 */
const getStreamSong = async (req, res) => {
  try {
    const songId = req.params.id;
    
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Bài hát không tồn tại'
      });
    }

    // If cloud URL exists, redirect to it
    if (song.audioUrl) {
      return res.redirect(song.audioUrl);
    }

    // Fallback to local file
    const filePath = path.join(__dirname, '../../uploads/songs', song.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File âm thanh không tồn tại'
      });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Support range requests for streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }

  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi stream nhạc'
    });
  }
};

/**
 * @desc    Get audio metadata
 * @route   GET /api/v1/stream/:id/metadata
 * @access  Public/Private (depending on song visibility)
 */
exports.getMetadata = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploader', 'name');
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }
    
    // Return only needed metadata
    res.status(200).json({
      success: true,
      data: {
        id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        coverImage: song.coverImage,
        streamUrl: `/api/v1/stream/${song._id}`,
        uploader: song.uploader ? song.uploader.name : 'Unknown'
      }
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
 * Track play event
 * @route POST /api/v1/stream/:id/play
 * @access Public
 */
const trackPlayEvent = async (req, res) => {
  try {
    const songId = req.params.id;
    
    // Increment play count
    await Song.findByIdAndUpdate(songId, { 
      $inc: { playCount: 1 } 
    });

    res.status(200).json({
      success: true,
      message: 'Play event tracked'
    });

  } catch (error) {
    console.error('Track play error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi track play'
    });
  }
};

module.exports = {
  getStreamSong,
  trackPlayEvent
}; 