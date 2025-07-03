const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user listening history
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: [],
    message: 'History feature coming soon'
  });
});

module.exports = router; 