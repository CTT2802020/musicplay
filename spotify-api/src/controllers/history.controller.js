const History = require('../models/History');
const Song = require('../models/Song');
const mongoose = require('mongoose');

/**
 * @desc    Get user's listening history
 * @route   GET /api/v1/history
 * @access  Private
 */
exports.getHistory = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Query
    const history = await History.find({ user: req.user.id })
      .sort({ playedAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await History.countDocuments({ user: req.user.id });

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: history.length,
      pagination,
      data: history
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
 * @desc    Get user's recently played songs
 * @route   GET /api/v1/history/recent
 * @access  Private
 */
exports.getRecentlyPlayed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Aggregate to get unique songs ordered by most recent play
    const history = await History.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      { $sort: { playedAt: -1 } },
      {
        $group: {
          _id: '$song',
          playedAt: { $first: '$playedAt' },
          playDuration: { $first: '$playDuration' },
          completedPlay: { $first: '$completedPlay' }
        }
      },
      { $limit: limit },
      {
        $lookup: {
          from: 'songs',
          localField: '_id',
          foreignField: '_id',
          as: 'songData'
        }
      },
      { $unwind: '$songData' },
      {
        $project: {
          _id: 1,
          playedAt: 1,
          playDuration: 1,
          completedPlay: 1,
          song: '$songData'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
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
 * @desc    Get user's most played songs
 * @route   GET /api/v1/history/most-played
 * @access  Private
 */
exports.getMostPlayed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Aggregate to get play count by song
    const history = await History.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$song',
          count: { $sum: 1 },
          totalDuration: { $sum: '$playDuration' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'songs',
          localField: '_id',
          foreignField: '_id',
          as: 'songData'
        }
      },
      { $unwind: '$songData' },
      {
        $project: {
          _id: 1,
          playCount: '$count',
          totalDuration: 1,
          song: '$songData'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
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
 * @desc    Get recommended songs based on user's history
 * @route   GET /api/v1/history/recommendations
 * @access  Private
 */
exports.getRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Get most played artists from user's history
    const topArtists = await History.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      {
        $lookup: {
          from: 'songs',
          localField: 'song',
          foreignField: '_id',
          as: 'songData'
        }
      },
      { $unwind: '$songData' },
      {
        $group: {
          _id: '$songData.artist',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // No listening history
    if (topArtists.length === 0) {
      // Return random songs instead
      const randomSongs = await Song.aggregate([
        { $sample: { size: limit } }
      ]);
      
      return res.status(200).json({
        success: true,
        count: randomSongs.length,
        data: randomSongs
      });
    }
    
    // Get artists names
    const artists = topArtists.map(artist => artist._id);
    
    // Get recently played songs ids to exclude them
    const recentlyPlayedIds = await History.find({ user: req.user.id })
      .sort({ playedAt: -1 })
      .limit(20)
      .distinct('song');
    
    // Find songs by top artists that user hasn't played recently
    const recommendations = await Song.find({
      artist: { $in: artists },
      _id: { $nin: recentlyPlayedIds }
    }).limit(limit);
    
    // If not enough recommendations, add some random songs
    if (recommendations.length < limit) {
      const additionalSongs = await Song.aggregate([
        { 
          $match: { 
            _id: { 
              $nin: [...recentlyPlayedIds, ...recommendations.map(r => r._id)] 
            } 
          } 
        },
        { $sample: { size: limit - recommendations.length } }
      ]);
      
      recommendations.push(...additionalSongs);
    }
    
    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
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
 * @desc    Clear listening history
 * @route   DELETE /api/v1/history
 * @access  Private
 */
exports.clearHistory = async (req, res) => {
  try {
    await History.deleteMany({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 