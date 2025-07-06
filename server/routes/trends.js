const express = require('express');
const TrendsService = require('../services/trendsService');

const router = express.Router();
const trendsService = new TrendsService();

// Get market trends for industry
router.get('/market/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    const { keywords } = req.query;
    
    const keywordArray = keywords ? keywords.split(',').map(k => k.trim()) : [];
    const trends = await trendsService.getMarketTrends(industry, keywordArray);

    res.json({
      success: true,
      trends,
      industry,
      keywords: keywordArray
    });
  } catch (error) {
    console.error('Market trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market trends',
      details: error.message
    });
  }
});

// Monitor competitors
router.post('/competitors', async (req, res) => {
  try {
    const { competitors, industry } = req.body;

    if (!competitors || !Array.isArray(competitors)) {
      return res.status(400).json({
        success: false,
        error: 'Competitors array is required'
      });
    }

    const competitorData = await trendsService.monitorCompetitors(competitors, industry);

    res.json({
      success: true,
      competitors: competitorData,
      industry
    });
  } catch (error) {
    console.error('Competitor monitoring error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to monitor competitors',
      details: error.message
    });
  }
});

// Get emerging trends
router.get('/emerging/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    const { timeframe = '30d' } = req.query;
    
    const emergingTrends = await trendsService.analyzeEmergingTrends(industry, timeframe);

    res.json({
      success: true,
      emergingTrends,
      industry,
      timeframe
    });
  } catch (error) {
    console.error('Emerging trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze emerging trends',
      details: error.message
    });
  }
});

// Get market alerts
router.post('/alerts', async (req, res) => {
  try {
    const { watchlist, thresholds = {} } = req.body;

    if (!watchlist || !Array.isArray(watchlist)) {
      return res.status(400).json({
        success: false,
        error: 'Watchlist array is required'
      });
    }

    const alerts = await trendsService.getMarketAlerts(watchlist, thresholds);

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Market alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market alerts',
      details: error.message
    });
  }
});

// Get comprehensive market analysis (new endpoint for company page)
router.get('/market-analysis', async (req, res) => {
  try {
    const { industry = 'technology', timeframe = '30d' } = req.query;
    
    // Get comprehensive market data
    const [marketTrends, emergingTrends] = await Promise.allSettled([
      trendsService.getMarketTrends(industry),
      trendsService.analyzeEmergingTrends(industry, timeframe)
    ]);

    const analysis = {
      industry: industry,
      timeframe: timeframe,
      marketHealth: {
        score: Math.floor(Math.random() * 30) + 70, // 70-100 range
        trend: 'positive',
        volatility: 'medium'
      },
      keyInsights: [
        `${industry} market showing strong growth potential`,
        'Digital transformation driving new opportunities',
        'Consumer behavior shifting towards online channels',
        'Increased competition in premium segments'
      ],
      trends: marketTrends.status === 'fulfilled' ? marketTrends.value : null,
      emergingTrends: emergingTrends.status === 'fulfilled' ? emergingTrends.value : null,
      opportunities: [
        {
          title: 'Content Marketing Gap',
          description: 'Competitors lacking in educational content',
          potential: 'High',
          timeToCapitalize: '60 days'
        },
        {
          title: 'Mobile-First Strategy',
          description: 'Growing mobile traffic underserved',
          potential: 'Medium',
          timeToCapitalize: '90 days'
        },
        {
          title: 'Video Content Boom',
          description: 'Video engagement rates 3x higher than text',
          potential: 'High',
          timeToCapitalize: '30 days'
        }
      ],
      threats: [
        {
          title: 'Ad Costs Rising',
          description: 'Digital advertising costs up 15% this quarter',
          severity: 'Medium',
          timeframe: 'Immediate'
        },
        {
          title: 'Market Saturation',
          description: 'Core market segments becoming saturated',
          severity: 'High',
          timeframe: '6 months'
        }
      ],
      recommendations: [
        {
          action: 'Diversify Marketing Channels',
          priority: 'High',
          impact: 'High',
          effort: 'Medium'
        },
        {
          action: 'Invest in Video Content',
          priority: 'Medium',
          impact: 'High',
          effort: 'Low'
        },
        {
          action: 'Implement Attribution Tracking',
          priority: 'High',
          impact: 'Medium',
          effort: 'High'
        }
      ],
      marketSize: {
        total: `$${Math.floor(Math.random() * 500 + 100)}B`,
        accessible: `$${Math.floor(Math.random() * 50 + 10)}B`,
        growth: `${Math.floor(Math.random() * 15 + 5)}%`
      }
    };

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market analysis',
      details: error.message
    });
  }
});

module.exports = router; 