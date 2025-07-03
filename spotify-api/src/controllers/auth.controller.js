const User = require('../models/User');
const { validationResult } = require('express-validator');

// In-memory storage for demo (when MongoDB is not available)
let inMemoryUsers = [];
let nextUserId = 1;

// Helper function to generate JWT manually
const generateToken = (userId) => {
  // Simple token for demo - in production use proper JWT
  return `demo-token-${userId}-${Date.now()}`;
};

/**
 * @desc    Register a user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { name, email, password } = req.body;
    
    try {
      // Try MongoDB first
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }
      
      // Create user
      const user = await User.create({
        name,
        email,
        password
      });
      
      // Generate token
      const token = user.getSignedJwtToken();
      
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (mongoError) {
      // Fallback to in-memory storage
      console.log('📝 Using in-memory storage for user registration');
      
      // Check if user exists in memory
      const existingUser = inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }
      
      // Create user in memory
      const newUser = {
        id: nextUserId++,
        name,
        email,
        password, // In production, this should be hashed
        role: 'user',
        avatar: 'default.jpg',
        createdAt: new Date()
      };
      
      inMemoryUsers.push(newUser);
      
      const token = generateToken(newUser.id);
      
      res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { email, password } = req.body;
    
    try {
      // Try MongoDB first
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Generate token
      const token = user.getSignedJwtToken();
      
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (mongoError) {
      // Fallback to in-memory storage
      console.log('📝 Using in-memory storage for user login');
      
      const user = inMemoryUsers.find(u => u.email === email);
      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      const token = generateToken(user.id);
      
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    try {
      // Try MongoDB first
      const user = await User.findById(req.user.id);
      
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      });
    } catch (mongoError) {
      // Fallback to in-memory storage
      const userId = req.user.id;
      const user = inMemoryUsers.find(u => u.id.toString() === userId.toString());
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/v1/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const fieldsToUpdate = {
      name: req.body.name
    };
    
    if (req.body.avatar) {
      fieldsToUpdate.avatar = req.body.avatar;
    }
    
    try {
      // Try MongoDB first
      const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
      });
      
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (mongoError) {
      // Fallback to in-memory storage
      const userId = req.user.id;
      const userIndex = inMemoryUsers.findIndex(u => u.id.toString() === userId.toString());
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...fieldsToUpdate };
      const user = inMemoryUsers[userIndex];
      
      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    try {
      // Try MongoDB first
      const user = await User.findById(req.user.id).select('+password');
      
      // Check current password
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
      
      user.password = newPassword;
      await user.save();
      
      // Generate token
      const token = user.getSignedJwtToken();
      
      res.status(200).json({
        success: true,
        token
      });
    } catch (mongoError) {
      // Fallback to in-memory storage
      const userId = req.user.id;
      const userIndex = inMemoryUsers.findIndex(u => u.id.toString() === userId.toString());
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      const user = inMemoryUsers[userIndex];
      if (user.password !== currentPassword) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
      
      inMemoryUsers[userIndex].password = newPassword;
      const token = generateToken(user.id);
      
      res.status(200).json({
        success: true,
        token
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 