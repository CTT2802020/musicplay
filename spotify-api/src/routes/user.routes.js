const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const User = require('../models/User');

const router = express.Router();

// Upload user avatar (protected)
router.post(
  '/avatar',
  protect,
  imageUpload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please upload an image file'
        });
      }
      
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Update avatar
      user.avatar = req.file.filename;
      await user.save();
      
      res.status(200).json({
        success: true,
        data: {
          avatar: user.avatar
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
);

// Admin routes
// Get all users (admin only)
router.get(
  '/',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const users = await User.find().select('-password');
      
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
);

// Get single user (admin only)
router.get(
  '/:id',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
);

// Update user role (admin only)
router.put(
  '/:id/role',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Valid role is required'
        });
      }
      
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      user.role = role;
      await user.save();
      
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
);

module.exports = router; 