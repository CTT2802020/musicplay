const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Upload audio file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} publicId - Public ID for the file
 * @returns {Promise<Object>} - Cloudinary response
 */
const uploadAudio = async (filePath, publicId) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video', // Cloudinary treats audio as video
      public_id: publicId,
      folder: 'spotify-clone/songs',
      use_filename: true,
      unique_filename: false,
    });

    // Xóa file local sau khi upload thành công
    fs.unlinkSync(filePath);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format
    };
  } catch (error) {
    // Xóa file local nếu upload thất bại
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} publicId - Public ID for the file
 * @returns {Promise<Object>} - Cloudinary response
 */
const uploadImage = async (filePath, publicId) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      public_id: publicId,
      folder: 'spotify-clone/images',
      transformation: [
        { width: 500, height: 500, crop: 'fill' },
        { quality: 'auto' }
      ],
      use_filename: true,
      unique_filename: false,
    });

    // Xóa file local sau khi upload thành công
    fs.unlinkSync(filePath);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    // Xóa file local nếu upload thất bại
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} - Cloudinary response
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadAudio,
  uploadImage,
  deleteFile
}; 