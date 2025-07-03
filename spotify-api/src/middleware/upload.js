const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Create upload folders if they don't exist
const createFolders = () => {
  const uploadDir = path.join(process.env.FILE_UPLOAD_PATH || './public/uploads');
  const songDir = path.join(uploadDir, 'songs');
  const imageDir = path.join(uploadDir, 'images');

  [uploadDir, songDir, imageDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create folders on startup
createFolders();

// Set storage engine for music files
const songStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.env.FILE_UPLOAD_PATH || './public/uploads', 'songs'));
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp + user ID + original ext
    cb(
      null,
      `song_${Date.now()}_${req.user ? req.user.id : 'unknown'}.${file.originalname.split('.').pop()}`
    );
  }
});

// Set storage engine for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.env.FILE_UPLOAD_PATH || './public/uploads', 'images'));
  },
  filename: (req, file, cb) => {
    // Create unique filename: type + timestamp + user ID + original ext
    const type = req.body.type || 'avatar'; // avatar, cover, playlist
    cb(
      null,
      `${type}_${Date.now()}_${req.user ? req.user.id : 'unknown'}.${file.originalname.split('.').pop()}`
    );
  }
});

// Check file type for music files
const checkSongFileType = (req, file, cb) => {
  // Allowed music file types
  const filetypes = /mp3|wav|flac|m4a|ogg/;
  
  // Check extension
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only audio files (mp3, wav, flac, m4a, ogg) are allowed!'));
  }
};

// Check file type for image files
const checkImageFileType = (req, file, cb) => {
  // Allowed image types
  const filetypes = /jpeg|jpg|png|gif|webp/;
  
  // Check extension
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Init song upload
const songUpload = multer({
  storage: songStorage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 10000000 }, // 10MB default
  fileFilter: checkSongFileType
});

// Init image upload
const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 2000000 }, // 2MB
  fileFilter: checkImageFileType
});

module.exports = {
  songUpload,
  imageUpload
}; 