const express = require('express');
const User = require('../models/User');
const AIService = require('../services/aiService');

const router = express.Router();
const aiService = new AIService();

// Get all campaigns for user
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
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
      // Check API limits
      if (user.hasReachedLimit('campaign')) {
        return res.status(429).json({
          success: false,
          error: 'Campaign generation limit reached',
          details: 'Upgrade your plan to generate more campaigns'
        });
      }

      try {
        const generatedContent = await aiService.generateCampaignContent({
          ...generateParams,
          channel: type
        });

        campaignContent = {
          headline: generatedContent.headline,
          body: generatedContent.mainCopy,
          cta: generatedContent.callToAction
        };

        // Increment usage
        await user.incrementUsage('campaign');
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        // Continue with provided content if AI fails
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

    user.campaigns.push(newCampaign);
    await user.save();

    const createdCampaign = user.campaigns[user.campaigns.length - 1];

    res.status(201).json({
      success: true,
      campaign: createdCampaign,
      message: autoGenerate ? 'Campaign created with AI-generated content' : 'Campaign created successfully'
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

    const campaign = user.campaigns.id(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const { name, content, targeting, status } = req.body;

    // Update campaign fields
    if (name) campaign.name = name;
    if (content) campaign.content = { ...campaign.content, ...content };
    if (targeting) campaign.targeting = { ...campaign.targeting, ...targeting };
    if (status) campaign.status = status;

    campaign.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      campaign,
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

    const campaign = user.campaigns.id(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    campaign.remove();
    await user.save();

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

module.exports = router; 