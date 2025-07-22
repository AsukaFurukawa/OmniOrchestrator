const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');
const AdvancedAnalytics = require('../services/advancedAnalytics');
const ComprehensiveMarketingAnalyzer = require('../services/comprehensiveMarketingAnalyzer');

const router = express.Router();

// Initialize services
const advancedAnalytics = new AdvancedAnalytics();
const comprehensiveAnalyzer = new ComprehensiveMarketingAnalyzer();

// Get dashboard analytics (no auth required for development)
router.get('/dashboard', (req, res) => {
  try {
    console.log('📊 Dashboard analytics requested');
    
    // Generate mock dashboard data since we don't have real campaign data yet
    const dashboardData = {
      success: true,
      activeCampaigns: 12,
      totalReach: 847000,
      conversions: 156,
      engagementRate: 4.2,
      campaigns: [
        {
          id: 1,
          name: 'Brand Awareness Q4',
          status: 'active',
          reach: 125000,
          engagement: 0.035,
          conversions: 45,
          spend: 2500,
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        },
        {
          id: 2,
          name: 'Product Launch',
          status: 'active', 
          reach: 89000,
          engagement: 0.042,
          conversions: 67,
          spend: 3200,
          startDate: '2024-01-15',
          endDate: '2024-02-15'
        },
        {
          id: 3,
          name: 'Holiday Special',
          status: 'completed',
          reach: 156000,
          engagement: 0.055,
          conversions: 89,
          spend: 1800,
          startDate: '2023-12-01',
          endDate: '2023-12-31'
        }
      ],
      recentCampaigns: [
        {
          id: 4,
          name: 'Summer Promotion',
          metrics: { impressions: 45000, clicks: 1800, conversions: 23 },
          performance: 'good',
          lastUpdated: '2 hours ago'
        },
        {
          id: 5,
          name: 'Newsletter Campaign',
          metrics: { impressions: 12000, clicks: 890, conversions: 45 },
          performance: 'excellent',
          lastUpdated: '4 hours ago'
        }
      ],
      trending: [
        { content: 'AI Marketing Trends', engagement: 89, platform: 'LinkedIn' },
        { content: 'Video Content Strategy', engagement: 76, platform: 'YouTube' },
        { content: 'Social Commerce', engagement: 92, platform: 'Instagram' }
      ],
      channelPerformance: [
        { channel: 'Email', performance: 85, reach: 25000, conversions: 45 },
        { channel: 'Social Media', performance: 72, reach: 45000, conversions: 67 },
        { channel: 'Search Ads', performance: 91, reach: 15000, conversions: 89 },
        { channel: 'Display Ads', performance: 68, reach: 35000, conversions: 34 }
      ],
      generatedAt: new Date().toISOString()
    };

    console.log('✅ Dashboard analytics data generated');
    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard analytics',
      details: error.message
    });
  }
});

