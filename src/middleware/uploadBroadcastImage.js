/**
 * Broadcast Image Upload Handler
 * 
 * Middleware untuk menangani upload gambar broadcast
 * Mendukung: JPG, PNG, GIF, WebP
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const { appUrl } = require('../config');

// Tentukan folder upload
const UPLOAD_DIR = path.join(__dirname, '../../public/broadcasts/images');
const UPLOAD_URL_PREFIX = '/public/broadcasts/images';

// Buat folder jika belum ada
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: broadcast_[timestamp]_[random].[ext]
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
    cb(null, filename);
  }
});

// Filter file - hanya terima gambar
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Allowed MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File format tidak didukung. Gunakan: JPG, PNG, GIF, WebP`), false);
  }
};

// Konfigurasi multer
const uploadBroadcastImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * Generate URL dari uploaded file
 * @param {Object} file - File object dari multer
 * @returns {string} URL publik gambar
 */
function generateImageUrl(file) {
  if (!file) return null;
  
  // Generate URL publik menggunakan config.appUrl
  return `${appUrl}${UPLOAD_URL_PREFIX}/${file.filename}`;
}

/**
 * Delete uploaded image file
 * @param {string} filename - Nama file
 */
function deleteImageFile(filename) {
  try {
    if (!filename) return false;
    
    const filepath = path.join(UPLOAD_DIR, path.basename(filename));
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      logger.info('Deleted image file:', filepath);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting image file:', error);
    return false;
  }
}

/**
 * Get image file path
 * @param {string} filename - Nama file
 */
function getImagePath(filename) {
  return path.join(UPLOAD_DIR, path.basename(filename));
}

module.exports = {
  uploadBroadcastImage: uploadBroadcastImage.single('image'), // Sudah wrapped dengan .single('image')
  generateImageUrl,
  deleteImageFile,
  getImagePath,
  UPLOAD_DIR,
  UPLOAD_URL_PREFIX
};
