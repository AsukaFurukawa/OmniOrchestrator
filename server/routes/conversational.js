const express = require('express');
const router = express.Router();
const ConversationalAI = require('../services/conversationalAI');
const auth = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

// Initialize ConversationalAI service
const conversationalAI = new ConversationalAI();

/**
 * @route   POST /api/conversational/chat
 * @desc    Handle conversational AI chat
 * @access  Private
 */
router.post('/chat', auth, tenantContext, async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Check usage limits - development bypass
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Bypassing usage limits for conversational AI');
    } else if (global.usageTracker && global.usageTracker.checkUsageLimit) {
      try {
        const canUse = await global.usageTracker.checkUsageLimit(
          req.user.id,
          req.tenant?.id,
          'conversational_requests'
        );
        
        if (!canUse.allowed) {
          return res.status(429).json({
            success: false,
            error: 'Usage limit exceeded',
            limit: canUse.limit,
            used: canUse.used
          });
        }
      } catch (error) {
        console.log('🔧 Usage tracking error, continuing in development mode:', error.message);
      }
    }

    // Handle conversation
    const result = await conversationalAI.handleConversation(
      req.user.id,
      message,
      {
        ...context,
        tenantId: req.tenant?.id,
        timestamp: new Date()
      }
    );

    // Track usage - development bypass
    if (process.env.NODE_ENV !== 'development' && global.usageTracker && global.usageTracker.trackUsage) {
      try {
        await global.usageTracker.trackUsage(
          req.user.id,
          req.tenant?.id,
          'conversational_requests',
          1
        );
      } catch (error) {
        console.log('🔧 Usage tracking error:', error.message);
      }
    }

    // Send real-time updates if socket service is available
    if (global.socketService) {
      global.socketService.sendToUser(req.user.id, 'ai_response', {
        type: 'conversational_ai',
        conversationType: result.conversationType,
        confidence: result.confidence,
        timestamp: new Date()
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Conversational AI error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process conversation'
    });
  }
});

/**
 * @route   POST /api/conversational/analyze-campaign
 * @desc    Analyze campaign performance with AI
 * @access  Private
 */
router.post('/analyze-campaign', auth, tenantContext, async (req, res) => {
  try {
    const { campaignId, timeframe = '30d' } = req.body;
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      });
    }

    // Check usage limits - development bypass
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Bypassing analysis usage limits');
    } else if (global.usageTracker && global.usageTracker.checkUsageLimit) {
      try {
        const canUse = await global.usageTracker.checkUsageLimit(
          req.user.id,
          req.tenant?.id,
          'ai_analysis'
        );
        
        if (!canUse.allowed) {
          return res.status(429).json({
            success: false,
            error: 'Analysis limit exceeded',
            limit: canUse.limit,
            used: canUse.used
          });
        }
      } catch (error) {
        console.log('🔧 Usage tracking error, continuing in development mode:', error.message);
      }
    }

    // Analyze campaign
    const analysis = await conversationalAI.analyzeCampaignPerformance(
      req.user.id,
      campaignId,
      timeframe
    );

    // Track usage
    if (global.usageTracker) {
      await global.usageTracker.trackUsage(
        req.user.id,
        req.tenant?.id,
        'ai_analysis',
        1
      );
    }

    // Send real-time updates
    if (global.socketService) {
      global.socketService.sendToUser(req.user.id, 'campaign_analysis', {
        campaignId,
        analysis: analysis.analysis,
        confidence: analysis.confidence,
        timestamp: new Date()
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Campaign analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze campaign'
    });
  }
});

/**
 * @route   POST /api/conversational/strategic-recommendations
 * @desc    Get strategic marketing recommendations
 * @access  Private
 */
router.post('/strategic-recommendations', auth, tenantContext, async (req, res) => {
  try {
    const { goals = {} } = req.body;

    // Check usage limits (premium feature)
    if (global.usageTracker) {
      const canUse = await global.usageTracker.checkUsageLimit(
        req.user.id,
        req.tenant?.id,
        'strategic_analysis'
      );
      
      if (!canUse.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Strategic analysis limit exceeded',
          limit: canUse.limit,
          used: canUse.used
        });
      }
    }

    // Generate strategic recommendations
    const recommendations = await conversationalAI.generateStrategicRecommendations(
      req.user.id,
      goals
    );

    // Track usage
    if (global.usageTracker) {
      await global.usageTracker.trackUsage(
        req.user.id,
        req.tenant?.id,
        'strategic_analysis',
        1
      );
    }

    // Send real-time updates
    if (global.socketService) {
      global.socketService.sendToUser(req.user.id, 'strategic_recommendations', {
        strategy: recommendations.strategy,
        timeframe: recommendations.timeframe,
        confidence: recommendations.confidence,
        timestamp: new Date()
      });
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Strategic recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate strategic recommendations'
    });
  }
});

