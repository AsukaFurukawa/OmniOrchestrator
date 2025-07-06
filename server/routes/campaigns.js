const express = require('express');
const User = require('../models/User');
const AIService = require('../services/aiService');
const UsageTrackingService = require('../services/usageTrackingService');

const router = express.Router();
const aiService = new AIService();
const usageTracker = new UsageTrackingService();

// Get all campaigns for user
router.get('/', async (req, res) => {
  try {
    let user = await User.findById(req.user.userId);
    
    // Handle development mode - create mock user data if user doesn't exist
    if (!user && process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using mock campaign data');
      user = {
        campaigns: [
          {
            _id: 'mock-campaign-1',
            name: 'Summer Sale Campaign',
            type: 'email',
            status: 'active',
            content: {
              headline: 'Summer Sale - Up to 50% Off!',
              body: 'Don\'t miss our biggest sale of the year...',
              cta: 'Shop Now'
            },
            targeting: { audience: 'Existing customers' },
            metrics: { impressions: 15420, clicks: 1242, conversions: 86, spend: 450 },
            createdAt: new Date('2024-06-01'),
            updatedAt: new Date()
          },
          {
            _id: 'mock-campaign-2',
            name: 'Brand Awareness Campaign',
            type: 'social',
            status: 'active',
            content: {
              headline: 'Discover Our Brand',
              body: 'Join thousands of satisfied customers...',
              cta: 'Learn More'
            },
            targeting: { audience: 'New prospects' },
            metrics: { impressions: 8930, clicks: 567, conversions: 23, spend: 280 },
            createdAt: new Date('2024-06-15'),
            updatedAt: new Date()
          },
          {
            _id: 'mock-campaign-3',
            name: 'Product Launch',
            type: 'web',
            status: 'draft',
            content: {
              headline: 'New Product Launch',
              body: 'Introducing our latest innovation...',
              cta: 'Get Early Access'
            },
            targeting: { audience: 'Premium customers' },
            metrics: { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { status, type, limit = 20, page = 1 } = req.query;
    let campaigns = user.campaigns;

    // Filter by status
    if (status) {
      campaigns = campaigns.filter(campaign => campaign.status === status);
    }

    // Filter by type
    if (type) {
      campaigns = campaigns.filter(campaign => campaign.type === type);
    }

    // Sort by creation date (newest first)
    campaigns.sort((a, b) => b.createdAt - a.createdAt);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCampaigns = campaigns.slice(startIndex, endIndex);

    res.json({
      success: true,
      campaigns: paginatedCampaigns,
      pagination: {
        total: campaigns.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(campaigns.length / limit)
      }
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns',
      details: error.message
    });
  }
});

// Get single campaign
router.get('/:campaignId', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const campaign = user.campaigns.id(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign',
      details: error.message
    });
  }
});

// Create new campaign
router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const {
      name,
      type,
      content,
      targeting,
      autoGenerate = false,
      generateParams
    } = req.body;

    let campaignContent = content;

    // Auto-generate content if requested
    if (autoGenerate && generateParams) {
      try {
        // Track usage and check limits
        const usageResult = await usageTracker.trackUsage(req.user.userId, 'campaign', 1, {
          action: 'generate_campaign',
          type: type,
          autoGenerate: true
        });

        if (!usageResult.success) {
          return res.status(429).json({
            success: false,
            error: 'Campaign generation limit reached',
            details: 'Upgrade your plan to generate more campaigns',
            remaining: usageResult.remaining,
            limit: usageResult.limit
          });
        }

        // Notify via socket about generation start
        const socketService = req.app.locals.socketService;
        if (socketService) {
          await socketService.sendGenerationProgress(req.user.userId, {
            type: 'campaign',
            step: 'Starting generation',
            progress: 0
          });
        }

        const generatedContent = await aiService.generateCampaignContent({
          ...generateParams,
          channel: type
        });

        campaignContent = {
          headline: generatedContent.headline,
          body: generatedContent.mainCopy,
          cta: generatedContent.callToAction
        };

        // Notify completion
        if (socketService) {
          await socketService.sendGenerationProgress(req.user.userId, {
            type: 'campaign',
            step: 'Generation complete',
            progress: 100
          });
        }

      } catch (aiError) {
        console.error('AI generation error:', aiError);
        
        // If it's a usage limit error, return it
        if (aiError.message.includes('limit reached')) {
          return res.status(429).json({
            success: false,
            error: aiError.message
          });
        }
        
        // Continue with provided content if AI fails for other reasons
      }
    }

    const newCampaign = {
      name,
      type,
      status: 'draft',
      content: campaignContent || {},
      targeting: targeting || {},
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add campaign using user method
    await user.addCampaign(newCampaign);
    const createdCampaign = user.campaigns[user.campaigns.length - 1];

    // Send real-time notification
    const socketService = req.app.locals.socketService;
    if (socketService) {
      await socketService.sendNotification(req.user.userId, {
        type: 'campaign_created',
        title: 'Campaign Created',
        message: `Campaign "${name}" has been created successfully`,
        campaignId: createdCampaign._id
      });
    }

    res.status(201).json({
      success: true,
      campaign: createdCampaign,
      message: autoGenerate ? 'Campaign created with AI-generated content' : 'Campaign created successfully',
      usage: await usageTracker.getUserUsageStats(req.user.userId)
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign',
      details: error.message
    });
  }
});

