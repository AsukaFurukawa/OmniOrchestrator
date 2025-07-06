const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { timeframe = '30d' } = req.query;
    
    // Calculate performance metrics
    const totalPerformance = user.getTotalPerformance();
    const activeCampaigns = user.getActiveCampaigns();
    
    // Generate mock analytics data
    const analytics = {
      overview: {
        totalCampaigns: user.campaigns.length,
        activeCampaigns: activeCampaigns.length,
        totalImpressions: totalPerformance.impressions,
        totalClicks: totalPerformance.clicks,
        totalConversions: totalPerformance.conversions,
        totalSpend: totalPerformance.spend,
        averageCTR: totalPerformance.impressions > 0 ? 
          (totalPerformance.clicks / totalPerformance.impressions * 100).toFixed(2) : 0,
        averageConversionRate: totalPerformance.clicks > 0 ? 
          (totalPerformance.conversions / totalPerformance.clicks * 100).toFixed(2) : 0
      },
      trends: {
        impressions: generateTrendData(7),
        clicks: generateTrendData(7),
        conversions: generateTrendData(7),
        spend: generateTrendData(7)
      },
      topCampaigns: user.campaigns
        .sort((a, b) => b.metrics.impressions - a.metrics.impressions)
        .slice(0, 5)
        .map(campaign => ({
          id: campaign._id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          impressions: campaign.metrics.impressions,
          clicks: campaign.metrics.clicks,
          conversions: campaign.metrics.conversions,
          ctr: campaign.metrics.impressions > 0 ? 
            (campaign.metrics.clicks / campaign.metrics.impressions * 100).toFixed(2) : 0
        })),
      channelPerformance: calculateChannelPerformance(user.campaigns),
      timeframe
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard analytics',
      details: error.message
    });
  }
});

// Get detailed campaign analytics
router.get('/campaigns/:campaignId', async (req, res) => {
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

    const analytics = {
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      },
      metrics: campaign.metrics,
      performance: {
        ctr: campaign.metrics.impressions > 0 ? 
          (campaign.metrics.clicks / campaign.metrics.impressions * 100).toFixed(2) : 0,
        conversionRate: campaign.metrics.clicks > 0 ? 
          (campaign.metrics.conversions / campaign.metrics.clicks * 100).toFixed(2) : 0,
        cpc: campaign.metrics.clicks > 0 ? 
          (campaign.metrics.spend / campaign.metrics.clicks).toFixed(2) : 0,
        cpa: campaign.metrics.conversions > 0 ? 
          (campaign.metrics.spend / campaign.metrics.conversions).toFixed(2) : 0
      },
      trends: {
        daily: generateTrendData(30),
        hourly: generateTrendData(24)
      },
      demographics: generateDemographicsData(),
      deviceBreakdown: generateDeviceData(),
      locationBreakdown: generateLocationData()
    };

    res.json({
      success: true,
      analytics
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

// Get API usage analytics
router.get('/api-usage', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const usage = user.apiUsage;
    
    const analytics = {
      currentMonth: usage.currentMonth,
      limits: usage.limits,
      utilization: {
        campaignGenerations: usage.limits.campaignGenerations > 0 ? 
          (usage.currentMonth.campaignGenerations / usage.limits.campaignGenerations * 100).toFixed(1) : 0,
        imageGenerations: usage.limits.imageGenerations > 0 ? 
          (usage.currentMonth.imageGenerations / usage.limits.imageGenerations * 100).toFixed(1) : 0,
        analysisRequests: usage.limits.analysisRequests > 0 ? 
          (usage.currentMonth.analysisRequests / usage.limits.analysisRequests * 100).toFixed(1) : 0
      },
      history: usage.history.slice(-6), // Last 6 months
      predictions: generateUsagePredictions(usage.history)
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('API usage analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API usage analytics',
      details: error.message
    });
  }
});

// Get ROI analytics
router.get('/roi', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const totalPerformance = user.getTotalPerformance();
    
    // Simulate revenue data (in a real app, this would come from e-commerce integration)
    const estimatedRevenue = totalPerformance.conversions * 50; // $50 per conversion
    
    const roiAnalytics = {
      totalSpend: totalPerformance.spend,
      estimatedRevenue: estimatedRevenue,
      netProfit: estimatedRevenue - totalPerformance.spend,
      roi: totalPerformance.spend > 0 ? 
        ((estimatedRevenue - totalPerformance.spend) / totalPerformance.spend * 100).toFixed(2) : 0,
      roas: totalPerformance.spend > 0 ? 
        (estimatedRevenue / totalPerformance.spend).toFixed(2) : 0,
      campaignROI: user.campaigns.map(campaign => {
        const revenue = campaign.metrics.conversions * 50;
        const spend = campaign.metrics.spend;
        return {
          id: campaign._id,
          name: campaign.name,
          spend: spend,
          revenue: revenue,
          roi: spend > 0 ? ((revenue - spend) / spend * 100).toFixed(2) : 0
        };
      }).sort((a, b) => b.roi - a.roi),
      monthlyTrends: generateROITrends(6)
    };

    res.json({
      success: true,
      analytics: roiAnalytics
    });
  } catch (error) {
    console.error('ROI analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ROI analytics',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/analytics/advanced/campaign
 * @desc    Get advanced AI-powered campaign analysis
 * @access  Private
 */
router.post('/advanced/campaign', auth, tenantContext, async (req, res) => {
  try {
    const { campaignId, options = {} } = req.body;
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      });
    }

    // Check usage limits
    if (global.usageTracker) {
      const canUse = await global.usageTracker.checkUsageLimit(
        req.user.id,
        req.tenant?.id,
        'advanced_analytics'
      );
      
      if (!canUse.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Advanced analytics limit exceeded',
          limit: canUse.limit,
          used: canUse.used
        });
      }
    }

    // Get advanced analytics
    const analysis = await global.advancedAnalytics.analyzeCampaignPerformance(
      req.user.id,
      campaignId,
      options
    );

    // Track usage
    if (global.usageTracker) {
      await global.usageTracker.trackUsage(
        req.user.id,
        req.tenant?.id,
        'advanced_analytics',
        1
      );
    }

    // Send real-time updates
    if (global.socketService) {
      global.socketService.sendToUser(req.user.id, 'advanced_analytics', {
        type: 'campaign_analysis',
        campaignId,
        performanceScore: analysis.analysis.overview.performanceScore,
        status: analysis.analysis.overview.status,
        timestamp: new Date()
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate advanced analytics'
    });
  }
});

