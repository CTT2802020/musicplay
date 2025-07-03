const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    coverImage: {
      type: String,
      default: 'default-playlist.jpg'
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    songs: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Song'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Middleware to populate songs when finding a playlist
PlaylistSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'songs',
    select: 'title artist coverImage duration'
  });
  next();
});

// Virtual for song count
PlaylistSchema.virtual('songCount').get(function() {
  return this.songs.length;
});

// Virtual for total duration
PlaylistSchema.virtual('totalDuration').get(function() {
  if (!this.songs || this.songs.length === 0) {
    return 0;
  }
  
  return this.songs.reduce((total, song) => {
    return total + (song.duration || 0);
  }, 0);
});

module.exports = mongoose.model('Playlist', PlaylistSchema); 