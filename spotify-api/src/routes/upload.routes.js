const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { uploadFields, handleUploadError } = require('../middleware/uploadMusic');
const {
  uploadSong,
  getMySongs,
  getSongStatus,
  getSongWaveform,
  deleteSong,
  updateSongMetadata
} = require('../controllers/upload.controller');

const router = express.Router();

// Validation rules cho upload song
const validateUploadSong = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Tên bài hát không được để trống')
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên bài hát phải từ 1-100 ký tự'),
  
  body('artist')
    .trim()
    .notEmpty()
    .withMessage('Tên nghệ sĩ không được để trống')
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên nghệ sĩ phải từ 1-100 ký tự'),
  
  body('album')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tên album không được quá 100 ký tự'),
  
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Thể loại không được quá 50 ký tự'),
  
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Thời lượng phải là số nguyên dương'),
  
  body('lyrics')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Lời bài hát không được quá 5000 ký tự')
];

// Validation rules cho update metadata
const validateUpdateMetadata = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên bài hát phải từ 1-100 ký tự'),
  
  body('artist')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên nghệ sĩ phải từ 1-100 ký tự'),
  
  body('album')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tên album không được quá 100 ký tự'),
  
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Thể loại không được quá 50 ký tự'),
  
  body('lyrics')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Lời bài hát không được quá 5000 ký tự')
];

// Routes
router.post('/song', 
  protect, 
  uploadFields, 
  handleUploadError, 
  validateUploadSong, 
  uploadSong
);

router.get('/my-songs', protect, getMySongs);

router.get('/song/:id/status', protect, getSongStatus);

router.get('/song/:id/waveform', getSongWaveform);

router.delete('/song/:id', protect, deleteSong);

router.put('/song/:id', protect, validateUpdateMetadata, updateSongMetadata);

module.exports = router; 