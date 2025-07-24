const mongoose = require('mongoose');

const TruckSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: [true, 'Please provide the truck make']
  },
  model: {
    type: String,
    required: [true, 'Please provide the truck model']
  },
  year: {
    type: Number,
    required: [true, 'Please provide the truck year']
  },
  licensePlate: {
    type: String,
    required: [true, 'Please provide the license plate number'],
    unique: true
  },
  type: {
    type: String,
    enum: ['box truck', 'semi', 'flatbed', 'refrigerated', 'tanker'],
    default: 'box truck'
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'retired'],
    default: 'active'
  },
  lastMaintenance: {
    type: Date,
    required: [true, 'Please provide the last maintenance date']
  },
  nextMaintenanceDue: {
    type: Date
  },
  mileage: {
    type: Number,
    required: [true, 'Please provide the current mileage']
  },
  fuelType: {
    type: String,
    enum: ['diesel', 'gasoline', 'electric', 'hybrid', 'natural gas'],
    default: 'diesel'
  },
  capacity: {
    type: String
  },
  notes: {
    type: String
  },
  imageUrl: {
    type: String
  },
  imageData: {
    type: String
  },
  images: [{
    type: String
  }],
  imagesData: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  revenue: {
    type: Number,
    default: 0
  }
});

// Pre-save hook to calculate nextMaintenanceDue if not provided
TruckSchema.pre('save', function (next) {
  if (this.lastMaintenance && !this.nextMaintenanceDue) {
    const nextDate = new Date(this.lastMaintenance);
    nextDate.setMonth(nextDate.getMonth() + 6);
    this.nextMaintenanceDue = nextDate;
  }
  next();
});

module.exports = mongoose.model('Truck', TruckSchema);
