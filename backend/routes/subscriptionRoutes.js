const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPlans,
  createSubscription,
  getCurrentSubscription,
  checkSubscriptionStatus
} = require('../controllers/subscriptionController');

router.get('/plans', getPlans);
router.post('/', protect, createSubscription);
router.get('/current', protect, getCurrentSubscription);
router.get('/check', protect, checkSubscriptionStatus);

module.exports = router; 