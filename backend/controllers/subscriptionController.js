const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc    Get all subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
exports.getPlans = async (req, res) => {
  const plans = {
    solo_shot: {
      name: 'Solo Shot',
      price: 49.99,
      maxListings: 1,
      paymentType: 'one_time',
      features: ['One-time payment', '1 listing', 'Basic support']
    },
    trucker_basic: {
      name: 'Trucker Basic',
      price: 99.99,
      maxListings: 5,
      paymentType: 'monthly',
      features: ['Monthly subscription', 'Up to 5 listings', 'Priority support']
    },
    fleet_pro: {
      name: 'Fleet Pro',
      price: 199.99,
      maxListings: 10,
      paymentType: 'monthly',
      features: ['Monthly subscription', 'Up to 10 listings', 'Premium support']
    },
    fleet_enterprise: {
      name: 'Fleet Enterprise',
      price: 399.99,
      maxListings: -1, // unlimited
      paymentType: 'monthly',
      features: ['Monthly subscription', 'Unlimited listings', '24/7 support']
    },
    dealer_deluxe: {
      name: 'Dealer Deluxe',
      price: 599.99,
      maxListings: -1, // unlimited
      paymentType: 'monthly',
      features: ['Monthly subscription', 'Unlimited listings', 'Wholesale access', '24/7 premium support']
    }
  };

  res.status(200).json(plans);
};

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
exports.createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    // Get user's current subscription if any
    const currentSubscription = await Subscription.findOne({ user: userId, status: 'active' });
    if (currentSubscription) {
      return res.status(400).json({ success: false, message: 'User already has an active subscription' });
    }

    // Get plan details
    const plans = {
      solo_shot: { maxListings: 1, hasWholesaleAccess: false },
      trucker_basic: { maxListings: 5, hasWholesaleAccess: false },
      fleet_pro: { maxListings: 10, hasWholesaleAccess: false },
      fleet_enterprise: { maxListings: -1, hasWholesaleAccess: false },
      dealer_deluxe: { maxListings: -1, hasWholesaleAccess: true }
    };

    const planDetails = plans[plan];
    if (!planDetails) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    // Calculate subscription end date
    const startDate = new Date();
    const endDate = new Date();
    if (plan === 'solo_shot') {
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year for one-time payment
    } else {
      endDate.setMonth(endDate.getMonth() + 1); // 1 month for monthly subscriptions
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: userId,
      plan,
      status: 'active',
      startDate,
      endDate,
      paymentType: plan === 'solo_shot' ? 'one_time' : 'monthly',
      maxListings: planDetails.maxListings,
      hasWholesaleAccess: planDetails.hasWholesaleAccess,
      lastPaymentDate: startDate,
      nextPaymentDate: endDate
    });

    // Update user's subscription status and plan
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'active',
      currentPlan: plan,
      subscriptionEndDate: endDate,
      role: plan === 'dealer_deluxe' ? 'dealer' : 'seller'
    });

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
};

// @desc    Get user's current subscription
// @route   GET /api/subscriptions/current
// @access  Private
exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      user: req.user.id, 
      status: 'active' 
    }).populate('user', 'name email role subscriptionStatus currentPlan subscriptionEndDate');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
};

// @desc    Check subscription status
// @route   GET /api/subscriptions/check
// @access  Private
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const subscription = await Subscription.findOne({ 
      user: req.user.id, 
      status: 'active' 
    });

    if (!subscription) {
      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        message: 'No active subscription found'
      });
    }

    // Check if subscription has expired
    if (subscription.endDate < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
      
      await User.findByIdAndUpdate(req.user.id, {
        subscriptionStatus: 'expired',
        currentPlan: 'none'
      });

      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        message: 'Subscription has expired'
      });
    }

    res.status(200).json({
      success: true,
      hasActiveSubscription: true,
      data: {
        plan: subscription.plan,
        endDate: subscription.endDate,
        maxListings: subscription.maxListings,
        hasWholesaleAccess: subscription.hasWholesaleAccess
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking subscription status',
      error: error.message
    });
  }
}; 