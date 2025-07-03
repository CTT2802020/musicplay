const Song = require('../models/Song');
const User = require('../models/User');
const { 
  extractAudioMetadata, 
  generateWaveform, 
  analyzeAudioFeatures, 
  detectGenre,
  saveEmbeddedCoverArt,
  createWaveformImage
} = require('../utils/audioUtils');
const { uploadAudio, uploadImage, deleteFile } = require('../utils/cloudinaryUpload');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

/**
 * Upload bài hát mới với metadata
 * @route POST /api/upload/song
 * @access Private (User/Admin)
 */
const uploadSong = async (req, res) => {
  try {
    const { title, artist, album, genre, year, lyrics, tags } = req.body;
    const audioFile = req.files?.audioFile?.[0]; // Changed from 'audio' to 'audioFile' to match middleware
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

    // Create new song with processing status
    const song = new Song({
      title: title.trim(),
      artist: artist.trim(),
      album: album?.trim() || 'Single',
      genre: genre?.trim() || 'Other',
      year: year ? parseInt(year) : null,
      lyrics: lyrics?.trim() || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      filename: audioFile.filename,
      originalName: audioFile.originalname,
      uploadedBy: req.user?.id || 'demo-user',
      processingStatus: 'processing'
    });

    // Save initial song record
    const savedSong = await song.save();
    console.log('Initial song saved with ID:', savedSong._id);

    // Set temporary audioUrl using local server URL for immediate playback
    const localAudioUrl = `http://localhost:3002/uploads/songs/${audioFile.filename}`;
    await Song.findByIdAndUpdate(savedSong._id, {
      audioUrl: localAudioUrl,
      audioPublicId: `local_${audioFile.filename}`,
      duration: 0, // Will be updated in background processing
      fileSize: audioFile.size,
      format: path.extname(audioFile.originalname).substring(1).toLowerCase(),
      processingStatus: 'processing'
    });

    console.log('Set temporary audioUrl:', localAudioUrl);

    // Start background processing
    processAudioFile(savedSong._id, audioFile, coverImageFile)
      .catch(error => {
        console.error('Background processing error:', error);
        updateSongProcessingStatus(savedSong._id, 'failed', error.message);
      });

    // Return immediate response
    res.status(201).json({
      success: true,
      message: 'Upload thành công! Đang xử lý file...',
      data: {
        songId: savedSong._id,
        status: 'processing',
        title: savedSong.title,
        artist: savedSong.artist
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded files on error
    if (req.files?.audioFile?.[0]) {
      const audioPath = req.files.audioFile[0].path;
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
    if (req.files?.coverImage?.[0]) {
      const imagePath = req.files.coverImage[0].path;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Background processing function
const processAudioFile = async (songId, audioFile, coverImageFile) => {
  console.log(`=== PROCESSING AUDIO FILE FOR SONG ${songId} ===`);
  
  try {
    const audioPath = audioFile.path;
    let coverImagePath = coverImageFile?.path;
    let embeddedCoverPath = null;

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
    if (!coverImageFile && metadata.coverArt) {
      console.log('Saving embedded cover art...');
      const coversDir = path.join(__dirname, '../../uploads/images');
      const embeddedCoverFilename = await saveEmbeddedCoverArt(metadata.coverArt, coversDir);
      if (embeddedCoverFilename) {
        embeddedCoverPath = path.join(coversDir, embeddedCoverFilename);
        console.log('Embedded cover saved:', embeddedCoverFilename);
      }
    }

    // Step 3: Generate waveform data
    console.log('Generating waveform...');
    let waveformData = null;
    try {
      waveformData = await generateWaveform(audioPath, { samples: 1000 });
      console.log('Waveform generated with', waveformData.peaks.length, 'peaks');
    } catch (waveformError) {
      console.warn('Waveform generation failed:', waveformError.message);
      // Create dummy waveform data
      waveformData = {
        peaks: Array(100).fill(0.5), // Default waveform
        length: 100,
        sampleRate: 44100
      };
    }

    // Step 4: Analyze audio features
    console.log('Analyzing audio features...');
    let audioFeatures = {};
    try {
      audioFeatures = await analyzeAudioFeatures(audioPath);
      console.log('Audio features:', { tempo: audioFeatures.tempo, key: audioFeatures.key });
    } catch (featuresError) {
      console.warn('Audio features analysis failed:', featuresError.message);
      // Use default features
      audioFeatures = {
        tempo: 120,
        key: 'C',
        loudness: -10,
        energy: 0.5,
        valence: 0.5
      };
    }

    // Step 5: Detect genre
    console.log('Detecting genre...');
    let genreDetection = {};
    try {
      genreDetection = await detectGenre(audioPath, metadata);
      console.log('Genre detection:', genreDetection);
    } catch (genreError) {
      console.warn('Genre detection failed:', genreError.message);
      // Use default genre
      genreDetection = {
        detected: 'Other',
        confidence: 0.5,
        alternatives: []
      };
    }

    // Step 6: Upload files to cloud storage
    console.log('Uploading to cloud storage...');
    
    let audioUrl, audioPublicId;
    try {
      // Upload audio file
      const audioUploadResult = await uploadAudio(audioPath, {
        folder: 'songs',
        resource_type: 'video'
      });
      console.log('Audio uploaded to:', audioUploadResult.secure_url);
      audioUrl = audioUploadResult.secure_url;
      audioPublicId = audioUploadResult.public_id;
    } catch (uploadError) {
      console.warn('Cloudinary upload failed, using local URL:', uploadError.message);
      // Fallback to local server URL
      audioUrl = `http://localhost:3002/uploads/songs/${path.basename(audioPath)}`;
      audioPublicId = `local_${path.basename(audioPath)}`;
    }

    // Upload cover image (either provided or embedded)
    let coverUploadResult = null;
    const imageToUpload = coverImagePath || embeddedCoverPath;
    if (imageToUpload) {
      try {
        coverUploadResult = await uploadImage(imageToUpload, {
          folder: 'covers',
          transformation: [{ width: 500, height: 500, crop: 'fill' }]
        });
        console.log('Cover uploaded to:', coverUploadResult?.secure_url);
      } catch (coverUploadError) {
        console.warn('Cover upload failed:', coverUploadError.message);
        // Use default cover or keep existing
      }
    }

    // Step 7: Update song with all processed data
    console.log('Updating song record...');
    const updateData = {
      // File info
      audioUrl: audioUrl,
      audioPublicId: audioPublicId,
      coverImageUrl: coverUploadResult?.secure_url || null,
      coverImagePublicId: coverUploadResult?.public_id || null,
      
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
      
      // Processing status
      processingStatus: 'completed',
      processingError: null
    };

    const updatedSong = await Song.findByIdAndUpdate(songId, updateData, { new: true });
    console.log('Song updated successfully');

    // Step 8: Clean up temporary files
    console.log('Cleaning up temporary files...');
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (coverImagePath && fs.existsSync(coverImagePath)) fs.unlinkSync(coverImagePath);
    if (embeddedCoverPath && fs.existsSync(embeddedCoverPath)) fs.unlinkSync(embeddedCoverPath);

    console.log(`=== PROCESSING COMPLETED FOR SONG ${songId} ===`);
    return updatedSong;

  } catch (error) {
    console.error(`Processing failed for song ${songId}:`, error);
    await updateSongProcessingStatus(songId, 'failed', error.message);
    throw error;
  }
};

// Helper function to update processing status
const updateSongProcessingStatus = async (songId, status, error = null) => {
  try {
    await Song.findByIdAndUpdate(songId, {
      processingStatus: status,
      processingError: error
    });
  } catch (updateError) {
    console.error('Failed to update processing status:', updateError);
  }
};

/**
 * Lấy danh sách bài hát đã upload bởi user
 * @route GET /api/upload/my-songs
 * @access Private
 */
const getMySongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user?.id || 'demo-user';

    // Get songs with full metadata
    const songs = await Song.find({ 
      uploadedBy: userId,
      isActive: true 
    })
    .select('-__v')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const totalSongs = await Song.countDocuments({ 
      uploadedBy: userId,
      isActive: true 
    });

    const totalPages = Math.ceil(totalSongs / limit);

    // Add processing status info
    const songsWithStatus = songs.map(song => ({
      ...song,
      isProcessing: song.processingStatus === 'processing',
      processingFailed: song.processingStatus === 'failed',
      hasWaveform: !!song.waveform?.peaks?.length,
      hasAutoGenre: !!song.autoGenre?.detected
    }));

    res.status(200).json({
      success: true,
      count: songs.length,
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

  } catch (error) {
    console.error('Get my songs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài hát',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Xóa bài hát (và files trên Cloudinary)
 * @route DELETE /api/upload/song/:id
 * @access Private
 */
const deleteSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user?.id || 'demo-user';

    const song = await Song.findOne({
      _id: songId,
      uploadedBy: userId
    });

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát hoặc bạn không có quyền xóa'
      });
    }

    // Delete files from cloud storage
    try {
      if (song.audioPublicId) {
        await deleteFile(song.audioPublicId, 'video');
      }
      if (song.coverImagePublicId) {
        await deleteFile(song.coverImagePublicId, 'image');
      }
    } catch (cloudError) {
      console.error('Error deleting from cloud:', cloudError);
      // Continue with database deletion even if cloud deletion fails
    }

    // Soft delete - mark as inactive
    await Song.findByIdAndUpdate(songId, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Đã xóa bài hát thành công'
    });

  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bài hát'
    });
  }
};

/**
 * Cập nhật metadata bài hát
 * @route PUT /api/upload/song/:id
 * @access Private
 */
const updateSongMetadata = async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user?.id || 'demo-user';
    const { title, artist, album, genre, year, lyrics, tags } = req.body;

    const song = await Song.findOne({
      _id: songId,
      uploadedBy: userId
    });

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát hoặc bạn không có quyền chỉnh sửa'
      });
    }

    // Update fields
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (artist) updateData.artist = artist.trim();
    if (album) updateData.album = album.trim();
    if (genre) updateData.genre = genre.trim();
    if (year) updateData.year = parseInt(year);
    if (lyrics !== undefined) updateData.lyrics = lyrics.trim();
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());

    const updatedSong = await Song.findByIdAndUpdate(
      songId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin bài hát thành công',
      data: updatedSong
    });

  } catch (error) {
    console.error('Update song error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật bài hát'
    });
  }
};

