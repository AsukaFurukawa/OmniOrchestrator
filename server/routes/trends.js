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

module.exports = router; 