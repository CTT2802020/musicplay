const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from config.env file
dotenv.config({ path: './config.env' });

// Database connection
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, '../uploads');
const songsDir = path.join(uploadsDir, 'songs');
const imagesDir = path.join(uploadsDir, 'images');
const tempDir = path.join(__dirname, '../temp');

[uploadsDir, songsDir, imagesDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve MP3 files from frontend public directory
const mp3Path = '/Users/caotien/MUSICTEST/spotify-clone/public/mp3';
console.log('🎵 Serving MP3 files from:', mp3Path);
app.use('/mp3', express.static(mp3Path));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (req.method === 'POST' && req.files) {
    console.log('Files:', Object.keys(req.files));
  }
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'Audio Metadata Extraction',
      'Waveform Generation', 
      'Genre Detection',
      'Cloud Storage (Cloudinary)',
      'Background Processing'
    ]
  });
});

// API Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/songs', require('./routes/song.routes'));
app.use('/api/v1/upload', require('./routes/upload.routes'));
app.use('/api/v1/stream', require('./routes/stream.routes'));
app.use('/api/v1/playlists', require('./routes/playlist.routes'));
app.use('/api/v1/history', require('./routes/history.routes'));

// API documentation route
app.get('/api/v1/docs', (req, res) => {
  res.json({
    title: 'Spotify Clone API',
    version: '1.0.0',
    description: 'Advanced music upload and streaming API with metadata extraction, waveform generation, and genre detection',
    endpoints: {
      auth: {
        'POST /api/v1/auth/register': 'Register new user',
        'POST /api/v1/auth/login': 'Login user',
        'GET /api/v1/auth/me': 'Get current user'
      },
      upload: {
        'POST /api/v1/upload/song': 'Upload song with advanced processing',
        'GET /api/v1/upload/my-songs': 'Get user uploaded songs',
        'GET /api/v1/upload/song/:id/status': 'Get processing status',
        'GET /api/v1/upload/song/:id/waveform': 'Get waveform data',
        'PUT /api/v1/upload/song/:id': 'Update song metadata',
        'DELETE /api/v1/upload/song/:id': 'Delete song'
      },
      songs: {
        'GET /api/v1/songs': 'Get all songs',
        'GET /api/v1/songs/:id': 'Get song by ID',
        'GET /api/v1/songs/search': 'Search songs',
        'GET /api/v1/songs/popular': 'Get popular songs',
        'GET /api/v1/songs/recent': 'Get recent songs',
        'GET /api/v1/songs/genre/:genre': 'Get songs by genre'
      },
      stream: {
        'GET /api/v1/stream/:id': 'Stream audio file',
        'POST /api/v1/stream/:id/play': 'Track play event'
      },
      playlists: {
        'GET /api/v1/playlists': 'Get user playlists',
        'POST /api/v1/playlists': 'Create playlist',
        'PUT /api/v1/playlists/:id': 'Update playlist',
        'DELETE /api/v1/playlists/:id': 'Delete playlist'
      }
    },
    features: {
      audio_processing: {
        metadata_extraction: 'Extract comprehensive metadata from audio files',
        waveform_generation: 'Generate waveform data for visualization',
        genre_detection: 'Automatic genre detection based on audio characteristics',
        cover_art_extraction: 'Extract embedded cover art from audio files',
        audio_analysis: 'Analyze tempo, key, loudness, energy, and other features'
      },
      cloud_storage: {
        cloudinary_integration: 'Upload to Cloudinary with automatic optimization',
        automatic_transcoding: 'Convert audio to optimized formats',
        cdn_delivery: 'Fast global content delivery'
      },
      background_processing: {
        async_upload: 'Immediate response with background processing',
        status_tracking: 'Real-time processing status updates',
        error_handling: 'Comprehensive error reporting and recovery'
      }
    }
  });
});

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    suggestion: 'Visit /api/v1/docs for available endpoints'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File quá lớn. Giới hạn: 50MB cho audio, 10MB cho hình ảnh'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Loại file không được hỗ trợ'
    });
  }
  
  // MongoDB errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: messages
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đã tồn tại'
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: 'Lỗi server',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(`
🎵 Spotify Clone API Server Running 🎵
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server: http://localhost:${PORT}
📖 Docs: http://localhost:${PORT}/api/v1/docs
💾 Environment: ${process.env.NODE_ENV || 'development'}
🌐 CORS: ${process.env.FRONTEND_URL || 'http://localhost:3000'}

Features:
✅ Audio Metadata Extraction
✅ Waveform Generation
✅ Genre Detection
✅ Cloud Storage (Cloudinary)
✅ Background Processing
✅ Real-time Status Updates

Ready to accept music uploads! 🎶
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = app; 