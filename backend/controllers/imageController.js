const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../utils/cloudinary');

// @desc    Upload image
// @route   POST /api/images/upload
// @access  Private (Dealer, Admin)
exports.uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.image) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  const file = req.files.image;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
        400
      )
    );
  }

  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'trucks',
      width: 1200,
      crop: 'limit',
      quality: 'auto'
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (err) {
    return next(new ErrorResponse('Problem with image upload', 500));
  }
});

// @desc    Delete image
// @route   DELETE /api/images/:id
// @access  Private (Dealer, Admin)
exports.deleteImage = asyncHandler(async (req, res, next) => {
  const publicId = req.params.id;

  if (!publicId) {
    return next(new ErrorResponse('Please provide image ID', 400));
  }

  try {
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    return next(new ErrorResponse('Problem with image deletion', 500));
  }
});