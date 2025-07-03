const express = require('express');
const AIService = require('../services/aiService');
const SocialMediaService = require('../services/socialMediaService');
const TrendsService = require('../services/trendsService');
const UsageTrackingService = require('../services/usageTrackingService');
const User = require('../models/User');

const router = express.Router();
const aiService = new AIService();
const socialService = new SocialMediaService();
const trendsService = new TrendsService();
const usageTracker = new UsageTrackingService();

// Generate marketing campaign content
router.post('/generate-campaign', async (req, res) => {
  try {
    // Check usage limits first
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.hasReachedLimit('campaign')) {
      return res.status(429).json({
        success: false,
        error: 'Campaign generation limit reached',
        details: 'Upgrade your plan to generate more campaigns',
        remaining: user.getRemainingUsage('campaign')
      });
    }

    const {
      product,
      targetAudience,
      campaignGoal,
      tone,
      channel,
      brandGuidelines,
      includeVisual = false
    } = req.body;

    // Notify start of generation
    const socketService = req.app.locals.socketService;
    if (socketService) {
      await socketService.sendGenerationProgress(req.user.userId, {
        type: 'campaign',
        step: 'Analyzing market trends',
        progress: 10
      });
    }

    // Get current trends for context
    const trendData = await trendsService.getMarketTrends(
      req.body.industry || 'technology',
      req.body.keywords || []
    );

    if (socketService) {
      await socketService.sendGenerationProgress(req.user.userId, {
        type: 'campaign',
        step: 'Generating content',
        progress: 40
      });
    }

    const campaignData = {
      product,
      targetAudience,
      campaignGoal,
      tone,
      channel,
      brandGuidelines,
      currentTrends: trendData.analysis
    };

    // Generate campaign content
    const content = await aiService.generateCampaignContent(campaignData);

    if (socketService) {
      await socketService.sendGenerationProgress(req.user.userId, {
        type: 'campaign',
        step: 'Generating visuals',
        progress: 70
      });
    }

    let visual = null;
    if (includeVisual && content.visualDescription) {
      // Check image generation limits
      if (user.hasReachedLimit('image')) {
        return res.status(429).json({
          success: false,
          error: 'Image generation limit reached',
          details: 'Upgrade your plan to generate more images'
        });
      }

      // Generate accompanying visual
      visual = await aiService.generateMarketingVisual({
        description: content.visualDescription,
        style: "professional marketing",
        brandColors: req.body.brandColors || "",
        includeText: content.headline || ""
      });

      // Track image usage
      await usageTracker.trackUsage(req.user.userId, 'image', 1, {
        action: 'campaign_visual',
        description: content.visualDescription
      });
    }

    // Track campaign generation usage
    await usageTracker.trackUsage(req.user.userId, 'campaign', 1, {
      action: 'generate_campaign',
      channel,
      targetAudience
    });

    if (socketService) {
      await socketService.sendGenerationProgress(req.user.userId, {
        type: 'campaign',
        step: 'Complete',
        progress: 100
      });
    }

    res.json({
      success: true,
      campaign: {
        content,
        visual,
        metadata: {
          generatedAt: new Date(),
          trendsConsidered: trendData.analysis,
          channel,
          targetAudience
        }
      },
      usage: await usageTracker.getUserUsageStats(req.user.userId)
    });
  } catch (error) {
    console.error('Campaign generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate campaign',
      details: error.message
    });
  }
});

// Generate marketing visual
router.post('/generate-visual', async (req, res) => {
  try {
    const {
      description,
      style = "professional marketing",
      dimensions = "1024x1024",
      brandColors = "",
      includeText = ""
    } = req.body;

    const visual = await aiService.generateMarketingVisual({
      description,
      style,
      dimensions,
      brandColors,
      includeText
    });

    res.json({
      success: true,
      visual,
      metadata: {
        generatedAt: new Date(),
        prompt: description,
        style
      }
    });
  } catch (error) {
    console.error('Visual generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate visual',
      details: error.message
    });
  }
});

// Analyze marketing performance
router.post('/analyze-performance', async (req, res) => {
  try {
    const {
      campaignId,
      campaignMetrics,
      timeframe = '30d'
    } = req.body;

    // Get audience data from social media
    const audienceData = await socialService.getAudienceAnalytics(timeframe);

    // Get competitor data
    const competitorData = await trendsService.monitorCompetitors(
      req.body.competitors || [],
      req.body.industry || 'technology'
    );

    // Get market trends
    const marketTrends = await trendsService.getMarketTrends(
      req.body.industry || 'technology',
      req.body.keywords || []
    );

    const performanceData = {
      campaignMetrics,
      audienceData,
      competitorData: competitorData.competitors,
      marketTrends
    };

    const analysis = await aiService.analyzeMarketingPerformance(performanceData);

    res.json({
      success: true,
      analysis,
      metadata: {
        analyzedAt: new Date(),
        timeframe,
        campaignId
      }
    });
  } catch (error) {
    console.error('Performance analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze performance',
      details: error.message
    });
  }
});