// Update campaign
router.put('/:campaignId', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update campaign using user method
    await user.updateCampaign(req.params.campaignId, req.body);
    const updatedCampaign = user.campaigns.id(req.params.campaignId);

    // Send real-time update
    const socketService = req.app.locals.socketService;
    if (socketService) {
      await socketService.sendCampaignMetrics(req.user.userId, req.params.campaignId, {
        ...updatedCampaign.metrics,
        lastUpdate: new Date()
      });
    }

    res.json({
      success: true,
      campaign: updatedCampaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update campaign',
      details: error.message
    });
  }
});

// Delete campaign
router.delete('/:campaignId', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete campaign using user method
    await user.deleteCampaign(req.params.campaignId);

    // Send real-time notification
    const socketService = req.app.locals.socketService;
    if (socketService) {
      await socketService.sendNotification(req.user.userId, {
        type: 'campaign_deleted',
        title: 'Campaign Deleted',
        message: 'Campaign has been deleted successfully',
        campaignId: req.params.campaignId
      });
    }

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete campaign',
      details: error.message
    });
  }
});

// Launch campaign (change status to active)
router.post('/:campaignId/launch', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const campaign = user.campaigns.id(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Campaign can only be launched from draft status'
      });
    }

    campaign.status = 'active';
    campaign.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      campaign,
      message: 'Campaign launched successfully'
    });
  } catch (error) {
    console.error('Launch campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to launch campaign',
      details: error.message
    });
  }
});

// Pause campaign
router.post('/:campaignId/pause', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const campaign = user.campaigns.id(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Only active campaigns can be paused'
      });
    }

    campaign.status = 'paused';
    campaign.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      campaign,
      message: 'Campaign paused successfully'
    });
  } catch (error) {
    console.error('Pause campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause campaign',
      details: error.message
    });
  }
});

// Update campaign metrics
router.put('/:campaignId/metrics', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const campaign = user.campaigns.id(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const { impressions, clicks, conversions, spend } = req.body;

    // Update metrics
    if (impressions !== undefined) campaign.metrics.impressions = impressions;
    if (clicks !== undefined) campaign.metrics.clicks = clicks;
    if (conversions !== undefined) campaign.metrics.conversions = conversions;
    if (spend !== undefined) campaign.metrics.spend = spend;

    campaign.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      campaign,
      message: 'Campaign metrics updated successfully'
    });
  } catch (error) {
    console.error('Update metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update campaign metrics',
      details: error.message
    });
  }
});

// Get campaign performance summary
router.get('/:campaignId/performance', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const campaign = user.campaigns.id(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const metrics = campaign.metrics;
    const performance = {
      impressions: metrics.impressions,
      clicks: metrics.clicks,
      conversions: metrics.conversions,
      spend: metrics.spend,
      ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100).toFixed(2) : 0,
      conversionRate: metrics.clicks > 0 ? (metrics.conversions / metrics.clicks * 100).toFixed(2) : 0,
      cpc: metrics.clicks > 0 ? (metrics.spend / metrics.clicks).toFixed(2) : 0,
      cpa: metrics.conversions > 0 ? (metrics.spend / metrics.conversions).toFixed(2) : 0,
      roi: metrics.spend > 0 ? (((metrics.conversions * 100) - metrics.spend) / metrics.spend * 100).toFixed(2) : 0
    };

    res.json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status
      },
      performance,
      timeframe: {
        start: campaign.createdAt,
        end: new Date()
      }
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get campaign performance',
      details: error.message
    });
  }
});

// Get campaign analytics
router.get('/:campaignId/analytics', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const campaign = user.campaigns.id(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Track analytics request
    await usageTracker.trackUsage(req.user.userId, 'analysis', 1, {
      action: 'campaign_analytics',
      campaignId: req.params.campaignId
    });

    // Generate analytics data (in production, this would come from real data)
    const analytics = {
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status
      },
      metrics: campaign.metrics,
      performance: {
        ctr: campaign.metrics.impressions > 0 ? ((campaign.metrics.clicks / campaign.metrics.impressions) * 100).toFixed(2) : 0,
        cpc: campaign.metrics.clicks > 0 ? (campaign.metrics.spend / campaign.metrics.clicks).toFixed(2) : 0,
        conversionRate: campaign.metrics.clicks > 0 ? ((campaign.metrics.conversions / campaign.metrics.clicks) * 100).toFixed(2) : 0,
        costPerConversion: campaign.metrics.conversions > 0 ? (campaign.metrics.spend / campaign.metrics.conversions).toFixed(2) : 0
      },
      trends: {
        impressionsTrend: '+15%',
        clicksTrend: '+8%',
        conversionsTrend: '+12%'
      },
      timestamp: new Date()
    };

    res.json({
      success: true,
      analytics,
      usage: await usageTracker.getUserUsageStats(req.user.userId)
    });
  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign analytics',
      details: error.message
    });
  }
});

// Get user campaign statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const campaignStats = user.getCampaignStats();
    const usageStats = await usageTracker.getUserUsageStats(req.user.userId);

    res.json({
      success: true,
      stats: {
        campaigns: campaignStats,
        usage: usageStats,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Campaign stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign statistics',
      details: error.message
    });
  }
});

module.exports = router; 