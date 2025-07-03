const express = require('express');
const VideoService = require('../services/videoService');

const router = express.Router();
const videoService = new VideoService();

// Generate video from text prompt (enhanced)
router.post('/generate-text-to-video', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check usage limits
    if (global.usageTracker) {
      const canUse = await global.usageTracker.checkUsageLimit(
        req.user.id,
        req.tenant?.id,
        'video_generation'
      );
      
      if (!canUse.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Video generation limit exceeded',
          limit: canUse.limit,
          used: canUse.used
        });
      }
    }

    // Setup progress callback for real-time updates
    const progressCallback = (progress) => {
      if (global.socketService) {
        global.socketService.sendToUser(req.user.id, 'video_generation_progress', {
          jobId: progress.jobId,
          progress: progress.progress,
          status: progress.status,
          message: progress.message,
          estimatedTimeRemaining: progress.estimatedTimeRemaining
        });
      }
    };

    const result = await videoService.generateVideoFromText(prompt, options, progressCallback);
    
    // Track usage
    if (global.usageTracker) {
      await global.usageTracker.trackUsage(
        req.user.id,
        req.tenant?.id,
        'video_generation',
        1
      );
    }

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

// Get video templates
router.get('/templates', async (req, res) => {
  try {
    const templates = videoService.getVideoTemplates();
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job status (enhanced)
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = videoService.getJobStatus(jobId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel video generation job
router.post('/job/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = videoService.cancelJob(jobId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch video generation
router.post('/generate-batch', async (req, res) => {
  try {
    const { prompts, options = {} } = req.body;
    
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ error: 'Prompts array is required' });
    }

    // Check usage limits for batch
    if (global.usageTracker) {
      const canUse = await global.usageTracker.checkUsageLimit(
        req.user.id,
        req.tenant?.id,
        'video_generation',
        prompts.length
      );
      
      if (!canUse.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Batch video generation limit exceeded',
          limit: canUse.limit,
          used: canUse.used,
          requested: prompts.length
        });
      }
    }

    // Setup progress callback for batch
    const progressCallback = (progress) => {
      if (global.socketService) {
        global.socketService.sendToUser(req.user.id, 'batch_video_progress', {
          batchId: progress.batchId,
          jobId: progress.jobId,
          progress: progress.progress,
          status: progress.status,
          batchIndex: progress.batchIndex,
          batchTotal: progress.batchTotal
        });
      }
    };

    const result = await videoService.generateVideoBatch(prompts, options, progressCallback);
    
    // Track usage for batch
    if (global.usageTracker) {
      await global.usageTracker.trackUsage(
        req.user.id,
        req.tenant?.id,
        'video_generation',
        prompts.length
      );
    }

    res.json({
      success: true,
      data: result,
      message: 'Batch video generation initiated'
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

// Serve generated video files
router.get('/files/:filename', (req, res) => {
  const path = require('path');
  const fs = require('fs');
  
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'generated_videos', filename);
  
  // Security check
  if (!filename.match(/^[a-zA-Z0-9_-]+\.(mp4|webm|mov)$/)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
  
  // Stream the video file
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    // Support video range requests (for video player scrubbing)
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', chunksize);
    
    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
  } else {
    res.setHeader('Content-Length', fileSize);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }
});

module.exports = router; 