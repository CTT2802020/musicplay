const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, '../uploads');
const songsDir = path.join(uploadsDir, 'songs');
const imagesDir = path.join(uploadsDir, 'images');

[uploadsDir, songsDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Cấu hình storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'audioFile') {
      cb(null, songsDir);
    } else if (file.fieldname === 'coverImage') {
      cb(null, imagesDir);
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique với timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audioFile') {
    // Chấp nhận file audio dựa vào MIME type hoặc extension
    const isAudioMime = file.mimetype.startsWith('audio/') || 
                        file.mimetype === 'application/octet-stream' ||
                        file.mimetype === 'video/mp4'; // Some MP3 files are detected as video/mp4
    const isAudioExt = /\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file.originalname);
    
    if (isAudioMime || isAudioExt) {
      cb(null, true);
    } else {
      console.log('Rejected file:', {
        fieldname: file.fieldname,
        mimetype: file.mimetype,
        originalname: file.originalname
      });
      cb(new Error('Only audio files are allowed!'), false);
    }
  } else if (file.fieldname === 'coverImage') {
    // Chỉ chấp nhận file hình ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  } else {
    console.log('Invalid field name:', file.fieldname);
    cb(new Error('Invalid field name'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB cho file audio
  }
});

// Middleware cho upload multiple fields
const uploadFields = upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Tối đa 50MB'
      });
    }
  }
  
  return res.status(400).json({
    success: false,
    message: error.message || 'Lỗi upload file'
  });
};

module.exports = {
  uploadFields,
  handleUploadError
}; 