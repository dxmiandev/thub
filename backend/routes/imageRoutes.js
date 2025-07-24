const express = require('express');
const router = express.Router();
const { 
  uploadImage, 
  deleteImage 
} = require('../controllers/imageController');
const { protect, authorize } = require('../middleware/auth');

// Base route /api/images

// Protected routes
router.use(protect);

// Upload image - dealer and admin only
router.post('/upload', authorize('dealer', 'admin'), uploadImage);

// Delete image - dealer and admin only
router.delete('/:id', authorize('dealer', 'admin'), deleteImage);

module.exports = router;