// Generate trend-based campaign suggestions
router.post('/trend-suggestions', async (req, res) => {
  try {
    const {
      industry,
      targetAudience,
      currentCampaigns = []
    } = req.body;

    // Get current trends
    const trends = await trendsService.getMarketTrends(industry, req.body.keywords || []);

    const trendData = {
      trends: trends.news.slice(0, 10), // Top 10 trending news items
      industry,
      audience: targetAudience,
      currentCampaigns
    };

    const suggestions = await aiService.generateTrendBasedSuggestions(trendData);

    res.json({
      success: true,
      suggestions,
      trendsData: {
        newsVolume: trends.news.length,
        stockMovement: trends.stocks,
        searchTrends: trends.searchTrends
      },
      metadata: {
        generatedAt: new Date(),
        industry,
        trendsAnalyzed: trends.timestamp
      }
    });
  } catch (error) {
    console.error('Trend suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate trend suggestions',
      details: error.message
    });
  }
});

// Generate A/B test variations
router.post('/ab-test-variations', async (req, res) => {
  try {
    const {
      content,
      contentType,
      testingGoals
    } = req.body;

    const variations = await aiService.generateABTestVariations({
      content,
      contentType,
      testingGoals
    });

    res.json({
      success: true,
      variations,
      metadata: {
        generatedAt: new Date(),
        originalContent: content,
        contentType
      }
    });
  } catch (error) {
    console.error('A/B test variations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate A/B test variations',
      details: error.message
    });
  }
});

// Analyze social media sentiment
router.post('/analyze-sentiment', async (req, res) => {
  try {
    const {
      brandKeywords,
      timeframe = '7d'
    } = req.body;

    // Get social media data
    const socialData = await socialService.monitorBrandMentions(brandKeywords, timeframe);

    // Analyze sentiment using AI
    const sentimentAnalysis = await aiService.analyzeSentiment({
      posts: socialData.twitter.concat(socialData.linkedin),
      comments: socialData.facebook,
      mentions: socialData.instagram
    });

    res.json({
      success: true,
      sentiment: sentimentAnalysis,
      rawData: {
        totalMentions: socialData.summary.totalMentions,
        platformBreakdown: socialData.summary.byPlatform
      },
      metadata: {
        analyzedAt: new Date(),
        timeframe,
        keywords: brandKeywords
      }
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

// Generate comprehensive marketing strategy
router.post('/generate-strategy', async (req, res) => {
  try {
    const {
      businessGoals,
      targetMarket,
      budget,
      timeline,
      brandPosition,
      industry
    } = req.body;

    // Get competitive analysis
    const competitiveAnalysis = await trendsService.monitorCompetitors(
      req.body.competitors || [],
      industry
    );

    const strategyRequest = {
      businessGoals,
      targetMarket,
      competitiveAnalysis: competitiveAnalysis.analysis,
      budget,
      timeline,
      brandPosition
    };

    const strategy = await aiService.generateMarketingStrategy(strategyRequest);

    res.json({
      success: true,
      strategy,
      competitiveContext: competitiveAnalysis.competitors,
      metadata: {
        generatedAt: new Date(),
        industry,
        budget,
        timeline
      }
    });
  } catch (error) {
    console.error('Strategy generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate marketing strategy',
      details: error.message
    });
  }
});

// Get AI-powered insights and recommendations
router.get('/insights', async (req, res) => {
  try {
    const {
      industry = 'technology',
      timeframe = '30d'
    } = req.query;

    // Get comprehensive data for insights
    const [trends, socialData, emergingTrends] = await Promise.allSettled([
      trendsService.getMarketTrends(industry),
      socialService.getAudienceAnalytics(timeframe),
      trendsService.analyzeEmergingTrends(industry, timeframe)
    ]);

    // Generate insights based on all available data
    const insightsData = {
      marketTrends: trends.status === 'fulfilled' ? trends.value : null,
      socialMetrics: socialData.status === 'fulfilled' ? socialData.value : null,
      emergingTrends: emergingTrends.status === 'fulfilled' ? emergingTrends.value : null
    };

    // Use AI to generate actionable insights
    const insights = await aiService.generateTrendBasedSuggestions({
      trends: insightsData.marketTrends?.news || [],
      industry,
      audience: 'general',
      currentCampaigns: []
    });

    res.json({
      success: true,
      insights: {
        recommendations: insights,
        marketData: insightsData.marketTrends,
        socialMetrics: insightsData.socialMetrics,
        emergingTrends: insightsData.emergingTrends?.emergingTrends || []
      },
      metadata: {
        generatedAt: new Date(),
        industry,
        timeframe
      }
    });
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      details: error.message
    });
  }
});

// Check AI service health
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.checkAPIHealth();
    
    res.json({
      success: true,
      health,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      success: false,
      error: 'AI service health check failed',
      details: error.message
    });
  }
});

// Batch generate multiple campaign variations
router.post('/batch-generate', async (req, res) => {
  try {
    const {
      basePrompt,
      variations = 3,
      parameters
    } = req.body;

    const campaigns = [];

    for (let i = 0; i < variations; i++) {
      // Create slight variations in the prompt
      const variationPrompt = {
        ...parameters,
        tone: i === 0 ? 'professional' : i === 1 ? 'friendly' : 'bold',
        channel: i === 0 ? 'email' : i === 1 ? 'social' : 'web'
      };

      const campaign = await aiService.generateCampaignContent(variationPrompt);
      campaigns.push({
        variation: i + 1,
        campaign,
        parameters: variationPrompt
      });
    }

    res.json({
      success: true,
      campaigns,
      metadata: {
        generatedAt: new Date(),
        totalVariations: variations,
        basePrompt
      }
    });
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate campaign variations',
      details: error.message
    });
  }
});

module.exports = router; 