// HACKATHON MODE: Recent Activity endpoint
router.get('/recent-activity', (req, res) => {
  try {
    console.log('📊 Recent activity requested');
    
    // Generate impressive recent activity data
    const recentActivity = [
      {
        id: 'activity-1',
        type: 'campaign_launched',
        title: 'New Campaign Launched',
        description: 'Q4 Brand Awareness campaign went live with AI optimization',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        icon: '🚀',
        status: 'success',
        metadata: {
          campaignName: 'Q4 Brand Awareness',
          platform: 'Multi-channel',
          budget: '$2,500',
          expectedReach: '50K+'
        }
      },
      {
        id: 'activity-2',
        type: 'video_generated',
        title: 'AI Video Generated',
        description: 'Product showcase video created with 94% AI confidence score',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        icon: '🎬',
        status: 'completed',
        metadata: {
          videoTitle: 'Product Demo V2',
          duration: '15 seconds',
          style: 'Professional',
          aiConfidence: '94%'
        }
      },
      {
        id: 'activity-3',
        type: 'sentiment_alert',
        title: 'Positive Sentiment Spike',
        description: 'Brand sentiment increased to 8.4/10 following recent campaign',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        icon: '📈',
        status: 'positive',
        metadata: {
          previousScore: '7.8/10',
          currentScore: '8.4/10',
          improvement: '+7.7%',
          trigger: 'Social media campaign'
        }
      },
      {
        id: 'activity-4',
        type: 'analytics_insight',
        title: 'Performance Insight Detected',
        description: 'Video content showing 340% higher engagement than static posts',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        icon: '💡',
        status: 'insight',
        metadata: {
          insightType: 'Content Performance',
          videoEngagement: '7.2%',
          staticEngagement: '2.1%',
          recommendation: 'Increase video content frequency'
        }
      },
      {
        id: 'activity-5',
        type: 'campaign_optimized',
        title: 'Campaign Auto-Optimized',
        description: 'AI optimization improved conversion rate by 15% for Product Launch campaign',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        icon: '⚡',
        status: 'optimized',
        metadata: {
          campaignName: 'Product Launch',
          previousCR: '3.6%',
          newCR: '4.2%',
          improvement: '+15%',
          optimizationType: 'Audience targeting'
        }
      },
      {
        id: 'activity-6',
        type: 'competitor_analysis',
        title: 'Competitor Analysis Complete',
        description: 'Identified content gaps where competitors are underperforming',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        icon: '🔍',
        status: 'completed',
        metadata: {
          competitorsAnalyzed: 5,
          contentGaps: ['Video tutorials', 'Customer stories'],
          opportunity: 'Video content gap (60% below optimal)',
          urgency: 'High priority'
        }
      }
    ];

    res.json({
      success: true,
      data: {
        activities: recentActivity,
        totalActivities: recentActivity.length,
        lastUpdated: new Date().toISOString(),
        summary: {
          campaigns: 2,
          videos: 1,
          insights: 3,
          optimizations: 1
        },
        nextUpdate: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
      }
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load recent activity',
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

/**
 * @route   POST /api/analytics/sentiment/enhanced
 * @desc    Get enhanced sentiment analysis with VADER details
 * @access  Private
 */
router.post('/sentiment/enhanced', auth, tenantContext, async (req, res) => {
  try {
    const { text, context = 'market' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for enhanced analysis'
      });
    }

    console.log('📊 Enhanced VADER sentiment analysis requested');
    
    // Get enhanced analysis
    const analysis = await global.sentimentAnalysis.simpleAnalyzer.analyzeSentiment(text, context);
    
    // Get learning stats
    const learningStats = global.sentimentAnalysis.simpleAnalyzer.getLearningStats();

    res.json({
      success: true,
      analysis: {
        score: analysis.score,
        label: analysis.label,
        confidence: analysis.confidence,
        themes: analysis.themes,
        entities: analysis.entities,
        emotions: analysis.emotions,
        positives: analysis.positives,
        negatives: analysis.negatives,
        method: analysis.method,
        vader_score: analysis.vader_score,
        market_score: analysis.market_score,
        total_matches: analysis.total_matches,
        text_length: analysis.text_length,
        analyzed_at: analysis.analyzed_at
      },
      learning_stats: learningStats,
      message: `✅ VADER Market Analysis - ${analysis.label} (${(analysis.confidence * 100).toFixed(1)}% confidence)`
    });
  } catch (error) {
    console.error('Enhanced sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform enhanced sentiment analysis'
    });
  }
});

/**
 * @route   POST /api/analytics/sentiment/feedback
 * @desc    Provide feedback to improve sentiment analysis
 * @access  Private
 */
router.post('/sentiment/feedback', auth, tenantContext, async (req, res) => {
  try {
    const { text, userFeedback } = req.body;
    
    if (!text || !userFeedback) {
      return res.status(400).json({
        success: false,
        error: 'Text and user feedback are required'
      });
    }

    if (!['positive', 'negative', 'neutral'].includes(userFeedback)) {
      return res.status(400).json({
        success: false,
        error: 'User feedback must be positive, negative, or neutral'
      });
    }

    console.log('🎓 User feedback received for sentiment analysis');
    
    // Update model with feedback
    const result = global.sentimentAnalysis.simpleAnalyzer.updateModel(text, userFeedback);

    res.json({
      success: true,
      result,
      message: '✅ Model updated with your feedback!'
    });
  } catch (error) {
    console.error('Sentiment feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process feedback'
    });
  }
});

/**
 * @route   GET /api/analytics/sentiment/learning-stats
 * @desc    Get learning statistics for sentiment analysis
 * @access  Private
 */
router.get('/sentiment/learning-stats', auth, tenantContext, async (req, res) => {
  try {
    const learningStats = global.sentimentAnalysis.simpleAnalyzer.getLearningStats();

    res.json({
      success: true,
      learning_stats: learningStats,
      message: '✅ Learning statistics retrieved'
    });
  } catch (error) {
    console.error('Learning stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning statistics'
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
    const user = await User.findById(req.user?.userId);
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

// Get marketing strategy recommendations
router.post('/strategy-recommendations', async (req, res) => {
  try {
    const { brandName, options = {} } = req.body;
    
    if (!brandName) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    // Get user context safely
    const user = req.user || { id: 'demo-user', email: 'demo@example.com' };
    const userId = user.id || user.userId || 'demo-user';

    console.log(`🎯 Generating marketing strategy for brand: ${brandName}`);
    
    const strategy = await advancedAnalytics.generateMarketingStrategy(
      userId,
      brandName,
      options
    );

    res.json({
      success: true,
      strategy,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Marketing strategy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate marketing strategy',
      details: error.message
    });
  }
});

// Get enhanced analytics dashboard with recommendations
router.get('/enhanced-dashboard', async (req, res) => {
  try {
    const { brandName = 'Default Brand', timeframe = '30d' } = req.query;
    
    // Get user context safely
    const user = req.user || { id: 'demo-user', email: 'demo@example.com' };
    const userId = user.id || user.userId || 'demo-user';
    
    // Get basic analytics
    const basicAnalytics = await getDashboardAnalytics(userId, timeframe);
    
    // Get marketing strategy recommendations
    const strategy = await advancedAnalytics.generateMarketingStrategy(
      userId,
      brandName,
      { timeframe, budget: 5000 }
    );
    
    // Combine with existing analytics
    const enhancedAnalytics = {
      ...basicAnalytics,
      marketingStrategy: strategy,
      recommendations: {
        immediate: strategy.strategy.immediate_actions,
        longTerm: strategy.strategy.long_term_goals,
        campaigns: strategy.campaignSuggestions,
        timing: strategy.timingRecommendations,
        budget: strategy.budgetOptimization
      },
      competitiveInsights: strategy.competitiveAnalysis,
      sentimentInsights: strategy.sentimentInsights,
      nextActions: generateNextActions(strategy),
      priorityLevel: strategy.strategy.priority,
      generatedAt: new Date()
    };

    res.json({
      success: true,
      analytics: enhancedAnalytics,
      timeframe
    });
  } catch (error) {
    console.error('Enhanced analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enhanced analytics',
      details: error.message
    });
  }
});

// Get campaign optimization recommendations
router.post('/campaign-optimization', async (req, res) => {
  try {
    const { campaignId, optimizationGoals = [] } = req.body;
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const campaign = user.campaigns.id(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Generate optimization recommendations
    const optimizations = await generateCampaignOptimizations(campaign, optimizationGoals);
    
    res.json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status
      },
      optimizations,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Campaign optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate campaign optimizations',
      details: error.message
    });
  }
});

// Get competitive analysis
router.post('/competitive-analysis', async (req, res) => {
  try {
    const { brandName, competitors = [] } = req.body;
    
    if (!brandName) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    const competitiveAnalysis = await advancedAnalytics.analyzeCompetitiveLandscape(brandName);
    
    // Add competitor-specific analysis if provided
    if (competitors.length > 0) {
      const competitorAnalysis = await Promise.all(
        competitors.map(async (competitor) => {
          return await advancedAnalytics.analyzeCompetitiveLandscape(competitor);
        })
      );
      
      competitiveAnalysis.competitors = competitorAnalysis;
      competitiveAnalysis.competitiveComparison = generateCompetitiveComparison(
        competitiveAnalysis,
        competitorAnalysis
      );
    }

    res.json({
      success: true,
      analysis: competitiveAnalysis,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Competitive analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate competitive analysis',
      details: error.message
    });
  }
});

// Get timing optimization recommendations
router.post('/timing-optimization', async (req, res) => {
  try {
    const { campaignType, targetAudience = {}, industry = 'technology' } = req.body;
    
    if (!campaignType) {
      return res.status(400).json({
        success: false,
        error: 'Campaign type is required'
      });
    }

    const timingRecommendations = generateTimingOptimization(
      campaignType,
      targetAudience,
      industry
    );

    res.json({
      success: true,
      recommendations: timingRecommendations,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Timing optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate timing recommendations',
      details: error.message
    });
  }
});

// Helper functions for enhanced analytics
async function getDashboardAnalytics(userId, timeframe) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return generateDefaultAnalytics();
    }

    const totalPerformance = user.getTotalPerformance();
    const activeCampaigns = user.getActiveCampaigns();
    
    return {
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
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return generateDefaultAnalytics();
  }
}

