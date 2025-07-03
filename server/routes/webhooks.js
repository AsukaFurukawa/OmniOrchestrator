const express = require('express');
const router = express.Router();

// Webhook endpoint for external integrations
router.post('/campaign-update', async (req, res) => {
  try {
    const { campaignId, status, metrics } = req.body;
    
    // Handle campaign status updates
    console.log('Campaign webhook received:', { campaignId, status, metrics });
    
    // You could update database, send notifications, etc.
    
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Webhook processing failed' 
    });
  }
});

// Webhook for social media platform notifications
router.post('/social-update', async (req, res) => {
  try {
    const { platform, type, data } = req.body;
    
    console.log('Social media webhook:', { platform, type, data });
    
    res.status(200).json({
      success: true,
      message: 'Social webhook processed',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Social webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Social webhook failed' 
    });
  }
});

// Webhook for payment/subscription updates (if needed later)
router.post('/payment-update', async (req, res) => {
  try {
    const { userId, status, planType } = req.body;
    
    console.log('Payment webhook:', { userId, status, planType });
    
    res.status(200).json({
      success: true,
      message: 'Payment webhook processed'
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment webhook failed' 
    });
  }
});

// Health check for webhooks
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'webhooks',
    timestamp: new Date()
  });
});

module.exports = router; 