/**
 * @route   POST /api/analytics/sentiment/brand
 * @desc    Analyze brand sentiment across sources
 * @access  Private
 */
router.post('/sentiment/brand', auth, tenantContext, async (req, res) => {
  try {
    const { brandName, options = {} } = req.body;
    
    if (!brandName) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    // Check usage limits - development bypass
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Bypassing sentiment analysis usage limits');
    } else if (global.usageTracker && global.usageTracker.checkUsageLimit) {
      try {
        const canUse = await global.usageTracker.checkUsageLimit(
          req.user.id,
          req.tenant?.id,
          'sentiment_analysis'
        );
        
        if (!canUse.allowed) {
          return res.status(429).json({
            success: false,
            error: 'Sentiment analysis limit exceeded',
            limit: canUse.limit,
            used: canUse.used
          });
        }
      } catch (error) {
        console.log('🔧 Usage tracking error, continuing in development mode:', error.message);
      }
    }

    // Analyze brand sentiment
    const analysis = await global.sentimentAnalysis.analyzeBrandSentiment(
      brandName,
      options
    );

    // Track usage - skip in development mode to avoid DB errors
    if (global.usageTracker && process.env.NODE_ENV !== 'development') {
      try {
        await global.usageTracker.trackUsage(
          req.user.id,
          req.tenant?.id,
          'sentiment_analysis',
          1
        );
      } catch (error) {
        console.log('Usage tracking error:', error.message);
        // Don't fail the sentiment analysis if usage tracking fails
      }
    }

    // Send real-time updates
    if (global.socketService) {
      global.socketService.sendToUser(req.user.id, 'sentiment_analysis', {
        brandName,
        overall: analysis.sentiment.overall,
        volume: analysis.sentiment.volume,
        timestamp: new Date()
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sentiment'
    });
  }
});

/**
 * @route   POST /api/analytics/sentiment/content
 * @desc    Analyze sentiment of specific content
 * @access  Private
 */
router.post('/sentiment/content', auth, tenantContext, async (req, res) => {
  try {
    const { text, contentType = 'general' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required'
      });
    }

    // Check usage limits - development bypass  
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Bypassing content sentiment analysis usage limits');
    } else if (global.usageTracker && global.usageTracker.checkUsageLimit) {
      try {
        const canUse = await global.usageTracker.checkUsageLimit(
          req.user.id,
          req.tenant?.id,
          'sentiment_analysis'
        );
        
        if (!canUse.allowed) {
          return res.status(429).json({
            success: false,
            error: 'Sentiment analysis limit exceeded',
            limit: canUse.limit,
            used: canUse.used
          });
        }
      } catch (error) {
        console.log('🔧 Usage tracking error, continuing in development mode:', error.message);
      }
    }

    // Analyze content sentiment
    const analysis = await global.sentimentAnalysis.analyzeSingleContent(text, contentType);

    // Track usage - skip in development mode to avoid DB errors
    if (global.usageTracker && process.env.NODE_ENV !== 'development') {
      try {
        await global.usageTracker.trackUsage(
          req.user.id,
          req.tenant?.id,
          'sentiment_analysis',
          1
        );
      } catch (error) {
        console.log('Usage tracking error:', error.message);
        // Don't fail the sentiment analysis if usage tracking fails
      }
    }

    res.json({
      success: true,
      sentiment: analysis,
      contentType,
      analyzedAt: new Date()
    });
  } catch (error) {
    console.error('Content sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze content sentiment'
    });
  }
});

