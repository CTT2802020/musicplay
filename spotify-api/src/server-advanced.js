const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { 
  extractAudioMetadata, 
  generateWaveform, 
  analyzeAudioFeatures, 
  detectGenre,
  saveEmbeddedCoverArt
} = require('./utils/audioUtils');

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
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

// In-memory storage for demo
let songs = [];
let songIdCounter = 1;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'audio') {
      cb(null, songsDir);
    } else if (file.fieldname === 'coverImage') {
      cb(null, imagesDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  console.log('File filter check:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });
  
  if (file.fieldname === 'audio') {
    // Accept audio files and some common MIME types that might be misdetected
    const audioMimeTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/flac',
      'audio/x-mpeg', 'audio/mp4', 'audio/x-m4a'
    ];
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.flac'];
    
    const isAudioMime = file.mimetype.startsWith('audio/') || audioMimeTypes.includes(file.mimetype);
    const isAudioExt = audioExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (isAudioMime || isAudioExt) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  } else if (file.fieldname === 'coverImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  } else {
    cb(new Error('Unexpected field name!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
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
      'Background Processing',
      'Cover Art Extraction'
    ]
  });
});

// API documentation route
app.get('/api/v1/docs', (req, res) => {
  res.json({
    title: 'Advanced Spotify Clone API',
    version: '1.0.0',
    description: 'Advanced music upload and streaming API with metadata extraction, waveform generation, and genre detection',
    endpoints: {
      upload: {
        'POST /api/v1/upload/song': 'Upload song with advanced processing',
        'GET /api/v1/upload/my-songs': 'Get uploaded songs',
        'GET /api/v1/upload/song/:id/status': 'Get processing status',
        'GET /api/v1/upload/song/:id/waveform': 'Get waveform data',
        'DELETE /api/v1/upload/song/:id': 'Delete song'
      },
      songs: {
        'GET /api/v1/songs': 'Get all songs',
        'GET /api/v1/songs/:id': 'Get song by ID'
      }
    }
  });
});

// Upload song with advanced processing
app.post('/api/v1/upload/song', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, artist, album, genre, year, lyrics } = req.body;
    const audioFile = req.files?.audio?.[0];
    const coverImageFile = req.files?.coverImage?.[0];

    console.log('=== UPLOAD SONG START ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    // Validation
    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: 'File nhạc là bắt buộc'
      });
    }

    if (!title || !artist) {
      return res.status(400).json({
        success: false,
        message: 'Tên bài hát và nghệ sĩ là bắt buộc'
      });
    }

    // Create initial song record
    const songId = songIdCounter++;
    const song = {
      id: songId,
      title: title.trim(),
      artist: artist.trim(),
      album: album?.trim() || 'Single',
      genre: genre?.trim() || 'Unknown',
      year: year ? parseInt(year) : null,
      lyrics: lyrics?.trim() || '',
      filename: audioFile.filename,
      originalName: audioFile.originalname,
      audioPath: audioFile.path,
      coverImagePath: coverImageFile?.path,
      processingStatus: 'processing',
      uploadedAt: new Date().toISOString()
    };

    songs.push(song);

    // Start background processing
    processAudioFile(songId, audioFile, coverImageFile)
      .catch(error => {
        console.error('Background processing error:', error);
        updateSongProcessingStatus(songId, 'failed', error.message);
      });

    // Return immediate response
    res.status(201).json({
      success: true,
      message: 'Upload thành công! Đang xử lý file...',
      data: {
        songId,
        status: 'processing',
        title: song.title,
        artist: song.artist
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded files on error
    if (req.files?.audio?.[0] && fs.existsSync(req.files.audio[0].path)) {
      fs.unlinkSync(req.files.audio[0].path);
    }
    if (req.files?.coverImage?.[0] && fs.existsSync(req.files.coverImage[0].path)) {
      fs.unlinkSync(req.files.coverImage[0].path);
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload',
      error: error.message
    });
  }
});

