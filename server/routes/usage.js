const express = require('express');
const UsageTrackingService = require('../services/usageTrackingService');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const usageTracker = new UsageTrackingService();

// Get current user usage statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const usageStats = await usageTracker.getUserUsageStats(req.user.userId);
    
    res.json({
      success: true,
      usage: usageStats
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage statistics',
      details: error.message
    });
  }
});

// Get usage alerts for user
router.get('/alerts', authMiddleware, async (req, res) => {
  try {
    const alerts = await usageTracker.checkUsageLimits(req.user.userId);
    
    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Usage alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage alerts',
      details: error.message
    });
  }
});

// Upgrade user plan
router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan type'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Upgrade user plan
    await user.upgradePlan(plan);

    // Send real-time notification
    const socketService = req.app.locals.socketService;
    if (socketService) {
      await socketService.sendNotification(req.user.userId, {
        type: 'plan_upgraded',
        title: 'Plan Upgraded',
        message: `Your plan has been upgraded to ${plan}`,
        plan: plan
      });

      // Send updated usage stats
      const usageStats = await usageTracker.getUserUsageStats(req.user.userId);
      await socketService.sendUsageAlert(req.user.userId, {
        type: 'plan_upgrade_success',
        newLimits: usageStats.currentMonth
      });
    }

    res.json({
      success: true,
      message: `Plan upgraded to ${plan}`,
      newPlan: plan,
      usage: await usageTracker.getUserUsageStats(req.user.userId)
    });
  } catch (error) {
    console.error('Plan upgrade error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade plan',
      details: error.message
    });
  }
});

// Track custom usage (for integrations)
router.post('/track', authMiddleware, async (req, res) => {
  try {
    const { type, amount = 1, metadata = {} } = req.body;
    
    const result = await usageTracker.trackUsage(req.user.userId, type, amount, metadata);
    
    res.json({
      success: true,
      result,
      usage: await usageTracker.getUserUsageStats(req.user.userId)
    });
  } catch (error) {
    console.error('Track usage error:', error);
    
    if (error.message.includes('limit reached')) {
      return res.status(429).json({
        success: false,
        error: error.message,
        type: 'limit_reached'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to track usage',
      details: error.message
    });
  }
});

module.exports = router; 