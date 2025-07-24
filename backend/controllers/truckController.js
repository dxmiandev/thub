const Truck = require('../models/Truck');
const User = require('../models/User');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');

// Helper function for logging (replace with actual logger if available)
const log = (message) => console.log(`[TruckController] ${message}`);

// @desc    Get all trucks with filtering, sorting, pagination
// @route   GET /api/trucks
// @access  Public
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json({ imageUrl: result.secure_url, imageId: result.public_id });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

exports.getTrucks = async (req, res) => {
  try {
    log('Fetching trucks');
    
    const features = new APIFeatures(Truck.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Public access - only show public trucks unless authenticated
    if (!req.user) {
      features.query = features.query.find({ isPublic: true });
    } else if (req.user.role !== 'admin') {
      features.query = features.query.find({ 
        $or: [
          { isPublic: true },
          { owner: req.user.id }
        ]
      });
    }

    const trucks = await features.query;
    const totalCount = await Truck.countDocuments(features.filterQuery);

    res.status(200).json({
      success: true,
      count: trucks.length,
      totalCount,
      data: trucks
    });
  } catch (err) {
    log(`Error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trucks',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Get single truck by ID
// @route   GET /api/trucks/:id
// @access  Public
exports.getTruck = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id).populate('owner', 'name email');
    
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck not found'
      });
    }

    // Authorization check
    const isAuthorized = req.user && 
      (req.user.role === 'admin' || truck.owner._id.toString() === req.user.id);
    
    if (!truck.isPublic && !isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this truck'
      });
    }

    res.status(200).json({
      success: true,
      data: truck
    });
  } catch (err) {
    log(`Error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve truck'
    });
  }
};

// Other controller methods remain the same as in your original file...
// (createTruck, updateTruck, deleteTruck, getTrucksByDealer, etc.)

// @desc    Create a new truck
// @route   POST /api/trucks
// @access  Private (dealer, admin)
exports.createTruck = async (req, res) => {
  try {
    // Add owner from authenticated user
    req.body.owner = req.user.id;
    
    // Upload image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'trucks',
        use_filename: true
      });
      
      req.body.imageUrl = result.secure_url;
      req.body.imageId = result.public_id;
    }
    
    const truck = await Truck.create(req.body);
    
    // Update user's trucks array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { trucks: truck._id }
    });
    
    res.status(201).json({
      success: true,
      data: truck
    });
  } catch (err) {
    logger.error(`Error in createTruck: ${err.message}`);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update truck
// @route   PUT /api/trucks/:id
// @access  Private (dealer, admin)
exports.updateTruck = async (req, res) => {
  try {
    let truck = await Truck.findById(req.params.id);
    
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck not found'
      });
    }
    
    // Check if user has permission to update (admin or owner)
    if (req.user.role !== 'admin' && truck.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this truck'
      });
    }
    
    // Upload new image if provided
    if (req.file) {
      // Delete old image first if exists
      if (truck.imageId) {
        await cloudinary.uploader.destroy(truck.imageId);
      }
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'trucks',
        use_filename: true
      });
      
      req.body.imageUrl = result.secure_url;
      req.body.imageId = result.public_id;
    }
    
    // Update truck
    truck = await Truck.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: truck
    });
  } catch (err) {
    logger.error(`Error in updateTruck: ${err.message}`);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete truck
// @route   DELETE /api/trucks/:id
// @access  Private (dealer, admin)
exports.deleteTruck = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);
    
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck not found'
      });
    }
    
    // Check if user has permission to delete (admin or owner)
    if (req.user.role !== 'admin' && truck.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this truck'
      });
    }
    
    // Delete image from cloudinary if exists
    if (truck.imageId) {
      await cloudinary.uploader.destroy(truck.imageId);
    }
    
    // Delete the truck using findByIdAndDelete instead of remove()
    await Truck.findByIdAndDelete(req.params.id);
    
    // Update user's trucks array
    await User.findByIdAndUpdate(truck.owner, {
      $pull: { trucks: truck._id }
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    logger.error(`Error in deleteTruck: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete truck'
    });
  }
};

// @desc    Get trucks by dealer ID
// @route   GET /api/trucks/dealer/:id
// @access  Public
exports.getTrucksByDealer = async (req, res) => {
  try {
    const dealerId = req.params.id;
    
    // Create query to find public trucks for this dealer
    let query = { owner: dealerId };
    
    // If user is authenticated and is the dealer or admin, show all trucks
    const isDealer = req.user && (req.user.id === dealerId || req.user.role === 'admin');
    if (!isDealer) {
      query.isPublic = true;
    }
    
    const trucks = await Truck.find(query);
    
    res.status(200).json({
      success: true,
      count: trucks.length,
      data: trucks
    });
  } catch (err) {
    logger.error(`Error in getTrucksByDealer: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dealer trucks'
    });
  }
};