// Background processing function
const processAudioFile = async (songId, audioFile, coverImageFile) => {
  console.log(`=== PROCESSING AUDIO FILE FOR SONG ${songId} ===`);
  
  try {
    const audioPath = audioFile.path;
    const song = songs.find(s => s.id === songId);
    if (!song) throw new Error('Song not found');

    // Step 1: Extract comprehensive metadata
    console.log('Extracting metadata...');
    const metadata = await extractAudioMetadata(audioPath);
    console.log('Metadata extracted:', {
      duration: metadata.duration,
      format: metadata.format,
      bitrate: metadata.bitrate,
      embeddedTitle: metadata.embeddedMetadata.title
    });

    // Step 2: Save embedded cover art if no cover image provided
    let embeddedCoverPath = null;
    if (!coverImageFile && metadata.coverArt) {
      console.log('Saving embedded cover art...');
      const embeddedCoverFilename = await saveEmbeddedCoverArt(metadata.coverArt, imagesDir);
      if (embeddedCoverFilename) {
        embeddedCoverPath = path.join(imagesDir, embeddedCoverFilename);
        console.log('Embedded cover saved:', embeddedCoverFilename);
      }
    }

    // Step 3: Generate waveform data
    console.log('Generating waveform...');
    const waveformData = await generateWaveform(audioPath, { samples: 1000 });
    console.log('Waveform generated with', waveformData.peaks.length, 'peaks');

    // Step 4: Analyze audio features
    console.log('Analyzing audio features...');
    const audioFeatures = await analyzeAudioFeatures(audioPath);
    console.log('Audio features:', { tempo: audioFeatures.tempo, key: audioFeatures.key });

    // Step 5: Detect genre
    console.log('Detecting genre...');
    const genreDetection = await detectGenre(audioPath, metadata);
    console.log('Genre detection:', genreDetection);

    // Step 6: Update song with all processed data
    console.log('Updating song record...');
    Object.assign(song, {
      // Metadata
      duration: metadata.duration,
      fileSize: metadata.fileSize,
      format: metadata.format,
      bitrate: metadata.bitrate,
      sampleRate: metadata.sampleRate,
      channels: metadata.channels,
      embeddedMetadata: metadata.embeddedMetadata,
      
      // Generated data
      waveform: waveformData,
      audioFeatures: audioFeatures,
      autoGenre: genreDetection,
      
      // Paths
      audioUrl: `/uploads/songs/${audioFile.filename}`,
      coverImageUrl: coverImageFile 
        ? `/uploads/images/${coverImageFile.filename}`
        : embeddedCoverPath 
        ? `/uploads/images/${path.basename(embeddedCoverPath)}`
        : null,
      
      // Processing status
      processingStatus: 'completed',
      processingError: null,
      processedAt: new Date().toISOString()
    });

    console.log(`=== PROCESSING COMPLETED FOR SONG ${songId} ===`);

  } catch (error) {
    console.error(`Processing failed for song ${songId}:`, error);
    updateSongProcessingStatus(songId, 'failed', error.message);
    throw error;
  }
};

// Helper function to update processing status
const updateSongProcessingStatus = (songId, status, error = null) => {
  const song = songs.find(s => s.id === songId);
  if (song) {
    song.processingStatus = status;
    song.processingError = error;
  }
};

// Get processing status
app.get('/api/v1/upload/song/:id/status', (req, res) => {
  const songId = parseInt(req.params.id);
  const song = songs.find(s => s.id === songId);

  if (!song) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài hát'
    });
  }

  res.json({
    success: true,
    data: {
      songId: song.id,
      title: song.title,
      artist: song.artist,
      processingStatus: song.processingStatus,
      processingError: song.processingError,
      isCompleted: song.processingStatus === 'completed',
      hasWaveform: !!song.waveform?.peaks?.length,
      detectedGenre: song.autoGenre?.detected,
      duration: song.duration
    }
  });
});

