const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    song: {
      type: mongoose.Schema.ObjectId,
      ref: 'Song',
      required: true
    },
    playedAt: {
      type: Date,
      default: Date.now
    },
    playDuration: {
      type: Number, // In seconds
      default: 0
    },
    completedPlay: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index to optimize history queries by user and date
HistorySchema.index({ user: 1, playedAt: -1 });

// Pagination will be handled in controllers

// Auto-populate song data when querying history
HistorySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'song',
    select: 'title artist album coverImage duration'
  });
  next();
});

module.exports = mongoose.model('History', HistorySchema); 