// @desc    Get trucks statistics
// @route   GET /api/trucks/stats
// @access  Private (dealer, admin)
exports.getTruckStats = async (req, res) => {
  try {
    let matchStage = {};
    
    // If not admin, filter by user's trucks
    if (req.user.role !== 'admin') {
      matchStage = { owner: mongoose.Types.ObjectId(req.user.id) };
    }
    
    const stats = await Truck.aggregate([
      { $match: matchStage },
      {
        $facet: {
          // Total count
          totalCount: [
            { $count: 'count' }
          ],
          // Count by status
          statusCount: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          // Revenue calculation (if you track revenue per truck)
          revenue: [
            { $group: { _id: null, total: { $sum: '$revenue' } } }
          ]
        }
      }
    ]);
    
    // Format response
    const totalTrucks = stats[0].totalCount[0]?.count || 0;
    
    // Map status counts
    const statusMap = {};
    stats[0].statusCount.forEach(item => {
      statusMap[item._id] = item.count;
    });
    
    const revenue = stats[0].revenue[0]?.total || 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalTrucks,
        activeTrucks: statusMap['active'] || 0,
        maintenanceTrucks: statusMap['maintenance'] || 0,
        retiredTrucks: statusMap['retired'] || 0,
        revenue
      }
    });
  } catch (err) {
    logger.error(`Error in getTruckStats: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve truck statistics'
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/trucks/recent
// @access  Private (dealer, admin)
exports.getRecentActivity = async (req, res) => {
  try {
    let query = Truck.find()
      .sort('-updatedAt')
      .limit(5)
      .populate('owner', 'name');
    
    // If not admin, only show their trucks
    if (req.user.role !== 'admin') {
      query = query.find({ owner: req.user.id });
    }
    
    const recentTrucks = await query;
    
    res.status(200).json({
      success: true,
      data: recentTrucks
    });
  } catch (err) {
    logger.error(`Error in getRecentActivity: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent activity'
    });
  }
};

// @desc    Update truck maintenance
// @route   PUT /api/trucks/:id/maintenance
// @access  Private (dealer, admin)
exports.updateMaintenance = async (req, res) => {
  try {
    const { maintenanceDate, maintenanceType, maintenanceNotes, cost } = req.body;
    
    const truck = await Truck.findById(req.params.id);
    
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck not found'
      });
    }
    
    // Check if user has permission
    if (req.user.role !== 'admin' && truck.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update maintenance'
      });
    }
    
    // Add new maintenance record
    const maintenanceRecord = {
      date: maintenanceDate || new Date(),
      type: maintenanceType,
      notes: maintenanceNotes,
      cost: cost || 0
    };
    
    truck.maintenanceHistory.push(maintenanceRecord);
    truck.lastMaintenance = maintenanceDate || new Date();
    
    await truck.save();
    
    res.status(200).json({
      success: true,
      data: truck
    });
  } catch (err) {
    logger.error(`Error in updateMaintenance: ${err.message}`);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};