function generateDefaultAnalytics() {
  return {
    overview: {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalSpend: 0,
      averageCTR: 0,
      averageConversionRate: 0
    },
    trends: {
      impressions: generateTrendData(7),
      clicks: generateTrendData(7),
      conversions: generateTrendData(7),
      spend: generateTrendData(7)
    },
    topCampaigns: [],
    channelPerformance: {},
    timeframe: '30d'
  };
}

function generateNextActions(strategy) {
  const nextActions = [];
  
  // Priority-based actions
  if (strategy.strategy.priority === 'high') {
    nextActions.push({
      action: 'Urgent: Address critical issues immediately',
      priority: 'high',
      timeline: '24-48 hours',
      category: 'crisis_management'
    });
  }
  
  // Strategy-based actions
  if (strategy.strategy.immediate_actions && strategy.strategy.immediate_actions.length > 0) {
    strategy.strategy.immediate_actions.slice(0, 3).forEach((action, index) => {
      nextActions.push({
        action: action,
        priority: index === 0 ? 'high' : 'medium',
        timeline: '1-2 weeks',
        category: 'strategy_implementation'
      });
    });
  }
  
  // Campaign-based actions
  if (strategy.campaignSuggestions && strategy.campaignSuggestions.length > 0) {
    const topCampaign = strategy.campaignSuggestions[0];
    nextActions.push({
      action: `Launch ${topCampaign.title}`,
      priority: topCampaign.priority,
      timeline: topCampaign.timing?.launch_window || '2-3 weeks',
      category: 'campaign_launch'
    });
  }
  
  return nextActions;
}

