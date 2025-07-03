const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
      index: true
    },
    artist: {
      type: String,
      required: [true, 'Please add an artist'],
      trim: true,
      index: true
    },
    album: {
      type: String,
      trim: true,
      default: 'Single',
      index: true
    },
    genre: {
      type: String,
      trim: true,
      default: 'Other',
      index: true
    },
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    audioUrl: {
      type: String,
      required: function() {
        return this.processingStatus === 'completed';
      }
    },
    audioPublicId: {
      type: String,
      required: function() {
        return this.processingStatus === 'completed';
      }
    },
    coverImageUrl: {
      type: String,
      default: ''
    },
    coverImagePublicId: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 0 // Duration in seconds
    },
    fileSize: {
      type: Number,
      default: 0 // Size in bytes
    },
    format: {
      type: String,
      default: 'mp3'
    },
    bitrate: Number, // kbps
    sampleRate: Number, // Hz
    channels: Number, // 1 for mono, 2 for stereo
    embeddedMetadata: {
      title: String,
      artist: String,
      album: String,
      genre: String,
      year: Number,
      track: {
        no: Number,
        of: Number
      },
      albumArtist: String,
      composer: String,
      comment: String
    },
    waveform: {
      peaks: [Number], // Array of peak values for waveform visualization
      length: Number,   // Number of samples
      sampleRate: Number // Samples per second for the waveform
    },
    autoGenre: {
      detected: String,
      confidence: Number, // 0-1
      alternatives: [{
        genre: String,
        confidence: Number
      }]
    },
    audioFeatures: {
      tempo: Number, // BPM
      key: String,   // Musical key
      loudness: Number, // dB
      energy: Number,   // 0-1
      valence: Number,  // 0-1 (mood)
      acousticness: Number, // 0-1
      instrumentalness: Number, // 0-1
      liveness: Number, // 0-1
      speechiness: Number, // 0-1
      danceability: Number // 0-1
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lyrics: {
      type: String,
      default: ''
    },
    tags: [String],
    mood: [String],
    playCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    processingError: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for searching
SongSchema.index({ title: 'text', artist: 'text', album: 'text' });
SongSchema.index({ genre: 1, year: 1 });
SongSchema.index({ uploadedBy: 1, createdAt: -1 });
SongSchema.index({ isPublic: 1, isActive: 1 });
SongSchema.index({ 'autoGenre.detected': 1 });
SongSchema.index({ duration: 1 });
SongSchema.index({ playCount: -1 });

// Pagination will be handled in controllers

// Pre-save middleware
SongSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.uploadedBy && !this.uploader) {
    this.uploader = this.uploadedBy;
  }
  next();
});

// Cascade delete related resources when a song is deleted
SongSchema.pre('remove', async function(next) {
  // Remove song from all playlists
  await this.model('Playlist').updateMany(
    { songs: this._id },
    { $pull: { songs: this._id } }
  );
  
  // Remove related listening history
  await this.model('History').deleteMany({ song: this._id });
  
  next();
});

// Virtual to get url for streaming
SongSchema.virtual('streamUrl').get(function() {
  return this.audioUrl || `/api/v1/stream/${this._id}`;
});

// Virtual để lấy cover image URL
SongSchema.virtual('coverUrl').get(function() {
  return this.coverImageUrl || this.coverImage || 'default-cover.jpg';
});

// Virtual để format duration
SongSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for file size in human readable format
SongSchema.virtual('formattedFileSize').get(function() {
  if (!this.fileSize) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Methods
SongSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

SongSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Static methods
SongSchema.statics.findByGenre = function(genre) {
  return this.find({ 
    $or: [
      { genre: new RegExp(genre, 'i') },
      { 'autoGenre.detected': new RegExp(genre, 'i') }
    ],
    isActive: true,
    isPublic: true 
  });
};

SongSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true, isPublic: true })
    .sort({ playCount: -1, likes: -1 })
    .limit(limit);
};

SongSchema.statics.findRecent = function(limit = 10) {
  return this.find({ isActive: true, isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Song', SongSchema); 