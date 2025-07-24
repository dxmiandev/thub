const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const trailerController = require('../controllers/trailerController');
const { protect, authorize } = require('../middleware/auth');

// Configure multer storage for trailer images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/trailers');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter
});

// Public routes - all these can be accessed without authentication
router.get('/', trailerController.getAllTrailers);
router.get('/stats', trailerController.getTrailerStats); // Move stats route before ID routes to avoid conflicts
router.get('/:id', trailerController.getTrailer);
router.get('/:id/similar', trailerController.getSimilarTrailers);

// Protected routes - user must be logged in
router.use(protect);

// Create new trailer with image upload
router.post('/', upload.single('image'), trailerController.createTrailer);

// Update and delete - only owner or admin can perform these actions
router.patch('/:id', upload.single('image'), trailerController.updateTrailer);
router.delete('/:id', trailerController.deleteTrailer);

// Upload images for trailer
router.post(
  '/:id/images',
  upload.array('images', 5), // Allow up to 5 images
  trailerController.uploadTrailerImages
);

// Admin routes
router.use(authorize('admin'));
// Any admin-specific routes can be added here

module.exports = router;