async function generateCampaignOptimizations(campaign, optimizationGoals) {
  const optimizations = {
    performance: [],
    creative: [],
    targeting: [],
    budget: [],
    timing: []
  };
  
  // Performance optimizations
  const ctr = campaign.metrics.impressions > 0 ? 
    (campaign.metrics.clicks / campaign.metrics.impressions * 100) : 0;
  const conversionRate = campaign.metrics.clicks > 0 ? 
    (campaign.metrics.conversions / campaign.metrics.clicks * 100) : 0;
  
  if (ctr < 2.0) {
    optimizations.performance.push({
      issue: 'Low click-through rate',
      current: `${ctr.toFixed(2)}%`,
      target: '2.5%+',
      recommendation: 'Test new ad creative and headlines',
      impact: 'high'
    });
  }
  
  if (conversionRate < 2.0) {
    optimizations.performance.push({
      issue: 'Low conversion rate',
      current: `${conversionRate.toFixed(2)}%`,
      target: '3.0%+',
      recommendation: 'Optimize landing page and CTA',
      impact: 'high'
    });
  }
  
  // Creative optimizations
  optimizations.creative.push({
    type: 'A/B Testing',
    recommendation: 'Test 3-5 different creative variations',
    expected_improvement: '15-25%',
    timeline: '2-3 weeks'
  });
  
  optimizations.creative.push({
    type: 'Mobile Optimization',
    recommendation: 'Optimize creative for mobile devices',
    expected_improvement: '10-20%',
    timeline: '1 week'
  });
  
  // Targeting optimizations
  optimizations.targeting.push({
    type: 'Audience Expansion',
    recommendation: 'Test lookalike audiences based on converters',
    expected_improvement: '20-30%',
    timeline: '1-2 weeks'
  });
  
  optimizations.targeting.push({
    type: 'Negative Keywords',
    recommendation: 'Add negative keywords to reduce irrelevant clicks',
    expected_improvement: '5-15%',
    timeline: '1 week'
  });
  
  // Budget optimizations
  const cpc = campaign.metrics.clicks > 0 ? 
    (campaign.metrics.spend / campaign.metrics.clicks) : 0;
  
  if (cpc > 3.0) {
    optimizations.budget.push({
      issue: 'High cost per click',
      current: `$${cpc.toFixed(2)}`,
      target: '$2.50',
      recommendation: 'Optimize bidding strategy and keyword targeting',
      impact: 'medium'
    });
  }
  
  // Timing optimizations
  optimizations.timing.push({
    type: 'Day Parting',
    recommendation: 'Schedule ads during peak performance hours',
    expected_improvement: '15-25%',
    timeline: '1 week'
  });
  
  return optimizations;
}

