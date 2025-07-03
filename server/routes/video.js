const express = require('express');
const VideoService = require('../services/videoService');

const router = express.Router();
const videoService = new VideoService();

// Generate video from text prompt
router.post('/generate-text-to-video', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await videoService.generateVideoFromText(prompt, options);
    
    res.json({
      success: true,
      data: result,
      message: 'Video generation initiated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate video from image
router.post('/generate-image-to-video', async (req, res) => {
  try {
    const { imageUrl, prompt, options = {} } = req.body;
    
    if (!imageUrl || !prompt) {
      return res.status(400).json({ error: 'Image URL and prompt are required' });
    }

    const result = await videoService.generateVideoFromImage(imageUrl, prompt, options);
    
    res.json({
      success: true,
      data: result,
      message: 'Image-to-video generation initiated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create marketing video
router.post('/create-marketing-video', async (req, res) => {
  try {
    const campaignData = req.body;
    
    if (!campaignData.productName || !campaignData.targetAudience) {
      return res.status(400).json({ 
        error: 'Product name and target audience are required' 
      });
    }

    const result = await videoService.createMarketingVideo(campaignData);
    
    res.json({
      success: true,
      data: result,
      message: 'Marketing video generation initiated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get video generation status
router.get('/status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const status = await videoService.getVideoStatus(videoId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available video models
router.get('/models', async (req, res) => {
  try {
    const models = videoService.getAvailableModels();
    
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check for video service
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'video-generation',
    models: videoService.getAvailableModels(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 