/**
 * Lấy trạng thái xử lý bài hát
 * @route GET /api/upload/song/:id/status
 * @access Private
 */
const getSongStatus = async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user?.id || 'demo-user';

    const song = await Song.findOne({
      _id: songId,
      uploadedBy: userId
    }).select('processingStatus processingError title artist createdAt');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        songId: song._id,
        title: song.title,
        artist: song.artist,
        status: song.processingStatus,
        error: song.processingError,
        createdAt: song.createdAt
      }
    });

  } catch (error) {
    console.error('Get song status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy trạng thái bài hát'
    });
  }
};

/**
 * Lấy dữ liệu waveform của bài hát
 * @route GET /api/upload/song/:id/waveform
 * @access Public
 */
const getSongWaveform = async (req, res) => {
  try {
    const songId = req.params.id;

    const song = await Song.findById(songId)
      .select('waveform title artist processingStatus');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát'
      });
    }

    if (song.processingStatus !== 'completed' || !song.waveform) {
      return res.status(400).json({
        success: false,
        message: 'Waveform chưa được tạo hoặc đang xử lý'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        songId: song._id,
        title: song.title,
        artist: song.artist,
        waveform: song.waveform
      }
    });

  } catch (error) {
    console.error('Get waveform error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy waveform'
    });
  }
};

module.exports = {
  uploadSong,
  getMySongs,
  getSongStatus,
  getSongWaveform,
  deleteSong,
  updateSongMetadata
}; 