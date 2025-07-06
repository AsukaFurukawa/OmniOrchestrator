const express = require('express');
const VideoService = require('../services/videoService');
const ComprehensiveMarketingAnalyzer = require('../services/comprehensiveMarketingAnalyzer');
const auth = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();

// Initialize services
const videoService = new VideoService();
const comprehensiveAnalyzer = new ComprehensiveMarketingAnalyzer();

// Generate video from text prompt (enhanced)
router.post('/generate-text-to-video', async (req, res) => {
  try {
    console.log('🎬 Video generation request received:', req.body);
    const { prompt, options = {}, provider = 'enhanced_fallback' } = req.body;
    
    if (!prompt) {
      console.log('❌ No prompt provided');
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    console.log('🎥 Generating video with prompt:', prompt);

    // Check usage limits (optional - skip if not available)
    if (global.usageTracker && typeof global.usageTracker.checkUsageLimit === 'function') {
      try {
        const canUse = await global.usageTracker.checkUsageLimit(
          req.user?.id || 'demo-user',
          req.tenant?.id || 'demo-tenant',
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
      } catch (error) {
        console.log('🔧 Usage tracker not available, proceeding without limits');
      }
    }

    // Setup progress callback for real-time updates
    const progressCallback = (progress) => {
      console.log('🎬 Video Progress Update:', progress);
      
      if (global.socketService) {
        // Send to specific user
        global.socketService.sendToUser(req.user?.id || 'demo-user', 'video_generation_progress', {
          jobId: progress.jobId,
          progress: progress.progress,
          status: progress.status,
          message: progress.message,
          estimatedTimeRemaining: progress.estimatedTimeRemaining
        });
        
        // Also broadcast to all clients for development (backup)
        global.socketService.broadcast('video_generation_progress', {
          jobId: progress.jobId,
          progress: progress.progress,
          status: progress.status,
          message: progress.message,
          estimatedTimeRemaining: progress.estimatedTimeRemaining
        });
      }
    };

    // Use specific provider if requested
    let result;
    if (provider && provider !== 'enhanced_fallback') {
      console.log('🔧 Using specific provider:', provider);
      const jobId = require('crypto').randomUUID();
      result = await videoService.generateWithProvider(provider, prompt, options, jobId);
      result.jobId = jobId;
    } else {
      result = await videoService.generateVideoFromText(prompt, options, progressCallback);
    }
    
    // Track usage (optional)
    if (global.usageTracker && typeof global.usageTracker.trackUsage === 'function') {
      try {
        await global.usageTracker.trackUsage(
          req.user?.id || 'demo-user',
          req.tenant?.id || 'demo-tenant',
          'video_generation',
          1
        );
      } catch (error) {
        console.log('🔧 Usage tracking not available');
      }
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

    // Check usage limits (optional - skip if not available)
    if (global.usageTracker && typeof global.usageTracker.checkUsageLimit === 'function') {
      try {
        const canUse = await global.usageTracker.checkUsageLimit(
          req.user?.id || 'demo-user',
          req.tenant?.id || 'demo-tenant',
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
      } catch (error) {
        console.log('🔧 Usage tracker not available, proceeding without limits');
      }
    }

    // Setup progress callback for real-time updates
    const progressCallback = (progress) => {
      console.log('🎬 Video Progress Update:', progress);
      
      if (global.socketService) {
        // Send to specific user
        global.socketService.sendToUser(req.user?.id || 'demo-user', 'video_generation_progress', {
          jobId: progress.jobId,
          progress: progress.progress,
          status: progress.status,
          message: progress.message,
          estimatedTimeRemaining: progress.estimatedTimeRemaining
        });
        
        // Also broadcast to all clients for development (backup)
        global.socketService.broadcast('video_generation_progress', {
          jobId: progress.jobId,
          progress: progress.progress,
          status: progress.status,
          message: progress.message,
          estimatedTimeRemaining: progress.estimatedTimeRemaining
        });
      }
    };

    const result = await videoService.createMarketingVideo(campaignData, progressCallback);
    
    // Track usage (optional)
    if (global.usageTracker && typeof global.usageTracker.trackUsage === 'function') {
      try {
        await global.usageTracker.trackUsage(
          req.user?.id || 'demo-user',
          req.tenant?.id || 'demo-tenant',
          'video_generation',
          1
        );
      } catch (error) {
        console.log('🔧 Usage tracking not available');
      }
    }

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

    // Check usage limits for batch (optional)
    if (global.usageTracker && typeof global.usageTracker.checkUsageLimit === 'function') {
      try {
        const canUse = await global.usageTracker.checkUsageLimit(
          req.user?.id || 'demo-user',
          req.tenant?.id || 'demo-tenant',
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
      } catch (error) {
        console.log('🔧 Usage tracker not available for batch, proceeding without limits');
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
    
    // Track usage for batch (optional)
    if (global.usageTracker && typeof global.usageTracker.trackUsage === 'function') {
      try {
        await global.usageTracker.trackUsage(
          req.user?.id || 'demo-user',
          req.tenant?.id || 'demo-tenant',
          'video_generation',
          prompts.length
        );
      } catch (error) {
        console.log('🔧 Batch usage tracking not available');
      }
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

// Get list of generated videos
router.get('/generated-videos', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    
    // Ensure directory exists
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }
    
    // Read all video JSON files
    const files = fs.readdirSync(videosDir);
    const videoFiles = files.filter(file => file.endsWith('.json'));
    
    const videos = [];
    
    for (const file of videoFiles) {
      try {
        const filePath = path.join(videosDir, file);
        const videoData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Add file info
        const stats = fs.statSync(filePath);
        videoData.fileName = file;
        videoData.createdAt = stats.birthtime;
        videoData.fileSize = stats.size;
        
        videos.push(videoData);
      } catch (error) {
        console.log('Error reading video file:', file, error);
      }
    }
    
    // Sort by creation date (newest first)
    videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`📺 Found ${videos.length} generated videos`);
    
    res.json({
      success: true,
      videos: videos,
      count: videos.length
    });
  } catch (error) {
    console.error('Error loading generated videos:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// AI-powered video suggestions
router.post('/ai-suggestions', async (req, res) => {
  try {
    const businessData = req.body;
    
    if (!businessData.industry || !businessData.targetAudience) {
      return res.status(400).json({ 
        error: 'Industry and target audience are required' 
      });
    }

    const result = await videoService.generateVideoSuggestions(businessData);
    
    res.json({
      success: true,
      data: result.suggestions,
      message: 'AI video suggestions generated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI-powered video prompt generation
router.post('/ai-prompts', async (req, res) => {
  try {
    const { videoType, context = {} } = req.body;
    
    if (!videoType) {
      return res.status(400).json({ error: 'Video type is required' });
    }

    const result = await videoService.generateVideoPrompts(videoType, context);
    
    res.json({
      success: true,
      data: result.prompts,
      message: 'AI video prompts generated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI image analysis for video generation
router.post('/ai-analyze-image', async (req, res) => {
  try {
    const { imageUrl, userGoal } = req.body;
    
    if (!imageUrl || !userGoal) {
      return res.status(400).json({ 
        error: 'Image URL and user goal are required' 
      });
    }

    const result = await videoService.analyzeImageForVideo(imageUrl, userGoal);
    
    res.json({
      success: true,
      data: result.analysis,
      message: 'Image analysis completed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending video styles
router.get('/trending-styles', async (req, res) => {
  try {
    const result = await videoService.getTrendingVideoStyles();
    
    res.json({
      success: true,
      data: result.trends,
      message: 'Trending video styles retrieved'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced Open-Sora integration check
router.get('/open-sora-status', async (req, res) => {
  try {
    const models = videoService.getAvailableModels();
    const openSoraModel = models['open-sora'];
    
    res.json({
      success: true,
      data: {
        available: openSoraModel.available,
        capabilities: openSoraModel.capabilities,
        maxDuration: openSoraModel.maxDuration,
        resolutions: openSoraModel.resolutions,
        status: openSoraModel.available ? 'ready' : 'not_configured'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

// NEW: Generate marketing video based on company analysis
router.post('/generate-marketing-video', async (req, res) => {
  try {
    const { companyName, industry, campaignType, videoType, customPrompt } = req.body;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }
    
    console.log(`🎬 Generating marketing video for ${companyName}`);
    
    // Get company analysis to inform video generation
    const companyAnalysis = await comprehensiveAnalyzer.analyzeCompany(companyName, {
      industry: industry || 'technology'
    });
    
    // Generate video ideas based on analysis
    const videoIdeas = await comprehensiveAnalyzer.generateVideoContentIdeas(
      companyName,
      industry || 'technology',
      companyAnalysis.marketingStrategy
    );
    
    // Select appropriate video idea or use custom prompt
    let selectedVideoIdea;
    if (videoType && videoIdeas.find(v => v.type === videoType)) {
      selectedVideoIdea = videoIdeas.find(v => v.type === videoType);
    } else {
      selectedVideoIdea = videoIdeas[0]; // Use first video idea as default
    }
    
    // Use custom prompt if provided, otherwise use generated prompt
    const videoPrompt = customPrompt || selectedVideoIdea.openSoraPrompt;
    
    // Generate video with enhanced options
    const videoOptions = {
      duration: selectedVideoIdea.duration === '2 minutes' ? 8 : 4,
      resolution: '1024x576',
      fps: 24,
      style: 'professional',
      aspect_ratio: '16:9',
      enhance_prompt: true,
      model: 'open-sora'
    };
    
    const videoResult = await videoService.generateVideoFromText(
      videoPrompt,
      videoOptions,
      (progress) => {
        // Real-time progress callback
        if (req.io) {
          req.io.emit('video_generation_progress', {
            companyName,
            progress: progress.progress,
            status: progress.status
          });
        }
      }
    );
    
    // Combine video result with marketing context
    const response = {
      success: true,
      video: videoResult,
      marketingContext: {
        companyName,
        industry,
        campaignType,
        videoType: selectedVideoIdea.type,
        marketingStrategy: companyAnalysis.marketingStrategy.strategicFocus,
        targetAudience: companyAnalysis.marketingStrategy.targetAudiences,
        suggestedPlatforms: selectedVideoIdea.targetPlatforms,
        callToAction: selectedVideoIdea.callToAction,
        estimatedBudget: selectedVideoIdea.budget
      },
      videoIdea: selectedVideoIdea,
      allVideoIdeas: videoIdeas,
      nextSteps: [
        'Review and approve video content',
        'Optimize for target platforms',
        'Schedule video distribution',
        'Monitor performance metrics',
        'Create follow-up content'
      ],
      generatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Marketing video generated for ${companyName}`);
    res.json(response);
    
  } catch (error) {
    console.error('Marketing video generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate marketing video',
      details: error.message
    });
  }
});

// NEW: Generate video campaign (multiple videos for a campaign)
router.post('/generate-video-campaign', async (req, res) => {
  try {
    const { companyName, industry, campaignType, videoCount = 3 } = req.body;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }
    
    console.log(`🎬 Generating video campaign for ${companyName}`);
    
    // Get company analysis
    const companyAnalysis = await comprehensiveAnalyzer.analyzeCompany(companyName, {
      industry: industry || 'technology'
    });
    
    // Generate video ideas for the campaign
    const videoIdeas = await comprehensiveAnalyzer.generateVideoContentIdeas(
      companyName,
      industry || 'technology',
      companyAnalysis.marketingStrategy
    );
    
    // Select and generate multiple videos
    const selectedVideos = videoIdeas.slice(0, videoCount);
    const generatedVideos = [];
    
    for (let i = 0; i < selectedVideos.length; i++) {
      const videoIdea = selectedVideos[i];
      
      try {
        const videoOptions = {
          duration: videoIdea.duration === '2 minutes' ? 8 : 4,
          resolution: '1024x576',
          fps: 24,
          style: 'professional',
          aspect_ratio: '16:9',
          enhance_prompt: true,
          model: 'open-sora'
        };
        
        const videoResult = await videoService.generateVideoFromText(
          videoIdea.openSoraPrompt,
          videoOptions
        );
        
        generatedVideos.push({
          ...videoResult,
          videoIdea,
          campaignPosition: i + 1,
          totalVideos: selectedVideos.length
        });
        
      } catch (error) {
        console.error(`Error generating video ${i + 1}:`, error);
        // Continue with other videos even if one fails
      }
    }
    
    // Generate campaign strategy
    const campaignStrategy = {
      phase1: {
        videos: generatedVideos.slice(0, 1),
        timeline: '0-2 weeks',
        goal: 'Brand awareness and introduction'
      },
      phase2: {
        videos: generatedVideos.slice(1, 2),
        timeline: '2-4 weeks',
        goal: 'Product/service demonstration'
      },
      phase3: {
        videos: generatedVideos.slice(2),
        timeline: '4-6 weeks',
        goal: 'Customer testimonials and social proof'
      }
    };
    
    const response = {
      success: true,
      campaignName: `${companyName} Video Marketing Campaign`,
      videos: generatedVideos,
      campaignStrategy,
      marketingContext: {
        companyName,
        industry,
        campaignType,
        totalVideos: generatedVideos.length,
        estimatedReach: '10K-50K views per video',
        estimatedBudget: '$5,000-15,000',
        timeline: '6 weeks',
        kpis: ['View count', 'Engagement rate', 'Click-through rate', 'Conversion rate']
      },
      distributionPlan: {
        week1: 'Launch brand awareness video on all platforms',
        week2: 'Optimize based on performance data',
        week3: 'Release product demonstration video',
        week4: 'Cross-promote and create user-generated content',
        week5: 'Launch testimonial video with customer stories',
        week6: 'Campaign wrap-up and performance analysis'
      },
      nextSteps: [
        'Review all generated videos',
        'Approve campaign strategy',
        'Set up tracking and analytics',
        'Begin phase 1 video distribution',
        'Monitor performance and optimize'
      ],
      generatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Video campaign generated for ${companyName}: ${generatedVideos.length} videos`);
    res.json(response);
    
  } catch (error) {
    console.error('Video campaign generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate video campaign',
      details: error.message
    });
  }
});

// NEW: Get video suggestions based on company analysis
router.post('/video-suggestions', async (req, res) => {
  try {
    const { companyName, industry, specificGoal } = req.body;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }
    
    // Get company analysis
    const companyAnalysis = await comprehensiveAnalyzer.analyzeCompany(companyName, {
      industry: industry || 'technology'
    });
    
    // Generate video suggestions
    const videoSuggestions = await comprehensiveAnalyzer.generateVideoContentIdeas(
      companyName,
      industry || 'technology',
      companyAnalysis.marketingStrategy
    );
    
    // Add priority and recommendation reasons
    const prioritizedSuggestions = videoSuggestions.map((suggestion, index) => ({
      ...suggestion,
      priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
      recommendationReason: this.getRecommendationReason(suggestion.type, companyAnalysis),
      estimatedImpact: this.getEstimatedImpact(suggestion.type),
      difficulty: this.getProductionDifficulty(suggestion.type)
    }));
    
    res.json({
      success: true,
      companyName,
      industry,
      videoSuggestions: prioritizedSuggestions,
      marketingContext: {
        strategicFocus: companyAnalysis.marketingStrategy.strategicFocus,
        primaryGoal: companyAnalysis.marketingStrategy.objectives.primary,
        brandSentiment: companyAnalysis.sentiment.overall?.score || 0,
        competitivePosition: companyAnalysis.competitive.marketPosition
      },
      recommendations: {
        startWith: prioritizedSuggestions[0]?.title || 'Brand story video',
        timeline: '1-2 videos per month',
        totalBudget: '$10,000-25,000 for full video strategy',
        platforms: ['YouTube', 'LinkedIn', 'Website', 'Social Media']
      },
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Video suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate video suggestions',
      details: error.message
    });
  }
});

// Helper methods for video suggestions
function getRecommendationReason(videoType, companyAnalysis) {
  const reasons = {
    'brand_story': 'Perfect for building brand awareness and emotional connection',
    'product_showcase': 'Ideal for demonstrating value proposition and features',
    'customer_testimonial': 'Builds trust and social proof with real customer stories',
    'educational': 'Establishes thought leadership and provides value to audience',
    'behind_the_scenes': 'Creates authentic connection and humanizes your brand'
  };
  
  return reasons[videoType] || 'Recommended based on your marketing strategy';
}

function getEstimatedImpact(videoType) {
  const impacts = {
    'brand_story': 'High brand awareness, emotional connection',
    'product_showcase': 'Increased product understanding, higher conversion',
    'customer_testimonial': 'Improved trust, reduced buying hesitation',
    'educational': 'Thought leadership, increased engagement',
    'behind_the_scenes': 'Brand authenticity, team connection'
  };
  
  return impacts[videoType] || 'Positive marketing impact';
}

function getProductionDifficulty(videoType) {
  const difficulties = {
    'brand_story': 'Medium - requires good storytelling',
    'product_showcase': 'Easy - straightforward product demo',
    'customer_testimonial': 'Easy - customer interviews',
    'educational': 'Medium - requires expertise and preparation',
    'behind_the_scenes': 'Easy - authentic workplace footage'
  };
  
  return difficulties[videoType] || 'Medium difficulty';
}

module.exports = router; 