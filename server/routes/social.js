const express = require('express');
const SocialMediaService = require('../services/socialMediaService');

const router = express.Router();
const socialService = new SocialMediaService();

// Get brand mentions across all platforms
router.get('/mentions', async (req, res) => {
  try {
    const { keywords, timeframe = '24h' } = req.query;
    
    if (!keywords) {
      return res.status(400).json({
        success: false,
        error: 'Keywords parameter is required'
      });
    }

    const keywordArray = keywords.split(',').map(k => k.trim());
    const mentions = await socialService.monitorBrandMentions(keywordArray, timeframe);

    res.json({
      success: true,
      mentions,
      timeframe,
      keywords: keywordArray
    });
  } catch (error) {
    console.error('Brand mentions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brand mentions',
      details: error.message
    });
  }
});

// Get trending topics
router.get('/trends', async (req, res) => {
  try {
    const { location = 'global' } = req.query;
    
    const trends = await socialService.getTrendingTopics(location);

    res.json({
      success: true,
      trends,
      location
    });
  } catch (error) {
    console.error('Trending topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending topics',
      details: error.message
    });
  }
});

// Post to multiple social platforms
router.post('/post', async (req, res) => {
  try {
    const { content, platforms = ['twitter', 'linkedin', 'facebook'] } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    const results = await socialService.postToMultiplePlatforms(content, platforms);

    res.json({
      success: true,
      results,
      platforms
    });
  } catch (error) {
    console.error('Social posting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to post to social platforms',
      details: error.message
    });
  }
});

// Get audience analytics
router.get('/analytics', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const analytics = await socialService.getAudienceAnalytics(timeframe);

    res.json({
      success: true,
      analytics,
      timeframe
    });
  } catch (error) {
    console.error('Social analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social analytics',
      details: error.message
    });
  }
});

module.exports = router; 