function generateCompetitiveComparison(mainAnalysis, competitorAnalyses) {
  const comparison = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };
  
  // Analyze competitive position
  const competitorStrengths = competitorAnalyses.map(c => c.competitiveStrength);
  const avgCompetitorStrength = competitorStrengths.includes('strong') ? 'strong' : 
    competitorStrengths.includes('moderate') ? 'moderate' : 'weak';
  
  if (mainAnalysis.competitiveStrength === 'strong' && avgCompetitorStrength !== 'strong') {
    comparison.strengths.push('Superior competitive position');
  }
  
  if (mainAnalysis.competitiveStrength === 'weak' && avgCompetitorStrength === 'strong') {
    comparison.weaknesses.push('Weak competitive position');
  }
  
  // Market position comparison
  const marketPositions = competitorAnalyses.map(c => c.marketPosition);
  if (mainAnalysis.marketPosition === 'emerging' && marketPositions.includes('market_leader')) {
    comparison.opportunities.push('Opportunity to challenge market leaders');
  }
  
  return comparison;
}

function generateTimingOptimization(campaignType, targetAudience, industry) {
  const timingData = {
    technology: {
      bestDays: ['tuesday', 'wednesday', 'thursday'],
      bestHours: [9, 10, 14, 15],
      avoidPeriods: ['friday_afternoon', 'monday_morning']
    },
    retail: {
      bestDays: ['thursday', 'friday', 'saturday'],
      bestHours: [11, 12, 18, 19],
      avoidPeriods: ['monday', 'early_morning']
    },
    finance: {
      bestDays: ['monday', 'tuesday', 'wednesday'],
      bestHours: [8, 9, 13, 14],
      avoidPeriods: ['friday_afternoon', 'weekends']
    }
  };
  
  const industryData = timingData[industry] || timingData.technology;
  
  const recommendations = {
    optimal_schedule: {
      days: industryData.bestDays,
      hours: industryData.bestHours,
      avoid: industryData.avoidPeriods
    },
    campaign_duration: getCampaignDuration(campaignType),
    launch_timing: generateLaunchTiming(campaignType, targetAudience),
    seasonal_considerations: getSeasonalConsiderations(industry),
    audience_timing: generateAudienceTiming(targetAudience)
  };
  
  return recommendations;
}

function getCampaignDuration(campaignType) {
  const durations = {
    'brand_awareness': '6-8 weeks',
    'lead_generation': '4-6 weeks',
    'sales_conversion': '2-4 weeks',
    'remarketing': '2-3 weeks',
    'seasonal': '1-2 weeks'
  };
  
  return durations[campaignType] || '4-6 weeks';
}

