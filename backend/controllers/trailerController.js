const Trailer = require('../models/Trailer');
const asyncHandler = require('express-async-handler');
const { isValidObjectId } = require('mongoose');
const AppError = require('../utils/appError');
const fs = require('fs');

/**
 * Get all trailers with filtering options
 * @route GET /api/trailers
 * @access Public
 */
exports.getAllTrailers = asyncHandler(async (req, res) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(field => delete queryObj[field]);

  // Advanced filtering (convert operators)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = Trailer.find(JSON.parse(queryStr));

  // Search functionality
  if (req.query.search) {
    query = query.find({ $text: { $search: req.query.search } });
  }
  
  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default sort by newest
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  // Execute query
  const trailers = await query;
  
  res.status(200).json({
    success: true,
    count: trailers.length,
    data: trailers
  });
});

/**
 * Get trailer statistics
 * @route GET /api/trailers/stats
 * @access Public
 */
exports.getTrailerStats = asyncHandler(async (req, res, next) => {
  try {
    console.log('Getting trailer stats with query:', req.query);
    
    // Prepare filter based on owner parameter (no need for user role check since route is public)
    let filter = {};
    
    // If owner parameter is provided, use it for filtering
    if (req.query.owner) {
      console.log('Owner ID provided:', req.query.owner);
      
      // Check if it's a valid ObjectId before using it
      if (isValidObjectId(req.query.owner)) {
        filter.createdBy = req.query.owner;
        console.log('Using createdBy filter:', filter);
      } else {
        console.log('Invalid ObjectId format for owner:', req.query.owner);
        // Return empty stats for invalid ID
        return res.status(200).json({
          success: true,
          data: {
            totalTrailers: 0,
            availableTrailers: 0,
            reservedTrailers: 0,
            soldTrailers: 0,
            pendingTrailers: 0
          }
        });
      }
    }
    
    // Count trailers with error handling
    let totalTrailers = 0;
    let availableTrailers = 0;
    let reservedTrailers = 0;
    let soldTrailers = 0;
    let pendingTrailers = 0;
    
    try {
      // Total trailers
      totalTrailers = await Trailer.countDocuments(filter);
      
      // Get counts for each status
      availableTrailers = await Trailer.countDocuments({ 
        ...filter, 
        status: { $regex: new RegExp('^available$', 'i') }
      });
      
      reservedTrailers = await Trailer.countDocuments({ 
        ...filter, 
        status: { $regex: new RegExp('^reserved$', 'i') }
      });
      
      soldTrailers = await Trailer.countDocuments({ 
        ...filter, 
        status: { $regex: new RegExp('^sold$', 'i') }
      });
      
      pendingTrailers = await Trailer.countDocuments({ 
        ...filter, 
        status: { $regex: new RegExp('^pending$', 'i') }
      });
      
      console.log('Trailer stats counts:', {
        totalTrailers,
        availableTrailers,
        reservedTrailers,
        soldTrailers,
        pendingTrailers
      });
    } catch (countError) {
      console.error('Error counting trailers:', countError);
      // Continue with zeros instead of failing
    }
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        totalTrailers,
        availableTrailers,
        reservedTrailers,
        soldTrailers,
        pendingTrailers
      }
    });
  } catch (error) {
    console.error('Error in getTrailerStats:', error);
    // Send a 200 response with empty data instead of 500 error
    res.status(200).json({
      success: true,
      data: {
        totalTrailers: 0,
        availableTrailers: 0,
        reservedTrailers: 0,
        soldTrailers: 0,
        pendingTrailers: 0
      }
    });
  }
});

/**
 * Get trailer by ID
 * @route GET /api/trailers/:id
 * @access Public
 */
exports.getTrailer = asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid trailer ID format', 400));
  }

  const trailer = await Trailer.findById(req.params.id);

  if (!trailer) {
    return next(new AppError('No trailer found with that ID', 404));
  }

  // If we have image data stored in the database, use it
  // This ensures images are available even after server restart
  if (trailer.imageData) {
    console.log('Using stored base64 image data');
  } else if (trailer.imageUrl) {
    console.log('Using image URL path:', trailer.imageUrl);
  } else {
    console.log('No image data found for trailer');
  }

  res.status(200).json({
    success: true,
    data: trailer
  });
});

/**
 * Create new trailer
 * @route POST /api/trailers
 * @access Private
 */