/**
 * @route   POST /api/analytics/sentiment/monitoring/start
 * @desc    Start real-time sentiment monitoring
 * @access  Private
 */
router.post('/sentiment/monitoring/start', auth, tenantContext, async (req, res) => {
  try {
    const { brandName, options = {} } = req.body;
    
    if (!brandName) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    // Start monitoring
    const monitoring = await global.sentimentAnalysis.startRealtimeMonitoring(
      req.user.id,
      brandName,
      options
    );

    res.json(monitoring);
  } catch (error) {
    console.error('Sentiment monitoring start error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start sentiment monitoring'
    });
  }
});

/**
 * @route   POST /api/analytics/sentiment/monitoring/stop
 * @desc    Stop real-time sentiment monitoring
 * @access  Private
 */
router.post('/sentiment/monitoring/stop', auth, tenantContext, async (req, res) => {
  try {
    const { monitoringId } = req.body;
    
    if (!monitoringId) {
      return res.status(400).json({
        success: false,
        error: 'Monitoring ID is required'
      });
    }

    // Stop monitoring
    const result = global.sentimentAnalysis.stopMonitoring(monitoringId);

    res.json(result);
  } catch (error) {
    console.error('Sentiment monitoring stop error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop sentiment monitoring'
    });
  }
});

/**
 * @route   GET /api/analytics/sentiment/alerts
 * @desc    Get sentiment alerts for user
 * @access  Private
 */
router.get('/sentiment/alerts', auth, tenantContext, async (req, res) => {
  try {
    const alerts = global.sentimentAnalysis.getUserAlerts(req.user.id);

    res.json({
      success: true,
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Sentiment alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sentiment alerts'
    });
  }
});

// Get general metrics (new endpoint for company page)
router.get('/metrics', async (req, res) => {
  try {
    let user = await User.findById(req.user.userId);
    
    // Handle development mode - create mock user data if user doesn't exist
    if (!user && process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using mock user data');
      user = {
        campaigns: [
          {
            _id: 'mock-campaign-1',
            name: 'Summer Sale Campaign',
            type: 'email',
            status: 'active',
            metrics: { impressions: 15420, clicks: 1242, conversions: 86, spend: 450 }
          },
          {
            _id: 'mock-campaign-2', 
            name: 'Brand Awareness Campaign',
            type: 'social',
            status: 'active',
            metrics: { impressions: 8930, clicks: 567, conversions: 23, spend: 280 }
          }
        ],
        company: 'Demo Company',
        industry: 'Technology',
        apiUsage: {
          currentMonth: {
            campaignGenerations: 12,
            imageGenerations: 8,
            analysisRequests: 25,
            totalRequests: 45
          }
        },
        getTotalPerformance: () => ({
          impressions: 24350,
          clicks: 1809,
          conversions: 109,
          spend: 730
        }),
        getActiveCampaigns: () => user.campaigns.filter(c => c.status === 'active')
      };
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const totalPerformance = user.getTotalPerformance();
    const activeCampaigns = user.getActiveCampaigns();
    
    const metrics = {
      campaigns: {
        total: user.campaigns.length,
        active: activeCampaigns.length,
        draft: user.campaigns.filter(c => c.status === 'draft').length,
        completed: user.campaigns.filter(c => c.status === 'completed').length
      },
      performance: {
        totalImpressions: totalPerformance.impressions,
        totalClicks: totalPerformance.clicks,
        totalConversions: totalPerformance.conversions,
        totalSpend: totalPerformance.spend,
        averageCTR: totalPerformance.impressions > 0 ? 
          (totalPerformance.clicks / totalPerformance.impressions * 100).toFixed(2) : 0,
        averageConversionRate: totalPerformance.clicks > 0 ? 
          (totalPerformance.conversions / totalPerformance.clicks * 100).toFixed(2) : 0
      },
      usage: user.apiUsage.currentMonth,
      companyProfile: {
        name: user.company || 'Not Set',
        industry: user.industry || 'Not Set',
        profileCompleted: !!(user.company && user.industry)
      }
    };

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
      details: error.message
    });
  }
});