function generateLaunchTiming(campaignType, targetAudience) {
  const timing = [];
  
  if (campaignType === 'brand_awareness') {
    timing.push('Launch on Tuesday for maximum weekday reach');
    timing.push('Avoid major holidays and industry events');
  } else if (campaignType === 'sales_conversion') {
    timing.push('Launch on Thursday for weekend shopping momentum');
    timing.push('Time for seasonal shopping patterns');
  }
  
  return timing;
}

function getSeasonalConsiderations(industry) {
  const considerations = {
    technology: {
      q1: 'New year tech adoption, CES impact',
      q2: 'Conference season, B2B focus',
      q3: 'Back-to-school, productivity focus',
      q4: 'Holiday gifting, year-end budgets'
    },
    retail: {
      q1: 'New year resolutions, winter clearance',
      q2: 'Spring cleaning, Mother\'s Day',
      q3: 'Back-to-school, fall fashion',
      q4: 'Holiday shopping, Black Friday'
    },
    finance: {
      q1: 'Tax season, financial planning',
      q2: 'Mid-year reviews, investment planning',
      q3: 'Back-to-school savings, college planning',
      q4: 'Year-end tax planning, retirement'
    }
  };
  
  return considerations[industry] || considerations.technology;
}

function generateAudienceTiming(targetAudience) {
  const timing = {};
  
  if (targetAudience.ageRange) {
    if (targetAudience.ageRange.includes('18-24')) {
      timing.young_adults = 'Evening and weekend focus, social media heavy';
    }
    if (targetAudience.ageRange.includes('25-34')) {
      timing.millennials = 'Early morning and evening, work-life balance';
    }
    if (targetAudience.ageRange.includes('35-44')) {
      timing.gen_x = 'Morning and early evening, family-focused';
    }
  }
  
  return timing;
}

// NEW: Comprehensive company analysis with marketing campaigns
router.post('/analyze-company', async (req, res) => {
  try {
    const { companyName, industry, analysisDepth = 'comprehensive' } = req.body;
    
    console.log(`🔍 Starting comprehensive analysis for: ${companyName}`);
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    // Perform comprehensive analysis
    const analysis = await comprehensiveAnalyzer.analyzeCompany(companyName, {
      industry: industry || 'technology',
      depth: analysisDepth,
      userId: req.user?.userId
    });

    console.log(`✅ Analysis complete for ${companyName}`);
    
    res.json({
      success: true,
      analysis,
      generatedAt: new Date().toISOString(),
      note: 'Comprehensive marketing analysis with campaign suggestions and email templates'
    });

  } catch (error) {
    console.error('Company analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze company',
      details: error.message
    });
  }
});

// NEW: Generate specific marketing campaigns for a company
router.post('/generate-campaigns', async (req, res) => {
  try {
    const { companyName, industry, campaignTypes, targetAudience } = req.body;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    // First analyze the company
    const analysis = await comprehensiveAnalyzer.analyzeCompany(companyName, {
      industry: industry || 'technology'
    });

    // Generate specific campaigns
    const campaigns = await comprehensiveAnalyzer.generateCampaignSuggestions(
      companyName,
      industry || 'technology',
      analysis.marketingStrategy,
      analysis.sentiment
    );

    res.json({
      success: true,
      companyName,
      industry,
      campaigns,
      marketingStrategy: analysis.marketingStrategy,
      actionPlan: analysis.actionPlan,
      nextSteps: analysis.nextSteps,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Campaign generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate campaigns',
      details: error.message
    });
  }
});

// NEW: Generate video content ideas for marketing campaigns
router.post('/generate-video-ideas', async (req, res) => {
  try {
    const { companyName, industry, campaignType } = req.body;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    // Generate video ideas
    const videoIdeas = await comprehensiveAnalyzer.generateVideoContentIdeas(
      companyName,
      industry || 'technology',
      { strategicFocus: campaignType || 'awareness_building' }
    );

    res.json({
      success: true,
      companyName,
      industry,
      videoIdeas,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video ideas generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate video ideas',
      details: error.message
    });
  }
});