exports.createTrailer = asyncHandler(async (req, res, next) => {
  try {
    console.log('Creating trailer with request data:', req.body);
    console.log('File uploaded:', req.file);
    
    // Check if there's a file uploaded
    if (req.file) {
      // Read the file and convert to base64 for MongoDB storage
      const imagePath = req.file.path;
      const imageData = fs.readFileSync(imagePath);
      const base64Image = Buffer.from(imageData).toString('base64');
      const fileType = req.file.mimetype;
      
      // Store both the path and the base64 data
      req.body.imageUrl = `/uploads/trailers/${req.file.filename}`;
      req.body.imageData = `data:${fileType};base64,${base64Image}`;
      
      console.log('Image URL set to:', req.body.imageUrl);
      console.log('Image data stored in MongoDB');
    }

    // Set owner and createdBy fields
    if (req.body.owner) {
      req.body.createdBy = req.body.owner;
    } else {
      req.body.owner = req.user.id;
      req.body.createdBy = req.user.id;
    }
    
    console.log('Setting owner/createdBy to:', req.body.owner);
    
    // Current timestamp for use in default values
    const currentYear = new Date().getFullYear();
    
    // Add default values for all required fields if they're missing
    const defaults = {
      make: req.body.make || 'Unknown Make',
      model: req.body.model || 'Unknown Model',
      year: req.body.year || currentYear,
      type: req.body.type || 'General',
      description: req.body.description || 'No description provided',
      location: req.body.location || 'Not specified',
      condition: req.body.condition || 'Good',
      price: req.body.price || 0,
      length: req.body.length || 20,
      axles: req.body.axles || 2,
      status: 'Available'
    };
    
    // Merge defaults with the request body (req.body values take precedence)
    const trailerData = { ...defaults, ...req.body };
    
    // If VIN is not provided, generate a placeholder
    if (!trailerData.vinNumber) {
      const timestamp = Date.now().toString().slice(-10);
      const random = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
      trailerData.vinNumber = `DEV${timestamp}${random}`.slice(0, 17);
    }
    
    // Ensure price is always provided and is a number
    if (trailerData.price === undefined || trailerData.price === null || trailerData.price === '') {
      trailerData.price = 0;
    } else {
      trailerData.price = Number(trailerData.price);
    }
    
    // Process features if they exist in the request body
    if (req.body.features) {
      if (Array.isArray(req.body.features)) {
        trailerData.features = req.body.features;
      } else if (typeof req.body.features === 'string') {
        // If it's a string, convert to array with one item
        trailerData.features = [req.body.features];
      }
    }
    
    console.log('Final trailer data for creation:', trailerData);
    
    // Create the trailer in the database
    const trailer = await Trailer.create(trailerData);
    console.log('Trailer created successfully:', trailer._id);

    res.status(201).json({
      success: true,
      data: trailer
    });
  } catch (error) {
    console.error('Error creating trailer:', error);
    
    // Handle validation errors more gracefully
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(`Validation Error: ${messages.join(', ')}`, 400));
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new AppError(`Duplicate field value: ${field}. Please use another value.`, 400));
    }
    
    // For other errors, pass to the error handler
    return next(error);
  }
});

/**
 * Update trailer
 * @route PATCH /api/trailers/:id
 * @access Private
 */
exports.updateTrailer = asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid trailer ID format', 400));
  }

  let trailer = await Trailer.findById(req.params.id);

  if (!trailer) {
    return next(new AppError('No trailer found with that ID', 404));
  }

  // Check if the user is the owner or an admin
  if (trailer.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to update this trailer', 403));
  }

  // Handle file upload if present
  if (req.file) {
    // Read the file and convert to base64 for MongoDB storage
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString('base64');
    const fileType = req.file.mimetype;
    
    // Store both the path and the base64 data
    req.body.imageUrl = `/uploads/trailers/${req.file.filename}`;
    req.body.imageData = `data:${fileType};base64,${base64Image}`;
    
    console.log('Image URL set to:', req.body.imageUrl);
    console.log('Image data stored in MongoDB');
  }

  // Update the trailer
  trailer = await Trailer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,  // Return updated trailer
    runValidators: true  // Run model validators
  });

  res.status(200).json({
    success: true,
    data: trailer
  });
});

/**
 * Delete trailer
 * @route DELETE /api/trailers/:id
 * @access Private
 */
exports.deleteTrailer = asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid trailer ID format', 400));
  }

  const trailer = await Trailer.findById(req.params.id);

  if (!trailer) {
    return next(new AppError('No trailer found with that ID', 404));
  }

  // Check if the user is the owner or an admin
  if (trailer.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to delete this trailer', 403));
  }

  // Remove trailer
  await trailer.deleteOne();

  res.status(200).json({
    success: true,
    data: null
  });
});

/**
 * Upload trailer images
 * @route POST /api/trailers/:id/images
 * @access Private
 */
exports.uploadTrailerImages = asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid trailer ID format', 400));
  }

  const trailer = await Trailer.findById(req.params.id);

  if (!trailer) {
    return next(new AppError('No trailer found with that ID', 404));
  }

  // Check if the user is the owner or an admin
  if (trailer.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to update this trailer', 403));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  // Process file uploads with base64 encoding
  const processedImages = req.files.map(file => {
    // Get the URL path
    const imageUrl = `/uploads/trailers/${file.filename}`;
    
    // Read the file and convert to base64 for MongoDB storage
    const imagePath = file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString('base64');
    const fileType = file.mimetype;
    const imageData64 = `data:${fileType};base64,${base64Image}`;
    
    return { url: imageUrl, data: imageData64 };
  });
  
  // Add new images to trailer
  const imageUrls = processedImages.map(img => img.url);
  
  // Store image data in the MongoDB document
  if (!trailer.imagesData) {
    trailer.imagesData = [];
  }
  
  // Add base64 image data to the document
  const imageDataArray = processedImages.map(img => img.data);
  trailer.imagesData = [...(trailer.imagesData || []), ...imageDataArray];
  
  // Add URL references to the document
  trailer.images = [...trailer.images, ...imageUrls];
  
  await trailer.save();

  res.status(200).json({
    success: true,
    data: trailer
  });
});

/**
 * Get similar trailers
 * @route GET /api/trailers/:id/similar
 * @access Public
 */
exports.getSimilarTrailers = asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid trailer ID format', 400));
  }

  const trailer = await Trailer.findById(req.params.id);

  if (!trailer) {
    return next(new AppError('No trailer found with that ID', 404));
  }

  // Find similar trailers based on type, make, and length range
  const similarTrailers = await Trailer.find({
    _id: { $ne: trailer._id }, // Exclude current trailer
    type: trailer.type,
    $or: [
      { make: trailer.make },
      { length: { $gte: trailer.length - 5, $lte: trailer.length + 5 } }
    ],
    status: 'Available' // Only show available trailers
  })
  .limit(6)
  .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: similarTrailers.length,
    data: similarTrailers
  });
});