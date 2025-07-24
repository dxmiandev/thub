const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['solo_shot', 'trucker_basic', 'fleet_pro', 'fleet_enterprise', 'dealer_deluxe'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'inactive'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  paymentType: {
    type: String,
    enum: ['one_time', 'monthly'],
    required: true
  },
  lastPaymentDate: {
    type: Date
  },
  nextPaymentDate: {
    type: Date
  },
  listingCount: {
    type: Number,
    default: 0
  },
  maxListings: {
    type: Number,
    required: true
  },
  hasWholesaleAccess: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema); 