/**
 * @route   POST /api/conversational/interpret-data
 * @desc    Interpret marketing data with AI
 * @access  Private
 */
router.post('/interpret-data', auth, tenantContext, async (req, res) => {
  try {
    const { dataType, dataPoints, question = null } = req.body;
    
    if (!dataType || !dataPoints) {
      return res.status(400).json({
        success: false,
        error: 'Data type and data points are required'
      });
    }

    // Check usage limits
    if (global.usageTracker) {
      const canUse = await global.usageTracker.checkUsageLimit(
        req.user.id,
        req.tenant?.id,
        'data_interpretation'
      );
      
      if (!canUse.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Data interpretation limit exceeded',
          limit: canUse.limit,
          used: canUse.used
        });
      }
    }

    // Interpret data
    const interpretation = await conversationalAI.interpretDataInRealTime(
      req.user.id,
      dataType,
      dataPoints,
      question
    );

    // Track usage
    if (global.usageTracker) {
      await global.usageTracker.trackUsage(
        req.user.id,
        req.tenant?.id,
        'data_interpretation',
        1
      );
    }

    // Send real-time updates
    if (global.socketService) {
      global.socketService.sendToUser(req.user.id, 'data_interpretation', {
        dataType,
        interpretation: interpretation.interpretation,
        confidence: interpretation.confidence,
        timestamp: new Date()
      });
    }

    res.json(interpretation);
  } catch (error) {
    console.error('Data interpretation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to interpret data'
    });
  }
});

/**
 * @route   POST /api/conversational/analyze-sentiment
 * @desc    Analyze sentiment with conversational context
 * @access  Private
 */
router.post('/analyze-sentiment', auth, tenantContext, async (req, res) => {
  try {
    const { sentimentData, context = {} } = req.body;
    
    if (!sentimentData) {
      return res.status(400).json({
        success: false,
        error: 'Sentiment data is required'
      });
    }

    // Check usage limits
    if (global.usageTracker) {
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
    }

    // Analyze sentiment
    const analysis = await conversationalAI.analyzeSentimentWithContext(
      req.user.id,
      sentimentData,
      context
    );

    // Track usage
    if (global.usageTracker) {
      await global.usageTracker.trackUsage(
        req.user.id,
        req.tenant?.id,
        'sentiment_analysis',
        1
      );
    }

    // Send real-time updates
    if (global.socketService) {
      global.socketService.sendToUser(req.user.id, 'sentiment_analysis', {
        analysis: analysis.analysis,
        riskLevel: analysis.riskLevel,
        recommendations: analysis.recommendations,
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
 * @route   GET /api/conversational/conversation-history
 * @desc    Get conversation history for user
 * @access  Private
 */
router.get('/conversation-history', auth, tenantContext, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // In production, this would fetch from database
    // For now, we'll return from memory (limited)
    const history = conversationalAI.getConversationHistory(req.user.id);
    
    const paginatedHistory = history.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      history: paginatedHistory,
      total: history.length,
      hasMore: history.length > offset + parseInt(limit)
    });
  } catch (error) {
    console.error('Conversation history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation history'
    });
  }
});

/**
 * @route   DELETE /api/conversational/conversation-history
 * @desc    Clear conversation history
 * @access  Private
 */
router.delete('/conversation-history', auth, tenantContext, async (req, res) => {
  try {
    // Clear conversation history
    conversationalAI.conversations.delete(req.user.id);
    
    res.json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    console.error('Clear conversation history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear conversation history'
    });
  }
});

/**
 * @route   POST /api/conversational/quick-insights
 * @desc    Get quick AI insights about user's marketing performance
 * @access  Private
 */
router.post('/quick-insights', auth, tenantContext, async (req, res) => {
  try {
    const { timeframe = '7d', focusArea = 'overall' } = req.body;

    // Check usage limits
    if (global.usageTracker) {
      const canUse = await global.usageTracker.checkUsageLimit(
        req.user.id,
        req.tenant?.id,
        'quick_insights'
      );
      
      if (!canUse.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Quick insights limit exceeded',
          limit: canUse.limit,
          used: canUse.used
        });
      }
    }

    // Generate quick insights based on focus area
    const insights = await conversationalAI.handleConversation(
      req.user.id,
      `Give me quick insights about my ${focusArea} marketing performance over the last ${timeframe}`,
      {
        type: 'quick_insights',
        timeframe,
        focusArea
      }
    );

    // Track usage
    if (global.usageTracker) {
      await global.usageTracker.trackUsage(
        req.user.id,
        req.tenant?.id,
        'quick_insights',
        1
      );
    }

    res.json({
      success: true,
      insights: insights.response,
      confidence: insights.confidence,
      timeframe,
      focusArea,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Quick insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quick insights'
    });
  }
});

module.exports = router; 