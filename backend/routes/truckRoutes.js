const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const Truck = require('../models/Truck');

// Get truck stats
router.get('/stats', async (req, res) => {
  try {
    const totalTrucks = await Truck.countDocuments();
    const activeTrucks = await Truck.countDocuments({ status: 'active' });
    const maintenanceTrucks = await Truck.countDocuments({ status: 'maintenance' });

    const revenueResult = await Truck.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $ifNull: ["$revenue", false] },
                "$revenue",
                0
              ]
            }
          }
        }
      }
    ]);

    const revenue = Array.isArray(revenueResult) && revenueResult.length > 0
      ? revenueResult[0].totalRevenue
      : 0;

    res.json({
      totalTrucks,
      activeTrucks,
      maintenanceTrucks,
      revenue
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/trucks');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg and .png files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Image upload route
router.post('/upload', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Get the file path and create URL
    const imageUrl = `/uploads/trucks/${req.file.filename}`;
    
    // Read the file and convert to base64 for MongoDB storage
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString('base64');
    const fileType = req.file.mimetype;
    const imageData64 = `data:${fileType};base64,${base64Image}`;
    
    // Return both the URL and the base64 data
    res.status(200).json({ 
      success: true, 
      imageUrl: imageUrl,
      imageData: imageData64
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

// Get all trucks (public)
router.get('/', async (req, res) => {
  try {
    const trucks = await Truck.find();
    res.status(200).json({
      success: true,
      count: trucks.length,
      trucks
    });
  } catch (error) {
    console.error('Get trucks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trucks'
    });
  }
});

// Get a single truck (public)
router.get('/:id', async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck not found'
      });
    }
    res.status(200).json({
      success: true,
      truck
    });
  } catch (error) {
    console.error('Get truck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve truck'
    });
  }
});

// Create a new truck with image upload
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    // Handle image upload if present
    if (req.file) {
      // Read the file and convert to base64 for MongoDB storage
      const imagePath = req.file.path;
      const imageData = fs.readFileSync(imagePath);
      const base64Image = Buffer.from(imageData).toString('base64');
      const fileType = req.file.mimetype;
      
      // Store both the path and the base64 data
      req.body.imageUrl = `/uploads/trucks/${req.file.filename}`;
      req.body.imageData = `data:${fileType};base64,${base64Image}`;
      
      console.log('Image URL set to:', req.body.imageUrl);
      console.log('Image data stored in MongoDB');
    }
    
    const newTruck = new Truck({
      ...req.body,
      owner: req.user.id
    });
    const truck = await newTruck.save();
    res.status(201).json({
      success: true,
      truck
    });
  } catch (error) {
    console.error('Create truck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create truck',
      error: error.message
    });
  }
});

// Update a truck with image upload
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    let truck = await Truck.findById(req.params.id);
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck not found'
      });
    }
    if (truck.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this truck'
      });
    }
    
    // Handle image upload if present
    if (req.file) {
      // Read the file and convert to base64 for MongoDB storage
      const imagePath = req.file.path;
      const imageData = fs.readFileSync(imagePath);
      const base64Image = Buffer.from(imageData).toString('base64');
      const fileType = req.file.mimetype;
      
      // Store both the path and the base64 data
      req.body.imageUrl = `/uploads/trucks/${req.file.filename}`;
      req.body.imageData = `data:${fileType};base64,${base64Image}`;
      
      console.log('Image URL set to:', req.body.imageUrl);
      console.log('Image data stored in MongoDB');
    }
    
    truck = await Truck.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({
      success: true,
      truck
    });
  } catch (error) {
    console.error('Update truck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update truck'
    });
  }
});

// Delete a truck - NO TRUCK.REMOVE() METHOD
router.delete('/:id', protect, async (req, res) => {
  try {
    // Step 1: Find the truck first to verify ownership
    const truck = await Truck.findById(req.params.id);
    
    // Check if truck exists
    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck not found'
      });
    }
    
    // Check if user is authorized
    if (truck.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this truck'
      });
    }
    
    // Step 2: Delete using findOneAndDelete
    await Truck.findOneAndDelete({ _id: req.params.id });
    
    return res.status(200).json({
      success: true,
      message: 'Truck deleted successfully'
    });
  } catch (error) {
    console.error('Delete truck error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete truck',
      error: error.message
    });
  }
});

module.exports = router; 