// NEW: Enhanced sentiment analysis with marketing recommendations
router.post('/sentiment-with-recommendations', async (req, res) => {
  try {
    const { companyName, industry } = req.body;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    // Analyze sentiment and get recommendations
    const sentimentAnalysis = await comprehensiveAnalyzer.sentimentService.analyzeBrandSentiment(
      companyName,
      { sources: ['social', 'news', 'review'], timeframe: '30d' }
    );

    // Generate marketing recommendations based on sentiment
    const recommendations = await comprehensiveAnalyzer.generateMarketingStrategy(
      companyName,
      industry || 'technology',
      sentimentAnalysis,
      { priorityActions: ['improve_sentiment', 'increase_awareness'] },
      {}
    );

    res.json({
      success: true,
      companyName,
      sentiment: sentimentAnalysis,
      recommendations,
      actionItems: recommendations.kpis,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sentiment',
      details: error.message
    });
  }
});

// NEW: Get marketing action plan for a company
router.post('/action-plan', async (req, res) => {
  try {
    const { companyName, industry, timeframe = '90d' } = req.body;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    // Generate comprehensive action plan
    const analysis = await comprehensiveAnalyzer.analyzeCompany(companyName, {
      industry: industry || 'technology'
    });

    const actionPlan = {
      company: companyName,
      industry,
      timeframe,
      immediate: analysis.actionPlan.find(p => p.phase === 'immediate'),
      shortTerm: analysis.actionPlan.find(p => p.phase === 'short_term'),
      longTerm: analysis.actionPlan.find(p => p.phase === 'long_term'),
      nextSteps: analysis.nextSteps,
      kpis: analysis.kpis,
      budget: analysis.marketingStrategy.budgetAllocation,
      riskMitigation: analysis.marketingStrategy.riskMitigation,
      timeline: analysis.timeline
    };

    res.json({
      success: true,
      actionPlan,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Action plan generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate action plan',
      details: error.message
    });
  }
});

// NEW: Quick company insights for dashboard
router.post('/company-insights', async (req, res) => {
  try {
    const { companyName, industry } = req.body;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    // Get quick insights (limited analysis for dashboard)
    const insights = {
      company: companyName,
      industry: industry || 'technology',
      quickAnalysis: {
        brandSentiment: {
          score: 0.2,
          label: 'Positive',
          trend: 'Improving',
          volume: 45
        },
        marketPosition: {
          position: 'Challenger',
          marketShare: '15-20%',
          competitiveAdvantage: 'Innovation and customer service'
        },
        opportunities: [
          'Expand digital marketing presence',
          'Develop thought leadership content',
          'Improve customer engagement'
        ],
        priorities: [
          'Launch brand awareness campaign',
          'Improve online reputation',
          'Generate quality leads'
        ]
      },
      recommendations: {
        immediate: 'Launch social media campaign',
        shortTerm: 'Develop content marketing strategy',
        longTerm: 'Build comprehensive digital presence'
      },
      estimatedImpact: {
        brandAwareness: '+25%',
        leadGeneration: '+40%',
        customerEngagement: '+30%'
      }
    };

    res.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Company insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate company insights',
      details: error.message
    });
  }
});

// Generate marketing strategy for a brand
router.post('/marketing-strategy', async (req, res) => {
  try {
    const { brandName, industry, targetAudience, budget, goals } = req.body;
    
    // Get user context safely
    const user = req.user || { id: 'demo-user', email: 'demo@example.com' };
    const userId = user.id || 'demo-user';

    if (!brandName) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    console.log('🎯 Generating marketing strategy for brand:', brandName);
    
    const strategy = await analyticsService.generateMarketingStrategy({
      brandName,
      industry: industry || 'technology',
      targetAudience: targetAudience || 'general',
      budget: budget || 'medium',
      goals: goals || ['awareness', 'engagement'],
      userId: userId
    });

    res.json({
      success: true,
      strategy,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Marketing strategy error:', error);
    res.status(500).json({ 
      error: 'Failed to generate marketing strategy',
      message: error.message 
    });
  }
});

module.exports = router; 