// Get detailed metrics (new endpoint for company page)
router.get('/detailed-metrics', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const totalPerformance = user.getTotalPerformance();
    const activeCampaigns = user.getActiveCampaigns();
    
    const detailedMetrics = {
      overview: {
        totalCampaigns: user.campaigns.length,
        activeCampaigns: activeCampaigns.length,
        totalImpressions: totalPerformance.impressions,
        totalClicks: totalPerformance.clicks,
        totalConversions: totalPerformance.conversions,
        totalSpend: totalPerformance.spend
      },
      performance: {
        ctr: totalPerformance.impressions > 0 ? 
          (totalPerformance.clicks / totalPerformance.impressions * 100).toFixed(2) : 0,
        conversionRate: totalPerformance.clicks > 0 ? 
          (totalPerformance.conversions / totalPerformance.clicks * 100).toFixed(2) : 0,
        costPerClick: totalPerformance.clicks > 0 ? 
          (totalPerformance.spend / totalPerformance.clicks).toFixed(2) : 0,
        costPerAcquisition: totalPerformance.conversions > 0 ? 
          (totalPerformance.spend / totalPerformance.conversions).toFixed(2) : 0
      },
      channelBreakdown: calculateChannelPerformance(user.campaigns),
      recentActivity: user.campaigns.slice(-5).map(campaign => ({
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        createdAt: campaign.createdAt,
        performance: campaign.metrics
      })),
      trends: {
        last7Days: generateTrendData(7),
        last30Days: generateTrendData(30)
      }
    };

    res.json({
      success: true,
      detailedMetrics
    });
  } catch (error) {
    console.error('Detailed metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch detailed metrics',
      details: error.message
    });
  }
});

// Helper functions
function generateTrendData(days) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 10
    });
  }
  return data;
}

function calculateChannelPerformance(campaigns) {
  const channels = {};
  
  campaigns.forEach(campaign => {
    if (!channels[campaign.type]) {
      channels[campaign.type] = {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        campaigns: 0
      };
    }
    
    channels[campaign.type].impressions += campaign.metrics.impressions;
    channels[campaign.type].clicks += campaign.metrics.clicks;
    channels[campaign.type].conversions += campaign.metrics.conversions;
    channels[campaign.type].spend += campaign.metrics.spend;
    channels[campaign.type].campaigns += 1;
  });
  
  return Object.entries(channels).map(([type, metrics]) => ({
    channel: type,
    ...metrics,
    ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions * 100).toFixed(2) : 0,
    conversionRate: metrics.clicks > 0 ? (metrics.conversions / metrics.clicks * 100).toFixed(2) : 0
  }));
}

function generateDemographicsData() {
  return {
    ageGroups: [
      { range: '18-24', percentage: 15, clicks: 150, conversions: 12 },
      { range: '25-34', percentage: 35, clicks: 350, conversions: 45 },
      { range: '35-44', percentage: 25, clicks: 250, conversions: 38 },
      { range: '45-54', percentage: 15, clicks: 150, conversions: 22 },
      { range: '55+', percentage: 10, clicks: 100, conversions: 15 }
    ],
    gender: [
      { type: 'Male', percentage: 55, clicks: 550, conversions: 68 },
      { type: 'Female', percentage: 45, clicks: 450, conversions: 64 }
    ]
  };
}

function generateDeviceData() {
  return [
    { device: 'Mobile', percentage: 65, clicks: 650, conversions: 78 },
    { device: 'Desktop', percentage: 30, clicks: 300, conversions: 45 },
    { device: 'Tablet', percentage: 5, clicks: 50, conversions: 9 }
  ];
}

function generateLocationData() {
  return [
    { location: 'United States', percentage: 40, clicks: 400, conversions: 60 },
    { location: 'Canada', percentage: 15, clicks: 150, conversions: 22 },
    { location: 'United Kingdom', percentage: 12, clicks: 120, conversions: 18 },
    { location: 'Germany', percentage: 10, clicks: 100, conversions: 15 },
    { location: 'Other', percentage: 23, clicks: 230, conversions: 17 }
  ];
}

function generateUsagePredictions(history) {
  if (history.length < 2) return {};
  
  const recent = history.slice(-3);
  const avgGrowth = recent.reduce((sum, month, index) => {
    if (index === 0) return 0;
    const prev = recent[index - 1];
    const growth = (month.usage.totalRequests - prev.usage.totalRequests) / prev.usage.totalRequests;
    return sum + growth;
  }, 0) / (recent.length - 1);
  
  const lastMonth = recent[recent.length - 1];
  const predictedNext = Math.max(0, Math.floor(lastMonth.usage.totalRequests * (1 + avgGrowth)));
  
  return {
    nextMonth: predictedNext,
    growthRate: (avgGrowth * 100).toFixed(1)
  };
}

function generateROITrends(months) {
  const trends = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    trends.push({
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      spend: Math.floor(Math.random() * 5000) + 1000,
      revenue: Math.floor(Math.random() * 8000) + 2000,
      roi: Math.floor(Math.random() * 200) + 50
    });
  }
  return trends;
}

module.exports = router; 