// Get waveform data
app.get('/api/v1/upload/song/:id/waveform', (req, res) => {
  const songId = parseInt(req.params.id);
  const song = songs.find(s => s.id === songId);

  if (!song) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài hát'
    });
  }

  if (!song.waveform?.peaks) {
    return res.status(404).json({
      success: false,
      message: 'Waveform chưa được tạo'
    });
  }

  res.json({
    success: true,
    data: {
      songId: song.id,
      title: song.title,
      artist: song.artist,
      waveform: song.waveform
    }
  });
});

// Get uploaded songs
app.get('/api/v1/upload/my-songs', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const paginatedSongs = songs.slice(skip, skip + limit);
  const totalSongs = songs.length;
  const totalPages = Math.ceil(totalSongs / limit);

  // Add processing status info
  const songsWithStatus = paginatedSongs.map(song => ({
    ...song,
    isProcessing: song.processingStatus === 'processing',
    processingFailed: song.processingStatus === 'failed',
    hasWaveform: !!song.waveform?.peaks?.length,
    hasAutoGenre: !!song.autoGenre?.detected,
    formattedDuration: song.duration ? formatDuration(song.duration) : '0:00',
    formattedFileSize: song.fileSize ? formatFileSize(song.fileSize) : 'Unknown'
  }));

  res.json({
    success: true,
    count: paginatedSongs.length,
    data: {
      songs: songsWithStatus,
      pagination: {
        currentPage: page,
        totalPages,
        totalSongs,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
});

// Get all songs
app.get('/api/v1/songs', (req, res) => {
  const completedSongs = songs.filter(s => s.processingStatus === 'completed');
  
  res.json({
    success: true,
    count: completedSongs.length,
    data: completedSongs.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      genre: song.genre || song.autoGenre?.detected || 'Unknown',
      duration: song.duration,
      audioUrl: song.audioUrl,
      coverImageUrl: song.coverImageUrl,
      uploadedAt: song.uploadedAt
    }))
  });
});

// Get single song
app.get('/api/v1/songs/:id', (req, res) => {
  const songId = parseInt(req.params.id);
  const song = songs.find(s => s.id === songId);

  if (!song) {
    return res.status(404).json({
      success: false,
      message: 'Song not found'
    });
  }

  res.json({
    success: true,
    data: song
  });
});

// Delete song
app.delete('/api/v1/upload/song/:id', (req, res) => {
  const songId = parseInt(req.params.id);
  const songIndex = songs.findIndex(s => s.id === songId);

  if (songIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài hát'
    });
  }

  const song = songs[songIndex];

  // Delete files
  try {
    if (song.audioPath && fs.existsSync(song.audioPath)) {
      fs.unlinkSync(song.audioPath);
    }
    if (song.coverImagePath && fs.existsSync(song.coverImagePath)) {
      fs.unlinkSync(song.coverImagePath);
    }
  } catch (error) {
    console.error('Error deleting files:', error);
  }

  // Remove from memory
  songs.splice(songIndex, 1);

  res.json({
    success: true,
    message: 'Đã xóa bài hát thành công'
  });
});

// Utility functions
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File quá lớn. Giới hạn: 50MB'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Loại file không được hỗ trợ'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Lỗi server',
    error: error.message
  });
});

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    suggestion: 'Visit /api/v1/docs for available endpoints'
  });
});

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(`
🎵 Advanced Spotify Clone API Server Running 🎵
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server: http://localhost:${PORT}
📖 Docs: http://localhost:${PORT}/api/v1/docs
💾 Storage: In-Memory (Demo Mode)
🌐 CORS: http://localhost:3000

✅ Advanced Features:
✅ Audio Metadata Extraction (duration, bitrate, format)
✅ Waveform Generation (1000 data points)
✅ Embedded Cover Art Extraction
✅ Auto Genre Detection
✅ Audio Features Analysis (tempo, key, energy)
✅ Background Processing
✅ Real-time Status Updates

Ready to accept music uploads with full analysis! 🎶
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = app; 