const mongoose = require('mongoose');

const trailerSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Trailer make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Trailer model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be at least 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  type: {
    type: String,
    required: [true, 'Trailer type is required'],
    trim: true
  },
  length: {
    type: Number,
    required: [true, 'Length is required'],
    min: [0, 'Length must be positive']
  },
  axles: {
    type: Number,
    required: [true, 'Number of axles is required'],
    min: [1, 'Must have at least 1 axle']
  },
  vinNumber: {
    type: String,
    required: [true, 'VIN number is required'],
    trim: true,
    maxlength: [17, 'VIN number should be 17 characters'],
    minlength: [17, 'VIN number should be 17 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long']
  },
  features: [{
    type: String,
    trim: true
  }],
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: {
      values: ['New', 'Excellent', 'Good', 'Fair', 'Poor'],
      message: 'Condition must be one of: New, Excellent, Good, Fair, Poor'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['Available', 'Pending', 'Sold', 'Reserved'],
      message: 'Status must be one of: Available, Pending, Sold, Reserved'
    },
    default: 'Available'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  imageUrl: {
    type: String
  },
  imageData: {
    type: String
  },
  gvwr: { // Gross Vehicle Weight Rating
    type: Number,
    min: [0, 'GVWR must be positive']
  },
  capacity: {
    type: Number,
    min: [0, 'Capacity must be positive']
  },
  hitch: {
    type: String,
    trim: true
  },
  suspension: {
    type: String,
    trim: true
  },
  brakes: {
    type: String,
    trim: true
  },
  floorType: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  ramps: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }],
  imagesData: [{
    type: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Trailer must belong to a user']
  },
  revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for text search
trailerSchema.index({ 
  make: 'text', 
  model: 'text', 
  type: 'text',
  description: 'text' 
});

// Add other necessary indexes
trailerSchema.index({ price: 1 });
trailerSchema.index({ year: 1 });
trailerSchema.index({ length: 1 });
trailerSchema.index({ status: 1 });
trailerSchema.index({ createdAt: -1 });

// Virtual property to get age in years
trailerSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Pre-save middleware to ensure owner is also set as createdBy for compatibility
trailerSchema.pre('save', function(next) {
  // If owner is set but createdBy isn't, use owner value for createdBy
  if (this.owner && !this.createdBy) {
    this.createdBy = this.owner;
  }
  // If createdBy is set but owner isn't, use createdBy value for owner
  else if (this.createdBy && !this.owner) {
    this.owner = this.createdBy;
  }
  next();
});

const Trailer = mongoose.model('Trailer', trailerSchema);

module.exports = Trailer;